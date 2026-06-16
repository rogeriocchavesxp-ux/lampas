import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const SECTIONS = [
  { href: '/admin/usuarios', label: 'Usuários', description: 'Cadastros, planos, engajamento e uso de IA.' },
  { href: '/admin/billing', label: 'Assinaturas', description: 'Gestão financeira e auditoria Mercado Pago.' },
  { href: '/admin/boletim', label: 'Boletim', description: 'Publicação editorial do boletim semanal.' },
]

export default async function AdminHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>← Dashboard</Link>
        <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Admin</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Área administrativa do Lampas.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {SECTIONS.map(section => (
            <Link
              key={section.href}
              href={section.href}
              style={{
                display: 'block',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '1.25rem',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{section.label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{section.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
