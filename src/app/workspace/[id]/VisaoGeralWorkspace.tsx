'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import type { CollageItem } from '@/lib/collages-content'
import { createClient } from '@/lib/supabase/client'
import SectionWorkspace from './SectionWorkspace'
import { Sparkles, Map, List, MoreHorizontal, X, BookOpen } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ClassType =
  | 'personagem' | 'lugar' | 'tema' | 'termo_chave' | 'conflito' | 'repeticao'
  | 'teologia' | 'tempo' | 'instituicao' | 'cargo' | 'objetivo'
  | 'comentario' | 'insight' | 'observacao'

interface Classification {
  id: string; type: ClassType; selectedText: string
  startVerse: number; endVerse: number
  note: string; createdAt: string
}

// ── Storage ───────────────────────────────────────────────────────────────────

function readCls(pid: string): Classification[] {
  try { const r = localStorage.getItem(`lc_${pid}`); return r ? JSON.parse(r) : [] } catch { return [] }
}
function writeCls(pid: string, v: Classification[]) {
  try { localStorage.setItem(`lc_${pid}`, JSON.stringify(v)) } catch {}
}

// ── Canvas ────────────────────────────────────────────────────────────────────

const CW     = 800
const CH     = 540
const CX     = 400
const CY     = 270
const RADIUS = 205

// ── Node definitions — 8 nós a 45° exatos ─────────────────────────────────────

type NodeKind = 'cls' | 'card'

interface NodeDef {
  key: string; label: string; icon: string
  angle: number          // 0 = direita, -90 = topo, em sentido horário
  color: string; bg: string
  kind: NodeKind
  clsTypes?: ClassType[]
  cardIds?: string[]
}

const NODES: NodeDef[] = [
  { key: 'personagens', label: 'Personagens',  icon: '👤', angle: -90,  color: '#D97706', bg: '#FFFBEB', kind: 'cls',  clsTypes: ['personagem', 'cargo'] },
  { key: 'lugares',     label: 'Lugares',       icon: '📍', angle: -45,  color: '#059669', bg: '#F0FDF4', kind: 'cls',  clsTypes: ['lugar'] },
  { key: 'temas',       label: 'Temas',          icon: '📖', angle: 0,    color: '#2563EB', bg: '#EFF6FF', kind: 'cls',  clsTypes: ['tema'] },
  { key: 'termos',      label: 'Termos-Chave',  icon: '🔑', angle: 45,   color: '#EA580C', bg: '#FFF7ED', kind: 'cls',  clsTypes: ['termo_chave', 'repeticao'] },
  { key: 'grande_ideia',label: 'Grande Ideia',  icon: '💡', angle: 90,   color: '#D97706', bg: '#FEFCE8', kind: 'card', cardIds: ['preparar_grande_ideia_inicial'] },
  { key: 'estrutura',   label: 'Estrutura',      icon: '⊞',  angle: 135,  color: '#4F46E5', bg: '#EEF2FF', kind: 'card', cardIds: ['preparar_estrutura_percebida'] },
  { key: 'climax',      label: 'Clímax',         icon: '✦',  angle: 180,  color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['preparar_climax'] },
  { key: 'movimento',   label: 'Movimento',      icon: '⟶', angle: -135, color: '#475569', bg: '#F8FAFC', kind: 'card', cardIds: ['preparar_movimento_narrativo', 'preparar_fluxo_argumentativo'] },
]

