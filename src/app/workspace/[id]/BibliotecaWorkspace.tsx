'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Project } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus, BookOpen, Sparkles, X, Check, Edit2, Trash2, Clock, Eye, FileText, Bookmark, Quote } from 'lucide-react'
import { KNOWLEDGE_TYPES, type KnowledgeItemType } from '@/lib/knowledge-base'

// ── Types ──────────────────────────────────────────────────────────────────────

type BookCategory =
  | 'comentarios_biblicos' | 'dicionarios_lexicos' | 'teologia_biblica'
  | 'teologia_sistematica' | 'historia_igreja' | 'confissoes_catecismos'
  | 'hermeneutica' | 'homiletica' | 'teologia_pastoral' | 'obras_classicas'

type TrustLevel = 1 | 2 | 3 | 4 | 5
type DetailTab  = 'sobre' | 'passagens' | 'notas'

interface BookEntry {
  id: string
  user_id: string
  title: string
  author: string
  authors: string[]
  category: BookCategory
  year: number | null
  publisher: string | null
  language: string
  description: string | null
  bible_references: string[]
  theological_topics: string[]
  tags: string[]
  trust_level: TrustLevel
  is_indexed: boolean
  query_count: number
  citation_count: number
  created_at: string
  updated_at: string
}

interface BookPassage {
  id: string
  book_id: string
  content: string
  page_number: number | null
  chapter: string | null
  section: string | null
  bible_ref: string | null
  passage_index: number
  created_at: string
}

interface BookNote {
  id: string
  book_id: string
  user_id: string
  note_text: string
  note_type: 'annotation' | 'bookmark' | 'citation'
  created_at: string
  updated_at: string
}

interface RelatedKnowledgeItem {
  id: string
  item_type: KnowledgeItemType
  title: string
  summary: string | null
  authors: string[]
  bible_references: string[]
  doctrines: string[]
  themes: string[]
  updated_at: string
}

type PanelState = 'list' | 'detail' | 'create'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { key: BookCategory; label: string; icon: string }[] = [
  { key: 'comentarios_biblicos',  label: 'Comentários',    icon: '📖' },
  { key: 'dicionarios_lexicos',   label: 'Léxicos',        icon: '📚' },
  { key: 'teologia_biblica',      label: 'T. Bíblica',     icon: '🌿' },
  { key: 'teologia_sistematica',  label: 'T. Sistemática', icon: '⚙' },
  { key: 'historia_igreja',       label: 'História',       icon: '🏛' },
  { key: 'confissoes_catecismos', label: 'Confissões',     icon: '✦'  },
  { key: 'hermeneutica',          label: 'Hermenêutica',   icon: '🔍' },
  { key: 'homiletica',            label: 'Homilética',     icon: '🎙' },
  { key: 'teologia_pastoral',     label: 'Pastoral',       icon: '👥' },
  { key: 'obras_classicas',       label: 'Clássicos',      icon: '📜' },
]

const TRUST: Record<TrustLevel, { label: string; color: string; bg: string; dot: string }> = {
  1: { label: 'Adicionado',     color: '#64748B', bg: '#F1F5F9', dot: '#94A3B8' },
  2: { label: 'Validado',       color: '#163A6B', bg: '#EEF3FA', dot: '#1E4D8C' },
  3: { label: 'Revisado',       color: '#059669', bg: '#F0FDF4', dot: '#10B981' },
  4: { label: 'Oficial Lampas', color: '#D97706', bg: '#FEFCE8', dot: '#F59E0B' },
  5: { label: 'Fonte Primária', color: '#7C3AED', bg: '#FAF5FF', dot: '#8B5CF6' },
}

const EMPTY_BOOK: Omit<BookEntry, 'id' | 'user_id' | 'query_count' | 'citation_count' | 'is_indexed' | 'created_at' | 'updated_at'> = {
  title: '', author: '', authors: [], category: 'comentarios_biblicos',
  year: null, publisher: null, language: 'pt', description: null,
  bible_references: [], theological_topics: [], tags: [], trust_level: 1,
}

const EMPTY_PASSAGE = { content: '', page_number: '', chapter: '', section: '', bible_ref: '' }

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

