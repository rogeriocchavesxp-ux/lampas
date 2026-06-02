'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import { createClient } from '@/lib/supabase/client'
import SectionWorkspace from './SectionWorkspace'
import { Sparkles, Map, List, MoreHorizontal, X, Plus, BookOpen } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ClassType =
  | 'personagem' | 'lugar' | 'tema' | 'termo_chave' | 'conflito' | 'repeticao'
  | 'teologia' | 'tempo' | 'instituicao' | 'cargo' | 'objetivo'
  | 'comentario' | 'insight' | 'observacao'

interface Classification {
  id: string; type: ClassType; selectedText: string
  startVerse: number; endVerse: number
  note: string; createdAt: string
}

// ── Storage ───────────────────────────────────────────────────────────────────

function readCls(pid: string): Classification[] {
  try { const r = localStorage.getItem(`lc_${pid}`); return r ? JSON.parse(r) : [] } catch { return [] }
}
function writeCls(pid: string, v: Classification[]) {
  try { localStorage.setItem(`lc_${pid}`, JSON.stringify(v)) } catch {}
}

// ── Canvas constants ──────────────────────────────────────────────────────────

const CW = 720
const CH = 480
const CX = 360
const CY = 240
const RADIUS = 185

// ── Node definitions ──────────────────────────────────────────────────────────

type NodeKind = 'cls' | 'card'

interface NodeDef {
  key: string; label: string; icon: string
  angle: number; color: string; bg: string
  kind: NodeKind
  clsTypes?: ClassType[]
  cardIds?: string[]
}

