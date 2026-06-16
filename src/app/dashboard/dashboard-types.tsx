import { isValidElement, cloneElement } from 'react'
import { STUDY_MODE_REGISTRY, getModeConfig, type StudyModeId, type StudyModeConfig } from '@/lib/study-modes'
import type { Project } from '@/types/database'

export const LEGACY_TYPE: Record<StudyModeId, string> = {
  exegese_biblica:             'exegese',
  estudo_de_carta:             'exegese',
  estudo_de_salmos_sabedoria:  'estudo_biblico',
  estudo_de_profecias:         'estudo_biblico',
  estudo_narrativas:           'exegese',
  estudo_doutrinario:          'estudo_doutrinario',
  estudo_tematico:             'estudo_doutrinario',
  estudo_termos:               'pesquisa_teologica',
  sermao:                      'sermao',
  estudo_biblico:              'estudo_biblico',
  devocional:                  'devocional',
  aula:                        'estudo_biblico',
  artigo:                      'pesquisa_teologica',
  ebook:                       'pesquisa_teologica',
  livro:                       'pesquisa_teologica',
  palestra:                    'pesquisa_teologica',
  curso:                       'estudo_biblico',
  serie_mensagens:             'sermao',
  comentario_exegetico:        'exegese',
}

export const BOOKS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
  'Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis',
  '1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó',
  'Salmos','Provérbios','Eclesiastes','Cântico dos Cânticos',
  'Isaías','Jeremias','Lamentações','Ezequiel','Daniel',
  'Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias',
]

export const BOOKS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos',
  '1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus',
  'Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João',
  'Judas','Apocalipse',
]

export const MODE_ICONS: Record<StudyModeId, React.ReactNode> = {
  estudo_de_salmos_sabedoria: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  estudo_de_profecias: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M12 12v10"/>
    </svg>
  ),
  estudo_narrativas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  ),
  exegese_biblica: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
  ),
  estudo_de_carta: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  ),
  estudo_doutrinario: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  estudo_tematico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
    </svg>
  ),
  estudo_termos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5V5a2 2 0 0 1 2-2h12"/>
      <path d="M6 21h12a2 2 0 0 0 2-2V7H8a2 2 0 0 0-2 2v12z"/>
      <path d="M10 12h6M10 16h4"/>
    </svg>
  ),
  sermao: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <path d="M12 19v4M8 23h8"/>
    </svg>
  ),
  estudo_biblico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  devocional: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  aula: '🏫',
  artigo: '📝',
  ebook: '📙',
  livro: '📕',
  palestra: '🎤',
  curso: '🎓',
  serie_mensagens: '🧩',
  comentario_exegetico: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
    </svg>
  ),
}

