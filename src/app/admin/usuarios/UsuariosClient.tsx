'use client'

import { useMemo, useState } from 'react'
import { setUserBlocked, setUserPlan, resetAiUsage } from './actions'

// ─── Types ────────────────────────────────────────────────────────────────────

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

type EnrichedUser = AdminUserRow & { _health: number }

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

type DrawerTab = 'geral' | 'uso' | 'projetos'
type StatusKey = 'ativo' | 'inativo' | 'novo' | 'bloqueado' | 'cancelado'
type SortKey = 'name' | 'created_at' | 'last_active_at' | 'project_count' | 'ai_calls_30d' | 'plan' | 'health'
type HealthFilter = 'all' | 'excelente' | 'saudavel' | 'pouco_ativo' | 'em_risco' | 'inativo'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_OPTIONS = ['free', 'student', 'pastor', 'ministry', 'seminary'] as const

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuito',
  student: 'Iniciante',
  pastor: 'Intermediário',
  ministry: 'Premium',
  seminary: 'Institucional',
}

const PLAN_COLORS: Record<string, string> = {
  free: '#6B7280',
  student: '#3B82F6',
  pastor: '#8B5CF6',
  ministry: '#F59E0B',
  seminary: '#10B981',
}

const AVATAR_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4']

// ─── Utility functions ────────────────────────────────────────────────────────

function daysSince(date: string | null): number {
  if (!date) return Infinity
  return (Date.now() - new Date(date).getTime()) / 86400000
}

function fmtDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtRelative(value: string | null): string {
  if (!value) return 'Nunca'
  const days = daysSince(value)
  if (days < 1) return 'Hoje'
  if (days < 2) return 'Ontem'
  if (days < 7) return `${Math.floor(days)}d`
  if (days < 30) return `${Math.floor(days / 7)}sem`
  if (days < 365) return `${Math.floor(days / 30)}m`
  return `${Math.floor(days / 365)}a`
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(' ').filter(Boolean)
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (email?.[0] ?? '?').toUpperCase()
}

