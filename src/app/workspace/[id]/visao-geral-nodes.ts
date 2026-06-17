import type { Project } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'

// Extraído de VisaoGeralWorkspace.tsx (Fase 4 — extração mecânica, sem mudança de comportamento).
// Tipos, dados e helpers puros usados pelo componente VisaoGeralWorkspace.

// ── Types ─────────────────────────────────────────────────────────────────────

export type ClassType =
  | 'personagem' | 'lugar' | 'tema' | 'termo_chave' | 'conflito' | 'repeticao'
  | 'teologia' | 'tempo' | 'instituicao' | 'cargo' | 'objetivo'
  | 'comentario' | 'insight' | 'observacao'
  | 'conectivo' | 'verbo_principal' | 'promessa' | 'imperativo'
  | 'ambiente' | 'tensao' | 'climax' | 'resolucao' | 'desfecho'

export interface Classification {
  id: string; type: ClassType; selectedText: string
  startVerse: number; endVerse: number
  note: string; createdAt: string
  // Extended study fields — stored in localStorage, populated progressively
  definition?: string
  explanation?: string
  lexical_study?: string
  original_term?: string
  transliteration?: string
  meaning?: string
  occurrences_note?: string
  theological_biblical?: string
  narrative_function?: string
  applications?: string
  personal_notes?: string
}

export const TYPE_LABELS: Record<ClassType, string> = {
  personagem: 'Personagem', lugar: 'Lugar', tema: 'Tema', termo_chave: 'Termo-Chave',
  conflito: 'Conflito', repeticao: 'Repetição', teologia: 'Teologia', tempo: 'Tempo',
  instituicao: 'Instituição', cargo: 'Cargo', objetivo: 'Objetivo',
  comentario: 'Comentário', insight: 'Insight', observacao: 'Observação',
  conectivo: 'Conectivo', verbo_principal: 'Verbo Principal', promessa: 'Promessa', imperativo: 'Imperativo',
  ambiente: 'Ambiente', tensao: 'Tensão', climax: 'Clímax', resolucao: 'Resolução', desfecho: 'Desfecho',
}

// ── Storage ───────────────────────────────────────────────────────────────────

export function readCls(pid: string): Classification[] {
  try { const r = localStorage.getItem(`lc_${pid}`); return r ? JSON.parse(r) : [] } catch { return [] }
}
export function writeCls(pid: string, v: Classification[]) {
  try { localStorage.setItem(`lc_${pid}`, JSON.stringify(v)) } catch {}
}

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(lt|gt|amp|quot|#39|nbsp);/g, entity => HTML_ENTITIES[entity] ?? entity)
}

