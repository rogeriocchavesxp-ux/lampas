/**
 * generation-orchestrator.ts
 *
 * Orquestrador central de geração de conhecimento do Lampas.
 * Princípio: a IA é o último recurso.
 *
 * Cadeia de consulta (em ordem):
 *   1. Dicionário Lampas  — base estruturada de termos bíblicos/teológicos
 *   2. Biblioteca Lampas  — cache persistente de respostas Q&A
 *   3. IA                 — somente se as duas camadas não respondem
 *
 * O Redis (ai-cache.ts) já é consultado internamente no stream/route.ts
 * para seções de workspace. O orchestrator cuida especificamente de
 * consultas ao Dicionário/Ferramentas.
 */

import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { lookupDictionary } from './dictionary-lookup'
import type { DictEntry } from './dictionary-lookup'

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export type QuerySource = 'dictionary' | 'library' | 'ai'

export type GenerationMode =
  | 'economic'   // dict → library → AI se necessário
  | 'quality'    // dict → library → AI sempre (para atualizar)
  | 'academic'   // economic + marcadores de citação obrigatórios

export interface OrchestratorResult {
  found:      boolean
  content:    string
  source:     QuerySource
  trustLevel: number
  entryId?:   string
}

interface LibraryRow {
  id: string
  response: string
  trust_level: number
}

// ── Utilitários ────────────────────────────────────────────────────────────────

