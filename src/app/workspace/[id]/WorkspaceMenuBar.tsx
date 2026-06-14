'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LampasLogo } from '@/components/LampasLogo'
import { createClient } from '@/lib/supabase/client'

interface MenuAction {
  label: string
  shortcut?: string
  checked?: boolean
  disabled?: boolean
  separator?: boolean
  soon?: boolean
  badge?: string
  onClick?: () => void
}

interface MenuDef {
  id: string
  label: string
  items: MenuAction[]
}

export interface WorkspaceMenuBarProps {
  bibleOpen: boolean
  focusMode: boolean
  sideBySide: boolean
  aiOpen: boolean
  onToggleBible: () => void
  onToggleFocus: () => void
  onToggleSideBySide: () => void
  onToggleAI: () => void
  onEnviarSermao: () => void
  onEnviarDevocional: () => void
  onEnviarKB: () => void
}

export default function WorkspaceMenuBar({
  bibleOpen, focusMode, sideBySide, aiOpen,
  onToggleBible, onToggleFocus, onToggleSideBySide, onToggleAI,
  onEnviarSermao, onEnviarDevocional, onEnviarKB,
}: WorkspaceMenuBarProps) {
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const barRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single()
          .then(({ data }) => setIsAdmin(data?.role === 'admin'))
      }
    })
  }, [])

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus()
  }, [showSearch])

  useEffect(() => {
    if (!openMenu) return
    function onOutside(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [openMenu])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpenMenu(null); setShowSearch(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  async function signOut() {
    setOpenMenu(null)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initial = (userEmail?.[0] ?? '?').toUpperCase()

  const menus: MenuDef[] = [
    {
      id: 'arquivo',
      label: 'Arquivo',
      items: [
        { label: 'Novo Projeto', shortcut: '⌘N', onClick: () => router.push('/dashboard?new=1') },
        { label: 'Meus Projetos', onClick: () => router.push('/dashboard') },
        { label: 'Todos os Projetos', separator: true, onClick: () => router.push('/dashboard') },
        { label: 'Sermões', onClick: () => router.push('/dashboard') },
        { label: 'Estudos Exegéticos', onClick: () => router.push('/dashboard') },
        { label: 'Início', separator: true, onClick: () => router.push('/') },
        { label: 'Salvar', shortcut: '⌘S', separator: true, disabled: true },
        { label: 'Exportar PDF', soon: true },
        { label: 'Imprimir', shortcut: '⌘P', onClick: () => window.print() },
      ],
    },
    {
      id: 'editar',
      label: 'Editar',
      items: [
        { label: 'Desfazer', shortcut: '⌘Z', onClick: () => document.execCommand('undo') },
        { label: 'Refazer', shortcut: '⌘⇧Z', onClick: () => document.execCommand('redo') },
        { label: 'Cortar', shortcut: '⌘X', separator: true, onClick: () => document.execCommand('cut') },
        { label: 'Copiar', shortcut: '⌘C', onClick: () => document.execCommand('copy') },
        { label: 'Colar', shortcut: '⌘V', onClick: () => document.execCommand('paste') },
        { label: 'Selecionar Tudo', shortcut: '⌘A', separator: true, onClick: () => document.execCommand('selectAll') },
      ],
    },
    {
      id: 'exibir',
      label: 'Exibir',
      items: [
        { label: 'Texto Bíblico', shortcut: '⌘B', checked: bibleOpen, onClick: onToggleBible },
        { label: 'Modo Lado a Lado', checked: sideBySide, onClick: onToggleSideBySide },
        { label: 'Modo Foco', shortcut: '⌘.', checked: focusMode, onClick: onToggleFocus },
        { label: 'Tema Escuro / Claro', separator: true, soon: true },
        { label: 'Tamanho da Fonte', soon: true },
      ],
    },
    {
      id: 'inserir',
      label: 'Inserir',
      items: [
        { label: 'Novo Bloco', soon: true },
        { label: 'Nova Seção', soon: true },
        { label: 'Imagem', separator: true, soon: true },
        { label: 'Link', soon: true },
        { label: 'Citação', soon: true },
        { label: 'Referência Bíblica', soon: true },
        { label: 'Tabela', soon: true },
      ],
    },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      items: [
        { label: 'Pilgrim', onClick: () => window.dispatchEvent(new CustomEvent('lampas:open-pilgrim')) },
        { label: 'Dicionário Bíblico', separator: true, soon: true },
        { label: 'Concordância', soon: true },
        { label: 'Texto Original', onClick: () => router.push('/knowledge') },
        { label: 'Referências Cruzadas', onClick: () => router.push('/knowledge') },
        { label: 'Calendário', separator: true, onClick: () => router.push('/agenda/calendario') },
        { label: 'Todos os Eventos', onClick: () => router.push('/agenda/eventos') },
        { label: 'Pregações', onClick: () => router.push('/agenda/pregacoes') },
        { label: 'Linha do Tempo', onClick: () => router.push('/agenda/linha-do-tempo') },
        { label: 'Biblioteca', separator: true, onClick: () => router.push('/knowledge') },
        { label: 'Sistemática', onClick: () => router.push('/knowledge') },
        { label: 'Catecismos', onClick: () => router.push('/knowledge') },
        { label: 'Configurações', separator: true, soon: true },
      ],
    },
    {
      id: 'ia',
      label: 'IA',
      items: [
        { label: 'Abrir Assistente', shortcut: '⌘I', checked: aiOpen, onClick: onToggleAI },
        { label: 'Analisar Passagem', separator: true, soon: true },
        { label: 'Gerar Comentário', soon: true },
        { label: 'Sugestões de Sermão', soon: true },
        { label: 'Resumo Exegético', soon: true },
        { label: 'Configurar Modelo', separator: true, soon: true },
      ],
    },
    {
      id: 'publicar',
      label: 'Publicar',
      items: [
        { label: 'Enviar para Sermão', onClick: onEnviarSermao },
        { label: 'Enviar para Devocional', onClick: onEnviarDevocional },
        { label: 'Enviar para Base de Conhecimento', onClick: onEnviarKB },
        { label: 'Meus Conteúdos', separator: true, soon: true },
        { label: 'Sermões Publicados', soon: true },
        { label: 'Exportar PDF', separator: true, soon: true },
        { label: 'Slides', soon: true },
        { label: 'Compartilhar Link', separator: true, soon: true },
      ],
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      items: [
        { label: 'Documentação', soon: true },
        { label: 'Atalhos de Teclado', soon: true },
        { label: 'Tour Guiado', soon: true },
        { label: 'Sobre o Lampas', separator: true, soon: true },
        { label: 'Enviar Feedback', soon: true },
      ],
    },
  ]

  function handleLabelClick(id: string) {
    setOpenMenu(prev => (prev === id ? null : id))
  }

  function handleLabelHover(id: string) {
    if (openMenu !== null && openMenu !== id) setOpenMenu(id)
  }

  function handleItemClick(item: MenuAction) {
    if (item.disabled || item.soon) return
    item.onClick?.()
    setOpenMenu(null)
  }

  return (
    <header style={{
      height: '44px',
      flexShrink: 0,
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.65rem',
      position: 'relative',
      zIndex: 100,
    }}>

      {/* ── Logo ── */}
      <div style={{ flexShrink: 0, marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
        <LampasLogo height={34} />
      </div>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', marginRight: '0.35rem', flexShrink: 0 }} />

      {/* ── Menu bar ── */}
      <div ref={barRef} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        {menus.map(menu => (
          <div key={menu.id} style={{ position: 'relative', flexShrink: 0 }}>
            <MenuLabel
              label={menu.label}
              open={openMenu === menu.id}
              onClick={() => handleLabelClick(menu.id)}
              onHover={() => handleLabelHover(menu.id)}
            />
            {openMenu === menu.id && (
              <MenuDropdown items={menu.items} onItemClick={handleItemClick} />
            )}
          </div>
        ))}
      </div>

      {/* ── Lado direito: Pesquisar + Novo Projeto + Perfil ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>

        {/* Pesquisar */}
        {showSearch ? (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0 0.55rem', gap: '0.35rem',
          }}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Buscar no projeto…"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '0.78rem', color: 'var(--text-primary)',
                fontFamily: 'inherit', width: '160px', padding: '0.28rem 0',
              }}
            />
            <button
              onClick={() => { setShowSearch(false); setSearchVal('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1, padding: '0' }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            title="Pesquisar (⌘K)"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontFamily: 'inherit',
              fontSize: '0.76rem', padding: '0.25rem 0.45rem', borderRadius: '6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <SearchIcon />
            <span>Pesquisar</span>
          </button>
        )}

        {/* Novo Projeto */}
        <button
          onClick={() => router.push('/dashboard?new=1')}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '0.28rem 0.65rem',
            fontSize: '0.76rem', fontWeight: 650, fontFamily: 'inherit',
            cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.22rem',
            transition: 'background 0.13s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <span style={{ fontSize: '0.88rem', lineHeight: 1 }}>+</span>
          Novo Projeto
        </button>

        {/* Perfil do Usuário */}
        <div ref={openMenu === 'user' ? undefined : undefined} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenMenu(p => p === 'user' ? null : 'user')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'none', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '0.22rem 0.48rem',
              cursor: 'pointer', fontFamily: 'inherit',
              color: 'var(--text-secondary)', fontSize: '0.76rem',
              transition: 'border-color 0.13s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => { if (openMenu !== 'user') e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
            }}>
              {initial}
            </span>
            <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail ?? '…'}
            </span>
            <ChevronIcon open={openMenu === 'user'} />
          </button>

          {openMenu === 'user' && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0,
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              borderRadius: '9px',
              boxShadow: '0 8px 24px rgba(15,23,42,0.1), 0 2px 6px rgba(15,23,42,0.06)',
              padding: '0.3rem', zIndex: 700, minWidth: '180px',
            }}>
              <div style={{ padding: '0.4rem 0.75rem 0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {userEmail}
              </div>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />
              <ProfileItem label="Planos" onClick={() => { setOpenMenu(null); router.push('/billing') }} />
              {isAdmin && <ProfileItem label="Admin" onClick={() => { setOpenMenu(null); router.push('/admin/billing') }} />}
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />
              <ProfileItem label="Sair" onClick={signOut} danger />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function MenuLabel({ label, open, onClick, onHover }: {
  label: string; open: boolean; onClick: () => void; onHover: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        background: open ? 'var(--surface-2)' : 'transparent',
        border: 'none',
        color: open ? 'var(--text-primary)' : 'var(--text-secondary)',
        borderRadius: '5px',
        padding: '0.2rem 0.48rem',
        fontSize: '0.76rem',
        fontWeight: open ? 600 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
        transition: 'background 0.08s, color 0.08s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseOut={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
    >
      {label}
    </button>
  )
}

function MenuDropdown({ items, onItemClick }: { items: MenuAction[]; onItemClick: (item: MenuAction) => void }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 3px)', left: 0,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)',
      minWidth: '215px', zIndex: 600, padding: '0.3rem 0',
    }}>
      {items.map((item, i) => (
        <div key={i}>
          {item.separator && (
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }} />
          )}
          <DropdownItem item={item} onClick={() => onItemClick(item)} />
        </div>
      ))}
    </div>
  )
}

