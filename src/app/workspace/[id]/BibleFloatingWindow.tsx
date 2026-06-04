'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { BookOpen, Copy, Check, RefreshCw, ChevronLeft, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { OriginalVerse } from '@/lib/original-text'
import { saveClassificationToDB, deleteClassificationFromDB, loadClassificationsFromDB } from '@/lib/classification-sync'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Verse { v: number; t: string }

type ClassType =
  | 'personagem' | 'lugar' | 'termo_chave' | 'tema' | 'teologia'
  | 'tempo' | 'instituicao' | 'cargo' | 'conflito' | 'repeticao'
  | 'objetivo' | 'comentario' | 'insight' | 'observacao'

type HColor = 'yellow' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
type MenuState = 'main' | 'colors' | 'more'
type ViewMode = 'pt' | 'orig' | 'side' | 'interlinear'
type MenuCtx = { kind: 'new'; pending: PendingSel } | { kind: 'cls'; id: string } | { kind: 'hl'; id: string }

interface Classification {
  id: string; type: ClassType; selectedText: string
  startVerse: number; endVerse: number; startOffset: number; endOffset: number
  note: string; createdAt: string
}

interface HighlightMark {
  id: string; color: HColor; selectedText: string
  startVerse: number; endVerse: number; startOffset: number; endOffset: number
  note: string; createdAt: string
}

interface PendingSel {
  startVerse: number; endVerse: number; startOffset: number; endOffset: number; text: string
}

interface Seg { text: string; classId: string | null; hlId: string | null; hlColor: HColor | null }

// ── Constants ─────────────────────────────────────────────────────────────────

interface ClassDef { emoji: string; label: string; color: string; sectionSlug?: string; cardId?: string; sectionTitle?: string }

const CLASS_DEF: Record<ClassType, ClassDef> = {
  personagem:  { emoji: '👤', label: 'Personagem',   color: '#D97706', sectionSlug: 'preparar_visao_geral', cardId: 'preparar_personagens',       sectionTitle: '4. Visão Geral' },
  lugar:       { emoji: '📍', label: 'Lugar',         color: '#10B981' },
  termo_chave: { emoji: '🔑', label: 'Termo-Chave',  color: '#F97316' },
  tema:        { emoji: '📖', label: 'Tema',          color: '#3B82F6', sectionSlug: 'preparar_visao_geral', cardId: 'preparar_tema_provavel',      sectionTitle: '4. Visão Geral' },
  teologia:    { emoji: '✦',  label: 'Teologia',      color: '#8B5CF6' },
  tempo:       { emoji: '📅', label: 'Tempo',         color: '#6366F1' },
  instituicao: { emoji: '🏛️', label: 'Instituição',   color: '#7C3AED' },
  cargo:       { emoji: '👑', label: 'Cargo',         color: '#F59E0B' },
  conflito:    { emoji: '⚠️', label: 'Conflito',      color: '#EF4444' },
  repeticao:   { emoji: '🔄', label: 'Repetição',    color: '#EC4899', sectionSlug: 'preparar_visao_geral', cardId: 'preparar_palavras_repetidas', sectionTitle: '4. Visão Geral' },
  objetivo:    { emoji: '🎯', label: 'Objetivo',      color: '#10B981' },
  comentario:  { emoji: '📝', label: 'Comentário',   color: '#64748B' },
  insight:     { emoji: '💡', label: 'Insight',       color: '#F59E0B' },
  observacao:  { emoji: '📌', label: 'Observação',   color: '#D97706', sectionSlug: 'preparar_primeiras_impressoes', cardId: 'preparar_observacoes_livres', sectionTitle: '3. Impressões' },
}

const PRIMARY_CATS:   ClassType[] = ['personagem', 'lugar', 'termo_chave', 'tema', 'teologia']
const SECONDARY_CATS: ClassType[] = ['tempo', 'instituicao', 'cargo', 'conflito', 'repeticao', 'objetivo', 'comentario', 'insight', 'observacao']

const HCOLORS: Record<HColor, { bg: string; dot: string }> = {
  yellow: { bg: '#FEF3C7', dot: '#F59E0B' }, blue:   { bg: '#DBEAFE', dot: '#3B82F6' },
  green:  { bg: '#DCFCE7', dot: '#10B981' }, purple: { bg: '#EDE9FE', dot: '#8B5CF6' },
  orange: { bg: '#FFEDD5', dot: '#F97316' }, red:    { bg: '#FEE2E2', dot: '#EF4444' },
}
const HCOLOR_ORDER: HColor[] = ['yellow', 'blue', 'green', 'purple', 'orange', 'red']
const VERSIONS = ['ARA', 'NAA', 'ACF', 'NVI', 'NTLH'] as const
type Version = typeof VERSIONS[number]

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'pt',          label: 'Português'  },
  { id: 'orig',        label: 'Original'   },
  { id: 'side',        label: 'Lado a Lado'},
  { id: 'interlinear', label: 'Interlinear'},
]

const DEFAULT_W = 520
const DEFAULT_H = 600
const MIN_W = 340, MAX_W = 960, MIN_H = 320, MAX_H = 920

