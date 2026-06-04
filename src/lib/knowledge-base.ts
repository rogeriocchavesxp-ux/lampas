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
      { key: 'author', label: 'Autor' },
      { key: 'publisher', label: 'Editora' },
      { key: 'year', label: 'Ano', type: 'number' },
      { key: 'isbn', label: 'ISBN' },
      { key: 'pages', label: 'Páginas', type: 'number' },
      { key: 'reading_status', label: 'Status de leitura' },
      { key: 'started_at', label: 'Data início', type: 'date' },
      { key: 'finished_at', label: 'Data término', type: 'date' },
    ],
    contentFields: [
      { key: 'general_summary', label: 'Resumo Geral', rows: 5 },
      { key: 'book_structure', label: 'Estrutura do Livro', rows: 5 },
      { key: 'chapter_notes', label: 'Capítulo por capítulo', rows: 6 },
      { key: 'big_ideas', label: 'Grandes Ideias', rows: 4 },
      { key: 'main_arguments', label: 'Argumentos Principais', rows: 4 },
      { key: 'important_quotes', label: 'Citações Importantes', rows: 5 },
      { key: 'agreements', label: 'Concordâncias', rows: 3 },
      { key: 'disagreements', label: 'Discordâncias', rows: 3 },
      { key: 'ministerial_applications', label: 'Aplicações Ministeriais', rows: 4 },
      { key: 'pastoral_applications', label: 'Aplicações Pastorais', rows: 4 },
      { key: 'personal_applications', label: 'Aplicações Pessoais', rows: 3 },
      { key: 'final_evaluation', label: 'Avaliação Final', rows: 4 },
    ],
    aiActions: [
      { label: 'Gerar Resumo', prompt: 'Gere um resumo geral desta obra, destacando tese, estrutura e contribuição teológica.' },
      { label: 'Gerar Fichamento', prompt: 'Transforme estas notas em um fichamento ministerial organizado.' },
      { label: 'Gerar Resenha', prompt: 'Escreva uma resenha crítica pastoral e acadêmica desta obra.' },
      { label: 'Extrair Argumentos', prompt: 'Extraia os argumentos principais, premissas e conclusão do autor.' },
      { label: 'Extrair Citações', prompt: 'Organize as citações importantes por tema, página e uso ministerial.' },
    ],
  },
  article: {
    id: 'article',
    label: 'Artigo',
    plural: 'Artigos',
    icon: '📝',
    color: '#2563EB',
    bg: '#EFF6FF',
    description: 'Teses, argumentos, evidências e crítica de artigos acadêmicos ou online.',
    metadataFields: [
      { key: 'author', label: 'Autor' },
      { key: 'site', label: 'Site' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'published_at', label: 'Data', type: 'date' },
    ],
    contentFields: [
      { key: 'main_thesis', label: 'Tese Principal', rows: 3 },
      { key: 'arguments', label: 'Argumentos', rows: 5 },
      { key: 'evidence', label: 'Evidências', rows: 4 },
      { key: 'quotes', label: 'Citações', rows: 4 },
      { key: 'applications', label: 'Aplicações', rows: 4 },
      { key: 'critique', label: 'Crítica', rows: 4 },
      { key: 'relations', label: 'Relações', rows: 3 },
    ],
    aiActions: [
      { label: 'Resumir Artigo', prompt: 'Resuma este artigo em tese, argumentos, evidências e conclusão.' },
      { label: 'Extrair Crítica', prompt: 'Avalie criticamente o artigo com critérios bíblicos, acadêmicos e pastorais.' },
      { label: 'Gerar Aplicações', prompt: 'Extraia aplicações ministeriais e pastorais a partir deste artigo.' },
    ],
  },
  podcast: {
    id: 'podcast',
    label: 'Podcast',
    plural: 'Podcasts',
    icon: '🎙',
    color: '#7C3AED',
    bg: '#F5F3FF',
    description: 'Episódios, timestamps, ideias principais, livros e pessoas citadas.',
    metadataFields: [
      { key: 'channel', label: 'Canal' },
      { key: 'participants', label: 'Participantes' },
      { key: 'published_at', label: 'Data', type: 'date' },
      { key: 'duration', label: 'Duração' },
      { key: 'link', label: 'Link', type: 'url' },
      { key: 'topic', label: 'Tema' },
    ],
    contentFields: [
      { key: 'summary', label: 'Resumo', rows: 5 },
      { key: 'timestamps', label: 'Timestamps', rows: 5 },
      { key: 'main_ideas', label: 'Ideias Principais', rows: 5 },
      { key: 'quotes', label: 'Citações', rows: 4 },
      { key: 'applications', label: 'Aplicações', rows: 4 },
      { key: 'cited_books', label: 'Livros citados', rows: 3 },
      { key: 'cited_people', label: 'Pessoas citadas', rows: 3 },
      { key: 'biblical_texts', label: 'Textos bíblicos citados', rows: 3 },
    ],
    aiActions: [
      { label: 'Resumir Episódio', prompt: 'Resuma este episódio com tese, tópicos e progressão da conversa.' },
      { label: 'Extrair Ideias', prompt: 'Extraia ideias principais, pessoas, livros e textos bíblicos citados.' },
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
      { key: 'event', label: 'Evento' },
      { key: 'speaker', label: 'Palestrante' },
      { key: 'date', label: 'Data', type: 'date' },
      { key: 'city', label: 'Cidade' },
      { key: 'duration', label: 'Duração' },
    ],
    contentFields: [
      { key: 'summary', label: 'Resumo', rows: 5 },
      { key: 'outline', label: 'Esboço da palestra', rows: 5 },
      { key: 'memorable_phrases', label: 'Frases marcantes', rows: 4 },
      { key: 'arguments', label: 'Argumentos', rows: 4 },
      { key: 'applications', label: 'Aplicações', rows: 4 },
      { key: 'questions', label: 'Perguntas geradas', rows: 3 },
      { key: 'next_steps', label: 'Próximos passos', rows: 3 },
    ],
    aiActions: [
      { label: 'Gerar Esboço', prompt: 'Organize esta palestra em um esboço claro com divisões principais.' },
      { label: 'Extrair Frases', prompt: 'Extraia frases marcantes e explique como podem ser reutilizadas.' },
      { label: 'Resumo Executivo', prompt: 'Crie um resumo executivo ministerial desta palestra.' },
    ],
  },
  course: {
    id: 'course',
    label: 'Curso',
    plural: 'Cursos',
    icon: '🎓',
    color: '#0F766E',
    bg: '#F0FDFA',
    description: 'Aulas, objetivos, aprendizados, exercícios e aplicações.',
    metadataFields: [
      { key: 'teacher', label: 'Professor' },
      { key: 'institution', label: 'Instituição' },
      { key: 'workload', label: 'Carga horária' },
      { key: 'date', label: 'Data', type: 'date' },
    ],
    contentFields: [
      { key: 'overview', label: 'Visão Geral', rows: 4 },
      { key: 'objectives', label: 'Objetivos', rows: 3 },
      { key: 'classes', label: 'Aulas', rows: 8 },
      { key: 'main_learnings', label: 'Principais Aprendizados', rows: 5 },
      { key: 'exercises', label: 'Exercícios', rows: 4 },
      { key: 'applications', label: 'Aplicações', rows: 4 },
    ],
    aiActions: [
      { label: 'Consolidar Aulas', prompt: 'Consolide as aulas em uma síntese progressiva e coerente.' },
      { label: 'Criar Revisão', prompt: 'Crie uma revisão do curso com tópicos, perguntas e respostas.' },
      { label: 'Criar Mapa Mental', prompt: 'Organize este curso como mapa mental textual hierárquico.' },
    ],
  },
  site: {
    id: 'site',
    label: 'Site',
    plural: 'Sites',
    icon: '🌐',
    color: '#0369A1',
    bg: '#EFF6FF',
    description: 'Sites úteis, confiabilidade, conteúdos relevantes e uso ministerial.',
    metadataFields: [
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'reliability', label: 'Confiabilidade' },
    ],
    contentFields: [
      { key: 'description', label: 'Descrição', rows: 4 },
      { key: 'relevant_content', label: 'Conteúdos relevantes', rows: 5 },
      { key: 'ministerial_use', label: 'Utilidade ministerial', rows: 4 },
      { key: 'evaluation', label: 'Avaliação', rows: 4 },
    ],
    aiActions: [
      { label: 'Avaliar Site', prompt: 'Avalie a utilidade, riscos e confiabilidade deste site para pesquisa teológica.' },
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
    description: 'Vídeos, canais, timestamps, ideias, citações e aplicações.',
    metadataFields: [
      { key: 'channel', label: 'Canal' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'duration', label: 'Duração' },
      { key: 'date', label: 'Data', type: 'date' },
    ],
    contentFields: [
      { key: 'summary', label: 'Resumo', rows: 5 },
      { key: 'timestamps', label: 'Timestamps', rows: 5 },
      { key: 'ideas', label: 'Ideias', rows: 5 },
      { key: 'applications', label: 'Aplicações', rows: 4 },
      { key: 'quotes', label: 'Citações', rows: 4 },
    ],
    aiActions: [
      { label: 'Resumir Vídeo', prompt: 'Resuma o vídeo em blocos, ideias principais e aplicações.' },
      { label: 'Extrair Timestamps', prompt: 'Organize timestamps temáticos a partir das notas do vídeo.' },
    ],
  },
  personal_document: {
    id: 'personal_document',
    label: 'Documento',
    plural: 'Documentos',
    icon: '📄',
    color: '#475569',
    bg: '#F8FAFC',
    description: 'Documento pessoal livre para ideias, notas, planos e memórias ministeriais.',
    metadataFields: [
      { key: 'category', label: 'Categoria' },
    ],
    contentFields: [
      { key: 'body', label: 'Editor livre', rows: 14 },
    ],
    aiActions: [
      { label: 'Organizar Documento', prompt: 'Organize este documento em estrutura clara, mantendo o sentido original.' },
      { label: 'Extrair Relações', prompt: 'Extraia temas, doutrinas, textos bíblicos e possíveis relações internas.' },
    ],
  },
}

export const KNOWLEDGE_STATUSES: Record<KnowledgeStatus, { label: string; color: string; bg: string }> = {
  captured: { label: 'Capturado', color: '#64748B', bg: '#F1F5F9' },
  processing: { label: 'Processando', color: '#D97706', bg: '#FFFBEB' },
  processed: { label: 'Processado', color: '#2563EB', bg: '#EFF6FF' },
  reviewed: { label: 'Revisado', color: '#059669', bg: '#F0FDF4' },
  archived: { label: 'Arquivado', color: '#94A3B8', bg: '#F8FAFC' },
}
