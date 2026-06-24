'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Editor } from '@tiptap/core'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import type { AIContext } from '@/components/RichEditor'
import AIAssistantPanel from '@/components/AIAssistantPanel'
import RichEditor from '@/components/RichEditorLazy'

// ── Color palettes ────────────────────────────────────────────────────────────

const HL_COLORS = [
  { color: '#FEF3C7', label: 'Amarelo' },
  { color: '#DBEAFE', label: 'Azul'    },
  { color: '#DCFCE7', label: 'Verde'   },
  { color: '#EDE9FE', label: 'Roxo'    },
  { color: '#FFEDD5', label: 'Laranja' },
  { color: '#FCE7F3', label: 'Rosa'    },
]

const TEXT_COLORS = [
  { color: '#1E293B', label: 'Padrão'   },
  { color: '#DC2626', label: 'Vermelho' },
  { color: '#D97706', label: 'Âmbar'    },
  { color: '#16A34A', label: 'Verde'    },
  { color: '#2563EB', label: 'Azul'     },
  { color: '#7C3AED', label: 'Roxo'     },
  { color: '#0891B2', label: 'Ciano'    },
  { color: '#BE123C', label: 'Rosa'     },
  { color: '#78350F', label: 'Marrom'   },
  { color: '#64748B', label: 'Cinza'    },
]

// ── Chapter metadata ──────────────────────────────────────────────────────────