function CatBadge({ cat }: { cat: BookCategory }) {
  const c = CATEGORIES.find(c => c.key === cat)
  return (
    <span style={{ fontSize: '0.6rem', background: '#F1F5F9', color: '#64748B', borderRadius: '4px', padding: '2px 6px', fontWeight: 600 }}>
      {c?.icon} {c?.label}
    </span>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', background: '#F1F5F9', color: '#475569', borderRadius: '5px', padding: '2px 7px', border: '1px solid #E2E8F0' }}>
      {label}
      {onRemove && <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, lineHeight: 1, display: 'flex' }}><X size={9} /></button>}
    </span>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  project: Project
  userId: string
  onAskAI: (prompt: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BibliotecaWorkspace({ project, userId, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [books,       setBooks]       = useState<BookEntry[]>([])
  const [query,       setQuery]       = useState('')
  const [catFilter,   setCatFilter]   = useState<BookCategory | 'all'>('all')
  const [loading,     setLoading]     = useState(true)
  const [panel,       setPanel]       = useState<PanelState>('list')
  const [selected,    setSelected]    = useState<BookEntry | null>(null)
  const [detailTab,   setDetailTab]   = useState<DetailTab>('sobre')
  const [draft,       setDraft]       = useState({ ...EMPTY_BOOK })
  const [saving,      setSaving]      = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [savedToast,  setSavedToast]  = useState(false)

  // Passages
  const [passages,    setPassages]    = useState<BookPassage[]>([])
  const [passLoading, setPassLoading] = useState(false)
  const [addingPass,  setAddingPass]  = useState(false)
  const [passDraft,   setPassDraft]   = useState({ ...EMPTY_PASSAGE })
  const [savingPass,  setSavingPass]  = useState(false)

  // Notes
  const [notes,       setNotes]       = useState<BookNote[]>([])
  const [notesLoading,setNotesLoading]= useState(false)
  const [noteDraft,   setNoteDraft]   = useState('')
  const [noteType,    setNoteType]    = useState<'annotation' | 'bookmark' | 'citation'>('annotation')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [relatedKnowledge, setRelatedKnowledge] = useState<RelatedKnowledgeItem[]>([])

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadBooks = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('lampas_books')
      .select('*')
      .order('updated_at', { ascending: false })
    setBooks((data ?? []) as BookEntry[])
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadBooks() }, [loadBooks])

  useEffect(() => {
    let mounted = true
    if (!project.book || project.book === '—') {
      setRelatedKnowledge([])
      return () => { mounted = false }
    }

    async function loadRelatedKnowledge() {
      try {
        const { data } = await supabase
          .from('knowledge_items')
          .select('id,item_type,title,summary,authors,bible_references,doctrines,themes,updated_at')
          .eq('user_id', userId)
          .contains('bible_references', [project.book])
          .order('updated_at', { ascending: false })
          .limit(6)

        if (mounted) setRelatedKnowledge((data ?? []) as RelatedKnowledgeItem[])
      } catch {
        if (mounted) setRelatedKnowledge([])
      }
    }

    void loadRelatedKnowledge()

    return () => { mounted = false }
  }, [project.book, project.passage_ref, supabase, userId])

  async function loadPassages(bookId: string) {
    setPassLoading(true)
    const { data } = await supabase
      .from('lampas_book_passages')
      .select('*')
      .eq('book_id', bookId)
      .order('passage_index', { ascending: true })
    setPassages((data ?? []) as BookPassage[])
    setPassLoading(false)
  }

  async function loadNotes(bookId: string) {
    setNotesLoading(true)
    const { data } = await supabase
      .from('lampas_book_notes')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setNotes((data ?? []) as BookNote[])
    setNotesLoading(false)
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = books
    if (catFilter !== 'all') list = list.filter(b => b.category === catFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q) ||
        b.theological_topics.some(t => t.toLowerCase().includes(q)) ||
        b.bible_references.some(r => r.toLowerCase().includes(q)) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [books, query, catFilter])

  // ── Open book ───────────────────────────────────────────────────────────────
  async function openBook(book: BookEntry) {
    setSelected(book)
    setPanel('detail')
    setDetailTab('sobre')
    setAddingPass(false)
    void supabase.rpc('increment_book_query_count', { p_id: book.id })
    await Promise.all([loadPassages(book.id), loadNotes(book.id)])
  }

  // ── Save book ───────────────────────────────────────────────────────────────
  async function saveBook() {
    if (!draft.title.trim()) return
    setSaving(true)
    const payload = { ...draft, user_id: userId }
    let data: BookEntry | null = null

    if (selected && panel === 'detail') {
      const res = await supabase.from('lampas_books').update(payload).eq('id', selected.id).select().single()
      data = res.data as BookEntry
    } else {
      const res = await supabase.from('lampas_books').insert(payload).select().single()
      data = res.data as BookEntry
    }

    if (data) {
      setBooks(prev => {
        const idx = prev.findIndex(b => b.id === data!.id)
        return idx >= 0 ? prev.map(b => b.id === data!.id ? data! : b) : [data!, ...prev]
      })
      setSelected(data)
      setPanel('detail')
      setDetailTab('sobre')
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 3000)
    }
    setSaving(false)
  }

  // ── Delete book ─────────────────────────────────────────────────────────────
  async function deleteBook() {
    if (!selected) return
    await supabase.from('lampas_books').delete().eq('id', selected.id)
    setBooks(prev => prev.filter(b => b.id !== selected.id))
    setSelected(null)
    setPanel('list')
    setDeleteConfirm(false)
  }

  // ── Passage CRUD ────────────────────────────────────────────────────────────
  async function savePassage() {
    if (!selected || !passDraft.content.trim()) return
    setSavingPass(true)
    const { data } = await supabase.from('lampas_book_passages').insert({
      book_id:       selected.id,
      content:       passDraft.content.trim(),
      page_number:   passDraft.page_number ? parseInt(passDraft.page_number) : null,
      chapter:       passDraft.chapter.trim() || null,
      section:       passDraft.section.trim() || null,
      bible_ref:     passDraft.bible_ref.trim() || null,
      passage_index: passages.length,
      user_id:       userId,
    }).select().single()

    if (data) {
      setPassages(prev => [...prev, data as BookPassage])
      setPassDraft({ ...EMPTY_PASSAGE })
      setAddingPass(false)
    }
    setSavingPass(false)
  }

  async function deletePassage(passageId: string) {
    await supabase.from('lampas_book_passages').delete().eq('id', passageId)
    setPassages(prev => prev.filter(p => p.id !== passageId))
  }

  // ── Note CRUD ───────────────────────────────────────────────────────────────
  async function saveNote() {
    if (!selected || !noteDraft.trim()) return
    if (editingNote) {
      const { data } = await supabase.from('lampas_book_notes')
        .update({ note_text: noteDraft, note_type: noteType })
        .eq('id', editingNote).select().single()
      if (data) setNotes(prev => prev.map(n => n.id === editingNote ? data as BookNote : n))
      setEditingNote(null)
    } else {
      const { data } = await supabase.from('lampas_book_notes').insert({
        book_id: selected.id, user_id: userId,
        note_text: noteDraft, note_type: noteType,
      }).select().single()
      if (data) setNotes(prev => [data as BookNote, ...prev])
    }
    setNoteDraft('')
  }

  async function deleteNote(noteId: string) {
    await supabase.from('lampas_book_notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  // ── Ask AI with book context ─────────────────────────────────────────────────
  function askAIAboutBook(book: BookEntry) {
    const passageContext = passages.slice(0, 3).map(p =>
      `[${p.bible_ref ?? 'p.' + p.page_number}] ${p.content.slice(0, 200)}…`
    ).join('\n')

    onAskAI([
      `Obra: "${book.title}" de ${book.author} (${book.year ?? 'sem ano'})`,
      `Categoria: ${CATEGORIES.find(c => c.key === book.category)?.label}`,
      book.description ? `Sobre: ${book.description}` : '',
      book.theological_topics.length > 0 ? `Tópicos: ${book.theological_topics.join(', ')}` : '',
      book.bible_references.length > 0   ? `Cobre: ${book.bible_references.join(', ')}` : '',
      passageContext ? `\nPassagens relevantes:\n${passageContext}` : '',
      `\nContexto atual: ${project.book} ${project.passage_ref}`,
      `\nCom base nessa obra e no contexto atual, o que o autor contribui para a exegese desta passagem?`,
    ].filter(Boolean).join('\n'))
  }

  // ── Inline field helper ─────────────────────────────────────────────────────
  function fi(key: keyof typeof draft, label: string, rows = 1) {
    const val = (draft[key] as string | null) ?? ''
    return (
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</label>
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

      {savedToast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Check size={13} strokeWidth={2} style={{ color: '#4ADE80' }} /> Salvo na Biblioteca
        </div>
      )}

      {/* ══ LEFT — Search + List ══ */}
      <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>

        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', letterSpacing: '-0.01em' }}>Biblioteca Lampas</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '1px' }}>{books.length} obra{books.length !== 1 ? 's' : ''} · fontes reformadas</div>
            </div>
            <button onClick={() => { setDraft({ ...EMPTY_BOOK }); setSelected(null); setPanel('create') }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Plus size={11} strokeWidth={2.5} /> Nova
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} strokeWidth={1.75} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar obra, autor, tópico…"
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
            Todas
          </button>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCatFilter(c.key === catFilter ? 'all' : c.key)}
              style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: `1px solid ${catFilter === c.key ? '#1E293B' : 'transparent'}`, background: catFilter === c.key ? '#1E293B' : 'transparent', color: catFilter === c.key ? '#FFF' : '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}>
              {c.icon}
            </button>
          ))}
        </div>

        {/* Book list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.78rem' }}>Carregando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📚</div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.5 }}>
                {query ? `"${query}" não encontrado.` : 'Nenhuma obra ainda.\nAdicione a primeira.'}
              </div>
            </div>
          ) : filtered.map(book => (
            <button key={book.id} onClick={() => openBook(book)}
              style={{
                width: '100%', textAlign: 'left',
                background: selected?.id === book.id ? '#F0FDF4' : 'transparent',
                border: `1px solid ${selected?.id === book.id ? '#10B981' : 'transparent'}`,
                borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.1s', marginBottom: '2px',
              }}
              onMouseEnter={e => { if (selected?.id !== book.id) e.currentTarget.style.background = '#F8FAFC' }}
              onMouseLeave={e => { if (selected?.id !== book.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                <span style={{ fontSize: '0.8rem', marginTop: '1px', flexShrink: 0 }}>
                  {CATEGORIES.find(c => c.key === book.category)?.icon ?? '📖'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: '0.71rem', color: '#64748B', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {book.author}{book.year ? ` · ${book.year}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <TrustBadge level={book.trust_level} />
                    {book.query_count > 0 && (
                      <span style={{ fontSize: '0.58rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Eye size={9} /> {book.query_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ══ RIGHT ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── LIST state ── */}
        {panel === 'list' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: '#94A3B8', padding: '32px' }}>
            <BookOpen size={32} strokeWidth={1} style={{ opacity: 0.25 }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B', textAlign: 'center' }}>
              Selecione uma obra ou adicione uma nova
            </div>
            <div style={{ width: '100%', maxWidth: '340px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '12px' }}>
                Integração com a plataforma
              </div>
              {[
                { icon: '📖', label: 'Comentários Bíblicos', desc: 'Vinculados a passagens específicas' },
                { icon: '📚', label: 'Léxicos e Dicionários', desc: 'Conectados ao Dicionário Lampas' },
                { icon: '✦',  label: 'Teologia Sistemática', desc: 'Consultados na geração IA' },
                { icon: '🔍', label: 'Hermenêutica', desc: 'Metodologia e interpretação' },
                { icon: '🤖', label: 'RAG Teológico', desc: 'IA usa a Biblioteca como fonte primária' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < 4 ? '8px' : 0 }}>
                  <span style={{ fontSize: '0.88rem', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1E293B' }}>{item.label}</div>
                    <div style={{ fontSize: '0.64rem', color: '#CBD5E1', lineHeight: 1.3 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {relatedKnowledge.length > 0 && (
              <div style={{ width: '100%', maxWidth: '420px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                    Conhecimento relacionado
                  </div>
                  <button onClick={() => { window.location.href = '/knowledge' }} style={{ background: 'transparent', border: 'none', color: '#B45309', fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Abrir base →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {relatedKnowledge.map(item => {
                    const cfg = KNOWLEDGE_TYPES[item.item_type]
                    return (
                      <button
                        key={item.id}
                        onClick={() => onAskAI([
                          `Use este item da Base de Conhecimento no estudo de ${project.book} ${project.passage_ref}.`,
                          `Tipo: ${cfg.label}`,
                          `Título: ${item.title}`,
                          item.authors.length ? `Autores: ${item.authors.join(', ')}` : '',
                          item.summary ? `Resumo: ${item.summary}` : '',
                          item.doctrines.length ? `Doutrinas: ${item.doctrines.join(', ')}` : '',
                          item.themes.length ? `Temas: ${item.themes.join(', ')}` : '',
                        ].filter(Boolean).join('\n'))}
                        style={{ width: '100%', textAlign: 'left', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span>{cfg.icon}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.78rem', color: '#1E293B', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                            <div style={{ fontSize: '0.64rem', color: '#94A3B8', marginTop: '1px' }}>{cfg.label}{item.authors[0] ? ` · ${item.authors[0]}` : ''}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DETAIL state ── */}
        {panel === 'detail' && selected && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px 0', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <CatBadge cat={selected.category} />
                    <TrustBadge level={selected.trust_level} />
                    {selected.query_count > 0 && (
                      <span style={{ fontSize: '0.62rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Eye size={10} /> {selected.query_count}
                      </span>
                    )}
                    <span style={{ fontSize: '0.62rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} /> {new Date(selected.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.025em', margin: 0, lineHeight: 1.2 }}>
                    {selected.title}
                  </h1>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '3px' }}>
                    {selected.author}{selected.year ? ` · ${selected.year}` : ''}{selected.publisher ? ` · ${selected.publisher}` : ''}
                    {selected.language !== 'pt' && (
                      <span style={{ marginLeft: '6px', fontSize: '0.62rem', background: '#F1F5F9', color: '#94A3B8', borderRadius: '4px', padding: '1px 5px' }}>
                        {{ en: 'Inglês', de: 'Alemão', la: 'Latim', he: 'Hebraico', el: 'Grego' }[selected.language] ?? selected.language}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0, marginLeft: '12px' }}>
                  <button onClick={() => askAIAboutBook(selected)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #DDD6FE', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#7C3AED', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Sparkles size={11} strokeWidth={1.75} /> Usar na IA
                  </button>
                  <button onClick={() => {
                    setDraft({
                      title: selected.title, author: selected.author, authors: selected.authors,
                      category: selected.category, year: selected.year, publisher: selected.publisher,
                      language: selected.language, description: selected.description,
                      bible_references: selected.bible_references, theological_topics: selected.theological_topics,
                      tags: selected.tags, trust_level: selected.trust_level,
                    })
                    setPanel('create')
                  }}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Edit2 size={11} /> Editar
                  </button>
                  {deleteConfirm ? (
                    <>
                      <button onClick={deleteBook} style={{ background: '#EF4444', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>Confirmar</button>
                      <button onClick={() => setDeleteConfirm(false)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(true)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: '1px solid #FEE2E2', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0' }}>
                {(['sobre', 'passagens', 'notas'] as DetailTab[]).map(tab => (
                  <button key={tab} onClick={() => setDetailTab(tab)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      padding: '8px 16px', fontSize: '0.78rem', fontWeight: detailTab === tab ? 600 : 400,
                      color: detailTab === tab ? '#1E293B' : '#94A3B8',
                      borderBottom: `2px solid ${detailTab === tab ? '#1E293B' : 'transparent'}`,
                      transition: 'all 0.12s',
                    }}>
                    {tab === 'sobre' ? 'Sobre' : tab === 'passagens' ? `Passagens (${passages.length})` : `Notas (${notes.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#FFFFFF' }}>

              {/* Tab: Sobre */}
              {detailTab === 'sobre' && (
                <div>
                  {selected.description && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Descrição</div>
                      <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.description}</div>
                    </div>
                  )}

                  {selected.bible_references.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Passagens cobertas</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {selected.bible_references.map(r => (
                          <span key={r} style={{ fontSize: '0.73rem', background: '#EEF3FA', color: '#163A6B', borderRadius: '5px', padding: '2px 8px', border: '1px solid #BFDBFE' }}>{r}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.theological_topics.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Tópicos teológicos</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {selected.theological_topics.map(t => (
                          <span key={t} style={{ fontSize: '0.73rem', background: '#FAF5FF', color: '#7C3AED', borderRadius: '5px', padding: '2px 8px', border: '1px solid #DDD6FE' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.tags.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Tags</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {selected.tags.map(t => (
                          <span key={t} style={{ fontSize: '0.68rem', background: '#F1F5F9', color: '#64748B', borderRadius: '4px', padding: '2px 6px' }}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {selected.publisher && <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Editora: {selected.publisher}</span>}
                    {selected.year && <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Ano: {selected.year}</span>}
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Adicionado: {new Date(selected.created_at).toLocaleDateString('pt-BR')}</span>
                    {selected.is_indexed && <span style={{ fontSize: '0.65rem', color: '#059669' }}>✓ Indexado</span>}
                  </div>
                </div>
              )}

              {/* Tab: Passagens */}
              {detailTab === 'passagens' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {passages.length === 0 ? 'Nenhuma passagem indexada.' : `${passages.length} passagem${passages.length > 1 ? 'ns' : ''}`}
                    </div>
                    <button onClick={() => setAddingPass(v => !v)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: addingPass ? '#F1F5F9' : '#1E293B', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '0.71rem', fontWeight: 600, color: addingPass ? '#64748B' : '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {addingPass ? <X size={11} /> : <Plus size={11} strokeWidth={2.5} />} {addingPass ? 'Cancelar' : 'Adicionar'}
                    </button>
                  </div>

                  {/* Add passage form */}
                  {addingPass && (
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '10px' }}>Nova passagem</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        {[
                          { k: 'bible_ref',   label: 'Referência (ex: Gn 39:2)' },
                          { k: 'chapter',     label: 'Capítulo / Seção' },
                          { k: 'page_number', label: 'Página' },
                        ].map(({ k, label }) => (
                          <div key={k}>
                            <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 600, color: '#94A3B8', marginBottom: '3px' }}>{label}</label>
                            <input value={(passDraft as Record<string, string>)[k]}
                              onChange={e => setPassDraft(p => ({ ...p, [k]: e.target.value }))}
                              style={{ width: '100%', boxSizing: 'border-box', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                            />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 600, color: '#94A3B8', marginBottom: '3px' }}>Conteúdo *</label>
                        <textarea value={passDraft.content} rows={4}
                          onChange={e => setPassDraft(p => ({ ...p, content: e.target.value }))}
                          placeholder="Cole aqui o trecho relevante da obra…"
                          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '7px 9px', fontSize: '0.83rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.65 }}
                        />
                      </div>
                      <button onClick={savePassage} disabled={savingPass || !passDraft.content.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, color: '#FFF', cursor: !passDraft.content.trim() || savingPass ? 'not-allowed' : 'pointer', opacity: !passDraft.content.trim() ? 0.5 : 1, fontFamily: 'inherit' }}>
                        <Check size={12} /> {savingPass ? 'Salvando…' : 'Salvar passagem'}
                      </button>
                    </div>
                  )}

                  {/* Passages list */}
                  {passLoading ? (
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>Carregando…</div>
                  ) : passages.map(p => (
                    <div key={p.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ padding: '8px 12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {p.bible_ref && (
                          <span style={{ fontSize: '0.7rem', background: '#EEF3FA', color: '#163A6B', borderRadius: '4px', padding: '2px 7px', border: '1px solid #BFDBFE', fontWeight: 600 }}>{p.bible_ref}</span>
                        )}
                        {p.chapter && <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Cap. {p.chapter}</span>}
                        {p.page_number && <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>p. {p.page_number}</span>}
                        <button onClick={() => deletePassage(p.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px', display: 'flex' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div style={{ padding: '10px 12px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {p.content}
                      </div>
                      <div style={{ padding: '6px 12px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '8px' }}>
                        <button onClick={() => onAskAI(`Passagem de "${selected.title}" (${selected.author}):\n\n"${p.content}"\n\nContexto: ${project.book} ${project.passage_ref}\n\nComente esta passagem e conecte ao texto bíblico atual.`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '4px 9px', fontSize: '0.68rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Sparkles size={10} strokeWidth={1.75} /> Usar na IA
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Notas */}
              {detailTab === 'notas' && (
                <div>
                  {/* Note input */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                      {([
                        { type: 'annotation', icon: <FileText size={11} />, label: 'Anotação' },
                        { type: 'bookmark',   icon: <Bookmark size={11} />, label: 'Marcador' },
                        { type: 'citation',   icon: <Quote size={11} />,    label: 'Citação' },
                      ] as { type: typeof noteType; icon: React.ReactNode; label: string }[]).map(({ type, icon, label }) => (
                        <button key={type} onClick={() => setNoteType(type)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: noteType === type ? '#1E293B' : 'transparent', border: `1px solid ${noteType === type ? '#1E293B' : '#E2E8F0'}`, borderRadius: '6px', padding: '4px 9px', fontSize: '0.67rem', fontWeight: 600, color: noteType === type ? '#FFF' : '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                    <textarea value={noteDraft} rows={3}
                      onChange={e => setNoteDraft(e.target.value)}
                      placeholder={editingNote ? 'Editar nota…' : 'Adicionar nota sobre esta obra…'}
                      style={{ width: '100%', boxSizing: 'border-box', resize: 'none', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.6 }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button onClick={saveNote} disabled={!noteDraft.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, color: '#FFF', cursor: !noteDraft.trim() ? 'not-allowed' : 'pointer', opacity: !noteDraft.trim() ? 0.5 : 1, fontFamily: 'inherit' }}>
                        <Check size={12} /> {editingNote ? 'Atualizar' : 'Salvar nota'}
                      </button>
                      {editingNote && (
                        <button onClick={() => { setEditingNote(null); setNoteDraft('') }}
                          style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', color: '#64748B', fontSize: '0.75rem', fontFamily: 'inherit' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>

                  {notesLoading ? (
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>Carregando…</div>
                  ) : notes.length === 0 ? (
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>Nenhuma nota ainda.</div>
                  ) : notes.map(note => (
                    <div key={note.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                            {note.note_type === 'annotation' ? '✏ Anotação' : note.note_type === 'bookmark' ? '🔖 Marcador' : '"" Citação'}
                          </span>
                          <span style={{ fontSize: '0.62rem', color: '#CBD5E1' }}>{new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => { setEditingNote(note.id); setNoteDraft(note.note_text); setNoteType(note.note_type) }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px', display: 'flex' }}>
                            <Edit2 size={11} />
                          </button>
                          <button onClick={() => deleteNote(note.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FCA5A5', padding: '2px', display: 'flex' }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{note.note_text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT state ── */}
        {panel === 'create' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                {selected ? 'Editar obra' : 'Adicionar obra'}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={saveBook} disabled={saving || !draft.title.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1E293B', border: 'none', borderRadius: '7px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, color: '#FFF', cursor: !draft.title.trim() || saving ? 'not-allowed' : 'pointer', opacity: !draft.title.trim() ? 0.5 : 1, fontFamily: 'inherit' }}>
                  <Check size={12} strokeWidth={2.5} /> {saving ? 'Salvando…' : 'Salvar'}
                </button>
                <button onClick={() => { setPanel(selected ? 'detail' : 'list') }}
                  style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 10px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}>
                  <X size={14} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#FFFFFF' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '0' }}>
                <div style={{ gridColumn: '1 / -1' }}>{fi('title', 'Título *')}</div>
                {fi('author', 'Autor principal')}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Categoria</label>
                  <select value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value as BookCategory }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}>
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {fi('year', 'Ano')}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Idioma</label>
                    <select value={draft.language} onChange={e => setDraft(p => ({ ...p, language: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}>
                      {[['pt','Português'],['en','Inglês'],['de','Alemão'],['la','Latim'],['el','Grego'],['he','Hebraico']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                {fi('publisher', 'Editora')}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Nível de confiança</label>
                  <select value={draft.trust_level} onChange={e => setDraft(p => ({ ...p, trust_level: parseInt(e.target.value) as TrustLevel }))}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}>
                    {([1,2,3,4,5] as TrustLevel[]).map(l => <option key={l} value={l}>{l} — {TRUST[l].label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>{fi('description', 'Descrição', 4)}</div>

              {/* Bible references */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Passagens cobertas</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {draft.bible_references.map(r => (
                    <Chip key={r} label={r} onRemove={() => setDraft(p => ({ ...p, bible_references: p.bible_references.filter(x => x !== r) }))} />
                  ))}
                </div>
                <input
                  placeholder="Ex: Gn 39 — pressione Enter para adicionar"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      const v = (e.target as HTMLInputElement).value.trim();
                      setDraft(p => ({ ...p, bible_references: [...new Set([...p.bible_references, v])] }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                />
              </div>

              {/* Theological topics */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Tópicos teológicos</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {draft.theological_topics.map(t => (
                    <Chip key={t} label={t} onRemove={() => setDraft(p => ({ ...p, theological_topics: p.theological_topics.filter(x => x !== t) }))} />
                  ))}
                </div>
                <input
                  placeholder="Ex: Justificação — pressione Enter para adicionar"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                      const v = (e.target as HTMLInputElement).value.trim();
                      setDraft(p => ({ ...p, theological_topics: [...new Set([...p.theological_topics, v])] }));
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Tags (separadas por vírgula)</label>
                <input value={draft.tags.join(', ')}
                  onChange={e => setDraft(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 10px', fontSize: '0.84rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
