'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X, ChevronDown, ChevronUp, ChevronLeft, BookOpen, RefreshCw } from 'lucide-react'

interface LibWork {
  id:             string
  title:          string
  author_name:    string | null
  year_published: number | null
  collection_name: string | null
}

interface LibEntry {
  id:              string
  heading:         string | null
  content_excerpt: string | null
  bible_ref:       string | null
  bible_book:      string | null
}

const ACCENT = '#7C2D12'
const ACCENT_BG = '#FFF7ED'

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[90, 75, 85].map((w, i) => (
        <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ height: '36px', background: ACCENT_BG, opacity: 0.6 }} />
          <div style={{ padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div style={{ height: '11px', borderRadius: '3px', background: '#F1F5F9', width: `${w}%` }} />
            <div style={{ height: '10px', borderRadius: '3px', background: '#F1F5F9', width: '65%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryCard({ entry, expanded, onToggle }: {
  entry: LibEntry
  expanded: boolean
  onToggle: () => void
}) {
  const PREVIEW = 480
  const text    = entry.content_excerpt ?? ''
  const snippet = text.slice(0, PREVIEW)
  const hasMore = text.length > PREVIEW

  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ padding: '0.55rem 0.85rem 0.45rem', background: ACCENT_BG, borderBottom: '1px solid #FDDCBB' }}>
        {entry.bible_ref && (
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: ACCENT, letterSpacing: '0.02em' }}>
            {entry.bible_ref}
          </div>
        )}
      </div>
      <div style={{ padding: '0.65rem 0.85rem' }}>
        {entry.heading && (
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.35rem', lineHeight: 1.35 }}>
            {entry.heading}
          </div>
        )}
        {text && (
          <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {(expanded ? text : snippet) + (!expanded && hasMore ? '…' : '')}
          </div>
        )}
        {(hasMore || expanded) && (
          <button
            onClick={onToggle}
            style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.67rem', color: '#94A3B8', padding: '0.4rem 0 0', fontFamily: 'inherit' }}
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {expanded ? 'Recolher' : 'Ver mais'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function BibliotecaTeologica() {
  const supabase = createClient()

  const [works,        setWorks]        = useState<LibWork[]>([])
  const [worksLoading, setWorksLoading] = useState(true)
  const [workQuery,    setWorkQuery]    = useState('')

  const [selected,    setSelected]    = useState<LibWork | null>(null)
  const [entries,     setEntries]     = useState<LibEntry[]>([])
  const [entLoading,  setEntLoading]  = useState(false)
  const [entQuery,    setEntQuery]    = useState('')
  const [entDraft,    setEntDraft]    = useState('')
  const [page,        setPage]        = useState(0)
  const [hasMore,     setHasMore]     = useState(false)
  const [total,       setTotal]       = useState<number | null>(null)
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set())

  // Load works
  useEffect(() => {
    let mounted = true
    async function load() {
      setWorksLoading(true)
      const { data } = await supabase
        .from('lib_works')
        .select('id, title, year_published, lib_authors(name), lib_collections(name)')
        .order('title')
      if (!mounted) return
      const mapped: LibWork[] = (data ?? []).map((w: {
        id: string; title: string; year_published: number | null
        lib_authors: { name: string }[] | { name: string } | null
        lib_collections: { name: string }[] | { name: string } | null
      }) => {
        const aut = Array.isArray(w.lib_authors) ? w.lib_authors[0] : w.lib_authors
        const col = Array.isArray(w.lib_collections) ? w.lib_collections[0] : w.lib_collections
        return { id: w.id, title: w.title, year_published: w.year_published, author_name: aut?.name ?? null, collection_name: col?.name ?? null }
      })
      setWorks(mapped)
      setWorksLoading(false)
    }
    void load()
    return () => { mounted = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadEntries = useCallback(async (work: LibWork, pageNum: number, append: boolean, q = '') => {
    setEntLoading(true)
    const params = new URLSearchParams({ work_id: work.id, page: String(pageNum) })
    if (q) params.set('q', q)
    const res = await fetch(`/api/library/browse?${params}`)
    if (!res.ok) { setEntLoading(false); return }
    const data = await res.json() as { entries: LibEntry[]; hasMore: boolean; total: number }
    if (append) setEntries(prev => [...prev, ...(data.entries ?? [])])
    else        setEntries(data.entries ?? [])
    setHasMore(data.hasMore ?? false)
    setTotal(data.total ?? null)
    setPage(pageNum)
    setEntLoading(false)
  }, [])

  function selectWork(work: LibWork) {
    setSelected(work)
    setEntries([])
    setExpanded(new Set())
    setPage(0)
    setEntDraft('')
    setEntQuery('')
    void loadEntries(work, 0, false, '')
  }

  function search() {
    if (!selected) return
    setEntries([])
    setExpanded(new Set())
    setPage(0)
    setEntQuery(entDraft)
    void loadEntries(selected, 0, false, entDraft)
  }

  const filteredWorks = workQuery.trim()
    ? works.filter(w =>
        w.title.toLowerCase().includes(workQuery.toLowerCase()) ||
        (w.author_name ?? '').toLowerCase().includes(workQuery.toLowerCase())
      )
    : works

  // Group works by collection
  const grouped = filteredWorks.reduce<Record<string, LibWork[]>>((acc, w) => {
    const key = w.collection_name ?? 'Outros'
    acc[key] = [...(acc[key] ?? []), w]
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Sidebar: works list ── */}
      <aside style={{
        width: '280px', flexShrink: 0,
        borderRight: '1px solid #E2E8F0',
        background: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Search works */}
        <div style={{ padding: '0.7rem 0.7rem 0.5rem', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              value={workQuery}
              onChange={e => setWorkQuery(e.target.value)}
              placeholder="Buscar obra ou autor…"
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: '1.75rem', paddingRight: workQuery ? '1.75rem' : '0.6rem',
                paddingTop: '0.42rem', paddingBottom: '0.42rem',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '7px', fontSize: '0.79rem',
                fontFamily: 'inherit', outline: 'none', color: '#1E293B',
              }}
              onFocus={e => (e.target.style.borderColor = ACCENT)}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
            {workQuery && (
              <button onClick={() => setWorkQuery('')} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}>
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Works */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {worksLoading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8' }}>Carregando obras…</div>
          ) : Object.entries(grouped).map(([colName, colWorks]) => (
            <div key={colName}>
              <div style={{ padding: '0.55rem 0.75rem 0.2rem', fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {colName}
              </div>
              {colWorks.map(work => {
                const active = selected?.id === work.id
                return (
                  <button
                    key={work.id}
                    onClick={() => selectWork(work)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.38rem 0.75rem 0.38rem 1rem',
                      border: 'none',
                      borderLeft: `2px solid ${active ? ACCENT : 'transparent'}`,
                      background: active ? ACCENT_BG : 'transparent',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ fontSize: '0.79rem', fontWeight: active ? 700 : 500, color: active ? '#92400E' : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                      {work.title}
                    </div>
                    {work.author_name && (
                      <div style={{ fontSize: '0.65rem', color: active ? '#D97706' : '#94A3B8', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {work.author_name}{work.year_published ? ` · ${work.year_published}` : ''}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
          {!worksLoading && filteredWorks.length === 0 && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
              Nenhuma obra encontrada.
            </div>
          )}
        </div>
      </aside>

      {/* ── Main: entries ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFF' }}>

        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#94A3B8', padding: '2rem' }}>
            <BookOpen size={40} strokeWidth={1} style={{ opacity: 0.15 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B', marginBottom: '0.3rem' }}>Selecione uma obra</div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '320px' }}>
                {works.length > 0
                  ? `${works.length} obra${works.length !== 1 ? 's' : ''} disponíveis na Biblioteca Teológica`
                  : 'Nenhuma obra importada ainda.'}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Work header */}
            <div style={{ padding: '0.85rem 1.5rem 0.75rem', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
                    {selected.title}
                  </h2>
                  <div style={{ fontSize: '0.77rem', color: '#64748B', marginTop: '2px' }}>
                    {[selected.author_name, selected.year_published ? `(${selected.year_published})` : null, total !== null ? `${total.toLocaleString('pt-BR')} entradas` : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <button
                  onClick={() => { setSelected(null); setEntries([]) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', display: 'flex', borderRadius: '4px', flexShrink: 0 }}
                  title="Fechar obra"
                  onMouseEnter={e => { e.currentTarget.style.color = '#334155' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search entries */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    value={entDraft}
                    onChange={e => setEntDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') search() }}
                    placeholder={`Buscar em ${selected.title.slice(0, 30)}…`}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      paddingLeft: '32px', paddingRight: entDraft ? '32px' : '12px',
                      paddingTop: '8px', paddingBottom: '8px',
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '8px', fontSize: '0.83rem',
                      fontFamily: 'inherit', outline: 'none', color: '#1E293B',
                    }}
                    onFocus={e => (e.target.style.borderColor = ACCENT)}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                  {entDraft && (
                    <button
                      onClick={() => { setEntDraft(''); setEntQuery(''); void loadEntries(selected, 0, false, '') }}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '3px', display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  onClick={search}
                  style={{ background: ACCENT, border: 'none', borderRadius: '8px', color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '0 1rem', flexShrink: 0 }}
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Entries list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {entLoading && <Skeleton />}

              {!entLoading && entries.length > 0 && (
                <>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '-0.15rem' }}>
                    {entries.length}{total !== null ? ` de ${total.toLocaleString('pt-BR')}` : ''} entradas{entQuery ? ` para "${entQuery}"` : ''}
                  </div>
                  {entries.map(entry => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      expanded={expanded.has(entry.id)}
                      onToggle={() => setExpanded(prev => {
                        const s = new Set(prev)
                        s.has(entry.id) ? s.delete(entry.id) : s.add(entry.id)
                        return s
                      })}
                    />
                  ))}
                  {hasMore && (
                    <button
                      onClick={() => void loadEntries(selected, page + 1, true, entQuery)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        padding: '0.65rem', background: '#FFFFFF', border: '1px solid #E2E8F0',
                        borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: '0.82rem', fontWeight: 500, color: '#64748B',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
                    >
                      <RefreshCw size={13} /> Carregar mais
                    </button>
                  )}
                </>
              )}

              {!entLoading && entries.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '3rem 1rem', color: '#94A3B8' }}>
                  <BookOpen size={36} strokeWidth={1} style={{ opacity: 0.15 }} />
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Nenhuma entrada encontrada.</div>
                </div>
              )}
              <div style={{ height: '2rem' }} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
