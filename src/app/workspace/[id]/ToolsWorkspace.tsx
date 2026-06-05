'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Project } from '@/types/database'
import { TOOL_AREAS, type ToolArea } from '@/lib/tools-content'
import { createClient } from '@/lib/supabase/client'
import CrossReferencesWorkspace from './CrossReferencesWorkspace'

interface Props {
  project: Project
  activeSlug: string
  onNavigate: (slug: string) => void
  onAskAI: (prompt: string) => void
}

interface ConfessionalSuggestion {
  document_title: string
  document_slug: string
  kind: 'confession' | 'catechism' | 'canons'
  item_type: 'chapter' | 'question'
  number_label: string
  title: string
  content: string | null
  doctrine_tags: string[]
  bible_references: string[]
  relevance: number
}

const CONFESSIONAL_COLUMNS = [
  { title: 'Confissões', items: ['Westminster', 'Belga', 'Dort'] },
  { title: 'Catecismos', items: ['Maior', 'Menor', 'Heidelberg'] },
  { title: 'Doutrinas Relacionadas', items: ['Justificação', 'Santificação', 'Eleição', 'Perseverança', 'Igreja', 'Escritura'] },
]

function doctrineSuggestionsFor(project: Project): string[] {
  const ref = `${project.book ?? ''} ${project.passage_ref ?? ''}`.toLowerCase()

  if ((ref.includes('salmos') || ref.includes('psalm')) && ref.includes('3')) {
    return ['Providência', 'Soberania de Deus', 'Proteção divina', 'Confiança', 'Oração']
  }

  if (ref.includes('romanos') || ref.includes('romans')) {
    return ['Justificação', 'Fé', 'Graça', 'Pecado', 'Redenção']
  }

  if (ref.includes('efésios') || ref.includes('ephesians')) {
    return ['Eleição', 'Graça', 'Igreja', 'Unidade', 'Santificação']
  }

  return ['Providência', 'Soberania de Deus', 'Graça', 'Santificação', 'Escritura']
}

function buildPrompt(area: ToolArea, project: Project, query: string, basePrompt: string): string {
  return [
    `Ferramenta: ${area.title}`,
    `Papel da IA: ${area.aiRole}`,
    `Projeto atual: ${project.book} ${project.passage_ref} (${project.original_language})`,
    query.trim() ? `Pesquisa do usuário: ${query.trim()}` : '',
    '',
    basePrompt,
    '',
    'Responda em português do Brasil, com rigor reformado, referências bíblicas, autores relevantes e aplicação pastoral quando apropriado.',
  ].filter(Boolean).join('\n')
}

