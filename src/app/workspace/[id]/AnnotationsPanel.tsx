'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Annotation {
  id: string
  context: string
  text: string
  createdAt: string
}

interface Props {
  projectId: string
  onClose: () => void
}

function loadAnnotations(projectId: string): Annotation[] {
  try {
    const raw = localStorage.getItem(`lampas_ann_${projectId}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveAnnotations(projectId: string, list: Annotation[]) {
  try { localStorage.setItem(`lampas_ann_${projectId}`, JSON.stringify(list)) } catch {}
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function AnnotationsPanel({ projectId, onClose }: Props) {
  const [tab, setTab] = useState<'nova' | 'lista'>('nova')
  const [annotations, setAnnotations] = useState<Annotation[]>(() => loadAnnotations(projectId))
  const [context, setContext] = useState('')
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  // Draggable
  const panelRef = useRef<HTMLDivElement>(null)
  const posRef   = useRef({ x: window.innerWidth - 360, y: 80 })
  const [pos, setPos] = useState(posRef.current)
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragging.current = true
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    }
    e.preventDefault()
  }, [])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      const x = Math.max(0, Math.min(window.innerWidth  - 320, e.clientX - dragOffset.current.x))
      const y = Math.max(0, Math.min(window.innerHeight - 60,  e.clientY - dragOffset.current.y))
      posRef.current = { x, y }
      setPos({ x, y })
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  function handleSave() {
    if (!text.trim()) return
    const ann: Annotation = {
      id: Math.random().toString(36).slice(2),
      context: context.trim(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    const next = [ann, ...annotations]
    setAnnotations(next)
    saveAnnotations(projectId, next)
    setText('')
    setContext('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function handleDelete(id: string) {
    const next = annotations.filter(a => a.id !== id)
    setAnnotations(next)
    saveAnnotations(projectId, next)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--surface-2)', border: '1px solid var(--border)',
    borderRadius: '7px', color: 'var(--text-primary)',
    fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit',
    padding: '0.52rem 0.65rem', resize: 'none',
    transition: 'border-color 0.13s',
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: pos.x, top: pos.y,
        width: 320,
        zIndex: 5000,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Header — drag handle */}
      <div
        onMouseDown={onHeaderMouseDown}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.55rem 0.65rem 0.55rem 0.85rem',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'grab',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
          <span style={{ fontSize: '0.8rem' }}>📝</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Anotações
          </span>
          {annotations.length > 0 && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 700,
              background: 'var(--accent)', color: '#fff',
              borderRadius: '99px', padding: '0 0.35rem', lineHeight: '1.5',
            }}>
              {annotations.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1,
            padding: '0.1rem 0.25rem', borderRadius: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
        >✕</button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
      }}>
        {(['nova', 'lista'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, border: 'none', background: 'transparent',
            padding: '0.45rem 0', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.76rem', fontWeight: tab === t ? 700 : 500,
            color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.13s',
          }}>
            {t === 'nova' ? 'Nova' : `Ver todas${annotations.length ? ` (${annotations.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380, userSelect: 'text' }}>

        {/* ── Nova anotação ── */}
        {tab === 'nova' && (
          <div style={{ padding: '0.85rem 0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.69rem', color: 'var(--text-muted)', marginBottom: '0.28rem', fontWeight: 600, letterSpacing: '0.03em' }}>
                Contexto (versículo, seção, ideia...)
              </label>
              <input
                type="text"
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="Ex: Mt 7:24 · Introdução · Ponto 2"
                style={{ ...inputStyle }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.69rem', color: 'var(--text-muted)', marginBottom: '0.28rem', fontWeight: 600, letterSpacing: '0.03em' }}>
                Insight
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Escreva sua ideia, ilustração ou insight..."
                rows={5}
                style={{ ...inputStyle }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave() }}
              />
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>⌘ Enter para salvar</div>
            </div>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              style={{
                width: '100%', padding: '0.52rem', border: 'none',
                borderRadius: '7px', fontSize: '0.82rem', fontWeight: 650,
                cursor: text.trim() ? 'pointer' : 'default', fontFamily: 'inherit',
                background: saved ? '#16a34a' : (text.trim() ? 'var(--accent)' : 'var(--surface-2)'),
                color: text.trim() ? '#fff' : 'var(--text-muted)',
                transition: 'background 0.15s',
              }}
            >
              {saved ? '✓ Salvo' : 'Salvar anotação'}
            </button>
          </div>
        )}

        {/* ── Ver todas ── */}
        {tab === 'lista' && (
          <div style={{ padding: '0.55rem 0' }}>
            {annotations.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                color: 'var(--text-muted)', fontSize: '0.8rem',
              }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem', opacity: 0.4 }}>📝</div>
                Nenhuma anotação ainda.<br />
                <span style={{ fontSize: '0.74rem' }}>Crie sua primeira na aba "Nova".</span>
              </div>
            ) : (
              annotations.map(a => (
                <div key={a.id} style={{
                  margin: '0 0.6rem 0.5rem',
                  padding: '0.65rem 0.75rem',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  position: 'relative',
                }}>
                  {/* Context tag */}
                  {a.context && (
                    <div style={{
                      display: 'inline-block',
                      fontSize: '0.64rem', fontWeight: 700,
                      background: 'rgba(30,77,140,0.08)', color: 'var(--accent)',
                      borderRadius: '4px', padding: '0.1rem 0.38rem',
                      marginBottom: '0.38rem',
                      letterSpacing: '0.01em',
                    }}>
                      {a.context}
                    </div>
                  )}
                  {/* Text */}
                  <p style={{
                    margin: 0, fontSize: '0.8rem', lineHeight: 1.55,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {a.text}
                  </p>
                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {formatDate(a.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDelete(a.id)}
                      title="Excluir anotação"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0 0.15rem',
                        lineHeight: 1, borderRadius: '3px',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
