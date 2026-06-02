'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Section } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import {
  WORKSPACE_SECTIONS,
  SYNTHESIS_DEFS,
  getSectionsByGroup,
  getSectionBySlug,
  isSynthesisSlug,
  getSynthesisBySlug,
} from '@/lib/workspace-sections'
import { TOOL_AREAS, getToolAreaBySlug, isToolSlug } from '@/lib/tools-content'
import SectionWorkspace from './SectionWorkspace'
import SynthesisView from './SynthesisView'
import OriginalTextWorkspace from './OriginalTextWorkspace'
import TermosChaveWorkspace from './TermosChaveWorkspace'
import EstruturaLiterariaWorkspace from './EstruturaLiterariaWorkspace'
import ToolsWorkspace from './ToolsWorkspace'
import CollagesWorkspace from './CollagesWorkspace'
import SermonBuilderWorkspace from './SermonBuilderWorkspace'
import CommentaryWorkspace from './CommentaryWorkspace'
import LiveReferencePanel from './LiveReferencePanel'
import AIPanel from './AIPanel'
import BibleFloatingWindow from './BibleFloatingWindow'
import VisaoGeralWorkspace from './VisaoGeralWorkspace'
import {
  Heart, BookOpen, FileText, Crosshair, Landmark, Languages, GraduationCap,
  Sparkles, BookMarked, Flame, MessageSquareText, Layers, Book, Library,
  BookCopy, Link2, Paperclip, ChevronDown, ChevronRight, ChevronUp,
  type LucideIcon,
} from 'lucide-react'
import { LampasMarkIcon } from '@/components/LampasLogo'

interface Props {
  user: User
  project: Project
  initialSections: Section[]
}

// ── Tipos de navegação ─────────────────────────────────────────────────────

type PhaseId = 'preparar' | 'investigar' | 'comunicar' | 'ferramentas'

interface NavGroup { id: string; label: string }
interface NavMode { id: string; label: string; subtitle: string; color: string; bgActive: string; groups: NavGroup[] }
interface NavPhase { id: PhaseId; roman: string; label: string; color: string; bgActive: string; modes: NavMode[] }

const NAV_PHASES: NavPhase[] = [
  {
    id: 'preparar', roman: 'I', label: 'Preparar',
    color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
    modes: [
      {
        id: 'preparar_imersao',
        label: 'Imersão',
        subtitle: 'Piedade e assimilação',
        color: '#D97706',
        bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual', label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes', label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      },
    ],
  },
  {
    id: 'investigar', roman: 'II', label: 'Investigar',
    color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
    modes: [
      {
        id: 'interpretar_inventio',
        label: 'Exegese',
        subtitle: 'Descobrir o significado',
        color: 'var(--accent)',
        bgActive: 'rgba(59,130,246,0.08)',
        groups: [
          { id: 'contextual', label: 'Estudo Contextual' },
          { id: 'textual',    label: 'Estudo Textual' },
          { id: 'teologico',  label: 'Estudo Teológico' },
        ],
      },
    ],
  },
  {
    id: 'comunicar', roman: 'III', label: 'Produzir',
    color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
    modes: [
      {
        id: 'sermao',
        label: 'Sermão',
        subtitle: 'Proclamação pública',
        color: 'var(--ai)',
        bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'sermao_dispositio',   label: 'Estrutura' },
          { id: 'sermao_elocutio',     label: 'Linguagem' },
          { id: 'sermao_memoria',      label: 'Internalização' },
          { id: 'sermao_pronuntiatio', label: 'Execução da Pregação' },
        ],
      },
      {
        id: 'estudo_biblico',
        label: 'Estudo Bíblico',
        subtitle: 'Ensino participativo',
        color: '#10B981',
        bgActive: 'rgba(16,185,129,0.09)',
        groups: [
          { id: 'estudo_dispositio',   label: 'Estrutura' },
          { id: 'estudo_elocutio',     label: 'Linguagem' },
          { id: 'estudo_memoria',      label: 'Internalização' },
          { id: 'estudo_pronuntiatio', label: 'Execução da Pregação' },
        ],
      },
      {
        id: 'devocional',
        label: 'Devocional',
        subtitle: 'Fluxo meditativo e pastoral',
        color: '#D97706',
        bgActive: 'rgba(217,119,6,0.09)',
        groups: [
          { id: 'devocional_dispositio',   label: 'Estrutura' },
          { id: 'devocional_elocutio',     label: 'Linguagem' },
          { id: 'devocional_memoria',      label: 'Internalização' },
          { id: 'devocional_pronuntiatio', label: 'Execução da Pregação' },
        ],
      },
      {
        id: 'comentario',
        label: 'Comentário',
        subtitle: 'Exegese versículo a versículo',
        color: '#F97316',
        bgActive: 'rgba(249,115,22,0.09)',
        groups: [
          { id: 'comentario_expositivo', label: 'Expositivo' },
        ],
      },
    ],
  },
  {
    id: 'ferramentas', roman: 'IV', label: 'Ferramentas',
    color: '#64748B', bgActive: 'rgba(100,116,139,0.08)',
    modes: [
      {
        id: 'ferramentas_biblioteca',
        label: 'Pesquisa',
        subtitle: 'Biblioteca e assistente',
        color: '#64748B',
        bgActive: 'rgba(100,116,139,0.08)',
        groups: [
          ...TOOL_AREAS.map(area => ({ id: area.slug, label: area.shortTitle })),
          { id: 'colagens', label: 'Colagens' },
        ],
      },
    ],
  },
]

