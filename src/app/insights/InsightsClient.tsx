'use client'

import { useState, useMemo, cloneElement, isValidElement } from 'react'
import { useRouter } from 'next/navigation'
import {
  STUDY_MODE_REGISTRY,
  getModeConfig,
  type StudyModeId,
  type StudyModeConfig,
} from '@/lib/study-modes'
import type { Project } from '@/types/database'

// ── Constants ─────────────────────────────────────────────────────────────

const BOOKS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
  'Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis',
  '1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó',
  'Salmos','Provérbios','Eclesiastes','Cântico dos Cânticos',
  'Isaías','Jeremias','Lamentações','Ezequiel','Daniel',
  'Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias',
]

const BOOKS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos',
  '1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus',
  'Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João',
  'Judas','Apocalipse',
]

const MODE_ICONS: Record<StudyModeId, React.ReactNode> = {
  estudo_de_salmos_sabedoria: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  estudo_de_profecias: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M12 12v10"/>
    </svg>
  ),
  estudo_narrativas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  ),
  exegese_biblica: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  ),
  estudo_de_carta: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  ),
  estudo_doutrinario: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  estudo_tematico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  ),
  estudo_termos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5V5a2 2 0 0 1 2-2h12"/>
      <path d="M6 21h12a2 2 0 0 0 2-2V7H8a2 2 0 0 0-2 2v12z"/>
      <path d="M10 12h6M10 16h4"/>
    </svg>
  ),
  sermao: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v4M8 23h8"/>
    </svg>
  ),
  estudo_biblico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  devocional: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  aula: '🏫',
  artigo: '📝',
  ebook: '📙',
  livro: '📕',
  palestra: '🎤',
  curso: '🎓',
  serie_mensagens: '🧩',
  comentario_exegetico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
}

