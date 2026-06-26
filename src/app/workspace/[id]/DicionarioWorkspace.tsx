'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Project } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, BookOpen, Sparkles, X, Check, Edit2, Trash2, Clock, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

// ── Markdown renderer ─────────────────────────────────────────────────────────

const MD: Components = {
  h1: ({ children }) => <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0F172A', margin: '2rem 0 0.7rem', letterSpacing: '-0.025em', lineHeight: 1.25, paddingBottom: '0.55rem', borderBottom: '1px solid #E8ECF0' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '1.6rem 0 0.5rem', letterSpacing: '-0.015em', lineHeight: 1.3 }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: '0.91rem', fontWeight: 700, color: '#1E293B', margin: '1.2rem 0 0.4rem', lineHeight: 1.3 }}>{children}</h3>,
  h4: ({ children }) => <h4 style={{ fontSize: '0.87rem', fontWeight: 700, color: '#334155', margin: '0.9rem 0 0.35rem' }}>{children}</h4>,
  p:  ({ children }) => <p  style={{ fontSize: '0.93rem', color: '#334155', lineHeight: 1.85, margin: '0 0 0.95rem' }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#0F172A' }}>{children}</strong>,
  em:     ({ children }) => <em     style={{ fontStyle: 'italic', color: '#475569' }}>{children}</em>,
  ul: ({ children }) => <ul style={{ paddingLeft: '1.45rem', margin: '0.4rem 0 0.95rem', listStyleType: 'disc' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: '1.45rem', margin: '0.4rem 0 0.95rem', listStyleType: 'decimal' }}>{children}</ol>,
  li: ({ children }) => <li style={{ fontSize: '0.93rem', color: '#334155', lineHeight: 1.75, marginBottom: '0.3rem' }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: '3px solid #CBD5E1', margin: '0.85rem 0', padding: '0.6rem 1rem', background: '#F8FAFC', borderRadius: '0 6px 6px 0', color: '#475569', fontStyle: 'italic' }}>
      {children}
    </blockquote>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #E8ECF0', margin: '1.4rem 0' }} />,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: '0.95rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: '#F8FAFC' }}>{children}</thead>,
  tr:    ({ children }) => <tr    style={{ borderBottom: '1px solid #F1F5F9' }}>{children}</tr>,
  th: ({ children }) => <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left', fontWeight: 700, color: '#1E293B', borderBottom: '2px solid #E2E8F0', fontSize: '0.77rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '0.5rem 0.8rem', color: '#334155', verticalAlign: 'top', lineHeight: 1.6 }}>{children}</td>,
  pre: ({ children }) => (
    <pre style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1.1rem', overflowX: 'auto', margin: '0.5rem 0 0.95rem', lineHeight: 1.6 }}>
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    className
      ? <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem', color: '#334155' }}>{children}</code>
      : <code style={{ background: '#F1F5F9', borderRadius: '4px', padding: '2px 5px', fontSize: '0.85em', color: '#7C3AED', fontFamily: 'ui-monospace, monospace' }}>{children}</code>
  ),
}

