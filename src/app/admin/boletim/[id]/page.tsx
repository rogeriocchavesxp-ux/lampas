import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BoletimForm from '../BoletimForm'

export default async function EditarEntradaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/admin/boletim/${id}`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: entry } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags, published')
    .eq('id', id)
    .maybeSingle()

  if (!entry) notFound()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin/boletim" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Observatório
          </Link>
          <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem', fontSize: '1.4rem' }}>Editar matéria</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            v{entry.version} · {entry.title}
          </p>
        </div>

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          background: 'var(--surface)',
          padding: '2rem',
        }}>
          <BoletimForm entry={entry} />
        </div>

      </div>
    </main>
  )
}
