'use client'

import { useState, isValidElement, cloneElement } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/types/database'
import { getModeConfig, type StudyModeId, type StudyModeConfig } from '@/lib/study-modes'
import { formatDate, statusLabel, formatCalendarDate, modeVisual, BOOKS_AT, BOOKS_NT, MODE_ICONS, MODE_VISUALS } from './dashboard-types'

export function ShelfLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}

export function RecentCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: () => void }) {
  const mode   = getModeConfig(project.study_mode ?? project.project_type)
  const visual = MODE_VISUALS[mode.id as StudyModeId]
  const isPassage = mode.passageBased
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
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: '1px solid rgba(226,232,240,0.9)',
        borderRadius: '9px',
        padding: '0.95rem 1.15rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        boxShadow: `inset 3px 0 0 ${visual.color}20`,
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${visual.color}, 0 2px 14px rgba(15,23,42,0.07)`;
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,213,225,0.9)'
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${visual.color}20`;
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.9)'
      }}
    >
      {/* Mode icon badge */}
      <div style={{
        width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
        background: visual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: visual.color,
      }}>
        {isValidElement<{ width?: number; height?: number }>(MODE_ICONS[mode.id as StudyModeId])
          ? cloneElement(MODE_ICONS[mode.id as StudyModeId] as React.ReactElement<{ width?: number; height?: number }>, { width: 15, height: 15 })
          : MODE_ICONS[mode.id as StudyModeId]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2,
          color: 'var(--text-primary)', marginBottom: '0.2rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
        }}>
          <span style={{ color: visual.color, fontWeight: 500, opacity: 0.85, flexShrink: 0 }}>
            {mode.name}
          </span>
          {subtitle && (
            <>
              <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
              <span style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtitle}
              </span>
            </>
          )}
          <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
          <span style={{ flexShrink: 0 }}>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      {/* ⋮ menu */}
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
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
            background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px',
          }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-muted)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.4 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  )
}

export function ProjectCard({
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
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: '1px solid rgba(226,232,240,0.9)',
        borderRadius: '7px',
        padding: '0.7rem 1rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        position: 'relative',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 12px rgba(15,23,42,0.07)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,213,225,0.9)'
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.9)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.25,
          color: 'var(--text-primary)', marginBottom: '0.18rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
        }}>
          {subtitle && (
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic',
            }}>
              {subtitle}
            </span>
          )}
          {subtitle && <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>}
          <span style={{ flexShrink: 0 }}>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      <span style={{
        fontSize: '0.7rem', fontWeight: isCompleted ? 600 : 400, flexShrink: 0,
        color: isCompleted ? '#16a34a' : 'var(--text-muted)',
        opacity: isCompleted ? 1 : 0.75,
      }}>
        {statusLabel(project.status)}
      </span>

      {/* ⋮ menu */}
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
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
            background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px',
          }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function PublishedProjectCard({
  project, category, onOpen, onUnpublish,
}: {
  project: Project
  category: string
  onOpen: () => void
  onUnpublish: () => void
}) {
  const mode = getModeConfig(project.study_mode ?? project.project_type)
  const visual = MODE_VISUALS[mode.id as StudyModeId] ?? MODE_VISUALS.exegese_biblica
  const isPassage = mode.passageBased
  const subject = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : typeof project.meta?.topic === 'string'
        ? project.meta.topic
        : 'Projeto Lampas'

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${visual.border}`,
      borderRadius: '9px',
      padding: '0.9rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
      minHeight: '176px',
      borderTop: `3px solid ${visual.color}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: visual.color, background: visual.bg, border: `1px solid ${visual.border}`, borderRadius: '999px', padding: '0.12rem 0.45rem' }}>
            Publicado
          </span>
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{category}</span>
        </div>
        <h4 style={{
          margin: '0 0 0.35rem',
          color: 'var(--text-primary)',
          fontSize: '0.93rem',
          lineHeight: 1.28,
          fontWeight: 800,
        }}>
          {project.title}
        </h4>
        <p style={{
          margin: 0,
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          lineHeight: 1.45,
          fontStyle: isPassage ? 'italic' : 'normal',
        }}>
          {subject}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
        <div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Publicado</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.12rem' }}>{formatCalendarDate(project.published_at)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Atualizado</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.12rem' }}>{formatCalendarDate(project.updated_at)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        <button
          onClick={onOpen}
          style={{
            flex: 1,
            background: visual.color,
            border: `1px solid ${visual.color}`,
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.74rem',
            fontWeight: 800,
            padding: '0.42rem 0.65rem',
          }}
        >
          Abrir
        </button>
        <button
          onClick={onUnpublish}
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '0.42rem 0.65rem',
          }}
        >
          Despublicar
        </button>
      </div>
    </div>
  )
}

export function CollapseHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
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

export function DashLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}

