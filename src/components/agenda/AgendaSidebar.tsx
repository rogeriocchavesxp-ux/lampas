'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/agenda/calendario', label: 'Calendário', icon: '📅' },
  { href: '/agenda/eventos',    label: 'Eventos',    icon: '📋' },
  { href: '/agenda/pregacoes',  label: 'Pregações',  icon: '📖' },
  { href: '/agenda/atendimentos', label: 'Atendimentos', icon: '🤝' },
  { href: '/agenda/linha-do-tempo', label: 'Linha do Tempo', icon: '📊' },
]

export default function AgendaSidebar() {
  const pathname = usePathname()

  return (
    <nav style={{
      width: '200px',
      flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      padding: '1.5rem 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
    }}>
      <div style={{
        padding: '0 1rem 0.85rem',
        fontSize: '0.6rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>
        Agenda
      </div>
      {NAV_ITEMS.map(item => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.45rem 1rem',
              fontSize: '0.84rem',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              background: active ? 'var(--surface-2)' : 'transparent',
              borderRadius: '6px',
              margin: '0 0.5rem',
              textDecoration: 'none',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
