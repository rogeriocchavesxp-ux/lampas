import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import LibraryClient from './LibraryClient'

export const metadata = { title: 'Biblioteca Teológica — Lampas' }

export interface LibWork {
  id:             string
  title:          string
  work_type:      string
  year_published: number | null
  author_name:    string | null
  collection_id:  string | null
  collection_slug: string | null
  collection_name: string | null
  tradition:      string | null
  language:       string | null
  total_volumes:  number | null
}

export interface LibCollection {
  id:   string
  slug: string
  name: string
}

export default async function LibraryPage() {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) redirect('/auth/login')

  const supabase = createServiceClient()

  // Works with author + collection
  const { data: rawWorks } = await supabase
    .from('lib_works')
    .select('id, title, work_type, year_published, tradition, language, total_volumes, collection_id, lib_authors(name), lib_collections(id, slug, name)')
    .order('title')

  // Deduplicate by id (some works may appear twice due to multi-author join)
  const seen = new Set<string>()
  const works: LibWork[] = []
  for (const w of (rawWorks ?? [])) {
    if (seen.has(w.id)) continue
    seen.add(w.id)
    const col = Array.isArray(w.lib_collections) ? w.lib_collections[0] : w.lib_collections
    const aut = Array.isArray(w.lib_authors) ? w.lib_authors[0] : w.lib_authors
    works.push({
      id:              w.id,
      title:           w.title,
      work_type:       w.work_type,
      year_published:  w.year_published,
      author_name:     aut?.name ?? null,
      collection_id:   w.collection_id,
      collection_slug: col?.slug ?? null,
      collection_name: col?.name ?? null,
      tradition:       w.tradition ?? null,
      language:        w.language ?? null,
      total_volumes:   w.total_volumes ?? null,
    })
  }

  // Collections
  const { data: rawCollections } = await supabase
    .from('lib_collections')
    .select('id, slug, name')
    .order('name')

  const collections: LibCollection[] = (rawCollections ?? []).filter(c => {
    return works.some(w => w.collection_id === c.id)
  })

  return <LibraryClient works={works} collections={collections} />
}
