'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import RichEditor from '@/components/RichEditorLazy'
import type { AIContext } from '@/components/RichEditor'
import HelpIcon from '@/components/help/HelpIcon'

// ── Types ─────────────────────────────────────────────────────────────────────

type BlockType = 'secao' | 'versiculo' | 'livre'

interface CommentBlock {
  id: string
  type: BlockType
  title: string
  ref: string
  html: string
}

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  inline?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function defaultTitle(type: BlockType): string {
  if (type === 'secao')     return 'I. TÍTULO DA SEÇÃO (v. )'
  if (type === 'versiculo') return 'v. 1 — '
  return 'Nota livre'
}

const TYPE_LABEL: Record<BlockType, string>  = { secao: 'Seção', versiculo: 'Versículo', livre: 'Livre' }
const TYPE_COLOR: Record<BlockType, string>  = { secao: '#163A6B', versiculo: '#0F766E', livre: '#6B7280' }
const TYPE_BG:    Record<BlockType, string>  = { secao: '#EEF3FA', versiculo: '#F0FDFA', livre: '#F8FAFC' }

function loadBlocks(section: Section | undefined): CommentBlock[] {
  if (!section) return []
  const content = section.content as { cards?: Record<string, string>; comentario_blocks?: CommentBlock[] } | null
  if (content?.comentario_blocks && Array.isArray(content.comentario_blocks) && content.comentario_blocks.length > 0) {
    return content.comentario_blocks
  }
  // Auto-migrate legacy single-field content
  const legacy = content?.cards?.['comentario_exegetico']?.trim()
  if (legacy) {
    return [{ id: genId(), type: 'livre', title: 'Comentário Geral', ref: '', html: legacy }]
  }
  return []
}

// ── Block component ───────────────────────────────────────────────────────────

interface BlockCardProps {
  block: CommentBlock
  index: number
  total: number
  isEditing: boolean
  isViewing: boolean
  isDragOver: boolean
  onChangeTitle:   (val: string) => void
  onChangeRef:     (val: string) => void
  onChangeType:    (type: BlockType) => void
  onChangeHtml:    (html: string) => void
  onToggleEdit:    () => void
  onToggleView:    () => void
  onMoveUp:        () => void
  onMoveDown:      () => void
  onDuplicate:     () => void
  onRemove:        () => void
  onDragStart:     (e: React.DragEvent) => void
  onDragOver:      (e: React.DragEvent) => void
  onDrop:          (e: React.DragEvent) => void
  onDragEnd:       () => void
  color: string
  aiContext: AIContext
}

