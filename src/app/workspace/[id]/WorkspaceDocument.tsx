'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Editor } from '@tiptap/core'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import type { AIContext } from '@/components/RichEditor'
import AIAssistantPanel from '@/components/AIAssistantPanel'
import RichEditor from '@/components/RichEditorLazy'

// ── Color palettes ────────────────────────────────────────────────────────────

const HL_COLORS = [
  { color: '#FEF3C7', label: 'Amarelo' },
  { color: '#DBEAFE', label: 'Azul'    },
  { color: '#DCFCE7', label: 'Verde'   },
  { color: '#EDE9FE', label: 'Roxo'    },
  { color: '#FFEDD5', label: 'Laranja' },
  { color: '#FCE7F3', label: 'Rosa'    },
]

const TEXT_COLORS = [
  { color: '#1E293B', label: 'Padrão'   },
  { color: '#DC2626', label: 'Vermelho' },
  { color: '#D97706', label: 'Âmbar'    },
  { color: '#16A34A', label: 'Verde'    },
  { color: '#2563EB', label: 'Azul'     },
  { color: '#7C3AED', label: 'Roxo'     },
  { color: '#0891B2', label: 'Ciano'    },
  { color: '#BE123C', label: 'Rosa'     },
  { color: '#78350F', label: 'Marrom'   },
  { color: '#64748B', label: 'Cinza'    },
]

// ── Chapter / section metadata ────────────────────────────────────────────────
// Titles are narrative (conversational), placeholders are the teacher's voice.

const CHAPTER_META: Record<string, {
  title: string
  intro: string
  sectionTitles?: Record<string, string>
  placeholders: Record<string, string>
}> = {
  preparacao_espiritual: {
    title: 'Antes de começar',
    intro: 'Antes de abrir os comentários e analisar o texto, prepare seu coração diante de Deus e defina o propósito deste estudo.',
    placeholders: {
      preparar_oracao:
        'Peça ao Senhor sabedoria para compreender Sua Palavra, fidelidade na interpretação e um coração disposto a ser transformado pelo que Ele vai revelar.',
      preparar_objetivo_estudo:
        'O que motivou você a estudar esta passagem hoje? Existe alguma pergunta que espera responder? Que fruto pastoral espera deste processo?',
      preparar_ocasiiao_publico:
        'Onde este estudo será utilizado? Quem são as pessoas que ouvirão esta mensagem? O que elas estão vivendo neste momento?',
    },
  },
  preparar_leia_assimile: {
    title: 'Primeiro Contato com o Texto',
    intro: 'Leia o texto com atenção e registre suas primeiras impressões. Ainda não é o momento de analisar — apenas de ouvir o que o texto comunica.',
    sectionTitles: {
      preparar_leitura_lenta:       'Primeira leitura',
      preparar_comparacao_traducoes: 'Comparação de traduções',
      preparar_ideia_inicial:        'Ideia central provisória',
      preparar_tensoes_repeticoes:   'Tensões e repetições',
    },
    placeholders: {
      preparar_leitura_lenta:
        'Leia lentamente o texto duas ou três vezes. Não tente resolver todas as dúvidas agora. Observe apenas aquilo que naturalmente chama sua atenção.',
      preparar_comparacao_traducoes:
        'Leia o mesmo trecho em duas ou três traduções diferentes. O que muda? Alguma diferença revela algo importante sobre o texto?',
      preparar_ideia_inicial:
        'Em uma frase simples, qual parece ser a ideia central desta passagem? Pode ser provisória — você terá oportunidade de revisá-la.',
      preparar_tensoes_repeticoes:
        'O que se repete? O que contrasta? Que palavras ou expressões saltam aos olhos? Que emoção o texto transmite?',
    },
  },
  preparar_visao_geral: {
    title: 'O que o Texto Parece Dizer?',
    intro: 'Com base na sua leitura, o que o texto parece comunicar? Ainda é cedo para conclusões — registre suas impressões com honestidade.',
    placeholders: {
      preparar_tema_provavel:
        'Qual parece ser o tema central desta passagem? Use uma frase provisória, aberta a revisão após a investigação.',
      preparar_grande_ideia_inicial:
        'Se você tivesse de resumir o ponto principal em uma frase completa — sujeito + predicado — como seria?',
      preparar_estrutura_percebida:
        'Como o texto parece estar organizado? Quais são as partes, blocos ou movimentos que você consegue identificar?',
      preparar_vg_perguntas:
        'Que perguntas este texto levanta em você? O que ainda não ficou claro? O que surpreende ou intriga?',
      preparar_vg_dificuldades:
        'Que tensões, paradoxos ou dificuldades de compreensão você já percebe nesta passagem?',
    },
  },
}

