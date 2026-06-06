import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type BoletimEntry = {
  id: string
  version: string
  release_date: string
  title: string
  tags: string[]
  published: boolean
  created_at: string
}

function dateLabel(value: string) {
  return new Date(value + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function AdminBoletimPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/boletim')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data } = await supabase
    .from('boletim_entries')
    .select('id, version, release_date, title, tags, published, created_at')
    .order('release_date', { ascending: false })
    .returns<BoletimEntry[]>()

  const entries = data ?? []

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
          <div>
            <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none' }}>
              ← Dashboard
            </Link>
            <h1 style={{ marginTop: '0.5rem', marginBottom: '0.25rem', fontSize: '1.5rem' }}>Observatório Lampas</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Mesa de curadoria para acontecimentos relevantes, fontes confiáveis e recursos de aprofundamento.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            <Link href="/boletim" target="_blank" style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '0.5rem 0.9rem',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              textDecoration: 'none',
            }}>
              Ver público ↗
            </Link>
            <Link href="/admin/boletim/novo" style={{
              background: '#c9921a',
              color: '#fff',
              borderRadius: 8,
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}>
              + Nova matéria
            </Link>
          </div>
        </div>

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          background: 'var(--surface)',
          overflow: 'hidden',
        }}>
          {entries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhuma matéria criada ainda.{' '}
              <Link href="/admin/boletim/novo" style={{ color: '#c9921a' }}>Criar primeira</Link>.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Edição', 'Data', 'Manchete', 'Editorias', 'Publicado', 'Ações'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: i < entries.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem' }}>
                      <span style={{
                        fontFamily: 'ui-monospace, monospace',
                        background: '#c9921a18',
                        color: '#a0720f',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        v{entry.version}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {dateLabel(entry.release_date)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)', maxWidth: 280 }}>
                      {entry.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {entry.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: 3,
                            background: 'var(--surface-2)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: entry.published ? '#15803d' : 'var(--text-muted)',
                      }}>
                        {entry.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Link href={`/admin/boletim/${entry.id}`} style={{
                        fontSize: '0.82rem',
                        color: 'var(--accent)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}>
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </main>
  )
}
