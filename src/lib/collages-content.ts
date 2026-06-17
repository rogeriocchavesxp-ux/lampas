export type CollageType = 'citacao' | 'trecho' | 'resumo' | 'resenha' | 'insight'
export type CollageViewMode = 'lista' | 'cards' | 'canvas'

export interface CollageItem {
  id: string
  type: CollageType
  title: string
  content: string
  author: string
  work: string
  page: string
  tags: string[]
  category: string
  linkedTo: string
  x: number
  y: number
}

export interface CollageDraft {
  type: CollageType
  title: string
  content: string
  author: string
  work: string
  page: string
  tags: string
  category: string
  linkedTo: string
}

export const COLLAGE_TYPES: { id: CollageType; label: string; description: string }[] = [
  { id: 'citacao', label: 'Citação', description: 'Autor, obra, página e trecho textual relevante.' },
  { id: 'trecho', label: 'Trecho', description: 'Recorte de livro, comentário, artigo ou aula.' },
  { id: 'resumo', label: 'Resumo', description: 'Síntese de capítulo, artigo, sermão ou comentário.' },
  { id: 'resenha', label: 'Resenha', description: 'Avaliação crítica de uma obra e sua contribuição.' },
  { id: 'insight', label: 'Insight', description: 'Ideia exegética, canônica, homilética ou pastoral.' },
]

export const COLLAGE_CATEGORIES = [
  'Exegese',
  'Teologia Bíblica',
  'Teologia Sistemática',
  'Homilética',
  'Aplicação',
  'Ilustração',
  'Pastoral',
]

export const COLLAGE_LINK_TARGETS = [
  'Perícope',
  'Texto Original',
  'Estudo Contextual',
  'Estudo Textual',
  'Estudo Teológico',
  'Sermão',
  'Estudo Bíblico',
  'Devocional',
  'Aplicação Pastoral',
]

export const COLLAGE_AI_ACTIONS = [
  {
    label: 'Resumir material',
    prompt: 'Resuma o material selecionado em formato acadêmico, destacando tese, argumentos, contribuição para a passagem atual e possíveis usos na pregação.',
  },
  {
    label: 'Gerar resenha',
    prompt: 'Transforme este material em uma resenha crítica com síntese, pontos fortes, pontos fracos, contribuição teológica, aplicação pastoral e avaliação final.',
  },
  {
    label: 'Sugerir conexões',
    prompt: 'Sugira conexões entre as colagens deste projeto: temas semelhantes, autores relacionados, textos paralelos, ecos canônicos e implicações homiléticas.',
  },
  {
    label: 'Organizar automaticamente',
    prompt: 'Organize estas colagens sugerindo tags, categorias, agrupamentos, coleções e vínculos com etapas da exegese ou comunicação ministerial.',
  },
]

export function emptyCollageDraft(projectRef: string): CollageDraft {
  return {
    type: 'insight',
    title: '',
    content: '',
    author: '',
    work: '',
    page: '',
    tags: '',
    category: 'Exegese',
    linkedTo: projectRef,
  }
}

export function parseTags(value: string): string[] {
  return value
    .split(',')
    .map(tag => tag.trim().replace(/^#/, ''))
    .filter(Boolean)
}

// ── Recortes ──────────────────────────────────────────────────────────────────

export const RECORTE_CATEGORIAS = [
  'Citação', 'Comentário', 'Estrutura', 'Ilustração', 'Aplicação',
  'Definição', 'Contexto Histórico', 'Contexto Cultural',
  'Teologia Bíblica', 'Teologia Sistemática', 'Referência Cruzada',
  'Observação Pessoal', 'Outro',
] as const

export type RecorteCategoria = typeof RECORTE_CATEGORIAS[number]

export interface RecorteItem {
  id: string
  title: string
  fonte: string
  categoria: RecorteCategoria
  conteudo: string
  createdAt: number
}

const CAT_MAP: Record<string, RecorteCategoria> = {
  'Teologia Bíblica':    'Teologia Bíblica',
  'Teologia Sistemática':'Teologia Sistemática',
  'Aplicação':           'Aplicação',
  'Ilustração':          'Ilustração',
  'Citação':             'Citação',
  'Comentário':          'Comentário',
  'Definição':           'Definição',
  'Estrutura':           'Estrutura',
}

export function migrateCollageItems(items: CollageItem[]): RecorteItem[] {
  return items.map((item, i) => ({
    id: item.id,
    title: item.title,
    fonte: [item.author, item.work, item.page && `p. ${item.page}`].filter(Boolean).join(', '),
    categoria: CAT_MAP[item.category] ?? 'Outro',
    conteudo: item.content,
    createdAt: Date.now() - i * 1000,
  }))
}
