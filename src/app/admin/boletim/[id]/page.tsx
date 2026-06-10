import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BoletimForm from '../BoletimForm'
import ChannelPublisher from '../ChannelPublisher'
import { listChannels, listPublications } from '../../hub/actions'

export default async function EditarEntradaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=/admin/boletim/${id}`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_hub_editor')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: entry } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, content, tags, published')
    .eq('id', id)
    .maybeSingle()

  if (!entry) notFound()

  const isHubEditor = profile?.is_hub_editor === true
  const [channels, publications] = isHubEditor
    ? await Promise.all([listChannels(), listPublications('boletim', id)])
    : [[], []]

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    borderRadius: 12,
    background: 'var(--surface)',
    padding: '2rem',
  }

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

        <div style={cardStyle}>
          <BoletimForm entry={entry} />
        </div>

        {isHubEditor && (
          <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <ChannelPublisher
              contentType="boletim"
              contentId={id}
              channels={channels}
              publications={publications}
            />
          </div>
        )}

      </div>
    </main>
  )
}
