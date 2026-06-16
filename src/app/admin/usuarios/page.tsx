import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UsuariosClient, { type AdminUserRow } from './UsuariosClient'

function computeSummary(rows: AdminUserRow[]) {
  const now = Date.now()
  const sevenDaysAgo = now - 7 * 86400000
  const thirtyDaysAgo = now - 30 * 86400000
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()

  return {
    total: rows.length,
    active7d: rows.filter(r => r.last_active_at && new Date(r.last_active_at).getTime() >= sevenDaysAgo).length,
    active30d: rows.filter(r => r.last_active_at && new Date(r.last_active_at).getTime() >= thirtyDaysAgo).length,
    newThisMonth: rows.filter(r => new Date(r.created_at).getTime() >= monthStart).length,
    free: rows.filter(r => r.plan === 'free').length,
    paid: rows.filter(r => r.plan !== 'free').length,
    totalProjects: rows.reduce((sum, r) => sum + (r.project_count ?? 0), 0),
    aiCalls30d: rows.reduce((sum, r) => sum + (r.ai_calls_30d ?? 0), 0),
  }
}

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

  const rows = users ?? []
  const summary = computeSummary(rows)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>← Admin</Link>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Usuários</h1>
          <p style={{ color: 'var(--text-muted)' }}>Cadastros, planos, engajamento e uso de IA.</p>
        </div>

        <UsuariosClient initialUsers={rows} summary={summary} />
      </div>
    </main>
  )
}