const NAV_GROUP_IDS = new Set(NAV_PHASES.flatMap(phase => phase.modes.flatMap(mode => mode.groups.map(group => group.id))))

const PHASE_DESCRIPTIONS: Record<PhaseId, string> = {
  preparar:    'Preparação espiritual e contato inicial com o texto',
  investigar:  'Análise contextual, textual e teológica',
  comunicar:   'Transformação da exegese em comunicação',
  ferramentas: 'Biblioteca e recursos de pesquisa',
}

const GROUP_SUBTITLES: Record<string, string> = {
  // Investigar
  contextual: 'Histórico, literário e canônico',
  textual:    'Texto original e estrutura',
  teologico:  'Mensagem e implicações',
  // Preparar
  preparar_espiritual:  'Oração e dependência',
  preparar_assimilacao: 'Contato direto com o texto',
  preparar_impressoes:  'Notas rápidas e perguntas',
  preparar_visao_geral: 'Tema, estrutura e clímax',
  // Comunicar — Sermão
  sermao_dispositio:    'Organização e estrutura',
  sermao_elocutio:      'Forma de comunicação',
  sermao_memoria:       'Memorização e preparo',
  sermao_pronuntiatio:  'Entrega e performance',
  // Comunicar — Estudo Bíblico
  estudo_dispositio:    'Organização e estrutura',
  estudo_elocutio:      'Forma de comunicação',
  estudo_memoria:       'Memorização e preparo',
  estudo_pronuntiatio:  'Entrega e performance',
  // Comunicar — Devocional
  devocional_dispositio:    'Organização e estrutura',
  devocional_elocutio:      'Forma de comunicação',
  devocional_memoria:       'Memorização e preparo',
  devocional_pronuntiatio:  'Entrega e performance',
  // Colagens
  colagens: 'Citações, notas e insights',
  // Comentário
  comentario_expositivo: 'Análise versículo a versículo',
}

const GROUP_ICONS: Record<string, LucideIcon> = {
  // Preparar
  preparar_espiritual:       Heart,
  preparar_assimilacao:      BookOpen,
  preparar_impressoes:       FileText,
  preparar_visao_geral:      Crosshair,
  // Investigar
  contextual:                Landmark,
  textual:                   Languages,
  teologico:                 GraduationCap,
  // Produzir — Comentário
  comentario_expositivo:     MessageSquareText,
  // Ferramentas
  ferramentas_sistematica:   Layers,
  ferramentas_biblica:       Book,
  ferramentas_dicionario:    Library,
  ferramentas_livros:        BookCopy,
  ferramentas_refs_cruzadas: Link2,
  colagens:                  Paperclip,
}

const MODE_ICONS_LUCIDE: Record<string, LucideIcon> = {
  sermao:         Sparkles,
  estudo_biblico: BookMarked,
  devocional:     Flame,
  comentario:     MessageSquareText,
}

// ── Helpers de navegação ───────────────────────────────────────────────────

function getPhaseFor(slug: string): PhaseId {
  if (slug === 'colagens') return 'ferramentas'
  if (slug === 'comentario_expositivo') return 'comunicar'
  if (isToolSlug(slug)) return 'ferramentas'
  if (isSynthesisSlug(slug)) return 'investigar'
  const sec = getSectionBySlug(slug)
  if (sec?.phase === 'preparar') return 'preparar'
  if (sec?.phase === 'comunicar') return 'comunicar'
  if (sec?.communicationMode) return 'comunicar'
  if (sec?.module === 'inventio') return 'investigar'
  if (sec?.module === 'dispositio') return 'comunicar'
  if (sec?.module === 'elocutio') return 'comunicar'
  if (sec?.module === 'memoria') return 'comunicar'
  if (sec?.module === 'pronuntiatio') return 'comunicar'
  return 'investigar'
}

