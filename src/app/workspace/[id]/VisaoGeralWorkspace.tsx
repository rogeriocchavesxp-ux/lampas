'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import SectionWorkspace from './SectionWorkspace'
import { Sparkles, Map, List } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ClassType =
  | 'personagem' | 'lugar' | 'tema' | 'termo_chave' | 'conflito' | 'repeticao'
  | 'teologia' | 'tempo' | 'instituicao' | 'cargo' | 'objetivo' | 'comentario'
  | 'insight' | 'observacao'

interface Classification {
  id: string; type: ClassType; selectedText: string
  startVerse: number; endVerse: number
  note: string; createdAt: string
}

// ── Storage ───────────────────────────────────────────────────────────────────

function readCls(projectId: string): Classification[] {
  try { const r = localStorage.getItem(`lc_${projectId}`); return r ? JSON.parse(r) : [] } catch { return [] }
}

function dedup(arr: string[]): string[] { return [...new Set(arr.map(s => s.trim()).filter(Boolean))] }

// ── Canvas constants ──────────────────────────────────────────────────────────

const CW = 800
const CH = 520
const CX = 400
const CY = 260
const RADIUS = 195

// ── Node definitions ──────────────────────────────────────────────────────────

interface NodeDef {
  key: string; label: string; icon: string
  angle: number; color: string; dimColor: string
  getItems: (cls: Classification[], cards: Record<string, string>) => string[]
}

