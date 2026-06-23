'use client'

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

// ── BibleToggle ───────────────────────────────────────────────────────────────

function BibleToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        height: SEG_HEIGHT, padding: '0 10px',
        border: `1px solid ${open ? 'var(--accent)' : 'var(--border-subtle)'}`,
        borderRadius: 6,
        background: open ? 'var(--accent)' : 'transparent',
        color: open ? '#fff' : 'var(--text-muted)',
        fontSize: '0.71rem', fontWeight: open ? 650 : 400,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.12s', whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      Texto Bíblico
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
  workMode:           'guided' | 'free'
  onWorkModeChange:   (mode: 'guided' | 'free') => void
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
    <>
      {/* Responsive: chips collapse at smaller viewports — never wrap, never break */}
      <style>{`
        .wh-bible    { display: inline-flex; }
        .wh-progress { display: inline-flex; }
        @media (max-width: 1280px) { .wh-progress { display: none !important; } }
        @media (max-width: 1200px) { .wh-bible    { display: none !important; } }
      `}</style>

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

        {/* ── CenterGroup — Controls only (phase shown in bottom nav) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showWorkMode && (
            <SegmentedControl
              options={[
                { value: 'guided', label: 'Guiado' },
                { value: 'free',   label: 'Livre'  },
              ]}
              value={workMode}
              onChange={v => onWorkModeChange(v as 'guided' | 'free')}
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

        {/* ── RightGroup — spacer para manter controles centrados ── */}
        <div />
      </div>
    </>
  )
}
