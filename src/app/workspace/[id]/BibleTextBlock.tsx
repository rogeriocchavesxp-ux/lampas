'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import { BookOpen, Copy, ChevronDown, ChevronUp, Check, RefreshCw, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Verse { v: number; t: string }

type ExCat =
  | 'personagem' | 'lugar' | 'tempo' | 'instituicao' | 'cargo'
  | 'termo_chave' | 'tema' | 'conflito' | 'objetivo' | 'repeticao'
  | 'teologia' | 'observacao' | 'comentario' | 'insight'

type HColor = 'yellow' | 'blue' | 'green' | 'purple' | 'pink' | 'orange'

interface Extraction {
  id: string
  category: ExCat
  selectedText: string
  startVerse: number
  endVerse: number
  startOffset: number
  endOffset: number
  color: HColor
  note: string
  createdAt: string
}

interface PendingSel {
  startVerse: number; endVerse: number
  startOffset: number; endOffset: number
  text: string
}

// ── Category config ───────────────────────────────────────────────────────────

interface CatDef {
  id: ExCat; emoji: string; label: string; color: HColor
  sectionSlug?: string; cardId?: string; sectionTitle?: string
}

const CATS: CatDef[] = [
  { id: 'personagem',  emoji: '👤', label: 'Personagem',      color: 'yellow', sectionSlug: 'preparar_visao_geral',           cardId: 'preparar_personagens',       sectionTitle: '4. Visão Geral da Passagem' },
  { id: 'lugar',       emoji: '📍', label: 'Lugar',           color: 'green'  },
  { id: 'tema',        emoji: '📖', label: 'Tema',            color: 'blue',   sectionSlug: 'preparar_visao_geral',           cardId: 'preparar_tema_provavel',      sectionTitle: '4. Visão Geral da Passagem' },
  { id: 'termo_chave', emoji: '🔑', label: 'Termo-Chave',    color: 'orange' },
  { id: 'teologia',    emoji: '🧠', label: 'Teologia',        color: 'purple' },
  { id: 'conflito',    emoji: '⚠️', label: 'Conflito',        color: 'pink'  },
  { id: 'repeticao',   emoji: '🔄', label: 'Repetição',      color: 'pink',   sectionSlug: 'preparar_visao_geral',           cardId: 'preparar_palavras_repetidas', sectionTitle: '4. Visão Geral da Passagem' },
  { id: 'objetivo',    emoji: '🎯', label: 'Objetivo',        color: 'green' },
  { id: 'tempo',       emoji: '📅', label: 'Tempo',           color: 'blue'  },
  { id: 'instituicao', emoji: '🏛️', label: 'Instituição',     color: 'purple' },
  { id: 'cargo',       emoji: '👑', label: 'Cargo / Função',  color: 'orange' },
  { id: 'observacao',  emoji: '📌', label: 'Observação',      color: 'yellow', sectionSlug: 'preparar_primeiras_impressoes', cardId: 'preparar_observacoes_livres', sectionTitle: '3. Primeiras Impressões' },
  { id: 'comentario',  emoji: '📝', label: 'Comentário',      color: 'blue'  },
  { id: 'insight',     emoji: '💡', label: 'Insight',         color: 'yellow' },
]

const CAT_MAP = Object.fromEntries(CATS.map(c => [c.id, c])) as Record<ExCat, CatDef>

// Versão: filtros do painel
const FILTER_CATS: Array<{ id: ExCat | 'all'; label: string }> = [
  { id: 'all',         label: 'Todos'       },
  { id: 'personagem',  label: 'Personagens' },
  { id: 'lugar',       label: 'Lugares'     },
  { id: 'tema',        label: 'Temas'       },
  { id: 'termo_chave', label: 'Termos'      },
  { id: 'teologia',    label: 'Teologia'    },
  { id: 'conflito',    label: 'Conflitos'   },
  { id: 'observacao',  label: 'Observações' },
]

// ── Color config ──────────────────────────────────────────────────────────────

