'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, ChevronDown, ChevronUp, BookOpen, Sparkles, RefreshCw } from 'lucide-react'
import type { LibWork, LibCollection } from './page'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BrowseEntry {
  id:               string
  heading:          string | null
  content_excerpt:  string | null
  has_more_content: boolean
  bible_book:       string | null
  bible_chapter:    number | null
  bible_ref:        string | null
}

interface FullEntry {
  id:      string
  heading: string | null
  content: string | null
}

interface Translation { heading: string | null; content: string }

const ACCENT  = '#7C2D12'
const ACCENT_BG = '#FFF7ED'

const COLLECTION_ORDER = ['comentarios','dicionarios','enciclopedias','lexicos','concordancias','teologia','hermeneutica','pregacao','puritanos','reforma','patristica','historia','vida-crista']

const PT_BOOKS: Record<string, string> = {
  'Genesis': 'Gênesis','Exodus': 'Êxodo','Leviticus': 'Levítico','Numbers': 'Números',
  'Deuteronomy': 'Deuteronômio','Joshua': 'Josué','Judges': 'Juízes','Ruth': 'Rute',
  '1 Samuel': '1 Samuel','2 Samuel': '2 Samuel','1 Kings': '1 Reis','2 Kings': '2 Reis',
  '1 Chronicles': '1 Crônicas','2 Chronicles': '2 Crônicas','Ezra': 'Esdras','Nehemiah': 'Neemias',
  'Esther': 'Ester','Job': 'Jó','Psalms': 'Salmos','Proverbs': 'Provérbios',
  'Ecclesiastes': 'Eclesiastes','Song of Solomon': 'Cânticos','Isaiah': 'Isaías',
  'Jeremiah': 'Jeremias','Lamentations': 'Lamentações','Ezekiel': 'Ezequiel','Daniel': 'Daniel',
  'Hosea': 'Oséias','Joel': 'Joel','Amos': 'Amós','Obadiah': 'Obadias','Jonah': 'Jonas',
  'Micah': 'Miquéias','Nahum': 'Naum','Habakkuk': 'Habacuque','Zephaniah': 'Sofonias',
  'Haggai': 'Ageu','Zechariah': 'Zacarias','Malachi': 'Malaquias',
  'Matthew': 'Mateus','Mark': 'Marcos','Luke': 'Lucas','John': 'João','Acts': 'Atos',
  'Romans': 'Romanos','1 Corinthians': '1 Coríntios','2 Corinthians': '2 Coríntios',
  'Galatians': 'Gálatas','Ephesians': 'Efésios','Philippians': 'Filipenses',
  'Colossians': 'Colossenses','1 Thessalonians': '1 Tessalonicenses',
  '2 Thessalonians': '2 Tessalonicenses','1 Timothy': '1 Timóteo','2 Timothy': '2 Timóteo',
  'Titus': 'Tito','Philemon': 'Filemom','Hebrews': 'Hebreus','James': 'Tiago',
  '1 Peter': '1 Pedro','2 Peter': '2 Pedro','1 John': '1 João','2 John': '2 João',
  '3 John': '3 João','Jude': 'Judas','Revelation': 'Apocalipse',
}

function ptBook(en: string): string { return PT_BOOKS[en] ?? en }

