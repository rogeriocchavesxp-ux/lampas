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
  | 'conectivo' | 'verbo_principal' | 'promessa' | 'imperativo'
  | 'ambiente' | 'tensao' | 'climax' | 'resolucao' | 'desfecho'

type HColor = 'yellow' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
type MenuState = 'main' | 'colors' | 'more'
type ViewMode = 'pt' | 'orig' | 'side' | 'interlinear' | 'proprio'
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
  personagem:     { emoji: '👤', label: 'Personagem',    color: '#D97706', sectionSlug: 'preparar_visao_geral', cardId: 'preparar_personagens',       sectionTitle: '4. Visão Geral' },
  lugar:          { emoji: '📍', label: 'Lugar',          color: '#10B981' },
  termo_chave:    { emoji: '🔑', label: 'Termo-Chave',   color: '#F97316' },
  tema:           { emoji: '📖', label: 'Tema',           color: '#1E4D8C', sectionSlug: 'preparar_visao_geral', cardId: 'preparar_tema_provavel',      sectionTitle: '4. Visão Geral' },
  teologia:       { emoji: '✦',  label: 'Teologia',       color: '#8B5CF6' },
  conectivo:      { emoji: '→',  label: 'Conectivo',      color: '#0891B2' },
  verbo_principal:{ emoji: '⚡', label: 'Verbo Principal',color: '#7C3AED' },
  promessa:       { emoji: '🌟', label: 'Promessa',       color: '#16A34A' },
  imperativo:     { emoji: '📣', label: 'Imperativo',     color: '#DC2626' },
  tempo:          { emoji: '📅', label: 'Tempo',          color: '#6366F1' },
  instituicao:    { emoji: '🏛️', label: 'Instituição',    color: '#7C3AED' },
  cargo:          { emoji: '👑', label: 'Cargo',          color: '#F59E0B' },
  conflito:       { emoji: '⚠️', label: 'Conflito',       color: '#EF4444' },
  repeticao:      { emoji: '🔄', label: 'Repetição',     color: '#EC4899', sectionSlug: 'preparar_visao_geral', cardId: 'preparar_palavras_repetidas', sectionTitle: '4. Visão Geral' },
  objetivo:       { emoji: '🎯', label: 'Objetivo',       color: '#10B981' },
  comentario:     { emoji: '📝', label: 'Comentário',    color: '#64748B' },
  insight:        { emoji: '💡', label: 'Insight',        color: '#F59E0B' },
  observacao:     { emoji: '📌', label: 'Observação',    color: '#D97706', sectionSlug: 'preparar_primeiras_impressoes', cardId: 'preparar_observacoes_livres', sectionTitle: '3. Impressões' },
  ambiente:       { emoji: '🗺', label: 'Ambiente',      color: '#92400E' },
  tensao:         { emoji: '🔥', label: 'Tensão',        color: '#BE123C', sectionSlug: 'preparar_leia_assimile',          cardId: 'preparar_tensoes_repeticoes',  sectionTitle: '2. Leia e Assimile' },
  climax:         { emoji: '▲',  label: 'Clímax',        color: '#B45309', sectionSlug: 'preparar_visao_geral',            cardId: 'preparar_climax',              sectionTitle: '4. Visão Geral' },
  resolucao:      { emoji: '✓',  label: 'Resolução',     color: '#065F46' },
  desfecho:       { emoji: '■',  label: 'Desfecho',      color: '#4338CA' },
}

const PRIMARY_CATS:        ClassType[] = ['personagem', 'lugar', 'termo_chave', 'tema', 'teologia']
const PRIMARY_CATS_PROPRIO:ClassType[] = ['conectivo', 'verbo_principal', 'promessa', 'imperativo', 'personagem', 'ambiente', 'tema', 'tensao', 'climax', 'resolucao', 'desfecho']
const SECONDARY_CATS:      ClassType[] = ['tempo', 'instituicao', 'cargo', 'conflito', 'repeticao', 'objetivo', 'comentario', 'insight', 'observacao']

