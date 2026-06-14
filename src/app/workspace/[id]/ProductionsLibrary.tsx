'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project, Section, Production } from '@/types/database'
import ProduzirWorkspace from './ProduzirWorkspace'

// ── Tipos de produção ──────────────────────────────────────────────────────────

type ProductionType = {
  id: string
  label: string
  icon: string
  color: string
  description: string
}

const PRODUCTION_TYPES: ProductionType[] = [
  { id: 'sermao',         label: 'Sermão',          icon: '📢', color: '#7C3AED', description: 'Pregação expositiva, temática ou evangelística' },
  { id: 'devocional',     label: 'Devocional',      icon: '🔥', color: '#DC2626', description: 'Reflexão devocional e aplicação pessoal' },
  { id: 'estudo_biblico', label: 'Estudo Bíblico',  icon: '📖', color: '#2563EB', description: 'Estudo em grupo, célula ou sala de aula' },
  { id: 'aula',           label: 'Aula',             icon: '🎓', color: '#D97706', description: 'Aula para escola bíblica ou seminário' },
  { id: 'curso',          label: 'Curso',            icon: '📚', color: '#16A34A', description: 'Material estruturado para curso completo' },
  { id: 'artigo',         label: 'Artigo',           icon: '✍️', color: '#0891B2', description: 'Artigo teológico ou reflexão escrita' },
  { id: 'ebook',          label: 'E-book',           icon: '📕', color: '#9333EA', description: 'Publicação digital aprofundada' },
  { id: 'livre',          label: 'Produção Livre',   icon: '✨', color: '#64748B', description: 'Qualquer outro formato de comunicação' },
]

