import type { SupabaseClient } from '@supabase/supabase-js'

export interface ConfessionalItem {
  id: string
  document_id: string
  document_title: string
  document_slug: string
  kind: 'confession' | 'catechism' | 'canons'
  item_type: 'chapter' | 'question'
  number_label: string
  title: string
  content: string | null
  doctrine_tags: string[]
  bible_references: string[]
  dictionary_terms: string[]
  rank: number
}

export interface ConfessionalSuggestion {
  document_title: string
  document_slug: string
  kind: 'confession' | 'catechism' | 'canons'
  item_type: 'chapter' | 'question'
  number_label: string
  title: string
  content: string | null
  doctrine_tags: string[]
  bible_references: string[]
  relevance: number
}

export interface ConfessionalLookupResult {
  found: boolean
  items: ConfessionalItem[]
}

export async function lookupConfessionalLayer(
  term: string,
  supabase: SupabaseClient,
): Promise<ConfessionalLookupResult> {
  if (!term?.trim()) return { found: false, items: [] }

  const { data } = await supabase.rpc('search_confessional_items', {
    p_query: term.trim(),
    p_doctrine: term.trim(),
    p_bible_ref: null,
    p_kind: null,
    p_limit: 8,
  })

  const items = ((data ?? []) as ConfessionalItem[]).filter(item => item.rank > 0.1)
  return { found: items.length > 0, items }
}

export async function getConfessionalSuggestions(
  doctrine: string,
  supabase: SupabaseClient,
  limit = 8,
): Promise<ConfessionalSuggestion[]> {
  if (!doctrine?.trim()) return []

  const { data } = await supabase.rpc('get_confessional_suggestions', {
    p_doctrine: doctrine.trim(),
    p_limit: limit,
  })

  return (data ?? []) as ConfessionalSuggestion[]
}

export function formatConfessionalItems(items: ConfessionalItem[]): string {
  if (items.length === 0) return ''

  const lines = ['## Confissões e Catecismos']
  for (const item of items) {
    const label = item.item_type === 'question' ? 'Pergunta' : 'Capítulo'
    lines.push('\n### ' + item.document_title + ' — ' + label + ' ' + item.number_label)
    lines.push('**' + item.title + '**')
    if (item.content) lines.push(item.content)
    if (item.doctrine_tags.length > 0) lines.push('Doutrinas: ' + item.doctrine_tags.join(', '))
    if (item.bible_references.length > 0) lines.push('Referências bíblicas: ' + item.bible_references.join(', '))
    if (item.dictionary_terms.length > 0) lines.push('Dicionário Lampas: ' + item.dictionary_terms.join(', '))
  }

  return lines.join('\n')
}

export function formatConfessionalSuggestionsAsContext(items: ConfessionalSuggestion[]): string {
  if (items.length === 0) return ''

  const lines = [
    '### Confissões e Catecismos Lampas — sugestões automáticas',
    'Use esta camada após a Bíblia e antes do Dicionário/Biblioteca ao formular a doutrina.',
  ]

  for (const item of items) {
    const label = item.item_type === 'question' ? 'Pergunta' : 'Capítulo'
    lines.push('- **' + item.document_title + ' ' + label + ' ' + item.number_label + '** — ' + item.title)
    if (item.content) lines.push('  Síntese: ' + item.content)
    if (item.bible_references.length > 0) lines.push('  Bíblia: ' + item.bible_references.join(', '))
  }

  return lines.join('\n')
}
