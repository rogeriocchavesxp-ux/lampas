export type KnowledgeItemType =
  | 'book'
  | 'article'
  | 'podcast'
  | 'lecture'
  | 'course'
  | 'site'
  | 'video'
  | 'personal_document'

export type KnowledgeStatus = 'captured' | 'processing' | 'processed' | 'reviewed' | 'archived'

// Tipos que podem conter conteúdos internos (filhos)
export const CONTAINER_TYPES = new Set<KnowledgeItemType>(['book', 'course', 'podcast', 'lecture'])

// Rótulos do conteúdo interno por tipo de contêiner
export const CHILD_CONTENT: Record<string, { singular: string; plural: string; icon: string }> = {
  book:    { singular: 'Capítulo',  plural: 'Capítulos',  icon: '📄' },
  course:  { singular: 'Aula',      plural: 'Aulas',      icon: '🎓' },
  podcast: { singular: 'Episódio',  plural: 'Episódios',  icon: '🎙' },
  lecture: { singular: 'Palestra',  plural: 'Palestras',  icon: '🎤' },
}

export interface KnowledgeTypeConfig {
  id: KnowledgeItemType
  label: string
  plural: string
  icon: string
  color: string
  bg: string
  description: string
  metadataFields: Array<{ key: string; label: string; type?: 'text' | 'number' | 'date' | 'url' }>
  contentFields: Array<{ key: string; label: string; rows?: number }>
  aiActions: Array<{ label: string; prompt: string }>
}