function getTypeInfo(typeId: string): ProductionType {
  return PRODUCTION_TYPES.find(t => t.id === typeId) ?? PRODUCTION_TYPES[PRODUCTION_TYPES.length - 1]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Modal Nova Produção ────────────────────────────────────────────────────────

interface NewProductionModalProps {
  onConfirm: (type: string, title: string) => void
  onCancel: () => void
  busy: boolean
}

function NewProductionModal({ onConfirm, onCancel, busy }: NewProductionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [title, setTitle] = useState('')

  function handleConfirm() {
    if (!selectedType) return
    const t = getTypeInfo(selectedType)
    onConfirm(selectedType, title.trim() || t.label)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
    }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: '14px',
        padding: '1.75rem', width: '100%', maxWidth: '560px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '0.25rem' }}>
          Nova Produção
        </div>
        <div style={{ fontSize: '0.77rem', color: '#64748b', marginBottom: '1.4rem' }}>
          Escolha o tipo de produção que deseja criar
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.4rem' }}>
          {PRODUCTION_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              style={{
                border: selectedType === t.id ? `2px solid ${t.color}` : '1.5px solid #E2E8F0',
                borderRadius: '10px', padding: '0.85rem 0.9rem',
                background: selectedType === t.id ? `${t.color}09` : '#FAFAFA',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                transition: 'border-color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => {
                if (selectedType !== t.id) {
                  e.currentTarget.style.borderColor = `${t.color}55`
                  e.currentTarget.style.background = `${t.color}05`
                }
              }}
              onMouseLeave={e => {
                if (selectedType !== t.id) {
                  e.currentTarget.style.borderColor = '#E2E8F0'
                  e.currentTarget.style.background = '#FAFAFA'
                }
              }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1.1 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{t.label}</div>
                <div style={{ fontSize: '0.67rem', color: '#64748b', lineHeight: 1.4, marginTop: '0.15rem' }}>{t.description}</div>
              </div>
            </button>
          ))}
        </div>

        {selectedType && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Título (opcional)
            </label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !busy) handleConfirm() }}
              placeholder={getTypeInfo(selectedType).label}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1.5px solid #CBD5E1', borderRadius: '8px',
                padding: '0.5rem 0.75rem', fontSize: '0.87rem',
                fontFamily: 'inherit', outline: 'none', color: '#1e293b',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = getTypeInfo(selectedType!).color }}
              onBlur={e => { e.currentTarget.style.borderColor = '#CBD5E1' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px',
              border: '1.5px solid #E2E8F0', background: 'transparent',
              fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedType || busy}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '8px',
              border: 'none',
              background: selectedType ? getTypeInfo(selectedType).color : '#CBD5E1',
              fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF',
              cursor: selectedType && !busy ? 'pointer' : 'default',
              fontFamily: 'inherit', opacity: !selectedType || busy ? 0.6 : 1,
              transition: 'background 0.12s',
            }}
          >
            {busy ? 'Criando…' : 'Criar Produção'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Card de produção ───────────────────────────────────────────────────────────

interface ProductionCardProps {
  production: Production
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onRename: (title: string) => void
}

function ProductionCard({ production, onOpen, onDuplicate, onDelete, onRename }: ProductionCardProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(production.title)
  const typeInfo = getTypeInfo(production.type)

  function commitRename() {
    setEditingTitle(false)
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== production.title) onRename(trimmed)
    else setTitleDraft(production.title)
  }

  return (
    <div style={{
      border: '1px solid #E2E8F0', borderRadius: '12px',
      background: '#FFFFFF', overflow: 'hidden',
      transition: 'box-shadow 0.15s, border-color 0.15s',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
        el.style.borderColor = `${typeInfo.color}40`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.boxShadow = 'none'
        el.style.borderColor = '#E2E8F0'
      }}
    >
      {/* Color bar */}
      <div style={{ height: '3px', background: typeInfo.color }} />

      <div style={{ padding: '1rem 1rem 0.85rem' }}>
        {/* Type chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '1rem' }}>{typeInfo.icon}</span>
          <span style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: typeInfo.color,
            background: `${typeInfo.color}12`, border: `1px solid ${typeInfo.color}30`,
            borderRadius: '4px', padding: '0.05rem 0.35rem',
          }}>
            {typeInfo.label}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: '#94A3B8' }}>
            {formatDate(production.updated_at)}
          </span>
        </div>

        {/* Title */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(production.title) } }}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: `1.5px solid ${typeInfo.color}`,
              borderRadius: '6px', padding: '0.25rem 0.45rem',
              fontSize: '0.87rem', fontWeight: 700, fontFamily: 'inherit',
              color: '#1e293b', outline: 'none',
              marginBottom: '0.7rem',
            }}
          />
        ) : (
          <div
            style={{ fontSize: '0.87rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.7rem', cursor: 'text', lineHeight: 1.3 }}
            title="Clique para renomear"
            onDoubleClick={() => setEditingTitle(true)}
          >
            {production.title}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpen}
            style={{
              flex: 1, padding: '0.42rem 0.75rem',
              background: typeInfo.color, border: 'none',
              borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700,
              color: '#FFFFFF', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Abrir
          </button>
          <button
            onClick={onDuplicate}
            title="Duplicar"
            style={{
              padding: '0.42rem 0.7rem',
              background: 'transparent', border: '1px solid #E2E8F0',
              borderRadius: '7px', fontSize: '0.72rem', color: '#64748B',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.1s, border-color 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E2E8F0' }}
          >
            Duplicar
          </button>
          <button
            onClick={onDelete}
            title="Excluir"
            style={{
              padding: '0.42rem 0.7rem',
              background: 'transparent', border: '1px solid #FECACA',
              borderRadius: '7px', fontSize: '0.72rem', color: '#DC2626',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

export default function ProductionsLibrary({ project, userId, existingSection, onUpdate, onAskAI }: Props) {
  const [productions, setProductions]         = useState<Production[]>([])
  const [loading, setLoading]                 = useState(true)
  const [busy, setBusy]                       = useState(false)
  const [showNewModal, setShowNewModal]       = useState(false)
  const [openProduction, setOpenProduction]   = useState<Production | null>(null)

  const fetchProductions = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/productions?project_id=${project.id}`)
    if (res.ok) setProductions(await res.json() as Production[])
    setLoading(false)
  }, [project.id])

  useEffect(() => { void fetchProductions() }, [fetchProductions])

  async function createProduction(type: string, title: string) {
    setBusy(true)
    const res = await fetch('/api/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: project.id, type, title }),
    })
    if (res.ok) {
      const p = await res.json() as Production
      setProductions(prev => [p, ...prev])
      setShowNewModal(false)
      setOpenProduction(p)
    }
    setBusy(false)
  }

  async function duplicateProduction(p: Production) {
    setBusy(true)
    const res = await fetch('/api/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        type:       p.type,
        title:      `${p.title} (cópia)`,
        content:    p.content,
      }),
    })
    if (res.ok) {
      const copy = await res.json() as Production
      setProductions(prev => [copy, ...prev])
    }
    setBusy(false)
  }

  async function deleteProduction(p: Production) {
    if (!confirm(`Excluir "${p.title}"? Esta ação não pode ser desfeita.`)) return
    const res = await fetch(`/api/productions/${p.id}`, { method: 'DELETE' })
    if (res.ok) setProductions(prev => prev.filter(x => x.id !== p.id))
  }

  async function renameProduction(p: Production, title: string) {
    const res = await fetch(`/api/productions/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (res.ok) {
      const updated = await res.json() as Production
      setProductions(prev => prev.map(x => x.id === updated.id ? updated : x))
    }
  }

  function handleUpdateProduction(updated: Production) {
    setProductions(prev => prev.map(x => x.id === updated.id ? updated : x))
    setOpenProduction(updated)
  }

  // ── Produção aberta ──────────────────────────────────────────────────────

  if (openProduction) {
    return (
      <ProduzirWorkspace
        key={openProduction.id}
        project={project}
        userId={userId}
        existingSection={existingSection}
        onUpdate={onUpdate}
        onAskAI={onAskAI}
        production={openProduction}
        onUpdateProduction={handleUpdateProduction}
        onBackToLibrary={() => setOpenProduction(null)}
      />
    )
  }

  // ── Biblioteca ─────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.75rem 1.75rem 3rem', maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.01em' }}>
            Biblioteca de Produções
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
            Cada produção compartilha a mesma base exegética deste projeto
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          style={{
            padding: '0.52rem 1.1rem',
            background: '#7C3AED', border: 'none',
            borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700,
            color: '#FFFFFF', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            transition: 'opacity 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          + Nova Produção
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8', fontSize: '0.85rem' }}>
          Carregando produções…
        </div>
      )}

      {/* Empty state */}
      {!loading && productions.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          border: '2px dashed #E2E8F0', borderRadius: '14px',
          background: '#FAFAFA',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.4rem' }}>
            Nenhuma produção ainda
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Crie sua primeira produção e comece a comunicar o que estudou.
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            style={{
              padding: '0.6rem 1.4rem',
              background: '#7C3AED', border: 'none',
              borderRadius: '9px', fontSize: '0.82rem', fontWeight: 700,
              color: '#FFFFFF', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + Nova Produção
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && productions.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {productions.map(p => (
            <ProductionCard
              key={p.id}
              production={p}
              onOpen={() => setOpenProduction(p)}
              onDuplicate={() => duplicateProduction(p)}
              onDelete={() => deleteProduction(p)}
              onRename={title => renameProduction(p, title)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showNewModal && (
        <NewProductionModal
          busy={busy}
          onConfirm={createProduction}
          onCancel={() => setShowNewModal(false)}
        />
      )}
    </div>
  )
}
