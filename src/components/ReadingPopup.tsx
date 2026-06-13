'use client'

import { useEffect, useRef } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface Props {
  title: string
  html: string
  onClose: () => void
  onEdit?: () => void
  moduleColor?: string
}

function normalizeHtml(value: string): string {
  try {
    const txt = new DOMParser().parseFromString(value, 'text/html').body.innerHTML
    return txt || value
  } catch { return value }
}

function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

export default function ReadingPopup({ title, html, onClose, onEdit, moduleColor = 'var(--accent)' }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const isHtml = isHtmlContent(html)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>${title}</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; font-size: 15pt; line-height: 1.75; margin: 2.5cm; color: #1a1a1a; }
        h1,h2,h3 { font-weight: 700; margin: 1em 0 0.4em; }
        p { margin: 0 0 0.9em; }
        blockquote { border-left: 3px solid #ccc; margin: 0 0 0.9em 0; padding: 0.5em 1em; color: #555; }
        ul,ol { margin: 0 0 0.9em 1.2em; }
        li { margin-bottom: 0.3em; }
        code { font-family: monospace; background: #f5f5f5; padding: 0.1em 0.3em; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 0.8em 1em; border-radius: 6px; overflow: auto; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 0.9em; }
        td,th { border: 1px solid #ccc; padding: 0.4em 0.7em; }
        a { color: inherit; }
        @media print { body { margin: 2cm; } }
      </style>
    </head><body>
      <h1 style="font-size:1.5em;margin-bottom:1.5em;border-bottom:1px solid #ddd;padding-bottom:0.5em;">${title}</h1>
      ${html}
    </body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '900px', maxHeight: '82vh',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInScale 0.18s ease-out',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #F1F5F9',
          flexShrink: 0,
        }}>
          <span style={{
            flex: 1, fontSize: '1rem', fontWeight: 700,
            color: '#0F172A', letterSpacing: '-0.015em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </span>

          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
            {onEdit && (
              <button
                onClick={onEdit}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  background: moduleColor + '12', border: `1px solid ${moduleColor}30`,
                  borderRadius: '8px', padding: '0.38rem 0.75rem',
                  fontSize: '0.78rem', fontWeight: 600, color: moduleColor,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = moduleColor + '20' }}
                onMouseLeave={e => { e.currentTarget.style.background = moduleColor + '12' }}
              >
                ✏️ Editar
              </button>
            )}

            <button
              onClick={handlePrint}
              title="Imprimir / Exportar PDF"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'transparent', border: '1px solid #E2E8F0',
                borderRadius: '8px', padding: '0.38rem 0.75rem',
                fontSize: '0.78rem', fontWeight: 500, color: '#64748B',
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#334155' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
            >
              🖨 Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              title="Fechar (Esc)"
              style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid #E2E8F0',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '1rem', color: '#94A3B8',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#475569' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Reading content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '3rem 4rem',
        }}>
          {html.trim() ? (
            isHtml ? (
              <div
                className="reading-popup-content"
                dangerouslySetInnerHTML={{ __html: normalizeHtml(html) }}
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: '1.05rem',
                  lineHeight: 1.82,
                  color: '#1a2030',
                  maxWidth: '680px',
                  margin: '0 auto',
                }}
              />
            ) : (
              <div style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: '1.05rem',
                lineHeight: 1.82,
                maxWidth: '680px',
                margin: '0 auto',
              }}>
                <MarkdownRenderer content={html} moduleColor={moduleColor} />
              </div>
            )
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '200px', gap: '0.75rem',
            }}>
              <span style={{ fontSize: '2rem', opacity: 0.25 }}>📄</span>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', textAlign: 'center' }}>
                Este campo ainda não possui conteúdo.
              </p>
              {onEdit && (
                <button
                  onClick={onEdit}
                  style={{
                    background: moduleColor, color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '0.5rem 1.25rem',
                    fontSize: '0.82rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Começar a escrever
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .reading-popup-content p { margin: 0 0 1.1em; }
        .reading-popup-content h1 { font-size: 1.55em; font-weight: 700; margin: 1.4em 0 0.5em; }
        .reading-popup-content h2 { font-size: 1.3em; font-weight: 700; margin: 1.3em 0 0.45em; }
        .reading-popup-content h3 { font-size: 1.12em; font-weight: 700; margin: 1.2em 0 0.4em; }
        .reading-popup-content h4,
        .reading-popup-content h5,
        .reading-popup-content h6 { font-size: 1em; font-weight: 700; margin: 1em 0 0.35em; }
        .reading-popup-content ul,
        .reading-popup-content ol { margin: 0 0 1em 1.5em; }
        .reading-popup-content li { margin-bottom: 0.35em; }
        .reading-popup-content blockquote {
          border-left: 3px solid #CBD5E1;
          margin: 1em 0;
          padding: 0.6em 1.2em;
          color: #475569;
          font-style: italic;
          background: #F8FAFC;
          border-radius: 0 6px 6px 0;
        }
        .reading-popup-content code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.88em;
          background: #F1F5F9;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          color: #1E293B;
        }
        .reading-popup-content pre {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 1em 1.2em;
          margin: 0 0 1em;
          overflow-x: auto;
        }
        .reading-popup-content pre code { background: none; padding: 0; }
        .reading-popup-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 0 0 1em;
          font-size: 0.95em;
        }
        .reading-popup-content td,
        .reading-popup-content th {
          border: 1px solid #E2E8F0;
          padding: 0.45em 0.8em;
        }
        .reading-popup-content th { background: #F8FAFC; font-weight: 700; }
        .reading-popup-content a { color: #2563EB; text-decoration: underline; }
        .reading-popup-content strong { font-weight: 700; }
        .reading-popup-content em { font-style: italic; }
        .reading-popup-content hr {
          border: none;
          border-top: 1px solid #E2E8F0;
          margin: 1.5em 0;
        }
        .reading-popup-content ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .reading-popup-content ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
        .reading-popup-content ul[data-type="taskList"] input[type="checkbox"] { margin-top: 0.2em; }
      `}</style>
    </div>
  )
}