const CHAPTER_META: Record<string, {
  title: string
  intro: string
  why?: string
  icons?: Record<string, string>
  editorHints?: Record<string, string>
  sectionTitles?: Record<string, string>
  placeholders: Record<string, string>
}> = {
  preparacao_espiritual: {
    title: 'Preparação Espiritual',
    intro: 'Todo estudo bíblico começa antes da investigação. Começa com um coração disposto a ouvir a Deus.',
    why: 'Grandes interpretações não começam com ferramentas, mas com um coração disposto a ouvir. Antes de investigar detalhes do texto, este momento ajuda você a alinhar seu propósito, depender de Deus e lembrar que o objetivo do estudo não é apenas adquirir conhecimento — mas ser transformado pela Palavra.',
    icons: {
      preparar_oracao:            '🙏',
      preparar_objetivo_estudo:   '🎯',
      preparar_ocasiiao_publico:  '👥',
    },
    editorHints: {
      preparar_oracao:            'Comece escrevendo sua oração...',
      preparar_objetivo_estudo:   'Escreva aqui seu objetivo...',
      preparar_ocasiiao_publico:  'Escreva aqui sobre a ocasião e o público...',
    },
    placeholders: {
      preparar_oracao:
        'Antes de abrir qualquer comentário, converse com Deus sobre esta passagem. O que você deseja que Ele transforme em seu coração durante este estudo?',
      preparar_objetivo_estudo:
        'Por que Deus trouxe esta passagem ao seu coração neste momento? Existe uma pergunta não respondida, uma dor particular, ou um chamado pastoral que motivou este estudo?',
      preparar_ocasiiao_publico:
        'Descreva quem você espera alcançar com este estudo. Que perguntas essas pessoas carregam? Que transformação você espera que esta mensagem produza na vida delas?',
    },
  },
  preparar_leia_assimile: {
    title: 'Primeiro Contato com o Texto',
    intro: 'Antes de buscar respostas, simplesmente observe o texto. Nesta etapa não existem interpretações certas — apenas atenção honesta ao que está escrito.',
    why: 'Muitos intérpretes correm para comentários e livros antes de realmente ouvir o texto. Nesta etapa, você aprende a ouvir primeiro as Escrituras — registrando suas impressões iniciais antes de buscar explicações externas.',
    icons: {
      preparar_leitura_lenta:        '📖',
      preparar_comparacao_traducoes:  '🔍',
      preparar_ideia_inicial:         '💡',
      preparar_tensoes_repeticoes:    '⚡',
    },
    editorHints: {
      preparar_leitura_lenta:        'O que você observou na leitura...',
      preparar_comparacao_traducoes:  'O que mudou entre as traduções...',
      preparar_ideia_inicial:         'Sua ideia central provisória...',
      preparar_tensoes_repeticoes:    'Tensões e repetições que você notou...',
    },
    sectionTitles: {
      preparar_leitura_lenta:        'Primeira leitura',
      preparar_comparacao_traducoes:  'Comparação de traduções',
      preparar_ideia_inicial:         'Ideia central provisória',
      preparar_tensoes_repeticoes:    'Tensões e repetições',
    },
    placeholders: {
      preparar_leitura_lenta:
        'Leia o texto em voz alta, devagar, duas ou três vezes. Não tente resolver nada ainda. Anote apenas o que naturalmente chama sua atenção — palavras, imagens, emoções, surpresas.',
      preparar_comparacao_traducoes:
        'Compare o mesmo trecho em duas ou três traduções. O que muda? Que nuances aparecem? Alguma diferença revela algo que sua tradução habitual não mostrava?',
      preparar_ideia_inicial:
        'Em uma frase simples, o que este texto parece querer comunicar? Escreva sem censura — é apenas uma impressão inicial, será revisada depois.',
      preparar_tensoes_repeticoes:
        'O que se repete neste texto? O que contrasta? Que palavras ou expressões parecem centrais? Que emoção o texto transmite?',
    },
  },
  inv_estudo_contextual: {
    title: 'Estudo Contextual',
    intro: 'Analise o contexto histórico, literário e canônico da passagem para compreender o ambiente em que o texto foi escrito.',
    editorHints: {
      contexto_historico: 'Descreva o cenário histórico...',
      contexto_literario: 'Identifique o gênero literário...',
      contexto_canonico: 'Explique como esta passagem se relaciona...',
    },
    placeholders: {
      contexto_historico: 'Descreva o cenário histórico, político, social e cultural relacionado à escrita da passagem.',
      contexto_literario: 'Identifique o gênero literário, o propósito do autor e a função desta passagem dentro do livro.',
      contexto_canonico: 'Explique como esta passagem se relaciona com o restante das Escrituras e com o desenvolvimento da revelação bíblica.',
    },
  },
  inv_estudo_textual: {
    title: 'Estudo Textual',
    intro: 'Examine a estrutura, as palavras, a gramática e o desenvolvimento interno da passagem.',
    editorHints: {
      texto_original: 'Observe o vocabulário original...',
      estrutura_do_texto: 'Descreva as unidades e movimentos...',
      observacoes_exegeticas: 'Anote detalhes gramaticais relevantes...',
      mensagem_primeiros_ouvintes: 'Explique o que os primeiros ouvintes teriam entendido...',
    },
    placeholders: {
      texto_original: 'Registre observações relevantes do hebraico ou grego que ajudem a compreender o texto.',
      estrutura_do_texto: 'Descreva como a passagem está organizada: unidades, movimentos, contrastes, paralelos e progressão.',
      observacoes_exegeticas: 'Anote detalhes gramaticais, lexicais, sintáticos e literários importantes para a interpretação.',
      mensagem_primeiros_ouvintes: 'Explique como os primeiros leitores ou ouvintes teriam compreendido esta passagem em seu contexto original.',
    },
  },
  inv_estudo_teologico: {
    title: 'Estudo Teológico',
    intro: 'Observe como a passagem se conecta com a história da redenção, com as doutrinas bíblicas e com suas implicações teológicas.',
    editorHints: {
      historia_redencao: 'Mostre o lugar desta passagem no plano de Deus...',
      doutrinas: 'Identifique as doutrinas ensinadas...',
      implicacoes: 'Registre as implicações práticas e pastorais...',
    },
    placeholders: {
      historia_redencao: 'Mostre como esta passagem se encaixa no desenvolvimento do plano redentivo de Deus.',
      doutrinas: 'Identifique as doutrinas ensinadas, pressupostas ou iluminadas por esta passagem.',
      implicacoes: 'Registre implicações teológicas, pastorais e práticas derivadas do texto.',
    },
  },
  investigar_visao_geral: {
    title: 'Visão Geral',
    intro: 'Sintetize os principais achados da investigação em uma formulação clara e útil para a comunicação.',
    editorHints: {
      grande_ideia: 'Formule a grande ideia em uma frase completa...',
      verdades_centrais: 'Liste as verdades teológicas centrais...',
      aplicacoes_principais: 'Registre as aplicações que nascem do texto...',
    },
    placeholders: {
      grande_ideia: 'Formule a ideia central da passagem em uma frase completa, com sujeito e complemento.',
      verdades_centrais: 'Liste as principais verdades bíblicas e teológicas que emergem da investigação.',
      aplicacoes_principais: 'Registre aplicações principais que nascem diretamente do significado do texto.',
    },
  },
  nr_estudo_contextual: {
    title: 'Estudo Contextual',
    intro: 'Analise o contexto histórico, literário e canônico da narrativa para compreender o ambiente em que ela foi escrita e transmitida.',
    editorHints: {
      nr_ctx_hist_main: 'Descreva o cenário histórico e cultural da narrativa...',
      nr_ctx_lit_main:  'Situe a narrativa dentro do livro e do cânone...',
      nr_ctx_can_main:  'Descreva as conexões canônicas e a tipologia...',
    },
    placeholders: {
      nr_ctx_hist_main: 'Descreva o contexto histórico-cultural: período, cenário geopolítico, costumes relevantes e como esse ambiente molda os personagens e eventos.',
      nr_ctx_lit_main:  'Situe a narrativa dentro do livro: onde aparece na estrutura maior, como se conecta às perícopes vizinhas e que temas do livro ela desenvolve.',
      nr_ctx_can_main:  'Descreva as conexões canônicas: textos que a iluminam, ecos e tipologias, promessas da aliança e como ela se encaixa na história da redenção.',
    },
  },
  nr_estudo_textual: {
    title: 'Estudo Textual',
    intro: 'Examine o texto original, a estrutura da narrativa, as observações exegéticas e a mensagem para os primeiros ouvintes.',
    editorHints: {
      nr_txt_orig_main:   'Cole o texto original e delimite a perícope...',
      nr_txt_struct_main: 'Esboce as cenas e o movimento da narrativa...',
      nr_txt_exeg_main:   'Registre observações sobre narrador, personagens e diálogos...',
      nr_txt_msg_main:    'Identifique a mensagem para os primeiros ouvintes...',
    },
    placeholders: {
      nr_txt_orig_main:   'Cole o texto em hebraico ou grego, delimite a perícope justificando os limites e note variantes textuais relevantes.',
      nr_txt_struct_main: 'Esboce as cenas ou episódios, identifique padrões literários e descreva o movimento da tensão narrativa.',
      nr_txt_exeg_main:   'Registre observações sobre o narrador, personagens, diálogos, silêncios e repetições significativas.',
      nr_txt_msg_main:    'Identifique a situação pastoral endereçada, a resposta convocada e por que a forma narrativa era o meio ideal para essa mensagem.',
    },
  },
  nr_estudo_teologico: {
    title: 'Estudo Teológico',
    intro: 'Situe a narrativa na história da redenção, identifique as doutrinas ensinadas pela forma da história e suas implicações para a vida cristã.',
    editorHints: {
      nr_teo_redentor_main: 'Mostre o lugar desta narrativa no plano redentor de Deus...',
      nr_teo_doc_main:      'Identifique as doutrinas ensinadas pela forma da história...',
      nr_teo_impl_main:     'Registre as implicações pastorais e práticas...',
    },
    placeholders: {
      nr_teo_redentor_main: 'Situe a narrativa na história da redenção: época, ação de Deus, tipologias e como avança a aliança rumo a Cristo.',
      nr_teo_doc_main:      'Identifique as doutrinas ensinadas explicitamente ou pela forma da história, e que erros teológicos a narrativa corrige.',
      nr_teo_impl_main:     'Registre implicações para a vida cristã: chamado à fé, padrões afirmados ou condenados, e como a tipologia molda a aplicação.',
    },
  },
  nr_investigar_vg: {
    title: 'Visão Geral da Investigação',
    intro: 'Sintetize os achados da investigação narrativa em uma grande ideia, verdades centrais e aplicações pastorais.',
    editorHints: {
      nr_ivg_ideia_main: 'Formule a grande ideia: sujeito + predicado...',
      nr_ivg_verd_main:  'Liste as 2-3 verdades centrais que emergem da narrativa...',
      nr_ivg_aplic_main: 'Desenvolva as aplicações pastorais principais...',
    },
    placeholders: {
      nr_ivg_ideia_main: 'Formule a grande ideia: sujeito (do que a narrativa fala) + predicado (o que afirma). Deve emergir do texto e integrar mensagem histórica e verdade atemporal.',
      nr_ivg_verd_main:  'Liste as 2-3 verdades centrais: cada uma derivada do texto, ensinada pela forma narrativa, atemporal e confirmada pelo cânone.',
      nr_ivg_aplic_main: 'Desenvolva aplicações que fluem das verdades centrais, não de moralismos, moldadas pela tipologia cristológica.',
    },
  },
  preparar_visao_geral: {
    title: 'O que o Texto Parece Dizer?',
    intro: 'Com base no seu primeiro contato, o que o texto parece comunicar? Registre suas impressões com honestidade — ainda é cedo para conclusões definitivas.',
    why: 'Antes de mergulhar nos detalhes do texto, é preciso enxergar o todo. Esta etapa forma sua primeira impressão da mensagem — que será desafiada, confirmada e aprofundada ao longo de toda a investigação.',
    icons: {
      preparar_tema_provavel:         '🗂️',
      preparar_grande_ideia_inicial:  '✍️',
      preparar_estrutura_percebida:   '🏗️',
      preparar_vg_perguntas:          '❓',
      preparar_vg_dificuldades:       '🔎',
    },
    editorHints: {
      preparar_tema_provavel:         'O tema que você identificou...',
      preparar_grande_ideia_inicial:  'A grande ideia em uma frase...',
      preparar_estrutura_percebida:   'Como o texto está organizado...',
      preparar_vg_perguntas:          'Suas perguntas sobre o texto...',
      preparar_vg_dificuldades:       'O que ainda não ficou claro...',
    },
    placeholders: {
      preparar_tema_provavel:
        'Qual parece ser o tema central desta passagem? Escreva uma frase provisória, aberta a revisão após a investigação exegética.',
      preparar_grande_ideia_inicial:
        'Se você tivesse de resumir o ponto principal do texto em uma frase completa — sujeito + predicado — como seria?',
      preparar_estrutura_percebida:
        'Como o texto parece estar organizado? Quais são os blocos ou movimentos que você consegue identificar nesta primeira leitura?',
      preparar_vg_perguntas:
        'Que perguntas este texto levanta em você? O que ainda não ficou claro? O que te surpreende ou intriga?',
      preparar_vg_dificuldades:
        'Que tensões, paradoxos ou dificuldades de compreensão você já percebe? O que precisará de atenção especial na investigação?',
    },
  },
}

