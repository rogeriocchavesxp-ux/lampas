'use client'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.75rem' }}>
        Algo deu errado.
      </h2>
      <button
        onClick={() => unstable_retry()}
        style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
