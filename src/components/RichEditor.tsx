'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { Link } from '@tiptap/extension-link'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { useState, useEffect, useRef, useCallback } from 'react'
import AIAssistantPanel, { type AIContext } from './AIAssistantPanel'

// ── Types ─────────────────────────────────────────────────────────────────────

export type { AIContext }

export interface InsertMenuItem {
  icon: string
  label: string
  snippet: string
}

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  moduleColor?: string
  minHeight?: number
  insertMenu?: InsertMenuItem[]
  compact?: boolean
  autoFocus?: boolean
  aiContext?: AIContext
  sticky?: boolean
}

// ── Color palettes ────────────────────────────────────────────────────────────

const HL_COLORS = [
  { color: '#FEF3C7', label: 'Amarelo'  },
  { color: '#DBEAFE', label: 'Azul'     },
  { color: '#DCFCE7', label: 'Verde'    },
  { color: '#EDE9FE', label: 'Roxo'     },
  { color: '#FFEDD5', label: 'Laranja'  },
  { color: '#FCE7F3', label: 'Rosa'     },
]

const TEXT_COLORS = [
  { color: '#1E293B', label: 'Padrão'   },
  { color: '#DC2626', label: 'Vermelho' },
  { color: '#D97706', label: 'Âmbar'   },
  { color: '#16A34A', label: 'Verde'    },
  { color: '#2563EB', label: 'Azul'     },
  { color: '#7C3AED', label: 'Roxo'     },
  { color: '#0891B2', label: 'Ciano'    },
  { color: '#BE123C', label: 'Rosa'     },
  { color: '#78350F', label: 'Marrom'   },
  { color: '#64748B', label: 'Cinza'    },
]

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(lt|gt|amp|quot|#39|nbsp);/g, entity => HTML_ENTITIES[entity] ?? entity)
}

function normalizeEditorContent(value: string): string {
  const decoded = decodeHtmlEntities(value)
  return /<\/?[a-z][\s\S]*>/i.test(decoded.trim()) ? decoded : value
}

// ── Toolbar helpers ───────────────────────────────────────────────────────────

