'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Sparkles, X, ChevronDown, ChevronUp, BookOpen, RefreshCw, AlertCircle } from 'lucide-react'
import type { Project } from '@/types/database'

type Tab = 'comentarios' | 'dicionario'

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

// ── EntryCard ─────────────────────────────────────────────────────────────────

function EntryCard({
  entry, onSend, onTranslate, expanded, onToggle,
}: {
  entry: LibEntry; onSend: () => void; onTranslate: () => void; expanded: boolean; onToggle: () => void
}) {
  const PREVIEW = 320
  const text    = entry.content ?? entry.content_excerpt ?? ''
  const snippet = text.slice(0, PREVIEW)
  const hasMore = text.length > PREVIEW
  const src = [entry.author_name, entry.year_published ? `(${entry.year_published})` : null].filter(Boolean).join(' ')

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
        {entry.heading && (
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem', lineHeight: 1.3 }}>
            {entry.heading}
          </div>
        )}
        <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {text
            ? (expanded ? text : snippet) + (!expanded && hasMore ? '…' : '')
            : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Conteúdo não disponível</span>
          }
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.4rem', flexWrap: 'wrap' }}>
          {hasMore && (
            <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.63rem', color: 'var(--text-muted)', padding: 0, fontFamily: 'inherit' }}>
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {expanded ? 'Recolher' : 'Ver mais'}
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem' }}>
            <button
              onClick={onTranslate}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid #94A3B840', borderRadius: '5px', padding: '0.22rem 0.5rem', fontSize: '0.63rem', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = '#94A3B8' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#94A3B840' }}
              title="Traduzir para português"
            >
              PT
            </button>
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

  const [tab,      setTab]      = useState<Tab>('comentarios')
  const [query,    setQuery]    = useState('')
  const [entries,  setEntries]  = useState<LibEntry[]>([])
  const [loading,  setLoading]  = useState(false)
  const [status,   setStatus]   = useState<'idle' | 'loaded' | 'error'>('idle')
  const [rpcError, setRpcError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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

  function translateInAI(entry: LibEntry) {
    const src = [entry.author_name, entry.year_published ? `(${entry.year_published})` : null, `— ${entry.work_title}`].filter(Boolean).join(' ')
    const ref = entry.bible_ref ? ` [${entry.bible_ref}]` : ''
    onAskAI([
      `Traduza para o português do Brasil o seguinte comentário bíblico clássico, preservando a precisão teológica e os termos técnicos:`,
      '',
      `${src}${ref}`,
      entry.heading ? `### ${entry.heading}` : '',
      (entry.content ?? entry.content_excerpt ?? '').slice(0, 3000),
    ].filter(Boolean).join('\n'))
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
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

      {/* Passage context (comentários only) */}
      {isComments && (
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
      )}

      {/* Search bar */}
      <div style={{ padding: '0.5rem 0.55rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={11} strokeWidth={2} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') search() }}
              placeholder={isComments ? 'Buscar nos comentários…' : 'Buscar no dicionário…'}
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
                onClick={() => { setQuery(''); if (isComments) loadCommentaries(); else { setEntries([]); setStatus('idle') } }}
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

      {/* Results area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.55rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>

        {/* Loading */}
        {loading && (
          <>
            <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '0.25rem' }}>
              {isComments ? `Buscando comentários de ${passageLabel}…` : 'Buscando…'}
            </div>
            <Skeleton />
          </>
        )}

        {/* Error */}
        {!loading && status === 'error' && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#FFF1F1', border: '1px solid #FEE2E2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <AlertCircle size={13} color="#B91C1C" />
              <span style={{ fontSize: '0.73rem', fontWeight: 600, color: '#B91C1C' }}>
                Erro ao carregar
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#7F1D1D', lineHeight: 1.5, marginBottom: '8px', wordBreak: 'break-all' }}>
              {rpcError}
            </div>
            <button
              onClick={() => isComments ? loadCommentaries() : search()}
              style={{ background: '#B91C1C', border: 'none', borderRadius: '5px', padding: '4px 10px', fontSize: '0.68rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty — dicionario: instrução */}
        {!loading && status === 'idle' && tab === 'dicionario' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1, color: 'var(--text-muted)', padding: '1rem' }}>
            <BookOpen size={28} strokeWidth={1} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: '0.78rem', textAlign: 'center' }}>Digite um termo para buscar no dicionário</span>
          </div>
        )}

        {/* Empty — comentarios: nenhum resultado na biblioteca + fallback IA */}
        {!loading && status === 'loaded' && isEmpty && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '1.25rem 0.75rem' }}>
            <BookOpen size={28} strokeWidth={1} style={{ opacity: 0.15 }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {isComments && passageLabel
                  ? `Nenhum comentário encontrado para ${passageLabel}`
                  : 'Nenhum resultado encontrado'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {isComments
                  ? 'A biblioteca ainda não possui comentários para esta passagem.'
                  : 'Tente outro termo de pesquisa.'}
              </div>
            </div>

            {/* AI fallback — only for comentarios */}
            {isComments && passageLabel && (
              <button
                onClick={askAICommentary}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#7C3AED', border: 'none', borderRadius: '7px',
                  padding: '0.5rem 0.9rem', fontSize: '0.75rem', fontWeight: 700,
                  color: '#FFF', cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 1px 6px rgba(124,58,237,0.3)',
                }}
              >
                <Sparkles size={12} strokeWidth={1.75} />
                Pedir ao Claude comentário de {passageLabel}
              </button>
            )}
          </div>
        )}

        {/* No passage set */}
        {!loading && status === 'loaded' && isEmpty && isComments && !passageLabel && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
            <BookOpen size={28} strokeWidth={1} style={{ opacity: 0.2 }} />
            <span style={{ fontSize: '0.78rem' }}>Abra um projeto com passagem bíblica para consultar comentários.</span>
          </div>
        )}

        {/* Results */}
        {!loading && entries.length > 0 && (
          <>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', padding: '0 0.1rem' }}>
              {entries.length} resultado{entries.length !== 1 ? 's' : ''}{isComments && passageLabel ? ` para ${passageLabel}` : ''}
            </div>
            {entries.map(entry => (
              <EntryCard
                key={entry.entry_id}
                entry={entry}
                expanded={expanded.has(entry.entry_id)}
                onToggle={() => toggleExpand(entry.entry_id)}
                onSend={() => sendToAI(entry)}
                onTranslate={() => translateInAI(entry)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
