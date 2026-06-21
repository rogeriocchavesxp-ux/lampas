'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Section } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import {
  WORKSPACE_SECTIONS_NAV,
  getSectionsByGroupNav,
  getSectionNavBySlug,
} from '@/lib/workspace-sections-nav'
import {
  SYNTHESIS_DEFS,
  isSynthesisSlug,
  getSynthesisBySlug,
  type SectionDef,
} from '@/lib/workspace-sections'
import { useSectionDef } from '@/hooks/useSectionDef'
import { TOOL_AREAS, getToolAreaBySlug, isToolSlug } from '@/lib/tools-content'
import SectionWorkspace from './SectionWorkspace'
import SynthesisView from './SynthesisView'
import OriginalTextWorkspace from './OriginalTextWorkspace'
import TermosChaveWorkspace from './TermosChaveWorkspace'
import EstruturaLiterariaWorkspace from './EstruturaLiterariaWorkspace'
import ToolsWorkspace from './ToolsWorkspace'
import RecortesWorkspace from './RecortesWorkspace'
import SermonBuilderWorkspace from './SermonBuilderWorkspace'
import CommentaryWorkspace from './CommentaryWorkspace'
import ComentarioExegeticoWorkspace from './ComentarioExegeticoWorkspace'
import ProduzirWorkspace from './ProduzirWorkspace'
import ProductionsLibrary from './ProductionsLibrary'
import WorkspaceMenuBar from './WorkspaceMenuBar'
import WorkspaceContextBadge from './WorkspaceContextBadge'
import FloatingBrowser from './FloatingBrowser'
import ImprovementChecklistPanel from './ImprovementChecklistPanel'
import LiveReferencePanel from './LiveReferencePanel'
import AIPanel from './AIPanel'
import BibleFloatingWindow from './BibleFloatingWindow'
import VisaoGeralWorkspace from './VisaoGeralWorkspace'
import EnviarParaSermaModal from './EnviarParaSermaModal'
import DicionarioWorkspace from './DicionarioWorkspace'
import IntroducaoWorkspace from './IntroducaoWorkspace'
import BibliotecaWorkspace from './BibliotecaWorkspace'
import WorkspaceLateralTabs from './WorkspaceLateralTabs'
import FreeModeEditor from './FreeModeEditor'
import {
  Heart, BookOpen, FileText, Crosshair, Landmark, Languages, GraduationCap,
  Sparkles, BookMarked, Flame, MessageSquareText, Layers, Book, Library,
  BookCopy, Link2, Paperclip, ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
  MapPin, Network, TrendingUp, LayoutTemplate, Mic, Brain, Megaphone,
  AlignJustify, GitBranch, Palette, Tag, X,
  type LucideIcon,
} from 'lucide-react'
import {
  getModeConfig,
  STUDY_MODE_REGISTRY,
  type NavPhase,
} from '@/lib/study-modes'
import { WorkspaceProvider } from './WorkspaceContext'


import {
  getPhaseFor, getGroupFor, getCanonFor, getPhaseNavSlug, cardTextStatus, toolProgress,
  GuidedStrip, ResizeHandle,
  GROUP_SUBTITLES, GROUP_ACCENT_COLORS, GROUP_EMOJI, GROUP_ICONS, MODE_ICONS_LUCIDE, VG_SLUGS,
} from './workspace-client-config'

interface Props {
  user: User
  project: Project
  initialSections: Section[]
}

// ── Progress ring for group headers ──────────────────────────────────────────