// ── Toolbar primitives ────────────────────────────────────────────────────────

function Btn({ active, onClick, title, children }: {
  active?: boolean; onClick: () => void; title?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        background: active ? 'var(--surface-2)' : 'transparent',
        border: active ? '1px solid var(--border)' : '1px solid transparent',
        borderRadius: '5px', padding: '0.22rem 0.35rem',
        cursor: 'pointer', fontFamily: 'inherit',
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize: '0.78rem', fontWeight: active ? 600 : 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '26px', transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span style={{ width: '1px', background: 'var(--border-subtle)', alignSelf: 'stretch', margin: '0 2px' }} />
}

// ── Content helpers ───────────────────────────────────────────────────────────

function extractCardsFromDoc(def: SectionDef, doc: string): Record<string, string> {
  if (typeof DOMParser === 'undefined') return {}
  const container = new DOMParser()
    .parseFromString(`<div>${doc}</div>`, 'text/html')
    .querySelector('div')
  if (!container) return {}
  const headings = Array.from(container.querySelectorAll('h2, h3'))
  const result: Record<string, string> = {}
  headings.forEach((heading, idx) => {
    const card = def.cards[idx]
    if (!card) return
    const parts: string[] = []
    let el = heading.nextElementSibling
    while (el && !['H2', 'H3'].includes(el.tagName)) {
      if (el.tagName !== 'BLOCKQUOTE' && el.tagName !== 'HR') {
        if (el.textContent?.trim()) parts.push(el.outerHTML)
      }
      el = el.nextElementSibling
    }
    result[card.id] = parts.join('')
  })
  return result
}

function loadCardsFromSection(def: SectionDef, existing: Section | undefined): Record<string, string> {
  const stored = existing?.content as Record<string, unknown> | null
  if (stored?.cards && typeof stored.cards === 'object') return stored.cards as Record<string, string>
  if (stored?.doc && typeof stored.doc === 'string') return extractCardsFromDoc(def, stored.doc)
  return {}
}

function isCardDone(html: string): boolean {
  if (!html?.trim() || html === '<p></p>') return false
  const text = html.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '')
    .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 10
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocumentBlock {
  sectionDef: SectionDef
  existingSection: Section | undefined
}

interface Props {
  blocks: DocumentBlock[]
  project: Project
  userId: string
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  guided?: boolean
  initialSlug?: string
  typeLabel?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkspaceDocument({
  blocks, project, userId, onUpdate, guided = true, initialSlug, typeLabel,
}: Props) {
  const supabase = createClient()

  const initialChapterIdx = useMemo(() => {
    if (!initialSlug) return 0
    const idx = blocks.findIndex(b => b.sectionDef.slug === initialSlug)
    return idx >= 0 ? idx : 0
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [cardContents, setCardContents] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, loadCardsFromSection(b.sectionDef, b.existingSection)]))
  )
  const [openChapterIdx, setOpenChapterIdx] = useState<number>(initialChapterIdx)
  const [openedChapters, setOpenedChapters] = useState<Set<number>>(() => new Set([initialChapterIdx]))

  // Shared toolbar state
  const [activeEditorKey, setActiveEditorKey] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)
  const [hlOpen,    setHlOpen]    = useState(false)
  const [colorOpen, setColorOpen] = useState(false)
  const [linkOpen,  setLinkOpen]  = useState(false)
  const [linkUrl,   setLinkUrl]   = useState('')
  const [aiOpen,    setAiOpen]    = useState(false)

  // Per-chapter picker refs (toolbar lives inside each chapter)
  const hlRefs    = useRef<(HTMLDivElement | null)[]>([])
  const colorRefs = useRef<(HTMLDivElement | null)[]>([])
  const linkRefs  = useRef<(HTMLDivElement | null)[]>([])

  const editorMapRef = useRef<Map<string, Editor>>(new Map())
  const saveTimers   = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const sectionRefs  = useRef<Record<string, Section | undefined>>(
    Object.fromEntries(blocks.map(b => [b.sectionDef.slug, b.existingSection]))
  )

  const activeEditor  = activeEditorKey ? (editorMapRef.current.get(activeEditorKey) ?? null) : null
  const focusedSlug   = activeEditorKey?.split(':')?.[0] ?? null
  const focusedCardId = activeEditorKey?.split(':')?.[1] ?? null

  useEffect(() => {
    if (!activeEditor) return
    const h = () => forceUpdate(n => n + 1)
    activeEditor.on('transaction', h)
    return () => { activeEditor.off('transaction', h) }
  }, [activeEditor])

  // Close pickers on outside click — checks all chapter refs
  useEffect(() => {
    function h(e: MouseEvent) {
      const allRefs = [...hlRefs.current, ...colorRefs.current, ...linkRefs.current].filter(Boolean)
      if (allRefs.every(r => !r?.contains(e.target as Node))) {
        setHlOpen(false); setColorOpen(false); setLinkOpen(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (!initialSlug) return
    const idx = blocks.findIndex(b => b.sectionDef.slug === initialSlug)
    if (idx >= 0) openChapterAt(idx)
  }, [initialSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ───────────────────────────────────────────────────────────────

  function openChapterAt(idx: number) {
    setOpenChapterIdx(idx)
    setOpenedChapters(prev => new Set([...prev, idx]))
    setActiveEditorKey(null)
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function scheduleCardSave(sectionSlug: string, cardId: string, html: string) {
    setCardContents(prev => ({
      ...prev,
      [sectionSlug]: { ...(prev[sectionSlug] ?? {}), [cardId]: html },
    }))
    const key = `${sectionSlug}:${cardId}`
    if (saveTimers.current[key]) clearTimeout(saveTimers.current[key])
    saveTimers.current[key] = setTimeout(() => void performCardSave(sectionSlug, cardId, html), 1500)
  }

  async function performCardSave(sectionSlug: string, cardId: string, html: string) {
    const def = blocks.find(b => b.sectionDef.slug === sectionSlug)?.sectionDef
    if (!def) return
    const currentCards = cardContents[sectionSlug] ?? {}
    const updatedCards = { ...currentCards, [cardId]: html }
    const doneCount = def.cards.filter(c => isCardDone(updatedCards[c.id] ?? '')).length
    const status: 'empty' | 'draft' | 'reviewed' =
      doneCount === 0 ? 'empty' : doneCount === def.cards.length ? 'reviewed' : 'draft'
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionSlug, module: def.module, title: def.title,
      content: { cards: updatedCards }, status,
    }
    const existing = sectionRefs.current[sectionSlug]
    if (existing?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existing.id).select().single()
      if (data) { onUpdate(data as Section); sectionRefs.current[sectionSlug] = data as Section }
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { onUpdate(data as Section); sectionRefs.current[sectionSlug] = data as Section }
    }
  }

  // ── AI context ────────────────────────────────────────────────────────────

  const focusedBlock = blocks.find(b => b.sectionDef.slug === focusedSlug)?.sectionDef ?? null
  const focusedCard  = focusedBlock?.cards.find(c => c.id === focusedCardId) ?? null
  const chMeta       = focusedBlock ? CHAPTER_META[focusedBlock.slug] : null

  const aiContext = useMemo((): AIContext | undefined => {
    if (!focusedBlock || !focusedCard) return undefined
    return {
      project: {
        id: project.id, book: project.book, passage_ref: project.passage_ref,
        testament: project.testament, original_language: project.original_language,
        study_mode: project.study_mode ?? undefined,
      },
      phase: focusedBlock.phase, phaseLabel: 'Preparar',
      section: focusedBlock.slug, sectionLabel: chMeta?.title ?? focusedBlock.title,
      field: focusedCard.id, fieldLabel: focusedCard.title,
      userId,
    }
  }, [focusedBlock, focusedCard, project, userId, chMeta])

  function applyLink() {
    if (!activeEditor) return
    const url = linkUrl.trim()
    if (!url) { activeEditor.chain().focus().unsetLink().run(); setLinkOpen(false); return }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    activeEditor.chain().focus().setLink({ href }).run()
    setLinkOpen(false); setLinkUrl('')
  }

  const handleAiInsert = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug || !focusedCardId) return
    activeEditor.chain().focus().insertContent(html).run()
    scheduleCardSave(focusedSlug, focusedCardId, activeEditor.getHTML())
  }, [activeEditor, focusedSlug, focusedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiReplace = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug || !focusedCardId) return
    activeEditor.chain().focus().setContent(html).run()
    scheduleCardSave(focusedSlug, focusedCardId, html)
  }, [activeEditor, focusedSlug, focusedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAiAppend = useCallback((html: string) => {
    if (!activeEditor || !focusedSlug || !focusedCardId) return
    const end = activeEditor.state.doc.content.size
    activeEditor.chain().focus().setTextSelection(end).insertContent(html).run()
    scheduleCardSave(focusedSlug, focusedCardId, activeEditor.getHTML())
  }, [activeEditor, focusedSlug, focusedCardId]) // eslint-disable-line react-hooks/exhaustive-deps

  const accent = '#D97706'
  const ed     = activeEditor

  // ── Toolbar render (per-chapter, receives chapter index for refs) ──────────

  function renderToolbar(chIdx: number) {
    return (
      <div style={{
        position: 'sticky', top: '37px', zIndex: 20,
        display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
        padding: '0.28rem 0.45rem',
        background: 'var(--background)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}>
        {!ed ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
            Clique em uma seção para começar a escrever
          </span>
        ) : (
          <>
            <Btn active={ed.isActive('heading', { level: 1 })} onClick={() => ed.chain().focus().toggleHeading({ level: 1 }).run()} title="Título 1">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H1</span>
            </Btn>
            <Btn active={ed.isActive('heading', { level: 2 })} onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H2</span>
            </Btn>
            <Btn active={ed.isActive('heading', { level: 3 })} onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3">
              <span style={{ fontSize: '0.72rem', fontWeight: 800 }}>H3</span>
            </Btn>
            <Sep />
            <Btn active={ed.isActive('bold')}      onClick={() => ed.chain().focus().toggleBold().run()}      title="Negrito"><strong>B</strong></Btn>
            <Btn active={ed.isActive('italic')}    onClick={() => ed.chain().focus().toggleItalic().run()}    title="Itálico"><em>I</em></Btn>
            <Btn active={ed.isActive('underline')} onClick={() => ed.chain().focus().toggleUnderline().run()} title="Sublinhado"><u>U</u></Btn>
            <Btn active={ed.isActive('strike')}    onClick={() => ed.chain().focus().toggleStrike().run()}    title="Tachado"><s>S</s></Btn>
            <Sep />

            {/* Text color */}
            <div ref={el => { colorRefs.current[chIdx] = el }} style={{ position: 'relative' }}>
              <Btn active={colorOpen} onClick={() => { setColorOpen(o => !o); setHlOpen(false); setLinkOpen(false) }} title="Cor do texto">
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ed.getAttributes('textStyle').color ?? 'var(--text-primary)', lineHeight: 1 }}>A</span>
                  <span style={{ width: '12px', height: '3px', borderRadius: '1px', background: ed.getAttributes('textStyle').color ?? '#1E293B' }} />
                </span>
              </Btn>
              {colorOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '120px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {TEXT_COLORS.map(c => (
                    <button key={c.color} type="button" title={c.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().setColor(c.color).run(); setColorOpen(false) }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '2px solid rgba(0,0,0,0.08)', background: c.color, cursor: 'pointer' }}
                    />
                  ))}
                  <button type="button" title="Cor padrão"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetColor().run(); setColorOpen(false) }}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}
                  >✕</button>
                </div>
              )}
            </div>

            {/* Highlight */}
            <div ref={el => { hlRefs.current[chIdx] = el }} style={{ position: 'relative' }}>
              <Btn active={hlOpen || ed.isActive('highlight')} onClick={() => { setHlOpen(o => !o); setColorOpen(false); setLinkOpen(false) }} title="Destaque">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: ed.isActive('highlight') ? (ed.getAttributes('highlight').color ?? '#FEF3C7') : '#FEF3C7', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>▾</span>
                </span>
              </Btn>
              {hlOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.35rem', display: 'flex', gap: '4px', flexWrap: 'wrap', width: '112px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {HL_COLORS.map(h => (
                    <button key={h.color} type="button" title={h.label}
                      onMouseDown={e => { e.preventDefault(); ed.chain().focus().toggleHighlight({ color: h.color }).run(); setHlOpen(false) }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: h.color, cursor: 'pointer' }}
                    />
                  ))}
                  <button type="button" title="Remover destaque"
                    onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetHighlight().run(); setHlOpen(false) }}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: '0.65rem', color: 'var(--text-muted)' }}
                  >✕</button>
                </div>
              )}
            </div>
            <Sep />

            {/* Lists */}
            <Btn active={ed.isActive('bulletList')}  onClick={() => ed.chain().focus().toggleBulletList().run()}  title="Lista">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
            </Btn>
            <Btn active={ed.isActive('orderedList')} onClick={() => ed.chain().focus().toggleOrderedList().run()} title="Numeração">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" strokeLinecap="round"/><path d="M4 10h2" strokeLinecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeLinecap="round"/></svg>
            </Btn>
            <Btn active={ed.isActive('taskList')} onClick={() => ed.chain().focus().toggleTaskList().run()} title="Lista de tarefas">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="5" height="5" rx="1"/><polyline points="5 8 6.5 9.5 9 7"/><line x1="13" y1="7.5" x2="21" y2="7.5"/><rect x="3" y="14" width="5" height="5" rx="1"/><line x1="13" y1="16.5" x2="21" y2="16.5"/></svg>
            </Btn>
            <Sep />

            {/* Block formats */}
            <Btn active={ed.isActive('blockquote')} onClick={() => ed.chain().focus().toggleBlockquote().run()} title="Citação">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </Btn>
            <Btn active={ed.isActive('codeBlock')} onClick={() => ed.chain().focus().toggleCodeBlock().run()} title="Código">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </Btn>
            <Btn active={false} onClick={() => ed.chain().focus().setHorizontalRule().run()} title="Linha horizontal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </Btn>

            {/* Link */}
            <div ref={el => { linkRefs.current[chIdx] = el }} style={{ position: 'relative' }}>
              <Btn active={ed.isActive('link') || linkOpen} onClick={() => {
                setLinkOpen(o => !o); setHlOpen(false); setColorOpen(false)
                if (!linkOpen) setLinkUrl(ed.getAttributes('link').href ?? '')
              }} title="Link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </Btn>
              {linkOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem', width: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', display: 'flex', gap: '4px' }}>
                  <input autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setLinkOpen(false) }}
                    placeholder="https://..." style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '5px', padding: '4px 8px', fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)' }}
                  />
                  <button type="button" onMouseDown={e => { e.preventDefault(); applyLink() }}
                    style={{ background: accent, color: '#fff', border: 'none', borderRadius: '5px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    OK
                  </button>
                  {ed.isActive('link') && (
                    <button type="button" onMouseDown={e => { e.preventDefault(); ed.chain().focus().unsetLink().run(); setLinkOpen(false) }}
                      style={{ background: 'transparent', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: '5px', padding: '4px 6px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
            <Sep />
            <Btn active={false} onClick={() => ed.chain().focus().clearNodes().unsetAllMarks().run()} title="Limpar formatação">
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-muted)' }}>A</span>
            </Btn>

          </>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const editorStyles = `
    .ws-doc-section .rich-editor .ProseMirror {
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0.4rem 0 0.6rem;
      min-height: 72px;
    }
    .ws-doc-section .rich-editor .ProseMirror:focus {
      box-shadow: none;
      border: none;
    }
    .ws-doc-section .rich-editor .ProseMirror p:first-child { margin-top: 0; }
  `

  // ── Free mode — single continuous document (no accordion, no cards) ────

  if (!guided) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <style>{editorStyles}</style>

        {/* Toolbar — sticky at viewport top, only while writing */}
        {!!ed && renderToolbar(0)}

        {/* Desk — gray background behind the paper */}
        <div style={{ flex: 1, background: '#ECEEF1', padding: '2.5rem 2rem 8rem' }}>

          {/* Paper sheet — white card with shadow */}
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.07)',
            borderRadius: '2px',
            padding: '4rem 5rem',
            minHeight: 'calc(100vh - 160px)',
          }}>

          {/* Paper title */}
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: accent, marginBottom: '1.1rem' }} />
            <h1 style={{
              margin: 0,
              fontSize: '2.5rem', fontWeight: 700,
              color: '#1A1D23', letterSpacing: '-0.045em',
              lineHeight: 1.0,
            }}>
              {project.title}
            </h1>
            {(typeLabel || project.bible_version) && (
              <p style={{
                margin: '0.6rem 0 0',
                fontSize: '0.8rem', fontWeight: 400,
                color: '#64748B', letterSpacing: '0.01em',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                {typeLabel && <span>{typeLabel}</span>}
                {typeLabel && project.bible_version && (
                  <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>•</span>
                )}
                {project.bible_version && <span>{project.bible_version}</span>}
              </p>
            )}
            <div style={{ margin: '1.75rem 0 0', height: '1px', background: '#E2E4E8' }} />
          </div>

          {blocks.map(({ sectionDef }, chapterIdx) => {
            const chMetaEntry = CHAPTER_META[sectionDef.slug]
            const contents    = cardContents[sectionDef.slug] ?? {}

            return (
              <div key={sectionDef.slug}>
                {chapterIdx > 0 && (
                  <div style={{ margin: '3rem 0', height: '1px', background: '#E2E4E8' }} />
                )}

                <h2 style={{
                  margin: '0 0 1rem',
                  fontSize: '1.4rem', fontWeight: 800,
                  color: '#1A1D23', letterSpacing: '-0.02em',
                }}>
                  {chMetaEntry?.title ?? sectionDef.title}
                </h2>

                {sectionDef.cards.map((card, cardIdx) => {
                  const cardContent  = contents[card.id] ?? ''
                  const editorKey    = `${sectionDef.slug}:${card.id}`
                  const sectionTitle = chMetaEntry?.sectionTitles?.[card.id] ?? card.title

                  return (
                    <div key={card.id} style={{ marginTop: cardIdx === 0 ? 0 : '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.1rem' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '0.9rem', fontWeight: 600,
                        color: '#64748B', letterSpacing: '-0.005em',
                      }}>
                        {sectionTitle}
                      </h3>
                      {activeEditorKey === editorKey && (
                        <button
                          type="button"
                          onMouseDown={e => { e.preventDefault(); setAiOpen(o => !o) }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                            background: aiOpen ? `${accent}15` : 'transparent',
                            border: `1px solid ${aiOpen ? `${accent}50` : '#CBD5E1'}`,
                            borderRadius: '5px', padding: '0.1rem 0.42rem',
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.65rem', fontWeight: 700,
                            color: aiOpen ? accent : '#94A3B8',
                            transition: 'all 0.12s',
                          }}
                        >
                          ✨ IA
                        </button>
                      )}
                      </div>
                      <div className="ws-doc-section">
                        <RichEditor
                          value={cardContent}
                          onChange={html => scheduleCardSave(sectionDef.slug, card.id, html)}
                          placeholder=""
                          minHeight={60}
                          moduleColor={accent}
                          hideToolbar
                          onEditorMount={editor => { editorMapRef.current.set(editorKey, editor) }}
                          onFocusChange={focused => { if (focused) setActiveEditorKey(editorKey) }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

          </div>{/* /paper */}
        </div>{/* /desk */}

        {aiOpen && aiContext && ed && (
          <AIAssistantPanel
            context={aiContext}
            currentContent={ed.getHTML()}
            onInsert={handleAiInsert}
            onReplace={handleAiReplace}
            onAppend={handleAiAppend}
            onClose={() => setAiOpen(false)}
          />
        )}
      </div>
    )
  }

  // ── Guided mode ───────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

      <style>{editorStyles}</style>

      {/* ── Chapters ─────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: '700px', margin: '0 auto', width: '100%', padding: '1.25rem 1.25rem 4rem' }}>

        {/* ── Document title ─────────────────────────────────────────────── */}
        <div style={{ padding: '1.75rem 1.4rem 3rem' }}>
          {/* Accent bar */}
          <div style={{ width: '32px', height: '3px', borderRadius: '2px', background: accent, marginBottom: '1.1rem' }} />

          <h1 style={{
            margin: 0,
            fontSize: '2.5rem', fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '-0.045em',
            lineHeight: 1.0,
          }}>
            {project.title}
          </h1>

          {/* Subtitle line */}
          {(typeLabel || project.bible_version) && (
            <p style={{
              margin: '0.6rem 0 0',
              fontSize: '0.8rem', fontWeight: 400,
              color: 'var(--text-secondary)', letterSpacing: '0.01em',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              {typeLabel && <span>{typeLabel}</span>}
              {typeLabel && project.bible_version && (
                <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>•</span>
              )}
              {project.bible_version && <span>{project.bible_version}</span>}
            </p>
          )}
        </div>

        {blocks.map(({ sectionDef }, chapterIdx) => {
          const chMetaEntry = CHAPTER_META[sectionDef.slug]
          const isChOpen    = openChapterIdx === chapterIdx
          const isRendered  = openedChapters.has(chapterIdx)
          const contents    = cardContents[sectionDef.slug] ?? {}
          const doneCount   = sectionDef.cards.filter(c => isCardDone(contents[c.id] ?? '')).length
          const totalCount  = sectionDef.cards.length
          const allDone     = doneCount === totalCount && totalCount > 0
          const hasNext     = chapterIdx < blocks.length - 1

          const progressLabel = doneCount === 0
            ? 'Você ainda não iniciou esta etapa.'
            : allDone
              ? 'Etapa concluída.'
              : `Você concluiu ${doneCount} de ${totalCount} reflexões. Continue de onde parou.`

          return (
            <div
              key={sectionDef.slug}
              style={{
                marginBottom: '0.5rem',
                borderRadius: '14px',
                border: `1px solid ${isChOpen ? `${accent}20` : 'var(--border-subtle)'}`,
                transition: 'border-color 0.25s ease',
                background: 'var(--surface)',
              }}
            >
              {/* ── Chapter header ───────────────────────────────────── */}
              <button
                type="button"
                onClick={() => openChapterAt(chapterIdx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '1.15rem 1.4rem',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit',
                  borderRadius: '14px 14px 0 0',
                }}
              >
                {/* Chapter circle */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                  background: allDone ? '#10B981' : isChOpen ? accent : 'var(--border)',
                  color: isChOpen || allDone ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: allDone ? '1.1rem' : '1.15rem', fontWeight: 900,
                  transition: 'background 0.3s ease',
                  marginTop: '2px',
                }}>
                  {allDone ? '✓' : chapterIdx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Chapter title — book chapter scale */}
                  <h2 style={{
                    margin: '0 0 0.4rem',
                    fontSize: isChOpen ? '1.3rem' : '1.05rem',
                    fontWeight: 600,
                    color: allDone ? '#10B981' : isChOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                    letterSpacing: isChOpen ? '-0.02em' : '-0.01em',
                    lineHeight: 1.2,
                    transition: 'font-size 0.22s ease, color 0.3s ease',
                  }}>
                    {chMetaEntry?.title ?? sectionDef.shortTitle ?? sectionDef.title}
                  </h2>

                  {/* Intro — always visible; truncated when collapsed */}
                  {chMetaEntry?.intro && (
                    <p style={{
                      margin: '0 0 0.65rem',
                      fontSize: isChOpen ? '0.87rem' : '0.77rem',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.65,
                      ...(isChOpen ? {} : {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }),
                    }}>
                      {chMetaEntry.intro}
                    </p>
                  )}

                  {/* Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{ width: '80px', height: '3px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{
                        height: '100%',
                        width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%`,
                        background: allDone ? '#10B981' : accent,
                        borderRadius: '2px', transition: 'width 0.45s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.64rem', color: allDone ? '#10B981' : 'var(--text-muted)', lineHeight: 1.3 }}>
                      {progressLabel}
                    </span>
                  </div>
                </div>

                <span style={{
                  color: 'var(--text-muted)', fontSize: '0.72rem', flexShrink: 0,
                  transition: 'transform 0.22s ease', marginTop: '6px',
                  transform: isChOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}>
                  ▾
                </span>
              </button>

              {/* ── Toolbar — only visible while writing ─────────── */}
              {isChOpen && !!ed && renderToolbar(chapterIdx)}

              {/* ── Chapter accordion ────────────────────────────── */}
              <div style={{
                display: 'grid',
                gridTemplateRows: isChOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                <div style={{ overflow: 'hidden' }}>
                  {isRendered && (
                    <div style={{ padding: '0.5rem 1.4rem 1.5rem' }}>

                      {/* "Por que esta etapa importa?" */}
                      {chMetaEntry?.why && (
                        <div style={{
                          marginBottom: '1.25rem',
                          padding: '0.75rem 1rem',
                          background: `${accent}08`,
                          borderLeft: `3px solid ${accent}50`,
                          borderRadius: '0 8px 8px 0',
                        }}>
                          <p style={{
                            margin: '0 0 0.2rem',
                            fontSize: '0.64rem', fontWeight: 700,
                            letterSpacing: '0.07em', textTransform: 'uppercase',
                            color: accent,
                          }}>
                            Por que esta etapa importa
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65,
                          }}>
                            {chMetaEntry.why}
                          </p>
                        </div>
                      )}

                      {/* Sections */}
                      {sectionDef.cards.map((card, cardIdx) => {
                        const cardContent  = contents[card.id] ?? ''
                        const isFirst      = cardIdx === 0
                        const sectionTitle = chMetaEntry?.sectionTitles?.[card.id] ?? card.title
                        const orientation  = guided ? (chMetaEntry?.placeholders?.[card.id] ?? '') : ''
                        const editorHint   = chMetaEntry?.editorHints?.[card.id] ?? ''
                        const icon         = chMetaEntry?.icons?.[card.id]
                        const editorKey    = `${sectionDef.slug}:${card.id}`
                        const done         = isCardDone(cardContent)

                        return (
                          <div key={card.id}>
                            {!isFirst && (
                              <div style={{ margin: '1.15rem 0', display: 'flex', alignItems: 'center' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.2 }} />
                              </div>
                            )}

                            {/* Section row: icon + content */}
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>

                              {/* Icon box */}
                              {icon && (
                                <div style={{
                                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                                  background: done ? '#10B98112' : `${accent}14`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '1.05rem', marginTop: '1px',
                                  transition: 'background 0.3s ease',
                                }}>
                                  {icon}
                                </div>
                              )}

                              {/* Section content */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Title + inline AI button */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  <h3 style={{
                                    margin: 0,
                                    fontSize: '1.0rem', fontWeight: 700,
                                    color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
                                    letterSpacing: '-0.015em',
                                    transition: 'color 0.3s ease',
                                  }}>
                                    {sectionTitle}
                                  </h3>
                                  {done && (
                                    <span style={{ fontSize: '0.62rem', color: '#10B981', fontWeight: 600 }}>✓</span>
                                  )}
                                  {activeEditorKey === editorKey && (
                                    <button
                                      type="button"
                                      onMouseDown={e => { e.preventDefault(); setAiOpen(o => !o) }}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                        background: aiOpen ? `${accent}15` : 'transparent',
                                        border: `1px solid ${aiOpen ? `${accent}50` : 'var(--border-subtle)'}`,
                                        borderRadius: '5px', padding: '0.1rem 0.42rem',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        fontSize: '0.65rem', fontWeight: 700,
                                        color: aiOpen ? accent : 'var(--text-muted)',
                                        transition: 'all 0.12s',
                                      }}
                                    >
                                      ✨ IA
                                    </button>
                                  )}
                                </div>

                                {/* Orientation */}
                                {orientation && (
                                  <p style={{
                                    margin: '0 0 0.25rem',
                                    fontSize: '0.77rem', color: 'var(--text-muted)',
                                    lineHeight: 1.6, fontStyle: 'italic',
                                  }}>
                                    {orientation}
                                  </p>
                                )}

                                {/* Writing area */}
                                <div className="ws-doc-section" style={{ marginTop: '0.1rem' }}>
                                  <RichEditor
                                    value={cardContent}
                                    onChange={html => scheduleCardSave(sectionDef.slug, card.id, html)}
                                    placeholder={editorHint}
                                    minHeight={72}
                                    moduleColor={accent}
                                    hideToolbar
                                    onEditorMount={editor => { editorMapRef.current.set(editorKey, editor) }}
                                    onFocusChange={focused => { if (focused) setActiveEditorKey(editorKey) }}
                                  />
                                </div>

                              </div>{/* /section content */}
                            </div>{/* /section row */}
                          </div>
                        )
                      })}

                      {/* Completion banner */}
                      {allDone && (
                        <div style={{
                          marginTop: '1.25rem',
                          padding: '0.75rem 1rem',
                          background: '#10B98108',
                          border: '1px solid #10B98125',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                        }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>✓ Etapa concluída</span>
                            <span style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                              Excelente. Seu coração já está preparado para continuar.
                            </span>
                          </div>
                          {hasNext && (
                            <button
                              type="button"
                              onClick={() => openChapterAt(chapterIdx + 1)}
                              style={{
                                background: accent, color: '#fff', border: 'none',
                                borderRadius: '7px', padding: '0.35rem 0.9rem',
                                fontSize: '0.78rem', fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                              }}
                            >
                              Próxima etapa →
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── AI panel ─────────────────────────────────────────────────────── */}
      {aiOpen && aiContext && ed && (
        <AIAssistantPanel
          context={aiContext}
          currentContent={ed.getHTML()}
          onInsert={handleAiInsert}
          onReplace={handleAiReplace}
          onAppend={handleAiAppend}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  )
}
