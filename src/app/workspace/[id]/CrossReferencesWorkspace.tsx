'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/database'
import {
  CROSS_REF_SEED,
  REF_TYPE_LABELS,
  parseRef,
  type CrossRefGroup,
  type RefType,
} from '@/lib/cross-references-seed'
import { Search, X, ChevronDown } from 'lucide-react'

interface Props {
  project: Project
  onAskAI: (prompt: string) => void
}

type FilterType = RefType | 'all'

const COLOR  = '#4B5999'
const BG_ACT = `rgba(75,89,153,0.1)`

const TYPE_PILLS: { id: FilterType; label: string }[] = [
  { id: 'all',         label: 'Todos' },
  { id: 'paralelo',    label: 'Paralelos' },
  { id: 'citacao',     label: 'Citações' },
  { id: 'alusao',      label: 'Alusões' },
  { id: 'tipologia',   label: 'Tipologia' },
  { id: 'cristologica',label: 'Cristológicas' },
  { id: 'redencao',    label: 'Hist. Redenção' },
  { id: 'alianca',     label: 'Alianças' },
  { id: 'tema',        label: 'Tema' },
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseChapter(passageRef: string): { chapter: number; verseStart: number; verseEnd: number } | null {
  const m = passageRef.trim().match(/^(\d+)(?:\.(\d+)(?:-(\d+))?)?/)
  if (!m) return null
  const chapter    = parseInt(m[1])
  const verseStart = m[2] ? parseInt(m[2]) : 1
  const verseEnd   = m[3] ? parseInt(m[3]) : m[2] ? verseStart : 999
  return { chapter, verseStart, verseEnd }
}

function getFromSeed(book: string, chapter: number, verseStart: number, verseEnd: number): CrossRefGroup[] {
  const groups: CrossRefGroup[] = []
  for (const entry of CROSS_REF_SEED) {
    if (entry.sourceBook.toLowerCase() !== book.toLowerCase()) continue
    if (entry.sourceChapter !== chapter) continue
    if (entry.sourceVerseEnd < verseStart || entry.sourceVerseStart > verseEnd) continue
    for (const g of entry.groups) {
      if (!groups.find(x => x.concept === g.concept)) groups.push(g)
    }
  }
  return groups
}

// ── Verse popup ──────────────────────────────────────────────────────────────

interface VersePopupProps {
  refText: string
  onClose: () => void
}

function VersePopup({ refText, onClose }: VersePopupProps) {
  const [verses, setVerses]   = useState<{ v: number; t: string }[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parsed = parseRef(refText)
    if (!parsed) { setError(true); setLoading(false); return }

    void (async () => {
      try {
        const res = await fetch('/api/bible/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book: parsed.book, passageRef: parsed.passageRef, version: 'ARC' }),
        })
        if (!res.ok) throw new Error()
        const json = await res.json() as { verses?: { v: number; t: string }[] }
        setVerses(json.verses ?? null)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [refText])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        width: 'min(520px, 92vw)',
        maxHeight: '72vh',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: BG_ACT, flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: COLOR, flex: 1 }}>
            {refText}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.1rem' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.1rem 1.25rem' }}>
          {loading && (
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>Carregando...</p>
          )}
          {error && (
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              Não foi possível carregar o texto de {refText}.
            </p>
          )}
          {!loading && !error && !verses?.length && (
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              Texto não encontrado.
            </p>
          )}
          {verses?.map(v => (
            <p key={v.v} style={{
              fontSize: '0.93rem', lineHeight: 1.75, color: 'var(--text-primary)',
              margin: '0 0 0.6rem',
              fontFamily: 'var(--font-serif)',
            }}>
              <sup style={{ fontSize: '0.65rem', fontWeight: 700, color: COLOR, marginRight: '0.25rem' }}>{v.v}</sup>
              {v.t}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CrossReferencesWorkspace({ project, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const passage  = `${project.book} ${project.passage_ref}`
  const parsed   = useMemo(() => parseChapter(project.passage_ref), [project.passage_ref])

  const [groups,     setGroups]     = useState<CrossRefGroup[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [search,     setSearch]     = useState('')
  const [popupRef,   setPopupRef]   = useState<string | null>(null)

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadRefs = useCallback(async () => {
    if (!parsed) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('cross_references')
        .select('concept, ref_type, target_refs')
        .eq('source_book', project.book)
        .eq('source_chapter', parsed.chapter)
        .lte('source_verse_start', parsed.verseEnd)
        .gte('source_verse_end', parsed.verseStart)

      if (data && data.length > 0) {
        const merged: CrossRefGroup[] = []
        for (const row of data as { concept: string; ref_type: string; target_refs: string[] }[]) {
          if (!merged.find(g => g.concept === row.concept)) {
            merged.push({ concept: row.concept, type: row.ref_type as RefType, refs: row.target_refs })
          }
        }
        setGroups(merged)
      } else {
        // Fallback to static seed
        setGroups(getFromSeed(project.book, parsed.chapter, parsed.verseStart, parsed.verseEnd))
      }
    } catch {
      setGroups(getFromSeed(project.book, parsed.chapter, parsed.verseStart, parsed.verseEnd))
    } finally {
      setLoading(false)
    }
  }, [supabase, project.book, parsed])

  useEffect(() => { void loadRefs() }, [loadRefs])

  // ── Filtered groups ────────────────────────────────────────────────────────

  const displayed = useMemo(() => {
    let list = groups
    if (filterType !== 'all') list = list.filter(g => g.type === filterType)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list
        .map(g => ({ ...g, refs: g.refs.filter(r => r.toLowerCase().includes(q) || g.concept.toLowerCase().includes(q)) }))
        .filter(g => g.refs.length > 0 || g.concept.toLowerCase().includes(q))
    }
    return list
  }, [groups, filterType, search])

  const totalRefs = useMemo(() => groups.reduce((n, g) => n + g.refs.length, 0), [groups])

  // ── AI prompt ─────────────────────────────────────────────────────────────

  function askAI() {
    onAskAI([
      `Gere referências cruzadas estruturadas para ${passage}.`,
      `Organize em grupos por conceito.`,
      `Para cada grupo, informe: conceito, tipo (paralelo/citacao/alusao/tema/tipologia/cristologica/redencao/alianca) e lista de referências no formato abreviado (ex: Dt 7.6, Rm 8.29).`,
      `Baseie-se no Treasury of Scripture Knowledge, Thompson Chain Reference e Bíblia de Estudo de Genebra.`,
      `Inclua de 5 a 10 grupos. Conexão Escritura com Escritura apenas — sem comentários teológicos extensos.`,
    ].join(' '))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '1.75rem clamp(1rem, 3vw, 2rem) 4rem' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.62rem', color: COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.25rem' }}>
            Ferramentas
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.2rem' }}>
                Referências Cruzadas
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Escritura interpreta Escritura · {totalRefs} referências em {groups.length} grupos
              </p>
            </div>
            <div style={{
              flexShrink: 0,
              border: `1px solid ${COLOR}`,
              background: BG_ACT,
              color: COLOR,
              borderRadius: '7px',
              padding: '0.42rem 0.72rem',
              fontSize: '0.78rem', fontWeight: 800,
              whiteSpace: 'nowrap',
            }}>
              {passage}
            </div>
          </div>
        </header>

        {/* ── Filtros ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar referências ou conceitos..."
              style={{
                width: '100%', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: '7px',
                color: 'var(--text-primary)', fontFamily: 'inherit',
                fontSize: '0.83rem', padding: '0.52rem 0.75rem 0.52rem 2rem',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = COLOR }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '0.1rem' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Tipo pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {TYPE_PILLS.map(pill => {
            const active = filterType === pill.id
            return (
              <button
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                style={{
                  border: `1px solid ${active ? COLOR : 'var(--border-subtle)'}`,
                  background: active ? BG_ACT : 'transparent',
                  color: active ? COLOR : 'var(--text-muted)',
                  borderRadius: '5px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: active ? 700 : 400,
                  padding: '0.26rem 0.58rem', transition: 'all 0.12s',
                }}
              >
                {pill.label}
              </button>
            )
          })}
        </div>

        {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', padding: '2rem 0' }}>
            Carregando referências...
          </div>
        ) : displayed.length === 0 && groups.length === 0 ? (
          /* Estado vazio — sem dados */
          <div style={{
            border: '1px dashed var(--border-subtle)', borderRadius: '8px',
            padding: '2.5rem 1.5rem', textAlign: 'center',
            color: 'var(--text-muted)', background: 'var(--surface)',
          }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem', opacity: 0.4 }}>⊕</div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Ainda sem referências cruzadas cadastradas para <strong>{passage}</strong>.
            </p>
            <button
              onClick={askAI}
              style={{
                background: COLOR, border: 'none', borderRadius: '7px',
                color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.82rem', fontWeight: 700, padding: '0.55rem 1rem',
              }}
            >
              Solicitar referências à IA
            </button>
            <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
              A IA gera as referências baseadas em TSK e Thompson Chain.
            </p>
          </div>
        ) : displayed.length === 0 ? (
          /* Filtro ativo sem resultados */
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', padding: '1.5rem 0' }}>
            Nenhuma referência corresponde ao filtro atual.
          </div>
        ) : (
          /* Grupos de referências */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {displayed.map(group => (
              <RefGroup
                key={group.concept}
                group={group}
                accentColor={COLOR}
                onRefClick={setPopupRef}
              />
            ))}
          </div>
        )}

        {/* ── Rodapé com ação IA (quando há dados) ─────────────────────────── */}
        {groups.length > 0 && (
          <div style={{ marginTop: '1.75rem', paddingTop: '1.1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={askAI}
              style={{
                background: 'transparent', border: `1px solid ${COLOR}`, borderRadius: '7px',
                color: COLOR, cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.78rem', fontWeight: 700, padding: '0.5rem 0.85rem',
              }}
            >
              Ampliar referências com IA
            </button>
          </div>
        )}
      </div>

      {/* ── Popup de versículo ──────────────────────────────────────────────── */}
      {popupRef && (
        <VersePopup refText={popupRef} onClose={() => setPopupRef(null)} />
      )}
    </div>
  )
}

// ── RefGroup ─────────────────────────────────────────────────────────────────

function RefGroup({ group, accentColor, onRefClick }: {
  group: CrossRefGroup
  accentColor: string
  onRefClick: (ref: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const typeLabel = REF_TYPE_LABELS[group.type] ?? group.type

  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      background: 'var(--surface)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {/* Group header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', border: 'none', cursor: 'pointer',
          background: 'var(--surface)', display: 'flex', alignItems: 'center',
          gap: '0.6rem', padding: '0.7rem 0.9rem', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          {group.concept}
        </span>
        <span style={{
          fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: accentColor,
          background: `${accentColor}12`, borderRadius: '4px',
          padding: '0.15rem 0.42rem', flexShrink: 0,
        }}>
          {typeLabel}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          {group.refs.length}
        </span>
        <ChevronDown
          size={13}
          style={{
            color: 'var(--text-muted)', flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Refs */}
      {expanded && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.38rem',
          padding: '0 0.9rem 0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.7rem',
        }}>
          {group.refs.map(ref => (
            <button
              key={ref}
              onClick={() => onRefClick(ref)}
              title={`Ver ${ref}`}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '5px',
                color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.78rem', fontWeight: 500,
                padding: '0.3rem 0.55rem',
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = accentColor
                e.currentTarget.style.color = accentColor
                e.currentTarget.style.background = `${accentColor}0C`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)'
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'var(--surface-2)'
              }}
            >
              {ref}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
