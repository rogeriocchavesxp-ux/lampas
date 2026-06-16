import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.75rem' }}>
        Espaço de trabalho não encontrado.
      </h2>
      <Link href="/dashboard" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
        Voltar ao dashboard
      </Link>
    </div>
  )
}
