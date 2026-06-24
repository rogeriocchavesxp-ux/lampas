'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import HelpIcon from '@/components/help/HelpIcon'
import MarkdownRenderer from '@/components/MarkdownRenderer'

// ── Types ─────────────────────────────────────────────────────────────────

type LiteraryGenre = 'narrativa' | 'epistolar' | 'poesia' | 'profecia' | 'apocaliptica' | 'sapiencial' | 'lei'
type CardState = 'idle' | 'generating' | 'saving' | 'saved'

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  savedSections: Section[]
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

// ── Genre configuration ───────────────────────────────────────────────────

const GENRES: { id: LiteraryGenre; label: string; color: string }[] = [
  { id: 'narrativa',    label: 'Narrativa',    color: '#c9955a' },
  { id: 'epistolar',    label: 'Epistolar',    color: 'var(--ai)' },
  { id: 'poesia',       label: 'Poesia',       color: '#9b7ec8' },
  { id: 'profecia',     label: 'Profecia',     color: 'var(--accent)' },
  { id: 'apocaliptica', label: 'Apocalíptica', color: '#c47c5a' },
  { id: 'sapiencial',   label: 'Sapiencial',   color: 'var(--success)' },
  { id: 'lei',          label: 'Lei',          color: '#8fa8c8' },
]

const GENRE_CARD_IDS: Record<LiteraryGenre, string[]> = {
  narrativa:    ['esboço_narrativo', 'personagens_narrativos', 'cenario_tempo', 'enredo_tensao', 'climax_resolucao', 'dispositivos_narrativos'],
  epistolar:    ['tese_argumento', 'fluxo_argumentativo', 'premissas_conclusoes', 'exortacoes_aplicacao', 'dispositivos_retoricos'],
  poesia:       ['tipo_paralelismo', 'estrutura_estrofica', 'imagens_metaforas', 'quiasmo_inclusio_poetico', 'campos_semanticos'],
  profecia:     ['tipo_oraculo', 'estrutura_profetica', 'acusacoes_pecados', 'promessas_salvacao', 'cumprimento_progressivo'],
  apocaliptica: ['visoes_simbolos', 'estrutura_ciclos', 'imagens_cosmicas', 'escatologia'],
  sapiencial:   ['forma_sapiencial', 'paralelos_contraste', 'aplicacao_sapiencial', 'base_teologica_sap'],
  lei:          ['tipo_lei', 'contexto_aliancal', 'principio_etico', 'hermeneutica_crista'],
}

const GENRE_QUESTIONS: Record<LiteraryGenre, string[]> = {
  narrativa: [
    'Qual é a estrutura narrativa (atos, cenas, transições)?',
    'Quem são os personagens e como se desenvolvem ao longo da narrativa?',
    'Qual é o conflito central e como é resolvido?',
    'Quais dispositivos literários o narrador emprega (inclusio, quiasmo, ironia, repetição)?',
    'Como o ponto de vista narrativo molda a teologia do texto?',
  ],
  epistolar: [
    'Qual é a tese ou proposição central do texto?',
    'Como o argumento progride da premissa à conclusão?',
    'Quais conectivos lógicos estruturam o raciocínio?',
    'Há dispositivos retóricos (diatribe, pergunta retórica, antítese)?',
    'Como as exortações dependem da fundamentação teológica (indicativo → imperativo)?',
  ],
  poesia: [
    'Qual é o tipo de paralelismo predominante?',
    'Como o poema está dividido em estrofes ou unidades?',
    'Quais são as imagens e metáforas centrais e o que revelam?',
    'Há quiasmo ou inclusio que identifica o elemento central?',
    'Quais campos semânticos estruturam o significado?',
  ],
  profecia: [
    'Qual é o tipo de oráculo (julgamento, salvação, exortação)?',
    'Que pecados são denunciados e quem são os destinatários?',
    'Há promessas? São condicionais ou incondicionais?',
    'Como a profecia aponta progressivamente para Cristo?',
    'Qual é a dimensão escatológica do oráculo?',
  ],
  apocaliptica: [
    'Que visões e símbolos dominam o texto e o que representam?',
    'Como esta visão se insere nos ciclos do livro?',
    'Que base do AT ilumina as imagens cósmicas?',
    'Qual é a tensão "já / ainda não" nesta perícope?',
    'Qual é a função pastoral da esperança apocalíptica para os destinatários?',
  ],
  sapiencial: [
    'Qual é a forma sapiencial predominante (provérbio, instrução, enigma)?',
    'Como o texto ensina por paralelos e contrastes?',
    'Que habilidade de vida prática o texto transmite?',
    'Como o "temor do Senhor" fundamenta a sabedoria prática?',
    'A sabedoria é criacional, redentiva ou ambas?',
  ],
  lei: [
    'Qual é o tipo de lei (apodítica, casuística, ritual, civil)?',
    'Em que contexto alianção esta lei está inserida?',
    'Qual é o princípio moral permanente subjacente?',
    'Como um cristão deve ler esta lei à luz de Cristo?',
    'Qual é a relação entre a lei e a graça neste texto?',
  ],
}

