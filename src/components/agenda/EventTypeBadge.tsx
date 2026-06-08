import type { AgendaEventType } from '@/types/agenda'
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/types/agenda'

interface Props {
  type: AgendaEventType
  size?: 'sm' | 'md'
}

export default function EventTypeBadge({ type, size = 'sm' }: Props) {
  const color = EVENT_TYPE_COLORS[type]
  const label = EVENT_TYPE_LABELS[type]
  const fontSize = size === 'md' ? '0.75rem' : '0.65rem'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      fontSize,
      fontWeight: 700,
      color,
      background: `${color}14`,
      border: `1px solid ${color}30`,
      borderRadius: '999px',
      padding: size === 'md' ? '0.18rem 0.6rem' : '0.12rem 0.45rem',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: size === 'md' ? 6 : 5,
        height: size === 'md' ? 6 : 5,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }} />
      {label}
    </span>
  )
}