export function normalizeQuery(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function makeQueryHash(term: string): string {
  return createHash('sha256').update(normalizeQuery(term)).digest('hex').slice(0, 40)
}

// ── Lookup: Dicionário ─────────────────────────────────────────────────────────

async function fromDictionary(
  term: string,
  supabase: SupabaseClient,
): Promise<OrchestratorResult | null> {
  const result = await lookupDictionary(term, supabase)
  if (!result.found || !result.entry) return null

  void supabase.rpc('increment_dictionary_query_count', { p_id: result.entry.id })

  return {
    found:      true,
    content:    formatDictEntry(result.entry),
    source:     'dictionary',
    trustLevel: result.entry.trust_level,
    entryId:    result.entry.id,
  }
}

// ── Lookup: Biblioteca ─────────────────────────────────────────────────────────

async function fromLibrary(
  term: string,
  supabase: SupabaseClient,
): Promise<OrchestratorResult | null> {
  const hash = makeQueryHash(term)
  const norm = normalizeQuery(term)

  // 1. Hash exato
  const { data: exact } = await supabase
    .from('lampas_library')
    .select('id, response, trust_level')
    .eq('query_hash', hash)
    .single()

  if (exact) {
    const row = exact as LibraryRow
    void supabase.rpc('increment_library_query_count', { p_id: row.id })
    return { found: true, content: row.response, source: 'library', trustLevel: row.trust_level, entryId: row.id }
  }

  // 2. Alias semântico (texto normalizado)
  const { data: aliasRow } = await supabase
    .from('lampas_query_aliases')
    .select('library_entry_id')
    .ilike('alias_text', norm)
    .not('library_entry_id', 'is', null)
    .limit(1)
    .single()

  if (aliasRow?.library_entry_id) {
    const { data: libRow } = await supabase
      .from('lampas_library')
      .select('id, response, trust_level')
      .eq('id', aliasRow.library_entry_id as string)
      .single()

    if (libRow) {
      const row = libRow as LibraryRow
      void supabase.rpc('increment_library_query_count', { p_id: row.id })
      return { found: true, content: row.response, source: 'library', trustLevel: row.trust_level, entryId: row.id }
    }
  }

  return null
}

// ── Ponto de entrada principal ─────────────────────────────────────────────────

export async function queryKnowledgeBase(
  term: string,
  supabase: SupabaseClient,
  mode: GenerationMode = 'economic',
): Promise<OrchestratorResult | null> {
  if (!term?.trim()) return null

  // Modo qualidade: pula o cache e chama IA sempre (mas ainda loga a fonte)
  if (mode === 'quality') return null

  // 1. Dicionário
  const dictResult = await fromDictionary(term, supabase)
  if (dictResult) return dictResult

  // 2. Biblioteca
  const libResult = await fromLibrary(term, supabase)
  if (libResult) return libResult

  return null
}

// ── Salvar resposta na Biblioteca ─────────────────────────────────────────────

export async function saveToLibrary(
  term: string,
  response: string,
  meta: {
    userId:      string
    sectionSlug?: string
    passageRef?:  string
    studyMode?:   string
  },
  supabase: SupabaseClient,
): Promise<void> {
  const hash = makeQueryHash(term)
  const tags = [normalizeQuery(term), term.trim().toLowerCase()].filter((v, i, a) => a.indexOf(v) === i)

  const { data: inserted } = await supabase
    .from('lampas_library')
    .upsert({
      query_hash:   hash,
      query_text:   term.trim(),
      response,
      section_slug: meta.sectionSlug,
      passage_ref:  meta.passageRef,
      study_mode:   meta.studyMode,
      trust_level:  1,
      source:       'ai',
      tags,
      created_by:   meta.userId,
    }, { onConflict: 'query_hash', ignoreDuplicates: false })
    .select('id')
    .single()

  // Adiciona alias com o termo normalizado para buscas semânticas futuras
  if (inserted?.id) {
    await supabase.from('lampas_query_aliases').upsert({
      alias_text:       normalizeQuery(term),
      library_entry_id: inserted.id,
      created_by:       meta.userId,
    }, { onConflict: 'alias_text,library_entry_id', ignoreDuplicates: true })
  }
}

// ── Streaming a partir da base de conhecimento ────────────────────────────────
// Retorna uma Response SSE com o conteúdo cacheado, imitando o formato
// do stream do Claude para que o cliente não precise de alterações.

const SOURCE_LABELS: Record<QuerySource, string> = {
  dictionary: 'Dicionário Lampas',
  library:    'Biblioteca Lampas',
  ai:         'IA',
}

export function makeKnowledgeBaseStream(
  result: OrchestratorResult,
): Response {
  const encoder = new TextEncoder()

  const header = result.source !== 'ai'
    ? `> **${SOURCE_LABELS[result.source]}** · Confiança ${result.trustLevel}/5\n\n`
    : ''

  const fullContent = header + result.content

  const readable = new ReadableStream({
    start(controller) {
      const chunkSize = 100
      for (let i = 0; i < fullContent.length; i += chunkSize) {
        const chunk = fullContent.slice(i, i + chunkSize)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ delta: { text: chunk } })}\n\n`)
        )
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache',
      'Connection':        'keep-alive',
      'X-Lampas-Source':   result.source,
      'X-Lampas-Trust':    String(result.trustLevel),
    },
  })
}

// ── Instrução de modo acadêmico ────────────────────────────────────────────────

export function academicModeInstruction(): string {
  return `

MODO ACADÊMICO ATIVO:
- Toda resposta deve incluir notas de rodapé numeradas [¹] [²] [³]
- Citações no formato (Autor, Obra, p. X) ou (Sigla: verbete)
- Seção "## Referências" ao final com fontes primárias reformadas
- Fontes obrigatórias quando aplicável: BDAG, HALOT, TWOT, NIDOTTE, TDNT,
  Bavinck (Dogmática Reformada), Berkhof (Teologia Sistemática),
  Murray (Obras Completas), Vos (Teologia Bíblica)
- Nunca cite Wikipedia, blogs ou fontes sem autoria reconhecida`
}

// ── Extrair termo de consulta de uma mensagem do dicionário ──────────────────

export function extractDictionaryQuery(message: string): string | null {
  const match = message.match(/Pesquisa lexical[^:]*:\s*"([^"]+)"/)
  return match?.[1]?.trim() ?? null
}

// ── Formatar entrada do dicionário como texto legível ────────────────────────

function formatDictEntry(entry: DictEntry): string {
  const lines: string[] = []

  if (entry.definition)   lines.push(`## Definição\n${entry.definition}\n`)

  if (entry.lang_hebrew || entry.lang_greek || entry.lang_aramaic) {
    lines.push('## Línguas Originais')
    if (entry.lang_hebrew)      lines.push(`**Hebraico:** ${entry.lang_hebrew}`)
    if (entry.lang_greek)       lines.push(`**Grego:** ${entry.lang_greek}`)
    if (entry.lang_aramaic)     lines.push(`**Aramaico:** ${entry.lang_aramaic}`)
    if (entry.transliteration)  lines.push(`**Transliteração:** ${entry.transliteration}`)
    lines.push('')
  }

  if (entry.main_texts)             lines.push(`## Uso Bíblico\n${entry.main_texts}\n`)
  if (entry.theological_biblical)   lines.push(`## Teologia Bíblica\n${entry.theological_biblical}\n`)
  if (entry.theological_systematic) lines.push(`## Teologia Sistemática\n${entry.theological_systematic}\n`)
  if (entry.applications)           lines.push(`## Aplicações Pastorais\n${entry.applications}\n`)

  if (entry.cross_references?.length > 0) {
    lines.push(`## Referências Cruzadas\n${entry.cross_references.join(' · ')}\n`)
  }

  if (entry.bibliography) lines.push(`## Bibliografia\n${entry.bibliography}\n`)

  return lines.join('\n')
}
