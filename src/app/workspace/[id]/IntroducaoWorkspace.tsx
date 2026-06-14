'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types/database'

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface DiscussionPositions {
  traditional?:         string
  critical?:            string
  evangelical?:         string
  pastoral?:            string
}

interface Division {
  title:       string
  description: string
}

interface InterpretiveIssue {
  question:  string
  positions: DiscussionPositions
}

interface BibEntry {
  author:    string
  work:      string
  publisher: string
  year:      string
}

interface BookIntroduction {
  id:                   string
  book_key:             string
  testament:            'AT' | 'NT'
  book_name:            string
  canonical_order:      number
  literary_category:    string | null
  author:               string | null
  author_discussion:    DiscussionPositions
  date_estimate:        string | null
  date_discussion:      DiscussionPositions
  recipients:           string | null
  historical_context:   string | null
  cultural_context:     string | null
  purpose:              string | null
  central_theme:        string | null
  structure:            string | null
  main_divisions:       Division[]
  theological_emphases: string | null
  redemptive_history:   string | null
  christ_relation:      string | null
  interpretive_issues:  InterpretiveIssue[]
  conservative_position:string | null
  bibliography:         BibEntry[]
  pastoral_observations:string | null
  summary:              string | null
  updated_at:           string
}

interface BookSummary {
  id:               string
  book_key:         string
  book_name:        string
  canonical_order:  number
  literary_category:string | null
  author:           string | null
  date_estimate:    string | null
  central_theme:    string | null
}

interface Props {
  testament: 'AT' | 'NT'
  project: Project
  onAskAI: (prompt: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const COLOR = {
  AT: '#B45309',
  NT: '#1D4ED8',
}

function hasPositions(p: DiscussionPositions): boolean {
  return !!(p.traditional || p.critical || p.evangelical || p.pastoral)
}

// ── Discussion box ─────────────────────────────────────────────────────────────

function DiscussionBox({ data, color }: { data: DiscussionPositions; color: string }) {
  if (!hasPositions(data)) return null
  const rows: { label: string; key: keyof DiscussionPositions }[] = [
    { label: 'Tradição',           key: 'traditional' },
    { label: 'Crítica histórica',  key: 'critical' },
    { label: 'Evangélica consv.',  key: 'evangelical' },
    { label: 'Avaliação pastoral', key: 'pastoral' },
  ]
  return (
    <div style={{
      marginTop: '0.75rem',
      border: `1px solid ${color}25`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '6px',
      overflow: 'hidden',
    }}>
      {rows.filter(r => !!data[r.key]).map((r, i) => (
        <div key={r.key} style={{
          padding: '0.5rem 0.8rem',
          borderTop: i > 0 ? `1px solid ${color}14` : 'none',
          background: i % 2 === 0 ? `${color}04` : 'transparent',
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: `${color}99`, marginBottom: '0.2rem' }}>
            {r.label}
          </div>
          <div style={{ fontSize: '0.77rem', color: '#374151', lineHeight: 1.6 }}>
            {data[r.key]}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Field block ────────────────────────────────────────────────────────────────

function Field({ label, value, color }: { label: string; value: string | null | undefined; color: string }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: `${color}BB`, marginBottom: '0.3rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.7 }}>
        {value}
      </div>
    </div>
  )
}

function SectionDivider({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6rem',
      margin: '1.8rem 0 1.1rem',
    }}>
      <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: color, flexShrink: 0 }} />
      <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color }} >
        {label}
      </div>
      <div style={{ flex: 1, height: '1px', background: `${color}20` }} />
    </div>
  )
}

// ── Empty / não preenchido ────────────────────────────────────────────────────

