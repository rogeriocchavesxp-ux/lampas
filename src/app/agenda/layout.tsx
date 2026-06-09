import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'
import { LampasLogo } from '@/components/LampasLogo'
import Link from 'next/link'

export default async function AgendaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 2rem', height: '56px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/dashboard">
            <LampasLogo height={28} />
          </Link>
          <span style={{
            fontSize: '0.72rem', color: 'var(--text-muted)',
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Agenda Ministerial
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
          <Link href="/dashboard" style={{
            fontSize: '0.8rem', color: 'var(--text-secondary)',
            textDecoration: 'none', fontWeight: 500,
            padding: '0.28rem 0.65rem',
            border: '1px solid var(--border)', borderRadius: '6px',
          }}>
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1 }}>
        <AgendaSidebar />
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
