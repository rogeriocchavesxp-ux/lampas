import { createClient } from '@/lib/supabase/server'

export type Estudo = {
  id: string
  slug: string
  category: string
  subcategory: string | null
  ordem: number
  title: string
  subtitle: string | null
  content: string | null
  referencia: string | null
  tags: string[]
  reading_time: number | null
  is_published: boolean
  created_at: string
}

export async function getEstudos(category = 'panorama-biblico'): Promise<Estudo[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lampas_studies')
    .select('id, slug, category, subcategory, ordem, title, subtitle, referencia, tags, reading_time, is_published, created_at')
    .eq('category', category)
    .eq('is_published', true)
    .order('ordem', { ascending: true })
  return (data ?? []) as Estudo[]
}

export async function getAllEstudos(): Promise<Estudo[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lampas_studies')
    .select('id, slug, category, subcategory, ordem, title, subtitle, referencia, tags, reading_time, is_published, created_at')
    .eq('is_published', true)
    .order('category', { ascending: true })
    .order('ordem', { ascending: true })
  return (data ?? []) as Estudo[]
}

export async function getEstudo(slug: string): Promise<Estudo | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('lampas_studies')
    .select('id, slug, category, subcategory, ordem, title, subtitle, content, referencia, tags, reading_time, is_published, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data as Estudo | null
}

export async function getEstudoNav(
  slug: string,
  category = 'panorama-biblico',
): Promise<{ prev: Estudo | null; next: Estudo | null }> {
  const all = await getEstudos(category)
  const idx = all.findIndex(e => e.slug === slug)
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  }
}