// ── Toolbar primitives ────────────────────────────────────────────────────────

function Btn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        background: active ? 'var(--surface-2)' : 'transparent',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: '5px', padding: '0.22rem 0.35rem',
        cursor: 'pointer', fontFamily: 'inherit',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize: '0.78rem', fontWeight: active ? 600 : 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '26px', transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span style={{ width: '1px', background: 'var(--border-subtle)', alignSelf: 'stretch', margin: '0 2px' }} />
}

// ── Content helpers ───────────────────────────────────────────────────────────

function extractCardsFromDoc(def: SectionDef, doc: string): Record<string, string> {
  if (typeof DOMParser === 'undefined') return {}
  const container = new DOMParser()
    .parseFromString(`<div>${doc}</div>`, 'text/html')
    .querySelector('div')
  if (!container) return {}
  const headings = Array.from(container.querySelectorAll('h2, h3'))
  const result: Record<string, string> = {}
  headings.forEach((heading, idx) => {
    const card = def.cards[idx]
    if (!card) return
    const parts: string[] = []
    let el = heading.nextElementSibling
    while (el && !['H2', 'H3'].includes(el.tagName)) {
      if (el.tagName !== 'BLOCKQUOTE' && el.tagName !== 'HR') {
        if (el.textContent?.trim()) parts.push(el.outerHTML)
      }
      el = el.nextElementSibling
    }
    result[card.id] = parts.join('')
  })
  return result
}

function loadCardsFromSection(def: SectionDef, existing: Section | undefined): Record<string, string> {
  const stored = existing?.content as Record<string, unknown> | null
  if (stored?.cards && typeof stored.cards === 'object') return stored.cards as Record<string, string>
  if (stored?.doc && typeof stored.doc === 'string') return extractCardsFromDoc(def, stored.doc)
  return {}
}