export function toPlainText(value: string): string {
  const decoded = decodeHtmlEntities(value)
  return decodeHtmlEntities(
    decoded
      .replace(/<(br|hr)\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export const CW        = 800
export const CH        = 540
export const CX        = 400
export const CY        = 270
export const RADIUS    = 205
export const PANEL_W   = 300
export const OBS_COLOR = '#0F766E'
export const OBS_BG    = '#F0FDFA'

// ── Node definitions ──────────────────────────────────────────────────────────

export type NodeKind = 'cls' | 'card' | 'obs' | 'phase'
export type OverviewLayerId = 'contexto_carta' | 'estrutura_texto' | 'sintese_exegetica' | 'sintese_homiletica'

export interface NodeDef {
  key: string; label: string; icon: string
  angle: number          // 0 = direita, -90 = topo, em sentido horário
  radius?: number
  layer?: OverviewLayerId
  sectionSlug?: string
  sectionCardId?: string
  color: string; bg: string
  kind: NodeKind
  clsTypes?: ClassType[]
  cardIds?: string[]
  phaseGroup?: string    // para sub-itens baseados em grupo no popup
}

export const SERMAO_EPISTOLAR_LAYERS: Array<{ id: OverviewLayerId; label: string; subtitle: string; color: string }> = [
  { id: 'contexto_carta', label: 'Contexto da Carta', subtitle: 'Quem escreveu e para quem', color: '#6D28D9' },
  { id: 'estrutura_texto', label: 'Estrutura do Texto', subtitle: 'Como o argumento se organiza', color: '#163A6B' },
  { id: 'sintese_exegetica', label: 'Síntese Exegética', subtitle: 'O que o texto ensina', color: '#D97706' },
  { id: 'sintese_homiletica', label: 'Síntese Homilética', subtitle: 'Como será comunicado', color: '#059669' },
]

export const EPISTLE_BOOKS = new Set([
  'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
  'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo',
  'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
  '3 João', 'Judas',
])

export function isEpistleBook(book: string): boolean {
  return EPISTLE_BOOKS.has(book.trim())
}

export function isEpistolarySermon(project: Project): boolean {
  return project.study_mode === 'sermao' && isEpistleBook(project.book)
}

export function cardDef(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

export const VG_CARD_DEFS: Record<string, SectionDef['cards'][number]> = {
  vg_autor: cardDef(
    'vg_autor',
    'Autor',
    'Identifique o autor da carta, sua autoridade, relação com os destinatários e elementos biográficos relevantes para a perícope.',
    'Identifique o autor desta carta e explique como sua autoridade, relação pastoral e contexto moldam a interpretação da passagem.',
  ),
  vg_destinatarios: cardDef(
    'vg_destinatarios',
    'Destinatários',
    'Descreva os destinatários originais: comunidade, situação espiritual, pressões, conflitos e necessidades pastorais.',
    'Descreva os destinatários originais desta carta, sua situação histórica, espiritual e pastoral, e como isso afeta a leitura da passagem.',
  ),
  vg_contexto: cardDef(
    'vg_contexto',
    'Contexto histórico',
    'Registre o pano de fundo histórico, social, religioso e pastoral que ilumina a passagem dentro da carta.',
    'Explique o contexto histórico, social, religioso e pastoral desta carta que é indispensável para interpretar a passagem.',
  ),
  vg_proposito: cardDef(
    'vg_proposito',
    'Propósito',
    'Defina o propósito da carta e como a perícope contribui para essa intenção comunicativa.',
    'Identifique o propósito explícito ou implícito da carta e mostre como esta passagem contribui para ele.',
  ),
  vg_estrutura: cardDef(
    'vg_estrutura',
    'Estrutura geral',
    'Esboce a estrutura geral da carta e localize a perícope dentro do fluxo do documento.',
    'Apresente a estrutura geral da carta e situe esta passagem dentro do desenvolvimento do argumento.',
  ),
  vg_temas: cardDef(
    'vg_temas',
    'Temas',
    'Liste os temas centrais da carta e destaque quais deles aparecem ou sustentam esta perícope.',
    'Identifique os temas principais da carta e explique quais são decisivos para compreender esta passagem.',
  ),
  vg_argumento: cardDef(
    'vg_argumento',
    'Argumento',
    'Descreva o argumento da carta e o papel da passagem na progressão lógica, pastoral ou teológica.',
    'Descreva o argumento central da carta e explique como esta passagem participa desse movimento argumentativo.',
  ),
  vg_blocos: cardDef(
    'vg_blocos',
    'Grandes blocos',
    'Divida a carta em grandes blocos e indique o bloco ao qual a passagem pertence.',
    'Divida a carta em grandes blocos literários/argumentativos e localize esta passagem dentro deles.',
  ),
  vg_assunto: cardDef(
    'vg_assunto',
    'Assunto',
    'Defina o assunto do sermão em termos simples: sobre o que o texto fala e qual eixo conduz a pregação.',
    'Defina o assunto do sermão a partir desta passagem, sem perder a intenção do texto.',
  ),
  vg_tema: cardDef(
    'vg_tema',
    'Tema central',
    'Formule o tema central que organizará a mensagem, ainda subordinado à exegese da passagem.',
    'Formule o tema central para a pregação, derivado da passagem e coerente com seu contexto bíblico.',
  ),
  vg_movimento: cardDef(
    'vg_movimento',
    'Movimento',
    'Descreva o movimento do texto e como ele conduzirá o movimento da mensagem.',
    'Descreva o movimento textual e homilético desta passagem, do início ao clímax e à resposta pastoral.',
  ),
  vg_divisoes: cardDef(
    'vg_divisoes',
    'Divisões',
    'Liste divisões pregáveis que nasçam da estrutura e do argumento do texto.',
    'Proponha divisões homiléticas fiéis ao fluxo do texto e úteis para uma pregação expositiva.',
  ),
  vg_climax: cardDef(
    'vg_climax',
    'Clímax',
    'Identifique o ponto de maior peso textual, teológico e pastoral da mensagem.',
    'Identifique o clímax textual e homilético desta passagem e explique como conduzir a congregação até ele.',
  ),
  vg_verdade: cardDef(
    'vg_verdade',
    'Verdade',
    'Expresse a verdade bíblica que deve ser proclamada, crida e obedecida.',
    'Formule a verdade central que esta passagem proclama e que o sermão deve comunicar.',
  ),
  vg_cristo: cardDef(
    'vg_cristo',
    'Cristo',
    'Explique como a pessoa e obra de Cristo fundamentam, cumprem ou iluminam a mensagem sem forçar conexões.',
    'Mostre como esta passagem aponta para Cristo, sua obra e o evangelho, evitando moralismo e alegorização.',
  ),
  vg_aplicacoes: cardDef(
    'vg_aplicacoes',
    'Aplicações',
    'Desenvolva aplicações pastorais específicas: fé, arrependimento, consolo, obediência e missão.',
    'Sugira aplicações pastorais específicas e evangélicas para a congregação a partir desta passagem.',
  ),
  vg_regra_principal: cardDef(
    'vg_regra_principal',
    'Regra principal',
    'Defina a regra hermenêutica e homilética que deve governar o sermão para manter fidelidade ao texto.',
    'Estabeleça a regra principal para pregar esta passagem com fidelidade: o que o sermão deve preservar e o que deve evitar.',
  ),
}

// ── Nós por modo de estudo ────────────────────────────────────────────────────
// 8 nós → 45° · 7 nós → ~51.4° · 6 nós → 60°

export const CARTA_BASE_NODES: NodeDef[] = [
  { key: 'vg_autor',         label: 'Autor',           icon: '✍',  angle: -90,  color: '#6D28D9', bg: '#F5F3FF', kind: 'card', sectionSlug: 'autor_destinatarios', sectionCardId: 'autor' },
  { key: 'vg_destinatarios', label: 'Destinatários',   icon: '📬', angle: -45,  color: '#7C3AED', bg: '#EDE9FE', kind: 'card', sectionSlug: 'autor_destinatarios', sectionCardId: 'destinatarios' },
  { key: 'vg_contexto',      label: 'Contexto Hist.',  icon: '📅', angle: 0,    color: '#4F46E5', bg: '#EEF2FF', kind: 'card', sectionSlug: 'contexto_historico' },
  { key: 'vg_proposito',     label: 'Propósito',       icon: '🎯', angle: 45,   color: '#163A6B', bg: '#EEF3FA', kind: 'card', sectionSlug: 'ec_ocasiao', sectionCardId: 'proposito' },
  { key: 'vg_estrutura',     label: 'Estrutura Geral', icon: '⊞',  angle: 90,   color: '#0369A1', bg: '#EEF3FA', kind: 'card', sectionSlug: 'ec_estrutura', sectionCardId: 'macroargumento' },
  { key: 'vg_temas',         label: 'Temas',           icon: '📖', angle: 135,  color: '#059669', bg: '#F0FDF4', kind: 'card', sectionSlug: 'ec_estrutura' },
  { key: 'vg_argumento',     label: 'Argumento',       icon: '⟶', angle: 180,  color: '#D97706', bg: '#FFFBEB', kind: 'card', sectionSlug: 'ec_argumento', sectionCardId: 'tese_central' },
  { key: 'vg_blocos',        label: 'Grandes Blocos',  icon: '▦',  angle: -135, color: '#475569', bg: '#F8FAFC', kind: 'card', sectionSlug: 'estrutura_livro', sectionCardId: 'divisoes_principais' },
]

export const SERMAO_NODES: NodeDef[] = [
  { key: 'vg_assunto',    label: 'Assunto',       icon: '📌', angle: -90,  color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_assunto'] },
  { key: 'vg_tema',       label: 'Tema Central',  icon: '🎯', angle: -45,  color: '#6D28D9', bg: '#EDE9FE', kind: 'card', cardIds: ['vg_tema'] },
  { key: 'vg_movimento',  label: 'Movimento',     icon: '⟶', angle: 0,    color: '#4F46E5', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_movimento'] },
  { key: 'vg_divisoes',   label: 'Divisões',      icon: '⊞',  angle: 45,   color: '#4338CA', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_divisoes'] },
  { key: 'vg_climax',     label: 'Clímax',        icon: '✦',  angle: 90,   color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_climax'] },
  { key: 'vg_verdade',    label: 'Verdade',       icon: '💡', angle: 135,  color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_verdade'] },
  { key: 'vg_cristo',     label: 'Cristo',        icon: '✚',  angle: 180,  color: '#BE3455', bg: '#FFF1F2', kind: 'card', cardIds: ['vg_cristo'] },
  { key: 'vg_aplicacoes', label: 'Aplicações',    icon: '🎯', angle: -135, color: '#059669', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_aplicacoes'] },
]

export const SERMAO_EPISTOLAR_NODES: NodeDef[] = [
  { key: 'sermao_vg_autor',         label: 'Autor',           icon: '✍', angle: -90, color: '#6D28D9', bg: '#F5F3FF', kind: 'card', layer: 'contexto_carta', sectionSlug: 'autor_destinatarios', sectionCardId: 'autor' },
  { key: 'sermao_vg_destinatarios', label: 'Destinatários',   icon: '📬', angle: 0,   color: '#7C3AED', bg: '#EDE9FE', kind: 'card', layer: 'contexto_carta', sectionSlug: 'autor_destinatarios', sectionCardId: 'destinatarios' },
  { key: 'sermao_vg_contexto',      label: 'Contexto Hist.',  icon: '📅', angle: 90,  color: '#4F46E5', bg: '#EEF2FF', kind: 'card', layer: 'contexto_carta', sectionSlug: 'contexto_historico' },
  { key: 'sermao_vg_proposito',     label: 'Propósito',       icon: '🎯', angle: 180, color: '#163A6B', bg: '#EEF3FA', kind: 'card', layer: 'contexto_carta', sectionSlug: 'ec_ocasiao', sectionCardId: 'proposito' },

  { key: 'sermao_vg_estrutura', label: 'Estrutura Geral', icon: '⊞', angle: -90, color: '#0369A1', bg: '#EEF3FA', kind: 'card', layer: 'estrutura_texto', sectionSlug: 'ec_estrutura', sectionCardId: 'macroargumento' },
  { key: 'sermao_vg_blocos',    label: 'Grandes Blocos',  icon: '▦', angle: -30, color: '#475569', bg: '#F8FAFC', kind: 'card', layer: 'estrutura_texto', sectionSlug: 'estrutura_livro', sectionCardId: 'divisoes_principais' },
  { key: 'sermao_vg_divisoes',  label: 'Divisões',        icon: '⊞', angle: 30,  color: '#4338CA', bg: '#EEF2FF', kind: 'card', layer: 'estrutura_texto', cardIds: ['vg_divisoes'] },
  { key: 'sermao_vg_movimento', label: 'Movimento',       icon: '⟶', angle: 90,  color: '#4F46E5', bg: '#EEF2FF', kind: 'card', layer: 'estrutura_texto', cardIds: ['vg_movimento'] },
  { key: 'sermao_vg_argumento', label: 'Argumento',       icon: '⟶', angle: 150, color: '#D97706', bg: '#FFFBEB', kind: 'card', layer: 'estrutura_texto', sectionSlug: 'ec_argumento', sectionCardId: 'tese_central' },
  { key: 'sermao_vg_temas',     label: 'Temas',           icon: '📖', angle: 210, color: '#059669', bg: '#F0FDF4', kind: 'card', layer: 'estrutura_texto', sectionSlug: 'ec_estrutura' },

  { key: 'sermao_vg_assunto', label: 'Assunto', icon: '📌', angle: -90, color: '#7C3AED', bg: '#F5F3FF', kind: 'card', layer: 'sintese_exegetica', sectionSlug: 'sintese', sectionCardId: 'grande_ideia' },
  { key: 'sermao_vg_verdade', label: 'Verdade', icon: '💡', angle: 0,   color: '#D97706', bg: '#FFFBEB', kind: 'card', layer: 'sintese_exegetica', sectionSlug: 'sintese', sectionCardId: 'mensagem_texto' },
  { key: 'sermao_vg_climax',  label: 'Clímax',  icon: '✦', angle: 90,  color: '#7C3AED', bg: '#F5F3FF', kind: 'card', layer: 'sintese_exegetica', sectionSlug: 'ec_argumento', sectionCardId: 'climax' },
  { key: 'sermao_vg_cristo',  label: 'Cristo',  icon: '✚', angle: 180, color: '#BE3455', bg: '#FFF1F2', kind: 'card', layer: 'sintese_exegetica', sectionSlug: 'contexto_canonico', sectionCardId: 'ecos_nt' },

  { key: 'sermao_vg_tema',             label: 'Tema Central',    icon: '🎯', angle: -90, color: '#6D28D9', bg: '#EDE9FE', kind: 'card', layer: 'sintese_homiletica', cardIds: ['vg_tema'] },
  { key: 'sermao_vg_regra_principal',  label: 'Regra Principal', icon: '⚖', angle: 30,  color: '#0F766E', bg: '#F0FDFA', kind: 'card', layer: 'sintese_homiletica', cardIds: ['vg_regra_principal'] },
  { key: 'sermao_vg_aplicacoes',       label: 'Aplicações',      icon: '🎯', angle: 150, color: '#059669', bg: '#F0FDF4', kind: 'card', layer: 'sintese_homiletica', cardIds: ['vg_aplicacoes'] },
]

export const MODE_NODES_MAP: Record<string, NodeDef[]> = {
  exegese_biblica: [
    { key: 'personagens',  label: 'Personagens',  icon: '👤', angle: -90,  color: '#D97706', bg: '#FFFBEB', kind: 'cls',  clsTypes: ['personagem', 'cargo'] },
    { key: 'lugares',      label: 'Lugares',       icon: '📍', angle: -45,  color: '#059669', bg: '#F0FDF4', kind: 'cls',  clsTypes: ['lugar'] },
    { key: 'temas',        label: 'Temas',          icon: '📖', angle: 0,    color: '#163A6B', bg: '#EEF3FA', kind: 'cls',  clsTypes: ['tema'] },
    { key: 'termos',       label: 'Termos-Chave',  icon: '🔑', angle: 45,   color: '#EA580C', bg: '#FFF7ED', kind: 'cls',  clsTypes: ['termo_chave', 'repeticao'] },
    { key: 'grande_ideia', label: 'Grande Ideia',  icon: '💡', angle: 90,   color: '#D97706', bg: '#FEFCE8', kind: 'card', sectionSlug: 'sintese', sectionCardId: 'grande_ideia' },
    { key: 'estrutura',    label: 'Estrutura',     icon: '⊞',  angle: 135,  color: '#4F46E5', bg: '#EEF2FF', kind: 'card', sectionSlug: 'estrutura_literaria' },
    { key: 'climax',       label: 'Clímax',        icon: '✦',  angle: 180,  color: '#7C3AED', bg: '#F5F3FF', kind: 'card', sectionSlug: 'estrutura_literaria', sectionCardId: 'climax_resolucao' },
    { key: 'movimento',    label: 'Movimento',     icon: '⟶', angle: -135, color: '#475569', bg: '#F8FAFC', kind: 'card', sectionSlug: 'estrutura_literaria', sectionCardId: 'enredo_tensao' },
  ],
  sermao: SERMAO_NODES,
  devocional: [
    { key: 'vg_deus',         label: 'Revela Deus',   icon: '✦',  angle: -90,  color: '#9A3412', bg: '#FFF7ED', kind: 'card', cardIds: ['vg_deus'] },
    { key: 'vg_homem',        label: 'Revela o Homem',icon: '👤', angle: -39,  color: '#BE3455', bg: '#FFF1F2', kind: 'card', cardIds: ['vg_homem'] },
    { key: 'vg_promessas',    label: 'Promessas',     icon: '🙏', angle: 13,   color: '#059669', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_promessas'] },
    { key: 'vg_advertencias', label: 'Advertências',  icon: '⚠',  angle: 64,   color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_advertencias'] },
    { key: 'vg_pecados',      label: 'Pecados',       icon: '✖',  angle: 116,  color: '#DC2626', bg: '#FEF2F2', kind: 'card', cardIds: ['vg_pecados'] },
    { key: 'vg_exemplos',     label: 'Exemplos',      icon: '⬆',  angle: 167,  color: '#4F46E5', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_exemplos'] },
    { key: 'vg_aplicacao',    label: 'Aplicação',     icon: '🎯', angle: 219,  color: '#0369A1', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_aplicacao'] },
  ],
  estudo_biblico: [
    { key: 'vg_tema',        label: 'Tema Principal', icon: '📖', angle: -90,  color: '#0369A1', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_tema'] },
    { key: 'vg_estrutura',   label: 'Estrutura',      icon: '⊞',  angle: -39,  color: '#163A6B', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_estrutura'] },
    { key: 'vg_personagens', label: 'Personagens',    icon: '👤', angle: 13,   color: '#D97706', bg: '#FFFBEB', kind: 'cls',  clsTypes: ['personagem', 'cargo'] },
    { key: 'vg_perguntas',   label: 'Perguntas',      icon: '❓', angle: 64,   color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_perguntas'] },
    { key: 'vg_verdades',    label: 'Verdades',       icon: '💡', angle: 116,  color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_verdades'] },
    { key: 'vg_aplicacoes',  label: 'Aplicações',     icon: '🎯', angle: 167,  color: '#059669', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_aplicacoes'] },
    { key: 'vg_topicos',     label: 'Para Discussão', icon: '💬', angle: 219,  color: '#475569', bg: '#F8FAFC', kind: 'card', cardIds: ['vg_topicos'] },
  ],
  estudo_de_salmos_sabedoria: [
    { key: 'ss_paralel',   label: 'Paralelismo', icon: '⇌', angle: -90, color: '#7C3AED', bg: '#EDE9FE', kind: 'card', sectionSlug: 'ss_paralelismo' },
    { key: 'ss_estrutura', label: 'Estrutura',   icon: '⊞', angle: -18, color: '#163A6B', bg: '#EEF3FA', kind: 'card', sectionSlug: 'ss_estrutura' },
    { key: 'ss_imagens',   label: 'Imagística',  icon: '🎨', angle: 54,  color: '#6D28D9', bg: '#F5F3FF', kind: 'card', sectionSlug: 'ss_imagistica' },
    { key: 'ss_temas',     label: 'Temas',       icon: '💡', angle: 126, color: '#B45309', bg: '#FEF3C7', kind: 'card', sectionSlug: 'ss_temas_sabedoria' },
    { key: 'ss_teologia',  label: 'Teologia',    icon: '🙏', angle: 198, color: '#059669', bg: '#F0FDF4', kind: 'card', sectionSlug: 'ss_teologia_adoracao' },
  ],
  estudo_de_profecias: [
    { key: 'pf_contexto',  label: 'Contexto Hist.',    icon: '📅', angle: -90,  color: '#B45309', bg: '#FEF3C7', kind: 'card', sectionSlug: 'contexto_historico' },
    { key: 'pf_oraculo',   label: 'O Oráculo',         icon: '📣', angle: -45,  color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_oraculo'] },
    { key: 'pf_destinat',  label: 'Destinatários',     icon: '👥', angle: 0,    color: '#92400E', bg: '#FEF3C7', kind: 'card', sectionSlug: 'autor_destinatarios', sectionCardId: 'destinatarios' },
    { key: 'pf_simbolos',  label: 'Símbolos',          icon: '🔮', angle: 45,   color: '#B45309', bg: '#FEF3C7', kind: 'card', cardIds: ['vg_simbolos'] },
    { key: 'pf_climax',    label: 'Clímax',            icon: '✦',  angle: 90,   color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_climax'] },
    { key: 'pf_cumprim',   label: 'Cumprimento',       icon: '✓',  angle: 135,  color: '#059669', bg: '#F0FDF4', kind: 'card', sectionSlug: 'progressao_revelacional', sectionCardId: 'promessa_cumprimento' },
    { key: 'pf_eschato',   label: 'Escatologia',       icon: '⌚', angle: 180,  color: '#1E40AF', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_escatologia'] },
    { key: 'pf_reino',     label: 'Reino de Deus',     icon: '👑', angle: -135, color: '#4F46E5', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_reino'] },
  ],
  estudo_doutrinario: [
    { key: 'vg_definicao',     label: 'Definição',       icon: '📖', angle: -90, color: '#1E40AF', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_definicao'] },
    { key: 'vg_questao',       label: 'Questão Central', icon: '❓', angle: -30, color: '#163A6B', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_questao'] },
    { key: 'vg_passagens',     label: 'Passagens',       icon: '📜', angle: 30,  color: '#059669', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_passagens'] },
    { key: 'vg_doutrinas',     label: 'Doutrinas Rel.',  icon: '⊞',  angle: 90,  color: '#4F46E5', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_doutrinas'] },
    { key: 'vg_controversias', label: 'Controvérsias',   icon: '⚡', angle: 150, color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_controversias'] },
    { key: 'vg_implicacoes',   label: 'Implicações',     icon: '🎯', angle: 210, color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_implicacoes'] },
  ],
  estudo_tematico: [
    { key: 'vg_definicao',  label: 'Definição',         icon: '📖', angle: -90, color: '#065F46', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_definicao'] },
    { key: 'vg_textos',     label: 'Textos Principais', icon: '📜', angle: -30, color: '#059669', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_textos'] },
    { key: 'vg_canonico',   label: 'Desenv. Canônico',  icon: '⟶', angle: 30,  color: '#0F766E', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_canonico'] },
    { key: 'vg_aliancas',   label: 'Alianças',          icon: '🤝', angle: 90,  color: '#0369A1', bg: '#EEF3FA', kind: 'card', cardIds: ['vg_aliancas'] },
    { key: 'vg_cristo',     label: 'Relação c/ Cristo', icon: '✚',  angle: 150, color: '#BE3455', bg: '#FFF1F2', kind: 'card', cardIds: ['vg_cristo'] },
    { key: 'vg_aplicacoes', label: 'Aplicações',        icon: '🎯', angle: 210, color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_aplicacoes'] },
  ],
  estudo_de_carta: CARTA_BASE_NODES,
  estudo_narrativas: [
    { key: 'nr_personagens', label: 'Personagens',  icon: '👤', angle: -90,  color: '#92400E', bg: '#FEF3C7', kind: 'cls',  clsTypes: ['personagem', 'cargo'] },
    { key: 'nr_enredo',      label: 'Enredo',       icon: '⟶', angle: -38,  color: '#B45309', bg: '#FEF3C7', kind: 'card', sectionSlug: 'nr_enredo', sectionCardId: 'climax_virada' },
    { key: 'nr_cenario',     label: 'Cenário',      icon: '📍', angle: 13,   color: '#92400E', bg: '#FEF3C7', kind: 'card', sectionSlug: 'nr_cenario' },
    { key: 'nr_narrador',    label: 'Narrador',     icon: '✍',  angle: 64,   color: '#78350F', bg: '#FEF3C7', kind: 'card', sectionSlug: 'nr_narrador' },
    { key: 'nr_dialogo',     label: 'Diálogo',      icon: '💬', angle: 116,  color: '#B45309', bg: '#FEF3C7', kind: 'card', sectionSlug: 'nr_dialogo' },
    { key: 'nr_teologia',    label: 'Teologia',     icon: '✚',  angle: 167,  color: '#D97706', bg: '#FFFBEB', kind: 'card', sectionSlug: 'nr_teologia' },
    { key: 'nr_tensao',      label: 'Tensão',       icon: '⚡', angle: 219,  color: '#92400E', bg: '#FEF3C7', kind: 'card', sectionSlug: 'nr_enredo', sectionCardId: 'complicacao_conflito' },
  ],
  comentario_exegetico: [
    { key: 'vg_estrutura',  label: 'Estrutura',          icon: '⊞',  angle: -90, color: '#F97316', bg: '#FFF7ED', kind: 'card', sectionSlug: 'estrutura_literaria' },
    { key: 'vg_fluxo',      label: 'Fluxo Arg.',         icon: '⟶', angle: -30, color: '#EA580C', bg: '#FFF7ED', kind: 'card', sectionSlug: 'estrutura_literaria', sectionCardId: 'fluxo_argumentativo' },
    { key: 'vg_termos',     label: 'Termos Relevantes',  icon: '🔑', angle: 30,  color: '#D97706', bg: '#FFFBEB', kind: 'cls',  clsTypes: ['termo_chave', 'repeticao'] },
    { key: 'vg_questoes',   label: 'Questões Interp.',   icon: '❓', angle: 90,  color: '#B45309', bg: '#FEF3C7', kind: 'card', cardIds: ['vg_questoes'] },
    { key: 'vg_conexoes',   label: 'Conexões Canônicas', icon: '🔗', angle: 150, color: '#92400E', bg: '#FEF3C7', kind: 'card', sectionSlug: 'contexto_canonico' },
    { key: 'vg_teologia',   label: 'Teologia',           icon: '📖', angle: 210, color: '#78350F', bg: '#FEF3C7', kind: 'card', sectionSlug: 'contexto_canonico', sectionCardId: 'ecos_nt' },
  ],
}

// ── Observações Pessoais ──────────────────────────────────────────────────────

export const OBS_CARD_LABELS: Record<string, string> = {
  preparar_leitura_lenta:          'Leitura lenta',
  preparar_multiplas_leituras:     'Múltiplas leituras',
  preparar_comparacao_traducoes:   'Comparação de traduções',
  preparar_leitura_voz_alta:       'Leitura em voz alta',
  preparar_ideia_inicial:          'Ideia central inicial',
  preparar_tensoes_repeticoes:     'Tensões e repetições',
  preparar_perguntas_dificuldades: 'Perguntas e dificuldades',
  preparar_conexoes_iniciais:      'Conexões iniciais',
  preparar_marcacoes:              'Marcações e destaques',
  preparar_modo_imersao:           'Modo Imersão',
}

export const OBS_NODE: NodeDef = {
  key: 'obs_pessoais', label: 'Observações Pessoais', icon: '📝',
  angle: 0, color: OBS_COLOR, bg: OBS_BG, kind: 'obs',
}

// ── Nós por fase (Preparar / Investigar) ─────────────────────────────────────

export const PREPARAR_PHASE_NODES: NodeDef[] = [
  { key: 'phase_preparacao_espiritual', label: 'Preparação Espiritual', icon: '🙏', angle: -90, color: '#D97706', bg: '#FFFBEB', kind: 'phase', sectionSlug: 'preparacao_espiritual' },
  { key: 'phase_leia_assimile',         label: 'Leia e Assimile',       icon: '📖', angle: 30,  color: '#059669', bg: '#F0FDF4', kind: 'phase', sectionSlug: 'preparar_leia_assimile' },
  { key: 'phase_visao_geral_prep',      label: 'Visão Geral',           icon: '⊞',  angle: 150, color: '#163A6B', bg: '#EEF3FA', kind: 'phase', sectionSlug: 'preparar_visao_geral' },
]

// Equivalente ao PREPARAR_PHASE_NODES para o modo Narrativas Bíblicas (groups nr_*)
export const NR_PREPARAR_PHASE_NODES: NodeDef[] = [
  { key: 'phase_preparacao_espiritual', label: 'Preparação Espiritual', icon: '🙏', angle: -90, color: '#D97706', bg: '#FFFBEB', kind: 'phase', sectionSlug: 'preparacao_espiritual' },
  { key: 'phase_leia_assimile',         label: 'Leia e Assimile',       icon: '📖', angle: 30,  color: '#059669', bg: '#F0FDF4', kind: 'phase', sectionSlug: 'preparar_leia_assimile' },
  { key: 'phase_visao_geral_prep',      label: 'Visão Geral',           icon: '⊞',  angle: 150, color: '#163A6B', bg: '#EEF3FA', kind: 'phase', sectionSlug: 'nr_preparar_visao_geral' },
]

export const SINTESE_CARD_HINTS: Record<string, string> = {
  grande_ideia: 'Formule a Grande Ideia do texto em uma sentença completa (sujeito + complemento). O sujeito responde "de que trata o texto?"; o complemento responde "o que o texto afirma sobre isso?".',
  mensagem_texto: 'O que Deus comunica através desta passagem? Sintetize a mensagem principal do texto para os destinatários originais e para a igreja de todos os tempos.',
  conceito_ensina: 'Identifique as principais verdades, princípios ou doutrinas ensinadas pelo texto. Exemplos: Deus é soberano; a fé produz obediência; Cristo é o mediador; a salvação é pela graça.',
  conceitos_confronta: 'Identifique erros, pecados, crenças equivocadas ou cosmovisões que o texto corrige. Exemplos: autossuficiência humana; legalismo; idolatria; materialismo; relativismo moral.',
}

export const INVESTIGAR_PHASE_NODES: NodeDef[] = [
  { key: 'phase_estudo_textual',    label: 'Estudo Textual',      icon: '🔑', angle: -90, color: '#163A6B', bg: '#EEF3FA', kind: 'phase', sectionSlug: 'texto_original',    phaseGroup: 'textual' },
  { key: 'phase_estudo_contextual', label: 'Estudo Contextual',   icon: '📅', angle: 0,   color: '#B45309', bg: '#FEF3C7', kind: 'phase', sectionSlug: 'contexto_historico', phaseGroup: 'contextual' },
  { key: 'phase_estudo_teologico',  label: 'Estudo Teológico',    icon: '✚',  angle: 90,  color: '#7C3AED', bg: '#F5F3FF', kind: 'phase', sectionSlug: 'contexto_canonico', phaseGroup: 'teologico' },
  { key: 'phase_visao_geral_inv',   label: 'Visão Geral',         icon: '⊞',  angle: 180, color: '#0F766E', bg: '#F0FDFA', kind: 'phase', sectionSlug: 'investigar_visao_geral' },
]

// Equivalente ao INVESTIGAR_PHASE_NODES para o modo Narrativas Bíblicas (groups nr_*)
export const NR_INVESTIGAR_PHASE_NODES: NodeDef[] = [
  { key: 'phase_nr_textual',         label: 'Estudo Textual',    icon: '🔑', angle: -90, color: '#163A6B', bg: '#EEF3FA', kind: 'phase', sectionSlug: 'nr_txt_original',  phaseGroup: 'nr_textual_grp' },
  { key: 'phase_nr_contextual',      label: 'Estudo Contextual', icon: '📅', angle: 0,   color: '#B45309', bg: '#FEF3C7', kind: 'phase', sectionSlug: 'nr_ctx_historico', phaseGroup: 'nr_contextual_grp' },
  { key: 'phase_nr_teologico',       label: 'Estudo Teológico',  icon: '✚',  angle: 90,  color: '#7C3AED', bg: '#F5F3FF', kind: 'phase', sectionSlug: 'nr_teo_redentor',  phaseGroup: 'nr_teologico_grp' },
  { key: 'phase_nr_visao_geral_inv', label: 'Visão Geral',       icon: '⊞',  angle: 180, color: '#0F766E', bg: '#F0FDFA', kind: 'phase', sectionSlug: 'nr_ivg_ideia',     phaseGroup: 'nr_ivg_grp' },
]

export const FERRAMENTAS_PHASE_NODES: NodeDef[] = [
  { key: 'phase_dicionario',   label: 'Dicionário',        icon: '📖', angle: -90,  color: '#0F766E', bg: '#F0FDFA', kind: 'phase', sectionSlug: 'ferramentas_dicionario' },
  { key: 'phase_texto_orig',   label: 'Texto Original',    icon: '📜', angle: -30,  color: '#4F46E5', bg: '#EEF2FF', kind: 'phase', sectionSlug: 'texto_original' },
  { key: 'phase_sistematica',  label: 'Teol. Sistemática', icon: '⊞',  angle: 30,   color: '#163A6B', bg: '#EEF3FA', kind: 'phase', sectionSlug: 'ferramentas_sistematica' },
  { key: 'phase_biblica',      label: 'Teol. Bíblica',     icon: '🔗', angle: 90,   color: '#7C3AED', bg: '#F5F3FF', kind: 'phase', sectionSlug: 'ferramentas_biblica' },
  { key: 'phase_colagens',     label: 'Colagens',          icon: '🎨', angle: 150,  color: '#D97706', bg: '#FFFBEB', kind: 'phase', sectionSlug: 'colagens' },
  { key: 'phase_pesquisa',     label: 'Pesquisa',          icon: '🔍', angle: 210,  color: '#BE3455', bg: '#FFF1F2', kind: 'phase', sectionSlug: 'ferramentas_livros' },
]

// ── Helpers de status de conteúdo ────────────────────────────────────────────

export function cardTextStatus(text: string): 'empty' | 'draft' | 'reviewed' {
  if (!text.trim()) return 'empty'
  if (text.trim().length < 80) return 'draft'
  return 'reviewed'
}

// ── Drill-down popup stack ────────────────────────────────────────────────────

export type DrillItemType = 'section' | 'card'

export interface DrillItem {
  id: string
  label: string
  sectionSlug: string
  type: DrillItemType
  status: 'empty' | 'draft' | 'reviewed'
}

export interface DrillLevel {
  id: string
  node: NodeDef
  title: string
  icon: string
  color: string
  bg: string
  sectionSlug?: string
  phaseGroup?: string
  cardIdsFilter?: string[]    // show only these card IDs (for card-kind nodes)
  canvasX?: number
  canvasY?: number
  fixedLeft?: number
  fixedTop?: number
  editingCardId?: string
  viewTab?: 'view' | 'edit'  // undefined = section list; 'view'/'edit' = card level
}

export interface ConsolidatedCardItem  { label: string; html: string; isPlain?: boolean }
export interface ConsolidatedSection   { title: string; slug: string; cards: ConsolidatedCardItem[] }
export interface ConsolidatedPopupState {
  title: string; icon: string; color: string; bg: string
  primarySlug: string
  sections: ConsolidatedSection[]
}

// ── Prompt de IA por modo (para o botão "Organizar com IA" em cada nó) ────────

export function buildVGNodePrompt(project: Project, node: NodeDef): string {
  const isPassage = project.book !== '—'
  const ref = isPassage ? `${project.book} ${project.passage_ref}` : project.passage_ref
  const mode = project.study_mode ?? 'exegese_biblica'
  const cardId = node.cardIds?.[0]
  const cardMeta = cardId ? VG_CARD_DEFS[cardId] : null
  if (mode === 'sermao' && isEpistleBook(project.book) && cardMeta) {
    return `${cardMeta.aiTrigger}

Contexto: ${ref}.
Modo: Sermão expositivo em texto epistolar.
Diretriz: use a base interpretativa da carta antes de formular implicações homiléticas.`
  }

  const prompts: Record<string, string> = {
    exegese_biblica:            `Analise ${ref} e liste os principais elementos de "${node.label}" na passagem, com breve nota exegética sobre cada um.`,
    sermao:                     `Analisando ${ref} para pregação, desenvolva "${node.label}" com foco no potencial homilético do texto.`,
    devocional:                 `Lendo ${ref} devocionalmente, desenvolva "${node.label}" como reflexão espiritual formativa.`,
    estudo_biblico:             `Para um estudo bíblico sobre ${ref}, desenvolva "${node.label}" de forma didática e participativa.`,
    estudo_de_salmos_sabedoria: `Analisando o poema de ${ref}, desenvolva "${node.label}" com atenção à estrutura poética, paralelismo e teologia da adoração.`,
    estudo_de_profecias:        `Para a análise profética de ${ref}, desenvolva "${node.label}" considerando o contexto histórico, o oráculo e seu cumprimento canônico.`,
    estudo_doutrinario:         `Sobre a doutrina "${ref}", desenvolva "${node.label}" com precisão teológica reformada.`,
    estudo_tematico:            `Para o estudo temático sobre "${ref}", desenvolva "${node.label}" rastreando sua progressão canônica.`,
    estudo_narrativas:          `Para a análise narrativa de ${ref}, desenvolva "${node.label}" com atenção à caracterização, enredo, cenário e teologia narrativa.`,
    estudo_de_carta:            `Para o estudo de ${ref}, desenvolva "${node.label}" em seu contexto epistolar e argumentativo.`,
    comentario_exegetico:       `Para um comentário exegético de ${ref}, desenvolva "${node.label}" com rigor analítico.`,
  }
  return prompts[mode] ?? prompts.exegese_biblica
}

export function getOverviewNodes(project: Project, sectionSlug: string): NodeDef[] {
  if (sectionSlug === 'preparar_visao_geral')     return PREPARAR_PHASE_NODES
  if (sectionSlug === 'nr_preparar_visao_geral')  return NR_PREPARAR_PHASE_NODES
  if (sectionSlug === 'investigar_visao_geral')   return INVESTIGAR_PHASE_NODES
  if (sectionSlug === 'nr_ivg_ideia')             return NR_INVESTIGAR_PHASE_NODES
  if (sectionSlug === 'ferramentas_visao_geral')  return FERRAMENTAS_PHASE_NODES
  if (isEpistolarySermon(project)) return SERMAO_EPISTOLAR_NODES
  return MODE_NODES_MAP[project.study_mode ?? ''] ?? MODE_NODES_MAP.exegese_biblica
}

export function createOverviewSectionDef(sectionDef: SectionDef, nodes: NodeDef[], project: Project): SectionDef {
  if (project.study_mode !== 'sermao' && project.study_mode !== 'estudo_de_carta') return sectionDef

  const cards = nodes
    .filter(node => node.kind === 'card')
    .flatMap(node => node.cardIds ?? [])
    .filter((cardId, index, all) => all.indexOf(cardId) === index)
    .map(cardId => VG_CARD_DEFS[cardId] ?? cardDef(
      cardId,
      nodes.find(node => node.cardIds?.includes(cardId))?.label ?? cardId,
      `Descreva este campo da visão geral da passagem.`,
      `Desenvolva este campo da visão geral da passagem com fidelidade ao texto bíblico.`,
    ))

  return { ...sectionDef, cards }
}

export function nodeXY(angle: number, r = RADIUS) {
  const rad = (angle * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}
