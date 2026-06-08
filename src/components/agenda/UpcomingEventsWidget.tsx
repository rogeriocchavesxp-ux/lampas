'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { UpcomingEvent } from '@/types/agenda'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types/agenda'
import { format, parseISO, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function formatEventDate(iso: string): string {
  try {
    const d = parseISO(iso)
    if (isToday(d))    return `Hoje, ${format(d, 'HH:mm')}`
    if (isTomorrow(d)) return `Amanhã, ${format(d, 'HH:mm')}`
    return format(d, "d 'de' MMM, HH:mm", { locale: ptBR })
  } catch {
    return iso
  }
}

export default function UpcomingEventsWidget() {
  const router  = useRouter()
  const [events, setEvents]   = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agenda/upcoming?limit=5')
      .then(r => r.json())
      .then(({ data }) => { if (data) setEvents(data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ height: '80px', background: 'var(--surface-2)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
  )

  if (events.length === 0) return (
    <div style={{
      padding: '1.25rem',
      background: 'var(--surface-2)',
      borderRadius: '10px',
      border: '1px solid var(--border-subtle)',
      textAlign: 'center',
    }}>
      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Nenhum evento próximo.{' '}
        <button
          onClick={() => router.push('/agenda/calendario')}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600, padding: 0 }}
        >
          Criar evento →
        </button>
      </p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {events.map(event => {
        const color = event.color ?? EVENT_TYPE_COLORS[event.event_type] ?? '#3B82F6'
        return (
          <div
            key={event.id}
            onClick={() => router.push('/agenda/calendario')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.7rem 0.9rem',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderLeft: `3px solid ${color}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'box-shadow 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(15,23,42,0.07)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '7px',
              background: `${color}14`, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem',
            }}>
              {getEventEmoji(event.event_type)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.86rem', fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {event.title}
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                {formatEventDate(event.starts_at)}
                {event.location && ` · ${event.location}`}
              </div>
            </div>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700,
              color, background: `${color}14`,
              border: `1px solid ${color}30`,
              borderRadius: '999px', padding: '0.1rem 0.4rem',
              flexShrink: 0,
            }}>
              {EVENT_TYPE_LABELS[event.event_type]}
            </span>
          </div>
        )
      })}
      <button
        onClick={() => router.push('/agenda/calendario')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontFamily: 'inherit',
          fontSize: '0.78rem', fontWeight: 600,
          textAlign: 'right', padding: '0.25rem 0',
        }}
      >
        Ver agenda completa →
      </button>
    </div>
  )
}

function getEventEmoji(type: string): string {
  const map: Record<string, string> = {
    pregacao: '📖', estudo_biblico: '📚', ebd: '📝',
    palestra: '🎙', conferencia: '🎤', congresso: '🏛',
    casamento: '💍', batismo: '💧', santa_ceia: '🍷',
    atendimento_pastoral: '🤝', reuniao: '👥',
    curso: '🎓', live: '📡', gravacao: '🎬', outro: '📌',
  }
  return map[type] ?? '📌'
}
