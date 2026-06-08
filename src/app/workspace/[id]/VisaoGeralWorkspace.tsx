'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import type { CollageItem } from '@/lib/collages-content'
import { createClient } from '@/lib/supabase/client'
import SectionWorkspace from './SectionWorkspace'
import { Sparkles, Map, List, MoreHorizontal, X, BookOpen, ChevronLeft, Loader2, Check, BookMarked, Maximize2 } from 'lucide-react'
import { loadClassificationsFromDB, saveClassificationToDB, deleteClassificationFromDB, updateClassificationInDB } from '@/lib/classification-sync'
import MarkdownRenderer from '@/components/MarkdownRenderer'

// ── Types ─────────────────────────────────────────────────────────────────────

type ClassType =
  | 'personagem' | 'lugar' | 'tema' | 'termo_chave' | 'conflito' | 'repeticao'
  | 'teologia' | 'tempo' | 'instituicao' | 'cargo' | 'objetivo'
  | 'comentario' | 'insight' | 'observacao'

interface Classification {
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

const TYPE_LABELS: Record<ClassType, string> = {
  personagem: 'Personagem', lugar: 'Lugar', tema: 'Tema', termo_chave: 'Termo-Chave',
  conflito: 'Conflito', repeticao: 'Repetição', teologia: 'Teologia', tempo: 'Tempo',
  instituicao: 'Instituição', cargo: 'Cargo', objetivo: 'Objetivo',
  comentario: 'Comentário', insight: 'Insight', observacao: 'Observação',
}

// ── Storage ───────────────────────────────────────────────────────────────────

function readCls(pid: string): Classification[] {
  try { const r = localStorage.getItem(`lc_${pid}`); return r ? JSON.parse(r) : [] } catch { return [] }
}
function writeCls(pid: string, v: Classification[]) {
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

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(lt|gt|amp|quot|#39|nbsp);/g, entity => HTML_ENTITIES[entity] ?? entity)
}

function toPlainText(value: string): string {
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

const CW      = 800
const CH      = 540
const CX      = 400
const CY      = 270
const RADIUS  = 205
const PANEL_W = 300

// ── Node definitions ──────────────────────────────────────────────────────────

type NodeKind = 'cls' | 'card'
type OverviewLayerId = 'contexto_carta' | 'estrutura_texto' | 'sintese_exegetica' | 'sintese_homiletica'

interface NodeDef {
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
}

const SERMAO_EPISTOLAR_LAYERS: Array<{ id: OverviewLayerId; label: string; subtitle: string; color: string }> = [
  { id: 'contexto_carta', label: 'Contexto da Carta', subtitle: 'Quem escreveu e para quem', color: '#6D28D9' },
  { id: 'estrutura_texto', label: 'Estrutura do Texto', subtitle: 'Como o argumento se organiza', color: '#163A6B' },
  { id: 'sintese_exegetica', label: 'Síntese Exegética', subtitle: 'O que o texto ensina', color: '#D97706' },
  { id: 'sintese_homiletica', label: 'Síntese Homilética', subtitle: 'Como será comunicado', color: '#059669' },
]

const EPISTLE_BOOKS = new Set([
  'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
  'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo',
  'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
  '3 João', 'Judas',
])

function isEpistleBook(book: string): boolean {
  return EPISTLE_BOOKS.has(book.trim())
}

function isEpistolarySermon(project: Project): boolean {
  return project.study_mode === 'sermao' && isEpistleBook(project.book)
}

function cardDef(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

const VG_CARD_DEFS: Record<string, SectionDef['cards'][number]> = {
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

const CARTA_BASE_NODES: NodeDef[] = [
  { key: 'vg_autor',         label: 'Autor',           icon: '✍',  angle: -90,  color: '#6D28D9', bg: '#F5F3FF', kind: 'card', sectionSlug: 'autor_destinatarios', sectionCardId: 'autor' },
  { key: 'vg_destinatarios', label: 'Destinatários',   icon: '📬', angle: -45,  color: '#7C3AED', bg: '#EDE9FE', kind: 'card', sectionSlug: 'autor_destinatarios', sectionCardId: 'destinatarios' },
  { key: 'vg_contexto',      label: 'Contexto Hist.',  icon: '📅', angle: 0,    color: '#4F46E5', bg: '#EEF2FF', kind: 'card', sectionSlug: 'contexto_historico' },
  { key: 'vg_proposito',     label: 'Propósito',       icon: '🎯', angle: 45,   color: '#163A6B', bg: '#EEF3FA', kind: 'card', sectionSlug: 'ec_ocasiao', sectionCardId: 'proposito' },
  { key: 'vg_estrutura',     label: 'Estrutura Geral', icon: '⊞',  angle: 90,   color: '#0369A1', bg: '#EEF3FA', kind: 'card', sectionSlug: 'ec_estrutura', sectionCardId: 'macroargumento' },
  { key: 'vg_temas',         label: 'Temas',           icon: '📖', angle: 135,  color: '#059669', bg: '#F0FDF4', kind: 'card', sectionSlug: 'ec_estrutura' },
  { key: 'vg_argumento',     label: 'Argumento',       icon: '⟶', angle: 180,  color: '#D97706', bg: '#FFFBEB', kind: 'card', sectionSlug: 'ec_argumento', sectionCardId: 'tese_central' },
  { key: 'vg_blocos',        label: 'Grandes Blocos',  icon: '▦',  angle: -135, color: '#475569', bg: '#F8FAFC', kind: 'card', sectionSlug: 'estrutura_livro', sectionCardId: 'divisoes_principais' },
]

const SERMAO_NODES: NodeDef[] = [
  { key: 'vg_assunto',    label: 'Assunto',       icon: '📌', angle: -90,  color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_assunto'] },
  { key: 'vg_tema',       label: 'Tema Central',  icon: '🎯', angle: -45,  color: '#6D28D9', bg: '#EDE9FE', kind: 'card', cardIds: ['vg_tema'] },
  { key: 'vg_movimento',  label: 'Movimento',     icon: '⟶', angle: 0,    color: '#4F46E5', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_movimento'] },
  { key: 'vg_divisoes',   label: 'Divisões',      icon: '⊞',  angle: 45,   color: '#4338CA', bg: '#EEF2FF', kind: 'card', cardIds: ['vg_divisoes'] },
  { key: 'vg_climax',     label: 'Clímax',        icon: '✦',  angle: 90,   color: '#7C3AED', bg: '#F5F3FF', kind: 'card', cardIds: ['vg_climax'] },
  { key: 'vg_verdade',    label: 'Verdade',       icon: '💡', angle: 135,  color: '#D97706', bg: '#FFFBEB', kind: 'card', cardIds: ['vg_verdade'] },
  { key: 'vg_cristo',     label: 'Cristo',        icon: '✚',  angle: 180,  color: '#BE3455', bg: '#FFF1F2', kind: 'card', cardIds: ['vg_cristo'] },
  { key: 'vg_aplicacoes', label: 'Aplicações',    icon: '🎯', angle: -135, color: '#059669', bg: '#F0FDF4', kind: 'card', cardIds: ['vg_aplicacoes'] },
]

const SERMAO_EPISTOLAR_NODES: NodeDef[] = [
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

const MODE_NODES_MAP: Record<string, NodeDef[]> = {
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

// ── Prompt de IA por modo (para o botão "Organizar com IA" em cada nó) ────────

function buildVGNodePrompt(project: Project, node: NodeDef): string {
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

function getOverviewNodes(project: Project): NodeDef[] {
  if (isEpistolarySermon(project)) {
    return SERMAO_EPISTOLAR_NODES
  }
  return MODE_NODES_MAP[project.study_mode ?? ''] ?? MODE_NODES_MAP.exegese_biblica
}

function createOverviewSectionDef(sectionDef: SectionDef, nodes: NodeDef[], project: Project): SectionDef {
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

function nodeXY(angle: number, r = RADIUS) {
  const rad = (angle * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  allVGSections?: Section[]
  allSections?: Section[]
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
  onOpenBible?: () => void
  onNavigate?: (slug: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisaoGeralWorkspace({
  sectionDef, project, userId, existingSection, allVGSections, allSections = [], onUpdate, onAskAI, onOpenBible, onNavigate,
}: Props) {
  const supabase    = useMemo(() => createClient(), [])
  const wrapRef     = useRef<HTMLDivElement>(null)

  const isLayeredSermon = isEpistolarySermon(project)

  // Nós adaptativos ao modo de estudo
  const allNodes = useMemo<NodeDef[]>(
    () => getOverviewNodes(project),
    [project.study_mode, project.book],
  )
  const [activeLayer, setActiveLayer] = useState<OverviewLayerId>('contexto_carta')
  const nodes = useMemo<NodeDef[]>(
    () => isLayeredSermon ? allNodes.filter(node => node.layer === activeLayer) : allNodes,
    [allNodes, activeLayer, isLayeredSermon],
  )
  const effectiveSectionDef = useMemo(
    () => createOverviewSectionDef(sectionDef, allNodes, project),
    [sectionDef, allNodes, project],
  )

  // Nó central: para modos temáticos (sem perícope), mostra o tema/doutrina
  const isPassageMode = project.book !== '—'
  const centerTitle   = isPassageMode ? project.book : 'Tema'
  const centerSub     = isPassageMode ? project.passage_ref : project.passage_ref

  // Fase da visão geral (derivada do slug)
  const phase = sectionDef.slug === 'preparar_visao_geral' ? 'preparar'
    : sectionDef.slug === 'investigar_visao_geral' ? 'investigar'
    : 'pregar'
  const prevSlug = phase === 'investigar' ? 'preparar_visao_geral'
    : phase === 'pregar' ? 'investigar_visao_geral'
    : null
  const PHASE_LABEL: Record<string, string> = {
    preparar: 'Inicial', investigar: 'Investigativa', pregar: 'Homilética',
  }
  const PHASE_COLOR: Record<string, string> = {
    preparar: '#D97706', investigar: '#163A6B', pregar: '#7C3AED',
  }

  const [mode,         setMode]        = useState<'visual' | 'structured'>('visual')
  const [activePanel,  setActivePanel] = useState<string | null>(null)
  const [hoveredNode,  setHoveredNode] = useState<string | null>(null)
  const [cls,          setCls]         = useState<Classification[]>([])
  const [wrapW,        setWrapW]       = useState(CW)
  const [cardDraft,    setCardDraft]   = useState<Record<string, string>>({})
  const [savingCard,   setSavingCard]  = useState<string | null>(null)
  const [itemMenuState,setItemMenuState] = useState<{ id: string; x: number; y: number } | null>(null)
  const [aiLoading,    setAiLoading]   = useState<string | null>(null)      // cls id
  const [aiResults,    setAiResults]   = useState<Record<string, string>>({}) // cls id → text
  const [toast,        setToast]       = useState<string | null>(null)
  const [activeItem,   setActiveItem]  = useState<Classification | null>(null)
  const [fieldLoading, setFieldLoading]= useState<Record<string, boolean>>({})
  const [dictSaving,   setDictSaving]  = useState(false)
  const [dictSaved,    setDictSaved]   = useState(false)
  // Modal de expansão de campo
  const [expandedField, setExpandedField] = useState<{ label: string; fieldKey: keyof Classification } | null>(null)
  const [expandDraft,   setExpandDraft]   = useState('')
  const [expandMode,    setExpandMode]    = useState<'view' | 'edit'>('view')

  // Evolução das fases
  const [inherited,       setInherited]       = useState(false)
  const [showEvolution,   setShowEvolution]   = useState(false)
  const [evolutionLoading,setEvolutionLoading]= useState(false)
  const [evolutionData,   setEvolutionData]   = useState<{
    preparar?: Record<string, string>
    investigar?: Record<string, string>
    pregar?: Record<string, string>
  } | null>(null)

  useEffect(() => {
    setActivePanel(null)
    setActiveItem(null)
  }, [activeLayer])

  // ── Data — carrega do banco (fonte de verdade) e sincroniza localStorage ───
  useEffect(() => {
    let mounted = true
    // 1. Exibe localStorage imediatamente (zero latência)
    const local = readCls(project.id)
    setCls(local)

    // 2. Sincroniza com o banco em background
    loadClassificationsFromDB(project.id).then(fromDB => {
      if (!mounted) return
      if (fromDB.length === 0) return
      const dbIds = new Set(fromDB.map(c => c.id))
      const onlyLocal = local.filter(c => !dbIds.has(c.id))
      const merged = [...fromDB, ...onlyLocal] as Classification[]
      setCls(merged)
      writeCls(project.id, merged)
    })

    // 3. Polling leve para capturar mudanças do BibleTextBlock (mesma aba)
    const intervalId = window.setInterval(() => {
      if (!mounted) return
      const fresh = readCls(project.id)
      setCls(prev => {
        if (prev.length === fresh.length && JSON.stringify(prev) === JSON.stringify(fresh)) return prev
        return fresh
      })
    }, 2000)

    return () => { mounted = false; window.clearInterval(intervalId) }
  }, [project.id])

  // Herança automática: copia conteúdo da fase anterior na primeira abertura
  useEffect(() => {
    if (phase === 'preparar' || existingSection) return
    let mounted = true
    supabase.from('sections')
      .select('content')
      .eq('project_id', project.id)
      .eq('slug', prevSlug!)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data?.content) return
        const prevCards = (data.content as { cards?: Record<string, string> })?.cards ?? {}
        if (Object.keys(prevCards).length > 0) {
          setCardDraft(prevCards)
          setInherited(true)
        }
      })
    return () => { mounted = false }
  }, [phase, project.id, prevSlug, existingSection?.id, supabase])

  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(e => setWrapW(e[0].contentRect.width))
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // fechar menu ao clicar fora — setTimeout garante que o listener só existe
  // no próximo tick, após o click atual terminar de propagar
  useEffect(() => {
    if (!itemMenuState) return
    let handler: (() => void) | null = null
    const timer = setTimeout(() => {
      handler = () => setItemMenuState(null)
      document.addEventListener('click', handler)
    }, 0)
    return () => {
      clearTimeout(timer)
      if (handler) document.removeEventListener('click', handler)
    }
  }, [itemMenuState])

  const cards = useMemo(
    () => (existingSection?.content as { cards?: Record<string, string> } | null)?.cards ?? {},
    [existingSection],
  )

  // ── Node data helpers ──────────────────────────────────────────────────────
  const getLinkedSection = (node: NodeDef): Section | undefined =>
    node.sectionSlug ? allSections.find(section => section.slug === node.sectionSlug) : undefined

  const getLinkedCards = (node: NodeDef): Record<string, string> => {
    const section = getLinkedSection(node)
    return (section?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
  }

  const getLinkedCardEntries = (node: NodeDef): Array<readonly [string, string]> => {
    const linkedCards = getLinkedCards(node)
    const entries = node.sectionCardId
      ? [[node.sectionCardId, linkedCards[node.sectionCardId] ?? '']] as Array<readonly [string, string]>
      : Object.entries(linkedCards)

    return entries
      .map(([key, value]) => [key, value?.trim() ?? ''] as const)
      .filter(([, value]) => Boolean(value))
  }

  const getClsItems = (node: NodeDef): Classification[] =>
    node.kind === 'cls' && node.clsTypes
      ? cls.filter(c => node.clsTypes!.includes(c.type))
      : []

  const getCardText = (node: NodeDef): string =>
    node.sectionSlug
      ? getLinkedCardEntries(node).map(([, value]) => value).join('\n\n')
      : node.kind === 'card' && node.cardIds
      ? node.cardIds.map(id => cards[id]?.trim()).filter(Boolean).join('\n\n')
      : ''

  const getCount = (node: NodeDef): number =>
    node.sectionSlug
      ? getLinkedCardEntries(node).length
      : node.kind === 'cls' ? getClsItems(node).length : (getCardText(node) ? 1 : 0)

  const getNodeSummary = (node: NodeDef): string => {
    const text = toPlainText(getCardText(node)).replace(/\s+/g, ' ').trim()
    return text.length > 220 ? `${text.slice(0, 220)}...` : text
  }

  const totalItems = nodes.reduce((s, n) => s + getCount(n), 0)

  // ── Abrir modal de evolução das fases ─────────────────────────────────────
  const openEvolution = useCallback(async () => {
    setEvolutionLoading(true)
    try {
      // Prioriza allVGSections passado pelo WorkspaceClient (evita fetch extra)
      const local = allVGSections ?? []
      const slugsNeeded = ['preparar_visao_geral', 'investigar_visao_geral', 'pregar_visao_geral']
      const hasFull = slugsNeeded.every(s => local.some(sec => sec.slug === s))

      let rows = local
      if (!hasFull) {
        const { data } = await supabase.from('sections')
          .select('slug, content')
          .eq('project_id', project.id)
          .in('slug', slugsNeeded)
        rows = (data ?? []) as typeof rows
      }

      const result: NonNullable<typeof evolutionData> = {}
      for (const s of rows) {
        const ph = s.slug === 'preparar_visao_geral' ? 'preparar'
          : s.slug === 'investigar_visao_geral' ? 'investigar' : 'pregar'
        result[ph as 'preparar' | 'investigar' | 'pregar'] =
          (s.content as { cards?: Record<string, string> })?.cards ?? {}
      }
      setEvolutionData(result)
      setShowEvolution(true)
    } finally {
      setEvolutionLoading(false)
    }
  }, [allVGSections, project.id, supabase, evolutionData])

  // ── Save card ──────────────────────────────────────────────────────────────
  const saveCard = useCallback(async (cardId: string, value: string) => {
    setSavingCard(cardId)
    try {
      const { data } = await supabase.from('sections').select()
        .eq('project_id', project.id).eq('slug', sectionDef.slug).maybeSingle()
      const prev    = (data?.content as { cards?: Record<string, string> } | null)?.cards ?? {}
      const payload = {
        project_id: project.id, user_id: userId, slug: sectionDef.slug,
        module: 'inventio' as const, title: sectionDef.title,
        status: 'draft' as const, content: { cards: { ...prev, [cardId]: value } },
      }
      const op = data?.id
        ? supabase.from('sections').update(payload).eq('id', data.id).select().single()
        : supabase.from('sections').insert(payload).select().single()
      const { data: updated } = await op
      if (updated) onUpdate(updated as Section)
    } catch { /* noop */ }
    finally { setSavingCard(null) }
  }, [supabase, project.id, userId, sectionDef, onUpdate])

  // Reset detail panel when node changes
  useEffect(() => { setActiveItem(null); setDictSaved(false) }, [activePanel])

  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // ── Update cls field (also keeps activeItem in sync) ──────────────────────
  function updateClsField(id: string, fields: Partial<Classification>) {
    setCls(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...fields } : c)
      writeCls(project.id, next)
      return next
    })
    setActiveItem(prev => (prev?.id === id ? { ...prev, ...fields } : prev))
    updateClassificationInDB(id, fields)
  }

  // ── Abre o painel de detalhe para um termo (batched com outros setState) ───
  function openTermDetail(c: Classification) {
    const node = nodes.find(n => n.clsTypes?.includes(c.type))
    if (node) setActivePanel(node.key)
    setDictSaved(false)
    setActiveItem(c)
  }

  // ── Generate field inline (AI → salva no próprio termo, nunca abre chat) ──
  async function generateField(c: Classification, kind: string, fieldKey: keyof Classification) {
    const FIELD_NAMES: Record<string, string> = {
      description: 'Definição', analysis: 'Explicação', lexical: 'Estudo Lexical',
      theological_biblical: 'Teologia Bíblica', narrative_function: 'Função Narrativa',
      applications: 'Aplicações', original_term: 'Línguas Originais',
    }
    const fieldName = FIELD_NAMES[kind] ?? kind
    const loadKey   = `${c.id}:${kind}`

    setFieldLoading(prev => ({ ...prev, [loadKey]: true }))
    try {
      const res  = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: c.selectedText, type: c.type, startVerse: c.startVerse, book: project.book, passageRef: project.passage_ref, kind }),
      })
      const data = await res.json() as { result?: string; error?: string; upgrade?: boolean }

      if (!res.ok || data.error) {
        if (data.upgrade) showToast('Limite de IA atingido — faça upgrade do plano')
        else showToast(`Erro ao gerar ${fieldName}: ${data.error ?? 'Tente novamente'}`)
        return
      }

      if (data.result) {
        if (kind === 'original_term') {
          const parts = data.result.split('|').map((s: string) => s.trim())
          updateClsField(c.id, { original_term: parts[0] ?? '', transliteration: parts[1] ?? '', meaning: parts[2] ?? '' })
        } else {
          updateClsField(c.id, { [fieldKey]: data.result })
        }
        showToast(`${fieldName} gerada para "${c.selectedText}"`)
      } else {
        showToast(`Resposta vazia da IA — tente novamente`)
      }
    } catch {
      showToast('Erro de conexão com a IA — tente novamente')
    } finally {
      setFieldLoading(prev => { const n = { ...prev }; delete n[loadKey]; return n })
    }
  }

  // ── Save classification to Dicionário Lampas ──────────────────────────────
  async function saveToDictionary(item: Classification) {
    setDictSaving(true)
    try {
      const catMap: Partial<Record<ClassType, string>> = {
        personagem: 'personagem', cargo: 'personagem', lugar: 'lugar',
        tema: 'tema', teologia: 'doutrina', termo_chave: 'termo_biblico',
        repeticao: 'termo_biblico',
      }
      await supabase.from('lampas_dictionary').insert({
        user_id: userId, title: item.selectedText,
        category: catMap[item.type] ?? 'conceito_historico',
        trust_level: 1,
        definition: item.definition ?? item.explanation ?? null,
        transliteration: item.transliteration ?? null,
        occurrences: item.occurrences_note ?? null,
        main_texts: `${project.book} ${project.passage_ref}, v.${item.startVerse}`,
        theological_biblical: item.theological_biblical ?? null,
        applications: item.applications ?? null,
        sources: ['Visão Geral'], tags: [item.type],
        cross_references: [], related_terms: [],
      })
      setDictSaved(true)
      showToast(`"${item.selectedText}" salvo no Dicionário Lampas`)
    } catch { /* noop */ }
    finally { setDictSaving(false) }
  }

  // ── Remove cls item ────────────────────────────────────────────────────────
  const removeCls = (id: string) => {
    const next = cls.filter(c => c.id !== id)
    setCls(next); writeCls(project.id, next)
    setItemMenuState(null)
    deleteClassificationFromDB(id)
  }

  // ── Open item menu at button position ──────────────────────────────────────
  function openItemMenu(e: React.MouseEvent, id: string) {
    e.stopPropagation() // evita que o click handler do document feche o menu recém-aberto
    if (itemMenuState?.id === id) { setItemMenuState(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setItemMenuState({ id, x: rect.right, y: rect.top })
  }

  // ── Gerar explicação com IA (inline) ──────────────────────────────────────
  async function generateExplanation(c: Classification) {
    setItemMenuState(null)
    setAiLoading(c.id)
    try {
      const res = await fetch('/api/claude/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: c.selectedText, type: c.type, startVerse: c.startVerse, book: project.book, passageRef: project.passage_ref, kind: 'description' }),
      })
      const data = await res.json() as { result?: string }
      if (data.result) setAiResults(prev => ({ ...prev, [c.id]: data.result! }))
    } catch { /* noop */ }
    finally { setAiLoading(null) }
  }

  // ── Send to section (text append) ─────────────────────────────────────────
  async function sendToSection(c: Classification, slug: string, title: string, cardId?: string) {
    setItemMenuState(null)
    const line = `**${c.selectedText}** (v.${c.startVerse}) — ${c.type}`
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', slug).maybeSingle()
      const base = { project_id: project.id, user_id: userId, slug, module: 'inventio' as const, title, status: 'draft' as const }
      if (cardId) {
        const cards = ((data?.content as { cards?: Record<string, string> } | null)?.cards) ?? {}
        const prev  = cards[cardId] ?? ''
        const payload = { ...base, content: { cards: { ...cards, [cardId]: prev ? `${prev}\n${line}` : line } } }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      } else {
        const prev = (data?.ai_output as string | null) ?? ''
        const payload = { ...base, ai_output: prev ? `${prev}\n\n${line}` : line }
        if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
        else          await supabase.from('sections').insert(payload)
      }
      showToast(`Enviado para ${title}`)
    } catch { showToast('Erro ao enviar') }
  }

  // ── Transformar em Colagem ─────────────────────────────────────────────────
  async function createCollage(c: Classification) {
    setItemMenuState(null)
    const TYPE_LABELS: Record<string, string> = { personagem: 'Personagem', lugar: 'Lugar', tema: 'Tema', termo_chave: 'Termo-Chave', conflito: 'Conflito', repeticao: 'Repetição', teologia: 'Teologia', cargo: 'Cargo' }
    try {
      const { data } = await supabase.from('sections').select().eq('project_id', project.id).eq('slug', 'colagens').maybeSingle()
      const items: CollageItem[] = ((data?.content as { type?: string; items?: CollageItem[] } | null)?.items) ?? []
      const newItem: CollageItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        type: 'trecho', title: `${TYPE_LABELS[c.type] ?? c.type}: "${c.selectedText}"`,
        content: `${c.selectedText}\n\n— ${project.book} ${project.passage_ref}, v.${c.startVerse}${aiResults[c.id] ? `\n\n${aiResults[c.id]}` : ''}`,
        author: '', work: `${project.book} ${project.passage_ref}`, page: `v.${c.startVerse}`,
        tags: [TYPE_LABELS[c.type] ?? c.type], category: 'Exegese', linkedTo: 'Perícope', x: 0, y: 0,
      }
      const payload = { project_id: project.id, user_id: userId, slug: 'colagens', module: 'inventio' as const, title: 'Colagens', status: 'draft' as const, content: { type: 'collages_workspace', items: [...items, newItem] } }
      if (data?.id) await supabase.from('sections').update(payload).eq('id', data.id)
      else          await supabase.from('sections').insert(payload)
      showToast('Adicionado às Colagens')
    } catch { showToast('Erro ao criar colagem') }
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  const PANEL_GAP = 12
  const canvasAreaW  = activePanel ? Math.max(wrapW - PANEL_W - PANEL_GAP, 300) : wrapW
  const scale        = Math.min(1, (canvasAreaW - 8) / CW)
  const scaledH      = CH * scale

  const activeNode = nodes.find(n => n.key === activePanel) ?? null
  const activeLayerMeta = SERMAO_EPISTOLAR_LAYERS.find(layer => layer.id === activeLayer)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.25rem 1.5rem 2rem' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.87rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Visão Geral
            </div>
            <span style={{
              fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: PHASE_COLOR[phase],
              background: PHASE_COLOR[phase] + '15',
              border: `1px solid ${PHASE_COLOR[phase]}30`,
              padding: '2px 7px', borderRadius: '999px',
            }}>
              {PHASE_LABEL[phase]}
            </span>
          </div>
          <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {isPassageMode ? `${project.book} ${project.passage_ref}` : project.passage_ref}
          </div>
          {mode === 'visual' && (
            <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
              {totalItems === 0
                ? <span style={{ color: '#B45309' }}>Marque palavras no Texto Bíblico para construir o mapa.</span>
                : `${totalItems} elemento${totalItems !== 1 ? 's' : ''} mapeado${totalItems !== 1 ? 's' : ''}${activePanel ? ' — clique fora para fechar o painel' : ' — clique em um nó para explorar'}.`}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {mode === 'visual' && activePanel && (
            <button onClick={() => setActivePanel(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', padding: '5px 10px', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <X size={11} /> Fechar painel
            </button>
          )}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surface-2, #F1F5F9)', borderRadius: '8px', padding: '2px' }}>
            {(['visual', 'structured'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setActivePanel(null) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: mode === m ? '#FFFFFF' : 'transparent', border: 'none',
                  borderRadius: '6px', padding: '5px 11px', fontSize: '0.7rem', fontWeight: 600,
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                {m === 'visual' ? <><Map size={11} strokeWidth={1.75} />Mapa</> : <><List size={11} strokeWidth={1.75} />Estruturado</>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'visual' && isLayeredSermon && (
        <div style={{
          marginBottom: '1rem',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '0.55rem',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.35rem' }}>
            {SERMAO_EPISTOLAR_LAYERS.map((layer, index) => {
              const layerNodes = allNodes.filter(node => node.layer === layer.id)
              const filled = layerNodes.filter(node => getCount(node) > 0).length
              const active = activeLayer === layer.id

              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${active ? layer.color + '55' : '#E2E8F0'}`,
                    background: active ? layer.color + '0D' : '#F8FAFC',
                    borderRadius: '9px',
                    padding: '0.55rem 0.65rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    minWidth: 0,
                    transition: 'all 0.14s',
                  }}
                  onMouseEnter={e => {
                    if (active) return
                    e.currentTarget.style.borderColor = layer.color + '35'
                    e.currentTarget.style.background = '#FFFFFF'
                  }}
                  onMouseLeave={e => {
                    if (active) return
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.background = '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    <span style={{
                      width: '1.15rem',
                      height: '1.15rem',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: active ? layer.color : '#E2E8F0',
                      color: active ? '#FFFFFF' : '#64748B',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                    }}>
                      {index + 1}
                    </span>
                    <span style={{
                      color: active ? layer.color : '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 750,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {layer.label}
                    </span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '0.62rem', lineHeight: 1.35, marginTop: '0.25rem' }}>
                    {layer.subtitle}
                  </div>
                  <div style={{ color: active ? layer.color : '#94A3B8', fontSize: '0.58rem', fontWeight: 700, marginTop: '0.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {filled}/{layerNodes.length} preenchidos
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{
            marginTop: '0.55rem',
            padding: '0.45rem 0.55rem',
            borderRadius: '8px',
            background: (activeLayerMeta?.color ?? '#64748B') + '0A',
            color: activeLayerMeta?.color ?? '#64748B',
            fontSize: '0.7rem',
            lineHeight: 1.45,
          }}>
            {activeLayerMeta?.label}: {activeLayerMeta?.subtitle}. Avance pelas camadas para ir da compreensão da carta à formulação do sermão.
          </div>
        </div>
      )}

      {/* ── Banner de fase (INVESTIGAR / COMUNICAR) ────────────────────────── */}
      {phase !== 'preparar' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', flexWrap: 'wrap',
          marginBottom: '1rem',
          padding: '0.6rem 0.9rem',
          background: PHASE_COLOR[phase] + '0C',
          border: `1px solid ${PHASE_COLOR[phase]}25`,
          borderRadius: '8px',
        }}>
          <span style={{ fontSize: '0.73rem', color: PHASE_COLOR[phase], lineHeight: 1.5 }}>
            {inherited
              ? `Conteúdo herdado da etapa ${phase === 'investigar' ? 'Preparar' : 'Investigar'}. Evolua livremente — as versões anteriores não são alteradas.`
              : `Esta visão pode ser desenvolvida sem alterar versões anteriores.`}
          </span>
          <button
            onClick={openEvolution}
            disabled={evolutionLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
              background: 'transparent',
              border: `1px solid ${PHASE_COLOR[phase]}40`,
              borderRadius: '6px', padding: '4px 10px',
              fontSize: '0.7rem', fontWeight: 600,
              color: PHASE_COLOR[phase], cursor: evolutionLoading ? 'wait' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = PHASE_COLOR[phase] + '15' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {evolutionLoading ? '…' : '✓ Ver evolução'}
          </button>
        </div>
      )}

      {/* ── Structured ─────────────────────────────────────────────────────── */}
      {mode === 'structured' && (
        <SectionWorkspace sectionDef={effectiveSectionDef} project={project} userId={userId}
          existingSection={existingSection} onUpdate={onUpdate} onAskAI={onAskAI} />
      )}

      {/* ── Visual ─────────────────────────────────────────────────────────── */}
      {mode === 'visual' && (
        <>
          <div ref={wrapRef} style={{ display: 'flex', gap: `${PANEL_GAP}px`, alignItems: 'flex-start' }}>

            {/* Canvas */}
            <div style={{ position: 'relative', height: `${scaledH}px`, flex: 1, minWidth: 0, transition: 'all 0.25s ease' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0,
                width: `${CW}px`, height: `${CH}px`,
                transform: `scale(${scale})`, transformOrigin: 'top left',
              }}>

                {/* ── SVG Lines ── */}
                <svg
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`}
                >
                  <defs>
                    {nodes.map(node => {
                      const { x: nx, y: ny } = nodeXY(node.angle, node.radius ?? RADIUS)
                      return (
                        <linearGradient key={`g-${node.key}`} id={`grad-${node.key}`}
                          x1={CX} y1={CY} x2={nx} y2={ny} gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor={node.color} stopOpacity={getCount(node) > 0 ? '0.5' : '0.2'} />
                        </linearGradient>
                      )
                    })}
                    {nodes.map(node => {
                      const { x: nx, y: ny } = nodeXY(node.angle, node.radius ?? RADIUS)
                      return (
                        <linearGradient key={`ga-${node.key}`} id={`grad-active-${node.key}`}
                          x1={CX} y1={CY} x2={nx} y2={ny} gradientUnits="userSpaceOnUse"
                        >
                          <stop offset="0%" stopColor={node.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={node.color} stopOpacity="0.9" />
                        </linearGradient>
                      )
                    })}
                  </defs>

                  {nodes.map(node => {
                    const { x: nx, y: ny } = nodeXY(node.angle, node.radius ?? RADIUS)
                    const isHov = hoveredNode === node.key
                    const isAct = activePanel === node.key
                    const hasData = getCount(node) > 0

                    // Cubic bezier — control points create a gentle sweep
                    const dx   = nx - CX; const dy = ny - CY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const px   = -dy / dist; const py = dx / dist // perpendicular
                    const BEND = 18
                    const cp1x = CX + dx * 0.32 + px * BEND
                    const cp1y = CY + dy * 0.32 + py * BEND
                    const cp2x = CX + dx * 0.68 + px * BEND
                    const cp2y = CY + dy * 0.68 + py * BEND

                    return (
                      <path key={node.key}
                        d={`M ${CX} ${CY} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${nx} ${ny}`}
                        stroke={isHov || isAct ? `url(#grad-active-${node.key})` : `url(#grad-${node.key})`}
                        strokeWidth={isHov || isAct ? 2 : (hasData ? 1.5 : 1)}
                        strokeDasharray={hasData ? 'none' : '5 4'}
                        fill="none"
                        strokeLinecap="round"
                        style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
                      />
                    )
                  })}
                </svg>

                {/* ── Center node ── */}
                <button onClick={onOpenBible}
                  style={{
                    position: 'absolute', left: `${CX}px`, top: `${CY}px`,
                    transform: 'translate(-50%, -50%)',
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '18px',
                    padding: '18px 28px',
                    textAlign: 'center', zIndex: 4,
                    boxShadow: '0 0 0 6px rgba(226,232,240,0.35), 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
                    minWidth: '175px',
                    cursor: onOpenBible ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    transition: 'box-shadow 0.2s, transform 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!onOpenBible) return
                    e.currentTarget.style.boxShadow = '0 0 0 8px rgba(226,232,240,0.5), 0 12px 40px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.02)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(226,232,240,0.35), 0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)'
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'
                  }}
                >
                  <div style={{ fontSize: '1.35rem', marginBottom: '6px', lineHeight: 1 }}>
                    {isPassageMode ? '📖' : '📚'}
                  </div>
                  <div style={{
                    fontSize: isPassageMode ? '0.9rem' : '0.75rem',
                    fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2,
                    maxWidth: '150px', textAlign: 'center',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isPassageMode ? 'nowrap' : 'normal',
                    WebkitLineClamp: isPassageMode ? undefined : 3,
                    display: isPassageMode ? undefined : '-webkit-box',
                    WebkitBoxOrient: isPassageMode ? undefined : 'vertical',
                  }}>
                    {centerTitle}
                  </div>
                  {centerSub && (
                    <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '3px', letterSpacing: '0.01em' }}>
                      {centerSub}
                    </div>
                  )}
                  {onOpenBible && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '8px', fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <BookOpen size={9} strokeWidth={2} /> abrir
                    </div>
                  )}
                  {totalItems > 0 && (
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.59rem', color: '#94A3B8', background: '#F1F5F9', borderRadius: '8px', padding: '1px 7px' }}>
                        {totalItems} elem.
                      </span>
                    </div>
                  )}
                </button>

                {/* ── Outer nodes ── */}
                {nodes.map(node => {
                  const { x: nx, y: ny } = nodeXY(node.angle, node.radius ?? RADIUS)
                  const count   = getCount(node)
                  const hasData = count > 0
                  const isAct   = activePanel === node.key

                  return (
                    <div key={node.key}
                      style={{ position: 'absolute', left: `${nx}px`, top: `${ny}px`, transform: 'translate(-50%, -50%)', zIndex: 5 }}
                      onMouseEnter={() => setHoveredNode(node.key)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <button
                        onClick={() => setActivePanel(isAct ? null : node.key)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          background: isAct ? node.bg : '#FFFFFF',
                          border: `1.5px solid ${isAct ? node.color : (hasData ? node.color + '45' : '#E2E8F0')}`,
                          borderRadius: '13px',
                          padding: hasData ? '10px 16px' : '9px 15px',
                          cursor: 'pointer', minWidth: '108px',
                          fontFamily: 'inherit', userSelect: 'none',
                          boxShadow: isAct
                            ? `0 0 0 4px ${node.color}18, 0 4px 18px ${node.color}20, 0 1px 4px rgba(0,0,0,0.06)`
                            : hasData
                              ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                              : '0 1px 2px rgba(0,0,0,0.03)',
                          outline: 'none',
                          transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                          transform: isAct ? 'scale(1.06)' : 'scale(1)',
                        }}
                        onMouseEnter={e => { if (!isAct) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = hasData ? `0 4px 14px ${node.color}25, 0 1px 3px rgba(0,0,0,0.05)` : '0 2px 8px rgba(0,0,0,0.08)' } }}
                        onMouseLeave={e => { if (!isAct) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = hasData ? '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.03)' } }}
                      >
                        <span style={{ fontSize: '1rem', lineHeight: 1, marginBottom: '4px' }}>{node.icon}</span>
                        <span style={{
                          fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.05em',
                          textTransform: 'uppercase', textAlign: 'center',
                          color: hasData ? node.color : '#94A3B8',
                          lineHeight: 1.25,
                        }}>
                          {node.label}
                        </span>
                        {hasData ? (
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800, color: node.color,
                            background: node.color + '18', borderRadius: '20px',
                            padding: '2px 8px', marginTop: '5px', lineHeight: 1,
                          }}>
                            {count}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.55rem', color: '#CBD5E1', marginTop: '3px', letterSpacing: '0.08em' }}>vazio</span>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Side panel ── */}
            {activeNode && (
              <div style={{
                width: `${PANEL_W}px`, flexShrink: 0,
                background: '#FFFFFF',
                border: `1px solid ${activeNode.color}28`,
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: `0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)`,
                animation: 'slideInRight 0.2s cubic-bezier(0.16,1,0.3,1)',
                alignSelf: 'flex-start',
                display: 'flex', flexDirection: 'column',
                maxHeight: '560px',
              }}>

                {/* Panel header */}
                <div style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: activeNode.bg,
                  borderBottom: `1px solid ${activeNode.color}18`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    {activeItem && activeNode.kind === 'cls' ? (
                      <button
                        onClick={() => setActiveItem(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: activeNode.color, fontSize: '0.72rem', fontWeight: 600, padding: 0, fontFamily: 'inherit' }}
                      >
                        <ChevronLeft size={13} strokeWidth={2} /> {activeNode.label}
                      </button>
                    ) : (
                      <>
                        <span style={{ fontSize: '1rem' }}>{activeNode.icon}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeNode.color }}>
                          {activeNode.label}
                        </span>
                        {getCount(activeNode) > 0 && (
                          <span style={{ fontSize: '0.63rem', fontWeight: 700, color: activeNode.color, background: activeNode.color + '20', borderRadius: '10px', padding: '1px 7px' }}>
                            {getCount(activeNode)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <button onClick={() => { setActiveItem(null); setActivePanel(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '3px', display: 'flex', borderRadius: '5px', transition: 'color 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Panel body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: activeItem && activeNode.kind === 'cls' ? '0' : '8px' }}>

                  {/* ── DETAIL VIEW — termo selecionado ── */}
                  {activeItem && activeNode.kind === 'cls' && (() => {
                    const c     = activeItem
                    const color = activeNode.color

                    function aiBtn(kind: string, fieldKey: keyof Classification) {
                      const loading = fieldLoading[`${c.id}:${kind}`]
                      return (
                        <button
                          onClick={() => generateField(c, kind, fieldKey)}
                          disabled={loading}
                          style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: `1px solid ${color}35`, borderRadius: '4px', padding: '2px 6px', fontSize: '0.58rem', fontWeight: 600, color: loading ? '#CBD5E1' : color, cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
                        >
                          {loading ? <Loader2 size={8} strokeWidth={2} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={8} strokeWidth={2} />}
                          {loading ? '…' : 'IA'}
                        </button>
                      )
                    }

                    function openExpand(label: string, fieldKey: keyof Classification, value: string) {
                      setExpandDraft(value)
                      setExpandMode(value.trim() ? 'view' : 'edit')
                      setExpandedField({ label, fieldKey })
                    }

                    function fieldRow(label: string, fieldKey: keyof Classification, kind: string, rows = 2, expandable = false) {
                      const val = (c[fieldKey] as string | undefined) ?? ''
                      return (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                            <label style={{ fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {expandable && (
                                <button
                                  onClick={() => openExpand(label, fieldKey, val)}
                                  title="Expandir"
                                  style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: `1px solid #E2E8F0`, borderRadius: '4px', padding: '2px 5px', fontSize: '0.57rem', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}
                                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}
                                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#94A3B8' }}
                                >
                                  <Maximize2 size={8} strokeWidth={2} /> ↗
                                </button>
                              )}
                              {aiBtn(kind, fieldKey)}
                            </div>
                          </div>
                          <textarea
                            id={`field-${fieldKey}-${c.id}`}
                            value={val}
                            rows={rows}
                            onChange={e => updateClsField(c.id, { [fieldKey]: e.target.value })}
                            placeholder="Escreva ou gere com IA…"
                            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.5 }}
                            onFocus={e => e.currentTarget.style.borderColor = color + '80'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                          />
                        </div>
                      )
                    }

                    function inputRow(label: string, fieldKey: keyof Classification) {
                      const val = (c[fieldKey] as string | undefined) ?? ''
                      return (
                        <div style={{ marginBottom: '7px' }}>
                          <label style={{ display: 'block', fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</label>
                          <input
                            value={val}
                            onChange={e => updateClsField(c.id, { [fieldKey]: e.target.value })}
                            style={{ width: '100%', boxSizing: 'border-box', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B' }}
                            onFocus={e => e.currentTarget.style.borderColor = color + '80'}
                            onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                          />
                        </div>
                      )
                    }

                    const isAnyLoading = Object.keys(fieldLoading).some(k => k.startsWith(c.id))

                    return (
                      <div>
                        {/* Term header */}
                        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #F1F5F9' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.25, fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic' }}>
                            {c.selectedText}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '3px' }}>
                            v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''} · {TYPE_LABELS[c.type]}
                          </div>
                          {c.note && <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '3px', fontStyle: 'italic' }}>{c.note}</div>}
                          {/* Loading banner */}
                          {isAnyLoading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '6px 9px', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: '7px' }}>
                              <Loader2 size={11} strokeWidth={2} style={{ color, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.68rem', color, fontWeight: 500 }}>Gerando com IA…</span>
                            </div>
                          )}
                        </div>

                        {/* Empty state */}
                        {!c.definition && !c.explanation && !c.lexical_study && !c.theological_biblical && (
                          <div style={{ padding: '16px 14px 8px', borderBottom: '1px solid #F1F5F9' }}>
                            <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '10px', lineHeight: 1.4 }}>
                              Nenhuma explicação gerada ainda.
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <button
                                onClick={() => generateField(c, 'description', 'definition')}
                                disabled={!!fieldLoading[`${c.id}:description`]}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: color, border: 'none', borderRadius: '7px', padding: '7px 12px', fontSize: '0.73rem', fontWeight: 600, color: '#FFF', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {fieldLoading[`${c.id}:description`] ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={11} strokeWidth={1.75} />}
                                Gerar explicação com IA
                              </button>
                              <button
                                onClick={() => generateField(c, 'lexical', 'lexical_study')}
                                disabled={!!fieldLoading[`${c.id}:lexical`]}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: `1px solid ${color}40`, borderRadius: '7px', padding: '7px 12px', fontSize: '0.73rem', fontWeight: 600, color, cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {fieldLoading[`${c.id}:lexical`] ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} /> : '📚'}
                                Gerar estudo lexical
                              </button>
                              <button
                                onClick={() => { /* focus definition textarea via ref would be ideal — just scroll to it */ document.getElementById(`field-definition-${c.id}`)?.focus() }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '7px 12px', fontSize: '0.73rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                ✎ Adicionar manualmente
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Fields */}
                        <div style={{ padding: '14px' }}>
                          {fieldRow('Definição',    'definition',   'description', 2, true)}
                          {fieldRow('Explicação',   'explanation',  'analysis',    2, true)}
                          {fieldRow('Estudo Lexical', 'lexical_study', 'lexical',  3, true)}

                          {/* Original languages — single IA button generates all three */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <label style={{ fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Línguas Originais</label>
                              {aiBtn('original_term', 'original_term')}
                            </div>
                            {inputRow('Termo original', 'original_term')}
                            {inputRow('Transliteração', 'transliteration')}
                            {inputRow('Significado', 'meaning')}
                          </div>

                          {fieldRow('Uso Bíblico',      'occurrences_note',    'occurrences',          2, false)}
                          {fieldRow('Teologia Bíblica', 'theological_biblical', 'theological_biblical', 3, true)}
                          {fieldRow('Função Narrativa', 'narrative_function',   'narrative_function',   2, false)}
                          {fieldRow('Aplicações',       'applications',         'applications',         3, true)}

                          {/* Personal notes — no AI, expandable */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <label style={{ fontSize: '0.59rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notas Pessoais</label>
                              <button onClick={() => openExpand('Notas Pessoais', 'personal_notes', c.personal_notes ?? '')}
                                style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: '1px solid #E2E8F0', borderRadius: '4px', padding: '2px 5px', fontSize: '0.57rem', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#94A3B8' }}
                              ><Maximize2 size={8} strokeWidth={2} /> ↗</button>
                            </div>
                            <textarea
                              value={c.personal_notes ?? ''}
                              rows={2}
                              onChange={e => updateClsField(c.id, { personal_notes: e.target.value })}
                              placeholder="Observações livres…"
                              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px 8px', fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', color: '#1E293B', lineHeight: 1.5 }}
                            />
                          </div>
                        </div>

                        {/* Detail footer — save to dictionary */}
                        <div style={{ padding: '10px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button
                            onClick={() => saveToDictionary(c)}
                            disabled={dictSaving || dictSaved}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                              background: dictSaved ? '#F0FDF4' : color, border: 'none',
                              borderRadius: '8px', padding: '8px', fontSize: '0.73rem', fontWeight: 600,
                              color: dictSaved ? '#10B981' : '#FFFFFF',
                              cursor: dictSaving || dictSaved ? 'default' : 'pointer',
                              fontFamily: 'inherit', transition: 'all 0.15s',
                              opacity: dictSaving ? 0.7 : 1,
                            }}
                          >
                            {dictSaved
                              ? <><Check size={12} strokeWidth={2.5} /> Salvo no Dicionário</>
                              : dictSaving
                                ? 'Salvando…'
                                : <><BookMarked size={12} strokeWidth={1.75} /> Salvar no Dicionário Lampas</>
                            }
                          </button>
                          <button
                            onClick={() => { sendToSection(c, 'termos_chave', '2.4 Termos-Chave') }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px', fontSize: '0.7rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            → Enviar para Termos-Chave
                          </button>
                          <button
                            onClick={() => { createCollage(c) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '6px', fontSize: '0.7rem', color: '#64748B', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            📌 Adicionar às Colagens
                          </button>
                          <button
                            onClick={() => { removeCls(c.id); setActiveItem(null) }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', background: 'transparent', border: '1px solid #FEE2E2', borderRadius: '7px', padding: '5px', fontSize: '0.67rem', color: '#EF4444', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Remover classificação
                          </button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* ── LIST VIEW — cls items ── */}
                  {(!activeItem || activeNode.kind !== 'cls') && activeNode.kind === 'cls' && (() => {
                    const items = getClsItems(activeNode)
                    return items.length === 0 ? (
                      <div style={{ padding: '18px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.79rem', color: '#94A3B8', fontStyle: 'italic' }}>Nenhum item marcado ainda.</div>
                        <div style={{ fontSize: '0.7rem', color: activeNode.color, marginTop: '5px' }}>Marque palavras no Texto Bíblico.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {items.map(c => (
                          <div
                            key={c.id}
                            onClick={() => { setDictSaved(false); setActiveItem(c) }}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '8px',
                              padding: '8px 8px 8px 10px', borderRadius: '8px',
                              cursor: 'pointer', transition: 'background 0.1s',
                              background: 'transparent',
                              border: '1px solid transparent',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = activeNode.color + '18' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                          >
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeNode.color, flexShrink: 0, marginTop: '6px', opacity: 0.7 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.84rem', fontFamily: "'EB Garamond', Georgia, serif", fontStyle: 'italic', color: '#1E293B', lineHeight: 1.4 }}>
                                {c.selectedText}
                              </div>
                              <div style={{ fontSize: '0.63rem', color: '#94A3B8', marginTop: '2px' }}>
                                v.{c.startVerse}{c.endVerse !== c.startVerse ? `–${c.endVerse}` : ''}{c.note ? ` · ${c.note}` : ''}
                              </div>
                              {(c.definition || c.explanation) && (
                                <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#64748B', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {c.definition || c.explanation}
                                </div>
                              )}
                            </div>
                            {/* ⋯ — único gatilho do context menu */}
                            <button
                              onClick={e => { e.stopPropagation(); openItemMenu(e, c.id) }}
                              style={{
                                background: itemMenuState?.id === c.id ? '#F1F5F9' : 'transparent',
                                border: `1px solid ${itemMenuState?.id === c.id ? '#E2E8F0' : 'transparent'}`,
                                borderRadius: '5px', cursor: 'pointer', padding: '3px 4px',
                                display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '0px',
                                color: '#94A3B8', transition: 'all 0.1s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569' }}
                              onMouseLeave={e => { if (itemMenuState?.id !== c.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' } }}
                            >
                              <MoreHorizontal size={13} strokeWidth={1.75} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  })()}

                  {/* Card textarea */}
                  {activeNode.kind === 'card' && (() => {
                    if (activeNode.sectionSlug) {
                      const linkedSection = getLinkedSection(activeNode)
                      const linkedSectionName = linkedSection?.title ?? activeNode.sectionSlug.replaceAll('_', ' ')
                      const filledEntries = getLinkedCardEntries(activeNode)
                      const summary = getNodeSummary(activeNode)

                      return (
                        <div style={{ padding: '8px 6px' }}>
                          <div style={{
                            background: activeNode.bg,
                            border: `1px solid ${activeNode.color}24`,
                            borderRadius: '9px',
                            padding: '0.65rem 0.75rem',
                            marginBottom: '0.65rem',
                          }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: activeNode.color, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                              Fonte da verdade
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                              Este nó espelha {activeNode.sectionCardId ? 'um campo' : 'a seção'} "{linkedSectionName}" da barra lateral.
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B', lineHeight: 1.45, marginTop: '0.3rem' }}>
                              A Visão Geral apenas reflete a fonte de verdade; edite o conteúdo na seção original.
                            </div>
                          </div>

                          {filledEntries.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              <div style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.55 }}>
                                {summary}
                              </div>
                              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {filledEntries.slice(0, 4).map(([key, value]) => (
                                  <div key={key} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '7px', padding: '0.45rem 0.55rem' }}>
                                    <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                      {key.replaceAll('_', ' ')}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.45, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                      {toPlainText(value)}
                                    </div>
                                  </div>
                                ))}
                                {filledEntries.length > 4 && (
                                  <div style={{ fontSize: '0.66rem', color: activeNode.color, fontWeight: 700 }}>
                                    + {filledEntries.length - 4} campo{filledEntries.length - 4 !== 1 ? 's' : ''} preenchido{filledEntries.length - 4 !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '1rem 0.4rem', textAlign: 'center' }}>
                              <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.45 }}>
                                Esta seção ainda não possui conteúdo.
                              </div>
                              <div style={{ fontSize: '0.68rem', color: activeNode.color, marginTop: '0.3rem' }}>
                                Abra a seção para preencher os campos reais do estudo.
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => activeNode.sectionSlug && onNavigate?.(activeNode.sectionSlug)}
                            style={{
                              marginTop: '0.75rem',
                              width: '100%',
                              background: activeNode.color,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.55rem',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Editar em {linkedSectionName}
                          </button>
                        </div>
                      )
                    }

                    const cardId = activeNode.cardIds![0]
                    const cardMeta = VG_CARD_DEFS[cardId]
                    const draft  = cardDraft[cardId] ?? cards[cardId] ?? ''
                    const saved  = draft === (cards[cardId] ?? '')
                    return (
                      <div style={{ padding: '6px 4px' }}>
                        <textarea
                          value={draft}
                          onChange={e => setCardDraft(p => ({ ...p, [cardId]: e.target.value }))}
                          placeholder={cardMeta?.placeholder ?? `Descreva ${activeNode.label.toLowerCase()} da passagem…`}
                          rows={7}
                          style={{
                            width: '100%', resize: 'vertical', fontFamily: 'inherit',
                            fontSize: '0.83rem', lineHeight: 1.6, color: '#1E293B',
                            background: '#FAFAFA', border: '1px solid #E2E8F0',
                            borderRadius: '8px', padding: '10px 11px', outline: 'none',
                            boxSizing: 'border-box', transition: 'border-color 0.15s',
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = activeNode.color + '80'}
                          onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                        />
                        <button
                          onClick={() => saveCard(cardId, draft)}
                          disabled={savingCard === cardId || saved}
                          style={{
                            marginTop: '7px', width: '100%',
                            background: saved ? '#F1F5F9' : activeNode.color,
                            color: saved ? '#94A3B8' : '#FFFFFF',
                            border: 'none', borderRadius: '8px',
                            padding: '7px', fontSize: '0.74rem', fontWeight: 600,
                            cursor: saved || savingCard === cardId ? 'default' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            opacity: savingCard === cardId ? 0.7 : 1,
                          }}
                        >
                          {savingCard === cardId ? 'Salvando…' : saved ? 'Salvo' : 'Salvar'}
                        </button>
                      </div>
                    )
                  })()}
                </div>

                {/* Panel footer — only when NOT in detail view */}
                {!(activeItem && activeNode.kind === 'cls') && (
                  <div style={{ flexShrink: 0, padding: '8px', borderTop: `1px solid ${activeNode.color}12`, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {activeNode.kind === 'cls' && (
                      <button onClick={() => onOpenBible?.()}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                          background: 'transparent', border: `1px solid ${activeNode.color}30`,
                          borderRadius: '7px', padding: '7px', fontSize: '0.73rem',
                          color: activeNode.color, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = activeNode.bg }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <BookOpen size={11} strokeWidth={1.75} /> Abrir Texto Bíblico
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (activeNode.sectionSlug) onNavigate?.(activeNode.sectionSlug)
                        else onAskAI(buildVGNodePrompt(project, activeNode))
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        background: 'transparent', border: '1px solid #E2E8F0',
                        borderRadius: '7px', padding: '7px', fontSize: '0.73rem',
                        color: '#64748B', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
                    >
                      {activeNode.sectionSlug
                        ? <><BookOpen size={11} strokeWidth={1.75} /> Abrir seção</>
                        : <><Sparkles size={11} strokeWidth={1.75} /> Organizar com IA</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Bottom bar ── */}
          <div style={{ marginTop: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {nodes.filter(n => getCount(n) > 0).map(n => (
                <button key={n.key} onClick={() => setActivePanel(n.key === activePanel ? null : n.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer',
                    background: activePanel === n.key ? n.bg : '#F8FAFC',
                    border: `1px solid ${activePanel === n.key ? n.color + '50' : '#E2E8F0'}`,
                    color: activePanel === n.key ? n.color : '#64748B',
                    borderRadius: '6px', padding: '3px 9px',
                    fontFamily: 'inherit', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (activePanel !== n.key) { e.currentTarget.style.borderColor = n.color + '40'; e.currentTarget.style.color = n.color } }}
                  onMouseLeave={e => { if (activePanel !== n.key) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' } }}
                >
                  {n.icon} {n.label} · {getCount(n)}
                </button>
              ))}
            </div>
            <button
              onClick={() => onAskAI(`Analise ${project.book} ${project.passage_ref} e organize de forma concisa: personagens principais e secundários, lugares principais, temas dominantes, conflito principal, clímax, grande ideia central.`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                background: '#FAFAFA', border: '1px solid #E2E8F0',
                borderRadius: '8px', padding: '6px 14px',
                fontSize: '0.73rem', color: '#64748B',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}
            >
              <Sparkles size={11} strokeWidth={1.75} /> Organizar com IA
            </button>
          </div>
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9998, background: '#18181B', color: '#FFF', padding: '0.65rem 1.1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease-out', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ {toast}
        </div>
      )}

      {/* ── Modal de evolução das fases ── */}
      {showEvolution && evolutionData && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowEvolution(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1001,
            background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0',
            width: '100%', maxWidth: '960px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            animation: 'fadeIn 0.15s ease-out',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Evolução da Compreensão
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  {isPassageMode ? `${project.book} ${project.passage_ref}` : project.passage_ref}
                </div>
              </div>
              <button onClick={() => setShowEvolution(false)} style={{
                background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px',
                padding: '0.3rem 0.55rem', cursor: 'pointer', color: '#94A3B8', fontSize: '0.9rem',
              }}>✕</button>
            </div>

            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: '1px solid #F1F5F9', flexShrink: 0,
            }}>
              {(['preparar', 'investigar', 'pregar'] as const).map(ph => (
                <div key={ph} style={{
                  padding: '0.6rem 1rem', textAlign: 'center',
                  background: PHASE_COLOR[ph] + '08',
                  borderRight: ph !== 'pregar' ? '1px solid #F1F5F9' : 'none',
                }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: PHASE_COLOR[ph],
                  }}>
                    {ph === 'preparar' ? 'Preparar — Inicial' : ph === 'investigar' ? 'Investigar — Investigativa' : 'Pregar — Homilética'}
                  </span>
                  {!evolutionData[ph] && (
                    <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px' }}>Não iniciada</div>
                  )}
                </div>
              ))}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {nodes.filter(n => n.kind === 'card' && n.cardIds?.length).map(node => {
                const cardId = node.cardIds![0]
                const vals = {
                  preparar:   evolutionData.preparar?.[cardId] ?? '',
                  investigar: evolutionData.investigar?.[cardId] ?? '',
                  pregar:     evolutionData.pregar?.[cardId] ?? '',
                }
                const anyValue = vals.preparar || vals.investigar || vals.pregar
                if (!anyValue) return null
                return (
                  <div key={node.key} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* Row header */}
                    <div style={{
                      padding: '0.45rem 1rem', background: '#F8FAFC',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      borderBottom: '1px solid #F1F5F9',
                    }}>
                      <span style={{ fontSize: '0.75rem' }}>{node.icon}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: node.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {node.label}
                      </span>
                    </div>
                    {/* 3 columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                      {(['preparar', 'investigar', 'pregar'] as const).map((ph, i) => {
                        const val = vals[ph]
                        const prevVal = ph === 'investigar' ? vals.preparar : ph === 'pregar' ? vals.investigar : null
                        const changed = prevVal !== null && val && val !== prevVal
                        const isNew   = prevVal !== null && val && !prevVal
                        return (
                          <div key={ph} style={{
                            padding: '0.75rem 1rem',
                            borderRight: i < 2 ? '1px solid #F1F5F9' : 'none',
                            background: isNew ? '#F0FDF4' : changed ? PHASE_COLOR[ph] + '05' : 'transparent',
                            minHeight: '60px',
                          }}>
                            {val ? (
                              <p style={{
                                fontSize: '0.79rem', color: changed || isNew ? '#1E293B' : '#64748B',
                                lineHeight: 1.55, margin: 0,
                                fontWeight: changed || isNew ? 500 : 400,
                              }}>
                                {val}
                              </p>
                            ) : (
                              <p style={{ fontSize: '0.72rem', color: '#CBD5E1', fontStyle: 'italic', margin: 0 }}>—</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{
              padding: '0.75rem 1.4rem', borderTop: '1px solid #F1F5F9',
              flexShrink: 0, display: 'flex', justifyContent: 'flex-end',
            }}>
              <button onClick={() => setShowEvolution(false)} style={{
                background: '#0F172A', border: 'none', borderRadius: '7px',
                padding: '0.46rem 1.15rem', color: '#FFF', fontSize: '0.81rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expand field modal ── */}
      {expandedField && activeItem && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setExpandedField(null) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: '14px', width: '100%', maxWidth: '860px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.4rem', borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  {expandedField.label}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {activeItem.selectedText}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                  {project.book} {project.passage_ref}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: '7px', padding: '2px', border: '1px solid #E2E8F0' }}>
                  {(['view', 'edit'] as const).map(m => (
                    <button key={m} onClick={() => setExpandMode(m)} style={{
                      background: expandMode === m ? '#FFFFFF' : 'transparent',
                      border: `1px solid ${expandMode === m ? '#E2E8F0' : 'transparent'}`,
                      borderRadius: '5px', padding: '0.27rem 0.7rem',
                      fontSize: '0.72rem', fontWeight: expandMode === m ? 600 : 400,
                      color: expandMode === m ? '#1E293B' : '#94A3B8',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                    }}>
                      {m === 'view' ? 'Visualizar' : 'Editar'}
                    </button>
                  ))}
                </div>
                <button onClick={() => setExpandedField(null)} style={{
                  background: 'none', border: '1px solid #E2E8F0', borderRadius: '7px',
                  padding: '0.3rem 0.55rem', cursor: 'pointer', color: '#94A3B8',
                  fontSize: '0.9rem', lineHeight: 1,
                }}>✕</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>
              {expandMode === 'view' ? (
                expandDraft.trim() ? (
                  <MarkdownRenderer content={expandDraft} />
                ) : (
                  <p style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '0.88rem' }}>
                    Campo vazio. Alterne para &ldquo;Editar&rdquo; para adicionar conteúdo.
                  </p>
                )
              ) : (
                <textarea
                  value={expandDraft}
                  onChange={e => setExpandDraft(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', minHeight: '440px',
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: '8px', padding: '0.95rem 1.1rem',
                    color: '#1E293B', fontSize: '0.91rem', lineHeight: '1.82',
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#94A3B8')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              )}
            </div>

            {/* Footer */}
            {expandMode === 'edit' && (
              <div style={{
                padding: '0.85rem 1.4rem', borderTop: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: '0.6rem', flexShrink: 0, background: '#FFFFFF',
              }}>
                <button onClick={() => setExpandedField(null)} style={{
                  background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '7px',
                  padding: '0.46rem 1rem', color: '#64748B', fontSize: '0.81rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Fechar
                </button>
                <button
                  onClick={() => {
                    updateClsField(activeItem.id, { [expandedField.fieldKey]: expandDraft })
                    setExpandedField(null)
                  }}
                  style={{
                    background: '#1E293B', border: 'none', borderRadius: '7px',
                    padding: '0.46rem 1.15rem', color: '#FFF', fontSize: '0.81rem',
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Salvar alterações
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Item context menu (fixed — escapa overflow do painel) ── */}
      {itemMenuState && (() => {
        const c = cls.find(x => x.id === itemMenuState.id)
        if (!c) return null
        const MENU_H  = 380
        const menuX   = Math.min(Math.max(4, itemMenuState.x - 228), window.innerWidth - 232)
        const menuY   = itemMenuState.y + MENU_H > window.innerHeight ? itemMenuState.y - MENU_H : itemMenuState.y

        function mi(label: string, icon: string, action: () => void, danger?: boolean) {
          return (
            <button onClick={e => { e.stopPropagation(); action() }}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'none', border: 'none', borderRadius: '5px', padding: '5px 9px', fontSize: '0.75rem', color: danger ? '#EF4444' : '#1E293B', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = danger ? '#FEF2F2' : '#F1F5F9' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <span style={{ fontSize: '0.8rem', width: '16px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              {label}
            </button>
          )
        }

        function sep(label: string) {
          return <div style={{ fontSize: '0.58rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 9px 3px', marginTop: '2px' }}>{label}</div>
        }

        return (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', left: menuX, top: menuY, zIndex: 9999,
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              borderRadius: '10px', padding: '5px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              width: '224px', animation: 'fadeIn 0.1s ease-out',
            }}
          >
            {/* Preview */}
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic', padding: '3px 9px 6px', borderBottom: '1px solid #F1F5F9', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{c.selectedText}" — v.{c.startVerse}
            </div>

            {sep('IA — preenche no termo')}
            {mi('Gerar explicação com IA', '✦', () => {
              setItemMenuState(null)
              openTermDetail(c)
              generateField(c, 'description', 'definition')
            })}
            {mi('Gerar estudo lexical', '📚', () => {
              setItemMenuState(null)
              openTermDetail(c)
              generateField(c, 'lexical', 'lexical_study')
            })}
            {mi('Gerar aplicações', '🎯', () => {
              setItemMenuState(null)
              openTermDetail(c)
              generateField(c, 'applications', 'applications')
            })}

            {sep('Pesquisar')}
            {mi('Dicionário Lampas', '📖', () => { setItemMenuState(null); onNavigate?.('ferramentas_dicionario') })}
            {mi('Referências cruzadas', '🔗', () => { setItemMenuState(null); onNavigate?.('ferramentas_refs_cruzadas') })}

            {sep('Enviar para')}
            {mi('Termos-Chave', '🔑', () => sendToSection(c, 'termos_chave', '2.4 Termos-Chave'))}
            {mi('Estudo Teológico', '🧠', () => sendToSection(c, 'contexto_canonico', '3.1 Contexto Canônico'))}
            {mi('Comentário', '📖', () => sendToSection(c, 'comentario_expositivo', 'Comentário Expositivo'))}
            {mi('Colagem', '📌', () => createCollage(c))}

            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

            {sep('Gerenciar')}
            {mi('Ver no Texto Bíblico', '📖', () => { setItemMenuState(null); onOpenBible?.() })}
            {mi('Remover classificação', '🗑', () => { removeCls(c.id); setActiveItem(null) }, true)}
          </div>
        )
      })()}
    </div>
  )
}