// ── Storage helpers ───────────────────────────────────────────────────────────

const bibk = (b: string, r: string, v: string) => `lb_${b}_${r}_${v}`.replace(/\s/g, '_')
const origk = (b: string, r: string) => `lo_${b}_${r}`.replace(/\s/g, '_')
const clsk = (p: string) => `lc_${p}`
const hlk  = (p: string) => `lh_${p}`

const rb  = (k: string): Verse[] | null => { try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
const wb  = (k: string, v: Verse[]) => { try { sessionStorage.setItem(k, JSON.stringify(v)) } catch {} }
const rog = (k: string): OriginalVerse[] | null => { try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
const wog = (k: string, v: OriginalVerse[]) => { try { sessionStorage.setItem(k, JSON.stringify(v)) } catch {} }
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

function buildSegs(vNum: number, text: string, cls: Classification[], hls: HighlightMark[]): Seg[] {
  const n = text.length
  const cids = new Array<string | null>(n).fill(null)
  const hids = new Array<string | null>(n).fill(null)
  const hcol = new Array<HColor | null>(n).fill(null)
  for (const h of hls.filter(h => h.startVerse <= vNum && h.endVerse >= vNum)) {
    const s = h.startVerse === vNum ? h.startOffset : 0; const e = h.endVerse === vNum ? h.endOffset : n
    for (let i = Math.max(0, s); i < Math.min(n, e); i++) { hids[i] = h.id; hcol[i] = h.color }
  }
  for (const c of cls.filter(c => c.startVerse <= vNum && c.endVerse >= vNum)) {
    const s = c.startVerse === vNum ? c.startOffset : 0; const e = c.endVerse === vNum ? c.endOffset : n
    for (let i = Math.max(0, s); i < Math.min(n, e); i++) cids[i] = c.id
  }
  if (!cids.some(Boolean) && !hids.some(Boolean)) return [{ text, classId: null, hlId: null, hlColor: null }]
  const segs: Seg[] = []; let pos = 0
  while (pos < n) {
    let end = pos + 1
    while (end < n && cids[end] === cids[pos] && hids[end] === hids[pos]) end++
    segs.push({ text: text.slice(pos, end), classId: cids[pos], hlId: hids[pos], hlColor: hcol[pos] })
    pos = end
  }
  return segs
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  book: string; passageRef: string; testament: string
  projectId: string; userId: string; onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibleFloatingWindow({ book, passageRef, testament, projectId, userId, onClose }: Props) {
  const textRef  = useRef<HTMLDivElement>(null)
  const menuRef  = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const isAT  = testament === 'AT'
  const accent = isAT ? '#D97706' : '#3B82F6'
  const origLang = isAT ? 'Hebraico' : 'Grego'

  // Window geometry
  const [pos,       setPos]       = useState({ x: 0, y: 64 })
  const [size,      setSize]      = useState({ w: DEFAULT_W, h: DEFAULT_H })
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [isHoveringTraffic, setIsHoveringTraffic] = useState(false)
  const posRef  = useRef(pos); const sizeRef = useRef(size)
  posRef.current = pos; sizeRef.current = size

  // View mode
  const [viewMode,   setViewMode]   = useState<ViewMode>('pt')

  // Bible — Portuguese
  const [version,  setVersion]  = useState<Version>('ACF')
  const [verses,   setVerses]   = useState<Verse[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [copied,   setCopied]   = useState(false)

  // Bible — Original
  const [origVerses,  setOrigVerses]  = useState<OriginalVerse[]>([])
  const [origLoading, setOrigLoading] = useState(false)
  const [origError,   setOrigError]   = useState<string | null>(null)

  // Annotations
  const [clsList, setClsList] = useState<Classification[]>([])
  const [hlList,  setHlList]  = useState<HighlightMark[]>([])
  const [savedTo, setSavedTo] = useState<string | null>(null)
  const [panelOpen,  setPanelOpen]  = useState(false)
  const [panelTab,   setPanelTab]   = useState<'cls' | 'hl'>('cls')
  const [clsFilter,  setClsFilter]  = useState<ClassType | 'all'>('all')

  // Menu
  const [menuCtx,   setMenuCtx]   = useState<MenuCtx | null>(null)
  const [menuPos,   setMenuPos]   = useState<{ x: number; y: number } | null>(null)
  const [menuState, setMenuState] = useState<MenuState>('main')
  const [noteVal,   setNoteVal]   = useState('')
  const [saving,    setSaving]    = useState(false)

  const [tooltip, setTooltip] = useState<{ id: string; rect: DOMRect } | null>(null)
  const clsById = useMemo(() => Object.fromEntries(clsList.map(c => [c.id, c])), [clsList])

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sp = localStorage.getItem('lampas_bible_pos')
    const ss = localStorage.getItem('lampas_bible_size')
    const sm = localStorage.getItem('lampas_bible_mode') as ViewMode | null
    if (sp) setPos(JSON.parse(sp))
    else    setPos({ x: Math.max(40, window.innerWidth - DEFAULT_W - 40), y: 64 })
    if (ss) setSize(JSON.parse(ss))
    if (sm) setViewMode(sm)
  }, [])

  useEffect(() => {
    const local = rcl(projectId)
    setClsList(local)
    setHlList(rhl(projectId))
    loadClassificationsFromDB(projectId).then(fromDB => {
      if (fromDB.length === 0) return
      const dbIds = new Set(fromDB.map(c => c.id))
      const merged = [...fromDB, ...local.filter(c => !dbIds.has(c.id))] as Classification[]
      setClsList(merged); wcl(projectId, merged)
    })
  }, [projectId])

  // ── Fetch Portuguese ──────────────────────────────────────────────────────
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

  // ── Fetch Original ────────────────────────────────────────────────────────
  const fetchOriginal = useCallback(async (force = false) => {
    const k = origk(book, passageRef)
    if (!force) { const c = rog(k); if (c) { setOrigVerses(c); setOrigError(null); return } }
    setOrigLoading(true); setOrigError(null)
    try {
      const res  = await fetch('/api/bible/original', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book, passageRef, testament, originalLanguage: origLang }) })
      const data = await res.json() as { verses?: OriginalVerse[]; error?: string }
      if (!res.ok || !data.verses) throw new Error(data.error ?? 'Texto original não disponível')
      wog(k, data.verses); setOrigVerses(data.verses)
    } catch (e) { setOrigError(e instanceof Error ? e.message : 'Erro') }
    finally { setOrigLoading(false) }
  }, [book, passageRef, testament, origLang])

  useEffect(() => {
    if (viewMode !== 'pt') fetchOriginal()
  }, [viewMode, fetchOriginal])

  // ── View mode persist ─────────────────────────────────────────────────────
  function changeViewMode(m: ViewMode) {
    setViewMode(m)
    localStorage.setItem('lampas_bible_mode', m)
  }

  // ── Close menu outside click ──────────────────────────────────────────────
  useEffect(() => {
    if (!menuPos) return
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuPos])

  function closeMenu() { setMenuPos(null); setMenuCtx(null); setMenuState('main'); setNoteVal('') }

  // ── Drag ─────────────────────────────────────────────────────────────────
  function onTitleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0 || maximized) return; e.preventDefault()
    const sx = e.clientX, sy = e.clientY, px = posRef.current.x, py = posRef.current.y
    const onMove = (ev: MouseEvent) => {
      setPos({ x: Math.max(0, Math.min(window.innerWidth - sizeRef.current.w - 4, px + ev.clientX - sx)), y: Math.max(0, Math.min(window.innerHeight - 60, py + ev.clientY - sy)) })
    }
    const onUp = () => { localStorage.setItem('lampas_bible_pos', JSON.stringify(posRef.current)); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function onResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    const sx = e.clientX, sy = e.clientY, sw = sizeRef.current.w, sh = sizeRef.current.h
    const onMove = (ev: MouseEvent) => setSize({ w: Math.max(MIN_W, Math.min(MAX_W, sw + ev.clientX - sx)), h: Math.max(MIN_H, Math.min(MAX_H, sh + ev.clientY - sy)) })
    const onUp = () => { localStorage.setItem('lampas_bible_size', JSON.stringify(sizeRef.current)); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }

  // ── Text selection ────────────────────────────────────────────────────────
  function handleMouseUp() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) return
    const txt = sel.toString().trim()
    if (!txt || txt.length < 2) return
    const range = sel.getRangeAt(0)
    if (!textRef.current?.contains(range.commonAncestorContainer)) return
    const ss = findVerse(range.startContainer), es = findVerse(range.endContainer)
    if (!ss || !es) return
    const rect = range.getBoundingClientRect()
    setMenuCtx({ kind: 'new', pending: { startVerse: parseInt(ss.dataset.verse!), endVerse: parseInt(es.dataset.verse!), startOffset: charOff(range.startContainer, range.startOffset, ss), endOffset: charOff(range.endContainer, range.endOffset, es), text: txt } })
    setMenuState('main'); setNoteVal('')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  function handleClickCls(id: string, e: React.MouseEvent) {
    e.stopPropagation(); const rect = (e.target as Element).getBoundingClientRect()
    setMenuCtx({ kind: 'cls', id }); setMenuState('main'); setNoteVal(clsList.find(c => c.id === id)?.note ?? '')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 }); setTooltip(null)
  }

  // ── Supabase save ─────────────────────────────────────────────────────────
  async function saveToSection(def: ClassDef, text: string) {
    if (!def.sectionSlug || !def.cardId) return
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', projectId).eq('slug', def.sectionSlug).maybeSingle()
      const cards = ((data?.content as { cards?: Record<string, string> } | null)?.cards) ?? {}
      const prev  = cards[def.cardId] ?? ''
      const payload = { project_id: projectId, user_id: userId, slug: def.sectionSlug, module: 'inventio' as const, title: def.sectionTitle!, status: 'draft' as const, content: { cards: { ...cards, [def.cardId]: prev ? `${prev}\n${text}` : text } } }
      if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
      else          await supabase.from('sections').insert(payload)
    } catch { /* noop */ }
  }

  // ── Apply classification ──────────────────────────────────────────────────
  async function applyClass(type: ClassType) {
    if (!menuCtx) return
    const def = CLASS_DEF[type]; setSaving(true)
    if (menuCtx.kind === 'new') {
      const p   = menuCtx.pending
      const cls: Classification = { id: crypto.randomUUID(), type, selectedText: p.text, startVerse: p.startVerse, endVerse: p.endVerse, startOffset: p.startOffset, endOffset: p.endOffset, note: noteVal, createdAt: new Date().toISOString() }
      const next = [...clsList, cls]; setClsList(next); wcl(projectId, next)
      saveClassificationToDB(cls, projectId, userId)
      if (def.sectionSlug) { await saveToSection(def, p.text); setSavedTo(def.sectionTitle ?? def.label); setTimeout(() => setSavedTo(null), 3000) }
      window.getSelection()?.removeAllRanges()
    } else if (menuCtx.kind === 'cls') {
      const next = clsList.map(c => c.id === menuCtx.id ? { ...c, type } : c)
      setClsList(next); wcl(projectId, next)
    }
    setSaving(false); closeMenu()
  }

  function applyHL(color: HColor) {
    if (!menuCtx) return
    if (menuCtx.kind === 'new') {
      const p  = menuCtx.pending
      const hl: HighlightMark = { id: crypto.randomUUID(), color, selectedText: p.text, startVerse: p.startVerse, endVerse: p.endVerse, startOffset: p.startOffset, endOffset: p.endOffset, note: noteVal, createdAt: new Date().toISOString() }
      const next = [...hlList, hl]; setHlList(next); whl(projectId, next)
      window.getSelection()?.removeAllRanges()
    } else if (menuCtx.kind === 'hl') {
      const next = hlList.map(h => h.id === menuCtx.id ? { ...h, color } : h)
      setHlList(next); whl(projectId, next)
    }
    closeMenu()
  }

  function saveNote() {
    if (!menuCtx || menuCtx.kind === 'new') return
    if (menuCtx.kind === 'cls') { const n = clsList.map(c => c.id === menuCtx.id ? { ...c, note: noteVal } : c); setClsList(n); wcl(projectId, n) }
    if (menuCtx.kind === 'hl')  { const n = hlList.map(h  => h.id  === menuCtx.id ? { ...h, note: noteVal } : h); setHlList(n);  whl(projectId, n) }
    closeMenu()
  }

  function remove() {
    if (!menuCtx || menuCtx.kind === 'new') return
    if (menuCtx.kind === 'cls') { const n = clsList.filter(c => c.id !== menuCtx.id); setClsList(n); wcl(projectId, n); deleteClassificationFromDB(menuCtx.id) }
    if (menuCtx.kind === 'hl')  { const n = hlList.filter(h  => h.id  !== menuCtx.id); setHlList(n);  whl(projectId, n) }
    closeMenu()
  }

  function copyText() {
    const plain = verses.map(v => `${v.v} ${v.t}`).join('\n')
    navigator.clipboard.writeText(`${book} ${passageRef}\n\n${plain}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalAnns   = clsList.length + hlList.length
  const activeCls   = menuCtx?.kind === 'cls' ? clsById[menuCtx.id] : null
  const activeHL    = menuCtx?.kind === 'hl'  ? hlList.find(h => h.id === menuCtx.id) : null
  const previewTxt  = menuCtx?.kind === 'new' ? menuCtx.pending.text : (activeCls?.selectedText ?? activeHL?.selectedText ?? '')
  const tooltipCls  = tooltip ? clsById[tooltip.id] : null
  const usedTypes   = Array.from(new Set(clsList.map(c => c.type)))
  const filteredCls = clsFilter === 'all' ? clsList : clsList.filter(c => c.type === clsFilter)
  const needsOrig   = viewMode !== 'pt'

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderPtVerse(verse: Verse) {
    const segs = buildSegs(verse.v, verse.t, clsList, hlList)
    return (
      <span key={verse.v} style={{ display: 'inline' }}>
        <sup style={{ fontSize: '0.56rem', fontWeight: 700, color: accent, marginRight: '0.18rem', verticalAlign: 'super', lineHeight: 0, fontFamily: 'var(--font-sans)' }}>{verse.v}</sup>
        <span data-verse={String(verse.v)}>
          {segs.map((seg, i) => {
            const cls = seg.classId ? clsById[seg.classId] : null
            const def = cls ? CLASS_DEF[cls.type] : null
            const hlBg = seg.hlColor ? HCOLORS[seg.hlColor].bg : undefined
            const style: React.CSSProperties = {}
            if (hlBg) style.background = hlBg
            if (def)  { style.textDecoration = 'underline'; style.textDecorationColor = def.color + 'DD'; style.textUnderlineOffset = '3px'; style.textDecorationThickness = '1.5px'; style.cursor = 'pointer' }
            return (
              <span key={i} style={style}
                onClick={seg.classId ? e => handleClickCls(seg.classId!, e) : undefined}
                onMouseEnter={def && seg.classId ? e => setTooltip({ id: seg.classId!, rect: (e.target as Element).getBoundingClientRect() }) : undefined}
                onMouseLeave={def ? () => setTooltip(null) : undefined}
              >{seg.text}</span>
            )
          })}
        </span>{' '}
      </span>
    )
  }

  function renderOrigVerse(ov: OriginalVerse) {
    return (
      <div key={ov.verse} style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.56rem', fontWeight: 700, color: accent, fontFamily: 'var(--font-sans)', display: 'block', marginBottom: '4px' }}>v.{ov.verse}</span>
        <p data-verse={String(ov.verse)} style={{ fontFamily: "'SBL Hebrew', 'Ezra SIL', 'Times New Roman', serif", fontSize: isAT ? '1.3rem' : '1.15rem', lineHeight: 1.9, direction: isAT ? 'rtl' : 'ltr', color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: isAT ? '0.02em' : '0.01em' }}>
          {ov.original}
        </p>
        {ov.transliteration && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: '#64748B', fontStyle: 'italic', margin: '0 0 4px', lineHeight: 1.6 }}>{ov.transliteration}</p>
        )}
      </div>
    )
  }

  function renderSideBySide() {
    const ptMap = Object.fromEntries(verses.map(v => [v.v, v]))
    const allVerses = origVerses.length > 0 ? origVerses : verses.map(v => ({ verse: v.v, original: '', transliteration: '', userTranslation: v.t, notes: '' }))
    return (
      <div style={{ display: 'grid', gridTemplateColumns: isAT ? '1fr 1fr' : '1fr 1fr', gap: '0', height: '100%' }}>
        {/* Português */}
        <div style={{ padding: '1rem', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Português · {version}</div>
          <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: '1.85', color: 'var(--text-primary)' }}>
            {verses.map(v => renderPtVerse(v))}
          </div>
        </div>
        {/* Original */}
        <div style={{ padding: '1rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{origLang}</div>
          {origLoading ? <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Carregando…</div>
          : origError ? <div style={{ fontSize: '0.8rem', color: 'var(--error)' }}>{origError}</div>
          : origVerses.length === 0 ? (
            // Fallback: mostra pt nos dois lados
            <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '0.95rem', lineHeight: '1.85', color: 'var(--text-secondary)' }}>
              {verses.map(v => (<span key={v.v} style={{ display: 'inline' }}><sup style={{ fontSize: '0.56rem', fontWeight: 700, color: accent, fontFamily: 'var(--font-sans)' }}>{v.v}</sup> {v.t}{' '}</span>))}
            </div>
          ) : (
            origVerses.map(ov => {
              const pt = ptMap[ov.verse]
              return (
                <div key={ov.verse} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.56rem', fontWeight: 700, color: accent, fontFamily: 'var(--font-sans)', display: 'block', marginBottom: '3px' }}>v.{ov.verse}</span>
                  <p data-verse={String(ov.verse)} style={{ fontFamily: "'SBL Hebrew', 'Ezra SIL', 'Times New Roman', serif", fontSize: isAT ? '1.1rem' : '1rem', direction: isAT ? 'rtl' : 'ltr', lineHeight: 1.8, color: 'var(--text-primary)', margin: '0 0 3px' }}>{ov.original}</p>
                  {ov.transliteration && <p style={{ fontSize: '0.7rem', color: '#64748B', fontStyle: 'italic', margin: '0 0 3px', lineHeight: 1.5 }}>{ov.transliteration}</p>}
                  {pt && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic' }}>{pt.t}</p>}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  function renderInterlinear() {
    if (origLoading) return <div style={{ padding: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Carregando texto original…</div>
    if (origError)   return <div style={{ padding: '1.25rem', fontSize: '0.82rem', color: 'var(--error)' }}>{origError}</div>
    if (origVerses.length === 0) return <div style={{ padding: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Texto original não disponível para esta passagem.</div>

    const ptMap = Object.fromEntries(verses.map(v => [v.v, v.t]))

    return (
      <div style={{ padding: '1.25rem 1rem 2rem' }}>
        {origVerses.map(ov => {
          const origWords = (ov.original ?? '').split(/\s+/).filter(Boolean)
          const translitWords = (ov.transliteration ?? '').split(/\s+/).filter(Boolean)

          return (
            <div key={ov.verse} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              {/* Verse number */}
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)', marginBottom: '0.75rem' }}>
                {book} {passageRef} · v.{ov.verse}
              </div>

              {/* Words */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', direction: isAT ? 'rtl' : 'ltr', marginBottom: '0.75rem' }}>
                {origWords.map((word, wi) => (
                  <div key={wi} data-verse={String(ov.verse)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 8px', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', minWidth: '48px', cursor: 'text' }}>
                    {/* Original */}
                    <span style={{ fontFamily: "'SBL Hebrew', 'Ezra SIL', 'Times New Roman', serif", fontSize: isAT ? '1.15rem' : '1rem', color: 'var(--text-primary)', lineHeight: 1.4, direction: isAT ? 'rtl' : 'ltr', display: 'block', textAlign: 'center' }}>{word}</span>
                    {/* Transliteração */}
                    {translitWords[wi] && (
                      <span style={{ fontSize: '0.62rem', color: '#64748B', fontStyle: 'italic', marginTop: '3px', lineHeight: 1.2, textAlign: 'center' }}>{translitWords[wi]}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Tradução do versículo */}
              {ptMap[ov.verse] && (
                <div style={{ borderLeft: `2px solid ${accent}40`, paddingLeft: '10px' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', fontFamily: 'var(--font-sans)' }}>{version}</div>
                  <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>{ptMap[ov.verse]}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ── Minimized ─────────────────────────────────────────────────────────────

  if (minimized) {
    return (
      <div style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 500, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', cursor: 'default', animation: 'fadeIn 0.15s ease-out' }}>
        <BookOpen size={13} strokeWidth={1.75} style={{ color: accent }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{book} {passageRef}</span>
        <button onClick={() => setMinimized(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0 0.1rem', lineHeight: 1, fontFamily: 'inherit' }}>▲</button>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '0 0.1rem', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
      </div>
    )
  }

  const windowStyle: React.CSSProperties = maximized
    ? { position: 'fixed', top: '8px', left: '8px', right: '8px', bottom: '8px', width: 'auto', height: 'auto' }
    : { position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h }

  return (
    <>
      {savedTo && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} /> Salvo em {savedTo}
        </div>
      )}

      <div style={{ ...windowStyle, zIndex: 500, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: maximized ? '0' : '14px', boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeInScale 0.18s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* ── Chrome header ── */}
        <div onMouseDown={onTitleMouseDown} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderBottom: '1px solid var(--border-subtle)', cursor: maximized ? 'default' : 'move', userSelect: 'none' }}>

          {/* Row 1: traffic + title + controls */}
          <div style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0 0.85rem' }}>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onMouseEnter={() => setIsHoveringTraffic(true)} onMouseLeave={() => setIsHoveringTraffic(false)}>
              {[{ color: '#FF5F56', action: onClose, sym: '×' }, { color: '#FFBE2E', action: () => setMinimized(true), sym: '–' }, { color: '#27C840', action: () => setMaximized(m => !m), sym: maximized ? '⤡' : '⤢' }].map(({ color, action, sym }) => (
                <button key={color} onMouseDown={e => e.stopPropagation()} onClick={action} style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: 'rgba(0,0,0,0.6)', padding: 0, lineHeight: 1 }}>
                  {isHoveringTraffic ? sym : ''}
                </button>
              ))}
            </div>

            <BookOpen size={12} strokeWidth={1.75} style={{ color: accent, flexShrink: 0 }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {book} {passageRef}
                <span style={{ marginLeft: '6px', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>{testament} · {origLang}</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }} onMouseDown={e => e.stopPropagation()}>
              {/* Version — only show when in pt or side mode */}
              {(viewMode === 'pt' || viewMode === 'side') && VERSIONS.map(v => (
                <button key={v} onClick={() => setVersion(v)} disabled={loading} style={{ background: version === v ? accent : 'transparent', color: version === v ? '#FFF' : 'var(--text-muted)', border: `1px solid ${version === v ? accent : 'var(--border)'}`, borderRadius: '5px', padding: '0.13rem 0.38rem', fontSize: '0.58rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>{v}</button>
              ))}
              <button onClick={() => setPanelOpen(o => !o)} style={{ background: panelOpen ? 'var(--surface-2)' : 'transparent', border: `1px solid ${panelOpen ? 'var(--border)' : 'transparent'}`, borderRadius: '5px', cursor: 'pointer', color: totalAnns > 0 ? accent : 'var(--text-muted)', padding: '0.13rem 0.38rem', display: 'flex', alignItems: 'center', gap: '0.22rem', fontSize: '0.58rem', fontWeight: 600, fontFamily: 'inherit' }}>
                <Layers size={9} strokeWidth={1.75} />{totalAnns > 0 && totalAnns}
              </button>
              <button onClick={copyText} disabled={!verses.length} style={{ background: 'transparent', border: 'none', cursor: !verses.length ? 'not-allowed' : 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', padding: '0.18rem', borderRadius: '4px', display: 'flex', alignItems: 'center', opacity: !verses.length ? 0.4 : 1 }}>
                {copied ? <Check size={10} strokeWidth={2} /> : <Copy size={10} strokeWidth={1.75} />}
              </button>
              <button onClick={() => { fetchText(version, true); if (needsOrig) fetchOriginal(true) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.18rem', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={10} strokeWidth={1.75} style={{ animation: (loading || origLoading) ? 'spin 0.8s linear infinite' : 'none' }} />
              </button>
            </div>
          </div>

          {/* Row 2: view mode tabs */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--border-subtle)', padding: '0 0.85rem' }} onMouseDown={e => e.stopPropagation()}>
            {VIEW_MODES.map(m => (
              <button key={m.id} onClick={() => changeViewMode(m.id)}
                style={{ padding: '5px 10px', fontSize: '0.65rem', fontWeight: viewMode === m.id ? 700 : 500, color: viewMode === m.id ? accent : 'var(--text-muted)', background: 'transparent', border: 'none', borderBottom: `2px solid ${viewMode === m.id ? accent : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Text body ── */}
        <div ref={textRef} onMouseUp={handleMouseUp} style={{ flex: 1, overflow: viewMode === 'side' ? 'hidden' : 'auto', userSelect: 'text', cursor: 'text' }}>

          {/* PORTUGUÊS */}
          {viewMode === 'pt' && (
            <div style={{ padding: '1.15rem 1.25rem 1.5rem' }}>
              {loading && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>{[100, 82, 93].map((w, i) => (<div key={i} style={{ height: '11px', borderRadius: '3px', background: 'var(--border)', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />))}</div>}
              {!loading && error && <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: '0.82rem' }}>{error}</div>}
              {!loading && !error && verses.length > 0 && (
                <>
                  <p style={{ fontSize: '0.61rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontStyle: 'italic' }}>Selecione um trecho para classificar ou destacar</p>
                  <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '1.05rem', lineHeight: '1.9', color: 'var(--text-primary)' }}>
                    {verses.map(v => renderPtVerse(v))}
                  </div>
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.55rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.64rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'right' }}>{book} {passageRef} · {version}</div>
                </>
              )}
            </div>
          )}

          {/* ORIGINAL */}
          {viewMode === 'orig' && (
            <div style={{ padding: '1.15rem 1.25rem 1.5rem' }}>
              {origLoading && <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>{[100, 82, 93].map((w, i) => (<div key={i} style={{ height: '14px', borderRadius: '3px', background: 'var(--border)', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite' }} />))}</div>}
              {!origLoading && origError && <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: '0.82rem' }}>{origError}</div>}
              {!origLoading && !origError && origVerses.length > 0 && (
                <>
                  <p style={{ fontSize: '0.61rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontStyle: 'italic' }}>{origLang} · Selecione para classificar</p>
                  {origVerses.map(ov => renderOrigVerse(ov))}
                </>
              )}
            </div>
          )}

          {/* LADO A LADO */}
          {viewMode === 'side' && renderSideBySide()}

          {/* INTERLINEAR */}
          {viewMode === 'interlinear' && renderInterlinear()}
        </div>

        {/* ── Annotations panel ── */}
        {panelOpen && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface)', padding: '0.75rem 1rem 0.85rem', flexShrink: 0, maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              {([['cls', `Cls. (${clsList.length})`], ['hl', `Dest. (${hlList.length})`]] as const).map(([tab, label]) => (
                <button key={tab} onClick={() => setPanelTab(tab)} style={{ background: panelTab === tab ? 'var(--text-primary)' : 'transparent', color: panelTab === tab ? '#FFF' : 'var(--text-muted)', border: `1px solid ${panelTab === tab ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: '5px', padding: '0.13rem 0.5rem', fontSize: '0.61rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>
              ))}
              {panelTab === 'cls' && usedTypes.map(t => (
                <button key={t} onClick={() => setClsFilter(prev => prev === t ? 'all' : t)} style={{ background: clsFilter === t ? CLASS_DEF[t].color : 'transparent', color: clsFilter === t ? '#FFF' : 'var(--text-muted)', border: `1px solid ${clsFilter === t ? CLASS_DEF[t].color : 'var(--border)'}`, borderRadius: '5px', padding: '0.13rem 0.42rem', fontSize: '0.58rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{CLASS_DEF[t].emoji}</button>
              ))}
            </div>
            {panelTab === 'cls' && (
              filteredCls.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', fontStyle: 'italic' }}>Nenhuma classificação ainda.</p>
              : [...filteredCls].sort((a, b) => a.startVerse - b.startVerse).map(c => {
                const def = CLASS_DEF[c.type]
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', flexShrink: 0 }}>{def.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: def.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{def.label} · v.{c.startVerse}</div>
                      <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-secondary)', fontFamily: "'EB Garamond', Georgia, serif" }}>{c.selectedText}</div>
                    </div>
                    <button onClick={() => { const n = clsList.filter(x => x.id !== c.id); setClsList(n); wcl(projectId, n); deleteClassificationFromDB(c.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', padding: 0, lineHeight: 1 }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>×</button>
                  </div>
                )
              })
            )}
            {panelTab === 'hl' && (
              hlList.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', fontStyle: 'italic' }}>Nenhum destaque ainda.</p>
              : [...hlList].sort((a, b) => a.startVerse - b.startVerse).map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: HCOLORS[h.color].dot, flexShrink: 0, marginTop: '3px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: HCOLORS[h.color].dot }}>v.{h.startVerse}</div>
                    <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-secondary)', fontFamily: "'EB Garamond', Georgia, serif", background: HCOLORS[h.color].bg, padding: '0 2px', borderRadius: '2px' }}>{h.selectedText}</div>
                  </div>
                  <button onClick={() => { const n = hlList.filter(x => x.id !== h.id); setHlList(n); whl(projectId, n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', padding: 0, lineHeight: 1 }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>×</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Resize handle */}
        {!maximized && (
          <div onMouseDown={onResizeMouseDown} style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', cursor: 'se-resize', background: 'linear-gradient(135deg, transparent 50%, var(--border) 50%)', borderRadius: '0 0 14px 0', opacity: 0.5 }} />
        )}
      </div>

      {/* ── Annotation menu ── */}
      {menuPos && menuCtx && (
        <div ref={menuRef} style={{ position: 'fixed', left: menuPos.x, top: menuPos.y, transform: 'translate(-50%, calc(-100% - 6px))', zIndex: 9999, background: '#18181B', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', width: '208px', animation: 'fadeIn 0.12s ease-out' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: '0 0 0.35rem 0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingBottom: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            "{previewTxt.slice(0, 28)}{previewTxt.length > 28 ? '…' : ''}"
          </p>

          {menuState === 'main' && (
            <>
              {PRIMARY_CATS.map(type => { const def = CLASS_DEF[type]; const isActive = activeCls?.type === type; return (
                <button key={type} onClick={() => applyClass(type)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: isActive ? `${def.color}25` : 'transparent', border: 'none', borderRadius: '7px', padding: '0.36rem 0.5rem', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = isActive ? `${def.color}35` : 'rgba(255,255,255,0.08)' }} onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${def.color}25` : 'transparent' }}>
                  <span style={{ fontSize: '0.78rem' }}>{def.emoji}</span>
                  <span style={{ fontSize: '0.76rem', color: isActive ? def.color : 'rgba(255,255,255,0.85)', fontWeight: isActive ? 600 : 400 }}>{def.label}</span>
                </button>
              )})}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0.2rem 0' }} />
              <button onClick={() => setMenuState('colors')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', borderRadius: '7px', padding: '0.36rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: '0.78rem' }}>🎨</span><span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.7)' }}>Destacar</span>
              </button>
              {menuCtx.kind === 'new' && (
                <button onClick={() => setMenuState('more')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', borderRadius: '7px', padding: '0.36rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                  <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>⋯</span><span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>Mais opções</span>
                </button>
              )}
            </>
          )}

          {menuState === 'colors' && (
            <>
              <button onClick={() => setMenuState('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontFamily: 'inherit', padding: '0.15rem 0.3rem', borderRadius: '5px', marginBottom: '0.3rem' }}><ChevronLeft size={10} /> Voltar</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', padding: '0.1rem' }}>
                {HCOLOR_ORDER.map(c => { const hc = HCOLORS[c]; const isActive = activeHL?.color === c; return <button key={c} onClick={() => applyHL(c)} style={{ width: '26px', height: '26px', borderRadius: '50%', background: hc.bg, border: `2.5px solid ${isActive ? hc.dot : hc.dot + '50'}`, cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }} /> })}
              </div>
            </>
          )}

          {menuState === 'more' && (
            <>
              <button onClick={() => setMenuState('main')} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontFamily: 'inherit', padding: '0.15rem 0.3rem', borderRadius: '5px', marginBottom: '0.25rem' }}><ChevronLeft size={10} /> Voltar</button>
              {SECONDARY_CATS.map(type => { const def = CLASS_DEF[type]; return <button key={type} onClick={() => applyClass(type)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'transparent', border: 'none', borderRadius: '7px', padding: '0.33rem 0.5rem', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', textAlign: 'left' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}><span style={{ fontSize: '0.78rem' }}>{def.emoji}</span><span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.8)' }}>{def.label}</span></button> })}
            </>
          )}

          <div style={{ marginTop: '0.3rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <input type="text" value={noteVal} onChange={e => setNoteVal(e.target.value)} placeholder="Nota opcional..." onKeyDown={e => { if (e.key === 'Enter' && menuCtx.kind !== 'new') saveNote() }} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFF', padding: '0.28rem 0.5rem', fontSize: '0.72rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
          </div>
          {menuCtx.kind !== 'new' && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '0.3rem' }}>
              <button onClick={remove} style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: '6px', padding: '0.26rem 0', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'inherit' }}>Remover</button>
              <button onClick={saveNote} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', padding: '0.26rem 0', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'inherit' }}>Salvar nota</button>
            </div>
          )}
          {saving && <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', margin: '0.3rem 0 0', textAlign: 'center' }}>Salvando…</p>}
          <div style={{ position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #18181B' }} />
        </div>
      )}

      {tooltipCls && tooltip && (
        <div style={{ position: 'fixed', left: tooltip.rect.left + tooltip.rect.width / 2, top: tooltip.rect.bottom + 6, transform: 'translateX(-50%)', zIndex: 9997, background: '#18181B', color: '#FFF', padding: '0.45rem 0.7rem', borderRadius: '8px', fontSize: '0.72rem', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxWidth: '200px' }}>
          <div style={{ fontWeight: 600 }}>{CLASS_DEF[tooltipCls.type].emoji} {CLASS_DEF[tooltipCls.type].label}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginTop: '0.15rem' }}>v.{tooltipCls.startVerse} · "{tooltipCls.selectedText.slice(0, 30)}{tooltipCls.selectedText.length > 30 ? '…' : ''}"</div>
          <div style={{ position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid #18181B' }} />
        </div>
      )}
    </>
  )
}
