'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { setUserBlocked, setUserPlan, resetAiUsage } from './actions'

export interface AdminUserRow {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
  is_hub_editor: boolean | null
  is_blocked: boolean | null
  plan: string
  subscription_status: string | null
  created_at: string
  last_active_at: string | null
  project_count: number
  production_count: number
  ai_calls_30d: number
  ai_cost_usd_30d: number
}

interface Summary {
  total: number
  active7d: number
  active30d: number
  newThisMonth: number
  free: number
  paid: number
  totalProjects: number
  aiCalls30d: number
}

interface DetailProject {
  id: string
  title: string
  study_mode: string | null
  mode_label: string
  status: string
  book: string | null
  passage_ref: string | null
  created_at: string
  updated_at: string
}

interface DetailResponse {
  profile: AdminUserRow
  projects: DetailProject[]
  modes_used: { mode: string; label: string; count: number }[]
  ai_usage_this_month: number
  last_ai_interaction: { section_slug: string | null; created_at: string } | null
}

type StatusFilter = 'all' | 'ativo' | 'inativo' | 'novo' | 'bloqueado' | 'cancelado'
type SortKey = 'name' | 'created_at' | 'last_active_at' | 'project_count' | 'ai_calls_30d' | 'plan'

const PLAN_OPTIONS = ['free', 'student', 'pastor', 'ministry', 'seminary']

function computeStatus(row: AdminUserRow): { key: StatusFilter; label: string; color: string } {
  if (row.is_blocked) return { key: 'bloqueado', label: 'Bloqueado', color: '#B91C1C' }
  if (row.subscription_status && ['cancelled', 'canceled'].includes(row.subscription_status)) {
    return { key: 'cancelado', label: 'Cancelado', color: '#B91C1C' }
  }
  const createdDaysAgo = (Date.now() - new Date(row.created_at).getTime()) / 86400000
  if (createdDaysAgo <= 7) return { key: 'novo', label: 'Novo', color: '#1E4D8C' }
  const lastActiveDaysAgo = row.last_active_at
    ? (Date.now() - new Date(row.last_active_at).getTime()) / 86400000
    : Infinity
  if (lastActiveDaysAgo <= 30) return { key: 'ativo', label: 'Ativo', color: '#15803D' }
  return { key: 'inativo', label: 'Inativo', color: 'var(--text-muted)' }
}

