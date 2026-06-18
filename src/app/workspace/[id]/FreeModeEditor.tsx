'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { NavPhase } from '@/lib/study-modes'
import { WORKSPACE_SECTIONS, type SectionDef } from '@/lib/workspace-sections'
import { getSectionsByGroupNav } from '@/lib/workspace-sections-nav'
import { isToolSlug } from '@/lib/tools-content'
import RichEditor from '@/components/RichEditorLazy'
import type { AIContext } from '@/components/AIAssistantPanel'

// Slugs that use specialized editors — skip in free mode
const SKIP_SLUGS = new Set([
  'texto_original',
  'termos_chave',
  'estrutura_literaria',
  'ferramentas_visao_geral',
  'pregar_visao_geral',
  'colagens',
  'comentario_expositivo',
])

interface SectionBlock {
  groupId: string
  groupLabel: string
  groupColor: string
  slug: string
  sectionDef: SectionDef
}

function deriveBlocks(phase: NavPhase, studyMode: string): SectionBlock[] {
  const blocks: SectionBlock[] = []
  const seen = new Set<string>()

  for (const mode of phase.modes) {
    for (const group of mode.groups) {
      if (isToolSlug(group.id) || SKIP_SLUGS.has(group.id)) continue

      const sections = getSectionsByGroupNav(group.id, studyMode)
      for (const sec of sections) {
        if (seen.has(sec.slug)) continue
        seen.add(sec.slug)
        if (SKIP_SLUGS.has(sec.slug)) continue

        const def = WORKSPACE_SECTIONS.find(d => d.slug === sec.slug)
        if (!def || def.cards.length === 0) continue

        blocks.push({
          groupId: group.id,
          groupLabel: group.label,
          groupColor: mode.color,
          slug: sec.slug,
          sectionDef: def,
        })
      }
    }
  }

  return blocks
}

function toPlainLength(html: string): number {
  if (!html) return 0
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim().length
}

interface Props {
  phase: NavPhase
  project: Project
  userId: string
  studyMode: string
  savedSections: Section[]
  onUpdate: (section: Section) => void
  onAskAI: (prompt: string) => void
}