function BlockCard({
  block, index, total, isEditing, isViewing, isDragOver,
  onChangeTitle, onChangeRef, onChangeType, onChangeHtml,
  onToggleEdit, onToggleView, onMoveUp, onMoveDown, onDuplicate, onRemove,
  onDragStart, onDragOver, onDrop, onDragEnd,
  color, aiContext,
}: BlockCardProps) {
  const [typesOpen, setTypesOpen] = useState(false)

  const btnBase: React.CSSProperties = {
    padding: '0.22rem 0.5rem', fontSize: '0.68rem', borderRadius: '5px',
    border: '1px solid var(--border,#e5e7eb)', background: 'transparent',
    color: 'var(--text-secondary,#64748b)', cursor: 'pointer',
  }
  const iconBtn: React.CSSProperties = {
    width: '24px', height: '24px', borderRadius: '5px', border: '1px solid var(--border,#e5e7eb)',
    background: 'transparent', color: 'var(--text-secondary,#64748b)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
    flexShrink: 0,
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        border: isDragOver ? `2px dashed ${color}` : '1px solid var(--border,#e5e7eb)',
        borderRadius: '8px',
        background: 'var(--bg-primary,#fff)',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}>

      {/* ── Block header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.75rem', background: `${TYPE_BG[block.type]}`, borderBottom: '1px solid var(--border,#e5e7eb)' }}>

        {/* Drag handle */}
        <span style={{ color: 'var(--text-secondary,#9ca3af)', cursor: 'grab', fontSize: '0.8rem', flexShrink: 0, lineHeight: 1 }}>⠿</span>

        {/* Type badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setTypesOpen(p => !p)}
            style={{ padding: '0.15rem 0.45rem', fontSize: '0.62rem', fontWeight: 700, background: TYPE_COLOR[block.type], color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.03em' }}>
            {TYPE_LABEL[block.type]} ▾
          </button>
          {typesOpen && (
            <div
              onMouseLeave={() => setTypesOpen(false)}
              style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'var(--bg-primary,#fff)', border: '1px solid var(--border,#e5e7eb)', borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '100px', overflow: 'hidden' }}>
              {(['secao', 'versiculo', 'livre'] as BlockType[]).map(t => (
                <button
                  key={t}
                  onClick={() => { onChangeType(t); setTypesOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.35rem 0.7rem', fontSize: '0.72rem', border: 'none', background: block.type === t ? `${TYPE_COLOR[t]}14` : 'transparent', color: block.type === t ? TYPE_COLOR[t] : 'var(--text-primary,#1e293b)', cursor: 'pointer', fontWeight: block.type === t ? 700 : 400 }}>
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <input
          value={block.title}
          onChange={e => onChangeTitle(e.target.value)}
          placeholder="Título do bloco…"
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary,#1e293b)', outline: 'none', minWidth: 0 }}
        />

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button onClick={onMoveUp}   disabled={index === 0}       title="Mover para cima"   style={{ ...iconBtn, opacity: index === 0 ? 0.35 : 1 }}>↑</button>
          <button onClick={onMoveDown} disabled={index === total - 1} title="Mover para baixo" style={{ ...iconBtn, opacity: index === total - 1 ? 0.35 : 1 }}>↓</button>
          <button onClick={onDuplicate} title="Duplicar" style={iconBtn}>⧉</button>
          <button onClick={onToggleView} title={isViewing ? 'Fechar visualização' : 'Visualizar'} style={{ ...iconBtn, background: isViewing ? '#F0FDF4' : 'transparent', color: isViewing ? '#059669' : 'var(--text-secondary,#64748b)' }}>👁</button>
          <button onClick={onRemove} title="Remover bloco" style={{ ...iconBtn, borderColor: '#FECACA', color: '#DC2626' }}>🗑</button>
        </div>
      </div>

      {/* ── Ref row (secao / versiculo) ── */}
      {(block.type === 'secao' || block.type === 'versiculo') && (
        <div style={{ padding: '0.3rem 0.75rem', borderBottom: '1px solid var(--border,#e5e7eb)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary,#64748b)', flexShrink: 0 }}>Referência:</span>
          <input
            value={block.ref}
            onChange={e => onChangeRef(e.target.value)}
            placeholder={block.type === 'secao' ? 'Ex: v. 1–6' : 'Ex: v. 1'}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text-primary,#1e293b)', outline: 'none' }}
          />
        </div>
      )}

      {/* ── Body ── */}
      {isViewing ? (
        <div
          className="prose-reading"
          style={{ padding: '0.75rem 1rem', fontSize: '0.87rem', lineHeight: 1.78, color: 'var(--text-primary,#1e293b)', minHeight: '60px' }}
          dangerouslySetInnerHTML={{ __html: block.html || '<p style="color:#9ca3af;font-style:italic">Sem conteúdo.</p>' }}
        />
      ) : (
        <div style={{ padding: '0.5rem 0.75rem' }}>
          <RichEditor
            value={block.html}
            onChange={onChangeHtml}
            placeholder="Escreva o comentário exegético deste bloco…"
            moduleColor={TYPE_COLOR[block.type]}
            minHeight={140}
            sticky
            aiContext={{ ...aiContext, fieldLabel: block.title }}
          />
        </div>
      )}

      {/* ── Footer status dot ── */}
      <div style={{ padding: '0.2rem 0.75rem 0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: block.html.trim() ? (block.html.trim().length < 80 ? 'var(--accent,#3B82F6)' : 'var(--success,#22C55E)') : 'var(--border,#CBD5E1)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary,#9ca3af)' }}>
          {block.html.trim() ? `${block.html.replace(/<[^>]+>/g, '').trim().length} caracteres` : 'Vazio'}
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ComentarioExegeticoWorkspace({ project, userId, existingSection, onUpdate, onAskAI, inline = false }: Props) {
  const supabase = createClient()
  const [blocks, setBlocks]   = useState<CommentBlock[]>(() => loadBlocks(existingSection))
  const [saving, setSaving]   = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set())
  const [viewingIds, setViewingIds] = useState<Set<string>>(new Set())
  const [dragIdx,  setDragIdx]  = useState<number | null>(null)
  const [overIdx,  setOverIdx]  = useState<number | null>(null)

  const latestBlocks = useRef<CommentBlock[]>(blocks)
  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sectionRef   = useRef<Section | undefined>(existingSection)

  useEffect(() => { sectionRef.current = existingSection }, [existingSection])

  // ── Save ──────────────────────────────────────────────────────────────────

  const performSave = useCallback(async (bs: CommentBlock[]) => {
    setSaving(true)
    const hasContent = bs.some(b => b.html.trim())
    const payload = {
      project_id: project.id,
      user_id:    userId,
      slug:       'comentario_exegetico',
      module:     'inventio',
      title:      '2.7 Comentário Exegético',
      content:    { cards: { comentario_exegetico: '' }, comentario_blocks: bs },
      status:     (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    const sec = sectionRef.current
    if (sec?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', sec.id).select().single()
      if (data) { onUpdate(data as Section); sectionRef.current = data as Section }
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { onUpdate(data as Section); sectionRef.current = data as Section }
    }
    setSaving(false)
    setSavedAt(new Date())
  }, [project.id, userId, supabase, onUpdate])

  function scheduleAutosave(bs: CommentBlock[]) {
    latestBlocks.current = bs
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(latestBlocks.current), 1500)
  }

  function updateBlocks(bs: CommentBlock[]) {
    setBlocks(bs)
    scheduleAutosave(bs)
  }

  // ── Block CRUD ────────────────────────────────────────────────────────────

  function addBlock(type: BlockType) {
    const nb: CommentBlock = { id: genId(), type, title: defaultTitle(type), ref: '', html: '' }
    const next = [...latestBlocks.current, nb]
    setBlocks(next)
    scheduleAutosave(next)
    setEditingIds(prev => new Set([...prev, nb.id]))
    setAddOpen(false)
  }

  function updateBlock(id: string, patch: Partial<CommentBlock>) {
    const next = latestBlocks.current.map(b => b.id === id ? { ...b, ...patch } : b)
    updateBlocks(next)
  }

  function removeBlock(id: string) {
    if (!confirm('Remover este bloco?')) return
    const next = latestBlocks.current.filter(b => b.id !== id)
    updateBlocks(next)
    setEditingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    setViewingIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  function duplicateBlock(id: string) {
    const src = latestBlocks.current.find(b => b.id === id)
    if (!src) return
    const idx  = latestBlocks.current.findIndex(b => b.id === id)
    const copy: CommentBlock = { ...src, id: genId(), title: `${src.title} (cópia)` }
    const next = [...latestBlocks.current]
    next.splice(idx + 1, 0, copy)
    updateBlocks(next)
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const arr  = [...latestBlocks.current]
    const idx  = arr.findIndex(b => b.id === id)
    const next = idx + dir
    if (next < 0 || next >= arr.length) return
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    updateBlocks(arr)
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, idx: number) {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIdx(idx)
  }

  function handleDrop(e: React.DragEvent, idx: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return }
    const arr = [...latestBlocks.current]
    const [item] = arr.splice(dragIdx, 1)
    arr.splice(idx, 0, item)
    updateBlocks(arr)
    setDragIdx(null)
    setOverIdx(null)
  }

  function handleDragEnd() { setDragIdx(null); setOverIdx(null) }

  // ── Render ────────────────────────────────────────────────────────────────

  const color = '#163A6B'

  const baseAiContext: Omit<AIContext, 'fieldLabel'> = {
    project: {
      id: project.id,
      book: project.book,
      passage_ref: project.passage_ref,
      testament: project.testament,
      original_language: project.original_language,
      study_mode: project.study_mode ?? undefined,
    },
    phase: 'investigar',
    phaseLabel: 'Investigar',
    section: 'comentario_exegetico',
    sectionLabel: '2.7 Comentário Exegético',
    userId,
  }

  return (
    <div style={{ padding: inline ? '0' : '2rem clamp(1rem,3vw,2rem) 5rem', maxWidth: inline ? undefined : '720px', margin: inline ? undefined : '0 auto' }}>

      {/* ── Document header (não-inline) ── */}
      {!inline && (
        <div style={{ paddingBottom: '2.5rem' }}>
          <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: color, marginBottom: '1.1rem' }} />
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)', letterSpacing: '-0.045em', lineHeight: 1.0 }}>
            {project.title}
          </h1>
          <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted,#64748b)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Investigar</span>
            {project.bible_version && (
              <><span style={{ opacity: 0.4, fontSize: '0.7rem' }}>·</span><span>{project.bible_version}</span></>
            )}
            {project.original_language && (
              <><span style={{ opacity: 0.4, fontSize: '0.7rem' }}>·</span><span>{project.original_language}</span></>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: saving ? 'var(--ai)' : savedAt ? 'var(--success)' : 'transparent', transition: 'color 0.3s' }}>
              {saving ? 'salvando…' : savedAt ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : '·'}
            </span>
          </p>
          <div style={{ margin: '1.75rem 0 0', height: '1px', background: 'var(--border-subtle,#e2e8f0)' }} />
        </div>
      )}

      {/* Header — chapter title + add button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        {!inline && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary,#1e293b)' }}>
              Comentário Exegético
            </h2>
            <HelpIcon cardId="comentario_exegetico" onAskAI={onAskAI} />
          </div>
        )}
        {inline && (
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary,#64748b)' }}>
            {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
            {saving ? ' · Salvando…' : savedAt ? ` · Salvo` : ''}
          </div>
        )}

        {/* Add button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setAddOpen(p => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.38rem 0.85rem', fontSize: '0.78rem', fontWeight: 600, background: color, color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer' }}>
            + Adicionar bloco
          </button>
          {addOpen && (
            <div
              onMouseLeave={() => setAddOpen(false)}
              style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: 'var(--bg-primary,#fff)', border: '1px solid var(--border,#e5e7eb)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', zIndex: 100, minWidth: '200px', overflow: 'hidden' }}>
              {([
                { type: 'secao'     as BlockType, label: 'Bloco por seção',     desc: 'I. TÍTULO (v. 1–6)' },
                { type: 'versiculo' as BlockType, label: 'Bloco por versículo', desc: 'v. 1 — comentário' },
                { type: 'livre'     as BlockType, label: 'Bloco livre',         desc: 'Título editável' },
              ]).map(opt => (
                <button
                  key={opt.type}
                  onClick={() => addBlock(opt.type)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.55rem 0.9rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: TYPE_COLOR[opt.type] }}>{opt.label}</div>
                  <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary,#9ca3af)', marginTop: '0.1rem' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block list */}
      {blocks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: inline ? '1rem' : '3.5rem 1rem', border: '2px dashed var(--border,#e5e7eb)', borderRadius: '10px', color: 'var(--text-secondary,#9ca3af)' }}>
          {!inline && <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>}
          <div style={{ fontSize: inline ? '0.72rem' : '0.83rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nenhum bloco criado</div>
          {!inline && <div style={{ fontSize: '0.75rem' }}>Clique em &ldquo;+ Adicionar bloco&rdquo; para começar o comentário exegético.</div>}
        </div>
      ) : (
        blocks.map((block, idx) => (
          <BlockCard
            key={block.id}
            block={block}
            index={idx}
            total={blocks.length}
            isEditing={editingIds.has(block.id)}
            isViewing={viewingIds.has(block.id)}
            isDragOver={overIdx === idx && dragIdx !== idx}
            color={color}
            aiContext={{ ...baseAiContext, fieldLabel: block.title }}
            onChangeTitle={val  => updateBlock(block.id, { title: val })}
            onChangeRef={val    => updateBlock(block.id, { ref: val })}
            onChangeType={type  => updateBlock(block.id, { type })}
            onChangeHtml={html  => updateBlock(block.id, { html })}
            onToggleEdit={() => setEditingIds(prev => { const s = new Set(prev); s.has(block.id) ? s.delete(block.id) : s.add(block.id); return s })}
            onToggleView={() => setViewingIds(prev => { const s = new Set(prev); s.has(block.id) ? s.delete(block.id) : s.add(block.id); return s })}
            onMoveUp={()      => moveBlock(block.id, -1)}
            onMoveDown={()    => moveBlock(block.id,  1)}
            onDuplicate={()   => duplicateBlock(block.id)}
            onRemove={()      => removeBlock(block.id)}
            onDragStart={e    => handleDragStart(e, idx)}
            onDragOver={e     => handleDragOver(e, idx)}
            onDrop={e         => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
          />
        ))
      )}
    </div>
  )
}
