'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHILD_CONTENT, CONTAINER_TYPES, KNOWLEDGE_STATUSES, KNOWLEDGE_TYPES, type KnowledgeItemType, type KnowledgeStatus } from '@/lib/knowledge-base'
import { ArrowLeft, Brain, Check, ChevronDown, ChevronLeft, ChevronRight, Link2, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import RichEditor from '@/components/RichEditorLazy'
import type { InsertMenuItem } from '@/components/RichEditor'

import type { KnowledgeItem, Props, DimensionFilterType } from './knowledge-internals'
import { getItemContextualSubtitle, Badge, TYPE_ORDER, TYPE_DESCRIPTIONS, KB_INSERT_MENU, TYPE_SECTION_LABELS, EMPTY_ITEM, filterChip, Field, ListField, SectionTitle, CourseModulesEditor, CourseContentEditor, DetailView, LibraryHome, DimensionView, labelStyle, inputStyle, COURSE_GENERAL_BLOCKS } from './knowledge-internals'

export default function KnowledgeClient({ userId, initialItems, initialDashboard }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [items, setItems] = useState<KnowledgeItem[]>(initialItems)
  const [selectedId, setSelectedId] = useState('')
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
  const [choosingType,       setChoosingType]       = useState(false)
  const [sidebarCollapsed,   setSidebarCollapsed]   = useState(false)
  const [showHelp,           setShowHelp]           = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('lampas_kb_help_seen')
  })
  const [groupBy,            setGroupBy]            = useState<'none' | 'type' | 'author' | 'category' | 'status'>('type')
  const [collapsedGroups,    setCollapsedGroups]    = useState<Set<string>>(new Set())
  const [dimensionFilter,    setDimensionFilter]    = useState<{ type: DimensionFilterType; value: string } | null>(null)

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
      if (item.parent_id) return false
      if (typeFilter !== 'all' && item.item_type !== typeFilter) return false
      if (dimensionFilter) {
        const { type, value } = dimensionFilter
        if (type === 'doctrine'  && !item.doctrines.includes(value))        return false
        if (type === 'theme'     && !item.themes.includes(value))           return false
        if (type === 'bible_ref' && !item.bible_references.includes(value)) return false
        if (type === 'author'    && !item.authors.includes(value))          return false
      }
      if (!q) return true
      return [
        item.title, item.subtitle, item.summary, item.category,
        ...item.tags, ...item.authors, ...item.themes, ...item.doctrines, ...item.bible_references,
      ].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    })
  }, [items, query, typeFilter, dimensionFilter])

  const groupedFiltered = useMemo(() => {
    if (groupBy === 'none') return null
    const groups = new Map<string, KnowledgeItem[]>()
    filtered.forEach(item => {
      let key: string
      if (groupBy === 'type')     key = KNOWLEDGE_TYPES[item.item_type].label
      else if (groupBy === 'author')   key = item.authors[0] ?? 'Sem autor'
      else if (groupBy === 'category') key = item.category ?? 'Sem categoria'
      else                             key = KNOWLEDGE_STATUSES[item.status].label
      const arr = groups.get(key) ?? []
      arr.push(item)
      groups.set(key, arr)
    })
    if (groupBy === 'type') {
      return TYPE_ORDER
        .map(t => [KNOWLEDGE_TYPES[t].label, groups.get(KNOWLEDGE_TYPES[t].label) ?? []] as [string, KnowledgeItem[]])
        .filter(([, grpItems]) => grpItems.length > 0)
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [filtered, groupBy])

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
    setChoosingType(false)
    setDraft({ ...EMPTY_ITEM, item_type: type, parent_id: parent?.id ?? null, order_index: nextOrder })
    setCreatingChildOf(parent ?? null)
    setActiveBlocks([])
    setCollapsedBlocks(new Set())
    setShowBlockPicker(false)
    setEditing(true)
    setSelectedId('')
  }

  function closeHelp() {
    localStorage.setItem('lampas_kb_help_seen', '1')
    setShowHelp(false)
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
    // Auto-expõe campos opcionais que já têm conteúdo
    KNOWLEDGE_TYPES[item.item_type].contentFields
      .filter(f => f.optional && item.content?.[f.key])
      .forEach(f => blocks.push(f.key))
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

    if (result.error) {
      console.error('saveItem error:', result.error)
      setToast(`Erro ao salvar: ${result.error.message}`)
      setTimeout(() => setToast(''), 4000)
      setSaving(false)
      return
    }
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
      void supabase.rpc('log_activity', {
        p_event_type:  selected ? 'knowledge_item_updated' : 'knowledge_item_created',
        p_entity_type: 'knowledge_item',
        p_entity_id:   saved.id,
      })
      setToast('Item salvo na Base de Conhecimento')
      setTimeout(() => setToast(''), 2500)
    }
    setSaving(false)
  }

  async function deleteItem(item: KnowledgeItem) {
    await supabase.from('knowledge_items').delete().eq('id', item.id)
    void supabase.rpc('log_activity', { p_event_type: 'knowledge_item_deleted', p_entity_type: 'knowledge_item', p_entity_id: item.id })
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

  function renderSidebarItem(item: KnowledgeItem) {
    const cfg         = KNOWLEDGE_TYPES[item.item_type]
    const active      = selectedId === item.id && !editing
    const isContainer = CONTAINER_TYPES.has(item.item_type)
    const children    = isContainer ? childrenOf(item.id) : []
    const expanded    = expandedContainers.has(item.id)
    const childLabel  = CHILD_CONTENT[item.item_type]
    const contextual  = getItemContextualSubtitle(item)

    return (
      <div key={item.id} style={{ marginBottom: '0.06rem' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '6px', border: `1px solid ${active ? cfg.color + '55' : 'transparent'}`, background: active ? cfg.bg : 'transparent' }}>
          <button
            onClick={() => { setSelectedId(item.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: item.id }) }}
            style={{ flex: 1, textAlign: 'left', border: 'none', background: 'transparent', padding: '0.3rem 0.45rem', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.28rem' }}>
              <span style={{ fontSize: '0.75rem', lineHeight: 1, flexShrink: 0 }}>{cfg.icon}</span>
              <div style={{ fontSize: '0.78rem', fontWeight: active ? 750 : 600, color: active ? cfg.color : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.title}</div>
              {isContainer && children.length > 0 && (
                <span style={{ fontSize: '0.58rem', fontWeight: 800, color: cfg.color, background: cfg.bg, padding: '0.06rem 0.32rem', borderRadius: '999px', flexShrink: 0 }}>{children.length}</span>
              )}
            </div>
            {contextual && (
              <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '0.04rem', marginLeft: '1.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {contextual}
              </div>
            )}
          </button>
          {isContainer && children.length > 0 && (
            <button
              onClick={() => setExpandedContainers(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n })}
              style={{ border: 'none', background: 'transparent', padding: '0 0.38rem', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.58rem', flexShrink: 0 }}
              title={expanded ? 'Recolher' : 'Expandir'}
            >
              {expanded ? '▴' : '▾'}
            </button>
          )}
        </div>
        {isContainer && expanded && children.length > 0 && (
          <div style={{ marginLeft: '0.75rem', marginTop: '0.04rem', borderLeft: `2px solid ${cfg.color}28`, paddingLeft: '0.38rem' }}>
            {children.map(child => {
              const childActive = selectedId === child.id && !editing
              return (
                <button
                  key={child.id}
                  onClick={() => { setSelectedId(child.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: child.id }) }}
                  style={{ width: '100%', textAlign: 'left', border: `1px solid ${childActive ? cfg.color + '40' : 'transparent'}`, background: childActive ? cfg.bg : 'transparent', borderRadius: '5px', padding: '0.22rem 0.38rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.05rem', display: 'flex', alignItems: 'center', gap: '0.28rem' }}
                >
                  <span style={{ fontSize: '0.68rem', color: '#94A3B8', flexShrink: 0 }}>{childLabel?.icon}</span>
                  <div style={{ fontSize: '0.72rem', fontWeight: childActive ? 700 : 600, color: childActive ? cfg.color : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{child.title}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const rightContent = choosingType ? (
    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 850, color: '#0F172A', letterSpacing: '-0.02em' }}>Novo conhecimento</div>
              <button
                onClick={() => setShowHelp(v => !v)}
                title="Ajuda"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', border: '1px solid #CBD5E1', borderRadius: '50%', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}
              >
                ?
              </button>
            </div>
            <p style={{ margin: '0.55rem 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.65, maxWidth: '560px' }}>
              A Base de Conhecimento é o lugar onde você armazena livros, cursos, artigos, vídeos, documentos e outros materiais que poderão alimentar seus estudos, sermões, aulas e produções futuras. Pense nela como seu segundo cérebro teológico e ministerial.
            </p>
          </div>
          <button
            onClick={() => setChoosingType(false)}
            style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '7px', padding: '0.45rem 0.8rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', color: '#64748B', flexShrink: 0, marginLeft: '1rem' }}
          >
            Cancelar
          </button>
        </div>

        {/* Help panel */}
        {showHelp && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, fontSize: '0.82rem', color: '#92400E', lineHeight: 1.65 }}>
              Este espaço serve para guardar e organizar materiais de referência. Depois, esses conteúdos poderão ser consultados, relacionados e usados como apoio em estudos, sermões, cursos e publicações.
            </div>
            <button
              onClick={closeHelp}
              style={{ flexShrink: 0, border: 'none', background: '#FEF3C7', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}
            >
              Entendi
            </button>
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          {TYPE_ORDER.map(type => {
            const cfg = KNOWLEDGE_TYPES[type]
            return (
              <button
                key={type}
                onClick={() => openCreate(type)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.6rem', border: `1.5px solid ${cfg.color}25`, background: cfg.bg, borderRadius: '12px', padding: '1.1rem 1rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.14s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '70'; e.currentTarget.style.boxShadow = `0 4px 12px ${cfg.color}18` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = cfg.color + '25'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span style={{ fontSize: '1.55rem', lineHeight: 1 }}>{cfg.icon}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: cfg.color, marginBottom: '0.2rem' }}>{cfg.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: 1.45 }}>{TYPE_DESCRIPTIONS[type]}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  ) : editing ? (() => {
    const hasRelations            = activeBlocks.includes('relations')
    const requiredContentFields   = currentDraftType.contentFields.filter(f => !f.optional)
    const optionalContentFields   = currentDraftType.contentFields.filter(f => f.optional)
    const activeOptionalFields    = optionalContentFields.filter(f => activeBlocks.includes(f.key))
    const availableOptionalFields = optionalContentFields.filter(f => !activeBlocks.includes(f.key))
    const hasAvailableBlocks      = availableOptionalFields.length > 0 || !hasRelations
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

              {draft.item_type === 'course' ? (
                <>
                  {/* ── Seção 1: Dados da Instituição ── */}
                  <section style={{ border: `1px solid ${currentDraftType.color}25`, borderRadius: '8px', padding: '1rem' }}>
                    <SectionTitle title="Dados da Instituição" color={currentDraftType.color} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Field label="Instituição" value={draft.metadata?.['institution'] ?? ''} onChange={v => setDraft(p => ({ ...p, metadata: { ...p.metadata, institution: v } }))} />
                      <Field label="Curso / Formação" value={draft.metadata?.['course_name'] ?? ''} onChange={v => setDraft(p => ({ ...p, metadata: { ...p.metadata, course_name: v } }))} />
                    </div>
                  </section>

                  {/* ── Seção 2: Dados do Curso ── */}
                  <section style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                    <SectionTitle title="Dados do Curso" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Field label="Título" value={draft.title} onChange={v => setDraft(p => ({ ...p, title: v }))} />
                      <Field label="Subtítulo" value={draft.subtitle ?? ''} onChange={v => setDraft(p => ({ ...p, subtitle: v }))} />
                      <Field label="Categoria" value={draft.category ?? ''} onChange={v => setDraft(p => ({ ...p, category: v }))} />
                      <Field label="Carga Horária" value={draft.metadata?.['workload'] ?? ''} onChange={v => setDraft(p => ({ ...p, metadata: { ...p.metadata, workload: v } }))} />
                      <Field label="URL / Fonte" value={draft.source_url ?? ''} onChange={v => setDraft(p => ({ ...p, source_url: v }))} />
                    </div>
                  </section>

                  {/* ── Seção 3: Dados Gerais do Curso ── */}
                  <section style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                    <SectionTitle title="Dados Gerais do Curso" />
                    <CourseContentEditor
                      blocks={(() => { try { return JSON.parse(draft.content?.['general_blocks'] ?? '[]') } catch { return [] } })()}
                      onBlocksChange={blocks => setDraft(p => ({ ...p, content: { ...p.content, general_blocks: JSON.stringify(blocks) } }))}
                      color={currentDraftType.color}
                      insertMenu={KB_INSERT_MENU}
                      showMandatorySummary={false}
                      presets={COURSE_GENERAL_BLOCKS}
                    />
                  </section>

                  {/* ── Seção 4: Estrutura do Curso (Módulos e Aulas) ── */}
                  <section style={{ border: `1px solid ${currentDraftType.color}25`, borderRadius: '8px', padding: '1rem' }}>
                    <SectionTitle title="Estrutura do Curso" color={currentDraftType.color} />
                    <CourseModulesEditor
                      modules={(() => { try { return JSON.parse(draft.content?.['modules'] ?? '[]') } catch { return [] } })()}
                      onChange={modules => setDraft(p => ({ ...p, content: { ...p.content, modules: JSON.stringify(modules) } }))}
                      color={currentDraftType.color}
                      insertMenu={KB_INSERT_MENU}
                    />
                  </section>
                </>
              ) : (
                <>
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
                      <RichEditor
                        value={draft.summary ?? ''}
                        onChange={v => setDraft(p => ({ ...p, summary: v }))}
                        placeholder="Registre a ideia central e por que este conteúdo importa."
                        moduleColor={currentDraftType.color}
                        minHeight={100}
                        insertMenu={KB_INSERT_MENU}
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

                  {/* ── Conteúdo do tipo (campos obrigatórios) ── */}
                  {requiredContentFields.length > 0 && (
                    <section style={{ border: `1px solid ${currentDraftType.color}25`, borderRadius: '8px', padding: '1rem' }}>
                      <SectionTitle title={typeLabels.content} color={currentDraftType.color} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {requiredContentFields.map(field => (
                          <div key={field.key}>
                            <label style={labelStyle}>{field.label}</label>
                            <RichEditor
                              value={draft.content?.[field.key] ?? ''}
                              onChange={v => setDraft(p => ({ ...p, content: { ...p.content, [field.key]: v } }))}
                              placeholder={field.key}
                              moduleColor={currentDraftType.color}
                              minHeight={(field.rows ?? 3) * 36}
                              insertMenu={KB_INSERT_MENU}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* ── Campos opcionais ativos ── */}
                  {activeOptionalFields.map(field => (
                    <section key={field.key} style={{ border: `1px solid ${currentDraftType.color}20`, borderRadius: '8px', overflow: 'hidden' }}>
                      <div
                        onClick={() => toggleCollapse(field.key)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: `${currentDraftType.color}08`, cursor: 'pointer', userSelect: 'none' as const }}
                      >
                        <div style={{ fontSize: '0.72rem', fontWeight: 850, color: '#334155' }}>{field.label}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>{collapsedBlocks.has(field.key) ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}</span>
                          <button
                            onClick={e => { e.stopPropagation(); removeBlock(field.key) }}
                            style={{ border: 'none', background: 'transparent', color: '#CBD5E1', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', lineHeight: 1, padding: '0 0.1rem' }}
                            title="Remover bloco"
                          >×</button>
                        </div>
                      </div>
                      {!collapsedBlocks.has(field.key) && (
                        <div style={{ padding: '1rem' }}>
                          <RichEditor
                            value={draft.content?.[field.key] ?? ''}
                            onChange={v => setDraft(p => ({ ...p, content: { ...p.content, [field.key]: v } }))}
                            placeholder={`Preencha ${field.label.toLowerCase()}…`}
                            moduleColor={currentDraftType.color}
                            minHeight={(field.rows ?? 3) * 36}
                            insertMenu={KB_INSERT_MENU}
                          />
                        </div>
                      )}
                    </section>
                  ))}
                </>
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
                      <span style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>{collapsedBlocks.has('relations') ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}</span>
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

              {/* ── Adicionar bloco ── */}
              {hasAvailableBlocks && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowBlockPicker(v => !v)}
                    style={{ width: '100%', border: '1.5px dashed #CBD5E1', background: 'transparent', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Adicionar bloco
                  </button>
                  {showBlockPicker && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 50, minWidth: '240px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '9px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      {availableOptionalFields.map(field => (
                        <button key={field.key} onClick={() => addBlock(field.key)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.55rem', border: 'none', background: 'transparent', padding: '0.6rem 0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#334155', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          {field.label}
                        </button>
                      ))}
                      {availableOptionalFields.length > 0 && !hasRelations && (
                        <div style={{ height: '1px', background: '#F1F5F9', margin: '0.2rem 0' }} />
                      )}
                      {!hasRelations && (
                        <button onClick={() => addBlock('relations')}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.55rem', border: 'none', background: 'transparent', padding: '0.6rem 0.9rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#334155', textAlign: 'left' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          🔗 Relações e Entidades
                        </button>
                      )}
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
      allItems={items}
      onEdit={() => openEdit(selected)}
      onDelete={() => deleteItem(selected)}
      onAsk={askAI}
      onSelectChild={child => { setSelectedId(child.id); setEditing(false) }}
      onSelectRelated={rel => { setSelectedId(rel.id); setEditing(false) }}
      onAddChild={() => openCreate(selected.item_type, selected)}
      onBackToParent={selected.parent_id ? () => setSelectedId(selected.parent_id!) : undefined}
    />
  ) : dimensionFilter ? (
    <DimensionView
      filteredItems={filtered}
      dimensionFilter={dimensionFilter}
      onSelectItem={item => { setSelectedId(item.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: item.id }) }}
      onClear={() => { setDimensionFilter(null); setSelectedId('') }}
    />
  ) : (
    <LibraryHome
      items={items}
      counts={dashboard.counts}
      totalChildren={dashboard.totalChildren}
      topAuthors={dashboard.authors}
      topDoctrines={dashboard.doctrines}
      topThemes={dashboard.themes}
      topRefs={dashboard.refs}
      onSelectType={type => {
        setTypeFilter(type)
        setDimensionFilter(null)
        const first = items.find(i => !i.parent_id && i.item_type === type)
        if (first) { setSelectedId(first.id); setEditing(false) }
      }}
      onSelectItem={item => { setSelectedId(item.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: item.id }) }}
      onSelectDimension={(dimType, value) => {
        setDimensionFilter({ type: dimType, value })
        setTypeFilter('all')
        setSelectedId('')
        setEditing(false)
      }}
    />
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
          <button onClick={() => { setChoosingType(true); setEditing(false) }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: '#B45309', color: '#FFFFFF', borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 750, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Plus size={14} /> Novo conhecimento
          </button>
        )}
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: sidebarCollapsed ? '44px 1fr' : '275px 1fr', transition: 'grid-template-columns 0.18s ease' }}>
        <aside style={{ borderRight: '1px solid #E2E8F0', background: '#FFFFFF', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {sidebarCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.65rem', gap: '1rem' }}>
              <button
                onClick={() => setSidebarCollapsed(false)}
                title="Expandir menu"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', border: '1px solid #E2E8F0', borderRadius: '7px', background: '#FFFFFF', color: '#64748B', cursor: 'pointer', flexShrink: 0 }}
              >
                <ChevronRight size={14} />
              </button>
              {dashboard.total > 0 && (
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8' }}>{dashboard.total}</span>
              )}
            </div>
          ) : (
            <>
              {/* Search */}
              <div style={{ padding: '0.55rem 0.7rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.42rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94A3B8' }}>
                    {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
                    {dimensionFilter ? ` · ${dimensionFilter.value}` : ''}
                  </span>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    title="Recolher"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', border: '1px solid #E2E8F0', borderRadius: '5px', background: 'transparent', color: '#94A3B8', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <ChevronLeft size={11} />
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar…" style={{ ...inputStyle, fontSize: '0.77rem', padding: '0.38rem 0.55rem 0.38rem 1.72rem' }} />
                  {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '0.38rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={11} /></button>}
                </div>
              </div>

              {/* Dimension chip */}
              {dimensionFilter && (
                <div style={{ padding: '0.3rem 0.65rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.6rem', color: '#94A3B8' }}>
                    {dimensionFilter.type === 'doctrine'  ? 'Doutrina' :
                     dimensionFilter.type === 'theme'     ? 'Tema' :
                     dimensionFilter.type === 'bible_ref' ? 'Texto' : 'Autor'}:
                  </span>
                  <button
                    onClick={() => { setDimensionFilter(null); setSelectedId('') }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.22rem', border: '1px solid #B4530960', background: '#FEF3C7', color: '#B45309', borderRadius: '999px', padding: '0.13rem 0.45rem', fontSize: '0.66rem', fontWeight: 750, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    {dimensionFilter.value} <X size={9} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* Library tree */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {(groupedFiltered ?? []).map(([groupKey, groupItems]) => {
                  const typeCfg        = TYPE_ORDER.map(t => KNOWLEDGE_TYPES[t]).find(c => c.label === groupKey)
                  const isCollapsed    = collapsedGroups.has(groupKey)
                  if (groupItems.length === 0) return null
                  return (
                    <div key={groupKey}>
                      <button
                        onClick={() => setCollapsedGroups(prev => { const n = new Set(prev); n.has(groupKey) ? n.delete(groupKey) : n.add(groupKey); return n })}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem',
                          padding: '0.48rem 0.6rem',
                          border: 'none', background: 'transparent', borderBottom: '1px solid #F8FAFC',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {typeCfg && <span style={{ fontSize: '0.82rem', lineHeight: 1, flexShrink: 0 }}>{typeCfg.icon}</span>}
                        <span style={{ flex: 1, fontSize: '0.73rem', fontWeight: 700, color: '#475569', textAlign: 'left' }}>{groupKey}</span>
                        <span style={{ fontSize: '0.65rem', color: '#CBD5E1', marginRight: '0.1rem' }}>{groupItems.length}</span>
                        {isCollapsed
                          ? <ChevronRight size={11} strokeWidth={2} style={{ color: '#CBD5E1', flexShrink: 0 }} />
                          : <ChevronDown  size={11} strokeWidth={2} style={{ color: '#CBD5E1', flexShrink: 0 }} />}
                      </button>
                      {!isCollapsed && (
                        <div style={{ paddingBottom: '0.2rem' }}>
                          {groupItems.map(item => {
                            const active = selectedId === item.id && !editing
                            const author = item.authors[0] || item.metadata['author']
                            return (
                              <button
                                key={item.id}
                                onClick={() => { setSelectedId(item.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: item.id }) }}
                                style={{
                                  width: '100%', textAlign: 'left',
                                  border: 'none',
                                  borderLeft: `2px solid ${active ? '#B45309' : 'transparent'}`,
                                  background: active ? '#FFFBF5' : 'transparent',
                                  padding: '0.3rem 0.6rem 0.3rem 1.3rem',
                                  cursor: 'pointer', fontFamily: 'inherit',
                                  transition: 'background 0.08s',
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC' }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                              >
                                <div style={{ fontSize: '0.79rem', fontWeight: active ? 700 : 500, color: active ? '#92400E' : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                                  {item.title}
                                </div>
                                {author && (
                                  <div style={{ fontSize: '0.66rem', color: active ? '#D97706' : '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.05rem' }}>
                                    {author}
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                    Nenhum item encontrado.
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        <main style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>{rightContent}</main>
      </div>
    </div>
  )
}
