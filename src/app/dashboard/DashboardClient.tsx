'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LampasMarkIcon } from '@/components/LampasLogo'
import type { User } from '@supabase/supabase-js'
import type { Project, Profile, ProjectType } from '@/types/database'

const BOOKS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
  'Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis',
  '1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó',
  'Salmos','Provérbios','Eclesiastes','Cântico dos Cânticos',
  'Isaías','Jeremias','Lamentações','Ezequiel','Daniel',
  'Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias'
]

const BOOKS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos',
  '1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus',
  'Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João',
  'Judas','Apocalipse'
]

// ── Project type definitions ───────────────────────────────────────────────

interface TypeOption {
  type: ProjectType
  name: string
  icon: React.ReactNode
  description: string
  audience: string
  passageLabel: string
  titlePlaceholder: string
  color: string
}

function Ico({ d, d2, d3 }: { d: string; d2?: string; d3?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
      {d2 && <path d={d2} />}
      {d3 && <path d={d3} />}
    </svg>
  )
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    type: 'exegese',
    name: 'Exegese',
    icon: <Ico d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    description: 'Análise criteriosa do texto original',
    audience: 'Pastores · Seminaristas · Pesquisadores',
    passageLabel: 'Perícope',
    titlePlaceholder: 'Ex: A soberania de Deus em Romanos 9',
    color: '#B8922A',
  },
  {
    type: 'sermao',
    name: 'Sermão',
    icon: <Ico d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" d2="M19 10v2a7 7 0 0 1-14 0v-2" d3="M12 19v4M8 23h8" />,
    description: 'Do texto bíblico ao púlpito',
    audience: 'Pastores · Pregadores',
    passageLabel: 'Texto-base',
    titlePlaceholder: 'Ex: O Senhor é meu pastor — Salmos 23',
    color: '#7C3AED',
  },
  {
    type: 'estudo_biblico',
    name: 'Estudo Bíblico',
    icon: <Ico d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" d2="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
    description: 'Ensino estruturado para grupos e turmas',
    audience: 'Professores de EBD · Líderes de grupos',
    passageLabel: 'Passagem principal',
    titlePlaceholder: 'Ex: A parábola do filho pródigo — Lc 15',
    color: '#0369A1',
  },
  {
    type: 'estudo_doutrinario',
    name: 'Estudo Doutrinário',
    icon: <Ico d="M12 2L2 7l10 5 10-5-10-5z" d2="M2 17l10 5 10-5" d3="M2 12l10 5 10-5" />,
    description: 'Investigação temática e sistemática',
    audience: 'Teólogos · Estudantes · Pastores',
    passageLabel: 'Texto âncora',
    titlePlaceholder: 'Ex: A doutrina da justificação por fé',
    color: '#065F46',
  },
  {
    type: 'devocional',
    name: 'Devocional',
    icon: <Ico d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
    description: 'Reflexão espiritual e meditação bíblica',
    audience: 'Cristãos · Líderes · Grupos familiares',
    passageLabel: 'Passagem',
    titlePlaceholder: 'Ex: Confiança em tempos de aflição — Sl 46',
    color: '#9A3412',
  },
  {
    type: 'pesquisa_teologica',
    name: 'Pesquisa Teológica',
    icon: <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" d2="M14 2v6h6" d3="M16 13H8M16 17H8M10 9H8" />,
    description: 'Análise acadêmica e bibliográfica',
    audience: 'Seminaristas · Professores · Pesquisadores',
    passageLabel: 'Texto de referência',
    titlePlaceholder: 'Ex: A escatologia paulina em 1 Tessalonicenses',
    color: '#1E40AF',
  },
]

