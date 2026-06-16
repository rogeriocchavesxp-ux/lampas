'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CHILD_CONTENT, CONTAINER_TYPES, KNOWLEDGE_STATUSES, KNOWLEDGE_TYPES, type KnowledgeItemType, type KnowledgeStatus } from '@/lib/knowledge-base'
import { ArrowLeft, Brain, Check, ChevronDown, ChevronLeft, ChevronRight, Link2, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import RichEditor from '@/components/RichEditorLazy'
import type { InsertMenuItem } from '@/components/RichEditor'

type JsonRecord = Record<string, string>

interface CourseLesson {
  id: string
  title: string
  professor: string
  description: string
  video_url: string
  material: string
  order: number
  summary: string
  blocks: CourseContentBlock[]
}

interface CourseModule {
  id: string
  name: string
  description: string
  order: number
  lessons: CourseLesson[]
}

interface CourseContentBlock {
  id: string
  key: string
  label: string
  value: string
  collapsed: boolean
  order: number
}

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

const TYPE_DESCRIPTIONS: Record<KnowledgeItemType, string> = {
  book:              'Obra, comentário bíblico, teologia sistemática ou referência bibliográfica',
  article:           'Artigo acadêmico, texto teológico, ensaio ou publicação periódica',
  podcast:           'Episódio de podcast, série de áudio ou programa ministerial',
  lecture:           'Palestra, conferência, seminário ou evento presencial',
  course:            'Curso com módulos, unidades e aulas estruturadas',
  site:              'Site, blog, página web ou recurso online',
  video:             'Vídeo, série ou aula em formato audiovisual',
  personal_document: 'Anotação, rascunho, reflexão pessoal ou documento próprio',
}

const KB_INSERT_MENU: InsertMenuItem[] = [
  { icon: '🏷', label: 'Palavra-chave', snippet: '<p>🏷 <strong>Palavra-chave:</strong> </p>' },
  { icon: '✝', label: 'Doutrina',       snippet: '<p>✝ <strong>Doutrina:</strong> </p>' },
  { icon: '👤', label: 'Pessoa',         snippet: '<p>👤 <strong>Pessoa:</strong> </p>' },
  { icon: '📚', label: 'Livro citado',   snippet: '<p>📚 <strong>Livro:</strong> </p>' },
  { icon: '✍', label: 'Autor',          snippet: '<p>✍ <strong>Autor:</strong> </p>' },
  { icon: '📅', label: 'Evento/Data',   snippet: '<p>📅 <strong>Evento:</strong> </p>' },
  { icon: '❓', label: 'Pergunta',       snippet: '<p>❓ <strong>Pergunta:</strong> </p>' },
  { icon: '👉', label: 'Aplicação',      snippet: '<p>👉 <strong>Aplicação:</strong> </p>' },
  { icon: '❝', label: 'Citação',        snippet: '<blockquote><p></p></blockquote>' },
  { icon: '💡', label: 'Exemplo',        snippet: '<p>💡 <strong>Exemplo:</strong> </p>' },
]

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

function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

function getItemContextualSubtitle(item: KnowledgeItem): string | null {
  const m = (item.metadata ?? {}) as Record<string, string>
  switch (item.item_type) {
    case 'course': {
      const parts = [m['institution'], m['course_name']].filter(v => v && v.trim())
      return parts.join(' · ') || item.authors[0] || null
    }
    case 'book':
    case 'article':
    case 'podcast':
      return item.authors[0] || null
    case 'site':
      if (item.source_url) {
        try { return new URL(item.source_url).hostname.replace(/^www\./, '') } catch { return null }
      }
      return item.category || null
    case 'video':
      return m['channel'] || item.authors[0] || null
    case 'lecture':
      return m['event'] || m['conference'] || item.authors[0] || null
    case 'personal_document':
      return item.category || item.authors[0] || null
    default:
      return item.authors[0] || null
  }
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
  const [choosingType,       setChoosingType]       = useState(false)
  const [sidebarCollapsed,   setSidebarCollapsed]   = useState(false)
  const [showHelp,           setShowHelp]           = useState(() => {
    if (typeof window === 'undefined') return false
    return !localStorage.getItem('lampas_kb_help_seen')
  })
  const [groupBy,            setGroupBy]            = useState<'none' | 'type' | 'author' | 'category' | 'status'>('none')
  const [collapsedGroups,    setCollapsedGroups]    = useState<Set<string>>(new Set())

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
    const cfg      = KNOWLEDGE_TYPES[item.item_type]
    const active   = selectedId === item.id && !editing
    const isContainer = CONTAINER_TYPES.has(item.item_type)
    const children    = isContainer ? childrenOf(item.id) : []
    const expanded    = expandedContainers.has(item.id)
    const childLabel  = CHILD_CONTENT[item.item_type]
    const status      = KNOWLEDGE_STATUSES[item.status]

    return (
      <div key={item.id} style={{ marginBottom: '0.12rem' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '7px', border: `1px solid ${active ? cfg.color + '55' : 'transparent'}`, background: active ? cfg.bg : 'transparent' }}>
          <button
            onClick={() => { setSelectedId(item.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: item.id }) }}
            style={{ flex: 1, textAlign: 'left', border: 'none', background: 'transparent', padding: '0.42rem 0.55rem', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}
          >
            {/* Line 1: icon + title */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', lineHeight: 1, flexShrink: 0 }}>{cfg.icon}</span>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.title}</div>
            </div>
            {/* Line 2: type · contextual subtitle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.62rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '0 1 auto', minWidth: 0 }}>
                {(() => { const sub = getItemContextualSubtitle(item); return sub ? `${cfg.label} · ${sub}` : cfg.label })()}
              </span>
              {isContainer && children.length > 0 && (
                <Badge color={cfg.color} bg={cfg.bg}>{children.length} {children.length === 1 ? childLabel?.singular : childLabel?.plural}</Badge>
              )}
            </div>
          </button>
          {isContainer && children.length > 0 && (
            <button
              onClick={() => setExpandedContainers(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n })}
              style={{ border: 'none', background: 'transparent', padding: '0 0.45rem', cursor: 'pointer', color: '#CBD5E1', fontSize: '0.6rem', flexShrink: 0 }}
              title={expanded ? 'Recolher' : 'Expandir'}
            >
              {expanded ? '▴' : '▾'}
            </button>
          )}
        </div>
        {isContainer && expanded && children.length > 0 && (
          <div style={{ marginLeft: '0.9rem', marginTop: '0.08rem', borderLeft: `2px solid ${cfg.color}30`, paddingLeft: '0.45rem' }}>
            {children.map(child => {
              const childActive = selectedId === child.id && !editing
              return (
                <button
                  key={child.id}
                  onClick={() => { setSelectedId(child.id); setEditing(false); void supabase.rpc('increment_knowledge_item_query_count', { p_id: child.id }) }}
                  style={{ width: '100%', textAlign: 'left', border: `1px solid ${childActive ? cfg.color + '40' : 'transparent'}`, background: childActive ? cfg.bg : 'transparent', borderRadius: '5px', padding: '0.28rem 0.45rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.08rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8', flexShrink: 0 }}>{childLabel?.icon}</span>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{child.title}</div>
                  <Badge color={KNOWLEDGE_STATUSES[child.status].color} bg={KNOWLEDGE_STATUSES[child.status].bg}>{KNOWLEDGE_STATUSES[child.status].label}</Badge>
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
              {/* Compact stats + search */}
              <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', marginRight: '0.18rem' }}>{dashboard.total}</span>entidades
                    </span>
                    {dashboard.totalChildren > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', marginRight: '0.18rem' }}>{dashboard.totalChildren}</span>conteúdos
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    title="Recolher menu"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', border: '1px solid #E2E8F0', borderRadius: '6px', background: 'transparent', color: '#94A3B8', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <ChevronLeft size={12} />
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Título, autor, tema, doutrina…" style={{ ...inputStyle, paddingLeft: '1.85rem', fontSize: '0.78rem', padding: '0.42rem 0.6rem 0.42rem 1.85rem' }} />
                  {query && <button onClick={() => setQuery('')} style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={12} /></button>}
                </div>
              </div>

              {/* Type chips + groupBy */}
              <div style={{ padding: '0.42rem 0.6rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: '0.22rem', overflowX: 'auto', paddingBottom: '0.08rem', scrollbarWidth: 'none' }}>
                  <button onClick={() => setTypeFilter('all')} style={filterChip(typeFilter === 'all')}>Todos</button>
                  {TYPE_ORDER.map(type => {
                    const cfg = KNOWLEDGE_TYPES[type]
                    const active = typeFilter === type
                    return (
                      <button key={type} onClick={() => setTypeFilter(active ? 'all' : type)} style={filterChip(active, cfg.color, cfg.bg)}>
                        {cfg.icon} {cfg.label}
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.32rem' }}>
                  <span style={{ fontSize: '0.57rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>Agrupar</span>
                  <div style={{ display: 'flex', gap: '0.18rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {(['none', 'type', 'author', 'category', 'status'] as const).map(g => (
                      <button key={g} onClick={() => setGroupBy(g)} style={filterChip(groupBy === g)}>
                        {g === 'none' ? 'Livre' : g === 'type' ? 'Tipo' : g === 'author' ? 'Autor' : g === 'category' ? 'Categ.' : 'Status'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0.3rem' }}>
                {groupBy !== 'none' && groupedFiltered ? (
                  groupedFiltered.map(([groupKey, groupItems]) => {
                    const isGroupCollapsed = collapsedGroups.has(groupKey)
                    return (
                      <div key={groupKey}>
                        <button
                          onClick={() => setCollapsedGroups(prev => { const n = new Set(prev); n.has(groupKey) ? n.delete(groupKey) : n.add(groupKey); return n })}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.32rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          <span style={{ fontSize: '0.58rem', color: '#94A3B8', lineHeight: 1 }}>{isGroupCollapsed ? '▶' : '▼'}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#334155', flex: 1, textAlign: 'left' }}>{groupKey}</span>
                          <span style={{ fontSize: '0.6rem', color: '#94A3B8', background: '#F1F5F9', padding: '0.1rem 0.38rem', borderRadius: '999px' }}>{groupItems.length}</span>
                        </button>
                        {!isGroupCollapsed && groupItems.map(item => renderSidebarItem(item))}
                      </div>
                    )
                  })
                ) : (
                  filtered.map(item => renderSidebarItem(item))
                )}
                {filtered.length === 0 && (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>Nenhum item encontrado.</div>
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

function filterChip(active: boolean, color = '#334155', bg = '#F1F5F9'): React.CSSProperties {
  return {
    border: `1px solid ${active ? color + '55' : '#E2E8F0'}`,
    background: active ? bg : 'transparent',
    color: active ? color : '#94A3B8',
    borderRadius: '999px',
    padding: '0.18rem 0.45rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '0.62rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'all 0.1s',
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

function CourseModulesEditor({
  modules,
  onChange,
  color,
  insertMenu,
}: {
  modules: CourseModule[]
  onChange: (modules: CourseModule[]) => void
  color: string
  insertMenu: InsertMenuItem[]
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(modules.map(m => m.id)))
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ moduleId: string; lessonId: string } | null>(null)
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null)
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('after')

  function newId(prefix: string) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function addModule() {
    const mod: CourseModule = { id: newId('mod'), name: `Módulo ${modules.length + 1}`, description: '', order: modules.length, lessons: [] }
    setExpanded(prev => new Set([...prev, mod.id]))
    setEditingModuleId(mod.id)
    onChange([...modules, mod])
  }

  function updateModule(id: string, patch: Partial<Omit<CourseModule, 'id' | 'lessons'>>) {
    onChange(modules.map(m => m.id === id ? { ...m, ...patch } : m))
  }

  function deleteModule(id: string) {
    onChange(modules.filter(m => m.id !== id).map((m, i) => ({ ...m, order: i })))
  }

  function addLesson(moduleId: string) {
    const mod = modules.find(m => m.id === moduleId)
    if (!mod) return
    const lesson: CourseLesson = {
      id: newId('lesson'),
      title: `Aula ${mod.lessons.length + 1}`,
      professor: '',
      description: '',
      video_url: '',
      material: '',
      order: mod.lessons.length,
      summary: '',
      blocks: [],
    }
    onChange(modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m))
  }

  function updateLesson(moduleId: string, lessonId: string, patch: Partial<Omit<CourseLesson, 'id'>>) {
    onChange(modules.map(m => {
      if (m.id !== moduleId) return m
      return { ...m, lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l) }
    }))
  }

  function deleteLesson(moduleId: string, lessonId: string) {
    onChange(modules.map(m => {
      if (m.id !== moduleId) return m
      return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId).map((l, i) => ({ ...l, order: i })) }
    }))
  }

  function moveLesson(fromModuleId: string, lessonId: string, toModuleId: string) {
    if (fromModuleId === toModuleId) return
    const lesson = modules.find(m => m.id === fromModuleId)?.lessons.find(l => l.id === lessonId)
    if (!lesson) return
    onChange(modules.map(m => {
      if (m.id === fromModuleId) return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId).map((l, i) => ({ ...l, order: i })) }
      if (m.id === toModuleId) return { ...m, lessons: [...m.lessons, { ...lesson, order: m.lessons.length }] }
      return m
    }))
    setExpanded(prev => new Set([...prev, toModuleId]))
  }

  function reorderLesson(moduleId: string, lessonId: string, targetLessonId: string, position: 'before' | 'after') {
    if (lessonId === targetLessonId) return
    onChange(modules.map(m => {
      if (m.id !== moduleId) return m
      const without = m.lessons.filter(l => l.id !== lessonId)
      const moved = m.lessons.find(l => l.id === lessonId)!
      const targetIdx = without.findIndex(l => l.id === targetLessonId)
      if (targetIdx === -1) return m
      const at = position === 'before' ? targetIdx : targetIdx + 1
      const reordered = [...without.slice(0, at), moved, ...without.slice(at)]
      return { ...m, lessons: reordered.map((l, i) => ({ ...l, order: i })) }
    }))
  }

  function reorderLessonByOffset(moduleId: string, lessonId: string, offset: 'up' | 'down' | 'first' | 'last') {
    onChange(modules.map(m => {
      if (m.id !== moduleId) return m
      const lessons = [...m.lessons]
      const idx = lessons.findIndex(l => l.id === lessonId)
      if (idx === -1) return m
      const [lesson] = lessons.splice(idx, 1)
      const newIdx = offset === 'first' ? 0 : offset === 'last' ? lessons.length : offset === 'up' ? Math.max(0, idx - 1) : Math.min(lessons.length, idx + 1)
      lessons.splice(newIdx, 0, lesson)
      return { ...m, lessons: lessons.map((l, i) => ({ ...l, order: i })) }
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {modules.map((mod, modIdx) => {
        const isOpen = expanded.has(mod.id)
        const isEditingMod = editingModuleId === mod.id
        return (
          <div
            key={mod.id}
            style={{ border: `1.5px solid ${dragging && dragOverModuleId === mod.id ? color + 'AA' : color + '45'}`, borderRadius: '10px', overflow: 'hidden', boxShadow: dragging && dragOverModuleId === mod.id ? `0 0 0 3px ${color}25` : `0 1px 5px ${color}12`, transition: 'border-color 0.15s, box-shadow 0.15s' }}
            onDragOver={e => { e.preventDefault(); if (dragging && dragging.moduleId !== mod.id) setDragOverModuleId(mod.id) }}
            onDragLeave={e => { const rt = e.relatedTarget as Node | null; if (rt === null || !e.currentTarget.contains(rt)) setDragOverModuleId(prev => prev === mod.id ? null : prev) }}
            onDrop={e => { e.preventDefault(); if (dragging && dragging.moduleId !== mod.id) moveLesson(dragging.moduleId, dragging.lessonId, mod.id); setDragging(null); setDragOverModuleId(null) }}
          >
            {/* Módulo — cabeçalho principal */}
            <div
              onClick={() => !isEditingMod && toggleExpand(mod.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', background: `${color}12`, cursor: 'pointer', userSelect: 'none' as const, borderBottom: isOpen ? `1.5px solid ${color}25` : 'none', transition: 'background 0.12s' }}
              onMouseEnter={e => { if (!isEditingMod) e.currentTarget.style.background = `${color}22` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${color}12` }}
            >
              <span style={{ color, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {isOpen ? <ChevronDown size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
              </span>
              {isEditingMod ? (
                <input
                  autoFocus
                  value={mod.name}
                  onChange={e => updateModule(mod.id, { name: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onBlur={() => setEditingModuleId(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingModuleId(null) }}
                  style={{ ...inputStyle, flex: 1, fontSize: '0.88rem', fontWeight: 800, padding: '0.25rem 0.5rem' }}
                />
              ) : (
                <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Módulo {modIdx + 1} — {mod.name}
                </span>
              )}
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.62rem', color, background: `${color}18`, border: `1px solid ${color}30`, padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                  {mod.lessons.length} {mod.lessons.length === 1 ? 'aula' : 'aulas'}
                </span>
                <button
                  onClick={() => { setEditingModuleId(mod.id); setExpanded(prev => new Set([...prev, mod.id])) }}
                  title="Renomear"
                  style={{ border: 'none', background: 'transparent', color: `${color}80`, cursor: 'pointer', padding: '0.1rem', fontSize: '0.8rem', lineHeight: 1 }}
                >✎</button>
                <button
                  onClick={() => deleteModule(mod.id)}
                  title="Remover módulo"
                  style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer', padding: '0.1rem', fontSize: '1rem', lineHeight: 1 }}
                >×</button>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: '0.85rem 1rem 1rem', background: '#FAFBFC' }}>
                <input
                  value={mod.description}
                  onChange={e => updateModule(mod.id, { description: e.target.value })}
                  placeholder="Descrição do módulo (opcional)"
                  style={{ ...inputStyle, fontSize: '0.78rem', marginBottom: '0.75rem', color: '#64748B', background: '#FFFFFF' }}
                />
                {/* Aulas — recuadas e com linha conectora */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.65rem', paddingLeft: '0.85rem', borderLeft: `2px solid ${color}25` }}>
                  {mod.lessons.map((lesson, lessonIdx) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      index={lessonIdx}
                      color={color}
                      insertMenu={insertMenu}
                      onUpdate={patch => updateLesson(mod.id, lesson.id, patch)}
                      onDelete={() => deleteLesson(mod.id, lesson.id)}
                      isDragging={dragging?.moduleId === mod.id && dragging?.lessonId === lesson.id}
                      modules={modules.map(m => ({ id: m.id, name: m.name }))}
                      currentModuleId={mod.id}
                      onMoveToModule={targetId => moveLesson(mod.id, lesson.id, targetId)}
                      onDragStart={() => setDragging({ moduleId: mod.id, lessonId: lesson.id })}
                      onDragEnd={() => { setDragging(null); setDragOverModuleId(null); setDragOverLessonId(null) }}
                      activeDragModuleId={dragging?.moduleId ?? null}
                      activeDragLessonId={dragging?.lessonId ?? null}
                      dragOverState={dragOverLessonId === lesson.id ? dropPosition : null}
                      onDragOverLesson={pos => { setDragOverLessonId(lesson.id); setDropPosition(pos) }}
                      onDragLeaveLesson={() => setDragOverLessonId(prev => prev === lesson.id ? null : prev)}
                      onDropOnLesson={pos => { if (dragging) { reorderLesson(mod.id, dragging.lessonId, lesson.id, pos); setDragging(null); setDragOverLessonId(null); setDragOverModuleId(null) } }}
                      onReorder={action => reorderLessonByOffset(mod.id, lesson.id, action)}
                      lessonCount={mod.lessons.length}
                    />
                  ))}
                </div>
                <button
                  onClick={() => addLesson(mod.id)}
                  style={{ width: '100%', border: `1.5px dashed ${color}35`, background: 'transparent', borderRadius: '6px', padding: '0.38rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.74rem', color: color + 'CC', fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  + Adicionar Aula
                </button>
              </div>
            )}
          </div>
        )
      })}

      <button
        onClick={addModule}
        style={{ width: '100%', border: `2px dashed ${color}55`, background: `${color}06`, borderRadius: '10px', padding: '0.7rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color, fontWeight: 750, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
      >
        + Adicionar Módulo / Unidade
      </button>
    </div>
  )
}

function LessonItem({
  lesson,
  index,
  color,
  insertMenu,
  onUpdate,
  onDelete,
  isDragging,
  modules,
  currentModuleId,
  onMoveToModule,
  onDragStart,
  onDragEnd,
  activeDragModuleId,
  activeDragLessonId,
  dragOverState,
  onDragOverLesson,
  onDragLeaveLesson,
  onDropOnLesson,
  onReorder,
  lessonCount,
}: {
  lesson: CourseLesson
  index: number
  color: string
  insertMenu: InsertMenuItem[]
  onUpdate: (patch: Partial<Omit<CourseLesson, 'id'>>) => void
  onDelete: () => void
  isDragging: boolean
  modules: Array<{ id: string; name: string }>
  currentModuleId: string
  onMoveToModule: (targetModuleId: string) => void
  onDragStart: () => void
  onDragEnd: () => void
  activeDragModuleId: string | null
  activeDragLessonId: string | null
  dragOverState: 'before' | 'after' | null
  onDragOverLesson: (position: 'before' | 'after') => void
  onDragLeaveLesson: () => void
  onDropOnLesson: (position: 'before' | 'after') => void
  onReorder: (action: 'up' | 'down' | 'first' | 'last') => void
  lessonCount: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  return (
    <div
      onDragOver={e => {
        if (activeDragModuleId === currentModuleId && activeDragLessonId !== lesson.id) {
          e.preventDefault()
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          onDragOverLesson(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after')
        }
      }}
      onDragLeave={e => { const rt = e.relatedTarget as Node | null; if (rt === null || !e.currentTarget.contains(rt)) onDragLeaveLesson() }}
      onDrop={e => {
        if (activeDragModuleId === currentModuleId && activeDragLessonId && activeDragLessonId !== lesson.id) {
          e.preventDefault()
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          onDropOnLesson(e.clientY < rect.top + rect.height / 2 ? 'before' : 'after')
        }
      }}
    >
      {dragOverState === 'before' && <div style={{ height: '2px', background: color, borderRadius: '2px', marginBottom: '3px', opacity: 0.85 }} />}
      <div style={{ border: '1px solid #DDE5EE', borderRadius: '7px', overflow: 'hidden', background: '#FFFFFF', opacity: isDragging ? 0.4 : 1, transition: 'opacity 0.15s' }}>
      {/* Header */}
      <div
        draggable
        onDragStart={e => { e.stopPropagation(); onDragStart() }}
        onDragEnd={e => { e.stopPropagation(); onDragEnd() }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.38rem 0.65rem', background: '#F7F9FC', transition: 'background 0.12s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#EDF1F7' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#F7F9FC' }}
      >
        <span
          title="Arrastar para mover entre módulos"
          style={{ fontSize: '0.7rem', color: '#CBD5E1', flexShrink: 0, lineHeight: 1, cursor: 'grab', userSelect: 'none' as const }}
        >⠿</span>
        <span
          onClick={() => setExpanded(v => !v)}
          style={{ color: color + 'BB', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >{expanded ? <ChevronDown size={14} strokeWidth={2.5} /> : <ChevronRight size={14} strokeWidth={2.5} />}</span>
        <span style={{ fontSize: '0.6rem', color: '#B0BEC9', background: '#EEF2F8', minWidth: '1.4rem', textAlign: 'center', padding: '0.05rem 0.25rem', borderRadius: '4px', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{index + 1}</span>
        {editingTitle ? (
          <input
            autoFocus
            value={lesson.title}
            onChange={e => onUpdate({ title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false) }}
            style={{ ...inputStyle, flex: 1, fontSize: '0.78rem', padding: '0.2rem 0.4rem' }}
          />
        ) : (
          <span
            onClick={() => setExpanded(v => !v)}
            style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
          >{lesson.title}</span>
        )}
        <button
          onClick={() => setEditingTitle(v => !v)}
          title="Renomear aula"
          style={{ border: 'none', background: 'transparent', color: '#B0BEC9', cursor: 'pointer', padding: '0.1rem', fontSize: '0.75rem', lineHeight: 1 }}
        >✎</button>
        {(modules.length > 1 || lessonCount > 1) && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={e => { e.stopPropagation(); setShowMoveMenu(v => !v) }}
              title="Mover aula"
              style={{ border: 'none', background: showMoveMenu ? `${color}18` : 'transparent', color: showMoveMenu ? color : '#B0BEC9', cursor: 'pointer', padding: '0.12rem 0.28rem', borderRadius: '4px', fontSize: '0.68rem', lineHeight: 1, fontWeight: 800, transition: 'all 0.1s' }}
            >⇄</button>
            {showMoveMenu && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 200, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 6px 20px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: '185px' }}>
                {modules.length > 1 && (
                  <>
                    <div style={{ padding: '0.32rem 0.7rem 0.26rem', fontSize: '0.56rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F1F5F9' }}>
                      Mover para módulo
                    </div>
                    {modules.filter(m => m.id !== currentModuleId).map(m => (
                      <button
                        key={m.id}
                        onClick={e => { e.stopPropagation(); onMoveToModule(m.id); setShowMoveMenu(false) }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', padding: '0.42rem 0.7rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', color: '#334155', textAlign: 'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${color}0F` }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        Módulo {modules.findIndex(mod => mod.id === m.id) + 1} — {m.name}
                      </button>
                    ))}
                  </>
                )}
                {modules.length > 1 && lessonCount > 1 && <div style={{ borderTop: '1px solid #F1F5F9' }} />}
                {lessonCount > 1 && (
                  <>
                    <div style={{ padding: '0.32rem 0.7rem 0.26rem', fontSize: '0.56rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F1F5F9' }}>
                      Ordem no módulo
                    </div>
                    {([
                      { action: 'up' as const,    label: '↑ Mover para cima',    disabled: index === 0 },
                      { action: 'down' as const,  label: '↓ Mover para baixo',   disabled: index === lessonCount - 1 },
                      { action: 'first' as const, label: '⬆ Início do módulo',   disabled: index === 0 },
                      { action: 'last' as const,  label: '⬇ Fim do módulo',      disabled: index === lessonCount - 1 },
                    ] as const).map(({ action, label, disabled }) => (
                      <button
                        key={action}
                        onClick={e => { e.stopPropagation(); if (!disabled) { onReorder(action); setShowMoveMenu(false) } }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', padding: '0.42rem 0.7rem', cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', color: disabled ? '#CBD5E1' : '#334155', textAlign: 'left' }}
                        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = `${color}0F` }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
        <button
          onClick={onDelete}
          title="Remover aula"
          style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer', padding: '0.1rem', fontSize: '0.9rem', lineHeight: 1 }}
        >×</button>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ borderTop: '1px solid #EBF0F8', display: 'flex', flexDirection: 'column' }}>
          {/* Informações da Aula */}
          <div style={{ padding: '0.6rem 0.75rem', background: '#FFFFFF' }}>
            <div style={{ fontSize: '0.56rem', fontWeight: 800, color: '#B0B8C5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', paddingBottom: '0.28rem', borderBottom: '1px solid #EEF2F7' }}>
              Informações da Aula
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.32rem' }}>
              <input value={lesson.professor ?? ''} onChange={e => onUpdate({ professor: e.target.value })} placeholder="Professor (opcional)" style={{ ...inputStyle, fontSize: '0.76rem' }} />
              <input value={lesson.video_url} onChange={e => onUpdate({ video_url: e.target.value })} placeholder="Link do vídeo (opcional)" style={{ ...inputStyle, fontSize: '0.76rem' }} />
              <input value={lesson.description} onChange={e => onUpdate({ description: e.target.value })} placeholder="Descrição (opcional)" style={{ ...inputStyle, fontSize: '0.76rem' }} />
              <input value={lesson.material} onChange={e => onUpdate({ material: e.target.value })} placeholder="Material complementar (opcional)" style={{ ...inputStyle, fontSize: '0.76rem' }} />
            </div>
          </div>

          {/* Conteúdo da Aula — subnível com fundo e borda distinta */}
          <div style={{ padding: '0.65rem 0.75rem 0.75rem', background: '#F4F7FB', borderTop: '1.5px dashed #DDE5EE' }}>
            <div style={{ fontSize: '0.56rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.55rem', paddingBottom: '0.28rem', borderBottom: '1px solid #DDE5EE' }}>
              Conteúdo da Aula
            </div>
            <CourseContentEditor
              summary={lesson.summary ?? ''}
              onSummaryChange={v => onUpdate({ summary: v })}
              blocks={lesson.blocks ?? []}
              onBlocksChange={blocks => onUpdate({ blocks })}
              color={color}
              insertMenu={insertMenu}
              showMandatorySummary={true}
            />
          </div>
        </div>
      )}
    </div>
      {dragOverState === 'after' && <div style={{ height: '2px', background: color, borderRadius: '2px', marginTop: '3px', opacity: 0.85 }} />}
    </div>
  )
}

const COURSE_PRESET_BLOCKS: Array<{ key: string; label: string }> = [
  { key: 'main_learnings',      label: 'Aprendizados' },
  { key: 'exercises',           label: 'Exercícios' },
  { key: 'applications',        label: 'Aplicações' },
  { key: 'next_steps',          label: 'Próximos Passos' },
  { key: 'bibliography',        label: 'Bibliografia' },
  { key: 'resources',           label: 'Recursos Complementares' },
  { key: 'recommended_readings',label: 'Leituras Recomendadas' },
  { key: 'evaluation',          label: 'Avaliação' },
  { key: 'projects',            label: 'Projetos' },
  { key: 'notes',               label: 'Observações' },
]

const COURSE_GENERAL_BLOCKS: Array<{ key: string; label: string }> = [
  { key: 'objective',           label: 'Objetivo do Curso' },
  { key: 'audience',            label: 'Público-alvo' },
  { key: 'prerequisites',       label: 'Pré-requisitos' },
  { key: 'certification',       label: 'Certificação' },
  { key: 'general_bibliography',label: 'Bibliografia Geral' },
]

function CourseContentEditor({
  summary = '',
  onSummaryChange,
  blocks,
  onBlocksChange,
  color,
  insertMenu,
  showMandatorySummary = true,
  presets = COURSE_PRESET_BLOCKS,
}: {
  summary?: string
  onSummaryChange?: (v: string) => void
  blocks: CourseContentBlock[]
  onBlocksChange: (blocks: CourseContentBlock[]) => void
  color: string
  insertMenu: InsertMenuItem[]
  showMandatorySummary?: boolean
  presets?: Array<{ key: string; label: string }>
}) {
  const [collapsedSummary, setCollapsedSummary] = useState(false)
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)

  const usedKeys = new Set(blocks.map(b => b.key))
  const availablePresets = presets.filter(p => !usedKeys.has(p.key))

  function newBlockId() { return `block_${Date.now()}_${Math.floor(Math.random() * 9999)}` }

  function addPresetBlock(preset: { key: string; label: string }) {
    const block: CourseContentBlock = { id: newBlockId(), key: preset.key, label: preset.label, value: '', collapsed: false, order: blocks.length }
    onBlocksChange([...blocks, block])
    setShowBlockPicker(false)
  }

  function addCustomBlock() {
    if (!customName.trim()) return
    const block: CourseContentBlock = { id: newBlockId(), key: `custom_${Date.now()}`, label: customName.trim(), value: '', collapsed: false, order: blocks.length }
    onBlocksChange([...blocks, block])
    setCustomName('')
    setShowCustomInput(false)
    setShowBlockPicker(false)
  }

  function updateBlock(id: string, patch: Partial<Omit<CourseContentBlock, 'id'>>) {
    onBlocksChange(blocks.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  function removeBlock(id: string) {
    onBlocksChange(blocks.filter(b => b.id !== id).map((b, i) => ({ ...b, order: i })))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {/* Resumo — não removível */}
      {showMandatorySummary && <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          onClick={() => setCollapsedSummary(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.52rem 0.75rem', background: '#F8FAFC', cursor: 'pointer', userSelect: 'none' as const, transition: 'background 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EEF2F6' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC' }}
        >
          <span style={{ color: '#64748B', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {collapsedSummary ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
          </span>
          <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 750, color: '#0F172A' }}>Resumo</span>
          <span style={{ fontSize: '0.55rem', color: '#C8CED7', fontStyle: 'italic', letterSpacing: '0.01em' }}>obrigatório</span>
        </div>
        {!collapsedSummary && (
          <div style={{ padding: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
            <RichEditor
              value={summary}
              onChange={onSummaryChange ?? (() => {})}
              placeholder="Registre a ideia central e por que este conteúdo importa."
              moduleColor={color}
              minHeight={100}
              insertMenu={insertMenu}
            />
          </div>
        )}
      </div>}

      {/* Blocos dinâmicos */}
      {blocks.map(block => (
        <div key={block.id} style={{ border: `1px solid ${color}25`, borderRadius: '8px', overflow: 'hidden' }}>
          <div
            onClick={() => updateBlock(block.id, { collapsed: !block.collapsed })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.52rem 0.75rem', background: `${color}0A`, cursor: 'pointer', userSelect: 'none' as const, transition: 'background 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}18` }}
            onMouseLeave={e => { e.currentTarget.style.background = `${color}0A` }}
          >
            <span style={{ color, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {block.collapsed ? <ChevronRight size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
            </span>
            {editingBlockId === block.id ? (
              <input
                autoFocus
                value={block.label}
                onChange={e => updateBlock(block.id, { label: e.target.value })}
                onClick={e => e.stopPropagation()}
                onBlur={() => setEditingBlockId(null)}
                onKeyDown={e => { if (e.key === 'Enter') setEditingBlockId(null) }}
                style={{ ...inputStyle, flex: 1, fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.4rem' }}
              />
            ) : (
              <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 750, color: '#0F172A' }}>{block.label}</span>
            )}
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
              <button
                onClick={() => setEditingBlockId(block.id)}
                title="Renomear bloco"
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '0.1rem', fontSize: '0.8rem', lineHeight: 1 }}
              >✎</button>
              <button
                onClick={() => removeBlock(block.id)}
                title="Remover bloco"
                style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer', padding: '0.1rem', fontSize: '1rem', lineHeight: 1 }}
              >×</button>
            </div>
          </div>
          {!block.collapsed && (
            <div style={{ padding: '0.75rem', borderTop: `1px solid ${color}20` }}>
              <RichEditor
                value={block.value}
                onChange={v => updateBlock(block.id, { value: v })}
                placeholder={block.label}
                moduleColor={color}
                minHeight={108}
                insertMenu={insertMenu}
              />
            </div>
          )}
        </div>
      ))}

      {/* + Adicionar Bloco */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowBlockPicker(v => !v)}
          style={{ width: '100%', border: '1px dashed #CBD5E1', background: 'transparent', borderRadius: '6px', padding: '0.42rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.73rem', color: '#94A3B8', fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
        >
          + Adicionar Bloco
        </button>
        {showBlockPicker && (
          <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '9px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {availablePresets.map(preset => (
              <button
                key={preset.key}
                onClick={() => addPresetBlock(preset)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', padding: '0.52rem 0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#334155', textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {preset.label}
              </button>
            ))}
            {availablePresets.length > 0 && <div style={{ borderTop: '1px solid #F1F5F9' }} />}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', padding: '0.52rem 0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color, fontWeight: 700, textAlign: 'left' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                + Novo Bloco Personalizado
              </button>
            ) : (
              <div style={{ padding: '0.5rem 0.85rem', display: 'flex', gap: '0.4rem' }}>
                <input
                  autoFocus
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomBlock(); if (e.key === 'Escape') { setShowCustomInput(false); setCustomName('') } }}
                  placeholder="Nome do bloco"
                  style={{ ...inputStyle, flex: 1, fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                />
                <button
                  onClick={addCustomBlock}
                  disabled={!customName.trim()}
                  style={{ border: 'none', background: color, color: '#FFF', borderRadius: '6px', padding: '0.3rem 0.65rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, opacity: !customName.trim() ? 0.5 : 1 }}
                >
                  Criar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CourseStructureView({ item, color }: { item: KnowledgeItem; color: string }) {
  const modules: CourseModule[] = (() => {
    try { return JSON.parse(item.content?.['modules'] ?? '[]') } catch { return [] }
  })()

  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set(modules.map(m => m.id)))

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  function toggleModule(id: string) {
    setExpandedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <section style={{ ...detailSectionStyle, marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <SectionTitle title="Estrutura do Curso" color={color} />
        {modules.length > 0 && (
          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
            {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} · {totalLessons} {totalLessons === 1 ? 'aula' : 'aulas'}
          </span>
        )}
      </div>

      {modules.length === 0 ? (
        <div style={{ color: '#94A3B8', fontSize: '0.82rem', textAlign: 'center', padding: '0.75rem 0' }}>
          Nenhum módulo adicionado ainda. Clique em Editar para adicionar a estrutura do curso.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {modules.map((mod, modIdx) => {
            const isExpanded = expandedModules.has(mod.id)
            return (
              <div key={mod.id} style={{ border: `1px solid ${color}30`, borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => toggleModule(mod.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: `${color}0C`, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}1A` }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}0C` }}
                >
                  <span style={{ color, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    {isExpanded ? <ChevronDown size={15} strokeWidth={2.5} /> : <ChevronRight size={15} strokeWidth={2.5} />}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                    Módulo {modIdx + 1} — {mod.name}
                  </span>
                  <span style={{ fontSize: '0.62rem', color, background: `${color}15`, border: `1px solid ${color}28`, padding: '0.12rem 0.45rem', borderRadius: '999px', fontWeight: 700, flexShrink: 0 }}>
                    {mod.lessons.length} {mod.lessons.length === 1 ? 'aula' : 'aulas'}
                  </span>
                </button>

                {isExpanded && (
                  <div style={{ padding: '0.5rem 0.85rem 0.65rem', background: '#FAFBFC' }}>
                    {mod.description && (
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                        {mod.description}
                      </div>
                    )}
                    {mod.lessons.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', padding: '0.35rem 0', fontStyle: 'italic' }}>
                        Nenhuma aula adicionada neste módulo.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', paddingLeft: '0.7rem', borderLeft: `2px solid ${color}22` }}>
                        {mod.lessons.map((lesson, lessonIdx) => {
                          const blockCount = (lesson.blocks ?? []).length
                          const hasSummary = !!(lesson.summary?.trim())
                          const lessonStatus = (!hasSummary && blockCount === 0) ? 'empty' : (hasSummary && blockCount > 0) ? 'complete' : 'partial'
                          const statusStyle = lessonStatus === 'complete'
                            ? { color: '#059669', background: '#D1FAE5' }
                            : lessonStatus === 'partial'
                            ? { color: '#D97706', background: '#FEF3C7' }
                            : { color: '#94A3B8', background: '#F1F5F9' }
                          return (
                            <div key={lesson.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.42rem 0.6rem', background: '#FFFFFF', border: '1px solid #EEF2F7', borderRadius: '6px' }}>
                              <span style={{ fontSize: '0.65rem', color: '#B0BEC9', background: '#EEF2F8', minWidth: '1.3rem', textAlign: 'center', padding: '0.05rem 0.22rem', borderRadius: '4px', flexShrink: 0, marginTop: '0.1rem', fontVariantNumeric: 'tabular-nums' }}>{lessonIdx + 1}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>{lesson.title}</div>
                                {lesson.professor && (
                                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.08rem' }}>{lesson.professor}</div>
                                )}
                                {lesson.description && (
                                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.05rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.description}</div>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                {blockCount > 0 && (
                                  <span style={{ fontSize: '0.6rem', color: '#64748B', background: '#F1F5F9', padding: '0.1rem 0.35rem', borderRadius: '999px', fontWeight: 700 }}>
                                    {blockCount}b
                                  </span>
                                )}
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.38rem', borderRadius: '999px', ...statusStyle }}>
                                  {lessonStatus === 'complete' ? 'completo' : lessonStatus === 'partial' ? 'parcial' : 'vazio'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function DetailView({ item, children, parent, allItems, onEdit, onDelete, onAsk, onSelectChild, onSelectRelated, onAddChild, onBackToParent }: {
  item: KnowledgeItem
  children: KnowledgeItem[]
  parent?: KnowledgeItem
  allItems: KnowledgeItem[]
  onEdit: () => void
  onDelete: () => void
  onAsk: (prompt: string, item: KnowledgeItem) => void
  onSelectChild: (child: KnowledgeItem) => void
  onSelectRelated: (item: KnowledgeItem) => void
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

  const relatedItems = (() => {
    const candidates = allItems.filter(c => !c.parent_id && c.id !== item.id)
    return candidates
      .map(c => {
        let score = 0
        if (item.authors[0] && c.authors.includes(item.authors[0])) score += 3
        score += item.tags.filter(t => c.tags.includes(t)).length * 2
        score += item.themes.filter(t => c.themes.includes(t)).length
        score += item.doctrines.filter(d => c.doctrines.includes(d)).length
        if (item.category && c.category === item.category) score += 2
        return { item: c, score }
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.item)
  })()

  const [aiPanel, setAiPanel] = useState<{ label: string; content: string; loading: boolean } | null>(null)

  function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim()
  }

  const COURSE_ACTION_DETAILS: Record<string, string> = {
    'Consolidar Aulas': 'Analise o curso abaixo e produza uma consolidação completa com:\n1. Síntese geral do curso\n2. Principais temas e conceitos abordados\n3. Resumo por módulo (parágrafo por módulo)\n4. Resumo por aula (uma sentença por aula)\n5. Pontos centrais de aprendizado\n6. Possíveis aplicações práticas e ministeriais',
    'Criar Revisão': 'Com base no curso abaixo, crie um material completo de revisão com:\n1. Resumo executivo para estudo (5–8 linhas)\n2. Principais conceitos e termos-chave (lista comentada)\n3. 5 questões objetivas com gabarito\n4. 3 questões discursivas com pontos de resposta esperados\n5. Pontos essenciais para memorização',
    'Criar Mapa Mental': 'Com base no curso abaixo, crie um mapa mental textual hierárquico usando apenas indentação. Formato:\n\nCurso: [nome]\n  Módulo 1 — [nome]\n    Aula 1 — [nome]\n      Tema central\n      Conceitos principais\n        - conceito\n      Aplicações\n    Aula 2 — [nome]\n      ...\n  Módulo 2 — [nome]\n    ...',
  }

  async function handleCourseAI(action: { label: string; prompt: string }) {
    if (aiPanel?.loading) return

    const modules: CourseModule[] = (() => { try { return JSON.parse(item.content?.['modules'] ?? '[]') } catch { return [] } })()
    const generalBlocks: CourseContentBlock[] = (() => { try { return JSON.parse(item.content?.['general_blocks'] ?? '[]') } catch { return [] } })()
    const m = (item.metadata ?? {}) as Record<string, string>

    const lines: string[] = [
      `Curso: ${item.title}`,
      item.subtitle ? `Subtítulo: ${item.subtitle}` : '',
      m.institution ? `Instituição: ${m.institution}` : '',
      m.course_name ? `Formação: ${m.course_name}` : '',
      m.workload ? `Carga Horária: ${m.workload}` : '',
    ].filter(Boolean)

    if (generalBlocks.length > 0) {
      lines.push('\n=== DADOS GERAIS ===')
      for (const block of generalBlocks) {
        const val = stripHtmlTags(block.value)
        if (val) lines.push(`\n${block.label}:\n${val}`)
      }
    }

    if (modules.length > 0) {
      lines.push('\n=== ESTRUTURA DO CURSO ===')
      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi]
        lines.push(`\nMódulo ${mi + 1} — ${mod.name}`)
        if (mod.description) lines.push(`  ${mod.description}`)
        if (mod.lessons.length === 0) {
          lines.push('  (Nenhuma aula cadastrada)')
        } else {
          for (let li = 0; li < mod.lessons.length; li++) {
            const lesson = mod.lessons[li]
            lines.push(`  Aula ${li + 1} — ${lesson.title}`)
            if (lesson.professor) lines.push(`    Professor: ${lesson.professor}`)
            if (lesson.description) lines.push(`    ${lesson.description}`)
            const summary = stripHtmlTags(lesson.summary ?? '')
            if (summary) lines.push(`    Resumo: ${summary}`)
            for (const block of (lesson.blocks ?? [])) {
              const val = stripHtmlTags(block.value)
              if (val) lines.push(`    ${block.label}: ${val.slice(0, 400)}`)
            }
          }
        }
      }
    }

    const instruction = COURSE_ACTION_DETAILS[action.label] ?? action.prompt
    const fullPrompt = `${instruction}\n\n---\n\n${lines.join('\n')}`

    setAiPanel({ label: action.label, content: '', loading: true })

    try {
      const res = await fetch('/api/knowledge/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Falha na requisição' }))
        setAiPanel({ label: action.label, content: `Erro: ${errBody.error ?? 'Falha na requisição'}`, loading: false })
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.delta?.text) {
              accumulated += parsed.delta.text
              setAiPanel(prev => prev ? { ...prev, content: accumulated } : null)
            }
            if (parsed.error) {
              setAiPanel(prev => prev ? { ...prev, content: `Erro: ${parsed.error}`, loading: false } : null)
              return
            }
          } catch { /* ignore SSE parse errors */ }
        }
      }

      setAiPanel(prev => prev ? { ...prev, loading: false } : null)
    } catch {
      setAiPanel({ label: action.label, content: 'Erro ao conectar com a IA. Tente novamente.', loading: false })
    }
  }

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
            {isHtmlContent(item.summary) ? (
              <div className="rich-content-display" style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.summary }} />
            ) : (
              <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.summary}</p>
            )}
          </section>
        )}

        {/* ── Conteúdos internos ── */}
        {item.item_type === 'course' ? (
          <CourseStructureView item={item} color={cfg.color} />
        ) : CONTAINER_TYPES.has(item.item_type) && (
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

        {/* Painel de resultado da IA — apenas para cursos */}
        {item.item_type === 'course' && aiPanel && (
          <section style={{ ...detailSectionStyle, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <SectionTitle title={aiPanel.label} color={cfg.color} />
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {!aiPanel.loading && aiPanel.content && (
                  <button
                    onClick={() => navigator.clipboard.writeText(aiPanel.content)}
                    style={{ ...smallButtonStyle, fontSize: '0.72rem', padding: '0.32rem 0.6rem', color: cfg.color, borderColor: cfg.color + '40' }}
                  >
                    Copiar
                  </button>
                )}
                <button
                  onClick={() => setAiPanel(null)}
                  style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.2rem' }}
                  title="Fechar"
                >×</button>
              </div>
            </div>
            {aiPanel.loading && !aiPanel.content && (
              <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                Gerando...
              </div>
            )}
            {aiPanel.content && (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#334155', lineHeight: 1.75, borderTop: aiPanel.loading ? `1px dashed ${cfg.color}30` : 'none', paddingTop: aiPanel.loading ? '0.75rem' : 0 }}>
                {aiPanel.content}
                {aiPanel.loading && <span style={{ display: 'inline-block', width: '0.5em', height: '1em', background: cfg.color, marginLeft: '2px', opacity: 0.7, animation: 'none' }}>|</span>}
              </div>
            )}
          </section>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(260px, 0.8fr)', gap: '1rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contentEntries.length > 0 ? contentEntries.map(entry => (
              <section key={entry.key} style={detailSectionStyle}>
                <SectionTitle title={entry.label} />
                {isHtmlContent(entry.value) ? (
                  <div className="rich-content-display" style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: entry.value }} />
                ) : (
                  <div style={{ color: '#334155', fontSize: '0.88rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{entry.value}</div>
                )}
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
                {cfg.aiActions.map(action => {
                  const isCourseActive = item.item_type === 'course' && aiPanel?.loading && aiPanel.label === action.label
                  return (
                    <button
                      key={action.label}
                      onClick={() => item.item_type === 'course' ? handleCourseAI(action) : onAsk(action.prompt, item)}
                      disabled={item.item_type === 'course' && !!aiPanel?.loading}
                      style={{ ...smallButtonStyle, justifyContent: 'flex-start', color: cfg.color, borderColor: cfg.color + '35', opacity: item.item_type === 'course' && aiPanel?.loading && !isCourseActive ? 0.45 : 1, cursor: item.item_type === 'course' && aiPanel?.loading ? 'wait' : 'pointer' }}
                    >
                      <Sparkles size={13} /> {isCourseActive ? 'Gerando...' : action.label}
                    </button>
                  )
                })}
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

            {relatedItems.length > 0 && (
              <section style={detailSectionStyle}>
                <SectionTitle title="Relacionados" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {relatedItems.map(r => {
                    const rcfg = KNOWLEDGE_TYPES[r.item_type]
                    return (
                      <button
                        key={r.id}
                        onClick={() => onSelectRelated(r)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'border-color 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = rcfg.color + '55'; e.currentTarget.style.background = rcfg.bg }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC' }}
                      >
                        <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>{rcfg.icon}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{r.title}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {item.source_url && (
              <a href={item.source_url} target="_blank" rel="noreferrer" style={{ ...smallButtonStyle, textDecoration: 'none', justifyContent: 'center', color: '#163A6B' }}>
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
