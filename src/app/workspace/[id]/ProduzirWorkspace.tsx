'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section, Production } from '@/types/database'
import RichEditor, { type AIContext } from '@/components/RichEditor'

// ── Types ─────────────────────────────────────────────────────────────────────

type ProduzirMode = 'livre' | 'modular_montado' | 'modular_livre' | null

interface ProduzirBloco {
  id: string
  title: string
  html: string
}

interface ProduzirContent {
  produzir_mode: ProduzirMode
  livre: { title: string; html: string }
  blocos_montado: ProduzirBloco[]
  blocos_livre:   ProduzirBloco[]
}

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  // production mode
  production?: Production
  onUpdateProduction?: (p: Production) => void
  onBackToLibrary?: () => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_MONTADO_BLOCOS: Omit<ProduzirBloco, 'id'>[] = [
  { title: 'Introdução',        html: '' },
  { title: 'Contextualização',  html: '' },
  { title: 'Transição',         html: '' },
  { title: 'Desenvolvimento',   html: '' },
  { title: 'Ilustração',        html: '' },
  { title: 'Aplicação',         html: '' },
  { title: 'Conclusão',         html: '' },
]

const PRODUZIR_COLOR = '#7C3AED'

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function loadContent(section: Section | undefined, production?: Production): ProduzirContent {
  const raw = (production?.content ?? section?.content) as Record<string, unknown> | null
  const storedMode = raw?.produzir_mode as ProduzirMode | null | undefined

  if (storedMode) {
    return {
      produzir_mode:  storedMode,
      livre:          (raw!.livre as { title: string; html: string }) ?? { title: '', html: '' },
      blocos_montado: (raw!.blocos_montado as ProduzirBloco[]) ?? (raw!.blocos as ProduzirBloco[]) ?? [],
      blocos_livre:   (raw!.blocos_livre   as ProduzirBloco[]) ?? [],
    }
  }

  // production presente → nunca mostrar o Hub; default 'livre' para produções sem modo gravado
  if (production) {
    return {
      produzir_mode:  'livre',
      livre:          (raw?.livre as { title: string; html: string }) ?? { title: '', html: '' },
      blocos_montado: (raw?.blocos_montado as ProduzirBloco[]) ?? [],
      blocos_livre:   (raw?.blocos_livre   as ProduzirBloco[]) ?? [],
    }
  }

  return { produzir_mode: null, livre: { title: '', html: '' }, blocos_montado: [], blocos_livre: [] }
}

// ── Hub — 3 cards ─────────────────────────────────────────────────────────────