function nodeXY(angle: number, r = RADIUS) {
  const rad = (angle * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  onOpenBible?: () => void
  onNavigate?: (slug: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisaoGeralWorkspace({
  sectionDef, project, userId, existingSection, onUpdate, onAskAI, onOpenBible, onNavigate,
}: Props) {
  const supabase    = useMemo(() => createClient(), [])
  const wrapRef     = useRef<HTMLDivElement>(null)

  const [mode,         setMode]        = useState<'visual' | 'structured'>('visual')
  const [activePanel,  setActivePanel] = useState<string | null>(null)
  const [hoveredNode,  setHoveredNode] = useState<string | null>(null)
  const [cls,          setCls]         = useState<Classification[]>([])
  const [wrapW,        setWrapW]       = useState(CW)
  const [cardDraft,    setCardDraft]   = useState<Record<string, string>>({})
  const [savingCard,   setSavingCard]  = useState<string | null>(null)
  const [itemMenuState,setItemMenuState] = useState<{ id: string; x: number; y: number } | null>(null)
  const [aiLoading,    setAiLoading]   = useState<string | null>(null)      // cls id
  const [aiResults,    setAiResults]   = useState<Record<string, string>>({}) // cls id → text
  const [toast,        setToast]       = useState<string | null>(null)

  // ── Data ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    setCls(readCls(project.id))
    const id = setInterval(() => setCls(readCls(project.id)), 1500)
    return () => clearInterval(id)
  }, [project.id])

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(e => setWrapW(e[0].contentRect.width))
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // fechar menu ao clicar fora
  useEffect(() => {
    if (!itemMenuState) return
    const h = () => setItemMenuState(null)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [itemMenuState])

  const cards = useMemo(
    () => (existingSection?.content as { cards?: Record<string, string> } | null)?.cards ?? {},
    [existingSection],
  )

  // ── Node data helpers ──────────────────────────────────────────────────────
  const getClsItems = (node: NodeDef): Classification[] =>
    node.kind === 'cls' && node.clsTypes
      ? cls.filter(c => node.clsTypes!.includes(c.type))
      : []

  const getCardText = (node: NodeDef): string =>
    node.kind === 'card' && node.cardIds
      ? node.cardIds.map(id => cards[id]?.trim()).filter(Boolean).join('\n\n')
      : ''

  const getCount = (node: NodeDef): number =>
    node.kind === 'cls' ? getClsItems(node).length : (getCardText(node) ? 1 : 0)

  const totalItems = NODES.reduce((s, n) => s + getCount(n), 0)

  // ── Save card ──────────────────────────────────────────────────────────────
  const saveCard = useCallback(async (cardId: string, value: string) => {
    setSavingCard(cardId)
    try {
      const { data } = await supabase.from('sections').select()
        .eq('project_id', project.id).eq('slug', sectionDef.slug).maybeSingle()
      const prev    = (data?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const payload = {
        project_id: project.id, user_id: userId, slug: sectionDef.slug,
        module: 'inventio' as const, title: sectionDef.title,
        status: 'draft' as const, content: { cards: { ...prev, [cardId]: value } },
      }
      const op = data?.id
        ? supabase.from('sections').update(payload).eq('id', data.id).select().single()
        : supabase.from('sections').insert(payload).select().single()
      const { data: updated } = await op
      if (updated) onUpdate(updated as Section)
    } catch { /* noop */ }
    finally { setSavingCard(null) }
  }, [supabase, project.id, userId, sectionDef, onUpdate])

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // ── Remove cls item ────────────────────────────────────────────────────────
  const removeCls = (id: string) => {
    const next = cls.filter(c => c.id !== id)
    setCls(next); writeCls(project.id, next)
    setItemMenuState(null)
  }

  // ── Open item menu at button position ──────────────────────────────────────
  function openItemMenu(e: React.MouseEvent, id: string) {
    e.stopPropagation() // evita que o click handler do document feche o menu recém-aberto
    if (itemMenuState?.id === id) { setItemMenuState(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setItemMenuState({ id, x: rect.right, y: rect.top })
  }

  // ── Gerar explicação com IA (inline) ──────────────────────────────────────
  async function generateExplanation(c: Classification) {
    setItemMenuState(null)
    setAiLoading(c.id)
    try {
      const res = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: c.selectedText, type: c.type, startVerse: c.startVerse, book: project.book, passageRef: project.passage_ref, kind: 'description' }),
      })
      const data = await res.json() as { result?: string }
      if (data.result) setAiResults(prev => ({ ...prev, [c.id]: data.result! }))
    } catch { /* noop */ }
    finally { setAiLoading(null) }
  }

  // ── Send to section (text append) ─────────────────────────────────────────
  async function sendToSection(c: Classification, slug: string, title: string, cardId?: string) {
    setItemMenuState(null)
    const line = `**${c.selectedText}** (v.${c.startVerse}) — ${c.type}`
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', slug).maybeSingle()
      const base = { project_id: project.id, user_id: userId, slug, module: 'inventio' as const, title, status: 'draft' as const }
      if (cardId) {
        const cards = ((data?.content as { cards?: Record<string, string> } | null)?.cards) ?? {}
        const prev  = cards[cardId] ?? ''
        const payload = { ...base, content: { cards: { ...cards, [cardId]: prev ? `${prev}\n${line}` : line } } }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      } else {
        const prev = (data?.ai_output as string | null) ?? ''
        const payload = { ...base, ai_output: prev ? `${prev}\n\n${line}` : line }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      }
      showToast(`Enviado para ${title}`)
    } catch { showToast('Erro ao enviar') }
  }

  // ── Transformar em Colagem ─────────────────────────────────────────────────
  async function createCollage(c: Classification) {
    setItemMenuState(null)
    const TYPE_LABELS: Record<string, string> = { personagem: 'Personagem', lugar: 'Lugar', tema: 'Tema', termo_chave: 'Termo-Chave', conflito: 'Conflito', repeticao: 'Repetição', teologia: 'Teologia', cargo: 'Cargo' }
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', 'colagens').maybeSingle()
      const items: CollageItem[] = ((data?.content as { type?: string; items?: CollageItem[] } | null)?.items) ?? []
      const newItem: CollageItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        type: 'trecho', title: `${TYPE_LABELS[c.type] ?? c.type}: "${c.selectedText}"`,
        content: `${c.selectedText}\n\n— ${project.book} ${project.passage_ref}, v.${c.startVerse}${aiResults[c.id] ? `\n\n${aiResults[c.id]}` : ''}`,
        author: '', work: `${project.book} ${project.passage_ref}`, page: `v.${c.startVerse}`,
        tags: [TYPE_LABELS[c.type] ?? c.type], category: 'Exegese', linkedTo: 'Perícope', x: 0, y: 0,
      }
      const payload = { project_id: project.id, user_id: userId, slug: 'colagens', module: 'inventio' as const, title: 'Colagens', status: 'draft' as const, content: { type: 'collages_workspace', items: [...items, newItem] } }
      if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
      else          await supabase.from('sections').insert(payload)
      showToast('Adicionado às Colagens')
    } catch { showToast('Erro ao criar colagem') }
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  const PANEL_W  = 284
  const PANEL_GAP = 12
  const canvasAreaW  = activePanel ? Math.max(wrapW - PANEL_W - PANEL_GAP, 300) : wrapW
  const scale        = Math.min(1, (canvasAreaW - 8) / CW)
  const scaledH      = CH * scale

  const activeNode = NODES.find(n => n.key === activePanel) ?? null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem 1.5rem 2rem' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Visão Geral · {project.book} {project.passage_ref}
          </div>
          {mode === 'visual' && (
            <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              {totalItems === 0
                ? <span style={{ color: '#B45309' }}>Marque palavras no Texto Bíblico para construir o mapa.</span>
                : `${totalItems} elemento${totalItems !== 1 ? 's' : ''} mapeado${totalItems !== 1 ? 's' : ''}${activePanel ? ' — clique fora para fechar o painel' : ' — clique em um nó para explorar'}.`}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {mode === 'visual' && activePanel && (
            <button onClick={() => setActivePanel(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', padding: '5px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <X size={11} /> Fechar painel
            </button>
          )}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2, #F1F5F9)', borderRadius: '8px', padding: '2px' }}>
            {(['visual', 'structured'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setActivePanel(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: mode === m ? '#FFFFFF' : 'transparent', border: 'none',
                  borderRadius: '6px', padding: '5px 11px', fontSize: '0.7rem', fontWeight: 600,
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {m === 'visual' ? <><Map size={11} strokeWidth={1.75} />Mapa</> : <><List size={11} strokeWidth={1.75} />Estruturado</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Structured ─────────────────────────────────────────────────────── */}
      {mode === 'structured' && (
        <SectionWorkspace sectionDef={sectionDef} project={project} userId={userId}
          existingSection={existingSection} onUpdate={onUpdate} onAskAI={onAskAI} />
      )}

      {/* ── Visual ─────────────────────────────────────────────────────────── */}
      {mode === 'visual' && (
        <>
          <div ref={wrapRef} style={{ display: 'flex', gap: `${PANEL_GAP}px`, alignItems: 'flex-start' }}>

            {/* Canvas */}
            <div style={{ position: 'relative', height: `${scaledH}px`, flex: 1, minWidth: 0, transition: 'all 0.25s ease' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${CW}px`, height: `${CH}px`,
                transform: `scale(${scale})`, transformOrigin: 'top left',
              }}>

                {/* ── SVG Lines ── */}
                <svg
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}
                >
                  <defs>
                    {NODES.map(node => {
                      const { x: nx, y: ny } = nodeXY(node.angle)
                      return (
                        <linearGradient key={`g-${node.key}`} id={`grad-${node.key}`}
                          x1={CX} y1={CY} x2={nx} y2={ny} gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor={node.color} stopOpacity={getCount(node) > 0 ? '0.5' : '0.2'} />
                        </linearGradient>
                      )
                    })}
                    {NODES.map(node => {
                      const { x: nx, y: ny } = nodeXY(node.angle)
                      return (
                        <linearGradient key={`ga-${node.key}`} id={`grad-active-${node.key}`}
                          x1={CX} y1={CY} x2={nx} y2={ny} gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor={node.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={node.color} stopOpacity="0.9" />
                        </linearGradient>
                      )
                    })}
                  </defs>

                  {NODES.map(node => {
                    const { x: nx, y: ny } = nodeXY(node.angle)
                    const isHov = hoveredNode === node.key
                    const isAct = activePanel === node.key
                    const hasData = getCount(node) > 0

                    // Cubic bezier — control points create a gentle sweep
                    const dx   = nx - CX; const dy = ny - CY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const px   = -dy / dist; const py = dx / dist // perpendicular
                    const BEND = 18
                    const cp1x = CX + dx * 0.32 + px * BEND
                    const cp1y = CY + dy * 0.32 + py * BEND
                    const cp2x = CX + dx * 0.68 + px * BEND
                    const cp2y = CY + dy * 0.68 + py * BEND

                    return (
                      <path key={node.key}
                        d={`M ${CX} ${CY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${nx} ${ny}`}
                        stroke={isHov || isAct ? `url(#grad-active-${node.key})` : `url(#grad-${node.key})`}
                        strokeWidth={isHov || isAct ? 2 : (hasData ? 1.5 : 1)}
                        strokeDasharray={hasData ? 'none' : '5 4'}
                        fill="none"
                        strokeLinecap="round"
                        style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
                      />
                    )
                  })}
                </svg>

                {/* ── Center node ── */}
                <button onClick={onOpenBible}
                  style={{
                    position: 'absolute', left: `${CX}px`, top: `${CY}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '18px',
                    padding: '18px 28px',
                    textAlign: 'center', zIndex: 4,
                    boxShadow: '0 0 0 6px rgba(226,232,240,0.35), 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
                    minWidth: '175px',
                    cursor: onOpenBible ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    transition: 'box-shadow 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!onOpenBible) return
                    e.currentTarget.style.boxShadow = '0 0 0 8px rgba(226,232,240,0.5), 0 12px 40px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(226,232,240,0.35), 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                  }}
                >
                  <div style={{ fontSize: '1.35rem', marginBottom: '6px', lineHeight: 1 }}>📖</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {project.book}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '3px', letterSpacing: '0.01em' }}>
                    {project.passage_ref}
                  </div>
                  {onOpenBible && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '8px', fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <BookOpen size={9} strokeWidth={2} /> abrir
                    </div>
                  )}
                  {totalItems > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.59rem', color: '#94A3B8', background: '#F1F5F9', borderRadius: '8px', padding: '1px 7px' }}>
                        {totalItems} elem.
                      </span>
                    </div>
                  )}
                </button>

                {/* ── Outer nodes ── */}
                {NODES.map(node => {
                  const { x: nx, y: ny } = nodeXY(node.angle)
                  const count   = getCount(node)
                  const hasData = count > 0
                  const isAct   = activePanel === node.key

                  return (
                    <div key={node.key}
                      style={{ position: 'absolute', left: `${nx}px`, top: `${ny}px`, transform: 'translate(-50%, -50%)', zIndex: 5 }}
                      onMouseEnter={() => setHoveredNode(node.key)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <button
                        onClick={() => setActivePanel(isAct ? null : node.key)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          background: isAct ? node.bg : '#FFFFFF',
                          border: `1.5px solid ${isAct ? node.color : (hasData ? node.color + '45' : '#E2E8F0')}`,
                          borderRadius: '13px',
                          padding: hasData ? '10px 16px' : '9px 15px',
                          cursor: 'pointer', minWidth: '108px',
                          fontFamily: 'inherit', userSelect: 'none',
                          boxShadow: isAct
                            ? `0 0 0 4px ${node.color}18, 0 4px 18px ${node.color}20, 0 1px 4px rgba(0,0,0,0.06)`
                            : hasData
                              ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                              : '0 1px 2px rgba(0,0,0,0.03)',
                          outline: 'none',
                          transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                          transform: isAct ? 'scale(1.06)' : 'scale(1)',
                        }}
                        onMouseEnter={e => { if (!isAct) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = hasData ? `0 4px 14px ${node.color}25, 0 1px 3px rgba(0,0,0,0.05)` : '0 2px 8px rgba(0,0,0,0.08)' } }}
                        onMouseLeave={e => { if (!isAct) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = hasData ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.03)' } }}
                      >
                        <span style={{ fontSize: '1rem', lineHeight: 1, marginBottom: '4px' }}>{node.icon}</span>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.05em',
                          textTransform: 'uppercase', textAlign: 'center',
                          color: hasData ? node.color : '#94A3B8',
                          lineHeight: 1.25,
                        }}>
                          {node.label}
                        </span>
                        {hasData ? (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800, color: node.color,
                            background: node.color + '18', borderRadius: '20px',
                            padding: '2px 8px', marginTop: '5px', lineHeight: 1,
                          }}>
                            {count}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.55rem', color: '#CBD5E1', marginTop: '3px', letterSpacing: '0.08em' }}>vazio</span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Side panel ── */}
            {activeNode && (
              <div style={{
                width: `${PANEL_W}px`, flexShrink: 0,
                background: '#FFFFFF',
                border: `1px solid ${activeNode.color}28`,
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: `0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
                animation: 'slideInRight 0.2s cubic-bezier(0.16,1,0.3,1)',
                alignSelf: 'flex-start',
              }}>

                {/* Panel header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: activeNode.bg,
                  borderBottom: `1px solid ${activeNode.color}18`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ fontSize: '1rem' }}>{activeNode.icon}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeNode.color }}>
                      {activeNode.label}
                    </span>
                    {getCount(activeNode) > 0 && (
                      <span style={{ fontSize: '0.63rem', fontWeight: 700, color: activeNode.color, background: activeNode.color + '20', borderRadius: '10px', padding: '1px 7px' }}>
                        {getCount(activeNode)}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setActivePanel(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '3px', display: 'flex', borderRadius: '5px', transition: 'color 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Panel body */}
                <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>

                  {/* CLS items */}
                  {activeNode.kind === 'cls' && (() => {
                    const items = getClsItems(activeNode)
                    return items.length === 0 ? (
                      <div style={{ padding: '18px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.79rem', color: '#94A3B8', fontStyle: 'italic' }}>Nenhum item marcado ainda.</div>
                        <div style={{ fontSize: '0.7rem', color: activeNode.color, marginTop: '5px' }}>Marque palavras no Texto Bíblico.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {items.map(c => (
                          <div key={c.id} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <div
                              style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '7px 8px', borderRadius: '8px', transition: 'background 0.1s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = activeNode.bg }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                            >
                              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeNode.color, flexShrink: 0, marginTop: '6px', opacity: 0.65 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.83rem', fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', color: '#1E293B', lineHeight: 1.35 }}>
                                  {c.selectedText}
                                </div>
                                <div style={{ fontSize: '0.63rem', color: '#94A3B8', marginTop: '1px' }}>
                                  v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''}{c.note ? ` · ${c.note}` : ''}
                                </div>
                                {/* AI explanation inline */}
                                {aiLoading === c.id && (
                                  <div style={{ fontSize: '0.68rem', color: '#8B5CF6', marginTop: '5px', fontStyle: 'italic' }}>Gerando explicação…</div>
                                )}
                                {aiResults[c.id] && (
                                  <div style={{ marginTop: '5px', padding: '6px 8px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '6px', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                                    {aiResults[c.id]}
                                  </div>
                                )}
                              </div>
                              <button onClick={e => openItemMenu(e, c.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px 3px', borderRadius: '4px', display: 'flex', flexShrink: 0, transition: 'color 0.1s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
                                onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
                              >
                                <MoreHorizontal size={13} strokeWidth={1.75} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Card textarea */}
                  {activeNode.kind === 'card' && (() => {
                    const cardId = activeNode.cardIds![0]
                    const draft  = cardDraft[cardId] ?? cards[cardId] ?? ''
                    const saved  = draft === (cards[cardId] ?? '')
                    return (
                      <div style={{ padding: '6px 4px' }}>
                        <textarea
                          value={draft}
                          onChange={e => setCardDraft(p => ({ ...p, [cardId]: e.target.value }))}
                          placeholder={`Descreva ${activeNode.label.toLowerCase()} da passagem…`}
                          rows={7}
                          style={{
                            width: '100%', resize: 'vertical', fontFamily: 'inherit',
                            fontSize: '0.83rem', lineHeight: 1.6, color: '#1E293B',
                            background: '#FAFAFA', border: '1px solid #E2E8F0',
                            borderRadius: '8px', padding: '10px 11px', outline: 'none',
                            boxSizing: 'border-box', transition: 'border-color 0.15s',
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = activeNode.color + '80'}
                          onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                        />
                        <button
                          onClick={() => saveCard(cardId, draft)}
                          disabled={savingCard === cardId || saved}
                          style={{
                            marginTop: '7px', width: '100%',
                            background: saved ? '#F1F5F9' : activeNode.color,
                            color: saved ? '#94A3B8' : '#FFFFFF',
                            border: 'none', borderRadius: '8px',
                            padding: '7px', fontSize: '0.74rem', fontWeight: 600,
                            cursor: saved || savingCard === cardId ? 'default' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            opacity: savingCard === cardId ? 0.7 : 1,
                          }}
                        >
                          {savingCard === cardId ? 'Salvando…' : saved ? 'Salvo' : 'Salvar'}
                        </button>
                      </div>
                    )
                  })()}
                </div>

                {/* Panel footer */}
                <div style={{ padding: '8px', borderTop: `1px solid ${activeNode.color}12`, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {activeNode.kind === 'cls' && (
                    <button onClick={() => onOpenBible?.()}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        background: 'transparent', border: `1px solid ${activeNode.color}30`,
                        borderRadius: '7px', padding: '7px', fontSize: '0.73rem',
                        color: activeNode.color, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = activeNode.bg }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <BookOpen size={11} strokeWidth={1.75} /> Abrir Texto Bíblico
                    </button>
                  )}
                  <button
                    onClick={() => onAskAI(`Analise ${project.book} ${project.passage_ref} e liste os principais elementos de "${activeNode.label}" na passagem, com breve nota sobre cada um.`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      background: 'transparent', border: '1px solid #E2E8F0',
                      borderRadius: '7px', padding: '7px', fontSize: '0.73rem',
                      color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                  >
                    <Sparkles size={11} strokeWidth={1.75} /> Organizar com IA
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom bar ── */}
          <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {NODES.filter(n => getCount(n) > 0).map(n => (
                <button key={n.key} onClick={() => setActivePanel(n.key === activePanel ? null : n.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer',
                    background: activePanel === n.key ? n.bg : '#F8FAFC',
                    border: `1px solid ${activePanel === n.key ? n.color + '50' : '#E2E8F0'}`,
                    color: activePanel === n.key ? n.color : '#64748B',
                    borderRadius: '6px', padding: '3px 9px',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (activePanel !== n.key) { e.currentTarget.style.borderColor = n.color + '40'; e.currentTarget.style.color = n.color } }}
                  onMouseLeave={e => { if (activePanel !== n.key) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' } }}
                >
                  {n.icon} {n.label} · {getCount(n)}
                </button>
              ))}
            </div>
            <button
              onClick={() => onAskAI(`Analise ${project.book} ${project.passage_ref} e organize de forma concisa: personagens principais e secundários, lugares principais, temas dominantes, conflito principal, clímax, grande ideia central.`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                background: '#FAFAFA', border: '1px solid #E2E8F0',
                borderRadius: '8px', padding: '6px 14px',
                fontSize: '0.73rem', color: '#64748B',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
            >
              <Sparkles size={11} strokeWidth={1.75} /> Organizar com IA
            </button>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ {toast}
        </div>
      )}

      {/* ── Item context menu (fixed — escapa overflow do painel) ── */}
      {itemMenuState && (() => {
        const c = cls.find(x => x.id === itemMenuState.id)
        if (!c) return null
        const MENU_H  = 380
        const menuX   = Math.min(Math.max(4, itemMenuState.x - 228), window.innerWidth - 232)
        const menuY   = itemMenuState.y + MENU_H > window.innerHeight ? itemMenuState.y - MENU_H : itemMenuState.y

        function mi(label: string, icon: string, action: () => void, danger?: boolean) {
          return (
            <button onClick={e => { e.stopPropagation(); action() }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'none', border: 'none', borderRadius: '5px', padding: '5px 9px', fontSize: '0.75rem', color: danger ? '#EF4444' : '#1E293B', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = danger ? '#FEF2F2' : '#F1F5F9' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ fontSize: '0.8rem', width: '16px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {label}
            </button>
          )
        }

        function sep(label: string) {
          return <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 9px 3px', marginTop: '2px' }}>{label}</div>
        }

        return (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', left: menuX, top: menuY, zIndex: 9999,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '10px', padding: '5px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              width: '224px', animation: 'fadeIn 0.1s ease-out',
            }}
          >
            {/* Preview */}
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic', padding: '3px 9px 6px', borderBottom: '1px solid #F1F5F9', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{c.selectedText}" — v.{c.startVerse}
            </div>

            {sep('Estudar')}
            {mi('Gerar explicação com IA', '✦', () => generateExplanation(c))}
            {mi('Gerar estudo lexical', '📚', () => { setItemMenuState(null); onAskAI(`Produza um estudo lexical completo de "${c.selectedText}" em ${project.book} ${project.passage_ref}: (1) termo original e transliteração, (2) significado e range semântico, (3) principais ocorrências no AT e NT, (4) teologia bíblica, (5) aplicações exegéticas.`) })}

            {sep('Pesquisar')}
            {mi('Dicionário', '📖', () => { setItemMenuState(null); onNavigate?.('ferramentas_dicionario'); onAskAI(`Pesquise o verbete "${c.selectedText}" em dicionários bíblicos reformados (BDAG, HALOT, TWOT, NIDOTTE, NIDNTTE). Apresente: definição, campo semântico, ocorrências, teologia e autores de referência.`) })}
            {mi('Bíblia', '📖', () => { setItemMenuState(null); onNavigate?.('ferramentas_biblica'); onAskAI(`Pesquise "${c.selectedText}" na Bíblia: principais passagens onde aparece, contexto de cada ocorrência, padrões de uso no livro de ${project.book} e progressão canônica do termo.`) })}
            {mi('Biblioteca', '📚', () => { setItemMenuState(null); onNavigate?.('ferramentas_livros'); onAskAI(`Indique as principais obras reformadas que tratam de "${c.selectedText}" em ${project.book} ${project.passage_ref}: comentários, monografias e artigos, com breve descrição da contribuição de cada obra.`) })}
            {mi('Referências cruzadas', '🔗', () => { setItemMenuState(null); onNavigate?.('ferramentas_refs_cruzadas'); onAskAI(`Liste as principais referências cruzadas para "${c.selectedText}" em ${project.book} ${project.passage_ref}: paralelos verbais, ecos literários, tipologia e progressão redentivo-histórica.`) })}

            {sep('Enviar para')}
            {mi('Termos-Chave', '🔑', () => sendToSection(c, 'termos_chave', '2.4 Termos-Chave'))}
            {mi('Estudo Teológico', '🧠', () => sendToSection(c, 'contexto_canonico', '3.1 Contexto Canônico'))}
            {mi('Comentário', '📖', () => sendToSection(c, 'comentario_expositivo', 'Comentário Expositivo'))}
            {mi('Colagem', '📌', () => createCollage(c))}

            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

            {sep('Gerenciar')}
            {mi('Ver no Texto Bíblico', '📖', () => { setItemMenuState(null); onOpenBible?.() })}
            {mi('Remover classificação', '🗑', () => removeCls(c.id), true)}
          </div>
        )
      })()}
    </div>
  )
}

