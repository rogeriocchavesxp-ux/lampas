'use client'

import { useState, useRef, useEffect } from 'react'
import { LampasLogo } from '@/components/LampasLogo'
import type { Project } from '@/types/database'
import type { StudyModeConfig } from '@/lib/study-modes'

interface MenuAction {
  label: string
  shortcut?: string
  checked?: boolean
  disabled?: boolean
  separator?: boolean
  soon?: boolean
  onClick?: () => void
}

interface MenuDef {
  id: string
  label: string
  items: MenuAction[]
}

export interface WorkspaceMenuBarProps {
  project: Project
  titleValue: string
  pct: number
  modeConfig: StudyModeConfig
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
  onNavigateHome: () => void
  onNavigateDashboard: () => void
}

export default function WorkspaceMenuBar({
  project,
  titleValue,
  pct,
  modeConfig,
  bibleOpen,
  focusMode,
  sideBySide,
  aiOpen,
  onToggleBible,
  onToggleFocus,
  onToggleSideBySide,
  onToggleAI,
  onEnviarSermao,
  onEnviarDevocional,
  onEnviarKB,
  onNavigateHome,
  onNavigateDashboard,
}: WorkspaceMenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

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
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const menus: MenuDef[] = [
    {
      id: 'arquivo',
      label: 'Arquivo',
      items: [
        { label: 'Novo Projeto', shortcut: '⌘N', onClick: onNavigateDashboard },
        { label: 'Meus Projetos', onClick: onNavigateDashboard },
        { label: 'Início', onClick: onNavigateHome, separator: true },
        { label: 'Salvar', shortcut: '⌘S', disabled: true, separator: true },
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
        { label: 'Cortar', shortcut: '⌘X', onClick: () => document.execCommand('cut'), separator: true },
        { label: 'Copiar', shortcut: '⌘C', onClick: () => document.execCommand('copy') },
        { label: 'Colar', shortcut: '⌘V', onClick: () => document.execCommand('paste') },
        { label: 'Selecionar Tudo', shortcut: '⌘A', onClick: () => document.execCommand('selectAll'), separator: true },
      ],
    },
    {
      id: 'exibir',
      label: 'Exibir',
      items: [
        { label: 'Texto Bíblico', shortcut: '⌘B', checked: bibleOpen, onClick: onToggleBible },
        { label: 'Modo Lado a Lado', checked: sideBySide, onClick: onToggleSideBySide },
        { label: 'Modo Foco', shortcut: '⌘.', checked: focusMode, onClick: onToggleFocus },
        { label: 'Tema Escuro / Claro', soon: true, separator: true },
        { label: 'Tamanho da Fonte', soon: true },
      ],
    },
    {
      id: 'inserir',
      label: 'Inserir',
      items: [
        { label: 'Novo Bloco', soon: true },
        { label: 'Nova Seção', soon: true },
        { label: 'Imagem', soon: true, separator: true },
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
        { label: 'Dicionário Bíblico', soon: true },
        { label: 'Concordância', soon: true },
        { label: 'Mapa Bíblico', soon: true },
        { label: 'Linha do Tempo', soon: true },
        { label: 'Histórico de Versões', soon: true, separator: true },
        { label: 'Configurações', soon: true, separator: true },
      ],
    },
    {
      id: 'ia',
      label: 'IA',
      items: [
        { label: 'Abrir Assistente', shortcut: '⌘I', checked: aiOpen, onClick: onToggleAI },
        { label: 'Analisar Passagem', soon: true, separator: true },
        { label: 'Gerar Comentário', soon: true },
        { label: 'Sugestões de Sermão', soon: true },
        { label: 'Resumo Exegético', soon: true },
        { label: 'Configurar Modelo', soon: true, separator: true },
      ],
    },
    {
      id: 'publicar',
      label: 'Publicar',
      items: [
        { label: 'Enviar para Sermão', onClick: onEnviarSermao },
        { label: 'Enviar para Devocional', onClick: onEnviarDevocional },
        { label: 'Enviar para Base de Conhecimento', onClick: onEnviarKB },
        { label: 'Exportar como PDF', soon: true, separator: true },
        { label: 'Exportar como Word', soon: true },
        { label: 'Compartilhar Link', soon: true, separator: true },
        { label: 'Publicar Online', soon: true },
      ],
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      items: [
        { label: 'Documentação', soon: true },
        { label: 'Atalhos de Teclado', soon: true },
        { label: 'Tour Guiado', soon: true },
        { label: 'Sobre o Lampas', soon: true, separator: true },
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
      gap: '0',
      position: 'relative',
      zIndex: 100,
    }}>

      {/* ── Logo ── */}
      <div style={{ flexShrink: 0, marginRight: '0.6rem', display: 'flex', alignItems: 'center' }}>
        <LampasLogo height={36} />
      </div>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', marginRight: '0.6rem', flexShrink: 0 }} />

      {/* ── Título do projeto ── */}
      <span style={{
        fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)',
        maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        marginRight: '0.4rem', flexShrink: 1,
      }}>
        {titleValue}
      </span>

      <span style={{
        fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0, marginRight: '0.65rem',
        background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
        borderRadius: '3px', padding: '0.02rem 0.26rem',
      }}>
        {project.original_language}
      </span>

      <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', marginRight: '0.5rem', flexShrink: 0 }} />

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
              <MenuDropdown
                items={menu.items}
                onItemClick={handleItemClick}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Lado direito ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>

        {/* Mode badge */}
        <span style={{
          fontSize: '0.61rem', fontWeight: 700, letterSpacing: '0.04em',
          color: modeConfig.color,
          background: `${modeConfig.color}14`,
          border: `1px solid ${modeConfig.color}30`,
          borderRadius: '4px', padding: '0.1rem 0.38rem',
          whiteSpace: 'nowrap',
        }}>
          {modeConfig.name}
        </span>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.61rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>{pct}%</span>
          <div style={{ width: '44px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: modeConfig.color,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        <div style={{ width: '1px', height: '13px', background: 'var(--border-subtle)', flexShrink: 0 }} />

        {/* IA quick toggle */}
        <QuickButton
          label="IA"
          active={aiOpen}
          activeColor="var(--ai)"
          activeBg="var(--ai-subtle)"
          onClick={onToggleAI}
          title="Assistente de IA (⌘I)"
        />

        {/* Texto Bíblico quick toggle */}
        <QuickButton
          label="Texto"
          active={bibleOpen}
          activeColor="#C9921A"
          activeBg="rgba(201,146,26,0.1)"
          onClick={onToggleBible}
          title="Texto Bíblico (⌘B)"
        />

        <div style={{ width: '1px', height: '13px', background: 'var(--border-subtle)', flexShrink: 0 }} />

        {/* Perfil */}
        <button
          onClick={onNavigateDashboard}
          title="Meus Projetos"
          style={{
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          ↩
        </button>
      </div>
    </header>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function MenuLabel({ label, open, onClick, onHover }: {
  label: string
  open: boolean
  onClick: () => void
  onHover: () => void
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
        padding: '0.2rem 0.5rem',
        fontSize: '0.76rem',
        fontWeight: open ? 600 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
        transition: 'background 0.08s, color 0.08s',
        whiteSpace: 'nowrap',
      }}
      onMouseOver={e => {
        e.currentTarget.style.background = 'var(--surface-2)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseOut={e => {
        if (!open) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      {label}
    </button>
  )
}

function MenuDropdown({ items, onItemClick }: {
  items: MenuAction[]
  onItemClick: (item: MenuAction) => void
}) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 3px)', left: 0,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)',
      minWidth: '210px',
      zIndex: 600,
      padding: '0.3rem 0',
      overflow: 'hidden',
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
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: 'none',
        background: 'transparent',
        padding: '0.34rem 0.8rem',
        cursor: inactive ? 'default' : 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.78rem',
        color: inactive ? 'var(--text-muted)' : 'var(--text-primary)',
        textAlign: 'left',
        opacity: item.disabled ? 0.45 : 1,
        gap: '0.5rem',
      }}
      onMouseEnter={e => {
        if (!inactive) e.currentTarget.style.background = 'var(--surface-2)'
      }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
        <span style={{ width: '12px', fontSize: '0.68rem', color: 'var(--accent)', flexShrink: 0 }}>
          {item.checked === true ? '✓' : ''}
        </span>
        <span style={{ fontWeight: item.checked ? 600 : 400, whiteSpace: 'nowrap' }}>
          {item.label}
        </span>
        {item.soon && (
          <span style={{
            fontSize: '0.58rem', color: 'var(--text-muted)',
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '3px', padding: '0.01rem 0.22rem',
            fontWeight: 500, flexShrink: 0,
          }}>
            em breve
          </span>
        )}
      </span>
      {item.shortcut && (
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '1.2rem' }}>
          {item.shortcut}
        </span>
      )}
    </button>
  )
}

function QuickButton({ label, active, activeColor, activeBg, onClick, title }: {
  label: string
  active: boolean
  activeColor: string
  activeBg: string
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? activeBg : 'transparent',
        border: `1px solid ${active ? activeColor : 'var(--border-subtle)'}`,
        color: active ? activeColor : 'var(--text-muted)',
        borderRadius: '5px', padding: '0.16rem 0.48rem',
        fontSize: '0.68rem', fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.13s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.borderColor = activeColor
          e.currentTarget.style.color = activeColor
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }
      }}
    >
      {label}
    </button>
  )
}
