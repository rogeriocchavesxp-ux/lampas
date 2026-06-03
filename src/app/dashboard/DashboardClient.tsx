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
} from '@/lib/study-modes'

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

// ── Ícones dos modos (UI concern — não pertence ao registry) ──────────────

const MODE_ICONS: Record<StudyModeId, React.ReactNode> = {
  exegese_biblica: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  ),
  estudo_de_carta: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  ),
  estudo_doutrinario: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  estudo_tematico: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  ),
  sermao: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v4M8 23h8"/>
    </svg>
  ),
  estudo_biblico: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  devocional: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  comentario_exegetico: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
}

// Ordem de exibição no modal de seleção
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

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects, profile }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [showNew, setShowNew] = useState(false)
  const [modalStep, setModalStep] = useState<'mode' | 'form'>('mode')
  const [selectedMode, setSelectedMode] = useState<StudyModeId | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    book: '',
    passage_ref: '',
    topic: '',
    testament: 'NT' as 'AT' | 'NT',
  })

  const modeConfig = selectedMode ? STUDY_MODE_REGISTRY[selectedMode] : null

  function openModal() {
    setModalStep('mode')
    setSelectedMode(null)
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
    if (!form.title || !selectedMode || !modeConfig) return

    const isPassage = modeConfig.passageBased
    if (isPassage && (!form.book || !form.passage_ref)) return
    if (!isPassage && !form.topic) return

    setCreating(true)

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id:           user.id,
        title:             form.title,
        book:              isPassage ? form.book : '—',
        passage_ref:       isPassage ? form.passage_ref : form.topic,
        testament:         isPassage ? form.testament : 'AT',
        original_language: isPassage ? (form.testament === 'AT' ? 'hebraico' : 'grego') : '—',
        bible_version:     'NAA',
        status:            'draft',
        study_mode:        selectedMode,
        project_type:      selectedMode,   // compatibilidade legada
        meta:              isPassage ? {} : { topic: form.topic },
      })
      .select()
      .single()

    if (!error && data) router.push(`/workspace/${data.id}`)
    setCreating(false)
  }

  const statusLabel = (s: string) => ({ draft: 'Em andamento', in_progress: 'Em andamento', completed: 'Concluído' }[s] || s)
  const statusColor = (s: string) => ({ draft: 'var(--accent)', in_progress: 'var(--accent)', completed: 'var(--success)' }[s] || 'var(--text-muted)')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* Header */}
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
            background: 'var(--accent)', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: '600',
            cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nenhum estudo ainda</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Comece escolhendo um modo de estudo
            </p>
            <button onClick={openModal} style={{
              background: 'var(--accent)', color: '#FFFFFF', border: 'none',
              borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: '600',
              cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
            }}>
              Criar primeiro estudo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {projects.map(p => {
              const pMode = getModeConfig((p as { study_mode?: string }).study_mode ?? p.project_type)
              const isPassage = pMode.passageBased
              return (
                <div key={p.id} onClick={() => router.push(`/workspace/${p.id}`)}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '10px', padding: '1.1rem 1.5rem',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  {/* Mode icon badge */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
                    background: `${pMode.color}15`, border: `1px solid ${pMode.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: pMode.color,
                  }}>
                    {MODE_ICONS[pMode.id]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.2rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {p.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {isPassage && p.book !== '—' && (
                        <>
                          <span>{p.book} {p.passage_ref}</span>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span>{p.original_language}</span>
                          <span style={{ opacity: 0.4 }}>·</span>
                        </>
                      )}
                      {!isPassage && p.passage_ref && p.passage_ref !== '—' && (
                        <>
                          <span>{p.passage_ref}</span>
                          <span style={{ opacity: 0.4 }}>·</span>
                        </>
                      )}
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: pMode.color,
                        background: `${pMode.color}12`,
                        border: `1px solid ${pMode.color}28`,
                        borderRadius: '3px', padding: '0.06rem 0.4rem',
                        letterSpacing: '0.03em',
                      }}>
                        {pMode.name}
                      </span>
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

            {/* ── Step 1: Mode selection ── */}
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

            {/* ── Step 2: Details form ── */}
            {modalStep === 'form' && modeConfig && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
                  <button
                    onClick={() => setModalStep('mode')}
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