function getGroupFor(slug: string): string | undefined {
  if (slug === 'colagens') return 'colagens'
  if (slug === 'comentario_expositivo') return 'comentario_expositivo'
  if (isToolSlug(slug)) return slug
  if (isSynthesisSlug(slug)) return getSynthesisBySlug(slug)?.groupId
  return getSectionBySlug(slug)?.group
}

function getCanonFor(slug: string): string | undefined {
  const groupId = getGroupFor(slug)
  if (!groupId) return undefined
  for (const phase of NAV_PHASES) {
    for (const mode of phase.modes) {
      if (mode.groups.some(g => g.id === groupId)) return mode.id
    }
  }
  return undefined
}

function statusDot(status: 'empty' | 'draft' | 'reviewed' | undefined): string {
  if (!status || status === 'empty') return 'var(--border)'
  if (status === 'draft') return 'var(--accent)'
  return 'var(--success)'
}

function toolProgress(groupId: string): { done: number; total: number } {
  if (groupId === 'colagens') return { done: 0, total: 1 }
  if (groupId === 'comentario_expositivo') return { done: 0, total: 1 }
  return isToolSlug(groupId) ? { done: 0, total: 1 } : { done: 0, total: 0 }
}

// ── Resize handle ─────────────────────────────────────────────────────────

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '4px', flexShrink: 0, cursor: 'col-resize', zIndex: 10,
        background: hover ? 'var(--border)' : 'var(--border-subtle)',
        transition: 'background 0.12s',
      }}
    />
  )
}

