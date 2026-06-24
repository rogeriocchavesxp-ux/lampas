'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { Editor } from '@tiptap/core'
import RichEditor from '@/components/RichEditorLazy'
import AIAssistantPanel from '@/components/AIAssistantPanel'

// ── Constants ─────────────────────────────────────────────────────────────────

const HL_COLORS = [
  { color: '#FEF3C7', label: 'Amarelo' },
  { color: '#DBEAFE', label: 'Azul' },
  { color: '#DCFCE7', label: 'Verde' },
  { color: '#EDE9FE', label: 'Roxo' },
  { color: '#FFEDD5', label: 'Laranja' },
  { color: '#FCE7F3', label: 'Rosa' },
]

const TEXT_COLORS = [
  { color: '#1E293B', label: 'Padrão' },
  { color: '#DC2626', label: 'Vermelho' },
  { color: '#D97706', label: 'Âmbar' },
  { color: '#16A34A', label: 'Verde' },
  { color: '#2563EB', label: 'Azul' },
  { color: '#7C3AED', label: 'Roxo' },
  { color: '#0891B2', label: 'Ciano' },
  { color: '#64748B', label: 'Cinza' },
]

const PHASE_LABELS: Record<string, string> = {
  preparar: 'Preparar',
  interpretar: 'Investigar',
  investigar: 'Investigar',
  comunicar: 'Pregar',
  ferramentas: 'Ferramentas',
}

// ── Primitives ────────────────────────────────────────────────────────────────

