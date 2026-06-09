'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'

interface FcEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  backgroundColor: string
  borderColor: string
  extendedProps: Record<string, unknown>
}

interface Props {
  events: FcEvent[]
  onEventClick: (id: string) => void
  onDateClick: (date: Date) => void
}

export default function FullCalendarWrapper({ events, onEventClick, onDateClick }: Props) {
  return (
    <div className="lampas-calendar">
      <style>{calendarCss}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        locale={ptBrLocale}
        initialView="dayGridMonth"
        headerToolbar={{
          left:   'prev,next today',
          center: 'title',
          right:  'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today:    'Hoje',
          month:    'Mês',
          week:     'Semana',
          day:      'Dia',
          list:     'Agenda',
        }}
        events={events}
        editable={false}
        selectable={true}
        dayMaxEvents={3}
        eventClick={(arg: EventClickArg) => onEventClick(arg.event.id)}
        dateClick={(arg: DateClickArg) => onDateClick(arg.date)}
        height="auto"
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
      />
    </div>
  )
}

const calendarCss = `
.lampas-calendar .fc {
  font-family: inherit;
}
.lampas-calendar .fc-toolbar-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}
.lampas-calendar .fc-button {
  background: var(--surface-2) !important;
  border: 1px solid var(--border) !important;
  color: var(--text-secondary) !important;
  font-family: inherit !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
  box-shadow: none !important;
  padding: 0.3rem 0.7rem !important;
  border-radius: 6px !important;
}
.lampas-calendar .fc-button:hover {
  background: var(--surface-3) !important;
  color: var(--text-primary) !important;
}
.lampas-calendar .fc-button-active,
.lampas-calendar .fc-button:focus {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  color: #fff !important;
  outline: none !important;
  box-shadow: none !important;
}
.lampas-calendar .fc-col-header-cell-cushion,
.lampas-calendar .fc-daygrid-day-number {
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
}
.lampas-calendar .fc-day-today {
  background: rgba(201,146,26,0.06) !important;
}
.lampas-calendar .fc-daygrid-day-number.fc-day-today {
  color: var(--accent);
}
.lampas-calendar .fc-event {
  border-radius: 4px;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.05rem 0.3rem;
  cursor: pointer;
  border: none !important;
}
.lampas-calendar .fc-event:hover {
  opacity: 0.85;
}
.lampas-calendar .fc-list-event:hover td {
  background: var(--surface-2);
  cursor: pointer;
}
.lampas-calendar .fc-list-event-title a {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.86rem;
}
.lampas-calendar .fc-list-day-cushion {
  background: var(--surface-2);
}
.lampas-calendar .fc-list-day-text,
.lampas-calendar .fc-list-day-side-text {
  color: var(--text-muted);
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
}
.lampas-calendar .fc-scrollgrid {
  border-color: var(--border-subtle) !important;
}
.lampas-calendar .fc-scrollgrid td,
.lampas-calendar .fc-scrollgrid th {
  border-color: var(--border-subtle) !important;
}
.lampas-calendar .fc-more-link {
  font-size: 0.7rem;
  color: var(--accent);
  font-weight: 600;
}
`