export function StudyCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: () => void }) {
  const mode      = getModeConfig(project.study_mode ?? project.project_type)
  const visual    = MODE_VISUALS[mode.id as StudyModeId]
  const isPassage = mode.passageBased
  const ref = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—' ? project.passage_ref : null
  const [menuOpen, setMenuOpen] = useState(false)
  const isCompleted = project.status === 'completed'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderTop: `3px solid ${visual.color}`,
        borderRight: `1px solid ${visual.border}`,
        borderBottom: `1px solid ${visual.border}`,
        borderLeft: `1px solid ${visual.border}`,
        borderRadius: '12px', padding: '1.15rem 1.2rem',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        transition: 'box-shadow 0.15s', position: 'relative',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(15,23,42,0.09)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 22, height: 22, borderRadius: '6px', background: visual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: visual.color }}>
            {isValidElement<{ width?: number; height?: number }>(MODE_ICONS[mode.id as StudyModeId])
              ? cloneElement(MODE_ICONS[mode.id as StudyModeId] as React.ReactElement<{ width?: number; height?: number }>, { width: 11, height: 11 })
              : MODE_ICONS[mode.id as StudyModeId]}
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: visual.color }}>{mode.name}</span>
        </div>
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.15rem', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 2px)', zIndex: 20, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '120px' }}>
              <button
                onClick={() => { setMenuOpen(false); onDelete() }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', color: '#EF4444', padding: '0.38rem 0.6rem', borderRadius: '5px', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: ref ? '0.2rem' : 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {project.title}
        </div>
        {ref && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{ref}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: '0.65rem', color: isCompleted ? '#10B981' : 'var(--text-muted)', fontWeight: isCompleted ? 600 : 400 }}>
          {isCompleted ? 'Concluído' : `Atualizado ${formatDate(project.updated_at)}`}
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: visual.color }}>Continuar →</span>
      </div>
    </div>
  )
}

export function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
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

export function BibleMap({ studiedBooks }: { studiedBooks: Set<string> }) {
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

export function EmptyDashboard({ onNew }: { onNew: () => void }) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  async function handleStartDemo() {
    setStarting(true)
    try {
      const res  = await fetch('/api/projects/demo', { method: 'POST' })
      const data = await res.json() as { id?: string; error?: string }
      if (data.id) router.push(`/workspace/${data.id}`)
    } catch { /* noop */ }
    finally { setStarting(false) }
  }

  return (
    <div style={{
      borderRadius: '16px', overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
    }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a2540 100%)',
        padding: '3rem 2.5rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '1rem',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'rgba(201,146,26,0.18)', border: '1.5px solid rgba(201,146,26,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '0.25rem',
        }}>📖</div>

        <h2 style={{
          margin: 0, fontSize: '1.5rem', fontWeight: 750,
          color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Bem-vindo ao Lampas
        </h2>
        <p style={{
          margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.65, maxWidth: '420px',
        }}>
          Antes de criar seu próprio estudo, percorra um estudo guiado e conheça o método — do texto ao coração.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          marginTop: '0.25rem',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(201,146,26,0.85)', marginBottom: '0.15rem' }}>
              Estudo guiado
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>João 3.16 — Devocional</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>8 etapas · Preparar → Contemplar → Responder</div>
          </div>
        </div>

        <button
          onClick={handleStartDemo}
          disabled={starting}
          style={{
            marginTop: '0.5rem',
            background: starting ? 'rgba(201,146,26,0.6)' : 'linear-gradient(135deg, #C9921A 0%, #D97706 100%)',
            color: '#FFFFFF', border: 'none',
            borderRadius: '10px', padding: '0.7rem 1.75rem',
            fontWeight: 700, cursor: starting ? 'wait' : 'pointer',
            fontSize: '0.92rem', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(201,146,26,0.3)',
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            transition: 'all 0.15s',
          }}
        >
          {starting ? 'Criando estudo…' : '→ Iniciar estudo guiado'}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        background: 'var(--surface)', padding: '1rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prefere começar direto?</span>
        <button onClick={onNew} style={{
          background: 'transparent', border: 'none',
          color: 'var(--accent)', fontWeight: 600,
          cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
          padding: 0,
        }}>
          Criar meu próprio projeto
        </button>
      </div>
    </div>
  )
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)',
        marginBottom: '0.35rem', textTransform: 'uppercase',
        letterSpacing: '0.07em', fontWeight: '600',
      }}>
        {label}
      </label>
      <style>{`
        .field-input input, .field-input select {
          width: 100%; padding: 0.6rem 0.85rem;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 7px; color: var(--text-primary);
          font-size: 0.92rem; outline: none; font-family: inherit;
          transition: border-color 0.15s; box-sizing: border-box;
        }
        .field-input input:focus, .field-input select:focus { border-color: var(--accent); }
        .field-input select option { background: var(--surface-2); }
      `}</style>
      <div className="field-input">{children}</div>
    </div>
  )
}

