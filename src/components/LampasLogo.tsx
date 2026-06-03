// ── Geometria do símbolo ──────────────────────────────────────────────────
// Três vértices representando os três mundos da hermenêutica reformada:
//   TOP   = Deus / Revelação (origem)
//   LEFT  = Autor Bíblico / Inspiração
//   RIGHT = Igreja / Intérprete contemporâneo
// As linhas formam um "L" discreto e se encontram em um centro hermenêutico.

const TOP   = { x: 40, y:  8 } as const
const LEFT  = { x:  8, y: 78 } as const
const RIGHT = { x: 72, y: 74 } as const

interface LogoProps { height?: number }
interface MarkProps { size?: number }

// ── LampasLogo — wordmark completo ────────────────────────────────────────

export function LampasLogo({ height = 40 }: LogoProps) {
  const symW    = Math.round(height * 0.82)
  const symH    = height
  const gap     = Math.round(height * 0.22)
  const fsize   = Math.round(height * 0.64)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <LampasSym width={symW} height={symH} />
      <span style={{
        fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
        fontWeight: 500,
        fontSize: fsize,
        color: '#0F172A',
        letterSpacing: '-0.01em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        Lamp<span style={{ color: '#c9921a' }}>as</span>
      </span>
    </div>
  )
}

// ── LampasMarkIcon — ícone quadrado para header de app ────────────────────

export function LampasMarkIcon({ size = 36 }: MarkProps) {
  // Redimensiona os vértices para caber em (size × size) com padding interno
  const pad = size * 0.12
  const aw  = size - pad * 2   // área disponível
  const ah  = size - pad * 2

  function sx(x: number) { return pad + (x / 80) * aw }
  function sy(y: number) { return pad + (y / 88) * ah }

  const t = { x: sx(TOP.x),   y: sy(TOP.y)   }
  const l = { x: sx(LEFT.x),  y: sy(LEFT.y)  }
  const r = { x: sx(RIGHT.x), y: sy(RIGHT.y) }

  const id = `mk${size}`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect width={size} height={size} rx={Math.round(size * 0.22)} fill="#0F172A" />
      <defs>
        <linearGradient id={`${id}line`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f5d97a" />
          <stop offset="50%"  stopColor="#c9921a" />
          <stop offset="100%" stopColor="#8a5f0e" />
        </linearGradient>
        <radialGradient id={`${id}node`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#f8e49a" />
          <stop offset="45%"  stopColor="#d4a832" />
          <stop offset="100%" stopColor="#7a5010" />
        </radialGradient>
      </defs>

      {/* Linhas do triângulo */}
      <line x1={t.x} y1={t.y} x2={l.x} y2={l.y} stroke={`url(#${id}line)`} strokeWidth={size * 0.038} strokeLinecap="round" />
      <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke={`url(#${id}line)`} strokeWidth={size * 0.038} strokeLinecap="round" />
      <line x1={t.x} y1={t.y} x2={r.x} y2={r.y} stroke={`url(#${id}line)`} strokeWidth={size * 0.038} strokeLinecap="round" />

      {/* Nós */}
      <circle cx={t.x} cy={t.y} r={size * 0.095} fill={`url(#${id}node)`} />
      <circle cx={l.x} cy={l.y} r={size * 0.095} fill={`url(#${id}node)`} />
      <circle cx={r.x} cy={r.y} r={size * 0.095} fill={`url(#${id}node)`} />
    </svg>
  )
}

// ── LampasSym — símbolo isolado (sem fundo) ───────────────────────────────

export function LampasSym({ width = 66, height = 72 }: { width?: number; height?: number }) {
  function sx(x: number) { return (x / 80) * width  }
  function sy(y: number) { return (y / 88) * height }

  const t = { x: sx(TOP.x),   y: sy(TOP.y)   }
  const l = { x: sx(LEFT.x),  y: sy(LEFT.y)  }
  const r = { x: sx(RIGHT.x), y: sy(RIGHT.y) }

  const sw = Math.max(1.5, width * 0.038)
  const nr = Math.max(3,   width * 0.09)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id="sym-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f5d97a" />
          <stop offset="50%"  stopColor="#c9921a" />
          <stop offset="100%" stopColor="#8a5f0e" />
        </linearGradient>
        <radialGradient id="sym-node" cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#f8e49a" />
          <stop offset="45%"  stopColor="#d4a832" />
          <stop offset="100%" stopColor="#7a5010" />
        </radialGradient>
      </defs>

      {/* Linhas */}
      <line x1={t.x} y1={t.y} x2={l.x} y2={l.y} stroke="url(#sym-line)" strokeWidth={sw} strokeLinecap="round" />
      <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke="url(#sym-line)" strokeWidth={sw} strokeLinecap="round" />
      <line x1={t.x} y1={t.y} x2={r.x} y2={r.y} stroke="url(#sym-line)" strokeWidth={sw} strokeLinecap="round" />

      {/* Nós */}
      <circle cx={t.x} cy={t.y} r={nr} fill="url(#sym-node)" />
      <circle cx={l.x} cy={l.y} r={nr} fill="url(#sym-node)" />
      <circle cx={r.x} cy={r.y} r={nr} fill="url(#sym-node)" />
    </svg>
  )
}
