'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ImprovementItem {
  id: string
  project_id: string
  section_slug: string | null
  section_label: string | null
  field_label: string | null
  title: string
  problem: string | null
  justification: string | null
  suggestion: string | null
  done: boolean
  created_at: string
}

interface Props {
  projectId: string
  onClose: () => void
}

type Filter = 'all' | 'pending' | 'done'

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchItems(projectId: string): Promise<ImprovementItem[]> {
  const res = await fetch(`/api/improvement?project_id=${projectId}`)
  if (!res.ok) return []
  return res.json()
}

async function patchItem(id: string, update: Partial<ImprovementItem>): Promise<ImprovementItem | null> {
  const res = await fetch(`/api/improvement/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  })
  if (!res.ok) return null
  return res.json()
}

async function deleteItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/improvement/${id}`, { method: 'DELETE' })
  return res.ok
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupKey(item: ImprovementItem): string {
  const parts = [item.section_label, item.field_label].filter(Boolean)
  return parts.length ? parts.join(' › ') : 'Sem categoria'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImprovementChecklistPanel({ projectId, onClose }: Props) {
  const [items, setItems]         = useState<ImprovementItem[]>([])
  const [filter, setFilter]       = useState<Filter>('all')
  const [loading, setLoading]     = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<ImprovementItem>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchItems(projectId)
    setItems(data)
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  // Refetch when AI generates new items
  useEffect(() => {
    function handler() { load() }
    window.addEventListener('lampas:checklist-updated', handler)
    return () => window.removeEventListener('lampas:checklist-updated', handler)
  }, [load])

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function toggleDone(item: ImprovementItem) {
    // Optimistic
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, done: !i.done } : i))
    await patchItem(item.id, { done: !item.done })
  }

  async function handleDelete(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await deleteItem(id)
  }

  function startEdit(item: ImprovementItem) {
    setEditingId(item.id)
    setEditDraft({
      title:         item.title,
      problem:       item.problem ?? '',
      justification: item.justification ?? '',
      suggestion:    item.suggestion ?? '',
    })
  }

  async function saveEdit(id: string) {
    const updated = await patchItem(id, editDraft)
    if (updated) {
      setItems(prev => prev.map(i => i.id === id ? updated : i))
    }
    setEditingId(null)
    setEditDraft({})
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // ── Filtered + grouped items ─────────────────────────────────────────────

  const filtered = items.filter(i => {
    if (filter === 'pending') return !i.done
    if (filter === 'done')    return i.done
    return true
  })

  const groups = filtered.reduce<Record<string, ImprovementItem[]>>((acc, item) => {
    const key = groupKey(item)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const pending = items.filter(i => !i.done).length
  const done    = items.filter(i => i.done).length

  // ── Styles ───────────────────────────────────────────────────────────────

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.25rem 0.65rem', border: 'none', borderRadius: '20px',
    fontSize: '0.7rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
    background: active ? '#163A6B' : 'transparent',
    color: active ? '#fff' : '#64748B',
    transition: 'all 0.12s',
  })

  const iconBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 5px',
    borderRadius: '4px', fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'inherit',
    transition: 'color 0.1s',
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#FFFFFF', fontFamily: 'inherit',
      borderLeft: '1px solid #E2E8F0',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '0.85rem 1rem 0.7rem',
        borderBottom: '1px solid #F1F5F9',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', flex: 1, letterSpacing: '-0.01em' }}>
            Checklist de Melhorias
          </span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px',
            background: pending > 0 ? '#FEF3C7' : '#F0FDF4',
            color: pending > 0 ? '#92650A' : '#16A34A',
            borderRadius: '10px',
          }}>
            {pending} pendente{pending !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            style={{ ...iconBtnStyle, fontSize: '1rem', color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none' }}
          >✕</button>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: '0.2rem', background: '#F8FAFC', borderRadius: '20px', padding: '2px' }}>
          {(['all', 'pending', 'done'] as const).map(f => (
            <button key={f} style={filterBtnStyle(filter === f)} onClick={() => setFilter(f)}>
              {f === 'all' ? `Todos (${items.length})` : f === 'pending' ? `Pendentes (${pending})` : `Concluídos (${done})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>

        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
            Carregando…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              {filter === 'done' ? '🎉' : filter === 'pending' ? '✅' : '📋'}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
              {filter === 'all'
                ? 'Nenhuma melhoria ainda.\nUse IA → Avaliar para gerar o checklist.'
                : filter === 'done'
                ? 'Nenhum item concluído ainda.'
                : 'Todos os itens foram concluídos!'}
            </p>
          </div>
        )}

        {!loading && Object.entries(groups).map(([groupName, groupItems]) => (
          <div key={groupName}>
            {/* Group header */}
            <div style={{
              padding: '0.4rem 1rem 0.25rem',
              fontSize: '0.6rem', fontWeight: 700,
              color: '#163A6B', letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              {groupName}
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* Items */}
            {groupItems.map(item => {
              const expanded  = expandedIds.has(item.id)
              const isEditing = editingId === item.id
              const hasDetail = item.problem || item.justification || item.suggestion

              return (
                <div key={item.id} style={{
                  margin: '0 0.75rem 0.4rem',
                  background: item.done ? '#F8FAFC' : '#FFFFFF',
                  border: `1px solid ${item.done ? '#F1F5F9' : '#E2E8F0'}`,
                  borderRadius: '9px',
                  overflow: 'hidden',
                  transition: 'border-color 0.12s',
                }}>

                  {/* Item header row */}
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    padding: '0.65rem 0.75rem',
                  }}>
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleDone(item)}
                      title={item.done ? 'Marcar como pendente' : 'Marcar como concluído'}
                      style={{
                        flexShrink: 0, width: '18px', height: '18px', marginTop: '1px',
                        border: `2px solid ${item.done ? '#22C55E' : '#CBD5E1'}`,
                        borderRadius: '4px',
                        background: item.done ? '#22C55E' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '0.65rem', fontWeight: 900,
                        transition: 'all 0.12s',
                      }}
                    >
                      {item.done ? '✓' : ''}
                    </button>

                    {/* Title */}
                    {isEditing ? (
                      <input
                        value={editDraft.title ?? ''}
                        onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))}
                        style={{
                          flex: 1, fontSize: '0.8rem', fontWeight: 600,
                          border: '1px solid #CBD5E1', borderRadius: '5px',
                          padding: '2px 6px', fontFamily: 'inherit',
                          color: '#0F172A', background: '#FAFAFA', outline: 'none',
                        }}
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => hasDetail && toggleExpand(item.id)}
                        style={{
                          flex: 1, textAlign: 'left', background: 'none', border: 'none',
                          cursor: hasDetail ? 'pointer' : 'default',
                          fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                          color: item.done ? '#94A3B8' : '#1E293B',
                          textDecoration: item.done ? 'line-through' : 'none',
                          lineHeight: 1.4, padding: 0,
                        }}
                      >
                        {item.title}
                      </button>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                      {hasDetail && !isEditing && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          style={iconBtnStyle}
                          title={expanded ? 'Recolher' : 'Expandir'}
                          onMouseEnter={e => { e.currentTarget.style.color = '#475569' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
                        >
                          {expanded ? '▴' : '▾'}
                        </button>
                      )}
                      {!isEditing ? (
                        <button
                          onClick={() => startEdit(item)}
                          style={iconBtnStyle}
                          title="Editar"
                          onMouseEnter={e => { e.currentTarget.style.color = '#475569' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
                        >
                          ✎
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => saveEdit(item.id)}
                            style={{ ...iconBtnStyle, color: '#16A34A', fontWeight: 700 }}
                            title="Salvar"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditDraft({}) }}
                            style={iconBtnStyle}
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={iconBtnStyle}
                        title="Excluir"
                        onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
                      >
                        ⌫
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {(expanded || isEditing) && (
                    <div style={{
                      borderTop: '1px solid #F1F5F9',
                      padding: '0.6rem 0.75rem 0.7rem',
                      background: '#FAFAFA',
                      display: 'flex', flexDirection: 'column', gap: '0.55rem',
                    }}>
                      {(['problem', 'justification', 'suggestion'] as const).map(field => {
                        const labels: Record<string, string> = {
                          problem: 'Problema',
                          justification: 'Por quê',
                          suggestion: 'Sugestão',
                        }
                        const colors: Record<string, string> = {
                          problem: '#EF4444',
                          justification: '#D97706',
                          suggestion: '#059669',
                        }
                        const rawValue = isEditing ? (editDraft[field] ?? '') : (item[field] ?? '')
                        if (!isEditing && !rawValue) return null
                        return (
                          <div key={field}>
                            <div style={{
                              fontSize: '0.58rem', fontWeight: 800,
                              color: colors[field], letterSpacing: '0.08em',
                              textTransform: 'uppercase', marginBottom: '2px',
                            }}>
                              {labels[field]}
                            </div>
                            {isEditing ? (
                              <textarea
                                value={String(rawValue)}
                                onChange={e => setEditDraft(d => ({ ...d, [field]: e.target.value }))}
                                rows={2}
                                style={{
                                  width: '100%', fontSize: '0.76rem', fontFamily: 'inherit',
                                  border: '1px solid #CBD5E1', borderRadius: '5px',
                                  padding: '4px 7px', resize: 'vertical', outline: 'none',
                                  color: '#374151', background: '#FFFFFF', boxSizing: 'border-box',
                                  lineHeight: 1.5,
                                }}
                              />
                            ) : (
                              <p style={{
                                margin: 0, fontSize: '0.77rem', color: '#475569',
                                lineHeight: 1.55, fontStyle: field === 'justification' ? 'italic' : 'normal',
                              }}>
                                {String(rawValue)}
                              </p>
                            )}
                          </div>
                        )
                      })}
                      {!isEditing && (
                        <div style={{ fontSize: '0.62rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
                          {formatDate(item.created_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      {!loading && items.length > 0 && (
        <div style={{
          padding: '0.6rem 1rem',
          borderTop: '1px solid #F1F5F9',
          background: '#FAFAFA',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
            {done}/{items.length} concluídos
          </span>
          <div style={{
            height: '5px', width: '80px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '3px', background: '#22C55E',
              width: `${items.length > 0 ? (done / items.length) * 100 : 0}%`,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