function EmptyIntro({ bookName, testament, onAskAI, color }: { bookName: string; testament: 'AT' | 'NT'; onAskAI: (p: string) => void; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📖</div>
      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.5rem' }}>
        Introdução a {bookName} ainda não disponível
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        O conteúdo editorial desta introdução será publicado em breve.
        <br />Use o assistente de IA para uma introdução preliminar.
      </div>
      <button
        onClick={() => onAskAI(`Faça uma introdução completa ao livro de ${bookName} (${testament}), cobrindo: autoria, data, destinatários, contexto histórico, propósito, estrutura, ênfases teológicas e relação com Cristo. Perspectiva conservadora e reformada.`)}
        style={{
          padding: '0.55rem 1.2rem', background: color, border: 'none',
          borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
          color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Gerar com IA
      </button>
    </div>
  )
}

// ── Detail view ────────────────────────────────────────────────────────────────

function IntroDetail({ intro, onBack, onAskAI, color }: {
  intro: BookIntroduction
  onBack: () => void
  onAskAI: (p: string) => void
  color: string
}) {
  return (
    <div style={{ padding: '1.5rem 1.75rem 3rem', maxWidth: '820px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'inherit' }}
        >
          ← Voltar
        </button>
        {intro.literary_category && (
          <span style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color, background: `${color}12`,
            border: `1px solid ${color}30`, borderRadius: '4px', padding: '0.05rem 0.35rem',
          }}>
            {intro.literary_category}
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#94a3b8' }}>
          {intro.testament} · Livro {intro.canonical_order}
        </span>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
        {intro.book_name}
      </h1>

      {intro.summary && (
        <div style={{
          fontSize: '0.85rem', color: '#475569', lineHeight: 1.7,
          marginBottom: '1.2rem', padding: '0.85rem 1rem',
          background: `${color}06`, border: `1px solid ${color}20`,
          borderRadius: '8px',
        }}>
          {intro.summary}
        </div>
      )}

      {/* AI actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {[
          { label: 'Visão geral', prompt: `Dê uma visão geral introdutória do livro de ${intro.book_name} com perspectiva conservadora reformada.` },
          { label: 'Contexto histórico', prompt: `Explique o contexto histórico e cultural do livro de ${intro.book_name} no mundo antigo.` },
          { label: 'Relação com Cristo', prompt: `Como o livro de ${intro.book_name} se relaciona com Cristo e com a história da redenção?` },
          { label: 'Questões interpretativas', prompt: `Quais são as principais questões interpretativas do livro de ${intro.book_name}? Apresente posições tradicionais, críticas e evangélicas.` },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => onAskAI(a.prompt)}
            style={{
              padding: '0.32rem 0.75rem', background: 'transparent',
              border: `1px solid ${color}40`, borderRadius: '6px',
              fontSize: '0.72rem', fontWeight: 600, color,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}08` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* ── AUTORIA ── */}
      <SectionDivider label="Autoria" color={color} />
      <Field label="Autor / Autoria tradicional" value={intro.author} color={color} />
      {hasPositions(intro.author_discussion) && (
        <>
          <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: `${color}BB`, marginBottom: '0.3rem' }}>
            Discussão sobre autoria
          </div>
          <DiscussionBox data={intro.author_discussion} color={color} />
        </>
      )}

      {/* ── DATA ── */}
      <SectionDivider label="Data e Composição" color={color} />
      <Field label="Data provável" value={intro.date_estimate} color={color} />
      {hasPositions(intro.date_discussion) && (
        <>
          <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: `${color}BB`, marginBottom: '0.3rem' }}>
            Discussão sobre data
          </div>
          <DiscussionBox data={intro.date_discussion} color={color} />
        </>
      )}

      {/* ── CONTEXTO ── */}
      <SectionDivider label="Contexto" color={color} />
      <Field label="Destinatários originais" value={intro.recipients} color={color} />
      <Field label="Contexto histórico" value={intro.historical_context} color={color} />
      <Field label="Contexto cultural" value={intro.cultural_context} color={color} />

      {/* ── PROPÓSITO ── */}
      <SectionDivider label="Propósito e Tema" color={color} />
      <Field label="Propósito do livro" value={intro.purpose} color={color} />
      <Field label="Tema central" value={intro.central_theme} color={color} />

      {/* ── ESTRUTURA ── */}
      <SectionDivider label="Estrutura" color={color} />
      <Field label="Estrutura geral" value={intro.structure} color={color} />

      {intro.main_divisions.length > 0 && (
        <div style={{ marginBottom: '1.1rem' }}>
          <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: `${color}BB`, marginBottom: '0.5rem' }}>
            Principais divisões
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {intro.main_divisions.map((d, i) => (
              <div key={i} style={{
                padding: '0.55rem 0.8rem',
                border: `1px solid ${color}18`,
                borderLeft: `3px solid ${color}`,
                borderRadius: '6px',
                background: `${color}04`,
              }}>
                <div style={{ fontSize: '0.77rem', fontWeight: 700, color: '#1e293b', marginBottom: d.description ? '0.2rem' : 0 }}>
                  {d.title}
                </div>
                {d.description && (
                  <div style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.5 }}>{d.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TEOLOGIA ── */}
      <SectionDivider label="Teologia" color={color} />
      <Field label="Ênfases teológicas" value={intro.theological_emphases} color={color} />
      <Field label="Relação com a história da redenção" value={intro.redemptive_history} color={color} />
      <Field label="Relação com Cristo" value={intro.christ_relation} color={color} />

      {/* ── QUESTÕES INTERPRETATIVAS ── */}
      {intro.interpretive_issues.length > 0 && (
        <>
          <SectionDivider label="Questões Interpretativas" color={color} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {intro.interpretive_issues.map((issue, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                  {i + 1}. {issue.question}
                </div>
                <DiscussionBox data={issue.positions} color={color} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── POSIÇÃO CONSERVADORA ── */}
      {intro.conservative_position && (
        <>
          <SectionDivider label="Posição Conservadora / Reformada" color={color} />
          <div style={{
            padding: '0.85rem 1rem',
            background: `${color}07`,
            border: `1px solid ${color}25`,
            borderLeft: `4px solid ${color}`,
            borderRadius: '8px',
            fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.7,
          }}>
            {intro.conservative_position}
          </div>
        </>
      )}

      {/* ── OBSERVAÇÕES PASTORAIS ── */}
      {intro.pastoral_observations && (
        <>
          <SectionDivider label="Observações Pastorais" color={color} />
          <div style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.7 }}>
            {intro.pastoral_observations}
          </div>
        </>
      )}

      {/* ── BIBLIOGRAFIA ── */}
      {intro.bibliography.length > 0 && (
        <>
          <SectionDivider label="Bibliografia Base" color={color} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {intro.bibliography.map((b, i) => (
              <div key={i} style={{ fontSize: '0.77rem', color: '#475569', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{b.author}</span>
                {b.work && <span> — <em>{b.work}</em></span>}
                {(b.publisher || b.year) && <span style={{ color: '#94a3b8' }}> ({[b.publisher, b.year].filter(Boolean).join(', ')})</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function IntroducaoWorkspace({ testament, project, onAskAI }: Props) {
  const color = COLOR[testament]
  const label = testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'

  const [books, setBooks]       = useState<BookSummary[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<BookIntroduction | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch]     = useState('')

  const fetchList = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/book-introductions?testament=${testament}`)
    if (res.ok) setBooks(await res.json() as BookSummary[])
    setLoading(false)
  }, [testament])

  useEffect(() => { void fetchList() }, [fetchList])

  // Auto-seleciona o livro do projeto ao carregar
  useEffect(() => {
    if (!project.book || books.length === 0) return
    const match = books.find(b =>
      b.book_key.toLowerCase() === project.book.toLowerCase() ||
      b.book_name.toLowerCase() === project.book.toLowerCase()
    )
    if (match) void openBook(match.book_key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books])

  async function openBook(bookKey: string) {
    setDetailLoading(true)
    const res = await fetch(`/api/book-introductions?book_key=${encodeURIComponent(bookKey)}`)
    if (res.ok) {
      const data = await res.json() as BookIntroduction | null
      setSelected(data)
    } else {
      setSelected(null)
    }
    setDetailLoading(false)
  }

  const filtered = search.trim()
    ? books.filter(b =>
        b.book_name.toLowerCase().includes(search.toLowerCase()) ||
        (b.literary_category ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : books

  // ── Detail view ──────────────────────────────────────────────────────────

  if (detailLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Carregando…</div>
      </div>
    )
  }

  if (selected) {
    return (
      <IntroDetail
        intro={selected}
        onBack={() => setSelected(null)}
        onAskAI={onAskAI}
        color={color}
      />
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.75rem 1.75rem 3rem', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', marginBottom: '0.2rem' }}>
          Introdução ao {label}
        </div>
        <div style={{ fontSize: '0.77rem', color: '#64748b' }}>
          {testament === 'AT' ? '39 livros' : '27 livros'} · Conteúdo editorial Lampas · Perspectiva conservadora e reformada
        </div>
      </div>

      {/* Aviso se projeto AT/NT diferente */}
      {project.book && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.6rem 0.85rem', marginBottom: '1.25rem',
          background: `${color}08`, border: `1px solid ${color}25`, borderRadius: '8px',
          fontSize: '0.77rem', color,
        }}>
          <span>📌</span>
          <span>Projeto atual: <strong>{project.book}</strong> {project.passage_ref} — clique no livro abaixo para abrir a introdução</span>
        </div>
      )}

      {/* Busca */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar livro…"
        style={{
          width: '100%', boxSizing: 'border-box',
          border: '1.5px solid #E2E8F0', borderRadius: '8px',
          padding: '0.5rem 0.85rem', fontSize: '0.85rem',
          fontFamily: 'inherit', color: '#1e293b', outline: 'none',
          marginBottom: '1.1rem',
          transition: 'border-color 0.12s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = color }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E2E8F0' }}
      />

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          Carregando…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          Nenhum livro encontrado
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.65rem',
        }}>
          {filtered.map(b => {
            const isCurrentBook = project.book &&
              (b.book_key.toLowerCase() === project.book.toLowerCase() ||
               b.book_name.toLowerCase() === project.book.toLowerCase())

            return (
              <button
                key={b.book_key}
                onClick={() => openBook(b.book_key)}
                style={{
                  textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
                  border: isCurrentBook ? `2px solid ${color}` : '1px solid #E2E8F0',
                  borderRadius: '10px', padding: '0.85rem 0.9rem',
                  background: isCurrentBook ? `${color}06` : '#FAFAFA',
                  transition: 'border-color 0.12s, background 0.12s',
                  display: 'flex', flexDirection: 'column', gap: '0.2rem',
                }}
                onMouseEnter={e => {
                  if (!isCurrentBook) {
                    e.currentTarget.style.borderColor = `${color}55`
                    e.currentTarget.style.background = `${color}04`
                  }
                }}
                onMouseLeave={e => {
                  if (!isCurrentBook) {
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.background = '#FAFAFA'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem' }}>
                  <span style={{ fontSize: '0.6rem', color: `${color}88`, fontWeight: 700 }}>
                    {String(b.canonical_order).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isCurrentBook ? color : '#1e293b' }}>
                    {b.book_name}
                  </span>
                  {isCurrentBook && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color, fontWeight: 800 }}>●</span>}
                </div>
                {b.literary_category && (
                  <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>
                    {b.literary_category}
                  </div>
                )}
                {b.author && (
                  <div style={{ fontSize: '0.67rem', color: '#64748b' }}>{b.author}</div>
                )}
                {b.central_theme && (
                  <div style={{ fontSize: '0.67rem', color: '#94a3b8', lineHeight: 1.35, marginTop: '0.1rem' }}>
                    {b.central_theme.length > 80 ? `${b.central_theme.slice(0, 80)}…` : b.central_theme}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
