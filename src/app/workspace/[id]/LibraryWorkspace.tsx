'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Sparkles, X, ChevronDown, ChevronUp, BookOpen, RefreshCw, AlertCircle, ChevronLeft } from 'lucide-react'
import type { Project } from '@/types/database'

type Tab = 'comentarios' | 'dicionario'

interface LibWork {
  id:             string
  title:          string
  author_name:    string | null
  year_published: number | null
}

interface LibEntry {
  entry_id:        string
  heading:         string | null
  content:         string | null
  content_excerpt?: string | null
  work_title:      string | null
  author_name:     string | null
  year_published:  number | null
  bible_ref:       string | null
}

interface Props {
  project:  Project
  onAskAI: (prompt: string) => void
}

const COLOR = '#7C2D12'
const BG    = '#FFF7ED'

const PT_TO_EN: Record<string, string> = {
  'Gênesis': 'Genesis', 'Êxodo': 'Exodus', 'Levítico': 'Leviticus',
  'Números': 'Numbers', 'Deuteronômio': 'Deuteronomy', 'Josué': 'Joshua',
  'Juízes': 'Judges', 'Rute': 'Ruth', '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
  '1 Reis': '1 Kings', '2 Reis': '2 Kings', '1 Crônicas': '1 Chronicles',
  '2 Crônicas': '2 Chronicles', 'Esdras': 'Ezra', 'Neemias': 'Nehemiah',
  'Ester': 'Esther', 'Jó': 'Job', 'Salmos': 'Psalms', 'Provérbios': 'Proverbs',
  'Eclesiastes': 'Ecclesiastes', 'Cânticos': 'Song of Solomon',
  'Cântico dos Cânticos': 'Song of Solomon', 'Isaías': 'Isaiah',
  'Jeremias': 'Jeremiah', 'Lamentações': 'Lamentations', 'Ezequiel': 'Ezekiel',
  'Daniel': 'Daniel', 'Oséias': 'Hosea', 'Joel': 'Joel', 'Amós': 'Amos',
  'Obadias': 'Obadiah', 'Jonas': 'Jonah', 'Miquéias': 'Micah', 'Naum': 'Nahum',
  'Habacuque': 'Habakkuk', 'Sofonias': 'Zephaniah', 'Ageu': 'Haggai',
  'Zacarias': 'Zechariah', 'Malaquias': 'Malachi',
  'Mateus': 'Matthew', 'Marcos': 'Mark', 'Lucas': 'Luke', 'João': 'John',
  'Atos': 'Acts', 'Romanos': 'Romans', '1 Coríntios': '1 Corinthians',
  '2 Coríntios': '2 Corinthians', 'Gálatas': 'Galatians', 'Efésios': 'Ephesians',
  'Filipenses': 'Philippians', 'Colossenses': 'Colossians',
  '1 Tessalonicenses': '1 Thessalonians', '2 Tessalonicenses': '2 Thessalonians',
  '1 Timóteo': '1 Timothy', '2 Timóteo': '2 Timothy', 'Tito': 'Titus',
  'Filemom': 'Philemon', 'Hebreus': 'Hebrews', 'Tiago': 'James',
  '1 Pedro': '1 Peter', '2 Pedro': '2 Peter', '1 João': '1 John',
  '2 João': '2 John', '3 João': '3 John', 'Judas': 'Jude',
  'Apocalipse': 'Revelation',
}

function toEnBook(ptBook: string): string {
  return PT_TO_EN[ptBook] ?? ptBook
}

