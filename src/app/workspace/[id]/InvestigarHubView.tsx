'use client'

import { useState, useEffect } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import WorkspaceDocument from './WorkspaceDocument'
import InvestigarSectionPopup from './InvestigarSectionPopup'

interface StudyBlock {
  sectionDef: SectionDef
  existingSection: Section | undefined
}

interface Props {
  studyBlocks: StudyBlock[]
  vgBlock?: StudyBlock
  project: Project
  userId: string
  activeSlug: string
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  onNavigate: (slug: string) => void
}

const STUDY_COLORS: Record<string, string> = {
  contextual: '#0EA5E9',
  textual:    '#8B5CF6',
  teologico:  '#F59E0B',
  teológico:  '#F59E0B',
}

const STUDY_ICONS: Record<string, string> = {
  contextual: '🌍',
  textual:    '📖',
  teologico:  '✝️',
  teológico:  '✝️',
}

const STUDY_DESCRIPTIONS: Record<string, string> = {
  contextual: 'Contexto histórico, literário e canônico do texto',
  textual:    'Análise do texto original, estrutura e exegese',
  teologico:  'Temas teológicos, progressão e relevância',
  teológico:  'Temas teológicos, progressão e relevância',
}

function getKey(def: SectionDef): string {
  const s = def.slug.toLowerCase()
  if (s.includes('contextual')) return 'contextual'
  if (s.includes('textual'))    return 'textual'
  return 'teologico'
}

function getAccentColor(def: SectionDef): string {
  return STUDY_COLORS[getKey(def)] ?? '#64748B'
}

function getIcon(def: SectionDef): string {
  return STUDY_ICONS[getKey(def)] ?? '📄'
}

function getDescription(def: SectionDef): string {
  return STUDY_DESCRIPTIONS[getKey(def)] ?? ''
}

