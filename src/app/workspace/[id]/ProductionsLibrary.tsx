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

// ── Helpers para conteúdo inicial ──────────────────────────────────────────────

type ProduzirMode = 'livre' | 'modular_montado' | 'modular_livre'

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

const DEFAULT_MONTADO_TITLES = [
  'Introdução', 'Contextualização', 'Transição',
  'Desenvolvimento', 'Ilustração', 'Aplicação', 'Conclusão',
]

function makeInitialContent(mode: ProduzirMode) {
  return {
    produzir_mode:  mode,
    livre:          { title: '', html: '' },
    blocos_montado: mode === 'modular_montado'
      ? DEFAULT_MONTADO_TITLES.map(title => ({ id: genId(), title, html: '' }))
      : [],
    blocos_livre:   [],
  }
}

// ── Modal Nova Produção ────────────────────────────────────────────────────────

const PROD_MODES = [
  { id: 'livre'           as ProduzirMode, label: 'Produção Livre',  desc: 'Escreva livremente, sem estrutura predefinida',                    icon: '✍' },
  { id: 'modular_montado' as ProduzirMode, label: 'Modular Montado', desc: 'Estrutura padrão com Introdução, Desenvolvimento, Conclusão…',    icon: '⊞' },
  { id: 'modular_livre'   as ProduzirMode, label: 'Modular Livre',   desc: 'Monte sua própria estrutura adicionando módulos livremente',       icon: '⬡' },
]

interface NewProductionModalProps {
  onConfirm: (type: string, mode: ProduzirMode, title: string) => void
  onCancel: () => void
  busy: boolean
}

