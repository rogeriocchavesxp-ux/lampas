import { createClient } from '@/lib/supabase/server'
import type {
  LibrarySearchParams,
  LibrarySearchResult,
  CommentaryForPassage,
  ReferenceSearchResult,
  PassageParams,
  LibWork,
  LibCollection,
  WorkType,
} from '@/types/library'

// ─── Busca full-text ──────────────────────────────────────────────────────────

export async function searchLibrary(params: LibrarySearchParams): Promise<LibrarySearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('lib_search', {
    p_query:         params.query,
    p_work_type:     params.workType     ?? null,
    p_tradition:     params.tradition    ?? null,
    p_bible_book:    params.bibleBook    ?? null,
    p_bible_chapter: params.bibleChapter ?? null,
    p_limit:         params.limit        ?? 20,
  })

  if (error) throw error
  return data ?? []
}

// ─── Comentários por passagem ─────────────────────────────────────────────────

export async function getCommentariesForPassage(
  params: PassageParams
): Promise<CommentaryForPassage[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('lib_get_commentaries', {
    p_bible_book: params.bibleBook,
    p_chapter:    params.chapter,
    p_verse:      params.verse ?? null,
  })

  if (error) throw error
  return data ?? []
}

// ─── Comparar autores sobre uma passagem ──────────────────────────────────────

export async function compareAuthorsOnPassage(params: PassageParams) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('lib_compare_authors', {
    p_bible_book: params.bibleBook,
    p_chapter:    params.chapter,
    p_verse:      params.verse ?? null,
  })

  if (error) throw error
  return data ?? []
}

// ─── Busca em dicionários, enciclopédias e léxicos ───────────────────────────

export async function searchReferenceEntries(
  term: string,
  workTypes?: WorkType[]
): Promise<ReferenceSearchResult[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('lib_search_refs', {
    p_term:       term,
    p_work_types: workTypes ?? ['dictionary', 'encyclopedia', 'lexicon', 'concordance'],
  })

  if (error) throw error
  return data ?? []
}

// ─── Listagem de obras por coleção ────────────────────────────────────────────

export async function getWorksByCollection(collectionSlug: string): Promise<LibWork[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lib_works')
    .select(`
      *,
      author:lib_authors(*),
      collection:lib_collections(*)
    `)
    .eq('collection.slug', collectionSlug)
    .order('year_published', { ascending: true })

  if (error) throw error
  return (data ?? []) as LibWork[]
}

// ─── Listagem de coleções ─────────────────────────────────────────────────────

export async function getCollections(): Promise<LibCollection[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lib_collections')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ─── Todas as obras com contagens ─────────────────────────────────────────────

export async function getAllWorks(): Promise<LibWork[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lib_works')
    .select(`
      *,
      author:lib_authors(id, name, tradition),
      collection:lib_collections(id, slug, name)
    `)
    .order('year_published', { ascending: true })

  if (error) throw error
  return (data ?? []) as LibWork[]
}

// ─── Obra com volumes ─────────────────────────────────────────────────────────

export async function getWorkWithVolumes(workId: string) {
  const supabase = await createClient()

  const { data: work, error: workErr } = await supabase
    .from('lib_works')
    .select(`
      *,
      author:lib_authors(*),
      collection:lib_collections(*)
    `)
    .eq('id', workId)
    .single()

  if (workErr) throw workErr

  const { data: volumes, error: volErr } = await supabase
    .from('lib_volumes')
    .select('*, files:lib_files(*)')
    .eq('work_id', workId)
    .order('volume_number', { ascending: true })

  if (volErr) throw volErr

  return { work, volumes: volumes ?? [] }
}

// ─── Entradas de um volume por passagem ──────────────────────────────────────

export async function getVolumeEntriesForPassage(
  volumeId: string,
  bibleBook: string,
  chapter: number,
  verse?: number
) {
  const supabase = await createClient()

  let query = supabase
    .from('lib_entries')
    .select('*')
    .eq('volume_id', volumeId)
    .eq('bible_book', bibleBook)
    .eq('bible_chapter', chapter)

  if (verse !== undefined) {
    query = query
      .lte('bible_verse_start', verse)
      .or(`bible_verse_end.is.null,bible_verse_end.gte.${verse}`)
  }

  const { data, error } = await query.order('sequence', { ascending: true })
  if (error) throw error
  return data ?? []
}

// ─── Contexto para IA: comentários de uma passagem ───────────────────────────
// Retorna um bloco de texto formatado para envio ao Claude como contexto.

export async function buildLibraryContextForPassage(
  bibleBook: string,
  chapter: number,
  verse?: number,
  maxEntries = 5
): Promise<string> {
  const commentaries = await getCommentariesForPassage({ bibleBook, chapter, verse })
  const top = commentaries.slice(0, maxEntries)

  if (top.length === 0) return ''

  const ref = verse ? `${bibleBook} ${chapter}:${verse}` : `${bibleBook} ${chapter}`

  const blocks = top.map(c => {
    const author = c.author_name ?? 'Anônimo'
    const year   = c.year_published ? ` (${c.year_published})` : ''
    const source = `${author}${year} — ${c.work_title}`
    return `## ${source}\n\n${c.content.slice(0, 1500)}`
  })

  return `# Comentários da Biblioteca Lampas sobre ${ref}\n\n${blocks.join('\n\n---\n\n')}`
}