function calcProgress(block: StudyBlock): { filled: number; total: number; pct: number } {
  const cards = (block.existingSection?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
  const total = block.sectionDef.cards?.length ?? 0
  const filled = block.sectionDef.cards?.filter(c => {
    const v = cards[c.id] ?? ''
    return v.replace(/<[^>]*>/g, '').trim().length > 10
  }).length ?? 0
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0
  return { filled, total, pct }
}

function statusLabel(pct: number): { label: string; color: string } {
  if (pct === 0)   return { label: 'Não iniciado', color: '#94A3B8' }
  if (pct < 50)    return { label: 'Em andamento', color: '#F59E0B' }
  if (pct < 100)   return { label: 'Quase pronto', color: '#0EA5E9' }
  return { label: 'Concluído', color: '#10B981' }
}

export default function InvestigarHubView({
  studyBlocks,
  vgBlock,
  project,
  userId,
  activeSlug,
  onUpdate,
  onAskAI,
  onNavigate,
}: Props) {
  const allBlocks = vgBlock ? [...studyBlocks, vgBlock] : studyBlocks

  const [openStudySlug, setOpenStudySlug] = useState<string | null>(() => {
    // VG slug as entry → show hub; study slugs → open that study directly
    return studyBlocks.some(b => b.sectionDef.slug === activeSlug) ? activeSlug : null
  })
  const [popups, setPopups] = useState<string[]>([])

  useEffect(() => {
    if (studyBlocks.some(b => b.sectionDef.slug === activeSlug)) {
      setOpenStudySlug(activeSlug)
    } else {
      // VG slug or any non-study slug → show hub
      setOpenStudySlug(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug])

  function openStudy(slug: string) {
    onNavigate(slug)
    setOpenStudySlug(slug)
  }

  function backToHub() {
    setOpenStudySlug(null)
    setPopups([])
  }

  function togglePopup(slug: string) {
    setPopups(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const isVgOpen = openStudySlug === vgBlock?.sectionDef.slug
  const currentBlock = openStudySlug
    ? allBlocks.find(b => b.sectionDef.slug === openStudySlug)
    : null
  const otherBlocks = openStudySlug
    ? studyBlocks.filter(b => b.sectionDef.slug !== openStudySlug)
    : []

  // ── Hub view ─────────────────────────────────────────────────────────────
  if (!openStudySlug || !currentBlock) {
    const totalFields = studyBlocks.reduce((sum, b) => sum + (b.sectionDef.cards?.length ?? 0), 0)
    const filledFields = studyBlocks.reduce((sum, b) => sum + calcProgress(b).filled, 0)
    const overallPct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              Investigar
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Três estudos para aprofundar a compreensão da passagem. Comece por qualquer um.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: overallPct === 100 ? '#10B981' : 'var(--text-secondary)' }}>
              {overallPct}%
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>concluído</div>
          </div>
        </div>

        {/* 3 study cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {studyBlocks.map((block, idx) => {
            const { filled, total, pct } = calcProgress(block)
            const { label: sLabel, color: sColor } = statusLabel(pct)
            const accent  = getAccentColor(block.sectionDef)
            const desc    = getDescription(block.sectionDef)
            const numeral = String(idx + 1).padStart(2, '0')

            return (
              <div
                key={block.sectionDef.slug}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${accent}22`,
                  borderTop: `3px solid ${accent}`,
                  borderRadius: '10px',
                  padding: '1.1rem 1.1rem 1.1rem 0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.7rem',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${accent}18`; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                {/* Number + title */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 900,
                    color: '#1E3A5F', opacity: 0.45, flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {numeral}
                  </span>
                  <div>
                    <div style={{
                      fontSize: '14px', fontWeight: 800,
                      color: '#1E3A5F',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      lineHeight: 1.15,
                    }}>
                      {block.sectionDef.title}
                    </div>
                    <div style={{
                      fontSize: '13px', fontWeight: 400,
                      color: 'var(--text-muted)', lineHeight: 1.4,
                      marginTop: '0.2rem',
                      paddingLeft: '0.05rem',
                    }}>
                      {desc}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ paddingLeft: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.65rem', color: sColor, fontWeight: 700, background: `${sColor}14`, padding: '0.1rem 0.45rem', borderRadius: '99px' }}>
                      {sLabel}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {filled}/{total} campos
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10B981' : accent, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ marginTop: '0.28rem', textAlign: 'right', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                    {pct}% concluído
                  </div>
                </div>

                {/* Card checklist */}
                {block.sectionDef.cards && block.sectionDef.cards.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem', paddingLeft: '1.4rem' }}>
                    {block.sectionDef.cards.map(card => {
                      const text = (block.existingSection?.content as { cards?: Record<string, string> } | null)?.cards?.[card.id] ?? ''
                      const done = text.replace(/<[^>]*>/g, '').trim().length > 10
                      return (
                        <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.62rem', flexShrink: 0, lineHeight: 1, color: done ? '#10B981' : 'var(--border)', fontWeight: 700 }}>
                            {done ? '☑' : '☐'}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: done ? 'var(--text-secondary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {card.title}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => openStudy(block.sectionDef.slug)}
                  style={{
                    marginTop: 'auto', padding: '0.5rem 0.75rem',
                    background: '#1E3A5F', color: '#FFFFFF',
                    border: 'none', borderRadius: '7px',
                    fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {pct === 0 ? 'Iniciar estudo' : 'Continuar'}
                </button>
              </div>
            )
          })}
        </div>

        {/* VG / Síntese card — full width, secondary */}
        {vgBlock && (() => {
          const { filled, total, pct } = calcProgress(vgBlock)
          const { label: sLabel, color: sColor } = statusLabel(pct)
          return (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid #0F766E28',
                borderLeft: '3px solid #0F766E',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                transition: 'box-shadow 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,118,110,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#1E3A5F', opacity: 0.35, flexShrink: 0 }}>04</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E3A5F', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.15 }}>
                    {vgBlock.sectionDef.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    {vgBlock.sectionDef.objective}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.65rem', color: sColor, fontWeight: 700, background: `${sColor}14`, padding: '0.1rem 0.45rem', borderRadius: '99px' }}>
                    {sLabel}
                  </span>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {filled}/{total} campos
                  </div>
                </div>
                <button
                  onClick={() => openStudy(vgBlock.sectionDef.slug)}
                  style={{
                    padding: '0.45rem 1rem',
                    background: '#0F766E',
                    color: '#FFFFFF',
                    border: 'none', borderRadius: '7px',
                    fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {pct === 0 ? 'Abrir síntese' : 'Ver síntese'}
                </button>
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // ── Study / VG view ───────────────────────────────────────────────────────
  const currentAccent = isVgOpen ? '#0F766E' : getAccentColor(currentBlock.sectionDef)
  const currentIcon   = isVgOpen ? '🧠' : getIcon(currentBlock.sectionDef)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Sub-header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        background: 'var(--background)',
      }}>
        <button
          onClick={backToHub}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.72rem',
            fontFamily: 'inherit', padding: '0.15rem 0.4rem',
            borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          ← Investigar
        </button>

        <span style={{ color: 'var(--border)', fontSize: '0.75rem' }}>/</span>

        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentAccent }}>
          {currentIcon} {currentBlock.sectionDef.title}
        </span>

        {/* Quick access buttons — centered */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {(isVgOpen ? studyBlocks : otherBlocks).map(block => {
            const accent = getAccentColor(block.sectionDef)
            const isOpen = popups.includes(block.sectionDef.slug)
            return (
              <button
                key={block.sectionDef.slug}
                onClick={() => togglePopup(block.sectionDef.slug)}
                title={isOpen ? `Fechar ${block.sectionDef.title}` : `Abrir ${block.sectionDef.title}`}
                style={{
                  padding: '0.25rem 0.8rem',
                  background: isOpen ? `${accent}14` : 'transparent',
                  border: `1px solid ${isOpen ? accent : accent + '50'}`,
                  borderRadius: '6px',
                  fontSize: '0.68rem', fontWeight: 700,
                  color: isOpen ? accent : `${accent}CC`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${accent}14`; e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                onMouseLeave={e => { e.currentTarget.style.background = isOpen ? `${accent}14` : 'transparent'; e.currentTarget.style.borderColor = isOpen ? accent : `${accent}50`; e.currentTarget.style.color = isOpen ? accent : `${accent}CC` }}
              >
                <span>{getIcon(block.sectionDef)}</span>
                Estudo {block.sectionDef.shortTitle}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <WorkspaceDocument
          key={currentBlock.sectionDef.slug}
          blocks={[{ sectionDef: currentBlock.sectionDef, existingSection: currentBlock.existingSection }]}
          project={project}
          userId={userId}
          onUpdate={onUpdate}
          onAskAI={onAskAI}
          guided={false}
          initialSlug={currentBlock.sectionDef.slug}
          toolbarTop="0"
        />
      </div>

      {/* Floating popups */}
      {popups.map((slug, idx) => {
        const block = studyBlocks.find(b => b.sectionDef.slug === slug)
        if (!block) return null
        return (
          <InvestigarSectionPopup
            key={slug}
            sectionDef={block.sectionDef}
            existingSection={block.existingSection}
            project={project}
            userId={userId}
            initialX={40 + idx * 30}
            initialY={100 + idx * 30}
            onUpdate={onUpdate}
            onAskAI={onAskAI}
            onClose={() => togglePopup(slug)}
          />
        )
      })}
    </div>
  )
}
