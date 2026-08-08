'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import SectionWorkspace from './SectionWorkspace'
import InvestigarSectionPopup from './InvestigarSectionPopup'

interface StudyBlock {
  sectionDef: SectionDef
  existingSection: Section | undefined
}

interface Props {
  studyBlocks: StudyBlock[]   // exactly 3: contextual, textual, teológico
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
  project,
  userId,
  activeSlug,
  onUpdate,
  onAskAI,
  onNavigate,
}: Props) {
  const [openStudySlug, setOpenStudySlug] = useState<string | null>(() => {
    return studyBlocks.some(b => b.sectionDef.slug === activeSlug) ? activeSlug : null
  })
  const [popups, setPopups] = useState<string[]>([])

  useEffect(() => {
    if (studyBlocks.some(b => b.sectionDef.slug === activeSlug)) {
      setOpenStudySlug(activeSlug)
    } else {
      setOpenStudySlug(null)
    }
  }, [activeSlug, studyBlocks])

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

  const currentBlock = openStudySlug
    ? studyBlocks.find(b => b.sectionDef.slug === openStudySlug)
    : null

  const otherBlocks = openStudySlug
    ? studyBlocks.filter(b => b.sectionDef.slug !== openStudySlug)
    : []

  // ── Hub view ─────────────────────────────────────────────────────────────
  if (!openStudySlug || !currentBlock) {
    return (
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '0.3rem',
          }}>
            Investigar
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Três estudos para aprofundar a compreensão da passagem. Comece por qualquer um ou siga a ordem.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {studyBlocks.map(block => {
            const { filled, total, pct } = calcProgress(block)
            const { label: sLabel, color: sColor } = statusLabel(pct)
            const accent = getAccentColor(block.sectionDef)
            const icon   = getIcon(block.sectionDef)
            const desc   = getDescription(block.sectionDef)

            return (
              <div
                key={block.sectionDef.slug}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${accent}28`,
                  borderTop: `3px solid ${accent}`,
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 4px 20px ${accent}20`
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                {/* Icon + title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '1.5rem', lineHeight: 1,
                    flexShrink: 0, marginTop: '0.1rem',
                  }}>{icon}</span>
                  <div>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.2rem',
                    }}>
                      {block.sectionDef.title}
                    </div>
                    <div style={{
                      fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4,
                    }}>
                      {desc}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.35rem',
                  }}>
                    <span style={{
                      fontSize: '0.65rem', color: sColor, fontWeight: 700,
                      background: `${sColor}14`, padding: '0.1rem 0.45rem',
                      borderRadius: '99px',
                    }}>
                      {sLabel}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {filled}/{total} campos
                    </span>
                  </div>
                  <div style={{
                    height: '5px', background: 'var(--border-subtle)',
                    borderRadius: '99px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: pct === 100 ? '#10B981' : accent,
                      borderRadius: '99px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{
                    marginTop: '0.3rem', textAlign: 'right',
                    fontSize: '0.62rem', color: 'var(--text-muted)',
                  }}>
                    {pct}% concluído
                  </div>
                </div>

                {/* Card list preview */}
                {block.sectionDef.cards && block.sectionDef.cards.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem' }}>
                    {block.sectionDef.cards.map(card => {
                      const text = (block.existingSection?.content as { cards?: Record<string, string> } | null)?.cards?.[card.id] ?? ''
                      const done = text.replace(/<[^>]*>/g, '').trim().length > 10
                      return (
                        <div key={card.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                        }}>
                          <span style={{
                            fontSize: '0.62rem', flexShrink: 0, lineHeight: 1,
                            color: done ? '#10B981' : 'var(--border)',
                            fontWeight: 700,
                          }}>
                            {done ? '☑' : '☐'}
                          </span>
                          <span style={{
                            fontSize: '0.65rem', color: done ? 'var(--text-secondary)' : 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
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
                    marginTop: 'auto',
                    padding: '0.5rem 0.75rem',
                    background: accent,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {pct === 0 ? 'Iniciar estudo' : 'Continuar'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Study view ────────────────────────────────────────────────────────────
  const currentAccent = getAccentColor(currentBlock.sectionDef)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Sub-header: breadcrumb + quick access buttons */}
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

        <span style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: currentAccent,
        }}>
          {getIcon(currentBlock.sectionDef)} {currentBlock.sectionDef.title}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
          {otherBlocks.map(block => {
            const accent  = getAccentColor(block.sectionDef)
            const isOpen  = popups.includes(block.sectionDef.slug)
            return (
              <button
                key={block.sectionDef.slug}
                onClick={() => togglePopup(block.sectionDef.slug)}
                title={isOpen ? `Fechar ${block.sectionDef.title}` : `Abrir ${block.sectionDef.title}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  background: isOpen ? `${accent}14` : 'transparent',
                  border: `1px solid ${isOpen ? accent : accent + '50'}`,
                  borderRadius: '6px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: isOpen ? accent : `${accent}CC`,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${accent}14`
                  e.currentTarget.style.borderColor = accent
                  e.currentTarget.style.color = accent
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isOpen ? `${accent}14` : 'transparent'
                  e.currentTarget.style.borderColor = isOpen ? accent : `${accent}50`
                  e.currentTarget.style.color = isOpen ? accent : `${accent}CC`
                }}
              >
                <span>{getIcon(block.sectionDef)}</span>
                {block.sectionDef.shortTitle}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SectionWorkspace
          sectionDef={currentBlock.sectionDef}
          project={project}
          userId={userId}
          existingSection={currentBlock.existingSection}
          onUpdate={onUpdate}
          onAskAI={onAskAI}
        />
      </div>

      {/* Floating popups for other studies */}
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