export const KNOWLEDGE_TYPES: Record<KnowledgeItemType, KnowledgeTypeConfig> = {
  book: {
    id: 'book',
    label: 'Livro',
    plural: 'Livros',
    icon: '📚',
    color: '#B45309',
    bg: '#FEF3C7',
    description: 'Fichamentos, resenhas, citações e aplicações ministeriais de obras lidas.',
    metadataFields: [
      { key: 'author',    label: 'Autor' },
      { key: 'publisher', label: 'Editora' },
      { key: 'year',      label: 'Ano',              type: 'number' },
      { key: 'edition',   label: 'Edição' },
      { key: 'pages',     label: 'Número de páginas', type: 'number' },
      { key: 'isbn',      label: 'ISBN' },
    ],
    contentFields: [
      { key: 'general_summary',    label: 'Resumo',                   rows: 5 },
      { key: 'resenha',            label: 'Resenha',                   rows: 5 },
      { key: 'fichamento',         label: 'Fichamento',                rows: 6 },
      { key: 'main_arguments',     label: 'Argumentos principais',     rows: 4 },
      { key: 'important_quotes',   label: 'Citações relevantes',       rows: 5 },
      { key: 'applications',       label: 'Aplicações',                rows: 4 },
      { key: 'doctrines_present',  label: 'Doutrinas presentes',       rows: 3 },
      { key: 'biblical_texts_used', label: 'Textos bíblicos utilizados', rows: 3 },
    ],
    aiActions: [
      { label: 'Gerar Resumo',      prompt: 'Gere um resumo geral desta obra, destacando tese, estrutura e contribuição teológica.' },
      { label: 'Gerar Fichamento',  prompt: 'Transforme estas notas em um fichamento ministerial organizado.' },
      { label: 'Gerar Resenha',     prompt: 'Escreva uma resenha crítica pastoral e acadêmica desta obra.' },
      { label: 'Extrair Argumentos', prompt: 'Extraia os argumentos principais, premissas e conclusão do autor.' },
      { label: 'Extrair Citações',  prompt: 'Organize as citações importantes por tema, página e uso ministerial.' },
    ],
  },
  article: {
    id: 'article',
    label: 'Artigo',
    plural: 'Artigos',
    icon: '📝',
    color: '#163A6B',
    bg: '#EEF3FA',
    description: 'Teses, argumentos, evidências e crítica de artigos acadêmicos ou online.',
    metadataFields: [
      { key: 'author',       label: 'Autor' },
      { key: 'site',         label: 'Site' },
      { key: 'published_at', label: 'Data de publicação', type: 'date' },
    ],
    contentFields: [
      { key: 'main_thesis',  label: 'Tese principal',  rows: 3 },
      { key: 'arguments',    label: 'Argumentos',       rows: 5 },
      { key: 'quotes',       label: 'Citações',         rows: 4 },
      { key: 'applications', label: 'Aplicações',       rows: 4 },
      { key: 'critique',     label: 'Crítica',          rows: 4 },
    ],
    aiActions: [
      { label: 'Resumir Artigo',    prompt: 'Resuma este artigo em tese, argumentos, evidências e conclusão.' },
      { label: 'Extrair Crítica',   prompt: 'Avalie criticamente o artigo com critérios bíblicos, acadêmicos e pastorais.' },
      { label: 'Gerar Aplicações',  prompt: 'Extraia aplicações ministeriais e pastorais a partir deste artigo.' },
    ],
  },
  podcast: {
    id: 'podcast',
    label: 'Podcast',
    plural: 'Podcasts',
    icon: '🎙',
    color: '#7C3AED',
    bg: '#F5F3FF',
    description: 'Episódios, ideias principais, frases marcantes e aplicações.',
    metadataFields: [
      { key: 'podcast_name', label: 'Podcast' },
      { key: 'episode',      label: 'Episódio' },
      { key: 'presenter',    label: 'Apresentador' },
      { key: 'guest',        label: 'Convidado' },
      { key: 'published_at', label: 'Data',    type: 'date' },
      { key: 'duration',     label: 'Duração' },
    ],
    contentFields: [
      { key: 'summary',            label: 'Resumo',           rows: 5 },
      { key: 'main_ideas',         label: 'Principais ideias', rows: 5 },
      { key: 'memorable_phrases',  label: 'Frases marcantes', rows: 4 },
      { key: 'applications',       label: 'Aplicações',       rows: 4 },
      { key: 'questions',          label: 'Perguntas geradas', rows: 3 },
    ],
    aiActions: [
      { label: 'Resumir Episódio',   prompt: 'Resuma este episódio com tese, tópicos e progressão da conversa.' },
      { label: 'Extrair Ideias',     prompt: 'Extraia ideias principais, pessoas, livros e textos bíblicos citados.' },
      { label: 'Extrair Aplicações', prompt: 'Liste aplicações pastorais e ministeriais do episódio.' },
    ],
  },
  lecture: {
    id: 'lecture',
    label: 'Palestra',
    plural: 'Palestras',
    icon: '🎤',
    color: '#BE3455',
    bg: '#FFF1F2',
    description: 'Palestras, conferências, esboços, frases marcantes e próximos passos.',
    metadataFields: [
      { key: 'event',        label: 'Nome do evento' },
      { key: 'speaker',      label: 'Palestrante' },
      { key: 'date',         label: 'Data',                    type: 'date' },
      { key: 'city',         label: 'Cidade' },
      { key: 'venue',        label: 'Local' },
      { key: 'organization', label: 'Organização responsável' },
      { key: 'duration',     label: 'Duração' },
    ],
    contentFields: [
      { key: 'summary',           label: 'Resumo expandido',    rows: 5 },
      { key: 'outline',           label: 'Esboço da palestra',  rows: 5 },
      { key: 'memorable_phrases', label: 'Frases marcantes',    rows: 4 },
      { key: 'arguments',         label: 'Argumentos principais', rows: 4 },
      { key: 'applications',      label: 'Aplicações',          rows: 4 },
      { key: 'questions',         label: 'Perguntas geradas',   rows: 3 },
      { key: 'next_steps',        label: 'Próximos passos',     rows: 3 },
    ],
    aiActions: [
      { label: 'Gerar Esboço',      prompt: 'Organize esta palestra em um esboço claro com divisões principais.' },
      { label: 'Extrair Frases',    prompt: 'Extraia frases marcantes e explique como podem ser reutilizadas.' },
      { label: 'Resumo Executivo',  prompt: 'Crie um resumo executivo ministerial desta palestra.' },
    ],
  },
  course: {
    id: 'course',
    label: 'Curso',
    plural: 'Cursos',
    icon: '🎓',
    color: '#0F766E',
    bg: '#F0FDFA',
    description: 'Aulas, aprendizados, exercícios, aplicações e próximos passos.',
    metadataFields: [
      { key: 'institution', label: 'Instituição' },
      { key: 'teacher',     label: 'Professor' },
      { key: 'workload',    label: 'Carga horária' },
      { key: 'module',      label: 'Módulo' },
      { key: 'class',       label: 'Aula' },
    ],
    contentFields: [
      { key: 'overview',        label: 'Resumo',          rows: 4 },
      { key: 'main_learnings',  label: 'Aprendizados',    rows: 5 },
      { key: 'exercises',       label: 'Exercícios',      rows: 4 },
      { key: 'applications',    label: 'Aplicações',      rows: 4 },
      { key: 'next_steps',      label: 'Próximos passos', rows: 3 },
    ],
    aiActions: [
      { label: 'Consolidar Aulas', prompt: 'Consolide as aulas em uma síntese progressiva e coerente.' },
      { label: 'Criar Revisão',    prompt: 'Crie uma revisão do curso com tópicos, perguntas e respostas.' },
      { label: 'Criar Mapa Mental', prompt: 'Organize este curso como mapa mental textual hierárquico.' },
    ],
  },
  site: {
    id: 'site',
    label: 'Site',
    plural: 'Sites',
    icon: '🌐',
    color: '#0369A1',
    bg: '#EEF3FA',
    description: 'Sites úteis, ideias principais, argumentos e aplicações ministeriais.',
    metadataFields: [
      { key: 'site_name',    label: 'Site' },
      { key: 'author',       label: 'Autor' },
      { key: 'published_at', label: 'Data de publicação', type: 'date' },
      { key: 'url',          label: 'URL',                type: 'url' },
    ],
    contentFields: [
      { key: 'summary',      label: 'Resumo',          rows: 4 },
      { key: 'main_ideas',   label: 'Ideias principais', rows: 5 },
      { key: 'arguments',    label: 'Argumentos',      rows: 4 },
      { key: 'applications', label: 'Aplicações',      rows: 4 },
    ],
    aiActions: [
      { label: 'Avaliar Site',   prompt: 'Avalie a utilidade, riscos e confiabilidade deste site para pesquisa teológica.' },
      { label: 'Organizar Usos', prompt: 'Liste formas práticas de usar este site no ministério e estudo bíblico.' },
    ],
  },
  video: {
    id: 'video',
    label: 'Vídeo',
    plural: 'Vídeos',
    icon: '🎥',
    color: '#DC2626',
    bg: '#FEF2F2',
    description: 'Vídeos, argumentos, aplicações e frases marcantes.',
    metadataFields: [
      { key: 'channel',   label: 'Canal' },
      { key: 'presenter', label: 'Apresentador' },
      { key: 'platform',  label: 'Plataforma' },
      { key: 'date',      label: 'Data',    type: 'date' },
      { key: 'duration',  label: 'Duração' },
    ],
    contentFields: [
      { key: 'summary',           label: 'Resumo',          rows: 5 },
      { key: 'arguments',         label: 'Argumentos',      rows: 4 },
      { key: 'applications',      label: 'Aplicações',      rows: 4 },
      { key: 'memorable_phrases', label: 'Frases marcantes', rows: 4 },
    ],
    aiActions: [
      { label: 'Resumir Vídeo',       prompt: 'Resuma o vídeo em blocos, ideias principais e aplicações.' },
      { label: 'Extrair Timestamps',  prompt: 'Organize timestamps temáticos a partir das notas do vídeo.' },
    ],
  },
  personal_document: {
    id: 'personal_document',
    label: 'Documento',
    plural: 'Documentos',
    icon: '📄',
    color: '#475569',
    bg: '#F8FAFC',
    description: 'Documentos, relatórios, notas e registros ministeriais.',
    metadataFields: [
      { key: 'author',       label: 'Autor' },
      { key: 'organization', label: 'Organização' },
      { key: 'date',         label: 'Data',             type: 'date' },
      { key: 'doc_type',     label: 'Tipo do documento' },
    ],
    contentFields: [
      { key: 'summary',      label: 'Resumo',           rows: 4 },
      { key: 'main_points',  label: 'Principais pontos', rows: 5 },
      { key: 'arguments',    label: 'Argumentos',        rows: 4 },
      { key: 'applications', label: 'Aplicações',        rows: 4 },
    ],
    aiActions: [
      { label: 'Organizar Documento', prompt: 'Organize este documento em estrutura clara, mantendo o sentido original.' },
      { label: 'Extrair Relações',    prompt: 'Extraia temas, doutrinas, textos bíblicos e possíveis relações internas.' },
    ],
  },
}

export const KNOWLEDGE_STATUSES: Record<KnowledgeStatus, { label: string; color: string; bg: string }> = {
  captured: { label: 'Capturado', color: '#64748B', bg: '#F1F5F9' },
  processing: { label: 'Processando', color: '#D97706', bg: '#FFFBEB' },
  processed: { label: 'Processado', color: '#163A6B', bg: '#EEF3FA' },
  reviewed: { label: 'Revisado', color: '#059669', bg: '#F0FDF4' },
  archived: { label: 'Arquivado', color: '#94A3B8', bg: '#F8FAFC' },
}
