'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { LampasLogo } from '@/components/LampasLogo'

export const NAV_HEIGHT = 52

const HIDE_ON_PATHS = ['/auth/login', '/auth/callback', '/auth/reset', '/']

type DropLink    = { label: string; href: string; badge?: string }
type DropSep     = { sep: true; label: string }
type DropItem    = DropLink | DropSep
type NavItem     = { id: string; label: string; href?: string; highlight?: boolean; items?: DropItem[] }

function isLink(item: DropItem): item is DropLink { return !('sep' in item) }

const NAV: NavItem[] = [
  { id: 'painel', label: 'Painel', href: '/dashboard' },
  { id: 'insights', label: 'Insights', href: '/insights' },
  {
    id: 'agenda', label: 'Agenda', highlight: true,
    items: [
      { label: 'Calendário',             href: '/agenda/calendario' },
      { label: 'Todos os Eventos',       href: '/agenda/eventos' },
      { label: 'Pregações',              href: '/agenda/pregacoes' },
      { label: 'Atendimentos Pastorais', href: '/agenda/atendimentos' },
      { label: 'Linha do Tempo',         href: '/agenda/linha-do-tempo' },
    ],
  },
  {
    id: 'base', label: 'Base de Conhecimento',
    items: [
      { sep: true, label: 'Repositório' },
      { label: 'Biblioteca',           href: '/knowledge' },
      { label: 'Sistemática',          href: '/knowledge' },
      { label: 'Bíblica',              href: '/knowledge' },
      { sep: true, label: 'Referência' },
      { label: 'Catecismos',           href: '/knowledge' },
      { label: 'Dicionário Lampas',    href: '/knowledge' },
      { label: 'Referências Cruzadas', href: '/knowledge' },
      { sep: true, label: 'Anotações' },
      { label: 'Colagens',             href: '/knowledge' },
    ],
  },
  {
    id: 'projetos', label: 'Meus Projetos',
    items: [
      { label: 'Todos os Projetos',     href: '/dashboard' },
      { label: 'Sermões',               href: '/dashboard' },
      { label: 'Estudos Exegéticos',    href: '/dashboard' },
      { label: 'Artigos & Conteúdo',    href: '/dashboard' },
    ],
  },
  {
    id: 'ferramentas', label: 'Ferramentas',
    items: [
      { label: 'Texto Original',        href: '/knowledge' },
      { label: 'Dicionário Lampas',    href: '/knowledge' },
      { label: 'Biblioteca',           href: '/knowledge' },
      { label: 'Referências Cruzadas', href: '/knowledge' },
      { label: 'Colagens',             href: '/knowledge' },
      { sep: true, label: 'Introdução Bíblica' },
      { label: 'Introdução ao AT',     href: '/knowledge' },
      { label: 'Introdução ao NT',     href: '/knowledge' },
      { sep: true, label: 'Teologia' },
      { label: 'Sistemática',          href: '/knowledge' },
      { label: 'Bíblica',              href: '/knowledge' },
      { label: 'Catecismos',           href: '/knowledge' },
    ],
  },
  {
    id: 'publicacoes', label: 'Publicações',
    items: [
      { label: 'Meus Conteúdos',      href: '#', badge: 'Em breve' },
      { label: 'Sermões Publicados',  href: '#', badge: 'Em breve' },
      { sep: true, label: 'Exportar' },
      { label: 'Slides',              href: '#', badge: 'Em breve' },
      { label: 'Exportar PDF',        href: '#', badge: 'Em breve' },
    ],
  },
]

const ACTIVE_BASE: Record<string, string> = {
  painel: '/dashboard', agenda: '/agenda', base: '/knowledge',
  projetos: '/dashboard', ferramentas: '/knowledge', publicacoes: '/publicacoes',
}