// ── EntryCard ─────────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  workTitle,
  authorName,
  yearPublished,
  expanded,
  onToggle,
  fullEntry,
  loadingFull,
  onExpand,
  translation,
  translating,
  showPT,
  onTranslate,
  onToggleLang,
}: {
  entry:         BrowseEntry
  workTitle:     string
  authorName:    string | null
  yearPublished: number | null
  expanded:      boolean
  onToggle:      () => void
  fullEntry:     FullEntry | null
  loadingFull:   boolean
  onExpand:      () => void
  translation:   Translation | null
  translating:   boolean
  showPT:        boolean
  onTranslate:   () => void
  onToggleLang:  () => void
}) {
  const PREVIEW = 400
  const rawHead  = fullEntry?.heading ?? entry.heading
  const rawText  = fullEntry?.content ?? entry.content_excerpt ?? ''
  const dispHead = showPT && translation ? translation.heading : rawHead
  const dispText = showPT && translation ? translation.content : rawText

  const snippet  = dispText.slice(0, PREVIEW)
  const hasMore  = dispText.length > PREVIEW || (!fullEntry && entry.has_more_content)
  const src      = [authorName, yearPublished ? `(${yearPublished})` : null].filter(Boolean).join(' ')
  const ptActive = showPT && !!translation

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)' }}>
      {/* Header */}
      <div style={{ padding: '0.55rem 0.85rem 0.45rem', borderBottom: '1px solid var(--border-subtle)', background: ACCENT_BG }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ACCENT, lineHeight: 1.25 }}>{workTitle}</div>
        {src && <div style={{ fontSize: '0.63rem', color: '#9A6846', marginTop: '1px' }}>{src}</div>}
        {entry.bible_ref && (
          <div style={{ fontSize: '0.61rem', color: '#B45309', marginTop: '2px', fontWeight: 600, letterSpacing: '0.02em' }}>
            {entry.bible_ref}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '0.65rem 0.85rem' }}>
        {dispHead && (
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
            {dispHead}
          </div>
        )}

        {(loadingFull || translating) && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.3rem 0' }}>
            {loadingFull ? 'Carregando…' : 'Traduzindo…'}
          </div>
        )}

        {!loadingFull && !translating && (
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {dispText
              ? (expanded ? dispText : snippet) + (!expanded && hasMore ? '…' : '')
              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem conteúdo disponível</span>
            }
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.6rem', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Expand/collapse */}
          {(hasMore || expanded) && !loadingFull && !translating && (
            <button
              onClick={() => { if (!expanded) onExpand(); onToggle() }}
              style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.67rem', color: 'var(--text-muted)', padding: 0, fontFamily: 'inherit' }}
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? 'Recolher' : 'Ler mais'}
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            {/* PT/EN toggle */}
            <button
              onClick={ptActive ? onToggleLang : (translation ? onToggleLang : onTranslate)}
              disabled={translating || loadingFull}
              title={ptActive ? 'Mostrar original em inglês' : 'Traduzir para português'}
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: ptActive ? '#1E40AF10' : 'transparent',
                border: `1px solid ${ptActive ? '#1E40AF50' : '#94A3B840'}`,
                borderRadius: '5px', padding: '0.24rem 0.55rem',
                fontSize: '0.66rem', fontWeight: 700,
                color: ptActive ? '#1E40AF' : 'var(--text-muted)',
                cursor: (translating || loadingFull) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: (translating || loadingFull) ? 0.5 : 1,
                transition: 'all 0.12s',
              }}
            >
              {ptActive ? 'EN' : 'PT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  works:       LibWork[]
  collections: LibCollection[]
}

export default function LibraryClient({ works, collections }: Props) {
  const [selectedCol,  setSelectedCol]  = useState<string | null>(null)
  const [selectedWork, setSelectedWork] = useState<LibWork | null>(null)
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [query,        setQuery]        = useState('')
  const [draftQuery,   setDraftQuery]   = useState('')

  const [entries,      setEntries]      = useState<BrowseEntry[]>([])
  const [loading,      setLoading]      = useState(false)
  const [page,         setPage]         = useState(0)
  const [hasMore,      setHasMore]      = useState(false)
  const [total,        setTotal]        = useState<number | null>(null)
  const [loadingMore,  setLoadingMore]  = useState(false)

  const [books,        setBooks]        = useState<string[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)

  const [expanded,     setExpanded]     = useState<Set<string>>(new Set())
  const [fullEntries,  setFullEntries]  = useState<Map<string, FullEntry>>(new Map())
  const [loadingFull,  setLoadingFull]  = useState<Set<string>>(new Set())
  const [translations, setTranslations] = useState<Map<string, Translation>>(new Map())
  const [translating,  setTranslating]  = useState<Set<string>>(new Set())
  const [showingPT,    setShowingPT]    = useState<Set<string>>(new Set())

  const abortRef = useRef<AbortController | null>(null)

  // Sorted collections
  const sortedCollections = [...collections].sort((a, b) => {
    const ia = COLLECTION_ORDER.indexOf(a.slug)
    const ib = COLLECTION_ORDER.indexOf(b.slug)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  // Works in selected collection
  const colWorks = selectedCol
    ? works.filter(w => w.collection_slug === selectedCol)
    : works

  // ── Load entries ────────────────────────────────────────────────────────────

  const loadEntries = useCallback(async (workId: string | null, book: string | null, q: string, pageNum: number, append: boolean) => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    if (pageNum === 0) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams()
    if (workId)  params.set('work_id',    workId)
    if (book)    params.set('bible_book', book)
    if (q)       params.set('q',          q)
    params.set('page', String(pageNum))

    try {
      const res  = await fetch(`/api/library/browse?${params}`, { signal: ctrl.signal })
      const data = await res.json()
      if (append) setEntries(prev => [...prev, ...(data.entries ?? [])])
      else        setEntries(data.entries ?? [])
      setHasMore(data.hasMore ?? false)
      setTotal(data.total ?? null)
      setPage(pageNum)
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // ── Load bible books for selected work ──────────────────────────────────────

  useEffect(() => {
    if (!selectedWork) { setBooks([]); return }
    setLoadingBooks(true)
    fetch(`/api/library/books?work_id=${selectedWork.id}`)
      .then(r => r.json())
      .then(d => setBooks(d.books ?? []))
      .finally(() => setLoadingBooks(false))
  }, [selectedWork])

  // ── When work/book/query changes → reload entries ───────────────────────────

  useEffect(() => {
    setSelectedBook(null)
    setEntries([])
    setExpanded(new Set())
    setPage(0)
    setHasMore(false)
    setTotal(null)
    if (selectedWork) {
      loadEntries(selectedWork.id, null, query, 0, false)
    }
  }, [selectedWork]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setEntries([])
    setExpanded(new Set())
    setPage(0)
    setHasMore(false)
    if (selectedWork) {
      loadEntries(selectedWork.id, selectedBook, query, 0, false)
    }
  }, [selectedBook]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    setQuery(draftQuery)
    setEntries([])
    setExpanded(new Set())
    setPage(0)
    setHasMore(false)
    loadEntries(selectedWork?.id ?? null, selectedBook, draftQuery, 0, false)
  }

  function clearSearch() {
    setDraftQuery('')
    setQuery('')
    setEntries([])
    setExpanded(new Set())
    setPage(0)
    if (selectedWork) loadEntries(selectedWork.id, selectedBook, '', 0, false)
  }

  // ── Expand (load full content) ──────────────────────────────────────────────

  async function handleExpand(entryId: string) {
    if (fullEntries.has(entryId)) return
    setLoadingFull(prev => new Set(prev).add(entryId))
    try {
      const res = await fetch(`/api/library/entry?id=${entryId}`)
      const data = await res.json()
      setFullEntries(prev => new Map(prev).set(entryId, data))
    } finally {
      setLoadingFull(prev => { const s = new Set(prev); s.delete(entryId); return s })
    }
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  // ── Translate ────────────────────────────────────────────────────────────────

  async function handleTranslate(entry: BrowseEntry, workTitle: string) {
    const id = entry.id
    if (translations.has(id)) {
      setShowingPT(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
      return
    }
    setTranslating(prev => new Set(prev).add(id))
    setShowingPT(prev => new Set(prev).add(id))

    // Get content to translate
    const full = fullEntries.get(id)
    const content = full?.content ?? entry.content_excerpt ?? ''
    const heading = full?.heading ?? entry.heading ?? null

    try {
      const res = await fetch('/api/library/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: id, heading, content: content.slice(0, 3000) }),
      })
      if (res.ok) {
        const data = await res.json() as Translation
        setTranslations(prev => new Map(prev).set(id, data))
      } else {
        setShowingPT(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    } catch {
      setShowingPT(prev => { const s = new Set(prev); s.delete(id); return s })
    } finally {
      setTranslating(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  function toggleLang(id: string) {
    setShowingPT(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  // ── Work metadata lookup ─────────────────────────────────────────────────────

  function workOf(entry: BrowseEntry): LibWork | undefined {
    return selectedWork ?? undefined
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const hasSearch = !!query
  const colCounts: Record<string, number> = {}
  for (const w of works) {
    if (w.collection_slug) colCounts[w.collection_slug] = (colCounts[w.collection_slug] ?? 0) + 1
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--surface)', fontFamily: 'inherit' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', background: 'var(--surface)',
      }}>
        {/* Header */}
        <div style={{ padding: '1rem 1rem 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>
            Biblioteca Teológica
          </div>
        </div>

        {/* Collections */}
        <div style={{ padding: '0.5rem 0.5rem 0.25rem' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.25rem 0.5rem 0.15rem' }}>
            Coleções
          </div>
          {/* "All" option */}
          <SidebarItem
            label="Toda a Biblioteca"
            count={works.length}
            active={selectedCol === null && !selectedWork}
            onClick={() => { setSelectedCol(null); setSelectedWork(null); setEntries([]); setSelectedBook(null) }}
          />
          {sortedCollections.map(col => (
            <SidebarItem
              key={col.id}
              label={col.name}
              count={colCounts[col.slug] ?? 0}
              active={selectedCol === col.slug}
              onClick={() => {
                setSelectedCol(col.slug)
                setSelectedWork(null)
                setEntries([])
                setSelectedBook(null)
              }}
            />
          ))}
        </div>

        {/* Works in selected collection */}
        {(selectedCol !== null || true) && colWorks.length > 0 && (
          <div style={{ padding: '0.25rem 0.5rem 1rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.25rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0.4rem 0.5rem 0.15rem' }}>
              {selectedCol ? 'Obras' : 'Obras disponíveis'}
            </div>
            {colWorks.map(work => (
              <button
                key={work.id}
                onClick={() => setSelectedWork(work)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.4rem 0.65rem',
                  background: selectedWork?.id === work.id ? 'var(--accent-subtle)' : 'none',
                  border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (selectedWork?.id !== work.id) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (selectedWork?.id !== work.id) e.currentTarget.style.background = 'none' }}
              >
                <div style={{
                  fontSize: '0.75rem', fontWeight: selectedWork?.id === work.id ? 700 : 450,
                  color: selectedWork?.id === work.id ? 'var(--accent)' : 'var(--text-primary)',
                  lineHeight: 1.3,
                }}>
                  {work.title.length > 45 ? work.title.slice(0, 42) + '…' : work.title}
                </div>
                {work.author_name && (
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '1px', lineHeight: 1.2 }}>
                    {work.author_name.length > 30 ? work.author_name.slice(0, 27) + '…' : work.author_name}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* ── Main area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar: search + work info */}
        <div style={{ padding: '0.8rem 1.25rem 0.7rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, background: 'var(--surface)' }}>
          {selectedWork ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.6rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {selectedWork.title}
                </h1>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {[selectedWork.author_name, selectedWork.year_published ? `(${selectedWork.year_published})` : null, selectedWork.tradition].filter(Boolean).join(' · ')}
                  {total !== null && <span style={{ marginLeft: '0.5rem', color: 'var(--accent)', fontWeight: 600 }}>{total.toLocaleString('pt-BR')} entradas</span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                title="Fechar obra"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', borderRadius: '4px', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <h1 style={{ margin: '0 0 0.6rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {selectedCol
                ? sortedCollections.find(c => c.slug === selectedCol)?.name ?? 'Biblioteca'
                : 'Biblioteca Teológica'}
            </h1>
          )}

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                value={draftQuery}
                onChange={e => setDraftQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                placeholder={selectedWork ? `Buscar em ${selectedWork.title.slice(0,30)}…` : 'Buscar em toda a biblioteca…'}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  paddingLeft: '32px', paddingRight: draftQuery ? '32px' : '12px',
                  paddingTop: '8px', paddingBottom: '8px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.83rem', outline: 'none',
                  transition: 'border-color 0.12s',
                }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              {draftQuery && (
                <button
                  onClick={clearSearch}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px', display: 'flex' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              style={{ background: ACCENT, border: 'none', borderRadius: '8px', color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '0 1rem', flexShrink: 0 }}
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Bible book filter chips */}
        {selectedWork && books.length > 0 && (
          <div style={{
            padding: '0.5rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto', flexShrink: 0,
            display: 'flex', gap: '0.35rem', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', marginRight: '0.15rem' }}>
              Livro:
            </span>
            <Chip
              label="Todos"
              active={selectedBook === null}
              onClick={() => setSelectedBook(null)}
            />
            {books.map(book => (
              <Chip
                key={book}
                label={ptBook(book)}
                active={selectedBook === book}
                onClick={() => setSelectedBook(selectedBook === book ? null : book)}
              />
            ))}
          </div>
        )}

        {/* Entry list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* No work selected */}
          {!selectedWork && !hasSearch && (
            <EmptyState
              icon={<BookOpen size={40} strokeWidth={1} style={{ opacity: 0.15 }} />}
              title="Selecione uma obra"
              sub="Escolha uma coleção e uma obra na barra lateral para navegar pelos conteúdos."
            />
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '52px', background: ACCENT_BG, opacity: 0.6 }} />
                  <div style={{ padding: '0.7rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ height: '12px', borderRadius: '4px', background: 'var(--surface-2)', width: '80%' }} />
                    <div style={{ height: '10px', borderRadius: '4px', background: 'var(--surface-2)', width: '95%' }} />
                    <div style={{ height: '10px', borderRadius: '4px', background: 'var(--surface-2)', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && entries.length > 0 && (
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '-0.25rem' }}>
              {total !== null
                ? `${entries.length} de ${total.toLocaleString('pt-BR')} entradas${selectedBook ? ` em ${ptBook(selectedBook)}` : ''}`
                : `${entries.length} entrada${entries.length !== 1 ? 's' : ''}`}
            </div>
          )}

          {/* Entries */}
          {!loading && entries.map(entry => {
            const work = workOf(entry)
            return (
              <EntryCard
                key={entry.id}
                entry={entry}
                workTitle={work?.title ?? ''}
                authorName={work?.author_name ?? null}
                yearPublished={work?.year_published ?? null}
                expanded={expanded.has(entry.id)}
                onToggle={() => toggleExpand(entry.id)}
                fullEntry={fullEntries.get(entry.id) ?? null}
                loadingFull={loadingFull.has(entry.id)}
                onExpand={() => handleExpand(entry.id)}
                translation={translations.get(entry.id) ?? null}
                translating={translating.has(entry.id)}
                showPT={showingPT.has(entry.id)}
                onTranslate={() => handleTranslate(entry, work?.title ?? '')}
                onToggleLang={() => toggleLang(entry.id)}
              />
            )
          })}

          {/* Empty after search */}
          {!loading && entries.length === 0 && (selectedWork || hasSearch) && (
            <EmptyState
              icon={<Search size={32} strokeWidth={1} style={{ opacity: 0.15 }} />}
              title="Nenhum resultado"
              sub={hasSearch ? `Nenhuma entrada encontrada para "${query}".` : 'Esta obra ainda não possui entradas importadas.'}
            />
          )}

          {/* Load more */}
          {!loading && hasMore && (
            <button
              onClick={() => loadEntries(selectedWork?.id ?? null, selectedBook, query, page + 1, true)}
              disabled={loadingMore}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.65rem', background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '8px', cursor: loadingMore ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)',
                fontFamily: 'inherit', opacity: loadingMore ? 0.7 : 1,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background = 'var(--surface-3)' }}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
            >
              {loadingMore ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loadingMore ? 'Carregando…' : 'Carregar mais'}
            </button>
          )}

          <div style={{ height: '2rem' }} />
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────────────────────

function SidebarItem({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '0.38rem 0.65rem',
        background: active ? 'var(--accent-subtle)' : 'none',
        border: 'none', borderRadius: '6px',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none' }}
    >
      <span style={{ fontSize: '0.78rem', fontWeight: active ? 700 : 450, color: active ? 'var(--accent)' : 'var(--text-primary)', textAlign: 'left' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.25rem' }}>
        {count}
      </span>
    </button>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.22rem 0.65rem',
        background: active ? ACCENT : 'var(--surface-2)',
        color: active ? '#FFF' : 'var(--text-secondary)',
        border: `1px solid ${active ? ACCENT : 'var(--border)'}`,
        borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: '0.72rem', fontWeight: active ? 700 : 450,
        whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  )
}

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
      {icon}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px' }}>{sub}</div>
      </div>
    </div>
  )
}
