'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import { SECTION_DOC_TEMPLATES } from '@/lib/section-doc-templates'
import type { SectionDef } from '@/lib/workspace-sections'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import RichEditor from '@/components/RichEditorLazy'
import ReadingPopup from '@/components/ReadingPopup'
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
import ResearchGuidePanel from './ResearchGuidePanel'
import CardHelpTooltip from './CardHelpTooltip'
import HelpIcon from '@/components/help/HelpIcon'
import { getResearchGuide } from '@/lib/research-guides'
import { getCardHelp } from '@/lib/card-help'
import { HELP_CONTENT } from '@/lib/help-content'

type CardState = 'idle' | 'generating' | 'saving' | 'saved'
type WorkspaceCard = SectionDef['cards'][number]
type DynamicPointCard = Pick<WorkspaceCard, 'id' | 'title'>

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

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(lt|gt|amp|quot|#39|nbsp);/g, entity => HTML_ENTITIES[entity] ?? entity)
}

function normalizeStoredHtml(value: string): string {
  const decoded = decodeHtmlEntities(value)
  return /<\/?[a-z][\s\S]*>/i.test(decoded.trim()) ? decoded : value
}

function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(normalizeStoredHtml(value).trim())
}

function toDisplayText(value: string): string {
  const normalized = normalizeStoredHtml(value)
  if (!isHtmlContent(normalized)) return normalized

  return decodeHtmlEntities(
    normalized
      .replace(/<(br|hr)\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Doc mode helpers ───────────────────────────────────────────────────────

function buildPlaceholderLines(placeholder: string): string {
  const parts: string[] = []
  const lines = placeholder.split('\n')
  let inList = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { if (inList) { parts.push('</ul>'); inList = false } continue }
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      if (!inList) { parts.push('<ul>'); inList = true }
      parts.push(`<li>${trimmed.slice(1).trim()}</li>`)
    } else {
      if (inList) { parts.push('</ul>'); inList = false }
      parts.push(`<p>${trimmed}</p>`)
    }
  }
  if (inList) parts.push('</ul>')
  return parts.join('')
}

function buildDocTemplate(def: SectionDef): string {
  if (SECTION_DOC_TEMPLATES[def.slug]) return SECTION_DOC_TEMPLATES[def.slug]
  if (def.cards.length === 0) return ''
  return def.cards
    .map(card => `<h3>${card.title}</h3>${buildPlaceholderLines(card.placeholder)}`)
    .join('')
}

function migrateCardsToDoc(def: SectionDef, cards: Record<string, string>): string {
  return def.cards
    .map(card => {
      const existing = cards[card.id]
      const body = (existing && existing.trim()) ? existing : buildPlaceholderLines(card.placeholder)
      return `<h3>${card.title}</h3>${body}`
    })
    .join('')
}

function isOnlyTemplate(doc: string, def: SectionDef): boolean {
  const norm = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&\w+;/g, '').replace(/\s+/g, '').toLowerCase()
  return norm(doc) === norm(buildDocTemplate(def)) || norm(doc) === ''
}

function stripHtmlText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

const MODULE_COLORS: Record<string, string> = {
  inventio:     'var(--accent)',
  dispositio:   'var(--ai)',
  elocutio:     '#6366F1',
  memoria:      '#10B981',
  pronuntiatio: '#F97316',
}

const LEIA_ASSIMILE_SUGGESTIONS = [
  'Leia o texto lentamente.',
  'Leia o texto mais de uma vez.',
  'Leia o texto em voz alta.',
  'Leia blocos maiores e menores da passagem.',
  'Observe palavras repetidas.',
  'Observe mudanças de assunto.',
  'Procure ouvir o texto antes de analisá-lo.',
]

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

function isPalestraPointCard(cardId: string): boolean {
  return /^ponto_\d+$/.test(cardId) || /^palestra_ponto_/.test(cardId)
}

function makePalestraPointCard(meta: DynamicPointCard): WorkspaceCard {
  return {
    id: meta.id,
    title: meta.title,
    placeholder: `Desenvolva o conteúdo de "${meta.title}" para esta palestra.`,
    aiTrigger: `Gere conteúdo para o ponto "${meta.title}" da palestra, com argumento claro, progressão oral, exemplos, transições e aplicação ao público.`,
  }
}

