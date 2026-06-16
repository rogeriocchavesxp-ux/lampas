'use client'

import { useState } from 'react'
import { getSectionsByGroupNav, getSectionNavBySlug } from '@/lib/workspace-sections-nav'
import { isSynthesisSlug, getSynthesisBySlug } from '@/lib/workspace-sections'
import { getToolAreaBySlug, isToolSlug } from '@/lib/tools-content'
import {
  Heart, BookOpen, FileText, Crosshair, Landmark, Languages, GraduationCap,
  Sparkles, BookMarked, Flame, MessageSquareText, Layers, Book, Library,
  BookCopy, Link2, Paperclip, MapPin, Network, TrendingUp, LayoutTemplate, Mic, Brain, Megaphone,
  AlignJustify, GitBranch, Palette, Tag, Lightbulb,
  type LucideIcon,
} from 'lucide-react'
import { STUDY_MODE_REGISTRY, type NavPhase } from '@/lib/study-modes'

// ── Tipos de navegação ─────────────────────────────────────────────────────

type PhaseId = 'preparar' | 'investigar' | 'comunicar' | 'ferramentas'

// NAV_PHASES deriva do registry — WorkspaceClient é um renderer genérico
const NAV_PHASES: NavPhase[] = STUDY_MODE_REGISTRY.exegese_biblica.phases

// NAV_GROUP_IDS para o modo padrão (usado como fallback em getCanonFor)
const NAV_GROUP_IDS = new Set(NAV_PHASES.flatMap(ph => ph.modes.flatMap(m => m.groups.map(g => g.id))))

// PHASE_DESCRIPTIONS removido — descrição agora vive em NavPhase.description

export const GROUP_SUBTITLES: Record<string, string> = {
  // Investigar — Estudo de Carta
  ec_ocasiao_grp:   'Contexto e motivo da escrita',
  ec_estrutura_grp: 'Organização e fluxo da carta',
  ec_argumento_grp: 'Desenvolvimento da mensagem',
  // Investigar
  contextual: 'Histórico, literário e canônico',
  textual:    'Texto original e estrutura',
  teologico:  'Mensagem e implicações',
  // Temático
  et_definicao_grp:        'Nome, campo semântico e questão orientadora',
  et_ocorrencias_grp:      'AT, NT e passagens centrais',
  et_desenvolvimento_grp:  'Do Pentateuco ao Apocalipse',
  et_teologia_biblica_grp: 'Fio condutor e centro cristológico',
  et_relacao_cristo_grp:   'Tipologia e cumprimento redentor',
  et_implicacoes_grp:      'Doutrina, ética e missão',
  et_aplicacoes_grp:       'Vida cristã, eclesial e missional',
  et_sistematica_grp:      'Formulação doutrinária e implicações',
  // Termos — Fase I Definir
  termos_definicao_grp:      'Forma original, campo semântico e definição',
  termos_comparacao_grp:     'Sinônimos, antônimos e distinções importantes',
  termos_relacao_grp:        'Deus, Cristo, Espírito, Igreja, Salvação e Reino',
  termos_circunstancia_grp:  'Contexto histórico, cultural e literário',
  termos_testemunho_grp:     'AT, NT, Cristo e síntese apostólica',
  termos_sint_inicial_grp:   'Síntese provisória, questão central e hipótese',
  // Termos — Fase II Investigar
  termos_uso_biblico_grp:    'Ocorrências, distribuição e texto central',
  termos_canonico_grp:       'Do Pentateuco ao Apocalipse',
  termos_uso_pericope_grp:   'Uso no livro, na perícope e no argumento',
  termos_campo_sem_grp:      'Núcleo, periferia e evolução semântica',
  termos_rel_teol_grp:       'Aliança, soteriologia, cristologia e escatologia',
  termos_conceitos_grp:      'Sinônimos, antônimos e constelação lexical',
  termos_sint_invest_grp:    'Achados principais, tese bíblica e padrão global',
  // Termos — Fase III Produzir
  termos_sintese_def_grp:    'Definição final, grande ideia e implicações',
  termos_aplicacoes_grp:     'Vida cristã, pregação, pastoral e missão',
  termos_sint_final_grp:     'Síntese completa e produto final do estudo',
  // Doutrinário
  doutr_conceito_grp:          'Nome, definição preliminar e pergunta orientadora',
  doutr_fundbiblica_grp:       'Principais textos, AT, NT, Cristo e apóstolos',
  doutr_desenvolvredentivo_grp:'Promessa, desenvolvimento e cumprimento em Cristo',
  doutr_relacoes_grp:          'Dependências e conexões com a teologia sistemática',
  doutr_historia_grp:          'Igreja Antiga, Reforma, Pós-Reforma e debates atuais',
  doutr_controversias_grp:     'Heresias, erros e avaliação bíblica',
  doutr_sintese_grp:           'Definição final, grande afirmação e resumo executivo',
  doutr_implicacoes_grp:       'Teológicas, eclesiásticas, pastorais, devocionais e missionais',
  // Preparar
  preparar_espiritual:  'Oração e dependência',
  preparar_assimilacao: 'Contato direto com o texto',
  preparar_impressoes:  'Notas rápidas e perguntas',
  preparar_visao_geral:     'Tema, estrutura e clímax',
  nr_visao_geral_grp:       'Mapa inicial da narrativa',
  investigar_visao_geral:   'Compreensão refinada após investigação',
  // Narrativas — Investigar
  nr_contextual_grp: 'Histórico, literário e canônico',
  nr_textual_grp:    'Texto original e estrutura',
  nr_teologico_grp:  'Mensagem e implicações',
  nr_ivg_grp:        'Grande ideia, verdades e aplicações',
  pregar_visao_geral:       'Síntese final para comunicação',
  ferramentas_visao_geral:  'Mapa das ferramentas disponíveis',
  // Comunicar — Sermão
  sermao_dispositio:    'Organização e estrutura',
  sermao_elocutio:      'Forma de comunicação',
  sermao_memoria:       'Memorização e preparo',
  sermao_pronuntiatio:  'Entrega e performance',
  // Comunicar — Estudo Bíblico
  estudo_dispositio:    'Organização e estrutura',
  estudo_elocutio:      'Forma de comunicação',
  estudo_memoria:       'Memorização e preparo',
  estudo_pronuntiatio:  'Entrega e performance',
  // Comunicar — Devocional
  devocional_dispositio:    'Organização e estrutura',
  devocional_elocutio:      'Forma de comunicação',
  devocional_memoria:       'Memorização e preparo',
  devocional_pronuntiatio:  'Entrega e performance',
  // Colagens
  colagens: 'Citações, notas e insights',
  // Comentário
  comentario_expositivo: 'Análise versículo a versículo',
}

