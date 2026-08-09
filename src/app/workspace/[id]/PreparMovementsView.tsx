'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/core'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import RichEditor from '@/components/RichEditorLazy'

interface DocumentBlock {
  sectionDef: SectionDef
  existingSection?: Section
}

interface Props {
  blocks: DocumentBlock[]
  project: Project
  userId: string
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

// ── Movement definition ───────────────────────────────────────────────────────

interface CardRef { slug: string; id: string; icon: string }
interface Movement { number: number; label: string; description: string; cards: CardRef[]; showBibleText: boolean }

function buildMovements(blocks: DocumentBlock[]): Movement[] {
  const isNarrativas = blocks.some(b => b.sectionDef.slug === 'nr_preparar_visao_geral')
  return [
    {
      number: 1,
      label: 'Oração e Propósito',
      description: 'Prepare seu coração e defina o propósito desta mensagem.',
      cards: [
        { slug: 'preparacao_espiritual', id: 'preparar_oracao',          icon: '🙏' },
        { slug: 'preparacao_espiritual', id: 'preparar_objetivo_estudo', icon: '🎯' },
      ],
      showBibleText: false,
    },
    {
      number: 2,
      label: 'Texto Bíblico',
      description: 'Leia devagar. Use os destaques para marcar o que chama atenção.',
      cards: [
        { slug: 'preparar_leia_assimile', id: 'preparar_leitura_lenta', icon: '📖' },
      ],
      showBibleText: true,
    },
    {
      number: 3,
      label: 'Interpretação Prévia',
      description: 'Antes de qualquer comentário, registre sua impressão inicial.',
      cards: isNarrativas
        ? [
            { slug: 'nr_preparar_visao_geral', id: 'nr_vg_tema',      icon: '💡' },
            { slug: 'nr_preparar_visao_geral', id: 'nr_vg_estrutura', icon: '✏️' },
          ]
        : [
            { slug: 'preparar_visao_geral', id: 'preparar_tema_provavel',       icon: '💡' },
            { slug: 'preparar_visao_geral', id: 'preparar_grande_ideia_inicial', icon: '✏️' },
          ],
      showBibleText: false,
    },
  ]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadCards(sectionDef: SectionDef, existing?: Section): Record<string, string> {
  const stored = (existing?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
  return Object.fromEntries(sectionDef.cards.map(c => [c.id, stored[c.id] ?? '']))
}

function isCardDone(html: string) {
  return html.replace(/<[^>]*>/g, '').trim().length > 20
}

// ── Inline Bible Text ─────────────────────────────────────────────────────────

function InlineBibleText({ book, passageRef, version }: { book: string; passageRef: string; version?: string }) {
  const [verses, setVerses] = useState<{ v: number; t: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bible/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, passageRef, version: version ?? 'ACF' }),
    })
      .then(r => r.json())
      .then(data => { if (data.verses?.length) setVerses(data.verses) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [book, passageRef, version])

  if (loading) return (
    <div style={{ padding: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
      Carregando passagem...
    </div>
  )
  if (!verses.length) return null

  return (
    <div style={{
      margin: '0 0 2rem',
      padding: '1.5rem 1.75rem',
      background: '#FEFDF9',
      border: '1px solid #E8E2D5',
      borderRadius: '10px',
      borderLeft: '3px solid #D97706',
    }}>
      <div style={{
        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
        color: '#D97706', textTransform: 'uppercase', marginBottom: '1rem',
      }}>
        {passageRef} · {version ?? 'ACF'}
      </div>
      <p style={{
        margin: 0,
        fontSize: '1rem', lineHeight: 1.88, color: '#1A1D23',
        fontFamily: "'EB Garamond', Georgia, serif",
      }}>
        {verses.map(v => (
          <span key={v.v}>
            <sup style={{
              fontSize: '0.52rem', fontWeight: 700, color: '#D97706',
              fontFamily: 'inherit', marginRight: '2px',
            }}>
              {v.v}
            </sup>
            {v.t}{' '}
          </span>
        ))}
      </p>
    </div>
  )
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

const ACCENT = '#D97706'

const HL_COLORS = [
  { color: '#FEF3C7', label: 'Amarelo' }, { color: '#DBEAFE', label: 'Azul' },
  { color: '#DCFCE7', label: 'Verde' },   { color: '#EDE9FE', label: 'Roxo' },
  { color: '#FFEDD5', label: 'Laranja' }, { color: '#FCE7F3', label: 'Rosa' },
]

function TBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      type="button" onMouseDown={e => { e.preventDefault(); onClick() }} title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: 5, border: 'none',
        background: active ? `${ACCENT}18` : 'transparent',
        color: active ? ACCENT : 'var(--text-secondary)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(0,0,0,0.05)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent' } }}
    >
      {children}
    </button>
  )
}

