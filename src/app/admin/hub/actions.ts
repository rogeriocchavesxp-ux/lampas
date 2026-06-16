'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// ─── Auth ────────────────────────────────────────────────────────────────────

async function assertHubEditor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_hub_editor')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_hub_editor) redirect('/dashboard')
  return user
}

// ─── Reads (chamados de Server Components) ────────────────────────────────────

export async function getHubEditorStatus(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_hub_editor')
    .eq('id', user.id)
    .maybeSingle()

  return profile?.is_hub_editor === true
}

export async function listChannels() {
  const isHub = await getHubEditorStatus()
  if (!isHub) return []

  const db = createServiceClient()
  const { data } = await db
    .from('editorial_channels')
    .select('id, slug, name, domain, accent_color, is_active')
    .eq('is_active', true)
    .order('name')

  return data ?? []
}

export async function listPublications(contentType: string, contentId: string) {
  const isHub = await getHubEditorStatus()
  if (!isHub) return []

  const db = createServiceClient()
  const { data } = await db
    .from('editorial_publications')
    .select('id, channel_id, status, published_at')
    .eq('content_type', contentType)
    .eq('content_id', contentId)

  return data ?? []
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Upserta publicações para todos os canais.
 * publishedIds → status='published'
 * restante dos allChannelIds → status='unpublished' (preserva histórico)
 */
export async function saveChannelPublications(
  contentType: string,
  contentId: string,
  publishedIds: string[],
  allChannelIds: string[],
) {
  const user = await assertHubEditor()
  const db = createServiceClient()
  const now = new Date().toISOString()

  for (const channelId of allChannelIds) {
    const isPublished = publishedIds.includes(channelId)
    const { error } = await db
      .from('editorial_publications')
      .upsert(
        {
          channel_id:   channelId,
          content_type: contentType,
          content_id:   contentId,
          status:       isPublished ? 'published' : 'unpublished',
          published_at: isPublished ? now : null,
          created_by:   user.id,
        },
        { onConflict: 'channel_id,content_type,content_id' },
      )

    if (error) throw new Error(error.message)
  }

  await db.rpc('log_activity', {
    p_event_type:  'content_published',
    p_entity_type: contentType,
    p_entity_id:   contentId,
    p_metadata:    { published_channel_ids: publishedIds },
    p_user_id:     user.id,
  }).then(() => {})

  revalidatePath('/admin/boletim')
}

export async function createChannel(formData: FormData) {
  await assertHubEditor()
  const db = createServiceClient()

  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-')
  const { error } = await db.from('editorial_channels').insert({
    slug,
    name:         String(formData.get('name') ?? '').trim(),
    domain:       String(formData.get('domain') ?? '').trim() || null,
    description:  String(formData.get('description') ?? '').trim() || null,
    accent_color: String(formData.get('accent_color') ?? '').trim() || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/hub')
}