// ── Book → genre map ──────────────────────────────────────────────────────

const BOOK_GENRE: Partial<Record<string, LiteraryGenre>> = {
  'Gênesis': 'narrativa', 'Êxodo': 'narrativa', 'Números': 'narrativa',
  'Josué': 'narrativa', 'Juízes': 'narrativa', 'Rute': 'narrativa',
  '1 Samuel': 'narrativa', '2 Samuel': 'narrativa',
  '1 Reis': 'narrativa', '2 Reis': 'narrativa',
  '1 Crônicas': 'narrativa', '2 Crônicas': 'narrativa',
  'Esdras': 'narrativa', 'Neemias': 'narrativa', 'Ester': 'narrativa', 'Jonas': 'narrativa',
  'Levítico': 'lei', 'Deuteronômio': 'lei',
  'Jó': 'poesia', 'Salmos': 'poesia', 'Lamentações': 'poesia', 'Cânticos': 'poesia',
  'Provérbios': 'sapiencial', 'Eclesiastes': 'sapiencial',
  'Isaías': 'profecia', 'Jeremias': 'profecia', 'Ezequiel': 'profecia',
  'Oséias': 'profecia', 'Joel': 'profecia', 'Amós': 'profecia', 'Obadias': 'profecia',
  'Miquéias': 'profecia', 'Naum': 'profecia', 'Habacuque': 'profecia',
  'Sofonias': 'profecia', 'Ageu': 'profecia', 'Zacarias': 'profecia', 'Malaquias': 'profecia',
  'Daniel': 'apocaliptica',
  'Mateus': 'narrativa', 'Marcos': 'narrativa', 'Lucas': 'narrativa', 'João': 'narrativa', 'Atos': 'narrativa',
  'Romanos': 'epistolar', '1 Coríntios': 'epistolar', '2 Coríntios': 'epistolar',
  'Gálatas': 'epistolar', 'Efésios': 'epistolar', 'Filipenses': 'epistolar',
  'Colossenses': 'epistolar', '1 Tessalonicenses': 'epistolar', '2 Tessalonicenses': 'epistolar',
  '1 Timóteo': 'epistolar', '2 Timóteo': 'epistolar', 'Tito': 'epistolar',
  'Filemom': 'epistolar', 'Hebreus': 'epistolar', 'Tiago': 'epistolar',
  '1 Pedro': 'epistolar', '2 Pedro': 'epistolar',
  '1 João': 'epistolar', '2 João': 'epistolar', '3 João': 'epistolar', 'Judas': 'epistolar',
  'Apocalipse': 'apocaliptica',
}

// ── Genre detection from saved 1.4 content ───────────────────────────────