const MODE_VISUALS: Record<StudyModeId, { color: string; bg: string; border: string }> = {
  devocional:                  { color: '#BE3455', bg: 'rgba(190,52,85,0.08)',  border: 'rgba(190,52,85,0.18)' },
  sermao:                      { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  estudo_biblico:               { color: '#163A6B', bg: 'rgba(30,77,140,0.08)',  border: 'rgba(30,77,140,0.18)' },
  estudo_de_salmos_sabedoria:  { color: '#6D28D9', bg: 'rgba(109,40,217,0.08)', border: 'rgba(109,40,217,0.18)' },
  estudo_de_profecias:         { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.18)' },
  estudo_narrativas:           { color: '#92400E', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.18)' },
  estudo_doutrinario:          { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.18)' },
  estudo_tematico:             { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  estudo_termos:               { color: '#0D9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)' },
  exegese_biblica:             { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  estudo_de_carta:             { color: '#475569', bg: 'rgba(71,85,105,0.08)',  border: 'rgba(71,85,105,0.18)' },
  aula:                        { color: '#163A6B', bg: 'rgba(30,77,140,0.08)',  border: 'rgba(30,77,140,0.18)' },
  artigo:                      { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  ebook:                       { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  livro:                       { color: '#92400E', bg: 'rgba(146,64,14,0.08)',  border: 'rgba(146,64,14,0.18)' },
  palestra:                    { color: '#DB2777', bg: 'rgba(219,39,119,0.08)', border: 'rgba(219,39,119,0.18)' },
  curso:                       { color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)' },
  serie_mensagens:             { color: '#7C2D12', bg: 'rgba(124,45,18,0.08)',  border: 'rgba(124,45,18,0.18)' },
  comentario_exegetico:        { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.18)' },
}

const SECTION_ORDER: StudyModeId[] = [
  'devocional', 'sermao', 'estudo_de_salmos_sabedoria', 'estudo_de_profecias',
  'estudo_narrativas', 'estudo_doutrinario', 'estudo_tematico', 'estudo_termos',
  'exegese_biblica', 'estudo_de_carta', 'comentario_exegetico', 'aula', 'artigo',
  'ebook', 'livro', 'palestra', 'curso', 'serie_mensagens', 'estudo_biblico',
]

const GENRE_LABEL: Partial<Record<StudyModeId, string>> = {
  sermao: 'Sermão', exegese_biblica: 'Exegese',
  estudo_de_carta: 'Cartas', estudo_de_salmos_sabedoria: 'Salmos e Sabedoria',
  estudo_narrativas: 'Narrativas', estudo_de_profecias: 'Profecias',
  estudo_doutrinario: 'Doutrina', estudo_tematico: 'Temático',
  estudo_termos: 'Estudo de Termos',
  devocional: 'Devocional', comentario_exegetico: 'Comentário', estudo_biblico: 'Est. Bíblico',
  aula: 'Aula', artigo: 'Artigo', ebook: 'E-book', livro: 'Livro',
  palestra: 'Palestra', curso: 'Curso', serie_mensagens: 'Série',
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60)    return 'Agora'
  if (diff < 3600)  return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  const days = Math.floor(diff / 86400)
  if (days === 1)   return 'Ontem'
  if (days < 7)    return `${days} dias atrás`
  if (days < 30)   return `${Math.floor(days / 7)} sem. atrás`
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

function modeVisual(modeId: StudyModeId) {
  return MODE_VISUALS[modeId]
}

function modeIcon(modeId: StudyModeId, size: number) {
  const icon = MODE_ICONS[modeId]
  return isValidElement<{ width?: number; height?: number }>(icon)
    ? cloneElement(icon, { width: size, height: size })
    : icon
}

// ── Sub-components ────────────────────────────────────────────────────────

function CollapseHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.1rem 0', fontFamily: 'inherit',
      }}
    >
      <svg
        width="9" height="9" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </button>
  )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div style={{ width: 100, height: 100, flexShrink: 0 }} />

  let cumPct = 0
  const stops = data.map(d => {
    const pct = (d.value / total) * 100
    const stop = `${d.color} ${cumPct.toFixed(1)}% ${(cumPct + pct).toFixed(1)}%`
    cumPct += pct
    return stop
  }).join(', ')

  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: `conic-gradient(${stops})` }} />
      <div style={{ position: 'absolute', inset: '22px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</span>
      </div>
    </div>
  )
}