function computeStatus(row: AdminUserRow): { key: StatusKey; label: string; color: string; bg: string } {
  if (row.is_blocked) return { key: 'bloqueado', label: 'Bloqueado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' }
  if (row.subscription_status && ['cancelled', 'canceled'].includes(row.subscription_status)) {
    return { key: 'cancelado', label: 'Cancelado', color: '#F97316', bg: 'rgba(249,115,22,0.1)' }
  }
  if (daysSince(row.created_at) <= 7) return { key: 'novo', label: 'Novo', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' }
  if (daysSince(row.last_active_at) <= 30) return { key: 'ativo', label: 'Ativo', color: '#10B981', bg: 'rgba(16,185,129,0.1)' }
  return { key: 'inativo', label: 'Inativo', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' }
}

function computeHealthScore(row: AdminUserRow): number {
  if (row.is_blocked || !row.last_active_at) return 0
  const days = daysSince(row.last_active_at)
  let score = 0

  // Recência: 0-40
  if (days <= 1) score += 40
  else if (days <= 7) score += 32
  else if (days <= 14) score += 20
  else if (days <= 30) score += 10

  // Projetos: 0-25
  if (row.project_count >= 10) score += 25
  else if (row.project_count >= 5) score += 18
  else if (row.project_count >= 2) score += 10
  else if (row.project_count >= 1) score += 5

  // IA: 0-20
  if (row.ai_calls_30d >= 20) score += 20
  else if (row.ai_calls_30d >= 10) score += 14
  else if (row.ai_calls_30d >= 5) score += 8
  else if (row.ai_calls_30d >= 1) score += 3

  // Plano: 0-15
  const planScore: Record<string, number> = { seminary: 15, ministry: 12, pastor: 10, student: 6, free: 0 }
  score += planScore[row.plan] ?? 0

  return Math.min(100, score)
}

function getHealthMeta(score: number): { label: string; color: string; bg: string; key: string } {
  if (score >= 80) return { label: 'Excelente', color: '#10B981', bg: 'rgba(16,185,129,0.08)', key: 'excelente' }
  if (score >= 60) return { label: 'Saudável', color: '#34D399', bg: 'rgba(52,211,153,0.08)', key: 'saudavel' }
  if (score >= 40) return { label: 'Pouco ativo', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', key: 'pouco_ativo' }
  if (score >= 15) return { label: 'Em risco', color: '#F97316', bg: 'rgba(249,115,22,0.08)', key: 'em_risco' }
  return { label: 'Inativo', color: '#EF4444', bg: 'rgba(239,68,68,0.08)', key: 'inativo' }
}

function computeSummary(rows: AdminUserRow[]) {
  const now = Date.now()
  const ms = (d: number) => now - d * 86400000
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()

  return {
    total: rows.length,
    newToday: rows.filter(r => daysSince(r.created_at) < 1).length,
    new7d: rows.filter(r => new Date(r.created_at).getTime() >= ms(7)).length,
    newMonth: rows.filter(r => new Date(r.created_at).getTime() >= monthStart).length,
    active7d: rows.filter(r => r.last_active_at && new Date(r.last_active_at).getTime() >= ms(7)).length,
    active30d: rows.filter(r => r.last_active_at && new Date(r.last_active_at).getTime() >= ms(30)).length,
    inactive: rows.filter(r => !r.last_active_at || daysSince(r.last_active_at) > 30).length,
    neverAccessed: rows.filter(r => !r.last_active_at).length,
    free: rows.filter(r => r.plan === 'free').length,
    student: rows.filter(r => r.plan === 'student').length,
    pastor: rows.filter(r => r.plan === 'pastor').length,
    ministry: rows.filter(r => r.plan === 'ministry').length,
    seminary: rows.filter(r => r.plan === 'seminary').length,
    paid: rows.filter(r => r.plan !== 'free').length,
    blocked: rows.filter(r => !!r.is_blocked).length,
    cancelled: rows.filter(r => r.subscription_status != null && ['cancelled', 'canceled'].includes(r.subscription_status)).length,
    totalProjects: rows.reduce((s, r) => s + (r.project_count ?? 0), 0),
    totalProductions: rows.reduce((s, r) => s + (r.production_count ?? 0), 0),
    aiCalls30d: rows.reduce((s, r) => s + (r.ai_calls_30d ?? 0), 0),
    aiCostUsd: rows.reduce((s, r) => s + (r.ai_cost_usd_30d ?? 0), 0),
    heavyIa: rows.filter(r => r.ai_calls_30d >= 20).length,
    atRisk: rows.filter(r => {
      if (r.is_blocked || r.plan === 'free') return false
      const d = daysSince(r.last_active_at)
      return d > 14 && d <= 45
    }).length,
    activationRate: rows.length > 0
      ? Math.round(rows.filter(r => !!r.last_active_at).length / rows.length * 100)
      : 0,
  }
}

function downloadCsv(rows: EnrichedUser[]) {
  const header = ['Nome', 'Email', 'Plano', 'Status', 'Health Score', 'Health', 'Cadastro', 'Último acesso', 'Projetos', 'Produções', 'IA 30d', 'Custo IA (USD)']
  const lines = rows.map(r => {
    const status = computeStatus(r).label
    const h = getHealthMeta(r._health)
    return [
      r.full_name ?? '',
      r.email ?? '',
      PLAN_LABELS[r.plan] ?? r.plan,
      status,
      String(r._health),
      h.label,
      fmtDate(r.created_at),
      fmtDate(r.last_active_at),
      String(r.project_count),
      String(r.production_count),
      String(r.ai_calls_30d),
      r.ai_cost_usd_30d.toFixed(4),
    ].map(f => `"${f.replace(/"/g, '""')}"`).join(',')
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div style={{ padding: '0.75rem 0.875rem', background: 'var(--background)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: accent ?? 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

function GroupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '1rem', background: 'var(--surface)' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>{title}</div>
      {children}
    </div>
  )
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '0.68rem', fontWeight: 600,
      color, background: bg,
      borderRadius: 4, padding: '0.15rem 0.45rem',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function Avatar({ name, email, size = 32 }: { name: string | null; email: string | null; size?: number }) {
  const idx = (email?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: AVATAR_COLORS[idx], color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.375, fontWeight: 700, flexShrink: 0,
      userSelect: 'none',
    }}>
      {getInitials(name, email)}
    </div>
  )
}

function HealthBar({ score }: { score: number }) {
  const meta = getHealthMeta(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: 44, height: 3, background: 'var(--border-subtle)', borderRadius: 2, flexShrink: 0 }}>
        <div style={{ width: `${score}%`, height: '100%', background: meta.color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: '0.7rem', color: meta.color, fontWeight: 600, minWidth: 62 }}>{meta.label}</span>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0.75rem 0' }} />
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UsuariosClient({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusKey | 'all'>('all')
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<DetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('geral')
  const [busyId, setBusyId] = useState<string | null>(null)

  const summary = useMemo(() => computeSummary(users), [users])

  const enriched = useMemo<EnrichedUser[]>(
    () => users.map(u => ({ ...u, _health: computeHealthScore(u) })),
    [users]
  )

  const filtered = useMemo<EnrichedUser[]>(() => {
    const term = search.trim().toLowerCase()
    let list = enriched.filter(u => {
      if (term && !(u.full_name ?? '').toLowerCase().includes(term) && !(u.email ?? '').toLowerCase().includes(term)) return false
      if (planFilter !== 'all' && u.plan !== planFilter) return false
      if (statusFilter !== 'all' && computeStatus(u).key !== statusFilter) return false
      if (healthFilter !== 'all' && getHealthMeta(u._health).key !== healthFilter) return false
      return true
    })

    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = (a.full_name ?? a.email ?? '').localeCompare(b.full_name ?? b.email ?? '')
      else if (sortKey === 'created_at') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      else if (sortKey === 'last_active_at') cmp = (a.last_active_at ? new Date(a.last_active_at).getTime() : 0) - (b.last_active_at ? new Date(b.last_active_at).getTime() : 0)
      else if (sortKey === 'project_count') cmp = a.project_count - b.project_count
      else if (sortKey === 'ai_calls_30d') cmp = a.ai_calls_30d - b.ai_calls_30d
      else if (sortKey === 'plan') cmp = a.plan.localeCompare(b.plan)
      else if (sortKey === 'health') cmp = a._health - b._health
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [enriched, search, planFilter, statusFilter, healthFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  async function openDetail(id: string) {
    setSelectedId(id)
    setDetail(null)
    setDetailLoading(true)
    setDrawerTab('geral')
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (res.ok) setDetail(await res.json())
    } finally {
      setDetailLoading(false)
    }
  }

  function closeDrawer() { setSelectedId(null); setDetail(null) }

  async function handleToggleBlock(row: AdminUserRow) {
    const next = !row.is_blocked
    if (!window.confirm(next ? `Bloquear ${row.full_name ?? row.email}?` : `Desbloquear ${row.full_name ?? row.email}?`)) return
    setBusyId(row.id)
    const result = await setUserBlocked(row.id, next)
    setBusyId(null)
    if (result?.success) {
      setUsers(prev => prev.map(u => u.id === row.id ? { ...u, is_blocked: next } : u))
      if (detail?.profile.id === row.id) setDetail(prev => prev ? { ...prev, profile: { ...prev.profile, is_blocked: next } } : prev)
    } else if (result?.error) window.alert(result.error)
  }

  async function handlePlanChange(row: AdminUserRow, plan: string) {
    setBusyId(row.id)
    const result = await setUserPlan(row.id, plan)
    setBusyId(null)
    if (result?.success) {
      setUsers(prev => prev.map(u => u.id === row.id ? { ...u, plan } : u))
      if (detail?.profile.id === row.id) setDetail(prev => prev ? { ...prev, profile: { ...prev.profile, plan } } : prev)
    } else if (result?.error) window.alert(result.error)
  }

  async function handleResetAi(row: AdminUserRow) {
    if (!window.confirm(`Redefinir o uso de IA deste mês para ${row.full_name ?? row.email}?`)) return
    setBusyId(row.id)
    const result = await resetAiUsage(row.id)
    setBusyId(null)
    if (result?.error) window.alert(result.error)
  }

  function SortArrow({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ opacity: 0.25, marginLeft: 2 }}>↕</span>
    return <span style={{ color: '#3B82F6', marginLeft: 2 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const TH_STYLE = {
    padding: '0.55rem 0.75rem',
    borderBottom: '1px solid var(--border-subtle)',
    fontWeight: 500, fontSize: '0.7rem', color: 'var(--text-muted)',
    textAlign: 'left' as const, whiteSpace: 'nowrap' as const,
    cursor: 'pointer', userSelect: 'none' as const, letterSpacing: '0.03em',
  }
  const TD_STYLE = {
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid var(--border-subtle)',
    verticalAlign: 'middle' as const,
  }

  const paidPlans = (['student', 'pastor', 'ministry', 'seminary'] as const).filter(p => summary[p] > 0)

  return (
    <div>

      {/* ══════════ DASHBOARD EXECUTIVO ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>

        <GroupCard title="Usuários">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <MetricCard label="Total" value={summary.total} />
            <MetricCard label="Novos hoje" value={summary.newToday} accent={summary.newToday > 0 ? '#3B82F6' : undefined} />
            <MetricCard label="Ativos 7d" value={summary.active7d}
              sub={`${Math.round(summary.active7d / Math.max(1, summary.total) * 100)}% do total`}
              accent="#10B981" />
            <MetricCard label="Ativos 30d" value={summary.active30d} />
            <MetricCard label="Nunca acessaram" value={summary.neverAccessed}
              accent={summary.neverAccessed > 0 ? '#EF4444' : undefined} />
            <MetricCard label="Novos (30d)" value={summary.newMonth} accent="#3B82F6" />
          </div>
        </GroupCard>

        <GroupCard title="Assinaturas">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <MetricCard label="Gratuito" value={summary.free} />
            <MetricCard label="Pagos" value={summary.paid} accent="#10B981" />
            <MetricCard label="Cancelados" value={summary.cancelled} accent={summary.cancelled > 0 ? '#EF4444' : undefined} />
            <MetricCard label="Bloqueados" value={summary.blocked} accent={summary.blocked > 0 ? '#EF4444' : undefined} />
          </div>
          {paidPlans.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.25rem' }}>
              {paidPlans.map(p => (
                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
                  <span style={{ color: PLAN_COLORS[p], fontWeight: 600 }}>{PLAN_LABELS[p]}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{summary[p]}</span>
                </div>
              ))}
            </div>
          )}
        </GroupCard>

        <GroupCard title="Plataforma">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <MetricCard label="Projetos" value={summary.totalProjects} />
            <MetricCard label="Publicações" value={summary.totalProductions} />
            <MetricCard label="Consultas IA (30d)" value={summary.aiCalls30d} accent="#8B5CF6" />
            <MetricCard label="Custo IA (30d)" value={`$${summary.aiCostUsd.toFixed(2)}`} accent="#8B5CF6"
              sub="USD estimado" />
          </div>
        </GroupCard>

        <GroupCard title="Engajamento">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <MetricCard label="Taxa ativação" value={`${summary.activationRate}%`}
              accent={summary.activationRate >= 70 ? '#10B981' : '#F59E0B'} />
            <MetricCard label="Heavy IA (≥20)" value={summary.heavyIa} accent="#8B5CF6" />
            <MetricCard label="Novos (7d)" value={summary.new7d} accent="#3B82F6" />
            <MetricCard label="Em risco" value={summary.atRisk}
              accent={summary.atRisk > 0 ? '#F97316' : undefined}
              sub="pagos + 14d sem acesso" />
          </div>
        </GroupCard>

      </div>

      {/* ══════════ TOOLBAR ══════════ */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email…"
          style={{
            flex: '1 1 220px', padding: '0.5rem 0.75rem',
            borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.84rem',
          }}
        />
        <select
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
          style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
        >
          <option value="all">Todos os planos</option>
          {PLAN_OPTIONS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusKey | 'all')}
          style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="novo">Novo</option>
          <option value="bloqueado">Bloqueado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select
          value={healthFilter}
          onChange={e => setHealthFilter(e.target.value as HealthFilter)}
          style={{ padding: '0.5rem 0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.8rem' }}
        >
          <option value="all">Todos os health scores</option>
          <option value="excelente">Excelente (≥80)</option>
          <option value="saudavel">Saudável (60–79)</option>
          <option value="pouco_ativo">Pouco ativo (40–59)</option>
          <option value="em_risco">Em risco (15–39)</option>
          <option value="inativo">Inativo (&lt;15)</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {filtered.length} / {users.length}
          </span>
          <button
            onClick={() => downloadCsv(filtered)}
            style={{
              padding: '0.45rem 0.75rem', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500,
            }}
          >
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {/* ══════════ TABELA ══════════ */}
      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface)' }}>
                <th style={{ ...TH_STYLE, width: 28, cursor: 'default' }}></th>
                <th style={TH_STYLE} onClick={() => toggleSort('name')}>Usuário<SortArrow col="name" /></th>
                <th style={TH_STYLE} onClick={() => toggleSort('plan')}>Plano<SortArrow col="plan" /></th>
                <th style={TH_STYLE}>Status</th>
                <th style={TH_STYLE} onClick={() => toggleSort('health')}>Health<SortArrow col="health" /></th>
                <th style={TH_STYLE} onClick={() => toggleSort('last_active_at')}>Último acesso<SortArrow col="last_active_at" /></th>
                <th style={TH_STYLE} onClick={() => toggleSort('project_count')}>Proj.<SortArrow col="project_count" /></th>
                <th style={TH_STYLE} onClick={() => toggleSort('ai_calls_30d')}>IA 30d<SortArrow col="ai_calls_30d" /></th>
                <th style={{ ...TH_STYLE, cursor: 'default' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const status = computeStatus(row)
                const isOpen = selectedId === row.id
                return (
                  <tr
                    key={row.id}
                    style={{ background: isOpen ? 'rgba(59,130,246,0.04)' : 'transparent' }}
                  >
                    <td style={{ ...TD_STYLE, paddingRight: 4 }}>
                      <Avatar name={row.full_name} email={row.email} size={26} />
                    </td>
                    <td style={TD_STYLE}>
                      <button
                        onClick={() => openDetail(row.id)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)' }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{row.full_name || '—'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.71rem' }}>{row.email}</div>
                      </button>
                    </td>
                    <td style={TD_STYLE}>
                      <select
                        value={row.plan}
                        disabled={busyId === row.id}
                        onChange={e => handlePlanChange(row, e.target.value)}
                        style={{
                          padding: '0.2rem 0.35rem', borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: PLAN_COLORS[row.plan] ?? 'var(--text-primary)',
                          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {PLAN_OPTIONS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                      </select>
                    </td>
                    <td style={TD_STYLE}>
                      <Badge label={status.label} color={status.color} bg={status.bg} />
                    </td>
                    <td style={TD_STYLE}>
                      <HealthBar score={row._health} />
                    </td>
                    <td style={{ ...TD_STYLE, color: 'var(--text-muted)', fontSize: '0.77rem' }}>
                      {fmtRelative(row.last_active_at)}
                    </td>
                    <td style={{ ...TD_STYLE, textAlign: 'center' as const }}>
                      <span style={{ fontWeight: row.project_count > 0 ? 600 : 400 }}>{row.project_count}</span>
                    </td>
                    <td style={{ ...TD_STYLE, textAlign: 'center' as const }}>
                      <span style={{ color: row.ai_calls_30d >= 20 ? '#8B5CF6' : 'var(--text-primary)', fontWeight: row.ai_calls_30d >= 20 ? 700 : 400 }}>
                        {row.ai_calls_30d}
                      </span>
                    </td>
                    <td style={TD_STYLE}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          onClick={() => openDetail(row.id)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer' }}
                        >
                          Ver
                        </button>
                        <button
                          disabled={busyId === row.id}
                          onClick={() => handleToggleBlock(row)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: row.is_blocked ? '#10B981' : '#EF4444', fontSize: '0.72rem', cursor: 'pointer' }}
                        >
                          {row.is_blocked ? 'Desbloq.' : 'Bloq.'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                    Nenhum usuário encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════ DRAWER 360° ══════════ */}
      {selectedId && (
        <>
          <div
            onClick={closeDrawer}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 500 }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0,
            width: 'min(500px, 100vw)', height: '100vh',
            background: 'var(--background)',
            borderLeft: '1px solid var(--border)',
            zIndex: 501, display: 'flex', flexDirection: 'column',
          }}>

            {/* Cabeçalho do drawer */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <Avatar
                name={detail?.profile.full_name ?? null}
                email={detail?.profile.email ?? null}
                size={38}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {detailLoading ? 'Carregando…' : (detail?.profile.full_name || '—')}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {detail?.profile.email}
                </div>
              </div>
              <button
                onClick={closeDrawer}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.3rem', lineHeight: 1, padding: '0.2rem', flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            {/* Ações rápidas */}
            {detail && (
              <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0, background: 'var(--surface)' }}>
                <button
                  disabled={busyId === detail.profile.id}
                  onClick={() => handleToggleBlock(detail.profile)}
                  style={{
                    padding: '0.3rem 0.65rem', borderRadius: 6, fontSize: '0.76rem', cursor: 'pointer', fontWeight: 500,
                    border: `1px solid ${detail.profile.is_blocked ? '#10B981' : '#EF4444'}`,
                    background: 'transparent',
                    color: detail.profile.is_blocked ? '#10B981' : '#EF4444',
                  }}
                >
                  {detail.profile.is_blocked ? 'Desbloquear' : 'Bloquear'}
                </button>
                <button
                  disabled={busyId === detail.profile.id}
                  onClick={() => handleResetAi(detail.profile)}
                  style={{ padding: '0.3rem 0.65rem', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.76rem', cursor: 'pointer', fontWeight: 500 }}
                >
                  Reset IA
                </button>
                <a
                  href={`mailto:${detail.profile.email}`}
                  style={{
                    padding: '0.3rem 0.65rem', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-secondary)',
                    fontSize: '0.76rem', cursor: 'pointer', fontWeight: 500,
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                  }}
                >
                  Enviar e-mail
                </a>
              </div>
            )}

            {/* Abas */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, padding: '0 1.25rem' }}>
              {(['geral', 'uso', 'projetos'] as DrawerTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  style={{
                    padding: '0.6rem 0.875rem', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: '0.8rem', fontWeight: drawerTab === tab ? 700 : 400,
                    color: drawerTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: drawerTab === tab ? '2px solid #3B82F6' : '2px solid transparent',
                    marginBottom: -1,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Conteúdo da aba */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              {detailLoading && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Carregando dados…</p>
              )}

              {/* ── Aba: Geral ── */}
              {detail && drawerTab === 'geral' && (
                <div style={{ display: 'grid', gap: '1rem' }}>

                  {/* Badges de status */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Badge {...computeStatus(detail.profile)} label={computeStatus(detail.profile).label} />
                    <Badge
                      label={PLAN_LABELS[detail.profile.plan] ?? detail.profile.plan}
                      color={PLAN_COLORS[detail.profile.plan] ?? '#6B7280'}
                      bg={`${PLAN_COLORS[detail.profile.plan] ?? '#6B7280'}18`}
                    />
                    {detail.profile.role === 'admin' && <Badge label="Admin" color="#8B5CF6" bg="rgba(139,92,246,0.1)" />}
                    {detail.profile.is_hub_editor && <Badge label="Hub Editor" color="#F59E0B" bg="rgba(245,158,11,0.1)" />}
                  </div>

                  {/* Health Score */}
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '0.875rem', background: 'var(--surface)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Customer Health Score</div>
                    <HealthBar score={computeHealthScore(detail.profile)} />
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      {computeHealthScore(detail.profile)}/100 — recência, engajamento e plano
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <InfoRow label="Cadastro" value={fmtDate(detail.profile.created_at)} />
                    <InfoRow label="Último acesso" value={fmtRelative(detail.profile.last_active_at)} />
                    <InfoRow label="Role" value={detail.profile.role ?? 'user'} />
                    <InfoRow label="Assinatura" value={detail.profile.subscription_status ?? '—'} />
                    <InfoRow label="Projetos" value={detail.profile.project_count} />
                    <InfoRow label="Publicações" value={detail.profile.production_count} />
                  </div>

                  {/* Trocar plano */}
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '0.875rem', background: 'var(--surface)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Trocar plano</div>
                    <select
                      value={detail.profile.plan}
                      disabled={busyId === detail.profile.id}
                      onChange={e => handlePlanChange(detail.profile, e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.86rem' }}
                    >
                      {PLAN_OPTIONS.map(p => <option key={p} value={p}>{PLAN_LABELS[p]}</option>)}
                    </select>
                  </div>

                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {detail.profile.id}
                  </div>
                </div>
              )}

              {/* ── Aba: Uso ── */}
              {detail && drawerTab === 'uso' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <MetricCard label="Consultas este mês" value={detail.ai_usage_this_month} accent="#8B5CF6" />
                    <MetricCard label="Consultas 30d" value={detail.profile.ai_calls_30d} accent="#8B5CF6" />
                    <MetricCard label="Custo est. 30d" value={`$${detail.profile.ai_cost_usd_30d.toFixed(4)}`} />
                    <MetricCard label="Publicações" value={detail.profile.production_count} />
                  </div>

                  {detail.last_ai_interaction && (
                    <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '0.875rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Última consulta IA</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>{fmtDate(detail.last_ai_interaction.created_at)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'monospace' }}>{detail.last_ai_interaction.section_slug}</div>
                    </div>
                  )}

                  {detail.modes_used.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Modos utilizados</div>
                      <div style={{ display: 'grid', gap: '0.3rem' }}>
                        {detail.modes_used.map(m => {
                          const pct = Math.round(m.count / Math.max(1, detail.profile.project_count) * 100)
                          return (
                            <div key={m.mode} style={{ padding: '0.45rem 0.7rem', background: 'var(--surface)', borderRadius: 7, border: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.8rem' }}>{m.label}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.count} proj.</span>
                              </div>
                              <div style={{ height: 2, background: 'var(--border-subtle)', borderRadius: 1 }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#8B5CF6', borderRadius: 1 }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {detail.modes_used.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', textAlign: 'center', padding: '2rem' }}>Nenhuma atividade de IA registrada.</p>
                  )}
                </div>
              )}

              {/* ── Aba: Projetos ── */}
              {detail && drawerTab === 'projetos' && (
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {detail.projects.length} projeto{detail.projects.length !== 1 ? 's' : ''}
                  </div>
                  {detail.projects.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', textAlign: 'center', padding: '3rem' }}>Nenhum projeto criado.</div>
                  )}
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {detail.projects.map(p => {
                      const statusColor = p.status === 'completed' ? '#10B981' : p.status === 'in_progress' ? '#3B82F6' : '#6B7280'
                      const statusBg = p.status === 'completed' ? 'rgba(16,185,129,0.1)' : p.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(107,114,128,0.1)'
                      return (
                        <div key={p.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.65rem 0.875rem', background: 'var(--surface)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.83rem', marginBottom: '0.25rem' }}>{p.title || '(sem título)'}</div>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.69rem', color: 'var(--text-muted)' }}>{p.mode_label}</span>
                            {p.passage_ref && <span style={{ fontSize: '0.69rem', color: 'var(--text-muted)' }}>· {p.passage_ref}</span>}
                            <span style={{ fontSize: '0.69rem', color: 'var(--text-muted)' }}>· {fmtRelative(p.updated_at)}</span>
                            <Badge label={p.status} color={statusColor} bg={statusBg} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}