function NewProductionModal({ onConfirm, onCancel, busy }: NewProductionModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<ProduzirMode | null>(null)
  const [title, setTitle] = useState('')

  const accentColor = selectedType ? getTypeInfo(selectedType).color : '#7C3AED'
  const canCreate   = selectedType !== null && selectedMode !== null && !busy

  function handleConfirm() {
    if (!selectedType || !selectedMode) return
    onConfirm(selectedType, selectedMode, title.trim() || getTypeInfo(selectedType).label)
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
        padding: '1.75rem', width: '100%', maxWidth: '580px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '0.25rem' }}>
          Nova Produção
        </div>
        <div style={{ fontSize: '0.77rem', color: '#64748b', marginBottom: '1.4rem' }}>
          Defina o tipo, o modo e o título da produção
        </div>

        {/* Tipo */}
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.55rem' }}>
          1. Tipo de produção
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.35rem' }}>
          {PRODUCTION_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              style={{
                border: selectedType === t.id ? `2px solid ${t.color}` : '1.5px solid #E2E8F0',
                borderRadius: '10px', padding: '0.75rem 0.85rem',
                background: selectedType === t.id ? `${t.color}09` : '#FAFAFA',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
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
              <span style={{ fontSize: '1.1rem', flexShrink: 0, lineHeight: 1.2 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>{t.label}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1.35, marginTop: '0.12rem' }}>{t.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Modo */}
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.55rem' }}>
          2. Modo de edição
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.35rem' }}>
          {PROD_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              style={{
                flex: 1,
                border: selectedMode === m.id ? `2px solid ${accentColor}` : '1.5px solid #E2E8F0',
                borderRadius: '10px', padding: '0.75rem 0.65rem',
                background: selectedMode === m.id ? `${accentColor}09` : '#FAFAFA',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                transition: 'border-color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => {
                if (selectedMode !== m.id) {
                  e.currentTarget.style.borderColor = `${accentColor}55`
                  e.currentTarget.style.background = `${accentColor}05`
                }
              }}
              onMouseLeave={e => {
                if (selectedMode !== m.id) {
                  e.currentTarget.style.borderColor = '#E2E8F0'
                  e.currentTarget.style.background = '#FAFAFA'
                }
              }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{m.icon}</div>
              <div style={{ fontSize: '0.77rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2, marginBottom: '0.2rem' }}>{m.label}</div>
              <div style={{ fontSize: '0.63rem', color: '#64748b', lineHeight: 1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Título */}
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.55rem' }}>
          3. Título (opcional)
        </div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && canCreate) handleConfirm() }}
          placeholder={selectedType ? getTypeInfo(selectedType).label : 'Ex: O Salvador que Rompe Barreiras'}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1.5px solid ${title ? accentColor + '55' : '#CBD5E1'}`,
            borderRadius: '8px', padding: '0.5rem 0.75rem',
            fontSize: '0.87rem', fontFamily: 'inherit',
            outline: 'none', color: '#1e293b',
            marginBottom: '1.4rem',
            transition: 'border-color 0.12s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = accentColor }}
          onBlur={e => { e.currentTarget.style.borderColor = title ? `${accentColor}55` : '#CBD5E1' }}
        />

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
            disabled={!canCreate}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
              background: canCreate ? accentColor : '#CBD5E1',
              fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF',
              cursor: canCreate ? 'pointer' : 'default',
              fontFamily: 'inherit', opacity: canCreate ? 1 : 0.55,
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
  const [migrating, setMigrating]             = useState(false)
  const [showNewModal, setShowNewModal]       = useState(false)
  const [openProduction, setOpenProduction]   = useState<Production | null>(null)
  const [openLegacy, setOpenLegacy]           = useState(false)
  const [legacyDismissed, setLegacyDismissed] = useState(() => {
    try { return localStorage.getItem(`lampas_legacy_migrated_${project.id}`) === '1' } catch { return false }
  })

  // Conteúdo legado — sermão criado antes da Biblioteca de Produções
  const legacyRaw = existingSection?.content as Record<string, unknown> | null | undefined
  const hasLegacy = !legacyDismissed && Boolean(
    existingSection?.id &&
    legacyRaw &&
    (legacyRaw.produzir_mode !== undefined || legacyRaw.livre || legacyRaw.blocos_montado)
  )

  const fetchProductions = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/productions?project_id=${project.id}`)
    if (res.ok) setProductions(await res.json() as Production[])
    setLoading(false)
  }, [project.id])

  useEffect(() => { void fetchProductions() }, [fetchProductions])

  async function createProduction(type: string, mode: ProduzirMode, title: string) {
    setBusy(true)
    const res = await fetch('/api/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        type,
        title,
        content: makeInitialContent(mode),
      }),
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

  function dismissLegacy() {
    try { localStorage.setItem(`lampas_legacy_migrated_${project.id}`, '1') } catch {}
    setLegacyDismissed(true)
  }

  async function migrateLegacy() {
    if (!legacyRaw) return
    setMigrating(true)
    const mode   = (legacyRaw.produzir_mode as string) || 'livre'
    const livre  = legacyRaw.livre as { title?: string } | undefined
    const title  = livre?.title?.trim() || 'Produção (recuperada)'
    const res = await fetch('/api/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        type:       mode === 'livre' ? 'livre' : 'sermao',
        title,
        content:    legacyRaw,
      }),
    })
    if (res.ok) {
      const p = await res.json() as Production
      setProductions(prev => [p, ...prev])
      dismissLegacy()
      setOpenProduction(p)
    }
    setMigrating(false)
  }

  // ── Produção legada aberta (acesso direto, sem migrar) ────────────────────

  if (openLegacy) {
    return (
      <ProduzirWorkspace
        key="legacy"
        project={project}
        userId={userId}
        existingSection={existingSection}
        onUpdate={onUpdate}
        onAskAI={onAskAI}
        onBackToLibrary={() => setOpenLegacy(false)}
      />
    )
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

      {/* Card de produção legada */}
      {hasLegacy && (
        <div style={{
          marginBottom: '1.5rem',
          border: '1.5px solid #F59E0B',
          borderRadius: '12px',
          background: '#FFFBEB',
          overflow: 'hidden',
        }}>
          <div style={{ height: '3px', background: '#F59E0B' }} />
          <div style={{ padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem' }}>⚠️</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
                Produção anterior encontrada
              </span>
              <span style={{
                fontSize: '0.6rem', fontWeight: 700,
                color: '#F59E0B', background: '#FEF3C7',
                border: '1px solid #FDE68A', borderRadius: '4px',
                padding: '0.02rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Legado
              </span>
              <button
                onClick={dismissLegacy}
                title="Dispensar"
                style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#B45309', fontSize: '0.85rem',
                  padding: '0.1rem 0.25rem', lineHeight: 1,
                }}
              >✕</button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78350F', marginBottom: '0.85rem', lineHeight: 1.55 }}>
              {(legacyRaw?.livre as { title?: string } | undefined)?.title
                ? `"${(legacyRaw?.livre as { title?: string }).title}" — salvo no formato anterior`
                : 'Conteúdo salvo no formato anterior à Biblioteca de Produções'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setOpenLegacy(true)}
                style={{
                  flex: 1, padding: '0.42rem 0.75rem',
                  background: '#F59E0B', border: 'none',
                  borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700,
                  color: '#FFFFFF', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Abrir
              </button>
              <button
                onClick={migrateLegacy}
                disabled={migrating}
                title="Copia o conteúdo para a nova Biblioteca de Produções"
                style={{
                  padding: '0.42rem 0.85rem',
                  background: 'transparent', border: '1.5px solid #F59E0B',
                  borderRadius: '7px', fontSize: '0.72rem', fontWeight: 700,
                  color: '#B45309', cursor: migrating ? 'default' : 'pointer', fontFamily: 'inherit',
                  opacity: migrating ? 0.6 : 1,
                }}
              >
                {migrating ? 'Migrando…' : 'Migrar para Biblioteca'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          onConfirm={(type, mode, title) => createProduction(type, mode, title)}
          onCancel={() => setShowNewModal(false)}
        />
      )}
    </div>
  )
}