export const MODE_VISUALS: Record<StudyModeId, { color: string; bg: string; border: string }> = {
  devocional:                  { color: '#BE3455', bg: 'rgba(190,52,85,0.08)',  border: 'rgba(190,52,85,0.18)' },
  sermao:                      { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  estudo_biblico:               { color: '#163A6B', bg: 'rgba(30,77,140,0.08)',  border: 'rgba(30,77,140,0.18)' },
  estudo_de_salmos_sabedoria:  { color: '#6D28D9', bg: 'rgba(109,40,217,0.08)', border: 'rgba(109,40,217,0.18)' },
  estudo_de_profecias:         { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.18)' },
  estudo_narrativas:           { color: '#92400E', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.18)' },
  estudo_doutrinario:          { color: '#4F46E5', bg: 'rgba(79,70,229,0.08)',  border: 'rgba(79,70,229,0.18)' },
  estudo_tematico:             { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  estudo_termos:               { color: '#0D9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)' },
  exegese_biblica:             { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  estudo_de_carta:             { color: '#475569', bg: 'rgba(71,85,105,0.08)',  border: 'rgba(71,85,105,0.18)' },
  aula:                        { color: '#163A6B', bg: 'rgba(30,77,140,0.08)',  border: 'rgba(30,77,140,0.18)' },
  artigo:                      { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.18)' },
  ebook:                       { color: '#0F766E', bg: 'rgba(15,118,110,0.08)', border: 'rgba(15,118,110,0.18)' },
  livro:                       { color: '#92400E', bg: 'rgba(146,64,14,0.08)',  border: 'rgba(146,64,14,0.18)' },
  palestra:                    { color: '#DB2777', bg: 'rgba(219,39,119,0.08)', border: 'rgba(219,39,119,0.18)' },
  curso:                       { color: '#0E7490', bg: 'rgba(14,116,144,0.08)', border: 'rgba(14,116,144,0.18)' },
  serie_mensagens:             { color: '#7C2D12', bg: 'rgba(124,45,18,0.08)',  border: 'rgba(124,45,18,0.18)' },
  comentario_exegetico:        { color: '#B45309', bg: 'rgba(180,83,9,0.08)',   border: 'rgba(180,83,9,0.18)' },
}

// Ordem da biblioteca (inclui estudo_biblico no final para backward compat)
export const SECTION_ORDER: StudyModeId[] = [
  'devocional',
  'sermao',
  'estudo_de_salmos_sabedoria',
  'estudo_de_profecias',
  'estudo_narrativas',
  'estudo_doutrinario',
  'estudo_tematico',
  'estudo_termos',
  'exegese_biblica',
  'estudo_de_carta',
  'comentario_exegetico',
  'aula',
  'artigo',
  'ebook',
  'livro',
  'palestra',
  'curso',
  'serie_mensagens',
  'estudo_biblico',  // legado — mantido para projetos existentes
]

export const GENRE_LABEL: Partial<Record<StudyModeId, string>> = {
  sermao: 'Sermão', exegese_biblica: 'Exegese',
  estudo_de_carta: 'Cartas', estudo_de_salmos_sabedoria: 'Salmos e Sabedoria',
  estudo_narrativas: 'Narrativas', estudo_de_profecias: 'Profecias',
  estudo_doutrinario: 'Doutrina', estudo_tematico: 'Temático',
  estudo_termos: 'Estudo de Termos',
  devocional: 'Devocional', comentario_exegetico: 'Comentário', estudo_biblico: 'Est. Bíblico',
  aula: 'Aula', artigo: 'Artigo', ebook: 'E-book', livro: 'Livro',
  palestra: 'Palestra', curso: 'Curso', serie_mensagens: 'Série',
}

// ── Fluxo da tela de criação ──────────────────────────────────────────────

export type CreationGroupId = 'estudar' | 'produzir' | 'armazenar'
export type UiModeId =
  | 'exegetico' | 'tematico' | 'doutrinario' | 'termos'
  | 'sermao' | 'devocional' | 'aula' | 'estudo_biblico' | 'artigo' | 'ebook' | 'livro' | 'palestra' | 'curso' | 'serie_mensagens'
  | 'conhecimento'

export const UI_MODES: Array<{
  id: UiModeId; group: CreationGroupId; emoji: string; label: string
  tagline: string; description: string; color: string
}> = [
  { id: 'exegetico', group: 'estudar', emoji: '📖', label: 'Exegético', color: '#0F766E',
    tagline: 'O que o texto diz, quer dizer e significa',
    description: 'Análise profunda do texto bíblico em seu contexto histórico, literário e teológico.' },
  { id: 'tematico', group: 'estudar', emoji: '🧭', label: 'Temático', color: '#0F766E',
    tagline: 'Do tema ao cânone',
    description: 'Rastreie um tema através de toda a Escritura, identificando padrões, desenvolvimento progressivo e aplicações.' },
  { id: 'doutrinario', group: 'estudar', emoji: '📚', label: 'Doutrinário', color: '#1E40AF',
    tagline: 'Da doutrina à compreensão',
    description: 'Investigue sistematicamente uma doutrina bíblica específica.' },
  { id: 'termos', group: 'estudar', emoji: '🔤', label: 'Estudo de Termos', color: '#0D9488',
    tagline: 'Palavras bíblicas em profundidade',
    description: 'Investigue palavras bíblicas e teológicas em seu uso lexical, contexto original, desenvolvimento canônico e implicações doutrinárias.' },
  { id: 'sermao', group: 'produzir', emoji: '🎙', label: 'Sermão', color: '#7C3AED',
    tagline: 'Do texto ao púlpito',
    description: 'Da exegese ao púlpito.' },
  { id: 'devocional', group: 'produzir', emoji: '❤️', label: 'Devocional', color: '#BE3455',
    tagline: 'Do texto ao coração',
    description: 'Aplicação pastoral para edificação pessoal e familiar.' },
  { id: 'aula', group: 'produzir', emoji: '🏫', label: 'Aula', color: '#163A6B',
    tagline: 'Ensino estruturado',
    description: 'Conteúdo estruturado para ensino em classes, seminários e cursos.' },
  { id: 'estudo_biblico', group: 'produzir', emoji: '📘', label: 'Estudo Bíblico', color: '#163A6B',
    tagline: 'Formação cristã',
    description: 'Material para grupos, discipulado e formação cristã.' },
  { id: 'artigo', group: 'produzir', emoji: '📝', label: 'Artigo', color: '#475569',
    tagline: 'Escrita pastoral',
    description: 'Produção teológica ou pastoral em formato de artigo.' },
  { id: 'ebook', group: 'produzir', emoji: '📙', label: 'E-book', color: '#B45309',
    tagline: 'Publicação digital',
    description: 'Organização de conteúdo para publicação digital.' },
  { id: 'livro', group: 'produzir', emoji: '📕', label: 'Livro', color: '#92400E',
    tagline: 'Obra extensa',
    description: 'Projeto de escrita e organização de obras extensas.' },
  { id: 'palestra', group: 'produzir', emoji: '🎤', label: 'Palestra', color: '#7C3AED',
    tagline: 'Evento e conferência',
    description: 'Conteúdo para conferências, congressos e eventos.' },
  { id: 'curso', group: 'produzir', emoji: '🎓', label: 'Curso', color: '#4F46E5',
    tagline: 'Módulos e aulas',
    description: 'Estruturação de módulos, aulas e materiais educacionais.' },
  { id: 'serie_mensagens', group: 'produzir', emoji: '🧩', label: 'Série de Mensagens', color: '#7C3AED',
    tagline: 'Planejamento seriado',
    description: 'Planejamento e organização de séries expositivas ou temáticas.' },
  { id: 'conhecimento', group: 'armazenar', emoji: '🧠', label: 'Base de Conhecimento', color: '#B45309',
    tagline: 'Seu repositório teológico pessoal',
    description: 'Preserve conhecimento para reutilização futura. Seu segundo cérebro teológico e ministerial.' },
]

export const CREATION_GROUPS: Array<{
  id: CreationGroupId; emoji: string; label: string; description: string; color: string
}> = [
  { id: 'estudar', emoji: '📖', label: 'Estudar', color: '#0F766E',
    description: 'Investigue um texto bíblico, tema, doutrina ou termo.' },
  { id: 'armazenar', emoji: '🧠', label: 'Biblioteca', color: '#B45309',
    description: 'Armazene e organize conhecimento para consulta e reutilização futura.' },
]

// Detecção automática de gênero literário pelo livro
export const EPISTLE_BOOKS_DETECT = new Set([
  'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
  'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo',
  'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
  '3 João', 'Judas',
])
export const POETRY_BOOKS_DETECT = new Set([
  'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cântico dos Cânticos', 'Lamentações',
])
export const PROPHECY_BOOKS_DETECT = new Set([
  'Isaías', 'Jeremias', 'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós', 'Obadias',
  'Miquéias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias', 'Apocalipse',
])
export const NARRATIVE_BOOKS_DETECT = new Set([
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes',
  'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas',
  'Esdras', 'Neemias', 'Ester', 'Jonas', 'Mateus', 'Marcos', 'Lucas', 'João', 'Atos',
])

export function detectStudyMode(book: string): StudyModeId {
  if (EPISTLE_BOOKS_DETECT.has(book))   return 'estudo_de_carta'
  if (POETRY_BOOKS_DETECT.has(book))    return 'estudo_de_salmos_sabedoria'
  if (PROPHECY_BOOKS_DETECT.has(book))  return 'estudo_de_profecias'
  if (NARRATIVE_BOOKS_DETECT.has(book)) return 'estudo_narrativas'
  return 'exegese_biblica'
}

export const DETECTED_LABEL: Partial<Record<StudyModeId, string>> = {
  estudo_de_carta:            'Epístola',
  estudo_de_salmos_sabedoria: 'Salmos e Sabedoria',
  estudo_de_profecias:        'Profecia',
  estudo_narrativas:          'Narrativa',
  exegese_biblica:            'Texto Bíblico',
}

// ── Detecção automática de referências bíblicas ──────────────────────────

export type BibleBookEntry = { testament: 'AT' | 'NT'; canonical: string }

export const BIBLE_BOOK_MAP: Record<string, BibleBookEntry> = {
  // Pentateuco
  'genesis':     { testament: 'AT', canonical: 'Gênesis' },
  'gn':          { testament: 'AT', canonical: 'Gênesis' },
  'gen':         { testament: 'AT', canonical: 'Gênesis' },
  'exodo':       { testament: 'AT', canonical: 'Êxodo' },
  'ex':          { testament: 'AT', canonical: 'Êxodo' },
  'levitico':    { testament: 'AT', canonical: 'Levítico' },
  'lv':          { testament: 'AT', canonical: 'Levítico' },
  'lev':         { testament: 'AT', canonical: 'Levítico' },
  'numeros':     { testament: 'AT', canonical: 'Números' },
  'nm':          { testament: 'AT', canonical: 'Números' },
  'num':         { testament: 'AT', canonical: 'Números' },
  'deuteronomio':{ testament: 'AT', canonical: 'Deuteronômio' },
  'dt':          { testament: 'AT', canonical: 'Deuteronômio' },
  'deut':        { testament: 'AT', canonical: 'Deuteronômio' },
  // Históricos
  'josue':       { testament: 'AT', canonical: 'Josué' },
  'js':          { testament: 'AT', canonical: 'Josué' },
  'jos':         { testament: 'AT', canonical: 'Josué' },
  'juizes':      { testament: 'AT', canonical: 'Juízes' },
  'jz':          { testament: 'AT', canonical: 'Juízes' },
  'jui':         { testament: 'AT', canonical: 'Juízes' },
  'rute':        { testament: 'AT', canonical: 'Rute' },
  'rt':          { testament: 'AT', canonical: 'Rute' },
  '1 samuel':    { testament: 'AT', canonical: '1 Samuel' },
  '1samuel':     { testament: 'AT', canonical: '1 Samuel' },
  '1sm':         { testament: 'AT', canonical: '1 Samuel' },
  '2 samuel':    { testament: 'AT', canonical: '2 Samuel' },
  '2samuel':     { testament: 'AT', canonical: '2 Samuel' },
  '2sm':         { testament: 'AT', canonical: '2 Samuel' },
  '1 reis':      { testament: 'AT', canonical: '1 Reis' },
  '1reis':       { testament: 'AT', canonical: '1 Reis' },
  '1rs':         { testament: 'AT', canonical: '1 Reis' },
  '2 reis':      { testament: 'AT', canonical: '2 Reis' },
  '2reis':       { testament: 'AT', canonical: '2 Reis' },
  '2rs':         { testament: 'AT', canonical: '2 Reis' },
  '1 cronicas':  { testament: 'AT', canonical: '1 Crônicas' },
  '1cronicas':   { testament: 'AT', canonical: '1 Crônicas' },
  '1cr':         { testament: 'AT', canonical: '1 Crônicas' },
  '2 cronicas':  { testament: 'AT', canonical: '2 Crônicas' },
  '2cronicas':   { testament: 'AT', canonical: '2 Crônicas' },
  '2cr':         { testament: 'AT', canonical: '2 Crônicas' },
  'esdras':      { testament: 'AT', canonical: 'Esdras' },
  'esd':         { testament: 'AT', canonical: 'Esdras' },
  'neemias':     { testament: 'AT', canonical: 'Neemias' },
  'ne':          { testament: 'AT', canonical: 'Neemias' },
  'ester':       { testament: 'AT', canonical: 'Ester' },
  'est':         { testament: 'AT', canonical: 'Ester' },
  // Poéticos
  'job':         { testament: 'AT', canonical: 'Jó' },
  'salmos':      { testament: 'AT', canonical: 'Salmos' },
  'sal':         { testament: 'AT', canonical: 'Salmos' },
  'sl':          { testament: 'AT', canonical: 'Salmos' },
  'ps':          { testament: 'AT', canonical: 'Salmos' },
  'proverbios':  { testament: 'AT', canonical: 'Provérbios' },
  'pv':          { testament: 'AT', canonical: 'Provérbios' },
  'prov':        { testament: 'AT', canonical: 'Provérbios' },
  'eclesiastes': { testament: 'AT', canonical: 'Eclesiastes' },
  'ec':          { testament: 'AT', canonical: 'Eclesiastes' },
  'ecl':         { testament: 'AT', canonical: 'Eclesiastes' },
  'cantico dos canticos': { testament: 'AT', canonical: 'Cântico dos Cânticos' },
  'cantico':     { testament: 'AT', canonical: 'Cântico dos Cânticos' },
  'ct':          { testament: 'AT', canonical: 'Cântico dos Cânticos' },
  // Profecias Maiores
  'isaias':      { testament: 'AT', canonical: 'Isaías' },
  'is':          { testament: 'AT', canonical: 'Isaías' },
  'isa':         { testament: 'AT', canonical: 'Isaías' },
  'jeremias':    { testament: 'AT', canonical: 'Jeremias' },
  'jr':          { testament: 'AT', canonical: 'Jeremias' },
  'jer':         { testament: 'AT', canonical: 'Jeremias' },
  'lamentacoes': { testament: 'AT', canonical: 'Lamentações' },
  'lm':          { testament: 'AT', canonical: 'Lamentações' },
  'lam':         { testament: 'AT', canonical: 'Lamentações' },
  'ezequiel':    { testament: 'AT', canonical: 'Ezequiel' },
  'ez':          { testament: 'AT', canonical: 'Ezequiel' },
  'ezeq':        { testament: 'AT', canonical: 'Ezequiel' },
  'daniel':      { testament: 'AT', canonical: 'Daniel' },
  'dn':          { testament: 'AT', canonical: 'Daniel' },
  'dan':         { testament: 'AT', canonical: 'Daniel' },
  // Profecias Menores
  'oseias':      { testament: 'AT', canonical: 'Oséias' },
  'os':          { testament: 'AT', canonical: 'Oséias' },
  'joel':        { testament: 'AT', canonical: 'Joel' },
  'jl':          { testament: 'AT', canonical: 'Joel' },
  'amos':        { testament: 'AT', canonical: 'Amós' },
  'am':          { testament: 'AT', canonical: 'Amós' },
  'obadias':     { testament: 'AT', canonical: 'Obadias' },
  'ob':          { testament: 'AT', canonical: 'Obadias' },
  'abd':         { testament: 'AT', canonical: 'Obadias' },
  'jonas':       { testament: 'AT', canonical: 'Jonas' },
  'jon':         { testament: 'AT', canonical: 'Jonas' },
  'miqueias':    { testament: 'AT', canonical: 'Miquéias' },
  'mq':          { testament: 'AT', canonical: 'Miquéias' },
  'mi':          { testament: 'AT', canonical: 'Miquéias' },
  'naum':        { testament: 'AT', canonical: 'Naum' },
  'na':          { testament: 'AT', canonical: 'Naum' },
  'habacuque':   { testament: 'AT', canonical: 'Habacuque' },
  'hc':          { testament: 'AT', canonical: 'Habacuque' },
  'hab':         { testament: 'AT', canonical: 'Habacuque' },
  'sofonias':    { testament: 'AT', canonical: 'Sofonias' },
  'sf':          { testament: 'AT', canonical: 'Sofonias' },
  'sof':         { testament: 'AT', canonical: 'Sofonias' },
  'ageu':        { testament: 'AT', canonical: 'Ageu' },
  'ag':          { testament: 'AT', canonical: 'Ageu' },
  'zacarias':    { testament: 'AT', canonical: 'Zacarias' },
  'zc':          { testament: 'AT', canonical: 'Zacarias' },
  'zac':         { testament: 'AT', canonical: 'Zacarias' },
  'malaquias':   { testament: 'AT', canonical: 'Malaquias' },
  'ml':          { testament: 'AT', canonical: 'Malaquias' },
  'mal':         { testament: 'AT', canonical: 'Malaquias' },
  // Evangelhos
  'mateus':      { testament: 'NT', canonical: 'Mateus' },
  'mt':          { testament: 'NT', canonical: 'Mateus' },
  'mat':         { testament: 'NT', canonical: 'Mateus' },
  'marcos':      { testament: 'NT', canonical: 'Marcos' },
  'mc':          { testament: 'NT', canonical: 'Marcos' },
  'mar':         { testament: 'NT', canonical: 'Marcos' },
  'lucas':       { testament: 'NT', canonical: 'Lucas' },
  'lc':          { testament: 'NT', canonical: 'Lucas' },
  'luc':         { testament: 'NT', canonical: 'Lucas' },
  'joao':        { testament: 'NT', canonical: 'João' },
  'jo':          { testament: 'NT', canonical: 'João' },
  'jn':          { testament: 'NT', canonical: 'João' },
  'atos':        { testament: 'NT', canonical: 'Atos' },
  'at':          { testament: 'NT', canonical: 'Atos' },
  'atos dos apostolos': { testament: 'NT', canonical: 'Atos' },
  // Cartas Paulinas
  'romanos':     { testament: 'NT', canonical: 'Romanos' },
  'rm':          { testament: 'NT', canonical: 'Romanos' },
  'rom':         { testament: 'NT', canonical: 'Romanos' },
  '1 corintios': { testament: 'NT', canonical: '1 Coríntios' },
  '1corintios':  { testament: 'NT', canonical: '1 Coríntios' },
  '1co':         { testament: 'NT', canonical: '1 Coríntios' },
  '2 corintios': { testament: 'NT', canonical: '2 Coríntios' },
  '2corintios':  { testament: 'NT', canonical: '2 Coríntios' },
  '2co':         { testament: 'NT', canonical: '2 Coríntios' },
  'galatas':     { testament: 'NT', canonical: 'Gálatas' },
  'gl':          { testament: 'NT', canonical: 'Gálatas' },
  'gal':         { testament: 'NT', canonical: 'Gálatas' },
  'efesios':     { testament: 'NT', canonical: 'Efésios' },
  'ef':          { testament: 'NT', canonical: 'Efésios' },
  'efe':         { testament: 'NT', canonical: 'Efésios' },
  'filipenses':  { testament: 'NT', canonical: 'Filipenses' },
  'fp':          { testament: 'NT', canonical: 'Filipenses' },
  'fil':         { testament: 'NT', canonical: 'Filipenses' },
  'php':         { testament: 'NT', canonical: 'Filipenses' },
  'colossenses': { testament: 'NT', canonical: 'Colossenses' },
  'cl':          { testament: 'NT', canonical: 'Colossenses' },
  'col':         { testament: 'NT', canonical: 'Colossenses' },
  '1 tessalonicenses': { testament: 'NT', canonical: '1 Tessalonicenses' },
  '1tessalonicenses':  { testament: 'NT', canonical: '1 Tessalonicenses' },
  '1ts':         { testament: 'NT', canonical: '1 Tessalonicenses' },
  '2 tessalonicenses': { testament: 'NT', canonical: '2 Tessalonicenses' },
  '2tessalonicenses':  { testament: 'NT', canonical: '2 Tessalonicenses' },
  '2ts':         { testament: 'NT', canonical: '2 Tessalonicenses' },
  '1 timoteo':   { testament: 'NT', canonical: '1 Timóteo' },
  '1timoteo':    { testament: 'NT', canonical: '1 Timóteo' },
  '1tm':         { testament: 'NT', canonical: '1 Timóteo' },
  '2 timoteo':   { testament: 'NT', canonical: '2 Timóteo' },
  '2timoteo':    { testament: 'NT', canonical: '2 Timóteo' },
  '2tm':         { testament: 'NT', canonical: '2 Timóteo' },
  'tito':        { testament: 'NT', canonical: 'Tito' },
  'tt':          { testament: 'NT', canonical: 'Tito' },
  'ti':          { testament: 'NT', canonical: 'Tito' },
  'filemom':     { testament: 'NT', canonical: 'Filemom' },
  'fm':          { testament: 'NT', canonical: 'Filemom' },
  'flm':         { testament: 'NT', canonical: 'Filemom' },
  // Cartas Gerais + Apocalipse
  'hebreus':     { testament: 'NT', canonical: 'Hebreus' },
  'hb':          { testament: 'NT', canonical: 'Hebreus' },
  'heb':         { testament: 'NT', canonical: 'Hebreus' },
  'tiago':       { testament: 'NT', canonical: 'Tiago' },
  'tg':          { testament: 'NT', canonical: 'Tiago' },
  'tia':         { testament: 'NT', canonical: 'Tiago' },
  '1 pedro':     { testament: 'NT', canonical: '1 Pedro' },
  '1pedro':      { testament: 'NT', canonical: '1 Pedro' },
  '1pe':         { testament: 'NT', canonical: '1 Pedro' },
  '2 pedro':     { testament: 'NT', canonical: '2 Pedro' },
  '2pedro':      { testament: 'NT', canonical: '2 Pedro' },
  '2pe':         { testament: 'NT', canonical: '2 Pedro' },
  '1 joao':      { testament: 'NT', canonical: '1 João' },
  '1joao':       { testament: 'NT', canonical: '1 João' },
  '1jo':         { testament: 'NT', canonical: '1 João' },
  '2 joao':      { testament: 'NT', canonical: '2 João' },
  '2joao':       { testament: 'NT', canonical: '2 João' },
  '2jo':         { testament: 'NT', canonical: '2 João' },
  '3 joao':      { testament: 'NT', canonical: '3 João' },
  '3joao':       { testament: 'NT', canonical: '3 João' },
  '3jo':         { testament: 'NT', canonical: '3 João' },
  'judas':       { testament: 'NT', canonical: 'Judas' },
  'jd':          { testament: 'NT', canonical: 'Judas' },
  'jud':         { testament: 'NT', canonical: 'Judas' },
  'apocalipse':  { testament: 'NT', canonical: 'Apocalipse' },
  'ap':          { testament: 'NT', canonical: 'Apocalipse' },
  'apo':         { testament: 'NT', canonical: 'Apocalipse' },
  'rv':          { testament: 'NT', canonical: 'Apocalipse' },
  'rev':         { testament: 'NT', canonical: 'Apocalipse' },
}

export const BIBLE_BOOK_KEYS_BY_LENGTH = Object.keys(BIBLE_BOOK_MAP).sort((a, b) => b.length - a.length)

export function normalizeBible(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function parseBiblicalRef(query: string): {
  book: string; testament: 'AT' | 'NT'; passage: string; studyMode: StudyModeId
} | null {
  const norm = normalizeBible(query.trim())
  if (!norm) return null
  for (const key of BIBLE_BOOK_KEYS_BY_LENGTH) {
    if (!norm.startsWith(key)) continue
    const rest = norm.slice(key.length)
    if (rest !== '' && !/^\s+\d/.test(rest)) continue
    const passage = rest.trim()
    if (!passage) return null  // livro sem capítulo = incompleto
    const { canonical, testament } = BIBLE_BOOK_MAP[key]
    return { book: canonical, testament, passage, studyMode: detectStudyMode(canonical) }
  }
  return null
}

// ── Helpers ───────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60)   return 'Agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
  const days = Math.floor(diff / 86400)
  if (days === 1)  return 'Ontem'
  if (days < 7)   return `${days} dias atrás`
  if (days < 30)  return `${Math.floor(days / 7)} sem. atrás`
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function statusLabel(s: string): string {
  return { draft: 'Em andamento', in_progress: 'Em andamento', completed: 'Concluído', archived: 'Arquivado' }[s] ?? s
}

export const PUBLISHED_CATEGORIES = [
  { id: 'sermoes', label: 'Sermões' },
  { id: 'devocionais', label: 'Devocionais' },
  { id: 'ebooks', label: 'E-books' },
  { id: 'livros', label: 'Livros' },
  { id: 'palestras', label: 'Palestras' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'artigos', label: 'Artigos' },
  { id: 'estudos_tematicos', label: 'Estudos Temáticos' },
  { id: 'estudos_doutrinarios', label: 'Estudos Doutrinários' },
  { id: 'estudos_exegeticos', label: 'Estudos Exegéticos' },
  { id: 'base_conhecimento', label: 'Base de Conhecimento' },
] as const

export type PublishedCategoryId = typeof PUBLISHED_CATEGORIES[number]['id']

export function projectCreationMode(project: Project): string | null {
  const value = project.meta?.creation_ui_mode
  return typeof value === 'string' ? value : null
}

export function publishedCategoryFor(project: Project): PublishedCategoryId {
  const creationMode = projectCreationMode(project)
  if (creationMode === 'ebook') return 'ebooks'
  if (creationMode === 'livro') return 'livros'
  if (creationMode === 'palestra') return 'palestras'
  if (creationMode === 'curso') return 'cursos'
  if (creationMode === 'artigo') return 'artigos'
  if (creationMode === 'conhecimento') return 'base_conhecimento'

  const mode = getModeConfig(project.study_mode ?? project.project_type).id
  if (mode === 'sermao') return 'sermoes'
  if (mode === 'devocional') return 'devocionais'
  if (mode === 'estudo_tematico') return 'estudos_tematicos'
  if (mode === 'estudo_doutrinario') return 'estudos_doutrinarios'
  if (mode === 'exegese_biblica' || mode === 'estudo_de_carta' || mode === 'estudo_de_salmos_sabedoria' || mode === 'estudo_de_profecias' || mode === 'estudo_narrativas' || mode === 'comentario_exegetico') {
    return 'estudos_exegeticos'
  }
  return 'estudos_exegeticos'
}

export function formatCalendarDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function modeVisual(modeId: StudyModeId) {
  return MODE_VISUALS[modeId]
}

export function modeIcon(modeId: StudyModeId, size: number) {
  const icon = MODE_ICONS[modeId]
  return isValidElement<{ width?: number; height?: number }>(icon)
    ? cloneElement(icon, { width: size, height: size })
    : icon
}

export function buildReferenceTitle(book: string, passageRef: string): string {
  const normalizedBook = book.trim()
  const normalizedRef = passageRef.trim()
  if (!normalizedBook || !normalizedRef) return ''
  return `${normalizedBook} ${normalizedRef}`
}

export type SermonType = 'expositivo' | 'textual' | 'tematico'

export const SERMON_TYPE_OPTIONS: Array<{
  id: SermonType
  label: string
  short: string
  description: string
}> = [
  {
    id: 'expositivo',
    label: 'Sermão Expositivo',
    short: 'Expositivo',
    description: 'Desenvolve a mensagem a partir da intenção principal do texto bíblico, seguindo o fluxo natural da passagem.',
  },
  {
    id: 'textual',
    label: 'Sermão Textual',
    short: 'Textual',
    description: 'Estrutura a mensagem a partir de um texto específico, destacando divisões e argumentos presentes na própria passagem.',
  },
  {
    id: 'tematico',
    label: 'Sermão Temático',
    short: 'Temático',
    description: 'Organiza a mensagem em torno de um tema bíblico, utilizando múltiplas passagens para seu desenvolvimento.',
  },
]

export type ProjectForm = {
  title: string
  book: string
  passage_ref: string
  topic: string
  testament: '' | 'AT' | 'NT'
  sermon_type: '' | SermonType
}

export function createInitialForm(): ProjectForm {
  return { title: '', book: '', passage_ref: '', topic: '', testament: '', sermon_type: '' }
}