export default function TopNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const navRef    = useRef<HTMLElement>(null)

  const [user, setUser]       = useState<{ email?: string | null; id: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loaded, setLoaded]   = useState(false)
  const [openDrop, setOpenDrop] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal]   = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Auth
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { email: user.email, id: user.id } : null)
      setLoaded(true)
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { email: session.user.email, id: session.user.id } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDrop(null)
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpenDrop(null); setShowSearch(false); setMobileOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Close on route change
  useEffect(() => { setOpenDrop(null); setMobileOpen(false) }, [pathname])

  // Body padding
  const hidden = !user || !loaded || HIDE_ON_PATHS.includes(pathname ?? '') || pathname?.startsWith('/auth/') || pathname?.startsWith('/workspace')
  useEffect(() => {
    if (!hidden) {
      document.body.style.paddingTop = `${NAV_HEIGHT}px`
      return () => { document.body.style.paddingTop = '' }
    }
  }, [hidden])

  // Focus search input
  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  const toggle = useCallback((id: string) => setOpenDrop(p => p === id ? null : id), [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  function isActive(item: NavItem): boolean {
    const base = ACTIVE_BASE[item.id]
    if (!base) return false
    if (item.id === 'painel' || item.id === 'projetos') return pathname === '/dashboard'
    return pathname?.startsWith(base) ?? false
  }

  if (hidden) return null

  const initial = (user?.email?.[0] ?? '?').toUpperCase()

  return (
    <>
      {/* ── Spacer ── keeps page from jumping (body paddingTop handles content) */}
      <nav
        ref={navRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: `${NAV_HEIGHT}px`,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center',
          padding: '0 1.25rem',
          gap: '0',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
        }}
      >
        {/* ── Left: Logo + Nav Items ── */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0', minWidth: 0 }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: '1rem' }}>
            <LampasLogo height={26} />
          </Link>

          {/* Divider */}
          <span style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0, marginRight: '1rem' }} />

          {/* Desktop nav items */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '0.1rem', flex: 1, minWidth: 0 }}>
            {NAV.map(item => (
              <NavButton
                key={item.id}
                item={item}
                active={isActive(item)}
                open={openDrop === item.id}
                onToggle={() => toggle(item.id)}
                onNavigate={href => { setOpenDrop(null); if (href !== '#') router.push(href) }}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Search + CTA + User ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

          {/* Search */}
          {showSearch ? (
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0 0.6rem', gap: '0.4rem' }}>
              <SearchIcon />
              <input
                ref={searchRef}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Buscar projetos, eventos…"
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'inherit', width: '200px', padding: '0.35rem 0' }}
              />
              <button onClick={() => { setShowSearch(false); setSearchVal('') }} style={iconBtnStyle}>×</button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              title="Pesquisar"
              style={{ ...iconBtnStyle, display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <SearchIcon /> <span className="hidden md:inline">Pesquisar</span>
            </button>
          )}

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => toggle('user')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'none', border: '1px solid var(--border)',
                borderRadius: '7px', padding: '0.28rem 0.55rem',
                cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                transition: 'border-color 0.13s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => openDrop !== 'user' && (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
              }}>{initial}</span>
              <span className="hidden md:inline" style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </span>
              <ChevronIcon open={openDrop === 'user'} />
            </button>

            {openDrop === 'user' && (
              <Dropdown style={{ right: 0, minWidth: '180px' }}>
                <div style={{ padding: '0.5rem 0.85rem 0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {user?.email}
                </div>
                <DropDivider />
                <DropItem label="Planos" onClick={() => { setOpenDrop(null); router.push('/billing') }} />
                {isAdmin && <DropItem label="Admin" onClick={() => { setOpenDrop(null); router.push('/admin') }} />}
                <DropDivider />
                <DropItem label="Sair" onClick={signOut} danger />
              </Dropdown>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex lg:hidden"
            onClick={() => setMobileOpen(p => !p)}
            style={{ ...iconBtnStyle, padding: '0.35rem', fontSize: '1.1rem', lineHeight: 1 }}
          >
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', top: `${NAV_HEIGHT}px`, left: 0, right: 0,
            background: 'var(--surface)', borderBottom: '1px solid var(--border)',
            zIndex: 49, maxHeight: 'calc(100vh - 52px)', overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          }}
        >
          <div style={{ padding: '0.75rem 0' }}>
            {NAV.map(item => (
              <MobileNavItem key={item.id} item={item} onNavigate={href => { setMobileOpen(false); if (href !== '#') router.push(href) }} />
            ))}
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />
            <MobileLink label="Planos" onClick={() => { setMobileOpen(false); router.push('/billing') }} />
            {isAdmin && <MobileLink label="Admin" onClick={() => { setMobileOpen(false); router.push('/admin') }} />}
            <MobileLink label="Sair" onClick={signOut} danger />
          </div>
        </div>
      )}
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────

function NavButton({ item, active, open, onToggle, onNavigate }: {
  item: NavItem; active: boolean; open: boolean
  onToggle: () => void; onNavigate: (href: string) => void
}) {
  const hasItems = !!item.items?.length
  const color = active
    ? 'var(--accent)'
    : item.highlight
    ? 'var(--accent)'
    : 'var(--text-secondary)'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => hasItems ? onToggle() : item.href && onNavigate(item.href)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          background: active ? 'var(--accent-subtle)' : 'none',
          border: 'none', borderRadius: '6px',
          padding: '0.32rem 0.6rem',
          fontSize: '0.8rem', fontWeight: active ? 600 : 500,
          color, cursor: 'pointer', fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          transition: 'background 0.13s, color 0.13s',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = color } }}
      >
        {item.label}
        {hasItems && <ChevronIcon open={open} />}
      </button>

      {open && item.items && (
        <Dropdown style={{ left: 0, minWidth: '210px' }}>
          {item.items.map((sub, i) =>
            !isLink(sub) ? (
              <DropSepHeader key={`sep-${i}`} label={sub.label} first={i === 0} />
            ) : (
              <DropItem
                key={sub.href + sub.label + i}
                label={sub.label}
                badge={sub.badge}
                onClick={() => onNavigate(sub.href)}
              />
            )
          )}
        </Dropdown>
      )}
    </div>
  )
}

