'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Minus, Square, X, Minimize2, Maximize2, Sparkles, ChevronDown } from 'lucide-react'
import RichEditor from '@/components/RichEditor'
import type { InsertMenuItem } from '@/components/RichEditor'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FloatWin {
  id: string
  nodeKey: string
  nodeLabel: string
  nodeIcon: string
  nodeColor: string
  nodeBg: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
}

interface Props extends FloatWin {
  projectId: string
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onPositionChange: (x: number, y: number) => void
  onSizeChange: (w: number, h: number) => void
  onAskAI: (prompt: string) => void
}

const MIN_W = 320
const MIN_H = 240

// ── Component ─────────────────────────────────────────────────────────────────

export default function NodeFloatingWindow({
  nodeKey, nodeLabel, nodeIcon, nodeColor, nodeBg,
  projectId, x, y, width, height, minimized, maximized, zIndex,
  onClose, onMinimize, onMaximize, onFocus,
  onPositionChange, onSizeChange, onAskAI,
}: Props) {
  const STORAGE_KEY = `vg_doc_${projectId}_${nodeKey}`

  const [content, setContent] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? '' } catch { return '' }
  })
  const [aiMenuOpen, setAiMenuOpen] = useState(false)
  const [controlsHovered, setControlsHovered] = useState(false)
  const aiMenuRef = useRef<HTMLDivElement>(null)
  const posRef    = useRef({ x, y })
  const sizeRef   = useRef({ w: width, h: height })

  useEffect(() => { posRef.current  = { x, y }           }, [x, y])
  useEffect(() => { sizeRef.current = { w: width, h: height } }, [width, height])

  // Close AI menu on outside click
  useEffect(() => {
    if (!aiMenuOpen) return
    function h(e: MouseEvent) {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target as Node)) setAiMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [aiMenuOpen])

  function handleContentChange(html: string) {
    setContent(html)
    try { localStorage.setItem(STORAGE_KEY, html) } catch {}
  }

  // Drag
  const startDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (maximized) return
    e.preventDefault()
    const startX = e.clientX, startY = e.clientY
    const origX = posRef.current.x, origY = posRef.current.y

    function onMove(ev: MouseEvent) {
      const nx = Math.max(0, origX + ev.clientX - startX)
      const ny = Math.max(0, origY + ev.clientY - startY)
      posRef.current = { x: nx, y: ny }
      onPositionChange(nx, ny)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [maximized, onPositionChange])

  // Resize
  const startResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (maximized) return
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX, startY = e.clientY
    const origW = sizeRef.current.w, origH = sizeRef.current.h

    function onMove(ev: MouseEvent) {
      const nw = Math.max(MIN_W, origW + ev.clientX - startX)
      const nh = Math.max(MIN_H, origH + ev.clientY - startY)
      sizeRef.current = { w: nw, h: nh }
      onSizeChange(nw, nh)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [maximized, onSizeChange])

  const insertMenu: InsertMenuItem[] = [
    { icon: '📖', label: 'Referência Bíblica',  snippet: '<em>Ref.: </em>'  },
    { icon: '📜', label: 'Texto Bíblico',        snippet: '<blockquote><em>Texto: </em></blockquote>' },
    { icon: '🔤', label: 'Termo Original',       snippet: '<strong>Termo: </strong><em>(transliteração)</em>' },
    { icon: '📚', label: 'Estudo Lexical',        snippet: '<p><strong>Léxico:</strong></p><p>• Significado: </p><p>• Raiz: </p><p>• Ocorrências: </p>' },
  ]

  function sendToAI(action: string) {
    const text = content.replace(/<[^>]+>/g, '').trim()
    const base = text ? `\n\nConteúdo atual:\n${text}` : ''
    const prompts: Record<string, string> = {
      organize:     `Reorganize e estruture o conteúdo do nó "${nodeLabel}"${base}`,
      summarize:    `Gere um resumo conciso do estudo sobre "${nodeLabel}"${base}`,
      synthesize:   `Sintetize teologicamente o conteúdo sobre "${nodeLabel}"${base}`,
      applications: `Com base no estudo sobre "${nodeLabel}", gere aplicações práticas${base}`,
      relate:       `Identifique conexões entre o nó "${nodeLabel}" e os outros nós do mapa mental${base}`,
    }
    onAskAI(prompts[action] ?? prompts.organize)
    setAiMenuOpen(false)
  }

  const windowStyle: React.CSSProperties = maximized
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: '52px', zIndex, borderRadius: 0 }
    : minimized
    ? { position: 'fixed', left: `${x}px`, top: `${y}px`, width: `${width}px`, zIndex }
    : { position: 'fixed', left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px`, zIndex }

  const titleBg = nodeBg || `${nodeColor}12`

  return (
    <div
      onMouseDown={onFocus}
      style={{
        ...windowStyle,
        background: 'var(--surface)',
        border: `1.5px solid ${nodeColor}30`,
        borderRadius: maximized ? 0 : '13px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.18), 0 3px 12px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Titlebar ── */}
      <div
        onMouseDown={startDrag}
        style={{
          height: '44px', flexShrink: 0,
          background: titleBg,
          borderBottom: `1px solid ${nodeColor}22`,
          display: 'flex', alignItems: 'center',
          padding: '0 12px', gap: '8px',
          cursor: maximized ? 'default' : 'grab',
          userSelect: 'none',
        }}
      >
        {/* Traffic-light controls */}
        <div
          onMouseDown={e => e.stopPropagation()}
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
        >
          <button onClick={onClose} title="Fechar"
            style={{ width: '13px', height: '13px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#FF5F57', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}
          >
            {controlsHovered && <X size={7} color="#7A0F00" strokeWidth={3} />}
          </button>
          <button onClick={onMinimize} title={minimized ? 'Restaurar' : 'Minimizar'}
            style={{ width: '13px', height: '13px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#FFBD2E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}
          >
            {controlsHovered && <Minus size={7} color="#7A4E00" strokeWidth={3} />}
          </button>
          <button onClick={onMaximize} title={maximized ? 'Restaurar' : 'Maximizar'}
            style={{ width: '13px', height: '13px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#28C941', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}
          >
            {controlsHovered && (maximized
              ? <Minimize2 size={7} color="#0A5A1E" strokeWidth={3} />
              : <Square size={7} color="#0A5A1E" strokeWidth={3} />
            )}
          </button>
        </div>

        {/* Title */}
        <span style={{ fontSize: '0.95rem', lineHeight: 1, flexShrink: 0 }}>{nodeIcon}</span>
        <span style={{
          fontSize: '0.78rem', fontWeight: 700, color: nodeColor,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
        }}>
          {nodeLabel}
        </span>
        <span style={{
          fontSize: '0.57rem', color: `${nodeColor}80`, fontWeight: 600,
          flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          documento
        </span>
      </div>

      {/* ── Content (hidden when minimized) ── */}
      {!minimized && (
        <>
          {/* AI actions bar */}
          <div style={{
            flexShrink: 0, padding: '5px 10px',
            borderBottom: `1px solid ${nodeColor}14`,
            background: `${titleBg}90`,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div ref={aiMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setAiMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: aiMenuOpen ? nodeColor : 'transparent',
                  border: `1px solid ${nodeColor}45`,
                  borderRadius: '6px', padding: '3px 8px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.68rem', fontWeight: 600,
                  color: aiMenuOpen ? '#fff' : nodeColor,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (!aiMenuOpen) { e.currentTarget.style.background = `${nodeColor}12` } }}
                onMouseLeave={e => { if (!aiMenuOpen) { e.currentTarget.style.background = 'transparent' } }}
              >
                <Sparkles size={10} strokeWidth={1.75} />
                IA
                <ChevronDown size={8} strokeWidth={2.5} style={{ opacity: 0.7 }} />
              </button>

              {aiMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '9px', boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                  minWidth: '190px', overflow: 'hidden', zIndex: 10,
                }}>
                  {([
                    { action: 'organize',     label: 'Organizar com IA', icon: '⚡' },
                    { action: 'summarize',    label: 'Gerar resumo',      icon: '📋' },
                    { action: 'synthesize',   label: 'Gerar síntese',     icon: '🔭' },
                    { action: 'applications', label: 'Gerar aplicações',  icon: '🎯' },
                    { action: 'relate',       label: 'Relacionar nós',    icon: '🔗' },
                  ] as const).map((item, i) => (
                    <button
                      key={item.action}
                      onClick={() => sendToAI(item.action)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                        border: 'none', background: 'transparent',
                        padding: '0.5rem 0.8rem', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '0.75rem',
                        color: 'var(--text-primary)', textAlign: 'left',
                        borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: '16px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rich editor */}
          <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px' }}>
            <RichEditor
              value={content}
              onChange={handleContentChange}
              placeholder={`Desenvolva suas notas sobre ${nodeLabel}…`}
              moduleColor={nodeColor}
              minHeight={maximized ? 600 : Math.max(200, height - 170)}
              insertMenu={insertMenu}
            />
          </div>
        </>
      )}

      {/* SE resize handle */}
      {!maximized && !minimized && (
        <div
          onMouseDown={startResize}
          style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '22px', height: '22px',
            cursor: 'se-resize',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
            padding: '4px',
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M 1 8 L 8 8 L 8 1" stroke={`${nodeColor}50`} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  )
}