// Cores de acento por grupo — usadas para identidade visual das seções de investigação
export const GROUP_ACCENT_COLORS: Record<string, string> = {
  textual:               '#163A6B',  // azul escuro
  contextual:            '#B45309',  // âmbar
  teologico:             '#7C3AED',  // roxo
  investigar_visao_geral: '#0F766E', // verde-azulado
  ec_ocasiao_grp:        '#B45309',
  ec_estrutura_grp:      '#163A6B',
  ec_argumento_grp:      '#7C3AED',
  // Termos — Fase I
  termos_definicao_grp:      '#0D9488',
  termos_comparacao_grp:     '#B45309',
  termos_relacao_grp:        '#7C3AED',
  termos_circunstancia_grp:  '#0F766E',
  termos_testemunho_grp:     '#163A6B',
  termos_sint_inicial_grp:   '#1E40AF',
  // Termos — Fase II
  termos_uso_biblico_grp:    '#B45309',
  termos_canonico_grp:       '#0F766E',
  termos_uso_pericope_grp:   '#163A6B',
  termos_campo_sem_grp:      '#0D9488',
  termos_rel_teol_grp:       '#7C3AED',
  termos_conceitos_grp:      '#1E40AF',
  termos_sint_invest_grp:    '#163A6B',
  // Termos — Fase III
  termos_sintese_def_grp:    '#7C3AED',
  termos_aplicacoes_grp:     '#0D9488',
  termos_sint_final_grp:     '#1E40AF',
  // Temático
  et_definicao_grp:        '#1E40AF',
  et_ocorrencias_grp:      '#B45309',
  et_desenvolvimento_grp:  '#0F766E',
  et_teologia_biblica_grp: '#163A6B',
  et_relacao_cristo_grp:   '#7C3AED',
  et_implicacoes_grp:      '#BE185D',
  et_aplicacoes_grp:       '#1E40AF',
  et_sistematica_grp:      '#163A6B',
  // Narrativas — Preparar
  nr_visao_geral_grp: '#D97706',
  // Narrativas — Investigar
  nr_contextual_grp:  '#B45309',
  nr_textual_grp:     '#92400E',
  nr_teologico_grp:   '#7C3AED',
  nr_ivg_grp:         '#0F766E',
  // Doutrinário
  doutr_conceito_grp:           '#1E40AF',
  doutr_fundbiblica_grp:        '#B45309',
  doutr_desenvolvredentivo_grp: '#0F766E',
  doutr_relacoes_grp:           '#7C3AED',
  doutr_historia_grp:           '#1E40AF',
  doutr_controversias_grp:      '#BE185D',
  doutr_sintese_grp:            '#163A6B',
  doutr_implicacoes_grp:        '#7C3AED',
}

