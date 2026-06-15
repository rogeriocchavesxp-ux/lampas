'use client'

import { useState, useMemo, useEffect, cloneElement, isValidElement } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Project, Profile } from '@/types/database'
import {
  STUDY_MODE_REGISTRY,
  getModeConfig,
  type StudyModeId,
  type StudyModeConfig,
} from '@/lib/study-modes'
import pkg from '../../../package.json'
import UpcomingEventsWidget from '@/components/agenda/UpcomingEventsWidget'

const LEGACY_TYPE: Record<StudyModeId, string> = {
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

const BOOKS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
  'Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis',
  '1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó',
  'Salmos','Provérbios','Eclesiastes','Cântico dos Cânticos',
  'Isaías','Jeremias','Lamentações','Ezequiel','Daniel',
  'Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias',
]

const BOOKS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos',
  '1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus',
  'Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João',
  'Judas','Apocalipse',
]

const MODE_ICONS: Record<StudyModeId, React.ReactNode> = {
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

const MODE_VISUALS: Record<StudyModeId, { color: string; bg: string; border: string }> = {
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
const SECTION_ORDER: StudyModeId[] = [
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

const GENRE_LABEL: Partial<Record<StudyModeId, string>> = {
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

type CreationGroupId = 'estudar' | 'produzir' | 'armazenar'
type UiModeId =
  | 'exegetico' | 'tematico' | 'doutrinario' | 'termos'
  | 'sermao' | 'devocional' | 'aula' | 'estudo_biblico' | 'artigo' | 'ebook' | 'livro' | 'palestra' | 'curso' | 'serie_mensagens'
  | 'conhecimento'

const UI_MODES: Array<{
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

const CREATION_GROUPS: Array<{
  id: CreationGroupId; emoji: string; label: string; description: string; color: string
}> = [
  { id: 'estudar', emoji: '📖', label: 'Estudar', color: '#0F766E',
    description: 'Investigue um texto bíblico, tema, doutrina ou termo.' },
  { id: 'armazenar', emoji: '🧠', label: 'Biblioteca', color: '#B45309',
    description: 'Armazene e organize conhecimento para consulta e reutilização futura.' },
]

// Detecção automática de gênero literário pelo livro
const EPISTLE_BOOKS_DETECT = new Set([
  'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
  'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo',
  'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João',
  '3 João', 'Judas',
])
const POETRY_BOOKS_DETECT = new Set([
  'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cântico dos Cânticos', 'Lamentações',
])
const PROPHECY_BOOKS_DETECT = new Set([
  'Isaías', 'Jeremias', 'Ezequiel', 'Daniel', 'Oséias', 'Joel', 'Amós', 'Obadias',
  'Miquéias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias', 'Apocalipse',
])
const NARRATIVE_BOOKS_DETECT = new Set([
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes',
  'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas',
  'Esdras', 'Neemias', 'Ester', 'Jonas', 'Mateus', 'Marcos', 'Lucas', 'João', 'Atos',
])

function detectStudyMode(book: string): StudyModeId {
  if (EPISTLE_BOOKS_DETECT.has(book))   return 'estudo_de_carta'
  if (POETRY_BOOKS_DETECT.has(book))    return 'estudo_de_salmos_sabedoria'
  if (PROPHECY_BOOKS_DETECT.has(book))  return 'estudo_de_profecias'
  if (NARRATIVE_BOOKS_DETECT.has(book)) return 'estudo_narrativas'
  return 'exegese_biblica'
}

const DETECTED_LABEL: Partial<Record<StudyModeId, string>> = {
  estudo_de_carta:            'Epístola',
  estudo_de_salmos_sabedoria: 'Salmos e Sabedoria',
  estudo_de_profecias:        'Profecia',
  estudo_narrativas:          'Narrativa',
  exegese_biblica:            'Texto Bíblico',
}

// ── Detecção automática de referências bíblicas ──────────────────────────

type BibleBookEntry = { testament: 'AT' | 'NT'; canonical: string }

const BIBLE_BOOK_MAP: Record<string, BibleBookEntry> = {
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

const BIBLE_BOOK_KEYS_BY_LENGTH = Object.keys(BIBLE_BOOK_MAP).sort((a, b) => b.length - a.length)

function normalizeBible(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function parseBiblicalRef(query: string): {
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

function formatDate(dateStr: string): string {
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

function statusLabel(s: string): string {
  return { draft: 'Em andamento', in_progress: 'Em andamento', completed: 'Concluído', archived: 'Arquivado' }[s] ?? s
}

const PUBLISHED_CATEGORIES = [
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

type PublishedCategoryId = typeof PUBLISHED_CATEGORIES[number]['id']

function projectCreationMode(project: Project): string | null {
  const value = project.meta?.creation_ui_mode
  return typeof value === 'string' ? value : null
}

function publishedCategoryFor(project: Project): PublishedCategoryId {
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

function formatCalendarDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function modeVisual(modeId: StudyModeId) {
  return MODE_VISUALS[modeId]
}

function modeIcon(modeId: StudyModeId, size: number) {
  const icon = MODE_ICONS[modeId]
  return isValidElement<{ width?: number; height?: number }>(icon)
    ? cloneElement(icon, { width: size, height: size })
    : icon
}

function buildReferenceTitle(book: string, passageRef: string): string {
  const normalizedBook = book.trim()
  const normalizedRef = passageRef.trim()
  if (!normalizedBook || !normalizedRef) return ''
  return `${normalizedBook} ${normalizedRef}`
}

type SermonType = 'expositivo' | 'textual' | 'tematico'

const SERMON_TYPE_OPTIONS: Array<{
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

type ProjectForm = {
  title: string
  book: string
  passage_ref: string
  topic: string
  testament: '' | 'AT' | 'NT'
  sermon_type: '' | SermonType
}

function createInitialForm(): ProjectForm {
  return { title: '', book: '', passage_ref: '', topic: '', testament: '', sermon_type: '' }
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects: initialProjects, profile }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = useMemo(() => createClient(), [])

  // Local projects list — allows optimistic removal on delete
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  // Modal state
  const [showNew,        setShowNew]       = useState(false)
  const [modalStep,      setModalStep]     = useState<'mode' | 'form'>('mode')
  const [selectedCreationGroup, setSelectedCreationGroup] = useState<CreationGroupId | null>(null)
  const [selectedUiMode, setSelectedUiMode]= useState<UiModeId | null>(null)
  const [selectedMode,   setSelectedMode]  = useState<StudyModeId | null>(null)
  const [creating,       setCreating]      = useState(false)
  const [createError,    setCreateError]   = useState<string | null>(null)
  const [titleEdited,    setTitleEdited]   = useState(false)
  const [form,           setForm]          = useState<ProjectForm>(createInitialForm())
  const [estudarType,    setEstudarType]   = useState<'texto' | 'tema' | 'doutrina' | 'termo' | null>(null)
  const [estudarQuery,   setEstudarQuery]  = useState('')
  const [detectedRef,    setDetectedRef]   = useState<{ book: string; testament: 'AT' | 'NT'; passage: string; studyMode: StudyModeId } | null>(null)

  // Delete state
  const [deleteTarget,     setDeleteTarget]     = useState<Project | null>(null)
  const [deleteConfirming, setDeleteConfirming] = useState(false)

  const modeConfig = selectedMode ? STUDY_MODE_REGISTRY[selectedMode] : null

  const dashboardProjects = useMemo(() => {
    const seen = new Set<string>()
    return projects.filter(project => {
      if (seen.has(project.id)) return false
      seen.add(project.id)
      return true
    })
  }, [projects])

  const activeProjects = useMemo(
    () => dashboardProjects.filter(project => project.status !== 'completed'),
    [dashboardProjects],
  )

  const completedProjects = useMemo(
    () => dashboardProjects.filter(project => project.status === 'completed'),
    [dashboardProjects],
  )

  const RECENT_LIMIT = 6
  const recentActiveProjects4 = useMemo(() => activeProjects.slice(0, RECENT_LIMIT), [activeProjects])
  const activeCount      = activeProjects.length
  const completedCount   = completedProjects.length
  const totalCount       = dashboardProjects.length
  // Invariant: totalCount === activeCount + completedCount (every project has status)
  const studiedBooks     = useMemo(() => new Set(dashboardProjects.map(p => p.book).filter((b): b is string => !!b && b !== '—')), [dashboardProjects])

  const publishedProjects = useMemo(
    () => dashboardProjects.filter(project => project.published),
    [dashboardProjects],
  )

  const publishedByCategory = useMemo(() => {
    const map = new Map<PublishedCategoryId, Project[]>()
    for (const category of PUBLISHED_CATEGORIES) map.set(category.id, [])
    for (const project of publishedProjects) {
      const category = publishedCategoryFor(project)
      map.set(category, [...(map.get(category) ?? []), project])
    }
    return map
  }, [publishedProjects])

  async function updatePublishedProject(projectId: string, published: boolean) {
    const publishedAt = published ? new Date().toISOString() : null
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, published, published_at: publishedAt } : project
    ))
    const { error } = await supabase
      .from('projects')
      .update({ published, published_at: publishedAt })
      .eq('id', projectId)
      .eq('user_id', user.id)
    if (error) {
      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, published: !published } : project
      ))
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteConfirming(true)
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // keep modal open so user can retry
    } finally {
      setDeleteConfirming(false)
    }
  }

  function openModal() {
    setModalStep('mode')
    setSelectedCreationGroup(null)
    setSelectedUiMode(null)
    setSelectedMode(null)
    setCreating(false)
    setCreateError(null)
    setTitleEdited(false)
    setForm(createInitialForm())
    setEstudarType(null)
    setEstudarQuery('')
    setDetectedRef(null)
    setShowNew(true)
  }

  function closeModal() { setShowNew(false) }

  // Auto-open modal when navigated with ?new=1 (from TopNav)
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openModal()
      router.replace('/dashboard', { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectUiMode(uid: UiModeId) {
    setSelectedUiMode(uid)
    setCreateError(null)
    setTitleEdited(false)
    setForm(createInitialForm())
    switch (uid) {
      case 'sermao':      setSelectedMode('sermao'); break
      case 'devocional':  setSelectedMode('devocional'); break
      case 'aula':        setSelectedMode('aula'); break
      case 'estudo_biblico': setSelectedMode('estudo_biblico'); break
      case 'artigo':      setSelectedMode('artigo'); break
      case 'ebook':       setSelectedMode('ebook'); break
      case 'livro':       setSelectedMode('livro'); break
      case 'palestra':    setSelectedMode('palestra'); break
      case 'curso':       setSelectedMode('curso'); break
      case 'serie_mensagens': setSelectedMode('serie_mensagens'); break
      case 'doutrinario': setSelectedMode('estudo_doutrinario'); break
      case 'tematico':    setSelectedMode('estudo_tematico'); break
      case 'termos':      setSelectedMode('estudo_termos'); break
      case 'exegetico':   setSelectedMode(null); break
      case 'conhecimento': setSelectedMode(null); break
    }
  }

  // Detecção automática de referência bíblica ao digitar no campo Estudar
  useEffect(() => {
    const q = estudarQuery.trim()
    if (!q) { setDetectedRef(null); return }
    const ref = parseBiblicalRef(q)
    if (ref) {
      setDetectedRef(ref)
      setEstudarType('texto')
      setSelectedUiMode('exegetico')
      setSelectedMode(ref.studyMode)
    } else {
      setDetectedRef(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estudarQuery])

  // Detecção automática de gênero ao escolher o livro no modo exegético
  useEffect(() => {
    if (selectedUiMode !== 'exegetico' || !form.book) return
    setSelectedMode(detectStudyMode(form.book))
  }, [selectedUiMode, form.book])

  async function createStudyDirect() {
    if (!detectedRef) return
    setCreateError(null)
    setCreating(true)
    const title = buildReferenceTitle(detectedRef.book, detectedRef.passage)
    const payload = {
      user_id:           user.id,
      title,
      book:              detectedRef.book,
      passage_ref:       detectedRef.passage,
      testament:         detectedRef.testament,
      original_language: detectedRef.testament === 'AT' ? 'hebraico' : 'grego',
      bible_version:     'ACF',
      status:            'draft',
      study_mode:        detectedRef.studyMode,
      project_type:      LEGACY_TYPE[detectedRef.studyMode] ?? 'exegese',
      meta:              { creation_ui_mode: 'exegetico' },
      published:         false,
    }
    try {
      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) { setCreateError(`Erro: ${error.message}`); return }
      if (data) { setProjects(prev => [data as Project, ...prev]); router.push(`/workspace/${data.id}`) }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  async function createTopicDirect(uiModeId: 'tematico' | 'doutrinario' | 'termos', topic: string) {
    const modeMap: Record<string, StudyModeId> = {
      tematico: 'estudo_tematico', doutrinario: 'estudo_doutrinario', termos: 'estudo_termos',
    }
    const studyMode = modeMap[uiModeId] as StudyModeId
    setCreateError(null)
    setCreating(true)
    const payload = {
      user_id:           user.id,
      title:             topic,
      book:              '—',
      passage_ref:       topic,
      testament:         'AT' as const,
      original_language: 'hebraico',
      bible_version:     'ACF',
      status:            'draft',
      study_mode:        studyMode,
      project_type:      LEGACY_TYPE[studyMode] ?? 'estudo_doutrinario',
      meta:              { topic, creation_ui_mode: uiModeId },
      published:         false,
    }
    try {
      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) { setCreateError(`Erro: ${error.message}`); return }
      if (data) { setProjects(prev => [data as Project, ...prev]); router.push(`/workspace/${data.id}`) }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  function updatePassageForm(patch: Partial<typeof form>) {
    setForm(current => {
      const next = { ...current, ...patch }
      if (!titleEdited) next.title = buildReferenceTitle(next.book, next.passage_ref)
      return next
    })
  }

  function updateTopic(value: string) {
    setForm(current => ({
      ...current,
      topic: value,
      title: titleEdited ? current.title : value.trim(),
    }))
  }

  function updateTitle(value: string) {
    setTitleEdited(true)
    setForm(current => ({ ...current, title: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)

    if (!selectedMode || !selectedUiMode) return

    const isTopicProduction = ['aula', 'artigo', 'ebook', 'livro', 'palestra', 'curso', 'serie_mensagens'].includes(selectedUiMode)
    const isPassage     = selectedUiMode !== 'doutrinario' && selectedUiMode !== 'tematico' && selectedUiMode !== 'termos' && !isTopicProduction
    const isSermon      = selectedUiMode === 'sermao'
    const generatedTitle = isPassage ? buildReferenceTitle(form.book, form.passage_ref) : form.topic.trim()
    const projectTitle  = form.title.trim() || generatedTitle

    if (isSermon && !form.sermon_type)         { setCreateError('Escolha o tipo de sermão.'); return }
    if (isPassage && !form.testament)          { setCreateError('Escolha o testamento.'); return }
    if (isPassage && !form.book)               { setCreateError('Selecione o livro.'); return }
    if (isPassage && !form.passage_ref.trim()) { setCreateError('Passagem é obrigatória.'); return }
    if (!isPassage && !form.topic.trim())      { setCreateError(selectedUiMode === 'termos' ? 'Termo é obrigatório.' : 'Doutrina ou tema é obrigatório.'); return }
    if (!projectTitle)                         { setCreateError('Informe os dados do estudo para gerar o título.'); return }

    const payload = {
      user_id:           user.id,
      title:             projectTitle,
      book:              isPassage ? form.book : '—',
      passage_ref:       isPassage ? form.passage_ref.trim() : form.topic.trim(),
      testament:         isPassage ? form.testament : 'AT',
      original_language: isPassage ? (form.testament === 'AT' ? 'hebraico' : 'grego') : 'hebraico',
      bible_version:     'ACF',
      status:            'draft',
      study_mode:        selectedMode,
      project_type:      LEGACY_TYPE[selectedMode] ?? 'exegese',
      meta:              isPassage
        ? {
          creation_ui_mode: selectedUiMode,
          ...(isSermon ? { sermon_type: form.sermon_type } : {}),
        }
        : { topic: form.topic.trim(), creation_ui_mode: selectedUiMode },
      published:         false,
    }

    setCreating(true)
    try {
      const { data, error } = await supabase.from('projects').insert(payload).select().single()
      if (error) {
        console.error('[Lampas] Erro ao criar projeto', error.code, error.message, error.details)
        const msg = error.code === '23514' ? 'Erro de validação dos dados do projeto.'
          : error.code === '23502' ? 'Campo obrigatório ausente.'
          : error.code === '42501' ? 'Sem permissão para criar projeto.'
          : `Erro ${error.code ?? 'desconhecido'}: ${error.message}`
        setCreateError(msg)
        return
      }
      if (data) {
        setProjects(prev => [data as Project, ...prev])
        router.push(`/workspace/${data.id}`)
      }
    } catch {
      setCreateError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  const generatedProjectTitle = modeConfig?.passageBased
    ? buildReferenceTitle(form.book, form.passage_ref)
    : form.topic.trim()
  const canShowGeneratedTitle = Boolean(generatedProjectTitle)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* ── Sub-header ── */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)', padding: '0 2rem',
        height: '44px', display: 'flex', alignItems: 'center',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            Painel
          </span>
          <span style={{ fontSize: '0.55rem', color: 'var(--border)' }}>·</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            v{pkg.version}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* ── Hero ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, margin: '0 0 0.25rem' }}>
              Bem-vindo de volta.
            </p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 0.3rem' }}>
              {totalCount === 0
                ? 'Comece seu primeiro projeto.'
                : activeCount > 0
                  ? `${activeCount} ${activeCount === 1 ? 'projeto ativo' : 'projetos ativos'}.`
                  : 'Todos os projetos concluídos.'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {completedCount > 0 ? `${completedCount} concluído${completedCount > 1 ? 's' : ''} · ` : ''}
              {totalCount} no total
              {studiedBooks.size > 0 ? ` · ${studiedBooks.size} ${studiedBooks.size === 1 ? 'livro bíblico' : 'livros bíblicos'}` : ''}
            </p>
          </div>
          <button onClick={openModal} style={{
            background: 'var(--accent)', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '0.62rem 1.15rem', fontWeight: 650,
            cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit',
            boxShadow: '0 4px 12px rgba(30,77,140,0.18)', flexShrink: 0,
          }}>
            + Novo Projeto
          </button>
        </div>

        {totalCount === 0 ? (
          <EmptyDashboard onNew={openModal} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* ── Continuar Estudando ── */}
            <section>
              <DashLabel>Continuar Estudando</DashLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem', marginTop: '0.85rem' }}>
                {recentActiveProjects4.map(p => (
                  <StudyCard
                    key={p.id} project={p}
                    onClick={() => router.push(`/workspace/${p.id}`)}
                    onDelete={() => setDeleteTarget(p)}
                  />
                ))}
              </div>
            </section>

            {/* ── Próximos Eventos ── */}
            <section>
              <DashLabel>Próximos Compromissos</DashLabel>
              <div style={{ marginTop: '0.85rem' }}>
                <UpcomingEventsWidget />
              </div>
            </section>

            {/* ── Meus Projetos ── */}
            <section>
              <DashLabel>Meus Projetos</DashLabel>
              <div style={{
                marginTop: '0.85rem',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.1rem',
              }}>
                {publishedProjects.length === 0 ? (
                  <div style={{ padding: '1.2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Nenhum projeto publicado ainda.
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem' }}>
                      Publique um projeto pela Organização Homilética para vê-lo aqui.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    {PUBLISHED_CATEGORIES.map(category => {
                      const categoryProjects = publishedByCategory.get(category.id) ?? []
                      if (categoryProjects.length === 0) return null
                      return (
                        <div key={category.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.55rem' }}>
                            <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                              {category.label}
                            </h3>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: '999px', padding: '0.05rem 0.42rem' }}>
                              {categoryProjects.length}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: '0.7rem' }}>
                            {categoryProjects.map(project => (
                              <PublishedProjectCard
                                key={project.id}
                                project={project}
                                category={category.label}
                                onOpen={() => {
                                  const mode = getModeConfig(project.study_mode ?? project.project_type)
                                  router.push(mode.id === 'sermao'
                                    ? `/workspace/${project.id}?section=sermao_dispositio&view=preview&reader=published`
                                    : `/workspace/${project.id}`)
                                }}
                                onUnpublish={() => updatePublishedProject(project.id, false)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* ── Stats ── */}
            <section>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.85rem' }}>
                {([
                  { label: 'Total',          value: totalCount,       color: 'var(--accent)', icon: '📚' },
                  { label: 'Em andamento',   value: activeCount,      color: '#D97706',       icon: '⏳' },
                  { label: 'Concluídos',     value: completedCount,   color: '#10B981',       icon: '✓'  },
                  { label: 'Livros bíblicos', value: studiedBooks.size, color: '#7C3AED',      icon: '🗺' },
                ] as const).map(stat => (
                  <div key={stat.label} style={{
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '12px', padding: '1.1rem 1.2rem',
                  }}>
                    <div style={{ fontSize: '1.05rem', marginBottom: '0.4rem', lineHeight: 1 }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: '0.2rem' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* ── New project modal ── */}
      {showNew && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50, padding: '1rem',
          }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)',
            width: '100%',
            maxWidth: modalStep === 'mode' ? '520px' : '480px',
            animation: 'fadeIn 0.15s ease-out',
            transition: 'max-width 0.2s ease',
          }}>

            {/* Step 1: Work-flow selection */}
            {modalStep === 'mode' && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ marginBottom: '0.3rem', fontSize: '1.15rem' }}>Novo Projeto</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    {!selectedCreationGroup
                      ? 'Estudar a Escritura ou armazenar conhecimento?'
                      : selectedCreationGroup === 'estudar'
                        ? 'O que você deseja estudar?'
                        : 'O que deseja armazenar?'}
                  </p>
                </div>

                {!selectedCreationGroup ? (
                  /* ── Escolha principal: Estudar / Biblioteca ── */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                    {CREATION_GROUPS.map(group => (
                      <button
                        key={group.id}
                        onClick={() => {
                          setSelectedCreationGroup(group.id)
                          setSelectedUiMode(null)
                          setEstudarType(null)
                        }}
                        style={{
                          textAlign: 'left', padding: '1.4rem 1.25rem',
                          background: 'var(--surface-2)',
                          border: '1.5px solid var(--border-subtle)',
                          borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit',
                          minHeight: '140px',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = `${group.color}55`
                          e.currentTarget.style.background  = `${group.color}06`
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)'
                          e.currentTarget.style.background  = 'var(--surface-2)'
                        }}
                      >
                        <div style={{ fontSize: '1.65rem', marginBottom: '0.7rem' }}>{group.emoji}</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: group.color, marginBottom: '0.5rem' }}>{group.label}</div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                          {group.description}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : selectedCreationGroup === 'estudar' ? (
                  /* ── Estudar: campo de busca + tipo ── */
                  <>
                    <button
                      onClick={() => { setSelectedCreationGroup(null); setSelectedUiMode(null); setEstudarType(null); setEstudarQuery(''); setCreateError(null) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'inherit' }}
                    >
                      ← Voltar
                    </button>

                    <div style={{ marginBottom: detectedRef ? '0.6rem' : '1rem' }}>
                      <input
                        value={estudarQuery}
                        onChange={e => setEstudarQuery(e.target.value)}
                        placeholder="Ex: João 4 · Romanos 8 · Comunhão · Justificação · Família"
                        autoFocus
                        style={{
                          width: '100%', padding: '0.65rem 0.9rem',
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                          borderRadius: '8px', color: 'var(--text-primary)',
                          fontSize: '0.92rem', outline: 'none', fontFamily: 'inherit',
                          boxSizing: 'border-box' as const,
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                      />
                    </div>

                    {detectedRef && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.45rem',
                        background: '#0F766E0A', border: '1px solid #0F766E30',
                        borderRadius: '7px', padding: '0.4rem 0.75rem',
                        marginBottom: '0.75rem', fontSize: '0.78rem',
                      }}>
                        <span style={{ color: '#0F766E', fontWeight: 700 }}>✓</span>
                        <span style={{ color: '#0F766E', fontWeight: 600 }}>{detectedRef.book} {detectedRef.passage}</span>
                        <span style={{ color: 'var(--text-muted)' }}>·</span>
                        <span style={{ color: 'var(--text-muted)' }}>{detectedRef.testament === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.68rem' }}>detectado automaticamente</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' }}>
                      {([
                        { id: 'texto'    as const, label: 'Texto Bíblico', desc: 'Análise de uma passagem específica da Escritura', uiMode: 'exegetico'   as UiModeId },
                        { id: 'tema'     as const, label: 'Tema',          desc: 'Rastreie um tema ao longo de toda a Escritura',    uiMode: 'tematico'    as UiModeId },
                        { id: 'doutrina' as const, label: 'Doutrina',      desc: 'Investigue sistematicamente uma doutrina bíblica', uiMode: 'doutrinario' as UiModeId },
                        { id: 'termo'    as const, label: 'Termo',         desc: 'Estude palavras bíblicas em profundidade',          uiMode: 'termos'      as UiModeId },
                      ] as const).map(option => {
                        const sel = estudarType === option.id
                        const color = '#0F766E'
                        return (
                          <button
                            key={option.id}
                            onClick={() => { setEstudarType(option.id); selectUiMode(option.uiMode) }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.85rem',
                              textAlign: 'left', padding: '0.7rem 0.9rem',
                              background: sel ? `${color}0A` : 'var(--surface-2)',
                              border: `1.5px solid ${sel ? color : 'var(--border-subtle)'}`,
                              borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'all 0.13s',
                            }}
                          >
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${sel ? color : 'var(--border)'}`,
                              background: sel ? color : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {sel && <div style={{ width: '5px', height: '5px', background: '#fff', borderRadius: '50%' }} />}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: sel ? 700 : 500, color: sel ? color : 'var(--text-primary)' }}>
                                {option.label}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.08rem' }}>
                                {option.desc}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  /* ── Biblioteca: grid de tipos de conteúdo ── */
                  <>
                    <button
                      onClick={() => { setSelectedCreationGroup(null); setSelectedUiMode(null); setCreateError(null) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'inherit' }}
                    >
                      ← Voltar
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', marginBottom: '1.5rem' }}>
                      {([
                        { emoji: '🎓', label: 'Curso',          act: () => { selectUiMode('curso');           setModalStep('form') } },
                        { emoji: '🏫', label: 'Aula',           act: () => { selectUiMode('aula');            setModalStep('form') } },
                        { emoji: '🎤', label: 'Palestra',       act: () => { selectUiMode('palestra');        setModalStep('form') } },
                        { emoji: '📕', label: 'Livro',          act: () => { selectUiMode('livro');           setModalStep('form') } },
                        { emoji: '📙', label: 'E-book',         act: () => { selectUiMode('ebook');           setModalStep('form') } },
                        { emoji: '📝', label: 'Artigo',         act: () => { selectUiMode('artigo');          setModalStep('form') } },
                        { emoji: '🧩', label: 'Série',          act: () => { selectUiMode('serie_mensagens'); setModalStep('form') } },
                        { emoji: '🧠', label: 'Conhecimento',   act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '📄', label: 'Documento',      act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '📋', label: 'PDF',            act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '📓', label: 'Notas',          act: () => { closeModal(); router.push('/knowledge') } },
                        { emoji: '🎫', label: 'Conferência',    act: () => { selectUiMode('palestra');        setModalStep('form') } },
                      ] as const).map((item, idx) => (
                        <button
                          key={idx}
                          onClick={item.act}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            padding: '0.85rem 0.5rem', gap: '0.35rem',
                            background: 'var(--surface-2)',
                            border: '1.5px solid var(--border-subtle)',
                            borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.13s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#B4530950'; e.currentTarget.style.background = '#B453090A' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--surface-2)' }}
                        >
                          <span style={{ fontSize: '1.3rem' }}>{item.emoji}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={closeModal} style={{
                    flex: 1, padding: '0.6rem', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.88rem',
                  }}>
                    Cancelar
                  </button>
                  {selectedCreationGroup !== 'armazenar' && (
                    <button
                      onClick={() => {
                        if (creating) return
                        if (detectedRef) { createStudyDirect(); return }
                        if (estudarType && estudarType !== 'texto' && estudarQuery.trim()) {
                          createTopicDirect(
                            estudarType === 'tema' ? 'tematico' : estudarType === 'doutrina' ? 'doutrinario' : 'termos',
                            estudarQuery.trim()
                          )
                          return
                        }
                        if (!estudarType || !selectedUiMode) return
                        if (estudarQuery.trim() && estudarType !== 'texto') {
                          updateTopic(estudarQuery.trim())
                        }
                        setModalStep('form')
                      }}
                      disabled={!selectedCreationGroup || (!estudarType && !detectedRef) || creating}
                      style={{
                        flex: 2, padding: '0.6rem',
                        background: (selectedCreationGroup && (estudarType || detectedRef) && !creating)
                          ? '#0F766E'
                          : 'var(--surface-3)',
                        color: (selectedCreationGroup && (estudarType || detectedRef) && !creating) ? '#FFF' : 'var(--text-muted)',
                        border: 'none', borderRadius: '8px',
                        fontWeight: '600',
                        cursor: (selectedCreationGroup && (estudarType || detectedRef) && !creating) ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.15s',
                      }}
                    >
                      {creating
                        ? 'Criando…'
                        : detectedRef
                          ? `Criar — ${detectedRef.book} ${detectedRef.passage} →`
                          : !estudarType
                            ? 'Escolha o tipo de estudo'
                            : estudarType !== 'texto' && estudarQuery.trim()
                              ? 'Criar →'
                              : `Continuar →`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Details form */}
            {modalStep === 'form' && selectedUiMode && (
              <div style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
                {(() => {
                  const uiMode        = UI_MODES.find(m => m.id === selectedUiMode)!
                  const isTopicProduction = ['aula', 'artigo', 'ebook', 'livro', 'palestra', 'curso', 'serie_mensagens'].includes(selectedUiMode)
                  const isPassage     = selectedUiMode !== 'doutrinario' && selectedUiMode !== 'tematico' && selectedUiMode !== 'termos' && !isTopicProduction
                  const isSermon      = selectedUiMode === 'sermao'
                  const detectedLabel = selectedMode ? DETECTED_LABEL[selectedMode] : null
                  const canSubmit     = isPassage
                    ? (selectedMode && form.book && form.passage_ref.trim() && form.testament && (!isSermon || form.sermon_type))
                    : form.topic.trim()
                  const titlePlaceholder = isPassage
                    ? buildReferenceTitle(form.book, form.passage_ref)
                    : form.topic.trim()

                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.4rem' }}>
                        <button
                          onClick={() => { setModalStep('mode'); setCreateError(null) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', fontSize: '0.9rem' }}
                          title="Voltar"
                        >←</button>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{uiMode.emoji}</span>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: uiMode.color }}>{uiMode.label}</h2>
                      </div>

                      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {isPassage ? (
                          <>
                            {isSermon && (
                              <FormField label="Tipo de Sermão">
                                <select
                                  value={form.sermon_type}
                                  onChange={e => updatePassageForm({ sermon_type: e.target.value as SermonType })}
                                  required
                                >
                                  <option value="">Selecione o tipo</option>
                                  {SERMON_TYPE_OPTIONS.map(o => (
                                    <option key={o.id} value={o.id}>{o.label}</option>
                                  ))}
                                </select>
                              </FormField>
                            )}

                            <FormField label="Testamento">
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {(['AT', 'NT'] as const).map(t => (
                                  <button key={t} type="button"
                                    onClick={() => updatePassageForm({ testament: t, book: '' })}
                                    style={{
                                      flex: 1, padding: '0.55rem',
                                      background: form.testament === t ? `${uiMode.color}12` : 'var(--surface-2)',
                                      border: `1px solid ${form.testament === t ? uiMode.color : 'var(--border)'}`,
                                      borderRadius: '6px',
                                      color: form.testament === t ? uiMode.color : 'var(--text-secondary)',
                                      cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', fontFamily: 'inherit',
                                    }}
                                  >
                                    {t === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}
                                  </button>
                                ))}
                              </div>
                            </FormField>

                            <FormField label="Livro">
                              <select
                                value={form.book}
                                onChange={e => updatePassageForm({ book: e.target.value })}
                                disabled={!form.testament}
                                required
                              >
                                <option value="">{form.testament ? 'Selecione o livro' : 'Escolha o testamento primeiro'}</option>
                                {(form.testament === 'NT' ? BOOKS_NT : form.testament === 'AT' ? BOOKS_AT : []).map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </FormField>

                            {/* Badge de gênero detectado (apenas para exegético) */}
                            {selectedUiMode === 'exegetico' && detectedLabel && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: `${uiMode.color}08`,
                                border: `1px solid ${uiMode.color}30`,
                                borderRadius: '8px', padding: '0.5rem 0.85rem',
                              }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: uiMode.color }}>
                                  Gênero detectado
                                </span>
                                <span style={{ fontSize: '0.78rem', color: uiMode.color, fontWeight: 600 }}>·</span>
                                <span style={{ fontSize: '0.78rem', color: uiMode.color, fontWeight: 600 }}>{detectedLabel}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                  O método é ajustado automaticamente
                                </span>
                              </div>
                            )}

                            <FormField label="Passagem">
                              <input
                                value={form.passage_ref}
                                onChange={e => updatePassageForm({ passage_ref: e.target.value })}
                                placeholder="Ex: 1.13–23"
                                required
                              />
                            </FormField>
                          </>
                        ) : (
                          <FormField label={selectedUiMode === 'doutrinario' ? 'Doutrina' : selectedUiMode === 'tematico' ? 'Tema' : selectedUiMode === 'termos' ? 'Termo' : 'Título ou assunto'}>
                            <input
                              value={form.topic}
                              onChange={e => updateTopic(e.target.value)}
                              placeholder={selectedUiMode === 'doutrinario'
                                ? 'Ex: Justificação · Santificação · Eleição'
                                : selectedUiMode === 'tematico'
                                  ? 'Ex: Família · Casamento · Trabalho · Sofrimento'
                                  : selectedUiMode === 'termos'
                                    ? 'Ex: graça · aliança · παρουσία · חֶסֶד'
                                    : 'Ex: Liderança cristã · Discipulado · Cristologia paulina'}
                              required
                            />
                          </FormField>
                        )}

                        {titlePlaceholder && (
                          <FormField label="Título do Projeto">
                            <input
                              value={form.title}
                              onChange={e => updateTitle(e.target.value)}
                              placeholder={titlePlaceholder}
                            />
                            <p style={{ margin: '0.45rem 0 0', color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.45 }}>
                              Gerado automaticamente. Você pode alterar a qualquer momento.
                            </p>
                          </FormField>
                        )}

                        {createError && (
                          <div style={{
                            color: '#DC2626', background: 'rgba(220,38,38,0.06)',
                            border: '1px solid rgba(220,38,38,0.2)',
                            borderRadius: '7px', padding: '0.6rem 0.85rem',
                            fontSize: '0.84rem', lineHeight: 1.4,
                          }}>
                            {createError}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <button type="button" onClick={closeModal} style={{
                            flex: 1, padding: '0.65rem', background: 'transparent',
                            border: '1px solid var(--border)', borderRadius: '8px',
                            color: 'var(--text-secondary)', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.9rem',
                          }}>
                            Cancelar
                          </button>
                          <button type="submit" disabled={creating || !canSubmit} style={{
                            flex: 2, padding: '0.65rem',
                            background: (creating || !canSubmit) ? 'var(--surface-3)' : uiMode.color,
                            color: (creating || !canSubmit) ? 'var(--text-muted)' : '#FFFFFF',
                            border: 'none', borderRadius: '8px',
                            fontWeight: '600',
                            cursor: creating ? 'wait' : !canSubmit ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', fontSize: '0.9rem', transition: 'background 0.15s',
                          }}>
                            {creating ? 'Criando…'
                              : !isPassage ? 'Iniciar projeto →'
                              : isSermon && !form.sermon_type ? 'Escolha o tipo de sermão'
                              : !form.book ? 'Selecione um livro'
                              : !form.passage_ref.trim() ? 'Informe a passagem'
                              : `Iniciar ${detectedLabel ?? uiMode.label} →`}
                          </button>
                        </div>
                      </form>
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div
          onClick={e => { if (e.target === e.currentTarget && !deleteConfirming) setDeleteTarget(null) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 60, padding: '1rem',
          }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)',
            width: '100%', maxWidth: '400px', padding: '1.75rem',
            animation: 'fadeIn 0.15s ease-out',
            boxShadow: '0 8px 32px rgba(15,23,42,0.15)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Excluir projeto?
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Esta ação não poderá ser desfeita.
            </p>

            {/* Project info */}
            <div style={{
              background: 'var(--surface-2)', borderRadius: '9px',
              padding: '0.85rem 1rem', marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {deleteTarget.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span>{getModeConfig(deleteTarget.study_mode ?? deleteTarget.project_type).name}</span>
                {deleteTarget.book && deleteTarget.book !== '—' && (
                  <span style={{ fontStyle: 'italic' }}>{deleteTarget.book} {deleteTarget.passage_ref}</span>
                )}
                <span>Modificado {formatDate(deleteTarget.updated_at)} · Criado {formatDate(deleteTarget.created_at)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteConfirming}
                style={{
                  flex: 1, padding: '0.65rem',
                  background: 'var(--surface-2)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  fontWeight: 600, cursor: deleteConfirming ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.12s',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirming}
                style={{
                  flex: 1, padding: '0.65rem',
                  background: deleteConfirming ? 'var(--surface-3)' : '#EF4444',
                  color: '#FFFFFF',
                  border: 'none', borderRadius: '8px',
                  fontWeight: 600, cursor: deleteConfirming ? 'wait' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem', transition: 'background 0.12s',
                }}
              >
                {deleteConfirming ? 'Excluindo…' : 'Excluir projeto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ShelfLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}

function RecentCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: () => void }) {
  const mode   = getModeConfig(project.study_mode ?? project.project_type)
  const visual = MODE_VISUALS[mode.id as StudyModeId]
  const isPassage = mode.passageBased
  const subtitle = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: '1px solid rgba(226,232,240,0.9)',
        borderRadius: '9px',
        padding: '0.95rem 1.15rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        boxShadow: `inset 3px 0 0 ${visual.color}20`,
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${visual.color}, 0 2px 14px rgba(15,23,42,0.07)`;
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,213,225,0.9)'
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `inset 3px 0 0 ${visual.color}20`;
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.9)'
      }}
    >
      {/* Mode icon badge */}
      <div style={{
        width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
        background: visual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: visual.color,
      }}>
        {isValidElement<{ width?: number; height?: number }>(MODE_ICONS[mode.id as StudyModeId])
          ? cloneElement(MODE_ICONS[mode.id as StudyModeId] as React.ReactElement<{ width?: number; height?: number }>, { width: 15, height: 15 })
          : MODE_ICONS[mode.id as StudyModeId]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2,
          color: 'var(--text-primary)', marginBottom: '0.2rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
        }}>
          <span style={{ color: visual.color, fontWeight: 500, opacity: 0.85, flexShrink: 0 }}>
            {mode.name}
          </span>
          {subtitle && (
            <>
              <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
              <span style={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtitle}
              </span>
            </>
          )}
          <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>
          <span style={{ flexShrink: 0 }}>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      {/* ⋮ menu */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.2rem 0.3rem',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            opacity: hovered || menuOpen ? 1 : 0,
            transition: 'opacity 0.15s, background 0.12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
            background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px',
          }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-muted)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.4 }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </div>
  )
}

function ProjectCard({
  project, mode, onClick, onDelete,
}: {
  project: Project
  mode: StudyModeConfig
  onClick: () => void
  onDelete: () => void
}) {
  const visual = modeVisual(mode.id as StudyModeId)
  const isCompleted = project.status === 'completed'
  const isPassage   = mode.passageBased
  const subtitle = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : null
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: '1px solid rgba(226,232,240,0.9)',
        borderRadius: '7px',
        padding: '0.7rem 1rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        position: 'relative',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 12px rgba(15,23,42,0.07)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(203,213,225,0.9)'
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.9)'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500, fontSize: '0.88rem', lineHeight: 1.25,
          color: 'var(--text-primary)', marginBottom: '0.18rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {project.title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden',
        }}>
          {subtitle && (
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic',
            }}>
              {subtitle}
            </span>
          )}
          {subtitle && <span style={{ opacity: 0.35, flexShrink: 0 }}>·</span>}
          <span style={{ flexShrink: 0 }}>{formatDate(project.updated_at)}</span>
        </div>
      </div>

      <span style={{
        fontSize: '0.7rem', fontWeight: isCompleted ? 600 : 400, flexShrink: 0,
        color: isCompleted ? '#16a34a' : 'var(--text-muted)',
        opacity: isCompleted ? 1 : 0.75,
      }}>
        {statusLabel(project.status)}
      </span>

      {/* ⋮ menu */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.2rem 0.3rem',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            opacity: hovered || menuOpen ? 1 : 0,
            transition: 'opacity 0.15s, background 0.12s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
        {menuOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
            background: '#FFF', border: '1px solid var(--border)', borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '140px',
          }}>
            <button onClick={() => { setMenuOpen(false); onDelete() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', color: '#EF4444', padding: '0.4rem 0.65rem', borderRadius: '7px', transition: 'background 0.1s' }} onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PublishedProjectCard({
  project, category, onOpen, onUnpublish,
}: {
  project: Project
  category: string
  onOpen: () => void
  onUnpublish: () => void
}) {
  const mode = getModeConfig(project.study_mode ?? project.project_type)
  const visual = MODE_VISUALS[mode.id as StudyModeId] ?? MODE_VISUALS.exegese_biblica
  const isPassage = mode.passageBased
  const subject = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—'
      ? project.passage_ref
      : typeof project.meta?.topic === 'string'
        ? project.meta.topic
        : 'Projeto Lampas'

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${visual.border}`,
      borderRadius: '9px',
      padding: '0.9rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
      minHeight: '176px',
      borderTop: `3px solid ${visual.color}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: visual.color, background: visual.bg, border: `1px solid ${visual.border}`, borderRadius: '999px', padding: '0.12rem 0.45rem' }}>
            Publicado
          </span>
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{category}</span>
        </div>
        <h4 style={{
          margin: '0 0 0.35rem',
          color: 'var(--text-primary)',
          fontSize: '0.93rem',
          lineHeight: 1.28,
          fontWeight: 800,
        }}>
          {project.title}
        </h4>
        <p style={{
          margin: 0,
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          lineHeight: 1.45,
          fontStyle: isPassage ? 'italic' : 'normal',
        }}>
          {subject}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
        <div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Publicado</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.12rem' }}>{formatCalendarDate(project.published_at)}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Atualizado</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.12rem' }}>{formatCalendarDate(project.updated_at)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
        <button
          onClick={onOpen}
          style={{
            flex: 1,
            background: visual.color,
            border: `1px solid ${visual.color}`,
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.74rem',
            fontWeight: 800,
            padding: '0.42rem 0.65rem',
          }}
        >
          Abrir
        </button>
        <button
          onClick={onUnpublish}
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '0.42rem 0.65rem',
          }}
        >
          Despublicar
        </button>
      </div>
    </div>
  )
}

function CollapseHeader({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.1rem 0', fontFamily: 'inherit',
      }}
    >
      <svg
        width="9" height="9" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', flexShrink: 0 }}
      >
        <path d="M6 9l6 6 6-6"/>
      </svg>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </button>
  )
}

function DashLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  )
}

function StudyCard({ project, onClick, onDelete }: { project: Project; onClick: () => void; onDelete: () => void }) {
  const mode      = getModeConfig(project.study_mode ?? project.project_type)
  const visual    = MODE_VISUALS[mode.id as StudyModeId]
  const isPassage = mode.passageBased
  const ref = isPassage && project.book && project.book !== '—'
    ? `${project.book} ${project.passage_ref}`
    : project.passage_ref && project.passage_ref !== '—' ? project.passage_ref : null
  const [menuOpen, setMenuOpen] = useState(false)
  const isCompleted = project.status === 'completed'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: `1px solid ${visual.border}`,
        borderRadius: '12px', padding: '1.15rem 1.2rem',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem',
        transition: 'box-shadow 0.15s', position: 'relative',
        borderTop: `3px solid ${visual.color}`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(15,23,42,0.09)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 22, height: 22, borderRadius: '6px', background: visual.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: visual.color }}>
            {isValidElement<{ width?: number; height?: number }>(MODE_ICONS[mode.id as StudyModeId])
              ? cloneElement(MODE_ICONS[mode.id as StudyModeId] as React.ReactElement<{ width?: number; height?: number }>, { width: 11, height: 11 })
              : MODE_ICONS[mode.id as StudyModeId]}
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: visual.color }}>{mode.name}</span>
        </div>
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.15rem', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 2px)', zIndex: 20, background: '#FFF', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '0.3rem', minWidth: '120px' }}>
              <button
                onClick={() => { setMenuOpen(false); onDelete() }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', color: '#EF4444', padding: '0.38rem 0.6rem', borderRadius: '5px', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: ref ? '0.2rem' : 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {project.title}
        </div>
        {ref && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{ref}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: '0.65rem', color: isCompleted ? '#10B981' : 'var(--text-muted)', fontWeight: isCompleted ? 600 : 400 }}>
          {isCompleted ? 'Concluído' : `Atualizado ${formatDate(project.updated_at)}`}
        </span>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: visual.color }}>Continuar →</span>
      </div>
    </div>
  )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div style={{ width: 100, height: 100, flexShrink: 0 }} />

  let cumPct = 0
  const stops = data.map(d => {
    const pct = (d.value / total) * 100
    const stop = `${d.color} ${cumPct.toFixed(1)}% ${(cumPct + pct).toFixed(1)}%`
    cumPct += pct
    return stop
  }).join(', ')

  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: `conic-gradient(${stops})` }} />
      <div style={{ position: 'absolute', inset: '22px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</span>
      </div>
    </div>
  )
}