function dateLabel(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function downloadCsv(rows: AdminUserRow[]) {
  const header = ['Nome', 'Email', 'Plano', 'Status', 'Cadastro', 'Último acesso', 'Projetos', 'IA (30d)']
  const lines = rows.map(r => {
    const status = computeStatus(r).label
    return [
      r.full_name ?? '',
      r.email ?? '',
      r.plan,
      status,
      dateLabel(r.created_at),
      dateLabel(r.last_active_at),
      String(r.project_count),
      String(r.ai_calls_30d),
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(',')
  })
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lampas-usuarios-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '1rem', background: 'var(--surface)' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{value}</div>
    </div>
  )
}

export default function UsuariosClient({ initialUsers, summary }: { initialUsers: AdminUserRow[]; summary: Summary }) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = users.filter(u => {
      if (term && !(u.full_name ?? '').toLowerCase().includes(term) && !(u.email ?? '').toLowerCase().includes(term)) return false
      if (planFilter !== 'all' && u.plan !== planFilter) return false
      if (statusFilter !== 'all' && computeStatus(u).key !== statusFilter) return false
      return true
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = (a.full_name ?? a.email ?? '').localeCompare(b.full_name ?? b.email ?? '')
      else if (sortKey === 'created_at') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      else if (sortKey === 'last_active_at') cmp = new Date(a.last_active_at ?? 0).getTime() - new Date(b.last_active_at ?? 0).getTime()
      else if (sortKey === 'project_count') cmp = a.project_count - b.project_count
      else if (sortKey === 'ai_calls_30d') cmp = a.ai_calls_30d - b.ai_calls_30d
      else if (sortKey === 'plan') cmp = a.plan.localeCompare(b.plan)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [users, search, planFilter, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  async function openDetail(id: string) {
    setSelectedId(id)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (res.ok) setDetail(await res.json())
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleToggleBlock(row: AdminUserRow) {
    const next = !row.is_blocked
    if (!window.confirm(next ? `Bloquear ${row.full_name ?? row.email}?` : `Desbloquear ${row.full_name ?? row.email}?`)) return
    setBusyId(row.id)
    const result = await setUserBlocked(row.id, next)
    setBusyId(null)
    if (result?.success) setUsers(prev => prev.map(u => (u.id === row.id ? { ...u, is_blocked: next } : u)))
    else if (result?.error) window.alert(result.error)
  }

  async function handlePlanChange(row: AdminUserRow, plan: string) {
    setBusyId(row.id)
    const result = await setUserPlan(row.id, plan)
    setBusyId(null)
    if (result?.success) setUsers(prev => prev.map(u => (u.id === row.id ? { ...u, plan } : u)))
    else if (result?.error) window.alert(result.error)
  }

  async function handleResetAi(row: AdminUserRow) {
    if (!window.confirm(`Redefinir o uso de IA deste mês para ${row.full_name ?? row.email}?`)) return
    setBusyId(row.id)
    const result = await resetAiUsage(row.id)
    setBusyId(null)
    if (result?.success) window.alert('Cota de IA do mês redefinida.')
    else if (result?.error) window.alert(result.error)
  }

  const thStyle: CSSProperties = { padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }
  const tdStyle: CSSProperties = { padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <SummaryCard label="Total de usuários" value={summary.total} />
        <SummaryCard label="Ativos (7 dias)" value={summary.active7d} />
        <SummaryCard label="Ativos (30 dias)" value={summary.active30d} />
        <SummaryCard label="Novos este mês" value={summary.newThisMonth} />
        <SummaryCard label="Plano gratuito" value={summary.free} />
        <SummaryCard label="Planos pagos" value={summary.paid} />
        <SummaryCard label="Total de projetos" value={summary.totalProjects} />
        <SummaryCard label="Consultas de IA (30d)" value={summary.aiCalls30d} />
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email…"
          style={{ flex: '1 1 220px', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
        />
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}>
          <option value="all">Todos os planos</option>
          {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}>
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="novo">Novo</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button
          onClick={() => downloadCsv(filtered)}
          style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Exportar CSV
        </button>
      </div>

      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', textAlign: 'left', background: 'var(--surface)' }}>
                <th style={thStyle} onClick={() => toggleSort('name')}>Nome</th>
                <th style={thStyle} onClick={() => toggleSort('plan')}>Plano</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle} onClick={() => toggleSort('created_at')}>Cadastro</th>
                <th style={thStyle} onClick={() => toggleSort('last_active_at')}>Último acesso</th>
                <th style={thStyle} onClick={() => toggleSort('project_count')}>Projetos</th>
                <th style={thStyle} onClick={() => toggleSort('ai_calls_30d')}>IA (30d)</th>
                <th style={thStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const status = computeStatus(row)
                return (
                  <tr key={row.id}>
                    <td style={tdStyle}>
                      <button onClick={() => openDetail(row.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)' }}>
                        <strong>{row.full_name || '—'}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{row.email}</div>
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={row.plan}
                        disabled={busyId === row.id}
                        onChange={e => handlePlanChange(row, e.target.value)}
                        style={{ padding: '0.3rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)' }}
                      >
                        {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td style={{ ...tdStyle, color: status.color, fontWeight: 700 }}>{status.label}</td>
                    <td style={tdStyle}>{dateLabel(row.created_at)}</td>
                    <td style={tdStyle}>{dateLabel(row.last_active_at)}</td>
                    <td style={tdStyle}>{row.project_count}</td>
                    <td style={tdStyle}>{row.ai_calls_30d}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          disabled={busyId === row.id}
                          onClick={() => handleToggleBlock(row)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', color: row.is_blocked ? '#15803D' : '#B91C1C', fontSize: '0.74rem', cursor: 'pointer' }}
                        >
                          {row.is_blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                        <button
                          disabled={busyId === row.id}
                          onClick={() => handleResetAi(row)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }}
                        >
                          Reset IA
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '1rem', color: 'var(--text-muted)' }}>Nenhum usuário encontrado com esses filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && (
        <div
          onClick={() => setSelectedId(null)}
          className="lp-fixed-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 500, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="lp-fixed-panel"
            style={{ width: 'min(420px, 100vw)', height: '100%', background: 'var(--background)', borderLeft: '1px solid var(--border)', padding: '1.5rem', overflowY: 'auto' }}
          >
            <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1rem' }}>← Fechar</button>

            {detailLoading && <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>}

            {detail && (
              <div>
                <h2 style={{ marginBottom: '0.2rem' }}>{detail.profile.full_name || '—'}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{detail.profile.email}</p>

                <section style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Dados básicos</div>
                  <div style={{ fontSize: '0.86rem', display: 'grid', gap: '0.3rem' }}>
                    <div>ID: <span style={{ color: 'var(--text-muted)' }}>{detail.profile.id}</span></div>
                    <div>Role: {detail.profile.role ?? 'user'}</div>
                    <div>Plano: {detail.profile.plan}</div>
                    <div>Status: {computeStatus(detail.profile).label}</div>
                    <div>Cadastro: {dateLabel(detail.profile.created_at)}</div>
                    <div>Último acesso: {dateLabel(detail.profile.last_active_at)}</div>
                  </div>
                </section>

                <section style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Uso da IA</div>
                  <div style={{ fontSize: '0.86rem', display: 'grid', gap: '0.3rem' }}>
                    <div>Consultas neste mês: {detail.ai_usage_this_month}</div>
                    <div>Consultas (30 dias): {detail.profile.ai_calls_30d}</div>
                    <div>Custo estimado (30 dias): US$ {detail.profile.ai_cost_usd_30d.toFixed(2)}</div>
                    {detail.last_ai_interaction && (
                      <div>Última consulta: {dateLabel(detail.last_ai_interaction.created_at)} ({detail.last_ai_interaction.section_slug})</div>
                    )}
                  </div>
                </section>

                <section style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Modos utilizados</div>
                  {detail.modes_used.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nenhum projeto criado ainda.</p>}
                  <div style={{ display: 'grid', gap: '0.3rem' }}>
                    {detail.modes_used.map(m => (
                      <div key={m.mode} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                        <span>{m.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{m.count}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Projetos ({detail.projects.length})</div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {detail.projects.map(p => (
                      <div key={p.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{p.title || '(sem título)'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                          {p.mode_label} · {p.passage_ref || p.book || ''} · {p.status} · atualizado {dateLabel(p.updated_at)}
                        </div>
                      </div>
                    ))}
                    {detail.projects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Nenhum projeto.</p>}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