const HCOLORS: Record<HColor, { bg: string; dot: string }> = {
  yellow: { bg: '#FEF3C7', dot: '#F59E0B' }, blue:   { bg: '#D5E3F3', dot: '#1E4D8C' },
  green:  { bg: '#DCFCE7', dot: '#10B981' }, purple: { bg: '#EDE9FE', dot: '#8B5CF6' },
  orange: { bg: '#FFEDD5', dot: '#F97316' }, red:    { bg: '#FEE2E2', dot: '#EF4444' },
}
const HCOLOR_ORDER: HColor[] = ['yellow', 'blue', 'green', 'purple', 'orange', 'red']
const VERSIONS = ['ARA', 'ACF', 'NVI', 'NTLH'] as const
type Version = typeof VERSIONS[number]

const LOCALLY_AVAILABLE = new Set<Version>(['ACF'])

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'pt',          label: 'Português'   },
  { id: 'orig',        label: 'Original'    },
  { id: 'side',        label: 'Lado a Lado' },
  { id: 'interlinear', label: 'Interlinear' },
  { id: 'proprio',     label: 'Texto Próprio'},
]

const DEFAULT_W = 520
const DEFAULT_H = 600
const MIN_W = 340, MAX_W = 960, MIN_H = 320, MAX_H = 920

// ── Storage helpers ───────────────────────────────────────────────────────────

const bibk  = (b: string, r: string, v: string) => `lb_${b}_${r}_${v}`.replace(/\s/g, '_')
const origk = (b: string, r: string) => `lo_${b}_${r}`.replace(/\s/g, '_')
const clsk  = (p: string) => `lc_${p}`
const hlk   = (p: string) => `lh_${p}`
const ptxk  = (p: string) => `lpt_${p}`
const rptx  = (p: string): string => { try { return localStorage.getItem(ptxk(p)) ?? '' } catch { return '' } }
const wptx  = (p: string, v: string) => { try { localStorage.setItem(ptxk(p), v) } catch {} }

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

// ── Annotations ───────────────────────────────────────────────────────────────

interface AnnItem { id: string; context: string; text: string; createdAt: string }

function normBook(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
}

const BOOK_ABBR: Record<string, string> = {
  // AT
  'gn':'genesis','gen':'genesis',
  'ex':'exodo','exo':'exodo',
  'lv':'levitico','lev':'levitico',
  'nm':'numeros','num':'numeros',
  'dt':'deuteronomio','deu':'deuteronomio',
  'js':'josue','jos':'josue',
  'jz':'juizes','jui':'juizes',
  'rt':'rute','rut':'rute',
  '1sm':'1samuel','1sa':'1samuel',
  '2sm':'2samuel','2sa':'2samuel',
  '1rs':'1reis','1re':'1reis',
  '2rs':'2reis','2re':'2reis',
  '1cr':'1cronicas','2cr':'2cronicas',
  'ed':'esdras','ne':'neemias','et':'ester',
  'sl':'salmos','sal':'salmos',
  'pv':'proverbios','pro':'proverbios','prov':'proverbios',
  'ec':'eclesiastes','ecl':'eclesiastes',
  'ct':'cantares','can':'cantares',
  'is':'isaias','isa':'isaias',
  'jr':'jeremias','jer':'jeremias',
  'lm':'lamentacoes','lam':'lamentacoes',
  'ez':'ezequiel','eze':'ezequiel',
  'dn':'daniel','dan':'daniel',
  'os':'oseias','ose':'oseias',
  'jl':'joel','am':'amos','ob':'obadias',
  'jn':'jonas','jon':'jonas',
  'mq':'miqueias','miq':'miqueias',
  'na':'naum','hc':'habacuque','hab':'habacuque',
  'sf':'sofonias','sof':'sofonias',
  'ag':'ageu','zc':'zacarias','zac':'zacarias',
  'ml':'malaquias','mal':'malaquias',
  // NT
  'mt':'mateus','mat':'mateus',
  'mc':'marcos','mar':'marcos',
  'lc':'lucas','luc':'lucas',
  'jo':'joao','joa':'joao',
  'at':'atos',
  'rm':'romanos','rom':'romanos',
  '1co':'1corintios','1cor':'1corintios',
  '2co':'2corintios','2cor':'2corintios',
  'gl':'galatas','gal':'galatas',
  'ef':'efesios',
  'fp':'filipenses','fil':'filipenses',
  'cl':'colossenses','col':'colossenses',
  '1ts':'1tessalonicenses','2ts':'2tessalonicenses',
  '1tm':'1timoteo','1ti':'1timoteo',
  '2tm':'2timoteo','2ti':'2timoteo',
  'tt':'tito','tit':'tito',
  'fm':'filemom',
  'hb':'hebreus','heb':'hebreus',
  'tg':'tiago',
  '1pe':'1pedro','2pe':'2pedro',
  '1jo':'1joao','2jo':'2joao','3jo':'3joao',
  'jd':'judas','jud':'judas',
  'ap':'apocalipse','apo':'apocalipse',
}

