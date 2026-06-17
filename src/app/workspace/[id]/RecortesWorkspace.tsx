'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import {
  RECORTE_CATEGORIAS,
  migrateCollageItems,
  type CollageItem,
  type RecorteCategoria,
  type RecorteItem,
} from '@/lib/collages-content'
import { Copy, CopyPlus, Edit2, Plus, Search, Trash2 } from 'lucide-react'

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (section: Section) => void
  onAskAI: (prompt: string) => void
}

type SortBy = 'recentes' | 'antigos' | 'titulo' | 'fonte' | 'categoria'
type FilterCat = RecorteCategoria | 'Todos'

const ACCENT = '#0F766E'
const FILTER_PILLS: FilterCat[] = ['Todos', 'Citação', 'Comentário', 'Estrutura', 'Definição', 'Ilustração', 'Aplicação']
const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: 'recentes',  label: 'Mais recentes' },
  { id: 'antigos',   label: 'Mais antigos' },
  { id: 'titulo',    label: 'Título' },
  { id: 'fonte',     label: 'Fonte' },
  { id: 'categoria', label: 'Categoria' },
]

const inputCss: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: '6px', color: 'var(--text-primary)',
  padding: '0.5rem 0.65rem', fontFamily: 'inherit', fontSize: '0.85rem',
  outline: 'none', width: '100%',
}

const selectCss: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: '6px', color: 'var(--text-primary)',
  padding: '0.5rem 0.6rem', fontFamily: 'inherit', fontSize: '0.85rem',
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function loadItems(section: Section | undefined): RecorteItem[] {
  const c = section?.content as { type?: string; items?: unknown[] } | null
  if (!c?.items || !Array.isArray(c.items)) return []
  if (c.type === 'recortes_workspace') return c.items as RecorteItem[]
  if (c.type === 'collages_workspace') return migrateCollageItems(c.items as CollageItem[])
  return []
}

function emptyDraft(): Omit<RecorteItem, 'id' | 'createdAt'> {
  return { title: '', fonte: '', categoria: 'Citação', conteudo: '' }
}