const COLORS: Record<HColor, { bg: string; border: string; text: string }> = {
  yellow: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  blue:   { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
  green:  { bg: '#DCFCE7', border: '#10B981', text: '#065F46' },
  purple: { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95' },
  pink:   { bg: '#FCE7F3', border: '#EC4899', text: '#831843' },
  orange: { bg: '#FFEDD5', border: '#F97316', text: '#7C2D12' },
}

const VERSIONS = ['ARA', 'NAA', 'ACF', 'NVI', 'NTLH'] as const
type Version = typeof VERSIONS[number]

// ── Storage helpers ───────────────────────────────────────────────────────────

const bk = (book: string, ref: string, v: string) =>
  `lampas_bible_${book}_${ref}_${v}`.replace(/\s/g, '_')
const ek = (pid: string) => `lampas_ext_${pid}`

const readBible = (k: string): Verse[] | null => {
  try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null }
}
const writeBible = (k: string, v: Verse[]) => {
  try { sessionStorage.setItem(k, JSON.stringify(v)) } catch { /* noop */ }
}
const readExt = (pid: string): Extraction[] => {
  try { const r = localStorage.getItem(ek(pid)); return r ? JSON.parse(r) : [] } catch { return [] }
}
const saveExt = (pid: string, items: Extraction[]) => {
  try { localStorage.setItem(ek(pid), JSON.stringify(items)) } catch { /* noop */ }
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function findVerseSpan(node: Node): HTMLElement | null {
  let el: Element | null = node instanceof Element ? node : node.parentElement
  while (el) {
    if (el instanceof HTMLElement && el.dataset.verse) return el
    el = el.parentElement
  }
  return null
}

function textOffset(target: Node, offset: number, container: Element): number {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let total = 0
  while (walker.nextNode()) {
    const n = walker.currentNode as Text
    if (n === target) return total + offset
    total += n.length
  }
  return total
}

// ── Highlight rendering ───────────────────────────────────────────────────────

function renderVerse(
  vNum: number, text: string, extractions: Extraction[],
  onClickEx: (id: string, e: React.MouseEvent) => void,
): ReactNode {
  const rel = extractions.filter(ex => ex.startVerse <= vNum && ex.endVerse >= vNum)
  if (!rel.length) return text

  type Seg = { s: number; e: number; color: HColor; id: string }
  const segs: Seg[] = rel.map(ex => ({
    s: ex.startVerse === vNum ? ex.startOffset : 0,
    e: ex.endVerse   === vNum ? ex.endOffset   : text.length,
    color: ex.color, id: ex.id,
  })).filter(s => s.s < s.e && s.s >= 0 && s.e <= text.length)

  if (!segs.length) return text
  segs.sort((a, b) => a.s - b.s)

  const parts: ReactNode[] = []
  let pos = 0
  for (const seg of segs) {
    const s = Math.max(seg.s, pos)
    if (s > pos) parts.push(text.slice(pos, s))
    if (s < seg.e) {
      parts.push(
        <mark key={seg.id} data-exid={seg.id} onClick={e => onClickEx(seg.id, e)} style={{
          background: COLORS[seg.color].bg,
          borderBottom: `2px solid ${COLORS[seg.color].border}55`,
          borderRadius: '2px', padding: '0 1px', cursor: 'pointer',
        }}>
          {text.slice(s, seg.e)}
        </mark>
      )
      pos = seg.e
    }
  }
  if (pos < text.length) parts.push(text.slice(pos))
  return parts
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  book: string; passageRef: string; testament: string
  projectId: string; userId: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibleTextBlock({ book, passageRef, testament, projectId, userId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef      = useRef<HTMLDivElement>(null)
  const supabase     = useMemo(() => createClient(), [])

  // Bible text
  const [version, setVersion]     = useState<Version>('ARA')
  const [verses, setVerses]       = useState<Verse[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [copied, setCopied]       = useState(false)

  // Extractions
  const [extractions, setExtractions] = useState<Extraction[]>([])
  const [panelOpen, setPanelOpen]     = useState(false)
  const [panelFilter, setPanelFilter] = useState<ExCat | 'all'>('all')
  const [savedTo, setSavedTo]         = useState<string | null>(null)

  // Selection / menu
  const [pending, setPending]       = useState<PendingSel | null>(null)
  const [activeExId, setActiveExId] = useState<string | null>(null)
  const [menuPos, setMenuPos]       = useState<{ x: number; y: number } | null>(null)
  const [noteVal, setNoteVal]       = useState('')
  const [saving, setSaving]         = useState(false)

  // ── Load extractions ────────────────────────────────────────────────────────
  useEffect(() => { setExtractions(readExt(projectId)) }, [projectId])

  // ── Fetch Bible text ────────────────────────────────────────────────────────
  const fetchText = useCallback(async (v: Version, force = false) => {
    const k = bk(book, passageRef, v)
    if (!force) {
      const cached = readBible(k)
      if (cached) { setVerses(cached); setError(null); return }
    }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/bible/text', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book, passageRef, version: v }),
      })
      const data = await res.json() as { verses?: Verse[]; error?: string }
      if (!res.ok || !data.verses) throw new Error(data.error ?? 'Erro')
      writeBible(k, data.verses)
      setVerses(data.verses)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar o texto')
    } finally { setLoading(false) }
  }, [book, passageRef])

  useEffect(() => { fetchText(version) }, [fetchText, version])

  // ── Close menu on outside click ─────────────────────────────────────────────
  useEffect(() => {
    if (!menuPos) return
    function h(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null); setPending(null); setActiveExId(null); setNoteVal('')
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuPos])

  // ── Text selection ──────────────────────────────────────────────────────────
  function handleMouseUp() {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) return
    const text = sel.toString().trim()
    if (!text || text.length < 2) return
    const range = sel.getRangeAt(0)
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return
    const ss = findVerseSpan(range.startContainer)
    const es = findVerseSpan(range.endContainer)
    if (!ss || !es) return
    const sv = parseInt(ss.dataset.verse!), ev = parseInt(es.dataset.verse!)
    const so = textOffset(range.startContainer, range.startOffset, ss)
    const eo = textOffset(range.endContainer, range.endOffset, es)
    const rect = range.getBoundingClientRect()
    setPending({ startVerse: sv, endVerse: ev, startOffset: so, endOffset: eo, text })
    setActiveExId(null); setNoteVal('')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  function handleClickEx(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const rect = (e.target as Element).getBoundingClientRect()
    setActiveExId(id); setPending(null)
    setNoteVal(extractions.find(ex => ex.id === id)?.note ?? '')
    setMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  // ── Save extraction to Supabase section ─────────────────────────────────────
  async function saveToSection(cat: CatDef, text: string) {
    if (!cat.sectionSlug || !cat.cardId) return
    try {
      const { data } = await supabase
        .from('sections')
        .select()
        .eq('project_id', projectId)
        .eq('slug', cat.sectionSlug)
        .maybeSingle()

      const existing = (data?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const prev = existing[cat.cardId] ?? ''
      const next = prev ? `${prev}\n${text}` : text

      const payload = {
        project_id: projectId, user_id: userId,
        slug: cat.sectionSlug, module: 'inventio' as const,
        title: cat.sectionTitle!, status: 'draft' as const,
        content: { cards: { ...existing, [cat.cardId]: next } },
      }

      if (data?.id) {
        await supabase.from('sections').update(payload).eq('id', data.id)
      } else {
        await supabase.from('sections').insert(payload)
      }
    } catch { /* silently fail */ }
  }

  // ── Apply extraction ─────────────────────────────────────────────────────────
  async function applyCategory(cat: CatDef) {
    if (!pending) return
    setSaving(true)
    const ex: Extraction = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      category: cat.id, selectedText: pending.text, color: cat.color,
      startVerse: pending.startVerse, endVerse: pending.endVerse,
      startOffset: pending.startOffset, endOffset: pending.endOffset,
      note: noteVal, createdAt: new Date().toISOString(),
    }
    const next = [...extractions, ex]
    setExtractions(next); saveExt(projectId, next)

    if (cat.sectionSlug) {
      await saveToSection(cat, pending.text)
      setSavedTo(cat.sectionTitle ?? cat.label)
      setTimeout(() => setSavedTo(null), 3000)
    }

    setSaving(false)
    setMenuPos(null); setPending(null); setNoteVal('')
    window.getSelection()?.removeAllRanges()
  }

  // ── Change category of existing extraction ──────────────────────────────────
  function changeCategory(id: string, cat: CatDef) {
    const next = extractions.map(ex => ex.id === id ? { ...ex, category: cat.id, color: cat.color } : ex)
    setExtractions(next); saveExt(projectId, next)
    setMenuPos(null); setActiveExId(null)
  }

  // ── Save note ───────────────────────────────────────────────────────────────
  function saveNote() {
    if (!activeExId) return
    const next = extractions.map(ex => ex.id === activeExId ? { ...ex, note: noteVal } : ex)
    setExtractions(next); saveExt(projectId, next)
    setMenuPos(null); setActiveExId(null); setNoteVal('')
  }

  function removeEx(id: string) {
    const next = extractions.filter(ex => ex.id !== id)
    setExtractions(next); saveExt(projectId, next)
    setMenuPos(null); setActiveExId(null)
  }

  function copyText() {
    const plain = verses.map(v => `${v.v} ${v.t}`).join('\n')
    navigator.clipboard.writeText(`${book} ${passageRef}\n\n${plain}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const accent     = testament === 'AT' ? '#D97706' : 'var(--accent)'
  const activeEx   = activeExId ? extractions.find(ex => ex.id === activeExId) : null
  const filteredEx = panelFilter === 'all' ? extractions : extractions.filter(ex => ex.category === panelFilter)
  const sortedEx   = [...filteredEx].sort((a, b) => a.startVerse - b.startVerse)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ marginBottom: '2rem', position: 'relative' }}>

      {/* Saved-to toast */}
      {savedTo && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998,
          background: '#18181B', color: '#FFFFFF',
          padding: '0.65rem 1.1rem', borderRadius: '10px',
          fontSize: '0.82rem', fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} />
          Salvo em {savedTo}
        </div>
      )}

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div style={{ border: '1px solid var(--border)', borderRadius: '14px', background: '#FFFFFF', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.1rem', borderBottom: collapsed ? 'none' : '1px solid var(--border-subtle)', background: 'var(--surface)' }}>
          <BookOpen size={14} strokeWidth={1.75} style={{ color: accent, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent }}>Texto Bíblico</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{book} {passageRef}</span>
          </div>

          {/* Version selector */}
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {VERSIONS.map(v => (
              <button key={v} onClick={() => setVersion(v)} disabled={loading} style={{ background: version === v ? accent : 'transparent', color: version === v ? '#FFF' : 'var(--text-muted)', border: `1px solid ${version === v ? accent : 'var(--border)'}`, borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.65rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}>{v}</button>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <button onClick={() => setPanelOpen(o => !o)} title="Extrações" style={{ background: panelOpen ? 'var(--surface-2)' : 'transparent', border: `1px solid ${panelOpen ? 'var(--border)' : 'transparent'}`, borderRadius: '6px', cursor: 'pointer', color: extractions.length > 0 ? accent : 'var(--text-muted)', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.12s' }}>
              <Layers size={11} strokeWidth={1.75} />
              {extractions.length > 0 && <span>{extractions.length}</span>}
            </button>
            <button onClick={() => fetchText(version, true)} disabled={loading} style={{ background: 'transparent', border: 'none', cursor: loading ? 'wait' : 'pointer', color: 'var(--text-muted)', padding: '0.25rem', borderRadius: '5px', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={12} strokeWidth={1.75} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
            <button onClick={copyText} disabled={verses.length === 0} style={{ background: 'transparent', border: 'none', cursor: verses.length === 0 ? 'not-allowed' : 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)', padding: '0.25rem', borderRadius: '5px', display: 'flex', alignItems: 'center', opacity: verses.length === 0 ? 0.4 : 1 }}>
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
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '16px', height: '12px', borderRadius: '3px', background: 'var(--border)', flexShrink: 0, marginTop: '2px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: '12px', borderRadius: '3px', background: 'var(--border)', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: '0.84rem' }}>
                {error}
              </div>
            )}

            {!loading && !error && verses.length > 0 && (
              <>
                <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  Selecione qualquer trecho para classificar e extrair para o estudo
                </p>
                <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: '1.08rem', lineHeight: '1.95', color: 'var(--text-primary)', columnCount: verses.length > 22 ? 2 : 1, columnGap: '2.5rem' }}>
                  {verses.map(verse => (
                    <span key={verse.v} style={{ display: 'inline' }}>
                      <sup style={{ fontSize: '0.6rem', fontWeight: 700, color: accent, marginRight: '0.2rem', verticalAlign: 'super', lineHeight: 0, fontFamily: 'var(--font-sans)' }}>{verse.v}</sup>
                      <span data-verse={String(verse.v)}>
                        {renderVerse(verse.v, verse.t, extractions, handleClickEx)}
                      </span>{' '}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'right' }}>
                  {book} {passageRef} · {version}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Extraction panel ──────────────────────────────────────────── */}
        {panelOpen && !collapsed && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface)', padding: '1rem 1.5rem 1.25rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Extrações — {extractions.length}
              </span>
              {extractions.length > 0 && (
                <button onClick={() => { if (confirm('Remover todas as extrações?')) { setExtractions([]); saveExt(projectId, []) } }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                >Limpar</button>
              )}
            </div>

            {/* Filters */}
            {extractions.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                {FILTER_CATS.map(f => (
                  <button key={f.id} onClick={() => setPanelFilter(f.id)}
                    style={{ background: panelFilter === f.id ? 'var(--accent)' : 'transparent', color: panelFilter === f.id ? '#FFF' : 'var(--text-muted)', border: `1px solid ${panelFilter === f.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '6px', padding: '0.15rem 0.5rem', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
                  >{f.label}</button>
                ))}
              </div>
            )}

            {extractions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                Selecione um trecho no texto e classifique para extrair automaticamente.
              </p>
            ) : sortedEx.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                Nenhuma extração nesta categoria.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '360px', overflowY: 'auto' }}>
                {sortedEx.map(ex => {
                  const cat = CAT_MAP[ex.category]
                  const c   = COLORS[ex.color]
                  return (
                    <div key={ex.id} style={{ background: c.bg, border: `1px solid ${c.border}20`, borderLeft: `3px solid ${c.border}`, borderRadius: '8px', padding: '0.6rem 0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.67rem', fontWeight: 700, color: c.border, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {cat.emoji} v.{ex.startVerse}{ex.endVerse !== ex.startVerse ? `–${ex.endVerse}` : ''} · {cat.label}
                        </span>
                        <button onClick={() => removeEx(ex.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: 0, lineHeight: 1, fontFamily: 'inherit' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        >×</button>
                      </div>
                      <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontFamily: "'EB Garamond', Georgia, serif" }}>
                        "{ex.selectedText}"
                      </p>
                      {ex.note && (
                        <p style={{ fontSize: '0.76rem', color: c.text, marginTop: '0.3rem', marginBottom: 0 }}>{ex.note}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Floating menu ─────────────────────────────────────────────────── */}
      {menuPos && (
        <div ref={menuRef} style={{ position: 'fixed', left: menuPos.x, top: menuPos.y, transform: 'translate(-50%, calc(-100% - 6px))', zIndex: 9999, background: '#18181B', borderRadius: '14px', padding: '0.65rem 0.7rem', boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '256px', animation: 'fadeIn 0.12s ease-out' }}>

          {/* Selected text preview */}
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: 0, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            "{pending?.text ?? activeEx?.selectedText ?? ''}"
          </p>

          {/* Label */}
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {pending ? 'Adicionar como' : 'Trocar categoria'}
          </p>

          {/* Category grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            {CATS.map(cat => (
              <button
                key={cat.id}
                onClick={() => pending ? applyCategory(cat) : changeCategory(activeExId!, cat)}
                disabled={saving}
                style={{
                  background: activeEx?.category === cat.id ? `${COLORS[cat.color].bg}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeEx?.category === cat.id ? COLORS[cat.color].border + '60' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '7px', padding: '0.35rem 0.45rem',
                  cursor: saving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = activeEx?.category === cat.id ? `${COLORS[cat.color].bg}22` : 'rgba(255,255,255,0.05)' }}
              >
                <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{cat.emoji}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

          {/* Note input */}
          <input type="text" value={noteVal} onChange={e => setNoteVal(e.target.value)}
            placeholder="Adicionar nota..." onKeyDown={e => { if (e.key === 'Enter' && activeExId) saveNote() }}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', color: '#FFF', padding: '0.35rem 0.55rem', fontSize: '0.76rem', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
          />

          {/* Actions for existing extraction */}
          {activeExId && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => removeEx(activeExId)} style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: '7px', padding: '0.3rem 0', fontSize: '0.73rem', cursor: 'pointer', fontFamily: 'inherit' }}>Remover</button>
              <button onClick={saveNote} style={{ flex: 1, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93C5FD', borderRadius: '7px', padding: '0.3rem 0', fontSize: '0.73rem', cursor: 'pointer', fontFamily: 'inherit' }}>Salvar nota</button>
            </div>
          )}

          {/* Saving indicator */}
          {saving && (
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>Salvando no workspace…</p>
          )}

          {/* Arrow */}
          <div style={{ position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: '7px solid #18181B' }} />
        </div>
      )}
    </div>
  )
}
