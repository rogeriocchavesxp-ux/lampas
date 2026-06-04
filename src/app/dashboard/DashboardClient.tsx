'use client'

import { useState, useMemo, cloneElement, isValidElement } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LampasLogo } from '@/components/LampasLogo'
import type { User } from '@supabase/supabase-js'
import type { Project, Profile } from '@/types/database'
import {
  STUDY_MODE_REGISTRY,
  getModeConfig,
  type StudyModeId,
  type StudyModeConfig,
} from '@/lib/study-modes'

const LEGACY_TYPE: Record<StudyModeId, string> = {
  exegese_biblica:             'exegese',
  estudo_de_carta:             'exegese',
  estudo_de_salmos_sabedoria:  'estudo_biblico',
  estudo_de_profecias:         'estudo_biblico',
  estudo_narrativas:           'exegese',
  estudo_doutrinario:          'estudo_doutrinario',
  estudo_tematico:             'estudo_doutrinario',
  sermao:                      'sermao',
  estudo_biblico:              'estudo_biblico',
  devocional:                  'devocional',
  comentario_exegetico:        'exegese',
}

const BOOKS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
  'Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis',
  '1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó',
  'Salmos','Provérbios','Eclesiastes','Cântico dos Cânticos',
  'Isaías','Jeremias','Lamentações','Ezequiel','Daniel',
  'Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias',
]

const BOOKS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos',
  '1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus',
  'Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João',
  'Judas','Apocalipse',
]

const MODE_ICONS: Record<StudyModeId, React.ReactNode> = {
  estudo_de_salmos_sabedoria: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  estudo_de_profecias: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M12 12v10"/>
    </svg>
  ),
  estudo_narrativas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  ),
  exegese_biblica: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  ),
  estudo_de_carta: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  ),
  estudo_doutrinario: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  estudo_tematico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  ),
  sermao: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v4M8 23h8"/>
    </svg>
  ),
  estudo_biblico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  devocional: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  comentario_exegetico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
}

