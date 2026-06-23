'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Editor } from '@tiptap/core'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import { SECTION_DOC_TEMPLATES } from '@/lib/section-doc-templates'
import type { AIContext } from '@/components/RichEditor'
import AIAssistantPanel from '@/components/AIAssistantPanel'
import RichEditor from '@/components/RichEditorLazy'

// ── Color palettes (mirrors RichEditor) ──────────────────────────────────────

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
        borderRadius: '5px',
        padding: '0.22rem 0.35rem',
        cursor: 'pointer',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize: '0.78rem',
        fontFamily: 'inherit',
        fontWeight: active ? 600 : 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '26px',
        transition: 'background 0.1s, color 0.1s',
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

function buildTemplate(def: SectionDef): string {
  if (SECTION_DOC_TEMPLATES[def.slug]) return SECTION_DOC_TEMPLATES[def.slug]
  return def.cards.map(card => `<h3>${card.title}</h3><p></p>`).join('')
}

function loadContent(def: SectionDef, existing: Section | undefined): string {
  const stored = existing?.content as Record<string, unknown> | null
  if (stored?.doc && typeof stored.doc === 'string') return stored.doc
  if (stored?.cards) {
    return def.cards.map(card => {
      const body = (stored.cards as Record<string, string>)[card.id] || '<p></p>'
      return `<h3>${card.title}</h3>${body}`
    }).join('')
  }
  return buildTemplate(def)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getStatus(html: string, template: string): 'empty' | 'draft' | 'reviewed' {
  const text = stripHtml(html)
  const tmpl = stripHtml(template)
  if (!text || text === tmpl) return 'empty'
  return text.length > 400 ? 'reviewed' : 'draft'
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
  blocks, project, userId, onUpdate, onAskAI, guided = true, initialSlug,
}: Props) {
  const supabase = createClient()

  const editorMapRef = useRef<Map<string, Editor>>(new Map())
  const [focusedSlug, setFocusedSlug] = useState<string | null>(
    initialSlug ?? blocks[0]?.sectionDef.slug ?? null,
  )

  // Triggers toolbar re-render when active editor emits a transaction
  const [, forceUpdate] = useState(0)

  const [blockContents, setBlockContents] = useState<Record<string, string>>(() =>
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, loadContent(b.sectionDef, b.existingSection)])),
  )

  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sectionRefs = useRef<Record<string, Section | undefined>>(
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, b.existingSection])),
  )

  // Toolbar state
  const [hlOpen,    setHlOpen]    = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [linkOpen,  setLinkOpen]  = useState(false)
  const [linkUrl,   setLinkUrl]   = useState('')
  const [aiOpen,    setAiOpen]    = useState(false)
  const hlRef    = useRef<HTMLDivElement>(null)
  const colorRef = useRef<HTMLDivElement>(null)
  const linkRef  = useRef<HTMLDivElement>(null)

  const activeEditor = focusedSlug ? (editorMapRef.current.get(focusedSlug) ?? null) : null
  const focusedDef   = blocks.find(b => b.sectionDef.slug === focusedSlug)?.sectionDef ?? null

  // Subscribe to active editor transactions so toolbar reflects cursor state
  useEffect(() => {
    if (!activeEditor) return
    const handler = () => forceUpdate(n => n + 1)
    activeEditor.on('transaction', handler)
    return () => { activeEditor.off('transaction', handler) }
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

  // Scroll + focus when initialSlug changes (sidebar navigation between PREPARAR sections)
  useEffect(() => {
    if (!initialSlug) return
    setFocusedSlug(initialSlug)
    const el = document.getElementById(`ws-doc-block-${initialSlug}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [initialSlug])

  const registerEditor = useCallback((slug: string, editor: Editor) => {
    editorMapRef.current.set(slug, editor)
  }, [])

  // Only set focus — never clear, so toolbar buttons don't lose their target
  const handleFocusBlock = useCallback((slug: string) => {
    setFocusedSlug(slug)
    setAiOpen(false)
  }, [])

  function scheduleAutosave(slug: string, html: string) {
    setBlockContents(prev => ({ ...prev, [slug]: html }))
    if (saveTimers.current[slug]) clearTimeout(saveTimers.current[slug])
    saveTimers.current[slug] = setTimeout(() => void performSave(slug, html), 1500)
  }

  async function performSave(slug: string, html: string) {
    const def = blocks.find(b => b.sectionDef.slug === slug)?.sectionDef
    if (!def) return
    const status  = getStatus(html, buildTemplate(def))
    const payload = {
      project_id: project.id, user_id: userId,
      slug, module: def.module, title: def.title,
      content: { doc: html }, status,
    }
    const existing = sectionRefs.current[slug]
    if (existing?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existing.id).select().single()
      if (data) { onUpdate(data as Section); sectionRefs.current[slug] = data as Section }
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { onUpdate(data as Section); sectionRefs.current[slug] = data as Section }
    }
  }

  const aiContext = useMemo((): AIContext | undefined => {
    if (!focusedDef) return undefined
    return {
      project: {
        id: project.id, book: project.book, passage_ref: project.passage_ref,
        testament: project.testament, original_language: project.original_language,
        study_mode: project.study_mode ?? undefined,
      },
      phase: focusedDef.phase, phaseLabel: 'Preparar',
      section: focusedDef.slug, sectionLabel: focusedDef.title,
      userId,
    }
  }, [focusedDef, project, userId])

  function applyLink() {
    if (!activeEditor) return
    const url = linkUrl.trim()
    if (!url) { activeEditor.chain().focus().unsetLink().run(); setLinkOpen(false); return }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    activeEditor.chain().focus().setLink({ href }).run()
    setLinkOpen(false); setLinkUrl('')
  }

  const handleAiInsert = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug) return
    activeEditor.chain().focus().insertContent(html).run()
    scheduleAutosave(focusedSlug, activeEditor.getHTML())
  }, [activeEditor, focusedSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiReplace = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug) return
    activeEditor.chain().focus().setContent(html).run()
    scheduleAutosave(focusedSlug, html)
  }, [activeEditor, focusedSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiAppend = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug) return
    const end = activeEditor.state.doc.content.size
    activeEditor.chain().focus().setTextSelection(end).insertContent(html).run()
    scheduleAutosave(focusedSlug, activeEditor.getHTML())
  }, [activeEditor, focusedSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  const accent = '#D97706'
  const ed     = activeEditor

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

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
            Clique em um bloco para começar a escrever
          </span>
        ) : (
          <>
            {/* Headings */}
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

            {/* Text style */}
            <Btn active={ed.isActive('bold')}      onClick={() => ed.chain().focus().toggleBold().run()}      title="Negrito (Ctrl+B)"><strong>B</strong></Btn>
            <Btn active={ed.isActive('italic')}    onClick={() => ed.chain().focus().toggleItalic().run()}    title="Itálico (Ctrl+I)"><em>I</em></Btn>
            <Btn active={ed.isActive('underline')} onClick={() => ed.chain().focus().toggleUnderline().run()} title="Sublinhado (Ctrl+U)"><u>U</u></Btn>
            <Btn active={ed.isActive('strike')}    onClick={() => ed.chain().focus().toggleStrike().run()}    title="Tachado"><s>S</s></Btn>
            <Sep />

            {/* Text color */}
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

            {/* Highlight */}
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

            {/* Lists */}
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

            {/* Block formats */}
            <Btn active={ed.isActive('blockquote')} onClick={() => ed.chain().focus().toggleBlockquote().run()} title="Citação">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </Btn>
            <Btn active={ed.isActive('codeBlock')} onClick={() => ed.chain().focus().toggleCodeBlock().run()} title="Bloco de código">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </Btn>
            <Btn active={false} onClick={() => ed.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </Btn>

            {/* Link */}
            <div ref={linkRef} style={{ position: 'relative' }}>
              <Btn active={ed.isActive('link') || linkOpen} onClick={() => {
                setLinkOpen(o => !o); setHlOpen(false); setColorOpen(false)
                if (!linkOpen) setLinkUrl(ed.getAttributes('link').href ?? '')
              }} title="Link (Ctrl+K)">
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

            {/* Clear formatting */}
            <Btn active={false} onClick={() => ed.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpar formatação">
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>A</span>
            </Btn>

            {/* AI button */}
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

      {/* ── Document blocks ───────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        {blocks.map(({ sectionDef }, idx) => {
          const isFocused = focusedSlug === sectionDef.slug
          const content   = blockContents[sectionDef.slug] ?? ''
          return (
            <div
              key={sectionDef.slug}
              id={`ws-doc-block-${sectionDef.slug}`}
              style={{ borderBottom: idx < blocks.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
            >
              {/* Block heading */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '1.5rem 1.1rem 0.5rem',
              }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: accent,
                  background: `${accent}12`, border: `1px solid ${accent}30`,
                  borderRadius: '4px', padding: '0.1rem 0.45rem',
                }}>
                  Doc {idx + 1}
                </span>
                <h2 style={{
                  margin: 0, fontSize: '0.98rem', fontWeight: 700,
                  color: isFocused ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'color 0.15s',
                }}>
                  {sectionDef.title}
                </h2>
                {guided && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {sectionDef.shortTitle}
                  </span>
                )}
              </div>

              {/* Editor (no toolbar — shared toolbar above handles it) */}
              <RichEditor
                value={content}
                onChange={html => scheduleAutosave(sectionDef.slug, html)}
                minHeight={380}
                moduleColor={accent}
                hideToolbar
                onEditorMount={editor => registerEditor(sectionDef.slug, editor)}
                onFocusChange={focused => { if (focused) handleFocusBlock(sectionDef.slug) }}
              />
            </div>
          )
        })}
      </div>

      {/* ── AI panel (document-level, tied to focused block) ─────────────── */}
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