function BibleMap({ studiedBooks }: { studiedBooks: Set<string> }) {
  const studiedAT = BOOKS_AT.filter(b => studiedBooks.has(b)).length
  const studiedNT = BOOKS_NT.filter(b => studiedBooks.has(b)).length

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1.25rem', marginTop: '0.85rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: '#D97706', padding: '0.18rem 0.55rem', background: 'rgba(217,119,6,0.08)', borderRadius: '99px', fontWeight: 600 }}>AT: {studiedAT}/{BOOKS_AT.length}</span>
        <span style={{ fontSize: '0.72rem', color: '#7C3AED', padding: '0.18rem 0.55rem', background: 'rgba(124,58,237,0.08)', borderRadius: '99px', fontWeight: 600 }}>NT: {studiedNT}/{BOOKS_NT.length}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.18rem 0.55rem', background: 'var(--surface-2)', borderRadius: '99px', fontWeight: 600 }}>Total: {studiedAT + studiedNT}/66</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { label: 'Antigo Testamento', books: BOOKS_AT, accentColor: '#D97706' },
          { label: 'Novo Testamento',   books: BOOKS_NT, accentColor: '#7C3AED' },
        ].map(section => (
          <div key={section.label}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{section.label}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem' }}>
              {section.books.map(book => {
                const studied = studiedBooks.has(book)
                return (
                  <span key={book} title={studied ? `${book} — estudado` : book} style={{
                    padding: '0.18rem 0.5rem', borderRadius: '4px', fontSize: '0.66rem',
                    fontWeight: studied ? 600 : 400,
                    background: studied ? section.accentColor : 'var(--surface-2)',
                    color: studied ? '#FFFFFF' : 'var(--text-muted)',
                    border: `1px solid ${studied ? section.accentColor : 'var(--border-subtle)'}`,
                    cursor: 'default', whiteSpace: 'nowrap',
                  }}>
                    {book}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  async function handleStartDemo() {
    setStarting(true)
    try {
      const res  = await fetch('/api/projects/demo', { method: 'POST' })
      const data = await res.json() as { id?: string; error?: string }
      if (data.id) router.push(`/workspace/${data.id}`)
    } catch { /* noop */ }
    finally { setStarting(false) }
  }

  return (
    <div style={{
      borderRadius: '16px', overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
    }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1a2540 100%)',
        padding: '3rem 2.5rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', gap: '1rem',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'rgba(201,146,26,0.18)', border: '1.5px solid rgba(201,146,26,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '0.25rem',
        }}>📖</div>

        <h2 style={{
          margin: 0, fontSize: '1.5rem', fontWeight: 750,
          color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Bem-vindo ao Lampas
        </h2>
        <p style={{
          margin: 0, fontSize: '0.92rem', color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.65, maxWidth: '420px',
        }}>
          Antes de criar seu próprio estudo, percorra um estudo guiado e conheça o método — do texto ao coração.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          marginTop: '0.25rem',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(201,146,26,0.85)', marginBottom: '0.15rem' }}>
              Estudo guiado
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF' }}>João 3.16 — Devocional</div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>8 etapas · Preparar → Contemplar → Responder</div>
          </div>
        </div>

        <button
          onClick={handleStartDemo}
          disabled={starting}
          style={{
            marginTop: '0.5rem',
            background: starting ? 'rgba(201,146,26,0.6)' : 'linear-gradient(135deg, #C9921A 0%, #D97706 100%)',
            color: '#FFFFFF', border: 'none',
            borderRadius: '10px', padding: '0.7rem 1.75rem',
            fontWeight: 700, cursor: starting ? 'wait' : 'pointer',
            fontSize: '0.92rem', fontFamily: 'inherit',
            boxShadow: '0 4px 16px rgba(201,146,26,0.3)',
            display: 'flex', alignItems: 'center', gap: '0.45rem',
            transition: 'all 0.15s',
          }}
        >
          {starting ? 'Criando estudo…' : '→ Iniciar estudo guiado'}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        background: 'var(--surface)', padding: '1rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prefere começar direto?</span>
        <button onClick={onNew} style={{
          background: 'transparent', border: 'none',
          color: 'var(--accent)', fontWeight: 600,
          cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit',
          padding: 0,
        }}>
          Criar meu próprio projeto
        </button>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)',
        marginBottom: '0.35rem', textTransform: 'uppercase',
        letterSpacing: '0.07em', fontWeight: '600',
      }}>
        {label}
      </label>
      <style>{`
        .field-input input, .field-input select {
          width: 100%; padding: 0.6rem 0.85rem;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 7px; color: var(--text-primary);
          font-size: 0.92rem; outline: none; font-family: inherit;
          transition: border-color 0.15s; box-sizing: border-box;
        }
        .field-input input:focus, .field-input select:focus { border-color: var(--accent); }
        .field-input select option { background: var(--surface-2); }
      `}</style>
      <div className="field-input">{children}</div>
    </div>
  )
}