const TYPE_BADGE: Record<ProjectType, string> = {
  exegese: 'Exegese',
  sermao: 'Sermão',
  estudo_biblico: 'Est. Bíblico',
  estudo_doutrinario: 'Est. Doutrinário',
  devocional: 'Devocional',
  pesquisa_teologica: 'Pesquisa',
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects, profile }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // Modal state
  const [showNew, setShowNew] = useState(false)
  const [modalStep, setModalStep] = useState<'type' | 'form'>('type')
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    book: '',
    passage_ref: '',
    testament: 'NT' as 'AT' | 'NT',
  })

  function openModal() {
    setModalStep('type')
    setSelectedType(null)
    setForm({ title: '', book: '', passage_ref: '', testament: 'NT' })
    setShowNew(true)
  }

  function closeModal() {
    setShowNew(false)
  }

  function proceedToForm() {
    if (!selectedType) return
    setModalStep('form')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.book || !form.passage_ref || !selectedType) return
    setCreating(true)

    const language = form.testament === 'AT' ? 'hebraico' : 'grego'

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: form.title,
        book: form.book,
        passage_ref: form.passage_ref,
        testament: form.testament,
        original_language: language,
        bible_version: 'NAA',
        status: 'draft',
        project_type: selectedType,
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/workspace/${data.id}`)
    }
    setCreating(false)
  }

  const statusLabel = (s: string) => ({
    draft: 'Em andamento', in_progress: 'Em andamento', completed: 'Concluído'
  }[s] || s)

  const statusColor = (s: string) => ({
    draft: 'var(--accent)',
    in_progress: 'var(--accent)',
    completed: 'var(--success)',
  }[s] || 'var(--text-muted)')

  const typeOpt = selectedType ? TYPE_OPTIONS.find(t => t.type === selectedType) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 2rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <LampasMarkIcon size={36} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user.email}</span>
          <button
            onClick={() => router.push('/billing')}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
              borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Planos
          </button>
          <button onClick={handleSignOut} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem',
            fontFamily: 'inherit',
          }}>
            Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Estudos</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Seus projetos bíblicos em andamento · {projects.length} {projects.length === 1 ? 'estudo' : 'estudos'}
            </p>
          </div>
          <button onClick={openModal} style={{
            background: 'var(--accent)', color: '#FFFFFF',
            border: 'none', borderRadius: '8px',
            padding: '0.6rem 1.25rem', fontWeight: '600',
            cursor: 'pointer', fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}>
            + Novo Projeto
          </button>
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--surface)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="var(--border)" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Nenhum estudo ainda
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Comece selecionando um texto bíblico
            </p>
            <button onClick={openModal} style={{
              background: 'var(--accent)', color: '#FFFFFF',
              border: 'none', borderRadius: '8px',
              padding: '0.6rem 1.25rem', fontWeight: '600',
              cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
            }}>
              Criar primeiro estudo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {projects.map(p => {
              const tOpt = TYPE_OPTIONS.find(t => t.type === (p.project_type ?? 'exegese'))
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/workspace/${p.id}`)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px', padding: '1.1rem 1.5rem',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  {/* Type icon badge */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px',
                    background: tOpt ? `${tOpt.color}15` : 'var(--accent-subtle)',
                    border: `1px solid ${tOpt ? `${tOpt.color}30` : 'transparent'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: tOpt?.color ?? 'var(--accent)',
                    flexShrink: 0,
                  }}>
                    {tOpt?.icon ?? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {p.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span>{p.book} {p.passage_ref}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{p.original_language}</span>
                      {tOpt && (
                        <>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700,
                            color: tOpt.color,
                            background: `${tOpt.color}12`,
                            border: `1px solid ${tOpt.color}28`,
                            borderRadius: '3px', padding: '0.06rem 0.4rem',
                            letterSpacing: '0.03em',
                          }}>
                            {TYPE_BADGE[p.project_type ?? 'exegese']}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ fontSize: '0.78rem', color: statusColor(p.status), flexShrink: 0 }}>
                    {statusLabel(p.status)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── New project modal ── */}
      {showNew && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1rem',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: '14px',
            border: '1px solid var(--border)',
            width: '100%',
            maxWidth: modalStep === 'type' ? '620px' : '480px',
            animation: 'fadeIn 0.15s ease-out',
            transition: 'max-width 0.2s ease',
          }}>

            {/* ── Step 1: Type selection ── */}
            {modalStep === 'type' && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ marginBottom: '0.3rem', fontSize: '1.15rem' }}>Novo Projeto</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    Selecione o tipo de projeto que deseja criar
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  {TYPE_OPTIONS.map(opt => {
                    const active = selectedType === opt.type
                    return (
                      <button
                        key={opt.type}
                        onClick={() => setSelectedType(opt.type)}
                        style={{
                          textAlign: 'left', padding: '0.95rem 1rem',
                          background: active ? `${opt.color}08` : 'var(--surface-2)',
                          border: `1.5px solid ${active ? opt.color : 'var(--border-subtle)'}`,
                          borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.13s',
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = `${opt.color}60`
                            e.currentTarget.style.background = `${opt.color}05`
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)'
                            e.currentTarget.style.background = 'var(--surface-2)'
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
                          <span style={{ color: opt.color, display: 'flex', alignItems: 'center' }}>
                            {opt.icon}
                          </span>
                          <span style={{
                            fontSize: '0.88rem', fontWeight: 700,
                            color: active ? opt.color : 'var(--text-primary)',
                            transition: 'color 0.13s',
                          }}>
                            {opt.name}
                          </span>
                          {active && (
                            <span style={{ marginLeft: 'auto', color: opt.color, fontSize: '0.75rem' }}>✓</span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '0.77rem', color: 'var(--text-secondary)',
                          lineHeight: 1.45, margin: '0 0 0.3rem',
                        }}>
                          {opt.description}
                        </p>
                        <p style={{
                          fontSize: '0.68rem', color: 'var(--text-muted)',
                          margin: 0, lineHeight: 1.4,
                        }}>
                          {opt.audience}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={closeModal} style={{
                    flex: 1, padding: '0.6rem',
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: '8px', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
                  }}>
                    Cancelar
                  </button>
                  <button
                    onClick={proceedToForm}
                    disabled={!selectedType}
                    style={{
                      flex: 2, padding: '0.6rem',
                      background: selectedType ? (typeOpt?.color ?? 'var(--accent)') : 'var(--surface-3)',
                      color: selectedType ? '#FFF' : 'var(--text-muted)',
                      border: 'none', borderRadius: '8px',
                      fontWeight: '600', cursor: selectedType ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', fontSize: '0.88rem',
                      transition: 'background 0.15s',
                    }}
                  >
                    {selectedType ? `Continuar com ${typeOpt?.name} →` : 'Selecione um tipo'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Details form ── */}
            {modalStep === 'form' && typeOpt && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
                  <button
                    onClick={() => setModalStep('type')}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', padding: '0.2rem',
                      display: 'flex', alignItems: 'center', fontSize: '0.9rem',
                    }}
                    title="Voltar"
                  >
                    ←
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: typeOpt.color }}>{typeOpt.icon}</span>
                    <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
                      {typeOpt.name}
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormField label="Título">
                    <input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={typeOpt.titlePlaceholder}
                      required
                      autoFocus
                    />
                  </FormField>

                  <FormField label="Testamento">
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['NT', 'AT'] as const).map(t => (
                        <button
                          key={t} type="button"
                          onClick={() => setForm(f => ({ ...f, testament: t, book: '' }))}
                          style={{
                            flex: 1, padding: '0.55rem',
                            background: form.testament === t ? 'var(--accent-subtle)' : 'var(--surface-2)',
                            border: `1px solid ${form.testament === t ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: '6px', color: form.testament === t ? 'var(--accent)' : 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600',
                            fontFamily: 'inherit',
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

                  <FormField label={typeOpt.passageLabel}>
                    <input
                      value={form.passage_ref}
                      onChange={e => setForm(f => ({ ...f, passage_ref: e.target.value }))}
                      placeholder="Ex: 19.1-12"
                      required
                    />
                  </FormField>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={closeModal} style={{
                      flex: 1, padding: '0.65rem',
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: '8px', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
                    }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={creating} style={{
                      flex: 2, padding: '0.65rem',
                      background: creating ? 'var(--surface-3)' : typeOpt.color,
                      color: '#FFFFFF',
                      border: 'none', borderRadius: '8px',
                      fontWeight: '600', cursor: creating ? 'wait' : 'pointer',
                      fontFamily: 'inherit', fontSize: '0.9rem',
                      transition: 'background 0.15s',
                    }}>
                      {creating ? 'Criando...' : `Criar ${typeOpt.name}`}
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.78rem',
        color: 'var(--text-secondary)', marginBottom: '0.35rem',
        textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600',
      }}>
        {label}
      </label>
      <style>{`
        .field-input input, .field-input select {
          width: 100%;
          padding: 0.6rem 0.85rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 7px;
          color: var(--text-primary);
          font-size: 0.92rem;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .field-input input:focus, .field-input select:focus {
          border-color: var(--accent);
        }
        .field-input select option {
          background: var(--surface-2);
        }
      `}</style>
      <div className="field-input">{children}</div>
    </div>
  )
}
