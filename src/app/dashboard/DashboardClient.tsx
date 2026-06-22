'use client'

import { useState, useMemo, useEffect, cloneElement, isValidElement } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Project, Profile } from '@/types/database'
import {
  STUDY_MODE_REGISTRY,
  getModeConfig,
  type StudyModeId,
  type StudyModeConfig,
} from '@/lib/study-modes'
import pkg from '../../../package.json'
import UpcomingEventsWidget from '@/components/agenda/UpcomingEventsWidget'
import type { CreationGroupId, UiModeId, PublishedCategoryId, SermonType, ProjectForm } from './dashboard-types'
import { detectStudyMode, parseBiblicalRef, formatDate, publishedCategoryFor, buildReferenceTitle, createInitialForm, LEGACY_TYPE, BOOKS_AT, BOOKS_NT, UI_MODES, CREATION_GROUPS, DETECTED_LABEL, PUBLISHED_CATEGORIES, SERMON_TYPE_OPTIONS } from './dashboard-types'
import { ShelfLabel, RecentCard, ProjectCard, PublishedProjectCard, CollapseHeader, DashLabel, StudyCard, DonutChart, BibleMap, EmptyDashboard, FormField } from './dashboard-sub-components'

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects: initialProjects, profile }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = useMemo(() => createClient(), [])

  // Local projects list — allows optimistic removal on delete
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  // Modal state
  const [showNew,        setShowNew]       = useState(false)
  const [modalStep,      setModalStep]     = useState<'mode' | 'form'>('mode')
  const [selectedCreationGroup, setSelectedCreationGroup] = useState<CreationGroupId | null>(null)
  const [selectedUiMode, setSelectedUiMode]= useState<UiModeId | null>(null)
  const [selectedMode,   setSelectedMode]  = useState<StudyModeId | null>(null)
  const [creating,       setCreating]      = useState(false)
  const [createError,    setCreateError]   = useState<string | null>(null)
  const [titleEdited,    setTitleEdited]   = useState(false)
  const [form,           setForm]          = useState<ProjectForm>(createInitialForm())
  const [estudarType,    setEstudarType]   = useState<'texto' | 'tema' | 'doutrina' | 'termo' | null>(null)
  const [estudarQuery,   setEstudarQuery]  = useState('')
  const [detectedRef,    setDetectedRef]   = useState<{ book: string; testament: 'AT' | 'NT'; passage: string; studyMode: StudyModeId } | null>(null)

  // Trial state
  const [showTrialActivation, setShowTrialActivation] = useState(false)
  const [pendingPayload,       setPendingPayload]      = useState<Record<string, unknown> | null>(null)
  const [activatingTrial,      setActivatingTrial]     = useState(false)

  const trialStatus = useMemo(() => {
    const startedAt  = profile?.trial_started_at
    const expiresAt  = profile?.trial_expires_at
    if (!startedAt || !expiresAt) return { state: 'not_started' as const }
    const now     = new Date()
    const expires = new Date(expiresAt)
    if (expires > now) {
      const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { state: 'active' as const, daysLeft }
    }
    return { state: 'expired' as const }
  }, [profile])

  // View state
  const [dashView, setDashView] = useState<'lista' | 'livro'>('lista')

  // Delete state
  const [deleteTarget,     setDeleteTarget]     = useState<Project | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const modeConfig = selectedMode ? STUDY_MODE_REGISTRY[selectedMode] : null

  const dashboardProjects = useMemo(() => {
    const seen = new Set<string>()
    return projects.filter(project => {
      if (seen.has(project.id)) return false
      seen.add(project.id)
      return true
    })
  }, [projects])

  const activeProjects = useMemo(
    () => dashboardProjects.filter(project => project.status !== 'completed'),
    [dashboardProjects],
  )

  const completedProjects = useMemo(
    () => dashboardProjects.filter(project => project.status === 'completed'),
    [dashboardProjects],
  )

  const RECENT_LIMIT = 6
  const recentActiveProjects4 = useMemo(() => activeProjects.slice(0, RECENT_LIMIT), [activeProjects])
  const activeCount      = activeProjects.length
  const completedCount   = completedProjects.length
  const totalCount       = dashboardProjects.length
  // Invariant: totalCount === activeCount + completedCount (every project has status)
  const studiedBooks     = useMemo(() => new Set(dashboardProjects.map(p => p.book).filter((b): b is string => !!b && b !== '—')), [dashboardProjects])

  const ALL_BOOKS = useMemo(() => [...BOOKS_AT, ...BOOKS_NT], [])

  const projectsByBook = useMemo(() => {
    const map = new Map<string, Project[]>()
    for (const p of dashboardProjects) {
      const key = (p.book && p.book !== '—') ? p.book : '__sem_livro__'
      map.set(key, [...(map.get(key) ?? []), p])
    }
    return map
  }, [dashboardProjects])

  const booksSorted = useMemo(() => {
    const withBook = [...projectsByBook.keys()].filter(k => k !== '__sem_livro__')
    withBook.sort((a, b) => {
      const ai = ALL_BOOKS.indexOf(a)
      const bi = ALL_BOOKS.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b, 'pt-BR')
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return withBook
  }, [projectsByBook, ALL_BOOKS])

  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set())

  function toggleBook(book: string) {
    setExpandedBooks(prev => {
      const next = new Set(prev)
      if (next.has(book)) next.delete(book); else next.add(book)
      return next
    })
  }

  const publishedProjects = useMemo(
    () => dashboardProjects.filter(project => project.published),
    [dashboardProjects],
  )

  const publishedByCategory = useMemo(() => {
    const map = new Map<PublishedCategoryId, Project[]>()
    for (const category of PUBLISHED_CATEGORIES) map.set(category.id, [])
    for (const project of publishedProjects) {
      const category = publishedCategoryFor(project)
      map.set(category, [...(map.get(category) ?? []), project])
    }
    return map
  }, [publishedProjects])

  async function updatePublishedProject(projectId: string, published: boolean) {
    const publishedAt = published ? new Date().toISOString() : null
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, published, published_at: publishedAt } : project
    ))
    const { error } = await supabase
      .from('projects')
      .update({ published, published_at: publishedAt })
      .eq('id', projectId)
      .eq('user_id', user.id)
    if (error) {
      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, published: !published } : project
      ))
    }
  }

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

  function openModal() {
    setModalStep('mode')
    setSelectedCreationGroup(null)
    setSelectedUiMode(null)
    setSelectedMode(null)
    setCreating(false)
    setCreateError(null)
    setTitleEdited(false)
    setForm(createInitialForm())
    setEstudarType(null)
    setEstudarQuery('')
    setDetectedRef(null)
    setShowNew(true)
  }

  function closeModal() { setShowNew(false) }

  // Auto-open modal when navigated with ?new=1 (from TopNav)
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openModal()
      router.replace('/dashboard', { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectUiMode(uid: UiModeId) {
    setSelectedUiMode(uid)
    setCreateError(null)
    setTitleEdited(false)
    setForm(createInitialForm())
    switch (uid) {
      case 'sermao':      setSelectedMode('sermao'); break
      case 'devocional':  setSelectedMode('devocional'); break
      case 'aula':        setSelectedMode('aula'); break
      case 'estudo_biblico': setSelectedMode('estudo_biblico'); break
      case 'artigo':      setSelectedMode('artigo'); break
      case 'ebook':       setSelectedMode('ebook'); break
      case 'livro':       setSelectedMode('livro'); break
      case 'palestra':    setSelectedMode('palestra'); break
      case 'curso':       setSelectedMode('curso'); break
      case 'serie_mensagens': setSelectedMode('serie_mensagens'); break
      case 'doutrinario': setSelectedMode('estudo_doutrinario'); break
      case 'tematico':    setSelectedMode('estudo_tematico'); break
      case 'termos':      setSelectedMode('estudo_termos'); break
      case 'exegetico':   setSelectedMode(null); break
      case 'conhecimento': setSelectedMode(null); break
    }
  }

  // Detecção automática de referência bíblica ao digitar no campo Estudar
  useEffect(() => {
    const q = estudarQuery.trim()
    if (!q) { setDetectedRef(null); return }
    const ref = parseBiblicalRef(q)
    if (ref) {
      setDetectedRef(ref)
      setEstudarType('texto')
      setSelectedUiMode('exegetico')
      setSelectedMode(ref.studyMode)
    } else {
      setDetectedRef(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estudarQuery])

  // Detecção automática de gênero ao escolher o livro no modo exegético
  useEffect(() => {
    if (selectedUiMode !== 'exegetico' || !form.book) return
    setSelectedMode(detectStudyMode(form.book))
  }, [selectedUiMode, form.book])

  async function createStudyDirect() {
    if (!detectedRef) return
    setCreateError(null)
    setCreating(true)
    const title = buildReferenceTitle(detectedRef.book, detectedRef.passage)
    const payload = {
      user_id:           user.id,
      title,
      book:              detectedRef.book,
      passage_ref:       detectedRef.passage,
      testament:         detectedRef.testament,
      original_language: detectedRef.testament === 'AT' ? 'hebraico' : 'grego',
      bible_version:     'ACF',
      status:            'draft',
      study_mode:        detectedRef.studyMode,
      project_type:      LEGACY_TYPE[detectedRef.studyMode] ?? 'exegese',
      meta:              { creation_ui_mode: 'exegetico' },
      published:         false,
    }
    try {
      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) { setCreateError(`Erro: ${error.message}`); return }
      if (data) {
        setProjects(prev => [data as Project, ...prev])
        void supabase.rpc('log_activity', { p_event_type: 'project_created', p_entity_type: 'project', p_entity_id: data.id })
        router.push(`/workspace/${data.id}`)
      }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  async function createTopicDirect(uiModeId: 'tematico' | 'doutrinario' | 'termos', topic: string) {
    const modeMap: Record<string, StudyModeId> = {
      tematico: 'estudo_tematico', doutrinario: 'estudo_doutrinario', termos: 'estudo_termos',
    }
    const studyMode = modeMap[uiModeId] as StudyModeId
    setCreateError(null)
    setCreating(true)
    const payload = {
      user_id:           user.id,
      title:             topic,
      book:              '—',
      passage_ref:       topic,
      testament:         'AT' as const,
      original_language: 'hebraico',
      bible_version:     'ACF',
      status:            'draft',
      study_mode:        studyMode,
      project_type:      LEGACY_TYPE[studyMode] ?? 'estudo_doutrinario',
      meta:              { topic, creation_ui_mode: uiModeId },
      published:         false,
    }
    try {
      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) { setCreateError(`Erro: ${error.message}`); return }
      if (data) {
        setProjects(prev => [data as Project, ...prev])
        void supabase.rpc('log_activity', { p_event_type: 'project_created', p_entity_type: 'project', p_entity_id: data.id })
        router.push(`/workspace/${data.id}`)
      }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)

    if (!selectedMode || !selectedUiMode) return

    const isTopicProduction = ['aula', 'artigo', 'ebook', 'livro', 'palestra', 'curso', 'serie_mensagens'].includes(selectedUiMode)
    const isPassage     = selectedUiMode !== 'doutrinario' && selectedUiMode !== 'tematico' && selectedUiMode !== 'termos' && !isTopicProduction
    const isSermon      = selectedUiMode === 'sermao'
    const generatedTitle = isPassage ? buildReferenceTitle(form.book, form.passage_ref) : form.topic.trim()
    const projectTitle  = form.title.trim() || generatedTitle

    if (isSermon && !form.sermon_type)         { setCreateError('Escolha o tipo de sermão.'); return }
    if (isPassage && !form.testament)          { setCreateError('Escolha o testamento.'); return }
    if (isPassage && !form.book)               { setCreateError('Selecione o livro.'); return }
    if (isPassage && !form.passage_ref.trim()) { setCreateError('Passagem é obrigatória.'); return }
    if (!isPassage && !form.topic.trim())      { setCreateError(selectedUiMode === 'termos' ? 'Termo é obrigatório.' : 'Doutrina ou tema é obrigatório.'); return }
    if (!projectTitle)                         { setCreateError('Informe os dados do estudo para gerar o título.'); return }

    const payload = {
      user_id:           user.id,
      title:             projectTitle,
      book:              isPassage ? form.book : '—',
      passage_ref:       isPassage ? form.passage_ref.trim() : form.topic.trim(),
      testament:         isPassage ? form.testament : 'AT',
      original_language: isPassage ? (form.testament === 'AT' ? 'hebraico' : 'grego') : 'hebraico',
      bible_version:     'ACF',
      status:            'draft',
      study_mode:        selectedMode,
      project_type:      LEGACY_TYPE[selectedMode] ?? 'exegese',
      meta:              isPassage
        ? {
          creation_ui_mode: selectedUiMode,
          ...(isSermon ? { sermon_type: form.sermon_type } : {}),
        }
        : { topic: form.topic.trim(), creation_ui_mode: selectedUiMode },
      published:         false,
    }

    // First project + trial not yet started → show trial activation screen
    if (projects.length === 0 && !profile?.trial_started_at) {
      setPendingPayload(payload)
      setShowNew(false)
      setShowTrialActivation(true)
      return
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
        void supabase.rpc('log_activity', { p_event_type: 'project_created', p_entity_type: 'project', p_entity_id: data.id })
        router.push(`/workspace/${data.id}`)
      }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  async function activateTrial() {
    if (!pendingPayload) return
    setActivatingTrial(true)
    try {
      const now     = new Date()
      const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      await supabase.from('profiles').update({
        trial_started_at: now.toISOString(),
        trial_expires_at: expires.toISOString(),
      }).eq('id', user.id)

      const { data, error } = await supabase.from('projects').insert(pendingPayload).select().single()
      if (error) {
        console.error('[Lampas] Erro ao criar projeto após ativar trial', error.message)
        setActivatingTrial(false)
        setShowTrialActivation(false)
        return
      }
      if (data) {
        setProjects(prev => [data as Project, ...prev])
        void supabase.rpc('log_activity', { p_event_type: 'project_created', p_entity_type: 'project', p_entity_id: data.id })
        router.push(`/workspace/${data.id}`)
      }
    } catch {
      setActivatingTrial(false)
    }
  }

  const generatedProjectTitle = modeConfig?.passageBased
    ? buildReferenceTitle(form.book, form.passage_ref)
    : form.topic.trim()
  const canShowGeneratedTitle = Boolean(generatedProjectTitle)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* ── Sub-header ── */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)', padding: '0 2rem',
        height: '44px', display: 'flex', alignItems: 'center',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            Painel
          </span>
          <span style={{ fontSize: '0.55rem', color: 'var(--border)' }}>·</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            v{pkg.version}
          </span>
        </div>
      </header>

      {/* ── Trial banner ── */}
      {trialStatus.state === 'active' && trialStatus.daysLeft <= 3 && (
        <div style={{
          background: 'rgba(201,146,26,0.08)',
          borderBottom: '1px solid rgba(201,146,26,0.18)',
          padding: '0.65rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Seu período de avaliação do Lampas Premium termina em{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {trialStatus.daysLeft === 1 ? 'hoje' : `${trialStatus.daysLeft} dias`}
            </strong>
            . Esperamos que o Lampas tenha sido útil para o seu ministério.
          </p>
          <a
            href="/billing"
            style={{
              fontSize: '0.82rem',
              fontWeight: 650,
              color: '#c9921a',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Escolher um plano
          </a>
        </div>
      )}
      {trialStatus.state === 'expired' && (
        <div style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.65rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Seu período de avaliação encerrou. Seus projetos e estudos estão preservados.
          </p>
          <a
            href="/billing"
            style={{
              fontSize: '0.82rem',
              fontWeight: 650,
              color: '#c9921a',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Escolher um plano para continuar
          </a>
        </div>
      )}

      {/* ── Trial activation modal ── */}
      {showTrialActivation && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '2.5rem',
            maxWidth: '520px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#c9921a', margin: '0 0 0.75rem' }}>
              Período de avaliação
            </p>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, fontFamily: 'EB Garamond, Georgia, serif' }}>
              Experimente o Lampas Premium gratuitamente por 7 dias.
            </h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Você terá acesso completo a todos os recursos da plataforma.
              Ao final do período, basta escolher o plano que melhor atende ao seu ministério.
              Nenhuma cobrança será realizada durante o teste.
            </p>
            <ul style={{ margin: '0 0 2rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'Todos os modos de estudo — Sermão, Exegético, Temático, Doutrinário',
                'IA exegética especializada sem limite',
                'Texto original em hebraico e grego',
                'Comentário expositivo versículo a versículo',
                'Sermão Builder com exportação em PDF',
                'Biblioteca, Dicionário e Referências Cruzadas',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.87rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: '#c9921a', fontWeight: 750, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={activateTrial}
              disabled={activatingTrial}
              style={{
                display: 'block', width: '100%',
                padding: '0.85rem',
                background: '#c9921a',
                color: '#fff',
                border: 'none',
                borderRadius: '9px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: activatingTrial ? 'default' : 'pointer',
                opacity: activatingTrial ? 0.7 : 1,
                fontFamily: 'inherit',
                marginBottom: '0.85rem',
              }}
            >
              {activatingTrial ? 'Iniciando…' : 'Iniciar meu teste gratuito'}
            </button>
            <button
              onClick={() => { setShowTrialActivation(false); setPendingPayload(null) }}
              disabled={activatingTrial}
              style={{
                display: 'block', width: '100%',
                padding: '0.6rem',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                borderRadius: '7px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* ── Hero ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '0 0 0.25rem' }}>
              Bem-vindo de volta.
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 0.3rem' }}>
              {totalCount === 0
                ? 'Comece seu primeiro projeto.'
                : activeCount > 0
                  ? `${activeCount} ${activeCount === 1 ? 'projeto ativo' : 'projetos ativos'}.`
                  : 'Todos os projetos concluídos.'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {completedCount > 0 ? `${completedCount} concluído${completedCount > 1 ? 's' : ''} · ` : ''}
              {totalCount} no total
              {studiedBooks.size > 0 ? ` · ${studiedBooks.size} ${studiedBooks.size === 1 ? 'livro bíblico' : 'livros bíblicos'}` : ''}
            </p>
          </div>
          <button onClick={openModal} style={{
            background: 'var(--accent)', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.62rem 1.15rem', fontWeight: 650,
            cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(30,77,140,0.18)', flexShrink: 0,
          }}>
            + Novo Projeto
          </button>
        </div>

        {totalCount === 0 ? (
          <EmptyDashboard onNew={openModal} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* ── Estudos ── */}
            <section>
              {/* Header com toggle de visualização */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <DashLabel>
                  {dashView === 'lista' ? 'Continuar Estudando' : 'Estudos por Livro'}
                </DashLabel>
                <div style={{
                  display: 'flex', background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)', borderRadius: '7px',
                  padding: '2px', gap: '2px',
                }}>
                  {([
                    { id: 'lista', label: 'Lista' },
                    { id: 'livro', label: 'Por Livro' },
                  ] as const).map(v => (
                    <button
                      key={v.id}
                      onClick={() => setDashView(v.id)}
                      style={{
                        background: dashView === v.id ? 'var(--surface)' : 'transparent',
                        border: dashView === v.id ? '1px solid var(--border-subtle)' : '1px solid transparent',
                        borderRadius: '5px',
                        padding: '0.22rem 0.7rem',
                        fontSize: '0.72rem', fontWeight: dashView === v.id ? 700 : 500,
                        color: dashView === v.id ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.12s',
                        boxShadow: dashView === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {dashView === 'lista' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem' }}>
                  {recentActiveProjects4.map(p => (
                    <StudyCard
                      key={p.id} project={p}
                      onClick={() => router.push(`/workspace/${p.id}`)}
                      onDelete={() => setDeleteTarget(p)}
                    />
                  ))}
                </div>
              ) : (
                /* ── Vista Por Livro ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {booksSorted.map(book => {
                    const bookProjects = projectsByBook.get(book) ?? []
                    const open = expandedBooks.has(book)
                    const testament = BOOKS_AT.includes(book) ? 'AT' : 'NT'
                    return (
                      <div key={book} style={{
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'var(--surface)',
                      }}>
                        <button
                          onClick={() => toggleBook(book)}
                          style={{
                            width: '100%', border: 'none', background: 'transparent',
                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                            padding: '0.75rem 1rem', cursor: 'pointer', fontFamily: 'inherit',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{
                            fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em',
                            color: testament === 'AT' ? '#B45309' : '#1E4D8C',
                            background: testament === 'AT' ? 'rgba(180,83,9,0.08)' : 'rgba(30,77,140,0.08)',
                            border: `1px solid ${testament === 'AT' ? 'rgba(180,83,9,0.25)' : 'rgba(30,77,140,0.2)'}`,
                            borderRadius: '4px', padding: '0.06rem 0.38rem',
                            flexShrink: 0,
                          }}>
                            {testament}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {book}
                          </span>
                          <span style={{
                            fontSize: '0.68rem', color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)', borderRadius: '99px',
                            padding: '0.05rem 0.42rem', flexShrink: 0,
                          }}>
                            {bookProjects.length}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {open ? '▲' : '▼'}
                          </span>
                        </button>
                        {open && (
                          <div style={{
                            borderTop: '1px solid var(--border-subtle)',
                            padding: '0.7rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '0.65rem',
                          }}>
                            {bookProjects.map(p => (
                              <StudyCard
                                key={p.id} project={p}
                                onClick={() => router.push(`/workspace/${p.id}`)}
                                onDelete={() => setDeleteTarget(p)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {/* Sem livro (temático, termos, etc.) */}
                  {(projectsByBook.get('__sem_livro__') ?? []).length > 0 && (() => {
                    const semLivroProjects = projectsByBook.get('__sem_livro__') ?? []
                    const open = expandedBooks.has('__sem_livro__')
                    return (
                      <div style={{
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'var(--surface)',
                      }}>
                        <button
                          onClick={() => toggleBook('__sem_livro__')}
                          style={{
                            width: '100%', border: 'none', background: 'transparent',
                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                            padding: '0.75rem 1rem', cursor: 'pointer', fontFamily: 'inherit',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{
                            fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em',
                            color: '#6D28D9',
                            background: 'rgba(109,40,217,0.07)',
                            border: '1px solid rgba(109,40,217,0.2)',
                            borderRadius: '4px', padding: '0.06rem 0.38rem',
                            flexShrink: 0,
                          }}>
                            Temático
                          </span>
                          <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Temas e Termos
                          </span>
                          <span style={{
                            fontSize: '0.68rem', color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)', borderRadius: '99px',
                            padding: '0.05rem 0.42rem', flexShrink: 0,
                          }}>
                            {semLivroProjects.length}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {open ? '▲' : '▼'}
                          </span>
                        </button>
                        {open && (
                          <div style={{
                            borderTop: '1px solid var(--border-subtle)',
                            padding: '0.7rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: '0.65rem',
                          }}>
                            {semLivroProjects.map(p => (
                              <StudyCard
                                key={p.id} project={p}
                                onClick={() => router.push(`/workspace/${p.id}`)}
                                onDelete={() => setDeleteTarget(p)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </section>

            {/* ── Próximos Eventos ── */}
            <section>
              <DashLabel>Próximos Compromissos</DashLabel>
              <div style={{ marginTop: '0.85rem' }}>
                <UpcomingEventsWidget />
              </div>
            </section>

            {/* ── Meus Projetos ── */}
            <section>
              <DashLabel>Meus Projetos</DashLabel>
              <div style={{
                marginTop: '0.85rem',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.1rem',
              }}>
                {publishedProjects.length === 0 ? (
                  <div style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Nenhum projeto publicado ainda.
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem' }}>
                      Publique um projeto pela Organização Homilética para vê-lo aqui.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    {PUBLISHED_CATEGORIES.map(category => {
                      const categoryProjects = publishedByCategory.get(category.id) ?? []
                      if (categoryProjects.length === 0) return null
                      return (
                        <div key={category.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.55rem' }}>
                            <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                              {category.label}
                            </h3>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: '999px', padding: '0.05rem 0.42rem' }}>
                              {categoryProjects.length}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '0.7rem' }}>
                            {categoryProjects.map(project => (
                              <PublishedProjectCard
                                key={project.id}
                                project={project}
                                category={category.label}
                                onOpen={() => {
                                  const mode = getModeConfig(project.study_mode ?? project.project_type)
                                  router.push(mode.id === 'sermao'
                                    ? `/workspace/${project.id}?section=sermao_dispositio&view=preview&reader=published`
                                    : `/workspace/${project.id}`)
                                }}
                                onUnpublish={() => updatePublishedProject(project.id, false)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ── Stats ── */}
            <section>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                {([
                  { label: 'Total',          value: totalCount,       color: 'var(--accent)', icon: '📚' },
                  { label: 'Em andamento',   value: activeCount,      color: '#D97706',       icon: '⏳' },
                  { label: 'Concluídos',     value: completedCount,   color: '#10B981',       icon: '✓'  },
                  { label: 'Livros bíblicos', value: studiedBooks.size, color: '#7C3AED',      icon: '🗺' },
                ] as const).map(stat => (
                  <div key={stat.label} style={{
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '12px', padding: '1.1rem 1.2rem',
                  }}>
                    <div style={{ fontSize: '1.05rem', marginBottom: '0.4rem', lineHeight: 1 }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: '0.2rem' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* ── New project modal ── */}
      {showNew && (
        <div
          className="lp-fixed-overlay"
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
            maxWidth: modalStep === 'mode' ? '520px' : '480px',
            animation: 'fadeIn 0.15s ease-out',
            transition: 'max-width 0.2s ease',
          }}>

            {/* Step 1: Work-flow selection */}
            {modalStep === 'mode' && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ marginBottom: '0.3rem', fontSize: '1.15rem' }}>Novo Projeto</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    {!selectedCreationGroup
                      ? 'Estudar a Escritura ou armazenar conhecimento?'
                      : selectedCreationGroup === 'estudar'
                        ? 'O que você deseja estudar?'
                        : 'O que deseja armazenar?'}
                  </p>
                </div>

                {!selectedCreationGroup ? (
                  /* ── Escolha principal: Estudar / Biblioteca ── */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                    {CREATION_GROUPS.map(group => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedCreationGroup(group.id)
                          setSelectedUiMode(null)
                          setEstudarType(null)
                        }}
                        style={{
                          textAlign: 'left', padding: '1.4rem 1.25rem',
                          background: 'var(--surface-2)',
                          border: '1.5px solid var(--border-subtle)',
                          borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
                          minHeight: '140px',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = `${group.color}55`
                          e.currentTarget.style.background  = `${group.color}06`
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)'
                          e.currentTarget.style.background  = 'var(--surface-2)'
                        }}
                      >
                        <div style={{ fontSize: '1.65rem', marginBottom: '0.7rem' }}>{group.emoji}</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: group.color, marginBottom: '0.5rem' }}>{group.label}</div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                          {group.description}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : selectedCreationGroup === 'estudar' ? (
                  /* ── Estudar: campo de busca + tipo ── */
                  <>
                    <button
                      onClick={() => { setSelectedCreationGroup(null); setSelectedUiMode(null); setEstudarType(null); setEstudarQuery(''); setCreateError(null) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'inherit' }}
                    >
                      ← Voltar
                    </button>

                    <div style={{ marginBottom: detectedRef ? '0.6rem' : '1rem' }}>
                      <input
                        value={estudarQuery}
                        onChange={e => setEstudarQuery(e.target.value)}
                        placeholder="Ex: João 4 · Romanos 8 · Comunhão · Justificação · Família"
                        autoFocus
                        style={{
                          width: '100%', padding: '0.65rem 0.9rem',
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          borderRadius: '8px', color: 'var(--text-primary)',
                          fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit',
                          boxSizing: 'border-box' as const,
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                      />
                    </div>

                    {detectedRef && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        background: '#0F766E0A', border: '1px solid #0F766E30',
                        borderRadius: '7px', padding: '0.4rem 0.75rem',
                        marginBottom: '0.75rem', fontSize: '0.78rem',
                      }}>
                        <span style={{ color: '#0F766E', fontWeight: 700 }}>✓</span>
                        <span style={{ color: '#0F766E', fontWeight: 600 }}>{detectedRef.book} {detectedRef.passage}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-muted)' }}>{detectedRef.testament === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.68rem' }}>detectado automaticamente</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' }}>
                      {([
                        { id: 'texto'    as const, label: 'Texto Bíblico', desc: 'Análise de uma passagem específica da Escritura', uiMode: 'exegetico'   as UiModeId },
                        { id: 'tema'     as const, label: 'Tema',          desc: 'Rastreie um tema ao longo de toda a Escritura',    uiMode: 'tematico'    as UiModeId },
                        { id: 'doutrina' as const, label: 'Doutrina',      desc: 'Investigue sistematicamente uma doutrina bíblica', uiMode: 'doutrinario' as UiModeId },
                        { id: 'termo'    as const, label: 'Termo',         desc: 'Estude palavras bíblicas em profundidade',          uiMode: 'termos'      as UiModeId },
                      ] as const).map(option => {
                        const sel = estudarType === option.id
                        const color = '#0F766E'
                        return (
                          <button
                            key={option.id}
                            onClick={() => { setEstudarType(option.id); selectUiMode(option.uiMode) }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.85rem',
                              textAlign: 'left', padding: '0.7rem 0.9rem',
                              background: sel ? `${color}0A` : 'var(--surface-2)',
                              border: `1.5px solid ${sel ? color : 'var(--border-subtle)'}`,
                              borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'all 0.13s',
                            }}
                          >
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${sel ? color : 'var(--border)'}`,
                              background: sel ? color : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {sel && <div style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%' }} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: sel ? 700 : 500, color: sel ? color : 'var(--text-primary)' }}>
                                {option.label}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.08rem' }}>
                                {option.desc}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  /* ── Biblioteca: grid de tipos de conteúdo ── */
                  <>
                    <button
                      onClick={() => { setSelectedCreationGroup(null); setSelectedUiMode(null); setCreateError(null) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'inherit' }}
                    >
                      ← Voltar
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginBottom: '1.5rem' }}>
                      {([
                        { emoji: '🎓', label: 'Curso',          act: () => { selectUiMode('curso');           setModalStep('form') } },
                        { emoji: '🏫', label: 'Aula',           act: () => { selectUiMode('aula');            setModalStep('form') } },
                        { emoji: '🎤', label: 'Palestra',       act: () => { selectUiMode('palestra');        setModalStep('form') } },
                        { emoji: '📕', label: 'Livro',          act: () => { selectUiMode('livro');           setModalStep('form') } },
                        { emoji: '📙', label: 'E-book',         act: () => { selectUiMode('ebook');           setModalStep('form') } },
                        { emoji: '📝', label: 'Artigo',         act: () => { selectUiMode('artigo');          setModalStep('form') } },
                        { emoji: '🧩', label: 'Série',          act: () => { selectUiMode('serie_mensagens'); setModalStep('form') } },
                        { emoji: '🧠', label: 'Conhecimento',   act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '📄', label: 'Documento',      act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '📋', label: 'PDF',            act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '📓', label: 'Notas',          act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '🎫', label: 'Conferência',    act: () => { selectUiMode('palestra');        setModalStep('form') } },
                      ] as const).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={item.act}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '0.85rem 0.5rem', gap: '0.35rem',
                            background: 'var(--surface-2)',
                            border: '1.5px solid var(--border-subtle)',
                            borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.13s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#B4530950'; e.currentTarget.style.background = '#B453090A' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--surface-2)' }}
                        >
                          <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={closeModal} style={{
                    flex: 1, padding: '0.6rem', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.88rem',
                  }}>
                    Cancelar
                  </button>
                  {selectedCreationGroup !== 'armazenar' && (
                    <button
                      onClick={() => {
                        if (creating) return
                        if (detectedRef) { createStudyDirect(); return }
                        if (estudarType && estudarType !== 'texto' && estudarQuery.trim()) {
                          createTopicDirect(
                            estudarType === 'tema' ? 'tematico' : estudarType === 'doutrina' ? 'doutrinario' : 'termos',
                            estudarQuery.trim()
                          )
                          return
                        }
                        if (!estudarType || !selectedUiMode) return
                        if (estudarQuery.trim() && estudarType !== 'texto') {
                          updateTopic(estudarQuery.trim())
                        }
                        setModalStep('form')
                      }}
                      disabled={!selectedCreationGroup || (!estudarType && !detectedRef) || creating}
                      style={{
                        flex: 2, padding: '0.6rem',
                        background: (selectedCreationGroup && (estudarType || detectedRef) && !creating)
                          ? '#0F766E'
                          : 'var(--surface-3)',
                        color: (selectedCreationGroup && (estudarType || detectedRef) && !creating) ? '#FFF' : 'var(--text-muted)',
                        border: 'none', borderRadius: '8px',
                        fontWeight: '600',
                        cursor: (selectedCreationGroup && (estudarType || detectedRef) && !creating) ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.15s',
                      }}
                    >
                      {creating
                        ? 'Criando…'
                        : detectedRef
                          ? `Criar — ${detectedRef.book} ${detectedRef.passage} →`
                          : !estudarType
                            ? 'Escolha o tipo de estudo'
                            : estudarType !== 'texto' && estudarQuery.trim()
                              ? 'Criar →'
                              : `Continuar →`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details form */}
            {modalStep === 'form' && selectedUiMode && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                {(() => {
                  const uiMode        = UI_MODES.find(m => m.id === selectedUiMode)!
                  const isTopicProduction = ['aula', 'artigo', 'ebook', 'livro', 'palestra', 'curso', 'serie_mensagens'].includes(selectedUiMode)
                  const isPassage     = selectedUiMode !== 'doutrinario' && selectedUiMode !== 'tematico' && selectedUiMode !== 'termos' && !isTopicProduction
                  const isSermon      = selectedUiMode === 'sermao'
                  const detectedLabel = selectedMode ? DETECTED_LABEL[selectedMode] : null
                  const canSubmit     = isPassage
                    ? (selectedMode && form.book && form.passage_ref.trim() && form.testament && (!isSermon || form.sermon_type))
                    : form.topic.trim()
                  const titlePlaceholder = isPassage
                    ? buildReferenceTitle(form.book, form.passage_ref)
                    : form.topic.trim()

                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
                        <button
                          onClick={() => { setModalStep('mode'); setCreateError(null) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', fontSize: '0.9rem' }}
                          title="Voltar"
                        >←</button>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{uiMode.emoji}</span>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: uiMode.color }}>{uiMode.label}</h2>
                      </div>

                      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isPassage ? (
                          <>
                            {isSermon && (
                              <FormField label="Tipo de Sermão">
                                <select
                                  value={form.sermon_type}
                                  onChange={e => updatePassageForm({ sermon_type: e.target.value as SermonType })}
                                  required
                                >
                                  <option value="">Selecione o tipo</option>
                                  {SERMON_TYPE_OPTIONS.map(o => (
                                    <option key={o.id} value={o.id}>{o.label}</option>
                                  ))}
                                </select>
                              </FormField>
                            )}

                            <FormField label="Testamento">
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(['AT', 'NT'] as const).map(t => (
                                  <button key={t} type="button"
                                    onClick={() => updatePassageForm({ testament: t, book: '' })}
                                    style={{
                                      flex: 1, padding: '0.55rem',
                                      background: form.testament === t ? `${uiMode.color}12` : 'var(--surface-2)',
                                      border: `1px solid ${form.testament === t ? uiMode.color : 'var(--border)'}`,
                                      borderRadius: '6px',
                                      color: form.testament === t ? uiMode.color : 'var(--text-secondary)',
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

                            {/* Badge de gênero detectado (apenas para exegético) */}
                            {selectedUiMode === 'exegetico' && detectedLabel && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: `${uiMode.color}08`,
                                border: `1px solid ${uiMode.color}30`,
                                borderRadius: '8px', padding: '0.5rem 0.85rem',
                              }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: uiMode.color }}>
                                  Gênero detectado
                                </span>
                                <span style={{ fontSize: '0.78rem', color: uiMode.color, fontWeight: 600 }}>·</span>
                                <span style={{ fontSize: '0.78rem', color: uiMode.color, fontWeight: 600 }}>{detectedLabel}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                  O método é ajustado automaticamente
                                </span>
                              </div>
                            )}

                            <FormField label="Passagem">
                              <input
                                value={form.passage_ref}
                                onChange={e => updatePassageForm({ passage_ref: e.target.value })}
                                placeholder="Ex: 1.13–23"
                                required
                              />
                            </FormField>
                          </>
                        ) : (
                          <FormField label={selectedUiMode === 'doutrinario' ? 'Doutrina' : selectedUiMode === 'tematico' ? 'Tema' : selectedUiMode === 'termos' ? 'Termo' : 'Título ou assunto'}>
                            <input
                              value={form.topic}
                              onChange={e => updateTopic(e.target.value)}
                              placeholder={selectedUiMode === 'doutrinario'
                                ? 'Ex: Justificação · Santificação · Eleição'
                                : selectedUiMode === 'tematico'
                                  ? 'Ex: Família · Casamento · Trabalho · Sofrimento'
                                  : selectedUiMode === 'termos'
                                    ? 'Ex: graça · aliança · παρουσία · חֶסֶד'
                                    : 'Ex: Liderança cristã · Discipulado · Cristologia paulina'}
                              required
                            />
                          </FormField>
                        )}

                        {titlePlaceholder && (
                          <FormField label="Título do Projeto">
                            <input
                              value={form.title}
                              onChange={e => updateTitle(e.target.value)}
                              placeholder={titlePlaceholder}
                            />
                            <p style={{ margin: '0.45rem 0 0', color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.45 }}>
                              Gerado automaticamente. Você pode alterar a qualquer momento.
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
                          <button type="submit" disabled={creating || !canSubmit} style={{
                            flex: 2, padding: '0.65rem',
                            background: (creating || !canSubmit) ? 'var(--surface-3)' : uiMode.color,
                            color: (creating || !canSubmit) ? 'var(--text-muted)' : '#FFFFFF',
                            border: 'none', borderRadius: '8px',
                            fontWeight: '600',
                            cursor: creating ? 'wait' : !canSubmit ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', fontSize: '0.9rem', transition: 'background 0.15s',
                          }}>
                            {creating ? 'Criando…'
                              : !isPassage ? 'Iniciar projeto →'
                              : isSermon && !form.sermon_type ? 'Escolha o tipo de sermão'
                              : !form.book ? 'Selecione um livro'
                              : !form.passage_ref.trim() ? 'Informe a passagem'
                              : `Iniciar ${detectedLabel ?? uiMode.label} →`}
                          </button>
                        </div>
                      </form>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          className="lp-fixed-overlay"
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
              Excluir projeto?
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
                {deleteConfirming ? 'Excluindo…' : 'Excluir projeto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
