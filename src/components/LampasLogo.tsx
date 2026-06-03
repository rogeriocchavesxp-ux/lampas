// ── Geometria do símbolo ──────────────────────────────────────────────────
//
// A logo é formada por QUATRO segmentos de linha que se encontram num
// ponto de junção interior — NÃO é um triângulo simples.
//
// Vértices externos (nós com esfera):
//   TOP   = Deus / Revelação     — origem de tudo, posicionado acima
//   LEFT  = Autor Bíblico        — inspiração, regista a revelação
//   RIGHT = Igreja / Intérprete  — leitor contemporâneo
//
// Ponto interior (apenas junção de linhas, sem esfera):
//   JUNC  = Centro Hermenêutico  — onde os três mundos se conectam
//
// Segmentos:
//   TOP  → JUNC  (quase vertical, desce do alto)
//   JUNC → LEFT  (diagonal ↙, completa o traço vertical do "L")
//   JUNC → RIGHT (diagonal →, o elemento interno sofisticado)
//   LEFT → RIGHT (base horizontal do "L")
//
// O "L" emerge de: TOP→JUNC→LEFT + LEFT→RIGHT

interface LogoProps { height?: number }
interface MarkProps { size?: number }

// Coordenadas master (viewBox 0 0 80 88)
// Calibradas a partir do arquivo "Logo Lampas SF.png" (fundo branco)
const M = {
  TOP:  { x: 38, y:  4 },  // Deus / Revelação — topo central
  LEFT: { x: 12, y: 81 },  // Autor Bíblico — inferior esquerdo
  RIGHT:{ x: 62, y: 77 },  // Igreja / Intérprete — inferior direito
  JUNC: { x: 30, y: 62 },  // Centro hermenêutico — junção das linhas (mais baixo, tendendo à esquerda)
} as const

// ── LampasSym — símbolo isolado (sem fundo) ───────────────────────────────

export function LampasSym({ width = 66, height = 72 }: { width?: number; height?: number }) {
  const scaleX = (x: number) => (x / 80) * width
  const scaleY = (y: number) => (y / 88) * height

  const t = { x: scaleX(M.TOP.x),   y: scaleY(M.TOP.y)   }
  const l = { x: scaleX(M.LEFT.x),  y: scaleY(M.LEFT.y)  }
  const r = { x: scaleX(M.RIGHT.x), y: scaleY(M.RIGHT.y) }
  const j = { x: scaleX(M.JUNC.x),  y: scaleY(M.JUNC.y)  }

  const sw = Math.max(1.2, width * 0.028)
  const nr = Math.max(3,   width * 0.10)
  const uid = `sym-${width}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={`${uid}-line`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f5d97a" />
          <stop offset="50%"  stopColor="#c9921a" />
          <stop offset="100%" stopColor="#8a5f0e" />
        </linearGradient>
        <radialGradient id={`${uid}-node`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#faeea0" />
          <stop offset="40%"  stopColor="#d4a832" />
          <stop offset="100%" stopColor="#7a5010" />
        </radialGradient>
      </defs>

      {/* Quatro segmentos que convergem no ponto interior */}
      <line x1={t.x} y1={t.y} x2={j.x} y2={j.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />
      <line x1={j.x} y1={j.y} x2={l.x} y2={l.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />
      <line x1={j.x} y1={j.y} x2={r.x} y2={r.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />
      <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />

      {/* Nós externos — esferas douradas */}
      <circle cx={t.x} cy={t.y} r={nr}           fill={`url(#${uid}-node)`} />
      <circle cx={l.x} cy={l.y} r={nr}           fill={`url(#${uid}-node)`} />
      <circle cx={r.x} cy={r.y} r={nr * 0.95}   fill={`url(#${uid}-node)`} />
    </svg>
  )
}

// ── LampasLogo — wordmark completo ────────────────────────────────────────

export function LampasLogo({ height = 40 }: LogoProps) {
  const symW = Math.round(height * 0.80)
  const symH = height
  const gap  = Math.round(height * 0.22)
  const fs   = Math.round(height * 0.64)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <LampasSym width={symW} height={symH} />
      <span style={{
        fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
        fontWeight: 500,
        fontSize: fs,
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
  const pad = size * 0.13
  const aw  = size - pad * 2
  const ah  = size - pad * 2

  const sx = (x: number) => pad + (x / 80) * aw
  const sy = (y: number) => pad + (y / 88) * ah

  const t = { x: sx(M.TOP.x),   y: sy(M.TOP.y)   }
  const l = { x: sx(M.LEFT.x),  y: sy(M.LEFT.y)  }
  const r = { x: sx(M.RIGHT.x), y: sy(M.RIGHT.y) }
  const j = { x: sx(M.JUNC.x),  y: sy(M.JUNC.y)  }

  const sw = Math.max(1, size * 0.028)
  const nr = Math.max(2, size * 0.10)
  const uid = `mk-${size}`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect width={size} height={size} rx={Math.round(size * 0.22)} fill="#0F172A" />
      <defs>
        <linearGradient id={`${uid}-line`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#f5d97a" />
          <stop offset="50%"  stopColor="#c9921a" />
          <stop offset="100%" stopColor="#8a5f0e" />
        </linearGradient>
        <radialGradient id={`${uid}-node`} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#faeea0" />
          <stop offset="40%"  stopColor="#d4a832" />
          <stop offset="100%" stopColor="#7a5010" />
        </radialGradient>
      </defs>

      <line x1={t.x} y1={t.y} x2={j.x} y2={j.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />
      <line x1={j.x} y1={j.y} x2={l.x} y2={l.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />
      <line x1={j.x} y1={j.y} x2={r.x} y2={r.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />
      <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke={`url(#${uid}-line)`} strokeWidth={sw} strokeLinecap="round" />

      <circle cx={t.x} cy={t.y} r={nr}          fill={`url(#${uid}-node)`} />
      <circle cx={l.x} cy={l.y} r={nr}          fill={`url(#${uid}-node)`} />
      <circle cx={r.x} cy={r.y} r={nr * 0.95}  fill={`url(#${uid}-node)`} />
    </svg>
  )
}
