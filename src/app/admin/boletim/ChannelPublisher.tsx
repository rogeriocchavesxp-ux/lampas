'use client'

import { useState, useTransition } from 'react'
import { saveChannelPublications } from '../hub/actions'

type Channel = {
  id: string
  slug: string
  name: string
  domain: string | null
  accent_color: string | null
  is_active: boolean
}

type Publication = {
  id: string
  channel_id: string
  status: string
  published_at: string | null
}

type Props = {
  contentType: string
  contentId: string
  channels: Channel[]
  publications: Publication[]
}

export default function ChannelPublisher({ contentType, contentId, channels, publications }: Props) {
  const initialPublished = new Set(
    publications.filter(p => p.status === 'published').map(p => p.channel_id)
  )

  const [selected, setSelected] = useState<Set<string>>(initialPublished)
  const [isPending, startTransition] = useTransition()
  const [savedOk, setSavedOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(channelId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(channelId) ? next.delete(channelId) : next.add(channelId)
      return next
    })
    setSavedOk(false)
  }

  function handleSave() {
    setError(null)
    setSavedOk(false)
    startTransition(async () => {
      try {
        await saveChannelPublications(
          contentType,
          contentId,
          Array.from(selected),
          channels.map(c => c.id),
        )
        setSavedOk(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar publicações.')
      }
    })
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.75rem',
  }

  return (
    <div>
      <span style={labelStyle}>Publicar em canais</span>

      {channels.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
          Nenhum canal configurado.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {channels.map(channel => {
          const checked = selected.has(channel.id)
          const accent = channel.accent_color ?? '#c9921a'
          return (
            <label
              key={channel.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 8,
                border: `1px solid ${checked ? accent : 'var(--border)'}`,
                background: checked ? `${accent}14` : 'var(--surface-2)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(channel.id)}
                style={{ width: 15, height: 15, accentColor: accent, flexShrink: 0 }}
              />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {channel.name}
                </span>
                {channel.domain && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {channel.domain}
                  </span>
                )}
              </div>
            </label>
          )
        })}
      </div>

      {error && (
        <p style={{ color: '#b91c1c', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>
      )}
      {savedOk && (
        <p style={{ color: '#15803d', fontSize: '0.82rem', marginBottom: '0.75rem' }}>Publicações salvas.</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || channels.length === 0}
        style={{
          padding: '0.5rem 1.25rem',
          borderRadius: 8,
          background: '#c9921a',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.875rem',
          border: 'none',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Salvando…' : 'Salvar publicações'}
      </button>
    </div>
  )
}