function Btn({
  active, onClick, title, children, danger,
}: {
  active?: boolean; onClick: () => void; title?: string
  children: React.ReactNode; danger?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        background:   active ? 'var(--surface-2)' : 'transparent',
        border:       active ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: '5px',
        padding:      '0.22rem 0.35rem',
        cursor:       'pointer',
        color:        danger ? '#EF4444' : active ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize:     '0.78rem',
        fontFamily:   'inherit',
        fontWeight:   active ? 600 : 400,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        minWidth:     '26px',
        transition:   'background 0.1s, color 0.1s',
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function RichEditor({
  value, onChange, placeholder, moduleColor = 'var(--accent)', minHeight = 180,
  insertMenu, compact = false, autoFocus = false, aiContext, sticky = false,
}: Props) {
  const [structuralMode, setStructuralMode] = useState(false)
  const [hlOpen,         setHlOpen]         = useState(false)
  const [colorOpen,      setColorOpen]      = useState(false)
  const [insertOpen,     setInsertOpen]     = useState(false)
  const [linkOpen,       setLinkOpen]       = useState(false)
  const [linkUrl,        setLinkUrl]        = useState('')
  const [focused,        setFocused]        = useState(false)
  const [aiOpen,         setAiOpen]         = useState(false)
  const [isStuck,        setIsStuck]        = useState(false)
  const structuralRef  = useRef(false)
  const hlRef          = useRef<HTMLDivElement>(null)
  const colorRef       = useRef<HTMLDivElement>(null)
  const insertRef      = useRef<HTMLDivElement>(null)
  const linkRef        = useRef<HTMLDivElement>(null)
  const sentinelRef    = useRef<HTMLDivElement>(null)
  // Tracks whether the pending value change originated inside the editor (typing/AI commands).
  // When true, the sync useEffect must skip setContent to avoid resetting cursor position.
  const isInternalRef  = useRef(false)
  // Skips the initial useEffect run — editor already has correct content from useEditor's `content` prop.
  const isMountedRef   = useRef(false)

  useEffect(() => { structuralRef.current = structuralMode }, [structuralMode])

  const closeAll = useCallback(() => {
    setHlOpen(false); setColorOpen(false); setInsertOpen(false); setLinkOpen(false)
  }, [])

  // Close pickers on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      const refs = [hlRef, colorRef, insertRef, linkRef]
      if (refs.every(r => !r.current?.contains(e.target as Node))) closeAll()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [closeAll])

  // Sticky toolbar: detect when toolbar is "stuck" using IntersectionObserver on sentinel
  useEffect(() => {
    if (!sticky || !sentinelRef.current) return
    function findScrollParent(node: Element | null): Element | null {
      if (!node || node === document.documentElement) return null
      const { overflowY } = window.getComputedStyle(node)
      if (overflowY === 'auto' || overflowY === 'scroll') return node
      return findScrollParent(node.parentElement)
    }
    const root = findScrollParent(sentinelRef.current.parentElement)
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root, rootMargin: '-37px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [sticky])

  const normalizedValue = normalizeEditorContent(value || '')

  const editor = useEditor({ // eslint-disable-line @typescript-eslint/no-use-before-define
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({ codeBlock: {} }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', class: 'rich-link' } }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: normalizedValue,
    autofocus: autoFocus ? 'end' : false,
    onUpdate: ({ editor }) => { isInternalRef.current = true; onChange(editor.getHTML()) },
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    editorProps: {
      attributes: { spellcheck: 'false' },
      handleKeyDown: (_view, event): boolean => {
        if (event.key !== 'Tab') return false
        event.preventDefault()
        if (structuralRef.current) {
          if (event.shiftKey) {
            editor?.commands.command(({ tr, state }: { tr: import('@tiptap/pm/state').Transaction; state: import('@tiptap/pm/state').EditorState }): boolean => {
              const { from } = state.selection
              const lineStart = state.doc.resolve(from).start()
              const lineText  = state.doc.textBetween(lineStart, from, '\n', '\0')
              if (lineText.startsWith('    ')) { tr.delete(lineStart, lineStart + 4); return true }
              return false
            })
          } else {
            editor?.commands.insertContent('    ')
          }
          return true
        }
        if (editor?.isActive('listItem') || editor?.isActive('taskItem')) {
          return event.shiftKey
            ? (editor.commands.liftListItem('listItem') || editor.commands.liftListItem('taskItem'))
            : (editor.commands.sinkListItem('listItem') || editor.commands.sinkListItem('taskItem'))
        }
        return false
      },
    },
  })

  // Sync external value changes (AI injection, section change) without disturbing cursor.
  // Root-cause guard: normalizeEditorContent decodes HTML entities (&amp;→&, &lt;→<, etc.)
  // so normalizedValue always differs from editor.getHTML() when the text contains those chars,
  // causing setContent on every keystroke and resetting the cursor to the end.
  // Fix: skip the effect whenever the value change originated from the editor itself.
  useEffect(() => {
    if (!editor) return
    if (!isMountedRef.current) { isMountedRef.current = true; return }
    if (isInternalRef.current) { isInternalRef.current = false; return }
    // Genuine external update — setContent defaults to emitUpdate=false in TipTap v3.
    if (editor.isDestroyed) return
    editor.commands.setContent(normalizedValue)
  }, [normalizedValue]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const isEmpty = !normalizedValue || normalizedValue === '<p></p>' || normalizedValue.trim() === ''

  // ── Link helper ───────────────────────────────────────────────────────────
  function applyLink() {
    const url = linkUrl.trim()
    if (!url) { editor.chain().focus().unsetLink().run(); setLinkOpen(false); return }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    editor.chain().focus().setLink({ href }).run()
    setLinkOpen(false)
    setLinkUrl('')
  }

  // ── AI helpers ────────────────────────────────────────────────────────────
  const handleAiInsert  = useCallback((html: string) => {
    editor.chain().focus().insertContent(html).run()
    onChange(editor.getHTML())
  }, [editor, onChange])

  const handleAiReplace = useCallback((html: string) => {
    editor.chain().focus().setContent(html).run()
    onChange(html)
  }, [editor, onChange])

  const handleAiAppend = useCallback((html: string) => {
    const end = editor.state.doc.content.size
    editor.chain().focus().setTextSelection(end).insertContent(html).run()
    onChange(editor.getHTML())
  }, [editor, onChange])

  return (
    <>
    <div style={{ position: 'relative' }}>
      {/* Sentinel: 1px invisible div used by IntersectionObserver to detect sticky state */}
      {sticky && <div ref={sentinelRef} style={{ height: '1px', visibility: 'hidden', pointerEvents: 'none' }} />}

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
        padding: '0.3rem 0.45rem',
        background: sticky && isStuck ? 'var(--background)' : 'var(--surface)',
        borderTop:    sticky && isStuck ? 'none' : `1px solid ${focused ? `${moduleColor}50` : 'var(--border)'}`,
        borderRight:  sticky && isStuck ? 'none' : `1px solid ${focused ? `${moduleColor}50` : 'var(--border)'}`,
        borderLeft:   sticky && isStuck ? 'none' : `1px solid ${focused ? `${moduleColor}50` : 'var(--border)'}`,
        borderBottom: sticky && isStuck ? '1px solid rgba(0,0,0,0.08)' : 'none',
        borderRadius: sticky && isStuck ? 0 : '8px 8px 0 0',
        boxShadow: sticky && isStuck ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        ...(sticky ? { position: 'sticky' as const, top: '37px', zIndex: 10 } : {}),
      }}>

        {/* ── Headings — hidden in compact ── */}
        {!compact && (
          <>
            <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Título 1 (Alt+1)">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H1</span>
            </Btn>
            <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2 (Alt+2)">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H2</span>
            </Btn>
            <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3 (Alt+3)">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H3</span>
            </Btn>
            <Sep />
          </>
        )}

        {/* ── Text style ── */}
        <Btn active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Negrito (Ctrl+B)"><strong>B</strong></Btn>
        <Btn active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Itálico (Ctrl+I)"><em>I</em></Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado (Ctrl+U)"><u>U</u></Btn>
        <Btn active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Tachado"><s>S</s></Btn>

        <Sep />

        {/* ── Text color ── */}
        <div ref={colorRef} style={{ position: 'relative' }}>
          <Btn active={colorOpen} onClick={() => { setColorOpen(o => !o); setHlOpen(false); setInsertOpen(false); setLinkOpen(false) }} title="Cor do texto">
            <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: editor.getAttributes('textStyle').color ?? 'var(--text-primary)', lineHeight: 1 }}>A</span>
              <span style={{ width: '12px', height: '3px', borderRadius: '1px', background: editor.getAttributes('textStyle').color ?? '#1E293B' }} />
            </span>
          </Btn>
          {colorOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              {TEXT_COLORS.map(c => (
                <button key={c.color} type="button" title={c.label}
                  onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c.color).run(); setColorOpen(false) }}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '2px solid rgba(0,0,0,0.08)', background: c.color, cursor: 'pointer' }}
                />
              ))}
              <button type="button" title="Cor padrão"
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setColorOpen(false) }}
                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}
              >✕</button>
            </div>
          )}
        </div>

        {/* ── Highlight ── */}
        <div ref={hlRef} style={{ position: 'relative' }}>
          <Btn active={hlOpen || editor.isActive('highlight')} onClick={() => { setHlOpen(o => !o); setColorOpen(false); setInsertOpen(false); setLinkOpen(false) }} title="Destaque">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: editor.isActive('highlight') ? (editor.getAttributes('highlight').color ?? '#FEF3C7') : '#FEF3C7', border: '1px solid rgba(0,0,0,0.1)' }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>▾</span>
            </span>
          </Btn>
          {hlOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '112px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              {HL_COLORS.map(h => (
                <button key={h.color} type="button" title={h.label}
                  onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: h.color }).run(); setHlOpen(false) }}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: h.color, cursor: 'pointer' }}
                />
              ))}
              <button type="button" title="Remover destaque"
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setHlOpen(false) }}
                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)' }}
              >✕</button>
            </div>
          )}
        </div>

        <Sep />

        {/* ── Lists ── */}
        <Btn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Lista">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numeração">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" strokeLinecap="round"/><path d="M4 10h2" strokeLinecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round"/></svg>
        </Btn>
        <Btn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Lista de tarefas">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="5" height="5" rx="1"/><polyline points="5 8 6.5 9.5 9 7"/><line x1="13" y1="7.5" x2="21" y2="7.5"/><rect x="3" y="14" width="5" height="5" rx="1"/><line x1="13" y1="16.5" x2="21" y2="16.5"/></svg>
        </Btn>

        <Sep />

        {/* ── Indent / outdent ── */}
        <Btn active={false} onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Recuar (Tab)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 8 17 12 13 16"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="3" y1="6" x2="3" y2="18"/></svg>
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Avançar recuo (Shift+Tab)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="11 8 7 12 11 16"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="21" y1="6" x2="21" y2="18"/></svg>
        </Btn>

        <Sep />

        {/* ── Block formats ── */}
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </Btn>

        {!compact && (
          <>
            <Btn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Bloco de código">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </Btn>
            <Btn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </Btn>
          </>
        )}

        {/* ── Link ── */}
        <div ref={linkRef} style={{ position: 'relative' }}>
          <Btn active={editor.isActive('link') || linkOpen} onClick={() => {
            setLinkOpen(o => !o)
            setHlOpen(false); setColorOpen(false); setInsertOpen(false)
            if (!linkOpen) setLinkUrl(editor.getAttributes('link').href ?? '')
          }} title="Link (Ctrl+K)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </Btn>
          {linkOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', width: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', gap: '4px' }}>
              <input
                autoFocus
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setLinkOpen(false) }}
                placeholder="https://..."
                style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }}
              />
              <button type="button" onMouseDown={e => { e.preventDefault(); applyLink() }}
                style={{ background: moduleColor, color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                OK
              </button>
              {editor.isActive('link') && (
                <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetLink().run(); setLinkOpen(false) }}
                  style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '5px', padding: '4px 6px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        <Sep />

        {/* ── Structural mode (hidden in compact) ── */}
        {!compact && (
          <Btn active={structuralMode} onClick={() => setStructuralMode(m => !m)} title="Modo Estrutural — recuo livre com Tab">
            <span style={{ fontSize: '0.67rem', fontFamily: 'monospace', letterSpacing: '-0.02em', fontWeight: 600 }}>
              {structuralMode ? 'EST ●' : 'EST'}
            </span>
          </Btn>
        )}

        {/* ── Clear formatting ── */}
        <Btn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpar formatação">
          <span style={{ fontSize: '0.65rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>A</span>
        </Btn>

        {/* ── Insert menu ── */}
        {insertMenu && insertMenu.length > 0 && (
          <>
            <Sep />
            <div ref={insertRef} style={{ position: 'relative' }}>
              <Btn active={insertOpen} onClick={() => { setInsertOpen(o => !o); setHlOpen(false); setColorOpen(false); setLinkOpen(false) }} title="Inserir elemento">
                <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>Inserir ▾</span>
              </Btn>
              {insertOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: '#FFF', border: '1px solid var(--border)', borderRadius: '9px', minWidth: '196px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                  {insertMenu.map((item, idx) => (
                    <button key={idx} type="button"
                      onMouseDown={e => { e.preventDefault(); editor.chain().focus().insertContent(item.snippet).run(); setInsertOpen(false) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.55rem', border: 'none', background: 'transparent', padding: '0.5rem 0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', color: 'var(--text-primary)', textAlign: 'left', borderBottom: idx < insertMenu.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── AI button ── */}
        {aiContext && (
          <>
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); setAiOpen(o => !o); closeAll() }}
              title="Assistente IA"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: aiOpen ? `${moduleColor}15` : 'transparent',
                border: aiOpen ? `1px solid ${moduleColor}40` : '1px solid transparent',
                borderRadius: '6px', padding: '0.22rem 0.55rem',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', fontWeight: 700,
                color: aiOpen ? moduleColor : 'var(--text-muted)',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!aiOpen) { e.currentTarget.style.background = `${moduleColor}08`; e.currentTarget.style.color = moduleColor } }}
              onMouseLeave={e => { if (!aiOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >
              ✨ IA
            </button>
          </>
        )}
      </div>

      {/* ── Editor area ── */}
      <div style={{ position: 'relative' }}>
        {isEmpty && (
          <div style={{ position: 'absolute', top: '1rem', left: '1.1rem', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: structuralMode ? '0.82rem' : '0.9rem', fontFamily: structuralMode ? 'monospace' : 'var(--font-serif)', opacity: 0.5, userSelect: 'none' }}>
            {placeholder}
          </div>
        )}

        <style>{`
          .rich-editor .ProseMirror {
            min-height: ${minHeight}px;
            padding: 1rem 1.1rem;
            outline: none;
            font-family: var(--font-serif), Georgia, serif;
            font-size: 0.9rem;
            line-height: 1.78;
            color: var(--text-primary);
            border: 1px solid ${focused ? `${moduleColor}60` : 'var(--border)'};
            border-radius: 0 0 8px 8px;
            background: var(--surface);
            box-shadow: ${focused ? `0 0 0 3px ${moduleColor}12` : 'none'};
            transition: border-color 0.15s, box-shadow 0.15s;
            caret-color: ${moduleColor};
          }
          .rich-editor.structural .ProseMirror {
            font-family: 'SF Mono', 'JetBrains Mono', Menlo, monospace;
            font-size: 0.82rem;
            line-height: 1.65;
            white-space: pre-wrap;
            background: rgba(0,0,0,0.02);
          }
          .rich-editor .ProseMirror p { margin: 0 0 0.25em; }
          .rich-editor .ProseMirror ul,
          .rich-editor .ProseMirror ol { padding-left: 1.5em; margin: 0.25em 0; }
          .rich-editor .ProseMirror li { margin: 0.1em 0; }
          .rich-editor .ProseMirror blockquote {
            border-left: 3px solid ${moduleColor}60;
            padding-left: 0.85rem;
            margin: 0.5em 0;
            color: var(--text-secondary);
            font-style: italic;
          }
          .rich-editor .ProseMirror strong { font-weight: 700; }
          .rich-editor .ProseMirror em     { font-style: italic; }
          .rich-editor .ProseMirror u      { text-decoration: underline; text-underline-offset: 2px; }
          .rich-editor .ProseMirror s      { text-decoration: line-through; }
          .rich-editor .ProseMirror h1 { font-size: 1.25rem; font-weight: 800; margin: 0.9em 0 0.3em; color: var(--text-primary); line-height: 1.25; letter-spacing: -0.02em; }
          .rich-editor .ProseMirror h2 { font-size: 1.05rem; font-weight: 750; margin: 0.75em 0 0.25em; color: var(--text-primary); line-height: 1.3; }
          .rich-editor .ProseMirror h3 { font-size: 0.92rem; font-weight: 700; margin: 0.6em 0 0.2em; color: var(--text-secondary); line-height: 1.35; text-transform: uppercase; letter-spacing: 0.04em; }
          .rich-editor .ProseMirror pre { background: rgba(0,0,0,0.04); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 0.75rem 1rem; margin: 0.5em 0; overflow-x: auto; }
          .rich-editor .ProseMirror pre code { background: none; border: none; padding: 0; font-family: 'SF Mono', 'JetBrains Mono', Menlo, monospace; font-size: 0.8rem; color: var(--text-primary); }
          .rich-editor .ProseMirror code { background: rgba(0,0,0,0.05); border-radius: 3px; padding: 0.15em 0.35em; font-family: 'SF Mono', 'JetBrains Mono', Menlo, monospace; font-size: 0.82em; }
          .rich-editor .ProseMirror hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
          .rich-editor .ProseMirror a.rich-link { color: ${moduleColor}; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
          .rich-editor .ProseMirror a.rich-link:hover { opacity: 0.8; }
          .rich-editor .ProseMirror ul[data-type="taskList"] { padding-left: 0.25em; list-style: none; }
          .rich-editor .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
          .rich-editor .ProseMirror ul[data-type="taskList"] li > label { display: flex; align-items: center; margin-top: 0.22em; flex-shrink: 0; }
          .rich-editor .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] { width: 14px; height: 14px; cursor: pointer; accent-color: ${moduleColor}; }
          .rich-editor .ProseMirror ul[data-type="taskList"] li > div { flex: 1; min-width: 0; }
          .rich-editor .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div { opacity: 0.55; text-decoration: line-through; }
        `}</style>

        <div className={`rich-editor${structuralMode ? ' structural' : ''}`} onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>

    {aiOpen && aiContext && (
      <AIAssistantPanel
        context={aiContext}
        currentContent={editor.getHTML()}
        onInsert={handleAiInsert}
        onReplace={handleAiReplace}
        onAppend={handleAiAppend}
        onClose={() => setAiOpen(false)}
      />
    )}
    </>
  )
}
