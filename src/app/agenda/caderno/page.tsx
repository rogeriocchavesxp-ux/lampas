import { createClient } from '@/lib/supabase/server'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import type { AgendaEvent } from '@/types/agenda'
import CadernoClient from './CadernoClient'

export const dynamic = 'force-dynamic'

export default async function CadernoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now   = new Date()
  const from  = startOfWeek(now, { weekStartsOn: 0 })
  const to    = endOfWeek(now,   { weekStartsOn: 0 })

  const { data: events } = await supabase
    .from('agenda_events')
    .select('*')
    .eq('user_id', user!.id)
    .gte('starts_at', from.toISOString())
    .lte('starts_at', to.toISOString())
    .order('starts_at', { ascending: true })

  return (
    <CadernoClient
      initialEvents={(events ?? []) as AgendaEvent[]}
      initialWeekStart={format(from, 'yyyy-MM-dd')}
    />
  )
}