const NODES: NodeDef[] = [
  { key: 'personagens', label: 'Personagens',  icon: '👤', angle: -90,  color: '#D97706', bg: '#FEF3C7', kind: 'cls',  clsTypes: ['personagem', 'cargo'] },
  { key: 'lugares',     label: 'Lugares',       icon: '📍', angle: -38,  color: '#10B981', bg: '#DCFCE7', kind: 'cls',  clsTypes: ['lugar'] },
  { key: 'temas',       label: 'Temas',          icon: '📖', angle: 16,   color: '#3B82F6', bg: '#DBEAFE', kind: 'cls',  clsTypes: ['tema'] },
  { key: 'termos',      label: 'Termos-Chave',  icon: '🔑', angle: 70,   color: '#F97316', bg: '#FFEDD5', kind: 'cls',  clsTypes: ['termo_chave', 'repeticao'] },
  { key: 'grande_ideia',label: 'Grande Ideia',  icon: '💡', angle: 126,  color: '#F59E0B', bg: '#FEF3C7', kind: 'card', cardIds: ['preparar_grande_ideia_inicial'] },
  { key: 'estrutura',   label: 'Estrutura',      icon: '⊞',  angle: 172,  color: '#6366F1', bg: '#EDE9FE', kind: 'card', cardIds: ['preparar_estrutura_percebida'] },
  { key: 'climax',      label: 'Clímax',         icon: '✦',  angle: -150, color: '#8B5CF6', bg: '#F5F3FF', kind: 'card', cardIds: ['preparar_climax', 'preparar_movimento_narrativo'] },
  { key: 'movimento',   label: 'Movimento',      icon: '⟶', angle: -116, color: '#64748B', bg: '#F1F5F9', kind: 'card', cardIds: ['preparar_fluxo_argumentativo', 'preparar_movimento_narrativo'] },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  onOpenBible?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisaoGeralWorkspace({
  sectionDef, project, userId, existingSection, onUpdate, onAskAI, onOpenBible,
}: Props) {
  const supabase    = useMemo(() => createClient(), [])
  const containerRef = useRef<HTMLDivElement>(null)

  const [mode,        setMode]        = useState<'visual' | 'structured'>('visual')
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [cls,         setCls]         = useState<Classification[]>([])
  const [containerW,  setContainerW]  = useState(CW)

  // Card editing state
  const [cardDraft,   setCardDraft]   = useState<Record<string, string>>({})
  const [savingCard,  setSavingCard]  = useState<string | null>(null)

  // Manual item input
  const [addInput,    setAddInput]    = useState('')

  // Item menu
  const [openItemMenu, setOpenItemMenu] = useState<string | null>(null)

  // ── Load & poll ───────────────────────────────────────────────────────────
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

  // ── Section cards ─────────────────────────────────────────────────────────
  const cards = useMemo(
    () => (existingSection?.content as { cards?: Record<string, string> } | null)?.cards ?? {},
    [existingSection],
  )

  // ── Node item getters ────────────────────────────────────────────────────
  function getClsItems(node: NodeDef): Classification[] {
    if (node.kind !== 'cls' || !node.clsTypes) return []
    return cls.filter(c => node.clsTypes!.includes(c.type))
  }

  function getCardText(node: NodeDef): string {
    if (node.kind !== 'card' || !node.cardIds) return ''
    return node.cardIds.map(id => cards[id]?.trim()).filter(Boolean).join('\n\n')
  }

  function getCount(node: NodeDef): number {
    if (node.kind === 'cls') return getClsItems(node).length
    return getCardText(node) ? 1 : 0
  }

  // ── Save card ─────────────────────────────────────────────────────────────
  const saveCard = useCallback(async (cardId: string, value: string) => {
    setSavingCard(cardId)
    try {
      const slug    = sectionDef.slug
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', slug).maybeSingle()
      const existing = (data?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const payload = {
        project_id: project.id, user_id: userId, slug,
        module: 'inventio' as const, title: sectionDef.title,
        status: 'draft' as const,
        content: { cards: { ...existing, [cardId]: value } },
      }
      if (data?.id) {
        const { data: updated } = await supabase.from('sections').update(payload).eq('id', data.id).select().single()
        if (updated) onUpdate(updated as Section)
      } else {
        const { data: inserted } = await supabase.from('sections').insert(payload).select().single()
        if (inserted) onUpdate(inserted as Section)
      }
    } catch { /* noop */ }
    finally { setSavingCard(null) }
  }, [supabase, project.id, userId, sectionDef, onUpdate])

  // ── Remove cls item ────────────────────────────────────────────────────────
  function removeCls(id: string) {
    const next = cls.filter(c => c.id !== id)
    setCls(next); writeCls(project.id, next)
    setOpenItemMenu(null)
  }

  // ── Scale canvas ──────────────────────────────────────────────────────────
  const canvasAreaW = activePanel ? Math.max(containerW - 300, 340) : containerW
  const scale       = Math.min(1, (canvasAreaW - 16) / CW)

  // ── Active node ───────────────────────────────────────────────────────────
  const activeNodeDef = NODES.find(n => n.key === activePanel) ?? null
  const totalItems    = NODES.reduce((s, n) => s + getCount(n), 0)

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem 1.5rem 2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Visão Geral · {project.book} {project.passage_ref}
          </div>
          {mode === 'visual' && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {totalItems === 0
                ? <span style={{ color: '#D97706' }}>Marque palavras no Texto Bíblico para construir o mapa.</span>
                : `${totalItems} elemento${totalItems !== 1 ? 's' : ''} mapeado${totalItems !== 1 ? 's' : ''}. Clique em qualquer card para ver os detalhes.`
              }
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2, #F1F5F9)', borderRadius: '8px', padding: '2px' }}>
          {(['visual', 'structured'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setActivePanel(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: mode === m ? '#FFFFFF' : 'transparent',
                border: 'none', borderRadius: '6px',
                padding: '5px 11px', fontSize: '0.71rem', fontWeight: 600,
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.12s',
              }}
            >
              {m === 'visual' ? <><Map size={11} strokeWidth={1.75} />Mapa</> : <><List size={11} strokeWidth={1.75} />Estruturado</>}
            </button>
          ))}
        </div>
      </div>

      {/* Structured mode */}
      {mode === 'structured' && (
        <SectionWorkspace sectionDef={sectionDef} project={project} userId={userId}
          existingSection={existingSection} onUpdate={onUpdate} onAskAI={onAskAI} />
      )}

      {/* Visual mode */}
      {mode === 'visual' && (
        <div ref={containerRef} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

          {/* ── Canvas ── */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative', height: `${CH * scale}px` }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: `${CW}px`, height: `${CH}px`,
              transform: `scale(${scale})`, transformOrigin: 'top left',
            }}>

              {/* SVG Lines */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox={`0 0 ${CW} ${CH}`}>
                {NODES.map(node => {
                  const rad = (node.angle * Math.PI) / 180
                  const nx  = CX + RADIUS * Math.cos(rad)
                  const ny  = CY + RADIUS * Math.sin(rad)
                  const isHov = hoveredNode === node.key
                  const isAct = activePanel === node.key
                  const hasData = getCount(node) > 0
                  const cx1 = CX + (nx - CX) * 0.4 + (ny - CY) * 0.15
                  const cy1 = CY + (ny - CY) * 0.4 - (nx - CX) * 0.15
                  return (
                    <path
                      key={node.key}
                      d={`M ${CX} ${CY} C ${cx1} ${cy1} ${(CX + nx) / 2} ${(CY + ny) / 2} ${nx} ${ny}`}
                      stroke={isHov || isAct ? node.color : (hasData ? '#94A3B8' : '#CBD5E1')}
                      strokeWidth={isHov || isAct ? 2 : 1.5}
                      strokeOpacity={isHov || isAct ? 1 : (hasData ? 0.7 : 0.5)}
                      fill="none"
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.15s, stroke-opacity 0.15s, stroke-width 0.15s' }}
                    />
                  )
                })}
              </svg>

              {/* Center node */}
              <button
                onClick={onOpenBible}
                style={{
                  position: 'absolute', left: `${CX}px`, top: `${CY}px`,
                  transform: 'translate(-50%, -50%)',
                  background: '#FFFFFF',
                  border: '2px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '14px 22px',
                  textAlign: 'center', zIndex: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)',
                  minWidth: '152px', cursor: onOpenBible ? 'pointer' : 'default',
                  fontFamily: 'inherit', userSelect: 'none',
                  transition: 'box-shadow 0.15s, transform 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)' }}
              >
                <div style={{ fontSize: '1.15rem', marginBottom: '4px' }}>📖</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{project.book}</div>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: '2px' }}>{project.passage_ref}</div>
                {onOpenBible && (
                  <div style={{ fontSize: '0.58rem', color: 'var(--accent, #3B82F6)', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', opacity: 0.75 }}>
                    <BookOpen size={9} strokeWidth={2} /> abrir
                  </div>
                )}
                {totalItems > 0 && (
                  <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '2px', opacity: 0.6 }}>{totalItems} elem.</div>
                )}
              </button>

              {/* Outer nodes */}
              {NODES.map(node => {
                const rad     = (node.angle * Math.PI) / 180
                const nx      = CX + RADIUS * Math.cos(rad)
                const ny      = CY + RADIUS * Math.sin(rad)
                const count   = getCount(node)
                const hasData = count > 0
                const isAct   = activePanel === node.key

                return (
                  <div key={node.key}
                    style={{ position: 'absolute', left: `${nx}px`, top: `${ny}px`, transform: 'translate(-50%, -50%)', zIndex: 3 }}
                    onMouseEnter={() => setHoveredNode(node.key)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <button
                      onClick={() => setActivePanel(isAct ? null : node.key)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: isAct ? node.bg : (hasData ? '#FFFFFF' : '#FAFAFA'),
                        border: `1.5px solid ${isAct ? node.color : (hasData ? node.color + '50' : '#E2E8F0')}`,
                        borderRadius: '12px', padding: '9px 14px',
                        cursor: 'pointer', minWidth: '106px', fontFamily: 'inherit',
                        boxShadow: isAct
                          ? `0 0 0 3px ${node.color}20, 0 4px 16px ${node.color}18`
                          : hasData
                          ? `0 2px 10px ${node.color}15, 0 1px 3px rgba(0,0,0,0.05)`
                          : '0 1px 3px rgba(0,0,0,0.04)',
                        outline: 'none',
                        transition: 'all 0.15s',
                        transform: isAct ? 'scale(1.05)' : 'scale(1)',
                      }}
                      onMouseEnter={e => { if (!isAct) e.currentTarget.style.transform = 'scale(1.04)' }}
                      onMouseLeave={e => { if (!isAct) e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      <span style={{ fontSize: '0.9rem', lineHeight: 1, marginBottom: '3px' }}>{node.icon}</span>
                      <span style={{
                        fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: hasData ? node.color : '#94A3B8',
                        lineHeight: 1.2, textAlign: 'center',
                      }}>
                        {node.label}
                      </span>
                      {hasData ? (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700,
                          color: node.color, marginTop: '3px',
                          background: node.color + '18', borderRadius: '10px',
                          padding: '1px 6px',
                        }}>
                          {count}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.58rem', color: '#CBD5E1', marginTop: '2px' }}>—</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Side panel ── */}
          {activePanel && activeNodeDef && (
            <div style={{
              width: '280px', flexShrink: 0,
              background: '#FFFFFF',
              border: `1px solid ${activeNodeDef.color}30`,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out',
              alignSelf: 'flex-start',
            }}>
              {/* Panel header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: `1px solid ${activeNodeDef.color}20`,
                background: activeNodeDef.bg,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.95rem' }}>{activeNodeDef.icon}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: activeNodeDef.color, letterSpacing: '0.02em' }}>
                    {activeNodeDef.label}
                  </span>
                  {getCount(activeNodeDef) > 0 && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: activeNodeDef.color, background: activeNodeDef.color + '20', borderRadius: '8px', padding: '1px 6px' }}>
                      {getCount(activeNodeDef)}
                    </span>
                  )}
                </div>
                <button onClick={() => setActivePanel(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex', borderRadius: '4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              {/* Panel body */}
              <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
                {activeNodeDef.kind === 'cls' && (() => {
                  const items = getClsItems(activeNodeDef)
                  return items.length === 0 ? (
                    <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                      Nenhum item ainda.<br />
                      <span style={{ fontSize: '0.72rem', color: activeNodeDef.color, marginTop: '4px', display: 'block' }}>
                        Marque palavras no Texto Bíblico.
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {items.map(c => (
                        <div key={c.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '7px 8px', borderRadius: '7px',
                            background: openItemMenu === c.id ? activeNodeDef.bg : 'transparent',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { if (openItemMenu !== c.id) e.currentTarget.style.background = '#F8FAFC' }}
                          onMouseLeave={e => { if (openItemMenu !== c.id) e.currentTarget.style.background = 'transparent' }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeNodeDef.color, flexShrink: 0, opacity: 0.7 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {c.selectedText}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                              v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''}{c.note && ` · ${c.note}`}
                            </div>
                          </div>
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <button onClick={() => setOpenItemMenu(openItemMenu === c.id ? null : c.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 3px', borderRadius: '4px', display: 'flex' }}
                            >
                              <MoreHorizontal size={13} strokeWidth={1.75} />
                            </button>
                            {openItemMenu === c.id && (
                              <div style={{
                                position: 'absolute', right: 0, top: '100%', zIndex: 20,
                                background: '#FFFFFF', border: '1px solid var(--border)',
                                borderRadius: '8px', padding: '4px',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                                minWidth: '140px', animation: 'fadeIn 0.1s ease-out',
                              }}>
                                <button onClick={() => removeCls(c.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', background: 'none', border: 'none', borderRadius: '5px', padding: '6px 8px', fontSize: '0.75rem', color: 'var(--error, #EF4444)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >
                                  Remover classificação
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {activeNodeDef.kind === 'card' && (() => {
                  const cardId   = activeNodeDef.cardIds![0]
                  const draft    = cardDraft[cardId] ?? cards[cardId] ?? ''
                  const isSaving = savingCard === cardId
                  return (
                    <div style={{ padding: '4px' }}>
                      <textarea
                        value={draft}
                        onChange={e => setCardDraft(prev => ({ ...prev, [cardId]: e.target.value }))}
                        placeholder={`Descreva ${activeNodeDef.label.toLowerCase()} percebido na passagem…`}
                        rows={6}
                        style={{
                          width: '100%', resize: 'vertical', fontFamily: 'inherit',
                          fontSize: '0.83rem', lineHeight: 1.55, color: 'var(--text-primary)',
                          background: '#FAFAFA', border: '1px solid var(--border)',
                          borderRadius: '7px', padding: '9px 10px', outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.12s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = activeNodeDef.color}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      />
                      <button
                        onClick={() => saveCard(cardId, draft)}
                        disabled={isSaving || draft === (cards[cardId] ?? '')}
                        style={{
                          marginTop: '6px', width: '100%',
                          background: isSaving ? 'var(--surface)' : activeNodeDef.color,
                          color: isSaving ? 'var(--text-muted)' : '#FFF',
                          border: 'none', borderRadius: '7px',
                          padding: '7px 12px', fontSize: '0.74rem', fontWeight: 600,
                          cursor: isSaving || draft === (cards[cardId] ?? '') ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit', opacity: draft === (cards[cardId] ?? '') ? 0.5 : 1,
                          transition: 'all 0.12s',
                        }}
                      >
                        {isSaving ? 'Salvando…' : 'Salvar'}
                      </button>
                    </div>
                  )
                })()}
              </div>

              {/* Panel footer */}
              <div style={{ padding: '8px', borderTop: `1px solid ${activeNodeDef.color}15` }}>
                {/* Add manually for CLS nodes */}
                {activeNodeDef.kind === 'cls' && (
                  <div style={{ marginBottom: '6px' }}>
                    <button
                      onClick={() => onOpenBible?.()}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        background: 'var(--surface, #F8FAFC)', border: '1px solid var(--border)',
                        borderRadius: '7px', padding: '7px 10px',
                        fontSize: '0.74rem', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = activeNodeDef.color; e.currentTarget.style.color = activeNodeDef.color }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      <BookOpen size={12} strokeWidth={1.75} /> Abrir Texto Bíblico
                    </button>
                  </div>
                )}

                {/* AI button */}
                <button
                  onClick={() => onAskAI(`Analise ${project.book} ${project.passage_ref} e liste os principais elementos de "${activeNodeDef.label}" presentes na passagem, com breve explicação de cada um.`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: '7px', padding: '7px 10px',
                    fontSize: '0.74rem', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai, #8B5CF6)'; e.currentTarget.style.color = 'var(--ai, #8B5CF6)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <Sparkles size={12} strokeWidth={1.75} /> Organizar com IA
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom bar */}
      {mode === 'visual' && !activePanel && (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          {/* Legend chips */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {NODES.filter(n => getCount(n) > 0).map(n => (
              <button key={n.key} onClick={() => setActivePanel(n.key)}
                style={{
                  fontSize: '0.63rem', fontWeight: 600, cursor: 'pointer',
                  background: n.bg, border: `1px solid ${n.color}30`,
                  color: n.color, borderRadius: '5px', padding: '3px 8px',
                  fontFamily: 'inherit', transition: 'all 0.1s',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = n.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = n.color + '30'}
              >
                {n.icon} {n.label}: {getCount(n)}
              </button>
            ))}
          </div>

          {/* AI organize */}
          <button
            onClick={() => onAskAI(`Analise ${project.book} ${project.passage_ref} e organize de forma concisa: (1) personagens principais e secundários, (2) lugares principais, (3) temas dominantes, (4) conflito principal, (5) clímax, (6) resolução, (7) grande ideia central da passagem.`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '6px 14px',
              fontSize: '0.75rem', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai, #8B5CF6)'; e.currentTarget.style.color = 'var(--ai, #8B5CF6)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Sparkles size={12} strokeWidth={1.75} /> Organizar automaticamente com IA
          </button>
        </div>
      )}
    </div>
  )
}