function ProgressRing({ pct, color, size = 15 }: { pct: number; color: string; size?: number }) {
  const sw   = 1.8
  const r    = (size - sw) / 2
  const c    = 2 * Math.PI * r
  const done = pct >= 100
  const arc  = Math.min(pct, 100) / 100 * c
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      {/* Track — always visible */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#CBD5E1" strokeWidth={sw} />
      {/* Arc — shown when any progress */}
      {pct > 0 && (
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={done ? '#059669' : color}
          strokeWidth={sw}
          strokeDasharray={`${arc} ${c}`}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}


// ── Componente principal ────────────────────────────────────────────────────

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  // ── Título editável ───────────────────────────────────────────────────────
  const [titleValue,    setTitleValue]    = useState(project.title)
  const [titleDraft,    setTitleDraft]    = useState('')
  const [editingTitle,  setEditingTitle]  = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  function startTitleEdit() {
    setTitleDraft(titleValue)
    setEditingTitle(true)
    setTimeout(() => titleInputRef.current?.select(), 0)
  }

  async function commitTitle() {
    const trimmed = titleDraft.trim()
    setEditingTitle(false)
    if (!trimmed || trimmed === titleValue) return
    setTitleValue(trimmed)
    await supabase.from('projects').update({ title: trimmed }).eq('id', project.id)
  }

  function cancelTitle() {
    setEditingTitle(false)
  }

  // ── Mode config — fonte de verdade para navegação ─────────────────────
  const modeConfig = useMemo(
    () => getModeConfig(project.study_mode ?? project.project_type),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id]
  )
  const navPhases   = modeConfig.phases
  const navGroupIds = useMemo(
    () => new Set(navPhases.flatMap(ph => ph.modes.flatMap(m => m.groups.map(g => g.id)))),
    [navPhases]
  )

  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState(() => {
    const fromUrl = searchParams.get('section')
    if (fromUrl) return fromUrl
    try {
      const saved = localStorage.getItem(`lampas_section_${project.id}`)
      if (saved) return saved
    } catch {}
    return modeConfig.defaultSection
  })
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(modeConfig.defaultExpandedPhases))
  const [expandedCanons, setExpandedCanons] = useState<Set<string>>(() => new Set(modeConfig.defaultExpandedCanons))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(modeConfig.defaultExpandedGroups))
  const [expandedSectionCards, setExpandedSectionCards] = useState<Set<string>>(() => {
    const fromUrl = searchParams.get('section')
    if (fromUrl) return new Set([fromUrl])
    try {
      const saved = localStorage.getItem(`lampas_section_${project.id}`)
      if (saved) return new Set([saved])
    } catch {}
    return new Set([modeConfig.defaultSection])
  })
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Work mode (guided / free) per phase — persisted per project
  const [workModeMap, setWorkModeMap] = useState<Partial<Record<string, 'guided' | 'free'>>>(() => {
    try {
      const saved = localStorage.getItem(`lampas_workmode_${project.id}`)
      return saved ? JSON.parse(saved) as Partial<Record<string, 'guided' | 'free'>> : {}
    } catch { return {} }
  })

  function setWorkMode(phaseId: string, mode: 'guided' | 'free') {
    setWorkModeMap(prev => {
      const next = { ...prev, [phaseId]: mode }
      try { localStorage.setItem(`lampas_workmode_${project.id}`, JSON.stringify(next)) } catch {}
      return next
    })
  }

  // Panel layout
  const [sidebarWidth, setSidebarWidth] = useState(264)
  const [referenceWidth, setReferenceWidth] = useState(280)
  const [aiWidth, setAiWidth] = useState(308)
  const [biblePanelWidth, setBiblePanelWidth] = useState(380)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [referenceCollapsed, setReferenceCollapsed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [sideBySide, setSideBySide] = useState(false)
  const [bibleOpen, setBibleOpen] = useState(false)
  const [enviarParaSermaOpen, setEnviarParaSermaOpen] = useState(false)
  const [enviarTargetMode, setEnviarTargetMode] = useState<'sermao' | 'devocional'>('sermao')
  const [enviarDropdownOpen, setEnviarDropdownOpen] = useState(false)
  const enviarDropdownRef = useRef<HTMLDivElement>(null)
  const [pilgrimOpen, setPilgrimOpen]       = useState(false)
  const [checklistOpen, setChecklistOpen]   = useState(false)

  const sidebarWidthRef  = useRef(264)
  const referenceWidthRef = useRef(280)
  const aiWidthRef        = useRef(308)
  const biblePanelWidthRef = useRef(380)
  sidebarWidthRef.current    = sidebarWidth
  referenceWidthRef.current  = referenceWidth
  aiWidthRef.current         = aiWidth
  biblePanelWidthRef.current = biblePanelWidth

  useEffect(() => {
    const sw = localStorage.getItem('lampas_sidebar_w')
    const rw = localStorage.getItem('lampas_ref_w')
    const aw = localStorage.getItem('lampas_ai_w')
    const bw = localStorage.getItem('lampas_bible_pw')
    const sc = localStorage.getItem('lampas_sidebar_c')
    if (sw) setSidebarWidth(Number(sw))
    if (rw) setReferenceWidth(Number(rw))
    if (aw) setAiWidth(Number(aw))
    if (bw) setBiblePanelWidth(Number(bw))
    if (sc) setSidebarCollapsed(sc === '1')
  }, [])

  // Fecha dropdown "Enviar" ao clicar fora
  useEffect(() => {
    if (!enviarDropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (enviarDropdownRef.current && !enviarDropdownRef.current.contains(e.target as Node)) {
        setEnviarDropdownOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [enviarDropdownOpen])

  // Abre janela flutuante do Pilgrim via evento global
  useEffect(() => {
    function handler() { setPilgrimOpen(true) }
    window.addEventListener('lampas:open-pilgrim', handler)
    return () => window.removeEventListener('lampas:open-pilgrim', handler)
  }, [])

  // Navegação interna via evento (disparado pelo WorkspaceMenuBar → Ferramentas)
  const navigateRef = useRef(navigate)
  useEffect(() => { navigateRef.current = navigate })
  useEffect(() => {
    function handler(e: Event) {
      const slug = (e as CustomEvent<string>).detail
      if (slug) navigateRef.current(slug)
    }
    window.addEventListener('lampas:navigate', handler)
    return () => window.removeEventListener('lampas:navigate', handler)
  }, [])

  // Abre painel de checklist via evento global (disparado pelo AIAssistantPanel)
  useEffect(() => {
    function handler() { setChecklistOpen(true) }
    window.addEventListener('lampas:open-checklist', handler)
    return () => window.removeEventListener('lampas:open-checklist', handler)
  }, [])

  // Persiste contexto do workspace para o painel global da Base de Conhecimento
  useEffect(() => {
    try {
      localStorage.setItem('lampas_kb_context', JSON.stringify({
        book: project.book,
        passageRef: project.passage_ref,
        projectId: project.id,
      }))
    } catch {}
    return () => {
      try { localStorage.removeItem('lampas_kb_context') } catch {}
    }
  }, [project.book, project.passage_ref, project.id])

  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = sidebarWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(120, Math.min(360, startW + ev.clientX - startX))
      setSidebarWidth(w); sidebarWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_sidebar_w', String(sidebarWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startReferenceResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = referenceWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(180, Math.min(520, startW + ev.clientX - startX))
      setReferenceWidth(w); referenceWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_ref_w', String(referenceWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startAiResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = aiWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(240, Math.min(560, startW - (ev.clientX - startX)))
      setAiWidth(w); aiWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_ai_w', String(aiWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startBibleResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = biblePanelWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(260, Math.min(640, startW - (ev.clientX - startX)))
      setBiblePanelWidth(w); biblePanelWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_bible_pw', String(biblePanelWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const { def: activeDef, loading: activeDefLoading } = useSectionDef(activeSlug)
  const activeTool = getToolAreaBySlug(activeSlug)
  const activeSection = sections.find(s => s.slug === activeSlug)
  const activePhase = navPhases.find(p => p.id === getPhaseFor(activeSlug))

  const sectionProgressValue = useCallback((slug: string): number => {
    const section = sections.find(sec => sec.slug === slug)
    if (!section || section.status === 'empty') return 0
    if (section.status === 'reviewed') return 1
    return 0.5
  }, [sections])

  function progressGroupWeight(groupId: string): number {
    const weights: Record<string, number> = {
      preparar_espiritual: 1,
      preparar_assimilacao: 1,
      preparar_visao_geral: 1,
      investigar_visao_geral: 1,
      contextual: 2,
      textual: 3,
      teologico: 2,
      pregar_visao_geral: 1,
      sermao_dispositio: 2,
      sermao_elocutio: 1,
      sermao_memoria: 1,
      sermao_pronuntiatio: 1,
      estudo_dispositio: 2,
      estudo_elocutio: 1,
      estudo_memoria: 1,
      estudo_pronuntiatio: 1,
      devocional_dispositio: 2,
      devocional_elocutio: 1,
      devocional_memoria: 1,
      devocional_pronuntiatio: 1,
    }
    return weights[groupId] ?? 1
  }

  function progressGroupRatio(groupId: string): number {
    if (isToolSlug(groupId) || groupId === 'colagens' || groupId === 'comentario_expositivo') return 0
    const groupSections = getSectionsByGroupNav(groupId, project.study_mode)
    const synthesis = SYNTHESIS_DEFS[groupId]
    const slugs = [
      ...groupSections.map(section => section.slug),
      ...(synthesis ? [synthesis.slug] : []),
    ]
    if (slugs.length === 0) return 0
    return slugs.reduce((sum, slug) => sum + sectionProgressValue(slug), 0) / slugs.length
  }

  const phaseProgress = useMemo(() => navPhases
    .filter(phase => phase.id !== 'ferramentas')
    .map(phase => {
      const groups = phase.modes.flatMap(mode => mode.groups)
      const total = groups.reduce((sum, group) => sum + progressGroupWeight(group.id), 0)
      const done = groups.reduce((sum, group) => sum + progressGroupRatio(group.id) * progressGroupWeight(group.id), 0)
      return {
        id: phase.id,
        label: phase.label,
        color: phase.color,
        total,
        done,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      }
    }), [navPhases, sections, sectionProgressValue])

  const progressTotal = phaseProgress.reduce((sum, phase) => sum + phase.total, 0)
  const progressDone = phaseProgress.reduce((sum, phase) => sum + phase.done, 0)
  const pct = progressTotal > 0 ? Math.round((progressDone / progressTotal) * 100) : 0

  const orderedSlugs = useMemo(() => {
    const slugs: string[] = []
    for (const ph of navPhases) {
      for (const mo of ph.modes) {
        for (const gr of mo.groups) {
          const isUtilityGroup = isToolSlug(gr.id) || gr.id === 'colagens' || gr.id === 'comentario_expositivo'
          if (isUtilityGroup) {
            const tool = getToolAreaBySlug(gr.id)
            slugs.push(tool?.slug ?? gr.id)
            continue
          }
          const secs = getSectionsByGroupNav(gr.id, project.study_mode)
          if (secs.length === 0) continue
          const isSingleSection = secs.length === 1 && !SYNTHESIS_DEFS[gr.id]
          if (isSingleSection) {
            slugs.push(secs[0].slug)
          } else {
            for (const s of secs) slugs.push(s.slug)
            const syn = SYNTHESIS_DEFS[gr.id]
            if (syn) slugs.push(syn.slug)
          }
        }
      }
    }
    return slugs
  }, [navPhases, project.study_mode])

  const currentNavIdx = orderedSlugs.indexOf(activeSlug)
  const prevSlug = currentNavIdx > 0 ? orderedSlugs[currentNavIdx - 1] : null
  const nextSlug = currentNavIdx >= 0 && currentNavIdx < orderedSlugs.length - 1
    ? orderedSlugs[currentNavIdx + 1] : null

  // Phase-level navigation — derived dynamically from mode's phases, not hardcoded slugs
  const mainPhases       = navPhases.filter(p => p.id !== 'ferramentas')
  const phaseNavIdx      = activePhase ? mainPhases.findIndex(p => p.id === activePhase.id) : -1
  const prevPhaseNavSlug = phaseNavIdx > 0 ? getPhaseNavSlug(mainPhases[phaseNavIdx - 1], project.study_mode) : null
  const nextPhaseNavSlug = phaseNavIdx >= 0 && phaseNavIdx < mainPhases.length - 1
    ? getPhaseNavSlug(mainPhases[phaseNavIdx + 1], project.study_mode) : null

  const activeGroupId = getGroupFor(activeSlug)
  const activeGroupLabel = activeGroupId
    ? navPhases.flatMap(phase => phase.modes.flatMap(mode => mode.groups)).find(group => group.id === activeGroupId)?.label
      ?? getToolAreaBySlug(activeGroupId)?.shortTitle
      ?? activeDef?.shortTitle
    : activeDef?.shortTitle
  const activeGroupPct = activeGroupId ? Math.round(progressGroupRatio(activeGroupId) * 100) : 0
  const activePhaseProgress = activePhase
    ? phaseProgress.find(phase => phase.id === activePhase.id)
    : undefined

  const handleSectionUpdate = useCallback((updated: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next }
      return [...prev, updated]
    })
  }, [])


  const toggleSectionStatus = useCallback(async (slug: string) => {
    const sec       = sections.find(s => s.slug === slug)
    const isReviewed = sec?.status === 'reviewed'
    const nextStatus = (isReviewed ? 'empty' : 'reviewed') as import('@/types/database').SectionStatus

    if (sec) {
      // Optimistic update
      setSections(prev => prev.map(s => s.slug === slug ? { ...s, status: nextStatus } : s))
      await supabase.from('sections').update({ status: nextStatus }).eq('id', sec.id)
    } else {
      // Section never opened — create it
      const nav = getSectionNavBySlug(slug)
      if (!nav) return
      const tempId = `temp_${slug}`
      const newSec = {
        id: tempId, project_id: project.id, user_id: user.id,
        slug, module: nav.module, title: nav.title,
        content: null, ai_output: null, status: nextStatus,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      } as import('@/types/database').Section
      setSections(prev => [...prev, newSec])
      const { data } = await supabase.from('sections').upsert(
        { project_id: project.id, user_id: user.id, slug, module: nav.module, title: nav.title, content: {}, status: nextStatus },
        { onConflict: 'project_id,slug' }
      ).select().single()
      if (data) setSections(prev => prev.map(s => s.id === tempId ? data as import('@/types/database').Section : s))
    }
  }, [sections, project, user, supabase])

  const handleAskAI = useCallback((prompt: string) => {
    setAiPrompt(prompt)
    setAiOpen(true)
  }, [])

  const handleClearContext = useCallback(() => setAiPrompt(''), [])

  function togglePhase(id: string) {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCanon(id: string) {
    setExpandedCanons(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSectionCards(slug: string) {
    setExpandedSectionCards(prev => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug); else next.add(slug)
      return next
    })
  }

  function navigate(slug: string) {
    setExpandedPhases(prev => new Set([...prev, getPhaseFor(slug)]))
    const c = getCanonFor(slug, navPhases)
    if (c) setExpandedCanons(prev => new Set([...prev, c]))
    const g = getGroupFor(slug)
    if (g) setExpandedGroups(prev => new Set([...prev, g]))
    setExpandedSectionCards(prev => new Set([...prev, slug]))
    setActiveSlug(slug)
    try { localStorage.setItem(`lampas_section_${project.id}`, slug) } catch {}
    const p = new URLSearchParams(searchParams.toString())
    p.set('section', slug)
    router.replace(`?${p.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const section = searchParams.get('section')
    if (section && section !== activeSlug) navigate(section)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])


  function groupProgress(groupId: string): { done: number; total: number; pct: number } {
    if (groupId === 'colagens' || groupId === 'comentario_expositivo' || isToolSlug(groupId)) {
      const t = toolProgress(groupId)
      return { ...t, pct: t.total > 0 ? Math.round(t.done / t.total * 100) : 0 }
    }
    const gs = getSectionsByGroupNav(groupId, project.study_mode)
    const done = gs.filter(sd => {
      const s = sections.find(sec => sec.slug === sd.slug)
      return s?.status === 'draft' || s?.status === 'reviewed'
    }).length
    const totalValue = gs.reduce((sum, sd) => sum + sectionProgressValue(sd.slug), 0)
    return {
      total: gs.length,
      done,
      pct: gs.length > 0 ? Math.round(totalValue / gs.length * 100) : 0,
    }
  }

  const isPublishedReader = searchParams.get('reader') === 'published' && activeSlug === 'sermao_dispositio'

  if (isPublishedReader) {
    return (
      <SermonBuilderWorkspace
        key="published-reader"
        project={project}
        userId={user.id}
        existingSection={activeSection}
        onUpdate={handleSectionUpdate}
        onAskAI={handleAskAI}
        initialViewMode="preview"
        publishedReader
      />
    )
  }

  return (
    <WorkspaceProvider
      user={user}
      project={project}
      activeSlug={activeSlug}
      activeSection={activeSection}
    >
      <div style={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column', background: 'var(--background)', paddingBottom: focusMode ? 0 : '60px', boxSizing: 'border-box' }}>

      {/* ── Menu bar ──────────────────────────────────────────────────────── */}
      <WorkspaceMenuBar
        bibleOpen={bibleOpen}
        focusMode={focusMode}
        sideBySide={sideBySide}
        aiOpen={aiOpen}
        checklistOpen={checklistOpen}
        onToggleBible={() => setBibleOpen(o => !o)}
        onToggleFocus={() => setFocusMode(o => !o)}
        onToggleSideBySide={() => setSideBySide(o => !o)}
        onToggleAI={() => setAiOpen(o => !o)}
        onToggleChecklist={() => setChecklistOpen(o => !o)}
        onEnviarSermao={() => { setEnviarTargetMode('sermao'); setEnviarParaSermaOpen(true) }}
        onEnviarDevocional={() => { setEnviarTargetMode('devocional'); setEnviarParaSermaOpen(true) }}
        onEnviarKB={() => window.dispatchEvent(new CustomEvent('lampas:kb-open-create'))}
      />

      {/* ── Barra contextual do projeto ───────────────────────────────────── */}
      <div style={{
        height: '36px', flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-2)',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem', gap: '0.65rem',
        fontSize: '0.75rem',
      }}>
        {/* Nome + referência */}
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {titleValue}
        </span>
        <WorkspaceContextBadge />
        <span style={{
          fontSize: '0.62rem', color: 'var(--text-muted)',
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: '3px', padding: '0.02rem 0.28rem',
        }}>
          {project.original_language}
        </span>

        <span style={{ color: 'var(--border)', fontSize: '0.8rem', userSelect: 'none' }}>·</span>

        {/* Tipo do projeto / modo */}
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.04em',
          color: modeConfig.color,
          background: `${modeConfig.color}14`,
          border: `1px solid ${modeConfig.color}30`,
          borderRadius: '4px', padding: '0.02rem 0.32rem',
          whiteSpace: 'nowrap',
        }}>
          {modeConfig.name}
        </span>

        <span style={{ color: 'var(--border)', fontSize: '0.8rem', userSelect: 'none' }}>·</span>

        {/* Tradução */}
        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {project.bible_version}
        </span>

        <span style={{ color: 'var(--border)', fontSize: '0.8rem', userSelect: 'none' }}>·</span>

        {/* Progresso */}
        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{pct}% concluído</span>
        <div style={{ width: '52px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: modeConfig.color, transition: 'width 0.5s ease' }} />
        </div>

        {/* Fase ativa */}
        {activePhase && (
          <>
            <span style={{ color: 'var(--border)', fontSize: '0.8rem', userSelect: 'none' }}>·</span>
            <span style={{ color: activePhase.color, fontWeight: 600, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              {activePhase.label}
            </span>
          </>
        )}
      </div>

      {/* ── Guided strip (demo projects only) ─────────────────────────── */}
      {project.is_demo && <GuidedStrip activeSlug={activeSlug} onNavigate={navigate} modeColor={modeConfig.color} />}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', paddingLeft: '38px', paddingRight: '38px' }}>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <nav style={{ width: 0, overflow: 'hidden', flexShrink: 0 }}>
          {sidebarCollapsed ? (
            /* ── Sidebar collapsed ────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', paddingTop: '0.45rem' }}>
              <button
                onClick={() => { setSidebarCollapsed(false); localStorage.setItem('lampas_sidebar_c', '0') }}
                title="Expandir menu"
                style={{ width: '32px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.95rem', borderRadius: '3px', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >›</button>
              {navPhases.map(ph => (
                <button key={ph.id} title={ph.label}
                  onClick={() => { setSidebarCollapsed(false); localStorage.setItem('lampas_sidebar_c', '0'); setExpandedPhases(prev => new Set([...prev, ph.id])) }}
                  style={{ width: '32px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: ph.color, fontSize: '0.64rem', fontWeight: 900, borderRadius: '3px', fontFamily: 'inherit' }}
                >{ph.roman}</button>
              ))}
            </div>
          ) : (
            /* ── Sidebar expanded ────────────────────────────────── */
            <>
              <div style={{
                padding: '1.1rem 0.55rem 1.4rem 0.65rem',
                borderBottom: '1px solid var(--border-subtle)',
                flexShrink: 0,
              }}>
                {/* Estudo atual + colapsar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: 0 }}>
                  <button
                    onClick={() => router.push('/dashboard')}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', fontSize: '0.78rem',
                      padding: '0.1rem 0.3rem 0.1rem 0', borderRadius: '4px',
                      fontFamily: 'inherit', flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Voltar ao painel"
                  >←</button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingTitle ? (
                      <input
                        ref={titleInputRef}
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        onBlur={commitTitle}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); void commitTitle() }
                          if (e.key === 'Escape') cancelTitle()
                        }}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--accent)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '0.78rem', fontWeight: 600,
                          outline: 'none',
                          padding: '0.1rem 0.35rem',
                        }}
                      />
                    ) : (
                      <button
                        onClick={startTitleEdit}
                        title="Editar título do estudo"
                        style={{
                          width: '100%', background: 'transparent', border: 'none', cursor: 'text',
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.1rem 0.3rem', borderRadius: '4px',
                          marginLeft: '-0.3rem', fontFamily: 'inherit', textAlign: 'left',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                          const icon = e.currentTarget.querySelector('.sb-edit-icon') as HTMLElement
                          if (icon) icon.style.opacity = '1'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          const icon = e.currentTarget.querySelector('.sb-edit-icon') as HTMLElement
                          if (icon) icon.style.opacity = '0'
                        }}
                      >
                        <span style={{
                          fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {titleValue}
                        </span>
                        <span className="sb-edit-icon" style={{
                          fontSize: '0.65rem', color: 'var(--text-muted)',
                          opacity: 0, transition: 'opacity 0.12s', flexShrink: 0,
                        }}>✎</span>
                      </button>
                    )}
                  </div>

                  <span style={{
                    fontSize: '0.62rem', color: 'var(--text-muted)', flexShrink: 0,
                    background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                    borderRadius: '3px', padding: '0.03rem 0.3rem',
                  }}>
                    {project.original_language}
                  </span>

                  <button
                    onClick={() => { setSidebarCollapsed(true); localStorage.setItem('lampas_sidebar_c', '1') }}
                    title="Recolher menu"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: '0.15rem',
                      borderRadius: '4px', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 'auto',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.68rem 0.72rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  background: 'rgba(15,23,42,0.018)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'baseline', marginBottom: '0.42rem' }}>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Progresso Geral
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--border-subtle)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: modeConfig.color,
                      borderRadius: '99px',
                      transition: 'width 0.35s ease',
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeGroupLabel ? `Seção atual: ${activeGroupLabel}` : 'Seção atual'}
                    </span>
                    <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 750 }}>{activeGroupPct}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--border-subtle)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                    <div style={{
                      width: `${activeGroupPct}%`,
                      height: '100%',
                      background: activePhase?.color ?? modeConfig.color,
                      borderRadius: '99px',
                      transition: 'width 0.35s ease',
                    }} />
                  </div>

                  {activePhaseProgress && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Fase atual: {activePhaseProgress.label}
                        </span>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 750 }}>{activePhaseProgress.pct}%</span>
                      </div>
                      <div style={{ height: '3px', background: 'var(--border-subtle)', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                        <div style={{
                          width: `${activePhaseProgress.pct}%`,
                          height: '100%',
                          background: activePhaseProgress.color,
                          borderRadius: '99px',
                          transition: 'width 0.35s ease',
                        }} />
                      </div>
                    </>
                  )}

                  <div style={{ display: 'grid', gap: '0.34rem' }}>
                    {phaseProgress.map(phase => (
                      <div key={phase.id} style={{ display: 'grid', gridTemplateColumns: '68px 1fr 30px', alignItems: 'center', gap: '0.38rem' }}>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {phase.label}
                        </span>
                        <span style={{ height: '3px', background: 'var(--border-subtle)', borderRadius: '99px', overflow: 'hidden' }}>
                          <span style={{
                            display: 'block',
                            width: `${phase.pct}%`,
                            height: '100%',
                            background: phase.color,
                            borderRadius: '99px',
                          }} />
                        </span>
                        <span style={{ fontSize: '0.56rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 750 }}>
                          {phase.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {navPhases.map((phase, phaseIdx) => {
                const phaseOpen  = expandedPhases.has(phase.id)
                const singleMode = phase.modes.length === 1

                return (
                  <div key={phase.id}>

                    {/* ── Connector line between phases ──────────── */}
                    {phaseIdx > 0 && (
                      <div style={{
                        width: '2px', height: '6px',
                        background: 'var(--border)',
                        marginLeft: '17px',
                        borderRadius: '1px',
                      }} />
                    )}

                    {/* ── Phase header ──────────────────────────── */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      style={{
                        width: '100%', border: 'none', cursor: 'pointer',
                        background: 'transparent', textAlign: 'left', fontFamily: 'inherit',
                        padding: '6px 10px 6px 8px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'background 0.15s',
                        borderRadius: '7px',
                      }}
                      onMouseEnter={e => { if (!phaseOpen) e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
                      onMouseLeave={e => { if (!phaseOpen) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Numbered circle — journey node */}
                      <div style={{
                        width: '17px', height: '17px', borderRadius: '50%',
                        background: phaseOpen ? phase.color : `${phase.color}18`,
                        border: `1px solid ${phaseOpen ? phase.color : phase.color + '55'}`,
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: phaseOpen ? `0 0 0 2px ${phase.color}12` : 'none',
                        transition: 'all 0.2s',
                      }}>
                        <span style={{
                          fontSize: '0.54rem', fontWeight: 800, lineHeight: 1,
                          color: phaseOpen ? '#FFFFFF' : phase.color,
                          userSelect: 'none',
                        }}>
                          {phaseIdx + 1}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Main title — large and prominent */}
                        <div style={{
                          fontSize: '0.78rem', fontWeight: 750,
                          letterSpacing: '0.04em', lineHeight: 1.1,
                          color: phaseOpen ? phase.color : 'var(--text-primary)',
                          transition: 'color 0.15s',
                        }}>
                          {phase.label.toUpperCase()}
                        </div>
                        {/* Description */}
                        <div style={{
                          fontSize: '0.58rem', color: 'var(--text-muted)',
                          marginTop: '1px', lineHeight: 1.2, fontWeight: 400,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {phase.description}
                        </div>
                      </div>

                      {/* Chevron */}
                      {phaseOpen
                        ? <ChevronUp size={12} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.5 }} />
                        : <ChevronDown size={12} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.4 }} />
                      }
                    </button>

                    {/* ── Phase body — left border = journey line ── */}
                    {phaseOpen && (
                      <div style={{
                        marginLeft: '17px',
                        borderLeft: `1px solid ${phase.color}24`,
                        paddingBottom: '3px',
                      }}>
                        {phase.modes.map((mode, modeIdx) => {
                          const modeOpen = singleMode || expandedCanons.has(mode.id)

                          return (
                            <div key={mode.id}>

                              {/* Mode header — only for multi-mode phases (Produzir) */}
                              {!singleMode && (() => {
                                const ModeIconEl = MODE_ICONS_LUCIDE[mode.id]
                                return (
                                  <button
                                    onClick={() => toggleCanon(mode.id)}
                                    style={{
                                      width: 'calc(100% - 12px)', marginLeft: '6px', marginRight: '6px',
                                      border: modeOpen ? `1px solid ${mode.color}25` : '1px solid transparent',
                                      cursor: 'pointer',
                                      background: modeOpen ? mode.bgActive : 'transparent',
                                      borderRadius: '7px',
                                      textAlign: 'left', fontFamily: 'inherit',
                                      padding: '0.34rem 0.52rem',
                                      marginTop: modeIdx > 0 ? '0.14rem' : '0',
                                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                                      transition: 'background 0.12s, border-color 0.12s',
                                    }}
                                    onMouseEnter={e => { if (!modeOpen) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                    onMouseLeave={e => { if (!modeOpen) e.currentTarget.style.background = 'transparent' }}
                                  >
                                    {ModeIconEl && (
                                      <ModeIconEl size={12} strokeWidth={1.8} style={{ flexShrink: 0, color: mode.color, opacity: modeOpen ? 1 : 0.65 }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.72rem', fontWeight: 650, color: modeOpen ? mode.color : 'var(--text-secondary)', lineHeight: 1.15 }}>
                                        {mode.label}
                                      </div>
                                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', lineHeight: 1.15, marginTop: '0.02rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {mode.subtitle}
                                      </div>
                                    </div>
                                    {modeOpen
                                      ? <ChevronDown size={10} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.6 }} />
                                      : <ChevronRight size={10} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.4 }} />
                                    }
                                  </button>
                                )
                              })()}

                              {/* Groups */}
                              {modeOpen && (
                                <div style={{ paddingBottom: '0.05rem' }}>
                                  {mode.groups.map((group, groupIdx) => {
                                    const groupOpen      = expandedGroups.has(group.id)
                                    const isUtilityGroup = isToolSlug(group.id) || group.id === 'colagens' || group.id === 'comentario_expositivo'
                                    const secs           = isUtilityGroup ? [] : getSectionsByGroupNav(group.id, project.study_mode)
                                    if (secs.length === 0 && !isUtilityGroup) return null
                                    const isSingleSection = !isUtilityGroup && secs.length === 1 && !SYNTHESIS_DEFS[group.id]
                                    const isDirect        = isUtilityGroup || isSingleSection
                                    const tool            = getToolAreaBySlug(group.id)
                                    const directSlug      = isSingleSection ? secs[0].slug : (tool?.slug ?? group.id)
                                    const directLabel     = isSingleSection ? secs[0].shortTitle : group.label
                                    const { done, total, pct: gpPct } = groupProgress(group.id)
                                    const syn        = !isDirect ? SYNTHESIS_DEFS[group.id] : undefined
                                    const isActive   = isDirect && activeSlug === directSlug
                                    const isExpanded = !isDirect && groupOpen
                                    const highlight  = isActive || isExpanded
                                    const groupTitle = isDirect ? directLabel : group.label
                                    const groupSub   = GROUP_SUBTITLES[group.id]
                                      ?? (isToolSlug(group.id) ? getToolAreaBySlug(group.id)?.subtitle : undefined)
                                      ?? ''
                                    const accentColor = GROUP_ACCENT_COLORS[group.id]
                                    const isEnhanced  = Boolean(accentColor)
                                    const groupColor  = isEnhanced ? accentColor : mode.color
                                    const pct         = isEnhanced ? gpPct : 0

                                    return (
                                      <div key={group.id} style={{ marginBottom: isEnhanced ? '4px' : (groupOpen ? '0.22rem' : 0), marginTop: isEnhanced && groupIdx > 0 ? '16px' : 0 }}>

                                        {/* ── Group header ── */}
                                        {(() => {
                                          const GroupIcon = GROUP_ICONS[group.id]
                                          return (
                                            <>
                                            <button
                                              onClick={() => isDirect ? navigate(directSlug) : toggleGroup(group.id)}
                                              style={{
                                                width: 'calc(100% - 12px)',
                                                marginLeft: '6px', marginRight: '6px',
                                                border: isEnhanced
                                                  ? (highlight ? `1px solid ${groupColor}55` : `1px solid ${groupColor}22`)
                                                  : (isActive ? `1px solid ${mode.color}28` : '1px solid transparent'),
                                                borderLeft: isEnhanced
                                                  ? `3px solid ${highlight ? groupColor : groupColor + '55'}`
                                                  : undefined,
                                                cursor: 'pointer',
                                                background: isEnhanced
                                                  ? (highlight ? `${groupColor}14` : `${groupColor}08`)
                                                  : (isActive ? mode.bgActive : 'transparent'),
                                                borderRadius: isEnhanced ? '8px' : '7px',
                                                textAlign: 'left', fontFamily: 'inherit',
                                                padding: isEnhanced ? '0.55rem 0.6rem 0.48rem 0.5rem' : '0.34rem 0.52rem',
                                                display: 'flex', alignItems: 'center', gap: '0.42rem',
                                                transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                                                boxShadow: isEnhanced
                                                  ? (highlight ? `0 2px 8px ${groupColor}28` : 'none')
                                                  : (isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'),
                                              }}
                                              onMouseEnter={e => {
                                                if (!highlight) {
                                                  e.currentTarget.style.background = isEnhanced ? `${groupColor}11` : 'rgba(0,0,0,0.04)'
                                                  if (!isEnhanced) e.currentTarget.style.borderColor = 'var(--border)'
                                                }
                                              }}
                                              onMouseLeave={e => {
                                                if (!highlight) {
                                                  e.currentTarget.style.background = isEnhanced ? `${groupColor}08` : 'transparent'
                                                  if (!isEnhanced) e.currentTarget.style.borderColor = 'transparent'
                                                }
                                              }}
                                            >
                                              {/* Lucide icon */}
                                              {GroupIcon && (
                                                <GroupIcon
                                                  size={isEnhanced ? 14 : 15} strokeWidth={isEnhanced ? 2 : 1.75}
                                                  style={{
                                                    flexShrink: 0,
                                                    color: highlight ? groupColor : (isEnhanced ? `${groupColor}99` : 'var(--text-muted)'),
                                                    transition: 'color 0.15s',
                                                  }}
                                                />
                                              )}

                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                  fontSize: isEnhanced ? '0.67rem' : '0.73rem',
                                                  fontWeight: isEnhanced ? 800 : 650,
                                                  lineHeight: 1.15,
                                                  color: highlight ? groupColor : (isEnhanced ? 'var(--text-secondary)' : 'var(--text-primary)'),
                                                  transition: 'color 0.15s',
                                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  letterSpacing: isEnhanced ? '0.08em' : '-0.01em',
                                                  textTransform: isEnhanced ? 'uppercase' : 'none',
                                                }}>
                                                  {groupTitle}
                                                </div>
                                                {groupSub && (
                                                  <div style={{
                                                    fontSize: isEnhanced ? '0.64rem' : '0.58rem',
                                                    color: isEnhanced
                                                      ? (highlight ? `${groupColor}BB` : 'var(--text-muted)')
                                                      : 'var(--text-muted)',
                                                    marginTop: isEnhanced ? '0.18rem' : '0.04rem',
                                                    lineHeight: 1.2,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    transition: 'color 0.15s',
                                                  }}>
                                                    {groupSub}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Right indicators */}
                                              {isEnhanced && GROUP_EMOJI[group.id] && (
                                                <span style={{
                                                  fontSize: '0.9rem', flexShrink: 0,
                                                  opacity: highlight ? 0.28 : 0.13,
                                                  transition: 'opacity 0.15s',
                                                  lineHeight: 1,
                                                }}>
                                                  {GROUP_EMOJI[group.id]}
                                                </span>
                                              )}
                                              {total > 0 && !isUtilityGroup && (
                                                <ProgressRing pct={gpPct} color={groupColor} />
                                              )}
                                              {isActive && !isEnhanced && isUtilityGroup && (
                                                <span style={{
                                                  width: '6px', height: '6px', borderRadius: '50%',
                                                  background: mode.color, flexShrink: 0,
                                                }} />
                                              )}
                                              {!isDirect && (
                                                groupOpen
                                                  ? <ChevronDown size={10} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.55 }} />
                                                  : <ChevronRight size={10} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.4 }} />
                                              )}
                                            </button>
                                            {/* Barra de progresso para grupos com identidade visual */}
                                            {isEnhanced && total > 0 && (
                                              <div style={{
                                                height: '2px',
                                                marginLeft: '6px', marginRight: '6px',
                                                marginTop: '-1px',
                                                marginBottom: groupOpen ? '3px' : '3px',
                                                borderRadius: '0 0 5px 5px',
                                                background: `${groupColor}16`,
                                                overflow: 'hidden',
                                              }}>
                                                <div style={{
                                                  height: '100%',
                                                  width: `${pct}%`,
                                                  background: done === total && total > 0 ? '#059669' : groupColor,
                                                  transition: 'width 0.5s ease',
                                                  borderRadius: '0 0 5px 5px',
                                                }} />
                                              </div>
                                            )}
                                            </>
                                          )
                                        })()}

                                        {/* ── Section list (with vertical line) ── */}
                                        {!isDirect && groupOpen && (
                                          <div style={{
                                            marginLeft: '1.2rem',
                                            borderLeft: `1px solid ${isEnhanced ? `${groupColor}30` : 'var(--border-subtle)'}`,
                                            marginBottom: '0.08rem',
                                          }}>
                                            {secs.map((sd, secIdx) => {
                                              const sec              = sections.find(s => s.slug === sd.slug)
                                              const isActive         = sd.slug === activeSlug
                                              const hasCards         = !!sd.cards && sd.cards.length > 0
                                              const sectionCardsOpen = expandedSectionCards.has(sd.slug)
                                              const storedCards      = (sec?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                                              const cTotal           = sd.cards?.length ?? 0
                                              const cDone            = sd.cards ? sd.cards.filter(c => !!storedCards[c.id]?.trim()).length : 0
                                              return (
                                                <div key={sd.slug}>
                                                  {/* Section row */}
                                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {/* Checkbox */}
                                                    {(() => {
                                                      const secStatus  = sec?.status ?? 'empty'
                                                      const isReviewed = secStatus === 'reviewed'
                                                      const isDraft    = secStatus === 'draft'
                                                      return (
                                                        <button
                                                          onClick={e => { e.stopPropagation(); void toggleSectionStatus(sd.slug) }}
                                                          title={isReviewed ? 'Marcar como não concluído' : 'Marcar como concluído'}
                                                          style={{
                                                            flexShrink: 0, background: 'transparent', border: 'none',
                                                            cursor: 'pointer', padding: '0.18rem 0.1rem 0.18rem 0.42rem',
                                                            display: 'flex', alignItems: 'center',
                                                            color: isReviewed ? '#059669' : isDraft ? groupColor : '#94A3B8',
                                                            fontSize: '0.72rem', lineHeight: 1, transition: 'color 0.12s',
                                                          }}
                                                          onMouseEnter={e => { e.currentTarget.style.color = isReviewed ? '#047857' : groupColor }}
                                                          onMouseLeave={e => { e.currentTarget.style.color = isReviewed ? '#059669' : isDraft ? groupColor : '#94A3B8' }}
                                                        >
                                                          {isReviewed ? '☑' : isDraft ? '◩' : '☐'}
                                                        </button>
                                                      )
                                                    })()}
                                                    <button
                                                      onClick={() => navigate(sd.slug)}
                                                      style={{
                                                        flex: 1, border: 'none', fontFamily: 'inherit',
                                                        background: isActive ? `${groupColor}10` : 'transparent',
                                                        padding: '0.18rem 0.2rem 0.18rem 0.25rem',
                                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                        cursor: 'pointer', textAlign: 'left',
                                                        borderRadius: '5px',
                                                        transition: 'background 0.1s',
                                                        minWidth: 0,
                                                      }}
                                                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                      <span style={{
                                                        flex: 1, fontSize: '0.69rem', lineHeight: 1.22,
                                                        color: isActive ? groupColor : 'var(--text-secondary)',
                                                        fontWeight: isActive ? 600 : 400,
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                      }}>
                                                        {sd.shortTitle}
                                                      </span>
                                                    </button>
                                                    {hasCards && (
                                                      <button
                                                        onClick={() => toggleSectionCards(sd.slug)}
                                                        title={sectionCardsOpen ? 'Recolher campos' : 'Ver campos'}
                                                        style={{
                                                          background: 'transparent', border: 'none',
                                                          cursor: 'pointer', padding: '0.18rem 0.28rem',
                                                          color: sectionCardsOpen ? mode.color : 'var(--text-muted)',
                                                          opacity: sectionCardsOpen ? 0.9 : 0.45,
                                                          display: 'flex', alignItems: 'center', flexShrink: 0,
                                                          transition: 'opacity 0.12s, color 0.12s',
                                                        }}
                                                        onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                                                        onMouseLeave={e => { e.currentTarget.style.opacity = sectionCardsOpen ? '0.9' : '0.45' }}
                                                      >
                                                        {sectionCardsOpen
                                                          ? <ChevronDown size={9} strokeWidth={2.2} />
                                                          : <ChevronRight size={9} strokeWidth={2.2} />
                                                        }
                                                      </button>
                                                    )}
                                                  </div>

                                                  {/* Cards list */}
                                                  {hasCards && sectionCardsOpen && (
                                                    <div style={{
                                                      marginLeft: '1.55rem',
                                                      borderLeft: '1px solid var(--border-subtle)',
                                                      paddingLeft: '0.45rem',
                                                      paddingBottom: '0.1rem',
                                                    }}>
                                                      {sd.cards!.map(card => {
                                                        const text    = storedCards[card.id] ?? ''
                                                        const cStatus = cardTextStatus(text)
                                                        return (
                                                          <button
                                                            key={card.id}
                                                            onClick={() => navigate(sd.slug)}
                                                            style={{
                                                              width: '100%', border: 'none', background: 'transparent',
                                                              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                                              display: 'flex', alignItems: 'center', gap: '0.32rem',
                                                              padding: '0.1rem 0.2rem', borderRadius: '3px',
                                                              transition: 'background 0.1s',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                                          >
                                                            <span style={{
                                                              fontSize: '0.58rem', flexShrink: 0, fontWeight: 700,
                                                              lineHeight: 1,
                                                              color: cStatus === 'reviewed' ? '#059669' : cStatus === 'draft' ? groupColor : 'var(--border)',
                                                              transition: 'color 0.15s',
                                                            }}>
                                                              {cStatus === 'reviewed' ? '☑' : cStatus === 'draft' ? '◩' : '☐'}
                                                            </span>
                                                            <span style={{
                                                              fontSize: '0.63rem', color: 'var(--text-muted)', flex: 1,
                                                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                              lineHeight: 1.22,
                                                            }}>
                                                              {card.title}
                                                            </span>
                                                          </button>
                                                        )
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            })}

                                            {/* Synthesis */}
                                            {syn && (() => {
                                              const isSynActive = activeSlug === syn.slug
                                              return (
                                                <button
                                                  onClick={() => navigate(syn.slug)}
                                                  style={{
                                                    width: '100%', border: 'none', fontFamily: 'inherit',
                                                    background: isSynActive ? mode.bgActive : 'transparent',
                                                    borderLeft: `2px solid ${isSynActive ? mode.color : 'transparent'}`,
                                                    padding: '0.18rem 0.35rem 0.18rem 0.42rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.28rem',
                                                    cursor: 'pointer', textAlign: 'left',
                                                    marginLeft: '-1px', marginTop: '0.08rem',
                                                    borderTop: '1px solid var(--border-subtle)',
                                                    transition: 'background 0.1s',
                                                  }}
                                                  onMouseEnter={e => { if (!isSynActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                                  onMouseLeave={e => { if (!isSynActive) e.currentTarget.style.background = 'transparent' }}
                                                >
                                                  <span style={{ fontSize: '0.56rem', color: isSynActive ? mode.color : 'var(--text-muted)', flexShrink: 0, lineHeight: 1 }}>→</span>
                                                  <span style={{
                                                    flex: 1, fontSize: '0.62rem', lineHeight: 1.2,
                                                    color: isSynActive ? mode.color : 'var(--text-muted)',
                                                    fontStyle: 'italic',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  }}>
                                                    {syn.shortTitle}
                                                  </span>
                                                </button>
                                              )
                                            })()}
                                          </div>
                                        )}

                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                            </div>
                          )
                        })}
                      </div>
                    )}

                  </div>
                )
              })}

            </>
          )}
        </nav>
        {/* ── Content + AI panel ───────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', overflow: 'hidden' }}>
          {sideBySide && !focusMode && (
            <>
              {referenceCollapsed ? (
                <div
                  onClick={() => setReferenceCollapsed(false)}
                  title="Referência Viva — expandir"
                  style={{
                    width: '28px', flexShrink: 0, cursor: 'pointer',
                    borderRight: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.09em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>Referência</span>
                </div>
              ) : (
                <>
                  <div style={{ width: `${referenceWidth}px`, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.3rem 0.4rem', flexShrink: 0, borderBottom: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => setReferenceCollapsed(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >Recolher ‹</button>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <LiveReferencePanel
                        savedSections={sections}
                        onAskAI={handleAskAI}
                      />
                    </div>
                  </div>
                  <ResizeHandle onMouseDown={startReferenceResize} />
                </>
              )}
            </>
          )}

          {/* Reading area */}
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--background)' }}>

            {/* ← Voltar + Mode toggle — fixo no topo de toda tela interna */}
            <div style={{
              position: 'sticky', top: 0, zIndex: 9,
              display: 'flex', alignItems: 'center',
              padding: '0.18rem 0.85rem',
              background: 'var(--background)',
              borderBottom: '1px solid var(--border-subtle)',
              minHeight: '30px',
              flexShrink: 0,
            }}>
              <button
                onClick={() => prevPhaseNavSlug ? navigate(prevPhaseNavSlug) : router.push('/dashboard')}
                title={prevPhaseNavSlug ? (mainPhases[phaseNavIdx - 1]?.label ?? 'Anterior') : 'Painel'}
                style={{
                  background: 'transparent', border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.72rem', fontWeight: 600,
                  padding: '0.12rem 0.45rem', borderRadius: '5px',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '0.22rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <ChevronLeft size={12} strokeWidth={2.2} />
                Voltar
              </button>

              {/* Work mode toggle — only for preparar / investigar */}
              {(activePhase?.id === 'preparar' || activePhase?.id === 'investigar') && activePhase && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {(['guided', 'free'] as const).map(mode => {
                    const isActive = (workModeMap[activePhase.id] ?? 'guided') === mode
                    return (
                      <button
                        key={mode}
                        onClick={() => setWorkMode(activePhase.id, mode)}
                        style={{
                          height: '22px', padding: '0 10px',
                          border: `1px solid ${isActive ? activePhase.color : 'var(--border-subtle)'}`,
                          borderRadius: '5px',
                          background: isActive ? `${activePhase.color}12` : 'transparent',
                          color: isActive ? activePhase.color : 'var(--text-muted)',
                          fontSize: '0.65rem', fontWeight: isActive ? 700 : 400,
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                          letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)' }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                      >
                        {mode === 'guided' ? 'Guiado' : 'Livre'}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Free mode — renders all phase sections as a continuous document ── */}
            {activePhase && (activePhase.id === 'preparar' || activePhase.id === 'investigar') &&
              (workModeMap[activePhase.id] ?? 'guided') === 'free' ? (
              <FreeModeEditor
                key={`free-${activePhase.id}`}
                phase={activePhase}
                project={project}
                userId={user.id}
                studyMode={project.study_mode ?? project.project_type ?? ''}
                savedSections={sections}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'colagens' ? (
              <RecortesWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'ferramentas_dicionario' ? (
              <DicionarioWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'ferramentas_livros' ? (
              <BibliotecaWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'ferramentas_introducao_at' ? (
              <IntroducaoWorkspace
                key={activeSlug}
                testament="AT"
                project={project}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'ferramentas_introducao_nt' ? (
              <IntroducaoWorkspace
                key={activeSlug}
                testament="NT"
                project={project}
                onAskAI={handleAskAI}
              />
            ) : isToolSlug(activeSlug) ? (
              <ToolsWorkspace
                key={activeSlug}
                project={project}
                activeSlug={activeSlug}
                onNavigate={navigate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'texto_original' ? (
              <OriginalTextWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'termos_chave' ? (
              <TermosChaveWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'estrutura_literaria' ? (
              <EstruturaLiterariaWorkspace
                key={activeSlug}
                sectionDef={activeDef!}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                savedSections={sections}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'sermao_dispositio' ? (
              <SermonBuilderWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
                initialViewMode={searchParams.get('view') === 'preview' ? 'preview' : 'edit'}
                publishedReader={searchParams.get('reader') === 'published'}
              />
            ) : activeSlug === 'comentario_exegetico' ? (
              <ComentarioExegeticoWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'comentario_expositivo' ? (
              <CommentaryWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : activeSlug === 'pregar_visao_geral' ? (
              <ProductionsLibrary
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : VG_SLUGS.includes(activeSlug) && activeDef ? (
              <VisaoGeralWorkspace
                key={activeSlug}
                sectionDef={activeDef}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                allVGSections={sections.filter(s => VG_SLUGS.includes(s.slug))}
                allSections={sections}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
                onOpenBible={() => setBibleOpen(true)}
                onNavigate={navigate}
              />
            ) : activeDef ? (
              <SectionWorkspace
                key={activeSlug}
                sectionDef={activeDef}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={handleAskAI}
              />
            ) : isSynthesisSlug(activeSlug) ? (
              <SynthesisView
                key={activeSlug}
                synthesisDef={getSynthesisBySlug(activeSlug)!}
                project={project}
                savedSections={sections}
                onNavigate={navigate}
                onAskAI={handleAskAI}
              />
            ) : activeDefLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Carregando...</div>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', gap: '0.75rem',
                padding: '3rem', textAlign: 'center',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${modeConfig.color}12`,
                  border: `1px solid ${modeConfig.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', color: modeConfig.color,
                }}>
                  ◎
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Seção em desenvolvimento
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    O conteúdo desta seção para o modo <strong style={{ color: modeConfig.color }}>{modeConfig.name}</strong>
                    <br />será implementado em breve.
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* Bible side panel — flex sibling, acoplado ao workspace */}
          {bibleOpen && <ResizeHandle onMouseDown={startBibleResize} />}
          {bibleOpen && (
            <aside style={{
              flexShrink: 0,
              width: `${biblePanelWidth}px`,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              background: 'var(--surface)',
            }}>
              <BibleFloatingWindow
                book={project.book}
                passageRef={project.passage_ref}
                testament={project.testament}
                projectId={project.id}
                userId={user.id}
                onClose={() => setBibleOpen(false)}
                sidebarMode={true}
                studyMode={project.study_mode}
              />
            </aside>
          )}

          {/* AI panel — flex sibling so content is never obscured */}
          {aiOpen && <ResizeHandle onMouseDown={startAiResize} />}
          <aside style={{
            flexShrink: 0,
            width: aiOpen ? `${aiWidth}px` : '0',
            overflow: 'hidden',
            borderLeft: 'none',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ width: `${aiWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <AIPanel
                project={project}
                activeSlug={activeSlug}
                activeTitle={activeSlug === 'colagens' ? 'Recortes' : activeSlug === 'comentario_expositivo' ? 'Comentário Expositivo' : activeSlug === 'ferramentas_dicionario' ? 'Dicionário Lampas' : activeTool?.title ?? activeDef?.title ?? titleValue}
                context={aiPrompt}
                onClearContext={handleClearContext}
                sectionDef={activeDef}
              />
            </div>
          </aside>

        </div>
      </div>

      {/* ── Checklist de Melhorias ───────────────────────────────── */}
      {checklistOpen && (
        <aside style={{
          position: 'fixed', right: 0, top: 0, bottom: '60px',
          width: '360px', zIndex: 4800,
          background: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column',
        }}>
          <ImprovementChecklistPanel
            projectId={project.id}
            onClose={() => setChecklistOpen(false)}
          />
        </aside>
      )}

      {/* ── Janela flutuante Pilgrim ──────────────────────────────── */}
      {pilgrimOpen && <FloatingBrowser onClose={() => setPilgrimOpen(false)} />}

      {/* ── Modal Enviar ──────────────────────────────────────────── */}
      {enviarParaSermaOpen && (
        <EnviarParaSermaModal
          project={project}
          sections={sections}
          userId={user.id}
          targetMode={enviarTargetMode}
          onClose={() => setEnviarParaSermaOpen(false)}
        />
      )}


      {/* ── Bottom Nav Bar — progresso + navegação ──────────────── */}
      {!focusMode && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px',
          background: 'var(--surface)', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center',
          padding: '0 10px', gap: '4px',
          zIndex: 100,
        }}>

          {/* ← Voltar */}
          <button
            onClick={() => { prevPhaseNavSlug ? navigate(prevPhaseNavSlug) : router.push('/dashboard') }}
            title={prevPhaseNavSlug ? (mainPhases[phaseNavIdx - 1]?.label ?? 'Anterior') : 'Painel'}
            style={{
              height: '44px', flexShrink: 0,
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '10px', background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: '3px',
              padding: '0 10px',
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--text-secondary)',
              opacity: 1,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
          >
            <ChevronLeft size={13} strokeWidth={2.2} />
            Voltar
          </button>

          {/* Main phases (Preparar / Investigar / Comunicar) with progress fill */}
          {(() => {
            const mainPhases = navPhases.filter(p => p.id !== 'ferramentas')
            return mainPhases.flatMap((phase, idx) => {
              const progress = phaseProgress.find(p => p.id === phase.id)
              const isActive  = activePhase?.id === phase.id
              const pct       = progress?.pct ?? 0
              const prevPct   = idx > 0 ? (phaseProgress.find(p => p.id === mainPhases[idx - 1].id)?.pct ?? 0) : 0

              const connector = idx > 0 ? (
                <div key={`con-${phase.id}`} style={{
                  width: '14px', flexShrink: 0, height: '2px', borderRadius: '1px',
                  background: prevPct === 100 ? `${mainPhases[idx - 1].color}55` : 'var(--border-subtle)',
                  transition: 'background 0.5s',
                }} />
              ) : null

              const btn = (
                <button
                  key={phase.id}
                  onClick={() => navigate(getPhaseNavSlug(phase, project.study_mode))}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    flex: 1, minWidth: 0, height: '44px',
                    border: `1.5px solid ${isActive ? phase.color : pct > 0 ? `${phase.color}35` : 'var(--border-subtle)'}`,
                    borderRadius: '10px', background: 'var(--surface)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', padding: '0 12px', gap: '6px',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = `${phase.color}55` }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = pct > 0 ? `${phase.color}35` : 'var(--border-subtle)' }}
                >
                  {/* Progress fill (behind content) */}
                  {pct > 0 && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, pointerEvents: 'none',
                      width: `${pct}%`,
                      background: `${phase.color}${pct === 100 ? '14' : '0B'}`,
                      transition: 'width 0.6s ease',
                    }} />
                  )}
                  {/* Roman numeral */}
                  <span style={{
                    position: 'relative', zIndex: 1, flexShrink: 0,
                    fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.05em',
                    color: isActive ? phase.color : 'var(--text-muted)', lineHeight: 1,
                  }}>{phase.roman}</span>
                  {/* Phase name */}
                  <span style={{
                    position: 'relative', zIndex: 1, flex: 1, minWidth: 0,
                    fontSize: '0.82rem', fontWeight: 700, letterSpacing: '-0.01em',
                    color: isActive ? phase.color : pct > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{phase.label}</span>
                  {/* Progress badge */}
                  {pct === 100 ? (
                    <span style={{ position: 'relative', zIndex: 1, flexShrink: 0, fontSize: '0.72rem', color: phase.color }}>✓</span>
                  ) : pct > 0 ? (
                    <span style={{
                      position: 'relative', zIndex: 1, flexShrink: 0,
                      fontSize: '0.64rem', fontWeight: 700, letterSpacing: '-0.01em',
                      color: `${phase.color}95`,
                    }}>{pct}%</span>
                  ) : null}
                </button>
              )

              return connector ? [connector, btn] : [btn]
            })
          })()}

          {/* Divider */}
          <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)', flexShrink: 0, margin: '0 2px' }} />

          {/* Avançar → */}
          {(() => {
            const nextPhase      = phaseNavIdx >= 0 && phaseNavIdx < mainPhases.length - 1 ? mainPhases[phaseNavIdx + 1] : null
            const nextPhaseColor = nextPhase?.color ?? activePhase?.color
            const isLast         = phaseNavIdx >= 0 && phaseNavIdx === mainPhases.length - 1
            return (
              <button
                onClick={() => { if (nextPhaseNavSlug) navigate(nextPhaseNavSlug) }}
                title={nextPhaseNavSlug ? (nextPhase?.label ?? 'Próxima fase') : isLast ? 'Estudo concluído' : ''}
                style={{
                  height: '44px', flexShrink: 0,
                  border: `1.5px solid ${nextPhaseNavSlug ? `${nextPhaseColor}55` : isLast ? 'var(--success)' : 'var(--border-subtle)'}`,
                  borderRadius: '10px',
                  background: nextPhaseNavSlug ? `${nextPhaseColor}09` : isLast ? 'rgba(0,200,100,0.05)' : 'transparent',
                  cursor: nextPhaseNavSlug ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '3px',
                  padding: '0 10px',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: nextPhaseNavSlug ? (nextPhaseColor ?? 'var(--text-secondary)') : isLast ? 'var(--success)' : 'var(--text-muted)',
                  opacity: nextPhaseNavSlug || isLast ? 1 : 0.3,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (nextPhaseNavSlug) e.currentTarget.style.borderColor = `${nextPhaseColor}88` }}
                onMouseLeave={e => { if (nextPhaseNavSlug) e.currentTarget.style.borderColor = `${nextPhaseColor}55` }}
              >
                {isLast ? 'Concluir' : 'Avançar'}
                <ChevronRight size={13} strokeWidth={2.2} />
              </button>
            )
          })()}

        </div>
      )}

      {/* ── Abas Laterais — Dicionário, Referências, Recortes | Bíblia, Introduções, Teologias ── */}
      <WorkspaceLateralTabs
        project={project}
        userId={user.id}
        onAskAI={handleAskAI}
      />


    </div>
    </WorkspaceProvider>
  )
}

