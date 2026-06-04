'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import RichEditor from '@/components/RichEditor'
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'

type CardState = 'idle' | 'generating' | 'saving' | 'saved'

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

function dotColor(text: string): string {
  if (!text.trim()) return 'var(--border)'
  if (text.trim().length < 80) return 'var(--accent)'
  return 'var(--success)'
}

function fieldStatus(text: string): 'empty' | 'draft' | 'reviewed' {
  if (!text.trim()) return 'empty'
  if (text.trim().length < 80) return 'draft'
  return 'reviewed'
}

const MODULE_COLORS: Record<string, string> = {
  inventio:     'var(--accent)',
  dispositio:   'var(--ai)',
  elocutio:     '#6366F1',
  memoria:      '#10B981',
  pronuntiatio: '#F97316',
}

function modeTheme(mode: SectionDef['communicationMode']): { color: string; bg: string; label: string } {
  if (mode === 'sermao') return { color: 'var(--ai)', bg: 'rgba(139,92,246,0.08)', label: 'Sermão' }
  if (mode === 'estudo_biblico') return { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Estudo Bíblico' }
  if (mode === 'devocional') return { color: '#D97706', bg: 'rgba(217,119,6,0.08)', label: 'Devocional' }
  return { color: 'var(--accent)', bg: 'var(--accent-subtle)', label: 'Exegese' }
}

function sectionTheme(sectionDef: SectionDef): { color: string; bg: string; label: string } {
  if (sectionDef.phase === 'preparar') {
    return { color: '#D97706', bg: 'rgba(217,119,6,0.08)', label: 'Preparar' }
  }
  return modeTheme(sectionDef.communicationMode)
}

export default function SectionWorkspace({
  sectionDef, project, userId, existingSection, onUpdate, onAskAI,
}: Props) {
  const supabase = createClient()

  const loadCards = useCallback((): Record<string, string> => {
    const stored = existingSection?.content as Record<string, unknown> | null
    if (stored && typeof stored === 'object' && 'cards' in stored) {
      return stored.cards as Record<string, string>
    }
    return {}
  }, [existingSection])

  const [cardContent, setCardContent]   = useState<Record<string, string>>(loadCards)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set([sectionDef.cards[0]?.id]))
  const [editingCards, setEditingCards]   = useState<Set<string>>(() => new Set())
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [saving, setSaving]               = useState(false)
  const [savedAt, setSavedAt]             = useState<Date | null>(null)
  const [cardStates, setCardStates]       = useState<Record<string, CardState>>({})
  const [generatingAll, setGeneratingAll] = useState(false)
  const [hoveredCard, setHoveredCard]     = useState<string | null>(null)
  const [openMenu, setOpenMenu]           = useState<string | null>(null)

  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContent = useRef(cardContent)

  useEffect(() => { latestContent.current = cardContent }, [cardContent])

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return
    function handler() { setOpenMenu(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenu])

  function scheduleAutosave(cardId: string, value: string) {
    const next = { ...latestContent.current, [cardId]: value }
    setCardContent(next)
    latestContent.current = next
    setEditingCards(prev => new Set([...prev, cardId]))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(next), 1500)
  }

  async function performSave(content: Record<string, string>) {
    setSaving(true)
    const hasContent = Object.values(content).some(v => v.trim().length > 0)
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionDef.slug, module: sectionDef.module,
      title: sectionDef.title, content: { cards: content },
      status: (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    if (existingSection?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existingSection.id).select().single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) onUpdate(data as Section)
    }
    setSaving(false)
    setSavedAt(new Date())
  }

  async function manualSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await performSave(latestContent.current)
  }

  function toggleCard(cardId: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId)
      return next
    })
  }

  function toggleEdit(cardId: string) {
    setEditingCards(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId)
      return next
    })
  }

  async function generateCard(cardId: string) {
    setCardStates(prev => ({ ...prev, [cardId]: 'generating' }))
    setExpandedCards(prev => new Set([...prev, cardId]))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug, cardId,
          project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode },
        }),
      })
      const data = await res.json()
      const generated = data[cardId] ?? ''
      if (!generated) throw new Error('empty')
      const next = { ...latestContent.current, [cardId]: generated }
      setCardContent(next); latestContent.current = next
      setCardStates(prev => ({ ...prev, [cardId]: 'saving' }))
      await performSave(next)
      setCardStates(prev => ({ ...prev, [cardId]: 'saved' }))
      setEditingCards(prev => { const n = new Set(prev); n.delete(cardId); return n })
      setTimeout(() => setCardStates(prev => ({ ...prev, [cardId]: 'idle' })), 2000)
    } catch {
      setCardStates(prev => ({ ...prev, [cardId]: 'idle' }))
    }
  }

  async function generateAll() {
    setGeneratingAll(true)
    const allGenerating: Record<string, CardState> = {}
    sectionDef.cards.forEach(c => { allGenerating[c.id] = 'generating' })
    setCardStates(allGenerating)
    setExpandedCards(new Set(sectionDef.cards.map(c => c.id)))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug,
          project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode },
        }),
      })
      const data = await res.json()
      const next = { ...latestContent.current }
      sectionDef.cards.forEach(c => { if (data[c.id]) next[c.id] = data[c.id] })
      setCardContent(next); latestContent.current = next
      const allSaving: Record<string, CardState> = {}
      sectionDef.cards.forEach(c => { allSaving[c.id] = 'saving' })
      setCardStates(allSaving)
      await performSave(next)
      const allSaved: Record<string, CardState> = {}
      sectionDef.cards.forEach(c => { allSaved[c.id] = 'saved' })
      setCardStates(allSaved)
      setEditingCards(new Set())
      setTimeout(() => setCardStates({}), 2500)
    } catch {
      setCardStates({})
    } finally {
      setGeneratingAll(false)
    }
  }

  const moduleColor  = MODULE_COLORS[sectionDef.module] ?? 'var(--accent)'
  const theme        = sectionTheme(sectionDef)
  const hasAnyContent = Object.values(cardContent).some(v => v.trim().length > 0)
  const savedLabel   = saving
    ? 'salvando…'
    : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem clamp(1.5rem, 4vw, 2.5rem) 6rem', fontFamily: 'var(--font-sans)' }}>

      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.68rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '1.25rem',
      }}>
        {(sectionDef.phase === 'comunicar' || sectionDef.phase === 'preparar') && (
          <>
            <span style={{
              color: theme.color,
              background: theme.bg,
              border: `1px solid ${theme.color}35`,
              borderRadius: '5px',
              padding: '0.1rem 0.5rem',
              fontWeight: '700',
            }}>
              {theme.label}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
          </>
        )}
        <span style={{ color: moduleColor, fontWeight: '600' }}>
          {sectionDef.module.charAt(0).toUpperCase() + sectionDef.module.slice(1)}
        </span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{sectionDef.groupLabel}</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem', letterSpacing: 0, textTransform: 'none',
          color: saving ? 'var(--ai)' : savedAt ? 'var(--success)' : 'transparent',
          transition: 'color 0.3s',
        }}>
          {savedLabel || '·'}
        </span>
      </div>

      {/* Section title */}
      <h1 style={{
        fontSize: '1.75rem', fontWeight: '700',
        letterSpacing: '-0.03em', lineHeight: 1.15,
        color: 'var(--text-primary)', marginBottom: '0.5rem',
      }}>
        {sectionDef.title}
      </h1>

      {/* Reference */}
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', letterSpacing: '0.01em' }}>
        {project.book} {project.passage_ref} · {project.original_language}
      </p>

      {/* Objective */}
      <p style={{
        fontSize: '0.9rem', color: 'var(--text-secondary)',
        lineHeight: '1.75', fontStyle: 'italic',
        borderLeft: `2px solid ${theme.color}50`,
        paddingLeft: '1rem', marginBottom: '2rem',
      }}>
        {sectionDef.objective}
      </p>

      {/* Key questions — collapsible */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button
          onClick={() => setQuestionsOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', padding: 0,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          {questionsOpen
            ? <ChevronDown size={12} style={{ color: 'var(--text-muted)', opacity: 0.55 }} />
            : <ChevronDown size={12} style={{ color: 'var(--text-muted)', opacity: 0.4, transform: 'rotate(-90deg)' }} />
          }
          <span style={{
            fontSize: '0.67rem', fontWeight: '600',
            letterSpacing: '0.07em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            Perguntas Centrais
          </span>
          {!questionsOpen && (
            <span style={{
              fontSize: '0.67rem', color: 'var(--text-muted)',
              fontStyle: 'italic', opacity: 0.5,
            }}>
              — {sectionDef.keyQuestions.length} orientações
            </span>
          )}
        </button>

        {questionsOpen && (
          <div style={{
            marginTop: '0.75rem',
            paddingLeft: '0.9rem',
            borderLeft: `1px solid ${moduleColor}30`,
          }}>
            {sectionDef.keyQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => onAskAI(q)}
                style={{
                  display: 'block', width: '100%',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                  textAlign: 'left', padding: '0.2rem 0',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem', fontStyle: 'italic',
                  lineHeight: '1.6', transition: 'color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                · {q}
              </button>
            ))}

            {sectionDef.relevantAuthors.length > 0 && (
              <div style={{
                marginTop: '0.6rem', paddingTop: '0.45rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.69rem', color: 'var(--text-muted)',
                fontStyle: 'italic', opacity: 0.65,
              }}>
                {sectionDef.relevantAuthors.join(' · ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Cards ─────────────────────────────────────────────────────────── */}
      <div>
        {sectionDef.cards.map((card, idx) => {
          const content   = cardContent[card.id] ?? ''
          const expanded  = expandedCards.has(card.id)
          const dc        = dotColor(content)
          const state     = cardStates[card.id] ?? 'idle'
          const isWorking = state === 'generating' || state === 'saving'
          const hasContent = content.trim().length > 0
          const isEditing = editingCards.has(card.id) || !hasContent
          const preview   = !expanded && hasContent
            ? content.trim().slice(0, 160) + (content.trim().length > 160 ? '…' : '')
            : ''
          const isLast    = idx === sectionDef.cards.length - 1
          const showDots  = hoveredCard === card.id || openMenu === card.id

          const menuActions = [
            {
              label: isWorking ? (state === 'generating' ? 'Gerando…' : 'Salvando…') : state === 'saved' ? 'Gerado ✓' : 'Gerar com IA',
              action: () => { setOpenMenu(null); generateCard(card.id) },
              disabled: isWorking || generatingAll,
            },
            {
              label: 'Melhorar resposta',
              action: () => {
                setOpenMenu(null)
                onAskAI(`Melhore e aprofunde esta análise de "${card.title}" para ${project.book} ${project.passage_ref}:\n\n${content.slice(0, 800)}`)
              },
              disabled: !hasContent,
            },
            {
              label: 'Expandir análise',
              action: () => {
                setOpenMenu(null)
                onAskAI(card.aiTrigger + ' — Expanda com mais profundidade, exemplos exegéticos e referências de peso.')
              },
            },
            { separator: true },
            {
              label: 'Adicionar observação',
              action: () => {
                setOpenMenu(null)
                setExpandedCards(prev => new Set([...prev, card.id]))
                setEditingCards(prev => new Set([...prev, card.id]))
              },
            },
            {
              label: 'Duplicar conteúdo',
              action: () => {
                setOpenMenu(null)
                navigator.clipboard.writeText(content).catch(() => {})
              },
              disabled: !hasContent,
            },
            { separator: true },
            {
              label: 'Limpar conteúdo',
              action: () => { setOpenMenu(null); scheduleAutosave(card.id, '') },
              disabled: !hasContent,
              danger: true,
            },
          ]

          return (
            <div
              key={card.id}
              style={{
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
              }}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => { setHoveredCard(null) }}
            >
              {/* Card header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  cursor: 'pointer', userSelect: 'none',
                  padding: '1rem 0',
                  marginBottom: expanded ? '0' : '0',
                }}
                onClick={() => toggleCard(card.id)}
              >
                {/* Status dot */}
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                  background: dc,
                  transition: 'background 0.2s',
                }} />

                {/* Title */}
                <span style={{
                  fontSize: '0.92rem', fontWeight: '500',
                  color: expanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                  flex: 1, letterSpacing: '-0.01em',
                  transition: 'color 0.15s',
                }}>
                  {card.title}
                </span>

                {/* State label (generating/saved) */}
                {state !== 'idle' && (
                  <span style={{
                    fontSize: '0.7rem', color: state === 'saved' ? 'var(--success)' : 'var(--text-muted)',
                    fontStyle: 'italic', whiteSpace: 'nowrap',
                  }}>
                    {state === 'generating' ? 'gerando…'
                      : state === 'saving' ? 'salvando…'
                      : 'salvo ✓'}
                  </span>
                )}

                {/* Three-dot menu — appears on hover */}
                <div
                  style={{ position: 'relative', flexShrink: 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setOpenMenu(openMenu === card.id ? null : card.id)}
                    title="Opções"
                    style={{
                      background: openMenu === card.id ? 'var(--surface-2)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)',
                      opacity: showDots ? 1 : 0,
                      transition: 'opacity 0.15s, background 0.12s',
                      padding: '0.2rem 0.25rem',
                      borderRadius: '5px',
                      display: 'flex', alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
                    onMouseLeave={e => { if (openMenu !== card.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <MoreHorizontal size={14} strokeWidth={1.75} />
                  </button>

                  {/* Dropdown */}
                  {openMenu === card.id && (
                    <div
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                        zIndex: 100,
                        background: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
                        padding: '0.3rem',
                        minWidth: '186px',
                        animation: 'fadeIn 0.12s ease-out',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {menuActions.map((item, i) => (
                        'separator' in item ? (
                          <div key={i} style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />
                        ) : (
                          <button
                            key={item.label}
                            onClick={item.action}
                            disabled={item.disabled}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              background: 'transparent', border: 'none',
                              cursor: item.disabled ? 'not-allowed' : 'pointer',
                              fontFamily: 'inherit', fontSize: '0.83rem',
                              color: item.danger ? 'var(--error)' : 'var(--text-secondary)',
                              padding: '0.42rem 0.65rem',
                              borderRadius: '8px',
                              opacity: item.disabled ? 0.4 : 1,
                              transition: 'background 0.1s',
                              letterSpacing: '-0.005em',
                            }}
                            onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--surface)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                          >
                            {item.label}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Expand chevron */}
                {expanded
                  ? <ChevronUp size={13} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.5 }} />
                  : <ChevronDown size={13} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.35 }} />
                }
              </div>

              {/* Preview (collapsed + has content) */}
              {!expanded && preview && (
                <p style={{
                  fontSize: '0.84rem', color: 'var(--text-muted)',
                  lineHeight: '1.6', fontStyle: 'italic',
                  marginLeft: '1rem', marginTop: '-0.5rem', marginBottom: '1rem',
                }}>
                  {preview}
                </p>
              )}

              {/* Expanded content */}
              {expanded && (
                <div style={{ paddingBottom: '1.25rem' }}>
                  {isEditing ? (
                    <RichEditor
                      value={content}
                      onChange={html => scheduleAutosave(card.id, html)}
                      placeholder={card.placeholder}
                      moduleColor={moduleColor}
                      minHeight={200}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '1rem 1.1rem',
                        boxSizing: 'border-box',
                        minHeight: '5rem',
                      }}
                    >
                      {content.trimStart().startsWith('<') ? (
                        <div
                          className="rich-content-display"
                          dangerouslySetInnerHTML={{ __html: content }}
                          style={{
                            fontFamily: 'var(--font-serif), Georgia, serif',
                            fontSize: '0.9rem', lineHeight: '1.78',
                            color: 'var(--text-primary)',
                          }}
                        />
                      ) : (
                        <MarkdownRenderer content={content} moduleColor={moduleColor} />
                      )}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginTop: '0.5rem',
                  }}>
                    {hasContent && (
                      <button
                        onClick={() => toggleEdit(card.id)}
                        style={{
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', fontFamily: 'inherit',
                          fontSize: '0.71rem', color: 'var(--text-muted)',
                          padding: 0, transition: 'color 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        {isEditing ? '← Visualizar' : 'Editar'}
                      </button>
                    )}
                    <span style={{
                      fontSize: '0.67rem', marginLeft: 'auto',
                      color: fieldStatus(content) === 'empty' ? 'transparent'
                        : fieldStatus(content) === 'draft' ? 'var(--accent)'
                        : 'var(--success)',
                      opacity: 0.7,
                    }}>
                      {fieldStatus(content) === 'draft' ? 'rascunho'
                        : fieldStatus(content) === 'reviewed' ? 'revisado' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: '3rem', paddingTop: '2rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={generateAll}
          disabled={generatingAll}
          style={{
            background: generatingAll ? 'var(--surface-2)' : 'var(--accent)',
            color: generatingAll ? 'var(--text-muted)' : '#FFFFFF',
            border: 'none', borderRadius: '10px',
            padding: '0.7rem 1.75rem',
            fontSize: '0.88rem', fontWeight: '600',
            cursor: generatingAll ? 'wait' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
            transition: 'background 0.15s',
            boxShadow: generatingAll ? 'none' : '0 1px 2px rgba(59,130,246,0.25), 0 2px 8px rgba(59,130,246,0.15)',
          }}
        >
          {generatingAll ? 'Gerando seção completa…' : 'Gerar seção completa com IA'}
        </button>

        {hasAnyContent && (
          <button
            onClick={manualSave}
            disabled={saving}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: '8px',
              padding: '0.6rem 1rem', fontSize: '0.8rem',
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        )}
      </div>
    </div>
  )
}
