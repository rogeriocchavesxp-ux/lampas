interface LogoProps {
  height?: number
  variant?: 'dark' | 'light'
}
interface MarkProps {
  size?: number
  variant?: 'dark' | 'light'
}

// Símbolo: três esferas douradas conectadas (constelação / rede)
function SymbolSVG({ size = 36 }: { size: number }) {
  const id = `lg-g-${size}`
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id={id} cx="34%" cy="30%" r="66%">
          <stop offset="0%"   stopColor="#f5d870" />
          <stop offset="50%"  stopColor="#c9921a" />
          <stop offset="100%" stopColor="#7a5008" />
        </radialGradient>
      </defs>

      {/* Linhas de conexão — atrás das esferas */}
      <line x1="44" y1="14" x2="10" y2="82" stroke="#c9921a" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="44" y1="14" x2="90" y2="76" stroke="#c9921a" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="10" y1="82" x2="90" y2="76" stroke="#c9921a" strokeWidth="3.2" strokeLinecap="round" />

      {/* Esferas */}
      <circle cx="44" cy="14" r="10" fill={`url(#${id})`} />
      <circle cx="10" cy="82" r="10" fill={`url(#${id})`} />
      <circle cx="90" cy="76" r="10" fill={`url(#${id})`} />
    </svg>
  )
}

// ── LampasLogo — símbolo + wordmark ──────────────────────────────────────────

export function LampasLogo({ height = 40, variant = 'dark' }: LogoProps) {
  const symSize   = Math.round(height * 0.92)
  const gap       = Math.round(height * 0.18)
  const fs        = Math.round(height * 0.64)
  const wordColor = variant === 'light' ? '#f5f0e8' : '#0F172A'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <SymbolSVG size={symSize} />
      <span style={{
        fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
        fontWeight: 500,
        fontSize: fs,
        color: wordColor,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        Lamp<span style={{ color: '#c9921a' }}>as</span>
      </span>
    </div>
  )
}

// ── LampasMarkIcon — ícone compacto ──────────────────────────────────────────

export function LampasMarkIcon({ size = 36 }: MarkProps) {
  return <SymbolSVG size={size} />
}

// ── LampasSym — símbolo isolado ───────────────────────────────────────────────

export function LampasSym({ width = 66, height = 72 }: { width?: number; height?: number }) {
  return <SymbolSVG size={Math.max(width, height)} />
}
