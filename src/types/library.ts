// Tipos da Biblioteca Teológica de Domínio Público

export type WorkType =
  | 'commentary'
  | 'dictionary'
  | 'encyclopedia'
  | 'lexicon'
  | 'concordance'
  | 'theology'
  | 'hermeneutics'
  | 'preaching'
  | 'biography'

export type Testament = 'OT' | 'NT' | 'both'

export type PublicDomainStatus = 'confirmed' | 'uncertain' | 'not_public_domain'

export type FileType = 'pdf_original' | 'pdf_processed' | 'text_extracted' | 'html'

export type ImportStatus = 'pending' | 'downloading' | 'processing' | 'done' | 'error'

export type EntryType = 'commentary' | 'definition' | 'article' | 'concordance_entry' | 'lexicon_entry' | 'note'

// ─────────────────────────────────────────────────────────────────────────────

export interface LibAuthor {
  id: string
  name: string
  birth_year: number | null
  death_year: number | null
  tradition: string | null
  nationality: string | null
  notes: string | null
  created_at: string
}

export interface LibCollection {
  id: string
  slug: string
  name: string
  description: string | null
  display_order: number
}

export interface LibWork {
  id: string
  title: string
  subtitle: string | null
  author_id: string | null
  year_published: number | null
  language: string
  collection_id: string | null
  work_type: WorkType
  testament: Testament | null
  tradition: string | null
  period: string | null
  keywords: string[]
  public_domain: boolean
  public_domain_status: PublicDomainStatus
  public_domain_source: string | null
  source_url: string | null
  license: string | null
  notes: string | null
  total_volumes: number
  created_at: string
  // joins opcionais
  author?: LibAuthor
  collection?: LibCollection
}

export interface LibVolume {
  id: string
  work_id: string
  volume_number: number
  title: string | null
  bible_book_start: string | null
  bible_book_end: string | null
  chapter_start: number | null
  chapter_end: number | null
  total_pages: number | null
  source_url: string | null
  created_at: string
  // join opcional
  work?: LibWork
}

export interface LibFile {
  id: string
  volume_id: string
  file_type: FileType
  storage_path: string | null
  original_url: string | null
  file_size_bytes: number | null
  file_hash: string | null
  page_count: number | null
  ocr_done: boolean
  ocr_quality: number | null
  text_extracted: boolean
  import_status: ImportStatus
  error_message: string | null
  imported_at: string | null
  created_at: string
}

export interface LibEntry {
  id: string
  volume_id: string
  entry_type: EntryType
  heading: string | null
  content: string
  page_start: number | null
  page_end: number | null
  sequence: number | null
  bible_book: string | null
  bible_chapter: number | null
  bible_verse_start: number | null
  bible_verse_end: number | null
  bible_ref: string | null
  created_at: string
  // joins opcionais
  volume?: LibVolume
}

export interface LibBibleRef {
  id: string
  entry_id: string
  bible_book: string
  chapter: number | null
  verse: number | null
  context_excerpt: string | null
}

// ─── Resultados das RPCs ──────────────────────────────────────────────────────

export interface LibrarySearchResult {
  entry_id: string
  work_id: string
  work_title: string
  author_name: string | null
  volume_number: number
  heading: string | null
  content_excerpt: string
  bible_ref: string | null
  work_type: WorkType
  tradition: string | null
  year_published: number | null
  rank: number
}

export interface CommentaryForPassage {
  entry_id: string
  work_id: string
  work_title: string
  author_name: string | null
  tradition: string | null
  year_published: number | null
  heading: string | null
  content: string
  bible_ref: string | null
  page_start: number | null
}

export interface ReferenceSearchResult {
  entry_id: string
  work_id: string
  work_title: string
  author_name: string | null
  heading: string | null
  content_excerpt: string
  work_type: WorkType
  year_published: number | null
}

// ─── Filtros de busca ─────────────────────────────────────────────────────────

export interface LibrarySearchParams {
  query: string
  workType?: WorkType
  tradition?: string
  bibleBook?: string
  bibleChapter?: number
  limit?: number
}

export interface PassageParams {
  bibleBook: string
  chapter: number
  verse?: number
}
