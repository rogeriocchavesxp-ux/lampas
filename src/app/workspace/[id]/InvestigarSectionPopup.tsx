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

const POPUP_W = 560
const POPUP_H = 580

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
  const posRef = useRef({
    x: initialX ?? Math.max(40, (window.innerWidth - POPUP_W) / 2),
    y: initialY ?? 80,
  })
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
      const x = Math.max(0, Math.min(window.innerWidth - POPUP_W, e.clientX - dragOffset.current.x))
      const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y))
      posRef.current = { x, y }
      setPos({ x, y })
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const accentColor = sectionDef.slug.includes('contextual')
    ? '#0EA5E9'
    : sectionDef.slug.includes('textual')
    ? '#8B5CF6'
    : '#F59E0B'

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: `${POPUP_W}px`,
        height: `${POPUP_H}px`,
        zIndex: 4200,
        background: 'var(--background)',
        border: `1px solid ${accentColor}40`,
        borderTop: `3px solid ${accentColor}`,
        borderRadius: '10px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
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
          cursor: 'grab',
          flexShrink: 0,
          background: `${accentColor}06`,
          userSelect: 'none',
        }}
      >
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: accentColor,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {sectionDef.shortTitle}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '0.2rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
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
        />
      </div>
    </div>
  )
}