function TSep() {
  return <div style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.1)', margin: '0 2px' }} />
}

function Toolbar({ ed, hlRef, hlOpen, setHlOpen }: {
  ed: Editor | null
  hlRef: React.RefObject<HTMLDivElement | null>
  hlOpen: boolean
  setHlOpen: (v: boolean) => void
}) {
  return (
    <div style={{
      position: 'sticky', top: '44px', zIndex: 20,
      background: 'var(--background)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        maxWidth: '720px', margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
        padding: '0.28rem 0.45rem',
      }}>
        {!ed ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
            Clique em um campo para começar a escrever
          </span>
        ) : (
          <>
            <TBtn active={ed.isActive('bold')}      onClick={() => ed.chain().focus().toggleBold().run()}      title="Negrito"><strong>B</strong></TBtn>
            <TBtn active={ed.isActive('italic')}    onClick={() => ed.chain().focus().toggleItalic().run()}    title="Itálico"><em>I</em></TBtn>
            <TBtn active={ed.isActive('underline')} onClick={() => ed.chain().focus().toggleUnderline().run()} title="Sublinhado"><u>U</u></TBtn>
            <TSep />
            <div ref={hlRef} style={{ position: 'relative' }}>
              <TBtn active={hlOpen || ed.isActive('highlight')} onClick={() => setHlOpen(!hlOpen)} title="Destaque">
                <span style={{ width: 12, height: 12, borderRadius: 2, background: '#FEF3C7', border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }} />
              </TBtn>
              {hlOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
                  background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px',
                  padding: '0.35rem', display: 'flex', gap: '4px', flexWrap: 'wrap',
                  width: '112px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}>
                  {HL_COLORS.map(h => (
                    <button key={h.color} type="button" title={h.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().toggleHighlight({ color: h.color }).run(); setHlOpen(false) }}
                      style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', background: h.color, cursor: 'pointer' }}
                    />
                  ))}
                  <button type="button" title="Remover destaque"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetHighlight().run(); setHlOpen(false) }}
                    style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}
                  >✕</button>
                </div>
              )}
            </div>
            <TSep />
            <TBtn active={ed.isActive('bulletList')}  onClick={() => ed.chain().focus().toggleBulletList().run()}  title="Lista">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
            </TBtn>
            <TSep />
            <TBtn active={false} onClick={() => window.dispatchEvent(new CustomEvent('workspace:ai-open'))} title="Assistente IA">
              <span style={{ fontSize: '0.72rem' }}>✦ IA</span>
            </TBtn>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PreparMovementsView({ blocks, project, userId, onUpdate, onAskAI }: Props) {
  const supabase = createClient()

  const [cardContents, setCardContents] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, loadCards(b.sectionDef, b.existingSection)]))
  )
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)
  const [hlOpen, setHlOpen] = useState(false)
  const hlRef = useRef<HTMLDivElement>(null)

  const editorMapRef  = useRef<Map<string, Editor>>(new Map())
  const saveTimers    = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sectionRefs   = useRef<Record<string, Section | undefined>>(
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, b.existingSection]))
  )

  const ed = activeEditorKey ? (editorMapRef.current.get(activeEditorKey) ?? null) : null

  useEffect(() => {
    if (!ed) return
    const h = () => forceUpdate(n => n + 1)
    ed.on('transaction', h)
    return () => { ed.off('transaction', h) }
  }, [ed])

  // Close highlight picker on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (hlRef.current && !hlRef.current.contains(e.target as Node)) setHlOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

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
    const block = blocks.find(b => b.sectionDef.slug === sectionSlug)
    if (!block) return
    const def = block.sectionDef
    const currentCards  = cardContents[sectionSlug] ?? {}
    const updatedCards  = { ...currentCards, [cardId]: html }
    const doneCount     = def.cards.filter(c => isCardDone(updatedCards[c.id] ?? '')).length
    const status: 'empty' | 'draft' | 'reviewed' =
      doneCount === 0 ? 'empty' : doneCount === def.cards.length ? 'reviewed' : 'draft'
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionSlug, module: def.module, title: def.title,
      content: { cards: updatedCards }, status,
    }
    const existing = sectionRefs.current[sectionSlug]
    if (existing) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existing.id).select().single()
      if (data) { const s = data as Section; sectionRefs.current[sectionSlug] = s; onUpdate(s) }
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { const s = data as Section; sectionRefs.current[sectionSlug] = s; onUpdate(s) }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

      {/* Shared sticky toolbar */}
      <Toolbar ed={ed} hlRef={hlRef} hlOpen={hlOpen} setHlOpen={setHlOpen} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>

          {buildMovements(blocks).map((movement, mIdx) => (
            <div key={movement.number} style={{ marginTop: mIdx === 0 ? 0 : '3.5rem' }}>

              {/* Movement header */}
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: '0.75rem',
                marginBottom: '1.75rem',
                paddingBottom: '0.75rem',
                borderBottom: `2px solid ${mIdx === 0 ? ACCENT + '30' : 'var(--border-subtle)'}`,
              }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 800,
                  color: ACCENT, letterSpacing: '0.1em',
                  textTransform: 'uppercase', flexShrink: 0,
                  background: `${ACCENT}10`,
                  padding: '0.15rem 0.5rem', borderRadius: '4px',
                }}>
                  {movement.number}
                </span>
                <div>
                  <span style={{
                    fontSize: '1.05rem', fontWeight: 700,
                    color: 'var(--text-primary)', letterSpacing: '-0.02em',
                  }}>
                    {movement.label}
                  </span>
                  <span style={{
                    display: 'block',
                    fontSize: '0.78rem', color: 'var(--text-muted)',
                    marginTop: '0.1rem', lineHeight: 1.4,
                  }}>
                    {movement.description}
                  </span>
                </div>
              </div>

              {/* Bible text (movement 2) */}
              {movement.showBibleText && project.passage_ref && (
                <InlineBibleText
                  book={project.book}
                  passageRef={project.passage_ref}
                  version={project.bible_version ?? undefined}
                />
              )}

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {movement.cards.map((cardRef, cardIdx) => {
                  const block = blocks.find(b => b.sectionDef.slug === cardRef.slug)
                  if (!block) return null
                  const cardDef = block.sectionDef.cards.find(c => c.id === cardRef.id)
                  if (!cardDef) return null
                  const editorKey  = `${cardRef.slug}:${cardRef.id}`
                  const content    = cardContents[cardRef.slug]?.[cardRef.id] ?? ''
                  const done       = isCardDone(content)
                  const isActive   = activeEditorKey === editorKey

                  return (
                    <div
                      key={editorKey}
                      style={{
                        padding: '1rem 1.25rem 1.1rem',
                        background: 'var(--surface)',
                        border: `1px solid ${isActive ? ACCENT + '30' : 'var(--border-subtle)'}`,
                        borderRadius: '12px',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      {/* Card header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.6rem' }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                          background: done ? '#10B98112' : `${ACCENT}14`,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.95rem',
                        }}>
                          {cardRef.icon}
                        </span>
                        <h3 style={{
                          margin: 0, fontSize: '0.92rem', fontWeight: 700,
                          color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
                          letterSpacing: '-0.01em', flex: 1,
                        }}>
                          {cardDef.title}
                        </h3>
                        {done && <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 600 }}>✓</span>}
                        {isActive && (
                          <button
                            type="button"
                            onMouseDown={e => { e.preventDefault(); onAskAI(cardDef.aiTrigger) }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.18rem',
                              background: 'transparent', border: `1px solid var(--border-subtle)`,
                              borderRadius: '5px', padding: '0.1rem 0.42rem',
                              cursor: 'pointer', fontFamily: 'inherit',
                              fontSize: '0.65rem', fontWeight: 700,
                              color: 'var(--text-muted)', transition: 'all 0.12s',
                            }}
                          >
                            ✨ IA
                          </button>
                        )}
                      </div>

                      {/* Editor */}
                      <div className="ws-doc-section">
                        <RichEditor
                          value={content}
                          onChange={html => scheduleCardSave(cardRef.slug, cardRef.id, html)}
                          placeholder={cardDef.placeholder}
                          minHeight={80}
                          moduleColor={ACCENT}
                          hideToolbar
                          onEditorMount={editor => { editorMapRef.current.set(editorKey, editor) }}
                          onFocusChange={focused => { if (focused) setActiveEditorKey(editorKey) }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
