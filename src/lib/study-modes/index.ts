// ── Study Mode Registry ───────────────────────────────────────────────────
// Cada modo define completamente sua própria experiência no workspace.
// Adicionar um novo modo = criar um arquivo .mode.ts e registrá-lo aqui.
// O WorkspaceClient é um renderer genérico — nunca conhece o modo diretamente.

// ── Tipos ─────────────────────────────────────────────────────────────────

export type StudyModeId =
  | 'exegese_biblica'
  | 'estudo_de_carta'
  | 'estudo_de_salmos_sabedoria'
  | 'estudo_de_profecias'
  | 'estudo_narrativas'
  | 'estudo_doutrinario'
  | 'estudo_tematico'
  | 'estudo_termos'
  | 'sermao'
  | 'estudo_biblico'
  | 'devocional'
  | 'aula'
  | 'artigo'
  | 'ebook'
  | 'livro'
  | 'palestra'
  | 'curso'
  | 'serie_mensagens'
  | 'comentario_exegetico'

export type PhaseId = 'preparar' | 'investigar' | 'comunicar' | 'ferramentas'

export interface NavGroup {
  id: string
  label: string
}

export interface NavMode {
  id: string
  label: string
  subtitle: string
  color: string
  bgActive: string
  groups: NavGroup[]
}

export interface NavPhase {
  id: PhaseId
  roman: string
  label: string
  description: string
  color: string
  bgActive: string
  modes: NavMode[]
}

export interface StudyModeConfig {
  id: StudyModeId
  name: string
  tagline: string
  color: string
  // Seleção no dashboard
  audience: string            // "Pastores · Seminaristas"
  titlePlaceholder: string    // placeholder do campo Título no formulário
  // Formulário de entrada
  passageBased: boolean       // false → entrada por tema/doutrina (sem livro/perícope)
  passageLabel: string        // label do campo de perícope (quando passageBased = true)
  topicLabel: string          // label do campo de tema (quando passageBased = false)
  // Workspace
  defaultSection: string      // slug da seção aberta ao entrar no workspace
  defaultExpandedPhases: string[]
  defaultExpandedCanons: string[]
  defaultExpandedGroups: string[]
  phases: NavPhase[]
}

// ── Configs dos modos ─────────────────────────────────────────────────────

import { TOOL_AREAS } from '@/lib/tools-content'

function toolPhase(): NavPhase {
  return {
    id: 'ferramentas',
    roman: 'T',
    label: 'Ferramentas',
    description: 'Dicionário, texto original, colagens e pesquisa',
    color: '#64748B',
    bgActive: 'rgba(100,116,139,0.08)',
    modes: [{
      id: 'ferramentas_biblioteca',
      label: 'Pesquisa',
      subtitle: 'Biblioteca e assistente',
      color: '#64748B',
      bgActive: 'rgba(100,116,139,0.08)',
      groups: [
        { id: 'ferramentas_visao_geral', label: 'Visão Geral' },
        ...TOOL_AREAS.map(area => ({ id: area.slug, label: area.shortTitle })),
        { id: 'colagens', label: 'Colagens' },
      ],
    }],
  }
}

