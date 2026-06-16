'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Search, BookMarked, Sparkles, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────────

interface DictEntry {
  id: string
  title: string
  category: string
  definition: string | null
  etymology: string | null
  trust_level: number
  transliteration: string | null
  lang_hebrew: string | null
  lang_greek: string | null
  query_count: number
}

type DrawerMode = 'dictionary' | 'ai'

interface Props {
  project: Project
  userId: string
  focusMode: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  personagem:    'Pessoa',
  lugar:         'Lugar',
  termo_biblico: 'Termo',
  doutrina:      'Doutrina',
  instituicao:   'Instituição',
  evento:        'Evento',
  livro_biblico: 'Livro',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DicionarioFlutuante({ project, userId, focusMode }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [menuOpen,   setMenuOpen]   = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null)

  // Dictionary state
  const [dictQuery,   setDictQuery]   = useState('')
  const [results,     setResults]     = useState<DictEntry[]>([])
  const [selected,    setSelected]    = useState<DictEntry | null>(null)
  const [searching,   setSearching]   = useState(false)

  // AI state
  const [aiQuery,   setAiQuery]   = useState('')
  const [aiResult,  setAiResult]  = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState(false)
  const aiBufferRef    = useRef('')
  const dictInputRef   = useRef<HTMLInputElement>(null)
  const aiInputRef     = useRef<HTMLInputElement>(null)
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Focus input when drawer opens
  useEffect(() => {
    if (drawerMode === 'dictionary') setTimeout(() => dictInputRef.current?.focus(), 60)
    if (drawerMode === 'ai')         setTimeout(() => aiInputRef.current?.focus(),  60)
  }, [drawerMode])

  // ── Dictionary search ──────────────────────────────────────────────────────