export const GROUP_EMOJI: Record<string, string> = {
  textual:                '📖',
  contextual:             '🏛',
  teologico:              '✝',
  investigar_visao_geral: '🧠',
}

export const GROUP_ICONS: Record<string, LucideIcon> = {
  // Preparar
  preparar_espiritual:       Heart,
  preparar_assimilacao:      BookOpen,
  preparar_impressoes:       FileText,
  preparar_visao_geral:      Crosshair,
  investigar_visao_geral:    Crosshair,
  pregar_visao_geral:        Crosshair,
  ferramentas_visao_geral:   Crosshair,
  // Investigar — Estudo de Carta
  ec_ocasiao_grp:            MapPin,
  ec_estrutura_grp:          Network,
  ec_argumento_grp:          TrendingUp,
  // Investigar
  contextual:                Landmark,
  textual:                   Languages,
  teologico:                 GraduationCap,
  // Narrativas — Preparar
  nr_visao_geral_grp:        Crosshair,
  // Investigar — Narrativas
  nr_contextual_grp:         Landmark,
  nr_textual_grp:            Languages,
  nr_teologico_grp:          GraduationCap,
  nr_ivg_grp:                Crosshair,
  // Investigar — Salmos e Sabedoria
  ss_paralelismo_grp:        AlignJustify,
  ss_estrutura_grp:          GitBranch,
  ss_imagistica_grp:         Palette,
  ss_temas_grp:              Tag,
  ss_teologia_grp:           BookMarked,
  // Pregar — Sermão
  sermao_dispositio:         LayoutTemplate,
  sermao_elocutio:           Mic,
  sermao_memoria:            Brain,
  sermao_pronuntiatio:       Megaphone,
  // Produzir — Comentário
  comentario_expositivo:     MessageSquareText,
  // Termos — Fase I
  termos_definicao_grp:      Lightbulb,
  termos_comparacao_grp:     BookOpen,
  termos_relacao_grp:        Link2,
  termos_circunstancia_grp:  MapPin,
  termos_testemunho_grp:     BookMarked,
  termos_sint_inicial_grp:   Layers,
  // Termos — Fase II
  termos_uso_biblico_grp:    BookOpen,
  termos_canonico_grp:       TrendingUp,
  termos_uso_pericope_grp:   Crosshair,
  termos_campo_sem_grp:      Network,
  termos_rel_teol_grp:       GitBranch,
  termos_conceitos_grp:      Tag,
  termos_sint_invest_grp:    GraduationCap,
  // Termos — Fase III
  termos_sintese_def_grp:    Sparkles,
  termos_aplicacoes_grp:     Heart,
  termos_sint_final_grp:     Landmark,
  // Temático
  et_definicao_grp:        Lightbulb,
  et_ocorrencias_grp:      BookOpen,
  et_desenvolvimento_grp:  TrendingUp,
  et_teologia_biblica_grp: GitBranch,
  et_relacao_cristo_grp:   Heart,
  et_implicacoes_grp:      Layers,
  et_aplicacoes_grp:       GraduationCap,
  et_sistematica_grp:      Network,
  // Doutrinário
  doutr_conceito_grp:           Lightbulb,
  doutr_fundbiblica_grp:        BookOpen,
  doutr_desenvolvredentivo_grp: TrendingUp,
  doutr_relacoes_grp:           Link2,
  doutr_historia_grp:           Landmark,
  doutr_controversias_grp:      Crosshair,
  doutr_sintese_grp:            Layers,
  doutr_implicacoes_grp:        GraduationCap,
  // Ferramentas
  ferramentas_sistematica:   Layers,
  ferramentas_biblica:       Book,
  ferramentas_confissoes_catecismos: BookMarked,
  ferramentas_dicionario:    Library,
  ferramentas_livros:        BookCopy,
  ferramentas_refs_cruzadas: Link2,
  ferramentas_introducao_at: BookOpen,
  ferramentas_introducao_nt: BookOpen,
  colagens:                  Paperclip,
}

export const MODE_ICONS_LUCIDE: Record<string, LucideIcon> = {
  sermao:         Sparkles,
  estudo_biblico: BookMarked,
  devocional:     Flame,
  comentario:     MessageSquareText,
}

// ── Helpers de navegação ───────────────────────────────────────────────────