function createPalestraPoint(index: number): DynamicPointCard {
  return {
    id: `palestra_ponto_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title: `Ponto ${index}`,
  }
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

  const isPalestraConstruir = sectionDef.slug === 'palestra_construir'
  const isTabLayout        = !isPalestraConstruir
  const isDocMode          = !isPalestraConstruir

  const loadDynamicPointCards = useCallback((): DynamicPointCard[] => {
    if (!isPalestraConstruir) return []
    const stored = existingSection?.content as Record<string, unknown> | null
    const saved = stored?.dynamicPointCards
    if (Array.isArray(saved)) {
      return saved
        .filter((item): item is DynamicPointCard => {
          if (!item || typeof item !== 'object') return false
          const candidate = item as Record<string, unknown>
          return typeof candidate.id === 'string' && typeof candidate.title === 'string'
        })
        .map(item => ({ id: item.id, title: item.title.trim() || 'Ponto' }))
    }

    return sectionDef.cards
      .filter(card => isPalestraPointCard(card.id))
      .map(card => ({ id: card.id, title: card.title }))
  }, [existingSection, isPalestraConstruir, sectionDef.cards])

  // ── Doc mode state ────────────────────────────────────────────────────────
  const loadDoc = useCallback((): string => {
    const stored = existingSection?.content as Record<string, unknown> | null
    if (stored?.doc && typeof stored.doc === 'string') return stored.doc
    if (stored?.cards) return migrateCardsToDoc(sectionDef, stored.cards as Record<string, string>)
    return buildDocTemplate(sectionDef)
  }, [existingSection, sectionDef])

  const [docContent, setDocContent] = useState<string>(loadDoc)
  const [docReading, setDocReading] = useState(false)
  const latestDoc = useRef(docContent)

  // ── Palestra-only state ───────────────────────────────────────────────────
  const [cardContent, setCardContent]   = useState<Record<string, string>>(loadCards)
  const [dynamicPointCards, setDynamicPointCards] = useState<DynamicPointCard[]>(loadDynamicPointCards)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set([sectionDef.cards[0]?.id]))
  const [activeTab, setActiveTab]        = useState<string>(() => sectionDef.cards[0]?.id ?? '')
  const [editingCards, setEditingCards]   = useState<Set<string>>(() => new Set())
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [saving, setSaving]               = useState(false)
  const [savedAt, setSavedAt]             = useState<Date | null>(null)
  const [cardStates, setCardStates]       = useState<Record<string, CardState>>({})
  const [cardErrors, setCardErrors]       = useState<Record<string, string>>({})
  const [generatingAll, setGeneratingAll] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard]     = useState<string | null>(null)
  const [openMenu, setOpenMenu]           = useState<string | null>(null)
  const [readingCard, setReadingCard]     = useState<string | null>(null)
  const [isDirty, setIsDirty]             = useState(false)
  const [previewMode, setPreviewMode]     = useState(false)

  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContent = useRef(cardContent)
  const latestDynamicPointCards = useRef(dynamicPointCards)
  const savedContent  = useRef<Record<string, string>>(cardContent)

  useEffect(() => { latestContent.current = cardContent }, [cardContent])
  useEffect(() => { latestDynamicPointCards.current = dynamicPointCards }, [dynamicPointCards])
  useEffect(() => { latestDoc.current = docContent }, [docContent])

  const activeCards: WorkspaceCard[] = isPalestraConstruir
    ? sectionDef.cards.flatMap(card => {
      if (card.id === 'ponto_1') return dynamicPointCards.map(makePalestraPointCard)
      if (isPalestraPointCard(card.id)) return []
      return [card]
    })
    : sectionDef.cards

  // Close menu on outside click
  useEffect(() => {
    if (!openMenu) return
    function handler() { setOpenMenu(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openMenu])

  // Close orientation popup on outside click
  useEffect(() => {
    if (!questionsOpen) return
    function handler() { setQuestionsOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [questionsOpen])

  function scheduleAutosave(cardId: string, value: string) {
    const next = { ...latestContent.current, [cardId]: value }
    setCardContent(next)
    latestContent.current = next
    setEditingCards(prev => new Set([...prev, cardId]))
    setIsDirty(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(next), 1500)
  }

  async function performSave(content: Record<string, string>, pointCards = latestDynamicPointCards.current) {
    setSaving(true)
    const hasContent = Object.values(content).some(v => v.trim().length > 0)
    const allFilled = sectionDef.cards.length > 0 &&
      sectionDef.cards.every(card => (content[card.id] ?? '').trim().length > 0)
    const storedContent: Record<string, unknown> = { cards: content }
    if (isPalestraConstruir) storedContent.dynamicPointCards = pointCards
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionDef.slug, module: sectionDef.module,
      title: sectionDef.title, content: storedContent,
      status: (allFilled ? 'reviewed' : hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
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
    savedContent.current = content
    setIsDirty(false)
  }

  function cancelEdits() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setCardContent(savedContent.current)
    latestContent.current = savedContent.current
    setEditingCards(new Set())
    setIsDirty(false)
  }

  // ── Doc mode save ──────────────────────────────────────────────────────────
  async function performSaveDoc(doc: string) {
    setSaving(true)
    const text = stripHtmlText(doc)
    const onlyTpl = isOnlyTemplate(doc, sectionDef)
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionDef.slug, module: sectionDef.module,
      title: sectionDef.title, content: { doc },
      status: (onlyTpl ? 'empty' : text.length > 400 ? 'reviewed' : 'draft') as 'empty' | 'draft' | 'reviewed',
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

  function scheduleAutosaveDoc(html: string) {
    setDocContent(html)
    latestDoc.current = html
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSaveDoc(html), 1500)
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

  async function saveDynamicPointStructure(nextPointCards: DynamicPointCard[], nextContent = latestContent.current) {
    setDynamicPointCards(nextPointCards)
    latestDynamicPointCards.current = nextPointCards
    await performSave(nextContent, nextPointCards)
  }

  async function addDynamicPoint() {
    const nextPoint = createPalestraPoint(dynamicPointCards.length + 1)
    const nextPoints = [...dynamicPointCards, nextPoint]
    setExpandedCards(prev => new Set([...prev, nextPoint.id]))
    setEditingCards(prev => new Set([...prev, nextPoint.id]))
    await saveDynamicPointStructure(nextPoints)
  }

  async function renameDynamicPoint(cardId: string) {
    const current = dynamicPointCards.find(point => point.id === cardId)
    if (!current) return
    const nextTitle = window.prompt('Novo título do ponto', current.title)
    if (nextTitle === null) return
    const title = nextTitle.trim()
    if (!title) return
    const nextPoints = dynamicPointCards.map(point => point.id === cardId ? { ...point, title } : point)
    await saveDynamicPointStructure(nextPoints)
  }

  async function removeDynamicPoint(cardId: string) {
    if (dynamicPointCards.length <= 1) {
      window.alert('A palestra precisa manter pelo menos um ponto.')
      return
    }
    const current = dynamicPointCards.find(point => point.id === cardId)
    const ok = window.confirm(`Remover "${current?.title ?? 'este ponto'}"? O conteúdo deste ponto também será removido.`)
    if (!ok) return
    const nextPoints = dynamicPointCards.filter(point => point.id !== cardId)
    const nextContent = { ...latestContent.current }
    delete nextContent[cardId]
    setCardContent(nextContent)
    latestContent.current = nextContent
    setExpandedCards(prev => {
      const next = new Set(prev)
      next.delete(cardId)
      return next
    })
    setEditingCards(prev => {
      const next = new Set(prev)
      next.delete(cardId)
      return next
    })
    await saveDynamicPointStructure(nextPoints, nextContent)
  }

  async function moveDynamicPoint(cardId: string, direction: -1 | 1) {
    const index = dynamicPointCards.findIndex(point => point.id === cardId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= dynamicPointCards.length) return
    const nextPoints = [...dynamicPointCards]
    const [item] = nextPoints.splice(index, 1)
    nextPoints.splice(target, 0, item)
    await saveDynamicPointStructure(nextPoints)
  }

  async function generateCard(cardId: string) {
    const currentValue = latestContent.current[cardId] ?? ''
    if (toDisplayText(currentValue).trim()) {
      const ok = window.confirm('Este campo já possui conteúdo. Deseja substituir pelo conteúdo gerado com IA?')
      if (!ok) return
    }

    setCardStates(prev => ({ ...prev, [cardId]: 'generating' }))
    setCardErrors(prev => {
      const next = { ...prev }
      delete next[cardId]
      return next
    })
    setExpandedCards(prev => new Set([...prev, cardId]))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug, cardId,
          dynamicCards: isPalestraConstruir ? activeCards.map(({ id, title, aiTrigger }) => ({ id, title, aiTrigger })) : undefined,
          currentCards: latestContent.current,
          project: { id: project.id, title: project.title, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Não foi possível gerar conteúdo com IA.')
      const generated = data[cardId] ?? ''
      if (!generated.trim()) throw new Error('A IA não retornou conteúdo para este campo.')
      if (generated.trim() === currentValue.trim()) {
        setCardStates(prev => ({ ...prev, [cardId]: 'saved' }))
        setTimeout(() => setCardStates(prev => ({ ...prev, [cardId]: 'idle' })), 1800)
        return
      }
      const next = { ...latestContent.current, [cardId]: generated }
      setCardContent(next); latestContent.current = next
      setCardStates(prev => ({ ...prev, [cardId]: 'saving' }))
      await performSave(next)
      setCardStates(prev => ({ ...prev, [cardId]: 'saved' }))
      setEditingCards(prev => { const n = new Set(prev); n.delete(cardId); return n })
      setTimeout(() => setCardStates(prev => ({ ...prev, [cardId]: 'idle' })), 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível gerar conteúdo com IA.'
      setCardErrors(prev => ({ ...prev, [cardId]: message }))
      setCardStates(prev => ({ ...prev, [cardId]: 'idle' }))
    }
  }

  async function generateAll() {
    const hasExistingContent = Object.values(latestContent.current).some(value => toDisplayText(value).trim())
    if (hasExistingContent) {
      const ok = window.confirm('Alguns campos já possuem conteúdo. Deseja substituir apenas os campos retornados pela IA?')
      if (!ok) return
    }

    setGeneratingAll(true)
    setGenerationError(null)
    setCardErrors({})
    const allGenerating: Record<string, CardState> = {}
    activeCards.forEach(c => { allGenerating[c.id] = 'generating' })
    setCardStates(allGenerating)
    setExpandedCards(new Set(activeCards.map(c => c.id)))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug,
          cardIds: activeCards.map(card => card.id),
          dynamicCards: isPalestraConstruir ? activeCards.map(({ id, title, aiTrigger }) => ({ id, title, aiTrigger })) : undefined,
          currentCards: latestContent.current,
          project: { id: project.id, title: project.title, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Não foi possível gerar a seção com IA.')
      const next = { ...latestContent.current }
      activeCards.forEach(c => { if (data[c.id]) next[c.id] = data[c.id] })
      setCardContent(next); latestContent.current = next
      const allSaving: Record<string, CardState> = {}
      activeCards.forEach(c => { allSaving[c.id] = 'saving' })
      setCardStates(allSaving)
      await performSave(next)
      const allSaved: Record<string, CardState> = {}
      activeCards.forEach(c => { allSaved[c.id] = 'saved' })
      setCardStates(allSaved)
      setEditingCards(new Set())
      setTimeout(() => setCardStates({}), 2500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível gerar a seção com IA.'
      setGenerationError(message)
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
      {(() => {
        const isThematicLexical = sectionDef.group.startsWith('termos_') || sectionDef.group.startsWith('et_')
        const showPhaseBadge = !isThematicLexical && (sectionDef.phase === 'comunicar' || sectionDef.phase === 'preparar')
        return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.68rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '1.25rem',
      }}>
        {showPhaseBadge && (
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
        {!isThematicLexical && (
          <>
            <span style={{ color: moduleColor, fontWeight: '600' }}>
              {sectionDef.module.charAt(0).toUpperCase() + sectionDef.module.slice(1)}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
          </>
        )}
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
        )
      })()}

      {/* Section title + orientation button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.5rem' }}>
        <h1 style={{
          flex: 1,
          fontSize: '1.75rem', fontWeight: '700',
          letterSpacing: '-0.03em', lineHeight: 1.15,
          color: 'var(--text-primary)', margin: 0,
        }}>
          {sectionDef.title}
        </h1>

        {sectionDef.keyQuestions.length > 0 && (
          <div style={{ position: 'relative', flexShrink: 0, marginTop: '0.35rem' }}>
            <button
              onClick={() => setQuestionsOpen(o => !o)}
              title="Perguntas orientadoras"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: questionsOpen ? `${moduleColor}12` : 'var(--surface)',
                border: `1px solid ${questionsOpen ? moduleColor + '40' : 'var(--border)'}`,
                borderRadius: '8px', padding: '0.3rem 0.65rem',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', fontWeight: 600,
                color: questionsOpen ? moduleColor : 'var(--text-muted)',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!questionsOpen) { e.currentTarget.style.borderColor = moduleColor + '30'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
              onMouseLeave={e => { if (!questionsOpen) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
            >
              <span style={{ fontSize: '0.85rem' }}>💡</span>
              Orientação
            </button>

            {questionsOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                zIndex: 200,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
                padding: '0.85rem 1rem',
                width: '320px',
                maxHeight: '400px', overflowY: 'auto',
              }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Perguntas orientadoras
                </p>
                {sectionDef.keyQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { onAskAI(q); setQuestionsOpen(false) }}
                    style={{
                      display: 'block', width: '100%',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit',
                      textAlign: 'left', padding: '0.22rem 0',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem', lineHeight: '1.55',
                      transition: 'color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = moduleColor }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    · {q}
                  </button>
                ))}
                {sectionDef.relevantAuthors.length > 0 && (
                  <div style={{
                    marginTop: '0.65rem', paddingTop: '0.5rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic',
                  }}>
                    {sectionDef.relevantAuthors.join(' · ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reference */}
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', letterSpacing: '0.01em', marginTop: '0.5rem' }}>
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

      {/* ── Research guide ────────────────────────────────────────────────── */}
      {(() => {
        const guide = getResearchGuide(sectionDef.slug)
        return guide
          ? <ResearchGuidePanel guide={guide} onAskAI={onAskAI} accentColor={moduleColor} />
          : null
      })()}

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div>
        {isDocMode ? (
          <RichEditor
            value={docContent}
            onChange={scheduleAutosaveDoc}
            moduleColor={moduleColor}
            minHeight={560}
            sticky
            aiContext={{
              project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode ?? undefined },
              phase: sectionDef.phase,
              phaseLabel: ({ preparar: 'Preparar', investigar: 'Investigar', comunicar: 'Pregar', ferramentas: 'Ferramentas' } as Record<string, string>)[sectionDef.phase ?? ''] ?? sectionDef.phase,
              section: sectionDef.slug,
              sectionLabel: sectionDef.title,
              userId,
            }}
          />
        ) : null}

        {!isTabLayout && activeCards.map((card, idx) => {
          const content   = cardContent[card.id] ?? ''
          const displayContent = normalizeStoredHtml(content)
          const displayText = toDisplayText(content)
          const expanded  = expandedCards.has(card.id)
          const dc        = dotColor(displayText)
          const state     = cardStates[card.id] ?? 'idle'
          const isWorking = state === 'generating' || state === 'saving'
          const errorMessage = cardErrors[card.id]
          const hasContent = displayText.trim().length > 0
          const isEditing = editingCards.has(card.id) || !hasContent
          const preview   = !expanded && hasContent
            ? displayText.slice(0, 160) + (displayText.length > 160 ? '…' : '')
            : ''
          const isLast    = idx === activeCards.length - 1
          const showDots  = hoveredCard === card.id || openMenu === card.id
          const isDynamicPoint = isPalestraConstruir && dynamicPointCards.some(point => point.id === card.id)
          const dynamicIndex = dynamicPointCards.findIndex(point => point.id === card.id)

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
            ...(isDynamicPoint ? [
              { separator: true as const },
              {
                label: 'Renomear ponto',
                action: () => { setOpenMenu(null); renameDynamicPoint(card.id) },
              },
              {
                label: 'Mover para cima',
                action: () => { setOpenMenu(null); moveDynamicPoint(card.id, -1) },
                disabled: dynamicIndex <= 0,
              },
              {
                label: 'Mover para baixo',
                action: () => { setOpenMenu(null); moveDynamicPoint(card.id, 1) },
                disabled: dynamicIndex < 0 || dynamicIndex >= dynamicPointCards.length - 1,
              },
              {
                label: 'Remover ponto',
                action: () => { setOpenMenu(null); removeDynamicPoint(card.id) },
                disabled: dynamicPointCards.length <= 1,
                danger: true,
              },
            ] : []),
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

                {/* Title + help */}
                <span style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.92rem', fontWeight: '500',
                    color: expanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.15s',
                  }}>
                    {card.title}
                  </span>
                  {(() => {
                    if (HELP_CONTENT[card.id]) return <HelpIcon cardId={card.id} onAskAI={onAskAI} visible={expanded} />
                    const help = getCardHelp(card.id)
                    return help ? <CardHelpTooltip help={help} /> : null
                  })()}
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
                            onMouseDown={e => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (!item.disabled) item.action()
                            }}
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
                  {errorMessage && (
                    <div style={{
                      marginBottom: '0.75rem',
                      padding: '0.65rem 0.75rem',
                      border: '1px solid rgba(185, 28, 28, 0.22)',
                      borderRadius: '8px',
                      background: 'rgba(254, 242, 242, 0.9)',
                      color: '#B91C1C',
                      fontSize: '0.78rem',
                      lineHeight: 1.45,
                    }}>
                      {errorMessage}
                    </div>
                  )}
                  {isEditing ? (
                    <RichEditor
                      value={content}
                      onChange={html => scheduleAutosave(card.id, html)}
                      placeholder={card.placeholder}
                      moduleColor={moduleColor}
                      minHeight={200}
                      sticky
                      aiContext={{
                        project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode ?? undefined },
                        phase: sectionDef.phase,
                        phaseLabel: ({ preparar: 'Preparar', investigar: 'Investigar', comunicar: 'Pregar', ferramentas: 'Ferramentas' } as Record<string, string>)[sectionDef.phase ?? ''] ?? sectionDef.phase,
                        section: sectionDef.slug,
                        sectionLabel: sectionDef.title,
                        field: card.id,
                        fieldLabel: card.title,
                        userId,
                      }}
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
                      {isHtmlContent(displayContent) ? (
                        <div
                          className="rich-content-display"
                          dangerouslySetInnerHTML={{ __html: displayContent }}
                          style={{
                            fontFamily: 'var(--font-serif), Georgia, serif',
                            fontSize: '0.9rem', lineHeight: '1.78',
                            color: 'var(--text-primary)',
                          }}
                        />
                      ) : (
                        <MarkdownRenderer content={displayContent} moduleColor={moduleColor} />
                      )}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginTop: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
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
                          {isEditing ? '← Voltar' : 'Editar'}
                        </button>
                      )}
                      {hasContent && (
                        <button
                          onClick={() => setReadingCard(card.id)}
                          style={{
                            background: 'transparent', border: 'none',
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.71rem', color: 'var(--text-muted)',
                            padding: 0, transition: 'color 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        >
                          👁 Visualizar
                        </button>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.67rem', marginLeft: 'auto',
                      color: fieldStatus(displayText) === 'empty' ? 'transparent'
                        : fieldStatus(displayText) === 'draft' ? 'var(--accent)'
                        : 'var(--success)',
                      opacity: 0.7,
                    }}>
                      {fieldStatus(displayText) === 'draft' ? 'rascunho'
                        : fieldStatus(displayText) === 'reviewed' ? 'revisado' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {isPalestraConstruir && (
          <div style={{
            paddingTop: '1rem',
            borderTop: activeCards.length ? '1px solid var(--border-subtle)' : 'none',
            display: 'flex',
            justifyContent: 'flex-start',
          }}>
            <button
              type="button"
              onClick={addDynamicPoint}
              disabled={saving}
              style={{
                background: 'transparent',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
                borderRadius: '9px',
                padding: '0.52rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: saving ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = moduleColor
                e.currentTarget.style.color = moduleColor
                e.currentTarget.style.background = `${moduleColor}0D`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              + Adicionar ponto
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      {isDocMode ? (
        /* Doc mode: autosave indicator + visualizar */
        <div style={{
          marginTop: '1.5rem', paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem',
        }}>
          {(saving || savedAt) && (
            <span style={{
              fontSize: '0.71rem',
              color: saving ? 'var(--ai)' : 'var(--text-muted)',
              whiteSpace: 'nowrap', transition: 'color 0.3s',
            }}>
              {saving ? 'Salvando…' : `✓ ${savedLabel}`}
            </span>
          )}
          <button
            onClick={() => setDocReading(true)}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: '6px',
              padding: '0.38rem 0.7rem', fontSize: '0.74rem',
              cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            👁 Visualizar
          </button>
        </div>
      ) : (
        /* Palestra mode: existing footer */
        <>
          {generationError && (
            <div style={{
              marginTop: '2.5rem', padding: '0.7rem 0.85rem',
              border: '1px solid rgba(185,28,28,0.22)', borderRadius: '8px',
              background: 'rgba(254,242,242,0.9)', color: '#B91C1C',
              fontSize: '0.8rem', lineHeight: 1.45,
            }}>
              {generationError}
            </div>
          )}
          <div style={{
            marginTop: '2.5rem', paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '0.75rem',
          }}>
            <button
              onClick={generateAll}
              disabled={generatingAll}
              style={{
                background: generatingAll ? 'var(--surface-2)' : 'var(--accent)',
                color: generatingAll ? 'var(--text-muted)' : '#FFFFFF',
                border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem',
                fontSize: '0.82rem', fontWeight: 600,
                cursor: generatingAll ? 'wait' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                transition: 'background 0.15s', flexShrink: 0,
                boxShadow: generatingAll ? 'none' : '0 1px 2px rgba(30,77,140,0.2)',
              }}
            >
              {generatingAll ? 'Gerando…' : 'Gerar com IA'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              {(saving || savedAt) && (
                <span style={{ fontSize: '0.71rem', color: saving ? 'var(--ai)' : 'var(--text-muted)', whiteSpace: 'nowrap', paddingRight: '0.35rem', transition: 'color 0.3s' }}>
                  {saving ? 'Salvando…' : `✓ ${savedLabel}`}
                </span>
              )}
              <button onClick={() => setPreviewMode(true)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', padding: '0.38rem 0.7rem', fontSize: '0.74rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-secondary)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>Visualizar</button>
              {isDirty && <button onClick={cancelEdits} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '6px', padding: '0.38rem 0.7rem', fontSize: '0.74rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>Cancelar</button>}
              {hasAnyContent && <button onClick={manualSave} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.38rem 0.85rem', fontSize: '0.74rem', fontWeight: 600, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s', opacity: saving ? 0.7 : 1 }} onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--accent-hover)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}>Salvar</button>}
            </div>
          </div>
        </>
      )}

      {/* ── Doc mode: reading popup ──────────────────────────────────────── */}
      {isDocMode && docReading && (
        <ReadingPopup
          title={sectionDef.shortTitle}
          html={docContent}
          moduleColor={moduleColor}
          onClose={() => setDocReading(false)}
          onEdit={() => setDocReading(false)}
        />
      )}

      {/* ── Palestra mode: reading popup + preview overlay ───────────────── */}
      {!isDocMode && readingCard && (() => {
        const card = activeCards.find(c => c.id === readingCard)
        if (!card) return null
        const content = cardContent[readingCard] ?? ''
        return (
          <ReadingPopup
            title={card.title}
            html={content}
            moduleColor={moduleColor}
            onClose={() => setReadingCard(null)}
            onEdit={() => {
              setReadingCard(null)
              setExpandedCards(prev => new Set([...prev, readingCard]))
              setEditingCards(prev => new Set([...prev, readingCard]))
            }}
          />
        )
      })()}

      {!isDocMode && previewMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'var(--background)', overflowY: 'auto' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem clamp(1.5rem,4vw,2.5rem) 6rem', fontFamily: 'var(--font-sans)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>{sectionDef.groupLabel}</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{sectionDef.title}</h2>
              </div>
              <button onClick={() => setPreviewMode(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>← Voltar à edição</button>
            </div>
            {activeCards.map(card => {
              const content = cardContent[card.id] ?? ''
              if (!content.trim()) return null
              return (
                <div key={card.id} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', marginTop: 0 }}>{card.title}</h3>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--text-primary)' }}><MarkdownRenderer content={content} /></div>
                </div>
              )
            })}
            {!hasAnyContent && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', paddingTop: '4rem' }}>Nenhum conteúdo ainda.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
