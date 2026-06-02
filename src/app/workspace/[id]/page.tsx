import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound, redirect } from 'next/navigation'
import WorkspaceClient from './WorkspaceClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { id } = await params
  const authClient    = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: project } = await serviceClient
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: sections } = await serviceClient
    .from('sections')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  return (
    <WorkspaceClient
      user={user}
      project={project}
      initialSections={sections || []}
    />
  )
}
