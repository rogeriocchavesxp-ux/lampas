'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { SectionResearchGuide } from '@/lib/research-guides'

interface Props {
  guide: SectionResearchGuide
  onAskAI: (prompt: string) => void
  accentColor?: string
}

export default function ResearchGuidePanel({ guide, onAskAI, accentColor = 'var(--accent)' }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      marginBottom: '2rem',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      overflow: 'hidden',
      background: 'var(--surface)',
    }}>

      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.65rem 1rem', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <ChevronDown
          size={12}
          style={{
            color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.15s',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        />
        <span style={{ fontSize: '0.65rem', lineHeight: 1 }}>📚</span>
        <span style={{
          fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          Onde pesquisar
        </span>
        {!open && (
          <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.5 }}>
            — {guide.steps.length} etapas · fontes recomendadas
          </span>
        )}
      </button>

      {open && (
        <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border-subtle)' }}>

          {/* Prerequisites */}
          {guide.prerequisites && guide.prerequisites.length > 0 && (
            <div style={{ marginTop: '0.9rem', marginBottom: '0.9rem' }}>
              <div style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--text-muted)',
                marginBottom: '0.4rem',
              }}>
                Antes de preencher, confirme:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {guide.prerequisites.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.7rem', color: accentColor, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          <div style={{ marginTop: guide.prerequisites ? '0' : '0.9rem' }}>
            {!guide.prerequisites && (
              <div style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--text-muted)',
                marginBottom: '0.5rem',
              }}>
                Ordem recomendada
              </div>
            )}
            <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {guide.steps.map((step, i) => (
                <li key={i} style={{
                  fontSize: '0.8rem', color: 'var(--text-secondary)',
                  lineHeight: 1.55, paddingLeft: '0.2rem',
                }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Sources */}
          {guide.sources && guide.sources.length > 0 && (
            <div style={{
              marginTop: '1rem', paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--text-muted)',
                marginBottom: '0.55rem',
              }}>
                Fontes recomendadas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {guide.sources.map((src, i) => (
                  <div key={i}>
                    <div style={{
                      fontSize: '0.67rem', fontWeight: 600, color: 'var(--text-muted)',
                      marginBottom: '0.2rem', letterSpacing: '0.02em',
                    }}>
                      {src.category}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {src.items.map((item, j) => (
                        <span key={j} style={{
                          fontSize: '0.71rem', color: 'var(--text-secondary)',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '5px', padding: '0.1rem 0.5rem',
                          lineHeight: 1.5,
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI button */}
          <button
            onClick={() => { onAskAI(guide.aiPrompt); setOpen(false) }}
            style={{
              marginTop: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'transparent',
              border: `1px solid ${accentColor}40`,
              color: accentColor,
              borderRadius: '7px', padding: '0.4rem 0.85rem',
              fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${accentColor}10`
              e.currentTarget.style.borderColor = accentColor
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = `${accentColor}40`
            }}
          >
            ✦ Como pesquisar esta etapa?
          </button>
        </div>
      )}
    </div>
  )
}