export default function RecortesWorkspace({ project, userId, existingSection, onUpdate, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [items,     setItems]     = useState<RecorteItem[]>(() => loadItems(existingSection))
  const [creating,  setCreating]  = useState(false)
  const [draft,     setDraft]     = useState(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState(emptyDraft)
  const [search,    setSearch]    = useState('')
  const [filterCat, setFilterCat] = useState<FilterCat>('Todos')
  const [sortBy,    setSortBy]    = useState<SortBy>('recentes')
  const [saving,    setSaving]    = useState(false)
  const [savedAt,   setSavedAt]   = useState<Date | null>(null)

  async function persist(next: RecorteItem[]) {
    setSaving(true)
    const payload = {
      project_id: project.id,
      user_id: userId,
      slug: 'colagens',
      module: 'inventio' as const,
      title: 'Recortes',
      content: { type: 'recortes_workspace', items: next },
      status: (next.length > 0 ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    if (existingSection?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existingSection.id).select().single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) onUpdate(data as Section)
    }
    setSaving(false)
    setSavedAt(new Date())
  }

  function commit(next: RecorteItem[]) {
    setItems(next)
    void persist(next)
  }

  function addItem() {
    if (!draft.title.trim() && !draft.conteudo.trim()) return
    commit([{
      id: makeId(), createdAt: Date.now(),
      title:   draft.title.trim()   || draft.categoria,
      fonte:   draft.fonte.trim(),
      categoria: draft.categoria,
      conteudo: draft.conteudo.trim(),
    }, ...items])
    setDraft(emptyDraft())
    setCreating(false)
  }

  function startEdit(item: RecorteItem) {
    setEditingId(item.id)
    setEditDraft({ title: item.title, fonte: item.fonte, categoria: item.categoria, conteudo: item.conteudo })
  }

  function saveEdit() {
    if (!editingId) return
    commit(items.map(it =>
      it.id === editingId
        ? { ...it, ...editDraft, title: editDraft.title.trim() || editDraft.categoria }
        : it
    ))
    setEditingId(null)
  }

  function duplicate(item: RecorteItem) {
    commit([{ ...item, id: makeId(), createdAt: Date.now(), title: `${item.title} (cópia)` }, ...items])
  }

  function remove(id: string) { commit(items.filter(it => it.id !== id)) }

  const displayed = useMemo(() => {
    let list = items.slice()
    if (filterCat !== 'Todos') list = list.filter(it => it.categoria === filterCat)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(it => [it.title, it.fonte, it.categoria, it.conteudo].join(' ').toLowerCase().includes(q))
    switch (sortBy) {
      case 'recentes':  list.sort((a, b) => b.createdAt - a.createdAt); break
      case 'antigos':   list.sort((a, b) => a.createdAt - b.createdAt); break
      case 'titulo':    list.sort((a, b) => a.title.localeCompare(b.title, 'pt')); break
      case 'fonte':     list.sort((a, b) => a.fonte.localeCompare(b.fonte, 'pt')); break
      case 'categoria': list.sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt')); break
    }
    return list
  }, [items, filterCat, search, sortBy])

  const savedLabel = saving ? 'salvando...' : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.75rem clamp(1rem, 3vw, 2rem) 4rem' }}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.62rem', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.25rem' }}>
              Ferramentas
            </div>
            <h1 style={{ fontSize: '1.45rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.2rem' }}>
              Recortes
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {project.book} {project.passage_ref} · {items.length} {items.length === 1 ? 'recorte' : 'recortes'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {savedLabel && (
              <span style={{ fontSize: '0.72rem', color: saving ? 'var(--text-muted)' : 'var(--success)' }}>
                {savedLabel}
              </span>
            )}
            <button
              onClick={() => { setCreating(true); setEditingId(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: ACCENT, color: '#fff', border: 'none',
                borderRadius: '7px', padding: '0.5rem 0.9rem',
                fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Novo Recorte
            </button>
          </div>
        </header>

        {/* ── Formulário de criação ─────────────────────────────────── */}
        {creating && (
          <section style={{
            border: `1px solid ${ACCENT}44`, background: 'var(--surface)',
            borderRadius: '8px', padding: '1rem', marginBottom: '1rem',
            display: 'grid', gap: '0.65rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
              <input
                autoFocus
                value={draft.title}
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                placeholder="Título *"
                style={inputCss}
                onFocus={e => { e.target.style.borderColor = ACCENT }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
              <input
                value={draft.fonte}
                onChange={e => setDraft(p => ({ ...p, fonte: e.target.value }))}
                placeholder="Fonte (autor, obra, p. X)"
                style={inputCss}
                onFocus={e => { e.target.style.borderColor = ACCENT }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
            <select
              value={draft.categoria}
              onChange={e => setDraft(p => ({ ...p, categoria: e.target.value as RecorteCategoria }))}
              style={{ ...selectCss, width: 'auto', minWidth: '180px' }}
            >
              {RECORTE_CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
            <textarea
              value={draft.conteudo}
              onChange={e => setDraft(p => ({ ...p, conteudo: e.target.value }))}
              placeholder="Conteúdo do recorte..."
              rows={5}
              style={{ ...inputCss, resize: 'vertical', fontFamily: 'var(--font-serif)', lineHeight: 1.65 }}
              onFocus={e => { e.target.style.borderColor = ACCENT }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={addItem}
                style={{ background: ACCENT, border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '0.5rem 1.1rem' }}
              >
                Salvar
              </button>
              <button
                onClick={() => { setCreating(false); setDraft(emptyDraft()) }}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {/* ── Busca + filtros + ordenação ───────────────────────────── */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar recortes..."
              style={{ ...inputCss, paddingLeft: '2rem' }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{ ...selectCss, width: 'auto' }}
          >
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        {/* Pills de categoria */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          {FILTER_PILLS.map(cat => {
            const active = filterCat === cat
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                style={{
                  border: `1px solid ${active ? ACCENT : 'var(--border-subtle)'}`,
                  background: active ? `${ACCENT}12` : 'transparent',
                  color: active ? ACCENT : 'var(--text-muted)',
                  borderRadius: '5px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: active ? 700 : 400,
                  padding: '0.28rem 0.6rem', transition: 'all 0.12s',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* ── Grid de cards ────────────────────────────────────────── */}
        {displayed.length === 0 ? (
          <div style={{
            border: '1px dashed var(--border-subtle)', borderRadius: '8px',
            padding: '3rem 1.5rem', textAlign: 'center',
            color: 'var(--text-muted)', background: 'var(--surface)',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.4 }}>✂︎</div>
            {search || filterCat !== 'Todos'
              ? 'Nenhum recorte corresponde ao filtro atual.'
              : 'Nenhum recorte ainda. Clique em "Novo Recorte" para começar.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {displayed.map(item => (
              <RecorteCard
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                editDraft={editDraft}
                onEdit={() => startEdit(item)}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingId(null)}
                onEditDraftChange={setEditDraft}
                onDuplicate={() => duplicate(item)}
                onRemove={() => remove(item.id)}
              />
            ))}
          </div>
        )}

        {/* ── IA ───────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Sugerir conexões',       prompt: `Sugira conexões entre os recortes de ${project.book} ${project.passage_ref}: temas semelhantes, complementaridades, ecos canônicos e implicações homiléticas.` },
              { label: 'Organizar recortes',     prompt: `Organize os recortes de ${project.book} ${project.passage_ref} sugerindo agrupamentos por tema, relevância exegética e aplicação pastoral.` },
              { label: 'Síntese das fontes',     prompt: `Faça uma síntese das fontes e autores coletados nos recortes de ${project.book} ${project.passage_ref}, destacando pontos de convergência e tensão.` },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => onAskAI(a.prompt)}
                style={{
                  background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT,
                  borderRadius: '7px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700,
                  padding: '0.55rem 0.85rem',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── RecorteCard ────────────────────────────────────────────────────────────────

function RecorteCard({
  item, isEditing, editDraft, onEdit, onSaveEdit, onCancelEdit, onEditDraftChange, onDuplicate, onRemove,
}: {
  item: RecorteItem
  isEditing: boolean
  editDraft: Omit<RecorteItem, 'id' | 'createdAt'>
  onEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditDraftChange: (d: Omit<RecorteItem, 'id' | 'createdAt'>) => void
  onDuplicate: () => void
  onRemove: () => void
}) {
  const [confirm, setConfirm] = useState(false)
  const [copied,  setCopied]  = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(item.conteudo).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isEditing) {
    return (
      <article style={{
        border: `1px solid ${ACCENT}55`, background: 'var(--surface)',
        borderRadius: '8px', padding: '0.9rem',
        display: 'grid', gap: '0.55rem',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input
            autoFocus
            value={editDraft.title}
            onChange={e => onEditDraftChange({ ...editDraft, title: e.target.value })}
            placeholder="Título"
            style={inputCss}
            onFocus={e => { e.target.style.borderColor = ACCENT }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
          <input
            value={editDraft.fonte}
            onChange={e => onEditDraftChange({ ...editDraft, fonte: e.target.value })}
            placeholder="Fonte"
            style={inputCss}
            onFocus={e => { e.target.style.borderColor = ACCENT }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>
        <select
          value={editDraft.categoria}
          onChange={e => onEditDraftChange({ ...editDraft, categoria: e.target.value as RecorteCategoria })}
          style={selectCss}
        >
          {RECORTE_CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
        <textarea
          value={editDraft.conteudo}
          onChange={e => onEditDraftChange({ ...editDraft, conteudo: e.target.value })}
          rows={6}
          style={{ ...inputCss, resize: 'vertical', fontFamily: 'var(--font-serif)', lineHeight: 1.65 }}
          onFocus={e => { e.target.style.borderColor = ACCENT }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onSaveEdit}
            style={{ background: ACCENT, border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, padding: '0.42rem 0.9rem' }}
          >
            Salvar
          </button>
          <button
            onClick={onCancelEdit}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', padding: '0.42rem 0.75rem' }}
          >
            Cancelar
          </button>
        </div>
      </article>
    )
  }

  return (
    <article style={{
      border: '1px solid var(--border-subtle)', background: 'var(--surface)',
      borderRadius: '8px', padding: '0.9rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      {/* Categoria + fonte */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: ACCENT,
          background: `${ACCENT}12`, borderRadius: '4px',
          padding: '0.15rem 0.42rem', flexShrink: 0,
        }}>
          {item.categoria}
        </span>
        {item.fonte && (
          <span style={{
            fontSize: '0.71rem', color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textAlign: 'right', flex: 1,
          }}>
            {item.fonte}
          </span>
        )}
      </div>

      {/* Título */}
      <h3 style={{
        margin: 0, fontSize: '0.94rem', fontWeight: 700,
        color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: 0,
      }}>
        {item.title}
      </h3>

      {/* Conteúdo (preview) */}
      {item.conteudo && (
        <p style={{
          margin: 0, flex: 1,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-serif)',
          fontSize: '0.86rem', lineHeight: 1.65,
          display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.conteudo}
        </p>
      )}

      {/* Ações */}
      <div style={{
        display: 'flex', gap: '0', alignItems: 'center',
        paddingTop: '0.35rem', marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <Btn onClick={onEdit}       icon={<Edit2 size={11} />}   label="Editar" />
        <Btn onClick={onDuplicate}  icon={<CopyPlus size={11} />} label="Duplicar" />
        <Btn onClick={handleCopy}   icon={<Copy size={11} />}    label={copied ? 'Copiado!' : 'Copiar'} />
        <span style={{ flex: 1 }} />
        {confirm ? (
          <>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Excluir?</span>
            <Btn onClick={onRemove}           label="Sim" danger />
            <Btn onClick={() => setConfirm(false)} label="Não" />
          </>
        ) : (
          <Btn onClick={() => setConfirm(true)} icon={<Trash2 size={11} />} label="Excluir" danger />
        )}
      </div>
    </article>
  )
}

function Btn({ onClick, icon, label, danger = false }: {
  onClick: () => void; icon?: React.ReactNode; label: string; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.2rem',
        background: 'transparent', border: 'none',
        color: danger ? '#DC2626' : 'var(--text-muted)',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.68rem',
        padding: '0.25rem 0.38rem', borderRadius: '4px', transition: 'all 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.08)' : 'var(--surface-2)'
        e.currentTarget.style.color = danger ? '#DC2626' : 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = danger ? '#DC2626' : 'var(--text-muted)'
      }}
    >
      {icon}
      {label}
    </button>
  )
}