function Hub({ onSelect, productionTitle, onBack }: { onSelect: (mode: ProduzirMode) => void; productionTitle?: string; onBack?: () => void }) {
  const cards = [
    {
      mode: 'livre'           as ProduzirMode,
      title: 'Produção Livre',
      desc:  'Para escrever livremente sermões, estudos, aulas, devocionais, artigos ou qualquer conteúdo.',
      icon:  '✍',
    },
    {
      mode: 'modular_montado' as ProduzirMode,
      title: 'Modular Montado',
      desc:  'Para produzir a mensagem a partir de uma estrutura padrão já organizada.',
      icon:  '⊞',
    },
    {
      mode: 'modular_livre'   as ProduzirMode,
      title: 'Modular Livre',
      desc:  'Para montar uma estrutura própria do zero, adicionando módulos conforme necessário.',
      icon:  '⬡',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 1.5rem' }}>
      {onBack && (
        <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary,#64748b)', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'inherit', marginBottom: '1.5rem' }}>
          ← Voltar à Biblioteca
        </button>
      )}
      <div style={{ marginBottom: '0.4rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)', letterSpacing: '-0.01em' }}>
        {productionTitle ?? 'Produzir'}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#64748b)', marginBottom: '2.2rem' }}>
        Selecione o modo de produção
      </div>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '820px', width: '100%' }}>
        {cards.map(c => (
          <button
            key={c.mode!}
            onClick={() => onSelect(c.mode)}
            style={{
              flex: '1 1 220px', maxWidth: '260px',
              padding: '1.5rem 1.2rem', textAlign: 'left',
              background: 'var(--surface,#fff)', border: `1.5px solid var(--border,#e5e7eb)`,
              borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = PRODUZIR_COLOR
              e.currentTarget.style.boxShadow   = `0 2px 12px ${PRODUZIR_COLOR}22`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border,#e5e7eb)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
            <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)' }}>{c.title}</div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary,#64748b)', lineHeight: 1.55 }}>{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Produção Livre ────────────────────────────────────────────────────────────

interface ProduzirLivreProps {
  project: Project
  userId: string
  data: { title: string; html: string }
  saving: boolean
  savedAt: Date | null
  onChange: (data: { title: string; html: string }) => void
  onBack: () => void
}

function ProduzirLivre({ project, userId, data, saving, savedAt, onChange, onBack }: ProduzirLivreProps) {
  const aiCtx: AIContext = {
    project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode ?? undefined },
    phase: 'comunicar', phaseLabel: 'Produzir',
    section: 'pregar_visao_geral', sectionLabel: 'Produção Livre',
    field: 'livre', fieldLabel: data.title || 'Produção Livre',
    userId,
  }

  return (
    <div style={{ padding: '1.25rem 1.5rem 2.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary,#64748b)', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          ← Voltar
        </button>
        <div style={{ flex: 1, fontSize: '0.87rem', fontWeight: 700, color: PRODUZIR_COLOR }}>Produção Livre</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary,#64748b)' }}>
          {saving ? 'Salvando…' : savedAt ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </div>
      </div>

      {/* Title */}
      <input
        value={data.title}
        onChange={e => onChange({ ...data, title: e.target.value })}
        placeholder="Título…"
        style={{ width: '100%', border: 'none', borderBottom: `2px solid ${PRODUZIR_COLOR}30`, background: 'transparent', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary,#1e293b)', padding: '0.3rem 0', marginBottom: '1rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />

      {/* Editor */}
      <RichEditor
        value={data.html}
        onChange={html => onChange({ ...data, html })}
        placeholder="Escreva livremente…"
        moduleColor={PRODUZIR_COLOR}
        minHeight={400}
        aiContext={aiCtx}
      />
    </div>
  )
}

// ── Insert-between button ─────────────────────────────────────────────────────

function InsertBetween({ onInsert }: { onInsert: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', height: '18px', display: 'flex', alignItems: 'center', marginBottom: '0.4rem', cursor: 'default' }}>
      <div style={{ flex: 1, height: '1px', background: hover ? `${PRODUZIR_COLOR}40` : 'transparent', transition: 'background 0.15s' }} />
      {hover && (
        <button
          onClick={onInsert}
          style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', padding: '0.12rem 0.55rem', fontSize: '0.68rem', fontWeight: 600, background: PRODUZIR_COLOR, color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
          + inserir aqui
        </button>
      )}
    </div>
  )
}

// ── Modular (Montado / Livre) ─────────────────────────────────────────────────

interface ProduzirModularProps {
  project: Project
  userId: string
  blocos: ProduzirBloco[]
  mode: 'modular_montado' | 'modular_livre'
  saving: boolean
  savedAt: Date | null
  onChangeBlocos: (blocos: ProduzirBloco[]) => void
  onBack: () => void
}

function ProduzirModular({ project, userId, blocos, mode, saving, savedAt, onChangeBlocos, onBack }: ProduzirModularProps) {
  const [viewingIds, setViewingIds] = useState<Set<string>>(new Set())
  const [dragIdx,    setDragIdx]    = useState<number | null>(null)
  const [overIdx,    setOverIdx]    = useState<number | null>(null)
  const [viewAll,    setViewAll]    = useState(false)
  const [toast,      setToast]      = useState<string | null>(null)
  const [addBusy,     setAddBusy]     = useState(false)
  const [insertedId,  setInsertedId]  = useState<string | null>(null)
  const blocoRefs   = useRef<Record<string, HTMLDivElement | null>>({})
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const modeLabel = mode === 'modular_montado' ? 'Modular Montado' : 'Modular Livre'

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  // Insere após o índice `afterIdx` (−1 = no início, blocos.length−1 = no final)
  function addBlocoAt(afterIdx: number) {
    const title = 'Novo módulo'
    const newId = genId()
    const next  = [...blocos]
    next.splice(afterIdx + 1, 0, { id: newId, title, html: '' })
    setAddBusy(true)
    setInsertedId(newId)
    onChangeBlocos(next)
    showToast(`Módulo "${title}" adicionado`)
    setTimeout(() => {
      setAddBusy(false)
      blocoRefs.current[newId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => setInsertedId(null), 1500)
    }, 100)
  }

  // Mantém compatibilidade — adicionar ao final
  function addBloco() { addBlocoAt(blocos.length - 1) }

  function updateBloco(id: string, patch: Partial<ProduzirBloco>) {
    onChangeBlocos(blocos.map(b => b.id === id ? { ...b, ...patch } : b))
  }

  function removeBloco(id: string) {
    if (!confirm('Remover este módulo?')) return
    onChangeBlocos(blocos.filter(b => b.id !== id))
  }

  function duplicateBloco(id: string) {
    const src = blocos.find(b => b.id === id)
    if (!src) return
    const idx  = blocos.findIndex(b => b.id === id)
    const copy = { ...src, id: genId(), title: `${src.title} (cópia)` }
    const next = [...blocos]
    next.splice(idx + 1, 0, copy)
    onChangeBlocos(next)
  }

  function moveBloco(id: string, dir: -1 | 1) {
    const arr  = [...blocos]
    const idx  = arr.findIndex(b => b.id === id)
    const next = idx + dir
    if (next < 0 || next >= arr.length) return
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    onChangeBlocos(arr)
  }

  const iconBtn: React.CSSProperties = {
    width: '24px', height: '24px', borderRadius: '5px',
    border: '1px solid var(--border,#e5e7eb)', background: 'transparent',
    color: 'var(--text-secondary,#64748b)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', flexShrink: 0,
  }

  return (
    <div style={{ padding: '1.25rem 1.5rem 2.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary,#64748b)', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'inherit' }}>
          ← Voltar
        </button>
        <div style={{ flex: 1, fontSize: '0.87rem', fontWeight: 700, color: PRODUZIR_COLOR }}>{modeLabel}</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary,#64748b)' }}>
          {saving ? 'Salvando…' : savedAt ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
        </div>
        <button
          onClick={() => setViewAll(v => !v)}
          style={{ padding: '0.28rem 0.65rem', fontSize: '0.72rem', background: viewAll ? `${PRODUZIR_COLOR}15` : 'transparent', color: viewAll ? PRODUZIR_COLOR : 'var(--text-secondary,#64748b)', border: `1px solid ${viewAll ? PRODUZIR_COLOR : 'var(--border,#e5e7eb)'}`, borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }}>
          👁 Visualizar completo
        </button>
        <button
          onClick={addBloco}
          disabled={addBusy}
          style={{ padding: '0.28rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, background: addBusy ? `${PRODUZIR_COLOR}99` : PRODUZIR_COLOR, color: '#fff', border: 'none', borderRadius: '6px', cursor: addBusy ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', transform: addBusy ? 'scale(0.97)' : 'scale(1)' }}>
          {addBusy ? '+ Adicionando…' : '+ Adicionar módulo'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Full view */}
      {viewAll && (
        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', border: `1px solid ${PRODUZIR_COLOR}30`, borderRadius: '10px', background: `${PRODUZIR_COLOR}05` }}>
          {blocos.map((b, i) => (
            <div key={b.id} style={{ marginBottom: i < blocos.length - 1 ? '1.8rem' : 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: PRODUZIR_COLOR, marginBottom: '0.5rem', paddingBottom: '0.3rem', borderBottom: `1px solid ${PRODUZIR_COLOR}20` }}>{b.title}</div>
              {b.html ? (
                <div className="prose-reading" style={{ fontSize: '0.87rem', lineHeight: 1.78, color: 'var(--text-primary,#1e293b)' }} dangerouslySetInnerHTML={{ __html: b.html }} />
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>Vazio</div>
              )}
            </div>
          ))}
          {blocos.length === 0 && <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af' }}>Nenhum módulo criado.</div>}
        </div>
      )}

      {/* Empty state */}
      {blocos.length === 0 && !viewAll && (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', border: '2px dashed var(--border,#e5e7eb)', borderRadius: '10px', color: 'var(--text-secondary,#9ca3af)', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>⬡</div>
          <div style={{ fontSize: '0.83rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nenhum módulo criado</div>
          <div style={{ fontSize: '0.75rem' }}>Clique em &ldquo;+ Adicionar módulo&rdquo; para começar.</div>
        </div>
      )}

      {/* Blocos */}
      {blocos.map((bloco, idx) => {
        const isViewing = viewingIds.has(bloco.id)
        const isDragOver = overIdx === idx && dragIdx !== idx
        const aiCtx: AIContext = {
          project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode ?? undefined },
          phase: 'comunicar', phaseLabel: 'Produzir',
          section: 'pregar_visao_geral', sectionLabel: modeLabel,
          field: bloco.id, fieldLabel: bloco.title,
          userId,
        }

        const isNew = bloco.id === insertedId

        return (
          <div key={bloco.id}>
          <div
            ref={el => { blocoRefs.current[bloco.id] = el }}
            draggable
            onDragStart={e => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move' }}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverIdx(idx) }}
            onDrop={e => {
              e.preventDefault()
              if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return }
              const arr = [...blocos]
              const [item] = arr.splice(dragIdx, 1)
              arr.splice(idx, 0, item)
              onChangeBlocos(arr)
              setDragIdx(null); setOverIdx(null)
            }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
            style={{ border: isDragOver ? `2px dashed ${PRODUZIR_COLOR}` : isNew ? `2px solid ${PRODUZIR_COLOR}66` : '1px solid var(--border,#e5e7eb)', borderRadius: '8px', background: 'var(--bg-primary,#fff)', marginBottom: 0, overflow: 'hidden', transition: 'border-color 0.3s' }}>

            {/* Block header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', background: `${PRODUZIR_COLOR}08`, borderBottom: '1px solid var(--border,#e5e7eb)' }}>
              <span style={{ color: 'var(--text-secondary,#9ca3af)', cursor: 'grab', fontSize: '0.8rem', flexShrink: 0 }}>⠿</span>
              <input
                value={bloco.title}
                onChange={e => updateBloco(bloco.id, { title: e.target.value })}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary,#1e293b)', outline: 'none', minWidth: 0, fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                <button onClick={() => moveBloco(bloco.id, -1)} disabled={idx === 0}          title="Mover para cima"  style={{ ...iconBtn, opacity: idx === 0 ? 0.35 : 1 }}>↑</button>
                <button onClick={() => moveBloco(bloco.id,  1)} disabled={idx === blocos.length - 1} title="Mover para baixo" style={{ ...iconBtn, opacity: idx === blocos.length - 1 ? 0.35 : 1 }}>↓</button>
                <button onClick={() => duplicateBloco(bloco.id)} title="Duplicar"   style={iconBtn}>⧉</button>
                <button onClick={() => setViewingIds(prev => { const s = new Set(prev); s.has(bloco.id) ? s.delete(bloco.id) : s.add(bloco.id); return s })} title={isViewing ? 'Editar' : 'Visualizar'} style={{ ...iconBtn, background: isViewing ? '#F0FDF4' : 'transparent', color: isViewing ? '#059669' : 'var(--text-secondary,#64748b)' }}>👁</button>
                <button onClick={() => removeBloco(bloco.id)} title="Remover" style={{ ...iconBtn, borderColor: '#FECACA', color: '#DC2626' }}>🗑</button>
              </div>
            </div>

            {/* Block body */}
            {isViewing ? (
              <div className="prose-reading" style={{ padding: '0.75rem 1rem', fontSize: '0.87rem', lineHeight: 1.78, color: 'var(--text-primary,#1e293b)', minHeight: '60px' }} dangerouslySetInnerHTML={{ __html: bloco.html || '<p style="color:#9ca3af;font-style:italic">Sem conteúdo.</p>' }} />
            ) : (
              <div style={{ padding: '0.5rem 0.75rem' }}>
                <RichEditor value={bloco.html} onChange={html => updateBloco(bloco.id, { html })} placeholder="Escreva o conteúdo deste módulo…" moduleColor={PRODUZIR_COLOR} minHeight={140} aiContext={aiCtx} />
              </div>
            )}

            {/* Status dot */}
            <div style={{ padding: '0.2rem 0.75rem 0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: bloco.html.trim() ? (bloco.html.replace(/<[^>]+>/g, '').trim().length < 80 ? 'var(--accent,#3B82F6)' : 'var(--success,#22C55E)') : 'var(--border,#CBD5E1)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary,#9ca3af)' }}>
                {bloco.html.trim() ? `${bloco.html.replace(/<[^>]+>/g, '').trim().length} caracteres` : 'Vazio'}
              </span>
            </div>
          </div>

          {/* Insert-between button */}
          <InsertBetween onInsert={() => addBlocoAt(idx)} />
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProduzirWorkspace({ project, userId, existingSection, onUpdate, onAskAI, production, onUpdateProduction, onBackToLibrary }: Props) {
  const supabase  = createClient()
  const [content, setContent] = useState<ProduzirContent>(() => loadContent(existingSection, production))
  const [saving,  setSaving]  = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const latestContent = useRef<ProduzirContent>(content)
  const saveTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sectionRef    = useRef<Section | undefined>(existingSection)

  useEffect(() => { sectionRef.current = existingSection }, [existingSection])

  // ── Save ──────────────────────────────────────────────────────────────────

  const performSave = useCallback(async (c: ProduzirContent) => {
    setSaving(true)

    if (production) {
      // Save to productions table
      const res = await fetch(`/api/productions/${production.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: c }),
      })
      if (res.ok && onUpdateProduction) onUpdateProduction(await res.json() as Production)
    } else {
      // Legacy: save to sections table
      const hasContent = c.livre.html.trim().length > 0 || c.blocos_montado.some(b => b.html.trim()) || c.blocos_livre.some(b => b.html.trim())
      const payload = {
        project_id: project.id, user_id: userId,
        slug: 'pregar_visao_geral', module: 'dispositio',
        title: 'Produzir', content: c,
        status: (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
      }
      const sec = sectionRef.current
      if (sec?.id) {
        const { data } = await supabase.from('sections').update(payload).eq('id', sec.id).select().single()
        if (data) { onUpdate(data as Section); sectionRef.current = data as Section }
      } else {
        const { data } = await supabase.from('sections').insert(payload).select().single()
        if (data) { onUpdate(data as Section); sectionRef.current = data as Section }
      }
    }

    setSaving(false)
    setSavedAt(new Date())
  }, [production, project.id, userId, supabase, onUpdate, onUpdateProduction])

  function scheduleAutosave(c: ProduzirContent) {
    latestContent.current = c
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(latestContent.current), 1500)
  }

  function updateContent(patch: Partial<ProduzirContent>) {
    const next = { ...latestContent.current, ...patch }
    setContent(next)
    scheduleAutosave(next)
  }

  // ── Mode selection ────────────────────────────────────────────────────────

  function selectMode(mode: ProduzirMode) {
    const patch: Partial<ProduzirContent> = { produzir_mode: mode }
    if (mode === 'modular_montado' && latestContent.current.blocos_montado.length === 0) {
      patch.blocos_montado = DEFAULT_MONTADO_BLOCOS.map(b => ({ ...b, id: genId() }))
    }
    updateContent(patch)
  }

  function goBack() { updateContent({ produzir_mode: null }) }

  // ── Render ────────────────────────────────────────────────────────────────

  const { produzir_mode } = content

  if (produzir_mode === null) return <Hub onSelect={selectMode} productionTitle={production?.title} onBack={onBackToLibrary} />

  if (produzir_mode === 'livre') return (
    <ProduzirLivre
      project={project} userId={userId}
      data={content.livre}
      saving={saving} savedAt={savedAt}
      onChange={livre => updateContent({ livre })}
      onBack={goBack}
    />
  )

  if (produzir_mode === 'modular_montado' || produzir_mode === 'modular_livre') return (
    <ProduzirModular
      project={project} userId={userId}
      blocos={produzir_mode === 'modular_montado' ? content.blocos_montado : content.blocos_livre}
      mode={produzir_mode}
      saving={saving} savedAt={savedAt}
      onChangeBlocos={blocos =>
        produzir_mode === 'modular_montado'
          ? updateContent({ blocos_montado: blocos })
          : updateContent({ blocos_livre: blocos })
      }
      onBack={goBack}
    />
  )

  return null
}
