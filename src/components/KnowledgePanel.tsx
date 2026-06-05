'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  KNOWLEDGE_TYPES, KNOWLEDGE_STATUSES, CONTAINER_TYPES,
  type KnowledgeItemType, type KnowledgeStatus,
} from '@/lib/knowledge-base'
import { Brain, X, Minus, Maximize2, Minimize2, Search, Plus, ArrowLeft, ExternalLink } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type JsonRecord = Record<string, string>

interface KnowledgeItem {
  id: string
  user_id: string
  item_type: KnowledgeItemType
  title: string
  subtitle: string | null
  summary: string | null
  status: KnowledgeStatus
  rating: number | null
  source_url: string | null
  metadata: JsonRecord
  content: JsonRecord
  tags: string[]
  bible_references: string[]
  doctrines: string[]
  themes: string[]
  authors: string[]
  parent_id: string | null
  order_index: number
  query_count: number
  created_at: string
  updated_at: string
}

interface KBContext {
  book?: string
  passageRef?: string
  themes?: string[]
  projectId?: string
}

interface Props {
  userId: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_ORDER: KnowledgeItemType[] = [
  'book', 'article', 'podcast', 'lecture', 'course', 'site', 'video', 'personal_document',
]

const EMPTY_DRAFT = {
  item_type: 'book' as KnowledgeItemType,
  title: '', subtitle: '', summary: '', status: 'captured' as KnowledgeStatus,
  source_url: '', metadata: {} as JsonRecord, content: {} as JsonRecord,
  tags: [] as string[], bible_references: [] as string[],
  doctrines: [] as string[], themes: [] as string[], authors: [] as string[],
  parent_id: null as string | null, order_index: 0,
}

const MIN_W = 360, MAX_W = 920, MIN_H = 400, MAX_H = 860
const DEFAULT_W = 480, DEFAULT_H = 580

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitList(v: string): string[] {
  return v.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
}

function Badge({ children, color = '#64748B', bg = '#F1F5F9' }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '0.13rem 0.45rem', fontSize: '0.6rem', fontWeight: 750, color, background: bg }}>
      {children}
    </span>
  )
}

function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value.trim())
}

