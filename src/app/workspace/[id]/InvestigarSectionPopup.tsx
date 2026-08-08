'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import WorkspaceDocument from './WorkspaceDocument'
import { X } from 'lucide-react'

interface Props {
  sectionDef: SectionDef
  existingSection: Section | undefined
  project: Project
  userId: string
  initialX?: number
  initialY?: number
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  onClose: () => void
}

const DEFAULT_W = 560
const DEFAULT_H = 580
const MIN_W = 360
const MIN_H = 320

export default function InvestigarSectionPopup({
  sectionDef,
  existingSection,
  project,
  userId,
  initialX,
  initialY,
  onUpdate,
  onAskAI,
  onClose,
}: Props) {
  const [maximized, setMaximized] = useState(false)

  const posRef = useRef({
    x: initialX ?? Math.max(40, (window.innerWidth - DEFAULT_W) / 2),
    y: initialY ?? 80,
  })
  const sizeRef = useRef({ w: DEFAULT_W, h: DEFAULT_H })
  const [pos,  setPos]  = useState(posRef.current)
  const [size, setSize] = useState(sizeRef.current)

  // ── Drag ────────────────────────────────────────────────────────────────
  const dragging    = useRef(false)
  const dragOffset  = useRef({ x: 0, y: 0 })

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized) return
    if ((e.target as HTMLElement).closest('button')) return
    dragging.current = true
    dragOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    }
    e.preventDefault()
  }, [maximized])

  // ── Resize ───────────────────────────────────────────────────────────────
  const resizing   = useRef(false)
  const resizeStart = useRef({ x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H })

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized) return
    e.preventDefault()
    e.stopPropagation()
    resizing.current = true
    resizeStart.current = { x: e.clientX, y: e.clientY, w: sizeRef.current.w, h: sizeRef.current.h }
  }, [maximized])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (dragging.current) {
        const x = Math.max(0, Math.min(window.innerWidth  - sizeRef.current.w, e.clientX - dragOffset.current.x))
        const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y))
        posRef.current = { x, y }
        setPos({ x, y })
      }
      if (resizing.current) {
        const dx = e.clientX - resizeStart.current.x
        const dy = e.clientY - resizeStart.current.y
        const w = Math.max(MIN_W, resizeStart.current.w + dx)
        const h = Math.max(MIN_H, resizeStart.current.h + dy)
        sizeRef.current = { w, h }
        setSize({ w, h })
      }
    }
    function onUp() {
      dragging.current  = false
      resizing.current  = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  const accentColor = sectionDef.slug.includes('contextual')
    ? '#0EA5E9'
    : sectionDef.slug.includes('textual')
    ? '#8B5CF6'
    : '#F59E0B'

  const containerStyle: React.CSSProperties = maximized
    ? {
        position: 'fixed', inset: 0,
        borderRadius: 0, boxShadow: 'none',
      }
    : {
        position: 'fixed',
        left: pos.x, top: pos.y,
        width: `${size.w}px`, height: `${size.h}px`,
        borderRadius: '10px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }

  return (
    <div
      style={{
        ...containerStyle,
        zIndex: 4200,
        background: 'var(--background)',
        border: maximized ? 'none' : `1px solid ${accentColor}40`,
        borderTop: `3px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onMouseDown={onHeaderMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem 0.5rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: maximized ? 'default' : 'grab',
          flexShrink: 0,
          background: `${accentColor}06`,
          userSelect: 'none',
        }}
      >
        <span style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: accentColor, letterSpacing: '0.05em',
          textTransform: 'uppercase', flex: 1,
        }}>
          {sectionDef.shortTitle}
        </span>

        {/* Maximize / restore */}
        <button
          onClick={() => setMaximized(v => !v)}
          title={maximized ? 'Restaurar janela' : 'Maximizar'}
          style={{
            width: 26, height: 26,
            border: '1px solid var(--border)',
            background: 'transparent', borderRadius: '5px',
            cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {maximized ? '⊡' : '⊞'}
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          title="Fechar"
          style={{
            width: 26, height: 26,
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'var(--text-muted)',
            padding: 0, borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <WorkspaceDocument
          blocks={[{ sectionDef, existingSection }]}
          project={project}
          userId={userId}
          onUpdate={onUpdate}
          onAskAI={onAskAI}
          guided={false}
          initialSlug={sectionDef.slug}
          toolbarTop="0"
        />
      </div>

      {/* Resize handle — bottom-right corner */}
      {!maximized && (
        <div
          onMouseDown={onResizeMouseDown}
          title="Redimensionar"
          style={{
            position: 'absolute', right: 0, bottom: 0,
            width: 18, height: 18,
            cursor: 'nwse-resize',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
            padding: '3px',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9 1L1 9M9 5L5 9M9 9" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}