function DropdownItem({ item, onClick }: { item: MenuAction; onClick: () => void }) {
  const inactive = !!(item.disabled || item.soon)
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: 'none', background: 'transparent', padding: '0.34rem 0.8rem',
        cursor: inactive ? 'default' : 'pointer',
        fontFamily: 'inherit', fontSize: '0.78rem',
        color: inactive ? 'var(--text-muted)' : 'var(--text-primary)',
        textAlign: 'left', opacity: item.disabled ? 0.45 : 1, gap: '0.5rem',
      }}
      onMouseEnter={e => { if (!inactive) e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.42rem', minWidth: 0 }}>
        <span style={{ width: '12px', fontSize: '0.68rem', color: 'var(--accent)', flexShrink: 0 }}>
          {item.checked === true ? '✓' : ''}
        </span>
        <span style={{ fontWeight: item.checked ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>
        {item.soon && (
          <span style={{
            fontSize: '0.57rem', color: 'var(--text-muted)',
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '3px', padding: '0.01rem 0.2rem', fontWeight: 500, flexShrink: 0,
          }}>em breve</span>
        )}
        {item.badge && (
          <span style={{
            fontSize: '0.57rem', color: 'var(--text-muted)',
            background: 'var(--surface-3)', borderRadius: '3px',
            padding: '0.01rem 0.2rem', fontWeight: 600, flexShrink: 0,
          }}>{item.badge}</span>
        )}
      </span>
      {item.shortcut && (
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1rem' }}>
          {item.shortcut}
        </span>
      )}
    </button>
  )
}

function ProfileItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', width: '100%',
        padding: '0.42rem 0.75rem', background: 'none', border: 'none',
        borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
        fontFamily: 'inherit', color: danger ? '#EF4444' : 'var(--text-primary)',
        fontWeight: 450, textAlign: 'left',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.06)' : 'var(--surface-2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      {label}
    </button>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
