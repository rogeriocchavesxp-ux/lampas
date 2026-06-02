'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { BookOpen, Copy, ChevronDown, ChevronUp, Check, RefreshCw, Layers, ChevronLeft, MoreHorizontal, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { CollageItem } from '@/lib/collages-content'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Verse { v: number; t: string }

type ClassType =
  | 'personagem' | 'lugar' | 'termo_chave' | 'tema' | 'teologia'
  | 'tempo' | 'instituicao' | 'cargo' | 'conflito' | 'repeticao'
  | 'objetivo' | 'comentario' | 'insight' | 'observacao'

type HColor = 'yellow' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
type MenuState = 'main' | 'colors' | 'more'
type MenuCtx =
  | { kind: 'new';  pending: PendingSel }
  | { kind: 'cls';  id: string }
  | { kind: 'hl';   id: string }

interface Classification {
  id: string; type: ClassType; selectedText: string
  startVerse: number; endVerse: number
  startOffset: number; endOffset: number
  note: string; createdAt: string
}

interface HighlightMark {
  id: string; color: HColor; selectedText: string
  startVerse: number; endVerse: number
  startOffset: number; endOffset: number
  note: string; createdAt: string
}

interface PendingSel {
  startVerse: number; endVerse: number
  startOffset: number; endOffset: number
  text: string
}

interface Seg { text: string; classId: string | null; hlId: string | null; hlColor: HColor | null }

// ── Constants ─────────────────────────────────────────────────────────────────

interface ClassDef {
  emoji: string; label: string; color: string
  sectionSlug?: string; cardId?: string; sectionTitle?: string
}

const CLASS_DEF: Record<ClassType, ClassDef> = {
  personagem:  { emoji: '👤', label: 'Personagem',   color: '#D97706', sectionSlug: 'preparar_visao_geral',           cardId: 'preparar_personagens',       sectionTitle: '4. Visão Geral da Passagem' },
  lugar:       { emoji: '📍', label: 'Lugar',         color: '#10B981' },
  termo_chave: { emoji: '🔑', label: 'Termo-Chave',  color: '#F97316' },
  tema:        { emoji: '📖', label: 'Tema',          color: '#3B82F6', sectionSlug: 'preparar_visao_geral',           cardId: 'preparar_tema_provavel',      sectionTitle: '4. Visão Geral da Passagem' },
  teologia:    { emoji: '✦',  label: 'Teologia',      color: '#8B5CF6' },
  tempo:       { emoji: '📅', label: 'Tempo',         color: '#6366F1' },
  instituicao: { emoji: '🏛️', label: 'Instituição',   color: '#7C3AED' },
  cargo:       { emoji: '👑', label: 'Cargo',         color: '#F59E0B' },
  conflito:    { emoji: '⚠️', label: 'Conflito',      color: '#EF4444' },
  repeticao:   { emoji: '🔄', label: 'Repetição',    color: '#EC4899', sectionSlug: 'preparar_visao_geral',           cardId: 'preparar_palavras_repetidas', sectionTitle: '4. Visão Geral da Passagem' },
  objetivo:    { emoji: '🎯', label: 'Objetivo',      color: '#10B981' },
  comentario:  { emoji: '📝', label: 'Comentário',   color: '#64748B' },
  insight:     { emoji: '💡', label: 'Insight',       color: '#F59E0B' },
  observacao:  { emoji: '📌', label: 'Observação',   color: '#D97706', sectionSlug: 'preparar_primeiras_impressoes', cardId: 'preparar_observacoes_livres', sectionTitle: '3. Primeiras Impressões' },
}

const PRIMARY_CATS:   ClassType[] = ['personagem', 'lugar', 'termo_chave', 'tema', 'teologia']
const SECONDARY_CATS: ClassType[] = ['tempo', 'instituicao', 'cargo', 'conflito', 'repeticao', 'objetivo', 'comentario', 'insight', 'observacao']

const HCOLORS: Record<HColor, { bg: string; dot: string }> = {
  yellow: { bg: '#FEF3C7', dot: '#F59E0B' },
  blue:   { bg: '#DBEAFE', dot: '#3B82F6' },
  green:  { bg: '#DCFCE7', dot: '#10B981' },
  purple: { bg: '#EDE9FE', dot: '#8B5CF6' },
  orange: { bg: '#FFEDD5', dot: '#F97316' },
  red:    { bg: '#FEE2E2', dot: '#EF4444' },
}
const HCOLOR_ORDER: HColor[] = ['yellow', 'blue', 'green', 'purple', 'orange', 'red']

const VERSIONS = ['ARA', 'NAA', 'ACF', 'NVI', 'NTLH'] as const
type Version = typeof VERSIONS[number]

// ── Send targets ──────────────────────────────────────────────────────────────

interface SendTarget {
  key: string; label: string; sectionSlug: string
  cardId?: string; sectionTitle: string
}

const SEND_TARGETS: SendTarget[] = [
  { key: 'visao_geral',  label: 'Visão Geral',      sectionSlug: 'preparar_visao_geral',          cardId: 'preparar_grande_ideia_inicial', sectionTitle: '4. Visão Geral da Passagem' },
  { key: 'termos_chave', label: 'Termos-Chave',     sectionSlug: 'termos_chave',                   cardId: undefined,                       sectionTitle: '2.4 Termos-Chave' },
  { key: 'teologico',    label: 'Estudo Teológico', sectionSlug: 'contexto_canonico',              cardId: undefined,                       sectionTitle: '3.1 Contexto Canônico' },
  { key: 'comentario',   label: 'Comentário',       sectionSlug: 'preparar_primeiras_impressoes',  cardId: 'preparar_observacoes_livres',   sectionTitle: '3. Primeiras Impressões' },
]

// ── Storage ───────────────────────────────────────────────────────────────────

const bibk = (b: string, r: string, v: string) => `lb_${b}_${r}_${v}`.replace(/\s/g, '_')
const clsk = (p: string) => `lc_${p}`
const hlk  = (p: string) => `lh_${p}`