function DocBtn({ active, onClick, title, children }: {
  active?: boolean
  onClick: () => void
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        background: active ? 'var(--surface-2)' : 'transparent',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: '5px', padding: '0.22rem 0.35rem', cursor: 'pointer',
        fontFamily: 'inherit', color: active ? 'var(--text-primary)' : 'var(--text-muted)',
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

function DocSep() {
  return <span style={{ width: '1px', background: 'var(--border-subtle)', alignSelf: 'stretch', margin: '0 2px' }} />
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DocumentBlock {
  id: string
  title: string
  placeholder?: string
}

export interface WorkspaceDocumentRendererProps {
  // Document metadata
  project: {
    id: string
    title: string
    bible_version?: string | null
    original_language?: string | null
    book?: string | null
    passage_ref?: string | null
    testament?: string | null
    study_mode?: string | null
  }
  phase?: string
  phaseLabel: string
  moduleColor: string

  // Section
  sectionSlug: string
  sectionTitle: string
  sectionObjective?: string

  // Content
  blocks: DocumentBlock[]
  blockContent: Record<string, string>
  onBlockChange: (id: string, html: string) => void

  // Meta
  userId: string
  saving?: boolean
  savedAt?: Date | null

  // Optional: extra content below the blocks (e.g. research guide, modals)
  children?: React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceDocumentRenderer({
  project,
  phase,
  phaseLabel,
  moduleColor,
  sectionSlug,
  sectionTitle,
  sectionObjective,
  blocks,
  blockContent,
  onBlockChange,
  userId,
  saving,
  savedAt,
  children,
}: WorkspaceDocumentRendererProps) {
  // ── Toolbar state ──────────────────────────────────────────────────────────
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null)
  const [, forceToolbar] = useState(0)
  const [hlOpen, setHlOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [aiOpen, setAiOpen] = useState(false)

  const editorMapRef = useRef<Map<string, Editor>>(new Map())
  const hlRef = useRef<HTMLDivElement | null>(null)
  const colorRef = useRef<HTMLDivElement | null>(null)
  const linkRef = useRef<HTMLDivElement | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeEditor = activeEditorKey ? (editorMapRef.current.get(activeEditorKey) ?? null) : null
  const focusedBlockId = activeEditorKey ?? null
  const focusedBlock = blocks.find(b => b.id === focusedBlockId) ?? null
  const ed = activeEditor

  const savedLabel = saving
    ? 'salvando…'
    : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeEditor) return
    const h = () => forceToolbar(n => n + 1)
    activeEditor.on('transaction', h)
    return () => { activeEditor.off('transaction', h) }
  }, [activeEditor])

  useEffect(() => {
    function h(e: MouseEvent) {
      if (hlRef.current && !hlRef.current.contains(e.target as Node)) setHlOpen(false)
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setColorOpen(false)
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) setLinkOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // ── AI context ────────────────────────────────────────────────────────────
  const aiContext = useMemo(() => {
    if (!focusedBlock) return undefined
    return {
      project: {
        id: project.id,
        book: project.book ?? '',
        passage_ref: project.passage_ref ?? '',
        testament: project.testament ?? '',
        original_language: project.original_language ?? '',
        study_mode: project.study_mode ?? undefined,
      },
      phase: phase ?? '',
      phaseLabel: PHASE_LABELS[phase ?? ''] ?? phaseLabel,
      section: sectionSlug,
      sectionLabel: sectionTitle,
      field: focusedBlock.id,
      fieldLabel: focusedBlock.title,
      userId,
    }
  }, [focusedBlock, project, phase, phaseLabel, sectionSlug, sectionTitle, userId])

  // ── Link apply ────────────────────────────────────────────────────────────
  const applyLink = useCallback(() => {
    if (!activeEditor) return
    const url = linkUrl.trim()
    if (!url) {
      activeEditor.chain().focus().unsetLink().run()
      setLinkOpen(false)
      return
    }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    activeEditor.chain().focus().setLink({ href }).run()
    setLinkOpen(false)
    setLinkUrl('')
  }, [activeEditor, linkUrl])

  // ── AI handlers ───────────────────────────────────────────────────────────
  function handleAiInsert(html: string) {
    if (!activeEditor || !focusedBlockId) return
    activeEditor.chain().focus().insertContent(html).run()
    onBlockChange(focusedBlockId, activeEditor.getHTML())
  }
  function handleAiReplace(html: string) {
    if (!activeEditor || !focusedBlockId) return
    activeEditor.chain().focus().setContent(html).run()
    onBlockChange(focusedBlockId, html)
  }
  function handleAiAppend(html: string) {
    if (!activeEditor || !focusedBlockId) return
    const end = activeEditor.state.doc.content.size
    activeEditor.chain().focus().setTextSelection(end).insertContent(html).run()
    onBlockChange(focusedBlockId, activeEditor.getHTML())
  }

  // ── Toolbar render ────────────────────────────────────────────────────────
  function renderToolbar() {
    return (
      <div style={{
        position: 'sticky', top: '37px', zIndex: 20,
        display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
        padding: '0.28rem 0.45rem',
        background: '#ffffff',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        margin: '0 -5rem 1.5rem',
      }}>
        {!ed ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
            Clique em uma seção para escrever
          </span>
        ) : (
          <>
            <DocBtn active={ed.isActive('bold')} onClick={() => ed.chain().focus().toggleBold().run()} title="Negrito">
              <strong>B</strong>
            </DocBtn>
            <DocBtn active={ed.isActive('italic')} onClick={() => ed.chain().focus().toggleItalic().run()} title="Itálico">
              <em>I</em>
            </DocBtn>
            <DocBtn active={ed.isActive('underline')} onClick={() => ed.chain().focus().toggleUnderline().run()} title="Sublinhado">
              <u>U</u>
            </DocBtn>
            <DocBtn active={ed.isActive('strike')} onClick={() => ed.chain().focus().toggleStrike().run()} title="Tachado">
              <s>S</s>
            </DocBtn>
            <DocSep />

            {/* Text color */}
            <div ref={colorRef} style={{ position: 'relative' }}>
              <DocBtn active={colorOpen} onClick={() => { setColorOpen(o => !o); setHlOpen(false); setLinkOpen(false) }} title="Cor do texto">
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ed.getAttributes('textStyle').color ?? 'var(--text-primary)', lineHeight: 1 }}>A</span>
                  <span style={{ width: '12px', height: '3px', borderRadius: '1px', background: ed.getAttributes('textStyle').color ?? '#1E293B' }} />
                </span>
              </DocBtn>
              {colorOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {TEXT_COLORS.map(c => (
                    <button key={c.color} type="button" title={c.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().setColor(c.color).run(); setColorOpen(false) }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '2px solid rgba(0,0,0,0.08)', background: c.color, cursor: 'pointer' }} />
                  ))}
                  <button type="button" title="Padrão"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetColor().run(); setColorOpen(false) }}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}>✕</button>
                </div>
              )}
            </div>

            {/* Highlight */}
            <div ref={hlRef} style={{ position: 'relative' }}>
              <DocBtn active={hlOpen || ed.isActive('highlight')} onClick={() => { setHlOpen(o => !o); setColorOpen(false); setLinkOpen(false) }} title="Destaque">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: ed.isActive('highlight') ? (ed.getAttributes('highlight').color ?? '#FEF3C7') : '#FEF3C7', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>▾</span>
                </span>
              </DocBtn>
              {hlOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '112px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {HL_COLORS.map(h => (
                    <button key={h.color} type="button" title={h.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().toggleHighlight({ color: h.color }).run(); setHlOpen(false) }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: h.color, cursor: 'pointer' }} />
                  ))}
                  <button type="button" title="Remover"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetHighlight().run(); setHlOpen(false) }}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)' }}>✕</button>
                </div>
              )}
            </div>
            <DocSep />

            {/* Lists */}
            <DocBtn active={ed.isActive('bulletList')} onClick={() => ed.chain().focus().toggleBulletList().run()} title="Lista">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
                <circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </DocBtn>
            <DocBtn active={ed.isActive('orderedList')} onClick={() => ed.chain().focus().toggleOrderedList().run()} title="Numeração">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                <path d="M4 6h1v4" strokeLinecap="round"/><path d="M4 10h2" strokeLinecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round"/>
              </svg>
            </DocBtn>
            <DocBtn active={ed.isActive('blockquote')} onClick={() => ed.chain().focus().toggleBlockquote().run()} title="Citação">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </DocBtn>
            <DocSep />

            {/* Link */}
            <div ref={linkRef} style={{ position: 'relative' }}>
              <DocBtn
                active={ed.isActive('link') || linkOpen}
                onClick={() => {
                  setLinkOpen(o => !o)
                  setHlOpen(false)
                  setColorOpen(false)
                  if (!linkOpen) setLinkUrl(ed.getAttributes('link').href ?? '')
                }}
                title="Link"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </DocBtn>
              {linkOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', width: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', gap: '4px' }}>
                  <input
                    autoFocus
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); applyLink() }
                      if (e.key === 'Escape') setLinkOpen(false)
                    }}
                    placeholder="https://..."
                    style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); applyLink() }}
                    style={{ background: moduleColor, color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >OK</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .wdr-block .rich-editor > div:first-child { display: none !important; }
        .wdr-block .rich-editor .ProseMirror {
          border: none; border-radius: 0; background: transparent; box-shadow: none;
          padding: 0.35rem 0 0.65rem; min-height: 56px;
        }
        .wdr-block .rich-editor .ProseMirror:focus { box-shadow: none; border: none; }
        .wdr-block .rich-editor .ProseMirror p:first-child { margin-top: 0; }
        .wdr-block .rich-editor { border: none !important; box-shadow: none !important; }
      `}</style>

      {/* Desk */}
      <div style={{ flex: 1, background: '#ECEEF1', padding: '2.5rem 2rem 8rem', fontFamily: 'var(--font-sans)' }}>

        {/* Paper */}
        <div style={{
          maxWidth: '680px', margin: '0 auto', background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.07)',
          borderRadius: '2px', padding: '4rem 5rem',
          minHeight: 'calc(100vh - 160px)',
        }}>

          {/* Document header */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: moduleColor, marginBottom: '1.1rem' }} />
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#1A1D23', letterSpacing: '-0.045em', lineHeight: 1.0 }}>
              {project.title}
            </h1>
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{phaseLabel}</span>
              {project.bible_version && (
                <><span style={{ opacity: 0.4 }}>•</span><span>{project.bible_version}</span></>
              )}
              {project.original_language && (
                <><span style={{ opacity: 0.4 }}>•</span><span>{project.original_language}</span></>
              )}
              {savedLabel && (
                <span style={{ marginLeft: 'auto', color: saving ? 'var(--ai, #7C3AED)' : 'var(--success, #10B981)', fontSize: '0.72rem' }}>
                  {savedLabel}
                </span>
              )}
            </p>
            <div style={{ margin: '1.75rem 0 0', height: '1px', background: 'var(--border-subtle, #E2E8F0)' }} />
          </div>

          {/* Section title + objective */}
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {sectionTitle}
          </h2>
          {sectionObjective && (
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#64748B', fontStyle: 'italic', lineHeight: 1.6, borderLeft: `2px solid ${moduleColor}50`, paddingLeft: '1rem' }}>
              {sectionObjective}
            </p>
          )}

          {/* Shared toolbar */}
          {renderToolbar()}

          {/* Blocks */}
          <div style={{ paddingTop: '0.5rem' }}>
            {blocks.map((block, idx) => {
              const content = blockContent[block.id] ?? ''
              const isFocused = activeEditorKey === block.id

              return (
                <div key={block.id} style={{ marginTop: idx === 0 ? 0 : '1.5rem' }}>
                  {/* Subtitle row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: moduleColor, letterSpacing: '-0.005em', lineHeight: 1.3 }}>
                      {block.title}
                    </h3>
                    {isFocused && (
                      <button
                        type="button"
                        onMouseDown={e => { e.preventDefault(); setAiOpen(o => !o) }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                          background: aiOpen ? `${moduleColor}15` : 'transparent',
                          border: `1px solid ${aiOpen ? `${moduleColor}50` : '#CBD5E1'}`,
                          borderRadius: '5px', padding: '0.1rem 0.42rem',
                          cursor: 'pointer', fontFamily: 'inherit',
                          fontSize: '0.65rem', fontWeight: 700,
                          color: aiOpen ? moduleColor : '#94A3B8',
                          transition: 'all 0.12s',
                        }}
                      >
                        ✨ IA
                      </button>
                    )}
                  </div>

                  {/* Seamless editor */}
                  <div className="wdr-block">
                    <RichEditor
                      value={content}
                      onChange={html => onBlockChange(block.id, html)}
                      placeholder={block.placeholder ?? ''}
                      minHeight={56}
                      moduleColor={moduleColor}
                      hideToolbar
                      onEditorMount={editor => { editorMapRef.current.set(block.id, editor) }}
                      onFocusChange={focused => { if (focused) setActiveEditorKey(block.id) }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI panel */}
          {aiOpen && aiContext && activeEditor && (
            <AIAssistantPanel
              context={aiContext}
              currentContent={activeEditor.getHTML()}
              onInsert={handleAiInsert}
              onReplace={handleAiReplace}
              onAppend={handleAiAppend}
              onClose={() => setAiOpen(false)}
            />
          )}

          {/* Slot for extra workspace content */}
          {children}

        </div>
      </div>
    </>
  )
}
