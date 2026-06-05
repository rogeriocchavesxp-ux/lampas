'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'

// Seções que NÃO devem ser copiadas para o Sermão.
// Fases homiléticas ficam em branco — o pregador as constrói do zero.
// ec_* são exclusivas da Carta e não têm correspondência na navegação do Sermão.
function shouldCopy(slug: string): boolean {
  if (slug === 'pregar_visao_geral')   return false  // fase homilética — pregador constrói do zero
  if (slug === 'comunicar_visao_geral') return false  // slug legado — excluir por segurança
  if (slug.startsWith('sermao_'))      return false  // sermao_dispositio, elocutio, etc.
  if (slug.startsWith('devocional_'))  return false
  if (slug.startsWith('eb_'))          return false
  if (slug.startsWith('edt_'))         return false
  if (slug.startsWith('et_'))          return false
  if (slug.startsWith('ec_'))          return false  // ec_ocasiao, ec_estrutura, ec_argumento — específicos da Carta, sem correspondência no Sermão
  return true
}

interface ConflictItem { slug: string; title: string }

interface Props {
  project: Project
  sections: Section[]
  userId: string
  onClose: () => void
}

export default function EnviarParaSermaModal({ project, sections, userId, onClose }: Props) {
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [destination,      setDestination]      = useState<'new' | 'existing'>('new')
  const [title,            setTitle]            = useState(`Sermão em ${project.book} ${project.passage_ref}`)
  const [existingProjects, setExistingProjects] = useState<Project[]>([])
  const [selectedProject,  setSelectedProject]  = useState<string | null>(null)
  const [loadingExisting,  setLoadingExisting]  = useState(false)
  const [step,             setStep]             = useState<'config' | 'conflict' | 'done'>('config')
  const [conflicts,        setConflicts]        = useState<ConflictItem[]>([])
  const [conflictStrategy, setConflictStrategy] = useState<'keep' | 'replace'>('keep')
  const [loading,          setLoading]          = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [error,            setError]            = useState<string | null>(null)

  const sectionsToCopy = useMemo(
    () => sections.filter(s => shouldCopy(s.slug)),
    [sections],
  )

  // Carregar sermões existentes quando o usuário escolhe "existing"
  useEffect(() => {
    if (destination !== 'existing') return
    setLoadingExisting(true)
    supabase
      .from('projects')
      .select('id, title, book, passage_ref, study_mode')
      .eq('user_id', userId)
      .eq('study_mode', 'sermao')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setExistingProjects((data ?? []) as Project[])
        setLoadingExisting(false)
      })
  }, [destination, userId, supabase])

  const executeCopy = useCallback(async (
    targetProjectId: string,
    slugsToSkip: Set<string>,
  ) => {
    // Se "replace", deletar conflitantes primeiro
    if (slugsToSkip.size > 0 && conflictStrategy === 'replace') {
      const toDelete = conflicts
        .filter(c => !slugsToSkip.has(c.slug))
        .map(c => c.slug)
      if (toDelete.length) {
        await supabase.from('sections').delete()
          .eq('project_id', targetProjectId)
          .in('slug', toDelete)
      }
    }

    const toInsert = sectionsToCopy
      .filter(s => !slugsToSkip.has(s.slug))
      .map(s => ({
        project_id: targetProjectId,
        user_id:    userId,
        slug:       s.slug,
        module:     s.module as 'inventio',
        title:      s.title,
        status:     (s.status ?? 'draft') as 'draft',
        content:    s.content ?? null,
        ai_output:  s.ai_output ?? null,
      }))

    if (toInsert.length > 0) {
      const { error } = await supabase.from('sections').insert(toInsert)
      if (error) throw error
    }
  }, [sectionsToCopy, userId, supabase, conflicts, conflictStrategy])

  async function handleConfirm() {
    setError(null)
    setLoading(true)
    try {
      if (destination === 'new') {
        const { data: newProject, error: projError } = await supabase
          .from('projects')
          .insert({
            user_id:           userId,
            title:             title.trim() || `Sermão em ${project.book} ${project.passage_ref}`,
            book:              project.book,
            passage_ref:       project.passage_ref,
            testament:         project.testament,
            original_language: project.original_language,
            bible_version:     project.bible_version ?? 'ACF',
            status:            'draft',
            study_mode:        'sermao',
            project_type:      'sermao',
            meta:              {},
          })
          .select()
          .single()

        if (projError || !newProject) throw projError ?? new Error('Falha ao criar projeto')

        await executeCopy(newProject.id, new Set())
        setCreatedProjectId(newProject.id)
        setStep('done')
        return
      }

      // Destino existente
      if (!selectedProject) {
        setError('Selecione um sermão de destino.')
        return
      }

      // Checar conflitos pela primeira vez
      if (step === 'config') {
        const { data: existing } = await supabase
          .from('sections')
          .select('slug, title')
          .eq('project_id', selectedProject)

        const existingSlugs = new Set((existing ?? []).map(s => s.slug as string))
        const conflictList: ConflictItem[] = sectionsToCopy
          .filter(s => existingSlugs.has(s.slug))
          .map(s => ({ slug: s.slug, title: s.title }))

        if (conflictList.length > 0) {
          setConflicts(conflictList)
          setStep('conflict')
          return
        }
      }

      // Executar cópia (sem conflitos ou já com estratégia escolhida)
      const slugsToSkip = step === 'conflict' && conflictStrategy === 'keep'
        ? new Set(conflicts.map(c => c.slug))
        : new Set<string>()

      await executeCopy(selectedProject, slugsToSkip)
      setCreatedProjectId(selectedProject)
      setStep('done')
    } catch (err) {
      console.error('[Lampas] Erro ao enviar para Sermão', err)
      setError('Não foi possível transferir o estudo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const ref = project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15,23,42,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: '14px',
        border: '1px solid #E2E8F0', width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'fadeIn 0.15s ease-out',
        overflow: 'hidden',
      }}>

        {/* ── Sucesso ── */}
        {step === 'done' && (
          <div style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#10B981', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
              }}>✓</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                Conteúdo transferido para o Sermão
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.55, marginBottom: '1rem', margin: '0 0 1rem' }}>
              As seções exegéticas e preparatórias foram copiadas. Os campos homiléticos ficam em branco — o pregador os constrói a partir da base.
            </p>

            <div style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                O que foi transferido
              </div>
              {[
                { label: 'Preparação espiritual e leituras', check: true },
                { label: 'Visão Geral e primeiras impressões', check: true },
                { label: 'Estudo Contextual (histórico e literário)', check: true },
                { label: 'Estudo Textual (texto original e termos)', check: true },
                { label: 'Estudo Teológico (mensagem e cânone)', check: true },
                { label: 'Visão Geral Homilética', check: false, note: 'pregador constrói do zero' },
                { label: 'Estrutura e linguagem do sermão', check: false, note: 'pregador constrói do zero' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0' }}>
                  <span style={{ fontSize: '0.72rem', color: item.check ? '#10B981' : '#CBD5E1', flexShrink: 0 }}>
                    {item.check ? '✓' : '○'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: item.check ? '#1E293B' : '#94A3B8' }}>
                    {item.label}
                    {item.note && <span style={{ color: '#CBD5E1', marginLeft: '0.3rem' }}>— {item.note}</span>}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '0.65rem', background: 'transparent',
                border: '1px solid #E2E8F0', borderRadius: '8px',
                color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
              }}>
                Permanecer aqui
              </button>
              <button
                onClick={() => router.push(`/workspace/${createdProjectId}`)}
                style={{
                  flex: 2, padding: '0.65rem', background: '#7C3AED',
                  color: '#FFFFFF', border: 'none', borderRadius: '8px',
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
                }}
              >
                Abrir Sermão →
              </button>
            </div>
          </div>
        )}

        {/* ── Resolução de conflitos ── */}
        {step === 'conflict' && (
          <div style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.3rem' }}>
                Conteúdo existente detectado
              </div>
              <p style={{ fontSize: '0.83rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {conflicts.length} seção{conflicts.length !== 1 ? 'ões' : ''} no sermão de destino já
                {conflicts.length !== 1 ? ' têm' : ' tem'} conteúdo.
              </p>
            </div>

            <div style={{
              background: '#FFF7ED', border: '1px solid #FED7AA',
              borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1.25rem',
            }}>
              {conflicts.map(c => (
                <div key={c.slug} style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: 1.8 }}>· {c.title}</div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {([
                { value: 'keep',    label: 'Manter conteúdo atual',                desc: 'As seções conflitantes não serão alteradas.' },
                { value: 'replace', label: 'Substituir pelo conteúdo da carta',    desc: 'O conteúdo atual do sermão será substituído.' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setConflictStrategy(opt.value)}
                  style={{
                    textAlign: 'left', padding: '0.75rem 1rem',
                    background: conflictStrategy === opt.value ? 'rgba(124,58,237,0.06)' : '#F8FAFC',
                    border: `1.5px solid ${conflictStrategy === opt.value ? '#7C3AED' : '#E2E8F0'}`,
                    borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: conflictStrategy === opt.value ? '#7C3AED' : '#1E293B', marginBottom: '2px' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {error && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep('config')} style={{
                flex: 1, padding: '0.65rem', background: 'transparent',
                border: '1px solid #E2E8F0', borderRadius: '8px',
                color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
              }}>
                ← Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  flex: 2, padding: '0.65rem',
                  background: loading ? '#E2E8F0' : '#7C3AED',
                  color: loading ? '#94A3B8' : '#FFFFFF',
                  border: 'none', borderRadius: '8px',
                  fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem',
                }}
              >
                {loading ? 'Transferindo…' : 'Confirmar transferência'}
              </button>
            </div>
          </div>
        )}

        {/* ── Configuração ── */}
        {step === 'config' && (
          <div style={{ padding: '1.75rem' }}>
            {/* Cabeçalho */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                Enviar para Sermão
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                Este estudo de carta será usado como base exegética e preparatória de um sermão.
              </p>
            </div>

            {/* Origem */}
            <div style={{
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
                Origem
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                Estudo de Carta — {ref}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '3px' }}>
                {sectionsToCopy.length} seções serão transferidas · campos homiléticos permanecem em branco
              </div>
            </div>

            {/* Destino */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>
                Destino
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {([
                  { value: 'new',      label: 'Criar novo sermão' },
                  { value: 'existing', label: 'Enviar para sermão existente' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDestination(opt.value)}
                    style={{
                      textAlign: 'left', padding: '0.7rem 1rem',
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      background: destination === opt.value ? 'rgba(124,58,237,0.06)' : '#F8FAFC',
                      border: `1.5px solid ${destination === opt.value ? '#7C3AED' : '#E2E8F0'}`,
                      borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${destination === opt.value ? '#7C3AED' : '#CBD5E1'}`,
                      background: destination === opt.value ? '#7C3AED' : 'transparent',
                    }} />
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: destination === opt.value ? 600 : 400,
                      color: destination === opt.value ? '#7C3AED' : '#1E293B',
                    }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Novo: campo de título */}
            {destination === 'new' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block', fontSize: '0.72rem', fontWeight: 700,
                  color: '#475569', textTransform: 'uppercase',
                  letterSpacing: '0.07em', marginBottom: '0.4rem',
                }}>
                  Título sugerido
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.6rem 0.85rem', background: '#F8FAFC',
                    border: '1px solid #E2E8F0', borderRadius: '7px',
                    color: '#1E293B', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#7C3AED')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>
            )}

            {/* Existente: lista de sermões */}
            {destination === 'existing' && (
              <div style={{ marginBottom: '1.25rem' }}>
                {loadingExisting ? (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0 }}>Carregando sermões…</p>
                ) : existingProjects.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                    Nenhum sermão encontrado. Crie um novo.
                  </p>
                ) : (
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '0.35rem',
                    maxHeight: '180px', overflowY: 'auto',
                  }}>
                    {existingProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProject(p.id)}
                        style={{
                          textAlign: 'left', padding: '0.6rem 0.85rem',
                          background: selectedProject === p.id ? 'rgba(124,58,237,0.06)' : '#F8FAFC',
                          border: `1.5px solid ${selectedProject === p.id ? '#7C3AED' : '#E2E8F0'}`,
                          borderRadius: '7px', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <div style={{ fontSize: '0.84rem', fontWeight: 500, color: '#1E293B' }}>{p.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {p.book !== '—' ? `${p.book} ${p.passage_ref}` : p.passage_ref}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <p style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: '0.75rem', margin: '0 0 0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '0.65rem', background: 'transparent',
                border: '1px solid #E2E8F0', borderRadius: '8px',
                color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
              }}>
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || (destination === 'existing' && !selectedProject)}
                style={{
                  flex: 2, padding: '0.65rem',
                  background: loading || (destination === 'existing' && !selectedProject)
                    ? '#E2E8F0' : '#7C3AED',
                  color: loading || (destination === 'existing' && !selectedProject)
                    ? '#94A3B8' : '#FFFFFF',
                  border: 'none', borderRadius: '8px', fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.15s',
                }}
              >
                {loading ? 'Transferindo…' : 'Enviar para Sermão →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