const MODE_VISUALS: Record<StudyModeId, { color: string; bg: string; border: string }> = {
  devocional:                  { color: '#BE3455', bg: 'rgba(190,52,85,0.08)',  border: 'rgba(190,52,85,0.18)' },
  sermao:                      { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  estudo_biblico:               { color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.18)' },
  estudo_de_salmos_sabedoria:  { color: '#6D28D9', bg: 'rgba(109,40,217,0.08)', border: 'rgba(109,40,217,0.18)' },
  estudo_de_profecias:         { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.18)' },
  estudo_narrativas:           { color: '#92400E', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.18)' },
  estudo_doutrinario:          { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.18)' },
  estudo_tematico:             { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  exegese_biblica:             { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  estudo_de_carta:             { color: '#475569', bg: 'rgba(71,85,105,0.08)',  border: 'rgba(71,85,105,0.18)' },
  comentario_exegetico:        { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.18)' },
}

// Ordem da biblioteca (inclui estudo_biblico no final para backward compat)
const SECTION_ORDER: StudyModeId[] = [
  'devocional',
  'sermao',
  'estudo_de_salmos_sabedoria',
  'estudo_de_profecias',
  'estudo_narrativas',
  'estudo_doutrinario',
  'estudo_tematico',
  'exegese_biblica',
  'estudo_de_carta',
  'comentario_exegetico',
  'estudo_biblico',  // legado — mantido para projetos existentes
]

// Ordem do modal de criação (estudo_biblico removido — substituído pelos novos modos)
const MODE_ORDER: StudyModeId[] = [
  'exegese_biblica',
  'estudo_de_carta',
  'estudo_de_salmos_sabedoria',
  'estudo_de_profecias',
  'estudo_narrativas',
  'sermao',
  'estudo_doutrinario',
  'estudo_tematico',
  'devocional',
  'comentario_exegetico',
]

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60)   return 'Agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  const days = Math.floor(diff / 86400)
  if (days === 1)  return 'Ontem'
  if (days < 7)   return `${days} dias atrás`
  if (days < 30)  return `${Math.floor(days / 7)} sem. atrás`
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

function statusLabel(s: string): string {
  return { draft: 'Em andamento', in_progress: 'Em andamento', completed: 'Concluído', archived: 'Arquivado' }[s] ?? s
}

function modeVisual(modeId: StudyModeId) {
  return MODE_VISUALS[modeId]
}

function modeIcon(modeId: StudyModeId, size: number) {
  const icon = MODE_ICONS[modeId]
  return isValidElement<{ width?: number; height?: number }>(icon)
    ? cloneElement(icon, { width: size, height: size })
    : icon
}

function buildReferenceTitle(book: string, passageRef: string): string {
  const normalizedBook = book.trim()
  const normalizedRef = passageRef.trim()
  if (!normalizedBook || !normalizedRef) return ''
  return `${normalizedBook} ${normalizedRef}`
}

type ProjectForm = {
  title: string
  book: string
  passage_ref: string
  topic: string
  testament: '' | 'AT' | 'NT'
}

function createInitialForm(): ProjectForm {
  return { title: '', book: '', passage_ref: '', topic: '', testament: '' }
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects: initialProjects, profile }: Props) {
  const router  = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Local projects list — allows optimistic removal on delete
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  // Modal state
  const [showNew,       setShowNew]      = useState(false)
  const [modalStep,     setModalStep]    = useState<'mode' | 'form'>('mode')
  const [selectedMode,  setSelectedMode] = useState<StudyModeId | null>(null)
  const [creating,      setCreating]     = useState(false)
  const [createError,   setCreateError]  = useState<string | null>(null)
  const [titleEdited,   setTitleEdited]  = useState(false)
  const [form,          setForm]         = useState<ProjectForm>(createInitialForm())

  // Delete state
  const [deleteTarget,     setDeleteTarget]     = useState<Project | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  // All sections start collapsed
  const [collapsedSections, setCollapsedSections] = useState<Set<StudyModeId>>(
    () => new Set(SECTION_ORDER),
  )

  const modeConfig = selectedMode ? STUDY_MODE_REGISTRY[selectedMode] : null

  const projectsByMode = useMemo(() => {
    const map = new Map<StudyModeId, Project[]>()
    for (const p of projects) {
      const mode = getModeConfig(p.study_mode ?? p.project_type)
      const arr = map.get(mode.id) ?? []
      arr.push(p)
      map.set(mode.id, arr)
    }
    return map
  }, [projects])

  // Top 3 most recently updated — server already sorts by updated_at desc
  const recentProjects = useMemo(() => projects.slice(0, 3), [projects])

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteConfirming(true)
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleteConfirming(false)
    }
  }

  // Modes with at least 1 project, in display order
  const libraryModes = useMemo(
    () => SECTION_ORDER.filter(id => (projectsByMode.get(id)?.length ?? 0) > 0),
    [projectsByMode],
  )

  function toggleSection(id: StudyModeId) {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function openModal() {
    setModalStep('mode')
    setSelectedMode(null)
    setCreating(false)
    setCreateError(null)
    setTitleEdited(false)
    setForm(createInitialForm())
    setShowNew(true)
  }

  function closeModal() { setShowNew(false) }

  function selectMode(modeId: StudyModeId) {
    setSelectedMode(modeId)
    setCreateError(null)
    setTitleEdited(false)
    setForm(createInitialForm())
  }

  function updatePassageForm(patch: Partial<typeof form>) {
    setForm(current => {
      const next = { ...current, ...patch }
      if (!titleEdited) next.title = buildReferenceTitle(next.book, next.passage_ref)
      return next
    })
  }

  function updateTopic(value: string) {
    setForm(current => ({
      ...current,
      topic: value,
      title: titleEdited ? current.title : value.trim(),
    }))
  }

  function updateTitle(value: string) {
    setTitleEdited(true)
    setForm(current => ({ ...current, title: value }))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)

    if (!selectedMode || !modeConfig) return

    const isPassage = modeConfig.passageBased
    const generatedTitle = isPassage ? buildReferenceTitle(form.book, form.passage_ref) : form.topic.trim()
    const projectTitle = form.title.trim() || generatedTitle

    if (isPassage && !form.testament)          { setCreateError('Escolha o testamento.'); return }
    if (isPassage && !form.book)               { setCreateError('Selecione o livro.'); return }
    if (isPassage && !form.passage_ref.trim()) { setCreateError(`${modeConfig.passageLabel} é obrigatório.`); return }
    if (!isPassage && !form.topic.trim())      { setCreateError(`${modeConfig.topicLabel} é obrigatório.`); return }
    if (!projectTitle)                         { setCreateError('Informe os dados do estudo para gerar o título.'); return }

    const payload = {
      user_id:           user.id,
      title:             projectTitle,
      book:              isPassage ? form.book : '—',
      passage_ref:       isPassage ? form.passage_ref.trim() : form.topic.trim(),
      testament:         isPassage ? form.testament : 'AT',
      original_language: isPassage ? (form.testament === 'AT' ? 'hebraico' : 'grego') : 'hebraico',
      bible_version:     'NAA',
      status:            'draft',
      study_mode:        selectedMode,
      project_type:      LEGACY_TYPE[selectedMode] ?? 'exegese',
      meta:              isPassage ? {} : { topic: form.topic.trim() },
    }

    setCreating(true)
    try {
      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) {
        console.error('[Lampas] Erro ao criar projeto', error.code, error.message, error.details)
        const msg = error.code === '23514' ? 'Erro de validação dos dados do projeto.'
          : error.code === '23502' ? 'Campo obrigatório ausente.'
          : error.code === '42501' ? 'Sem permissão para criar projeto.'
          : `Erro ${error.code ?? 'desconhecido'}: ${error.message}`
        setCreateError(msg)
        return
      }
      if (data) {
        setProjects(prev => [data as Project, ...prev])
        router.push(`/workspace/${data.id}`)
      }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  const generatedProjectTitle = modeConfig?.passageBased
    ? buildReferenceTitle(form.book, form.passage_ref)
    : form.topic.trim()
  const canShowGeneratedTitle = Boolean(generatedProjectTitle)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)', padding: '0 2rem',
        height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <LampasLogo height={30} />
          <span style={{
            fontSize: '0.58rem', color: 'var(--text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            fontWeight: 500, lineHeight: 1, paddingLeft: '38px',
          }}>
            Estude. Interprete. Comunique.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user.email}</span>
          <button onClick={() => router.push('/billing')} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >Planos</button>
          {profile?.role === 'admin' && (
            <button onClick={() => router.push('/admin/billing')} style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
              borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >Admin</button>
          )}
          <button onClick={handleSignOut} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
          }}>Sair</button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', marginBottom: '2.5rem',
        }}>
          <div>
            <h1 style={{
              margin: '0 0 0.2rem', fontSize: '1.55rem', lineHeight: 1.1,
              color: 'var(--text-primary)', fontWeight: 750, letterSpacing: '-0.02em',
            }}>Biblioteca</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
              {projects.length === 0
                ? 'Nenhum estudo ainda'
                : `${projects.length} ${projects.length === 1 ? 'estudo' : 'estudos'}`}
            </p>
          </div>
          <button onClick={openModal} style={{
            background: 'var(--accent)', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.58rem 1.05rem', fontWeight: '650',
            cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(59,130,246,0.18)', flexShrink: 0,
          }}>
            + Novo Estudo
          </button>
        </div>

        {/* Content */}
        {projects.length === 0 ? (
          <EmptyDashboard onNew={openModal} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* ── Continuar Estudando ── */}
            <section>
              <ShelfLabel>Continuar Estudando</ShelfLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {recentProjects.map(p => (
                  <RecentCard
                    key={p.id}
                    project={p}
                    onClick={() => router.push(`/workspace/${p.id}`)}
                    onDelete={() => setDeleteTarget(p)}
                  />
                ))}
              </div>
            </section>

            {/* ── Biblioteca ── */}
            <section>
              <ShelfLabel>Por Modalidade</ShelfLabel>
              <div style={{
                marginTop: '1rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'var(--surface)',
              }}>
                {libraryModes.map((modeId, idx) => {
                  const mode      = STUDY_MODE_REGISTRY[modeId]
                  const visual    = modeVisual(modeId)
                  const modeProjects = projectsByMode.get(modeId) ?? []
                  const isCollapsed  = collapsedSections.has(modeId)
                  const isLast       = idx === libraryModes.length - 1

                  return (
                    <div
                      key={modeId}
                      style={{
                        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                      }}
                    >
                      {/* Category row */}
                      <button
                        onClick={() => toggleSection(modeId)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center',
                          gap: '0.7rem', padding: '0.85rem 1.1rem',
                          background: isCollapsed ? 'transparent' : `${visual.color}04`,
                          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'background 0.13s',
                        }}
                        onMouseEnter={e => { if (isCollapsed) e.currentTarget.style.background = 'rgba(15,23,42,0.025)' }}
                        onMouseLeave={e => { if (isCollapsed) e.currentTarget.style.background = 'transparent' }}
                      >
                        {/* Chevron */}
                        <svg
                          width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke={visual.color} strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round"
                          style={{
                            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.15s',
                            flexShrink: 0, opacity: 0.75,
                          }}
                        >
                          <path d="M6 9l6 6 6-6"/>
                        </svg>

                        {/* Mode icon */}
                        <span style={{ color: visual.color, display: 'flex', flexShrink: 0 }}>
                          {modeIcon(modeId, 14)}
                        </span>

                        {/* Mode name */}
                        <span style={{
                          flex: 1, textAlign: 'left',
                          fontSize: '0.88rem', fontWeight: 600,
                          color: isCollapsed ? 'var(--text-secondary)' : visual.color,
                          transition: 'color 0.13s',
                        }}>
                          {mode.name}
                        </span>

                        {/* Count badge */}
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 500,
                          color: 'var(--text-muted)',
                          background: 'var(--surface-2)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '999px',
                          border: '1px solid var(--border-subtle)',
                        }}>
                          {modeProjects.length}
                        </span>
                      </button>

                      {/* Expanded cards */}
                      {!isCollapsed && (
                        <div style={{
                          display: 'flex', flexDirection: 'column', gap: '0.35rem',
                          padding: '0 1.1rem 1rem 2.8rem',
                        }}>
                          {modeProjects.map(p => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              mode={mode}
                              onClick={() => router.push(`/workspace/${p.id}`)}
                              onDelete={() => setDeleteTarget(p)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* ── New project modal ── */}
      {showNew && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1rem',
          }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)',
            width: '100%',
            maxWidth: modalStep === 'mode' ? '660px' : '480px',
            animation: 'fadeIn 0.15s ease-out',
            transition: 'max-width 0.2s ease',
          }}>

            {/* Step 1: Mode selection */}
            {modalStep === 'mode' && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ marginBottom: '0.3rem', fontSize: '1.15rem' }}>Novo Estudo</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Escolha o modo de estudo
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {MODE_ORDER.map(modeId => {
                    const mode   = STUDY_MODE_REGISTRY[modeId]
                    const active = selectedMode === modeId
                    return (
                      <button
                        key={modeId}
                        onClick={() => selectMode(modeId)}
                        style={{
                          textAlign: 'left', padding: '0.9rem 1rem',
                          background: active ? `${mode.color}08` : 'var(--surface-2)',
                          border: `1.5px solid ${active ? mode.color : 'var(--border-subtle)'}`,
                          borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.13s',
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = `${mode.color}60`
                            e.currentTarget.style.background  = `${mode.color}05`
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)'
                            e.currentTarget.style.background  = 'var(--surface-2)'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
                          <span style={{ color: mode.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            {MODE_ICONS[modeId]}
                          </span>
                          <span style={{
                            fontSize: '0.88rem', fontWeight: 700,
                            color: active ? mode.color : 'var(--text-primary)',
                            transition: 'color 0.13s',
                          }}>
                            {mode.name}
                          </span>
                          {active && <span style={{ marginLeft: 'auto', color: mode.color, fontSize: '0.75rem' }}>✓</span>}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.25rem' }}>
                          {mode.tagline}
                        </p>
                        <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          {mode.audience}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={closeModal} style={{
                    flex: 1, padding: '0.6rem', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.88rem',
                  }}>
                    Cancelar
                  </button>
                  <button
                    onClick={() => selectedMode && setModalStep('form')}
                    disabled={!selectedMode}
                    style={{
                      flex: 2, padding: '0.6rem',
                      background: selectedMode ? (modeConfig?.color ?? 'var(--accent)') : 'var(--surface-3)',
                      color: selectedMode ? '#FFF' : 'var(--text-muted)',
                      border: 'none', borderRadius: '8px',
                      fontWeight: '600', cursor: selectedMode ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.15s',
                    }}
                  >
                    {selectedMode ? `Continuar com ${modeConfig?.name} →` : 'Escolha um modo'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details form */}
            {modalStep === 'form' && modeConfig && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
                  <button
                    onClick={() => { setModalStep('mode'); setCreateError(null) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: '0.2rem', fontSize: '0.9rem',
                    }}
                    title="Voltar"
                  >←</button>
                  <span style={{ color: modeConfig.color }}>{MODE_ICONS[modeConfig.id]}</span>
                  <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{modeConfig.name}</h2>
                </div>

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {modeConfig.passageBased ? (
                    <>
                      <FormField label="Testamento">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(['AT', 'NT'] as const).map(t => (
                            <button key={t} type="button"
                              onClick={() => updatePassageForm({ testament: t, book: '' })}
                              style={{
                                flex: 1, padding: '0.55rem',
                                background: form.testament === t ? 'var(--accent-subtle)' : 'var(--surface-2)',
                                border: `1px solid ${form.testament === t ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: '6px',
                                color: form.testament === t ? 'var(--accent)' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', fontFamily: 'inherit',
                              }}
                            >
                              {t === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}
                            </button>
                          ))}
                        </div>
                      </FormField>

                      <FormField label="Livro">
                        <select
                          value={form.book}
                          onChange={e => updatePassageForm({ book: e.target.value })}
                          disabled={!form.testament}
                          required
                        >
                          <option value="">{form.testament ? 'Selecione o livro' : 'Escolha o testamento primeiro'}</option>
                          {(form.testament === 'NT' ? BOOKS_NT : form.testament === 'AT' ? BOOKS_AT : []).map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label={modeConfig.passageLabel}>
                        <input
                          value={form.passage_ref}
                          onChange={e => updatePassageForm({ passage_ref: e.target.value })}
                          placeholder="Ex: 39.1-23"
                          required
                        />
                      </FormField>
                    </>
                  ) : (
                    <FormField label={modeConfig.topicLabel}>
                      <input
                        value={form.topic}
                        onChange={e => updateTopic(e.target.value)}
                        placeholder={modeConfig.titlePlaceholder}
                        required
                      />
                    </FormField>
                  )}

                  {canShowGeneratedTitle && (
                    <FormField label="Título do Projeto">
                      <input
                        value={form.title}
                        onChange={e => updateTitle(e.target.value)}
                        placeholder={generatedProjectTitle}
                      />
                      <p style={{
                        margin: '0.45rem 0 0', color: 'var(--text-muted)',
                        fontSize: '0.76rem', lineHeight: 1.45,
                      }}>
                        O título inicial é gerado automaticamente a partir {modeConfig.passageBased ? 'da referência bíblica' : 'do tema informado'}.
                        Você poderá alterá-lo a qualquer momento durante o estudo.
                      </p>
                    </FormField>
                  )}

                  {createError && (
                    <div style={{
                      color: '#DC2626', background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.2)',
                      borderRadius: '7px', padding: '0.6rem 0.85rem',
                      fontSize: '0.84rem', lineHeight: 1.4,
                    }}>
                      {createError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={closeModal} style={{
                      flex: 1, padding: '0.65rem', background: 'transparent',
                      border: '1px solid var(--border)', borderRadius: '8px',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: '0.9rem',
                    }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={creating} style={{
                      flex: 2, padding: '0.65rem',
                      background: creating ? 'var(--surface-3)' : modeConfig.color,
                      color: '#FFFFFF', border: 'none', borderRadius: '8px',
                      fontWeight: '600', cursor: creating ? 'wait' : 'pointer',
                      fontFamily: 'inherit', fontSize: '0.9rem', transition: 'background 0.15s',
                    }}>
                      {creating ? 'Criando…' : `Criar ${modeConfig.name}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          onClick={e => { if (e.target === e.currentTarget && !deleteConfirming) setDeleteTarget(null) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 60, padding: '1rem',
          }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)',
            width: '100%', maxWidth: '400px', padding: '1.75rem',
            animation: 'fadeIn 0.15s ease-out',
            boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Excluir estudo?
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Esta ação não poderá ser desfeita.
            </p>

            {/* Project info */}
            <div style={{
              background: 'var(--surface-2)', borderRadius: '9px',
              padding: '0.85rem 1rem', marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {deleteTarget.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span>{getModeConfig(deleteTarget.study_mode ?? deleteTarget.project_type).name}</span>
                {deleteTarget.book && deleteTarget.book !== '—' && (
                  <span style={{ fontStyle: 'italic' }}>{deleteTarget.book} {deleteTarget.passage_ref}</span>
                )}
                <span>Modificado {formatDate(deleteTarget.updated_at)} · Criado {formatDate(deleteTarget.created_at)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteConfirming}
                style={{
                  flex: 1, padding: '0.65rem',
                  background: 'var(--surface-2)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  fontWeight: 600, cursor: deleteConfirming ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.12s',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirming}
                style={{
                  flex: 1, padding: '0.65rem',
                  background: deleteConfirming ? 'var(--surface-3)' : '#EF4444',
                  color: '#FFFFFF',
                  border: 'none', borderRadius: '8px',
                  fontWeight: 600, cursor: deleteConfirming ? 'wait' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.12s',
                }}
              >
                {deleteConfirming ? 'Excluindo…' : 'Excluir estudo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ShelfLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}

function RecentCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: () => void }) {
  const mode   = getModeConfig(project.study_mode ?? project.project_type)
  const visual = MODE_VISUALS[mode.id as StudyModeId]
  const isPassage = mode.passageBased
  const subtitle = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: '1px solid rgba(226,232,240,0.9)',
        borderRadius: '9px',
        padding: '0.95rem 1.15rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        boxShadow: `inset 3px 0 0 ${visual.color}20`,
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${visual.color}, 0 2px 14px rgba(15,23,42,0.07)`;
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,213,225,0.9)'
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${visual.color}20`;
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.9)'
      }}
    >
      {/* Mode icon badge */}
      <div style={{
        width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
        background: visual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: visual.color,
      }}>
        {isValidElement<{ width?: number; height?: number }>(MODE_ICONS[mode.id as StudyModeId])
          ? cloneElement(MODE_ICONS[mode.id as StudyModeId] as React.ReactElement<{ width?: number; height?: number }>, { width: 15, height: 15 })
          : MODE_ICONS[mode.id as StudyModeId]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2,
          color: 'var(--text-primary)', marginBottom: '0.2rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
        }}>
          <span style={{ color: visual.color, fontWeight: 500, opacity: 0.85, flexShrink: 0 }}>
            {mode.name}
          </span>
          {subtitle && (
            <>
              <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
              <span style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtitle}
              </span>
            </>
          )}
          <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
          <span style={{ flexShrink: 0 }}>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      {/* ⋮ menu */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.2rem 0.3rem',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            opacity: hovered || menuOpen ? 1 : 0,
            transition: 'opacity 0.15s, background 0.12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
            background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px',
          }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-muted)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.4 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  )
}

function ProjectCard({
  project, mode, onClick, onDelete,
}: {
  project: Project
  mode: StudyModeConfig
  onClick: () => void
  onDelete: () => void
}) {
  const visual = modeVisual(mode.id as StudyModeId)
  const isCompleted = project.status === 'completed'
  const isPassage   = mode.passageBased
  const subtitle = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: '1px solid rgba(226,232,240,0.9)',
        borderRadius: '7px',
        padding: '0.7rem 1rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        position: 'relative',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 12px rgba(15,23,42,0.07)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,213,225,0.9)'
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.9)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.25,
          color: 'var(--text-primary)', marginBottom: '0.18rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
        }}>
          {subtitle && (
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic',
            }}>
              {subtitle}
            </span>
          )}
          {subtitle && <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>}
          <span style={{ flexShrink: 0 }}>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      <span style={{
        fontSize: '0.7rem', fontWeight: isCompleted ? 600 : 400, flexShrink: 0,
        color: isCompleted ? '#16a34a' : 'var(--text-muted)',
        opacity: isCompleted ? 1 : 0.75,
      }}>
        {statusLabel(project.status)}
      </span>

      {/* ⋮ menu */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.2rem 0.3rem',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            opacity: hovered || menuOpen ? 1 : 0,
            transition: 'opacity 0.15s, background 0.12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
            background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px',
          }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  async function handleStartDemo() {
    setStarting(true)
    try {
      const res  = await fetch('/api/projects/demo', { method: 'POST' })
      const data = await res.json() as { id?: string; error?: string }
      if (data.id) router.push(`/workspace/${data.id}`)
    } catch { /* noop */ }
    finally { setStarting(false) }
  }

  return (
    <div style={{
      borderRadius: '16px', overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
    }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a2540 100%)',
        padding: '3rem 2.5rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '1rem',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'rgba(201,146,26,0.18)', border: '1.5px solid rgba(201,146,26,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '0.25rem',
        }}>📖</div>

        <h2 style={{
          margin: 0, fontSize: '1.5rem', fontWeight: 750,
          color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Bem-vindo ao Lampas
        </h2>
        <p style={{
          margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.65, maxWidth: '420px',
        }}>
          Antes de criar seu próprio estudo, percorra um estudo guiado e conheça o método — do texto ao coração.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          marginTop: '0.25rem',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(201,146,26,0.85)', marginBottom: '0.15rem' }}>
              Estudo guiado
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>João 3.16 — Devocional</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>8 etapas · Preparar → Contemplar → Responder</div>
          </div>
        </div>

        <button
          onClick={handleStartDemo}
          disabled={starting}
          style={{
            marginTop: '0.5rem',
            background: starting ? 'rgba(201,146,26,0.6)' : 'linear-gradient(135deg, #C9921A 0%, #D97706 100%)',
            color: '#FFFFFF', border: 'none',
            borderRadius: '10px', padding: '0.7rem 1.75rem',
            fontWeight: 700, cursor: starting ? 'wait' : 'pointer',
            fontSize: '0.92rem', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(201,146,26,0.3)',
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            transition: 'all 0.15s',
          }}
        >
          {starting ? 'Criando estudo…' : '→ Iniciar estudo guiado'}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        background: 'var(--surface)', padding: '1rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prefere começar direto?</span>
        <button onClick={onNew} style={{
          background: 'transparent', border: 'none',
          color: 'var(--accent)', fontWeight: 600,
          cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
          padding: 0,
        }}>
          Criar meu próprio estudo
        </button>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)',
        marginBottom: '0.35rem', textTransform: 'uppercase',
        letterSpacing: '0.07em', fontWeight: '600',
      }}>
        {label}
      </label>
      <style>{`
        .field-input input, .field-input select {
          width: 100%; padding: 0.6rem 0.85rem;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 7px; color: var(--text-primary);
          font-size: 0.92rem; outline: none; font-family: inherit;
          transition: border-color 0.15s; box-sizing: border-box;
        }
        .field-input input:focus, .field-input select:focus { border-color: var(--accent); }
        .field-input select option { background: var(--surface-2); }
      `}</style>
      <div className="field-input">{children}</div>
    </div>
  )
}