export function getPhaseFor(slug: string): PhaseId {
  if (slug === 'colagens') return 'ferramentas'
  if (slug === 'comentario_expositivo') return 'comunicar'
  if (isToolSlug(slug)) return 'ferramentas'
  if (isSynthesisSlug(slug)) return 'investigar'
  const sec = getSectionNavBySlug(slug)
  if (sec?.phase === 'preparar') return 'preparar'
  if (sec?.phase === 'comunicar') return 'comunicar'
  if (sec?.communicationMode) return 'comunicar'
  if (sec?.module === 'inventio') return 'investigar'
  if (sec?.module === 'dispositio') return 'comunicar'
  if (sec?.module === 'elocutio') return 'comunicar'
  if (sec?.module === 'memoria') return 'comunicar'
  if (sec?.module === 'pronuntiatio') return 'comunicar'
  return 'investigar'
}

export function getGroupFor(slug: string): string | undefined {
  if (slug === 'colagens') return 'colagens'
  if (slug === 'comentario_expositivo') return 'comentario_expositivo'
  if (isToolSlug(slug)) return slug
  if (isSynthesisSlug(slug)) return getSynthesisBySlug(slug)?.groupId
  return getSectionNavBySlug(slug)?.group
}

export function getCanonFor(slug: string, phases: NavPhase[] = NAV_PHASES): string | undefined {
  const groupId = getGroupFor(slug)
  if (!groupId) return undefined
  for (const phase of phases) {
    for (const mode of phase.modes) {
      if (mode.groups.some(g => g.id === groupId)) return mode.id
    }
  }
  return undefined
}

function getSlugLabel(slug: string): string {
  return getSectionNavBySlug(slug)?.shortTitle
    ?? getSynthesisBySlug(slug)?.shortTitle
    ?? getToolAreaBySlug(slug)?.shortTitle
    ?? slug
}

// ── Phase-level navigation ─────────────────────────────────────────────────

const PHASE_MAIN_NAV = ['preparar_visao_geral', 'investigar_visao_geral', 'pregar_visao_geral'] as const

const PHASE_NAV_LABELS: Record<string, string> = {
  preparar_visao_geral:    'Preparar',
  investigar_visao_geral:  'Investigar',
  pregar_visao_geral:      'Produzir',
}

function getPhaseOverviewSlug(slug: string): string | null {
  // Explicit mappings first to avoid ambiguity from data mismatches
  if (slug === 'preparar_visao_geral')   return 'preparar_visao_geral'
  if (slug === 'investigar_visao_geral') return 'investigar_visao_geral'
  if (slug === 'pregar_visao_geral')     return 'pregar_visao_geral'
  const phase = getPhaseFor(slug)
  if (phase === 'preparar')   return 'preparar_visao_geral'
  if (phase === 'investigar') return 'investigar_visao_geral'
  if (phase === 'comunicar')  return 'pregar_visao_geral'
  return null  // ferramentas or unknown — outside main flow
}

// Slugs that render via VisaoGeralWorkspace (overview recolhível com herança entre fases)
export const VG_SLUGS = ['preparar_visao_geral', 'investigar_visao_geral', 'ferramentas_visao_geral', 'nr_preparar_visao_geral', 'nr_ivg_ideia']

// Returns the canonical navigation target for a phase (visão geral if present, else first section)
export function getPhaseNavSlug(phase: NavPhase, studyModeId?: string): string {
  const groups = phase.modes.flatMap(m => m.groups)
  const vgGroup = groups.find(g => g.id.includes('visao_geral') || g.id === 'pregar_visao_geral' || g.id === 'nr_ivg_grp')
  const targetGroupId = vgGroup ? vgGroup.id : (groups[0]?.id ?? '')
  const secs = getSectionsByGroupNav(targetGroupId, studyModeId)
  return secs[0]?.slug ?? targetGroupId
}

function statusDot(status: 'empty' | 'draft' | 'reviewed' | undefined): string {
  if (!status || status === 'empty') return 'var(--border)'
  if (status === 'draft') return 'var(--accent)'
  return 'var(--success)'
}

export function cardTextStatus(text: string): 'empty' | 'draft' | 'reviewed' {
  if (!text.trim()) return 'empty'
  if (text.trim().length < 80) return 'draft'
  return 'reviewed'
}

export function toolProgress(groupId: string): { done: number; total: number } {
  if (groupId === 'colagens') return { done: 0, total: 1 }
  if (groupId === 'comentario_expositivo') return { done: 0, total: 1 }
  return isToolSlug(groupId) ? { done: 0, total: 1 } : { done: 0, total: 0 }
}

