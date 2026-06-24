'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import MarkdownRenderer from '@/components/MarkdownRenderer'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LexicalTerm {
  id: string
  word: string
  transliteration: string
  translation: string
  wordClass: string
  occurrences: string
  dictionaries: string[]
  analysis: string
}

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function isRTL(text: string): boolean {
  return /[֐-׿؀-ۿיִ-ﭏ]/.test(text)
}

const WORD_CLASS_COLORS: Array<[string, string]> = [
  ['verbo',          'var(--accent)'],
  ['substantivo',    'var(--ai)'],
  ['nome próprio',   'var(--success)'],
  ['nome',           'var(--success)'],
  ['adjetivo',       '#9b7ec8'],
  ['advérbio',       '#c47c5a'],
  ['partícula',      '#6db8a0'],
  ['preposição',     '#6db8a0'],
  ['conjunção',      '#6db8a0'],
]

function wordClassColor(wc: string): string {
  const lc = wc.toLowerCase()
  for (const [key, color] of WORD_CLASS_COLORS) {
    if (lc.includes(key)) return color
  }
  return 'var(--accent)'
}

function loadTerms(section: Section | undefined): LexicalTerm[] {
  const content = section?.content as { terms?: LexicalTerm[] } | null
  if (Array.isArray(content?.terms)) return content.terms
  return []
}

function hasOldFormat(section: Section | undefined): boolean {
  const content = section?.content as { cards?: Record<string, string> } | null
  return !!(content?.cards && Object.keys(content.cards).length > 0)
}