function detectGenreFromSections(savedSections: Section[]): LiteraryGenre | null {
  const s = savedSections.find(sec => sec.slug === 'genero_literario')
  if (!s) return null
  const content = s.content as { cards?: Record<string, string> } | null
  if (!content?.cards) return null
  const text = Object.values(content.cards).join(' ').toLowerCase()
  if (/narrativ|histórica|histor/.test(text)) return 'narrativa'
  if (/epistol|carta/.test(text)) return 'epistolar'
  if (/salmo|poesia|poétic|hino|líric/.test(text)) return 'poesia'
  if (/profétic|profecia|oráculo/.test(text)) return 'profecia'
  if (/apocalípt/.test(text)) return 'apocaliptica'
  if (/sapiencial|sabedoria|provérbio/.test(text)) return 'sapiencial'
  if (/\blei\b|torah|mandamento/.test(text)) return 'lei'
  return null
}

function loadContent(section: Section | undefined): Record<string, string> {
  const stored = section?.content as { cards?: Record<string, string> } | null
  return stored?.cards ?? {}
}

function loadGenre(section: Section | undefined): LiteraryGenre | null {
  const stored = section?.content as { genre?: LiteraryGenre } | null
  return stored?.genre ?? null
}

function dotColor(text: string): string {
  if (!text.trim()) return 'var(--border)'
  if (text.trim().length < 80) return 'var(--accent)'
  return 'var(--success)'
}

function fieldStatus(text: string): 'empty' | 'draft' | 'reviewed' {
  if (!text.trim()) return 'empty'
  if (text.trim().length < 80) return 'draft'
  return 'reviewed'
}

// ── Component ─────────────────────────────────────────────────────────────

