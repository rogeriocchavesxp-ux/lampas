'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import {
  COLLAGE_AI_ACTIONS,
  COLLAGE_CATEGORIES,
  COLLAGE_LINK_TARGETS,
  COLLAGE_TYPES,
  emptyCollageDraft,
  parseTags,
  type CollageDraft,
  type CollageItem,
  type CollageType,
  type CollageViewMode,
} from '@/lib/collages-content'

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (section: Section) => void
  onAskAI: (prompt: string) => void
}

function loadItems(section: Section | undefined): CollageItem[] {
  const content = section?.content as { type?: string; items?: CollageItem[] } | null
  if (content?.type === 'collages_workspace' && Array.isArray(content.items)) return content.items
  return []
}

function itemTypeLabel(type: CollageType): string {
  return COLLAGE_TYPES.find(t => t.id === type)?.label ?? 'Nota'
}

function colorFor(type: CollageType): string {
  if (type === 'citacao') return 'var(--accent)'
  if (type === 'trecho') return '#7c9cbf'
  if (type === 'resumo') return '#6db8a0'
  if (type === 'resenha') return '#c47c5a'
  return '#9b7ec8'
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export default function CollagesWorkspace({ project, userId, existingSection, onUpdate, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const initialItems = useMemo(() => loadItems(existingSection), [existingSection])
  const projectRef = `${project.book} ${project.passage_ref}`

  const [items, setItems] = useState<CollageItem[]>(initialItems)
  const [draft, setDraft] = useState<CollageDraft>(() => emptyCollageDraft(projectRef))
  const [viewMode, setViewMode] = useState<CollageViewMode>('cards')
  const [filter, setFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [readingItem, setReadingItem] = useState<CollageItem | null>(null)
  const [modalMode, setModalMode] = useState<'read' | 'edit'>('read')
  const [modalDraft, setModalDraft] = useState<CollageDraft | null>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  useEffect(() => {
    if (!readingItem) return
    setModalMode('read')
    setModalDraft(null)
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setReadingItem(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [readingItem])

  function openModalEdit() {
    if (!readingItem) return
    setModalDraft({
      type: readingItem.type,
      title: readingItem.title,
      content: readingItem.content,
      author: readingItem.author,
      work: readingItem.work,
      page: readingItem.page,
      tags: readingItem.tags.join(', '),
      category: readingItem.category,
      linkedTo: readingItem.linkedTo,
    })
    setModalMode('edit')
  }

  function saveModalEdit() {
    if (!readingItem || !modalDraft) return
    const changes: Partial<CollageItem> = {
      type: modalDraft.type,
      title: modalDraft.title.trim() || itemTypeLabel(modalDraft.type),
      content: modalDraft.content.trim(),
      author: modalDraft.author.trim(),
      work: modalDraft.work.trim(),
      page: modalDraft.page.trim(),
      tags: parseTags(modalDraft.tags),
      category: modalDraft.category,
      linkedTo: modalDraft.linkedTo.trim(),
    }
    const nextItems = items.map(item => item.id === readingItem.id ? { ...item, ...changes } : item)
    updateItems(nextItems)
    const updated = { ...readingItem, ...changes }
    setReadingItem(updated)
    setModalMode('read')
    setModalDraft(null)
  }

  function handlePrint() {
    const toolbar = document.getElementById('hokma-reading-toolbar')
    if (toolbar) toolbar.style.display = 'none'
    window.print()
    requestAnimationFrame(() => { if (toolbar) toolbar.style.display = '' })
  }

  async function save(nextItems: CollageItem[]) {
    setSaving(true)
    const payload = {
      project_id: project.id,
      user_id: userId,
      slug: 'colagens',
      module: 'inventio' as const,
      title: 'Colagens',
      content: { type: 'collages_workspace', items: nextItems },
      status: (nextItems.length > 0 ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
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

  function updateItems(nextItems: CollageItem[]) {
    setItems(nextItems)
    void save(nextItems)
  }

  function addItem() {
    if (!draft.title.trim() && !draft.content.trim()) return
    const nextItem: CollageItem = {
      id: makeId(),
      type: draft.type,
      title: draft.title.trim() || itemTypeLabel(draft.type),
      content: draft.content.trim(),
      author: draft.author.trim(),
      work: draft.work.trim(),
      page: draft.page.trim(),
      tags: parseTags(draft.tags),
      category: draft.category,
      linkedTo: draft.linkedTo.trim() || projectRef,
      x: 80 + (items.length % 4) * 210,
      y: 80 + Math.floor(items.length / 4) * 180,
    }
    updateItems([nextItem, ...items])
    setDraft(emptyCollageDraft(projectRef))
  }

  function removeItem(id: string) {
    updateItems(items.filter(item => item.id !== id))
  }

  function askAI(prompt: string, item?: CollageItem) {
    onAskAI([
      'Você é assistente de pesquisa e organização das Colagens do Hokmá.',
      `Projeto atual: ${projectRef} (${project.original_language}).`,
      item ? `Colagem selecionada: ${itemTypeLabel(item.type)} — ${item.title}\n${item.content}` : '',
      '',
      prompt,
    ].filter(Boolean).join('\n'))
  }

  const filteredItems = items.filter(item => {
    const needle = filter.trim().toLowerCase()
    if (!needle) return true
    return [
      item.title,
      item.content,
      item.author,
      item.work,
      item.category,
      item.linkedTo,
      item.tags.join(' '),
    ].join(' ').toLowerCase().includes(needle.replace(/^#/, ''))
  })

  const allTags = Array.from(new Set(items.flatMap(item => item.tags))).slice(0, 16)
  const savedLabel = saving ? 'salvando...' : savedAt ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '2.2rem clamp(1.25rem, 3vw, 2.4rem) 5rem' }}>
        <header style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.68rem', color: '#9b7ec8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.35rem' }}>
              Colagens
            </div>
            <h1 style={{ fontSize: '1.75rem', lineHeight: 1.15, color: 'var(--text-primary)', letterSpacing: 0, marginBottom: '0.45rem' }}>
              Rede viva de apoio exegético
            </h1>
            <p style={{ maxWidth: '760px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Reúna citações, trechos, resumos, resenhas e insights em um mural acadêmico conectado à perícope, à teologia e à comunicação ministerial.
            </p>
          </div>
          <div style={{ color: savedLabel ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.74rem', minWidth: '86px', textAlign: 'right' }}>
            {savedLabel}
          </div>
        </header>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 190px',
          gap: '0.85rem',
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px minmax(0, 1fr)', gap: '0.65rem' }}>
              <select
                value={draft.type}
                onChange={event => setDraft(prev => ({ ...prev, type: event.target.value as CollageType }))}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.55rem', fontFamily: 'inherit' }}
              >
                {COLLAGE_TYPES.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
              </select>
              <input
                value={draft.title}
                onChange={event => setDraft(prev => ({ ...prev, title: event.target.value }))}
                placeholder="Título da colagem"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.55rem 0.7rem', fontFamily: 'inherit' }}
              />
            </div>
            <textarea
              value={draft.content}
              onChange={event => setDraft(prev => ({ ...prev, content: event.target.value }))}
              placeholder="Cole uma citação, trecho de livro, resumo, resenha ou insight exegético..."
              rows={4}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.7rem', resize: 'vertical', fontFamily: 'var(--font-serif)', lineHeight: 1.65 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 86px', gap: '0.55rem' }}>
              <input value={draft.author} onChange={event => setDraft(prev => ({ ...prev, author: event.target.value }))} placeholder="Autor" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.5rem 0.65rem', fontFamily: 'inherit' }} />
              <input value={draft.work} onChange={event => setDraft(prev => ({ ...prev, work: event.target.value }))} placeholder="Obra / fonte" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.5rem 0.65rem', fontFamily: 'inherit' }} />
              <input value={draft.page} onChange={event => setDraft(prev => ({ ...prev, page: event.target.value }))} placeholder="p." style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.5rem 0.65rem', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: '0.55rem' }}>
              <input value={draft.tags} onChange={event => setDraft(prev => ({ ...prev, tags: event.target.value }))} placeholder="tags: aliança, presença, pregação" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.5rem 0.65rem', fontFamily: 'inherit' }} />
              <select value={draft.category} onChange={event => setDraft(prev => ({ ...prev, category: event.target.value }))} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.5rem', fontFamily: 'inherit' }}>
                {COLLAGE_CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
              <select value={draft.linkedTo} onChange={event => setDraft(prev => ({ ...prev, linkedTo: event.target.value }))} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '0.5rem', fontFamily: 'inherit' }}>
                <option>{projectRef}</option>
                {COLLAGE_LINK_TARGETS.map(target => <option key={target}>{target}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <button onClick={addItem} style={{ background: 'rgba(155,126,200,0.12)', border: '1px solid #9b7ec8', borderRadius: '7px', color: '#b9a1dd', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, padding: '0.7rem' }}>
              Adicionar colagem
            </button>
            {COLLAGE_AI_ACTIONS.slice(0, 2).map(action => (
              <button key={action.label} onClick={() => askAI(action.prompt)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '7px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.76rem', padding: '0.55rem', textAlign: 'left' }}>
                {action.label}
              </button>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            value={filter}
            onChange={event => setFilter(event.target.value)}
            placeholder="Filtrar por autor, tag, categoria, tema..."
            style={{ flex: 1, minWidth: '240px', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '7px', color: 'var(--text-primary)', padding: '0.55rem 0.75rem', fontFamily: 'inherit' }}
          />
          {(['lista', 'cards', 'canvas'] as CollageViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ background: viewMode === mode ? 'rgba(155,126,200,0.12)' : 'transparent', border: `1px solid ${viewMode === mode ? '#9b7ec8' : 'var(--border-subtle)'}`, color: viewMode === mode ? '#b9a1dd' : 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.76rem', fontWeight: 800, padding: '0.45rem 0.65rem', textTransform: 'capitalize' }}>
              {mode}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setFilter(`#${tag}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '5px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', padding: '0.22rem 0.45rem' }}>
                #{tag}
              </button>
            ))}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div style={{ border: '1px dashed var(--border-subtle)', borderRadius: '8px', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)' }}>
            <div style={{ fontSize: '1.35rem', color: '#9b7ec8', opacity: 0.55, marginBottom: '0.5rem' }}>▦</div>
            Nenhuma colagem encontrada. Comece salvando uma citação, insight ou resumo para {projectRef}.
          </div>
        ) : viewMode === 'canvas' ? (
          <div
            style={{ position: 'relative', minHeight: '620px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'radial-gradient(circle at 1px 1px, rgba(155,148,136,0.22) 1px, transparent 0)', backgroundSize: '22px 22px', overflow: 'hidden' }}
            onPointerMove={event => {
              const drag = dragRef.current
              if (!drag) return
              const rect = event.currentTarget.getBoundingClientRect()
              const nextItems = items.map(item => item.id === drag.id ? { ...item, x: event.clientX - rect.left - drag.offsetX, y: event.clientY - rect.top - drag.offsetY } : item)
              setItems(nextItems)
            }}
            onPointerUp={() => {
              if (!dragRef.current) return
              dragRef.current = null
              void save(items)
            }}
          >
            {filteredItems.map(item => (
              <article
                key={item.id}
                onPointerDown={event => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  dragRef.current = { id: item.id, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top }
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                style={{ position: 'absolute', left: item.x, top: item.y, width: '230px', cursor: 'grab', border: `1px solid ${colorFor(item.type)}`, background: 'var(--surface)', borderRadius: '8px', padding: '0.85rem', boxShadow: '0 16px 40px rgba(0,0,0,0.18)' }}
              >
                <CollageCard item={item} onRemove={removeItem} onAskAI={askAI} onOpenRead={setReadingItem} compact />
              </article>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'lista' ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {filteredItems.map(item => (
              <article key={item.id} style={{ border: `1px solid ${viewMode === 'cards' ? colorFor(item.type) : 'var(--border-subtle)'}`, background: 'var(--surface)', borderRadius: '8px', padding: '0.9rem' }}>
                <CollageCard item={item} onRemove={removeItem} onAskAI={askAI} onOpenRead={setReadingItem} />
              </article>
            ))}
          </div>
        )}

        <section style={{ marginTop: '1.3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.6rem' }}>
          {COLLAGE_AI_ACTIONS.slice(2).map(action => (
            <button key={action.label} onClick={() => askAI(action.prompt)} style={{ background: 'transparent', border: '1px solid #9b7ec8', borderRadius: '7px', color: '#b9a1dd', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 800, padding: '0.7rem 0.8rem', textAlign: 'left' }}>
              {action.label}
            </button>
          ))}
        </section>
      </div>

      {readingItem && (
        /* ── Overlay escuro ── */
        <div
          onClick={e => { if (e.target === e.currentTarget) setReadingItem(null) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(10,12,20,0.78)',
            backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          {/* ── Modal box ── */}
          <div style={{
            width: 'min(850px, 90vw)',
            maxHeight: '85vh',
            background: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 32px 96px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: '"Times New Roman", Times, serif',
          }}>

            {/* ── Barra superior ── */}
            <div
              id="hokma-reading-toolbar"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.2rem',
                padding: '0.5rem 0.9rem',
                background: '#f5f3ee',
                borderBottom: '1px solid #ddd8d0',
                flexShrink: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <span style={{
                fontSize: '0.78rem', color: '#444', fontWeight: 600,
                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginRight: '0.5rem',
              }}>
                {readingItem.title}
              </span>

              {/* Editar / Visualizar */}
              <button
                onClick={() => modalMode === 'read' ? openModalEdit() : setModalMode('read')}
                style={{
                  background: modalMode === 'edit' ? '#e8e4dc' : 'transparent',
                  border: 'none', cursor: 'pointer', color: '#444',
                  fontSize: '0.75rem', padding: '0.3rem 0.65rem',
                  borderRadius: '4px', fontFamily: 'inherit', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8e4dc'}
                onMouseLeave={e => e.currentTarget.style.background = modalMode === 'edit' ? '#e8e4dc' : 'transparent'}
              >
                {modalMode === 'read' ? 'Editar' : '← Visualizar'}
              </button>

              <div style={{ width: '1px', height: '13px', background: '#ddd', margin: '0 0.15rem' }} />

              <button
                onClick={handlePrint}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.75rem', padding: '0.3rem 0.55rem', borderRadius: '4px', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8e4dc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Imprimir</button>

              <button
                onClick={handlePrint}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.75rem', padding: '0.3rem 0.55rem', borderRadius: '4px', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8e4dc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >PDF</button>

              <div style={{ width: '1px', height: '13px', background: '#ddd', margin: '0 0.15rem' }} />

              <button
                onClick={() => setReadingItem(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1rem', padding: '0.2rem 0.45rem', borderRadius: '4px', lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8e4dc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Fechar (Esc)"
              >✕</button>
            </div>

            {/* ── Conteúdo com scroll ── */}
            <div style={{ flex: 1, overflowY: 'auto' }}>

              {/* ─── MODO LEITURA ─── */}
              {modalMode === 'read' && (
                <div style={{ padding: '2.5rem 3rem 3.5rem', fontFamily: '"Times New Roman", Times, serif' }}>

                  <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem', fontFamily: 'system-ui, sans-serif' }}>
                    {itemTypeLabel(readingItem.type)}{readingItem.category ? ` · ${readingItem.category}` : ''}
                  </div>

                  <h1 style={{ fontSize: '1.55rem', color: '#000', lineHeight: 1.3, margin: '0 0 1.5rem', fontWeight: 700, letterSpacing: 0 }}>
                    {readingItem.title}
                  </h1>

                  {(readingItem.author || readingItem.work || readingItem.page || readingItem.linkedTo) && (
                    <div style={{ marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e0ddd8', color: '#333', fontSize: '12pt', lineHeight: 1.6 }}>
                      {readingItem.author && <div style={{ fontWeight: 700, color: '#000' }}>{readingItem.author}</div>}
                      {readingItem.work && <div style={{ fontStyle: 'italic' }}>{readingItem.work}</div>}
                      {readingItem.page && <div style={{ color: '#555' }}>p. {readingItem.page}</div>}
                      {readingItem.linkedTo && (
                        <div style={{ marginTop: '0.3rem', color: '#888', fontSize: '0.78rem', fontFamily: 'system-ui, sans-serif' }}>
                          Vinculado a: {readingItem.linkedTo}
                        </div>
                      )}
                    </div>
                  )}

                  {readingItem.type === 'citacao' ? (
                    <blockquote style={{ margin: '0 0 2rem', padding: '1.1rem 1.5rem', borderLeft: '3px solid #ccc', background: '#faf9f6', color: '#000', fontSize: '12pt', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {readingItem.content.split('\n\n').map((para, i) => (
                        <p key={i} style={{ margin: i === 0 ? 0 : '1em 0 0' }}>
                          {para.split('\n').map((line, j) => <span key={j}>{j > 0 && <br />}{line}</span>)}
                        </p>
                      ))}
                    </blockquote>
                  ) : (
                    <div style={{ color: '#000', fontSize: '12pt', lineHeight: 1.6, marginBottom: '2rem' }}>
                      {readingItem.content.split('\n\n').map((para, i) => (
                        <p key={i} style={{ margin: i === 0 ? 0 : '1.1em 0 0', textIndent: i > 0 ? '1.5em' : 0 }}>
                          {para.split('\n').map((line, j) => <span key={j}>{j > 0 && <br />}{line}</span>)}
                        </p>
                      ))}
                    </div>
                  )}

                  {readingItem.tags.length > 0 && (
                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e0ddd8' }}>
                      <div style={{ fontSize: '0.63rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem', fontFamily: 'system-ui, sans-serif' }}>
                        Palavras-chave
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#555', fontFamily: 'system-ui, sans-serif', lineHeight: 1.8 }}>
                        {readingItem.tags.join('  ·  ')}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #e0ddd8', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', fontFamily: 'system-ui, sans-serif' }}>
                    <button
                      onClick={() => { askAI('Relacione esta colagem com a passagem atual, indicando conexões exegéticas, teológicas e homiléticas.', readingItem); setReadingItem(null) }}
                      style={{ background: 'transparent', border: `1px solid ${colorFor(readingItem.type)}`, color: colorFor(readingItem.type), borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', fontWeight: 700, padding: '0.38rem 0.8rem' }}
                    >
                      Relacionar com IA
                    </button>
                    <button
                      onClick={() => { askAI('Sugira tags, categoria, vínculos e possíveis agrupamentos para esta colagem.', readingItem); setReadingItem(null) }}
                      style={{ background: 'transparent', border: '1px solid #ccc', color: '#666', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.38rem 0.8rem' }}
                    >
                      Organizar
                    </button>
                  </div>
                </div>
              )}

              {/* ─── MODO EDIÇÃO ─── */}
              {modalMode === 'edit' && modalDraft && (
                <div style={{ padding: '1.75rem 2rem 2.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>

                    {/* Tipo + Título */}
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.65rem' }}>
                      <select
                        value={modalDraft.type}
                        onChange={e => setModalDraft(prev => prev ? { ...prev, type: e.target.value as CollageType } : prev)}
                        style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.5rem', fontFamily: 'inherit', fontSize: '0.88rem' }}
                      >
                        {COLLAGE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                      <input
                        value={modalDraft.title}
                        onChange={e => setModalDraft(prev => prev ? { ...prev, title: e.target.value } : prev)}
                        placeholder="Título"
                        style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.5rem 0.7rem', fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#9b7ec8'}
                        onBlur={e => e.target.style.borderColor = '#ddd'}
                      />
                    </div>

                    {/* Conteúdo */}
                    <textarea
                      value={modalDraft.content}
                      onChange={e => setModalDraft(prev => prev ? { ...prev, content: e.target.value } : prev)}
                      placeholder="Conteúdo da colagem..."
                      rows={8}
                      style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.7rem', resize: 'vertical', fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', lineHeight: 1.6, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = '#9b7ec8'}
                      onBlur={e => e.target.style.borderColor = '#ddd'}
                    />

                    {/* Autor, Obra, Página */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '0.55rem' }}>
                      {[
                        { key: 'author' as const, placeholder: 'Autor' },
                        { key: 'work' as const, placeholder: 'Obra / fonte' },
                        { key: 'page' as const, placeholder: 'p.' },
                      ].map(f => (
                        <input
                          key={f.key}
                          value={modalDraft[f.key]}
                          onChange={e => setModalDraft(prev => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                          placeholder={f.placeholder}
                          style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.45rem 0.65rem', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#9b7ec8'}
                          onBlur={e => e.target.style.borderColor = '#ddd'}
                        />
                      ))}
                    </div>

                    {/* Tags, Categoria, Vínculo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 160px', gap: '0.55rem' }}>
                      <input
                        value={modalDraft.tags}
                        onChange={e => setModalDraft(prev => prev ? { ...prev, tags: e.target.value } : prev)}
                        placeholder="tags: aliança, presença..."
                        style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.45rem 0.65rem', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#9b7ec8'}
                        onBlur={e => e.target.style.borderColor = '#ddd'}
                      />
                      <select
                        value={modalDraft.category}
                        onChange={e => setModalDraft(prev => prev ? { ...prev, category: e.target.value } : prev)}
                        style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.45rem', fontFamily: 'inherit', fontSize: '0.85rem' }}
                      >
                        {COLLAGE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <select
                        value={modalDraft.linkedTo}
                        onChange={e => setModalDraft(prev => prev ? { ...prev, linkedTo: e.target.value } : prev)}
                        style={{ background: '#f8f7f4', border: '1px solid #ddd', borderRadius: '5px', color: '#333', padding: '0.45rem', fontFamily: 'inherit', fontSize: '0.85rem' }}
                      >
                        <option>{projectRef}</option>
                        {COLLAGE_LINK_TARGETS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Botões */}
                    <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.35rem' }}>
                      <button
                        onClick={saveModalEdit}
                        style={{ background: '#9b7ec8', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, padding: '0.5rem 1.1rem' }}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setModalMode('read')}
                        style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', color: '#666', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CollageCard({ item, onRemove, onAskAI, onOpenRead, compact = false }: {
  item: CollageItem
  onRemove: (id: string) => void
  onAskAI: (prompt: string, item?: CollageItem) => void
  onOpenRead: (item: CollageItem) => void
  compact?: boolean
}) {
  const color = colorFor(item.type)
  const [hoverText, setHoverText] = useState(false)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.55rem' }}>
        <span style={{ fontSize: '0.62rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, flexShrink: 0 }}>
          {itemTypeLabel(item.type)}
        </span>
        <button
          onClick={() => onOpenRead(item)}
          title="Modo leitura"
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--border)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, lineHeight: 1, padding: '0 0.25rem' }}
          onMouseEnter={e => e.currentTarget.style.color = color}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
        >⤢</button>
        <button onClick={() => onRemove(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--border)', cursor: 'pointer', fontSize: '0.95rem', lineHeight: 1 }}>
          ×
        </button>
      </div>
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: compact ? '0.88rem' : '1rem', lineHeight: 1.35, letterSpacing: 0 }}>
        {item.title}
      </h3>
      <p
        onClick={() => onOpenRead(item)}
        onMouseEnter={() => setHoverText(true)}
        onMouseLeave={() => setHoverText(false)}
        style={{
          margin: '0.45rem 0 0',
          color: hoverText ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontFamily: 'var(--font-serif)',
          fontSize: compact ? '0.8rem' : '0.9rem',
          lineHeight: 1.65,
          display: '-webkit-box',
          WebkitLineClamp: compact ? 4 : 7,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'color 0.12s',
        }}
      >
        {item.content}
      </p>
      {(item.author || item.work || item.page) && (
        <div style={{ marginTop: '0.6rem', color: 'var(--text-muted)', fontSize: '0.72rem', lineHeight: 1.45 }}>
          {[item.author, item.work, item.page && `p. ${item.page}`].filter(Boolean).join(' · ')}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
        <span style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '5px', color: 'var(--text-muted)', fontSize: '0.68rem', padding: '0.15rem 0.38rem' }}>
          {item.category}
        </span>
        {item.tags.map(tag => (
          <span key={tag} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: '5px', color: 'var(--text-muted)', fontSize: '0.68rem', padding: '0.15rem 0.38rem' }}>
            #{tag}
          </span>
        ))}
      </div>
      {!compact && (
        <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => onAskAI('Relacione esta colagem com a passagem atual, indicando conexões exegéticas, teológicas e homiléticas.', item)} style={{ background: 'transparent', border: `1px solid ${color}`, color, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 800, padding: '0.32rem 0.55rem' }}>
            Relacionar
          </button>
          <button onClick={() => onAskAI('Sugira tags, categoria, vínculos e possíveis agrupamentos para esta colagem.', item)} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.72rem', padding: '0.32rem 0.55rem' }}>
            Organizar
          </button>
        </div>
      )}
    </div>
  )
}
