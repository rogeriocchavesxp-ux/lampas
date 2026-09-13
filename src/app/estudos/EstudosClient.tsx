'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Estudo as Study } from '@/lib/estudos'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'teologia-biblica',    label: 'Teologia Bíblica',    color: '#1E4D8C', bg: '#EEF3FA' },
  { slug: 'teologia-sistematica',label: 'Teologia Sistemática', color: '#7C3AED', bg: '#F5F3FF' },
  { slug: 'filosofia',           label: 'Filosofia',            color: '#0F766E', bg: '#F0FDFA' },
  { slug: 'historia',            label: 'História',             color: '#92400E', bg: '#FEF3C7' },
  { slug: 'geografia',           label: 'Geografia',            color: '#166534', bg: '#F0FDF4' },
]

function catMeta(slug: string) {
  return CATEGORIES.find(c => c.slug === slug) ?? { slug, label: slug, color: '#64748B', bg: '#F1F5F9' }
}

function readingLabel(min: number | null) {
  if (!min) return null
  return `${min} min`
}

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Study Card ────────────────────────────────────────────────────────────────

function StudyCard({ study, onOpen }: { study: Study; onOpen: (s: Study) => void }) {
  const cat = catMeta(study.category)
  return (
    <button
      onClick={() => onOpen(study)}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: 'var(--background)', border: '1px solid var(--border)',
        borderRadius: '10px', padding: '1.1rem 1.25rem',
        cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = cat.color + '44'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Category badge */}
      <div style={{ marginBottom: '0.55rem' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
          color: cat.color, background: cat.bg,
          borderRadius: '4px', padding: '2px 7px',
        }}>
          {cat.label}
        </span>
        {!study.is_published && (
          <span style={{ marginLeft: '6px', fontSize: '0.6rem', fontWeight: 600, color: '#94A3B8', background: '#F1F5F9', borderRadius: '4px', padding: '2px 7px' }}>
            Rascunho
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize: '0.97rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.25rem' }}>
        {study.title}
      </div>
      {study.subtitle && (
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {study.subtitle}
        </div>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.6rem' }}>
        {study.professor && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {study.professor}
          </span>
        )}
        {study.reading_time && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {readingLabel(study.reading_time)} de leitura
          </span>
        )}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {dateLabel(study.created_at)}
        </span>
      </div>

      {/* Tags */}
      {study.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '0.6rem' }}>
          {study.tags.map(t => (
            <span key={t} style={{ fontSize: '0.65rem', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: '4px', padding: '1px 7px' }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

// ── Study Reader ──────────────────────────────────────────────────────────────

function StudyReader({ study, onClose }: { study: Study; onClose: () => void }) {
  const cat = catMeta(study.category)
  const [content, setContent] = useState<string | null>(study.content)
  const [loaded, setLoaded] = useState(!!study.content)

  useEffect(() => {
    if (loaded || study.content) return
    createClient()
      .from('lampas_studies')
      .select('content')
      .eq('id', study.id)
      .single()
      .then(({ data }) => { if (data) { setContent(data.content); setLoaded(true) } })
  }, [study.id, loaded, study.content])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(15,23,42,0.45)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '2rem 1rem', overflowY: 'auto',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--background)', borderRadius: '12px',
        width: '100%', maxWidth: '760px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: cat.color, background: cat.bg, borderRadius: '4px', padding: '2px 8px' }}>
              {cat.label}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1, padding: '4px' }}>✕</button>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 0.3rem' }}>
            {study.title}
          </h1>
          {study.subtitle && (
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>{study.subtitle}</p>
          )}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {study.professor && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{study.professor}</span>}
            {study.reading_time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{readingLabel(study.reading_time)} de leitura</span>}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateLabel(study.created_at)}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text-primary)' }}>
          {!loaded ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Carregando…</div>
          ) : content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sem conteúdo.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function EstudosClient({ studies, userId }: { studies: Study[]; userId: string }) {
  const [activeTab, setActiveTab] = useState<string>('todos')
  const [openStudy, setOpenStudy] = useState<Study | null>(null)

  const filtered = activeTab === 'todos'
    ? studies
    : studies.filter(s => s.category === activeTab)

  const countFor = (slug: string) =>
    slug === 'todos' ? studies.length : studies.filter(s => s.category === slug).length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <div style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 0' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '0 0 0.25rem' }}>
            Estudos
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
            {studies.length} estudo{studies.length !== 1 ? 's' : ''} registrado{studies.length !== 1 ? 's' : ''}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', borderBottom: 'none', overflowX: 'auto' }}>
            {[{ slug: 'todos', label: 'Todos', color: '#475569', bg: '#F1F5F9' }, ...CATEGORIES].map(cat => {
              const active = activeTab === cat.slug
              const count = countFor(cat.slug)
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveTab(cat.slug)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.6rem 1rem',
                    fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                    color: active ? cat.color : 'var(--text-muted)',
                    borderBottom: active ? `2px solid ${cat.color}` : '2px solid transparent',
                    whiteSpace: 'nowrap', fontFamily: 'inherit',
                    transition: 'color 0.12s',
                  }}
                >
                  {cat.label}
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    background: active ? cat.bg : 'var(--surface-2)',
                    color: active ? cat.color : 'var(--text-muted)',
                    borderRadius: '10px', padding: '1px 6px',
                    minWidth: '18px', textAlign: 'center',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.75rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: 'var(--text-muted)', fontSize: '0.9rem',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📚</div>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Nenhum estudo aqui ainda</div>
            <div>Os professores publicarão estudos nesta área em breve.</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {filtered.map(s => (
              <StudyCard key={s.id} study={s} onOpen={setOpenStudy} />
            ))}
          </div>
        )}
      </div>

      {/* Reader modal */}
      {openStudy && (
        <StudyReader study={openStudy} onClose={() => setOpenStudy(null)} />
      )}
    </div>
  )
}
