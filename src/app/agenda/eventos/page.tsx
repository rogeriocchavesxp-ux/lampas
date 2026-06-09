'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AgendaEvent } from '@/types/agenda'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, ALL_EVENT_TYPES } from '@/types/agenda'
import EventModal from '@/components/agenda/EventModal'
import EventTypeBadge from '@/components/agenda/EventTypeBadge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "d 'de' MMM yyyy, HH:mm", { locale: ptBR })
  } catch {
    return iso
  }
}

export default function EventosPage() {
  const [events, setEvents]     = useState<AgendaEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [modalId, setModalId]   = useState<string | null | undefined>(undefined)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (typeFilter) params.set('type', typeFilter)
    const res = await fetch(`/api/agenda/events?${params}`)
    const { data } = await res.json()
    setEvents(data ?? [])
    setLoading(false)
  }, [typeFilter])

  useEffect(() => { load() }, [load])

  const handleSaved = (saved: AgendaEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === saved.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n }
      return [saved, ...prev]
    })
    setModalId(undefined)
  }

  const handleDeleted = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setModalId(undefined)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.2rem' }}>Eventos</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            {loading ? '…' : `${events.length} evento${events.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.7rem', background: 'var(--surface-2)',
              border: '1px solid var(--border)', borderRadius: '7px',
              color: 'var(--text-secondary)', fontFamily: 'inherit',
              fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            <option value="">Todos os tipos</option>
            {ALL_EVENT_TYPES.map(t => (
              <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <button
            onClick={() => setModalId(null)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '0.5rem 1rem',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.84rem', fontWeight: 600,
            }}
          >
            + Novo Evento
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '60px', background: 'var(--surface-2)', borderRadius: '8px', opacity: 0.6 }} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={{
          padding: '3rem', textAlign: 'center',
          background: 'var(--surface-2)', borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}>
          <p style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {typeFilter ? 'Nenhum evento deste tipo.' : 'Nenhum evento cadastrado ainda.'}
          </p>
          <button
            onClick={() => setModalId(null)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '0.5rem 1.25rem',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 600,
            }}
          >
            Criar primeiro evento
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {events.map(event => {
            const color = event.color ?? EVENT_TYPE_COLORS[event.event_type] ?? '#3B82F6'
            return (
              <div
                key={event.id}
                onClick={() => setModalId(event.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.85rem 1.1rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `3px solid ${color}`,
                  borderRadius: '8px', cursor: 'pointer',
                  transition: 'box-shadow 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(15,23,42,0.07)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {formatDate(event.starts_at)}
                    {event.location && ` · ${event.location}`}
                  </div>
                </div>
                <EventTypeBadge type={event.event_type} />
                {event.status === 'cancelado' && (
                  <span style={{ fontSize: '0.65rem', color: '#EF4444', fontWeight: 700 }}>Cancelado</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalId !== undefined && (
        <EventModal
          eventId={modalId}
          onClose={() => setModalId(undefined)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}