// ── Guided strip (onboarding demo) ────────────────────────────────────

const DEMO_STEPS: { slug: string; label: string; explanation: string }[] = [
  { slug: 'preparar_espiritual',    label: 'Oração e Entrega',     explanation: 'Antes de analisar, aproxime-se de Deus. Você não chega ao texto como especialista — chega como filho.' },
  { slug: 'preparar_assimilacao',   label: 'Leia Devagar',         explanation: 'O primeiro contato deve ser lento. João 3.16 é o versículo mais conhecido — e por isso o mais difícil de ouvir de novo.' },
  { slug: 'preparar_impressoes',    label: 'Primeiras Impressões', explanation: 'Anote o que chama atenção, surpreende ou incomoda. Perguntas são bem-vindas. Não filtre — o que o texto provoca agora é dado valioso.' },
  { slug: 'preparar_visao_geral',   label: 'Visão Geral',          explanation: 'Uma frase para mapear o texto inteiro antes de ir fundo. Você vai revisitar esta ideia mais tarde — e será fascinante ver como amadurece.' },
  { slug: 'contextual',             label: 'Contexto',             explanation: 'João 3.16 está no meio de uma conversa entre Jesus e Nicodemos, à noite. O contexto histórico transforma o peso das palavras.' },
  { slug: 'teologico',              label: 'Mensagem',             explanation: 'O que Deus está dizendo neste texto? Aqui meditação e teologia se encontram. Qual a grande verdade revelada?' },
  { slug: 'devocional_dispositio',  label: 'Reflexão',             explanation: 'Como este texto quer ser respondido? Não uma emoção — uma reflexão concreta sobre o que Deus está dizendo a você.' },
  { slug: 'devocional_pronuntiatio',label: 'Compromisso',          explanation: 'O estudo termina quando você age. Um passo concreto a partir do que ouviu.' },
]

export function GuidedStrip({
  activeSlug, onNavigate, modeColor,
}: { activeSlug: string; onNavigate: (slug: string) => void; modeColor: string }) {
  const [dismissed, setDismissed] = useState(false)
  const idx     = DEMO_STEPS.findIndex(s => s.slug === activeSlug)
  const current = idx >= 0 ? DEMO_STEPS[idx] : DEMO_STEPS[0]
  const next    = idx >= 0 && idx < DEMO_STEPS.length - 1 ? DEMO_STEPS[idx + 1] : null
  const stepNum = Math.max(1, idx + 1)

  if (dismissed) return null

  return (
    <div style={{
      flexShrink: 0,
      background: 'linear-gradient(90deg, rgba(201,146,26,0.08) 0%, rgba(201,146,26,0.04) 100%)',
      borderBottom: '1px solid rgba(201,146,26,0.2)',
      padding: '0.55rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '0.85rem',
    }}>
      {/* Step badge */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(201,146,26,0.15)', border: '1px solid rgba(201,146,26,0.3)',
        borderRadius: '20px', padding: '0.18rem 0.65rem',
      }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#C9921A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Guia
        </span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(201,146,26,0.7)', fontWeight: 500 }}>
          {stepNum}/{DEMO_STEPS.length}
        </span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {DEMO_STEPS.map((s, i) => (
          <div key={s.slug} style={{
            width: i === idx ? '16px' : '5px', height: '5px', borderRadius: '3px',
            background: i < idx ? '#C9921A' : i === idx ? '#C9921A' : 'rgba(201,146,26,0.2)',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
            onClick={() => onNavigate(s.slug)}
            title={s.label}
          />
        ))}
      </div>

      {/* Current step */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C9921A' }}>
          {current.label}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.45rem' }}>
          {current.explanation}
        </span>
      </div>

      {/* Actions */}
      {next && (
        <button
          onClick={() => onNavigate(next.slug)}
          style={{
            flexShrink: 0, background: '#C9921A', color: '#FFF', border: 'none',
            borderRadius: '6px', padding: '0.28rem 0.8rem',
            fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          {next.label} →
        </button>
      )}
      <button
        onClick={() => setDismissed(true)}
        style={{
          flexShrink: 0, background: 'transparent', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem',
          padding: '0.1rem 0.2rem', fontFamily: 'inherit',
        }}
        title="Fechar guia"
      >
        ✕
      </button>
    </div>
  )
}

// ── Resize handle ─────────────────────────────────────────────────────────

export function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '4px', flexShrink: 0, cursor: 'col-resize', zIndex: 10,
        background: hover ? 'var(--border)' : 'var(--border-subtle)',
        transition: 'background 0.12s',
      }}
    />
  )
}
