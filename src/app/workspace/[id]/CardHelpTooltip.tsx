'use client'

import { useState, useRef, useEffect } from 'react'
import type { CardHelp } from '@/lib/card-help'

interface Props {
  help: CardHelp
}

export default function CardHelpTooltip({ help }: Props) {
  const [open, setOpen]     = useState(false)
  const wrapRef             = useRef<HTMLDivElement>(null)
  const showTimer           = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer           = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasExtended = Boolean(help.questions?.length || help.example)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
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

  const sections = [
    { label: 'O que é?',                    text: help.whatIs },
    { label: 'Para que serve?',             text: help.whyMatters },
    { label: 'Como influencia a mensagem?', text: help.howInfluences },
  ]

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
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9990,
            width: hasExtended ? '320px' : '272px',
            maxHeight: '420px',
            overflowY: 'auto',
            background: '#0F172A',
            borderRadius: '10px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)',
            padding: '0.85rem',
            animation: 'fadeIn 0.12s ease-out',
          }}
        >
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '-5px', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '5px solid #0F172A',
          }} />

          {/* Sections 1-3: O que é, Para que serve, Como influencia */}
          {sections.map((item, i) => (
            <div key={i} style={{ marginBottom: '0.65rem' }}>
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

          {/* Section 4: Perguntas que ajudam */}
          {help.questions && help.questions.length > 0 && (
            <div style={{ marginBottom: '0.65rem' }}>
              <div style={{
                fontSize: '0.59rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)',
                marginBottom: '0.4rem',
              }}>
                Perguntas que ajudam
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.3rem' }}>
                {help.questions.map((q, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '0.6rem', marginTop: '0.25rem', flexShrink: 0 }}>›</span>
                    <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 5: Exemplo preenchido */}
          {help.example && (
            <div>
              <div style={{
                fontSize: '0.59rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)',
                marginBottom: '0.4rem',
              }}>
                Exemplo
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: '2px solid var(--accent)',
                borderRadius: '6px',
                padding: '0.6rem 0.7rem',
                fontSize: '0.74rem',
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
              }}>
                {help.example}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
