'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { AgendaEvent } from '@/types/agenda'
import { EVENT_TYPE_COLORS } from '@/types/agenda'
import EventModal from './EventModal'

const FullCalendarComponent = dynamic(
  () => import('./FullCalendarWrapper'),
  { ssr: false, loading: () => <CalendarSkeleton /> }
)

interface Props {
  initialEvents?: AgendaEvent[]
}

export default function CalendarView({ initialEvents = [] }: Props) {
  const [events, setEvents]           = useState<AgendaEvent[]>(initialEvents)
  const [modalEventId, setModalEventId] = useState<string | null | undefined>(undefined)
  const [clickedDate, setClickedDate] = useState<Date | undefined>()

  const handleEventClick = useCallback((id: string) => {
    setModalEventId(id)
  }, [])

  const handleDateClick = useCallback((date: Date) => {
    setClickedDate(date)
    setModalEventId(null)
  }, [])

  const handleSaved = useCallback((saved: AgendaEvent) => {
    setEvents(prev => {
      const existing = prev.findIndex(e => e.id === saved.id)
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = saved
        return next
      }
      return [...prev, saved]
    })
    setModalEventId(undefined)
    setClickedDate(undefined)
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setModalEventId(undefined)
  }, [])

  const fcEvents = events
    .filter(e => e.status !== 'cancelado')
    .map(e => ({
      id:    e.id,
      title: e.title,
      start: e.starts_at,
      end:   e.ends_at,
      allDay: e.all_day,
      backgroundColor: e.color ?? EVENT_TYPE_COLORS[e.event_type] ?? '#3B82F6',
      borderColor: 'transparent',
      extendedProps: { event: e },
    }))

  return (
    <>
      <div style={{ height: '100%', minHeight: '600px' }}>
        <FullCalendarComponent
          events={fcEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      </div>

      {modalEventId !== undefined && (
        <EventModal
          eventId={modalEventId}
          defaultDate={clickedDate}
          onClose={() => { setModalEventId(undefined); setClickedDate(undefined) }}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  )
}

function CalendarSkeleton() {
  return (
    <div style={{
      height: '600px', borderRadius: '12px',
      background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-muted)', fontSize: '0.84rem',
    }}>
      Carregando calendário…
    </div>
  )
}