function BibleMap({ studiedBooks }: { studiedBooks: Set<string> }) {
  const studiedAT = BOOKS_AT.filter(b => studiedBooks.has(b)).length
  const studiedNT = BOOKS_NT.filter(b => studiedBooks.has(b)).length

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', marginTop: '0.85rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: '#D97706', padding: '0.18rem 0.55rem', background: 'rgba(217,119,6,0.08)', borderRadius: '99px', fontWeight: 600 }}>AT: {studiedAT}/{BOOKS_AT.length}</span>
        <span style={{ fontSize: '0.72rem', color: '#7C3AED', padding: '0.18rem 0.55rem', background: 'rgba(124,58,237,0.08)', borderRadius: '99px', fontWeight: 600 }}>NT: {studiedNT}/{BOOKS_NT.length}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.18rem 0.55rem', background: 'var(--surface-2)', borderRadius: '99px', fontWeight: 600 }}>Total: {studiedAT + studiedNT}/66</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { label: 'Antigo Testamento', books: BOOKS_AT, accentColor: '#D97706' },
          { label: 'Novo Testamento',   books: BOOKS_NT, accentColor: '#7C3AED' },
        ].map(section => (
          <div key={section.label}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{section.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
              {section.books.map(book => {
                const studied = studiedBooks.has(book)
                return (
                  <span key={book} title={studied ? `${book} — estudado` : book} style={{
                    padding: '0.18rem 0.5rem', borderRadius: '4px', fontSize: '0.66rem',
                    fontWeight: studied ? 600 : 400,
                    background: studied ? section.accentColor : 'var(--surface-2)',
                    color: studied ? '#FFFFFF' : 'var(--text-muted)',
                    border: `1px solid ${studied ? section.accentColor : 'var(--border-subtle)'}`,
                    cursor: 'default', whiteSpace: 'nowrap',
                  }}>
                    {book}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectCard({
  project, mode, onClick, onDelete,
}: {
  project: Project
  mode: StudyModeConfig
  onClick: () => void
  onDelete: () => void
}) {
  const visual = modeVisual(mode.id as StudyModeId)
  const isCompleted = project.status === 'completed'
  const isPassage   = mode.passageBased
  const subtitle = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.7rem',
        padding: '0.6rem 0.85rem', borderRadius: '8px',
        background: hovered ? 'rgba(15,23,42,0.025)' : 'transparent',
        cursor: 'pointer', transition: 'background 0.1s', position: 'relative',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden' }}>
          <span style={{ color: visual.color, fontWeight: 500, opacity: 0.85, flexShrink: 0 }}>{mode.name}</span>
          {subtitle && (
            <>
              <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
              <span style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</span>
            </>
          )}
          <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
          <span style={{ flexShrink: 0 }}>{isCompleted ? 'Concluído' : formatDate(project.updated_at)}</span>
        </div>
      </div>

      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.2rem 0.3rem',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            opacity: hovered || menuOpen ? 1 : 0,
            transition: 'opacity 0.15s, background 0.12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
        {menuOpen && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20, background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px' }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>

      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  projects: Project[]
}

export default function InsightsClient({ projects: initialProjects }: Props) {
  const router = useRouter()

  const [projects,        setProjects]        = useState<Project[]>(initialProjects)
  const [deleteTarget,    setDeleteTarget]    = useState<Project | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const [collapsedAnalytics, setCollapsedAnalytics] = useState(
    () => new Set(['distribuicao', 'genero', 'recente', 'mapa', 'todos']),
  )
  function toggleAnalytics(key: string) {
    setCollapsedAnalytics(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const [collapsedSections, setCollapsedSections] = useState<Set<StudyModeId>>(
    () => new Set(SECTION_ORDER),
  )
  function toggleSection(id: StudyModeId) {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const dashboardProjects = useMemo(() => {
    const seen = new Set<string>()
    return projects.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
  }, [projects])

  const totalCount = dashboardProjects.length

  const studiedBooks = useMemo(
    () => new Set(dashboardProjects.map(p => p.book).filter((b): b is string => !!b && b !== '—')),
    [dashboardProjects],
  )

  const genreDistribution = useMemo(() => {
    const counts = new Map<StudyModeId, number>()
    for (const p of dashboardProjects) {
      const id = getModeConfig(p.study_mode ?? p.project_type).id
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        id, count,
        label: GENRE_LABEL[id] ?? id,
        color: MODE_VISUALS[id]?.color ?? '#64748B',
      }))
  }, [dashboardProjects])

  const topBooks = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of dashboardProjects) {
      if (p.book && p.book !== '—') counts.set(p.book, (counts.get(p.book) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [dashboardProjects])

  const projectsByMode = useMemo(() => {
    const map = new Map<StudyModeId, Project[]>()
    for (const p of dashboardProjects) {
      const mode = getModeConfig(p.study_mode ?? p.project_type)
      const arr = map.get(mode.id) ?? []
      arr.push(p)
      map.set(mode.id, arr)
    }
    return map
  }, [dashboardProjects])

  const libraryModes = useMemo(
    () => SECTION_ORDER.filter(id => (projectsByMode.get(id)?.length ?? 0) > 0),
    [projectsByMode],
  )

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteConfirming(true)
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleteConfirming(false)
    }
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem 0', maxWidth: '960px', margin: '0 auto' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Insights
        </span>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1.5rem 5rem' }}>

        {totalCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum dado ainda.</p>
            <p style={{ fontSize: '0.85rem' }}>Crie projetos no Painel para ver análises aqui.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* ── Stats ── */}
            <section>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                {([
                  { label: 'Total',           value: totalCount,        color: 'var(--accent)', icon: '📚' },
                  { label: 'Livros bíblicos', value: studiedBooks.size,  color: '#7C3AED',       icon: '🗺' },
                  { label: 'Gêneros',         value: genreDistribution.length, color: '#D97706', icon: '📊' },
                  { label: 'Com texto ref.',  value: topBooks.length,   color: '#10B981',        icon: '📖' },
                ] as const).map(stat => (
                  <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.1rem 1.2rem' }}>
                    <div style={{ fontSize: '1.05rem', marginBottom: '0.4rem', lineHeight: 1 }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: '0.2rem' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Distribuição + Livros ── */}
            {totalCount >= 2 && (
              <section>
                <CollapseHeader label="Distribuição" collapsed={collapsedAnalytics.has('distribuicao')} onToggle={() => toggleAnalytics('distribuicao')} />
                {!collapsedAnalytics.has('distribuicao') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.85rem' }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', margin: '0 0 1rem' }}>Por Gênero</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <DonutChart data={genreDistribution.map(g => ({ label: g.label, value: g.count, color: g.color }))} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
                          {genreDistribution.slice(0, 6).map(g => (
                            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <div style={{ width: 7, height: 7, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                              <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.label}</span>
                              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0 }}>{Math.round(g.count / totalCount * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', margin: '0 0 1rem' }}>Livros Mais Estudados</p>
                      {topBooks.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Nenhum livro registrado ainda.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                          {topBooks.map(([book, count], idx) => (
                            <div key={book}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>{book}</span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{count}</span>
                              </div>
                              <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2 }}>
                                <div style={{ height: 4, width: `${(count / (topBooks[0]?.[1] ?? 1)) * 100}%`, background: 'var(--accent)', borderRadius: 2, opacity: 1 - idx * 0.12 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ── Por Gênero ── */}
            {genreDistribution.length >= 2 && (
              <section>
                <CollapseHeader label="Por Gênero" collapsed={collapsedAnalytics.has('genero')} onToggle={() => toggleAnalytics('genero')} />
                {!collapsedAnalytics.has('genero') && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
                    {genreDistribution.map(g => {
                      const max = genreDistribution[0]?.count ?? 1
                      return (
                        <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.9rem 1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.55rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: g.color }}>{g.label}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{g.count}</span>
                          </div>
                          <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 3 }}>
                            <div style={{ height: 5, width: `${Math.round((g.count / max) * 100)}%`, background: g.color, borderRadius: 3, opacity: 0.75 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* ── Atividade Recente ── */}
            <section>
              <CollapseHeader label="Atividade Recente" collapsed={collapsedAnalytics.has('recente')} onToggle={() => toggleAnalytics('recente')} />
              {!collapsedAnalytics.has('recente') && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden', marginTop: '0.85rem' }}>
                  {dashboardProjects.slice(0, 8).map((p, i) => {
                    const mode   = getModeConfig(p.study_mode ?? p.project_type)
                    const visual = MODE_VISUALS[mode.id as StudyModeId]
                    const isPassage = mode.passageBased
                    const ref = isPassage && p.book && p.book !== '—'
                      ? `${p.book} ${p.passage_ref}`
                      : p.passage_ref && p.passage_ref !== '—' ? p.passage_ref : null
                    return (
                      <div
                        key={p.id}
                        onClick={() => router.push(`/workspace/${p.id}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.85rem',
                          padding: '0.8rem 1.1rem',
                          borderBottom: i < Math.min(totalCount, 8) - 1 ? '1px solid var(--border-subtle)' : 'none',
                          cursor: 'pointer', transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: visual?.bg ?? 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: visual?.color ?? 'var(--text-muted)', flexShrink: 0 }}>
                          {isValidElement<{ width?: number; height?: number }>(MODE_ICONS[mode.id as StudyModeId])
                            ? cloneElement(MODE_ICONS[mode.id as StudyModeId] as React.ReactElement<{ width?: number; height?: number }>, { width: 12, height: 12 })
                            : MODE_ICONS[mode.id as StudyModeId]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                            <span style={{ fontSize: '0.68rem', color: visual?.color ?? 'var(--text-muted)', fontWeight: 500 }}>{mode.name}</span>
                            {ref && <><span style={{ fontSize: '0.6rem', color: 'var(--border)' }}>·</span><span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ref}</span></>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{formatDate(p.updated_at)}</div>
                          {p.status === 'completed' && (
                            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.08rem 0.4rem', borderRadius: '99px', marginTop: '0.15rem', display: 'inline-block' }}>Concluído</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ── Mapa Bíblico ── */}
            {studiedBooks.size > 0 && (
              <section>
                <CollapseHeader label="Mapa Bíblico" collapsed={collapsedAnalytics.has('mapa')} onToggle={() => toggleAnalytics('mapa')} />
                {!collapsedAnalytics.has('mapa') && <BibleMap studiedBooks={studiedBooks} />}
              </section>
            )}

            {/* ── Todos os Projetos ── */}
            <section>
              <CollapseHeader label="Todos os Projetos" collapsed={collapsedAnalytics.has('todos')} onToggle={() => toggleAnalytics('todos')} />
              {!collapsedAnalytics.has('todos') && (
                <div style={{ marginTop: '0.85rem', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)' }}>
                  {libraryModes.map((modeId, idx) => {
                    const mode         = STUDY_MODE_REGISTRY[modeId]
                    const visual       = modeVisual(modeId)
                    const modeProjects = projectsByMode.get(modeId) ?? []
                    const isCollapsed  = collapsedSections.has(modeId)
                    const isLast       = idx === libraryModes.length - 1
                    return (
                      <div key={modeId} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={() => toggleSection(modeId)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            gap: '0.7rem', padding: '0.85rem 1.1rem',
                            background: isCollapsed ? 'transparent' : `${visual.color}04`,
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.13s',
                          }}
                          onMouseEnter={e => { if (isCollapsed) e.currentTarget.style.background = 'rgba(15,23,42,0.025)' }}
                          onMouseLeave={e => { if (isCollapsed) e.currentTarget.style.background = 'transparent' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={visual.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0, opacity: 0.75 }}>
                            <path d="M6 9l6 6 6-6"/>
                          </svg>
                          <span style={{ color: visual.color, display: 'flex', flexShrink: 0 }}>{modeIcon(modeId, 14)}</span>
                          <span style={{ flex: 1, textAlign: 'left', fontSize: '0.88rem', fontWeight: 600, color: isCollapsed ? 'var(--text-secondary)' : visual.color, transition: 'color 0.13s' }}>{mode.name}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '0.1rem 0.45rem', borderRadius: '999px', border: '1px solid var(--border-subtle)' }}>{modeProjects.length}</span>
                        </button>
                        {!isCollapsed && (
                          <div style={{ display: 'flex', flexDirection: 'column', padding: '0 1.1rem 0.5rem 2.8rem' }}>
                            {modeProjects.map(p => (
                              <ProjectCard
                                key={p.id} project={p} mode={mode}
                                onClick={() => router.push(`/workspace/${p.id}`)}
                                onDelete={() => setDeleteTarget(p)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

          </div>
        )}
      </main>

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}
        >
          <div style={{ background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)', width: '100%', maxWidth: '420px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem' }}>Excluir projeto?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.title}</strong> será excluído permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'transparent', borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirming}
                style={{ padding: '0.5rem 1rem', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '7px', cursor: deleteConfirming ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.88rem', opacity: deleteConfirming ? 0.6 : 1 }}
              >
                {deleteConfirming ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
