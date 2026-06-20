import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsuariosClient, { type AdminUserRow } from './UsuariosClient'

export default async function AdminUsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/usuarios')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('v_admin_users_overview')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<AdminUserRow[]>()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>← Admin</Link>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.2rem', fontSize: '1.4rem' }}>Gestão de Usuários</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Cadastros, planos, engajamento, saúde da plataforma e uso de IA.</p>
        </div>

        <UsuariosClient initialUsers={users ?? []} />
      </div>
    </main>
  )
}
