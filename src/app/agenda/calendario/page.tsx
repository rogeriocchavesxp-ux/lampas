import { createClient } from '@/lib/supabase/server'
import CalendarView from '@/components/agenda/CalendarView'
import type { AgendaEvent } from '@/types/agenda'

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events } = await supabase
    .from('agenda_events')
    .select('*')
    .eq('user_id', user!.id)
    .order('starts_at', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.2rem' }}>
            Calendário
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Clique em uma data para criar um novo evento.
          </p>
        </div>
      </div>

      <CalendarView initialEvents={(events ?? []) as AgendaEvent[]} />
    </div>
  )
}
