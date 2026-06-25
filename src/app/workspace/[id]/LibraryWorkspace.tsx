'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Sparkles, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import type { Project } from '@/types/database'

type Tab = 'comentarios' | 'dicionario'

interface LibEntry {
  entry_id: string
  heading:  string | null
  content:  string
  work_title:    string
  author_name:   string | null
  year_published: number | null
  bible_ref:     string | null
}

interface Props {
  project:  Project
  onAskAI: (prompt: string) => void
}

const COLOR = '#7C2D12'
const BG    = '#FFF7ED'

function parsePassage(ref: string): { chapter: number; verse: number | null } {
  const m = ref.trim().match(/^(\d+)(?:[.:](\d+))?/)
  if (!m) return { chapter: 1, verse: null }
  return { chapter: parseInt(m[1]), verse: m[2] ? parseInt(m[2]) : null }
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.6rem' }}>
      {[100, 80, 90].map((w, i) => (
        <div key={i} style={{
          borderRadius: '8px', overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ height: '38px', background: `${BG}`, opacity: 0.7 }} />
          <div style={{ padding: '0.55rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '10px', borderRadius: '3px', background: 'var(--surface-2)', width: `${w}%` }} />
            <div style={{ height: '10px', borderRadius: '3px', background: 'var(--surface-2)', width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryCard({
  entry, onSend, expanded, onToggle,
}: {
  entry:    LibEntry
  onSend:   () => void
  expanded: boolean
  onToggle: () => void
}) {
  const snippet = entry.content.slice(0, 300)
  const hasMore = entry.content.length > 300
  const src     = [entry.author_name, entry.year_published ? `(${entry.year_published})` : null].filter(Boolean).join(' ')

  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px', overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      <div style={{
        padding: '0.5rem 0.65rem 0.4rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: BG,
      }}>
        <div style={{ fontSize: '0.69rem', fontWeight: 700, color: COLOR, lineHeight: 1.2 }}>
          {entry.work_title}
        </div>
        {src && (
          <div style={{ fontSize: '0.61rem', color: '#9A6846', marginTop: '1px' }}>{src}</div>
        )}
        {entry.bible_ref && (
          <div style={{ fontSize: '0.59rem', color: '#B45309', marginTop: '2px', fontWeight: 600, letterSpacing: '0.02em' }}>
            {entry.bible_ref}
          </div>
        )}
      </div>

      <div style={{ padding: '0.55rem 0.65rem' }}>
        {entry.heading && (
          <div style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
            {entry.heading}
          </div>
        )}
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.62 }}>
          {expanded ? entry.content : snippet}
          {!expanded && hasMore && '…'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.45rem', gap: '0.4rem' }}>
          {hasMore && (
            <button
              onClick={onToggle}
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.63rem', color: 'var(--text-muted)',
                padding: 0, fontFamily: 'inherit',
              }}
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {expanded ? 'Recolher' : 'Expandir'}
            </button>
          )}
          <button
            onClick={onSend}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'transparent', border: `1px solid ${COLOR}40`,
              borderRadius: '5px', padding: '0.22rem 0.45rem',
              fontSize: '0.63rem', fontWeight: 700, color: COLOR,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = COLOR }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${COLOR}40` }}
          >
            <Sparkles size={10} strokeWidth={1.75} />
            Enviar ao Claude
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LibraryWorkspace({ project, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [tab,      setTab]      = useState<Tab>('comentarios')
  const [query,    setQuery]    = useState('')
  const [entries,  setEntries]  = useState<LibEntry[]>([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const { chapter, verse } = useMemo(
    () => parsePassage(project.passage_ref ?? ''),
    [project.passage_ref]
  )

  const passageLabel = `${project.book ?? ''} ${project.passage_ref ?? ''}`.trim()

  const loadCommentaries = useCallback(async () => {
    if (!project.book) return
    setLoading(true)
    setSearched(false)
    const { data } = await supabase.rpc('lib_get_commentaries', {
      p_bible_book: project.book,
      p_chapter:    chapter,
      p_verse:      verse,
    })
    setEntries((data ?? []) as LibEntry[])
    setLoading(false)
    setSearched(true)
  }, [supabase, project.book, chapter, verse])

  useEffect(() => {
    setEntries([])
    setQuery('')
    setExpanded(new Set())
    setSearched(false)
    if (tab === 'comentarios') loadCommentaries()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const search = useCallback(async () => {
    const q = query.trim()
    if (!q) {
      if (tab === 'comentarios') return loadCommentaries()
      return
    }
    setLoading(true)
    setSearched(false)

    if (tab === 'dicionario') {
      const { data } = await supabase.rpc('lib_search_refs', {
        p_term:       q,
        p_work_types: ['dictionary'],
      })
      setEntries((data ?? []) as LibEntry[])
    } else {
      const { data } = await supabase.rpc('lib_search', {
        p_query:         q,
        p_work_type:     'commentary',
        p_tradition:     null,
        p_bible_book:    null,
        p_bible_chapter: null,
        p_limit:         20,
      })
      setEntries((data ?? []) as LibEntry[])
    }

    setLoading(false)
    setSearched(true)
  }, [supabase, query, tab, loadCommentaries])

  function sendToAI(entry: LibEntry) {
    const src = [
      entry.author_name,
      entry.year_published ? `(${entry.year_published})` : null,
      `— ${entry.work_title}`,
    ].filter(Boolean).join(' ')
    const ref = entry.bible_ref ? ` [${entry.bible_ref}]` : ''
    onAskAI([
      `Fonte da Biblioteca Teológica Lampas: ${src}${ref}`,
      `Passagem em estudo: ${passageLabel}`,
      '',
      entry.heading ? `### ${entry.heading}` : '',
      entry.content.slice(0, 2500),
      '',
      `Com base neste texto clássico, analise sua relevância para a exegese e pregação de ${passageLabel}. Destaque os principais insights teológicos e aplicações pastorais.`,
    ].filter(Boolean).join('\n'))
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const emptyMsg = searched
    ? tab === 'comentarios'
      ? `Nenhum comentário encontrado para ${passageLabel}`
      : 'Nenhum resultado encontrado'
    : tab === 'dicionario'
      ? 'Digite um termo para buscar no dicionário'
      : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--surface)' }}>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {(['comentarios', 'dicionario'] as Tab[]).map(t => {
          const active = tab === t
          const label  = t === 'comentarios' ? 'Comentários' : 'Dicionários'
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '0.42rem 0.4rem',
                border: 'none',
                borderBottom: active ? `2px solid ${COLOR}` : '2px solid transparent',
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', fontWeight: active ? 700 : 400,
                color: active ? COLOR : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div style={{ padding: '0.5rem 0.55rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={11}
              strokeWidth={2}
              style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search() }}
              placeholder={tab === 'comentarios' ? 'Buscar nos comentários…' : 'Buscar no dicionário…'}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: '26px', paddingRight: query ? '26px' : '8px',
                paddingTop: '6px', paddingBottom: '6px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.77rem', outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = COLOR)}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  if (tab === 'comentarios') loadCommentaries()
                  else { setEntries([]); setSearched(false) }
                }}
                style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
              >
                <X size={10} />
              </button>
            )}
          </div>
          <button
            onClick={search}
            style={{
              background: COLOR, border: 'none', borderRadius: '6px',
              color: '#FFF', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.71rem', fontWeight: 700, padding: '0 0.55rem', flexShrink: 0,
            }}
          >
            Buscar
          </button>
        </div>

        {tab === 'comentarios' && !query && (
          <div style={{ marginTop: '0.3rem', fontSize: '0.61rem', color: COLOR, fontWeight: 600 }}>
            Passagem: {passageLabel}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>

        {loading && <Skeleton />}

        {!loading && (entries.length === 0 || (!searched && tab === 'dicionario')) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%', color: 'var(--text-muted)' }}>
            <BookOpen size={26} strokeWidth={1} style={{ opacity: 0.2 }} />
            {emptyMsg && <span style={{ fontSize: '0.78rem', textAlign: 'center', padding: '0 1rem' }}>{emptyMsg}</span>}
          </div>
        )}

        {!loading && entries.length > 0 && entries.map(entry => (
          <EntryCard
            key={entry.entry_id}
            entry={entry}
            expanded={expanded.has(entry.entry_id)}
            onToggle={() => toggleExpand(entry.entry_id)}
            onSend={() => sendToAI(entry)}
          />
        ))}
      </div>
    </div>
  )
}
