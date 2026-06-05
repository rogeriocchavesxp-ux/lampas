'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  if (!raw) return []
  return String(raw)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
}

export async function createBoletimEntry(formData: FormData) {
  await assertAdmin()

  const db = createServiceClient()
  const { error } = await db.from('boletim_entries').insert({
    version:      String(formData.get('version') ?? '').trim(),
    release_date: String(formData.get('release_date') ?? '').trim(),
    title:        String(formData.get('title') ?? '').trim(),
    content:      String(formData.get('content') ?? '').trim(),
    tags:         parseTags(formData.get('tags')),
    published:    formData.get('published') === 'true',
  })

  if (error) throw new Error(error.message)
  redirect('/admin/boletim')
}

export async function updateBoletimEntry(id: string, formData: FormData) {
  await assertAdmin()

  const db = createServiceClient()
  const { error } = await db
    .from('boletim_entries')
    .update({
      version:      String(formData.get('version') ?? '').trim(),
      release_date: String(formData.get('release_date') ?? '').trim(),
      title:        String(formData.get('title') ?? '').trim(),
      content:      String(formData.get('content') ?? '').trim(),
      tags:         parseTags(formData.get('tags')),
      published:    formData.get('published') === 'true',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  redirect('/admin/boletim')
}

export async function deleteBoletimEntry(id: string) {
  await assertAdmin()

  const db = createServiceClient()
  const { error } = await db.from('boletim_entries').delete().eq('id', id)

  if (error) throw new Error(error.message)
  redirect('/admin/boletim')
}