// ── Componente principal ────────────────────────────────────────────────────

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // ── Título editável ───────────────────────────────────────────────────────
  const [titleValue,    setTitleValue]    = useState(project.title)
  const [titleDraft,    setTitleDraft]    = useState('')
  const [editingTitle,  setEditingTitle]  = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  function startTitleEdit() {
    setTitleDraft(titleValue)
    setEditingTitle(true)
    setTimeout(() => titleInputRef.current?.select(), 0)
  }

  async function commitTitle() {
    const trimmed = titleDraft.trim()
    setEditingTitle(false)
    if (!trimmed || trimmed === titleValue) return
    setTitleValue(trimmed)
    await supabase.from('projects').update({ title: trimmed }).eq('id', project.id)
  }

  function cancelTitle() {
    setEditingTitle(false)
  }

  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState('preparacao_espiritual')
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(['preparar', 'investigar', 'ferramentas']))
  const [expandedCanons, setExpandedCanons] = useState<Set<string>>(() => new Set(['preparar_imersao', 'interpretar_inventio', 'ferramentas_biblioteca']))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(['preparar_espiritual']))
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Panel layout
  const [sidebarWidth, setSidebarWidth] = useState(264)
  const [referenceWidth, setReferenceWidth] = useState(280)
  const [aiWidth, setAiWidth] = useState(308)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [referenceCollapsed, setReferenceCollapsed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [sideBySide, setSideBySide] = useState(false)
  const [bibleOpen, setBibleOpen] = useState(false)

  const sidebarWidthRef = useRef(264)
  const referenceWidthRef = useRef(280)
  const aiWidthRef = useRef(308)
  sidebarWidthRef.current = sidebarWidth
  referenceWidthRef.current = referenceWidth
  aiWidthRef.current = aiWidth

  useEffect(() => {
    const sw = localStorage.getItem('lampas_sidebar_w')
    const rw = localStorage.getItem('lampas_ref_w')
    const aw = localStorage.getItem('lampas_ai_w')
    const sc = localStorage.getItem('lampas_sidebar_c')
    if (sw) setSidebarWidth(Number(sw))
    if (rw) setReferenceWidth(Number(rw))
    if (aw) setAiWidth(Number(aw))
    if (sc) setSidebarCollapsed(sc === '1')
  }, [])

  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = sidebarWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(120, Math.min(360, startW + ev.clientX - startX))
      setSidebarWidth(w); sidebarWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_sidebar_w', String(sidebarWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startReferenceResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = referenceWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(180, Math.min(520, startW + ev.clientX - startX))
      setReferenceWidth(w); referenceWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_ref_w', String(referenceWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startAiResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = aiWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(240, Math.min(560, startW - (ev.clientX - startX)))
      setAiWidth(w); aiWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('lampas_ai_w', String(aiWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const activeDef = getSectionBySlug(activeSlug)
  const activeTool = getToolAreaBySlug(activeSlug)
  const activeSection = sections.find(s => s.slug === activeSlug)
  const activePhase = NAV_PHASES.find(p => p.id === getPhaseFor(activeSlug))

  const handleSectionUpdate = useCallback((updated: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next }
      return [...prev, updated]
    })
  }, [])

  function togglePhase(id: string) {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCanon(id: string) {
    setExpandedCanons(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function navigate(slug: string) {
    setExpandedPhases(prev => new Set([...prev, getPhaseFor(slug)]))
    const c = getCanonFor(slug)
    if (c) setExpandedCanons(prev => new Set([...prev, c]))
    const g = getGroupFor(slug)
    if (g) setExpandedGroups(prev => new Set([...prev, g]))
    setActiveSlug(slug)
  }

  function groupProgress(groupId: string) {
    if (groupId === 'colagens') return toolProgress(groupId)
    if (groupId === 'comentario_expositivo') return toolProgress(groupId)
    if (isToolSlug(groupId)) return toolProgress(groupId)
    const gs = getSectionsByGroup(groupId)
    return {
      total: gs.length,
      done: gs.filter(sd => {
        const s = sections.find(sec => sec.slug === sd.slug)
        return s?.status === 'draft' || s?.status === 'reviewed'
      }).length,
    }
  }

  const navigableSections = WORKSPACE_SECTIONS.filter(sd => NAV_GROUP_IDS.has(sd.group))
  const totalSecs = navigableSections.length
  const doneSecs = navigableSections.filter(sd => {
    const s = sections.find(sec => sec.slug === sd.slug)
    return s?.status === 'draft' || s?.status === 'reviewed'
  }).length
  const pct = Math.round((doneSecs / totalSecs) * 100)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>

      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header style={{
        height: '46px', flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem 0 0.75rem',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.78rem',
            padding: '0.2rem 0.6rem 0.2rem 0.3rem', borderRadius: '4px',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center',
            gap: '0.3rem', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ←
        </button>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)', marginRight: '0.6rem', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '0.45rem', overflow: 'hidden' }}>
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); void commitTitle() }
                if (e.key === 'Escape') cancelTitle()
              }}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--accent)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.86rem',
                fontWeight: 600,
                outline: 'none',
                padding: '0.1rem 0.4rem',
                minWidth: '160px',
                maxWidth: '360px',
                flexShrink: 1,
              }}
            />
          ) : (
            <button
              onClick={startTitleEdit}
              title="Editar título do estudo"
              style={{
                background: 'transparent', border: 'none', cursor: 'text',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.15rem 0.35rem', borderRadius: '4px',
                marginLeft: '-0.35rem', flexShrink: 1, minWidth: 0,
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                const icon = e.currentTarget.querySelector('.edit-icon') as HTMLElement
                if (icon) icon.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                const icon = e.currentTarget.querySelector('.edit-icon') as HTMLElement
                if (icon) icon.style.opacity = '0'
              }}
            >
              <span style={{
                fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {titleValue}
              </span>
              <span className="edit-icon" style={{
                fontSize: '0.7rem', color: 'var(--text-muted)',
                opacity: 0, transition: 'opacity 0.12s', flexShrink: 0,
              }}>✎</span>
            </button>
          )}
          <span style={{ color: 'var(--border)', fontSize: '0.78rem', flexShrink: 0 }}>·</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {project.book} {project.passage_ref}
          </span>
          <span style={{
            fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0,
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '3px', padding: '0.05rem 0.35rem',
          }}>
            {project.original_language}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, marginLeft: '0.75rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{pct}%</span>
          <div style={{ width: '56px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: activePhase?.color ?? 'var(--accent)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        <button
          onClick={() => setSideBySide(o => !o)}
          title="Mostrar exegese e trabalho lado a lado"
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
            background: sideBySide ? 'rgba(0,0,0,0.05)' : 'transparent',
            border: `1px solid ${sideBySide ? 'var(--border)' : 'var(--border-subtle)'}`,
            color: sideBySide ? 'var(--text-secondary)' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!sideBySide) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
          onMouseLeave={e => { if (!sideBySide) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          ⊞ Lado a Lado
        </button>

        <button
          onClick={() => setFocusMode(o => !o)}
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
            background: focusMode ? 'rgba(0,0,0,0.05)' : 'transparent',
            border: `1px solid ${focusMode ? 'var(--border)' : 'var(--border-subtle)'}`,
            color: focusMode ? 'var(--text-secondary)' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          {focusMode ? 'Sair' : 'Foco'}
        </button>

        <button
          onClick={() => setBibleOpen(o => !o)}
          title="Abrir Texto Bíblico"
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
            background: bibleOpen ? 'rgba(217,119,6,0.08)' : 'transparent',
            border: `1px solid ${bibleOpen ? '#D97706' : 'var(--border-subtle)'}`,
            color: bibleOpen ? '#D97706' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
          onMouseEnter={e => { if (!bibleOpen) { e.currentTarget.style.borderColor = '#D97706'; e.currentTarget.style.color = '#D97706' } }}
          onMouseLeave={e => { if (!bibleOpen) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          <BookOpen size={11} strokeWidth={2} /> Texto
        </button>

        <button
          onClick={() => setAiOpen(o => !o)}
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
            background: aiOpen ? 'var(--ai-subtle)' : 'transparent',
            border: `1px solid ${aiOpen ? 'var(--ai)' : 'var(--border-subtle)'}`,
            color: aiOpen ? 'var(--ai)' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' } }}
          onMouseLeave={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          IA
        </button>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <nav style={{
          width: focusMode ? '0' : sidebarCollapsed ? '40px' : `${sidebarWidth}px`,
          flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          overflowY: sidebarCollapsed ? 'hidden' : 'auto',
          display: 'flex', flexDirection: 'column',
          paddingBottom: '2.5rem',
          transition: 'width 0.18s ease',
        }}>
          {sidebarCollapsed ? (
            /* ── Sidebar collapsed ────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', paddingTop: '0.45rem' }}>
              <button
                onClick={() => { setSidebarCollapsed(false); localStorage.setItem('lampas_sidebar_c', '0') }}
                title="Expandir menu"
                style={{ width: '32px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.95rem', borderRadius: '3px', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >›</button>
              {NAV_PHASES.map(ph => (
                <button key={ph.id} title={ph.label}
                  onClick={() => { setSidebarCollapsed(false); localStorage.setItem('lampas_sidebar_c', '0'); setExpandedPhases(prev => new Set([...prev, ph.id])) }}
                  style={{ width: '32px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: ph.color, fontSize: '0.64rem', fontWeight: 900, borderRadius: '3px', fontFamily: 'inherit' }}
                >{ph.roman}</button>
              ))}
            </div>
          ) : (
            /* ── Sidebar expanded ────────────────────────────────── */
            <>
              <div style={{
                padding: '0.85rem 0.75rem 0.7rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <LampasMarkIcon size={28} />
                <button
                  onClick={() => { setSidebarCollapsed(true); localStorage.setItem('lampas_sidebar_c', '1') }}
                  title="Recolher menu"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '0.2rem',
                    borderRadius: '5px', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {NAV_PHASES.map((phase, phaseIdx) => {
                const phaseOpen  = expandedPhases.has(phase.id)
                const singleMode = phase.modes.length === 1

                return (
                  <div key={phase.id}>

                    {/* ── Connector line between phases ──────────── */}
                    {phaseIdx > 0 && (
                      <div style={{
                        width: '2px', height: '14px',
                        background: 'var(--border)',
                        marginLeft: '19px',
                        borderRadius: '1px',
                      }} />
                    )}

                    {/* ── Phase header ──────────────────────────── */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      style={{
                        width: '100%', border: 'none', cursor: 'pointer',
                        background: 'transparent', textAlign: 'left', fontFamily: 'inherit',
                        padding: '12px 12px 12px 10px',
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        transition: 'background 0.15s',
                        borderRadius: '8px',
                      }}
                      onMouseEnter={e => { if (!phaseOpen) e.currentTarget.style.background = 'rgba(0,0,0,0.03)' }}
                      onMouseLeave={e => { if (!phaseOpen) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Numbered circle — journey node */}
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: phaseOpen ? phase.color : `${phase.color}18`,
                        border: `1.5px solid ${phaseOpen ? phase.color : phase.color + '55'}`,
                        flexShrink: 0, marginTop: '2px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: phaseOpen ? `0 0 0 3px ${phase.color}15` : 'none',
                        transition: 'all 0.2s',
                      }}>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, lineHeight: 1,
                          color: phaseOpen ? '#FFFFFF' : phase.color,
                          userSelect: 'none',
                        }}>
                          {phaseIdx + 1}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Main title — large and prominent */}
                        <div style={{
                          fontSize: '1.0rem', fontWeight: 700,
                          letterSpacing: '-0.01em', lineHeight: 1.15,
                          color: phaseOpen ? phase.color : 'var(--text-primary)',
                          transition: 'color 0.15s',
                        }}>
                          {phase.label.toUpperCase()}
                        </div>
                        {/* Description */}
                        <div style={{
                          fontSize: '0.68rem', color: 'var(--text-muted)',
                          marginTop: '3px', lineHeight: 1.4, fontWeight: 400,
                        }}>
                          {PHASE_DESCRIPTIONS[phase.id]}
                        </div>
                      </div>

                      {/* Chevron */}
                      {phaseOpen
                        ? <ChevronUp size={13} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.5, marginTop: '5px' }} />
                        : <ChevronDown size={13} strokeWidth={1.75} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.4, marginTop: '5px' }} />
                      }
                    </button>

                    {/* ── Phase body — left border = journey line ── */}
                    {phaseOpen && (
                      <div style={{
                        marginLeft: '20px',
                        borderLeft: `2px solid ${phase.color}22`,
                        paddingBottom: '6px',
                      }}>
                        {phase.modes.map((mode, modeIdx) => {
                          const modeOpen = singleMode || expandedCanons.has(mode.id)

                          return (
                            <div key={mode.id}>

                              {/* Mode header — only for multi-mode phases (Produzir) */}
                              {!singleMode && (() => {
                                const ModeIconEl = MODE_ICONS_LUCIDE[mode.id]
                                return (
                                  <button
                                    onClick={() => toggleCanon(mode.id)}
                                    style={{
                                      width: 'calc(100% - 12px)', marginLeft: '6px', marginRight: '6px',
                                      border: modeOpen ? `1px solid ${mode.color}25` : '1px solid transparent',
                                      cursor: 'pointer',
                                      background: modeOpen ? mode.bgActive : 'transparent',
                                      borderRadius: '9px',
                                      textAlign: 'left', fontFamily: 'inherit',
                                      padding: '0.5rem 0.6rem',
                                      marginTop: modeIdx > 0 ? '0.25rem' : '0',
                                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                                      transition: 'background 0.12s, border-color 0.12s',
                                    }}
                                    onMouseEnter={e => { if (!modeOpen) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                    onMouseLeave={e => { if (!modeOpen) e.currentTarget.style.background = 'transparent' }}
                                  >
                                    {ModeIconEl && (
                                      <ModeIconEl size={14} strokeWidth={1.8} style={{ flexShrink: 0, color: mode.color, opacity: modeOpen ? 1 : 0.65 }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: modeOpen ? mode.color : 'var(--text-secondary)', lineHeight: 1.25 }}>
                                        {mode.label}
                                      </div>
                                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.2, marginTop: '0.08rem' }}>
                                        {mode.subtitle}
                                      </div>
                                    </div>
                                    {modeOpen
                                      ? <ChevronDown size={11} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.6 }} />
                                      : <ChevronRight size={11} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.4 }} />
                                    }
                                  </button>
                                )
                              })()}

                              {/* Groups */}
                              {modeOpen && (
                                <div style={{ paddingBottom: '0.15rem' }}>
                                  {mode.groups.map((group, groupIdx) => {
                                    const groupOpen      = expandedGroups.has(group.id)
                                    const isUtilityGroup = isToolSlug(group.id) || group.id === 'colagens' || group.id === 'comentario_expositivo'
                                    const secs           = isUtilityGroup ? [] : getSectionsByGroup(group.id)
                                    if (secs.length === 0 && !isUtilityGroup) return null
                                    const isSingleSection = !isUtilityGroup && secs.length === 1 && !SYNTHESIS_DEFS[group.id]
                                    const isDirect        = isUtilityGroup || isSingleSection
                                    const tool            = getToolAreaBySlug(group.id)
                                    const directSlug      = isSingleSection ? secs[0].slug : (tool?.slug ?? group.id)
                                    const directLabel     = isSingleSection ? secs[0].shortTitle : group.label
                                    const { done, total } = groupProgress(group.id)
                                    const syn        = !isDirect ? SYNTHESIS_DEFS[group.id] : undefined
                                    const isActive   = isDirect && activeSlug === directSlug
                                    const isExpanded = !isDirect && groupOpen
                                    const highlight  = isActive || isExpanded
                                    const groupTitle = isDirect ? directLabel : group.label
                                    const groupSub   = GROUP_SUBTITLES[group.id]
                                      ?? (isToolSlug(group.id) ? getToolAreaBySlug(group.id)?.subtitle : undefined)
                                      ?? ''

                                    return (
                                      <div key={group.id} style={{ marginBottom: groupOpen ? '0.45rem' : 0 }}>

                                        {/* ── Group header ── */}
                                        {(() => {
                                          const GroupIcon = GROUP_ICONS[group.id]
                                          return (
                                            <button
                                              onClick={() => isDirect ? navigate(directSlug) : toggleGroup(group.id)}
                                              style={{
                                                width: 'calc(100% - 12px)',
                                                marginLeft: '6px', marginRight: '6px',
                                                border: isActive ? `1px solid ${mode.color}28` : '1px solid transparent',
                                                cursor: 'pointer',
                                                background: isActive ? mode.bgActive : 'transparent',
                                                borderRadius: '10px',
                                                textAlign: 'left', fontFamily: 'inherit',
                                                padding: '0.52rem 0.65rem',
                                                display: 'flex', alignItems: 'center', gap: '0.55rem',
                                                transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
                                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                              }}
                                              onMouseEnter={e => {
                                                if (!isActive) {
                                                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                                                  e.currentTarget.style.borderColor = 'var(--border)'
                                                }
                                              }}
                                              onMouseLeave={e => {
                                                if (!isActive) {
                                                  e.currentTarget.style.background = 'transparent'
                                                  e.currentTarget.style.borderColor = 'transparent'
                                                }
                                              }}
                                            >
                                              {/* Lucide icon */}
                                              {GroupIcon && (
                                                <GroupIcon
                                                  size={15} strokeWidth={1.75}
                                                  style={{
                                                    flexShrink: 0,
                                                    color: highlight ? mode.color : 'var(--text-muted)',
                                                    transition: 'color 0.15s',
                                                  }}
                                                />
                                              )}

                                              <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                  fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3,
                                                  color: highlight ? mode.color : 'var(--text-primary)',
                                                  transition: 'color 0.15s',
                                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  letterSpacing: '-0.01em',
                                                }}>
                                                  {groupTitle}
                                                </div>
                                                {groupSub && (
                                                  <div style={{
                                                    fontSize: '0.67rem', color: 'var(--text-muted)',
                                                    marginTop: '0.1rem', lineHeight: 1.3,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  }}>
                                                    {groupSub}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Right indicators */}
                                              {isActive && (
                                                <span style={{
                                                  width: '6px', height: '6px', borderRadius: '50%',
                                                  background: mode.color, flexShrink: 0,
                                                }} />
                                              )}
                                              {!isDirect && done > 0 && !isActive && (
                                                <span style={{
                                                  fontSize: '0.6rem', flexShrink: 0, fontWeight: 600,
                                                  color: done === total ? 'var(--success)' : mode.color,
                                                }}>
                                                  {done === total ? '✓' : `${done}/${total}`}
                                                </span>
                                              )}
                                              {!isDirect && (
                                                groupOpen
                                                  ? <ChevronDown size={12} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.55 }} />
                                                  : <ChevronRight size={12} style={{ flexShrink: 0, color: 'var(--text-muted)', opacity: 0.4 }} />
                                              )}
                                            </button>
                                          )
                                        })()}

                                        {/* ── Section list (with vertical line) ── */}
                                        {!isDirect && groupOpen && (
                                          <div style={{
                                            marginLeft: '1.45rem',
                                            borderLeft: `1px solid var(--border-subtle)`,
                                            marginBottom: '0.15rem',
                                          }}>
                                            {secs.map((sd, secIdx) => {
                                              const sec      = sections.find(s => s.slug === sd.slug)
                                              const isActive = sd.slug === activeSlug
                                              const dot      = statusDot(sec?.status)
                                              return (
                                                <button
                                                  key={sd.slug}
                                                  onClick={() => navigate(sd.slug)}
                                                  style={{
                                                    width: '100%', border: 'none', fontFamily: 'inherit',
                                                    background: isActive ? `${mode.color}10` : 'transparent',
                                                    padding: '0.28rem 0.65rem 0.28rem 0.55rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                                                    cursor: 'pointer', textAlign: 'left',
                                                    borderRadius: '7px',
                                                    transition: 'background 0.1s',
                                                  }}
                                                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                                >
                                                  <span style={{
                                                    width: '4px', height: '4px', borderRadius: '50%',
                                                    background: isActive ? mode.color : 'var(--border)',
                                                    flexShrink: 0, transition: 'background 0.15s',
                                                  }} />
                                                  <span style={{
                                                    flex: 1, fontSize: '0.74rem', lineHeight: 1.35,
                                                    color: isActive ? mode.color : 'var(--text-secondary)',
                                                    fontWeight: isActive ? 600 : 400,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  }}>
                                                    {sd.shortTitle}
                                                  </span>
                                                  <span style={{
                                                    width: '5px', height: '5px', borderRadius: '50%',
                                                    background: dot, flexShrink: 0,
                                                    opacity: isActive ? 1 : 0.5,
                                                  }} />
                                                </button>
                                              )
                                            })}

                                            {/* Synthesis */}
                                            {syn && (() => {
                                              const isSynActive = activeSlug === syn.slug
                                              return (
                                                <button
                                                  onClick={() => navigate(syn.slug)}
                                                  style={{
                                                    width: '100%', border: 'none', fontFamily: 'inherit',
                                                    background: isSynActive ? mode.bgActive : 'transparent',
                                                    borderLeft: `2px solid ${isSynActive ? mode.color : 'transparent'}`,
                                                    padding: '0.28rem 0.4rem 0.28rem 0.52rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.32rem',
                                                    cursor: 'pointer', textAlign: 'left',
                                                    marginLeft: '-1px', marginTop: '0.12rem',
                                                    borderTop: '1px solid var(--border-subtle)',
                                                    transition: 'background 0.1s',
                                                  }}
                                                  onMouseEnter={e => { if (!isSynActive) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
                                                  onMouseLeave={e => { if (!isSynActive) e.currentTarget.style.background = 'transparent' }}
                                                >
                                                  <span style={{ fontSize: '0.62rem', color: isSynActive ? mode.color : 'var(--text-muted)', flexShrink: 0, lineHeight: 1 }}>→</span>
                                                  <span style={{
                                                    flex: 1, fontSize: '0.68rem', lineHeight: 1.3,
                                                    color: isSynActive ? mode.color : 'var(--text-muted)',
                                                    fontStyle: 'italic',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  }}>
                                                    {syn.shortTitle}
                                                  </span>
                                                </button>
                                              )
                                            })()}
                                          </div>
                                        )}

                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                            </div>
                          )
                        })}
                      </div>
                    )}

                  </div>
                )
              })}
            </>
          )}
        </nav>
        {!focusMode && !sidebarCollapsed && <ResizeHandle onMouseDown={startSidebarResize} />}

        {/* ── Content + AI panel ───────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', overflow: 'hidden' }}>
          {sideBySide && !focusMode && (
            <>
              {referenceCollapsed ? (
                <div
                  onClick={() => setReferenceCollapsed(false)}
                  title="Referência Viva — expandir"
                  style={{
                    width: '28px', flexShrink: 0, cursor: 'pointer',
                    borderRight: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.09em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>Referência</span>
                </div>
              ) : (
                <>
                  <div style={{ width: `${referenceWidth}px`, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.3rem 0.4rem', flexShrink: 0, borderBottom: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => setReferenceCollapsed(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >Recolher ‹</button>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <LiveReferencePanel
                        savedSections={sections}
                        onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
                      />
                    </div>
                  </div>
                  <ResizeHandle onMouseDown={startReferenceResize} />
                </>
              )}
            </>
          )}

          {/* Reading area */}
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--background)' }}>
            {activeSlug === 'colagens' ? (
              <CollagesWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : isToolSlug(activeSlug) ? (
              <ToolsWorkspace
                key={activeSlug}
                project={project}
                activeSlug={activeSlug}
                onNavigate={navigate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'texto_original' ? (
              <OriginalTextWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'termos_chave' ? (
              <TermosChaveWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'estrutura_literaria' ? (
              <EstruturaLiterariaWorkspace
                key={activeSlug}
                sectionDef={activeDef!}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                savedSections={sections}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'sermao_dispositio' ? (
              <SermonBuilderWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'comentario_expositivo' ? (
              <CommentaryWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'preparar_visao_geral' && activeDef ? (
              <VisaoGeralWorkspace
                key={activeSlug}
                sectionDef={activeDef}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
                onOpenBible={() => setBibleOpen(true)}
                onNavigate={navigate}
              />
            ) : activeDef ? (
              <SectionWorkspace
                key={activeSlug}
                sectionDef={activeDef}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : isSynthesisSlug(activeSlug) ? (
              <SynthesisView
                key={activeSlug}
                synthesisDef={getSynthesisBySlug(activeSlug)!}
                project={project}
                savedSections={sections}
                onNavigate={navigate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem',
              }}>
                Selecione uma seção
              </div>
            )}
          </main>

          {/* AI panel — flex sibling so content is never obscured */}
          {aiOpen && <ResizeHandle onMouseDown={startAiResize} />}
          <aside style={{
            flexShrink: 0,
            width: aiOpen ? `${aiWidth}px` : '0',
            overflow: 'hidden',
            borderLeft: 'none',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ width: `${aiWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <AIPanel
                project={project}
                activeSlug={activeSlug}
                activeTitle={activeSlug === 'colagens' ? 'Colagens' : activeSlug === 'comentario_expositivo' ? 'Comentário Expositivo' : activeTool?.title ?? activeDef?.title ?? titleValue}
                context={aiPrompt}
                onClearContext={() => setAiPrompt('')}
              />
            </div>
          </aside>

        </div>
      </div>

      {/* ── Bible floating window ─────────────────────────────────── */}
      {bibleOpen && (
        <BibleFloatingWindow
          book={project.book}
          passageRef={project.passage_ref}
          testament={project.testament}
          projectId={project.id}
          userId={user.id}
          onClose={() => setBibleOpen(false)}
        />
      )}
    </div>
  )
}
