'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Project } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, BookOpen, Sparkles, ChevronRight, X, Check, Edit2, Trash2, Clock, Eye } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Category =
  | 'termo_biblico' | 'personagem' | 'lugar' | 'doutrina'
  | 'tema' | 'conceito_historico' | 'lingua_original'

type TrustLevel = 1 | 2 | 3 | 4

interface DictionaryEntry {
  id: string
  user_id: string
  title: string
  category: Category
  trust_level: TrustLevel
  definition: string | null
  etymology: string | null
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

type PanelState = 'list' | 'detail' | 'create' | 'ai-result'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'termo_biblico',     label: 'Termo Bíblico',      icon: '🔑' },
  { key: 'personagem',        label: 'Personagem',          icon: '👤' },
  { key: 'lugar',             label: 'Lugar',               icon: '📍' },
  { key: 'doutrina',          label: 'Doutrina',            icon: '✦' },
  { key: 'tema',              label: 'Tema',                icon: '📖' },
  { key: 'conceito_historico',label: 'Histórico',           icon: '🏛️' },
  { key: 'lingua_original',   label: 'Língua Original',     icon: '𝛼' },
]

const TRUST: Record<TrustLevel, { label: string; color: string; bg: string; dot: string }> = {
  1: { label: 'Gerado por IA',    color: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' },
  2: { label: 'Revisado por IA',  color: '#2563EB', bg: '#EFF6FF', dot: '#3B82F6' },
  3: { label: 'Revisado',         color: '#059669', bg: '#F0FDF4', dot: '#10B981' },
  4: { label: 'Oficial Lampas',   color: '#D97706', bg: '#FEFCE8', dot: '#F59E0B' },
}

const EMPTY_DRAFT: Omit<DictionaryEntry, 'id' | 'user_id' | 'query_count' | 'citation_count' | 'created_at' | 'updated_at'> = {
  title: '', category: 'termo_biblico', trust_level: 1,
  definition: '', etymology: '',
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
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TrustBadge({ level }: { level: TrustLevel }) {
  const t = TRUST[level]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', fontWeight: 700, color: t.color, background: t.bg, borderRadius: '6px', padding: '2px 6px' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
      {t.label}
    </span>
  )
}

function Field({ label, value, onExpand }: { label: string; value: string | null | undefined; onExpand?: () => void }) {
  if (!value?.trim()) return null
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
        {onExpand && (
          <button
            onClick={onExpand}
            title={`Expandir ${label}`}
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
      <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  )
}

// ── Dict Expand Modal ─────────────────────────────────────────────────────

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
        background: 'rgba(0,0,0,0.5)',
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
        {/* Header */}
        <div style={{
          padding: '1rem 1.4rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {mode === 'view' ? (
            content.trim() ? (
              <div style={{ fontSize: '0.91rem', color: '#334155', lineHeight: 1.82, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {content}
              </div>
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

        {/* Footer */}
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

export default function DicionarioWorkspace({ project, userId, onAskAI }: Props) {
  const supabase     = useMemo(() => createClient(), [])
  const aiBufferRef  = useRef('')

  const [entries,      setEntries]      = useState<DictionaryEntry[]>([])
  const [query,        setQuery]        = useState('')
  const [catFilter,    setCatFilter]    = useState<Category | 'all'>('all')
  const [loading,      setLoading]      = useState(true)
  const [panel,        setPanel]        = useState<PanelState>('list')
  const [selected,     setSelected]     = useState<DictionaryEntry | null>(null)
  const [draft,        setDraft]        = useState({ ...EMPTY_DRAFT })
  const [saving,       setSaving]       = useState(false)
  const [aiLoading,    setAiLoading]    = useState(false)
  const [aiResult,     setAiResult]     = useState('')
  const [savedToast,   setSavedToast]   = useState(false)
  const [deleteConfirm,setDeleteConfirm]= useState(false)
  const [expandModal,  setExpandModal]  = useState<{ label: string; content: string; onSave: (v: string) => void } | null>(null)

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

  // ── AI search ───────────────────────────────────────────────────────────────
  async function searchWithAI() {
    if (!query.trim()) return
    setPanel('ai-result')
    setAiLoading(true)
    setAiResult('')
    aiBufferRef.current = ''

    const prompt = [
      `Pesquisa lexical: "${query.trim()}"`,
      `Livro atual: ${project.book} ${project.passage_ref}`,
      '',
      'Produza um verbete completo com estas seções (use os títulos exatamente):',
      '## Definição',
      '## Etimologia',
      '## Línguas Originais (hebraico, aramaico ou grego + transliteração + pronúncia)',
      '## Uso Bíblico (ocorrências, principais textos)',
      '## Teologia Bíblica (desenvolvimento progressivo)',
      '## Teologia Sistemática (relação doutrinária)',
      '## Aplicações Pastorais',
      '## Referências Cruzadas (liste versículos)',
      '## Bibliografia (BDAG, HALOT, TWOT, NIDOTTE, comentários)',
      '',
      'Seja rigoroso, reformado e claro. Português do Brasil.',
    ].join('\n')

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language },
          activeSlug: 'ferramentas_dicionario',
          activeTitle: 'Dicionário Lampas',
        }),
      })

      if (!res.ok || !res.body) throw new Error('Erro na API')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6))
              if (json.type === 'content_block_delta' && json.delta?.text) {
                aiBufferRef.current += json.delta.text
                setAiResult(aiBufferRef.current)
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setAiResult('Erro ao consultar a IA. Tente novamente.')
    }
    setAiLoading(false)
  }

  // ── Save AI result to dictionary ────────────────────────────────────────────
  async function saveAiResult() {
    if (!aiResult.trim() || !query.trim()) return
    setSaving(true)
    const cat = exactMatch?.category ?? detectCategory(query)
    const entry = {
      user_id:    userId,
      title:      query.trim(),
      category:   cat,
      trust_level: 1,
      definition: aiResult,
      sources:    ['IA'],
      tags:       [query.trim().toLowerCase()],
    }
    const { data } = await supabase.from('lampas_dictionary').insert(entry).select().single()
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

  // ── Update a single field directly (from expand modal in detail view) ──────
  async function updateFieldDirectly(key: string, value: string) {
    if (!selected) return
    const updated = { ...selected, [key]: value } as DictionaryEntry
    setSelected(updated)
    setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    void supabase.from('lampas_dictionary').update({ [key]: value }).eq('id', selected.id)
  }

  // ── Increment query count ───────────────────────────────────────────────────
  async function openEntry(entry: DictionaryEntry) {
    setSelected(entry)
    setPanel('detail')
    void supabase.rpc('increment_dictionary_query_count', { p_id: entry.id })
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
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <label style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
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
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.6 }}
          />
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#F8FAFC' }}>

      {/* ── Toast ── */}
      {savedToast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '6px', animation: 'fadeIn 0.2s ease-out' }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} /> Salvo no Dicionário Lampas
        </div>
      )}

      {/* ══ LEFT — Search + List ══ */}
      <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>

        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>Dicionário Lampas</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '1px' }}>{entries.length} verbete{entries.length !== 1 ? 's' : ''} · base de conhecimento viva</div>
            </div>
            <button onClick={() => { setDraft({ ...EMPTY_DRAFT }); setPanel('create') }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={11} strokeWidth={2.5} /> Novo
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} strokeWidth={1.75} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && filtered.length === 0) searchWithAI() }}
              placeholder="Buscar termo, palavra, conceito…"
              style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '30px', paddingRight: query ? '28px' : '10px', paddingTop: '7px', paddingBottom: '7px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px', display: 'flex' }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button onClick={() => setCatFilter('all')}
            style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${catFilter === 'all' ? '#1E293B' : 'transparent'}`, background: catFilter === 'all' ? '#1E293B' : 'transparent', color: catFilter === 'all' ? '#FFF' : '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}>
            Todos
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key === catFilter ? 'all' : c.key)}
              style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${catFilter === c.key ? '#1E293B' : 'transparent'}`, background: catFilter === c.key ? '#1E293B' : 'transparent', color: catFilter === c.key ? '#FFF' : '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}>
              {c.icon}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.78rem' }}>Carregando…</div>
          ) : filtered.length === 0 && !query ? (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📚</div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Nenhum verbete ainda.<br />Pesquise um termo para começar.
              </div>
            </div>
          ) : (
            <>
              {filtered.map(entry => (
                <button key={entry.id} onClick={() => openEntry(entry)}
                  style={{
                    width: '100%', textAlign: 'left', background: selected?.id === entry.id ? '#F0FDF4' : 'transparent',
                    border: `1px solid ${selected?.id === entry.id ? '#10B981' : 'transparent'}`,
                    borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.1s', marginBottom: '2px',
                  }}
                  onMouseEnter={e => { if (selected?.id !== entry.id) e.currentTarget.style.background = '#F8FAFC' }}
                  onMouseLeave={e => { if (selected?.id !== entry.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                    <span style={{ fontSize: '0.8rem', marginTop: '1px', flexShrink: 0 }}>
                      {CATEGORIES.find(c => c.key === entry.category)?.icon ?? '📖'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                        <TrustBadge level={entry.trust_level} />
                        {entry.query_count > 0 && (
                          <span style={{ fontSize: '0.58rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Eye size={9} /> {entry.query_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {/* Passo 2: sem resultado no dicionário → oferecer IA */}
              {query.trim() && filtered.length === 0 && (
                <div style={{ margin: '8px 4px', padding: '14px', background: '#FAF5FF', border: '1px dashed #C4B5FD', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Passo 5 — IA externa</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '10px' }}>
                    "{query}" não está no dicionário.
                  </div>
                  <button onClick={searchWithAI}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#7C3AED', border: 'none', borderRadius: '7px', padding: '6px 12px', fontSize: '0.73rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Sparkles size={11} strokeWidth={1.75} /> Pesquisar com IA
                  </button>
                </div>
              )}

              {/* Passo 2: resultados parciais → mostrar relacionados + opção de IA */}
              {query.trim() && filtered.length > 0 && !exactMatch && (
                <div style={{ margin: '6px 4px', padding: '10px 12px', background: '#FAF5FF', border: '1px solid #DDD6FE', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Passo 2 — termos relacionados</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Exato não encontrado. Tente a IA?</span>
                    <button onClick={searchWithAI}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#7C3AED', border: 'none', borderRadius: '6px', padding: '4px 9px', fontSize: '0.67rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      <Sparkles size={10} /> IA
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══ RIGHT — Detail / Create / AI Result ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── LIST state (nothing selected) ── */}
        {panel === 'list' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: '#94A3B8', padding: '32px' }}>
            <BookOpen size={32} strokeWidth={1} style={{ opacity: 0.25 }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B', textAlign: 'center' }}>
              Selecione um verbete ou pesquise um termo
            </div>
            <div style={{ width: '100%', maxWidth: '340px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '12px' }}>
                Fluxo de consulta
              </div>
              {[
                { n: '1', label: 'Dicionário Lampas', desc: 'Base de conhecimento local', active: true },
                { n: '2', label: 'Termos relacionados', desc: 'Sinônimos e transliterações', active: false },
                { n: '3', label: 'Colagens do projeto', desc: 'Notas e citações salvas', active: false },
                { n: '4', label: 'Conteúdo do projeto', desc: 'Seções já escritas', active: false },
                { n: '5', label: 'IA externa', desc: 'Última opção — consome créditos', active: false },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < 4 ? '8px' : 0 }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    background: step.active ? '#9b7ec8' : '#F1F5F9',
                    border: `1.5px solid ${step.active ? '#9b7ec8' : '#E2E8F0'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '1px',
                  }}>
                    <span style={{ fontSize: '0.55rem', fontWeight: 700, color: step.active ? '#FFF' : '#94A3B8' }}>{step.n}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: step.active ? 600 : 400, color: step.active ? '#1E293B' : '#94A3B8' }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#CBD5E1', lineHeight: 1.3 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AI RESULT state ── */}
        {panel === 'ai-result' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passo 5 — IA externa</div>
                  <div style={{ fontSize: '0.6rem', color: '#CBD5E1', fontStyle: 'italic' }}>não encontrado no dicionário</div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>{query}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {!aiLoading && aiResult && (
                  <button onClick={saveAiResult} disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.76rem', fontWeight: 600, color: '#FFF', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                    <Check size={13} strokeWidth={2} /> {saving ? 'Salvando…' : 'Salvar no Dicionário'}
                  </button>
                )}
                <button onClick={() => setPanel(entries.length > 0 ? 'list' : 'list')}
                  style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#FFFFFF' }}>
              {aiLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6', fontSize: '0.82rem' }}>
                    <Sparkles size={14} strokeWidth={1.75} style={{ animation: 'spin 2s linear infinite' }} />
                    Consultando a IA…
                  </div>
                  {[80, 65, 90, 55, 75].map((w, i) => (
                    <div key={i} style={{ height: '12px', borderRadius: '4px', background: '#F1F5F9', width: `${w}%`, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              ) : (
                <div style={{ fontFamily: 'inherit', fontSize: '0.87rem', lineHeight: 1.75, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {aiResult}
                </div>
              )}
              {!aiLoading && aiResult && (
                <div style={{ marginTop: '20px', padding: '12px 16px', background: '#FEFCE8', border: '1px solid #FDE68A', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={14} strokeWidth={1.75} style={{ color: '#D97706', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.76rem', color: '#92400E' }}>
                    Salve este resultado para consultá-lo sem usar créditos de IA nas próximas vezes.
                  </span>
                  <button onClick={saveAiResult} disabled={saving}
                    style={{ flexShrink: 0, background: '#D97706', border: 'none', borderRadius: '6px', padding: '5px 11px', fontSize: '0.71rem', fontWeight: 600, color: '#FFF', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                    {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DETAIL state ── */}
        {panel === 'detail' && selected && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px 14px', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1rem' }}>{CATEGORIES.find(c => c.key === selected.category)?.icon ?? '📖'}</span>
                  <TrustBadge level={selected.trust_level} />
                  <span style={{ fontSize: '0.62rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Eye size={10} /> {selected.query_count}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} /> {new Date(selected.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>
                  {selected.title}
                </h1>
                {selected.transliteration && (
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px', fontStyle: 'italic' }}>{selected.transliteration}</div>
                )}
                {selected.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {selected.tags.map(t => (
                      <span key={t} style={{ fontSize: '0.6rem', background: '#F1F5F9', color: '#64748B', borderRadius: '4px', padding: '2px 6px' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => { setDraft({ title: selected.title, category: selected.category, trust_level: selected.trust_level, definition: selected.definition ?? '', etymology: selected.etymology ?? '', lang_hebrew: selected.lang_hebrew ?? '', lang_aramaic: selected.lang_aramaic ?? '', lang_greek: selected.lang_greek ?? '', transliteration: selected.transliteration ?? '', pronunciation: selected.pronunciation ?? '', occurrences: selected.occurrences ?? '', main_texts: selected.main_texts ?? '', theological_biblical: selected.theological_biblical ?? '', theological_systematic: selected.theological_systematic ?? '', applications: selected.applications ?? '', cross_references: selected.cross_references, bibliography: selected.bibliography ?? '', related_terms: selected.related_terms, tags: selected.tags, sources: selected.sources }); setPanel('create') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Edit2 size={11} /> Editar
                </button>
                {deleteConfirm ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={deleteEntry} style={{ background: '#EF4444', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>Confirmar</button>
                    <button onClick={() => setDeleteConfirm(false)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(true)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: '1px solid #FEE2E2', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#EF4444' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#FFFFFF' }}>
              <Field label="Definição" value={selected.definition}
                onExpand={() => setExpandModal({
                  label: 'Definição', content: selected.definition ?? '',
                  onSave: (v) => { updateFieldDirectly('definition', v); setExpandModal(null) },
                })}
              />

              {(selected.lang_hebrew || selected.lang_greek || selected.lang_aramaic) && (
                <div style={{ marginBottom: '1rem', padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Línguas Originais</div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {selected.lang_hebrew && <div><span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Hebraico</span><br /><span style={{ fontSize: '0.9rem', fontFamily: 'serif', direction: 'rtl' }}>{selected.lang_hebrew}</span></div>}
                    {selected.lang_greek && <div><span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Grego</span><br /><span style={{ fontSize: '0.9rem', fontFamily: 'serif' }}>{selected.lang_greek}</span></div>}
                    {selected.lang_aramaic && <div><span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Aramaico</span><br /><span style={{ fontSize: '0.9rem', fontFamily: 'serif' }}>{selected.lang_aramaic}</span></div>}
                    {selected.pronunciation && <div><span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>Pronúncia</span><br /><span style={{ fontSize: '0.82rem', color: '#475569' }}>{selected.pronunciation}</span></div>}
                  </div>
                </div>
              )}

              <Field label="Etimologia" value={selected.etymology}
                onExpand={() => setExpandModal({
                  label: 'Etimologia', content: selected.etymology ?? '',
                  onSave: (v) => { updateFieldDirectly('etymology', v); setExpandModal(null) },
                })}
              />
              <Field label="Uso Bíblico" value={[selected.occurrences, selected.main_texts].filter(Boolean).join('\n\n')}
                onExpand={() => setExpandModal({
                  label: 'Uso Bíblico', content: [selected.occurrences, selected.main_texts].filter(Boolean).join('\n\n'),
                  onSave: (v) => { updateFieldDirectly('main_texts', v); setExpandModal(null) },
                })}
              />
              <Field label="Teologia Bíblica" value={selected.theological_biblical}
                onExpand={() => setExpandModal({
                  label: 'Teologia Bíblica', content: selected.theological_biblical ?? '',
                  onSave: (v) => { updateFieldDirectly('theological_biblical', v); setExpandModal(null) },
                })}
              />
              <Field label="Teologia Sistemática" value={selected.theological_systematic}
                onExpand={() => setExpandModal({
                  label: 'Teologia Sistemática', content: selected.theological_systematic ?? '',
                  onSave: (v) => { updateFieldDirectly('theological_systematic', v); setExpandModal(null) },
                })}
              />
              <Field label="Aplicações Pastorais" value={selected.applications}
                onExpand={() => setExpandModal({
                  label: 'Aplicações Pastorais', content: selected.applications ?? '',
                  onSave: (v) => { updateFieldDirectly('applications', v); setExpandModal(null) },
                })}
              />

              {selected.cross_references?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Referências Cruzadas</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {selected.cross_references.map(r => (
                      <span key={r} style={{ fontSize: '0.73rem', background: '#EFF6FF', color: '#2563EB', borderRadius: '5px', padding: '2px 8px', border: '1px solid #BFDBFE' }}>{r}</span>
                    ))}
                  </div>
                </div>
              )}

              <Field label="Bibliografia" value={selected.bibliography}
                onExpand={() => setExpandModal({
                  label: 'Bibliografia', content: selected.bibliography ?? '',
                  onSave: (v) => { updateFieldDirectly('bibliography', v); setExpandModal(null) },
                })}
              />

              {/* Metadata footer */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', color: '#CBD5E1' }}>Fontes: {selected.sources?.join(', ') ?? 'IA'}</span>
                <span style={{ fontSize: '0.65rem', color: '#CBD5E1' }}>Categoria: {CATEGORIES.find(c => c.key === selected.category)?.label}</span>
                <span style={{ fontSize: '0.65rem', color: '#CBD5E1' }}>Criado: {new Date(selected.created_at).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Send to AI for more context */}
              <div style={{ marginTop: '12px' }}>
                <button onClick={() => onAskAI(`Com base no verbete "${selected.title}" do Dicionário Lampas e na passagem ${project.book} ${project.passage_ref}, aprofunde a análise: relações com o contexto imediato, implicações para a exegese da perícope e aplicações pastorais adicionais.`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 12px', fontSize: '0.73rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                >
                  <Sparkles size={11} strokeWidth={1.75} /> Aprofundar com IA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT state ── */}
        {panel === 'create' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#FFFFFF' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Título *</label>
                  <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: צלח / prosperava / Logos"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Categoria</label>
                  <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value as Category }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              {df('definition', 'Definição', 5)}
              {df('etymology', 'Etimologia', 2)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
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
              <div>
                <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Tags (separadas por vírgula)</label>
                <input value={draft.tags.join(', ')} onChange={e => setDraft(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

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