function isCardDone(html: string): boolean {
  if (!html?.trim() || html === '<p></p>') return false
  const text = html.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 10
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocumentBlock {
  sectionDef: SectionDef
  existingSection: Section | undefined
}

interface Props {
  blocks: DocumentBlock[]
  project: Project
  userId: string
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  guided?: boolean
  initialSlug?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceDocument({
  blocks, project, userId, onUpdate, guided = true, initialSlug,
}: Props) {
  const supabase = createClient()

  const initialChapterIdx = useMemo(() => {
    if (!initialSlug) return 0
    const idx = blocks.findIndex(b => b.sectionDef.slug === initialSlug)
    return idx >= 0 ? idx : 0
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Card contents: { [sectionSlug]: { [cardId]: html } }
  const [cardContents, setCardContents] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, loadCardsFromSection(b.sectionDef, b.existingSection)]))
  )

  // One chapter open at a time
  const [openChapterIdx, setOpenChapterIdx] = useState<number>(initialChapterIdx)

  // Lazy-mount: chapter content only rendered after first open
  const [openedChapters, setOpenedChapters] = useState<Set<number>>(() => new Set([initialChapterIdx]))

  // Shared toolbar
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)
  const [hlOpen,    setHlOpen]    = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [linkOpen,  setLinkOpen]  = useState(false)
  const [linkUrl,   setLinkUrl]   = useState('')
  const [aiOpen,    setAiOpen]    = useState(false)
  const hlRef    = useRef<HTMLDivElement>(null)
  const colorRef = useRef<HTMLDivElement>(null)
  const linkRef  = useRef<HTMLDivElement>(null)

  const editorMapRef = useRef<Map<string, Editor>>(new Map())
  const saveTimers   = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sectionRefs  = useRef<Record<string, Section | undefined>>(
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, b.existingSection]))
  )

  const activeEditor  = activeEditorKey ? (editorMapRef.current.get(activeEditorKey) ?? null) : null
  const focusedSlug   = activeEditorKey?.split(':')?.[0] ?? null
  const focusedCardId = activeEditorKey?.split(':')?.[1] ?? null

  // Subscribe to active editor transactions → toolbar reflects state
  useEffect(() => {
    if (!activeEditor) return
    const h = () => forceUpdate(n => n + 1)
    activeEditor.on('transaction', h)
    return () => { activeEditor.off('transaction', h) }
  }, [activeEditor])

  // Close pickers on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if ([hlRef, colorRef, linkRef].every(r => !r.current?.contains(e.target as Node))) {
        setHlOpen(false); setColorOpen(false); setLinkOpen(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Respond to initialSlug changes (sidebar navigation)
  useEffect(() => {
    if (!initialSlug) return
    const idx = blocks.findIndex(b => b.sectionDef.slug === initialSlug)
    if (idx >= 0) openChapterAt(idx)
  }, [initialSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────

  function openChapterAt(idx: number) {
    setOpenChapterIdx(idx)
    setOpenedChapters(prev => new Set([...prev, idx]))
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function scheduleCardSave(sectionSlug: string, cardId: string, html: string) {
    setCardContents(prev => ({
      ...prev,
      [sectionSlug]: { ...(prev[sectionSlug] ?? {}), [cardId]: html },
    }))
    const key = `${sectionSlug}:${cardId}`
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key])
    saveTimers.current[key] = setTimeout(() => void performCardSave(sectionSlug, cardId, html), 1500)
  }

  async function performCardSave(sectionSlug: string, cardId: string, html: string) {
    const def = blocks.find(b => b.sectionDef.slug === sectionSlug)?.sectionDef
    if (!def) return
    const currentCards = cardContents[sectionSlug] ?? {}
    const updatedCards = { ...currentCards, [cardId]: html }
    const doneCount = def.cards.filter(c => isCardDone(updatedCards[c.id] ?? '')).length
    const status: 'empty' | 'draft' | 'reviewed' =
      doneCount === 0 ? 'empty' : doneCount === def.cards.length ? 'reviewed' : 'draft'
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionSlug, module: def.module, title: def.title,
      content: { cards: updatedCards }, status,
    }
    const existing = sectionRefs.current[sectionSlug]
    if (existing?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existing.id).select().single()
      if (data) { onUpdate(data as Section); sectionRefs.current[sectionSlug] = data as Section }
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { onUpdate(data as Section); sectionRefs.current[sectionSlug] = data as Section }
    }
  }

  // ── AI context ────────────────────────────────────────────────────────────

  const focusedBlock = blocks.find(b => b.sectionDef.slug === focusedSlug)?.sectionDef ?? null
  const focusedCard  = focusedBlock?.cards.find(c => c.id === focusedCardId) ?? null
  const chMeta       = focusedBlock ? CHAPTER_META[focusedBlock.slug] : null

  const aiContext = useMemo((): AIContext | undefined => {
    if (!focusedBlock || !focusedCard) return undefined
    return {
      project: {
        id: project.id, book: project.book, passage_ref: project.passage_ref,
        testament: project.testament, original_language: project.original_language,
        study_mode: project.study_mode ?? undefined,
      },
      phase: focusedBlock.phase, phaseLabel: 'Preparar',
      section: focusedBlock.slug, sectionLabel: chMeta?.title ?? focusedBlock.title,
      field: focusedCard.id, fieldLabel: focusedCard.title,
      userId,
    }
  }, [focusedBlock, focusedCard, project, userId, chMeta])

  // ── Link ──────────────────────────────────────────────────────────────────

  function applyLink() {
    if (!activeEditor) return
    const url = linkUrl.trim()
    if (!url) { activeEditor.chain().focus().unsetLink().run(); setLinkOpen(false); return }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    activeEditor.chain().focus().setLink({ href }).run()
    setLinkOpen(false); setLinkUrl('')
  }

  // ── AI handlers ───────────────────────────────────────────────────────────

  const handleAiInsert = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug || !focusedCardId) return
    activeEditor.chain().focus().insertContent(html).run()
    scheduleCardSave(focusedSlug, focusedCardId, activeEditor.getHTML())
  }, [activeEditor, focusedSlug, focusedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiReplace = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug || !focusedCardId) return
    activeEditor.chain().focus().setContent(html).run()
    scheduleCardSave(focusedSlug, focusedCardId, html)
  }, [activeEditor, focusedSlug, focusedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiAppend = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug || !focusedCardId) return
    const end = activeEditor.state.doc.content.size
    activeEditor.chain().focus().setTextSelection(end).insertContent(html).run()
    scheduleCardSave(focusedSlug, focusedCardId, activeEditor.getHTML())
  }, [activeEditor, focusedSlug, focusedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const accent = '#D97706'
  const ed     = activeEditor

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

      {/*
        Override RichEditor border when used in document mode.
        The editor should look integrated, not boxed.
      */}
      <style>{`
        .ws-doc-section .rich-editor .ProseMirror {
          border: none;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          padding: 0.25rem 0 0.5rem;
          min-height: 80px;
        }
        .ws-doc-section .rich-editor .ProseMirror:focus {
          box-shadow: none;
          border: none;
        }
        .ws-doc-section .rich-editor .ProseMirror p:first-child {
          margin-top: 0;
        }
      `}</style>

      {/* ── Shared sticky toolbar ─────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: '37px', zIndex: 20,
        display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
        padding: '0.3rem 0.45rem',
        background: 'var(--background)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        {!ed ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
            Clique em uma seção para começar a escrever
          </span>
        ) : (
          <>
            <Btn active={ed.isActive('heading', { level: 1 })} onClick={() => ed.chain().focus().toggleHeading({ level: 1 }).run()} title="Título 1">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H1</span>
            </Btn>
            <Btn active={ed.isActive('heading', { level: 2 })} onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H2</span>
            </Btn>
            <Btn active={ed.isActive('heading', { level: 3 })} onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H3</span>
            </Btn>
            <Sep />
            <Btn active={ed.isActive('bold')}      onClick={() => ed.chain().focus().toggleBold().run()}      title="Negrito"><strong>B</strong></Btn>
            <Btn active={ed.isActive('italic')}    onClick={() => ed.chain().focus().toggleItalic().run()}    title="Itálico"><em>I</em></Btn>
            <Btn active={ed.isActive('underline')} onClick={() => ed.chain().focus().toggleUnderline().run()} title="Sublinhado"><u>U</u></Btn>
            <Btn active={ed.isActive('strike')}    onClick={() => ed.chain().focus().toggleStrike().run()}    title="Tachado"><s>S</s></Btn>
            <Sep />
            <div ref={colorRef} style={{ position: 'relative' }}>
              <Btn active={colorOpen} onClick={() => { setColorOpen(o => !o); setHlOpen(false); setLinkOpen(false) }} title="Cor do texto">
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ed.getAttributes('textStyle').color ?? 'var(--text-primary)', lineHeight: 1 }}>A</span>
                  <span style={{ width: '12px', height: '3px', borderRadius: '1px', background: ed.getAttributes('textStyle').color ?? '#1E293B' }} />
                </span>
              </Btn>
              {colorOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {TEXT_COLORS.map(c => (
                    <button key={c.color} type="button" title={c.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().setColor(c.color).run(); setColorOpen(false) }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '2px solid rgba(0,0,0,0.08)', background: c.color, cursor: 'pointer' }}
                    />
                  ))}
                  <button type="button" title="Cor padrão"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetColor().run(); setColorOpen(false) }}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}
                  >✕</button>
                </div>
              )}
            </div>
            <div ref={hlRef} style={{ position: 'relative' }}>
              <Btn active={hlOpen || ed.isActive('highlight')} onClick={() => { setHlOpen(o => !o); setColorOpen(false); setLinkOpen(false) }} title="Destaque">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: ed.isActive('highlight') ? (ed.getAttributes('highlight').color ?? '#FEF3C7') : '#FEF3C7', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>▾</span>
                </span>
              </Btn>
              {hlOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '112px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {HL_COLORS.map(h => (
                    <button key={h.color} type="button" title={h.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().toggleHighlight({ color: h.color }).run(); setHlOpen(false) }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: h.color, cursor: 'pointer' }}
                    />
                  ))}
                  <button type="button" title="Remover destaque"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetHighlight().run(); setHlOpen(false) }}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)' }}
                  >✕</button>
                </div>
              )}
            </div>
            <Sep />
            <Btn active={ed.isActive('bulletList')}  onClick={() => ed.chain().focus().toggleBulletList().run()}  title="Lista">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
            </Btn>
            <Btn active={ed.isActive('orderedList')} onClick={() => ed.chain().focus().toggleOrderedList().run()} title="Numeração">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" strokeLinecap="round"/><path d="M4 10h2" strokeLinecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round"/></svg>
            </Btn>
            <Btn active={ed.isActive('taskList')} onClick={() => ed.chain().focus().toggleTaskList().run()} title="Lista de tarefas">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="5" height="5" rx="1"/><polyline points="5 8 6.5 9.5 9 7"/><line x1="13" y1="7.5" x2="21" y2="7.5"/><rect x="3" y="14" width="5" height="5" rx="1"/><line x1="13" y1="16.5" x2="21" y2="16.5"/></svg>
            </Btn>
            <Sep />
            <Btn active={ed.isActive('blockquote')} onClick={() => ed.chain().focus().toggleBlockquote().run()} title="Citação">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </Btn>
            <Btn active={ed.isActive('codeBlock')} onClick={() => ed.chain().focus().toggleCodeBlock().run()} title="Código">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </Btn>
            <Btn active={false} onClick={() => ed.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </Btn>
            <div ref={linkRef} style={{ position: 'relative' }}>
              <Btn active={ed.isActive('link') || linkOpen} onClick={() => {
                setLinkOpen(o => !o); setHlOpen(false); setColorOpen(false)
                if (!linkOpen) setLinkUrl(ed.getAttributes('link').href ?? '')
              }} title="Link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </Btn>
              {linkOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', width: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', gap: '4px' }}>
                  <input autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setLinkOpen(false) }}
                    placeholder="https://..." style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }}
                  />
                  <button type="button" onMouseDown={e => { e.preventDefault(); applyLink() }}
                    style={{ background: accent, color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    OK
                  </button>
                  {ed.isActive('link') && (
                    <button type="button" onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetLink().run(); setLinkOpen(false) }}
                      style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '5px', padding: '4px 6px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
            <Sep />
            <Btn active={false} onClick={() => ed.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpar formatação">
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>A</span>
            </Btn>
            {aiContext && (
              <>
                <div style={{ flex: 1 }} />
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); setAiOpen(o => !o) }}
                  title="Assistente IA"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: aiOpen ? `${accent}15` : 'transparent',
                    border: aiOpen ? `1px solid ${accent}40` : '1px solid transparent',
                    borderRadius: '6px', padding: '0.22rem 0.55rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.72rem', fontWeight: 700,
                    color: aiOpen ? accent : 'var(--text-muted)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!aiOpen) { e.currentTarget.style.background = `${accent}08`; e.currentTarget.style.color = accent } }}
                  onMouseLeave={e => { if (!aiOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
                >
                  ✨ IA
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Chapters ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: '720px', margin: '0 auto', width: '100%', padding: '1.5rem 1.25rem 4rem' }}>
        {blocks.map(({ sectionDef }, chapterIdx) => {
          const chMetaEntry = CHAPTER_META[sectionDef.slug]
          const isChOpen    = openChapterIdx === chapterIdx
          const isRendered  = openedChapters.has(chapterIdx)
          const contents    = cardContents[sectionDef.slug] ?? {}
          const doneCount   = sectionDef.cards.filter(c => isCardDone(contents[c.id] ?? '')).length
          const totalCount  = sectionDef.cards.length
          const allDone     = doneCount === totalCount && totalCount > 0

          return (
            <div
              key={sectionDef.slug}
              style={{
                marginBottom: '0.65rem',
                borderRadius: '14px',
                border: `1px solid ${isChOpen ? `${accent}20` : 'var(--border-subtle)'}`,
                overflow: 'hidden',
                transition: 'border-color 0.25s ease',
                background: 'var(--surface)',
              }}
            >
              {/* ── Chapter header ──────────────────────────────────────── */}
              <button
                type="button"
                onClick={() => openChapterAt(chapterIdx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '1rem 1.25rem',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                {/* Chapter number circle */}
                <span style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: allDone ? '#10B98115' : isChOpen ? `${accent}15` : 'var(--surface-2)',
                  border: `2px solid ${allDone ? '#10B981' : isChOpen ? accent : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  fontSize: '0.8rem', fontWeight: 700,
                  color: allDone ? '#10B981' : isChOpen ? accent : 'var(--text-muted)',
                }}>
                  {allDone ? '✓' : chapterIdx + 1}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Etapa label */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: allDone ? '#10B981' : isChOpen ? accent : 'var(--text-muted)',
                    display: 'block', marginBottom: '0.2rem',
                  }}>
                    Etapa {chapterIdx + 1} de {blocks.length}
                  </span>

                  {/* Chapter title */}
                  <h2 style={{
                    margin: '0 0 0.5rem',
                    fontSize: '1rem', fontWeight: 700,
                    color: 'var(--text-primary)', letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}>
                    {chMetaEntry?.title ?? sectionDef.shortTitle ?? sectionDef.title}
                  </h2>

                  {/* Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      flex: 1, maxWidth: '120px', height: '3px',
                      background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                        background: allDone ? '#10B981' : accent,
                        borderRadius: '2px', transition: 'width 0.45s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {doneCount === 0 ? 'Não iniciada' : allDone ? 'Concluída' : `${doneCount} de ${totalCount}`}
                    </span>
                  </div>
                </div>

                <span style={{
                  color: 'var(--text-muted)', fontSize: '0.72rem', flexShrink: 0,
                  transition: 'transform 0.22s ease',
                  transform: isChOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}>
                  ▾
                </span>
              </button>

              {/* ── Chapter body — accordion ─────────────────────────── */}
              <div style={{
                display: 'grid',
                gridTemplateRows: isChOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <div style={{ overflow: 'hidden' }}>
                  {isRendered && (
                    <div style={{ padding: '0 1.5rem 2rem' }}>

                      {/* Chapter intro */}
                      {chMetaEntry?.intro && (
                        <p style={{
                          margin: '0 0 1.75rem',
                          fontSize: '0.85rem', color: 'var(--text-secondary)',
                          lineHeight: 1.7, fontStyle: 'italic',
                        }}>
                          {chMetaEntry.intro}
                        </p>
                      )}

                      {/* Sections — continuous document */}
                      {sectionDef.cards.map((card, cardIdx) => {
                        const cardContent   = contents[card.id] ?? ''
                        const isFirst       = cardIdx === 0
                        const sectionTitle  = chMetaEntry?.sectionTitles?.[card.id] ?? card.title
                        const orientation   = guided ? (chMetaEntry?.placeholders?.[card.id] ?? '') : ''
                        const editorKey     = `${sectionDef.slug}:${card.id}`
                        const done          = isCardDone(cardContent)

                        return (
                          <div key={card.id}>
                            {/* Section divider */}
                            {!isFirst && (
                              <div style={{
                                height: '1px', background: 'var(--border-subtle)',
                                margin: '1.5rem 0', opacity: 0.6,
                              }} />
                            )}

                            {/* Section title */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.45rem' }}>
                              <h3 style={{
                                margin: 0,
                                fontSize: '0.9rem', fontWeight: 700,
                                color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
                                letterSpacing: '-0.01em',
                                transition: 'color 0.3s ease',
                              }}>
                                {sectionTitle}
                              </h3>
                              {done && (
                                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>
                                  ✓
                                </span>
                              )}
                            </div>

                            {/* Orientation (teacher's voice — always visible in guided mode) */}
                            {orientation && (
                              <p style={{
                                margin: '0 0 0.5rem',
                                fontSize: '0.79rem', color: 'var(--text-muted)',
                                lineHeight: 1.65, fontStyle: 'italic',
                              }}>
                                {orientation}
                              </p>
                            )}

                            {/* Editor — integrated, borderless */}
                            <div className="ws-doc-section">
                              <RichEditor
                                value={cardContent}
                                onChange={html => scheduleCardSave(sectionDef.slug, card.id, html)}
                                placeholder=""
                                minHeight={80}
                                moduleColor={accent}
                                hideToolbar
                                onEditorMount={editor => {
                                  editorMapRef.current.set(editorKey, editor)
                                }}
                                onFocusChange={focused => {
                                  if (focused) setActiveEditorKey(editorKey)
                                }}
                              />
                            </div>

                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── AI panel ─────────────────────────────────────────────────────── */}
      {aiOpen && aiContext && ed && (
        <AIAssistantPanel
          context={aiContext}
          currentContent={ed.getHTML()}
          onInsert={handleAiInsert}
          onReplace={handleAiReplace}
          onAppend={handleAiAppend}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  )
}