export default function EstruturaLiterariaWorkspace({
  sectionDef, project, userId, existingSection, savedSections, onUpdate, onAskAI,
}: Props) {
  const supabase = createClient()

  const [genre, setGenre] = useState<LiteraryGenre | null>(() => {
    return loadGenre(existingSection)
      ?? detectGenreFromSections(savedSections)
      ?? (BOOK_GENRE[project.book] ?? null)
  })
  const [cardContent, setCardContent] = useState<Record<string, string>>(() => loadContent(existingSection))
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set())
  const [editingCards, setEditingCards] = useState<Set<string>>(() => new Set())
  const [questionsOpen, setQuestionsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({})
  const [generatingAll, setGeneratingAll] = useState(false)
  const [selectingGenre, setSelectingGenre] = useState(!genre)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContent = useRef(cardContent)
  const latestGenre = useRef(genre)
  useEffect(() => { latestContent.current = cardContent }, [cardContent])
  useEffect(() => { latestGenre.current = genre }, [genre])

  const genreConfig = GENRES.find(g => g.id === genre)
  const moduleColor = genreConfig?.color ?? 'var(--accent)'
  const activeCardIds = genre ? GENRE_CARD_IDS[genre] : []
  const activeCards = sectionDef.cards.filter(c => activeCardIds.includes(c.id))

  async function performSave(content: Record<string, string>, g: LiteraryGenre | null) {
    setSaving(true)
    const hasContent = Object.values(content).some(v => v.trim().length > 0)
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionDef.slug, module: sectionDef.module,
      title: sectionDef.title,
      content: { genre: g, cards: content },
      status: (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    if (existingSection?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existingSection.id).select().single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) onUpdate(data as Section)
    }
    setSaving(false)
    setSavedAt(new Date())
  }

  function scheduleAutosave(content: Record<string, string>) {
    setCardContent(content)
    latestContent.current = content
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(latestContent.current, latestGenre.current), 1500)
  }

  function selectGenre(g: LiteraryGenre) {
    setGenre(g)
    latestGenre.current = g
    setSelectingGenre(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(latestContent.current, g), 800)
    setExpandedCards(new Set([GENRE_CARD_IDS[g][0]]))
  }

  function toggleCard(cardId: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId)
      return next
    })
  }

  function toggleEdit(cardId: string) {
    setEditingCards(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId)
      return next
    })
  }

  async function generateCard(cardId: string) {
    setCardStates(prev => ({ ...prev, [cardId]: 'generating' }))
    setExpandedCards(prev => new Set([...prev, cardId]))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug, cardId,
          project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode },
        }),
      })
      const data = await res.json()
      const generated = data[cardId] ?? ''
      if (!generated) throw new Error('empty')
      const next = { ...latestContent.current, [cardId]: generated }
      setEditingCards(prev => { const n = new Set(prev); n.delete(cardId); return n })
      scheduleAutosave(next)
      setCardStates(prev => ({ ...prev, [cardId]: 'saving' }))
      await performSave(next, latestGenre.current)
      setCardStates(prev => ({ ...prev, [cardId]: 'saved' }))
      setTimeout(() => setCardStates(prev => ({ ...prev, [cardId]: 'idle' })), 2000)
    } catch {
      setCardStates(prev => ({ ...prev, [cardId]: 'idle' }))
    }
  }

  async function generateAll() {
    if (!genre) return
    const cardIds = GENRE_CARD_IDS[genre]
    setGeneratingAll(true)
    const generating: Record<string, CardState> = {}
    cardIds.forEach(id => { generating[id] = 'generating' })
    setCardStates(generating)
    setExpandedCards(new Set(cardIds))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug, cardIds,
          project: { id: project.id, book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language, study_mode: project.study_mode },
        }),
      })
      const data = await res.json()
      const next = { ...latestContent.current }
      cardIds.forEach(id => { if (data[id]) next[id] = data[id] })
      setEditingCards(new Set())
      scheduleAutosave(next)
      const saving: Record<string, CardState> = {}
      cardIds.forEach(id => { saving[id] = 'saving' })
      setCardStates(saving)
      await performSave(next, latestGenre.current)
      const saved: Record<string, CardState> = {}
      cardIds.forEach(id => { saved[id] = 'saved' })
      setCardStates(saved)
      setTimeout(() => setCardStates({}), 2500)
    } catch {
      setCardStates({})
    } finally {
      setGeneratingAll(false)
    }
  }

  const savedLabel = saving
    ? 'salvando…'
    : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  const keyQuestions = genre ? GENRE_QUESTIONS[genre] : sectionDef.keyQuestions

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem clamp(1rem, 3vw, 2rem) 5rem', fontFamily: 'var(--font-sans)' }}>

      {/* ── Document header ── */}
      <div style={{ paddingBottom: '2.5rem' }}>
        <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: moduleColor, marginBottom: '1.1rem' }} />
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.045em', lineHeight: 1.0 }}>
          {project.title}
        </h1>
        <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Estudo Textual</span>
          {project.bible_version && (
            <><span style={{ opacity: 0.4, fontSize: '0.7rem' }}>·</span><span>{project.bible_version}</span></>
          )}
          {project.original_language && (
            <><span style={{ opacity: 0.4, fontSize: '0.7rem' }}>·</span><span>{project.original_language}</span></>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: saving ? 'var(--ai)' : savedAt ? 'var(--success)' : 'transparent', transition: 'color 0.3s' }}>
            {savedLabel || '·'}
          </span>
        </p>
        <div style={{ margin: '1.75rem 0 0', height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      {/* ── Chapter heading ── */}
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-primary)' }}>
        {sectionDef.title}
      </h2>

      {/* Objective */}
      <p style={{
        fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.75',
        fontStyle: 'italic', borderLeft: `2px solid ${moduleColor}50`,
        paddingLeft: '1rem', marginBottom: '1.5rem', marginTop: '0.75rem',
      }}>
        {sectionDef.objective}
      </p>

      {/* ── Genre selector ─────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: '1.75rem',
        background: 'var(--surface)',
        border: `1px solid ${genre ? `${moduleColor}40` : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '1rem 1.1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: selectingGenre ? '0.9rem' : 0 }}>
          <span style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Gênero da perícope
          </span>

          {genre && !selectingGenre && (
            <>
              <span style={{
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: moduleColor,
                background: `${moduleColor}15`, border: `1px solid ${moduleColor}35`,
                borderRadius: '4px', padding: '0.12rem 0.55rem',
              }}>
                {genreConfig?.label}
              </span>
              <button
                onClick={() => setSelectingGenre(true)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '0.69rem', color: 'var(--text-muted)', fontFamily: 'inherit',
                  padding: 0, transition: 'color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                Alterar
              </button>
              {detectGenreFromSections(savedSections) && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 'auto', opacity: 0.7 }}>
                  detectado em 1.4
                </span>
              )}
            </>
          )}

          {!genre && !selectingGenre && (
            <button
              onClick={() => setSelectingGenre(true)}
              style={{
                background: 'transparent', border: '1px dashed var(--border)',
                borderRadius: '5px', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.2rem 0.65rem',
              }}
            >
              Selecionar gênero →
            </button>
          )}
        </div>

        {selectingGenre && (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontStyle: 'italic' }}>
              {genre ? 'Selecione o gênero para mudar os campos exibidos:' : 'Identifique o gênero da perícope para ver apenas os campos relevantes:'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {GENRES.map(g => (
                <button
                  key={g.id}
                  onClick={() => selectGenre(g.id)}
                  style={{
                    background: genre === g.id ? `${g.color}18` : 'var(--surface-2)',
                    border: `1.5px solid ${genre === g.id ? g.color : 'var(--border-subtle)'}`,
                    borderRadius: '6px', padding: '0.42rem 0.85rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.78rem', fontWeight: genre === g.id ? 700 : 400,
                    color: genre === g.id ? g.color : 'var(--text-secondary)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => {
                    if (genre !== g.id) {
                      e.currentTarget.style.borderColor = g.color
                      e.currentTarget.style.color = g.color
                    }
                  }}
                  onMouseLeave={e => {
                    if (genre !== g.id) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
            {genre && (
              <button
                onClick={() => setSelectingGenre(false)}
                style={{
                  marginTop: '0.75rem', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.69rem', color: 'var(--text-muted)', padding: 0,
                }}
              >
                ← Cancelar
              </button>
            )}
          </div>
        )}
      </div>

      {/* No genre selected */}
      {!genre && (
        <div style={{
          textAlign: 'center', padding: '3rem 1rem',
          color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.75',
        }}>
          <p>Selecione o gênero acima para ver os campos de análise correspondentes.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Complete a seção <strong>1.4 Gênero Literário</strong> para detecção automática.
          </p>
        </div>
      )}

      {/* Genre-specific content */}
      {genre && (
        <>
          {/* Key questions */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => setQuestionsOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', opacity: 0.55 }}>
                {questionsOpen ? '▾' : '▸'}
              </span>
              <span style={{ fontSize: '0.67rem', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Perguntas Centrais
              </span>
              {!questionsOpen && (
                <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.5 }}>
                  — {keyQuestions.length} orientações para {genreConfig?.label}
                </span>
              )}
            </button>
            {questionsOpen && (
              <div style={{ marginTop: '0.7rem', paddingLeft: '0.85rem', borderLeft: `1px solid ${moduleColor}35` }}>
                {keyQuestions.map((q, i) => (
                  <button key={i} onClick={() => onAskAI(q)} style={{
                    display: 'block', width: '100%', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '0.2rem 0',
                    color: 'var(--text-muted)', fontSize: '0.81rem', fontStyle: 'italic', lineHeight: '1.6', transition: 'color 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                  >· {q}</button>
                ))}
                {sectionDef.relevantAuthors.length > 0 && (
                  <div style={{ marginTop: '0.6rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.69rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.65 }}>
                    {sectionDef.relevantAuthors.join(' · ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cards */}
          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {activeCards.map((card, idx) => {
              const content = cardContent[card.id] ?? ''
              const expanded = expandedCards.has(card.id)
              const dc = dotColor(content)
              const state = cardStates[card.id] ?? 'idle'
              const isWorking = state === 'generating' || state === 'saving'
              const hasContent = content.trim().length > 0
              const isEditing = editingCards.has(card.id) || !hasContent
              const preview = !expanded && hasContent
                ? content.trim().slice(0, 130) + (content.trim().length > 130 ? '…' : '')
                : ''
              const isLast = idx === activeCards.length - 1

              return (
                <div key={card.id} style={{
                  borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                  paddingTop: '1rem',
                  paddingBottom: expanded ? '1.25rem' : '0.85rem',
                }}>
                  {/* Card header */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none', marginBottom: expanded ? '0.8rem' : 0 }}
                    onClick={() => toggleCard(card.id)}
                  >
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                      background: dc === 'var(--border)' ? 'var(--border)' : moduleColor,
                      boxShadow: dc !== 'var(--border)' ? `0 0 4px ${moduleColor}55` : 'none',
                    }} />
                    <span style={{
                      fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em',
                      textTransform: 'uppercase', flex: 1,
                      color: expanded ? moduleColor : 'var(--text-secondary)',
                      transition: 'color 0.15s',
                    }}>
                      {card.title}
                    </span>
                    <HelpIcon cardId={card.id} onAskAI={onAskAI} visible={expanded} />
                    <button
                      onClick={e => { e.stopPropagation(); if (!isWorking) generateCard(card.id) }}
                      disabled={isWorking || generatingAll}
                      style={{
                        background: 'transparent', border: 'none',
                        color: state === 'saved' ? 'var(--success)' : isWorking ? 'var(--text-muted)' : moduleColor,
                        cursor: isWorking || generatingAll ? 'wait' : 'pointer',
                        fontFamily: 'inherit', fontSize: '0.71rem', fontWeight: '600',
                        padding: '0', whiteSpace: 'nowrap', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => { if (!isWorking && state !== 'saved') e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseLeave={e => { if (!isWorking && state !== 'saved') e.currentTarget.style.color = moduleColor }}
                    >
                      {state === 'generating' ? 'Gerando…' : state === 'saving' ? 'Salvando…' : state === 'saved' ? 'Salvo ✓' : 'Gerar ↑'}
                    </button>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: '0.25rem', userSelect: 'none' }}>
                      {expanded ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Preview */}
                  {!expanded && preview && (
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: '1.55', fontStyle: 'italic', marginLeft: '0.9rem', marginTop: '0.25rem' }}>
                      {preview}
                    </p>
                  )}

                  {/* Expanded content */}
                  {expanded && (
                    <>
                      {isEditing ? (
                        <textarea
                          value={content}
                          onChange={e => scheduleAutosave({ ...latestContent.current, [card.id]: e.target.value })}
                          placeholder={card.placeholder}
                          rows={7}
                          style={{
                            width: '100%', background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                            borderRadius: '6px', padding: '0.9rem 1rem', color: 'var(--text-primary)',
                            fontSize: '0.9rem', lineHeight: '1.78', resize: 'vertical', outline: 'none',
                            fontFamily: 'var(--font-serif)', boxSizing: 'border-box', caretColor: moduleColor,
                          }}
                          onFocus={e => { e.target.style.borderColor = `${moduleColor}60` }}
                          onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                          borderRadius: '6px', padding: '1rem 1.1rem', boxSizing: 'border-box', minHeight: '5rem',
                        }}>
                          <MarkdownRenderer content={content} moduleColor={moduleColor} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        {hasContent && (
                          <button onClick={() => toggleEdit(card.id)} style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.69rem', color: 'var(--text-muted)', padding: 0, transition: 'color 0.12s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                          >
                            {isEditing ? '← Visualizar' : 'Editar'}
                          </button>
                        )}
                        <span style={{
                          fontSize: '0.67rem', marginLeft: 'auto',
                          color: fieldStatus(content) === 'empty' ? 'transparent' : fieldStatus(content) === 'draft' ? 'var(--accent)' : 'var(--success)',
                          opacity: 0.75,
                        }}>
                          {fieldStatus(content) === 'draft' ? 'rascunho' : fieldStatus(content) === 'reviewed' ? 'revisado' : ''}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={generateAll} disabled={generatingAll}
              style={{
                background: 'transparent',
                border: `1px solid ${generatingAll ? 'var(--border)' : moduleColor}`,
                color: generatingAll ? 'var(--text-muted)' : moduleColor,
                borderRadius: '6px', padding: '0.45rem 0.9rem',
                fontSize: '0.79rem', cursor: generatingAll ? 'wait' : 'pointer',
                fontFamily: 'inherit', fontWeight: '600', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!generatingAll) e.currentTarget.style.background = `${moduleColor}12` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {generatingAll ? 'Gerando…' : `Gerar análise ${genreConfig?.label ?? ''} completa`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
