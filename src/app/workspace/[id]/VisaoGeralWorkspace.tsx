'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Project, Section } from '@/types/database'
import { getSectionBySlug, type SectionDef } from '@/lib/workspace-sections'
import type { CollageItem } from '@/lib/collages-content'
import { createClient } from '@/lib/supabase/client'
import NodeFloatingWindow, { type FloatWin } from './NodeFloatingWindow'
import { Sparkles, Map, List, MoreHorizontal, X, BookOpen, ChevronLeft, Loader2, Check, BookMarked, Maximize2, Minus, Minimize2, Crosshair } from 'lucide-react'
import { loadClassificationsFromDB, saveClassificationToDB, deleteClassificationFromDB, updateClassificationInDB } from '@/lib/classification-sync'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import RichEditor from '@/components/RichEditorLazy'
import ReadingPopup from '@/components/ReadingPopup'
import HelpIcon from '@/components/help/HelpIcon'
import { HELP_CONTENT } from '@/lib/help-content'
import { getSectionNavBySlug, getSectionsByGroupNav } from '@/lib/workspace-sections-nav'
import ComentarioExegeticoWorkspace from './ComentarioExegeticoWorkspace'
import {
  type ClassType,
  type Classification,
  TYPE_LABELS,
  readCls,
  writeCls,
  toPlainText,
  CW, CH, CX, CY, RADIUS, PANEL_W, OBS_COLOR, OBS_BG,
  type OverviewLayerId,
  type NodeDef,
  SERMAO_EPISTOLAR_LAYERS,
  isEpistolarySermon,
  VG_CARD_DEFS,
  OBS_CARD_LABELS,
  OBS_NODE,
  SINTESE_CARD_HINTS,
  INVESTIGAR_PHASE_NODES,
  cardTextStatus,
  type DrillItem,
  type DrillLevel,
  type ConsolidatedSection,
  type ConsolidatedPopupState,
  buildVGNodePrompt,
  getOverviewNodes,
  createOverviewSectionDef,
  nodeXY,
} from './visao-geral-nodes'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  allVGSections?: Section[]
  allSections?: Section[]
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  onOpenBible?: () => void
  onNavigate?: (slug: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisaoGeralWorkspace({
  sectionDef, project, userId, existingSection, allVGSections, allSections = [], onUpdate, onAskAI, onOpenBible, onNavigate,
}: Props) {
  const supabase    = useMemo(() => createClient(), [])
  const wrapRef     = useRef<HTMLDivElement>(null)

  const isLayeredSermon = isEpistolarySermon(project)

  // Nós adaptativos ao modo de estudo / fase
  const allNodes = useMemo<NodeDef[]>(
    () => [...getOverviewNodes(project, sectionDef.slug), OBS_NODE],
    [project.study_mode, project.book, sectionDef.slug],
  )
  const [activeLayer, setActiveLayer] = useState<OverviewLayerId>('contexto_carta')
  const nodes = useMemo<NodeDef[]>(
    () => isLayeredSermon
      ? allNodes.filter(node => node.layer === activeLayer || node.kind === 'obs')
      : allNodes,
    [allNodes, activeLayer, isLayeredSermon],
  )
  const effectiveSectionDef = useMemo(
    () => createOverviewSectionDef(sectionDef, allNodes, project),
    [sectionDef, allNodes, project],
  )

  // Nó central: para modos temáticos (sem perícope), mostra o tema/doutrina
  const isPassageMode = project.book !== '—'
  const centerTitle   = isPassageMode ? project.book : 'Tema'
  const centerSub     = isPassageMode ? project.passage_ref : project.passage_ref

  // Fase da visão geral (derivada do slug)
  const phase = sectionDef.slug === 'preparar_visao_geral' || sectionDef.slug === 'nr_preparar_visao_geral' ? 'preparar'
    : sectionDef.slug === 'investigar_visao_geral' || sectionDef.slug === 'nr_ivg_ideia' ? 'investigar'
    : sectionDef.slug === 'ferramentas_visao_geral' ? 'ferramentas'
    : 'pregar'
  const isNarrativas = project.study_mode === 'estudo_narrativas'
  const prevSlug = phase === 'investigar' ? (isNarrativas ? 'nr_preparar_visao_geral' : 'preparar_visao_geral')
    : phase === 'pregar' ? 'investigar_visao_geral'
    : null
  const PHASE_LABEL: Record<string, string> = {
    preparar: 'Inicial', investigar: 'Investigativa', pregar: 'Homilética', ferramentas: 'Ferramentas',
  }
  const PHASE_COLOR: Record<string, string> = {
    preparar: '#D97706', investigar: '#163A6B', pregar: '#7C3AED', ferramentas: '#64748B',
  }
  const AI_PHASE_LABEL: Record<string, string> = {
    preparar: 'Preparar', investigar: 'Investigar', pregar: 'Pregar', ferramentas: 'Ferramentas',
  }
  const aiProjectContext = {
    id: project.id, book: project.book, passage_ref: project.passage_ref,
    testament: project.testament, original_language: project.original_language,
    study_mode: project.study_mode ?? undefined,
  }

  const [mounted,      setMounted]     = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t) }, [])

  const [mode,         setMode]        = useState<'visual' | 'structured'>('structured')
  const [expandedOutlineNodes,    setExpandedOutlineNodes]    = useState<Set<string>>(new Set())
  const [expandedOutlineSections, setExpandedOutlineSections] = useState<Set<string>>(new Set())
  const [editingOutlineCard,      setEditingOutlineCard]      = useState<string | null>(null)
  const [openCardHint,            setOpenCardHint]            = useState<string | null>(null)
  const [readingPopup, setReadingPopup] = useState<{ title: string; html: string; color: string } | null>(null)
  const [consolidatedPopup, setConsolidatedPopup] = useState<ConsolidatedPopupState | null>(null)
  const [activePanel,  setActivePanel] = useState<string | null>(null)
  const [hoveredNode,  setHoveredNode] = useState<string | null>(null)

  // ── Ordem personalizável dos blocos Investigar ────────────────────────────
  const isInvestigarVG = sectionDef.slug === 'investigar_visao_geral'
  const [investigarOrder, setInvestigarOrder] = useState<string[]>(() => {
    if (!isInvestigarVG) return []
    try {
      const saved = localStorage.getItem(`investigar_order_${project.id}`)
      if (saved) { const arr = JSON.parse(saved) as string[]; if (Array.isArray(arr) && arr.length > 0) return arr }
    } catch {}
    return INVESTIGAR_PHASE_NODES.map(n => n.key)
  })
  const [dragNodeKey, setDragNodeKey] = useState<string | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)

  const saveInvestigarOrder = useCallback((newOrder: string[]) => {
    setInvestigarOrder(newOrder)
    try { localStorage.setItem(`investigar_order_${project.id}`, JSON.stringify(newOrder)) } catch {}
  }, [project.id])

  const moveInvestigarNode = useCallback((key: string, dir: -1 | 1) => {
    setInvestigarOrder(prev => {
      const idx = prev.indexOf(key)
      if (idx === -1) return prev
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      try { localStorage.setItem(`investigar_order_${project.id}`, JSON.stringify(arr)) } catch {}
      return arr
    })
  }, [project.id])
  // Drill-down popup stack (single click → popup, double click → navegar)
  const [drillStack, setDrillStack] = useState<DrillLevel[]>([])
  const [drillDrafts, setDrillDrafts] = useState<Record<string, string>>({})
  const [drillSaving, setDrillSaving] = useState<string | null>(null)
  const lastClickRef = useRef<{ key: string; time: number } | null>(null)
  const [cls,          setCls]         = useState<Classification[]>([])
  const [wrapW,        setWrapW]       = useState(CW)
  const [cardDraft,    setCardDraft]   = useState<Record<string, string>>({})
  const [savingCard,   setSavingCard]  = useState<string | null>(null)
  const [itemMenuState,setItemMenuState] = useState<{ id: string; x: number; y: number } | null>(null)
  const [aiLoading,    setAiLoading]   = useState<string | null>(null)      // cls id
  const [aiResults,    setAiResults]   = useState<Record<string, string>>({}) // cls id → text
  const [toast,        setToast]       = useState<string | null>(null)
  const [activeItem,   setActiveItem]  = useState<Classification | null>(null)
  const [fieldLoading, setFieldLoading]= useState<Record<string, boolean>>({})
  const [dictSaving,   setDictSaving]  = useState(false)
  const [dictSaved,    setDictSaved]   = useState(false)
  // Modal de expansão de campo
  const [expandedField, setExpandedField] = useState<{ label: string; fieldKey: keyof Classification } | null>(null)
  const [expandDraft,   setExpandDraft]   = useState('')
  const [expandMode,    setExpandMode]    = useState<'view' | 'edit'>('view')

  // Floating node windows
  const [floatingWindows, setFloatingWindows] = useState<FloatWin[]>([])
  const topZRef = useRef(2000)

  // Canvas free pan & zoom
  const [viewX, setViewX]       = useState(0)
  const [viewY, setViewY]       = useState(0)
  const [zoom,  setZoom]        = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try { const s = localStorage.getItem(`vg_pos_${project.id}`); return s ? JSON.parse(s) : {} } catch { return {} }
  })
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const panStartRef  = useRef<{ mouseX: number; mouseY: number; viewX: number; viewY: number } | null>(null)
  const nodeDragRef  = useRef<{ key: string; startMouseX: number; startMouseY: number; startNodeX: number; startNodeY: number; moved: boolean } | null>(null)
  const zoomRef      = useRef(1)
  const viewXRef     = useRef(0)
  const viewYRef     = useRef(0)
  const centeredOnce = useRef(false)

  // Evolução das fases
  const [inherited,       setInherited]       = useState(false)
  const [showEvolution,   setShowEvolution]   = useState(false)
  const [evolutionLoading,setEvolutionLoading]= useState(false)
  const [evolutionData,   setEvolutionData]   = useState<{
    preparar?: Record<string, string>
    investigar?: Record<string, string>
    pregar?: Record<string, string>
  } | null>(null)

  useEffect(() => {
    setActivePanel(null)
    setActiveItem(null)
  }, [activeLayer])

  // ── Data — carrega do banco (fonte de verdade) e sincroniza localStorage ───
  useEffect(() => {
    let mounted = true
    // 1. Exibe localStorage imediatamente (zero latência)
    const local = readCls(project.id)
    setCls(local)

    // 2. Sincroniza com o banco em background
    loadClassificationsFromDB(project.id).then(fromDB => {
      if (!mounted) return
      if (fromDB.length === 0) return
      const dbIds = new Set(fromDB.map(c => c.id))
      const onlyLocal = local.filter(c => !dbIds.has(c.id))
      const merged = [...fromDB, ...onlyLocal] as Classification[]
      setCls(merged)
      writeCls(project.id, merged)
    })

    // 3. Polling leve para capturar mudanças do BibleTextBlock (mesma aba)
    const intervalId = window.setInterval(() => {
      if (!mounted) return
      const fresh = readCls(project.id)
      setCls(prev => {
        if (prev.length === fresh.length && JSON.stringify(prev) === JSON.stringify(fresh)) return prev
        return fresh
      })
    }, 2000)

    return () => { mounted = false; window.clearInterval(intervalId) }
  }, [project.id])

  // Herança automática: copia conteúdo da fase anterior na primeira abertura
  useEffect(() => {
    if (phase === 'preparar' || existingSection) return
    let mounted = true
    supabase.from('sections')
      .select('content')
      .eq('project_id', project.id)
      .eq('slug', prevSlug!)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data?.content) return
        const prevCards = (data.content as { cards?: Record<string, string> })?.cards ?? {}
        if (Object.keys(prevCards).length > 0) {
          setCardDraft(prevCards)
          setInherited(true)
        }
      })
    return () => { mounted = false }
  }, [phase, project.id, prevSlug, existingSection?.id, supabase])

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(e => setWrapW(e[0].contentRect.width))
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // Keep refs in sync for the wheel handler (which lives in a useEffect closure)
  useEffect(() => { zoomRef.current  = zoom  }, [zoom])
  useEffect(() => { viewXRef.current = viewX }, [viewX])
  useEffect(() => { viewYRef.current = viewY }, [viewY])

  // Non-passive wheel zoom
  useEffect(() => {
    if (mode !== 'visual') return
    const c = canvasContainerRef.current
    if (!c) return
    const container = c
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.1 : -0.1
      const cur  = zoomRef.current
      const next = Math.max(0.4, Math.min(1.5, cur + delta))
      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const ratio = next / cur
      setZoom(next)
      setViewX(mx - ratio * (mx - viewXRef.current))
      setViewY(my - ratio * (my - viewYRef.current))
    }
    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [mode])

  // Center map when canvas first becomes visible
  useEffect(() => {
    if (mode !== 'visual' || centeredOnce.current || !canvasContainerRef.current) return
    const cw = canvasContainerRef.current.clientWidth
    const ch = canvasContainerRef.current.clientHeight
    if (cw > 0 && ch > 0) {
      centeredOnce.current = true
      setViewX((cw - CW) / 2)
      setViewY((ch - CH) / 2)
    }
  }, [mode])

  // fechar menu ao clicar fora — setTimeout garante que o listener só existe
  // no próximo tick, após o click atual terminar de propagar
  useEffect(() => {
    if (!itemMenuState) return
    let handler: (() => void) | null = null
    const timer = setTimeout(() => {
      handler = () => setItemMenuState(null)
      document.addEventListener('click', handler)
    }, 0)
    return () => {
      clearTimeout(timer)
      if (handler) document.removeEventListener('click', handler)
    }
  }, [itemMenuState])

  const cards = useMemo(
    () => (existingSection?.content as { cards?: Record<string, string> } | null)?.cards ?? {},
    [existingSection],
  )

  const obsContent = useMemo(() => {
    const entries: Array<{ label: string; value: string }> = []
    for (const slug of ['preparar_leia_assimile', 'preparar_primeiras_impressoes']) {
      const section = allSections.find(s => s.slug === slug)
      if (!section) continue
      const sCards = (section.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      for (const [key, val] of Object.entries(sCards)) {
        if (val?.trim()) entries.push({ label: OBS_CARD_LABELS[key] ?? key.replace(/_/g, ' '), value: toPlainText(val) })
      }
    }
    return entries
  }, [allSections])

  // ── Node data helpers ──────────────────────────────────────────────────────
  const getLinkedSection = (node: NodeDef): Section | undefined =>
    node.sectionSlug ? allSections.find(section => section.slug === node.sectionSlug) : undefined

  const getLinkedCards = (node: NodeDef): Record<string, string> => {
    const section = getLinkedSection(node)
    return (section?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
  }

  const getLinkedCardEntries = (node: NodeDef): Array<readonly [string, string]> => {
    const linkedCards = getLinkedCards(node)
    const entries = node.sectionCardId
      ? [[node.sectionCardId, linkedCards[node.sectionCardId] ?? '']] as Array<readonly [string, string]>
      : Object.entries(linkedCards)

    return entries
      .map(([key, value]) => [key, value?.trim() ?? ''] as const)
      .filter(([, value]) => Boolean(value))
  }

  const getClsItems = (node: NodeDef): Classification[] =>
    node.kind === 'cls' && node.clsTypes
      ? cls.filter(c => node.clsTypes!.includes(c.type))
      : []

  const getCardText = (node: NodeDef): string =>
    node.kind === 'obs' ? obsContent.map(e => `${e.label}: ${e.value}`).join('\n\n') :
    node.sectionSlug
      ? getLinkedCardEntries(node).map(([, value]) => value).join('\n\n')
      : node.kind === 'card' && node.cardIds
      ? node.cardIds.map(id => cards[id]?.trim()).filter(Boolean).join('\n\n')
      : ''

  const getCount = (node: NodeDef): number =>
    node.kind === 'obs' ? obsContent.length :
    node.sectionSlug
      ? getLinkedCardEntries(node).length
      : node.kind === 'cls' ? getClsItems(node).length : (getCardText(node) ? 1 : 0)

  const getNodeSummary = (node: NodeDef): string => {
    const text = toPlainText(getCardText(node)).replace(/\s+/g, ' ').trim()
    return text.length > 220 ? `${text.slice(0, 220)}...` : text
  }

  const totalItems = nodes.reduce((s, n) => s + getCount(n), 0)
  const canvasNodes = useMemo(() => {
    const base = nodes.filter(n => n.kind !== 'obs')
    if (!isInvestigarVG || investigarOrder.length === 0) return base
    const ordered = investigarOrder.map(k => base.find(n => n.key === k)).filter(Boolean) as NodeDef[]
    const missing = base.filter(n => !investigarOrder.includes(n.key))
    return [...ordered, ...missing]
  }, [nodes, investigarOrder, isInvestigarVG])

  const buildOutlineItems = (node: NodeDef): DrillItem[] => {
    if (node.kind === 'cls') {
      return getClsItems(node).map(c => ({
        id: c.id,
        label: c.selectedText || c.id,
        sectionSlug: '',
        type: 'card' as const,
        status: 'reviewed' as const,
      }))
    }
    if (node.phaseGroup) {
      return getSectionsByGroupNav(node.phaseGroup, project.study_mode).map(s => {
        const secData = allSections.find(sec => sec.slug === s.slug)
        const sCards  = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
        const label   = (s as { shortTitle?: string; title: string }).shortTitle ?? s.title
        // Seção com 1 único card: vira folha direta (evita repetir o mesmo nome em dois níveis)
        if (s.cards?.length === 1) {
          const onlyCard = s.cards[0]
          return { id: onlyCard.id, label, sectionSlug: s.slug, type: 'card' as const, status: cardTextStatus(sCards[onlyCard.id] ?? '') }
        }
        const filled = Object.values(sCards).filter(v => v?.trim()).length
        const total  = s.cards?.length ?? 0
        const status: DrillItem['status'] = filled === 0 ? 'empty' : (filled >= total && total > 0 ? 'reviewed' : 'draft')
        return { id: s.slug, label, sectionSlug: s.slug, type: 'section' as const, status }
      })
    }
    // VG de Investigar: prefixa os 4 cards da seção 'sintese' (dados preservados no slug original)
    if (node.sectionSlug === 'investigar_visao_geral') {
      const sinteseNav  = getSectionNavBySlug('sintese')
      const sinteseData = allSections.find(s => s.slug === 'sintese')
      const sinteseCards = (sinteseData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const sinteseItems: DrillItem[] = (sinteseNav?.cards ?? []).map(c => ({
        id: c.id,
        label: c.title ?? c.id.replace(/_/g, ' '),
        sectionSlug: 'sintese',
        type: 'card' as const,
        status: cardTextStatus(sinteseCards[c.id] ?? '') as DrillItem['status'],
      }))

      const vgNav  = getSectionNavBySlug('investigar_visao_geral')
      const vgData = allSections.find(s => s.slug === 'investigar_visao_geral')
      const vgSavedCards = (vgData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const vgItems: DrillItem[] = (vgNav?.cards ?? []).map(c => ({
        id: c.id,
        label: c.title ?? c.id.replace(/_/g, ' '),
        sectionSlug: 'investigar_visao_geral',
        type: 'card' as const,
        status: cardTextStatus(vgSavedCards[c.id] ?? '') as DrillItem['status'],
      }))

      return [...sinteseItems, ...vgItems]
    }

    const sSlug = node.sectionSlug
    if (sSlug) {
      const sNav       = getSectionNavBySlug(sSlug)
      const secData    = allSections.find(s => s.slug === sSlug)
      const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      if (node.sectionCardId) {
        const navCard = sNav?.cards?.find(c => c.id === node.sectionCardId)
        return [{
          id: node.sectionCardId,
          label: navCard?.title ?? node.sectionCardId.replace(/_/g, ' '),
          sectionSlug: sSlug,
          type: 'card' as const,
          status: cardTextStatus(savedCards[node.sectionCardId] ?? '') as DrillItem['status'],
        }]
      }
      return (sNav?.cards ?? []).map(c => ({
        id: c.id,
        label: c.title ?? c.id.replace(/_/g, ' '),
        sectionSlug: sSlug,
        type: 'card' as const,
        status: cardTextStatus(savedCards[c.id] ?? '') as DrillItem['status'],
      }))
    }
    if (node.cardIds) {
      return node.cardIds.map(cid => {
        const vgDef = VG_CARD_DEFS[cid]
        return {
          id: cid,
          label: vgDef?.title ?? cid.replace(/_/g, ' '),
          sectionSlug: sectionDef.slug,
          type: 'card' as const,
          status: cardTextStatus(cards[cid] ?? '') as DrillItem['status'],
        }
      })
    }
    return []
  }

  // ── Popup de leitura consolidada de ramo ─────────────────────────────────
  function buildConsolidatedSections(node: NodeDef): ConsolidatedSection[] {
    if (node.phaseGroup) {
      return getSectionsByGroupNav(node.phaseGroup, project.study_mode)
        .map(s => {
          const secData    = allSections.find(sec => sec.slug === s.slug)
          const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
          return {
            title: s.title,
            slug:  s.slug,
            cards: (s.cards ?? [])
              .map(c => ({ label: c.title ?? c.id, html: savedCards[c.id] ?? '' }))
              .filter(c => c.html.trim()),
          }
        })
        .filter(s => s.cards.length > 0)
    }

    if (node.sectionSlug === 'investigar_visao_geral') {
      const sinteseNav   = getSectionNavBySlug('sintese')
      const sinteseData  = allSections.find(s => s.slug === 'sintese')
      const sinteseCards = (sinteseData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const cards = (sinteseNav?.cards ?? [])
        .map(c => ({ label: c.title ?? c.id, html: sinteseCards[c.id] ?? '' }))
        .filter(c => c.html.trim())
      return cards.length ? [{ title: 'Síntese Exegética', slug: 'sintese', cards }] : []
    }

    const sSlug = node.sectionSlug
    if (!sSlug) return []

    if (sSlug === 'texto_original') {
      const txData    = allSections.find(s => s.slug === 'texto_original')
      const txContent = txData?.content as { passagem?: string; versos?: { ref: string; texto: string }[] } | null
      const passagem  = txContent?.passagem?.trim()
        ?? txContent?.versos?.map(v => `${v.ref} ${v.texto}`.trim()).join('\n').trim()
      return passagem
        ? [{ title: '2.1 Texto Original', slug: 'texto_original', cards: [{ label: 'Passagem', html: passagem, isPlain: true }] }]
        : []
    }

    const sNav    = getSectionNavBySlug(sSlug)
    const secData = allSections.find(s => s.slug === sSlug)
    const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
    if (node.sectionCardId) {
      const navCard = sNav?.cards?.find(c => c.id === node.sectionCardId)
      const html = savedCards[node.sectionCardId] ?? ''
      return html.trim()
        ? [{ title: sNav?.title ?? sSlug, slug: sSlug, cards: [{ label: navCard?.title ?? node.sectionCardId, html }] }]
        : []
    }
    const cards = (sNav?.cards ?? [])
      .map(c => ({ label: c.title ?? c.id, html: savedCards[c.id] ?? '' }))
      .filter(c => c.html.trim())
    return cards.length ? [{ title: sNav?.title ?? sSlug, slug: sSlug, cards }] : []
  }

  function openConsolidatedPopup(node: NodeDef) {
    const sections = buildConsolidatedSections(node)
    setConsolidatedPopup({
      title:       node.label,
      icon:        node.icon,
      color:       node.color,
      bg:          node.bg,
      primarySlug: node.sectionSlug ?? node.phaseGroup ?? sectionDef.slug,
      sections,
    })
  }

  // ── Abrir modal de evolução das fases ─────────────────────────────────────
  const openEvolution = useCallback(async () => {
    setEvolutionLoading(true)
    try {
      // Prioriza allVGSections passado pelo WorkspaceClient (evita fetch extra)
      const local = allVGSections ?? []
      const slugsNeeded = isNarrativas
        ? ['nr_preparar_visao_geral', 'nr_ivg_ideia', 'pregar_visao_geral']
        : ['preparar_visao_geral', 'investigar_visao_geral', 'pregar_visao_geral']
      const hasFull = slugsNeeded.every(s => local.some(sec => sec.slug === s))

      let rows = local
      if (!hasFull) {
        const { data } = await supabase.from('sections')
          .select('slug, content')
          .eq('project_id', project.id)
          .in('slug', slugsNeeded)
        rows = (data ?? []) as typeof rows
      }

      const result: NonNullable<typeof evolutionData> = {}
      for (const s of rows) {
        const ph = (s.slug === 'preparar_visao_geral' || s.slug === 'nr_preparar_visao_geral') ? 'preparar'
          : (s.slug === 'investigar_visao_geral' || s.slug === 'nr_ivg_ideia') ? 'investigar' : 'pregar'
        result[ph as 'preparar' | 'investigar' | 'pregar'] =
          (s.content as { cards?: Record<string, string> })?.cards ?? {}
      }
      setEvolutionData(result)
      setShowEvolution(true)
    } finally {
      setEvolutionLoading(false)
    }
  }, [allVGSections, project.id, supabase, evolutionData, isNarrativas])

  // ── Save card ──────────────────────────────────────────────────────────────
  const saveCard = useCallback(async (cardId: string, value: string) => {
    setSavingCard(cardId)
    try {
      const { data } = await supabase.from('sections').select()
        .eq('project_id', project.id).eq('slug', sectionDef.slug).maybeSingle()
      const prev     = (data?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const allCards = { ...prev, [cardId]: value }
      const hasContent = Object.values(allCards).some(v => v.trim().length > 0)
      const allFilled  = sectionDef.cards.length > 0 &&
        sectionDef.cards.every(c => (allCards[c.id] ?? '').trim().length > 0)
      const payload = {
        project_id: project.id, user_id: userId, slug: sectionDef.slug,
        module: 'inventio' as const, title: sectionDef.title,
        status: (allFilled ? 'reviewed' : hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
        content: { cards: allCards },
      }
      const op = data?.id
        ? supabase.from('sections').update(payload).eq('id', data.id).select().single()
        : supabase.from('sections').insert(payload).select().single()
      const { data: updated } = await op
      if (updated) onUpdate(updated as Section)
    } catch { /* noop */ }
    finally { setSavingCard(null) }
  }, [supabase, project.id, userId, sectionDef, onUpdate])

  // Save a card in any section (used by drill-down inline editor)
  const saveDrillCard = useCallback(async (sectionSlug: string, cardId: string, value: string) => {
    const draftKey = `${sectionSlug}:${cardId}`
    setDrillSaving(draftKey)
    try {
      const { data } = await supabase.from('sections').select()
        .eq('project_id', project.id).eq('slug', sectionSlug).maybeSingle()
      const prev     = (data?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const allCards = { ...prev, [cardId]: value }
      const hasContent = Object.values(allCards).some(v => v.trim().length > 0)
      const secDef     = getSectionBySlug(sectionSlug)
      const allFilled  = !!secDef && secDef.cards.length > 0 &&
        secDef.cards.every(c => (allCards[c.id] ?? '').trim().length > 0)
      const payload = {
        project_id: project.id, user_id: userId, slug: sectionSlug,
        module: 'inventio' as const, title: sectionSlug,
        status: (allFilled ? 'reviewed' : hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
        content: { cards: allCards },
      }
      const op = data?.id
        ? supabase.from('sections').update(payload).eq('id', data.id).select().single()
        : supabase.from('sections').insert(payload).select().single()
      const { data: updated } = await op
      if (updated) onUpdate(updated as Section)
    } catch { /* noop */ }
    finally { setDrillSaving(null) }
  }, [supabase, project.id, userId, onUpdate])

  // Reset detail panel when node changes
  useEffect(() => { setActiveItem(null); setDictSaved(false) }, [activePanel])

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // ── Update cls field (also keeps activeItem in sync) ──────────────────────
  function updateClsField(id: string, fields: Partial<Classification>) {
    setCls(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...fields } : c)
      writeCls(project.id, next)
      return next
    })
    setActiveItem(prev => (prev?.id === id ? { ...prev, ...fields } : prev))
    updateClassificationInDB(id, fields)
  }

  // ── Abre o painel de detalhe para um termo (batched com outros setState) ───
  function openTermDetail(c: Classification) {
    const node = nodes.find(n => n.clsTypes?.includes(c.type))
    if (node) setActivePanel(node.key)
    setDictSaved(false)
    setActiveItem(c)
  }

  // ── Generate field inline (AI → salva no próprio termo, nunca abre chat) ──
  async function generateField(c: Classification, kind: string, fieldKey: keyof Classification) {
    const FIELD_NAMES: Record<string, string> = {
      description: 'Definição', analysis: 'Explicação', lexical: 'Estudo Lexical',
      theological_biblical: 'Teologia Bíblica', narrative_function: 'Função Narrativa',
      applications: 'Aplicações', original_term: 'Línguas Originais',
    }
    const fieldName = FIELD_NAMES[kind] ?? kind
    const loadKey   = `${c.id}:${kind}`

    setFieldLoading(prev => ({ ...prev, [loadKey]: true }))
    try {
      const res  = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: c.selectedText, type: c.type, startVerse: c.startVerse, book: project.book, passageRef: project.passage_ref, kind }),
      })
      const data = await res.json() as { result?: string; error?: string; upgrade?: boolean }

      if (!res.ok || data.error) {
        if (data.upgrade) showToast('Limite de IA atingido — faça upgrade do plano')
        else showToast(`Erro ao gerar ${fieldName}: ${data.error ?? 'Tente novamente'}`)
        return
      }

      if (data.result) {
        if (kind === 'original_term') {
          const parts = data.result.split('|').map((s: string) => s.trim())
          updateClsField(c.id, { original_term: parts[0] ?? '', transliteration: parts[1] ?? '', meaning: parts[2] ?? '' })
        } else {
          updateClsField(c.id, { [fieldKey]: data.result })
        }
        showToast(`${fieldName} gerada para "${c.selectedText}"`)
      } else {
        showToast(`Resposta vazia da IA — tente novamente`)
      }
    } catch {
      showToast('Erro de conexão com a IA — tente novamente')
    } finally {
      setFieldLoading(prev => { const n = { ...prev }; delete n[loadKey]; return n })
    }
  }

  // ── Save classification to Dicionário Lampas ──────────────────────────────
  async function saveToDictionary(item: Classification) {
    setDictSaving(true)
    try {
      const catMap: Partial<Record<ClassType, string>> = {
        personagem: 'personagem', cargo: 'personagem', lugar: 'lugar',
        tema: 'tema', teologia: 'doutrina', termo_chave: 'termo_biblico',
        repeticao: 'termo_biblico',
      }
      await supabase.from('lampas_dictionary').insert({
        user_id: userId, title: item.selectedText,
        category: catMap[item.type] ?? 'conceito_historico',
        trust_level: 1,
        definition: item.definition ?? item.explanation ?? null,
        transliteration: item.transliteration ?? null,
        occurrences: item.occurrences_note ?? null,
        main_texts: `${project.book} ${project.passage_ref}, v.${item.startVerse}`,
        theological_biblical: item.theological_biblical ?? null,
        applications: item.applications ?? null,
        sources: ['Visão Geral'], tags: [item.type],
        cross_references: [], related_terms: [],
      })
      setDictSaved(true)
      showToast(`"${item.selectedText}" salvo no Dicionário Lampas`)
    } catch { /* noop */ }
    finally { setDictSaving(false) }
  }

  // ── Remove cls item ────────────────────────────────────────────────────────
  const removeCls = (id: string) => {
    const next = cls.filter(c => c.id !== id)
    setCls(next); writeCls(project.id, next)
    setItemMenuState(null)
    deleteClassificationFromDB(id)
  }

  // ── Open item menu at button position ──────────────────────────────────────
  function openItemMenu(e: React.MouseEvent, id: string) {
    e.stopPropagation() // evita que o click handler do document feche o menu recém-aberto
    if (itemMenuState?.id === id) { setItemMenuState(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setItemMenuState({ id, x: rect.right, y: rect.top })
  }

  // ── Gerar explicação com IA (inline) ──────────────────────────────────────
  async function generateExplanation(c: Classification) {
    setItemMenuState(null)
    setAiLoading(c.id)
    try {
      const res = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: c.selectedText, type: c.type, startVerse: c.startVerse, book: project.book, passageRef: project.passage_ref, kind: 'description' }),
      })
      const data = await res.json() as { result?: string }
      if (data.result) setAiResults(prev => ({ ...prev, [c.id]: data.result! }))
    } catch { /* noop */ }
    finally { setAiLoading(null) }
  }

  // ── Send to section (text append) ─────────────────────────────────────────
  async function sendToSection(c: Classification, slug: string, title: string, cardId?: string) {
    setItemMenuState(null)
    const line = `**${c.selectedText}** (v.${c.startVerse}) — ${c.type}`
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', slug).maybeSingle()
      const base = { project_id: project.id, user_id: userId, slug, module: 'inventio' as const, title, status: 'draft' as const }
      if (cardId) {
        const cards = ((data?.content as { cards?: Record<string, string> } | null)?.cards) ?? {}
        const prev  = cards[cardId] ?? ''
        const payload = { ...base, content: { cards: { ...cards, [cardId]: prev ? `${prev}\n${line}` : line } } }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      } else {
        const prev = (data?.ai_output as string | null) ?? ''
        const payload = { ...base, ai_output: prev ? `${prev}\n\n${line}` : line }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      }
      showToast(`Enviado para ${title}`)
    } catch { showToast('Erro ao enviar') }
  }

  // ── Transformar em Colagem ─────────────────────────────────────────────────
  async function createCollage(c: Classification) {
    setItemMenuState(null)
    const TYPE_LABELS: Record<string, string> = { personagem: 'Personagem', lugar: 'Lugar', tema: 'Tema', termo_chave: 'Termo-Chave', conflito: 'Conflito', repeticao: 'Repetição', teologia: 'Teologia', cargo: 'Cargo' }
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', 'colagens').maybeSingle()
      const items: CollageItem[] = ((data?.content as { type?: string; items?: CollageItem[] } | null)?.items) ?? []
      const newItem: CollageItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        type: 'trecho', title: `${TYPE_LABELS[c.type] ?? c.type}: "${c.selectedText}"`,
        content: `${c.selectedText}\n\n— ${project.book} ${project.passage_ref}, v.${c.startVerse}${aiResults[c.id] ? `\n\n${aiResults[c.id]}` : ''}`,
        author: '', work: `${project.book} ${project.passage_ref}`, page: `v.${c.startVerse}`,
        tags: [TYPE_LABELS[c.type] ?? c.type], category: 'Exegese', linkedTo: 'Perícope', x: 0, y: 0,
      }
      const payload = { project_id: project.id, user_id: userId, slug: 'colagens', module: 'inventio' as const, title: 'Colagens', status: 'draft' as const, content: { type: 'collages_workspace', items: [...items, newItem] } }
      if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
      else          await supabase.from('sections').insert(payload)
      showToast('Adicionado às Colagens')
    } catch { showToast('Erro ao criar colagem') }
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  const PANEL_GAP = 12

  const activeNode = nodes.find(n => n.key === activePanel) ?? null
  const activeLayerMeta = SERMAO_EPISTOLAR_LAYERS.find(layer => layer.id === activeLayer)

  // ── Floating windows ──────────────────────────────────────────────────────

  function openFloatingWindow(node: NodeDef) {
    const existing = floatingWindows.find(w => w.nodeKey === node.key)
    if (existing) {
      topZRef.current++
      setFloatingWindows(prev => prev.map(w =>
        w.id === existing.id ? { ...w, zIndex: topZRef.current, minimized: false } : w
      ))
      return
    }
    topZRef.current++
    const offset = (floatingWindows.length % 6) * 26
    setFloatingWindows(prev => [...prev, {
      id: `${node.key}_${Date.now()}`,
      nodeKey: node.key,
      nodeLabel: node.label,
      nodeIcon: node.icon,
      nodeColor: node.color,
      nodeBg: node.bg,
      x: 100 + offset,
      y: 80 + offset,
      width: 540,
      height: 460,
      minimized: false,
      maximized: false,
      zIndex: topZRef.current,
    }])
  }

  function closeFloatingWindow(id: string) {
    setFloatingWindows(prev => prev.filter(w => w.id !== id))
  }

  function focusFloatingWindow(id: string) {
    topZRef.current++
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: topZRef.current } : w))
  }

  function updateFloatPos(id: string, x: number, y: number) {
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w))
  }

  function updateFloatSize(id: string, width: number, height: number) {
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w))
  }

  function toggleMinimizeWin(id: string) {
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w))
  }

  function toggleMaximizeWin(id: string) {
    setFloatingWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w))
  }

  // ── Canvas free pan & zoom ─────────────────────────────────────────────────
  function getNodePos(node: NodeDef) {
    return nodePositions[node.key] ?? nodeXY(node.angle, node.radius ?? RADIUS)
  }

  function centerMap() {
    const c = canvasContainerRef.current; if (!c) return
    setViewX((c.clientWidth  - CW * zoom) / 2)
    setViewY((c.clientHeight - CH * zoom) / 2)
  }

  function fitToScreen() {
    const c = canvasContainerRef.current; if (!c) return
    const z = Math.max(0.4, Math.min(1.5, Math.min((c.clientWidth - 32) / CW, (c.clientHeight - 32) / CH)))
    setZoom(z)
    setViewX((c.clientWidth  - CW * z) / 2)
    setViewY((c.clientHeight - CH * z) / 2)
  }

  function handleCanvasMD(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('button')) return
    panStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, viewX, viewY }
    setIsPanning(true)
    setDrillStack([])
  }

  function handleCanvasMM(e: React.MouseEvent<HTMLDivElement>) {
    if (nodeDragRef.current) {
      const d = nodeDragRef.current
      const dx = (e.clientX - d.startMouseX) / zoom
      const dy = (e.clientY - d.startMouseY) / zoom
      if (!d.moved && Math.hypot(dx, dy) > 4) d.moved = true
      if (d.moved) setNodePositions(prev => {
        const n = { ...prev, [d.key]: { x: d.startNodeX + dx, y: d.startNodeY + dy } }
        try { localStorage.setItem(`vg_pos_${project.id}`, JSON.stringify(n)) } catch {}
        return n
      })
    } else if (panStartRef.current) {
      setViewX(panStartRef.current.viewX + (e.clientX - panStartRef.current.mouseX))
      setViewY(panStartRef.current.viewY + (e.clientY - panStartRef.current.mouseY))
    }
  }

  function handleCanvasMU() {
    const drag = nodeDragRef.current
    if (drag) {
      if (!drag.moved) {
        const clickedNode = allNodes.find(n => n.key === drag.key)
        if (clickedNode?.kind === 'phase') {
          openConsolidatedPopup(clickedNode)
        } else if (clickedNode?.kind === 'card') {
          const now = Date.now()
          const pos = getNodePos(clickedNode)
          setDrillStack([{
            id: `${clickedNode.key}_${now}`,
            node: clickedNode,
            title: clickedNode.label,
            icon: clickedNode.icon,
            color: clickedNode.color,
            bg: clickedNode.bg,
            sectionSlug: clickedNode.sectionSlug ?? sectionDef.slug,
            cardIdsFilter: clickedNode.cardIds,
            canvasX: pos.x,
            canvasY: pos.y,
            viewTab: 'view',
          }])
        } else {
          setActivePanel(p => p === drag.key ? null : drag.key)
          setDrillStack([])
        }
      }
      nodeDragRef.current = null
    }
    panStartRef.current = null
    setIsPanning(false)
  }

  function startNodeDrag(e: React.MouseEvent, node: NodeDef) {
    e.stopPropagation()
    const { x, y } = getNodePos(node)
    nodeDragRef.current = { key: node.key, startMouseX: e.clientX, startMouseY: e.clientY, startNodeX: x, startNodeY: y, moved: false }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ padding: '1.25rem 1.5rem 2rem', opacity: mounted ? 1 : 0, transition: 'opacity 0.25s ease' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Visão Geral
            </div>
            <span style={{
              fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PHASE_COLOR[phase],
              background: PHASE_COLOR[phase] + '15',
              border: `1px solid ${PHASE_COLOR[phase]}30`,
              padding: '2px 7px', borderRadius: '999px',
            }}>
              {PHASE_LABEL[phase]}
            </span>
          </div>
          <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isPassageMode ? `${project.book} ${project.passage_ref}` : project.passage_ref}
          </div>
          {mode === 'visual' && (
            <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              {totalItems === 0
                ? <span style={{ color: '#B45309' }}>Marque palavras no Texto Bíblico para construir o mapa.</span>
                : `${totalItems} elemento${totalItems !== 1 ? 's' : ''} mapeado${totalItems !== 1 ? 's' : ''}${activePanel ? ' — clique fora para fechar o painel' : ' — clique em um nó para explorar'}.`}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {mode === 'visual' && activePanel && (
            <button onClick={() => setActivePanel(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', padding: '5px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <X size={11} /> Fechar painel
            </button>
          )}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2, #F1F5F9)', borderRadius: '8px', padding: '2px' }}>
            {(['visual', 'structured'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setActivePanel(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: mode === m ? '#FFFFFF' : 'transparent', border: 'none',
                  borderRadius: '6px', padding: '5px 11px', fontSize: '0.7rem', fontWeight: 600,
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {m === 'visual' ? <><Map size={11} strokeWidth={1.75} />Mapa</> : <><List size={11} strokeWidth={1.75} />Estruturado</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'visual' && isLayeredSermon && (
        <div style={{
          marginBottom: '1rem',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '0.55rem',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.35rem' }}>
            {SERMAO_EPISTOLAR_LAYERS.map((layer, index) => {
              const layerNodes = allNodes.filter(node => node.layer === layer.id)
              const filled = layerNodes.filter(node => getCount(node) > 0).length
              const active = activeLayer === layer.id

              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${active ? layer.color + '55' : '#E2E8F0'}`,
                    background: active ? layer.color + '0D' : '#F8FAFC',
                    borderRadius: '9px',
                    padding: '0.55rem 0.65rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    minWidth: 0,
                    transition: 'all 0.14s',
                  }}
                  onMouseEnter={e => {
                    if (active) return
                    e.currentTarget.style.borderColor = layer.color + '35'
                    e.currentTarget.style.background = '#FFFFFF'
                  }}
                  onMouseLeave={e => {
                    if (active) return
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.background = '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    <span style={{
                      width: '1.15rem',
                      height: '1.15rem',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: active ? layer.color : '#E2E8F0',
                      color: active ? '#FFFFFF' : '#64748B',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                    }}>
                      {index + 1}
                    </span>
                    <span style={{
                      color: active ? layer.color : '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 750,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {layer.label}
                    </span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '0.62rem', lineHeight: 1.35, marginTop: '0.25rem' }}>
                    {layer.subtitle}
                  </div>
                  <div style={{ color: active ? layer.color : '#94A3B8', fontSize: '0.58rem', fontWeight: 700, marginTop: '0.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {filled}/{layerNodes.length} preenchidos
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{
            marginTop: '0.55rem',
            padding: '0.45rem 0.55rem',
            borderRadius: '8px',
            background: (activeLayerMeta?.color ?? '#64748B') + '0A',
            color: activeLayerMeta?.color ?? '#64748B',
            fontSize: '0.7rem',
            lineHeight: 1.45,
          }}>
            {activeLayerMeta?.label}: {activeLayerMeta?.subtitle}. Avance pelas camadas para ir da compreensão da carta à formulação do sermão.
          </div>
        </div>
      )}

      {/* ── Banner de fase (INVESTIGAR / COMUNICAR) ────────────────────────── */}
      {phase !== 'preparar' && phase !== 'ferramentas' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', flexWrap: 'wrap',
          marginBottom: '1rem',
          padding: '0.6rem 0.9rem',
          background: PHASE_COLOR[phase] + '0C',
          border: `1px solid ${PHASE_COLOR[phase]}25`,
          borderRadius: '8px',
        }}>
          <span style={{ fontSize: '0.73rem', color: PHASE_COLOR[phase], lineHeight: 1.5 }}>
            {inherited
              ? `Conteúdo herdado da etapa ${phase === 'investigar' ? 'Preparar' : 'Investigar'}. Evolua livremente — as versões anteriores não são alteradas.`
              : `Esta visão pode ser desenvolvida sem alterar versões anteriores.`}
          </span>
          <button
            onClick={openEvolution}
            disabled={evolutionLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
              background: 'transparent',
              border: `1px solid ${PHASE_COLOR[phase]}40`,
              borderRadius: '6px', padding: '4px 10px',
              fontSize: '0.7rem', fontWeight: 600,
              color: PHASE_COLOR[phase], cursor: evolutionLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = PHASE_COLOR[phase] + '15' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {evolutionLoading ? '…' : '✓ Ver evolução'}
          </button>
        </div>
      )}

      {/* ── Structured ─────────────────────────────────────────────────────── */}
      {mode === 'structured' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Root node */}
          <div style={{ padding: '0.8rem 1.1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'baseline', gap: '0.55rem', background: 'var(--surface-2, #F8FAFC)' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{centerTitle}</span>
            {centerSub && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{centerSub}</span>}
            <span style={{ marginLeft: 'auto', fontSize: '0.63rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{totalItems} itens</span>
          </div>

          {/* Outline rows */}
          {(() => {
            const isInvestigar = sectionDef.slug === 'investigar_visao_geral'
            return canvasNodes.map((node, nodeIdx) => {
            const isExpanded  = expandedOutlineNodes.has(node.key)
            const count       = getCount(node)
            const items       = buildOutlineItems(node)
            const toggleNode  = () => setExpandedOutlineNodes(prev => {
              const next = new Set(prev)
              if (next.has(node.key)) { next.delete(node.key) } else { next.add(node.key) }
              return next
            })
            const nodeNum     = isInvestigar ? nodeIdx + 1 : null
            const isDragging  = dragNodeKey === node.key
            const isDragOver  = dragOverKey === node.key && dragNodeKey !== node.key

            return (
              <div
                key={node.key}
                draggable={isInvestigar}
                onDragStart={isInvestigar ? (e) => { e.dataTransfer.effectAllowed = 'move'; setDragNodeKey(node.key) } : undefined}
                onDragOver={isInvestigar ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverKey(node.key) } : undefined}
                onDragLeave={isInvestigar ? () => setDragOverKey(prev => prev === node.key ? null : prev) : undefined}
                onDrop={isInvestigar ? (e) => {
                  e.preventDefault()
                  if (dragNodeKey && dragNodeKey !== node.key) {
                    const order = canvasNodes.map(n => n.key)
                    const fromIdx = order.indexOf(dragNodeKey)
                    const toIdx   = order.indexOf(node.key)
                    if (fromIdx !== -1 && toIdx !== -1) {
                      const next = [...order]
                      next.splice(fromIdx, 1)
                      next.splice(toIdx, 0, dragNodeKey)
                      saveInvestigarOrder(next)
                    }
                  }
                  setDragNodeKey(null); setDragOverKey(null)
                } : undefined}
                onDragEnd={isInvestigar ? () => { setDragNodeKey(null); setDragOverKey(null) } : undefined}
                style={{
                  borderTop: nodeIdx === 0 ? 'none' : '1px solid var(--border-subtle)',
                  opacity: isDragging ? 0.45 : 1,
                  background: isDragOver ? `${node.color}0C` : 'transparent',
                  transition: 'opacity 0.12s, background 0.1s',
                  outline: isDragOver ? `2px solid ${node.color}40` : 'none',
                  outlineOffset: '-2px',
                }}
              >
                {/* Node header row */}
                <div style={{ display: 'flex', alignItems: 'center' }}>

                  {/* Drag handle */}
                  {isInvestigar && (
                    <div
                      title="Arrastar para reordenar"
                      style={{
                        padding: '0.6rem 0.3rem 0.6rem 0.7rem',
                        cursor: 'grab', flexShrink: 0,
                        display: 'flex', alignItems: 'center',
                        color: '#C8D5E0',
                        fontSize: '0.72rem', letterSpacing: '-1px', lineHeight: 1,
                        userSelect: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#94A3B8' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#C8D5E0' }}
                    >
                      ⋮⋮
                    </div>
                  )}

                  <button
                    onClick={toggleNode}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.55rem',
                      flex: 1, background: isExpanded ? `${node.color}09` : 'transparent',
                      border: 'none', padding: '0.6rem 0.6rem 0.6rem 0.35rem',
                      cursor: items.length > 0 ? 'pointer' : 'default',
                      fontFamily: 'inherit', textAlign: 'left',
                      borderLeft: isExpanded ? `3px solid ${node.color}` : '3px solid transparent',
                      transition: 'background 0.12s, border-left-color 0.12s',
                      minWidth: 0,
                    }}
                    onMouseEnter={e => { if (!isExpanded && items.length > 0) e.currentTarget.style.background = `${node.color}06` }}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: '0.55rem', color: isExpanded ? node.color : '#94A3B8', width: '0.7rem', flexShrink: 0, lineHeight: 1 }}>
                      {items.length === 0 ? '·' : isExpanded ? '▼' : '▶'}
                    </span>
                    {nodeNum === null && <span style={{ fontSize: '0.88rem', flexShrink: 0, lineHeight: 1 }}>{node.icon}</span>}
                    {nodeNum !== null && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isExpanded ? node.color : '#94A3B8', flexShrink: 0, minWidth: '1.1rem', lineHeight: 1, letterSpacing: '-0.01em' }}>
                        {nodeNum}.
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isExpanded ? node.color : 'var(--text-primary)', flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                      {node.label}
                    </span>
                    {count > 0
                      ? <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#fff', background: node.color, borderRadius: '999px', padding: '1px 6px', flexShrink: 0 }}>{count}</span>
                      : <span style={{ fontSize: '0.6rem', color: '#CBD5E1' }}>vazio</span>
                    }
                  </button>

                  {/* Move up / down buttons */}
                  {isInvestigar && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', paddingRight: '0.5rem', flexShrink: 0 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveInvestigarNode(node.key, -1) }}
                        disabled={nodeIdx === 0}
                        title="Mover para cima"
                        style={{
                          background: 'none', border: 'none', cursor: nodeIdx === 0 ? 'default' : 'pointer',
                          color: nodeIdx === 0 ? '#E2E8F0' : '#94A3B8', fontSize: '0.6rem', padding: '1px 3px',
                          lineHeight: 1, fontFamily: 'inherit', transition: 'color 0.1s',
                        }}
                        onMouseEnter={e => { if (nodeIdx > 0) e.currentTarget.style.color = node.color }}
                        onMouseLeave={e => { e.currentTarget.style.color = nodeIdx === 0 ? '#E2E8F0' : '#94A3B8' }}
                      >▲</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveInvestigarNode(node.key, 1) }}
                        disabled={nodeIdx === canvasNodes.length - 1}
                        title="Mover para baixo"
                        style={{
                          background: 'none', border: 'none', cursor: nodeIdx === canvasNodes.length - 1 ? 'default' : 'pointer',
                          color: nodeIdx === canvasNodes.length - 1 ? '#E2E8F0' : '#94A3B8', fontSize: '0.6rem', padding: '1px 3px',
                          lineHeight: 1, fontFamily: 'inherit', transition: 'color 0.1s',
                        }}
                        onMouseEnter={e => { if (nodeIdx < canvasNodes.length - 1) e.currentTarget.style.color = node.color }}
                        onMouseLeave={e => { e.currentTarget.style.color = nodeIdx === canvasNodes.length - 1 ? '#E2E8F0' : '#94A3B8' }}
                      >▼</button>
                    </div>
                  )}
                </div>

                {/* Sub-items (level 2) */}
                {isExpanded && items.length > 0 && (
                  <div style={{ paddingLeft: '3rem', paddingBottom: '0.25rem', borderTop: `1px solid ${node.color}12` }}>
                    {items.map((item, itemIdx) => {
                      const secExpandKey     = `${node.key}:${item.sectionSlug}`
                      const isSectionExpanded = item.type === 'section' && expandedOutlineSections.has(secExpandKey)
                      const editKey          = `${node.key}:::${item.id}`
                      const isEditing        = editingOutlineCard === editKey
                      const draftKey         = `${item.sectionSlug}:${item.id}`
                      const draft            = drillDrafts[draftKey] ?? ''
                      const saving           = drillSaving === draftKey

                      // Level-3: cards inside an expanded section-group item
                      const level3Cards = isSectionExpanded ? (() => {
                        const sNav       = getSectionNavBySlug(item.sectionSlug)
                        const secData    = allSections.find(s => s.slug === item.sectionSlug)
                        const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                        return (sNav?.cards ?? []).map(c => ({
                          id: c.id,
                          label: c.title ?? c.id.replace(/_/g, ' '),
                          sectionSlug: item.sectionSlug,
                          draftKey: `${item.sectionSlug}:${c.id}`,
                          editKey: `${node.key}:::${item.sectionSlug}:::${c.id}`,
                          existing: savedCards[c.id] ?? '',
                          status: cardTextStatus(savedCards[c.id] ?? '') as DrillItem['status'],
                        }))
                      })() : []

                      return (
                        <div key={item.id}>
                          {/* Level-2 row */}
                          <div
                            onClick={() => {
                              if (item.type === 'section') {
                                setExpandedOutlineSections(prev => {
                                  const next = new Set(prev)
                                  if (next.has(secExpandKey)) { next.delete(secExpandKey) } else { next.add(secExpandKey) }
                                  return next
                                })
                              } else {
                                if (isEditing) {
                                  setEditingOutlineCard(null)
                                } else {
                                  const secData    = allSections.find(s => s.slug === item.sectionSlug)
                                  const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                                  const existing   = savedCards[item.id] ?? (item.sectionSlug === sectionDef.slug ? (cards[item.id] ?? '') : '')
                                  setDrillDrafts(d => ({ ...d, [draftKey]: d[draftKey] ?? existing }))
                                  setEditingOutlineCard(editKey)
                                }
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.5rem',
                              width: '100%',
                              background: (isEditing || isSectionExpanded) ? `${node.color}10` : 'transparent',
                              padding: '0.28rem 1rem 0.28rem 0',
                              cursor: 'pointer', userSelect: 'none',
                              borderRadius: '4px',
                              borderLeft: isSectionExpanded ? `2px solid ${node.color}55` : '2px solid transparent',
                            }}
                            onMouseEnter={e => { if (!isEditing && !isSectionExpanded) e.currentTarget.style.background = `${node.color}08` }}
                            onMouseLeave={e => { if (!isEditing && !isSectionExpanded) e.currentTarget.style.background = 'transparent' }}
                          >
                            <span style={{ fontSize: '0.5rem', flexShrink: 0, color: item.type === 'section' ? (isSectionExpanded ? node.color : '#94A3B8') : (item.status === 'reviewed' ? '#059669' : item.status === 'draft' ? '#D97706' : '#CBD5E1') }}>
                              {item.type === 'section' ? (isSectionExpanded ? '▼' : '▶') : (item.status === 'reviewed' ? '●' : item.status === 'draft' ? '◑' : '○')}
                            </span>
                            {nodeNum !== null && node.phaseGroup && item.type === 'section' && (
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: isSectionExpanded ? node.color : '#94A3B8', flexShrink: 0, letterSpacing: '-0.01em' }}>
                                {nodeNum}.{itemIdx + 1}
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: isSectionExpanded ? node.color : 'var(--text-primary)', fontWeight: item.type === 'section' ? 600 : 400, lineHeight: 1.4 }}>{item.label}</span>
                            {item.type === 'card' && HELP_CONTENT[item.id] && (
                              <HelpIcon cardId={item.id} onAskAI={onAskAI} />
                            )}
                          </div>

                          {/* Level-3: cards inside expanded section */}
                          {isSectionExpanded && (
                            <div style={{ paddingLeft: '1.4rem', borderLeft: `1px solid ${node.color}20`, marginLeft: '0.15rem' }}>
                              {level3Cards.length === 0 ? (
                                item.sectionSlug === 'texto_original' ? (() => {
                                  const txData = allSections.find(s => s.slug === 'texto_original')
                                  const txContent = txData?.content as { type?: string; passagem?: string; versos?: { ref: string; texto: string }[] } | null
                                  const passagem = txContent?.passagem?.trim()
                                    ?? txContent?.versos?.map(v => `${v.ref} ${v.texto}`.trim()).join('\n').trim()
                                  if (passagem) {
                                    const isRTL = project.testament === 'AT'
                                    return (
                                      <div style={{ padding: '0.35rem 0 0.5rem', fontSize: '0.72rem', color: 'var(--text-primary)', lineHeight: 1.75, whiteSpace: 'pre-wrap', opacity: 0.88, direction: isRTL ? 'rtl' : 'ltr', fontFamily: isRTL ? 'serif' : 'var(--font-mono, monospace)' }}>
                                        {passagem}
                                      </div>
                                    )
                                  }
                                  return (
                                    <button
                                      onClick={() => onNavigate?.('texto_original')}
                                      style={{ display: 'block', marginTop: '0.3rem', marginBottom: '0.4rem', fontSize: '0.68rem', color: node.color, background: `${node.color}12`, border: `1px solid ${node.color}30`, borderRadius: '4px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                      Carregar texto original
                                    </button>
                                  )
                                })()
                                : <div style={{ padding: '0.25rem 0 0.4rem', fontSize: '0.68rem', color: '#94A3B8', fontStyle: 'italic' }}>Nenhum campo ainda</div>
                              ) : level3Cards.map(card => {
                                const cardIsEditing = editingOutlineCard === card.editKey
                                const cardDraft     = drillDrafts[card.draftKey] ?? ''
                                const cardSaving    = drillSaving === card.draftKey
                                const hintKey = card.editKey
                                const isHintOpen = openCardHint === hintKey
                                const hintText = SINTESE_CARD_HINTS[card.id]
                                return (
                                  <div key={card.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <button
                                      onClick={() => {
                                        if (cardIsEditing) {
                                          setEditingOutlineCard(null)
                                        } else {
                                          setDrillDrafts(d => ({ ...d, [card.draftKey]: d[card.draftKey] ?? card.existing }))
                                          setEditingOutlineCard(card.editKey)
                                        }
                                      }}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                                        flex: 1, background: cardIsEditing ? `${node.color}10` : 'transparent',
                                        border: 'none', padding: '0.24rem 0.4rem 0.24rem 0',
                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', borderRadius: '4px',
                                      }}
                                      onMouseEnter={e => { if (!cardIsEditing) e.currentTarget.style.background = `${node.color}08` }}
                                      onMouseLeave={e => { if (!cardIsEditing) e.currentTarget.style.background = 'transparent' }}
                                    >
                                      <span style={{ fontSize: '0.5rem', flexShrink: 0, color: card.status === 'reviewed' ? '#059669' : card.status === 'draft' ? '#D97706' : '#CBD5E1' }}>
                                        {card.status === 'reviewed' ? '●' : card.status === 'draft' ? '◑' : '○'}
                                      </span>
                                      <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{card.label}</span>
                                    </button>
                                    {hintText && (
                                      <button
                                        onClick={e => { e.stopPropagation(); setOpenCardHint(k => k === hintKey ? null : hintKey) }}
                                        style={{ flexShrink: 0, width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${isHintOpen ? node.color : 'var(--border)'}`, background: isHintOpen ? `${node.color}15` : 'transparent', color: isHintOpen ? node.color : '#94A3B8', fontSize: '0.55rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                        title="Orientação"
                                      >
                                        ?
                                      </button>
                                    )}
                                    </div>
                                    {isHintOpen && hintText && (
                                      <div style={{ margin: '0.15rem 0 0.35rem 1rem', padding: '0.4rem 0.6rem', background: `${node.color}0d`, borderRadius: '4px', borderLeft: `2px solid ${node.color}40`, fontSize: '0.67rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                                        {hintText}
                                      </div>
                                    )}

                                    {cardIsEditing && (
                                      card.sectionSlug === 'comentario_exegetico' ? (
                                        <div style={{ marginTop: '0.35rem', marginBottom: '0.4rem' }}>
                                          <ComentarioExegeticoWorkspace
                                            inline
                                            project={project}
                                            userId={userId}
                                            existingSection={allSections.find(s => s.slug === 'comentario_exegetico')}
                                            onUpdate={onUpdate}
                                            onAskAI={onAskAI}
                                          />
                                        </div>
                                      ) : (
                                      <div style={{ paddingBottom: '0.45rem', paddingRight: '0.8rem' }}>
                                        <RichEditor
                                          compact={true}
                                          value={cardDraft}
                                          onChange={html => setDrillDrafts(d => ({ ...d, [card.draftKey]: html }))}
                                          minHeight={120}
                                          moduleColor={node.color}
                                          autoFocus
                                          sticky
                                          aiContext={{ project: aiProjectContext, phase, phaseLabel: AI_PHASE_LABEL[phase], section: card.sectionSlug, sectionLabel: node.label, field: card.id, fieldLabel: card.label, userId }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '5px', justifyContent: 'flex-end' }}>
                                          <button
                                            onClick={() => setReadingPopup({ title: card.label, html: cardDraft, color: node.color })}
                                            style={{ background: 'transparent', color: '#64748B', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                          >
                                            👁
                                          </button>
                                          <button
                                            onClick={() => setEditingOutlineCard(null)}
                                            style={{ background: 'transparent', color: '#64748B', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                          >
                                            Cancelar
                                          </button>
                                          <button
                                            disabled={cardSaving}
                                            onClick={async () => { await saveDrillCard(card.sectionSlug, card.id, cardDraft); setEditingOutlineCard(null) }}
                                            style={{ background: node.color, color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.65rem', fontWeight: 700, cursor: cardSaving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: cardSaving ? 0.6 : 1 }}
                                          >
                                            {cardSaving ? 'Salvando...' : 'Salvar'}
                                          </button>
                                        </div>
                                      </div>
                                      )
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Level-2: card inline editor */}
                          {isEditing && item.type === 'card' && (
                            <div style={{ paddingBottom: '0.45rem', paddingRight: '1rem' }}>
                              <RichEditor
                                compact={true}
                                value={draft}
                                onChange={html => setDrillDrafts(d => ({ ...d, [draftKey]: html }))}
                                minHeight={120}
                                moduleColor={node.color}
                                autoFocus
                                sticky
                                aiContext={{ project: aiProjectContext, phase, phaseLabel: AI_PHASE_LABEL[phase], section: item.sectionSlug, sectionLabel: node.label, field: item.id, fieldLabel: item.label, userId }}
                              />
                              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '5px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setReadingPopup({ title: item.label, html: draft, color: node.color })}
                                  style={{ background: 'transparent', color: '#64748B', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.66rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                  👁
                                </button>
                                <button
                                  onClick={() => setEditingOutlineCard(null)}
                                  style={{ background: 'transparent', color: '#64748B', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.66rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                  Cancelar
                                </button>
                                <button
                                  disabled={saving}
                                  onClick={async () => { await saveDrillCard(item.sectionSlug, item.id, draft); setEditingOutlineCard(null) }}
                                  style={{ background: node.color, color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.66rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}
                                >
                                  {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {isExpanded && items.length === 0 && (
                  <div style={{ padding: '0.35rem 3rem 0.5rem', fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic' }}>
                    Nenhum item ainda
                  </div>
                )}
              </div>
            )
          })
          })()}
        </div>
      )}

      {/* ── Visual ─────────────────────────────────────────────────────────── */}
      {mode === 'visual' && (
        <>
          <div ref={wrapRef} style={{ display: 'flex', gap: `${PANEL_GAP}px`, alignItems: 'flex-start' }}>

            {/* Left column: canvas + obs button */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>

            {/* Canvas — free infinite canvas */}
            <div
              ref={canvasContainerRef}
              onMouseDown={handleCanvasMD}
              onMouseMove={handleCanvasMM}
              onMouseUp={handleCanvasMU}
              onMouseLeave={handleCanvasMU}
              style={{
                position: 'relative',
                height: 'clamp(480px, calc(100vh - 310px), 800px)',
                overflow: 'hidden',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                cursor: isPanning ? 'grabbing' : 'grab',
                userSelect: 'none',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${CW}px`, height: `${CH}px`,
                transform: `translate(${viewX}px, ${viewY}px) scale(${zoom})`,
                transformOrigin: '0 0',
                willChange: 'transform',
              }}>

                {/* ── SVG Lines ── */}
                <svg
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}
                >
                  <defs>
                    {canvasNodes.map(node => {
                      const { x: nx, y: ny } = getNodePos(node)
                      return (
                        <linearGradient key={`g-${node.key}`} id={`grad-${node.key}`}
                          x1={CX} y1={CY} x2={nx} y2={ny} gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor={node.color} stopOpacity={getCount(node) > 0 ? '0.5' : '0.2'} />
                        </linearGradient>
                      )
                    })}
                    {canvasNodes.map(node => {
                      const { x: nx, y: ny } = getNodePos(node)
                      return (
                        <linearGradient key={`ga-${node.key}`} id={`grad-active-${node.key}`}
                          x1={CX} y1={CY} x2={nx} y2={ny} gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor={node.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={node.color} stopOpacity="0.9" />
                        </linearGradient>
                      )
                    })}
                  </defs>

                  {canvasNodes.map(node => {
                    const { x: nx, y: ny } = getNodePos(node)
                    const isHov = hoveredNode === node.key
                    const isAct = activePanel === node.key
                    const hasData = getCount(node) > 0

                    // Cubic bezier — control points create a gentle sweep
                    const dx   = nx - CX; const dy = ny - CY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const px   = -dy / dist; const py = dx / dist // perpendicular
                    const BEND = 18
                    const cp1x = CX + dx * 0.32 + px * BEND
                    const cp1y = CY + dy * 0.32 + py * BEND
                    const cp2x = CX + dx * 0.68 + px * BEND
                    const cp2y = CY + dy * 0.68 + py * BEND

                    return (
                      <path key={node.key}
                        d={`M ${CX} ${CY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${nx} ${ny}`}
                        stroke={isHov || isAct ? `url(#grad-active-${node.key})` : `url(#grad-${node.key})`}
                        strokeWidth={isHov || isAct ? 2 : (hasData ? 1.5 : 1)}
                        strokeDasharray={hasData ? 'none' : '5 4'}
                        fill="none"
                        strokeLinecap="round"
                        style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
                      />
                    )
                  })}
                </svg>

                {/* ── Center node ── */}
                <button onClick={onOpenBible}
                  style={{
                    position: 'absolute', left: `${CX}px`, top: `${CY}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '18px',
                    padding: '18px 28px',
                    textAlign: 'center', zIndex: 4,
                    boxShadow: '0 0 0 6px rgba(226,232,240,0.35), 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
                    minWidth: '175px',
                    cursor: onOpenBible ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    transition: 'box-shadow 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!onOpenBible) return
                    e.currentTarget.style.boxShadow = '0 0 0 8px rgba(226,232,240,0.5), 0 12px 40px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(226,232,240,0.35), 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                  }}
                >
                  <div style={{ fontSize: '1.35rem', marginBottom: '6px', lineHeight: 1 }}>
                    {isPassageMode ? '📖' : '📚'}
                  </div>
                  <div style={{
                    fontSize: isPassageMode ? '0.9rem' : '0.75rem',
                    fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2,
                    maxWidth: '150px', textAlign: 'center',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isPassageMode ? 'nowrap' : 'normal',
                    WebkitLineClamp: isPassageMode ? undefined : 3,
                    display: isPassageMode ? undefined : '-webkit-box',
                    WebkitBoxOrient: isPassageMode ? undefined : 'vertical',
                  }}>
                    {centerTitle}
                  </div>
                  {centerSub && (
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '3px', letterSpacing: '0.01em' }}>
                      {centerSub}
                    </div>
                  )}
                  {onOpenBible && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '8px', fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <BookOpen size={9} strokeWidth={2} /> abrir
                    </div>
                  )}
                  {totalItems > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.59rem', color: '#94A3B8', background: '#F1F5F9', borderRadius: '8px', padding: '1px 7px' }}>
                        {totalItems} elem.
                      </span>
                    </div>
                  )}
                </button>

                {/* ── Outer nodes ── */}
                {canvasNodes.map(node => {
                  const { x: nx, y: ny } = getNodePos(node)
                  const count   = getCount(node)
                  const hasData = count > 0
                  const isAct   = activePanel === node.key

                  return (
                    <div key={node.key}
                      style={{ position: 'absolute', left: `${nx}px`, top: `${ny}px`, transform: 'translate(-50%, -50%)', zIndex: 5 }}
                      onMouseEnter={() => setHoveredNode(node.key)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onMouseDown={e => startNodeDrag(e, node)}
                    >
                      <button
                        onClick={() => {}}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          background: isAct ? node.bg : '#FFFFFF',
                          border: `1.5px solid ${isAct ? node.color : (hasData ? node.color + '45' : '#E2E8F0')}`,
                          borderRadius: '13px',
                          padding: hasData ? '10px 16px' : '9px 15px',
                          cursor: 'pointer', minWidth: '108px',
                          fontFamily: 'inherit', userSelect: 'none',
                          boxShadow: isAct
                            ? `0 0 0 4px ${node.color}18, 0 4px 18px ${node.color}20, 0 1px 4px rgba(0,0,0,0.06)`
                            : hasData
                              ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                              : '0 1px 2px rgba(0,0,0,0.03)',
                          outline: 'none',
                          transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                          transform: isAct ? 'scale(1.06)' : 'scale(1)',
                        }}
                        onMouseEnter={e => { if (!isAct) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = hasData ? `0 4px 14px ${node.color}25, 0 1px 3px rgba(0,0,0,0.05)` : '0 2px 8px rgba(0,0,0,0.08)' } }}
                        onMouseLeave={e => { if (!isAct) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = hasData ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.03)' } }}
                      >
                        <span style={{ fontSize: '1rem', lineHeight: 1, marginBottom: '4px' }}>{node.icon}</span>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.05em',
                          textTransform: 'uppercase', textAlign: 'center',
                          color: hasData ? node.color : '#94A3B8',
                          lineHeight: 1.25,
                        }}>
                          {node.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '4px' }}>
                          {hasData && (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: node.color, background: node.color + '15', borderRadius: '20px', padding: '1px 6px', lineHeight: 1 }}>
                              {count}
                            </span>
                          )}
                          <span style={{ fontSize: '0.58rem', fontWeight: 600, color: hasData ? node.color : '#94A3B8', letterSpacing: '0.03em' }}>
                            👁 ver
                          </span>
                        </div>
                      </button>

                      {/* Expand button — shown on hover (not for phase navigation nodes) */}
                      {hoveredNode === node.key && node.kind !== 'phase' && (
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); openFloatingWindow(node) }}
                          title="Abrir como documento"
                          style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            width: '22px', height: '22px',
                            background: node.color, border: '2px solid var(--surface)',
                            borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 10, padding: 0, flexShrink: 0,
                            boxShadow: `0 2px 6px ${node.color}55`,
                          }}
                        >
                          <Maximize2 size={9} color="#fff" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── OBS overlay (bottom-left) ── */}
              {(() => {
                const isActive = activePanel === 'obs_pessoais'
                const hasData  = obsContent.length > 0
                return (
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setActivePanel(isActive ? null : 'obs_pessoais')}
                    style={{
                      position: 'absolute', bottom: '12px', left: '12px', zIndex: 20,
                      display: 'flex', alignItems: 'center', gap: '7px',
                      background: isActive ? OBS_BG : 'var(--surface)',
                      border: `1.5px solid ${isActive ? OBS_COLOR : (hasData ? OBS_COLOR + '45' : 'var(--border-subtle)')}`,
                      borderRadius: '10px', padding: '7px 12px',
                      cursor: 'pointer', fontFamily: 'inherit', userSelect: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    <span style={{ fontSize: '0.88rem', lineHeight: 1 }}>📝</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: hasData ? OBS_COLOR : '#94A3B8' }}>
                      Obs.
                    </span>
                    {hasData && (
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: OBS_COLOR, background: OBS_COLOR + '18', borderRadius: '20px', padding: '1px 6px', lineHeight: 1 }}>
                        {obsContent.length}
                      </span>
                    )}
                  </button>
                )
              })()}

              {/* ── Zoom controls (bottom-right) ── */}
              <div
                onMouseDown={e => e.stopPropagation()}
                style={{
                  position: 'absolute', bottom: '12px', right: '12px', zIndex: 20,
                  display: 'flex', alignItems: 'center', gap: '3px',
                  background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '4px 6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <button
                  onClick={fitToScreen} title="Ajustar à tela"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Minimize2 size={12} strokeWidth={2} />
                </button>
                <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
                <button
                  onClick={() => setZoom(z => Math.max(0.4, parseFloat((z - 0.25).toFixed(2))))} title="Zoom out"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Minus size={12} strokeWidth={2.5} />
                </button>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '32px', textAlign: 'center', userSelect: 'none' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(1.5, parseFloat((z + 0.25).toFixed(2))))} title="Zoom in"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '14px', lineHeight: 1, color: 'var(--text-muted)' }}>+</span>
                </button>
                <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />
                <button
                  onClick={centerMap} title="Centralizar mapa"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Crosshair size={12} strokeWidth={2} />
                </button>
              </div>

              {/* ── Drill-down popup stack ── */}
              <style>{`@keyframes fadeInPopup { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }`}</style>
              {drillStack.map((level, idx) => {
                const containerW = canvasContainerRef.current?.clientWidth ?? 700
                const containerH = canvasContainerRef.current?.clientHeight ?? 500
                const POPUP_W = 320

                // Level 0 follows the node on zoom/pan; level 1+ uses fixed position
                let popLeft: number, popTop: number
                if (level.canvasX !== undefined && level.canvasY !== undefined) {
                  const screenX = level.canvasX * zoom + viewX
                  const screenY = level.canvasY * zoom + viewY
                  const POPUP_H = 300
                  const idealLeft = screenX + 78
                  popLeft = idealLeft + POPUP_W > containerW - 8 ? screenX - POPUP_W - 78 : idealLeft
                  popTop  = Math.max(8, Math.min(containerH - POPUP_H - 8, screenY - 70))
                } else {
                  popLeft = level.fixedLeft!
                  popTop  = level.fixedTop!
                }

                // Build items for this level
                const items: DrillItem[] = level.phaseGroup
                  ? getSectionsByGroupNav(level.phaseGroup).map(s => {
                      const secData = allSections.find(sec => sec.slug === s.slug)
                      const sCards  = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                      const filled  = Object.values(sCards).filter(v => v?.trim()).length
                      const total   = s.cards?.length ?? 0
                      const status: DrillItem['status'] = filled === 0 ? 'empty' : filled >= total && total > 0 ? 'reviewed' : 'draft'
                      return { id: s.slug, label: s.shortTitle, sectionSlug: s.slug, type: 'section' as const, status }
                    })
                  : (() => {
                      const sSlug = level.sectionSlug
                      if (!sSlug) return []
                      const sNav = getSectionNavBySlug(sSlug)
                      const secData    = allSections.find(s => s.slug === sSlug)
                      const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                      const cardIds = level.cardIdsFilter ?? sNav?.cards?.map(c => c.id) ?? []
                      if (cardIds.length === 0) return []
                      return cardIds.map(cid => {
                        const navCard = sNav?.cards?.find(c => c.id === cid)
                        const vgDef   = VG_CARD_DEFS[cid]
                        const title   = navCard?.title ?? vgDef?.title ?? cid.replace(/_/g, ' ')
                        return {
                          id: cid, label: title, sectionSlug: sSlug,
                          type: 'card' as const,
                          status: cardTextStatus(savedCards[cid] ?? '') as DrillItem['status'],
                        }
                      })
                    })()

                // Progress summary for header
                const started = items.filter(i => i.status !== 'empty').length
                const done    = items.filter(i => i.status === 'reviewed').length
                const progressLabel = level.phaseGroup
                  ? `${started}/${items.length} seções iniciadas`
                  : items.length > 0 ? `${done}/${items.length} preenchidos` : ''

                const closeLevel = () => setDrillStack(prev => prev.slice(0, idx))

                const handleSectionClick = (e: React.MouseEvent<HTMLButtonElement>, item: DrillItem) => {
                  const btnRect = e.currentTarget.getBoundingClientRect()
                  const containerRect = canvasContainerRef.current!.getBoundingClientRect()
                  const POPUP_H = 300
                  const anchorRight = btnRect.right  - containerRect.left
                  const anchorTop   = btnRect.top    - containerRect.top
                  const idealLeft   = anchorRight + 6
                  const fixedLeft   = idealLeft + POPUP_W > containerW - 8
                    ? (btnRect.left - containerRect.left) - POPUP_W - 6
                    : idealLeft
                  const fixedTop    = Math.max(8, Math.min(containerH - POPUP_H - 8, anchorTop - 30))
                  setDrillStack(prev => [
                    ...prev.slice(0, idx + 1),
                    {
                      id: `${item.sectionSlug}_${Date.now()}`,
                      node: level.node,
                      title: item.label,
                      icon: '📄',
                      color: level.color,
                      bg: level.bg,
                      sectionSlug: item.sectionSlug,
                      fixedLeft,
                      fixedTop,
                      viewTab: 'view',
                    },
                  ])
                }

                const handleCardClick = (item: DrillItem) => {
                  const draftKey = `${item.sectionSlug}:${item.id}`
                  setDrillStack(prev => prev.map((l, i) => {
                    if (i !== idx) return l
                    return { ...l, editingCardId: l.editingCardId === item.id ? undefined : item.id }
                  }))
                  const secData    = allSections.find(s => s.slug === item.sectionSlug)
                  const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                  setDrillDrafts(d => ({ ...d, [draftKey]: d[draftKey] ?? (savedCards[item.id] ?? '') }))
                }

                const editingItem = level.editingCardId ? items.find(i => i.id === level.editingCardId) : null

                return (
                  <div
                    key={level.id}
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', left: `${popLeft}px`, top: `${popTop}px`,
                      width: `${POPUP_W}px`, maxHeight: '360px',
                      background: 'var(--surface, #FFFFFF)',
                      border: `1.5px solid ${level.color}45`,
                      borderLeft: `3px solid ${level.color}`,
                      borderRadius: '10px',
                      boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 2px 6px ${level.color}18`,
                      zIndex: 40 + idx, overflow: 'hidden',
                      display: 'flex', flexDirection: 'column',
                      animation: 'fadeInPopup 0.15s ease',
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: '0.62rem 0.8rem 0.5rem', background: level.bg, borderBottom: `1px solid ${level.color}18`, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.38rem', minWidth: 0 }}>
                          {idx > 0 && (
                            <button onClick={closeLevel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: level.color, fontSize: '0.9rem', lineHeight: 1, padding: '0', flexShrink: 0, opacity: 0.7 }}>‹</button>
                          )}
                          <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{level.icon}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: level.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {level.title}
                          </span>
                        </div>
                        <button onClick={() => setDrillStack([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '1rem', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                      </div>
                      {progressLabel && (
                        <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '3px' }}>{progressLabel}</div>
                      )}
                      {/* Tabs — only for card-level views (not section lists) */}
                      {level.viewTab !== undefined && (
                        <div style={{ display: 'flex', gap: '3px', marginTop: '0.45rem' }}>
                          {(['view', 'edit'] as const).map(tab => (
                            <button key={tab}
                              onClick={() => setDrillStack(prev => prev.map((l, i) => i === idx ? { ...l, viewTab: tab, editingCardId: undefined } : l))}
                              style={{
                                flex: 1, padding: '3px 0', fontSize: '0.61rem', fontWeight: 700,
                                border: `1px solid ${level.viewTab === tab ? level.color + '60' : level.color + '20'}`,
                                borderRadius: '6px',
                                background: level.viewTab === tab ? level.color + '18' : 'transparent',
                                color: level.viewTab === tab ? level.color : level.color + '80',
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                              }}
                            >
                              {tab === 'view' ? '👁 Visualizar' : '✏ Editar'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ── Visualizar (read-only) ── */}
                    {level.viewTab === 'view' && items.length > 0 && (
                      <div style={{ padding: '0.5rem 0.7rem', overflowY: 'auto', flex: 1 }}>
                        {items.map(item => {
                          const secData    = allSections.find(s => s.slug === item.sectionSlug)
                          const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                          const rawText    = savedCards[item.id] ?? ''
                          const text       = toPlainText(rawText).trim()
                          return (
                            <div key={item.id} style={{ marginBottom: '0.9rem' }}>
                              <div style={{ fontSize: '0.59rem', fontWeight: 700, color: level.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
                                {item.label}
                              </div>
                              {text ? (
                                <div style={{ fontSize: '0.71rem', lineHeight: 1.65, color: 'var(--text-primary, #334155)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {text}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontStyle: 'italic' }}>
                                  (não preenchido)
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {items.every(item => {
                          const secData    = allSections.find(s => s.slug === item.sectionSlug)
                          const savedCards = (secData?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
                          return !savedCards[item.id]?.trim()
                        }) && (
                          <button
                            onClick={() => setDrillStack(prev => prev.map((l, i) => i === idx ? { ...l, viewTab: 'edit' } : l))}
                            style={{ width: '100%', padding: '8px', background: level.color + '0D', border: `1.5px dashed ${level.color}40`, borderRadius: '8px', color: level.color, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            ✏ Começar a escrever
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── Editar ── */}
                    {(level.viewTab === 'edit' || level.viewTab === undefined) && items.length > 0 && (
                      <div style={{ padding: '0.35rem 0.5rem', overflowY: 'auto', flex: 1 }}>
                        {items.map(item => {
                          const isEditing = level.editingCardId === item.id
                          const draftKey  = `${item.sectionSlug}:${item.id}`
                          const draft     = drillDrafts[draftKey] ?? ''
                          const saving    = drillSaving === draftKey
                          return (
                            <div key={item.id}>
                              <button
                                onClick={e => item.type === 'section' ? handleSectionClick(e, item) : handleCardClick(item)}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  width: '100%', background: isEditing ? level.color + '10' : 'transparent', border: 'none',
                                  borderRadius: '6px', padding: '0.28rem 0.4rem',
                                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                }}
                                onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = level.color + '10' }}
                                onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = 'transparent' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                                  <span style={{ fontSize: '0.58rem', flexShrink: 0, lineHeight: 1, color: item.status === 'reviewed' ? '#059669' : item.status === 'draft' ? '#D97706' : '#CBD5E1' }}>
                                    {item.status === 'reviewed' ? '●' : item.status === 'draft' ? '◑' : '○'}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-primary, #334155)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.label}
                                  </span>
                                </div>
                                {item.type === 'section' && (
                                  <span style={{ fontSize: '0.7rem', color: level.color, opacity: 0.6, flexShrink: 0 }}>›</span>
                                )}
                              </button>

                              {isEditing && item.type === 'card' && (
                                <div style={{ padding: '0.35rem 0.4rem 0.4rem', borderBottom: `1px solid ${level.color}15` }}>
                                  <RichEditor
                                    compact={true}
                                    value={draft}
                                    onChange={html => setDrillDrafts(d => ({ ...d, [draftKey]: html }))}
                                    minHeight={120}
                                    moduleColor={level.color}
                                    autoFocus
                                    sticky
                                    aiContext={{ project: aiProjectContext, phase, phaseLabel: AI_PHASE_LABEL[phase], section: item.sectionSlug, sectionLabel: level.title, field: item.id, fieldLabel: item.label, userId }}
                                  />
                                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '5px', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => setReadingPopup({ title: item.label, html: draft, color: level.color })}
                                      style={{ background: 'transparent', color: '#64748B', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                      👁
                                    </button>
                                    <button
                                      onClick={() => setDrillStack(prev => prev.map((l, i) => i === idx ? { ...l, editingCardId: undefined } : l))}
                                      style={{ background: 'transparent', color: '#64748B', border: '1px solid var(--border)', borderRadius: '6px', padding: '5px 8px', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit' }}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      disabled={saving}
                                      onClick={async () => {
                                        await saveDrillCard(item.sectionSlug, item.id, draft)
                                        setDrillStack(prev => prev.map((l, i) => i === idx ? { ...l, editingCardId: undefined } : l))
                                      }}
                                      style={{ background: level.color, color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 14px', fontSize: '0.65rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}
                                    >
                                      {saving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Footer — Organizar com IA (no page navigation) */}
                    <div style={{ padding: '0.4rem 0.6rem', borderTop: `1px solid ${level.color}15`, flexShrink: 0 }}>
                      <button
                        onClick={() => { onAskAI(buildVGNodePrompt(project, level.node)); setDrillStack([]) }}
                        style={{ width: '100%', background: 'transparent', color: level.color, border: `1px solid ${level.color}35`, borderRadius: '7px', padding: '5px 8px', fontSize: '0.67rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Organizar com IA
                      </button>
                    </div>
                  </div>
                )
              })}

            </div>{/* end canvas container */}
            </div>{/* end left column */}

            {/* ── Side panel ── */}
            {activeNode && (
              <div style={{
                width: `${PANEL_W}px`, flexShrink: 0,
                background: '#FFFFFF',
                border: `1px solid ${activeNode.color}28`,
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: `0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
                animation: 'slideInRight 0.2s cubic-bezier(0.16,1,0.3,1)',
                alignSelf: 'flex-start',
                display: 'flex', flexDirection: 'column',
                maxHeight: '560px',
              }}>

                {/* Panel header */}
                <div style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: activeNode.bg,
                  borderBottom: `1px solid ${activeNode.color}18`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    {activeItem && activeNode.kind === 'cls' ? (
                      <button
                        onClick={() => setActiveItem(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeNode.color, fontSize: '0.72rem', fontWeight: 600, padding: 0, fontFamily: 'inherit' }}
                      >
                        <ChevronLeft size={13} strokeWidth={2} /> {activeNode.label}
                      </button>
                    ) : (
                      <>
                        <span style={{ fontSize: '1rem' }}>{activeNode.icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeNode.color }}>
                          {activeNode.label}
                        </span>
                        {activeNode.cardIds?.length === 1 && HELP_CONTENT[activeNode.cardIds[0]] && (
                          <HelpIcon cardId={activeNode.cardIds[0]} onAskAI={onAskAI} />
                        )}
                        {getCount(activeNode) > 0 && (
                          <span style={{ fontSize: '0.63rem', fontWeight: 700, color: activeNode.color, background: activeNode.color + '20', borderRadius: '10px', padding: '1px 7px' }}>
                            {getCount(activeNode)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button onClick={() => { setActiveItem(null); setActivePanel(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '3px', display: 'flex', borderRadius: '5px', transition: 'color 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Panel body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: activeItem && activeNode.kind === 'cls' ? '0' : '8px' }}>

                  {/* ── OBSERVAÇÕES PESSOAIS ── */}
                  {activeNode.kind === 'obs' && (
                    obsContent.length === 0 ? (
                      <div style={{ padding: '18px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.79rem', color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.5 }}>
                          Nenhuma observação registrada ainda.
                        </div>
                        <div style={{ fontSize: '0.7rem', color: OBS_COLOR, marginTop: '6px', lineHeight: 1.4 }}>
                          Preencha &quot;Leia e Assimile&quot; para ver o resumo aqui.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {obsContent.map((entry, i) => (
                          <div key={i} style={{
                            padding: '8px 10px', borderRadius: '8px',
                            background: '#F8FAFC', border: '1px solid #E2E8F0',
                          }}>
                            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: OBS_COLOR, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>
                              {entry.label}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                              {entry.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* ── DETAIL VIEW — termo selecionado ── */}
                  {activeItem && activeNode.kind === 'cls' && (() => {
                    const c     = activeItem
                    const color = activeNode.color

                    function aiBtn(kind: string, fieldKey: keyof Classification) {
                      const loading = fieldLoading[`${c.id}:${kind}`]
                      return (
                        <button
                          onClick={() => generateField(c, kind, fieldKey)}
                          disabled={loading}
                          style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: `1px solid ${color}35`, borderRadius: '4px', padding: '2px 6px', fontSize: '0.58rem', fontWeight: 600, color: loading ? '#CBD5E1' : color, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                        >
                          {loading ? <Loader2 size={8} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={8} strokeWidth={2} />}
                          {loading ? '…' : 'IA'}
                        </button>
                      )
                    }

                    function openExpand(label: string, fieldKey: keyof Classification, value: string) {
                      setExpandDraft(value)
                      setExpandMode(value.trim() ? 'view' : 'edit')
                      setExpandedField({ label, fieldKey })
                    }

                    function fieldRow(label: string, fieldKey: keyof Classification, kind: string, rows = 2, expandable = false) {
                      const val = (c[fieldKey] as string | undefined) ?? ''
                      return (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <label style={{ fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {expandable && (
                                <button
                                  onClick={() => openExpand(label, fieldKey, val)}
                                  title="Expandir"
                                  style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: `1px solid #E2E8F0`, borderRadius: '4px', padding: '2px 5px', fontSize: '0.57rem', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#94A3B8' }}
                                >
                                  <Maximize2 size={8} strokeWidth={2} /> ↗
                                </button>
                              )}
                              {aiBtn(kind, fieldKey)}
                            </div>
                          </div>
                          <textarea
                            id={`field-${fieldKey}-${c.id}`}
                            value={val}
                            rows={rows}
                            onChange={e => updateClsField(c.id, { [fieldKey]: e.target.value })}
                            placeholder="Escreva ou gere com IA…"
                            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.5 }}
                            onFocus={e => e.currentTarget.style.borderColor = color + '80'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                          />
                        </div>
                      )
                    }

                    function inputRow(label: string, fieldKey: keyof Classification) {
                      const val = (c[fieldKey] as string | undefined) ?? ''
                      return (
                        <div style={{ marginBottom: '7px' }}>
                          <label style={{ display: 'block', fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</label>
                          <input
                            value={val}
                            onChange={e => updateClsField(c.id, { [fieldKey]: e.target.value })}
                            style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                            onFocus={e => e.currentTarget.style.borderColor = color + '80'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                          />
                        </div>
                      )
                    }

                    const isAnyLoading = Object.keys(fieldLoading).some(k => k.startsWith(c.id))

                    return (
                      <div>
                        {/* Term header */}
                        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F1F5F9' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.25, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic' }}>
                            {c.selectedText}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '3px' }}>
                            v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''} · {TYPE_LABELS[c.type]}
                          </div>
                          {c.note && <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '3px', fontStyle: 'italic' }}>{c.note}</div>}
                          {/* Loading banner */}
                          {isAnyLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '6px 9px', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: '7px' }}>
                              <Loader2 size={11} strokeWidth={2} style={{ color, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.68rem', color, fontWeight: 500 }}>Gerando com IA…</span>
                            </div>
                          )}
                        </div>

                        {/* Empty state */}
                        {!c.definition && !c.explanation && !c.lexical_study && !c.theological_biblical && (
                          <div style={{ padding: '16px 14px 8px', borderBottom: '1px solid #F1F5F9' }}>
                            <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '10px', lineHeight: 1.4 }}>
                              Nenhuma explicação gerada ainda.
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <button
                                onClick={() => generateField(c, 'description', 'definition')}
                                disabled={!!fieldLoading[`${c.id}:description`]}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: color, border: 'none', borderRadius: '7px', padding: '7px 12px', fontSize: '0.73rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {fieldLoading[`${c.id}:description`] ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={11} strokeWidth={1.75} />}
                                Gerar explicação com IA
                              </button>
                              <button
                                onClick={() => generateField(c, 'lexical', 'lexical_study')}
                                disabled={!!fieldLoading[`${c.id}:lexical`]}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${color}40`, borderRadius: '7px', padding: '7px 12px', fontSize: '0.73rem', fontWeight: 600, color, cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {fieldLoading[`${c.id}:lexical`] ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : '📚'}
                                Gerar estudo lexical
                              </button>
                              <button
                                onClick={() => { /* focus definition textarea via ref would be ideal — just scroll to it */ document.getElementById(`field-definition-${c.id}`)?.focus() }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 12px', fontSize: '0.73rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                ✎ Adicionar manualmente
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Fields */}
                        <div style={{ padding: '14px' }}>
                          {fieldRow('Definição',    'definition',   'description', 2, true)}
                          {fieldRow('Explicação',   'explanation',  'analysis',    2, true)}
                          {fieldRow('Estudo Lexical', 'lexical_study', 'lexical',  3, true)}

                          {/* Original languages — single IA button generates all three */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Línguas Originais</label>
                              {aiBtn('original_term', 'original_term')}
                            </div>
                            {inputRow('Termo original', 'original_term')}
                            {inputRow('Transliteração', 'transliteration')}
                            {inputRow('Significado', 'meaning')}
                          </div>

                          {fieldRow('Uso Bíblico',      'occurrences_note',    'occurrences',          2, false)}
                          {fieldRow('Teologia Bíblica', 'theological_biblical', 'theological_biblical', 3, true)}
                          {fieldRow('Função Narrativa', 'narrative_function',   'narrative_function',   2, false)}
                          {fieldRow('Aplicações',       'applications',         'applications',         3, true)}

                          {/* Personal notes — no AI, expandable */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <label style={{ fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notas Pessoais</label>
                              <button onClick={() => openExpand('Notas Pessoais', 'personal_notes', c.personal_notes ?? '')}
                                style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '2px 5px', fontSize: '0.57rem', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#94A3B8' }}
                              ><Maximize2 size={8} strokeWidth={2} /> ↗</button>
                            </div>
                            <textarea
                              value={c.personal_notes ?? ''}
                              rows={2}
                              onChange={e => updateClsField(c.id, { personal_notes: e.target.value })}
                              placeholder="Observações livres…"
                              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.5 }}
                            />
                          </div>
                        </div>

                        {/* Detail footer — save to dictionary */}
                        <div style={{ padding: '10px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button
                            onClick={() => saveToDictionary(c)}
                            disabled={dictSaving || dictSaved}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              background: dictSaved ? '#F0FDF4' : color, border: 'none',
                              borderRadius: '8px', padding: '8px', fontSize: '0.73rem', fontWeight: 600,
                              color: dictSaved ? '#10B981' : '#FFFFFF',
                              cursor: dictSaving || dictSaved ? 'default' : 'pointer',
                              fontFamily: 'inherit', transition: 'all 0.15s',
                              opacity: dictSaving ? 0.7 : 1,
                            }}
                          >
                            {dictSaved
                              ? <><Check size={12} strokeWidth={2.5} /> Salvo no Dicionário</>
                              : dictSaving
                                ? 'Salvando…'
                                : <><BookMarked size={12} strokeWidth={1.75} /> Salvar no Dicionário Lampas</>
                            }
                          </button>
                          <button
                            onClick={() => { sendToSection(c, 'termos_chave', '2.4 Termos-Chave') }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px', fontSize: '0.7rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            → Enviar para Termos-Chave
                          </button>
                          <button
                            onClick={() => { createCollage(c) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px', fontSize: '0.7rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            📌 Adicionar às Colagens
                          </button>
                          <button
                            onClick={() => { removeCls(c.id); setActiveItem(null) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid #FEE2E2', borderRadius: '7px', padding: '5px', fontSize: '0.67rem', color: '#EF4444', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Remover classificação
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* ── LIST VIEW — cls items ── */}
                  {(!activeItem || activeNode.kind !== 'cls') && activeNode.kind === 'cls' && (() => {
                    const items = getClsItems(activeNode)
                    return items.length === 0 ? (
                      <div style={{ padding: '18px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.79rem', color: '#94A3B8', fontStyle: 'italic' }}>Nenhum item marcado ainda.</div>
                        <div style={{ fontSize: '0.7rem', color: activeNode.color, marginTop: '5px' }}>Marque palavras no Texto Bíblico.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {items.map(c => (
                          <div
                            key={c.id}
                            onClick={() => { setDictSaved(false); setActiveItem(c) }}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '8px',
                              padding: '8px 8px 8px 10px', borderRadius: '8px',
                              cursor: 'pointer', transition: 'background 0.1s',
                              background: 'transparent',
                              border: '1px solid transparent',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = activeNode.color + '18' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                          >
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeNode.color, flexShrink: 0, marginTop: '6px', opacity: 0.7 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.84rem', fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', color: '#1E293B', lineHeight: 1.4 }}>
                                {c.selectedText}
                              </div>
                              <div style={{ fontSize: '0.63rem', color: '#94A3B8', marginTop: '2px' }}>
                                v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''}{c.note ? ` · ${c.note}` : ''}
                              </div>
                              {(c.definition || c.explanation) && (
                                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748B', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {c.definition || c.explanation}
                                </div>
                              )}
                            </div>
                            {/* ⋯ — único gatilho do context menu */}
                            <button
                              onClick={e => { e.stopPropagation(); openItemMenu(e, c.id) }}
                              style={{
                                background: itemMenuState?.id === c.id ? '#F1F5F9' : 'transparent',
                                border: `1px solid ${itemMenuState?.id === c.id ? '#E2E8F0' : 'transparent'}`,
                                borderRadius: '5px', cursor: 'pointer', padding: '3px 4px',
                                display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '0px',
                                color: '#94A3B8', transition: 'all 0.1s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                              onMouseLeave={e => { if (itemMenuState?.id !== c.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' } }}
                            >
                              <MoreHorizontal size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Card textarea */}
                  {activeNode.kind === 'card' && (() => {
                    if (activeNode.sectionSlug) {
                      const linkedSection = getLinkedSection(activeNode)
                      const linkedSectionName = linkedSection?.title ?? activeNode.sectionSlug.replaceAll('_', ' ')
                      const filledEntries = getLinkedCardEntries(activeNode)
                      const summary = getNodeSummary(activeNode)

                      return (
                        <div style={{ padding: '8px 6px' }}>
                          <div style={{
                            background: activeNode.bg,
                            border: `1px solid ${activeNode.color}24`,
                            borderRadius: '9px',
                            padding: '0.65rem 0.75rem',
                            marginBottom: '0.65rem',
                          }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: activeNode.color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                              Fonte da verdade
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                              Este nó espelha {activeNode.sectionCardId ? 'um campo' : 'a seção'} "{linkedSectionName}" da barra lateral.
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.45, marginTop: '0.3rem' }}>
                              A Visão Geral apenas reflete a fonte de verdade; edite o conteúdo na seção original.
                            </div>
                          </div>

                          {filledEntries.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.55 }}>
                                {summary}
                              </div>
                              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {filledEntries.slice(0, 4).map(([key, value]) => (
                                  <div key={key} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '0.45rem 0.55rem' }}>
                                    <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                      {key.replaceAll('_', ' ')}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {toPlainText(value)}
                                    </div>
                                  </div>
                                ))}
                                {filledEntries.length > 4 && (
                                  <div style={{ fontSize: '0.66rem', color: activeNode.color, fontWeight: 700 }}>
                                    + {filledEntries.length - 4} campo{filledEntries.length - 4 !== 1 ? 's' : ''} preenchido{filledEntries.length - 4 !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '1rem 0.4rem', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.45 }}>
                                Esta seção ainda não possui conteúdo.
                              </div>
                              <div style={{ fontSize: '0.68rem', color: activeNode.color, marginTop: '0.3rem' }}>
                                Abra a seção para preencher os campos reais do estudo.
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => activeNode.sectionSlug && onNavigate?.(activeNode.sectionSlug)}
                            style={{
                              marginTop: '0.75rem',
                              width: '100%',
                              background: activeNode.color,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.55rem',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Editar em {linkedSectionName}
                          </button>
                        </div>
                      )
                    }

                    const cardId = activeNode.cardIds![0]
                    const cardMeta = VG_CARD_DEFS[cardId]
                    const draft  = cardDraft[cardId] ?? cards[cardId] ?? ''
                    const saved  = draft === (cards[cardId] ?? '')
                    return (
                      <div style={{ padding: '6px 4px' }}>
                        <RichEditor
                          compact={false}
                          value={draft}
                          onChange={html => setCardDraft(p => ({ ...p, [cardId]: html }))}
                          minHeight={180}
                          moduleColor={activeNode.color}
                          aiContext={{ project: aiProjectContext, phase, phaseLabel: AI_PHASE_LABEL[phase], section: sectionDef.slug, sectionLabel: activeNode.label, field: cardId, fieldLabel: cardMeta?.title ?? cardId, userId }}
                        />
                        <button
                          onClick={() => saveCard(cardId, draft)}
                          disabled={savingCard === cardId || saved}
                          style={{
                            marginTop: '7px', width: '100%',
                            background: saved ? '#F1F5F9' : activeNode.color,
                            color: saved ? '#94A3B8' : '#FFFFFF',
                            border: 'none', borderRadius: '8px',
                            padding: '7px', fontSize: '0.74rem', fontWeight: 600,
                            cursor: saved || savingCard === cardId ? 'default' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            opacity: savingCard === cardId ? 0.7 : 1,
                          }}
                        >
                          {savingCard === cardId ? 'Salvando…' : saved ? 'Salvo' : 'Salvar'}
                        </button>
                      </div>
                    )
                  })()}
                </div>

                {/* Panel footer — only when NOT in detail view */}
                {!(activeItem && activeNode.kind === 'cls') && (
                  <div style={{ flexShrink: 0, padding: '8px', borderTop: `1px solid ${activeNode.color}12`, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {activeNode.kind === 'cls' && (
                      <button onClick={() => onOpenBible?.()}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          background: 'transparent', border: `1px solid ${activeNode.color}30`,
                          borderRadius: '7px', padding: '7px', fontSize: '0.73rem',
                          color: activeNode.color, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = activeNode.bg }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <BookOpen size={11} strokeWidth={1.75} /> Abrir Texto Bíblico
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (activeNode.kind === 'obs') {
                          const ref = isPassageMode ? `${project.book} ${project.passage_ref}` : project.passage_ref
                          const content = obsContent.map(e => `**${e.label}**:\n${e.value}`).join('\n\n')
                          onAskAI(`Aqui estão as observações pessoais sobre ${ref}, coletadas na etapa "Leia e Assimile":\n\n${content}\n\nReorganize essas observações em três grupos, sem adicionar conteúdo novo:\n\n1. **Temas observados** — elementos, conceitos e ideias percebidos no texto\n2. **Tensões observadas** — contrastes, conflitos, questões e dificuldades notadas\n3. **Impressões iniciais** — reações, emoções, conexões e percepções pessoais\n\nMantenha rigorosamente apenas o que foi escrito. Não acrescente explicações ou conteúdo ausente nas notas.`)
                        } else if (activeNode.sectionSlug) {
                          onNavigate?.(activeNode.sectionSlug)
                        } else {
                          onAskAI(buildVGNodePrompt(project, activeNode))
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        background: 'transparent', border: '1px solid #E2E8F0',
                        borderRadius: '7px', padding: '7px', fontSize: '0.73rem',
                        color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                    >
                      {activeNode.kind === 'obs' || !activeNode.sectionSlug
                        ? <><Sparkles size={11} strokeWidth={1.75} /> Organizar com IA</>
                        : <><BookOpen size={11} strokeWidth={1.75} /> Abrir seção</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Bottom bar ── */}
          <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {nodes.filter(n => getCount(n) > 0).map(n => (
                <button key={n.key} onClick={() => setActivePanel(n.key === activePanel ? null : n.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer',
                    background: activePanel === n.key ? n.bg : '#F8FAFC',
                    border: `1px solid ${activePanel === n.key ? n.color + '50' : '#E2E8F0'}`,
                    color: activePanel === n.key ? n.color : '#64748B',
                    borderRadius: '6px', padding: '3px 9px',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (activePanel !== n.key) { e.currentTarget.style.borderColor = n.color + '40'; e.currentTarget.style.color = n.color } }}
                  onMouseLeave={e => { if (activePanel !== n.key) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' } }}
                >
                  {n.icon} {n.label} · {getCount(n)}
                </button>
              ))}
            </div>
            <button
              onClick={() => onAskAI(`Analise ${project.book} ${project.passage_ref} e organize de forma concisa: personagens principais e secundários, lugares principais, temas dominantes, conflito principal, clímax, grande ideia central.`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                background: '#FAFAFA', border: '1px solid #E2E8F0',
                borderRadius: '8px', padding: '6px 14px',
                fontSize: '0.73rem', color: '#64748B',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
            >
              <Sparkles size={11} strokeWidth={1.75} /> Organizar com IA
            </button>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ {toast}
        </div>
      )}

      {/* ── Modal de evolução das fases ── */}
      {showEvolution && evolutionData && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowEvolution(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1001,
            background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0',
            width: '100%', maxWidth: '960px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            animation: 'fadeIn 0.15s ease-out',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Evolução da Compreensão
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  {isPassageMode ? `${project.book} ${project.passage_ref}` : project.passage_ref}
                </div>
              </div>
              <button onClick={() => setShowEvolution(false)} style={{
                background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px',
                padding: '0.3rem 0.55rem', cursor: 'pointer', color: '#94A3B8', fontSize: '0.9rem',
              }}>✕</button>
            </div>

            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: '1px solid #F1F5F9', flexShrink: 0,
            }}>
              {(['preparar', 'investigar', 'pregar'] as const).map(ph => (
                <div key={ph} style={{
                  padding: '0.6rem 1rem', textAlign: 'center',
                  background: PHASE_COLOR[ph] + '08',
                  borderRight: ph !== 'pregar' ? '1px solid #F1F5F9' : 'none',
                }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: PHASE_COLOR[ph],
                  }}>
                    {ph === 'preparar' ? 'Preparar — Inicial' : ph === 'investigar' ? 'Investigar — Investigativa' : 'Pregar — Homilética'}
                  </span>
                  {!evolutionData[ph] && (
                    <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px' }}>Não iniciada</div>
                  )}
                </div>
              ))}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {nodes.filter(n => n.kind === 'card' && n.cardIds?.length).map(node => {
                const cardId = node.cardIds![0]
                const vals = {
                  preparar:   evolutionData.preparar?.[cardId] ?? '',
                  investigar: evolutionData.investigar?.[cardId] ?? '',
                  pregar:     evolutionData.pregar?.[cardId] ?? '',
                }
                const anyValue = vals.preparar || vals.investigar || vals.pregar
                if (!anyValue) return null
                return (
                  <div key={node.key} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* Row header */}
                    <div style={{
                      padding: '0.45rem 1rem', background: '#F8FAFC',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      borderBottom: '1px solid #F1F5F9',
                    }}>
                      <span style={{ fontSize: '0.75rem' }}>{node.icon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: node.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {node.label}
                      </span>
                    </div>
                    {/* 3 columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                      {(['preparar', 'investigar', 'pregar'] as const).map((ph, i) => {
                        const val = vals[ph]
                        const prevVal = ph === 'investigar' ? vals.preparar : ph === 'pregar' ? vals.investigar : null
                        const changed = prevVal !== null && val && val !== prevVal
                        const isNew   = prevVal !== null && val && !prevVal
                        return (
                          <div key={ph} style={{
                            padding: '0.75rem 1rem',
                            borderRight: i < 2 ? '1px solid #F1F5F9' : 'none',
                            background: isNew ? '#F0FDF4' : changed ? PHASE_COLOR[ph] + '05' : 'transparent',
                            minHeight: '60px',
                          }}>
                            {val ? (
                              <p style={{
                                fontSize: '0.79rem', color: changed || isNew ? '#1E293B' : '#64748B',
                                lineHeight: 1.55, margin: 0,
                                fontWeight: changed || isNew ? 500 : 400,
                              }}>
                                {val}
                              </p>
                            ) : (
                              <p style={{ fontSize: '0.72rem', color: '#CBD5E1', fontStyle: 'italic', margin: 0 }}>—</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{
              padding: '0.75rem 1.4rem', borderTop: '1px solid #F1F5F9',
              flexShrink: 0, display: 'flex', justifyContent: 'flex-end',
            }}>
              <button onClick={() => setShowEvolution(false)} style={{
                background: '#0F172A', border: 'none', borderRadius: '7px',
                padding: '0.46rem 1.15rem', color: '#FFF', fontSize: '0.81rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expand field modal ── */}
      {expandedField && activeItem && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setExpandedField(null) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: '14px', width: '100%', maxWidth: '860px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  {expandedField.label}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {activeItem.selectedText}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  {project.book} {project.passage_ref}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '7px', padding: '2px', border: '1px solid #E2E8F0' }}>
                  {(['view', 'edit'] as const).map(m => (
                    <button key={m} onClick={() => setExpandMode(m)} style={{
                      background: expandMode === m ? '#FFFFFF' : 'transparent',
                      border: `1px solid ${expandMode === m ? '#E2E8F0' : 'transparent'}`,
                      borderRadius: '5px', padding: '0.27rem 0.7rem',
                      fontSize: '0.72rem', fontWeight: expandMode === m ? 600 : 400,
                      color: expandMode === m ? '#1E293B' : '#94A3B8',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                    }}>
                      {m === 'view' ? 'Visualizar' : 'Editar'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setExpandedField(null)} style={{
                  background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px',
                  padding: '0.3rem 0.55rem', cursor: 'pointer', color: '#94A3B8',
                  fontSize: '0.9rem', lineHeight: 1,
                }}>✕</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
              {expandMode === 'view' ? (
                expandDraft.trim() ? (
                  <MarkdownRenderer content={expandDraft} />
                ) : (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.88rem' }}>
                    Campo vazio. Alterne para &ldquo;Editar&rdquo; para adicionar conteúdo.
                  </p>
                )
              ) : (
                <textarea
                  value={expandDraft}
                  onChange={e => setExpandDraft(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', minHeight: '440px',
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: '8px', padding: '0.95rem 1.1rem',
                    color: '#1E293B', fontSize: '0.91rem', lineHeight: '1.82',
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#94A3B8')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              )}
            </div>

            {/* Footer */}
            {expandMode === 'edit' && (
              <div style={{
                padding: '0.85rem 1.4rem', borderTop: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: '0.6rem', flexShrink: 0, background: '#FFFFFF',
              }}>
                <button onClick={() => setExpandedField(null)} style={{
                  background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px',
                  padding: '0.46rem 1rem', color: '#64748B', fontSize: '0.81rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Fechar
                </button>
                <button
                  onClick={() => {
                    updateClsField(activeItem.id, { [expandedField.fieldKey]: expandDraft })
                    setExpandedField(null)
                  }}
                  style={{
                    background: '#1E293B', border: 'none', borderRadius: '7px',
                    padding: '0.46rem 1.15rem', color: '#FFF', fontSize: '0.81rem',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Salvar alterações
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Item context menu (fixed — escapa overflow do painel) ── */}
      {itemMenuState && (() => {
        const c = cls.find(x => x.id === itemMenuState.id)
        if (!c) return null
        const MENU_H  = 380
        const menuX   = Math.min(Math.max(4, itemMenuState.x - 228), window.innerWidth - 232)
        const menuY   = itemMenuState.y + MENU_H > window.innerHeight ? itemMenuState.y - MENU_H : itemMenuState.y

        function mi(label: string, icon: string, action: () => void, danger?: boolean) {
          return (
            <button onClick={e => { e.stopPropagation(); action() }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'none', border: 'none', borderRadius: '5px', padding: '5px 9px', fontSize: '0.75rem', color: danger ? '#EF4444' : '#1E293B', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = danger ? '#FEF2F2' : '#F1F5F9' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ fontSize: '0.8rem', width: '16px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {label}
            </button>
          )
        }

        function sep(label: string) {
          return <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 9px 3px', marginTop: '2px' }}>{label}</div>
        }

        return (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', left: menuX, top: menuY, zIndex: 9999,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '10px', padding: '5px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              width: '224px', animation: 'fadeIn 0.1s ease-out',
            }}
          >
            {/* Preview */}
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic', padding: '3px 9px 6px', borderBottom: '1px solid #F1F5F9', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{c.selectedText}" — v.{c.startVerse}
            </div>

            {sep('IA — preenche no termo')}
            {mi('Gerar explicação com IA', '✦', () => {
              setItemMenuState(null)
              openTermDetail(c)
              generateField(c, 'description', 'definition')
            })}
            {mi('Gerar estudo lexical', '📚', () => {
              setItemMenuState(null)
              openTermDetail(c)
              generateField(c, 'lexical', 'lexical_study')
            })}
            {mi('Gerar aplicações', '🎯', () => {
              setItemMenuState(null)
              openTermDetail(c)
              generateField(c, 'applications', 'applications')
            })}

            {sep('Pesquisar')}
            {mi('Dicionário Lampas', '📖', () => { setItemMenuState(null); onNavigate?.('ferramentas_dicionario') })}
            {mi('Referências cruzadas', '🔗', () => { setItemMenuState(null); onNavigate?.('ferramentas_refs_cruzadas') })}

            {sep('Enviar para')}
            {mi('Termos-Chave', '🔑', () => sendToSection(c, 'termos_chave', '2.4 Termos-Chave'))}
            {mi('Estudo Teológico', '🧠', () => sendToSection(c, 'contexto_canonico', '3.1 Contexto Canônico'))}
            {mi('Comentário', '📖', () => sendToSection(c, 'comentario_expositivo', 'Comentário Expositivo'))}
            {mi('Colagem', '📌', () => createCollage(c))}

            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

            {sep('Gerenciar')}
            {mi('Ver no Texto Bíblico', '📖', () => { setItemMenuState(null); onOpenBible?.() })}
            {mi('Remover classificação', '🗑', () => { removeCls(c.id); setActiveItem(null) }, true)}
          </div>
        )
      })()}
    </div>

    {/* ── Floating Node Windows ───────────────────────────────────────── */}
    {floatingWindows.map(win => (
      <NodeFloatingWindow
        key={win.id}
        {...win}
        projectId={project.id}
        onClose={() => closeFloatingWindow(win.id)}
        onMinimize={() => toggleMinimizeWin(win.id)}
        onMaximize={() => toggleMaximizeWin(win.id)}
        onFocus={() => focusFloatingWindow(win.id)}
        onPositionChange={(x, y) => updateFloatPos(win.id, x, y)}
        onSizeChange={(w, h) => updateFloatSize(win.id, w, h)}
        onAskAI={onAskAI}
      />
    ))}

    {/* ── Reading popup ───────────────────────────────────────────────── */}
    {readingPopup && (
      <ReadingPopup
        title={readingPopup.title}
        html={readingPopup.html}
        moduleColor={readingPopup.color}
        onClose={() => setReadingPopup(null)}
      />
    )}

    {/* ── Consolidated branch popup ───────────────────────────────────── */}
    {consolidatedPopup && (() => {
      const cp = consolidatedPopup
      function handlePrintConsolidated() {
        const win = window.open('', '_blank')
        if (!win) return
        const allHtml = cp.sections.map(s =>
          `<h2>${s.title}</h2>${s.cards.map(c =>
            s.cards.length > 1
              ? `<h3>${c.label}</h3>${c.isPlain ? `<pre style="white-space:pre-wrap;font-family:serif">${c.html}</pre>` : `<div>${c.html}</div>`}`
              : (c.isPlain ? `<pre style="white-space:pre-wrap;font-family:serif">${c.html}</pre>` : `<div>${c.html}</div>`)
          ).join('')}`
        ).join('<hr style="margin:2em 0;border:none;border-top:1px solid #ccc"/>')
        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${cp.title}</title><style>
          body{font-family:Georgia,'Times New Roman',serif;font-size:13pt;line-height:1.8;margin:2cm;color:#1a1a1a;}
          h1{font-size:1.5em;margin:0 0 1em;}h2{font-size:1.1em;color:#334155;border-bottom:1px solid #e5e7eb;padding-bottom:0.3em;margin:1.5em 0 0.6em;}
          h3{font-size:0.9em;color:#64748b;margin:1em 0 0.3em;font-weight:600;}
          p{margin:0 0 0.8em;}ul,ol{margin:0 0 0.8em 1.2em;}li{margin-bottom:0.3em;}
          blockquote{border-left:3px solid #ccc;margin:0 0 0.9em;padding:0.5em 1em;color:#555;}
          pre{white-space:pre-wrap;font-family:inherit;}
        </style></head><body><h1>${cp.icon} ${cp.title}</h1>${allHtml}</body></html>`)
        win.document.close()
        win.print()
      }
      return (
        <div
          onClick={() => setConsolidatedPopup(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9900, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '78%', maxWidth: '960px', maxHeight: '88vh', background: 'var(--bg-primary,#fff)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.22)' }}>

            {/* Header */}
            <div style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border,#e5e7eb)', display: 'flex', alignItems: 'center', gap: '0.6rem', background: cp.bg, flexShrink: 0 }}>
              <span style={{ fontSize: '1rem' }}>{cp.icon}</span>
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 700, color: cp.color }}>{cp.title}</span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={() => { setConsolidatedPopup(null); onNavigate?.(cp.primarySlug) }}
                  style={{ padding: '0.28rem 0.6rem', fontSize: '0.72rem', background: cp.color, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  ✏ Editar
                </button>
                <button
                  onClick={handlePrintConsolidated}
                  style={{ padding: '0.28rem 0.6rem', fontSize: '0.72rem', background: 'transparent', color: 'var(--text-secondary,#64748b)', border: '1px solid var(--border,#e5e7eb)', borderRadius: '6px', cursor: 'pointer' }}>
                  🖨 Imprimir
                </button>
                <button
                  onClick={() => setConsolidatedPopup(null)}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.09)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.4rem' }}>
              {cp.sections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary,#64748b)', fontSize: '0.83rem' }}>
                  Nenhum conteúdo registrado neste bloco ainda.
                </div>
              ) : cp.sections.map((sec, si) => (
                <div key={sec.slug} style={{ marginBottom: si < cp.sections.length - 1 ? '2.2rem' : 0 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cp.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.8rem', paddingBottom: '0.35rem', borderBottom: `2px solid ${cp.color}28` }}>
                    {sec.title}
                  </div>
                  {sec.cards.map((card, ci) => (
                    <div key={ci} style={{ marginBottom: ci < sec.cards.length - 1 ? '1.4rem' : 0 }}>
                      {sec.cards.length > 1 && (
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary,#64748b)', marginBottom: '0.3rem' }}>
                          {card.label}
                        </div>
                      )}
                      {card.isPlain ? (
                        <div style={{ fontSize: '0.87rem', lineHeight: 1.8, color: 'var(--text-primary,#1e293b)', whiteSpace: 'pre-wrap', fontFamily: project.testament === 'AT' ? 'serif' : 'var(--font-mono,monospace)', direction: project.testament === 'AT' ? 'rtl' : 'ltr' }}>
                          {card.html}
                        </div>
                      ) : (
                        <div
                          className="prose-reading"
                          style={{ fontSize: '0.87rem', lineHeight: 1.8, color: 'var(--text-primary,#1e293b)' }}
                          dangerouslySetInnerHTML={{ __html: card.html }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    })()}
    </>
  )
}