// ── Input field component ─────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, autoFocus, style,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; autoFocus?: boolean; style?: React.CSSProperties
}) {
  return (
    <div style={style}>
      <label style={{
        display: 'block', fontSize: '0.63rem', fontWeight: 700,
        letterSpacing: '0.05em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: '0.3rem',
      }}>
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: '100%', background: 'var(--surface-2)',
          border: '1px solid var(--border)', borderRadius: '5px',
          padding: '0.45rem 0.7rem', color: 'var(--text-primary)',
          fontSize: '0.88rem', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box' as const,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

// ── Key questions ─────────────────────────────────────────────────────────

const KEY_QUESTIONS = [
  'Quais são os termos teologicamente carregados desta perícope?',
  'Como BDAG/HALOT define o termo em seu uso técnico?',
  'Como o autor usa este termo em outras passagens do mesmo livro?',
  'Como o AT usa este termo e o NT o recebe ou transforma?',
  'O contexto imediato ilumina ou restringe o sentido do termo?',
]

// ── Lexical Expand Modal ──────────────────────────────────────────────────

function LexicalExpandModal({
  term, project, onSave, onClose,
}: {
  term: LexicalTerm
  project: Props['project']
  onSave: (val: string) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<'view' | 'edit'>(term.analysis.trim() ? 'view' : 'edit')
  const [editValue, setEditValue] = useState(term.analysis)
  const color = wordClassColor(term.wordClass)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '100%', maxWidth: '880px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.09em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem',
            }}>
              Estudo Lexical
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.7rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '1.5rem', fontWeight: 700, color,
                fontFamily: 'var(--font-serif)', lineHeight: 1.2,
              }}>
                {term.word}
              </span>
              {term.transliteration && (
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {term.transliteration}
                </span>
              )}
              {term.translation && (
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  &ldquo;{term.translation}&rdquo;
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {project.book} {project.passage_ref}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <div style={{
              display: 'flex', background: 'var(--surface-2)',
              borderRadius: '7px', padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}>
              {(['view', 'edit'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  border: `1px solid ${mode === m ? 'var(--border-subtle)' : 'transparent'}`,
                  borderRadius: '5px', padding: '0.28rem 0.75rem',
                  fontSize: '0.71rem', fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                }}>
                  {m === 'view' ? 'Visualizar' : 'Editar'}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid var(--border-subtle)',
                borderRadius: '6px', padding: '0.3rem 0.55rem',
                color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '0.9rem', lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
          {mode === 'view' ? (
            term.analysis.trim() ? (
              <MarkdownRenderer content={term.analysis} moduleColor={color} />
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.88rem' }}>
                Nenhum estudo lexical ainda. Alterne para &ldquo;Editar&rdquo; para adicionar.
              </p>
            )
          ) : (
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
              placeholder={`## Definição\nBDAG/HALOT define...\n\n## Campo Semântico\n...\n\n## Uso na Perícope\n...\n\n## Implicação Teológica\n...`}
              style={{
                width: '100%', minHeight: '440px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1rem 1.15rem',
                color: 'var(--text-primary)',
                fontSize: '0.91rem', lineHeight: '1.82',
                resize: 'none', outline: 'none',
                fontFamily: 'var(--font-serif)',
                boxSizing: 'border-box',
                caretColor: color,
              }}
              onFocus={e => (e.target.style.borderColor = `${color}60`)}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          )}
        </div>

        {/* Footer */}
        {mode === 'edit' && (
          <div style={{
            padding: '0.9rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '0.6rem', flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '7px', padding: '0.48rem 1rem',
                color: 'var(--text-muted)', fontSize: '0.81rem',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Fechar
            </button>
            <button
              onClick={() => onSave(editValue)}
              style={{
                background: 'var(--accent)', border: 'none',
                borderRadius: '7px', padding: '0.48rem 1.2rem',
                color: '#fff', fontSize: '0.81rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function TermosChaveWorkspace({
  project, userId, existingSection, onUpdate, onAskAI,
}: Props) {
  const supabase = createClient()
  const [terms, setTerms] = useState<LexicalTerm[]>(() => loadTerms(existingSection))
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set())
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [identifyingTerms, setIdentifyingTerms] = useState(false)
  const [addingTerm, setAddingTerm] = useState(false)
  const [newWord, setNewWord] = useState('')
  const [newTranslit, setNewTranslit] = useState('')
  const [newTranslation, setNewTranslation] = useState('')
  const [newClass, setNewClass] = useState('')
  const [newOccurrences, setNewOccurrences] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [expandModal, setExpandModal] = useState<string | null>(null)

  const latestTerms = useRef(terms)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sectionIdRef = useRef(existingSection?.id)
  latestTerms.current = terms

  const showOldFormatNotice = hasOldFormat(existingSection) && terms.length === 0

  const performSave = useCallback(async (t: LexicalTerm[]) => {
    setSaving(true)
    const payload = {
      project_id: project.id, user_id: userId,
      slug: 'termos_chave', module: 'inventio',
      title: '2.4 Termos-Chave',
      content: { terms: t },
      status: (t.length > 0 ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    try {
      if (sectionIdRef.current) {
        const { data } = await supabase
          .from('sections').update(payload)
          .eq('id', sectionIdRef.current).select().single()
        if (data) onUpdate(data as Section)
      } else {
        const { data } = await supabase
          .from('sections').insert(payload).select().single()
        if (data) {
          sectionIdRef.current = (data as Section).id
          onUpdate(data as Section)
        }
      }
    } finally {
      setSaving(false)
      setSavedAt(new Date())
    }
  }, [project.id, userId, supabase, onUpdate])

  function scheduleAutosave(t: LexicalTerm[]) {
    setTerms(t)
    latestTerms.current = t
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(latestTerms.current), 1500)
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleEdit(id: string) {
    setEditingIds(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function updateAnalysis(id: string, value: string) {
    scheduleAutosave(latestTerms.current.map(t => t.id === id ? { ...t, analysis: value } : t))
  }

  function removeTerm(id: string) {
    scheduleAutosave(latestTerms.current.filter(t => t.id !== id))
    setExpandedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    setEditingIds(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function addTerm() {
    if (!newWord.trim()) return
    const term: LexicalTerm = {
      id: genId(),
      word: newWord.trim(), transliteration: newTranslit.trim(),
      translation: newTranslation.trim(), wordClass: newClass.trim(),
      occurrences: newOccurrences.trim(), dictionaries: [], analysis: '',
    }
    setAddingTerm(false)
    setNewWord(''); setNewTranslit(''); setNewTranslation('')
    setNewClass(''); setNewOccurrences('')
    setExpandedIds(prev => new Set([...prev, term.id]))
    setEditingIds(prev => new Set([...prev, term.id]))
    scheduleAutosave([...latestTerms.current, term])
  }

  async function identifyTerms() {
    setIdentifyingTerms(true)
    try {
      const res = await fetch('/api/claude/generate-terms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'identify',
          project: {
            id: project.id, book: project.book, passage_ref: project.passage_ref,
            testament: project.testament, original_language: project.original_language,
            study_mode: project.study_mode,
          },
        }),
      })
      const data = await res.json()
      if (Array.isArray(data.terms)) {
        const newTerms: LexicalTerm[] = data.terms.map((t: Partial<LexicalTerm>) => ({
          id: genId(), word: t.word || '', transliteration: t.transliteration || '',
          translation: t.translation || '', wordClass: t.wordClass || '',
          occurrences: t.occurrences || '', dictionaries: [], analysis: '',
        }))
        setExpandedIds(prev => new Set([...prev, ...newTerms.map(t => t.id)]))
        scheduleAutosave([...latestTerms.current, ...newTerms])
      }
    } catch { /* ignore */ } finally {
      setIdentifyingTerms(false)
    }
  }

  async function analyzeTerm(id: string) {
    const term = latestTerms.current.find(t => t.id === id)
    if (!term) return
    setGeneratingId(id)
    setExpandedIds(prev => new Set([...prev, id]))
    try {
      const res = await fetch('/api/claude/generate-terms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          term: {
            word: term.word, transliteration: term.transliteration,
            translation: term.translation, wordClass: term.wordClass,
          },
          project: {
            id: project.id, book: project.book, passage_ref: project.passage_ref,
            testament: project.testament, original_language: project.original_language,
            study_mode: project.study_mode,
          },
        }),
      })
      const data = await res.json()
      if (data.analysis) {
        setEditingIds(prev => { const n = new Set(prev); n.delete(id); return n })
        scheduleAutosave(
          latestTerms.current.map(t =>
            t.id === id ? { ...t, analysis: data.analysis, dictionaries: data.dictionaries ?? t.dictionaries } : t
          )
        )
      }
    } catch { /* ignore */ } finally {
      setGeneratingId(null)
    }
  }

  const savedLabel = saving
    ? 'salvando…'
    : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{
      maxWidth: '720px', margin: '0 auto',
      padding: '2rem clamp(1rem, 3vw, 2rem) 5rem',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Document header ── */}
      <div style={{ paddingBottom: '2.5rem' }}>
        <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'var(--accent)', marginBottom: '1.1rem' }} />

        <h1 style={{
          margin: 0,
          fontSize: '2.5rem', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.045em',
          lineHeight: 1.0,
        }}>
          {project.title}
        </h1>

        <p style={{
          margin: '0.6rem 0 0',
          fontSize: '0.8rem', fontWeight: 400,
          color: 'var(--text-muted)', letterSpacing: '0.01em',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <span>Estudo Textual</span>
          {project.bible_version && (
            <>
              <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>·</span>
              <span>{project.bible_version}</span>
            </>
          )}
          {project.original_language && (
            <>
              <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>·</span>
              <span>{project.original_language}</span>
            </>
          )}
          <span style={{
            marginLeft: 'auto', fontSize: '0.72rem',
            color: saving ? 'var(--ai)' : savedAt ? 'var(--success)' : 'transparent',
            transition: 'color 0.3s',
          }}>
            {savedLabel || '·'}
          </span>
        </p>

        <div style={{ margin: '1.75rem 0 0', height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      {/* ── Chapter heading ── */}
      <h2 style={{
        fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em',
        lineHeight: 1.15, color: 'var(--text-primary)', margin: '0 0 0.75rem',
      }}>
        Termos-Chave
      </h2>

      {/* Objective */}
      <p style={{
        fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.75',
        fontStyle: 'italic', borderLeft: '2px solid rgba(37,99,235,0.4)',
        paddingLeft: '1rem', marginBottom: '1.5rem', marginTop: '0.5rem',
      }}>
        Investigar os termos lexicalmente decisivos da perícope segundo análise semântica completa —
        etimologia, campo semântico, uso canônico e implicação teológica — usando os dicionários técnicos de referência.
      </p>

      {/* Key questions */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setQuestionsOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', padding: 0,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', opacity: 0.55 }}>
            {questionsOpen ? '▾' : '▸'}
          </span>
          <span style={{
            fontSize: '0.67rem', fontWeight: '600', letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            Perguntas Centrais
          </span>
          {!questionsOpen && (
            <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.5 }}>
              — {KEY_QUESTIONS.length} orientações
            </span>
          )}
        </button>
        {questionsOpen && (
          <div style={{ marginTop: '0.7rem', paddingLeft: '0.85rem', borderLeft: '1px solid rgba(184,146,42,0.2)' }}>
            {KEY_QUESTIONS.map((q, i) => (
              <button
                key={i} onClick={() => onAskAI(q)}
                style={{
                  display: 'block', width: '100%', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  padding: '0.2rem 0', color: 'var(--text-muted)',
                  fontSize: '0.81rem', fontStyle: 'italic', lineHeight: '1.6',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                · {q}
              </button>
            ))}
            <div style={{
              marginTop: '0.6rem', paddingTop: '0.45rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.69rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.65,
            }}>
              BDAG · HALOT · TWOT · NIDNTTE · Moisés Silva
            </div>
          </div>
        )}
      </div>

      {/* Old format notice */}
      {showOldFormatNotice && (
        <div style={{
          background: 'rgba(184,146,42,0.08)', border: '1px solid rgba(184,146,42,0.25)',
          borderRadius: '6px', padding: '0.85rem 1rem', marginBottom: '1.5rem',
          fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.6',
        }}>
          <strong style={{ color: 'var(--accent)' }}>Formato atualizado.</strong>{' '}
          Esta seção foi reformulada para o laboratório lexical dinâmico.
          Clique em <strong>"Identificar com IA"</strong> para iniciar com o novo formato.
        </div>
      )}

      {/* Action bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        marginBottom: '1.5rem', paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap',
      }}>
        <button
          onClick={identifyTerms} disabled={identifyingTerms}
          style={{
            background: 'transparent',
            border: `1px solid ${identifyingTerms ? 'var(--border)' : 'var(--accent)'}`,
            color: identifyingTerms ? 'var(--text-muted)' : 'var(--accent)',
            borderRadius: '6px', padding: '0.45rem 0.9rem',
            fontSize: '0.79rem', cursor: identifyingTerms ? 'wait' : 'pointer',
            fontFamily: 'inherit', fontWeight: '600', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!identifyingTerms) e.currentTarget.style.background = 'var(--accent-subtle)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {identifyingTerms ? 'Identificando…' : 'Identificar com IA'}
        </button>

        <button
          onClick={() => setAddingTerm(true)} disabled={addingTerm}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: '6px',
            padding: '0.45rem 0.9rem', fontSize: '0.79rem',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          + Termo manual
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          {terms.length > 0 && (
            <span style={{
              background: 'var(--accent-subtle)', border: '1px solid rgba(184,146,42,0.25)',
              borderRadius: '10px', padding: '0.15rem 0.65rem',
              fontSize: '0.68rem', fontWeight: '700', color: 'var(--accent)',
              marginRight: '0.4rem',
            }}>
              {terms.length} {terms.length === 1 ? 'termo' : 'termos'}
            </span>
          )}
          {(['cards', 'table'] as const).map(m => (
            <button
              key={m} onClick={() => setViewMode(m)}
              style={{
                background: viewMode === m ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${viewMode === m ? 'var(--border)' : 'var(--border-subtle)'}`,
                color: viewMode === m ? 'var(--text-secondary)' : 'var(--text-muted)',
                borderRadius: '5px', padding: '0.3rem 0.65rem',
                fontSize: '0.71rem', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: '600', transition: 'all 0.12s',
              }}
            >
              {m === 'cards' ? 'Cards' : 'Tabela'}
            </button>
          ))}
        </div>
      </div>

      {/* Add term form */}
      {addingTerm && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem',
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem',
          }}>
            Novo Termo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Field label="Palavra (heb./gr.)" value={newWord} onChange={setNewWord} placeholder="יְהוָה" autoFocus />
            <Field label="Transliteração" value={newTranslit} onChange={setNewTranslit} placeholder="YHWH" />
            <Field label="Tradução" value={newTranslation} onChange={setNewTranslation} placeholder="Senhor" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <Field label="Classe gramatical" value={newClass} onChange={setNewClass} placeholder="Substantivo, Verbo…" />
            <Field label="Ocorrências" value={newOccurrences} onChange={setNewOccurrences} placeholder="v.2, v.3, v.21" />
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={addTerm} disabled={!newWord.trim()}
              style={{
                background: newWord.trim() ? 'var(--accent)' : 'var(--surface-3)',
                border: 'none', borderRadius: '6px', padding: '0.45rem 1rem',
                color: newWord.trim() ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem', cursor: newWord.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', fontWeight: '600',
              }}
            >
              Adicionar
            </button>
            <button
              onClick={() => { setAddingTerm(false); setNewWord('') }}
              style={{
                background: 'transparent', border: '1px solid var(--border-subtle)',
                borderRadius: '6px', padding: '0.45rem 0.9rem',
                color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {terms.length === 0 && !addingTerm && (
        <div style={{
          textAlign: 'center', padding: '4rem 1rem',
          color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.75',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.2, fontFamily: 'var(--font-serif)' }}>α</div>
          <p style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Nenhum termo identificado ainda.
          </p>
          <p style={{ fontSize: '0.8rem' }}>
            Clique em{' '}
            <strong style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={identifyTerms}>
              Identificar com IA
            </strong>
            {' '}ou adicione um termo manualmente.
          </p>
        </div>
      )}

      {/* ── Cards view ─────────────────────────────────────────────────────── */}
      {viewMode === 'cards' && (
        <div>
          {terms.map(term => {
            const expanded = expandedIds.has(term.id)
            const hasAnalysis = term.analysis.trim().length > 0
            const isEditing = editingIds.has(term.id) || !hasAnalysis
            const isGenerating = generatingId === term.id
            const color = wordClassColor(term.wordClass)
            const rtl = isRTL(term.word)

            return (
              <div
                key={term.id}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '8px', marginBottom: '0.65rem', overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div
                  onClick={() => toggleExpand(term.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                    padding: '0.9rem 1rem', cursor: 'pointer',
                    borderBottom: expanded ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.015)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                >
                  {/* Status dot */}
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, marginTop: '0.6rem',
                    background: hasAnalysis ? color : 'var(--border)',
                    boxShadow: hasAnalysis ? `0 0 5px ${color}50` : 'none',
                  }} />

                  {/* Term info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span
                        className={rtl ? 'hebrew' : 'greek'}
                        dir={rtl ? 'rtl' : undefined}
                        style={{
                          fontSize: '1.5rem', fontWeight: 700, color,
                          fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', lineHeight: 1.15,
                        }}
                      >
                        {term.word}
                      </span>
                      {term.transliteration && (
                        <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {term.transliteration}
                        </span>
                      )}
                      {term.translation && (
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          "{term.translation}"
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {term.wordClass && (
                        <span style={{
                          fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.05em',
                          textTransform: 'uppercase', color, opacity: 0.8,
                          background: `${color}12`, border: `1px solid ${color}28`,
                          borderRadius: '3px', padding: '0.06rem 0.38rem',
                        }}>
                          {term.wordClass}
                        </span>
                      )}
                      {term.occurrences && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {term.occurrences}
                        </span>
                      )}
                      {term.dictionaries.length > 0 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', opacity: 0.65 }}>
                          · {term.dictionaries.join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); analyzeTerm(term.id) }}
                      disabled={isGenerating}
                      style={{
                        background: 'transparent', border: 'none',
                        color: isGenerating ? 'var(--text-muted)' : color,
                        cursor: isGenerating ? 'wait' : 'pointer',
                        fontFamily: 'inherit', fontSize: '0.71rem', fontWeight: '600',
                        padding: 0, whiteSpace: 'nowrap', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { if (!isGenerating) e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseLeave={e => { if (!isGenerating) e.currentTarget.style.color = color }}
                    >
                      {isGenerating ? 'Analisando…' : hasAnalysis ? 'Reanalisar ↑' : 'Analisar ↑'}
                    </button>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', userSelect: 'none' }}>
                      {expanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded body */}
                {expanded && (
                  <div style={{ padding: '1rem 1.1rem' }}>

                    {/* Analysis */}
                    {isEditing ? (
                      <textarea
                        value={term.analysis}
                        onChange={e => updateAnalysis(term.id, e.target.value)}
                        placeholder={`Análise de "${term.word}" — use markdown:\n\n## Definição\nBDAG/HALOT define...\n\n## Campo Semântico\n...\n\n## Uso na Perícope\n...\n\n## Implicação Teológica\n...`}
                        rows={10}
                        style={{
                          width: '100%', background: 'var(--surface-2)',
                          border: '1px solid var(--border-subtle)', borderRadius: '6px',
                          padding: '0.9rem 1rem', color: 'var(--text-primary)',
                          fontSize: '0.9rem', lineHeight: '1.78', resize: 'vertical',
                          outline: 'none', fontFamily: 'var(--font-serif)',
                          boxSizing: 'border-box', caretColor: color,
                        }}
                        onFocus={e => (e.target.style.borderColor = `${color}60`)}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                      />
                    ) : (
                      <div style={{
                        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
                        borderRadius: '6px', padding: '1rem 1.1rem', minHeight: '4rem',
                      }}>
                        <MarkdownRenderer content={term.analysis} moduleColor={color} />
                      </div>
                    )}

                    {/* Card footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      marginTop: '0.65rem', flexWrap: 'wrap',
                    }}>
                      {hasAnalysis && (
                        <button
                          onClick={() => toggleEdit(term.id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.69rem',
                            color: 'var(--text-muted)', padding: 0, transition: 'color 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                        >
                          {isEditing ? '← Visualizar' : 'Editar'}
                        </button>
                      )}

                      <button
                        onClick={() => setExpandModal(term.id)}
                        title="Abrir em tela cheia"
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.69rem',
                          color: 'var(--text-muted)', padding: 0, transition: 'color 0.12s',
                          display: 'flex', alignItems: 'center', gap: '0.25rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                        Expandir
                      </button>

                      <button
                        onClick={() => onAskAI(
                          `Aprofunde a análise de "${term.word}"${term.transliteration ? ` (${term.transliteration})` : ''}: "${term.translation}" em ${project.book} ${project.passage_ref}. Consulte BDAG, HALOT ou TWOT e desenvolva as implicações teológicas e canônicas.`
                        )}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.69rem',
                          color: 'var(--text-muted)', padding: 0, transition: 'color 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--ai)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        Perguntar à IA →
                      </button>

                      <button
                        onClick={() => removeTerm(term.id)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.69rem',
                          color: 'var(--text-muted)', padding: 0,
                          marginLeft: 'auto', transition: 'color 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Table view ─────────────────────────────────────────────────────── */}
      {viewMode === 'table' && terms.length > 0 && (
        <div style={{
          border: '1px solid var(--border-subtle)', borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
            <thead>
              <tr>
                {['Palavra', 'Transliteração', 'Tradução', 'Classe', 'Ocorrências', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '0.6rem 0.9rem', textAlign: 'left',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                    background: 'var(--accent-subtle)', borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {terms.map((term, i) => {
                const color = wordClassColor(term.wordClass)
                const rtl = isRTL(term.word)
                const hasAnalysis = term.analysis.trim().length > 0
                return (
                  <tr
                    key={term.id}
                    onClick={() => {
                      setViewMode('cards')
                      setExpandedIds(prev => new Set([...prev, term.id]))
                    }}
                    style={{
                      borderBottom: i < terms.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                  >
                    <td style={{ padding: '0.7rem 0.9rem' }}>
                      <span
                        className={rtl ? 'hebrew' : 'greek'}
                        dir={rtl ? 'rtl' : undefined}
                        style={{
                          fontSize: '1.2rem', fontWeight: 700, color,
                          fontFamily: 'var(--font-serif)',
                        }}
                      >
                        {term.word}
                      </span>
                    </td>
                    <td style={{ padding: '0.7rem 0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.84rem' }}>
                      {term.transliteration || '—'}
                    </td>
                    <td style={{ padding: '0.7rem 0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {term.translation || '—'}
                    </td>
                    <td style={{ padding: '0.7rem 0.9rem' }}>
                      {term.wordClass ? (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
                          textTransform: 'uppercase', color, opacity: 0.85,
                          background: `${color}12`, border: `1px solid ${color}28`,
                          borderRadius: '3px', padding: '0.06rem 0.38rem',
                        }}>
                          {term.wordClass}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.7rem 0.9rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {term.occurrences || '—'}
                    </td>
                    <td style={{ padding: '0.7rem 0.9rem' }}>
                      {hasAnalysis ? (
                        <span style={{ color: 'var(--success)', fontSize: '0.71rem', fontWeight: 600 }}>✓ Analisado</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.71rem' }}>Pendente</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'table' && terms.length === 0 && !addingTerm && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', textAlign: 'center', padding: '2rem' }}>
          Nenhum termo para exibir.
        </p>
      )}

      {expandModal && (() => {
        const expandTerm = terms.find(t => t.id === expandModal)
        if (!expandTerm) return null
        return (
          <LexicalExpandModal
            term={expandTerm}
            project={project}
            onSave={(val) => { updateAnalysis(expandTerm.id, val); setExpandModal(null) }}
            onClose={() => setExpandModal(null)}
          />
        )
      })()}

    </div>
  )
}