  const searchDictionary = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSelected(null); return }
    setSearching(true)
    setSelected(null)
    const { data } = await supabase
      .from('lampas_dictionary')
      .select('id, title, category, definition, etymology, trust_level, transliteration, lang_hebrew, lang_greek, query_count')
      .or(`title.ilike.%${q}%,transliteration.ilike.%${q}%`)
      .order('query_count', { ascending: false })
      .limit(15)
    setResults((data ?? []) as DictEntry[])
    setSearching(false)
  }, [supabase])

  function handleDictQueryChange(val: string) {
    setDictQuery(val)
    clearTimeout(debounceRef.current)
    if (val.trim().length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => searchDictionary(val), 320)
  }

  function openEntry(entry: DictEntry) {
    setSelected(entry)
    void supabase.rpc('increment_dictionary_query_count', { p_id: entry.id })
  }

  // ── AI search ──────────────────────────────────────────────────────────────

  async function searchWithAI() {
    const q = aiQuery.trim()
    if (!q || aiLoading) return

    setAiLoading(true)
    setAiError(false)
    setAiResult('')
    aiBufferRef.current = ''

    const prompt = [
      `Pesquisa lexical reformada: "${q}"`,
      `Contexto bíblico: ${project.book} ${project.passage_ref}`,
      '',
      'Produza um verbete claro e objetivo com as seguintes seções:',
      '## Definição',
      '## Etimologia',
      '## Uso Bíblico',
      '## Significado Teológico',
      '## Referências-chave',
      '',
      'Rigor reformado. Português do Brasil. Conciso e preciso.',
    ].join('\n')

    try {
      const res = await fetch('/api/claude/stream', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:        [{ role: 'user', content: prompt }],
          project: {
            id: project.id, book: project.book, passage_ref: project.passage_ref,
            testament: project.testament, original_language: project.original_language,
          },
          activeSlug:      'ferramentas_dicionario',
          activeTitle:     'Dicionário Lampas',
          dictionaryQuery: q,
          generationMode:  'economic',
        }),
      })

      if (!res.ok || !res.body) throw new Error()

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6)
          if (raw === '[DONE]') break
          try {
            const json = JSON.parse(raw)
            if (json.delta?.text) {
              aiBufferRef.current += json.delta.text
              setAiResult(aiBufferRef.current)
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setAiError(true)
    }
    setAiLoading(false)
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  function openDrawer(mode: DrawerMode, prefill?: string) {
    setMenuOpen(false)
    setDrawerMode(mode)
    if (mode === 'dictionary') {
      if (prefill) { setDictQuery(prefill); setTimeout(() => searchDictionary(prefill), 60) }
      else { setDictQuery(''); setResults([]); setSelected(null) }
    }
    if (mode === 'ai') {
      setAiQuery(prefill ?? dictQuery)
      setAiResult('')
      setAiError(false)
    }
  }

  function closeDrawer() {
    setDrawerMode(null)
  }

  const isActive = menuOpen || drawerMode !== null

  if (focusMode) return null

  return (
    <>
      {/* Overlay — fecha o menu ao clicar fora */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 298 }}
        />
      )}

      {/* ── Floating button ─────────────────────────────────────────────────── */}
      <div
        className="lp-dict-fab"
        style={{ position: 'fixed', bottom: '70px', left: '16px', zIndex: 300 }}
      >

        {/* Mini menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute', bottom: '48px', left: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            overflow: 'hidden',
            minWidth: '200px',
            animation: 'fadeInScale 0.15s ease-out',
          }}>
            <div style={{
              padding: '0.55rem 0.9rem 0.35rem',
              fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              Consulta Lexical
            </div>

            {([
              {
                mode: 'dictionary' as const,
                label: 'Dicionário Lampas',
                desc:  'Verbetes da base teológica',
                Icon:  BookMarked,
              },
              {
                mode: 'ai' as const,
                label: 'Pesquisa IA',
                desc:  'Análise com inteligência reformada',
                Icon:  Sparkles,
              },
            ] as const).map(({ mode, label, desc, Icon }) => (
              <button
                key={mode}
                onClick={() => openDrawer(mode)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '0.6rem 0.9rem',
                  background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <Icon
                  size={15} strokeWidth={1.6}
                  style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '0.81rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                    {desc}
                  </div>
                </div>
              </button>
            ))}

            <div style={{ height: '0.35rem' }} />
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          title="Consulta lexical — Dicionário Lampas"
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background:  isActive ? 'var(--accent)' : 'var(--surface)',
            border:      `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
            transition: 'all 0.15s',
            color: isActive ? '#fff' : 'var(--text-secondary)',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.background = 'var(--accent-subtle)'
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'var(--surface)'
            }
          }}
        >
          <DictIcon active={isActive} />
        </button>
      </div>

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      {drawerMode !== null && (
        <aside style={{
          position: 'fixed', right: 0, top: '44px', bottom: '60px',
          width: '380px', zIndex: 400,
          background: '#FFFFFF',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.09)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.18s ease-out',
        }}>

          {/* Header */}
          <div style={{
            padding: '0.8rem 1rem 0.7rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            flexShrink: 0,
          }}>
            {drawerMode === 'dictionary'
              ? <BookMarked size={16} strokeWidth={1.6} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              : <Sparkles   size={16} strokeWidth={1.6} style={{ color: 'var(--ai)',     flexShrink: 0 }} />
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {drawerMode === 'dictionary' ? 'Dicionário Lampas' : 'Pesquisa IA'}
              </div>
              <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                {drawerMode === 'dictionary'
                  ? 'Verbetes teológicos e bíblicos'
                  : `Contexto: ${project.book} ${project.passage_ref}`
                }
              </div>
            </div>

            {/* Toggle between modes */}
            <button
              onClick={() => openDrawer(drawerMode === 'dictionary' ? 'ai' : 'dictionary', drawerMode === 'dictionary' ? dictQuery : aiQuery)}
              title={drawerMode === 'dictionary' ? 'Alternar para Pesquisa IA' : 'Alternar para Dicionário'}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                borderRadius: '6px', padding: '0.26rem 0.5rem',
                cursor: 'pointer', color: 'var(--text-muted)',
                fontSize: '0.65rem', fontWeight: 600, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)';     e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              {drawerMode === 'dictionary' ? <Sparkles size={10} /> : <BookMarked size={10} />}
              {drawerMode === 'dictionary' ? 'IA' : 'Dicionário'}
            </button>

            <button
              onClick={closeDrawer}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: '6px', padding: '0.26rem 0.46rem',
                cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.12s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Dictionary panel ─────────────────────────────────────────────── */}
          {drawerMode === 'dictionary' && (
            <>
              {/* Search */}
              <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={13} strokeWidth={1.75}
                    style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                  />
                  <input
                    ref={dictInputRef}
                    value={dictQuery}
                    onChange={e => handleDictQueryChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !searching && results.length === 0 && dictQuery.trim())
                        openDrawer('ai', dictQuery)
                    }}
                    placeholder="Buscar termo, palavra, conceito…"
                    style={{
                      width: '100%', paddingLeft: '30px', paddingRight: dictQuery ? '30px' : '10px',
                      paddingTop: '8px', paddingBottom: '8px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '8px', fontSize: '0.83rem', fontFamily: 'inherit',
                      outline: 'none', color: 'var(--text-primary)', boxSizing: 'border-box',
                      transition: 'border-color 0.12s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--border)'  }}
                  />
                  {dictQuery && (
                    <button
                      onClick={() => { setDictQuery(''); setResults([]); setSelected(null) }}
                      style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto' }}>

                {/* Empty prompt */}
                {!dictQuery.trim() && (
                  <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BookMarked size={28} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                    <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                      Digite um termo para buscar<br />no Dicionário Lampas
                    </div>
                  </div>
                )}

                {/* Loading */}
                {searching && (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Buscando…
                  </div>
                )}

                {/* No results */}
                {!searching && dictQuery.trim() && results.length === 0 && !selected && (
                  <div style={{ padding: '1rem' }}>
                    <div style={{
                      padding: '1.1rem', borderRadius: '10px',
                      background: 'var(--surface)', border: '1px dashed var(--border)',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem', lineHeight: 1.5 }}>
                        Este termo ainda não possui verbete<br />no Dicionário Lampas.
                      </div>
                      <button
                        onClick={() => openDrawer('ai', dictQuery)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: 'var(--ai)', border: 'none', borderRadius: '7px',
                          padding: '6px 14px', fontSize: '0.76rem', fontWeight: 600,
                          color: '#FFF', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <Sparkles size={11} strokeWidth={1.75} /> Pesquisar com IA
                      </button>
                    </div>
                  </div>
                )}

                {/* Results list */}
                {!selected && results.length > 0 && (
                  <div style={{ padding: '0.4rem 0.5rem' }}>
                    {results.map(entry => (
                      <button
                        key={entry.id}
                        onClick={() => openEntry(entry)}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: '0.55rem 0.7rem',
                          background: 'transparent', border: '1px solid transparent',
                          borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                          marginBottom: '2px', transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                              {entry.title}
                            </div>
                            {entry.transliteration && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '1px' }}>
                                {entry.transliteration}
                              </div>
                            )}
                            {entry.definition && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                                {entry.definition}
                              </div>
                            )}
                          </div>
                          <span style={{
                            fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)',
                            background: 'var(--surface-2)', borderRadius: '4px',
                            padding: '2px 5px', flexShrink: 0, marginTop: '2px',
                          }}>
                            {CATEGORY_LABELS[entry.category] ?? entry.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Entry detail */}
                {selected && (
                  <div style={{ padding: '0.75rem 1rem 1.5rem' }}>
                    <button
                      onClick={() => setSelected(null)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '0.73rem', fontFamily: 'inherit',
                        padding: '0 0 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
                        transition: 'color 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'     }}
                    >
                      ← Voltar
                    </button>

                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                      {selected.title}
                    </h2>
                    {selected.transliteration && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.8rem' }}>
                        {selected.transliteration}
                      </div>
                    )}

                    {(selected.lang_hebrew || selected.lang_greek) && (
                      <div style={{
                        display: 'flex', gap: '1.2rem', flexWrap: 'wrap',
                        padding: '0.65rem 0.85rem', marginBottom: '1rem',
                        background: 'var(--surface)', borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        {selected.lang_hebrew && (
                          <div>
                            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Hebraico</div>
                            <div style={{ fontSize: '1.05rem', fontFamily: 'serif', direction: 'rtl' }}>{selected.lang_hebrew}</div>
                          </div>
                        )}
                        {selected.lang_greek && (
                          <div>
                            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>Grego</div>
                            <div style={{ fontSize: '1.05rem', fontFamily: 'serif' }}>{selected.lang_greek}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {selected.definition && (
                      <FieldBlock label="Definição" value={selected.definition} />
                    )}
                    {selected.etymology && (
                      <FieldBlock label="Etimologia" value={selected.etymology} />
                    )}

                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openDrawer('ai', selected.title)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: 'transparent', border: '1px solid var(--border)',
                          borderRadius: '7px', padding: '5px 11px',
                          fontSize: '0.74rem', color: 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                      >
                        <Sparkles size={11} strokeWidth={1.75} /> Aprofundar com IA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── AI panel ─────────────────────────────────────────────────────── */}
          {drawerMode === 'ai' && (
            <>
              {/* Input */}
              <div style={{ padding: '0.7rem 1rem', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <input
                    ref={aiInputRef}
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') searchWithAI() }}
                    placeholder="Ex: Logos, justificação, propiciação…"
                    style={{
                      flex: 1, padding: '8px 10px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '8px', fontSize: '0.83rem', fontFamily: 'inherit',
                      outline: 'none', color: 'var(--text-primary)',
                      transition: 'border-color 0.12s',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--ai)' }}
                    onBlur={e  => { e.target.style.borderColor = 'var(--border)' }}
                  />
                  <button
                    onClick={searchWithAI}
                    disabled={!aiQuery.trim() || aiLoading}
                    style={{
                      background: aiLoading || !aiQuery.trim() ? 'var(--surface-2)' : 'var(--ai)',
                      border: 'none', borderRadius: '8px', padding: '8px 13px',
                      color: aiLoading || !aiQuery.trim() ? 'var(--text-muted)' : '#fff',
                      fontSize: '0.78rem', fontWeight: 600,
                      cursor: aiLoading ? 'wait' : !aiQuery.trim() ? 'default' : 'pointer',
                      fontFamily: 'inherit', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: '5px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Sparkles size={13} strokeWidth={1.75} />
                    {aiLoading ? 'Buscando…' : 'Pesquisar'}
                  </button>
                </div>
              </div>

              {/* Result */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

                {/* Idle state */}
                {!aiResult && !aiLoading && !aiError && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    <Sparkles size={24} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                    <div style={{ fontSize: '0.82rem', lineHeight: 1.65 }}>
                      Digite um termo e pressione <strong>Pesquisar</strong>.<br />
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                        A IA responderá com rigor bíblico e reformado.
                      </span>
                    </div>
                  </div>
                )}

                {/* Loading skeleton */}
                {aiLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ai)', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <Sparkles size={13} strokeWidth={1.75} style={{ animation: 'spin 2s linear infinite' }} />
                      Consultando a IA…
                    </div>
                    {[80, 65, 90, 50, 72].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: '10px', borderRadius: '4px',
                          background: 'var(--surface-2)', width: `${w}%`,
                          animation: 'pulse 1.5s ease-in-out infinite',
                          animationDelay: `${i * 0.12}s`,
                        }}
                      />
                    ))}
                    {aiResult && (
                      <div style={{ marginTop: '4px', fontSize: '0.87rem', color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {aiResult}
                      </div>
                    )}
                  </div>
                )}

                {/* Error */}
                {aiError && (
                  <div style={{
                    padding: '1rem', borderRadius: '10px',
                    background: '#FFF1F1', border: '1px solid #FEE2E2', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.81rem', color: 'var(--error)', marginBottom: '0.5rem' }}>
                      Erro ao consultar a IA. Tente novamente.
                    </div>
                    <button
                      onClick={searchWithAI}
                      style={{
                        background: 'none', border: '1px solid var(--error)', borderRadius: '6px',
                        padding: '4px 12px', fontSize: '0.75rem', color: 'var(--error)',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                {/* AI result */}
                {aiResult && !aiLoading && (
                  <>
                    <div style={{ fontSize: '0.87rem', color: 'var(--text-primary)', lineHeight: 1.82, whiteSpace: 'pre-wrap' }}>
                      {aiResult}
                    </div>
                    <div style={{
                      marginTop: '1.25rem', padding: '0.7rem 0.9rem',
                      background: '#FEFCE8', border: '1px solid #FDE68A',
                      borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                      <Sparkles size={12} strokeWidth={1.75} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.72rem', color: '#92400E', lineHeight: 1.55 }}>
                        Resposta gerada como apoio à pesquisa. Revise e confirme com fontes confiáveis.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </aside>
      )}
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.87rem', color: 'var(--text-primary)', lineHeight: 1.72, whiteSpace: 'pre-wrap' }}>
        {value}
      </div>
    </div>
  )
}

function DictIcon({ active }: { active: boolean }) {
  const color = active ? '#fff' : 'currentColor'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <text x="9" y="14.5" fontSize="7" fontWeight="bold" fill={color} stroke="none" fontFamily="serif">A</text>
    </svg>
  )
}
