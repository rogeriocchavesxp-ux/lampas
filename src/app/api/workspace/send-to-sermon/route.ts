import { createClient } from '@/lib/supabase/server'
import type { Section } from '@/types/database'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json() as {
      targetProjectId: string
      sections: (Omit<Section, 'id' | 'created_at' | 'updated_at'> & {
        id?: string
        created_at?: string
        updated_at?: string
      })[]
      conflictSlugs?: string[]
      conflictStrategy?: 'keep' | 'replace'
    }

    const { targetProjectId, sections, conflictSlugs = [], conflictStrategy = 'keep' } = body

    if (!targetProjectId || !Array.isArray(sections)) {
      return Response.json(
        { error: 'Parâmetros inválidos: targetProjectId e sections são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar que o projeto pertence ao usuário
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', targetProjectId)
      .single()

    if (projError || !project || project.user_id !== user.id) {
      return Response.json(
        { error: 'Projeto não encontrado ou sem permissão' },
        { status: 403 }
      )
    }

    // Se strategy=replace, deletar seções conflitantes primeiro
    if (conflictSlugs.length > 0 && conflictStrategy === 'replace') {
      const { error: delError } = await supabase
        .from('sections')
        .delete()
        .eq('project_id', targetProjectId)
        .in('slug', conflictSlugs)

      if (delError) {
        console.error('[send-to-sermon] Erro ao deletar seções conflitantes:', delError)
        throw delError
      }
    }

    // Inserir novas seções (excluindo as que devem ser skipped)
    const sectionsToInsert = sections
      .filter(s => !conflictSlugs.includes(s.slug) || conflictStrategy === 'replace')
      .map(s => ({
        project_id: targetProjectId,
        user_id: user.id,
        slug: s.slug,
        module: s.module,
        title: s.title,
        status: (s.status ?? 'draft') as 'draft' | 'completed',
        content: s.content ?? null,
        ai_output: s.ai_output ?? null,
      }))

    if (sectionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('sections')
        .insert(sectionsToInsert)

      if (insertError) {
        console.error('[send-to-sermon] Erro ao inserir seções:', insertError)
        throw insertError
      }
    }

    return Response.json(
      {
        success: true,
        message: `${sectionsToInsert.length} seções transferidas com sucesso`,
        count: sectionsToInsert.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[send-to-sermon] Erro:', error)
    const message = error instanceof Error ? error.message : 'Erro ao transferir seções'
    return Response.json(
      { error: message },
      { status: 500 }
    )
  }
}