const rb  = (k: string): Verse[] | null => { try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
const wb  = (k: string, v: Verse[]) => { try { sessionStorage.setItem(k, JSON.stringify(v)) } catch {} }
const rcl = (p: string): Classification[] => { try { const r = localStorage.getItem(clsk(p)); return r ? JSON.parse(r) : [] } catch { return [] } }
const wcl = (p: string, v: Classification[]) => { try { localStorage.setItem(clsk(p), JSON.stringify(v)) } catch {} }
const rhl = (p: string): HighlightMark[] => { try { const r = localStorage.getItem(hlk(p)); return r ? JSON.parse(r) : [] } catch { return [] } }
const whl = (p: string, v: HighlightMark[]) => { try { localStorage.setItem(hlk(p), JSON.stringify(v)) } catch {} }

// ── DOM helpers ───────────────────────────────────────────────────────────────

function findVerse(node: Node): HTMLElement | null {
  let el: Element | null = node instanceof Element ? node : node.parentElement
  while (el) { if (el instanceof HTMLElement && el.dataset.verse) return el; el = el.parentElement }
  return null
}

function charOff(target: Node, off: number, container: Element): number {
  const w = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let t = 0
  while (w.nextNode()) { const n = w.currentNode as Text; if (n === target) return t + off; t += n.length }
  return t
}

// ── Segment builder ───────────────────────────────────────────────────────────

function buildSegs(
  vNum: number, text: string,
  cls: Classification[], hls: HighlightMark[],
): Seg[] {
  const n = text.length
  const cids = new Array<string | null>(n).fill(null)
  const hids = new Array<string | null>(n).fill(null)
  const hcol = new Array<HColor | null>(n).fill(null)

  for (const h of hls.filter(h => h.startVerse <= vNum && h.endVerse >= vNum)) {
    const s = h.startVerse === vNum ? h.startOffset : 0
    const e = h.endVerse   === vNum ? h.endOffset   : n
    for (let i = Math.max(0, s); i < Math.min(n, e); i++) { hids[i] = h.id; hcol[i] = h.color }
  }
  for (const c of cls.filter(c => c.startVerse <= vNum && c.endVerse >= vNum)) {
    const s = c.startVerse === vNum ? c.startOffset : 0
    const e = c.endVerse   === vNum ? c.endOffset   : n
    for (let i = Math.max(0, s); i < Math.min(n, e); i++) cids[i] = c.id
  }

  if (!cids.some(Boolean) && !hids.some(Boolean)) return [{ text, classId: null, hlId: null, hlColor: null }]

  const segs: Seg[] = []
  let pos = 0
  while (pos < n) {
    let end = pos + 1
    while (end < n && cids[end] === cids[pos] && hids[end] === hids[pos]) end++
    segs.push({ text: text.slice(pos, end), classId: cids[pos], hlId: hids[pos], hlColor: hcol[pos] })
    pos = end
  }
  return segs
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props { book: string; passageRef: string; testament: string; projectId: string; userId: string }

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibleTextBlock({ book, passageRef, testament, projectId, userId }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const menuRef       = useRef<HTMLDivElement>(null)
  const cardMenuRef   = useRef<HTMLDivElement>(null)
  const supabase      = useMemo(() => createClient(), [])

  // Bible
  const [version, setVersion]     = useState<Version>('ARA')
  const [verses, setVerses]       = useState<Verse[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied]       = useState(false)

  // Annotations
  const [clsList, setClsList] = useState<Classification[]>([])
  const [hlList,  setHlList]  = useState<HighlightMark[]>([])
  const [savedTo, setSavedTo] = useState<string | null>(null)

  // Panel
  const [panelOpen,  setPanelOpen]  = useState(false)
  const [panelTab,   setPanelTab]   = useState<'cls' | 'hl'>('cls')
  const [clsFilter,  setClsFilter]  = useState<ClassType | 'all'>('all')
  const [viewMode,   setViewMode]   = useState<'comfortable' | 'compact'>('comfortable')
  const [groupBy,    setGroupBy]    = useState<'none' | 'type' | 'verse'>('none')

  // Floating menu (text selection)
  const [menuCtx,   setMenuCtx]   = useState<MenuCtx | null>(null)
  const [menuPos,   setMenuPos]   = useState<{ x: number; y: number } | null>(null)
  const [menuState, setMenuState] = useState<MenuState>('main')
  const [noteVal,   setNoteVal]   = useState('')
  const [saving,    setSaving]    = useState(false)

  // Card context menu (⋯)
  const [cardMenuId,  setCardMenuId]  = useState<string | null>(null)
  const [cardMenuPos, setCardMenuPos] = useState<{ x: number; y: number } | null>(null)

  // AI results per classification
  const [aiResults,  setAiResults]  = useState<Record<string, { description?: string; analysis?: string }>>({})
  const [aiLoading,  setAiLoading]  = useState<Record<string, 'description' | 'analysis' | null>>({})
  const [sentSections, setSentSections] = useState<Record<string, string[]>>({})

  // Inline note editing in panel
  const [noteInline, setNoteInline] = useState<{ id: string; val: string } | null>(null)

  // Tooltip
  const [tooltip, setTooltip] = useState<{ id: string; rect: DOMRect } | null>(null)

  // Pre-index
  const clsById = useMemo(() => Object.fromEntries(clsList.map(c => [c.id, c])), [clsList])

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => { setClsList(rcl(projectId)); setHlList(rhl(projectId)) }, [projectId])

  // ── Fetch text ────────────────────────────────────────────────────────────
  const fetchText = useCallback(async (v: Version, force = false) => {
    const k = bibk(book, passageRef, v)
    if (!force) { const c = rb(k); if (c) { setVerses(c); setError(null); return } }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/bible/text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book, passageRef, version: v }) })
      const data = await res.json() as { verses?: Verse[]; error?: string }
      if (!res.ok || !data.verses) throw new Error(data.error ?? 'Erro')
      wb(k, data.verses); setVerses(data.verses)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro') }
    finally { setLoading(false) }
  }, [book, passageRef])

  useEffect(() => { fetchText(version) }, [fetchText, version])

  // ── Close floating menu on outside click ──────────────────────────────────
  useEffect(() => {
    if (!menuPos) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuPos])

  // ── Close card menu on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!cardMenuId) return
    const h = (e: MouseEvent) => {
      if (cardMenuRef.current && !cardMenuRef.current.contains(e.target as Node)) {
        setCardMenuId(null); setCardMenuPos(null)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [cardMenuId])

  function closeMenu() {
    setMenuPos(null); setMenuCtx(null); setMenuState('main'); setNoteVal('')
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  function handleMouseUp() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) return
    const txt = sel.toString().trim()
    if (!txt || txt.length < 2) return
    const range = sel.getRangeAt(0)
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return
    const ss = findVerse(range.startContainer), es = findVerse(range.endContainer)
    if (!ss || !es) return
    const sv = parseInt(ss.dataset.verse!), ev = parseInt(es.dataset.verse!)
    const so = charOff(range.startContainer, range.startOffset, ss)
    const eo = charOff(range.endContainer,   range.endOffset,   es)
    const rect = range.getBoundingClientRect()
    setMenuCtx({ kind: 'new', pending: { startVerse: sv, endVerse: ev, startOffset: so, endOffset: eo, text: txt } })
    setMenuState('main'); setNoteVal('')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  function handleClickCls(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const rect = (e.target as Element).getBoundingClientRect()
    setMenuCtx({ kind: 'cls', id }); setMenuState('main')
    setNoteVal(clsList.find(c => c.id === id)?.note ?? '')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
    setTooltip(null)
  }

  function handleClickHL(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const rect = (e.target as Element).getBoundingClientRect()
    setMenuCtx({ kind: 'hl', id }); setMenuState('colors')
    setNoteVal(hlList.find(h => h.id === id)?.note ?? '')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  // ── Card menu (⋯) ─────────────────────────────────────────────────────────
  function openCardMenu(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (cardMenuId === id) { setCardMenuId(null); setCardMenuPos(null); return }
    const rect = (e.currentTarget as Element).getBoundingClientRect()
    setCardMenuId(id)
    setCardMenuPos({ x: rect.right, y: rect.bottom + 4 })
  }

  // ── Save to Supabase ──────────────────────────────────────────────────────
  async function saveToSection(def: ClassDef, text: string) {
    if (!def.sectionSlug || !def.cardId) return
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', projectId).eq('slug', def.sectionSlug).maybeSingle()
      const cards = ((data?.content as { cards?: Record<string, string> } | null)?.cards) ?? {}
      const prev  = cards[def.cardId] ?? ''
      const next  = prev ? `${prev}\n${text}` : text
      const payload = { project_id: projectId, user_id: userId, slug: def.sectionSlug, module: 'inventio' as const, title: def.sectionTitle!, status: 'draft' as const, content: { cards: { ...cards, [def.cardId]: next } } }
      if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
      else          await supabase.from('sections').insert(payload)
    } catch { /* silently fail */ }
  }

  async function sendToSectionGeneric(cls: Classification, target: SendTarget) {
    const def = CLASS_DEF[cls.type]
    const line = `${def.emoji} **${def.label}**: "${cls.selectedText}" (v.${cls.startVerse})`
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', projectId).eq('slug', target.sectionSlug).maybeSingle()
      const basePayload = { project_id: projectId, user_id: userId, slug: target.sectionSlug, module: 'inventio' as const, title: target.sectionTitle, status: 'draft' as const }
      if (target.cardId) {
        const cards = ((data?.content as { cards?: Record<string, string> } | null)?.cards) ?? {}
        const prev  = cards[target.cardId] ?? ''
        const next  = prev ? `${prev}\n${line}` : line
        const payload = { ...basePayload, content: { cards: { ...cards, [target.cardId]: next } } }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      } else {
        const prev = (data?.ai_output as string | null) ?? ''
        const next = prev ? `${prev}\n\n${line}` : line
        const payload = { ...basePayload, ai_output: next }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      }
      setSentSections(prev => ({ ...prev, [cls.id]: [...(prev[cls.id] ?? []), target.key] }))
      setSavedTo(target.sectionTitle)
      setTimeout(() => setSavedTo(null), 3000)
    } catch { /* silently fail */ }
  }

  async function transformToCollage(cls: Classification) {
    const def = CLASS_DEF[cls.type]
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', projectId).eq('slug', 'colagens').maybeSingle()
      const existing = ((data?.content as { type?: string; items?: CollageItem[] } | null)?.items) ?? []
      const newItem: CollageItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        type: 'trecho',
        title: `${def.label}: "${cls.selectedText}"`,
        content: `${cls.selectedText}\n\n— ${book} ${passageRef}, v.${cls.startVerse}`,
        author: '', work: `${book} ${passageRef}`, page: `v.${cls.startVerse}`,
        tags: [def.label], category: 'Exegese', linkedTo: 'Perícope', x: 0, y: 0,
      }
      const payload = {
        project_id: projectId, user_id: userId, slug: 'colagens',
        module: 'inventio' as const, title: 'Colagens', status: 'draft' as const,
        content: { type: 'collages_workspace', items: [...existing, newItem] },
      }
      if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
      else          await supabase.from('sections').insert(payload)
      setSavedTo('Colagens')
      setTimeout(() => setSavedTo(null), 3000)
    } catch { /* silently fail */ }
  }

  // ── AI generation ─────────────────────────────────────────────────────────
  async function generateAI(cls: Classification, kind: 'description' | 'analysis') {
    setAiLoading(prev => ({ ...prev, [cls.id]: kind }))
    try {
      const res = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: cls.selectedText, type: cls.type, startVerse: cls.startVerse, book, passageRef, kind }),
      })
      const data = await res.json() as { result?: string; error?: string }
      if (data.result) {
        setAiResults(prev => ({ ...prev, [cls.id]: { ...prev[cls.id], [kind]: data.result } }))
      }
    } catch { /* ignore */ }
    finally { setAiLoading(prev => ({ ...prev, [cls.id]: null })) }
    setCardMenuId(null); setCardMenuPos(null)
  }

  // ── Scroll to verse ───────────────────────────────────────────────────────
  function scrollToVerse(startVerse: number) {
    const el = containerRef.current?.querySelector(`[data-verse="${startVerse}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setCollapsed(false)
    setCardMenuId(null); setCardMenuPos(null)
  }

  // ── Apply classification ──────────────────────────────────────────────────
  async function applyClass(type: ClassType) {
    if (!menuCtx) return
    const def = CLASS_DEF[type]
    setSaving(true)

    if (menuCtx.kind === 'new') {
      const p   = menuCtx.pending
      const cls: Classification = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), type, selectedText: p.text, startVerse: p.startVerse, endVerse: p.endVerse, startOffset: p.startOffset, endOffset: p.endOffset, note: noteVal, createdAt: new Date().toISOString() }
      const next = [...clsList, cls]; setClsList(next); wcl(projectId, next)
      if (def.sectionSlug) {
        await saveToSection(def, p.text)
        setSavedTo(def.sectionTitle ?? def.label)
        setTimeout(() => setSavedTo(null), 3000)
      }
      window.getSelection()?.removeAllRanges()
    } else if (menuCtx.kind === 'cls') {
      const next = clsList.map(c => c.id === menuCtx.id ? { ...c, type } : c)
      setClsList(next); wcl(projectId, next)
    }
    setSaving(false); closeMenu()
  }

  // ── Apply highlight ───────────────────────────────────────────────────────
  function applyHL(color: HColor) {
    if (!menuCtx) return
    if (menuCtx.kind === 'new') {
      const p  = menuCtx.pending
      const hl: HighlightMark = { id: Date.now().toString(36) + Math.random().toString(36).slice(2), color, selectedText: p.text, startVerse: p.startVerse, endVerse: p.endVerse, startOffset: p.startOffset, endOffset: p.endOffset, note: noteVal, createdAt: new Date().toISOString() }
      const next = [...hlList, hl]; setHlList(next); whl(projectId, next)
      window.getSelection()?.removeAllRanges()
    } else if (menuCtx.kind === 'hl') {
      const next = hlList.map(h => h.id === menuCtx.id ? { ...h, color } : h)
      setHlList(next); whl(projectId, next)
    }
    closeMenu()
  }

  // ── Save note ─────────────────────────────────────────────────────────────
  function saveNote() {
    if (!menuCtx || menuCtx.kind === 'new') return
    if (menuCtx.kind === 'cls') { const n = clsList.map(c => c.id === menuCtx.id ? { ...c, note: noteVal } : c); setClsList(n); wcl(projectId, n) }
    if (menuCtx.kind === 'hl')  { const n = hlList.map(h  => h.id  === menuCtx.id ? { ...h, note: noteVal } : h); setHlList(n);  whl(projectId, n) }
    closeMenu()
  }

  function saveNoteInline(id: string, val: string) {
    const n = clsList.map(c => c.id === id ? { ...c, note: val } : c)
    setClsList(n); wcl(projectId, n); setNoteInline(null)
  }

  // ── Remove ────────────────────────────────────────────────────────────────
  function remove() {
    if (!menuCtx || menuCtx.kind === 'new') return
    if (menuCtx.kind === 'cls') { const n = clsList.filter(c => c.id !== menuCtx.id); setClsList(n); wcl(projectId, n) }
    if (menuCtx.kind === 'hl')  { const n = hlList.filter(h  => h.id  !== menuCtx.id); setHlList(n);  whl(projectId, n) }
    closeMenu()
  }

  function removeCls(id: string) {
    const n = clsList.filter(c => c.id !== id); setClsList(n); wcl(projectId, n)
    setCardMenuId(null); setCardMenuPos(null)
    setAiResults(prev => { const r = { ...prev }; delete r[id]; return r })
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function copyText() {
    const plain = verses.map(v => `${v.v} ${v.t}`).join('\n')
    navigator.clipboard.writeText(`${book} ${passageRef}\n\n${plain}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const accent     = testament === 'AT' ? '#D97706' : 'var(--accent)'
  const totalAnns  = clsList.length + hlList.length
  const activeCls  = menuCtx?.kind === 'cls' ? clsById[menuCtx.id] : null
  const activeHL   = menuCtx?.kind === 'hl'  ? hlList.find(h => h.id === menuCtx.id) : null
  const previewTxt = menuCtx?.kind === 'new' ? menuCtx.pending.text : (activeCls?.selectedText ?? activeHL?.selectedText ?? '')
  const tooltipCls = tooltip ? clsById[tooltip.id] : null

  const filteredCls = clsFilter === 'all' ? clsList : clsList.filter(c => c.type === clsFilter)
  const usedTypes   = Array.from(new Set(clsList.map(c => c.type)))

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ marginBottom: '2rem', position: 'relative' }}>

      {/* Toast */}
      {savedTo && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} /> Salvo em {savedTo}
        </div>
      )}

      {/* Card */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '14px', background: '#FFFFFF', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.1rem', borderBottom: collapsed ? 'none' : '1px solid var(--border-subtle)', background: 'var(--surface)' }}>
          <BookOpen size={14} strokeWidth={1.75} style={{ color: accent, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent }}>Texto Bíblico</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{book} {passageRef}</span>
          </div>

          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {VERSIONS.map(v => (
              <button key={v} onClick={() => setVersion(v)} disabled={loading} style={{ background: version === v ? accent : 'transparent', color: version === v ? '#FFF' : 'var(--text-muted)', border: `1px solid ${version === v ? accent : 'var(--border)'}`, borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.65rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>{v}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <button onClick={() => setPanelOpen(o => !o)} title="Anotações" style={{ background: panelOpen ? 'var(--surface-2)' : 'transparent', border: `1px solid ${panelOpen ? 'var(--border)' : 'transparent'}`, borderRadius: '6px', cursor: 'pointer', color: totalAnns > 0 ? accent : 'var(--text-muted)', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 600, fontFamily: 'inherit' }}>
              <Layers size={11} strokeWidth={1.75} />{totalAnns > 0 && totalAnns}
            </button>
            <button onClick={() => fetchText(version, true)} disabled={loading} style={{ background: 'transparent', border: 'none', cursor: loading ? 'wait' : 'pointer', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={12} strokeWidth={1.75} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
            <button onClick={copyText} disabled={!verses.length} style={{ background: 'transparent', border: 'none', cursor: !verses.length ? 'not-allowed' : 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', padding: '0.25rem', borderRadius: '5px', display: 'flex', alignItems: 'center', opacity: !verses.length ? 0.4 : 1 }}>
              {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={1.75} />}
            </button>
            <button onClick={() => setCollapsed(c => !c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
              {collapsed ? <ChevronDown size={13} strokeWidth={1.75} /> : <ChevronUp size={13} strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Text body */}
        {!collapsed && (
          <div ref={containerRef} onMouseUp={handleMouseUp} style={{ padding: '1.5rem 1.5rem 1.75rem', userSelect: 'text', cursor: 'text' }}>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[100, 85, 95, 78, 90, 82, 88].map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                    <div style={{ width: '16px', height: '12px', borderRadius: '3px', background: 'var(--border)', flexShrink: 0, marginTop: '2px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: '12px', borderRadius: '3px', background: 'var(--border)', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: '0.84rem' }}>{error}</div>
            )}

            {!loading && !error && verses.length > 0 && (
              <>
                <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: '1.1rem', fontStyle: 'italic' }}>
                  Selecione um trecho para classificar ou destacar
                </p>
                <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '1.08rem', lineHeight: '1.95', color: 'var(--text-primary)', columnCount: verses.length > 22 ? 2 : 1, columnGap: '2.5rem' }}>
                  {verses.map(verse => {
                    const segs = buildSegs(verse.v, verse.t, clsList, hlList)
                    return (
                      <span key={verse.v} style={{ display: 'inline' }}>
                        <sup style={{ fontSize: '0.6rem', fontWeight: 700, color: accent, marginRight: '0.2rem', verticalAlign: 'super', lineHeight: 0, fontFamily: 'var(--font-sans)' }}>{verse.v}</sup>
                        <span data-verse={String(verse.v)}>
                          {segs.map((seg, i) => {
                            const cls  = seg.classId ? clsById[seg.classId] : null
                            const def  = cls ? CLASS_DEF[cls.type] : null
                            const hlBg = seg.hlColor ? HCOLORS[seg.hlColor].bg : undefined

                            const style: React.CSSProperties = {}
                            if (hlBg) style.background = hlBg
                            if (def)  { style.textDecoration = 'underline'; style.textDecorationColor = def.color + 'DD'; style.textUnderlineOffset = '3px'; style.textDecorationThickness = '1.5px'; style.cursor = 'pointer' }

                            return (
                              <span key={i} style={style}
                                onClick={seg.classId ? e => handleClickCls(seg.classId!, e) : seg.hlId ? e => handleClickHL(seg.hlId!, e) : undefined}
                                onMouseEnter={def && seg.classId ? e => setTooltip({ id: seg.classId!, rect: (e.target as Element).getBoundingClientRect() }) : undefined}
                                onMouseLeave={def ? () => setTooltip(null) : undefined}
                              >
                                {seg.text}
                              </span>
                            )
                          })}
                        </span>{' '}
                      </span>
                    )
                  })}
                </div>
                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'right' }}>
                  {book} {passageRef} · {version}
                </div>
              </>
            )}
          </div>
        )}

        {/* Annotations panel */}
        {panelOpen && !collapsed && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface)', padding: '1rem 1.5rem 1.25rem' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '0.85rem' }}>
              {([['cls', `Classificações (${clsList.length})`], ['hl', `Destaques (${hlList.length})`]] as const).map(([tab, label]) => (
                <button key={tab} onClick={() => setPanelTab(tab)} style={{ background: panelTab === tab ? 'var(--text-primary)' : 'transparent', color: panelTab === tab ? '#FFF' : 'var(--text-muted)', border: `1px solid ${panelTab === tab ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: '6px', padding: '0.2rem 0.65rem', fontSize: '0.67rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>{label}</button>
              ))}
            </div>

            {panelTab === 'cls' && (
              <>
                {/* ── Controls ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {/* Filter chips */}
                  {usedTypes.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                      <button onClick={() => setClsFilter('all')} style={{ background: clsFilter === 'all' ? 'var(--accent)' : 'transparent', color: clsFilter === 'all' ? '#FFF' : 'var(--text-muted)', border: `1px solid ${clsFilter === 'all' ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '6px', padding: '0.12rem 0.45rem', fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Todos</button>
                      {usedTypes.map(t => (
                        <button key={t} onClick={() => setClsFilter(t)} style={{ background: clsFilter === t ? CLASS_DEF[t].color : 'transparent', color: clsFilter === t ? '#FFF' : 'var(--text-muted)', border: `1px solid ${clsFilter === t ? CLASS_DEF[t].color : 'var(--border)'}`, borderRadius: '6px', padding: '0.12rem 0.45rem', fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {CLASS_DEF[t].emoji} {CLASS_DEF[t].label}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* View mode toggle */}
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0, marginLeft: usedTypes.length === 0 ? 'auto' : undefined }}>
                    {(['comfortable', 'compact'] as const).map(m => (
                      <button key={m} onClick={() => setViewMode(m)} style={{ background: viewMode === m ? 'var(--text-primary)' : 'transparent', color: viewMode === m ? '#FFF' : 'var(--text-muted)', border: `1px solid ${viewMode === m ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: '6px', padding: '0.12rem 0.45rem', fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {m === 'comfortable' ? 'Confortável' : 'Compacto'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Grouping (shown when ≥4 items) ── */}
                {clsList.length >= 4 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>Agrupar:</span>
                    {(['none', 'type', 'verse'] as const).map(g => (
                      <button key={g} onClick={() => setGroupBy(g)} style={{ background: groupBy === g ? 'var(--surface-2)' : 'transparent', color: groupBy === g ? 'var(--text-primary)' : 'var(--text-muted)', border: `1px solid ${groupBy === g ? 'var(--border)' : 'transparent'}`, borderRadius: '5px', padding: '0.1rem 0.4rem', fontSize: '0.6rem', fontWeight: groupBy === g ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {g === 'none' ? 'Nenhum' : g === 'type' ? 'Categoria' : 'Versículo'}
                      </button>
                    ))}
                  </div>
                )}

                {/* ── List ── */}
                {filteredCls.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Selecione trechos e classifique para extrair para o estudo.</p>
                ) : (() => {
                  const sorted = [...filteredCls].sort((a, b) => a.startVerse - b.startVerse)

                  // build groups
                  let groups: Array<{ key: string; label: string; items: Classification[] }>
                  if (groupBy === 'type') {
                    const map: Record<string, Classification[]> = {}
                    for (const c of sorted) { if (!map[c.type]) map[c.type] = []; map[c.type].push(c) }
                    groups = Object.entries(map).map(([type, items]) => ({ key: type, label: `${CLASS_DEF[type as ClassType].emoji} ${CLASS_DEF[type as ClassType].label}`, items }))
                  } else if (groupBy === 'verse') {
                    const map: Record<number, Classification[]> = {}
                    for (const c of sorted) { if (!map[c.startVerse]) map[c.startVerse] = []; map[c.startVerse].push(c) }
                    groups = Object.entries(map).sort(([a], [b]) => Number(a) - Number(b)).map(([v, items]) => ({ key: `v${v}`, label: `v.${v}`, items }))
                  } else {
                    groups = [{ key: 'all', label: '', items: sorted }]
                  }

                  const compact = viewMode === 'compact'
                  const cardPad = compact ? '8px 10px 8px 14px' : '12px 10px 12px 16px'
                  const textSize = compact ? '0.8rem' : '0.88rem'
                  const emojiSize = compact ? '0.85rem' : '1rem'

                  return (
                    <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
                      {groups.map(group => (
                        <div key={group.key}>
                          {/* Group header */}
                          {group.label && (
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 2px', marginBottom: '4px', marginTop: '4px' }}>
                              {group.label} <span style={{ fontWeight: 400, opacity: 0.7 }}>({group.items.length})</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {group.items.map(c => {
                              const def       = CLASS_DEF[c.type]
                              const aiRes     = aiResults[c.id]
                              const isAiLoad  = aiLoading[c.id]
                              const sent      = sentSections[c.id] ?? []
                              const isEditing = noteInline?.id === c.id

                              return (
                                <div
                                  key={c.id}
                                  style={{ borderRadius: '10px', border: '1px solid var(--border)', background: '#FFFFFF', minHeight: '64px' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: cardPad }}>

                                    {/* Emoji */}
                                    <span style={{ fontSize: emojiSize, flexShrink: 0, lineHeight: 1, marginTop: '2px' }}>{def.emoji}</span>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>

                                      {/* Header: label + verse */}
                                      <div style={{ fontSize: '0.67rem', fontWeight: 700, color: def.color, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}>
                                        {def.label} · v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''}
                                      </div>

                                      {/* Selected text */}
                                      <div style={{ fontSize: textSize, fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.55, fontFamily: "'EB Garamond', Georgia, serif", marginTop: compact ? '3px' : '5px', wordBreak: 'break-word', overflowWrap: 'break-word', textDecoration: `underline ${def.color}`, textUnderlineOffset: '2px', textDecorationThickness: '1px' }}>
                                        {c.selectedText}
                                      </div>

                                      {/* Note */}
                                      {isEditing ? (
                                        <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                                          <input
                                            autoFocus
                                            type="text"
                                            value={noteInline.val}
                                            onChange={e => setNoteInline({ id: c.id, val: e.target.value })}
                                            onKeyDown={e => { if (e.key === 'Enter') saveNoteInline(c.id, noteInline.val); if (e.key === 'Escape') setNoteInline(null) }}
                                            placeholder="Adicionar nota..."
                                            style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-primary)', padding: '0.22rem 0.45rem', fontSize: '0.73rem', outline: 'none', fontFamily: 'inherit' }}
                                          />
                                          <button onClick={() => saveNoteInline(c.id, noteInline.val)} style={{ background: 'var(--accent)', border: 'none', borderRadius: '5px', color: '#FFF', padding: '0.22rem 0.5rem', fontSize: '0.67rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>OK</button>
                                          <button onClick={() => setNoteInline(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-muted)', padding: '0.22rem 0.4rem', fontSize: '0.67rem', cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
                                        </div>
                                      ) : c.note ? (
                                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.4 }}>{c.note}</div>
                                      ) : null}

                                      {/* AI loading */}
                                      {isAiLoad && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                          <Loader2 size={11} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} />
                                          {isAiLoad === 'description' ? 'Gerando descrição…' : 'Gerando análise…'}
                                        </div>
                                      )}

                                      {/* AI results */}
                                      {(aiRes?.description || aiRes?.analysis) && (
                                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          {aiRes.description && (
                                            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '7px', padding: '7px 10px' }}>
                                              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <Sparkles size={9} strokeWidth={2} /> Descrição
                                              </div>
                                              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{aiRes.description}</p>
                                            </div>
                                          )}
                                          {aiRes.analysis && (
                                            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '7px', padding: '7px 10px' }}>
                                              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                <Sparkles size={9} strokeWidth={2} /> Análise
                                              </div>
                                              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{aiRes.analysis}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Sent-to badges */}
                                      {sent.length > 0 && (
                                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '6px' }}>
                                          {sent.map(k => {
                                            const t = SEND_TARGETS.find(x => x.key === k)
                                            return t ? (
                                              <span key={k} style={{ fontSize: '0.6rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', borderRadius: '4px', padding: '2px 6px', fontWeight: 500 }}>
                                                ✓ {t.label}
                                              </span>
                                            ) : null
                                          })}
                                        </div>
                                      )}
                                    </div>

                                    {/* ⋯ menu button — always visible, right-aligned */}
                                    <button
                                      onClick={e => openCardMenu(c.id, e)}
                                      style={{ background: cardMenuId === c.id ? 'var(--surface-2)' : 'transparent', border: `1px solid ${cardMenuId === c.id ? 'var(--border)' : 'transparent'}`, borderRadius: '5px', cursor: 'pointer', color: cardMenuId === c.id ? 'var(--text-primary)' : 'var(--text-muted)', padding: '4px 5px', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'all 0.1s', alignSelf: 'flex-start' }}
                                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                      onMouseLeave={e => { if (cardMenuId !== c.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
                                    >
                                      <MoreHorizontal size={13} strokeWidth={1.75} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </>
            )}

            {panelTab === 'hl' && (
              hlList.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>Selecione trechos e escolha 🎨 Destacar para marcar o texto.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '320px', overflowY: 'auto' }}>
                  {[...hlList].sort((a, b) => a.startVerse - b.startVerse).map(h => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: '8px', background: HCOLORS[h.color].bg, border: `1px solid ${HCOLORS[h.color].dot}25`, borderLeft: `3px solid ${HCOLORS[h.color].dot}` }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.67rem', fontWeight: 700, color: HCOLORS[h.color].dot, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
                          v.{h.startVerse}{h.endVerse !== h.startVerse ? `–${h.endVerse}` : ''}
                        </div>
                        <div style={{ fontSize: '0.84rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: "'EB Garamond', Georgia, serif" }}>
                          {h.selectedText}
                        </div>
                        {h.note && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{h.note}</div>}
                      </div>
                      <button onClick={() => { const n = hlList.filter(x => x.id !== h.id); setHlList(n); whl(projectId, n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0, lineHeight: 1, flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>×</button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ── Card context menu (⋯) ─────────────────────────────────────────── */}
      {cardMenuId && cardMenuPos && (() => {
        const cls = clsById[cardMenuId]
        if (!cls) return null
        const def  = CLASS_DEF[cls.type]
        const sent = sentSections[cardMenuId] ?? []

        return (
          <div
            ref={cardMenuRef}
            style={{
              position: 'fixed',
              left: cardMenuPos.x,
              top: cardMenuPos.y,
              transform: 'translateX(-100%)',
              zIndex: 9990,
              background: 'var(--surface, #FFFFFF)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.3rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              width: '210px',
              animation: 'fadeIn 0.1s ease-out',
            }}
          >
            {/* ─ Navigation ─ */}
            <CardMenuItem
              label="Ver no texto bíblico"
              icon="↑"
              onClick={() => scrollToVerse(cls.startVerse)}
            />

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />

            {/* ─ Edit ─ */}
            <CardMenuItem
              label="Editar classificação"
              icon={def.emoji}
              onClick={() => {
                setCardMenuId(null); setCardMenuPos(null)
                const el = document.querySelector(`[data-verse="${cls.startVerse}"]`)
                if (el) {
                  const rect = el.getBoundingClientRect()
                  setMenuCtx({ kind: 'cls', id: cls.id }); setMenuState('main')
                  setNoteVal(cls.note ?? '')
                  setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
                }
              }}
            />
            <CardMenuItem
              label={cls.note ? 'Editar nota' : 'Adicionar nota'}
              icon="📝"
              onClick={() => {
                setCardMenuId(null); setCardMenuPos(null)
                setNoteInline({ id: cls.id, val: cls.note ?? '' })
              }}
            />

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />

            {/* ─ AI ─ */}
            <CardMenuItem
              label="Gerar descrição com IA"
              icon="✦"
              accent="#8B5CF6"
              disabled={aiLoading[cardMenuId] !== null && aiLoading[cardMenuId] !== undefined}
              onClick={() => generateAI(cls, 'description')}
            />
            <CardMenuItem
              label="Gerar análise com IA"
              icon="✦"
              accent="#6366F1"
              disabled={aiLoading[cardMenuId] !== null && aiLoading[cardMenuId] !== undefined}
              onClick={() => generateAI(cls, 'analysis')}
            />

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />

            {/* ─ Send to ─ */}
            {SEND_TARGETS.map(target => {
              const isSent = sent.includes(target.key)
              return (
                <CardMenuItem
                  key={target.key}
                  label={isSent ? `Atualizar em ${target.label}` : `Enviar para ${target.label}`}
                  icon={isSent ? '✓' : '→'}
                  accent={isSent ? '#10B981' : undefined}
                  onClick={async () => {
                    setCardMenuId(null); setCardMenuPos(null)
                    await sendToSectionGeneric(cls, target)
                  }}
                />
              )
            })}

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />

            {/* ─ Transform ─ */}
            <CardMenuItem
              label="Transformar em Colagem"
              icon="🗂️"
              onClick={async () => {
                setCardMenuId(null); setCardMenuPos(null)
                await transformToCollage(cls)
              }}
            />

            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />

            {/* ─ Delete ─ */}
            <CardMenuItem
              label="Remover classificação"
              icon="✕"
              danger
              onClick={() => removeCls(cls.id)}
            />
          </div>
        )
      })()}

      {/* ── Floating menu (text selection) ────────────────────────────────── */}
      {menuPos && menuCtx && (
        <div ref={menuRef} style={{ position: 'fixed', left: menuPos.x, top: menuPos.y, transform: 'translate(-50%, calc(-100% - 6px))', zIndex: 9999, background: '#18181B', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)', width: '208px', animation: 'fadeIn 0.12s ease-out' }}>

          {/* Preview */}
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: '0 0 0.4rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingBottom: '0.35rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingLeft: '0.3rem' }}>
            "{previewTxt.slice(0, 28)}{previewTxt.length > 28 ? '…' : ''}"
          </p>

          {/* MAIN state */}
          {menuState === 'main' && (
            <>
              {PRIMARY_CATS.map(type => {
                const def = CLASS_DEF[type]
                const isActive = activeCls?.type === type
                return (
                  <button key={type} onClick={() => applyClass(type)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: isActive ? `${def.color}25` : 'transparent', border: 'none', borderRadius: '7px', padding: '0.38rem 0.5rem', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'background 0.1s', textAlign: 'left' }}
                    onMouseEnter={e => { e.currentTarget.style.background = isActive ? `${def.color}35` : 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${def.color}25` : 'transparent' }}
                  >
                    <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>{def.emoji}</span>
                    <span style={{ fontSize: '0.78rem', color: isActive ? def.color : 'rgba(255,255,255,0.85)', fontWeight: isActive ? 600 : 400 }}>{def.label}</span>
                  </button>
                )
              })}

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.25rem 0' }} />

              <button onClick={() => setMenuState('colors')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', borderRadius: '7px', padding: '0.38rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '0.8rem' }}>🎨</span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Destacar</span>
              </button>

              {menuCtx.kind === 'new' && (
                <button onClick={() => setMenuState('more')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', borderRadius: '7px', padding: '0.38rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>⋯</span>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Mais opções</span>
                </button>
              )}
            </>
          )}

          {/* COLORS state */}
          {menuState === 'colors' && (
            <>
              <button onClick={() => setMenuState('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontFamily: 'inherit', padding: '0.2rem 0.3rem', borderRadius: '5px', marginBottom: '0.3rem' }}>
                <ChevronLeft size={11} /> Voltar
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', padding: '0.2rem 0.1rem' }}>
                {HCOLOR_ORDER.map(c => {
                  const hc = HCOLORS[c]
                  const isActive = activeHL?.color === c
                  return (
                    <button key={c} onClick={() => applyHL(c)} title={c} style={{ width: '26px', height: '26px', borderRadius: '50%', background: hc.bg, border: `2.5px solid ${isActive ? hc.dot : hc.dot + '50'}`, cursor: 'pointer', transition: 'transform 0.1s', boxShadow: isActive ? `0 0 0 2px ${hc.dot}30` : 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                    />
                  )
                })}
              </div>
            </>
          )}

          {/* MORE state */}
          {menuState === 'more' && (
            <>
              <button onClick={() => setMenuState('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontFamily: 'inherit', padding: '0.2rem 0.3rem', borderRadius: '5px', marginBottom: '0.3rem' }}>
                <ChevronLeft size={11} /> Voltar
              </button>
              {SECONDARY_CATS.map(type => {
                const def = CLASS_DEF[type]
                return (
                  <button key={type} onClick={() => applyClass(type)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', borderRadius: '7px', padding: '0.35rem 0.5rem', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>{def.emoji}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>{def.label}</span>
                  </button>
                )
              })}
            </>
          )}

          {/* Note input */}
          <div style={{ marginTop: '0.35rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <input type="text" value={noteVal} onChange={e => setNoteVal(e.target.value)} placeholder="Nota opcional..." onKeyDown={e => { if (e.key === 'Enter' && menuCtx.kind !== 'new') saveNote() }}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '0.3rem 0.5rem', fontSize: '0.73rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* Existing annotation actions */}
          {menuCtx.kind !== 'new' && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '0.3rem' }}>
              <button onClick={remove} style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: '6px', padding: '0.28rem 0', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}>Remover</button>
              <button onClick={saveNote} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', padding: '0.28rem 0', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}>Salvar nota</button>
            </div>
          )}

          {/* Saving indicator */}
          {saving && <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', margin: '0.3rem 0 0', textAlign: 'center' }}>Salvando…</p>}

          {/* Arrow */}
          <div style={{ position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #18181B' }} />
        </div>
      )}

      {/* ── Tooltip ───────────────────────────────────────────────────────── */}
      {tooltipCls && tooltip && (
        <div style={{ position: 'fixed', left: tooltip.rect.left + tooltip.rect.width / 2, top: tooltip.rect.bottom + 6, transform: 'translateX(-50%)', zIndex: 9997, background: '#18181B', color: '#FFF', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxWidth: '220px' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
            {CLASS_DEF[tooltipCls.type].emoji} {CLASS_DEF[tooltipCls.type].label}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem' }}>
            v.{tooltipCls.startVerse} · "{tooltipCls.selectedText.slice(0, 32)}{tooltipCls.selectedText.length > 32 ? '…' : ''}"
          </div>
          {clsList.filter(c => c.type === tooltipCls.type).length > 1 && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '0.15rem' }}>
              {clsList.filter(c => c.type === tooltipCls.type).length} ocorrências
            </div>
          )}
          <div style={{ position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid #18181B' }} />
        </div>
      )}
    </div>
  )
}

// ── CardMenuItem helper ───────────────────────────────────────────────────────

function CardMenuItem({
  label, icon, accent, danger, disabled, onClick,
}: {
  label: string; icon: string; accent?: string; danger?: boolean; disabled?: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = danger ? 'var(--error)' : accent ?? 'var(--text-primary)'
  const bg    = hovered ? (danger ? 'rgba(239,68,68,0.06)' : 'var(--surface-2)') : 'transparent'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        width: '100%', background: bg, border: 'none', borderRadius: '6px',
        padding: '0.32rem 0.5rem', cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.08s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: '0.75rem', lineHeight: 1, color, width: '14px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.77rem', color, lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}
