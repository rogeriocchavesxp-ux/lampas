'use client'

import { useState } from 'react'
import type { NavPhase } from '@/lib/study-modes'

// ── Design tokens ────────────────────────────────────────────────────────────
const HEADER_HEIGHT = 40
const CHIP_HEIGHT   = 22
const SEG_HEIGHT    = 26

// ── SegmentedControl ─────────────────────────────────────────────────────────

function SegmentedControl({ options, value, onChange, color }: {
  options:  { value: string; label: string }[]
  value:    string
  onChange: (v: string) => void
  color?:   string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 8, padding: 2, gap: 1,
      height: SEG_HEIGHT, boxSizing: 'border-box', flexShrink: 0,
    }}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              height: SEG_HEIGHT - 4, padding: '0 10px', border: 'none', borderRadius: 6,
              background: active ? (color ?? 'var(--accent)') : 'transparent',
              color: active ? '#fff' : 'var(--text-muted)',
              fontSize: '0.71rem', fontWeight: active ? 650 : 400,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              whiteSpace: 'nowrap', letterSpacing: active ? '-0.01em' : 'normal',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ children, variant, color }: {
  children: React.ReactNode
  variant?: 'mode' | 'neutral'
  color?:   string
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    height: CHIP_HEIGHT, borderRadius: 5,
    fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.03em',
    padding: '0 6px', whiteSpace: 'nowrap', lineHeight: 1, flexShrink: 0,
  }
  if (variant === 'mode' && color) {
    return (
      <span style={{ ...base, color, background: `${color}15`, border: `1px solid ${color}30` }}>
        {children}
      </span>
    )
  }
  return (
    <span style={{ ...base, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
      {children}
    </span>
  )
}

// ── ProgressChip ─────────────────────────────────────────────────────────────

function ProgressChip({ pct, color }: { pct: number; color: string }) {
  const done = pct >= 100
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: CHIP_HEIGHT, borderRadius: 5, padding: '0 7px',
      background: 'var(--surface)', border: '1px solid var(--border-subtle)',
      fontSize: '0.62rem', fontWeight: 500, color: 'var(--text-muted)',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      <span style={{ display: 'block', width: 28, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
        <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: done ? '#10B981' : color, transition: 'width 0.5s ease', borderRadius: 1 }} />
      </span>
      {pct}%
    </span>
  )
}

// ── OpenBookIcon — SVG de Bíblia aberta ──────────────────────────────────────

function OpenBookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.75)} viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Página esquerda */}
      <path d="M10 13.5C10 13.5 6.5 12.5 1.5 13.5V2C6.5 1 10 2.5 10 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Página direita */}
      <path d="M10 13.5C10 13.5 13.5 12.5 18.5 13.5V2C13.5 1 10 2.5 10 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Lombada */}
      <line x1="10" y1="2.5" x2="10" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Linhas de texto — página esquerda */}
      <line x1="3"   y1="5"   x2="8"   y2="4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="3"   y1="7.5" x2="8"   y2="7"   stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="3"   y1="10"  x2="8"   y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
      {/* Linhas de texto — página direita */}
      <line x1="12"  y1="4.5" x2="17"  y2="5"   stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="12"  y1="7"   x2="17"  y2="7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
      <line x1="12"  y1="9.5" x2="17"  y2="10"  stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  )
}

// ── BibleToggle ───────────────────────────────────────────────────────────────

function BibleToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  const iconColor  = open ? '#1D4ED8' : (hovered ? '#334155' : '#64748B')
  const border     = open ? '#1D4ED8' : (hovered ? '#B8C5D6' : '#DDE3EC')
  const bg         = open
    ? 'linear-gradient(135deg, #EFF6FF 0%, #FFF9F0 100%)'
    : (hovered ? '#F8FAFC' : 'rgba(255,255,255,0.85)')
  const shadow     = open
    ? '0 0 0 3px rgba(201,146,26,0.22), 0 2px 10px rgba(29,78,216,0.1)'
    : (hovered ? '0 0 0 3px rgba(201,146,26,0.14), 0 2px 6px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.06)')

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Texto Bíblico"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 3, padding: '5px 14px',
        border: `1.5px solid ${border}`, borderRadius: 10,
        background: bg, boxShadow: shadow,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.16s ease', outline: 'none', flexShrink: 0,
      }}
    >
      <span style={{
        display: 'flex', color: iconColor,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.16s ease, color 0.16s ease',
      }}>
        <OpenBookIcon size={20} />
      </span>
      <span style={{
        fontSize: '0.56rem', fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color: iconColor, transition: 'color 0.16s ease',
        lineHeight: 1, whiteSpace: 'nowrap',
      }}>
        Texto Bíblico
      </span>
    </button>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface WorkspaceHeaderProps {
  titleValue:         string
  modeConfig:         { name: string; color: string }
  bibleVersion:       string
  pct:                number
  activePhase?:       NavPhase
  showWorkMode:       boolean
  showViewMode:       boolean
  workMode:           'guided' | 'free' | 'reading'
  onWorkModeChange:   (mode: 'guided' | 'free' | 'reading') => void
  vgViewMode:         'visual' | 'structured'
  onVgViewModeChange: (mode: 'visual' | 'structured') => void
  bibleOpen:          boolean
  onToggleBible:      () => void
}

// ── WorkspaceHeader ──────────────────────────────────────────────────────────

export default function WorkspaceHeader({
  titleValue, modeConfig, bibleVersion, pct,
  activePhase,
  showWorkMode, showViewMode,
  workMode, onWorkModeChange,
  vgViewMode, onVgViewModeChange,
  bibleOpen, onToggleBible,
}: WorkspaceHeaderProps) {
  return (
    <div style={{
        height: HEADER_HEIGHT,
        flexShrink: 0,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 16px',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>

        {/* ── LeftGroup — Identification ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', minWidth: 0 }}>
          <span style={{
            fontSize: '0.82rem', fontWeight: 700,
            color: 'var(--text-primary)', whiteSpace: 'nowrap',
            letterSpacing: '-0.015em',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220,
            flexShrink: 0,
          }}>
            {titleValue}
          </span>

          <Chip variant="mode" color={modeConfig.color}>
            {modeConfig.name}
          </Chip>

          {bibleVersion && (
            <span className="wh-bible">
              <Chip>{bibleVersion}</Chip>
            </span>
          )}

          <span className="wh-progress">
            <ProgressChip pct={pct} color={modeConfig.color} />
          </span>
        </div>

        {/* ── CenterGroup — Bible toggle + view controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showWorkMode && (
            <SegmentedControl
              options={[
                { value: 'guided',  label: 'Guiado'  },
                { value: 'free',    label: 'Livre'   },
                { value: 'reading', label: 'Leitura' },
              ]}
              value={workMode}
              onChange={v => onWorkModeChange(v as 'guided' | 'free' | 'reading')}
              color={activePhase?.color}
            />
          )}

          <BibleToggle open={bibleOpen} onClick={onToggleBible} />

          {showViewMode && (
            <SegmentedControl
              options={[
                { value: 'structured', label: 'Estruturado' },
                { value: 'visual',     label: 'Mapa'        },
              ]}
              value={vgViewMode}
              onChange={v => onVgViewModeChange(v as 'visual' | 'structured')}
            />
          )}
        </div>

        {/* ── RightGroup — reserved ── */}
        <div />
    </div>
  )
}