function parsePassage(ref: string): { chapter: number; verse: number | null } {
  const m = ref.trim().match(/^(\d+)(?:[.:](\d+))?/)
  if (!m) return { chapter: 1, verse: null }
  return { chapter: parseInt(m[1]), verse: m[2] ? parseInt(m[2]) : null }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.6rem' }}>
      {[100, 80, 90].map((w, i) => (
        <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div style={{ height: '38px', background: BG, opacity: 0.7 }} />
          <div style={{ padding: '0.55rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '10px', borderRadius: '3px', background: 'var(--surface-2)', width: `${w}%` }} />
            <div style={{ height: '10px', borderRadius: '3px', background: 'var(--surface-2)', width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

interface Translation { heading: string | null; content: string }

// ── EntryCard ─────────────────────────────────────────────────────────────────

function EntryCard({
  entry, onSend, onTranslate, expanded, onToggle, translation, translating, showPT, onToggleLang,
}: {
  entry:        LibEntry
  onSend:       () => void
  onTranslate:  () => void
  expanded:     boolean
  onToggle:     () => void
  translation:  Translation | null
  translating:  boolean
  showPT:       boolean
  onToggleLang: () => void
}) {
  const PREVIEW = 320
  const rawText  = entry.content ?? entry.content_excerpt ?? ''
  const dispHead = showPT && translation ? translation.heading : entry.heading
  const dispText = showPT && translation ? translation.content : rawText
  const snippet  = dispText.slice(0, PREVIEW)
  const hasMore  = dispText.length > PREVIEW
  const src = [entry.author_name, entry.year_published ? `(${entry.year_published})` : null].filter(Boolean).join(' ')

  const ptActive = showPT && !!translation

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface)', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '0.5rem 0.7rem 0.4rem', borderBottom: '1px solid var(--border-subtle)', background: BG }}>
        <div style={{ fontSize: '0.69rem', fontWeight: 700, color: COLOR, lineHeight: 1.25 }}>
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

      {/* Body */}
      <div style={{ padding: '0.55rem 0.7rem' }}>
        {dispHead && (
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.3 }}>
            {dispHead}
          </div>
        )}

        {translating && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.3rem 0' }}>
            Traduzindo…
          </div>
        )}

        {!translating && (
          <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {dispText
              ? (expanded ? dispText : snippet) + (!expanded && hasMore ? '…' : '')
              : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Conteúdo não disponível</span>
            }
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.4rem', flexWrap: 'wrap' }}>
          {hasMore && !translating && (
            <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.63rem', color: 'var(--text-muted)', padding: 0, fontFamily: 'inherit' }}>
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {expanded ? 'Recolher' : 'Ver mais'}
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>

            {/* PT/EN toggle */}
            <button
              onClick={ptActive ? onToggleLang : (translation ? onToggleLang : onTranslate)}
              disabled={translating}
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: ptActive ? '#1E40AF10' : 'transparent',
                border: `1px solid ${ptActive ? '#1E40AF50' : '#94A3B840'}`,
                borderRadius: '5px', padding: '0.22rem 0.5rem',
                fontSize: '0.63rem', fontWeight: 700,
                color: ptActive ? '#1E40AF' : 'var(--text-muted)',
                cursor: translating ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: translating ? 0.5 : 1,
                transition: 'all 0.12s',
              }}
              title={ptActive ? 'Mostrar original em inglês' : 'Traduzir para português'}
            >
              {ptActive ? 'EN' : 'PT'}
            </button>

            {/* Enviar ao Claude */}
            <button
              onClick={onSend}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: `1px solid ${COLOR}40`, borderRadius: '5px', padding: '0.22rem 0.5rem', fontSize: '0.63rem', fontWeight: 700, color: COLOR, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = COLOR }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${COLOR}40` }}
            >
              <Sparkles size={10} strokeWidth={1.75} />
              Enviar ao Claude
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LibraryWorkspace({ project, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [tab,          setTab]          = useState<Tab>('comentarios')
  const [query,        setQuery]        = useState('')
  const [entries,      setEntries]      = useState<LibEntry[]>([])
  const [loading,      setLoading]      = useState(false)
  const [status,       setStatus]       = useState<'idle' | 'loaded' | 'error'>('idle')
  const [rpcError,     setRpcError]     = useState<string | null>(null)
  const [expanded,     setExpanded]     = useState<Set<string>>(new Set())
  const [translations, setTranslations] = useState<Map<string, Translation>>(new Map())
  const [translating,  setTranslating]  = useState<Set<string>>(new Set())
  const [showingPT,    setShowingPT]    = useState<Set<string>>(new Set())

  // ── Library browser (aba Dicionários) ─────────────────────────────────────
  const [libWorks,       setLibWorks]       = useState<LibWork[]>([])
  const [libWorksLoaded, setLibWorksLoaded] = useState(false)
  const [libWorksLoading,setLibWorksLoading]= useState(false)
  const [selectedLib,    setSelectedLib]    = useState<LibWork | null>(null)
  const [libEntries,     setLibEntries]     = useState<LibEntry[]>([])
  const [libLoading,     setLibLoading]     = useState(false)
  const [libQuery,       setLibQuery]       = useState('')
  const [libDraft,       setLibDraft]       = useState('')
  const [libPage,        setLibPage]        = useState(0)
  const [libHasMore,     setLibHasMore]     = useState(false)
  const [libTotal,       setLibTotal]       = useState<number | null>(null)
  const [libExpanded,    setLibExpanded]    = useState<Set<string>>(new Set())

  const { chapter } = useMemo(() => parsePassage(project.passage_ref ?? ''), [project.passage_ref])
  const passageLabel = `${project.book ?? ''} ${project.passage_ref ?? ''}`.trim()

  // ── Load commentaries for current passage ─────────────────────────────────

  const loadCommentaries = useCallback(async () => {
    if (!project.book) {
      setStatus('loaded')
      setEntries([])
      return
    }
    setLoading(true)
    setStatus('idle')
    setRpcError(null)
    setEntries([])

    const { data, error } = await supabase.rpc('lib_get_commentaries', {
      p_bible_book: toEnBook(project.book),
      p_chapter:    chapter,
      p_verse:      null,
    })

    if (error) {
      setRpcError(error.message ?? 'Erro ao buscar comentários')
      setStatus('error')
    } else {
      setEntries((data ?? []) as LibEntry[])
      setStatus('loaded')
    }
    setLoading(false)
  }, [supabase, project.book, chapter])

  // ── Search ────────────────────────────────────────────────────────────────

  const search = useCallback(async () => {
    const q = query.trim()
    if (!q) {
      if (tab === 'comentarios') return loadCommentaries()
      return
    }
    setLoading(true)
    setStatus('idle')
    setRpcError(null)

    if (tab === 'dicionario') {
      const { data, error } = await supabase.rpc('lib_search_refs', {
        p_term:       q,
        p_work_types: ['dictionary'],
      })
      if (error) { setRpcError(error.message ?? 'Erro na busca'); setStatus('error') }
      else { setEntries((data ?? []) as LibEntry[]); setStatus('loaded') }
    } else {
      const { data, error } = await supabase.rpc('lib_search', {
        p_query:         q,
        p_work_type:     'commentary',
        p_tradition:     null,
        p_bible_book:    null,
        p_bible_chapter: null,
        p_limit:         20,
      })
      if (error || (data ?? []).length === 0) {
        // sem erro mas sem resultados: mostra comentários da passagem atual
        return loadCommentaries()
      }
      setEntries((data ?? []) as LibEntry[])
      setStatus('loaded')
    }

    setLoading(false)
  }, [supabase, query, tab, loadCommentaries])

  // ── Tab switch ────────────────────────────────────────────────────────────

  useEffect(() => {
    setEntries([])
    setQuery('')
    setExpanded(new Set())
    setStatus('idle')
    setRpcError(null)
    if (tab === 'comentarios') loadCommentaries()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── AI fallback ───────────────────────────────────────────────────────────

  function askAICommentary() {
    onAskAI([
      `Passagem em estudo: ${passageLabel}`,
      `Livro: ${project.book ?? ''}`,
      `Idioma original: ${project.original_language ?? 'grego'}`,
      '',
      'Atue como comentarista bíblico reformado e ofereça um comentário completo desta passagem, incluindo:',
      '1. Contexto histórico-literário da passagem',
      '2. Análise exegética dos principais termos e estrutura',
      '3. Teologia bíblica: como esta passagem se relaciona com o cânon',
      '4. Implicações doutrinais (perspectiva reformada)',
      '5. Aplicações pastorais concretas para o pregador',
      '',
      'Responda em português do Brasil com rigor exegético e clareza pastoral.',
    ].join('\n'))
  }

  function sendToAI(entry: LibEntry) {
    const src = [entry.author_name, entry.year_published ? `(${entry.year_published})` : null, `— ${entry.work_title}`].filter(Boolean).join(' ')
    const ref = entry.bible_ref ? ` [${entry.bible_ref}]` : ''
    onAskAI([
      `Fonte da Biblioteca Teológica Lampas: ${src}${ref}`,
      `Passagem em estudo: ${passageLabel}`,
      '',
      entry.heading ? `### ${entry.heading}` : '',
      (entry.content ?? entry.content_excerpt ?? '').slice(0, 2500),
      '',
      `Com base neste comentário clássico, analise sua relevância para a exegese e pregação de ${passageLabel}. Destaque os principais insights teológicos e aplicações pastorais.`,
    ].filter(Boolean).join('\n'))
  }

  async function handleTranslate(entry: LibEntry) {
    const id = entry.entry_id
    // Se já tem tradução, apenas alterna o idioma exibido
    if (translations.has(id)) {
      setShowingPT(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
      return
    }
    // Inicia tradução
    setTranslating(prev => new Set(prev).add(id))
    setShowingPT(prev => new Set(prev).add(id))
    try {
      const res = await fetch('/api/library/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_id: id,
          heading:  entry.heading ?? null,
          content:  (entry.content ?? entry.content_excerpt ?? '').slice(0, 3000),
        }),
      })
      if (res.ok) {
        const data = await res.json() as Translation
        setTranslations(prev => new Map(prev).set(id, data))
      } else {
        // em caso de erro, volta para inglês
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

  function toggleExpand(id: string) {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  // ── Library browser functions ─────────────────────────────────────────────

  const loadLibWorks = useCallback(async () => {
    if (libWorksLoaded) return
    setLibWorksLoading(true)
    const { data: worksData } = await supabase
      .from('lib_works')
      .select('id, title, year_published, lib_authors(name)')
      .order('title')
    const mapped: LibWork[] = (worksData ?? []).map((w: { id: string; title: string; year_published: number | null; lib_authors: { name: string }[] | { name: string } | null }) => {
      const aut = Array.isArray(w.lib_authors) ? w.lib_authors[0] : w.lib_authors
      return { id: w.id, title: w.title, year_published: w.year_published, author_name: aut?.name ?? null }
    })
    setLibWorks(mapped)
    setLibWorksLoaded(true)
    setLibWorksLoading(false)
  }, [supabase, libWorksLoaded])

  const loadLibEntries = useCallback(async (work: LibWork, pageNum: number, append: boolean, q = '') => {
    setLibLoading(true)
    const params = new URLSearchParams({ work_id: work.id, page: String(pageNum) })
    if (q) params.set('q', q)
    const res = await fetch(`/api/library/browse?${params}`)
    if (!res.ok) { setLibLoading(false); return }
    const data = await res.json() as { entries: { id: string; heading: string | null; content_excerpt: string | null; bible_ref: string | null }[]; hasMore: boolean; total: number }
    const mapped: LibEntry[] = (data.entries ?? []).map(e => ({
      entry_id:        e.id,
      heading:         e.heading,
      content:         e.content_excerpt,
      content_excerpt: e.content_excerpt,
      work_title:      work.title,
      author_name:     work.author_name,
      year_published:  work.year_published,
      bible_ref:       e.bible_ref,
    }))
    if (append) setLibEntries(prev => [...prev, ...mapped])
    else        setLibEntries(mapped)
    setLibHasMore(data.hasMore ?? false)
    setLibTotal(data.total ?? null)
    setLibPage(pageNum)
    setLibLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'dicionario') loadLibWorks()
  }, [tab, loadLibWorks])

  function selectLibWork(work: LibWork) {
    setSelectedLib(work)
    setLibEntries([])
    setLibExpanded(new Set())
    setLibPage(0)
    setLibHasMore(false)
    setLibTotal(null)
    setLibDraft('')
    setLibQuery('')
    void loadLibEntries(work, 0, false, '')
  }

  function libSearch() {
    if (!selectedLib) return
    setLibEntries([])
    setLibExpanded(new Set())
    setLibPage(0)
    setLibQuery(libDraft)
    void loadLibEntries(selectedLib, 0, false, libDraft)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isComments = tab === 'comentarios'
  const isEmpty    = status === 'loaded' && entries.length === 0

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

      {/* ── Aba Comentários ────────────────────────────────────────────── */}
      {isComments && (
        <>
          {/* Passage context */}
          <div style={{
            padding: '0.5rem 0.65rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: BG,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1px' }}>
                Passagem atual
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: COLOR, lineHeight: 1.2 }}>
                {passageLabel || 'Nenhuma passagem selecionada'}
              </div>
            </div>
            <button
              onClick={loadCommentaries}
              title="Recarregar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLOR, opacity: 0.5, padding: '4px', display: 'flex', borderRadius: '4px' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.5' }}
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: '0.5rem 0.55rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={11} strokeWidth={2} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') search() }}
                  placeholder="Buscar nos comentários…"
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
                    onClick={() => { setQuery(''); loadCommentaries() }}
                    style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              <button
                onClick={search}
                style={{ background: COLOR, border: 'none', borderRadius: '6px', color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.71rem', fontWeight: 700, padding: '0 0.55rem', flexShrink: 0 }}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {loading && (
              <>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '0.25rem' }}>
                  {`Buscando comentários de ${passageLabel}…`}
                </div>
                <Skeleton />
              </>
            )}
            {!loading && status === 'error' && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#FFF1F1', border: '1px solid #FEE2E2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <AlertCircle size={13} color="#B91C1C" />
                  <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#B91C1C' }}>Erro ao carregar</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#7F1D1D', lineHeight: 1.5, marginBottom: '8px', wordBreak: 'break-all' }}>{rpcError}</div>
                <button onClick={loadCommentaries} style={{ background: '#B91C1C', border: 'none', borderRadius: '5px', padding: '4px 10px', fontSize: '0.68rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Tentar novamente
                </button>
              </div>
            )}
            {!loading && status === 'loaded' && isEmpty && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '1.25rem 0.75rem' }}>
                <BookOpen size={28} strokeWidth={1} style={{ opacity: 0.15 }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {passageLabel ? `Nenhum comentário encontrado para ${passageLabel}` : 'Nenhum resultado encontrado'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {passageLabel ? 'A biblioteca ainda não possui comentários para esta passagem.' : 'Abra um projeto com passagem bíblica.'}
                  </div>
                </div>
                {passageLabel && (
                  <button onClick={askAICommentary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#7C3AED', border: 'none', borderRadius: '7px', padding: '0.5rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 1px 6px rgba(124,58,237,0.3)' }}>
                    <Sparkles size={12} strokeWidth={1.75} />
                    Pedir ao Claude comentário de {passageLabel}
                  </button>
                )}
              </div>
            )}
            {!loading && entries.length > 0 && (
              <>
                <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', padding: '0 0.1rem' }}>
                  {entries.length} resultado{entries.length !== 1 ? 's' : ''}{passageLabel ? ` para ${passageLabel}` : ''}
                </div>
                {entries.map(entry => (
                  <EntryCard
                    key={entry.entry_id}
                    entry={entry}
                    expanded={expanded.has(entry.entry_id)}
                    onToggle={() => toggleExpand(entry.entry_id)}
                    onSend={() => sendToAI(entry)}
                    onTranslate={() => handleTranslate(entry)}
                    translation={translations.get(entry.entry_id) ?? null}
                    translating={translating.has(entry.entry_id)}
                    showPT={showingPT.has(entry.entry_id)}
                    onToggleLang={() => toggleLang(entry.entry_id)}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Aba Dicionários → browser da Biblioteca ─────────────────────── */}
      {!isComments && (
        <>
          {/* Works list ou header da obra selecionada */}
          {!selectedLib ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '0.5rem 0.55rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
                  Obras disponíveis
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.35rem 0.4rem' }}>
                {libWorksLoading && (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carregando obras…</div>
                )}
                {!libWorksLoading && libWorks.map(work => (
                  <button
                    key={work.id}
                    onClick={() => selectLibWork(work)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '0.45rem 0.6rem', marginBottom: '2px',
                      background: 'none', border: 'none', borderRadius: '6px',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <div style={{ fontSize: '0.77rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {work.title.length > 48 ? work.title.slice(0, 45) + '…' : work.title}
                    </div>
                    {work.author_name && (
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {work.author_name}{work.year_published ? ` · ${work.year_published}` : ''}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header da obra */}
              <div style={{ padding: '0.5rem 0.55rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, background: BG }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <button
                    onClick={() => { setSelectedLib(null); setLibEntries([]); setLibQuery(''); setLibDraft('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLOR, padding: '1px', display: 'flex', flexShrink: 0, marginTop: '2px' }}
                    title="Voltar"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: COLOR, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedLib.title}
                    </div>
                    {selectedLib.author_name && (
                      <div style={{ fontSize: '0.61rem', color: '#9A6846', marginTop: '1px' }}>
                        {selectedLib.author_name}{selectedLib.year_published ? ` · ${selectedLib.year_published}` : ''}
                        {libTotal !== null && <span style={{ marginLeft: '0.4rem', color: COLOR, fontWeight: 600 }}>{libTotal.toLocaleString('pt-BR')} entradas</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search */}
              <div style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={10} strokeWidth={2} style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      value={libDraft}
                      onChange={e => setLibDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') libSearch() }}
                      placeholder="Buscar nesta obra…"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        paddingLeft: '24px', paddingRight: libDraft ? '24px' : '7px',
                        paddingTop: '5px', paddingBottom: '5px',
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: '6px', color: 'var(--text-primary)',
                        fontFamily: 'inherit', fontSize: '0.74rem', outline: 'none',
                      }}
                      onFocus={e => (e.target.style.borderColor = COLOR)}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                    {libDraft && (
                      <button
                        onClick={() => { setLibDraft(''); setLibQuery(''); if (selectedLib) void loadLibEntries(selectedLib, 0, false, '') }}
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
                      >
                        <X size={9} />
                      </button>
                    )}
                  </div>
                  <button onClick={libSearch} style={{ background: COLOR, border: 'none', borderRadius: '5px', color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.68rem', fontWeight: 700, padding: '0 0.45rem', flexShrink: 0 }}>
                    Buscar
                  </button>
                </div>
              </div>

              {/* Entries */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0.45rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {libLoading && <Skeleton />}
                {!libLoading && libEntries.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1.5rem 0.5rem', color: 'var(--text-muted)' }}>
                    <BookOpen size={24} strokeWidth={1} style={{ opacity: 0.2 }} />
                    <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>Nenhuma entrada encontrada.</span>
                  </div>
                )}
                {!libLoading && libEntries.length > 0 && (
                  <>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '0 0.1rem' }}>
                      {libEntries.length}{libTotal !== null ? ` de ${libTotal.toLocaleString('pt-BR')}` : ''} entradas
                    </div>
                    {libEntries.map(entry => (
                      <EntryCard
                        key={entry.entry_id}
                        entry={entry}
                        expanded={libExpanded.has(entry.entry_id)}
                        onToggle={() => setLibExpanded(prev => { const s = new Set(prev); s.has(entry.entry_id) ? s.delete(entry.entry_id) : s.add(entry.entry_id); return s })}
                        onSend={() => sendToAI(entry)}
                        onTranslate={() => handleTranslate(entry)}
                        translation={translations.get(entry.entry_id) ?? null}
                        translating={translating.has(entry.entry_id)}
                        showPT={showingPT.has(entry.entry_id)}
                        onToggleLang={() => toggleLang(entry.entry_id)}
                      />
                    ))}
                    {libHasMore && (
                      <button
                        onClick={() => void loadLibEntries(selectedLib, libPage + 1, true, libQuery)}
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.45rem', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <RefreshCw size={11} /> Carregar mais
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