function resolveBook(raw: string): string {
  const n = normBook(raw)
  return BOOK_ABBR[n] ?? n
}

function parseVerseCtx(context: string): { bookNorm: string; chapter: number; vStart: number; vEnd: number } | null {
  const m = context.match(/([1-3]?\s*[A-Za-zÀ-ÿ]+\.?\s*[A-Za-zÀ-ÿ]*)\s+(\d+)[.:,](\d+)(?:\s*[-–]\s*(\d+))?/)
  if (!m) return null
  return {
    bookNorm: resolveBook(m[1].trim()),
    chapter:  parseInt(m[2]),
    vStart:   parseInt(m[3]),
    vEnd:     m[4] ? parseInt(m[4]) : parseInt(m[3]),
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  book: string; passageRef: string; testament: string
  projectId: string; userId: string; onClose: () => void
  sidebarMode?: boolean
  studyMode?: string
}

// Seções compartilhadas com variante por modo de estudo: resolve o slug correto
// antes de salvar uma classificação (ex: 'observacao' no modo Narrativas).
function resolveClassDef(def: ClassDef, studyMode?: string): ClassDef {
  if (studyMode === 'estudo_narrativas' && def.sectionSlug === 'preparar_primeiras_impressoes') {
    return { ...def, sectionSlug: 'nr_preparar_primeiras_impressoes' }
  }
  return def
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibleFloatingWindow({ book, passageRef, testament, projectId, userId, onClose, sidebarMode = false, studyMode }: Props) {
  const textRef  = useRef<HTMLDivElement>(null)
  const menuRef  = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const isAT  = testament === 'AT'
  const accent = isAT ? '#D97706' : '#1E4D8C'
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
  const [version,        setVersion]        = useState<Version>('ACF')
  const [verses,         setVerses]         = useState<Verse[]>([])
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState<string | null>(null)
  const [copied,         setCopied]         = useState(false)
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null)

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

  // Texto Próprio
  const [proprioText,    setProprioText]    = useState('')
  const [proprioEditing, setProprioEditing] = useState(false)

  // Menu
  const [menuCtx,   setMenuCtx]   = useState<MenuCtx | null>(null)
  const [menuPos,   setMenuPos]   = useState<{ x: number; y: number } | null>(null)
  const [menuState, setMenuState] = useState<MenuState>('main')
  const [noteVal,   setNoteVal]   = useState('')
  const [saving,    setSaving]    = useState(false)

  const [tooltip,  setTooltip]  = useState<{ id: string; rect: DOMRect } | null>(null)
  const [annList,  setAnnList]  = useState<AnnItem[]>([])
  const [annPopup, setAnnPopup] = useState<{ verse: number; anns: AnnItem[]; x: number; y: number } | null>(null)

  const clsById = useMemo(() => Object.fromEntries(clsList.map(c => [c.id, c])), [clsList])

  const bookNorm      = useMemo(() => resolveBook(book), [book])
  const currentChapter = useMemo(() => parseInt(passageRef), [passageRef])

  const verseAnnotations = useMemo(() => {
    const map = new Map<number, AnnItem[]>()
    for (const ann of annList) {
      const ref = parseVerseCtx(ann.context)
      if (!ref) continue
      if (ref.chapter !== currentChapter) continue
      if (!bookNorm.includes(ref.bookNorm) && !ref.bookNorm.includes(bookNorm)) continue
      for (let v = ref.vStart; v <= ref.vEnd; v++) {
        if (!map.has(v)) map.set(v, [])
        map.get(v)!.push(ann)
      }
    }
    return map
  }, [annList, bookNorm, currentChapter])

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const sp = localStorage.getItem('lampas_bible_pos')
    const ss = localStorage.getItem('lampas_bible_size')
    const sm = localStorage.getItem('lampas_bible_mode') as ViewMode | null
    if (sp) setPos(JSON.parse(sp))
    else    setPos({ x: Math.max(40, window.innerWidth - DEFAULT_W - 40), y: 64 })
    if (ss) setSize(JSON.parse(ss))
    if (sm) setViewMode(sm)
    setProprioText(rptx(projectId))
  }, [projectId])

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

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(`lampas_ann_${projectId}`)
        setAnnList(raw ? JSON.parse(raw) : [])
      } catch { setAnnList([]) }
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [projectId])

  // ── Fetch Portuguese ──────────────────────────────────────────────────────
  const fetchText = useCallback(async (v: Version, force = false, isFallback = false) => {
    const k = bibk(book, passageRef, v)
    if (!force && !isFallback) { const c = rb(k); if (c) { setVerses(c); setError(null); setFallbackNotice(null); return } }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/bible/text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ book, passageRef, version: v }) })
      const data = await res.json() as { verses?: Verse[]; error?: string; type?: string }
      if (!res.ok || !data.verses) {
        if (data.type === 'unavailable' && v !== 'ACF') {
          setFallbackNotice(`${v} não disponível — exibindo ACF`)
          fetchText('ACF', force, true)
          return
        }
        throw new Error(data.error ?? 'Erro ao carregar o texto')
      }
      if (!isFallback) setFallbackNotice(null)
      wb(k, data.verses); setVerses(data.verses)
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro ao carregar o texto') }
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
    if (proprioEditing) return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) return
    const txt = sel.toString().trim()
    if (!txt || txt.length < 2) return
    const range = sel.getRangeAt(0)
    if (!textRef.current?.contains(range.commonAncestorContainer)) return
    const rect = range.getBoundingClientRect()

    // Texto Próprio: calcula offset sobre o texto completo
    if (viewMode === 'proprio') {
      const container = textRef.current.querySelector('[data-verse="0"]')
      if (!container) return
      const fullText = container.textContent ?? ''
      const startOff = getTextOffset(range.startContainer, range.startOffset, container)
      const endOff   = getTextOffset(range.endContainer,   range.endOffset,   container)
      if (startOff < 0 || endOff < 0 || startOff >= endOff) return
      setMenuCtx({ kind: 'new', pending: { startVerse: 0, endVerse: 0, startOffset: startOff, endOffset: endOff, text: txt } })
      setMenuState('main'); setNoteVal('')
      setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
      return
    }

    const ss = findVerse(range.startContainer), es = findVerse(range.endContainer)
    if (!ss || !es) return
    setMenuCtx({ kind: 'new', pending: { startVerse: parseInt(ss.dataset.verse!), endVerse: parseInt(es.dataset.verse!), startOffset: charOff(range.startContainer, range.startOffset, ss), endOffset: charOff(range.endContainer, range.endOffset, es), text: txt } })
    setMenuState('main'); setNoteVal('')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  function getTextOffset(node: Node, offset: number, container: Element): number {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    let total = 0
    while (walker.nextNode()) {
      const n = walker.currentNode as Text
      if (n === node) return total + offset
      total += n.length
    }
    return -1
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
    const def = resolveClassDef(CLASS_DEF[type], studyMode); setSaving(true)
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
    const anns = verseAnnotations.get(verse.v)
    return (
      <span key={verse.v} style={{ display: 'inline' }}>
        <sup style={{ fontSize: '0.56rem', fontWeight: 700, color: accent, marginRight: '0.18rem', verticalAlign: 'super', lineHeight: 0, fontFamily: 'var(--font-sans)' }}>{verse.v}</sup>
        {anns && anns.length > 0 && (
          <button
            onClick={e => { e.stopPropagation(); setAnnPopup(p => p?.verse === verse.v ? null : { verse: verse.v, anns, x: e.clientX, y: e.clientY }) }}
            title={`${anns.length} anotação${anns.length > 1 ? 'ões' : ''}`}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              verticalAlign: 'super', lineHeight: 0, marginRight: '2px',
              position: 'relative',
            }}
          >
            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 0.5 H7 L10 3.5 V11.5 H1 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="0.75"/>
              <path d="M7 0.5 V3.5 H10" fill="#F59E0B" stroke="#D97706" strokeWidth="0.75" strokeLinejoin="round"/>
              <line x1="2.5" y1="5.5" x2="8" y2="5.5" stroke="#D97706" strokeWidth="0.6" opacity="0.5"/>
              <line x1="2.5" y1="7.5" x2="7" y2="7.5" stroke="#D97706" strokeWidth="0.6" opacity="0.5"/>
            </svg>
            {anns.length > 1 && (
              <span style={{
                position: 'absolute', top: '-3px', right: '-4px',
                background: '#D97706', color: '#fff',
                fontSize: '0.4rem', fontWeight: 800, lineHeight: 1,
                borderRadius: '99px', padding: '0.5px 2px',
                fontFamily: 'var(--font-sans)',
              }}>
                {anns.length}
              </span>
            )}
          </button>
        )}
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
        <p data-verse={String(ov.verse)} style={{ fontFamily: "'SBL Hebrew', 'Ezra SIL', 'Times New Roman', serif", fontSize: isAT ? '1.55rem' : '1.35rem', lineHeight: 2.0, direction: isAT ? 'rtl' : 'ltr', textAlign: isAT ? 'right' : 'left', color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: isAT ? '0.03em' : '0.01em' }}>
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
                  <p data-verse={String(ov.verse)} style={{ fontFamily: "'SBL Hebrew', 'Ezra SIL', 'Times New Roman', serif", fontSize: isAT ? '1.25rem' : '1.1rem', direction: isAT ? 'rtl' : 'ltr', textAlign: isAT ? 'right' : 'left', lineHeight: 1.95, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: isAT ? '0.02em' : '0.01em' }}>{ov.original}</p>
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

  // ── Texto Próprio ─────────────────────────────────────────────────────────

  function importProprioText() {
    const plain = verses.map(v => `${v.v} ${v.t}`).join('\n')
    const full  = plain || ''
    setProprioText(full)
    wptx(projectId, full)
    setProprioEditing(false)
  }

  function saveProprioText(text: string) {
    setProprioText(text)
    wptx(projectId, text)
  }

  function renderProprio() {
    const proprioCls = clsList.filter(c => c.startVerse === 0)
    const proprioHl  = hlList.filter(h => h.startVerse === 0)

    const buildProprioSegs = (text: string): Seg[] => {
      const n    = text.length
      const cids = new Array<string | null>(n).fill(null)
      const hids = new Array<string | null>(n).fill(null)
      const hcol = new Array<HColor | null>(n).fill(null)
      for (const h of proprioHl) {
        for (let i = Math.max(0, h.startOffset); i < Math.min(n, h.endOffset); i++) { hids[i] = h.id; hcol[i] = h.color }
      }
      for (const c of proprioCls) {
        for (let i = Math.max(0, c.startOffset); i < Math.min(n, c.endOffset); i++) cids[i] = c.id
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

    if (proprioEditing) {
      return (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={importProprioText} disabled={!verses.length} style={{ background: accent, color: '#FFF', border: 'none', borderRadius: '7px', padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 600, cursor: verses.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: verses.length ? 1 : 0.5 }}>
              Importar texto atual ({version})
            </button>
            <button onClick={() => { saveProprioText(proprioText); setProprioEditing(false) }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '7px', padding: '0.3rem 0.75rem', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
              Concluir edição
            </button>
            {proprioText && (
              <button onClick={() => { saveProprioText(''); setProprioEditing(false) }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>
                Limpar
              </button>
            )}
          </div>
          <textarea
            autoFocus
            value={proprioText}
            onChange={e => setProprioText(e.target.value)}
            placeholder={'Cole ou escreva qualquer texto bíblico aqui.\n\nExemplos:\n- Tradução própria da perícope\n- Estrutura diagramada\n- Transcrição com marcações'}
            style={{ flex: 1, width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem', fontSize: '0.92rem', fontFamily: "'EB Garamond', Georgia, serif", lineHeight: 1.9, color: 'var(--text-primary)', background: 'var(--surface)', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )
    }

    if (!proprioText) {
      return (
        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', height: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', opacity: 0.3 }}>✏️</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px', margin: 0 }}>
            Cole sua tradução, estrutura diagramada ou qualquer texto para anotar e classificar.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setProprioEditing(true)} style={{ background: accent, color: '#FFF', border: 'none', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Colar texto
            </button>
            <button onClick={importProprioText} disabled={!verses.length} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: verses.length ? 'pointer' : 'not-allowed', color: 'var(--text-primary)', fontFamily: 'inherit', opacity: verses.length ? 1 : 0.5 }}>
              Importar {version}
            </button>
          </div>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, opacity: 0.6 }}>
            Selecione trechos para marcar conectivos, verbos, promessas, imperativos e mais.
          </p>
        </div>
      )
    }

    const segs = buildProprioSegs(proprioText)
    return (
      <div style={{ padding: '1rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {/* Toolbar — categorias + Editar em uma única barra */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {PRIMARY_CATS_PROPRIO.map(t => {
            const d = CLASS_DEF[t]
            return (
              <span key={t} style={{ fontSize: '0.58rem', background: d.color + '15', border: `1px solid ${d.color}30`, color: d.color, borderRadius: '4px', padding: '1px 6px', fontWeight: 600 }}>
                {d.emoji} {d.label}
              </span>
            )
          })}
          <div style={{ width: '1px', height: '14px', background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />
          <button onClick={() => setProprioEditing(true)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px', fontSize: '0.58rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
            ✎ Editar
          </button>
        </div>
        {/* Texto anotável */}
        <div data-verse="0" style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '1.02rem', lineHeight: '1.95', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'text', cursor: 'text' }}>
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
        </div>
        {/* Classificações no texto próprio */}
        {proprioCls.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
              Observações ({proprioCls.length})
            </div>
            {proprioCls.map(c => {
              const d = CLASS_DEF[c.type]
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.2rem 0' }}>
                  <span style={{ color: d.color, flexShrink: 0 }}>{d.emoji}</span>
                  <span style={{ color: d.color, fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{d.label}</span>
                  <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontFamily: "'EB Garamond', Georgia, serif", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{c.selectedText}"</span>
                  {c.note && <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{c.note}</span>}
                  <button onClick={() => { const n = clsList.filter(x => x.id !== c.id); setClsList(n); wcl(projectId, n) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 0, lineHeight: 1, flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Minimized ─────────────────────────────────────────────────────────────

  if (minimized && !sidebarMode) {
    return (
      <div style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 500, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', cursor: 'default', animation: 'fadeIn 0.15s ease-out' }}>
        <BookOpen size={13} strokeWidth={1.75} style={{ color: accent }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{book} {passageRef}</span>
        <button onClick={() => setMinimized(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '0 0.1rem', lineHeight: 1, fontFamily: 'inherit' }}>▲</button>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '0 0.1rem', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
      </div>
    )
  }

  const windowStyle: React.CSSProperties = sidebarMode
    ? { position: 'relative', width: '100%', height: '100%', borderRadius: 0 }
    : maximized
    ? { position: 'fixed', top: '8px', left: '8px', right: '8px', bottom: '8px', width: 'auto', height: 'auto' }
    : { position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h }

  return (
    <>
      {savedTo && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.2s ease-out' }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} /> Salvo em {savedTo}
        </div>
      )}

      <div style={{ ...windowStyle, zIndex: sidebarMode ? 1 : 500, background: '#FEFDF9', borderTop: sidebarMode ? 'none' : '1px solid var(--border)', borderRight: sidebarMode ? 'none' : '1px solid var(--border)', borderBottom: sidebarMode ? 'none' : '1px solid var(--border)', borderLeft: sidebarMode ? '1px solid var(--border-subtle)' : '1px solid var(--border)', borderRadius: sidebarMode ? 0 : maximized ? '0' : '14px', boxShadow: sidebarMode ? 'none' : '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: sidebarMode ? 'none' : 'fadeInScale 0.18s cubic-bezier(0.16,1,0.3,1)' }}>

        {/* ── Chrome header ── */}
        <div onMouseDown={sidebarMode ? undefined : onTitleMouseDown} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderBottom: '1px solid var(--border-subtle)', cursor: sidebarMode ? 'default' : maximized ? 'default' : 'move', userSelect: 'none' }}>

          {/* Row 1: traffic/close + title + controls */}
          <div style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0 0.85rem' }}>
            {sidebarMode ? (
              /* Sidebar: só botão fechar simples */
              <button
                onClick={onClose}
                style={{ width: '20px', height: '20px', borderRadius: '4px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', padding: 0, lineHeight: 1, flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--border-subtle)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >×</button>
            ) : (
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onMouseEnter={() => setIsHoveringTraffic(true)} onMouseLeave={() => setIsHoveringTraffic(false)}>
                {[{ color: '#FF5F56', action: onClose, sym: '×' }, { color: '#FFBE2E', action: () => setMinimized(true), sym: '–' }, { color: '#27C840', action: () => setMaximized(m => !m), sym: maximized ? '⤡' : '⤢' }].map(({ color, action, sym }) => (
                  <button key={color} onMouseDown={e => e.stopPropagation()} onClick={action} style={{ width: '12px', height: '12px', borderRadius: '50%', background: color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: 'rgba(0,0,0,0.6)', padding: 0, lineHeight: 1 }}>
                    {isHoveringTraffic ? sym : ''}
                  </button>
                ))}
              </div>
            )}

            <BookOpen size={12} strokeWidth={1.75} style={{ color: accent, flexShrink: 0 }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {book} {passageRef}
                <span style={{ marginLeft: '6px', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>{testament} · {origLang}</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }} onMouseDown={e => e.stopPropagation()}>
              {/* Version — only show when in pt or side mode */}
              {(viewMode === 'pt' || viewMode === 'side') && VERSIONS.map(v => {
                const available = LOCALLY_AVAILABLE.has(v)
                const active    = version === v
                return (
                  <button
                    key={v}
                    onClick={() => { if (available) setVersion(v) }}
                    disabled={loading || !available}
                    title={available ? undefined : 'Tradução não disponível no momento'}
                    style={{
                      background:      active ? accent : 'transparent',
                      color:           !available ? 'var(--border)' : active ? '#FFF' : 'var(--text-muted)',
                      border:          `1px solid ${active ? accent : available ? 'var(--border)' : 'var(--border-subtle)'}`,
                      borderRadius:    '5px',
                      padding:         '0.13rem 0.38rem',
                      fontSize:        '0.58rem',
                      fontWeight:      600,
                      cursor:          !available ? 'not-allowed' : loading ? 'wait' : 'pointer',
                      fontFamily:      'inherit',
                      transition:      'all 0.12s',
                      textDecoration:  !available ? 'line-through' : 'none',
                      opacity:         !available ? 0.4 : 1,
                    }}
                  >
                    {v}
                  </button>
                )
              })}
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
                style={{ padding: '5px 10px', fontSize: '0.65rem', fontWeight: viewMode === m.id ? 700 : 500, color: viewMode === m.id ? accent : 'var(--text-muted)', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `2px solid ${viewMode === m.id ? accent : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap' }}>
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
              {fallbackNotice && !loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.35rem 0.65rem', marginBottom: '0.75rem', fontStyle: 'italic' }}>
                  <span style={{ opacity: 0.6 }}>ℹ</span> {fallbackNotice}
                </div>
              )}
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

          {/* TEXTO PRÓPRIO */}
          {viewMode === 'proprio' && renderProprio()}
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
        {!maximized && !sidebarMode && (
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
              {(viewMode === 'proprio' ? PRIMARY_CATS_PROPRIO : PRIMARY_CATS).map(type => { const def = CLASS_DEF[type]; const isActive = activeCls?.type === type; return (
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

      {annPopup && (
        <>
          <div onClick={() => setAnnPopup(null)} style={{ position: 'fixed', inset: 0, zIndex: 9996 }} />
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              left: Math.min(annPopup.x + 8, window.innerWidth - 272),
              top: Math.min(annPopup.y + 8, window.innerHeight - 320),
              zIndex: 9997,
              width: 260,
              maxHeight: 300,
              overflowY: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ padding: '0.45rem 0.65rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B' }}>
                📝 v.{annPopup.verse} · {annPopup.anns.length} anotação{annPopup.anns.length > 1 ? 'ões' : ''}
              </span>
              <button onClick={() => setAnnPopup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1, padding: '0.1rem 0.2rem' }}>✕</button>
            </div>
            {annPopup.anns.map((ann, i) => (
              <div key={ann.id} style={{ padding: '0.55rem 0.65rem', borderBottom: i < annPopup.anns.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                {ann.context && (
                  <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', letterSpacing: '0.01em' }}>{ann.context}</div>
                )}
                <div
                  style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.55 }}
                  dangerouslySetInnerHTML={{ __html: ann.text }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}