const NODE_DEFS: NodeDef[] = [
  {
    key: 'personagens', label: 'Personagens', icon: '👤',
    angle: -90, color: '#D97706', dimColor: '#D9780620',
    getItems: (cls) => dedup(
      cls.filter(c => c.type === 'personagem' || c.type === 'cargo').map(c => c.selectedText)
    ),
  },
  {
    key: 'lugares', label: 'Lugares', icon: '📍',
    angle: -38, color: '#10B981', dimColor: '#10B98120',
    getItems: (cls) => dedup(cls.filter(c => c.type === 'lugar').map(c => c.selectedText)),
  },
  {
    key: 'temas', label: 'Temas', icon: '📖',
    angle: 16, color: '#3B82F6', dimColor: '#3B82F620',
    getItems: (cls, cards) => dedup([
      ...cls.filter(c => c.type === 'tema').map(c => c.selectedText),
      ...(cards['preparar_tema_provavel']?.split('\n') ?? []),
    ]),
  },
  {
    key: 'termos', label: 'Termos-Chave', icon: '🔑',
    angle: 70, color: '#F97316', dimColor: '#F9731620',
    getItems: (cls) => dedup(
      cls.filter(c => c.type === 'termo_chave' || c.type === 'repeticao').map(c => c.selectedText)
    ),
  },
  {
    key: 'grande_ideia', label: 'Grande Ideia', icon: '💡',
    angle: 126, color: '#F59E0B', dimColor: '#F59E0B20',
    getItems: (_, cards) => {
      const v = cards['preparar_grande_ideia_inicial']?.trim()
      return v ? [v.length > 100 ? v.slice(0, 100) + '…' : v] : []
    },
  },
  {
    key: 'estrutura', label: 'Estrutura', icon: '⊞',
    angle: 172, color: '#6366F1', dimColor: '#6366F120',
    getItems: (_, cards) => {
      const v = cards['preparar_estrutura_percebida']?.trim()
      return v ? v.split('\n').filter(Boolean).slice(0, 5) : []
    },
  },
  {
    key: 'climax', label: 'Clímax', icon: '✦',
    angle: -150, color: '#8B5CF6', dimColor: '#8B5CF620',
    getItems: (cls, cards) => dedup([
      ...cls.filter(c => c.type === 'conflito').map(c => c.selectedText),
      ...(cards['preparar_climax']?.split('\n') ?? []),
    ]).slice(0, 4),
  },
  {
    key: 'movimento', label: 'Movimento', icon: '⟶',
    angle: -116, color: '#64748B', dimColor: '#64748B20',
    getItems: (_, cards) => {
      const v = cards['preparar_movimento_narrativo']?.trim()
      return v ? v.split('\n').filter(Boolean).slice(0, 3) : []
    },
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisaoGeralWorkspace({ sectionDef, project, userId, existingSection, onUpdate, onAskAI }: Props) {
  const [mode, setMode]             = useState<'visual' | 'structured'>('visual')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [cls, setCls]               = useState<Classification[]>([])
  const [containerW, setContainerW] = useState(CW)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCls(readCls(project.id))
    const id = setInterval(() => setCls(readCls(project.id)), 1500)
    return () => clearInterval(id)
  }, [project.id])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const cards = useMemo(
    () => (existingSection?.content as { cards?: Record<string, string> } | null)?.cards ?? {},
    [existingSection],
  )

  const nodes = useMemo(
    () => NODE_DEFS.map(d => ({ ...d, items: d.getItems(cls, cards) })),
    [cls, cards],
  )

  const totalItems = nodes.reduce((s, n) => s + n.items.length, 0)
  const scale      = Math.min(1, (containerW - 32) / CW)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.5rem 1.5rem 2rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
            Visão Geral · {project.book} {project.passage_ref}
          </h2>
          {mode === 'visual' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '3px 0 0', lineHeight: 1.4 }}>
              Mapa construído automaticamente pelas marcações do Texto Bíblico.{' '}
              {totalItems === 0 && <span style={{ color: '#D97706' }}>Marque palavras para começar.</span>}
            </p>
          )}
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2)', borderRadius: '8px', padding: '2px' }}>
          {(['visual', 'structured'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setExpanded(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: mode === m ? '#FFFFFF' : 'transparent',
                border: 'none', borderRadius: '6px',
                padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600,
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              {m === 'visual'
                ? <><Map size={12} strokeWidth={1.75} /> Mapa Visual</>
                : <><List size={12} strokeWidth={1.75} /> Estruturado</>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Structured mode */}
      {mode === 'structured' && (
        <SectionWorkspace
          sectionDef={sectionDef}
          project={project}
          userId={userId}
          existingSection={existingSection}
          onUpdate={onUpdate}
          onAskAI={onAskAI}
        />
      )}

      {/* Visual mode */}
      {mode === 'visual' && (
        <>
          {/* Canvas wrapper — scales down on narrow containers */}
          <div
            ref={containerRef}
            style={{ width: '100%', height: `${CH * scale}px`, position: 'relative', marginBottom: '1.25rem' }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: `${CW}px`, height: `${CH}px`,
              transform: `scale(${scale})`, transformOrigin: 'top left',
            }}>

              {/* SVG connections */}
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox={`0 0 ${CW} ${CH}`}
              >
                {nodes.map(node => {
                  const rad = (node.angle * Math.PI) / 180
                  const nx  = CX + RADIUS * Math.cos(rad)
                  const ny  = CY + RADIUS * Math.sin(rad)
                  const mx  = (CX + nx) / 2
                  const my  = (CY + ny) / 2
                  const active = node.items.length > 0
                  return (
                    <path
                      key={node.key}
                      d={`M ${CX} ${CY} Q ${mx + (ny - CY) * 0.15} ${my - (nx - CX) * 0.15} ${nx} ${ny}`}
                      stroke={active ? node.color + '70' : 'var(--border-subtle, #e2e8f0)'}
                      strokeWidth={active ? 1.5 : 1}
                      fill="none"
                      strokeDasharray={active ? 'none' : '5 4'}
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>

              {/* Center node */}
              <div style={{
                position: 'absolute',
                left: `${CX}px`, top: `${CY}px`,
                transform: 'translate(-50%, -50%)',
                background: '#FFFFFF',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                padding: '16px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)',
                minWidth: '160px',
                zIndex: 2,
                userSelect: 'none',
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>📖</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {project.book}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                  {project.passage_ref}
                </div>
                {totalItems > 0 && (
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '5px', opacity: 0.6 }}>
                    {totalItems} elemento{totalItems !== 1 ? 's' : ''} mapeado{totalItems !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Outer nodes */}
              {nodes.map(node => {
                const rad     = (node.angle * Math.PI) / 180
                const nx      = CX + RADIUS * Math.cos(rad)
                const ny      = CY + RADIUS * Math.sin(rad)
                const active  = node.items.length > 0
                const isExp   = expanded === node.key

                // Determine expansion direction based on quadrant
                const onRight  = nx > CX + 20
                const onBottom = ny > CY + 20

                return (
                  <div
                    key={node.key}
                    style={{ position: 'absolute', left: `${nx}px`, top: `${ny}px`, transform: 'translate(-50%, -50%)', zIndex: isExp ? 10 : 3 }}
                  >
                    {/* Node button */}
                    <button
                      onClick={() => setExpanded(isExp ? null : node.key)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: active ? '#FFFFFF' : 'var(--surface, #F8FAFC)',
                        border: `1.5px solid ${active ? node.color + '55' : 'var(--border, #E2E8F0)'}`,
                        borderRadius: '12px',
                        padding: '9px 15px',
                        cursor: 'pointer',
                        minWidth: '105px',
                        fontFamily: 'inherit',
                        boxShadow: active
                          ? `0 2px 14px ${node.color}18, 0 1px 3px rgba(0,0,0,0.06)`
                          : '0 1px 3px rgba(0,0,0,0.04)',
                        outline: isExp ? `2px solid ${node.color}50` : 'none',
                        outlineOffset: '2px',
                        transition: 'box-shadow 0.15s, transform 0.12s',
                        transform: isExp ? 'scale(1.03)' : 'scale(1)',
                      }}
                      onMouseEnter={e => { if (!isExp) e.currentTarget.style.transform = 'scale(1.04)' }}
                      onMouseLeave={e => { if (!isExp) e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      <span style={{ fontSize: '0.9rem', lineHeight: 1, marginBottom: '3px' }}>{node.icon}</span>
                      <span style={{
                        fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                        color: active ? node.color : 'var(--text-muted, #94A3B8)',
                      }}>
                        {node.label}
                      </span>
                      {active && (
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px', opacity: 0.75 }}>
                          {node.items.length}
                        </span>
                      )}
                    </button>

                    {/* Expanded dropdown */}
                    {isExp && active && (
                      <div style={{
                        position: 'absolute',
                        ...(onBottom
                          ? { bottom: '100%', marginBottom: '6px' }
                          : { top: '100%', marginTop: '6px' }),
                        ...(onRight
                          ? { right: 0 }
                          : { left: 0 }),
                        background: '#FFFFFF',
                        border: `1px solid ${node.color}30`,
                        borderRadius: '10px',
                        padding: '8px',
                        minWidth: '170px',
                        maxWidth: '240px',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)',
                        zIndex: 20,
                        animation: 'fadeIn 0.12s ease-out',
                      }}>
                        <div style={{
                          fontSize: '0.6rem', fontWeight: 700, color: node.color,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                          marginBottom: '6px', paddingBottom: '5px',
                          borderBottom: `1px solid ${node.color}20`,
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          {node.icon} {node.label}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          {node.items.map((item, i) => (
                            <div key={i} style={{
                              fontSize: '0.79rem',
                              color: 'var(--text-secondary)',
                              padding: '4px 6px',
                              borderRadius: '5px',
                              display: 'flex', alignItems: 'flex-start', gap: '6px',
                              background: i % 2 === 0 ? 'transparent' : node.dimColor,
                            }}>
                              <span style={{ color: node.color, fontSize: '0.55rem', marginTop: '4px', flexShrink: 0 }}>●</span>
                              <span style={{ fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', lineHeight: 1.4 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend / stats row */}
          {totalItems > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {nodes.filter(n => n.items.length > 0).map(n => (
                <span key={n.key} style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  background: n.dimColor, border: `1px solid ${n.color}30`,
                  color: n.color, borderRadius: '5px',
                  padding: '3px 8px',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  {n.icon} {n.label}: {n.items.length}
                </span>
              ))}
            </div>
          )}

          {/* AI button */}
          <button
            onClick={() => onAskAI(
              `Analise ${project.book} ${project.passage_ref} e organize de forma concisa: (1) personagens principais e secundários, (2) lugares principais, (3) temas dominantes, (4) conflito principal, (5) clímax, (6) resolução, (7) grande ideia central da passagem.`
            )}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 16px',
              fontSize: '0.78rem', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai, #8B5CF6)'; e.currentTarget.style.color = 'var(--ai, #8B5CF6)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Sparkles size={12} strokeWidth={1.75} /> Organizar automaticamente com IA
          </button>
        </>
      )}
    </div>
  )
}
