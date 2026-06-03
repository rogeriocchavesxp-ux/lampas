'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LampasMarkIcon } from '@/components/LampasLogo'
import type { User } from '@supabase/supabase-js'
import type { Project, Profile } from '@/types/database'
import {
  STUDY_MODE_REGISTRY,
  getModeConfig,
  type StudyModeId,
  type StudyModeConfig,
} from '@/lib/study-modes'

const LEGACY_TYPE: Record<StudyModeId, string> = {
  exegese_biblica:      'exegese',
  estudo_de_carta:      'exegese',
  estudo_doutrinario:   'estudo_doutrinario',
  estudo_tematico:      'estudo_doutrinario',
  sermao:               'sermao',
  estudo_biblico:       'estudo_biblico',
  devocional:           'devocional',
  comentario_exegetico: 'exegese',
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

// Order sections appear in the dashboard
const SECTION_ORDER: StudyModeId[] = [
  'devocional',
  'sermao',
  'estudo_biblico',
  'estudo_doutrinario',
  'estudo_tematico',
  'exegese_biblica',
  'estudo_de_carta',
  'comentario_exegetico',
]

// Order modes appear in the "new project" modal
const MODE_ORDER: StudyModeId[] = [
  'exegese_biblica',
  'estudo_de_carta',
  'sermao',
  'estudo_biblico',
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

function statusColor(s: string): string {
  return { draft: 'var(--accent)', in_progress: 'var(--accent)', completed: 'var(--success)', archived: 'var(--text-muted)' }[s] ?? 'var(--text-muted)'
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Modal state
  const [showNew,      setShowNew]     = useState(false)
  const [modalStep,    setModalStep]   = useState<'mode' | 'form'>('mode')
  const [selectedMode, setSelectedMode] = useState<StudyModeId | null>(null)
  const [creating,     setCreating]    = useState(false)
  const [createError,  setCreateError] = useState<string | null>(null)
  const [form,         setForm]        = useState({
    title: '', book: '', passage_ref: '', topic: '', testament: 'NT' as 'AT' | 'NT',
  })

  // Dashboard filter & collapse state
  const [activeFilter,      setActiveFilter]      = useState<StudyModeId | 'all'>('all')
  const [collapsedSections, setCollapsedSections] = useState<Set<StudyModeId>>(new Set())

  const modeConfig = selectedMode ? STUDY_MODE_REGISTRY[selectedMode] : null

  // Group projects by resolved study mode
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

  // Sections visible given the active filter
  const visibleSections = useMemo(() => {
    if (activeFilter !== 'all') return [activeFilter]
    return SECTION_ORDER.filter(id => (projectsByMode.get(id)?.length ?? 0) > 0)
  }, [activeFilter, projectsByMode])

  // Filter pills — only modes that have at least 1 project
  const filterModes = useMemo(
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
    setForm({ title: '', book: '', passage_ref: '', topic: '', testament: 'NT' })
    setShowNew(true)
  }

  function closeModal() { setShowNew(false) }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)

    if (!form.title.trim()) {
      setCreateError('O título é obrigatório.')
      return
    }
    if (!selectedMode || !modeConfig) return

    const isPassage = modeConfig.passageBased

    if (isPassage && !form.book) {
      setCreateError('Selecione o livro.')
      return
    }
    if (isPassage && !form.passage_ref.trim()) {
      setCreateError(`${modeConfig.passageLabel} é obrigatório.`)
      return
    }
    if (!isPassage && !form.topic.trim()) {
      setCreateError(`${modeConfig.topicLabel} é obrigatório.`)
      return
    }

    const payload = {
      user_id:           user.id,
      title:             form.title.trim(),
      book:              isPassage ? form.book : '—',
      passage_ref:       isPassage ? form.passage_ref.trim() : form.topic.trim(),
      testament:         isPassage ? form.testament : 'AT',
      original_language: isPassage ? (form.testament === 'AT' ? 'hebraico' : 'grego') : '—',
      bible_version:     'NAA',
      status:            'draft',
      study_mode:        selectedMode,
      project_type:      LEGACY_TYPE[selectedMode] ?? 'exegese',
      meta:              isPassage ? {} : { topic: form.topic.trim() },
    }

    console.log('[Lampas] Criando projeto', payload)
    setCreating(true)

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select()
        .single()

      console.log('[Lampas] Resposta criação', { data, error })

      if (error) {
        console.error('[Lampas] Erro ao criar projeto', error)
        setCreateError('Não foi possível criar o projeto. Tente novamente.')
        return
      }

      if (data) {
        router.push(`/workspace/${data.id}`)
      }
    } catch (err) {
      console.error('[Lampas] Erro inesperado ao criar projeto', err)
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)', padding: '0 2rem',
        height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: 'var(--surface)',
      }}>
        <LampasMarkIcon size={36} />
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
          <button onClick={handleSignOut} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
          }}>Sair</button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Title row + new project button */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Estudos</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {projects.length === 0
                ? 'Nenhum projeto ainda'
                : `${projects.length} ${projects.length === 1 ? 'projeto' : 'projetos'} no total`}
            </p>
          </div>
          <button onClick={openModal} style={{
            background: 'var(--accent)', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: '600',
            cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
          }}>
            + Novo Projeto
          </button>
        </div>

        {/* Filter bar — only when there are multiple section types */}
        {filterModes.length > 1 && (
          <div style={{
            display: 'flex', gap: '0.4rem', marginBottom: '2rem',
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            <FilterPill
              active={activeFilter === 'all'}
              color="var(--accent)"
              onClick={() => setActiveFilter('all')}
            >
              Todos ({projects.length})
            </FilterPill>
            {filterModes.map(id => {
              const mode = STUDY_MODE_REGISTRY[id]
              const count = projectsByMode.get(id)?.length ?? 0
              return (
                <FilterPill
                  key={id}
                  active={activeFilter === id}
                  color={mode.color}
                  onClick={() => setActiveFilter(id)}
                >
                  {mode.name} ({count})
                </FilterPill>
              )
            })}
          </div>
        )}

        {/* Content */}
        {projects.length === 0 ? (
          <EmptyDashboard onNew={openModal} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {visibleSections.map(modeId => {
              const mode = STUDY_MODE_REGISTRY[modeId]
              const modeProjects = projectsByMode.get(modeId) ?? []
              const isCollapsed = collapsedSections.has(modeId)
              return (
                <section key={modeId}>
                  {/* Section header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    paddingBottom: '0.625rem',
                    borderBottom: `1px solid var(--border-subtle)`,
                    marginBottom: isCollapsed ? 0 : '0.875rem',
                  }}>
                    <span style={{ color: mode.color, display: 'flex', flexShrink: 0 }}>
                      {MODE_ICONS[modeId]}
                    </span>
                    <span style={{
                      fontSize: '0.88rem', fontWeight: 700,
                      color: 'var(--text-primary)', flex: 1,
                      display: 'flex', alignItems: 'center', gap: '0.45rem',
                    }}>
                      {mode.name}
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 500,
                        color: 'var(--text-muted)', background: 'var(--surface-2)',
                        borderRadius: '10px', padding: '0.1rem 0.5rem',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        {modeProjects.length}
                      </span>
                    </span>
                    {activeFilter !== modeId && (
                      <button
                        onClick={() => setActiveFilter(modeId)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'inherit',
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = mode.color }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        Ver todos
                      </button>
                    )}
                    <button
                      onClick={() => toggleSection(modeId)}
                      title={isCollapsed ? 'Expandir' : 'Recolher'}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                        padding: '0.2rem', borderRadius: '4px', transition: 'color 0.13s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s' }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  </div>

                  {/* Cards */}
                  {!isCollapsed && (
                    <div style={{ display: 'grid', gap: '0.55rem' }}>
                      {modeProjects.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', padding: '0.75rem 0' }}>
                          Nenhum projeto neste modo ainda.
                        </p>
                      ) : (
                        modeProjects.map(p => (
                          <ProjectCard
                            key={p.id}
                            project={p}
                            mode={mode}
                            onClick={() => router.push(`/workspace/${p.id}`)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </section>
              )
            })}
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
                  <h2 style={{ marginBottom: '0.3rem', fontSize: '1.15rem' }}>Novo Projeto</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Escolha o modo de estudo
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {MODE_ORDER.map(modeId => {
                    const mode = STUDY_MODE_REGISTRY[modeId]
                    const active = selectedMode === modeId
                    return (
                      <button
                        key={modeId}
                        onClick={() => setSelectedMode(modeId)}
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
                            e.currentTarget.style.background = `${mode.color}05`
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)'
                            e.currentTarget.style.background = 'var(--surface-2)'
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
                  <FormField label="Título">
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={modeConfig.titlePlaceholder}
                      required autoFocus
                    />
                  </FormField>

                  {modeConfig.passageBased ? (
                    <>
                      <FormField label="Testamento">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(['NT', 'AT'] as const).map(t => (
                            <button key={t} type="button"
                              onClick={() => setForm(f => ({ ...f, testament: t, book: '' }))}
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
                          onChange={e => setForm(f => ({ ...f, book: e.target.value }))}
                          required
                        >
                          <option value="">Selecione o livro</option>
                          {(form.testament === 'NT' ? BOOKS_NT : BOOKS_AT).map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label={modeConfig.passageLabel}>
                        <input
                          value={form.passage_ref}
                          onChange={e => setForm(f => ({ ...f, passage_ref: e.target.value }))}
                          placeholder="Ex: 3.1-21"
                          required
                        />
                      </FormField>
                    </>
                  ) : (
                    <FormField label={modeConfig.topicLabel}>
                      <input
                        value={form.topic}
                        onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                        placeholder={modeConfig.titlePlaceholder}
                        required
                      />
                    </FormField>
                  )}

                  {createError && (
                    <div style={{
                      color: '#DC2626',
                      background: 'rgba(220,38,38,0.06)',
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
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FilterPill({
  active, color, onClick, children,
}: {
  active: boolean
  color: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.85rem',
        borderRadius: '20px',
        border: `1px solid ${active ? color : 'var(--border)'}`,
        background: active ? `${color}12` : 'transparent',
        color: active ? color : 'var(--text-secondary)',
        fontSize: '0.8rem', fontWeight: active ? 600 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.13s',
      }}
    >
      {children}
    </button>
  )
}

function ProjectCard({
  project, mode, onClick,
}: {
  project: Project
  mode: StudyModeConfig
  onClick: () => void
}) {
  const isPassage = mode.passageBased
  const subtitle = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : null

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '1rem 1.25rem',
        cursor: 'pointer', transition: 'border-color 0.15s',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      {/* Mode icon badge */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
        background: `${mode.color}12`, border: `1px solid ${mode.color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: mode.color,
      }}>
        {MODE_ICONS[mode.id as StudyModeId]}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '0.92rem',
          color: 'var(--text-primary)', marginBottom: '0.2rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        {subtitle && (
          <div style={{
            fontSize: '0.78rem', color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Right side: status + date */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: '0.3rem', flexShrink: 0,
      }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 600,
          color: statusColor(project.status),
          background: `${statusColor(project.status)}12`,
          borderRadius: '4px', padding: '0.12rem 0.45rem',
          border: `1px solid ${statusColor(project.status)}28`,
        }}>
          {statusLabel(project.status)}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {formatDate(project.updated_at)}
        </span>
      </div>
    </div>
  )
}

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  return (
    <div style={{
      textAlign: 'center', padding: '4rem 2rem',
      background: 'var(--surface)', borderRadius: '12px',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="var(--border)" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
        </svg>
      </div>
      <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nenhum estudo ainda</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
        Comece escolhendo um modo de estudo
      </p>
      <button onClick={onNew} style={{
        background: 'var(--accent)', color: '#FFFFFF', border: 'none',
        borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: '600',
        cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
      }}>
        Criar primeiro estudo
      </button>
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