function MarkdownContent({ content, compact: small }: { content: string; compact?: boolean }) {
  return (
    <div style={{ fontSize: small ? '0.85rem' : '0.93rem' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

type Category =
  | 'personagem' | 'lugar' | 'termo_biblico' | 'doutrina'
  | 'instituicao' | 'evento' | 'livro_biblico'

type TrustLevel = 1 | 2 | 3 | 4

interface DictionaryEntry {
  id: string
  user_id: string
  title: string
  slug: string | null
  category: Category
  trust_level: TrustLevel
  is_shared: boolean
  definition: string | null
  etymology: string | null
  notes: string | null
  lang_hebrew: string | null
  lang_aramaic: string | null
  lang_greek: string | null
  transliteration: string | null
  pronunciation: string | null
  occurrences: string | null
  main_texts: string | null
  theological_biblical: string | null
  theological_systematic: string | null
  applications: string | null
  cross_references: string[]
  bibliography: string | null
  related_terms: string[]
  tags: string[]
  sources: string[]
  query_count: number
  citation_count: number
  created_at: string
  updated_at: string
}

interface DictionaryVersion {
  id: string
  entry_id: string
  edited_by: string | null
  snapshot: DictionaryEntry
  edited_at: string
}

type PanelState = 'list' | 'detail' | 'create' | 'ai-result' | 'history'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'personagem',    label: 'Pessoas',         icon: '👤' },
  { key: 'lugar',         label: 'Lugares',         icon: '📍' },
  { key: 'termo_biblico', label: 'Termos',          icon: '🔑' },
  { key: 'doutrina',      label: 'Doutrinas',       icon: '✦'  },
  { key: 'instituicao',   label: 'Instituições',    icon: '🏛' },
  { key: 'evento',        label: 'Eventos',         icon: '⚡' },
  { key: 'livro_biblico', label: 'Livros Bíblicos', icon: '📖' },
]

const TRUST: Record<TrustLevel, { label: string; color: string; bg: string; dot: string }> = {
  1: { label: 'Gerado por IA',    color: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' },
  2: { label: 'Revisado por IA',  color: '#163A6B', bg: '#EEF3FA', dot: '#1E4D8C' },
  3: { label: 'Revisado',         color: '#059669', bg: '#F0FDF4', dot: '#10B981' },
  4: { label: 'Oficial Lampas',   color: '#D97706', bg: '#FEFCE8', dot: '#F59E0B' },
}

const EMPTY_DRAFT: Omit<DictionaryEntry, 'id' | 'user_id' | 'query_count' | 'citation_count' | 'created_at' | 'updated_at'> = {
  title: '', slug: null, category: 'termo_biblico', trust_level: 1, is_shared: true,
  definition: '', etymology: '', notes: '',
  lang_hebrew: '', lang_aramaic: '', lang_greek: '', transliteration: '', pronunciation: '',
  occurrences: '', main_texts: '',
  theological_biblical: '', theological_systematic: '', applications: '',
  cross_references: [], bibliography: '', related_terms: [], tags: [], sources: ['Usuário'],
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  project: Project
  userId: string
  onAskAI: (prompt: string) => void
  compact?: boolean
}

// ── TrustBadge ────────────────────────────────────────────────────────────────

function TrustBadge({ level }: { level: TrustLevel }) {
  const t = TRUST[level]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.63rem', color: t.color, fontWeight: 500 }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
      {t.label}
    </span>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ label, value, onExpand }: { label: string; value: string | null | undefined; onExpand?: () => void }) {
  if (!value?.trim()) return null
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
        {onExpand && (
          <button
            onClick={onExpand}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#CBD5E1', padding: '2px 4px', lineHeight: 1,
              display: 'flex', alignItems: 'center', gap: '3px',
              fontSize: '0.65rem', fontFamily: 'inherit', transition: 'color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
            onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            Expandir
          </button>
        )}
      </div>
      <MarkdownContent content={value} />
    </div>
  )
}

// ── Dict Expand Modal ─────────────────────────────────────────────────────────

function DictExpandModal({
  label, termTitle, content, onSave, onClose,
}: {
  label: string
  termTitle: string
  content: string
  onSave: (val: string) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<'view' | 'edit'>(content.trim() ? 'view' : 'edit')
  const [editValue, setEditValue] = useState(content)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        width: '100%', maxWidth: '860px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          padding: '1rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.3rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {termTitle}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '7px', padding: '2px', border: '1px solid #E2E8F0' }}>
              {(['view', 'edit'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  background: mode === m ? '#FFFFFF' : 'transparent',
                  border: `1px solid ${mode === m ? '#E2E8F0' : 'transparent'}`,
                  borderRadius: '5px', padding: '0.27rem 0.7rem',
                  fontSize: '0.72rem', fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? '#1E293B' : '#94A3B8',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                }}>
                  {m === 'view' ? 'Visualizar' : 'Editar'}
                </button>
              ))}
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px',
              padding: '0.3rem 0.55rem', cursor: 'pointer', color: '#94A3B8',
              fontSize: '0.9rem', lineHeight: 1,
            }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {mode === 'view' ? (
            content.trim() ? (
              <MarkdownContent content={content} />
            ) : (
              <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.88rem' }}>
                Campo vazio. Alterne para &ldquo;Editar&rdquo; para adicionar conteúdo.
              </p>
            )
          ) : (
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              style={{
                width: '100%', minHeight: '440px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: '8px', padding: '0.95rem 1.1rem',
                color: '#1E293B', fontSize: '0.91rem', lineHeight: '1.82',
                resize: 'none', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#94A3B8')}
              onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
            />
          )}
        </div>

        {mode === 'edit' && (
          <div style={{
            padding: '0.85rem 1.4rem',
            borderTop: '1px solid #F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '0.6rem', flexShrink: 0, background: '#FFFFFF',
          }}>
            <button onClick={onClose} style={{
              background: 'transparent', border: '1px solid #E2E8F0',
              borderRadius: '7px', padding: '0.46rem 1rem',
              color: '#64748B', fontSize: '0.81rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Fechar
            </button>
            <button onClick={() => onSave(editValue)} style={{
              background: '#1E293B', border: 'none',
              borderRadius: '7px', padding: '0.46rem 1.15rem',
              color: '#FFF', fontSize: '0.81rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DicionarioWorkspace({ project, userId, onAskAI, compact = false }: Props) {
  const supabase     = useMemo(() => createClient(), [])
  const aiBufferRef  = useRef('')

  const [entries,         setEntries]         = useState<DictionaryEntry[]>([])
  const [query,           setQuery]           = useState('')
  const [catFilter,       setCatFilter]       = useState<Category | 'all'>('all')
  const [loading,         setLoading]         = useState(true)
  const [panel,           setPanel]           = useState<PanelState>('list')
  const [selected,        setSelected]        = useState<DictionaryEntry | null>(null)
  const [draft,           setDraft]           = useState({ ...EMPTY_DRAFT })
  const [saving,          setSaving]          = useState(false)
  const [aiLoading,       setAiLoading]       = useState(false)
  const [aiResult,        setAiResult]        = useState('')
  const [savedToast,      setSavedToast]      = useState(false)
  const [deleteConfirm,   setDeleteConfirm]   = useState(false)
  const [expandModal,     setExpandModal]     = useState<{ label: string; content: string; onSave: (v: string) => void } | null>(null)
  const [versions,        setVersions]        = useState<DictionaryVersion[]>([])
  const [versionsLoading, setVersionsLoading] = useState(false)

  // ── Load entries ────────────────────────────────────────────────────────────
  const loadEntries = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('lampas_dictionary')
      .select('*')
      .order('updated_at', { ascending: false })
    setEntries((data ?? []) as DictionaryEntry[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadEntries() }, [loadEntries])

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = entries
    if (catFilter !== 'all') list = list.filter(e => e.category === catFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.definition?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q)) ||
        e.transliteration?.toLowerCase().includes(q) ||
        e.related_terms?.some(t => t.toLowerCase().includes(q)) ||
        e.etymology?.toLowerCase().includes(q) ||
        e.lang_hebrew?.toLowerCase().includes(q) ||
        e.lang_greek?.toLowerCase().includes(q) ||
        e.theological_biblical?.toLowerCase().includes(q) ||
        e.theological_systematic?.toLowerCase().includes(q) ||
        e.applications?.toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, query, catFilter])

  const exactMatch = useMemo(
    () => filtered.find(e => e.title.toLowerCase() === query.toLowerCase().trim()),
    [filtered, query],
  )

  // ── Load version history ────────────────────────────────────────────────────
  async function loadVersions(entryId: string) {
    setVersionsLoading(true)
    const { data } = await supabase
      .from('lampas_dictionary_versions')
      .select('*')
      .eq('entry_id', entryId)
      .order('edited_at', { ascending: false })
      .limit(20)
    setVersions((data ?? []) as DictionaryVersion[])
    setVersionsLoading(false)
  }

  // ── Parse AI verbete into structured fields ──────────────────────────────────
  function parseAIVerbete(text: string, termTitle: string): Partial<Omit<DictionaryEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {
    const sections: Record<string, string> = {}
    const parts = text.split(/\n(?=## )/)
    for (const part of parts) {
      const headerMatch = part.match(/^##\s+([^\n]+)/)
      if (!headerMatch) continue
      const rawHeader = headerMatch[1].replace(/\s*\([^)]*\)/g, '').trim().toLowerCase()
      const content = part.slice(headerMatch[0].length).trim()
      sections[rawHeader] = content
    }

    const langText = sections['línguas originais'] ?? sections['linguas originais'] ?? ''
    const hebrewMatch   = langText.match(/[Hh]ebraico[:\s*]+([^\n]+)/)
    const greekMatch    = langText.match(/[Gg]rego[:\s*]+([^\n]+)/)
    const aramMatch     = langText.match(/[Aa]ramaico[:\s*]+([^\n]+)/)
    const translitMatch = langText.match(/[Tt]ranslit[^:]*:\s*([^\n]+)/)
    const pronuncMatch  = langText.match(/[Pp]ronúncia[:\s*]+([^\n]+)/)

    const refText = sections['referências cruzadas'] ?? sections['referencias cruzadas'] ?? ''
    const refMatches = refText.match(/\b(?:[A-ZÁÉÍÓÚÀÃÕ][a-záéíóúàãõ]+\.?\s+\d+[:.]\d+(?:[–\-]\d+)?)/g) ?? []
    const uniqueRefs = [...new Set(refMatches.map(r => r.trim()))]

    const cat = exactMatch?.category ?? detectCategory(termTitle)

    return {
      title:      termTitle.trim(),
      category:   cat,
      trust_level: 1 as TrustLevel,
      is_shared:  true,
      definition:             sections['definição'] ?? sections['definicao'] ?? '',
      etymology:              sections['etimologia'] ?? '',
      lang_hebrew:            hebrewMatch?.[1]?.trim() ?? '',
      lang_greek:             greekMatch?.[1]?.trim()  ?? '',
      lang_aramaic:           aramMatch?.[1]?.trim()   ?? '',
      transliteration:        translitMatch?.[1]?.trim() ?? '',
      pronunciation:          pronuncMatch?.[1]?.trim()  ?? '',
      main_texts:             sections['uso bíblico'] ?? sections['uso biblico'] ?? '',
      theological_biblical:   sections['teologia bíblica'] ?? sections['teologia biblica'] ?? '',
      theological_systematic: sections['teologia sistemática'] ?? sections['teologia sistematica'] ?? '',
      applications:           sections['aplicações pastorais'] ?? sections['aplicacoes pastorais'] ?? '',
      bibliography:           sections['bibliografia'] ?? '',
      cross_references:       uniqueRefs,
      sources:                ['IA'],
      tags:                   [termTitle.trim().toLowerCase()],
      related_terms:          [],
      notes:                  '',
    }
  }

  // ── AI search ───────────────────────────────────────────────────────────────
  async function searchWithAI() {
    if (!query.trim()) return
    setPanel('ai-result')
    setAiLoading(true)
    setAiResult('')
    aiBufferRef.current = ''

    const prompt = [
      `Pesquisa lexical reformada: "${query.trim()}"`,
      `Contexto: ${project.book} ${project.passage_ref}`,
      '',
      'Produza um verbete completo com estas seções (use os títulos exatamente):',
      '## Definição',
      '## Etimologia',
      '## Línguas Originais',
      '(inclua: hebraico, aramaico ou grego conforme o caso; transliteração; pronúncia)',
      '## Uso Bíblico',
      '(ocorrências no cânon; principais textos)',
      '## Teologia Bíblica',
      '(desenvolvimento progressivo na história da redenção)',
      '## Teologia Sistemática',
      '(relação com loci da teologia sistemática reformada)',
      '## Aplicações Pastorais',
      '## Referências Cruzadas',
      '(liste versículos em formato: Livro Cap:Vers)',
      '## Bibliografia',
      '(cite: BDAG, HALOT, TWOT, NIDOTTE, TDNT, Bavinck, Berkhof, Murray quando aplicável)',
      '',
      'Rigor reformado. Português do Brasil. Fontes primárias, sem Wikipedia.',
    ].join('\n')

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          project: {
            id: project.id, book: project.book, passage_ref: project.passage_ref,
            testament: project.testament, original_language: project.original_language,
          },
          activeSlug:      'ferramentas_dicionario',
          activeTitle:     'Dicionário Lampas',
          dictionaryQuery: query.trim(),
          generationMode:  'economic',
        }),
      })

      if (!res.ok || !res.body) throw new Error('Erro na API')

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
      setAiResult('Erro ao consultar a IA. Tente novamente.')
    }
    setAiLoading(false)
  }

  // ── Save AI result to dictionary (structured) ────────────────────────────────
  async function saveAiResult() {
    if (!aiResult.trim() || !query.trim()) return
    setSaving(true)
    const parsed = parseAIVerbete(aiResult, query.trim())
    const { data } = await supabase
      .from('lampas_dictionary')
      .insert({ ...parsed, user_id: userId })
      .select()
      .single()
    if (data) {
      setEntries(prev => [data as DictionaryEntry, ...prev])
      setSelected(data as DictionaryEntry)
      setPanel('detail')
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 3000)
    }
    setSaving(false)
  }

  // ── Save draft ──────────────────────────────────────────────────────────────
  async function saveDraft() {
    if (!draft.title.trim()) return
    setSaving(true)
    const payload = { ...draft, user_id: userId }
    let data: DictionaryEntry | null = null
    if (selected && panel === 'detail') {
      const res = await supabase.from('lampas_dictionary').update(payload).eq('id', selected.id).select().single()
      data = res.data as DictionaryEntry
    } else {
      const res = await supabase.from('lampas_dictionary').insert(payload).select().single()
      data = res.data as DictionaryEntry
    }
    if (data) {
      setEntries(prev => {
        const idx = prev.findIndex(e => e.id === data!.id)
        return idx >= 0 ? prev.map(e => e.id === data!.id ? data! : e) : [data!, ...prev]
      })
      setSelected(data)
      setPanel('detail')
    }
    setSaving(false)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function deleteEntry() {
    if (!selected) return
    await supabase.from('lampas_dictionary').delete().eq('id', selected.id)
    setEntries(prev => prev.filter(e => e.id !== selected.id))
    setSelected(null)
    setPanel('list')
    setDeleteConfirm(false)
  }

  // ── Update a single field directly (from expand modal in detail view) ────────
  async function updateFieldDirectly(key: string, value: string) {
    if (!selected) return
    const updated = { ...selected, [key]: value } as DictionaryEntry
    setSelected(updated)
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    void supabase.from('lampas_dictionary').update({ [key]: value }).eq('id', selected.id)
  }

  // ── Open entry detail ───────────────────────────────────────────────────────
  async function openEntry(entry: DictionaryEntry) {
    setSelected(entry)
    setPanel('detail')
    void supabase.rpc('increment_dictionary_query_count', { p_id: entry.id })
  }

  // ── Open history panel ──────────────────────────────────────────────────────
  async function openHistory(entry: DictionaryEntry) {
    setSelected(entry)
    setPanel('history')
    await loadVersions(entry.id)
  }

  // ── Restore a version ───────────────────────────────────────────────────────
  async function restoreVersion(v: DictionaryVersion) {
    if (!selected) return
    const { definition, etymology, theological_biblical, theological_systematic, applications, notes } = v.snapshot
    const updated = { ...selected, definition, etymology, theological_biblical, theological_systematic, applications, notes }
    setSelected(updated)
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    await supabase.from('lampas_dictionary').update({
      definition, etymology, theological_biblical, theological_systematic, applications, notes,
    }).eq('id', selected.id)
    setPanel('detail')
  }

  // ── Category detect ─────────────────────────────────────────────────────────
  function detectCategory(term: string): Category {
    const t = term.toLowerCase()
    if (/^[A-ZÁÉÍÓÚÀÃÕ]/.test(term) && term.length < 20) return 'personagem'
    if (['monte', 'cidade', 'rio', 'mar', 'vale', 'terra'].some(w => t.includes(w))) return 'lugar'
    return 'termo_biblico'
  }

  // ── DField helper for create form ───────────────────────────────────────────
  function df(key: keyof typeof draft, label: string, rows = 3) {
    const val = (draft[key] as string) ?? ''
    const canExpand = rows >= 2
    return (
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
          <label style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpandModal({
                label,
                content: val,
                onSave: (newVal) => { setDraft(p => ({ ...p, [key]: newVal })); setExpandModal(null) },
              })}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#CBD5E1', padding: '2px 4px', lineHeight: 1,
                display: 'flex', alignItems: 'center', gap: '3px',
                fontSize: '0.65rem', fontFamily: 'inherit', transition: 'color 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#64748B')}
              onMouseLeave={e => (e.currentTarget.style.color = '#CBD5E1')}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
              Expandir
            </button>
          )}
        </div>
        {rows === 1 ? (
          <input value={val} onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
          />
        ) : (
          <textarea value={val} rows={rows} onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.65 }}
          />
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* Toast */}
      {savedToast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} /> Salvo no Dicionário Lampas
        </div>
      )}

      {/* ── CREATE / EDIT — full overlay ── */}
      {panel === 'create' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
              {selected ? 'Editar verbete' : 'Novo verbete'}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={saveDraft} disabled={saving || !draft.title.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, color: '#FFF', cursor: !draft.title.trim() || saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !draft.title.trim() ? 0.5 : 1 }}>
                <Check size={12} strokeWidth={2.5} /> {saving ? 'Salvando…' : 'Salvar'}
              </button>
              <button onClick={() => { setPanel(selected ? 'detail' : 'list'); if (!selected) setDraft({ ...EMPTY_DRAFT }) }}
                style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2rem' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>Título *</label>
                  <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: צלח / prosperava / Logos"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>Categoria</label>
                  <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value as Category }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              {df('definition', 'Definição', 5)}
              {df('etymology', 'Etimologia', 2)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {(['lang_hebrew', 'lang_greek', 'lang_aramaic'] as const).map(k => df(k, k === 'lang_hebrew' ? 'Hebraico' : k === 'lang_greek' ? 'Grego' : 'Aramaico', 1))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {df('transliteration', 'Transliteração', 1)}
                {df('pronunciation', 'Pronúncia', 1)}
              </div>
              {df('occurrences', 'Ocorrências', 1)}
              {df('main_texts', 'Principais textos', 2)}
              {df('theological_biblical', 'Teologia Bíblica', 3)}
              {df('theological_systematic', 'Teologia Sistemática', 3)}
              {df('applications', 'Aplicações Pastorais', 3)}
              {df('bibliography', 'Bibliografia', 2)}
              {df('notes', 'Notas Pessoais', 2)}
              <div>
                <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px' }}>Tags (separadas por vírgula)</label>
                <input value={draft.tags.join(', ')} onChange={e => setDraft(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                />
              </div>
            </div>
          </div>
        </div>

      ) : (
        // ── Two-column library layout ─────────────────────────────────────────
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ══ LEFT SIDEBAR — search + list ══ */}
          <div style={{
            width: compact ? '100%' : '288px', flexShrink: 0,
            display: compact && panel !== 'list' ? 'none' : 'flex',
            flexDirection: 'column',
            borderRight: compact ? 'none' : '1px solid #E8ECF0',
            background: '#F6F8FA',
            overflow: 'hidden',
          }}>

            {/* Sidebar header */}
            <div style={{ padding: '1.25rem 1.25rem 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    Dicionário
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                    {loading ? '…' : `${entries.length} verbete${entries.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <button
                  onClick={() => { setDraft({ ...EMPTY_DRAFT }); setSelected(null); setPanel('create') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '6px 12px', fontSize: '0.73rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                >
                  <Plus size={11} strokeWidth={2.5} /> Novo
                </button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <Search size={13} strokeWidth={1.75} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); if (panel === 'ai-result') setPanel('list') }}
                  onKeyDown={e => { if (e.key === 'Enter' && query.trim() && filtered.length === 0) searchWithAI() }}
                  placeholder="Buscar termos…"
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '32px', paddingRight: query ? '28px' : '10px', paddingTop: '8px', paddingBottom: '8px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.83rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                  onFocus={e => (e.target.style.borderColor = '#94A3B8')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
                {query && (
                  <button onClick={() => { setQuery(''); setPanel('list') }} style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px', display: 'flex' }}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category filters */}
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0.875rem', scrollbarWidth: 'none' }}>
                <button onClick={() => setCatFilter('all')}
                  style={{ fontSize: '0.68rem', fontWeight: catFilter === 'all' ? 600 : 500, padding: '3px 10px', borderRadius: '20px', border: 'none', background: catFilter === 'all' ? '#1E293B' : '#EAEDF1', color: catFilter === 'all' ? '#FFF' : '#475569', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Todos
                </button>
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setCatFilter(c.key === catFilter ? 'all' : c.key)}
                    style={{ fontSize: '0.68rem', fontWeight: catFilter === c.key ? 600 : 500, padding: '3px 10px', borderRadius: '20px', border: 'none', background: catFilter === c.key ? '#1E293B' : '#EAEDF1', color: catFilter === c.key ? '#FFF' : '#475569', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#E8ECF0', flexShrink: 0 }} />

            {/* Entry list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '60px', borderRadius: '8px', background: '#EAEDF1', opacity: 1 - (i - 1) * 0.2 }} />
                  ))}
                </div>
              ) : entries.length === 0 && !query ? (
                <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
                  <BookOpen size={28} strokeWidth={1} style={{ color: '#CBD5E1', marginBottom: '0.75rem' }} />
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.6 }}>
                    Nenhum verbete ainda.<br />Pesquise para gerar com IA.
                  </div>
                </div>
              ) : filtered.length === 0 && query.trim() ? (
                <div style={{ padding: '1.5rem 1.25rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Nenhum resultado para <strong style={{ color: '#1E293B' }}>&ldquo;{query}&rdquo;</strong>
                  </div>
                  <button onClick={searchWithAI}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#7C3AED', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '0.77rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}>
                    <Sparkles size={12} strokeWidth={1.75} /> Pesquisar com IA
                  </button>
                </div>
              ) : (
                <>
                  {filtered.map(entry => {
                    const isSelected = selected?.id === entry.id && (panel === 'detail' || panel === 'history')
                    const cat = CATEGORIES.find(c => c.key === entry.category)
                    const raw = entry.definition?.trim() ?? ''
                    const excerpt = raw.length > 120 ? raw.slice(0, 120).replace(/\s\S*$/, '') + '…' : raw

                    return (
                      <button
                        key={entry.id}
                        onClick={() => openEntry(entry)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '12px 16px',
                          background: isSelected ? '#ECEEF3' : 'transparent',
                          border: 'none',
                          borderLeft: `2px solid ${isSelected ? '#1E293B' : 'transparent'}`,
                          borderBottom: '1px solid #EEF0F4',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'background 0.1s',
                          boxSizing: 'border-box',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F0F2F6' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                      >
                        {/* Title row: icon + name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: excerpt ? '5px' : '5px' }}>
                          <span style={{ fontSize: '0.92rem', flexShrink: 0, userSelect: 'none', lineHeight: 1 }}>
                            {cat?.icon ?? '📖'}
                          </span>
                          <div style={{
                            fontSize: '0.875rem', fontWeight: 600,
                            color: isSelected ? '#0F172A' : '#1E293B',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {entry.title}
                          </div>
                        </div>

                        {/* Description — below, full width */}
                        {excerpt && (
                          <div style={{
                            fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5,
                            marginBottom: '6px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                            {excerpt}
                          </div>
                        )}

                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.64rem', color: '#94A3B8' }}>{cat?.label}</span>
                          <span style={{ color: '#D1D5DB', fontSize: '0.7rem', lineHeight: 1 }}>·</span>
                          <TrustBadge level={entry.trust_level} />
                        </div>
                      </button>
                    )
                  })}

                  {query.trim() && filtered.length > 0 && !exactMatch && (
                    <div style={{ padding: '10px 16px' }}>
                      <button onClick={searchWithAI}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'transparent', border: '1px dashed #C4B5FD', borderRadius: '7px', padding: '8px 12px', fontSize: '0.75rem', color: '#7C3AED', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, width: '100%', boxSizing: 'border-box' }}>
                        <Sparkles size={11} strokeWidth={1.75} /> Buscar exato com IA
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ══ RIGHT MAIN — detail / ai-result / empty ══ */}
          <div style={{ flex: 1, display: compact && panel === 'list' ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', minWidth: 0 }}>

            {/* ── Detail / History ── */}
            {(panel === 'detail' || panel === 'history') && selected ? (
              <>
                {/* Action bar */}
                <div style={{ flexShrink: 0, padding: '0 1.75rem', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0F2F5' }}>
                  {panel === 'history' ? (
                    <button
                      onClick={() => setPanel('detail')}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500, padding: '4px 8px', borderRadius: '6px' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F4F6F9'; e.currentTarget.style.color = '#1E293B' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B' }}
                    >
                      ← Voltar ao verbete
                    </button>
                  ) : compact ? (
                    <button
                      onClick={() => { setPanel('list'); setSelected(null) }}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500, padding: '4px 8px', borderRadius: '6px' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F4F6F9'; e.currentTarget.style.color = '#1E293B' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B' }}
                    >
                      ← Verbetes
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', letterSpacing: '-0.01em' }}>
                      {CATEGORIES.find(c => c.key === selected.category)?.label ?? 'Verbete'}
                    </div>
                  )}

                  {panel === 'detail' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => openHistory(selected)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #E8ECF0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Clock size={11} /> Histórico
                      </button>
                      <button onClick={() => {
                        setDraft({
                          title: selected.title, slug: selected.slug, category: selected.category,
                          trust_level: selected.trust_level, is_shared: selected.is_shared,
                          definition: selected.definition ?? '', etymology: selected.etymology ?? '',
                          notes: selected.notes ?? '', lang_hebrew: selected.lang_hebrew ?? '',
                          lang_aramaic: selected.lang_aramaic ?? '', lang_greek: selected.lang_greek ?? '',
                          transliteration: selected.transliteration ?? '', pronunciation: selected.pronunciation ?? '',
                          occurrences: selected.occurrences ?? '', main_texts: selected.main_texts ?? '',
                          theological_biblical: selected.theological_biblical ?? '',
                          theological_systematic: selected.theological_systematic ?? '',
                          applications: selected.applications ?? '', cross_references: selected.cross_references,
                          bibliography: selected.bibliography ?? '', related_terms: selected.related_terms,
                          tags: selected.tags, sources: selected.sources,
                        })
                        setPanel('create')
                      }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #E8ECF0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Edit2 size={11} /> Editar
                      </button>
                      {deleteConfirm ? (
                        <>
                          <button onClick={deleteEntry} style={{ background: '#EF4444', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>Confirmar</button>
                          <button onClick={() => setDeleteConfirm(false)} style={{ background: 'none', border: '1px solid #E8ECF0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(true)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: '1px solid #FEE2E2', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#EF4444' }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Scrollable content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>

                  {panel === 'detail' && (
                    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.75rem 2.5rem 5rem' }}>

                      {/* Entry header */}
                      <div style={{ marginBottom: '2.25rem', paddingBottom: '2rem', borderBottom: '1px solid #F0F2F5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <TrustBadge level={selected.trust_level} />
                          <span style={{ color: '#E2E8F0', fontSize: '0.8rem' }}>·</span>
                          <span style={{ fontSize: '0.63rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Eye size={10} /> {selected.query_count}
                          </span>
                          <span style={{ fontSize: '0.63rem', color: '#94A3B8' }}>
                            {new Date(selected.updated_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em', margin: '0 0 0.5rem', lineHeight: 1.05 }}>
                          {selected.title}
                        </h1>

                        {(selected.transliteration || selected.pronunciation) && (
                          <div style={{ fontSize: '1rem', color: '#64748B', fontStyle: 'italic', marginBottom: '0.75rem', letterSpacing: '0.01em' }}>
                            {selected.transliteration}
                            {selected.pronunciation && (
                              <span style={{ fontStyle: 'normal', fontSize: '0.82rem', color: '#94A3B8', marginLeft: '0.5rem' }}>
                                [{selected.pronunciation}]
                              </span>
                            )}
                          </div>
                        )}

                        {selected.tags?.length > 0 && (
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                            {selected.tags.map(t => (
                              <span key={t} style={{ fontSize: '0.67rem', background: '#F1F5F9', color: '#64748B', borderRadius: '4px', padding: '2px 8px' }}>#{t}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <Field label="Definição" value={selected.definition}
                        onExpand={() => setExpandModal({ label: 'Definição', content: selected.definition ?? '', onSave: (v) => { updateFieldDirectly('definition', v); setExpandModal(null) } })}
                      />

                      {(selected.lang_hebrew || selected.lang_greek || selected.lang_aramaic) && (
                        <div style={{ marginBottom: '1.75rem', padding: '1.25rem 1.5rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #EEF0F4' }}>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Línguas Originais</div>
                          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                            {selected.lang_hebrew && (
                              <div>
                                <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hebraico</div>
                                <div style={{ fontSize: '1.15rem', fontFamily: 'serif', direction: 'rtl', color: '#1E293B' }}>{selected.lang_hebrew}</div>
                              </div>
                            )}
                            {selected.lang_greek && (
                              <div>
                                <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grego</div>
                                <div style={{ fontSize: '1.15rem', fontFamily: 'serif', color: '#1E293B' }}>{selected.lang_greek}</div>
                              </div>
                            )}
                            {selected.lang_aramaic && (
                              <div>
                                <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aramaico</div>
                                <div style={{ fontSize: '1.15rem', fontFamily: 'serif', direction: 'rtl', color: '#1E293B' }}>{selected.lang_aramaic}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Field label="Etimologia" value={selected.etymology}
                        onExpand={() => setExpandModal({ label: 'Etimologia', content: selected.etymology ?? '', onSave: (v) => { updateFieldDirectly('etymology', v); setExpandModal(null) } })}
                      />
                      <Field label="Uso Bíblico" value={[selected.occurrences, selected.main_texts].filter(Boolean).join('\n\n')}
                        onExpand={() => setExpandModal({ label: 'Uso Bíblico', content: [selected.occurrences, selected.main_texts].filter(Boolean).join('\n\n'), onSave: (v) => { updateFieldDirectly('main_texts', v); setExpandModal(null) } })}
                      />
                      <Field label="Teologia Bíblica" value={selected.theological_biblical}
                        onExpand={() => setExpandModal({ label: 'Teologia Bíblica', content: selected.theological_biblical ?? '', onSave: (v) => { updateFieldDirectly('theological_biblical', v); setExpandModal(null) } })}
                      />
                      <Field label="Teologia Sistemática" value={selected.theological_systematic}
                        onExpand={() => setExpandModal({ label: 'Teologia Sistemática', content: selected.theological_systematic ?? '', onSave: (v) => { updateFieldDirectly('theological_systematic', v); setExpandModal(null) } })}
                      />
                      <Field label="Aplicações Pastorais" value={selected.applications}
                        onExpand={() => setExpandModal({ label: 'Aplicações Pastorais', content: selected.applications ?? '', onSave: (v) => { updateFieldDirectly('applications', v); setExpandModal(null) } })}
                      />

                      {selected.cross_references?.length > 0 && (
                        <div style={{ marginBottom: '1.75rem' }}>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Referências Cruzadas</div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {selected.cross_references.map(r => (
                              <span key={r} style={{ fontSize: '0.76rem', background: '#EEF3FA', color: '#163A6B', borderRadius: '5px', padding: '3px 9px', border: '1px solid #DBEAFE' }}>{r}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Field label="Bibliografia" value={selected.bibliography}
                        onExpand={() => setExpandModal({ label: 'Bibliografia', content: selected.bibliography ?? '', onSave: (v) => { updateFieldDirectly('bibliography', v); setExpandModal(null) } })}
                      />
                      <Field label="Notas Pessoais" value={selected.notes}
                        onExpand={() => setExpandModal({ label: 'Notas Pessoais', content: selected.notes ?? '', onSave: (v) => { updateFieldDirectly('notes', v); setExpandModal(null) } })}
                      />

                      <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.67rem', color: '#CBD5E1' }}>Fonte: {selected.sources?.join(', ') ?? 'IA'}</span>
                          <span style={{ fontSize: '0.67rem', color: '#CBD5E1' }}>Criado: {new Date(selected.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <button
                          onClick={() => onAskAI(`Com base no verbete "${selected.title}" do Dicionário Lampas e na passagem ${project.book} ${project.passage_ref}, aprofunde a análise: relações com o contexto imediato, implicações para a exegese da perícope e aplicações pastorais adicionais.`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 12px', fontSize: '0.76rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                        >
                          <Sparkles size={12} strokeWidth={1.75} /> Aprofundar com IA
                        </button>
                      </div>
                    </div>
                  )}

                  {panel === 'history' && (
                    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.75rem 2.5rem 5rem' }}>
                      <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Histórico de versões</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E293B', letterSpacing: '-0.02em' }}>{selected.title}</div>
                      </div>
                      {versionsLoading ? (
                        <div style={{ color: '#94A3B8', fontSize: '0.84rem' }}>Carregando histórico…</div>
                      ) : versions.length === 0 ? (
                        <div style={{ color: '#94A3B8', fontSize: '0.84rem', fontStyle: 'italic' }}>Nenhuma versão anterior registrada.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {versions.map((v, i) => (
                            <div key={v.id} style={{ border: '1px solid #EEF0F4', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ padding: '10px 14px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1E293B' }}>Versão {versions.length - i}</span>
                                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginLeft: '10px' }}>{new Date(v.edited_at).toLocaleString('pt-BR')}</span>
                                </div>
                                <button onClick={() => restoreVersion(v)}
                                  style={{ background: '#1E293B', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                                  Restaurar
                                </button>
                              </div>
                              {v.snapshot.definition && (
                                <div style={{ padding: '10px 14px' }}>
                                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>Definição</div>
                                  <div style={{ maxHeight: '80px', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
                                    <MarkdownContent content={v.snapshot.definition} compact />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>

            ) : panel === 'ai-result' ? (
              // ── AI Result ──────────────────────────────────────────────────────
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {compact && (
                  <button
                    onClick={() => { setPanel('list'); setAiResult(''); setQuery('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0.6rem 1rem 0', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 500, padding: '4px 8px', borderRadius: '6px' }}
                  >
                    ← Verbetes
                  </button>
                )}
                <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.75rem 2.5rem 5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.5rem' }}>
                        Resultado da IA
                      </div>
                      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.04em', margin: 0, lineHeight: 1.1 }}>
                        {query}
                      </h1>
                    </div>
                    {!aiLoading && aiResult && (
                      <button onClick={saveAiResult} disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '0.78rem', fontWeight: 600, color: '#FFF', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                        <Check size={13} strokeWidth={2} /> {saving ? 'Salvando…' : 'Salvar no Dicionário'}
                      </button>
                    )}
                  </div>

                  {aiLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', fontSize: '0.84rem' }}>
                        <Sparkles size={15} strokeWidth={1.75} />
                        Consultando a IA…
                      </div>
                      {[85, 70, 90, 60, 80].map((w, i) => (
                        <div key={i} style={{ height: '13px', borderRadius: '4px', background: '#F1F5F9', width: `${w}%` }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.92rem', lineHeight: 1.82, color: '#334155', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {aiResult}
                      </div>
                      {aiResult && (
                        <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Sparkles size={15} strokeWidth={1.75} style={{ color: '#D97706', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8rem', color: '#92400E', flex: 1 }}>
                            Salve para consultar nas próximas vezes sem usar créditos de IA.
                          </span>
                          <button onClick={saveAiResult} disabled={saving}
                            style={{ flexShrink: 0, background: '#D97706', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '0.76rem', fontWeight: 600, color: '#FFF', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                            {saving ? 'Salvando…' : 'Salvar'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            ) : (
              // ── Empty state ─────────────────────────────────────────────────────
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', padding: '2rem' }}>
                <BookOpen size={44} strokeWidth={0.9} style={{ color: '#CBD5E1' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                    {entries.length > 0 ? 'Selecione um verbete' : 'Biblioteca vazia'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                    {entries.length > 0 ? 'Escolha um termo na lista à esquerda' : 'Pesquise um termo para gerar com IA'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {expandModal && (
        <DictExpandModal
          label={expandModal.label}
          termTitle={selected?.title ?? draft.title ?? ''}
          content={expandModal.content}
          onSave={expandModal.onSave}
          onClose={() => setExpandModal(null)}
        />
      )}
    </div>
  )
}
