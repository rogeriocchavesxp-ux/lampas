/**
 * dictionary-lookup.ts
 *
 * Utilitário server-side para consultar o Dicionário Lampas antes de acionar IA.
 * Fluxo: busca por correspondência exata → transliteração → tags → full-text.
 * Retorna null se não encontrado — o chamador deve então acionar a IA.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface DictEntry {
  id: string
  title: string
  slug: string | null
  category: string
  trust_level: number
  definition: string | null
  etymology: string | null
  lang_hebrew: string | null
  lang_greek: string | null
  lang_aramaic: string | null
  transliteration: string | null
  main_texts: string | null
  theological_biblical: string | null
  theological_systematic: string | null
  applications: string | null
  cross_references: string[]
  bibliography: string | null
  query_count: number
}

export interface DictLookupResult {
  found: boolean
  entry: DictEntry | null
  matchType: 'exact' | 'transliteration' | 'tag' | 'fulltext' | null
}

/**
 * Busca um termo no Dicionário Lampas.
 * Ordem de prioridade: título exato → transliteração → tag → full-text.
 */
export async function lookupDictionary(
  term: string,
  supabase: SupabaseClient,
): Promise<DictLookupResult> {
  if (!term?.trim()) return { found: false, entry: null, matchType: null }

  const q = term.trim()

  // 1. Correspondência exata no título (case-insensitive)
  const { data: exact } = await supabase
    .from('lampas_dictionary')
    .select(DICT_FIELDS)
    .ilike('title', q)
    .order('trust_level', { ascending: false })
    .limit(1)
    .single()

  if (exact) return { found: true, entry: exact as unknown as DictEntry, matchType: 'exact' }

  // 2. Transliteração exata
  const { data: translit } = await supabase
    .from('lampas_dictionary')
    .select(DICT_FIELDS)
    .ilike('transliteration', q)
    .order('trust_level', { ascending: false })
    .limit(1)
    .single()

  if (translit) return { found: true, entry: translit as unknown as DictEntry, matchType: 'transliteration' }

  // 3. Tag exata
  const { data: byTag } = await supabase
    .from('lampas_dictionary')
    .select(DICT_FIELDS)
    .contains('tags', [q.toLowerCase()])
    .order('trust_level', { ascending: false })
    .limit(1)
    .single()

  if (byTag) return { found: true, entry: byTag as unknown as DictEntry, matchType: 'tag' }

  // 4. Full-text via RPC
  const { data: ftResults } = await supabase
    .rpc('search_dictionary', { p_query: q, p_limit: 1 })

  if (ftResults && ftResults.length > 0 && (ftResults[0] as { rank: number }).rank > 0.1) {
    const { data: full } = await supabase
      .from('lampas_dictionary')
      .select(DICT_FIELDS)
      .eq('id', (ftResults[0] as { id: string }).id)
      .single()

    if (full) return { found: true, entry: full as unknown as DictEntry, matchType: 'fulltext' }
  }

  return { found: false, entry: null, matchType: null }
}

/**
 * Formata uma entrada do dicionário como contexto para injetar em prompts de IA.
 * Usado pelos endpoints generate/stream para enriquecer a geração sem nova consulta.
 */
export function formatDictEntryAsContext(entry: DictEntry): string {
  const lines: string[] = [
    `### Dicionário Lampas — "${entry.title}"`,
    `Categoria: ${entry.category} | Confiança: ${entry.trust_level}/4`,
  ]

  if (entry.definition)             lines.push(`\n**Definição:**\n${entry.definition}`)
  if (entry.lang_hebrew)            lines.push(`**Hebraico:** ${entry.lang_hebrew}`)
  if (entry.lang_greek)             lines.push(`**Grego:** ${entry.lang_greek}`)
  if (entry.transliteration)        lines.push(`**Transliteração:** ${entry.transliteration}`)
  if (entry.theological_biblical)   lines.push(`\n**Teologia Bíblica:**\n${entry.theological_biblical}`)
  if (entry.theological_systematic) lines.push(`\n**Teologia Sistemática:**\n${entry.theological_systematic}`)
  if (entry.applications)           lines.push(`\n**Aplicações:**\n${entry.applications}`)
  if (entry.cross_references?.length > 0) {
    lines.push(`\n**Referências cruzadas:** ${entry.cross_references.join(', ')}`)
  }

  return lines.join('\n')
}

const DICT_FIELDS = [
  'id', 'title', 'slug', 'category', 'trust_level',
  'definition', 'etymology',
  'lang_hebrew', 'lang_greek', 'lang_aramaic', 'transliteration',
  'main_texts', 'theological_biblical', 'theological_systematic',
  'applications', 'cross_references', 'bibliography', 'query_count',
].join(', ')
