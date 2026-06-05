'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHILD_CONTENT, CONTAINER_TYPES, KNOWLEDGE_STATUSES, KNOWLEDGE_TYPES, type KnowledgeItemType, type KnowledgeStatus } from '@/lib/knowledge-base'
import { ArrowLeft, Brain, Check, Link2, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'

type JsonRecord = Record<string, string>

interface KnowledgeItem {
  id: string
  user_id: string
  item_type: KnowledgeItemType
  title: string
  subtitle: string | null
  summary: string | null
  status: KnowledgeStatus
  category: string | null
  subcategory: string | null
  rating: number | null
  source_url: string | null
  language: string | null
  metadata: JsonRecord
  content: JsonRecord
  tags: string[]
  bible_references: string[]
  doctrines: string[]
  themes: string[]
  authors: string[]
  people: string[]
  institutions: string[]
  books_mentioned: string[]
  parent_id: string | null
  order_index: number
  query_count: number
  created_at: string
  updated_at: string
}

interface DashboardRow {
  total_items?: number
  books?: number
  articles?: number
  podcasts?: number
  lectures?: number
  courses?: number
  sites?: number
  videos?: number
  personal_documents?: number
  top_authors?: Array<{ name: string; count: number }> | null
  top_doctrines?: Array<{ name: string; count: number }> | null
  top_themes?: Array<{ name: string; count: number }> | null
}

interface Props {
  userId: string
  initialItems: KnowledgeItem[]
  initialDashboard: DashboardRow | null
}

const TYPE_ORDER: KnowledgeItemType[] = ['book', 'article', 'podcast', 'lecture', 'course', 'site', 'video', 'personal_document']

// Rótulos das seções fixas por tipo
const TYPE_SECTION_LABELS: Record<KnowledgeItemType, { metadata: string; content: string }> = {
  book:              { metadata: 'Obra',      content: 'Conteúdo do Livro' },
  article:           { metadata: 'Artigo',    content: 'Conteúdo do Artigo' },
  podcast:           { metadata: 'Episódio',  content: 'Conteúdo do Episódio' },
  lecture:           { metadata: 'Evento',    content: 'Conteúdo da Palestra' },
  course:            { metadata: 'Curso',     content: 'Conteúdo do Curso' },
  site:              { metadata: 'Fonte',     content: 'Conteúdo do Site' },
  video:             { metadata: 'Vídeo',     content: 'Conteúdo do Vídeo' },
  personal_document: { metadata: 'Documento', content: 'Conteúdo do Documento' },
}

const EMPTY_ITEM: Omit<KnowledgeItem, 'id' | 'user_id' | 'query_count' | 'created_at' | 'updated_at'> = {
  parent_id: null,
  order_index: 0,
  item_type: 'book',
  title: '',
  subtitle: '',
  summary: '',
  status: 'captured',
  category: '',
  subcategory: '',
  rating: null,
  source_url: '',
  language: 'pt',
  metadata: {},
  content: {},
  tags: [],
  bible_references: [],
  doctrines: [],
  themes: [],
  authors: [],
  people: [],
  institutions: [],
  books_mentioned: [],
}

function splitList(value: string): string[] {
  return value.split(/[,;\n]/).map(v => v.trim()).filter(Boolean)
}

function joinList(value: string[]): string {
  return value.join(', ')
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '8px', padding: '0.7rem 0.8rem' }}>
      <div style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</div>
      <div style={{ marginTop: '0.45rem', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{value}</div>
      <div style={{ fontSize: '0.62rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function Badge({ children, color = '#64748B', bg = '#F1F5F9' }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '0.16rem 0.5rem', fontSize: '0.62rem', fontWeight: 750, color, background: bg }}>
      {children}
    </span>
  )
}

export default function KnowledgeClient({ userId, initialItems, initialDashboard }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [items, setItems] = useState<KnowledgeItem[]>(initialItems)
  const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? '')
  const [typeFilter, setTypeFilter] = useState<KnowledgeItemType | 'all'>('all')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ ...EMPTY_ITEM })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [activeBlocks,    setActiveBlocks]    = useState<string[]>([])
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set())
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set())
  const [creatingChildOf,    setCreatingChildOf]    = useState<KnowledgeItem | null>(null)

  const selected = items.find(item => item.id === selectedId) ?? null
  const currentDraftType = KNOWLEDGE_TYPES[draft.item_type]

  const dashboard = useMemo(() => {
    const roots    = items.filter(i => !i.parent_id)
    const children = items.filter(i => !!i.parent_id)

    const counts = TYPE_ORDER.reduce<Record<KnowledgeItemType, number>>((acc, type) => {
      acc[type] = roots.filter(item => item.item_type === type).length
      return acc
    }, {} as Record<KnowledgeItemType, number>)

    const childCounts = TYPE_ORDER.reduce<Record<KnowledgeItemType, number>>((acc, type) => {
      acc[type] = children.filter(item => item.item_type === type).length
      return acc
    }, {} as Record<KnowledgeItemType, number>)

    const countValues = (key: keyof Pick<KnowledgeItem, 'authors' | 'doctrines' | 'themes' | 'bible_references'>) => {
      const map = new Map<string, number>()
      items.flatMap(item => item[key]).forEach(name => map.set(name, (map.get(name) ?? 0) + 1))
      return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))
    }

    return {
      total: roots.length || initialDashboard?.total_items || 0,
      totalChildren: children.length,
      counts,
      childCounts,
      authors: countValues('authors'),
      doctrines: countValues('doctrines'),
      themes: countValues('themes'),
      refs: countValues('bible_references'),
    }
  }, [items, initialDashboard])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(item => {
      if (item.parent_id) return false  // filhos aparecem dentro do contêiner
      if (typeFilter !== 'all' && item.item_type !== typeFilter) return false
      if (!q) return true
      return [
        item.title, item.subtitle, item.summary, item.category,
        ...item.tags, ...item.authors, ...item.themes, ...item.doctrines, ...item.bible_references,
      ].filter(Boolean).some(value => String(value).toLowerCase().includes(q))
    })
  }, [items, query, typeFilter])

  // Filhos de um contêiner, ordenados
  function childrenOf(parentId: string): KnowledgeItem[] {
    return items
      .filter(i => i.parent_id === parentId)
      .sort((a, b) => a.order_index - b.order_index)
  }

  function openCreate(type: KnowledgeItemType = 'book', parent?: KnowledgeItem) {
    const nextOrder = parent
      ? items.filter(i => i.parent_id === parent.id).length
      : 0
    setDraft({ ...EMPTY_ITEM, item_type: type, parent_id: parent?.id ?? null, order_index: nextOrder })
    setCreatingChildOf(parent ?? null)
    setActiveBlocks([])
    setCollapsedBlocks(new Set())
    setShowBlockPicker(false)
    setEditing(true)
    setSelectedId('')
  }

  function openEdit(item: KnowledgeItem) {
    setCreatingChildOf(null)
    setDraft({
      parent_id: item.parent_id,
      order_index: item.order_index,
      item_type: item.item_type,
      title: item.title,
      subtitle: item.subtitle ?? '',
      summary: item.summary ?? '',
      status: item.status,
      category: item.category ?? '',
      subcategory: item.subcategory ?? '',
      rating: item.rating,
      source_url: item.source_url ?? '',
      language: item.language ?? 'pt',
      metadata: item.metadata ?? {},
      content: item.content ?? {},
      tags: item.tags ?? [],
      bible_references: item.bible_references ?? [],
      doctrines: item.doctrines ?? [],
      themes: item.themes ?? [],
      authors: item.authors ?? [],
      people: item.people ?? [],
      institutions: item.institutions ?? [],
      books_mentioned: item.books_mentioned ?? [],
    })
    // Auto-expõe relações se o item já tiver dados relacionais
    const blocks: string[] = []
    if ([item.authors, item.doctrines, item.themes, item.bible_references, item.people, item.institutions, item.books_mentioned, item.tags].some(arr => arr.length > 0)) blocks.push('relations')
    setActiveBlocks(blocks)
    setCollapsedBlocks(new Set())
    setShowBlockPicker(false)
    setSelectedId(item.id)
    setEditing(true)
  }

  function addBlock(id: string) {
    setActiveBlocks(prev => [...prev, id])
    setShowBlockPicker(false)
  }

  function removeBlock(id: string) {
    setActiveBlocks(prev => prev.filter(b => b !== id))
    setCollapsedBlocks(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function toggleCollapse(id: string) {
    setCollapsedBlocks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function saveItem() {
    if (!draft.title.trim()) return
    setSaving(true)
    const payload = {
      ...draft,
      user_id: userId,
      subtitle: draft.subtitle || null,
      summary: draft.summary || null,
      category: draft.category || null,
      subcategory: draft.subcategory || null,
      source_url: draft.source_url || null,
    }

    const result = selected
      ? await supabase.from('knowledge_items').update(payload).eq('id', selected.id).select().single()
      : await supabase.from('knowledge_items').insert(payload).select().single()

    if (result.data) {
      const saved = result.data as KnowledgeItem
      setItems(prev => selected ? prev.map(item => item.id === saved.id ? saved : item) : [saved, ...prev])
      setSelectedId(saved.id)
      setEditing(false)
      setCreatingChildOf(null)
      // Auto-expande o contêiner pai ao salvar um filho
      if (saved.parent_id) {
        setExpandedContainers(prev => new Set([...prev, saved.parent_id!]))
      }
      setToast('Item salvo na Base de Conhecimento')
      setTimeout(() => setToast(''), 2500)
    }
    setSaving(false)
  }

  async function deleteItem(item: KnowledgeItem) {
    await supabase.from('knowledge_items').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
    setSelectedId(prev => prev === item.id ? '' : prev)
    setEditing(false)
  }

  function askAI(actionPrompt: string, item: KnowledgeItem | typeof draft) {
    const type = KNOWLEDGE_TYPES[item.item_type]
    const metadata = Object.entries(item.metadata ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')
    const content = Object.entries(item.content ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}:\n${v}`).join('\n\n')
    const prompt = [
      actionPrompt,
      '',
      `Tipo: ${type.label}`,
      `Título: ${item.title}`,
      item.subtitle ? `Subtítulo: ${item.subtitle}` : '',
      item.summary ? `Resumo atual: ${item.summary}` : '',
      metadata ? `Metadados:\n${metadata}` : '',
      content ? `Conteúdo:\n${content}` : '',
      item.authors.length ? `Autores: ${item.authors.join(', ')}` : '',
      item.doctrines.length ? `Doutrinas: ${item.doctrines.join(', ')}` : '',
      item.themes.length ? `Temas: ${item.themes.join(', ')}` : '',
      item.bible_references.length ? `Textos bíblicos: ${item.bible_references.join(', ')}` : '',
    ].filter(Boolean).join('\n')
    localStorage.setItem('lampas_pending_ai_prompt', prompt)
    setToast('Prompt preparado para a IA do Lampas')
    setTimeout(() => setToast(''), 2500)
  }

  const rightContent = editing ? (() => {
    const hasRelations = activeBlocks.includes('relations')
    const typeLabels   = TYPE_SECTION_LABELS[draft.item_type]

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem 4rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '780px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              {creatingChildOf && (
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>{KNOWLEDGE_TYPES[creatingChildOf.item_type].icon}</span>
                  <span style={{ fontWeight: 700 }}>{creatingChildOf.title}</span>
                  <span>›</span>
                  <span>{CHILD_CONTENT[creatingChildOf.item_type]?.singular}</span>
                </div>
              )}
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: currentDraftType.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {selected ? 'Editar' : creatingChildOf ? `Novo ${CHILD_CONTENT[creatingChildOf.item_type]?.singular ?? 'conteúdo'}` : 'Novo item'} · {currentDraftType.label}
              </div>
              <h1 style={{ margin: '0.15rem 0 0', color: '#0F172A', fontSize: '1.35rem', letterSpacing: '-0.02em' }}>Base de Conhecimento</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button onClick={() => { setEditing(false); setShowBlockPicker(false); setCreatingChildOf(null); if (selected) setSelectedId(selected.id) }} style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '7px', padding: '0.5rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', color: '#64748B' }}>Cancelar</button>
              <button onClick={saveItem} disabled={saving || !draft.title.trim()} style={{ border: 'none', background: currentDraftType.color, color: '#FFFFFF', borderRadius: '7px', padding: '0.5rem 0.9rem', cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', fontWeight: 750, opacity: !draft.title.trim() ? 0.5 : 1 }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>

          {/* ── Seletor de tipo — barra horizontal de abas ── */}
          {!creatingChildOf && (
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.1rem', marginBottom: '1rem', scrollbarWidth: 'none' }}>
              {TYPE_ORDER.map(type => {
                const cfg = KNOWLEDGE_TYPES[type]
                const active = draft.item_type === type
                return (
                  <button
                    key={type}
                    onClick={() => setDraft(prev => ({ ...prev, item_type: type }))}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', gap: '0.38rem',
                      border: `1.5px solid ${active ? cfg.color : '#E2E8F0'}`,
                      background: active ? cfg.bg : '#FFFFFF',
                      color: active ? cfg.color : '#64748B',
                      borderRadius: '999px',
                      padding: '0.38rem 0.85rem',
                      cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.78rem', fontWeight: active ? 800 : 600,
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = cfg.color + '60'; e.currentTarget.style.color = cfg.color } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' } }}
                  >
                    <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Campos — largura total */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

              {/* ── Campos básicos — comuns a todos os tipos ── */}
              <section style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <SectionTitle title="Campos Básicos" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Título" value={draft.title} onChange={v => setDraft(p => ({ ...p, title: v }))} />
                  <Field label="Subtítulo" value={draft.subtitle ?? ''} onChange={v => setDraft(p => ({ ...p, subtitle: v }))} />
                  <Field label="Categoria" value={draft.category ?? ''} onChange={v => setDraft(p => ({ ...p, category: v }))} />
                  <Field label="Subcategoria" value={draft.subcategory ?? ''} onChange={v => setDraft(p => ({ ...p, subcategory: v }))} />
                  <Field label="URL / Fonte" value={draft.source_url ?? ''} onChange={v => setDraft(p => ({ ...p, source_url: v }))} />
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select value={draft.status} onChange={e => setDraft(p => ({ ...p, status: e.target.value as KnowledgeStatus }))} style={inputStyle}>
                      {Object.entries(KNOWLEDGE_STATUSES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={labelStyle}>Resumo</label>
                  <textarea
                    value={draft.summary ?? ''}
                    onChange={e => setDraft(p => ({ ...p, summary: e.target.value }))}
                    rows={4}
                    style={{ ...textareaStyle, resize: 'vertical' }}
                    placeholder="Registre a ideia central e por que este conteúdo importa."
                  />
                </div>
              </section>

              {/* ── Metadados do tipo (Obra / Episódio / Evento…) — automático ── */}
              {currentDraftType.metadataFields.length > 0 && (
                <section style={{ border: `1px solid ${currentDraftType.color}25`, borderRadius: '8px', padding: '1rem' }}>
                  <SectionTitle title={typeLabels.metadata} color={currentDraftType.color} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {currentDraftType.metadataFields.map(field => (
                      <Field key={field.key} label={field.label} type={field.type} value={draft.metadata?.[field.key] ?? ''} onChange={v => setDraft(p => ({ ...p, metadata: { ...p.metadata, [field.key]: v } }))} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Conteúdo do tipo (Livro / Episódio / Palestra…) — automático ── */}
              {currentDraftType.contentFields.length > 0 && (
                <section style={{ border: `1px solid ${currentDraftType.color}25`, borderRadius: '8px', padding: '1rem' }}>
                  <SectionTitle title={typeLabels.content} color={currentDraftType.color} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentDraftType.contentFields.map(field => (
                      <div key={field.key}>
                        <label style={labelStyle}>{field.label}</label>
                        <textarea value={draft.content?.[field.key] ?? ''} onChange={e => setDraft(p => ({ ...p, content: { ...p.content, [field.key]: e.target.value } }))} rows={field.rows ?? 3} style={textareaStyle} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Relações e Entidades — bloco opcional ── */}
              {hasRelations && (
                <section style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div
                    onClick={() => toggleCollapse('relations')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: '#F8FAFC', cursor: 'pointer', userSelect: 'none' as const }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 850, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      🔗 Relações e Entidades
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{collapsedBlocks.has('relations') ? '▸' : '▾'}</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeBlock('relations') }}
                        style={{ border: 'none', background: 'transparent', color: '#CBD5E1', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1, padding: '0 0.1rem' }}
                        title="Remover bloco"
                      >×</button>
                    </div>
                  </div>
                  {!collapsedBlocks.has('relations') && (
                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <ListField label="Autores" value={draft.authors} onChange={v => setDraft(p => ({ ...p, authors: v }))} />
                        <ListField label="Doutrinas" value={draft.doctrines} onChange={v => setDraft(p => ({ ...p, doctrines: v }))} />
                        <ListField label="Temas" value={draft.themes} onChange={v => setDraft(p => ({ ...p, themes: v }))} />
                        <ListField label="Textos bíblicos" value={draft.bible_references} onChange={v => setDraft(p => ({ ...p, bible_references: v }))} />
                        <ListField label="Pessoas" value={draft.people} onChange={v => setDraft(p => ({ ...p, people: v }))} />
                        <ListField label="Instituições" value={draft.institutions} onChange={v => setDraft(p => ({ ...p, institutions: v }))} />
                        <ListField label="Livros citados" value={draft.books_mentioned} onChange={v => setDraft(p => ({ ...p, books_mentioned: v }))} />
                        <ListField label="Tags" value={draft.tags} onChange={v => setDraft(p => ({ ...p, tags: v }))} />
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* ── Adicionar bloco (só Relações se ainda não adicionado) ── */}
              {!hasRelations && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowBlockPicker(v => !v)}
                    style={{ width: '100%', border: '1.5px dashed #CBD5E1', background: 'transparent', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Adicionar bloco
                  </button>
                  {showBlockPicker && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 50, minWidth: '220px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '9px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      <button onClick={() => addBlock('relations')}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.55rem', border: 'none', background: 'transparent', padding: '0.65rem 0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#334155', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        🔗 Relações e Entidades
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
        </div>
      </div>
    )
  })() : items.length === 0 ? (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Brain size={36} strokeWidth={1.2} style={{ margin: '0 auto 0.65rem', color: '#B45309' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 750, color: '#0F172A', letterSpacing: '-0.02em' }}>O que você quer capturar?</div>
          <div style={{ marginTop: '0.35rem', fontSize: '0.82rem', color: '#64748B' }}>Escolha o tipo para começar a construir sua base de conhecimento.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
          {TYPE_ORDER.map(type => {
            const cfg = KNOWLEDGE_TYPES[type]
            return (
              <button key={type} onClick={() => openCreate(type)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', border: `1px solid ${cfg.color}30`, background: cfg.bg, borderRadius: '10px', padding: '1.1rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.14s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '70' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cfg.color + '30' }}
              >
                <span style={{ fontSize: '1.4rem' }}>{cfg.icon}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  ) : selected ? (
    <DetailView
      item={selected}
      children={childrenOf(selected.id)}
      parent={selected.parent_id ? items.find(i => i.id === selected.parent_id) : undefined}
      onEdit={() => openEdit(selected)}
      onDelete={() => deleteItem(selected)}
      onAsk={askAI}
      onSelectChild={child => { setSelectedId(child.id); setEditing(false) }}
      onAddChild={() => openCreate(selected.item_type, selected)}
      onBackToParent={selected.parent_id ? () => setSelectedId(selected.parent_id!) : undefined}
    />
  ) : (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#64748B', textAlign: 'center' }}>
      <div>
        <Brain size={38} strokeWidth={1.2} style={{ margin: '0 auto 0.75rem', color: '#94A3B8' }} />
        <div style={{ fontSize: '1rem', fontWeight: 750, color: '#334155' }}>Selecione ou capture conhecimento</div>
        <div style={{ marginTop: '0.35rem', fontSize: '0.82rem' }}>Livros, cursos, palestras e ideias passam a alimentar seus estudos.</div>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {toast && (
        <div style={{ position: 'fixed', right: '1.25rem', bottom: '1.25rem', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#0F172A', color: '#FFFFFF', borderRadius: '9px', padding: '0.65rem 0.9rem', fontSize: '0.8rem', boxShadow: '0 12px 30px rgba(15,23,42,0.25)' }}>
          <Check size={14} /> {toast}
        </div>
      )}

      <header style={{ height: '58px', flexShrink: 0, borderBottom: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={() => router.push('/dashboard')} title="Voltar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', border: '1px solid #E2E8F0', borderRadius: '7px', background: '#FFFFFF', color: '#64748B', cursor: 'pointer' }}>
            <ArrowLeft size={15} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#0F172A', fontWeight: 850, letterSpacing: '-0.02em' }}>
              <Brain size={17} color="#B45309" /> Base de Conhecimento
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Segundo cérebro teológico e ministerial</div>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={() => openCreate()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: '#B45309', color: '#FFFFFF', borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 750, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={14} /> Novo conhecimento
          </button>
        )}
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '330px 1fr' }}>
        <aside style={{ borderRight: '1px solid #E2E8F0', background: '#FFFFFF', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.9rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.8rem' }}>
              <StatCard label="Entidades" value={dashboard.total} icon="🧠" />
              <StatCard label="Conteúdos" value={dashboard.totalChildren} icon="📄" />
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por autor, doutrina, texto..." style={{ ...inputStyle, paddingLeft: '2rem' }} />
              {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '0.45rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer' }}><X size={13} /></button>}
            </div>
          </div>

          <div style={{ padding: '0.65rem 0.75rem', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button onClick={() => setTypeFilter('all')} style={filterButton(typeFilter === 'all')}>Todos</button>
            {TYPE_ORDER.map(type => {
              const cfg = KNOWLEDGE_TYPES[type]
              return <button key={type} onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)} style={filterButton(typeFilter === type, cfg.color, cfg.bg)}>{cfg.icon}</button>
            })}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.45rem' }}>
            {filtered.map(item => {
              const cfg = KNOWLEDGE_TYPES[item.item_type]
              const active = selectedId === item.id && !editing
              const isContainer = CONTAINER_TYPES.has(item.item_type)
              const children = isContainer ? childrenOf(item.id) : []
              const expanded = expandedContainers.has(item.id)
              const childLabel = CHILD_CONTENT[item.item_type]

              return (
                <div key={item.id} style={{ marginBottom: '0.2rem' }}>
                  {/* Linha do item raiz */}
                  <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '8px', border: `1px solid ${active ? cfg.color + '55' : 'transparent'}`, background: active ? cfg.bg : 'transparent' }}>
                    <button
                      onClick={() => { setSelectedId(item.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: item.id }) }}
                      style={{ flex: 1, textAlign: 'left', border: 'none', background: 'transparent', padding: '0.65rem 0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1rem', lineHeight: 1.1 }}>{cfg.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '0.12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.authors[0] ?? cfg.label}{item.bible_references[0] ? ` · ${item.bible_references[0]}` : ''}
                          </div>
                          <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            <Badge color={KNOWLEDGE_STATUSES[item.status].color} bg={KNOWLEDGE_STATUSES[item.status].bg}>{KNOWLEDGE_STATUSES[item.status].label}</Badge>
                            {isContainer && children.length > 0 && (
                              <Badge color={cfg.color} bg={cfg.bg}>{children.length} {children.length === 1 ? childLabel?.singular : childLabel?.plural}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    {/* Botão expand — só para contêineres com filhos */}
                    {isContainer && children.length > 0 && (
                      <button
                        onClick={() => setExpandedContainers(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n })}
                        style={{ border: 'none', background: 'transparent', padding: '0 0.6rem', cursor: 'pointer', color: '#94A3B8', fontSize: '0.7rem' }}
                        title={expanded ? 'Recolher' : 'Expandir'}
                      >
                        {expanded ? '▴' : '▾'}
                      </button>
                    )}
                  </div>

                  {/* Filhos — visíveis quando expandido */}
                  {isContainer && expanded && children.length > 0 && (
                    <div style={{ marginLeft: '1.25rem', marginTop: '0.15rem', borderLeft: `2px solid ${cfg.color}30`, paddingLeft: '0.6rem' }}>
                      {children.map(child => {
                        const childActive = selectedId === child.id && !editing
                        return (
                          <button
                            key={child.id}
                            onClick={() => { setSelectedId(child.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: child.id }) }}
                            style={{ width: '100%', textAlign: 'left', border: `1px solid ${childActive ? cfg.color + '40' : 'transparent'}`, background: childActive ? cfg.bg : 'transparent', borderRadius: '6px', padding: '0.45rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                          >
                            <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{childLabel?.icon}</span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '0.79rem', fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.title}</div>
                              <div style={{ fontSize: '0.64rem', color: '#94A3B8' }}>
                                {KNOWLEDGE_STATUSES[child.status].label}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>Nenhum item encontrado.</div>
            )}
          </div>
        </aside>

        <main style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>{rightContent}</main>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#64748B',
  fontSize: '0.64rem',
  fontWeight: 800,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '0.28rem',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #E2E8F0',
  borderRadius: '7px',
  background: '#FFFFFF',
  color: '#0F172A',
  padding: '0.52rem 0.65rem',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '0.82rem',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  lineHeight: 1.55,
}

function filterButton(active: boolean, color = '#0F172A', bg = '#F1F5F9'): React.CSSProperties {
  return {
    border: `1px solid ${active ? color + '55' : '#E2E8F0'}`,
    background: active ? bg : '#FFFFFF',
    color: active ? color : '#64748B',
    borderRadius: '999px',
    padding: '0.25rem 0.55rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.68rem',
    fontWeight: 750,
  }
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </div>
  )
}

function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={joinList(value)} onChange={e => onChange(splitList(e.target.value))} style={inputStyle} placeholder="Separe por vírgula" />
    </div>
  )
}

function SectionTitle({ title, color = '#0F172A' }: { title: string; color?: string }) {
  return <div style={{ fontSize: '0.72rem', color, fontWeight: 850, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>{title}</div>
}

function DetailView({ item, children, parent, onEdit, onDelete, onAsk, onSelectChild, onAddChild, onBackToParent }: {
  item: KnowledgeItem
  children: KnowledgeItem[]
  parent?: KnowledgeItem
  onEdit: () => void
  onDelete: () => void
  onAsk: (prompt: string, item: KnowledgeItem) => void
  onSelectChild: (child: KnowledgeItem) => void
  onAddChild: () => void
  onBackToParent?: () => void
}) {
  const cfg = KNOWLEDGE_TYPES[item.item_type]
  const status = KNOWLEDGE_STATUSES[item.status]
  const contentEntries = cfg.contentFields
    .map(field => ({ ...field, value: item.content?.[field.key] ?? '' }))
    .filter(field => field.value.trim())
  const metadataEntries = cfg.metadataFields
    .map(field => ({ ...field, value: item.metadata?.[field.key] ?? '' }))
    .filter(field => field.value.trim())

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF', padding: '1.35rem 1.6rem 4rem' }}>
      <div style={{ maxWidth: '980px' }}>
        {/* Breadcrumb de pai */}
        {parent && onBackToParent && (
          <button
            onClick={onBackToParent}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0 0 0.75rem 0', fontWeight: 600 }}
          >
            ← {KNOWLEDGE_TYPES[parent.item_type].icon} {parent.title}
          </button>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <Badge color={cfg.color} bg={cfg.bg}>{cfg.icon} {cfg.label}</Badge>
              <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
              {item.rating ? <Badge>{'★'.repeat(item.rating)}</Badge> : null}
            </div>
            <h1 style={{ margin: 0, color: '#0F172A', fontSize: '1.55rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{item.title}</h1>
            {item.subtitle && <div style={{ marginTop: '0.35rem', color: '#64748B', fontSize: '0.9rem' }}>{item.subtitle}</div>}
          </div>
          <div style={{ display: 'flex', gap: '0.45rem', flexShrink: 0 }}>
            <button onClick={onEdit} style={{ ...smallButtonStyle, borderColor: '#CBD5E1', color: '#334155' }}>Editar</button>
            <button onClick={onDelete} style={{ ...smallButtonStyle, borderColor: '#FECACA', color: '#DC2626' }}><Trash2 size={13} /></button>
          </div>
        </div>

        {item.summary && (
          <section style={{ ...detailSectionStyle, marginBottom: '1rem' }}>
            <SectionTitle title="Síntese" />
            <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.summary}</p>
          </section>
        )}

        {/* ── Conteúdos internos — apenas para contêineres ── */}
        {CONTAINER_TYPES.has(item.item_type) && (
          <section style={{ ...detailSectionStyle, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <SectionTitle
                title={`${CHILD_CONTENT[item.item_type]?.plural ?? 'Conteúdos'} (${children.length})`}
                color={cfg.color}
              />
              <button
                onClick={onAddChild}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', border: `1px solid ${cfg.color}40`, background: cfg.bg, color: cfg.color, borderRadius: '7px', padding: '0.38rem 0.7rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 750 }}
              >
                <Plus size={13} /> {CHILD_CONTENT[item.item_type]?.singular ?? 'Conteúdo'}
              </button>
            </div>
            {children.length === 0 ? (
              <div style={{ color: '#94A3B8', fontSize: '0.82rem', textAlign: 'center', padding: '0.75rem 0' }}>
                Nenhum conteúdo ainda. Adicione o primeiro {CHILD_CONTENT[item.item_type]?.singular?.toLowerCase() ?? 'conteúdo'}.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {children.map((child, idx) => (
                  <button
                    key={child.id}
                    onClick={() => onSelectChild(child)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '7px', padding: '0.55rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '55'; e.currentTarget.style.background = cfg.bg }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8', minWidth: '1.4rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.title}</div>
                      {child.subtitle && <div style={{ fontSize: '0.7rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.subtitle}</div>}
                    </div>
                    <Badge color={KNOWLEDGE_STATUSES[child.status].color} bg={KNOWLEDGE_STATUSES[child.status].bg}>
                      {KNOWLEDGE_STATUSES[child.status].label}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(260px, 0.8fr)', gap: '1rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contentEntries.length > 0 ? contentEntries.map(entry => (
              <section key={entry.key} style={detailSectionStyle}>
                <SectionTitle title={entry.label} />
                <div style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{entry.value}</div>
              </section>
            )) : (
              <section style={detailSectionStyle}>
                <div style={{ color: '#94A3B8', fontSize: '0.86rem' }}>Ainda não há conteúdo processado para este item.</div>
              </section>
            )}
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <section style={detailSectionStyle}>
              <SectionTitle title="IA especializada" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {cfg.aiActions.map(action => (
                  <button key={action.label} onClick={() => onAsk(action.prompt, item)} style={{ ...smallButtonStyle, justifyContent: 'flex-start', color: cfg.color, borderColor: cfg.color + '35' }}>
                    <Sparkles size={13} /> {action.label}
                  </button>
                ))}
              </div>
            </section>

            <section style={detailSectionStyle}>
              <SectionTitle title="Metadados" />
              <MetaList entries={metadataEntries.map(e => [e.label, e.value])} />
            </section>

            <section style={detailSectionStyle}>
              <SectionTitle title="Rede de conhecimento" />
              <TagGroup label="Autores" values={item.authors} />
              <TagGroup label="Doutrinas" values={item.doctrines} />
              <TagGroup label="Temas" values={item.themes} />
              <TagGroup label="Textos" values={item.bible_references} />
              <TagGroup label="Instituições" values={item.institutions} />
              <TagGroup label="Tags" values={item.tags} />
            </section>

            {item.source_url && (
              <a href={item.source_url} target="_blank" rel="noreferrer" style={{ ...smallButtonStyle, textDecoration: 'none', justifyContent: 'center', color: '#2563EB' }}>
                <Link2 size={13} /> Abrir fonte
              </a>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

const detailSectionStyle: React.CSSProperties = {
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  background: '#FFFFFF',
  padding: '1rem',
}

const smallButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  borderRadius: '7px',
  padding: '0.48rem 0.7rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '0.78rem',
  fontWeight: 750,
}

function MetaList({ entries }: { entries: Array<[string, string]> }) {
  if (entries.length === 0) return <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Sem metadados.</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {entries.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

function TagGroup({ label, values }: { label: string; values: string[] }) {
  if (!values.length) return null
  return (
    <div style={{ marginBottom: '0.65rem' }}>
      <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {values.map(value => <Badge key={value}>{value}</Badge>)}
      </div>
    </div>
  )
}