function rgba(hex: string, alpha = '0.08') {
  const clean = hex.replace('#', '')
  const value = Number.parseInt(clean, 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  return `rgba(${r},${g},${b},${alpha})`
}

type ProductionModeOptions = {
  id: StudyModeId
  name: string
  tagline: string
  color: string
  audience: string
  titlePlaceholder: string
  topicLabel: string
  defaultSection: string
  phases: Array<{
    id: PhaseId
    roman: string
    label: string
    description: string
    color: string
    modeId: string
    modeLabel: string
    subtitle: string
    groups: NavGroup[]
  }>
}

function productionMode(options: ProductionModeOptions): StudyModeConfig {
  return {
    id: options.id,
    name: options.name,
    tagline: options.tagline,
    color: options.color,
    audience: options.audience,
    titlePlaceholder: options.titlePlaceholder,
    passageBased: false,
    passageLabel: 'Texto base',
    topicLabel: options.topicLabel,
    defaultSection: options.defaultSection,
    defaultExpandedPhases: ['preparar', 'investigar', 'comunicar'],
    defaultExpandedCanons: options.phases.map(phase => phase.modeId),
    defaultExpandedGroups: options.phases.flatMap(phase => phase.groups.slice(0, 1).map(group => group.id)),
    phases: [
      ...options.phases.map((phase): NavPhase => ({
        id: phase.id,
        roman: phase.roman,
        label: phase.label,
        description: phase.description,
        color: phase.color,
        bgActive: rgba(phase.color),
        modes: [{
          id: phase.modeId,
          label: phase.modeLabel,
          subtitle: phase.subtitle,
          color: phase.color,
          bgActive: rgba(phase.color),
          groups: phase.groups,
        }],
      })),
      toolPhase(),
    ],
  }
}

// ── 1. Exegese Bíblica ───────────────────────────────────────────────────

const EXEGESE_BIBLICA: StudyModeConfig = {
  id: 'exegese_biblica',
  name: 'Exegese Bíblica',
  tagline: 'O que o texto diz, quer dizer e significa',
  color: '#B8922A',
  audience: 'Pastores · Seminaristas · Pesquisadores',
  titlePlaceholder: 'Ex: A soberania de Deus em Romanos 9',
  passageBased: true,
  passageLabel: 'Perícope',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar', 'ferramentas'],
  defaultExpandedCanons: ['preparar_imersao', 'interpretar_inventio', 'ferramentas_biblioteca'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Preparação espiritual e contato inicial com o texto',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Piedade e assimilação',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Análise contextual, textual e teológica',
      color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
      modes: [{
        id: 'interpretar_inventio', label: 'Exegese', subtitle: 'Descobrir o significado',
        color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'contextual', label: 'Estudo Contextual' },
          { id: 'textual',    label: 'Estudo Textual' },
          { id: 'teologico',  label: 'Estudo Teológico' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Produzir',
      description: 'Transformação da exegese em comunicação',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [
        {
          id: 'sermao', label: 'Sermão', subtitle: 'Proclamação pública',
          color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
          groups: [
            { id: 'pregar_visao_geral', label: 'Visão Geral' },
            { id: 'sermao_dispositio',   label: 'Estrutura' },
            { id: 'sermao_elocutio',     label: 'Linguagem' },
            { id: 'sermao_memoria',      label: 'Internalização' },
            { id: 'sermao_pronuntiatio', label: 'Execução' },
          ],
        },
        {
          id: 'estudo_biblico', label: 'Estudo Bíblico', subtitle: 'Ensino participativo',
          color: '#10B981', bgActive: 'rgba(16,185,129,0.09)',
          groups: [
            { id: 'estudo_dispositio',   label: 'Estrutura' },
            { id: 'estudo_elocutio',     label: 'Linguagem' },
            { id: 'estudo_memoria',      label: 'Internalização' },
            { id: 'estudo_pronuntiatio', label: 'Execução' },
          ],
        },
        {
          id: 'devocional', label: 'Devocional', subtitle: 'Fluxo meditativo',
          color: '#D97706', bgActive: 'rgba(217,119,6,0.09)',
          groups: [
            { id: 'devocional_dispositio',   label: 'Estrutura' },
            { id: 'devocional_elocutio',     label: 'Linguagem' },
            { id: 'devocional_memoria',      label: 'Internalização' },
            { id: 'devocional_pronuntiatio', label: 'Execução' },
          ],
        },
        {
          id: 'comentario', label: 'Comentário', subtitle: 'Versículo a versículo',
          color: '#F97316', bgActive: 'rgba(249,115,22,0.09)',
          groups: [{ id: 'comentario_expositivo', label: 'Expositivo' }],
        },
      ],
    },
    toolPhase(),
  ],
}

// ── 2. Sermão ────────────────────────────────────────────────────────────

const SERMAO: StudyModeConfig = {
  id: 'sermao',
  name: 'Sermão',
  tagline: 'Do texto ao púlpito',
  color: '#7C3AED',
  audience: 'Pastores · Pregadores',
  titlePlaceholder: 'Ex: O Senhor é meu pastor — Salmos 23',
  passageBased: true,
  passageLabel: 'Texto-base',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar', 'comunicar'],
  defaultExpandedCanons: ['preparar_imersao', 'interpretar_inventio', 'sermao'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Piedade, oração e contato inicial com o texto',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Piedade e assimilação',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Exegese compactada orientada para proclamação',
      color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
      modes: [{
        id: 'interpretar_inventio', label: 'Exegese', subtitle: 'O que o texto diz',
        color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'contextual', label: 'Estudo Contextual' },
          { id: 'textual',    label: 'Estudo Textual' },
          { id: 'teologico',  label: 'Estudo Teológico' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Pregar',
      description: 'Estrutura, linguagem e entrega do sermão',
      color: '#7C3AED', bgActive: 'rgba(124,58,237,0.08)',
      modes: [{
        id: 'sermao', label: 'Sermão', subtitle: 'Proclamação pública',
        color: '#7C3AED', bgActive: 'rgba(124,58,237,0.08)',
        groups: [
          { id: 'pregar_visao_geral', label: 'Visão Geral' },
          { id: 'sermao_dispositio',   label: 'Estrutura' },
          { id: 'sermao_elocutio',     label: 'Linguagem' },
          { id: 'sermao_memoria',      label: 'Internalização' },
          { id: 'sermao_pronuntiatio', label: 'Execução da Pregação' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 3. Devocional ────────────────────────────────────────────────────────

const DEVOCIONAL: StudyModeConfig = {
  id: 'devocional',
  name: 'Devocional',
  tagline: 'Deixar o texto falar à alma',
  color: '#9A3412',
  audience: 'Cristãos · Líderes · Grupos familiares',
  titlePlaceholder: 'Ex: Confiança em tempos de aflição — Sl 46',
  passageBased: true,
  passageLabel: 'Passagem',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'comunicar'],
  defaultExpandedCanons: ['preparar_imersao', 'devocional'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Oração e contato receptivo com o texto',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Oração e leitura',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Oração e Entrega' },
          { id: 'preparar_assimilacao', label: 'Leia Devagar' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Contemplar',
      description: 'O que Deus está dizendo neste texto',
      color: '#9A3412', bgActive: 'rgba(154,52,18,0.08)',
      modes: [{
        id: 'interpretar_inventio', label: 'Meditação', subtitle: 'Escuta atenta',
        color: '#9A3412', bgActive: 'rgba(154,52,18,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'contextual', label: 'Contexto' },
          { id: 'textual',    label: 'O Texto' },
          { id: 'teologico',  label: 'Mensagem' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Responder',
      description: 'Oração, compromisso e compartilhar',
      color: '#9A3412', bgActive: 'rgba(154,52,18,0.08)',
      modes: [{
        id: 'devocional', label: 'Devocional', subtitle: 'Reflexão e resposta',
        color: '#9A3412', bgActive: 'rgba(154,52,18,0.08)',
        groups: [
          { id: 'pregar_visao_geral',   label: 'Visão Geral' },
          { id: 'devocional_dispositio',   label: 'Reflexão' },
          { id: 'devocional_elocutio',     label: 'Resposta' },
          { id: 'devocional_pronuntiatio', label: 'Compromisso' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 4. Estudo Bíblico ────────────────────────────────────────────────────

const ESTUDO_BIBLICO: StudyModeConfig = {
  id: 'estudo_biblico',
  name: 'Estudo Bíblico',
  tagline: 'Do texto à vida do grupo',
  color: '#0369A1',
  audience: 'Professores de EBD · Líderes de grupos',
  titlePlaceholder: 'Ex: A parábola do filho pródigo — Lc 15',
  passageBased: true,
  passageLabel: 'Passagem principal',
  topicLabel: 'Tema',
  defaultSection: 'eb_preparacao',
  defaultExpandedPhases: ['preparar', 'investigar', 'comunicar'],
  defaultExpandedCanons: ['eb_preparar_mode', 'eb_compreender_mode', 'eb_ensinar_mode'],
  defaultExpandedGroups: ['eb_preparar'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Contexto pedagógico, público-alvo e objetivos',
      color: '#0369A1', bgActive: 'rgba(3,105,161,0.08)',
      modes: [{
        id: 'eb_preparar_mode', label: 'Preparação', subtitle: 'Público e objetivos',
        color: '#0369A1', bgActive: 'rgba(3,105,161,0.08)',
        groups: [
          { id: 'eb_preparar',          label: 'Preparação e Objetivos' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Compreender',
      description: 'Análise do texto para ensino',
      color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
      modes: [{
        id: 'eb_compreender_mode', label: 'O Texto', subtitle: 'Análise e estrutura',
        color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'eb_compreender', label: 'Texto, Temas e Termos' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Ensinar',
      description: 'Estrutura pedagógica e aplicações',
      color: '#10B981', bgActive: 'rgba(16,185,129,0.08)',
      modes: [{
        id: 'eb_ensinar_mode', label: 'Ensinar', subtitle: 'Desenvolvimento e perguntas',
        color: '#10B981', bgActive: 'rgba(16,185,129,0.08)',
        groups: [
          { id: 'pregar_visao_geral', label: 'Visão Geral' },
          { id: 'eb_ensinar',  label: 'Desenvolvimento e Perguntas' },
          { id: 'eb_aplicar',  label: 'Aplicações' },
          { id: 'eb_recursos', label: 'Material' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 5. Estudo Doutrinário ────────────────────────────────────────────────

const ESTUDO_DOUTRINARIO: StudyModeConfig = {
  id: 'estudo_doutrinario',
  name: 'Estudo Doutrinário',
  tagline: 'A fé que buscou entender',
  color: '#1E40AF',
  audience: 'Teólogos · Estudantes · Pastores',
  titlePlaceholder: 'Ex: A doutrina da justificação por fé',
  passageBased: false,
  passageLabel: 'Texto âncora',
  topicLabel: 'Doutrina',
  defaultSection: 'edt_definicao',
  defaultExpandedPhases: ['preparar', 'investigar'],
  defaultExpandedCanons: ['edt_definir_mode', 'edt_investigar_mode'],
  defaultExpandedGroups: ['edt_definicao_grp'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Definir',
      description: 'Nome, definição e fundamentação bíblica',
      color: '#1E40AF', bgActive: 'rgba(30,64,175,0.08)',
      modes: [{
        id: 'edt_definir_mode', label: 'Definição', subtitle: 'Conceito e fundamento',
        color: '#1E40AF', bgActive: 'rgba(30,64,175,0.08)',
        groups: [
          { id: 'edt_definicao_grp',     label: 'Definição' },
          { id: 'preparar_visao_geral',  label: 'Visão Geral' },
          { id: 'edt_fundamentacao_grp', label: 'Fundamentação Bíblica' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'História, formulação e controvérsias',
      color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
      modes: [{
        id: 'edt_investigar_mode', label: 'Investigação', subtitle: 'História e sistema',
        color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'edt_historia_grp',         label: 'História da Doutrina' },
          { id: 'edt_formulacao_grp',        label: 'Formulação Sistemática' },
          { id: 'edt_controversias_grp',     label: 'Controvérsias' },
          { id: 'edt_confissionalidade_grp', label: 'Confissionalidade' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Aplicar',
      description: 'Aplicações pastorais e bibliografia',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [{
        id: 'edt_aplicar_mode', label: 'Aplicação', subtitle: 'Prática e fontes',
        color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'pregar_visao_geral', label: 'Visão Geral' },
          { id: 'edt_aplicacoes_grp',  label: 'Aplicações' },
          { id: 'edt_bibliografia_grp', label: 'Bibliografia' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 6. Estudo Temático ──────────────────────────────────────────────────

const ESTUDO_TEMATICO: StudyModeConfig = {
  id: 'estudo_tematico',
  name: 'Estudo Temático',
  tagline: 'Como o cânone trata este tema',
  color: '#065F46',
  audience: 'Pastores · Professores · Estudantes',
  titlePlaceholder: 'Ex: A aliança na progressão canônica',
  passageBased: false,
  passageLabel: 'Texto âncora',
  topicLabel: 'Tema',
  defaultSection: 'et_definicao',
  defaultExpandedPhases: ['preparar', 'investigar'],
  defaultExpandedCanons: ['et_definir_mode', 'et_canonico_mode'],
  defaultExpandedGroups: ['et_definicao_grp'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Definir',
      description: 'O tema, seu campo semântico e a questão orientadora',
      color: '#065F46', bgActive: 'rgba(6,95,70,0.08)',
      modes: [{
        id: 'et_definir_mode', label: 'Definição', subtitle: 'O tema e a questão',
        color: '#065F46', bgActive: 'rgba(6,95,70,0.08)',
        groups: [
          { id: 'et_definicao_grp',     label: 'Definição do Tema' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Rastrear',
      description: 'O tema ao longo do cânone — AT, NT e síntese',
      color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
      modes: [{
        id: 'et_canonico_mode', label: 'Cânone', subtitle: 'Desenvolvimento canônico',
        color: 'var(--accent)', bgActive: 'rgba(30,77,140,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'et_at_grp',      label: 'Antigo Testamento' },
          { id: 'et_nt_grp',      label: 'Novo Testamento' },
          { id: 'et_sintese_grp', label: 'Síntese Canônica' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Comunicar',
      description: 'Organização da apresentação e aplicações',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [{
        id: 'et_formular_mode', label: 'Formulação', subtitle: 'Sistema e prática',
        color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'pregar_visao_geral', label: 'Visão Geral' },
          { id: 'et_sistematica_grp', label: 'Teologia Sistemática' },
          { id: 'sermao_dispositio',  label: 'Estrutura' },
          { id: 'sermao_elocutio',    label: 'Linguagem' },
          { id: 'et_aplicacoes_grp',  label: 'Aplicações' },
          { id: 'sermao_memoria',     label: 'Internalização' },
          { id: 'sermao_pronuntiatio', label: 'Execução' },
        ],
      }],
    },
    toolPhase(),
  ],
}

const ESTUDO_TERMOS: StudyModeConfig = {
  id: 'estudo_termos',
  name: 'Estudo de Termos',
  tagline: 'Léxico, contexto e teologia de palavras bíblicas',
  color: '#0D9488',
  audience: 'Pastores · Professores · Seminaristas',
  titlePlaceholder: 'Ex: חֶסֶד — amor leal na aliança',
  passageBased: false,
  passageLabel: 'Texto âncora',
  topicLabel: 'Termo',
  defaultSection: 'termos_definir',
  defaultExpandedPhases: ['preparar', 'investigar', 'comunicar'],
  defaultExpandedCanons: ['termos_definir_mode', 'termos_analise_mode', 'termos_sintese_mode'],
  defaultExpandedGroups: ['termos_definir_grp'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Definir',
      description: 'Termo, idioma, forma original e campo semântico',
      color: '#0D9488', bgActive: 'rgba(13,148,136,0.08)',
      modes: [{
        id: 'termos_definir_mode', label: 'Definição', subtitle: 'Termo e pergunta',
        color: '#0D9488', bgActive: 'rgba(13,148,136,0.08)',
        groups: [
          { id: 'termos_definir_grp', label: 'Definir' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Análise lexical, uso bíblico e desenvolvimento canônico',
      color: '#163A6B', bgActive: 'rgba(30,77,140,0.08)',
      modes: [{
        id: 'termos_analise_mode', label: 'Análise', subtitle: 'Léxico e cânone',
        color: '#163A6B', bgActive: 'rgba(30,77,140,0.08)',
        groups: [
          { id: 'termos_analisar_grp', label: 'Analisar' },
          { id: 'termos_rastrear_grp', label: 'Rastrear' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Produzir',
      description: 'Síntese bíblico-teológica, verbete e aplicações',
      color: '#7C3AED', bgActive: 'rgba(124,58,237,0.08)',
      modes: [{
        id: 'termos_sintese_mode', label: 'Síntese', subtitle: 'Teologia e uso pastoral',
        color: '#7C3AED', bgActive: 'rgba(124,58,237,0.08)',
        groups: [
          { id: 'termos_sintetizar_grp', label: 'Sintetizar' },
          { id: 'termos_produzir_grp', label: 'Produzir' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── Modos de Produção ────────────────────────────────────────────────────

const AULA = productionMode({
  id: 'aula',
  name: 'Aula',
  tagline: 'Ensino estruturado para formação cristã',
  color: '#163A6B',
  audience: 'Professores · Líderes · Seminaristas',
  titlePlaceholder: 'Ex: Introdução à hermenêutica bíblica',
  topicLabel: 'Tema ou texto base',
  defaultSection: 'aula_preparar',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Preparar',
      description: 'Finalidade, público, tempo e base da aula',
      color: '#163A6B',
      modeId: 'aula_planejamento',
      modeLabel: 'Planejamento',
      subtitle: 'Objetivos e público',
      groups: [{ id: 'aula_preparar_grp', label: 'Preparar' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Compreender',
      description: 'Conteúdo central, conceitos e relação bíblica',
      color: '#0EA5E9',
      modeId: 'aula_conteudo',
      modeLabel: 'Conteúdo',
      subtitle: 'Compreensão e conceitos',
      groups: [{ id: 'aula_compreender_grp', label: 'Compreender' }],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Ensinar',
      description: 'Condução didática, interação e materiais',
      color: '#10B981',
      modeId: 'aula_ensino',
      modeLabel: 'Ensino',
      subtitle: 'Aula e material',
      groups: [
        { id: 'aula_ensinar_grp', label: 'Ensinar' },
        { id: 'aula_material_grp', label: 'Material' },
      ],
    },
  ],
})

const ARTIGO = productionMode({
  id: 'artigo',
  name: 'Artigo',
  tagline: 'Argumentação teológica ou pastoral',
  color: '#7C3AED',
  audience: 'Pastores · Professores · Pesquisadores',
  titlePlaceholder: 'Ex: A esperança cristã em tempos de sofrimento',
  topicLabel: 'Tema do artigo',
  defaultSection: 'artigo_planejar',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Planejar',
      description: 'Tema, problema, tese, público e objetivo',
      color: '#7C3AED',
      modeId: 'artigo_planejamento',
      modeLabel: 'Planejamento',
      subtitle: 'Tese e objetivo',
      groups: [{ id: 'artigo_planejar_grp', label: 'Planejar' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Pesquisar',
      description: 'Fontes, citações, evidências e objeções',
      color: '#163A6B',
      modeId: 'artigo_pesquisa',
      modeLabel: 'Pesquisa',
      subtitle: 'Fontes e evidências',
      groups: [{ id: 'artigo_pesquisar_grp', label: 'Pesquisar' }],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Produzir',
      description: 'Argumentação, redação e revisão',
      color: '#A855F7',
      modeId: 'artigo_producao',
      modeLabel: 'Produção',
      subtitle: 'Argumentar, redigir e revisar',
      groups: [
        { id: 'artigo_argumentar_grp', label: 'Argumentar' },
        { id: 'artigo_redigir_grp', label: 'Redigir' },
        { id: 'artigo_revisar_grp', label: 'Revisar' },
      ],
    },
  ],
})

const EBOOK = productionMode({
  id: 'ebook',
  name: 'E-book',
  tagline: 'Material digital claro e reutilizável',
  color: '#0F766E',
  audience: 'Autores · Ministérios · Professores',
  titlePlaceholder: 'Ex: Guia de oração em família',
  topicLabel: 'Tema do e-book',
  defaultSection: 'ebook_conceber',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Conceber',
      description: 'Tema, público, promessa e problema resolvido',
      color: '#0F766E',
      modeId: 'ebook_conceito',
      modeLabel: 'Conceito',
      subtitle: 'Promessa e público',
      groups: [{ id: 'ebook_conceber_grp', label: 'Conceber' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Estruturar',
      description: 'Sumário, capítulos e progressão lógica',
      color: '#0891B2',
      modeId: 'ebook_estrutura',
      modeLabel: 'Estrutura',
      subtitle: 'Sumário e capítulos',
      groups: [{ id: 'ebook_estruturar_grp', label: 'Estruturar' }],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Publicar',
      description: 'Escrita, recursos e versão final',
      color: '#14B8A6',
      modeId: 'ebook_publicacao',
      modeLabel: 'Publicação',
      subtitle: 'Escrever, enriquecer e publicar',
      groups: [
        { id: 'ebook_escrever_grp', label: 'Escrever' },
        { id: 'ebook_enriquecer_grp', label: 'Enriquecer' },
        { id: 'ebook_publicar_grp', label: 'Publicar' },
      ],
    },
  ],
})

const LIVRO = productionMode({
  id: 'livro',
  name: 'Livro',
  tagline: 'Obra longa com tese, arquitetura e revisão',
  color: '#92400E',
  audience: 'Autores · Professores · Pesquisadores',
  titlePlaceholder: 'Ex: Fundamentos da vida cristã',
  topicLabel: 'Tema do livro',
  defaultSection: 'livro_conceito',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Conceito',
      description: 'Tese, público e contribuição da obra',
      color: '#92400E',
      modeId: 'livro_conceito_mode',
      modeLabel: 'Conceito',
      subtitle: 'Tese e contribuição',
      groups: [{ id: 'livro_conceito_grp', label: 'Conceito' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Arquitetura',
      description: 'Sumário, partes, capítulos e pesquisa',
      color: '#B45309',
      modeId: 'livro_arquitetura_mode',
      modeLabel: 'Arquitetura',
      subtitle: 'Estrutura e pesquisa',
      groups: [
        { id: 'livro_arquitetura_grp', label: 'Arquitetura' },
        { id: 'livro_pesquisa_grp', label: 'Pesquisa' },
      ],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Escrever',
      description: 'Desenvolvimento, revisão e publicação',
      color: '#D97706',
      modeId: 'livro_escrita_mode',
      modeLabel: 'Escrita',
      subtitle: 'Desenvolver e publicar',
      groups: [
        { id: 'livro_desenvolvimento_grp', label: 'Desenvolvimento' },
        { id: 'livro_revisao_grp', label: 'Revisão' },
        { id: 'livro_publicacao_grp', label: 'Publicação' },
      ],
    },
  ],
})

const PALESTRA = productionMode({
  id: 'palestra',
  name: 'Palestra',
  tagline: 'Comunicação oral para eventos e conferências',
  color: '#DB2777',
  audience: 'Palestrantes · Professores · Líderes',
  titlePlaceholder: 'Ex: Família e vocação cristã',
  topicLabel: 'Tema da palestra',
  defaultSection: 'palestra_preparar',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Preparar',
      description: 'Evento, público, tempo e objetivo',
      color: '#DB2777',
      modeId: 'palestra_preparo_mode',
      modeLabel: 'Preparo',
      subtitle: 'Contexto e objetivo',
      groups: [{ id: 'palestra_preparar_grp', label: 'Preparar' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Construir',
      description: 'Abertura, pontos, transições e fechamento',
      color: '#BE185D',
      modeId: 'palestra_estrutura_mode',
      modeLabel: 'Estrutura',
      subtitle: 'Movimentos da palestra',
      groups: [{ id: 'palestra_construir_grp', label: 'Construir' }],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Comunicar',
      description: 'Linguagem, apoio visual e ensaio',
      color: '#EC4899',
      modeId: 'palestra_comunicacao_mode',
      modeLabel: 'Comunicação',
      subtitle: 'Entrega e recursos',
      groups: [
        { id: 'palestra_comunicar_grp', label: 'Comunicar' },
        { id: 'palestra_apoiar_grp', label: 'Apoiar' },
        { id: 'palestra_ensaiar_grp', label: 'Ensaiar' },
      ],
    },
  ],
})

const CURSO = productionMode({
  id: 'curso',
  name: 'Curso',
  tagline: 'Trilha de aprendizagem com aulas e materiais',
  color: '#0E7490',
  audience: 'Professores · Instituições · Ministérios',
  titlePlaceholder: 'Ex: Princípios de interpretação bíblica',
  topicLabel: 'Tema do curso',
  defaultSection: 'curso_planejar',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Planejar',
      description: 'Público, objetivos e resultados esperados',
      color: '#0E7490',
      modeId: 'curso_planejamento_mode',
      modeLabel: 'Planejamento',
      subtitle: 'Público e objetivos',
      groups: [{ id: 'curso_planejar_grp', label: 'Planejar' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Estruturar',
      description: 'Módulos, aulas e progressão didática',
      color: '#163A6B',
      modeId: 'curso_estrutura_mode',
      modeLabel: 'Estrutura',
      subtitle: 'Módulos e aulas',
      groups: [{ id: 'curso_estruturar_grp', label: 'Estruturar' }],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Produzir',
      description: 'Aulas, materiais e publicação',
      color: '#06B6D4',
      modeId: 'curso_producao_mode',
      modeLabel: 'Produção',
      subtitle: 'Aulas, materiais e entrega',
      groups: [
        { id: 'curso_produzir_aulas_grp', label: 'Produzir Aulas' },
        { id: 'curso_materiais_grp', label: 'Materiais' },
        { id: 'curso_publicar_grp', label: 'Publicar' },
      ],
    },
  ],
})

const SERIE_MENSAGENS = productionMode({
  id: 'serie_mensagens',
  name: 'Série de Mensagens',
  tagline: 'Planejamento de uma sequência de sermões',
  color: '#7C2D12',
  audience: 'Pastores · Equipes de ensino',
  titlePlaceholder: 'Ex: A presença de Deus na vida de José',
  topicLabel: 'Tema da série',
  defaultSection: 'serie_conceber',
  phases: [
    {
      id: 'preparar',
      roman: 'I',
      label: 'Conceber',
      description: 'Tema, necessidade pastoral e eixo bíblico',
      color: '#7C2D12',
      modeId: 'serie_conceito_mode',
      modeLabel: 'Conceito',
      subtitle: 'Tema e necessidade',
      groups: [{ id: 'serie_conceber_grp', label: 'Conceber' }],
    },
    {
      id: 'investigar',
      roman: 'II',
      label: 'Planejar',
      description: 'Calendário, ordem e progressão da série',
      color: '#B45309',
      modeId: 'serie_planejamento_mode',
      modeLabel: 'Planejamento',
      subtitle: 'Calendário e mensagens',
      groups: [{ id: 'serie_planejar_grp', label: 'Planejar' }],
    },
    {
      id: 'comunicar',
      roman: 'III',
      label: 'Comunicar',
      description: 'Mensagens, identidade, materiais e publicação',
      color: '#EA580C',
      modeId: 'serie_comunicacao_mode',
      modeLabel: 'Comunicação',
      subtitle: 'Desenvolver e publicar',
      groups: [
        { id: 'serie_desenvolver_grp', label: 'Desenvolver' },
        { id: 'serie_comunicar_grp', label: 'Comunicar' },
        { id: 'serie_publicar_grp', label: 'Publicar' },
      ],
    },
  ],
})

// ── 7. Estudo de Carta ──────────────────────────────────────────────────

const ESTUDO_DE_CARTA: StudyModeConfig = {
  id: 'estudo_de_carta',
  name: 'Estudo de Carta',
  tagline: 'A lógica da argumentação apostólica',
  color: '#6D28D9',
  audience: 'Pastores · Seminaristas · Pregadores',
  titlePlaceholder: 'Ex: O argumento central de Gálatas',
  passageBased: true,
  passageLabel: 'Carta / Perícope',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar'],
  defaultExpandedCanons: ['preparar_imersao', 'ec_carta_mode'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Imersão e leitura da carta completa',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Leitura global',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Oração' },
          { id: 'preparar_assimilacao', label: 'Carta Completa' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Estrutura epistolar, argumento e perícope focal',
      color: '#6D28D9', bgActive: 'rgba(109,40,217,0.08)',
      modes: [{
        id: 'ec_carta_mode', label: 'A Carta', subtitle: 'Estrutura e argumento',
        color: '#6D28D9', bgActive: 'rgba(109,40,217,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'ec_ocasiao_grp',   label: 'Ocasião e Propósito' },
          { id: 'ec_estrutura_grp', label: 'Estrutura Retórica' },
          { id: 'ec_argumento_grp', label: 'Argumento Central' },
          { id: 'contextual',       label: 'Contexto Histórico' },
          { id: 'textual',          label: 'Perícope Focal' },
          { id: 'teologico',        label: 'Teologia da Carta' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Comunicar',
      description: 'Aplicação e produção pastoral',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [{
        id: 'sermao', label: 'Sermão', subtitle: 'Proclamação',
        color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'pregar_visao_geral', label: 'Visão Geral' },
          { id: 'sermao_dispositio', label: 'Estrutura' },
          { id: 'sermao_elocutio',   label: 'Linguagem' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 8. Comentário Exegético ──────────────────────────────────────────────

const COMENTARIO_EXEGETICO: StudyModeConfig = {
  id: 'comentario_exegetico',
  name: 'Comentário Exegético',
  tagline: 'Exegese versículo a versículo para publicação',
  color: '#F97316',
  audience: 'Seminaristas · Professores · Pesquisadores',
  titlePlaceholder: 'Ex: Comentário de Romanos 3.21-26',
  passageBased: true,
  passageLabel: 'Perícope',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar', 'comunicar'],
  defaultExpandedCanons: ['preparar_imersao', 'interpretar_inventio', 'comentario'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Introdução',
      description: 'Contexto do livro e da perícope',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Preparação', subtitle: 'Contexto e leitura',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_assimilacao', label: 'Leitura do Bloco' },
          { id: 'preparar_visao_geral', label: 'Estrutura da Perícope' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Analisar',
      description: 'Tradução, crítica textual e morfossintaxe',
      color: '#F97316', bgActive: 'rgba(249,115,22,0.08)',
      modes: [{
        id: 'interpretar_inventio', label: 'Análise', subtitle: 'Texto e exegese',
        color: '#F97316', bgActive: 'rgba(249,115,22,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'textual',   label: 'Texto e Tradução' },
          { id: 'contextual', label: 'Contexto' },
          { id: 'teologico',  label: 'Teologia' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Comentar',
      description: 'Comentário versículo a versículo e síntese',
      color: '#F97316', bgActive: 'rgba(249,115,22,0.08)',
      modes: [{
        id: 'comentario', label: 'Comentário', subtitle: 'Versículo a versículo',
        color: '#F97316', bgActive: 'rgba(249,115,22,0.08)',
        groups: [
          { id: 'pregar_visao_geral',  label: 'Visão Geral' },
          { id: 'comentario_expositivo',  label: 'Comentário Expositivo' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 9. Estudo de Salmos e Sabedoria ─────────────────────────────────────

const ESTUDO_DE_SALMOS_SABEDORIA: StudyModeConfig = {
  id: 'estudo_de_salmos_sabedoria',
  name: 'Salmos e Sabedoria',
  tagline: 'Poesia, lamentos e sabedoria das Escrituras',
  color: '#6D28D9',
  audience: 'Pastores · Professores · Estudantes',
  titlePlaceholder: 'Ex: Lamento e confiança em Deus — Salmo 22',
  passageBased: true,
  passageLabel: 'Salmo / Passagem',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar'],
  defaultExpandedCanons: ['preparar_imersao', 'ss_investigar_mode'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Oração, leitura lenta e imersão no poema',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Oração e leitura',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Paralelismo, estrutura, imagens e teologia da adoração',
      color: '#6D28D9', bgActive: 'rgba(109,40,217,0.08)',
      modes: [{
        id: 'ss_investigar_mode', label: 'O Poema', subtitle: 'Forma e conteúdo',
        color: '#6D28D9', bgActive: 'rgba(109,40,217,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'ss_paralelismo_grp',     label: 'Paralelismo Poético' },
          { id: 'ss_estrutura_grp',       label: 'Estrutura do Poema' },
          { id: 'ss_imagistica_grp',      label: 'Imagística e Metáforas' },
          { id: 'ss_temas_grp',           label: 'Temas e Questões' },
          { id: 'ss_teologia_grp',        label: 'Teologia da Adoração' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Comunicar',
      description: 'Proclamação e reflexão pastoral',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [
        {
          id: 'sermao', label: 'Sermão', subtitle: 'Proclamação pública',
          color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
          groups: [
            { id: 'pregar_visao_geral',  label: 'Visão Geral' },
            { id: 'sermao_dispositio',   label: 'Estrutura' },
            { id: 'sermao_elocutio',     label: 'Linguagem' },
            { id: 'sermao_memoria',      label: 'Internalização' },
            { id: 'sermao_pronuntiatio', label: 'Execução' },
          ],
        },
        {
          id: 'devocional', label: 'Devocional', subtitle: 'Reflexão e resposta',
          color: '#9A3412', bgActive: 'rgba(154,52,18,0.08)',
          groups: [
            { id: 'devocional_dispositio',   label: 'Reflexão' },
            { id: 'devocional_elocutio',     label: 'Resposta' },
            { id: 'devocional_pronuntiatio', label: 'Compromisso' },
          ],
        },
      ],
    },
    toolPhase(),
  ],
}

// ── 10. Narrativas Bíblicas ──────────────────────────────────────────────

const ESTUDO_NARRATIVAS: StudyModeConfig = {
  id: 'estudo_narrativas',
  name: 'Narrativas Bíblicas',
  tagline: 'A arte do narrador a serviço da teologia',
  color: '#92400E',
  audience: 'Pastores · Professores · Seminaristas',
  titlePlaceholder: 'Ex: José e seus irmãos — Gênesis 37–50',
  passageBased: true,
  passageLabel: 'Passagem / Narrativa',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar'],
  defaultExpandedCanons: ['preparar_imersao', 'nr_investigar_mode'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Oração e imersão na narrativa',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Oração e leitura',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Análise narratológica da perícope',
      color: '#92400E', bgActive: 'rgba(146,64,14,0.08)',
      modes: [{
        id: 'nr_investigar_mode', label: 'A Narrativa', subtitle: 'Análise narratológica',
        color: '#92400E', bgActive: 'rgba(146,64,14,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'nr_personagens_grp',     label: 'Personagens' },
          { id: 'nr_enredo_grp',          label: 'Enredo e Tensão' },
          { id: 'nr_cenario_grp',         label: 'Cenário e Tempo' },
          { id: 'nr_narrador_grp',        label: 'Narrador' },
          { id: 'nr_dialogo_grp',         label: 'Diálogo' },
          { id: 'nr_teologia_grp',        label: 'Teologia Narrativa' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Comunicar',
      description: 'Proclamação da narrativa bíblica',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [{
        id: 'sermao', label: 'Sermão', subtitle: 'Proclamação narrativa',
        color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'pregar_visao_geral',  label: 'Visão Geral' },
          { id: 'sermao_dispositio',   label: 'Estrutura' },
          { id: 'sermao_elocutio',     label: 'Linguagem' },
          { id: 'sermao_memoria',      label: 'Internalização' },
          { id: 'sermao_pronuntiatio', label: 'Execução' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 11. Estudo de Profecias ──────────────────────────────────────────────

const ESTUDO_DE_PROFECIAS: StudyModeConfig = {
  id: 'estudo_de_profecias',
  name: 'Profecias',
  tagline: 'A mensagem profética no contexto histórico e redentor',
  color: '#B45309',
  audience: 'Pastores · Seminaristas · Pesquisadores',
  titlePlaceholder: 'Ex: O servo sofredor — Isaías 52.13-53.12',
  passageBased: true,
  passageLabel: 'Passagem / Oráculo',
  topicLabel: 'Tema',
  defaultSection: 'preparar_visao_geral',
  defaultExpandedPhases: ['preparar', 'investigar'],
  defaultExpandedCanons: ['preparar_imersao', 'pf_investigar_mode'],
  defaultExpandedGroups: ['preparar_espiritual'],
  phases: [
    {
      id: 'preparar', roman: 'I', label: 'Preparar',
      description: 'Oração e imersão no oráculo profético',
      color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
      modes: [{
        id: 'preparar_imersao', label: 'Imersão', subtitle: 'Oração e leitura',
        color: '#D97706', bgActive: 'rgba(217,119,6,0.08)',
        groups: [
          { id: 'preparar_espiritual',  label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes',  label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'Contexto, oráculo, símbolos, cumprimento e alianças',
      color: '#B45309', bgActive: 'rgba(180,83,9,0.08)',
      modes: [{
        id: 'pf_investigar_mode', label: 'O Oráculo', subtitle: 'Análise profética',
        color: '#B45309', bgActive: 'rgba(180,83,9,0.08)',
        groups: [
          { id: 'investigar_visao_geral', label: 'Visão Geral' },
          { id: 'pf_contexto_grp',        label: 'Contexto Histórico' },
          { id: 'pf_oraculo_grp',         label: 'O Oráculo' },
          { id: 'pf_simbolos_grp',        label: 'Símbolos e Imagens' },
          { id: 'pf_cumprimento_grp',     label: 'Cumprimento Canônico' },
          { id: 'pf_escatologia_grp',     label: 'Escatologia e Alianças' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Comunicar',
      description: 'Proclamação da mensagem profética',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [{
        id: 'sermao', label: 'Sermão', subtitle: 'Proclamação pública',
        color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'pregar_visao_geral',  label: 'Visão Geral' },
          { id: 'sermao_dispositio',   label: 'Estrutura' },
          { id: 'sermao_elocutio',     label: 'Linguagem' },
          { id: 'sermao_memoria',      label: 'Internalização' },
          { id: 'sermao_pronuntiatio', label: 'Execução' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── Registry ──────────────────────────────────────────────────────────────

export const STUDY_MODE_REGISTRY: Record<StudyModeId, StudyModeConfig> = {
  exegese_biblica:             EXEGESE_BIBLICA,
  estudo_de_carta:             ESTUDO_DE_CARTA,
  estudo_de_salmos_sabedoria:  ESTUDO_DE_SALMOS_SABEDORIA,
  estudo_de_profecias:         ESTUDO_DE_PROFECIAS,
  estudo_narrativas:           ESTUDO_NARRATIVAS,
  estudo_doutrinario:          ESTUDO_DOUTRINARIO,
  estudo_tematico:             ESTUDO_TEMATICO,
  estudo_termos:               ESTUDO_TERMOS,
  sermao:                      SERMAO,
  estudo_biblico:              ESTUDO_BIBLICO,
  devocional:                  DEVOCIONAL,
  aula:                        AULA,
  artigo:                      ARTIGO,
  ebook:                       EBOOK,
  livro:                       LIVRO,
  palestra:                    PALESTRA,
  curso:                       CURSO,
  serie_mensagens:             SERIE_MENSAGENS,
  comentario_exegetico:        COMENTARIO_EXEGETICO,
}

// ── Helper ────────────────────────────────────────────────────────────────

export function getModeConfig(modeId?: string | null): StudyModeConfig {
  if (modeId && modeId in STUDY_MODE_REGISTRY) {
    return STUDY_MODE_REGISTRY[modeId as StudyModeId]
  }
  // Legacy: mapeia project_type antigos para o novo sistema
  const legacy: Record<string, StudyModeId> = {
    exegese:             'exegese_biblica',
    sermao:              'sermao',
    devocional:          'devocional',
    estudo_biblico:      'estudo_biblico',
    estudo_doutrinario:  'estudo_doutrinario',
    estudo_termos:       'estudo_termos',
    pesquisa_teologica:  'exegese_biblica', // fallback temporário
  }
  if (modeId && legacy[modeId]) {
    return STUDY_MODE_REGISTRY[legacy[modeId]]
  }
  return EXEGESE_BIBLICA
}
