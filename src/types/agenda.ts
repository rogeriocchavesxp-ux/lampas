export type AgendaEventType =
  | 'pregacao'
  | 'estudo_biblico'
  | 'ebd'
  | 'palestra'
  | 'conferencia'
  | 'congresso'
  | 'casamento'
  | 'batismo'
  | 'santa_ceia'
  | 'atendimento_pastoral'
  | 'reuniao'
  | 'curso'
  | 'live'
  | 'gravacao'
  | 'outro'

export type AgendaEventStatus = 'confirmado' | 'tentativo' | 'cancelado'
export type AgendaSermonStatus = 'planejada' | 'em_preparacao' | 'pronta' | 'pregada'
export type AgendaPastoralCategory =
  | 'aconselhamento'
  | 'casamento'
  | 'discipulado'
  | 'visita'
  | 'hospital'
  | 'outro'

export interface AgendaEvent {
  id: string
  user_id: string
  project_id: string | null
  title: string
  event_type: AgendaEventType
  description: string | null
  starts_at: string
  ends_at: string
  all_day: boolean
  location: string | null
  organization: string | null
  status: AgendaEventStatus
  google_event_id: string | null
  google_calendar_id: string | null
  synced_at: string | null
  color: string | null
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AgendaSermon {
  id: string
  user_id: string
  event_id: string | null
  project_id: string | null
  title: string
  passage_ref: string | null
  theme: string | null
  series_name: string | null
  series_order: number | null
  church: string | null
  preacher: string | null
  scheduled_at: string | null
  status: AgendaSermonStatus
  notes: string | null
  recording_url: string | null
  created_at: string
  updated_at: string
}

export interface AgendaPastoralCare {
  id: string
  user_id: string
  event_id: string | null
  person_name: string
  person_contact: string | null
  category: AgendaPastoralCategory
  scheduled_at: string
  duration_min: number
  private_notes: string | null
  follow_up_at: string | null
  follow_up_notes: string | null
  is_confidential: boolean
  created_at: string
  updated_at: string
}

export interface AgendaGoogleTokenStatus {
  connected: boolean
  google_email: string | null
  last_synced_at: string | null
  sync_enabled: boolean
  sync_direction: 'import_only' | 'export_only' | 'bidirectional'
}

export type CreateAgendaEvent = Omit<
  AgendaEvent,
  'id' | 'user_id' | 'google_event_id' | 'google_calendar_id' | 'synced_at' | 'created_at' | 'updated_at'
>

export type UpdateAgendaEvent = Partial<CreateAgendaEvent>

export interface UpcomingEvent {
  id: string
  title: string
  event_type: AgendaEventType
  starts_at: string
  ends_at: string
  location: string | null
  project_id: string | null
  color: string | null
}

export interface MinistryStats {
  sermons_preached: number
  events_total: number
  pastoral_care_total: number
  lectures_total: number
  year: number
}

export const EVENT_TYPE_COLORS: Record<AgendaEventType, string> = {
  pregacao:             '#3B82F6',
  estudo_biblico:       '#EAB308',
  ebd:                  '#EAB308',
  palestra:             '#A855F7',
  conferencia:          '#A855F7',
  congresso:            '#A855F7',
  casamento:            '#EC4899',
  batismo:              '#06B6D4',
  santa_ceia:           '#F97316',
  atendimento_pastoral: '#22C55E',
  reuniao:              '#EF4444',
  curso:                '#EAB308',
  live:                 '#8B5CF6',
  gravacao:             '#6B7280',
  outro:                '#9CA3AF',
}

export const EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  pregacao:             'Pregação',
  estudo_biblico:       'Estudo Bíblico',
  ebd:                  'EBD',
  palestra:             'Palestra',
  conferencia:          'Conferência',
  congresso:            'Congresso',
  casamento:            'Casamento',
  batismo:              'Batismo',
  santa_ceia:           'Santa Ceia',
  atendimento_pastoral: 'Atendimento Pastoral',
  reuniao:              'Reunião',
  curso:                'Curso',
  live:                 'Live',
  gravacao:             'Gravação',
  outro:                'Outro',
}

export const EVENT_STATUS_LABELS: Record<AgendaEventStatus, string> = {
  confirmado: 'Confirmado',
  tentativo:  'Tentativo',
  cancelado:  'Cancelado',
}

export const ALL_EVENT_TYPES: AgendaEventType[] = [
  'pregacao', 'estudo_biblico', 'ebd', 'palestra', 'conferencia',
  'congresso', 'casamento', 'batismo', 'santa_ceia', 'atendimento_pastoral',
  'reuniao', 'curso', 'live', 'gravacao', 'outro',
]