export default function FreeModeEditor({
  phase, project, userId, studyMode, savedSections, onUpdate, onAskAI,
}: Props) {
  const supabase = useMemo(() => createClient(), [])

  const blocks = useMemo(() => deriveBlocks(phase, studyMode), [phase, studyMode])

  // Per-section content state — initialized from savedSections
  const [contentMap, setContentMap] = useState<Record<string, Record<string, string>>>(() => {
    const map: Record<string, Record<string, string>> = {}
    for (const block of blocks) {
      const sec = savedSections.find(s => s.slug === block.slug)
      const cards = (sec?.content as Record<string, unknown> | null)?.cards
      map[block.slug] = (cards as Record<string, string>) ?? {}
    }
    return map
  })

  // Track section records for upsert
  const sectionRecordsRef = useRef<Record<string, Section>>({})
  useEffect(() => {
    for (const sec of savedSections) {
      sectionRecordsRef.current[sec.slug] = sec
    }
  }, [savedSections])

  // Debounce timers per section
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const latestContentRef = useRef(contentMap)
  useEffect(() => { latestContentRef.current = contentMap }, [contentMap])

  const [savingSet, setSavingSet] = useState<Set<string>>(new Set())

  // Flush all pending saves on unmount
  useEffect(() => {
    return () => {
      for (const [slug, timer] of Object.entries(saveTimersRef.current)) {
        clearTimeout(timer)
        const block = blocks.find(b => b.slug === slug)
        if (block) {
          void performSaveImmediate(slug, latestContentRef.current[slug] ?? {}, block.sectionDef)
        }
      }
      saveTimersRef.current = {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const performSaveImmediate = useCallback(async (
    slug: string,
    cards: Record<string, string>,
    sectionDef: SectionDef,
  ) => {
    setSavingSet(prev => new Set([...prev, slug]))

    const hasContent = Object.values(cards).some(v => toPlainLength(v) > 0)
    const allFilled = sectionDef.cards.length > 0 &&
      sectionDef.cards.every(c => toPlainLength(cards[c.id] ?? '') > 0)

    const payload = {
      project_id: project.id,
      user_id:    userId,
      slug,
      module:     sectionDef.module,
      title:      sectionDef.title,
      content:    { cards },
      status:     (allFilled ? 'reviewed' : hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }

    const existing = sectionRecordsRef.current[slug]
    if (existing?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existing.id).select().single()
      if (data) { sectionRecordsRef.current[slug] = data as Section; onUpdate(data as Section) }
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { sectionRecordsRef.current[slug] = data as Section; onUpdate(data as Section) }
    }

    setSavingSet(prev => { const next = new Set(prev); next.delete(slug); return next })
  }, [project.id, userId, supabase, onUpdate])

  function scheduleAutosave(slug: string, cards: Record<string, string>, sectionDef: SectionDef) {
    if (saveTimersRef.current[slug]) clearTimeout(saveTimersRef.current[slug])
    saveTimersRef.current[slug] = setTimeout(() => {
      delete saveTimersRef.current[slug]
      void performSaveImmediate(slug, cards, sectionDef)
    }, 1400)
  }

  function handleCardChange(slug: string, cardId: string, value: string, sectionDef: SectionDef) {
    const newCards = { ...(contentMap[slug] ?? {}), [cardId]: value }
    setContentMap(prev => ({ ...prev, [slug]: newCards }))
    scheduleAutosave(slug, newCards, sectionDef)
  }

  // Group blocks by groupId for rendering
  const groupedBlocks = useMemo(() => {
    const groups: Array<{
      groupId: string; groupLabel: string; groupColor: string; sections: SectionBlock[]
    }> = []
    for (const block of blocks) {
      const last = groups[groups.length - 1]
      if (last?.groupId === block.groupId) {
        last.sections.push(block)
      } else {
        groups.push({
          groupId: block.groupId,
          groupLabel: block.groupLabel,
          groupColor: block.groupColor,
          sections: [block],
        })
      }
    }
    return groups
  }, [blocks])

  const passageLabel = `${project.book ?? ''} ${project.passage_ref ?? ''}`.trim()
  const isSaving = savingSet.size > 0

  const buildAIContext = (block: SectionBlock, cardId: string, cardLabel: string): AIContext => ({
    project: {
      id:                project.id,
      book:              project.book ?? '',
      passage_ref:       project.passage_ref ?? '',
      testament:         project.testament ?? '',
      original_language: project.original_language ?? '',
      study_mode:        studyMode,
    },
    phase:        phase.id,
    phaseLabel:   phase.label,
    section:      block.slug,
    sectionLabel: block.sectionDef.shortTitle,
    field:        cardId,
    fieldLabel:   cardLabel,
    userId,
  })

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '24px 40px 80px', boxSizing: 'border-box' }}>

      {/* Mode hint bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '36px',
        padding: '7px 12px',
        borderRadius: '6px',
        background: 'rgba(0,0,0,0.02)',
        borderLeft: `3px solid ${phase.color}40`,
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.45, fontStyle: 'italic' }}>
          Modo Livre — escreva de forma contínua. A estrutura metodológica é preservada internamente.
        </span>
        <span style={{
          fontSize: '0.64rem', color: isSaving ? 'var(--text-muted)' : 'transparent',
          marginLeft: '16px', flexShrink: 0, transition: 'color 0.2s',
        }}>
          Salvando...
        </span>
      </div>

      {groupedBlocks.map((group, gIdx) => (
        <div key={group.groupId}>

          {/* Group divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            marginTop: gIdx > 0 ? '52px' : '0',
            marginBottom: '28px',
          }}>
            <div style={{ width: '3px', height: '20px', borderRadius: '2px', background: group.groupColor, flexShrink: 0 }} />
            <span style={{
              fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.11em',
              textTransform: 'uppercase', color: group.groupColor,
              whiteSpace: 'nowrap',
            }}>
              {group.groupLabel}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Sections in this group */}
          {group.sections.map((block, sIdx) => (
            <div key={block.slug} style={{ marginTop: sIdx > 0 ? '36px' : '0' }}>

              {/* Section sub-header — only when group has multiple sections */}
              {group.sections.length > 1 && (
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  marginBottom: '16px',
                  paddingBottom: '7px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  {block.sectionDef.shortTitle}
                </div>
              )}

              {/* Cards */}
              {block.sectionDef.cards.map((card, cIdx) => {
                const value = contentMap[block.slug]?.[card.id] ?? ''

                return (
                  <div key={card.id} style={{ marginTop: cIdx > 0 ? '28px' : '0' }}>

                    {/* Card label + AI button */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '0.62rem', fontWeight: 800,
                        letterSpacing: '0.07em', textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                      }}>
                        {card.title}
                      </span>
                      <button
                        onClick={() => onAskAI([
                          `Campo: ${card.title} — ${block.sectionDef.shortTitle}`,
                          `Passagem: ${passageLabel}`,
                          '',
                          card.aiTrigger,
                        ].join('\n'))}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontSize: '0.62rem', color: 'var(--text-muted)',
                          padding: '2px 7px', borderRadius: '4px',
                          fontFamily: 'inherit', letterSpacing: '0.02em',
                          transition: 'color 0.1s, background 0.1s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--ai)'
                          e.currentTarget.style.background = 'var(--ai-subtle)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.background = 'transparent'
                        }}
                        title={card.aiTrigger.slice(0, 90)}
                      >
                        ✦ IA
                      </button>
                    </div>

                    {/* Editor — document-like, no hard border */}
                    <div style={{
                      borderLeft: `2px solid transparent`,
                      paddingLeft: '0',
                      transition: 'border-color 0.15s',
                    }}
                      onFocusCapture={e => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.borderColor = `${group.groupColor}55`
                      }}
                      onBlurCapture={e => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.borderColor = 'transparent'
                      }}
                    >
                      <RichEditor
                        key={`free-${block.slug}-${card.id}`}
                        value={value}
                        onChange={v => handleCardChange(block.slug, card.id, v, block.sectionDef)}
                        placeholder={card.placeholder}
                        moduleColor={group.groupColor}
                        minHeight={90}
                        aiContext={buildAIContext(block, card.id, card.title)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ))}

      {blocks.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          color: 'var(--text-muted)', fontSize: '0.84rem',
        }}>
          Nenhuma seção disponível no Modo Livre para esta fase.
        </div>
      )}
    </div>
  )
}