function ConfessionalWorkspace({
  project,
  area,
  query,
  setQuery,
  onAsk,
}: {
  project: Project
  area: ToolArea
  query: string
  setQuery: (query: string) => void
  onAsk: (prompt: string) => void
}) {
  const [suggestions, setSuggestions] = useState<ConfessionalSuggestion[]>([])
  const doctrineSuggestions = useMemo(() => doctrineSuggestionsFor(project), [project])
  const passageLabel = `${project.book} ${project.passage_ref}`.trim()

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadSuggestions() {
      const terms = doctrineSuggestions.slice(0, 3)
      const responses = await Promise.all(
        terms.map(term =>
          supabase.rpc('get_confessional_suggestions', {
            p_doctrine: term.toLowerCase(),
            p_limit: 4,
          })
        )
      )

      if (cancelled) return

      const byKey = new Map<string, ConfessionalSuggestion>()
      for (const response of responses) {
        for (const item of (response.data ?? []) as ConfessionalSuggestion[]) {
          byKey.set(`${item.document_slug}:${item.item_type}:${item.number_label}`, item)
        }
      }
      setSuggestions([...byKey.values()].slice(0, 8))
    }

    void loadSuggestions()

    return () => {
      cancelled = true
    }
  }, [doctrineSuggestions])

  function askConfessionalQuestion() {
    const userQuery = query.trim()
    onAsk([
      userQuery ? `Pesquisa do usuário: ${userQuery}` : '',
      `Texto bíblico atual: ${passageLabel}`,
      'Como esta passagem é interpretada pelas confissões reformadas?',
      'Quais perguntas catequéticas se relacionam com este texto?',
      'Quais doutrinas aparecem aqui?',
      'Priorize Bíblia, Confissões e Catecismos Lampas. Depois use Dicionário Lampas e Biblioteca, se necessário.',
    ].filter(Boolean).join('\n'))
  }

  const groupedSuggestions = suggestions.reduce<Record<string, ConfessionalSuggestion[]>>((acc, item) => {
    const key = item.kind === 'catechism' ? 'Catecismos' : 'Confissões'
    acc[key] = [...(acc[key] ?? []), item]
    return acc
  }, {})

  return (
    <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '2rem clamp(1.25rem, 4vw, 3.5rem) 4rem', background: 'var(--background)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <header style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
            <h1 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.8rem', lineHeight: 1.15, letterSpacing: 0 }}>
              Catecismos e Confissões
            </h1>
            <span style={{ color: area.color, fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
              {passageLabel}
            </span>
          </div>
          <p style={{ margin: 0, maxWidth: '680px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55 }}>
            Consultar confissões reformadas, catecismos e doutrinas relacionadas à passagem estudada.
          </p>
        </header>

        <section style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'stretch' }}>
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Pesquisar doutrina, capítulo, pergunta ou referência bíblica"
              style={{
                flex: 1,
                minWidth: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '7px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.92rem',
                padding: '0.78rem 0.9rem',
                outline: 'none',
              }}
              onFocus={event => event.currentTarget.style.borderColor = area.color}
              onBlur={event => event.currentTarget.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={askConfessionalQuestion}
              style={{
                background: area.color,
                border: `1px solid ${area.color}`,
                borderRadius: '7px',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.86rem',
                fontWeight: 800,
                padding: '0 1rem',
                whiteSpace: 'nowrap',
              }}
            >
              Perguntar à IA
            </button>
          </div>
        </section>

        <section style={{ marginBottom: '1.6rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 850, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.55rem' }}>
            Conteúdo relacionado ao texto atual
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{passageLabel}</strong>
            <span style={{ color: 'var(--text-muted)' }}>↓</span>
            {doctrineSuggestions.map((doctrine, index) => (
              <button
                key={doctrine}
                onClick={() => setQuery(doctrine)}
                style={{
                  border: '1px solid var(--border-subtle)',
                  background: index === 0 ? area.bgActive : 'var(--surface)',
                  color: index === 0 ? area.color : 'var(--text-secondary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  padding: '0.36rem 0.55rem',
                }}
              >
                {doctrine}
              </button>
            ))}
          </div>
        </section>

        {suggestions.length > 0 && (
          <section style={{ marginBottom: '1.65rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {Object.entries(groupedSuggestions).map(([group, items]) => (
                <div key={group} style={{ borderTop: `2px solid ${area.color}`, paddingTop: '0.75rem' }}>
                  <h2 style={{ margin: '0 0 0.55rem', color: 'var(--text-primary)', fontSize: '0.95rem', letterSpacing: 0 }}>
                    {group}
                  </h2>
                  <div style={{ display: 'grid', gap: '0.7rem' }}>
                    {items.map(item => (
                      <article key={`${item.document_slug}-${item.item_type}-${item.number_label}`}>
                        <div style={{ color: area.color, fontSize: '0.72rem', fontWeight: 850, marginBottom: '0.15rem' }}>
                          {item.document_title} · {item.item_type === 'question' ? 'Pergunta' : 'Capítulo'} {item.number_label}
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 750, lineHeight: 1.35 }}>
                          {item.title}
                        </div>
                        {item.bible_references.length > 0 && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', lineHeight: 1.45, marginTop: '0.25rem' }}>
                            {item.bible_references.join(' · ')}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {CONFESSIONAL_COLUMNS.map(column => (
            <div key={column.title} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <h2 style={{ margin: '0 0 0.65rem', color: 'var(--text-primary)', fontSize: '0.98rem', letterSpacing: 0 }}>
                {column.title}
              </h2>
              <div style={{ display: 'grid', gap: '0.42rem' }}>
                {column.items.map(item => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.86rem',
                      lineHeight: 1.35,
                      padding: 0,
                      textAlign: 'left',
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

export default function ToolsWorkspace({ project, activeSlug, onNavigate, onAskAI }: Props) {
  const activeArea = useMemo(() => TOOL_AREAS.find(area => area.slug === activeSlug) ?? TOOL_AREAS[0], [activeSlug])
  const [query, setQuery] = useState('')

  function ask(prompt: string) {
    onAskAI(buildPrompt(activeArea, project, query, prompt))
  }

  if (activeArea.id === 'confissoes_catecismos') {
    return (
      <div style={{ height: '100%', display: 'flex', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
        <ConfessionalWorkspace
          project={project}
          area={activeArea}
          query={query}
          setQuery={setQuery}
          onAsk={ask}
        />
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
      <aside style={{
        width: '218px',
        flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(20,25,38,0.72)',
        padding: '1rem 0.85rem',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.75rem' }}>
          Biblioteca inteligente
        </div>
        <div style={{ display: 'grid', gap: '0.45rem' }}>
          {TOOL_AREAS.map(area => {
            const active = area.slug === activeArea.slug
            return (
              <button
                key={area.slug}
                onClick={() => onNavigate(area.slug)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: `1px solid ${active ? area.color : 'var(--border-subtle)'}`,
                  background: active ? area.bgActive : 'transparent',
                  borderRadius: '7px',
                  padding: '0.62rem 0.7rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: active ? area.color : 'var(--text-secondary)', fontWeight: 800, lineHeight: 1.2 }}>
                  {area.shortTitle}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '0.18rem' }}>
                  {area.subtitle}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {activeArea.id === 'refs_cruzadas' ? (
        <CrossReferencesWorkspace project={project} onAskAI={onAskAI} />
      ) : (
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '2.2rem clamp(1.4rem, 3vw, 2.4rem) 4rem' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: activeArea.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.35rem' }}>
                Ferramentas
              </div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: 0, lineHeight: 1.15, marginBottom: '0.45rem' }}>
                {activeArea.title}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '720px' }}>
                {activeArea.objective}
              </p>
            </div>
            <div style={{
              flexShrink: 0,
              border: `1px solid ${activeArea.color}`,
              background: activeArea.bgActive,
              color: activeArea.color,
              borderRadius: '7px',
              padding: '0.45rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}>
              {project.book} {project.passage_ref}
            </div>
          </div>

          <section style={{
            border: `1px solid ${activeArea.color}`,
            background: 'var(--surface)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'stretch' }}>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={activeArea.id === 'dicionario' ? 'Pesquisar termo, raiz, palavra grega/hebraica...' : 'Pesquisar tema, doutrina, autor, livro bíblico...'}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  padding: '0.72rem 0.85rem',
                  outline: 'none',
                }}
                onFocus={event => event.currentTarget.style.borderColor = activeArea.color}
                onBlur={event => event.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={() => ask(`Pesquise e organize uma resposta sobre: ${query || activeArea.title}.`)}
                style={{
                  background: activeArea.bgActive,
                  border: `1px solid ${activeArea.color}`,
                  borderRadius: '7px',
                  color: activeArea.color,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  padding: '0 0.95rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Pesquisar com IA
              </button>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)', gap: '1rem', alignItems: 'start' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                  Subáreas de pesquisa
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {activeArea.sections.map(section => (
                    <button
                      key={section}
                      onClick={() => {
                        setQuery(section)
                        ask(`Explique e desenvolva o tópico "${section}" dentro de ${activeArea.title}, relacionando com a passagem atual quando fizer sentido.`)
                      }}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.78rem',
                        padding: '0.34rem 0.58rem',
                      }}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.85rem' }}>
                  Visualização
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {activeArea.visualization.map((step, index) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <div style={{
                        minWidth: '112px',
                        border: `1px solid ${index === 0 ? activeArea.color : 'var(--border-subtle)'}`,
                        background: index === 0 ? activeArea.bgActive : 'var(--surface-2)',
                        color: index === 0 ? activeArea.color : 'var(--text-secondary)',
                        borderRadius: '7px',
                        padding: '0.58rem 0.65rem',
                        fontSize: '0.76rem',
                        lineHeight: 1.35,
                        fontWeight: 700,
                        textAlign: 'center',
                      }}>
                        {step}
                      </div>
                      {index < activeArea.visualization.length - 1 && (
                        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                  Ações da IA
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.55rem' }}>
                  {activeArea.actions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => ask(action.prompt)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${activeArea.color}`,
                        borderRadius: '7px',
                        color: activeArea.color,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.65rem 0.75rem',
                        textAlign: 'left',
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignSelf: 'start' }}>
              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                  Capacidades
                </div>
                <div style={{ display: 'grid', gap: '0.45rem' }}>
                  {activeArea.capabilities.map(item => (
                    <div key={item} style={{ display: 'flex', gap: '0.45rem', alignItems: 'baseline', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.45 }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeArea.color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {activeArea.references.map(reference => (
                <div
                  key={reference.title}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                    {reference.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {reference.items.map(item => (
                      <span
                        key={item}
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '5px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.74rem',
                          padding: '0.22rem 0.45rem',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>
      )}
    </div>
  )
}