function isRelevant(item: KnowledgeItem, ctx: KBContext): boolean {
  if (!ctx.book && !ctx.themes?.length) return false
  const book = ctx.book?.toLowerCase() ?? ''
  if (book && item.bible_references.some(r => r.toLowerCase().includes(book))) return true
  if (ctx.themes?.length) {
    const itemWords = [...item.themes, ...item.doctrines].map(t => t.toLowerCase())
    if (ctx.themes.some(t => itemWords.some(w => w.includes(t.toLowerCase())))) return true
  }
  return false
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function KnowledgePanel({ userId }: Props) {
  const supabase = createClient()

  // Window state
  const [open,      setOpen]      = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [pos,       setPos]       = useState({ x: 0, y: 80 })
  const [size,      setSize]      = useState({ w: DEFAULT_W, h: DEFAULT_H })

  // Drag
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Resize
  const resizing = useRef(false)
  const resizeStart = useRef({ x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H })

  // Data
  const [items,   setItems]   = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(false)

  // Navigation
  const [view,       setView]       = useState<'list' | 'detail' | 'create'>('list')
  const [selectedId, setSelectedId] = useState('')
  const [query,      setQuery]      = useState('')
  const [typeFilter, setTypeFilter] = useState<KnowledgeItemType | 'all'>('all')

  // Create form
  const [draft,  setDraft]  = useState({ ...EMPTY_DRAFT })
  const [saving, setSaving] = useState(false)

  // Context from workspace
  const [ctx, setCtx] = useState<KBContext>({})

  // Init position after mount
  useEffect(() => {
    setPos({ x: window.innerWidth - DEFAULT_W - 24, y: 80 })
  }, [])

  // Load context from localStorage when opening
  useEffect(() => {
    if (!open) return
    try {
      const raw = localStorage.getItem('lampas_kb_context')
      if (raw) setCtx(JSON.parse(raw))
    } catch {}
    if (items.length === 0) loadItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Escuta evento global para abrir o painel em modo de criação
  useEffect(() => {
    const handler = () => {
      setOpen(true)
      setMinimized(false)
      setView('create')
      setDraft({ ...EMPTY_DRAFT })
    }
    window.addEventListener('lampas:kb-open-create', handler)
    return () => window.removeEventListener('lampas:kb-open-create', handler)
  }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('user_id', userId)
      .is('parent_id', null)
      .order('updated_at', { ascending: false })
      .limit(200)
    setItems((data ?? []) as KnowledgeItem[])
    setLoading(false)
  }, [userId, supabase])

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const onDragStart = (e: React.MouseEvent) => {
    if (maximized) return
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setPos({
          x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth  - size.w)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 60)),
        })
      }
      if (resizing.current) {
        const dw = e.clientX - resizeStart.current.x
        const dh = e.clientY - resizeStart.current.y
        setSize({
          w: Math.max(MIN_W, Math.min(MAX_W, resizeStart.current.w + dw)),
          h: Math.max(MIN_H, Math.min(MAX_H, resizeStart.current.h + dh)),
        })
      }
    }
    const onUp = () => { dragging.current = false; resizing.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [size.w])

  // ── Resize handler ─────────────────────────────────────────────────────────

  const onResizeStart = (e: React.MouseEvent) => {
    if (maximized) return
    resizing.current = true
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }
    e.preventDefault()
    e.stopPropagation()
  }

  // ── Data ───────────────────────────────────────────────────────────────────

  const filtered = items.filter(item => {
    if (typeFilter !== 'all' && item.item_type !== typeFilter) return false
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return [item.title, item.subtitle, item.summary,
      ...item.tags, ...item.authors, ...item.themes,
      ...item.doctrines, ...item.bible_references,
    ].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
  })

  const selected = items.find(i => i.id === selectedId) ?? null

  async function saveItem() {
    if (!draft.title.trim()) return
    setSaving(true)
    const payload = {
      ...draft,
      user_id: userId,
      subtitle:   draft.subtitle   || null,
      summary:    draft.summary    || null,
      source_url: draft.source_url || null,
    }
    const { data } = await supabase
      .from('knowledge_items')
      .insert(payload)
      .select()
      .single()
    if (data) {
      const saved = data as KnowledgeItem
      setItems(prev => [saved, ...prev])
      setSelectedId(saved.id)
      setView('detail')
    }
    setSaving(false)
  }

  // ── Window geometry ────────────────────────────────────────────────────────

  const windowStyle: React.CSSProperties = maximized
    ? { position: 'fixed', top: 8, left: 8, right: 8, bottom: 8, width: 'auto', height: 'auto' }
    : minimized
      ? { position: 'fixed', bottom: 24, right: 24, width: 'auto', height: 'auto' }
      : { position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h }

  // ── FAB ────────────────────────────────────────────────────────────────────

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setMinimized(false) }}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 499,
          background: '#B45309', color: '#FFFFFF',
          border: 'none', borderRadius: '12px',
          padding: '0.58rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          fontSize: '0.8rem', fontWeight: 750, cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 16px rgba(180,83,9,0.3)',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#92400E'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(180,83,9,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#B45309'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(180,83,9,0.3)' }}
        title="Abrir Base de Conhecimento"
      >
        <Brain size={15} strokeWidth={2} />
        Base
      </button>
    )
  }

  // ── Minimized pill ─────────────────────────────────────────────────────────

  if (minimized) {
    return (
      <div style={{ ...windowStyle, zIndex: 500, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.85rem', cursor: 'pointer' }}
        onClick={() => setMinimized(false)}
      >
        <Brain size={15} color="#B45309" strokeWidth={2} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309' }}>Base de Conhecimento</span>
        <button onClick={e => { e.stopPropagation(); setOpen(false) }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', padding: '0', marginLeft: '0.2rem', display: 'flex', alignItems: 'center' }}>
          <X size={13} />
        </button>
      </div>
    )
  }

  // ── Full panel ─────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        ...windowStyle,
        zIndex: 500,
        background: '#FFFFFF',
        border: '1px solid var(--border, #E2E8F0)',
        borderRadius: maximized ? '0' : '14px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans, inherit)',
        animation: 'kp-fadeIn 0.18s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        @keyframes kp-fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        onMouseDown={onDragStart}
        style={{
          flexShrink: 0, cursor: maximized ? 'default' : 'grab',
          padding: '0.6rem 0.75rem 0.55rem',
          borderBottom: '1px solid #F1F5F9',
          background: '#FAFAFA',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          userSelect: 'none',
          borderRadius: maximized ? '0' : '14px 14px 0 0',
        }}
      >
        <Brain size={16} color="#B45309" strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
          Base de Conhecimento
        </span>
        <button onClick={() => setMinimized(true)}  title="Minimizar" style={iconBtn}><Minus size={13} /></button>
        <button onClick={() => setMaximized(m => !m)} title={maximized ? 'Restaurar' : 'Maximizar'} style={iconBtn}>
          {maximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
        <button onClick={() => setOpen(false)} title="Fechar" style={iconBtn}><X size={13} /></button>
      </div>

      {/* ── Search + filter ── */}
      {view !== 'create' && (
        <div style={{ flexShrink: 0, padding: '0.6rem 0.75rem 0.45rem', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setView('list') }}
              placeholder="Buscar na Base de Conhecimento..."
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: '7px', background: '#F8FAFC', color: '#0F172A', padding: '0.42rem 0.6rem 0.42rem 2rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.28rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {(['all', ...TYPE_ORDER] as const).map(type => {
              const cfg = type !== 'all' ? KNOWLEDGE_TYPES[type] : null
              const active = typeFilter === type
              return (
                <button
                  key={type}
                  onClick={() => { setTypeFilter(type); setView('list') }}
                  style={{
                    flexShrink: 0, border: `1.5px solid ${active ? (cfg?.color ?? '#0F172A') : '#E2E8F0'}`,
                    background: active ? (cfg?.bg ?? '#F1F5F9') : '#FFFFFF',
                    color: active ? (cfg?.color ?? '#0F172A') : '#64748B',
                    borderRadius: '999px', padding: '0.22rem 0.6rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.68rem', fontWeight: active ? 800 : 600,
                  }}
                >
                  {cfg ? `${cfg.icon}` : 'Todos'}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* LIST */}
        {view === 'list' && (
          <div style={{ padding: '0.45rem' }}>
            {loading && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                Carregando...
              </div>
            )}

            {/* Itens relevantes ao contexto */}
            {!loading && ctx.book && filtered.some(i => isRelevant(i, ctx)) && (
              <>
                <div style={{ padding: '0.3rem 0.55rem 0.15rem', fontSize: '0.58rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  📌 Relevante para {ctx.book}{ctx.passageRef ? ` ${ctx.passageRef}` : ''}
                </div>
                {filtered.filter(i => isRelevant(i, ctx)).slice(0, 3).map(item => (
                  <ItemRow key={`rel-${item.id}`} item={item} active={selectedId === item.id} onClick={() => { setSelectedId(item.id); setView('detail') }} />
                ))}
                <div style={{ height: '1px', background: '#F1F5F9', margin: '0.35rem 0.4rem' }} />
              </>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                {query ? 'Nenhum resultado.' : 'Base vazia. Crie o primeiro item.'}
              </div>
            )}

            {filtered.map(item => (
              <ItemRow key={item.id} item={item} active={selectedId === item.id} onClick={() => { setSelectedId(item.id); setView('detail') }} />
            ))}
          </div>
        )}

        {/* DETAIL */}
        {view === 'detail' && selected && (
          <DetailPane
            item={selected}
            ctx={ctx}
            onBack={() => setView('list')}
            onOpenFull={() => window.open('/knowledge', '_blank')}
          />
        )}

        {/* CREATE */}
        {view === 'create' && (
          <CreatePane
            draft={draft}
            setDraft={setDraft}
            saving={saving}
            onSave={saveItem}
            onCancel={() => { setView('list'); setDraft({ ...EMPTY_DRAFT }) }}
          />
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0, padding: '0.5rem 0.75rem',
        borderTop: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', gap: '0.45rem',
        background: '#FAFAFA',
      }}>
        <button
          onClick={() => { setView('create'); setDraft({ ...EMPTY_DRAFT }) }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none', background: '#B45309', color: '#FFFFFF', borderRadius: '7px', padding: '0.4rem 0.75rem', fontSize: '0.75rem', fontWeight: 750, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Plus size={13} /> Novo
        </button>
        <div style={{ flex: 1 }} />
        <a href="/knowledge" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}>
          Base completa <ExternalLink size={11} />
        </a>
        {!maximized && (
          <div
            onMouseDown={onResizeStart}
            style={{ cursor: 'nwse-resize', color: '#CBD5E1', fontSize: '0.75rem', lineHeight: 1, padding: '0 0 0 0.3rem', userSelect: 'none' }}
            title="Redimensionar"
          >░░</div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ItemRow({ item, active, onClick }: { item: KnowledgeItem; active: boolean; onClick: () => void }) {
  const cfg = KNOWLEDGE_TYPES[item.item_type]
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        border: `1px solid ${active ? cfg.color + '55' : 'transparent'}`,
        background: active ? cfg.bg : 'transparent',
        borderRadius: '8px', padding: '0.55rem 0.65rem',
        cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.15rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      }}
    >
      <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </div>
        <div style={{ fontSize: '0.64rem', color: '#64748B', marginTop: '0.06rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.authors[0] ?? cfg.label}{item.bible_references[0] ? ` · ${item.bible_references[0]}` : ''}
        </div>
      </div>
      <Badge color={KNOWLEDGE_STATUSES[item.status].color} bg={KNOWLEDGE_STATUSES[item.status].bg}>
        {KNOWLEDGE_STATUSES[item.status].label}
      </Badge>
    </button>
  )
}

function DetailPane({ item, ctx, onBack, onOpenFull }: {
  item: KnowledgeItem; ctx: KBContext
  onBack: () => void; onOpenFull: () => void
}) {
  const cfg    = KNOWLEDGE_TYPES[item.item_type]
  const status = KNOWLEDGE_STATUSES[item.status]
  const relevant = isRelevant(item, ctx)

  const contentEntries = cfg.contentFields
    .map(f => ({ ...f, value: item.content?.[f.key] ?? '' }))
    .filter(f => f.value.trim())

  const metadataEntries = cfg.metadataFields
    .map(f => ({ ...f, value: item.metadata?.[f.key] ?? '' }))
    .filter(f => f.value.trim())

  return (
    <div style={{ padding: '0.85rem 0.9rem 1rem' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', fontSize: '0.72rem', fontWeight: 600, padding: '0 0 0.65rem 0', fontFamily: 'inherit' }}>
        <ArrowLeft size={13} /> Voltar
      </button>

      {relevant && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '6px', padding: '0.35rem 0.6rem', marginBottom: '0.75rem', fontSize: '0.65rem', color: '#92400E', fontWeight: 700 }}>
          📌 Relevante para {ctx.book}{ctx.passageRef ? ` ${ctx.passageRef}` : ''}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
        <Badge color={cfg.color} bg={cfg.bg}>{cfg.icon} {cfg.label}</Badge>
        <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
      </div>

      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
        {item.title}
      </div>
      {item.subtitle && <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.65rem' }}>{item.subtitle}</div>}

      {item.summary && (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '0.65rem 0.75rem', marginBottom: '0.7rem' }}>
          <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Síntese</div>
          {isHtmlContent(item.summary) ? (
            <div className="rich-content-display" style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: item.summary }} />
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{item.summary}</div>
          )}
        </div>
      )}

      {contentEntries.slice(0, 4).map(entry => (
        <div key={entry.key} style={{ marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>{entry.label}</div>
          {isHtmlContent(entry.value) ? (
            <div className="rich-content-display" style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: entry.value }} />
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{entry.value}</div>
          )}
        </div>
      ))}

      {metadataEntries.length > 0 && (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '0.6rem 0.75rem', marginBottom: '0.7rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {metadataEntries.map(entry => (
            <div key={entry.key}>
              <div style={{ fontSize: '0.56rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{entry.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#334155' }}>{entry.value}</div>
            </div>
          ))}
        </div>
      )}

      {(item.authors.length > 0 || item.themes.length > 0 || item.doctrines.length > 0 || item.bible_references.length > 0) && (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {item.authors.map(a => <Badge key={a} color="#0369A1" bg="#EFF6FF">{a}</Badge>)}
          {item.doctrines.map(d => <Badge key={d} color="#7C3AED" bg="#F5F3FF">{d}</Badge>)}
          {item.themes.map(t => <Badge key={t}>{t}</Badge>)}
          {item.bible_references.map(r => <Badge key={r} color="#B45309" bg="#FEF3C7">{r}</Badge>)}
        </div>
      )}

      {item.source_url && (
        <a href={item.source_url} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
          <ExternalLink size={12} /> Abrir fonte
        </a>
      )}

      <button onClick={onOpenFull} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '7px', padding: '0.38rem 0.7rem', fontSize: '0.72rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginTop: '0.5rem' }}>
        <ExternalLink size={12} /> Ver na Base completa
      </button>
    </div>
  )
}

function CreatePane({ draft, setDraft, saving, onSave, onCancel }: {
  draft: typeof EMPTY_DRAFT
  setDraft: React.Dispatch<React.SetStateAction<typeof EMPTY_DRAFT>>
  saving: boolean
  onSave: () => void
  onCancel: () => void
}) {
  const cfg = KNOWLEDGE_TYPES[draft.item_type]

  return (
    <div style={{ padding: '0.85rem 0.9rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Novo {cfg.label}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={onCancel} style={{ ...footerBtn, color: '#64748B', borderColor: '#E2E8F0' }}>Cancelar</button>
          <button onClick={onSave} disabled={saving || !draft.title.trim()} style={{ ...footerBtn, background: cfg.color, color: '#FFFFFF', border: 'none', opacity: !draft.title.trim() ? 0.5 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Type chips */}
      <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '0.85rem' }}>
        {TYPE_ORDER.map(type => {
          const c = KNOWLEDGE_TYPES[type]
          const active = draft.item_type === type
          return (
            <button key={type} onClick={() => setDraft(p => ({ ...p, item_type: type }))}
              style={{ flexShrink: 0, border: `1.5px solid ${active ? c.color : '#E2E8F0'}`, background: active ? c.bg : '#FFFFFF', color: active ? c.color : '#64748B', borderRadius: '999px', padding: '0.22rem 0.6rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.7rem', fontWeight: active ? 800 : 600 }}>
              {c.icon} {c.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <FormField label="Título *" value={draft.title} onChange={v => setDraft(p => ({ ...p, title: v }))} />
        <FormField label="Subtítulo" value={draft.subtitle} onChange={v => setDraft(p => ({ ...p, subtitle: v }))} />
        <FormField label="Resumo" value={draft.summary} onChange={v => setDraft(p => ({ ...p, summary: v }))} rows={3} />

        {cfg.metadataFields.slice(0, 4).map(f => (
          <FormField key={f.key} label={f.label} type={f.type} value={draft.metadata[f.key] ?? ''} onChange={v => setDraft(p => ({ ...p, metadata: { ...p.metadata, [f.key]: v } }))} />
        ))}

        <FormField label="Autores (separar por vírgula)" value={draft.authors.join(', ')} onChange={v => setDraft(p => ({ ...p, authors: v.split(/[,;]/).map(s => s.trim()).filter(Boolean) }))} />
        <FormField label="Tags" value={draft.tags.join(', ')} onChange={v => setDraft(p => ({ ...p, tags: v.split(/[,;]/).map(s => s.trim()).filter(Boolean) }))} />
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', rows }: {
  label: string; value: string
  onChange: (v: string) => void
  type?: string; rows?: number
}) {
  const base: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: '7px', background: '#FFFFFF', color: '#0F172A', padding: '0.42rem 0.6rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'inherit' }
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.22rem' }}>{label}</label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} style={{ ...base, resize: 'vertical', lineHeight: 1.55 }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={base} />
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  border: 'none', background: 'transparent', cursor: 'pointer',
  color: '#94A3B8', padding: '0.18rem', borderRadius: '4px',
  display: 'flex', alignItems: 'center', lineHeight: 1,
  transition: 'color 0.1s',
}

const footerBtn: React.CSSProperties = {
  border: '1px solid #E2E8F0', background: '#FFFFFF',
  borderRadius: '7px', padding: '0.38rem 0.7rem',
  cursor: 'pointer', fontFamily: 'inherit',
  fontSize: '0.75rem', fontWeight: 700,
}
