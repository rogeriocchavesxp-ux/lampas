import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgendaSidebar from '@/components/agenda/AgendaSidebar'

export default async function AgendaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex' }}>
      <AgendaSidebar />
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
