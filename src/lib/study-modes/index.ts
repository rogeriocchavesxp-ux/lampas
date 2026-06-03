// ── Study Mode Registry ───────────────────────────────────────────────────
// Cada modo define completamente sua própria experiência no workspace.
// Adicionar um novo modo = criar um arquivo .mode.ts e registrá-lo aqui.
// O WorkspaceClient é um renderer genérico — nunca conhece o modo diretamente.

// ── Tipos ─────────────────────────────────────────────────────────────────

export type StudyModeId =
  | 'exegese_biblica'
  | 'estudo_de_carta'
  | 'estudo_doutrinario'
  | 'estudo_tematico'
  | 'sermao'
  | 'estudo_biblico'
  | 'devocional'
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
  passageBased: boolean       // false → entrada por tema/doutrina (sem livro/perícope)
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
        ...TOOL_AREAS.map(area => ({ id: area.slug, label: area.shortTitle })),
        { id: 'colagens', label: 'Colagens' },
      ],
    }],
  }
}

// ── 1. Exegese Bíblica ───────────────────────────────────────────────────

const EXEGESE_BIBLICA: StudyModeConfig = {
  id: 'exegese_biblica',
  name: 'Exegese Bíblica',
  tagline: 'O que o texto diz, quer dizer e significa',
  color: '#B8922A',
  passageBased: true,
  defaultSection: 'preparacao_espiritual',
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
      color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
      modes: [{
        id: 'interpretar_inventio', label: 'Exegese', subtitle: 'Descobrir o significado',
        color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
        groups: [
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
  passageBased: true,
  defaultSection: 'preparacao_espiritual',
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
      color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
      modes: [{
        id: 'interpretar_inventio', label: 'Exegese', subtitle: 'O que o texto diz',
        color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
        groups: [
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
  passageBased: true,
  defaultSection: 'preparacao_espiritual',
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
  passageBased: true,
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
          { id: 'eb_preparar', label: 'Preparação e Objetivos' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Compreender',
      description: 'Análise do texto para ensino',
      color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
      modes: [{
        id: 'eb_compreender_mode', label: 'O Texto', subtitle: 'Análise e estrutura',
        color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
        groups: [
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
  passageBased: false,
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
          { id: 'edt_definicao_grp',    label: 'Definição' },
          { id: 'edt_fundamentacao_grp', label: 'Fundamentação Bíblica' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Investigar',
      description: 'História, formulação e controvérsias',
      color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
      modes: [{
        id: 'edt_investigar_mode', label: 'Investigação', subtitle: 'História e sistema',
        color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
        groups: [
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
  passageBased: false,
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
          { id: 'et_definicao_grp', label: 'Definição do Tema' },
        ],
      }],
    },
    {
      id: 'investigar', roman: 'II', label: 'Rastrear',
      description: 'O tema ao longo do cânone — AT, NT e síntese',
      color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
      modes: [{
        id: 'et_canonico_mode', label: 'Cânone', subtitle: 'Desenvolvimento canônico',
        color: 'var(--accent)', bgActive: 'rgba(59,130,246,0.08)',
        groups: [
          { id: 'et_at_grp',      label: 'Antigo Testamento' },
          { id: 'et_nt_grp',      label: 'Novo Testamento' },
          { id: 'et_sintese_grp', label: 'Síntese Canônica' },
        ],
      }],
    },
    {
      id: 'comunicar', roman: 'III', label: 'Formular',
      description: 'Teologia sistemática e aplicações',
      color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
      modes: [{
        id: 'et_formular_mode', label: 'Formulação', subtitle: 'Sistema e prática',
        color: 'var(--ai)', bgActive: 'rgba(139,92,246,0.08)',
        groups: [
          { id: 'et_sistematica_grp', label: 'Teologia Sistemática' },
          { id: 'et_aplicacoes_grp',  label: 'Aplicações' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── 7. Estudo de Carta ──────────────────────────────────────────────────

const ESTUDO_DE_CARTA: StudyModeConfig = {
  id: 'estudo_de_carta',
  name: 'Estudo de Carta',
  tagline: 'A lógica da argumentação apostólica',
  color: '#6D28D9',
  passageBased: true,
  defaultSection: 'preparacao_espiritual',
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
  passageBased: true,
  defaultSection: 'preparacao_espiritual',
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
          { id: 'comentario_expositivo', label: 'Comentário Expositivo' },
        ],
      }],
    },
    toolPhase(),
  ],
}

// ── Registry ──────────────────────────────────────────────────────────────

export const STUDY_MODE_REGISTRY: Record<StudyModeId, StudyModeConfig> = {
  exegese_biblica:     EXEGESE_BIBLICA,
  estudo_de_carta:     ESTUDO_DE_CARTA,
  estudo_doutrinario:  ESTUDO_DOUTRINARIO,
  estudo_tematico:     ESTUDO_TEMATICO,
  sermao:              SERMAO,
  estudo_biblico:      ESTUDO_BIBLICO,
  devocional:          DEVOCIONAL,
  comentario_exegetico: COMENTARIO_EXEGETICO,
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
    pesquisa_teologica:  'exegese_biblica', // fallback temporário
  }
  if (modeId && legacy[modeId]) {
    return STUDY_MODE_REGISTRY[legacy[modeId]]
  }
  return EXEGESE_BIBLICA
}
