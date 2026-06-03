import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// DELETE — exclui a conta e todos os dados do usuário (LGPD Art. 18)
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const service = createServiceClient()

  // Excluir dados do usuário (cascata já configurada no schema via ON DELETE CASCADE)
  // A exclusão do auth.users dispara o cascade para profiles, projects, sections, etc.
  const { error } = await service.auth.admin.deleteUser(user.id)

  if (error) {
    return Response.json({ error: 'Erro ao excluir conta' }, { status: 500 })
  }

  return Response.json({ message: 'Conta excluída com sucesso' })
}
