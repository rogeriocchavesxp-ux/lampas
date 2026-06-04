'use client'

import { useState, useRef, useEffect } from 'react'
import type { CardHelp } from '@/lib/card-help'

interface Props {
  help: CardHelp
}

export default function CardHelpTooltip({ help }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef         = useRef<HTMLDivElement>(null)
  const showTimer       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer       = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function scheduleShow() {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    showTimer.current = setTimeout(() => setOpen(true), 260)
  }

  function scheduleHide() {
    if (showTimer.current) clearTimeout(showTimer.current)
    hideTimer.current = setTimeout(() => setOpen(false), 200)
  }

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (showTimer.current) clearTimeout(showTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setOpen(o => !o)
  }

  return (
    <div
      ref={wrapRef}
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <button
        onClick={toggle}
        title="Ajuda sobre este campo"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 0 0 0.3rem', lineHeight: 1,
          color: open ? 'var(--accent)' : 'var(--text-muted)',
          fontSize: '0.68rem', fontWeight: 700,
          opacity: open ? 1 : 0.4,
          transition: 'opacity 0.12s, color 0.12s',
          display: 'inline-flex', alignItems: 'center',
          fontFamily: 'inherit',
        }}
      >
        ⓘ
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9990,
          width: '272px',
          background: '#0F172A',
          borderRadius: '10px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
          padding: '0.85rem',
          animation: 'fadeIn 0.12s ease-out',
        }}>
          <div style={{
            position: 'absolute', top: '-5px', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '5px solid #0F172A',
          }} />

          {[
            { label: 'O que é?',                    text: help.whatIs },
            { label: 'Por que é importante?',       text: help.whyMatters },
            { label: 'Como influencia a mensagem?', text: help.howInfluences },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? '0.65rem' : 0 }}>
              <div style={{
                fontSize: '0.59rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)',
                marginBottom: '0.18rem',
              }}>
                {item.label}
              </div>
              <p style={{
                margin: 0, fontSize: '0.77rem',
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.55,
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
