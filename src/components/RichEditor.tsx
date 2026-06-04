'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { useState, useEffect, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  moduleColor?: string
  minHeight?: number
}

// ── Highlight color palette ───────────────────────────────────────────────────

const HL_COLORS = [
  { color: '#FEF3C7', label: 'Amarelo'  },
  { color: '#DBEAFE', label: 'Azul'     },
  { color: '#DCFCE7', label: 'Verde'    },
  { color: '#EDE9FE', label: 'Roxo'     },
  { color: '#FFEDD5', label: 'Laranja'  },
  { color: '#FCE7F3', label: 'Rosa'     },
]

// ── Toolbar button ────────────────────────────────────────────────────────────

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
}: Props) {
  const [structuralMode, setStructuralMode] = useState(false)
  const [hlOpen,         setHlOpen]         = useState(false)
  const [focused,        setFocused]        = useState(false)
  const structuralRef = useRef(false)
  const hlRef         = useRef<HTMLDivElement>(null)
  const editorRef     = useRef<ReturnType<typeof useEditor>>(null)

  useEffect(() => { structuralRef.current = structuralMode }, [structuralMode])

  // Close highlight picker on outside click
  useEffect(() => {
    if (!hlOpen) return
    function h(e: MouseEvent) {
      if (hlRef.current && !hlRef.current.contains(e.target as Node)) setHlOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [hlOpen])

  const editor = useEditor({ // eslint-disable-line @typescript-eslint/no-use-before-define
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onCreate: ({ editor: e }) => { editorRef.current = e },
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
    editorProps: {
      attributes: { spellcheck: 'false' },
      handleKeyDown: (_view, event): boolean => {
        if (event.key !== 'Tab') return false
        event.preventDefault()
        if (structuralRef.current) {
          if (event.shiftKey) {
            editorRef.current?.commands.command(({ tr, state }: { tr: import('@tiptap/pm/state').Transaction; state: import('@tiptap/pm/state').EditorState }): boolean => {
              const { from } = state.selection
              const lineStart = state.doc.resolve(from).start()
              const lineText  = state.doc.textBetween(lineStart, from, '\n', '\0')
              if (lineText.startsWith('    ')) { tr.delete(lineStart, lineStart + 4); return true }
              return false
            })
          } else {
            editorRef.current?.commands.insertContent('    ')
          }
          return true
        }
        if (editorRef.current?.isActive('listItem')) {
          return event.shiftKey
            ? editorRef.current.commands.liftListItem('listItem')
            : editorRef.current.commands.sinkListItem('listItem')
        }
        return false
      },
    },
  })

  // Sync external value changes (e.g., AI generation)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '')
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const isEmpty = !value || value === '<p></p>' || value.trim() === ''

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Toolbar ── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '2px',
        flexWrap:       'wrap',
        padding:        '0.35rem 0.5rem',
        background:     'var(--surface)',
        border:         `1px solid ${focused ? `${moduleColor}50` : 'var(--border)'}`,
        borderBottom:   'none',
        borderRadius:   '8px 8px 0 0',
        transition:     'border-color 0.15s',
      }}>
        {/* Text style */}
        <Btn active={editor.isActive('bold')}          onClick={() => editor.chain().focus().toggleBold().run()}          title="Negrito (⌘B)"><strong>B</strong></Btn>
        <Btn active={editor.isActive('italic')}        onClick={() => editor.chain().focus().toggleItalic().run()}        title="Itálico (⌘I)"><em>I</em></Btn>
        <Btn active={editor.isActive('underline')}     onClick={() => editor.chain().focus().toggleUnderline().run()}     title="Sublinhado (⌘U)"><u>U</u></Btn>
        <Btn active={editor.isActive('strike')}        onClick={() => editor.chain().focus().toggleStrike().run()}        title="Tachado"><s>S</s></Btn>

        <Sep />

        {/* Highlight */}
        <div ref={hlRef} style={{ position: 'relative' }}>
          <Btn active={hlOpen || editor.isActive('highlight')} onClick={() => setHlOpen(o => !o)} title="Destaque">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <span style={{
                width: '12px', height: '12px', borderRadius: '2px',
                background: editor.isActive('highlight') ? (editor.getAttributes('highlight').color ?? '#FEF3C7') : '#FEF3C7',
                border: '1px solid rgba(0,0,0,0.1)',
              }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>▾</span>
            </span>
          </Btn>
          {hlOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
              background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px',
              padding: '0.35rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '112px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              {HL_COLORS.map(h => (
                <button
                  key={h.color}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault()
                    editor.chain().focus().toggleHighlight({ color: h.color }).run()
                    setHlOpen(false)
                  }}
                  title={h.label}
                  style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: h.color, cursor: 'pointer' }}
                />
              ))}
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setHlOpen(false) }}
                title="Remover destaque"
                style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)' }}
              >✕</button>
            </div>
          )}
        </div>

        <Sep />

        {/* Lists */}
        <Btn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Lista">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numeração">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" strokeLinecap="round"/><path d="M4 10h2" strokeLinecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round"/></svg>
        </Btn>

        <Sep />

        {/* Indent / outdent — list items */}
        <Btn active={false} onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Recuar (Tab)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 8 17 12 13 16"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="3" y1="6" x2="3" y2="18"/></svg>
        </Btn>
        <Btn active={false} onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Avançar recuo (Shift+Tab)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="11 8 7 12 11 16"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="21" y1="6" x2="21" y2="18"/></svg>
        </Btn>

        <Sep />

        {/* Blockquote */}
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </Btn>

        <Sep />

        {/* Structural mode */}
        <Btn
          active={structuralMode}
          onClick={() => setStructuralMode(m => !m)}
          title="Modo Estrutural — recuo livre com Tab"
        >
          <span style={{ fontSize: '0.67rem', fontFamily: 'monospace', letterSpacing: '-0.02em', fontWeight: 600 }}>
            {structuralMode ? 'EST ●' : 'EST'}
          </span>
        </Btn>
      </div>

      {/* ── Editor area ── */}
      <div style={{ position: 'relative' }}>
        {isEmpty && (
          <div style={{
            position: 'absolute', top: '1rem', left: '1.1rem',
            pointerEvents: 'none', color: 'var(--text-muted)',
            fontSize: structuralMode ? '0.82rem' : '0.9rem',
            fontFamily: structuralMode ? 'monospace' : 'var(--font-serif)',
            opacity: 0.5, userSelect: 'none',
          }}>
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
        `}</style>

        <div
          className={`rich-editor${structuralMode ? ' structural' : ''}`}
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