function Dropdown({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)',
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(15,23,42,0.1), 0 2px 6px rgba(15,23,42,0.06)',
      padding: '0.3rem',
      zIndex: 60,
      ...style,
    }}>
      {children}
    </div>
  )
}

function DropSepHeader({ label, first }: { label: string; first?: boolean }) {
  return (
    <div style={{
      padding: first ? '0.3rem 0.75rem 0.2rem' : '0.55rem 0.75rem 0.2rem',
      fontSize: '0.63rem', fontWeight: 700,
      color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.07em',
      ...(first ? {} : { borderTop: '1px solid var(--border-subtle)' }),
    }}>
      {label}
    </div>
  )
}

function DropDivider() {
  return <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />
}

function DropItem({ label, badge, onClick, danger }: {
  label: string; badge?: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '0.45rem 0.75rem',
        background: 'none', border: 'none',
        borderRadius: '7px', cursor: 'pointer',
        fontSize: '0.82rem', fontFamily: 'inherit',
        color: danger ? '#EF4444' : 'var(--text-primary)',
        fontWeight: 450, textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--surface-2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {label}
      {badge && (
        <span style={{
          fontSize: '0.62rem', padding: '0.1rem 0.35rem',
          background: 'var(--surface-3)', color: 'var(--text-muted)',
          borderRadius: '4px', fontWeight: 600, flexShrink: 0,
        }}>{badge}</span>
      )}
    </button>
  )
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: (href: string) => void }) {
  const [open, setOpen] = useState(false)
  const hasItems = !!item.items?.length

  return (
    <div>
      <button
        onClick={() => hasItems ? setOpen(p => !p) : item.href && onNavigate(item.href)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0.6rem 1.25rem',
          background: 'none', border: 'none',
          fontSize: '0.88rem', fontWeight: 500,
          color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {item.label}
        {hasItems && <ChevronIcon open={open} />}
      </button>
      {open && item.items && (
        <div style={{ paddingLeft: '1.5rem', paddingBottom: '0.25rem' }}>
          {item.items.map((sub, i) =>
            !isLink(sub) ? (
              <div key={`sep-${i}`} style={{ padding: '0.35rem 1rem 0.1rem', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {sub.label}
              </div>
            ) : (
              <button
                key={sub.href + sub.label + i}
                onClick={() => onNavigate(sub.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.5rem 1rem',
                  background: 'none', border: 'none',
                  fontSize: '0.84rem', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                {sub.label}
                {sub.badge && (
                  <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', background: 'var(--surface-3)', color: 'var(--text-muted)', borderRadius: '3px' }}>
                    {sub.badge}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

function MobileLink({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', padding: '0.6rem 1.25rem',
        background: 'none', border: 'none', textAlign: 'left',
        fontSize: '0.88rem', fontWeight: 500,
        color: danger ? '#EF4444' : 'var(--text-secondary)',
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-secondary)', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center',
}
