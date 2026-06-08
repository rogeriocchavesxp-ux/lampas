interface LogoProps {
  height?: number
  variant?: 'dark' | 'light'
}
interface MarkProps {
  size?: number
  variant?: 'dark' | 'light'
}

// Inline SVG — tocha com chama dourada
function TorchSVG({ size = 36 }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M60 14 C68 22 76 36 72 52 C69 62 64 68 60 70 C56 68 51 62 48 52 C44 36 52 22 60 14 Z"
        fill="#c9921a"
      />
      <path
        d="M60 26 C64 32 66 42 64 52 C63 57 61 60 60 61 C59 60 57 57 56 52 C54 42 56 32 60 26 Z"
        fill="#f2d06a"
        opacity="0.55"
      />
      <rect x="57" y="70" width="6" height="10" rx="2" fill="#c9921a" />
      <rect x="52" y="80" width="16" height="26" rx="4" fill="#c9921a" opacity="0.85" />
      <rect x="55" y="82" width="10" height="22" rx="2" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

// ── LampasLogo — símbolo + wordmark ──────────────────────────────────────────

export function LampasLogo({ height = 40, variant = 'dark' }: LogoProps) {
  const symSize  = Math.round(height * 0.92)
  const gap      = Math.round(height * 0.18)
  const fs       = Math.round(height * 0.64)
  const wordColor = variant === 'light' ? '#f5f0e8' : '#0F172A'

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <TorchSVG size={symSize} />
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
  return <TorchSVG size={size} />
}

// ── LampasSym — símbolo isolado ───────────────────────────────────────────────

export function LampasSym({ width = 66, height = 72 }: { width?: number; height?: number }) {
  return <TorchSVG size={Math.max(width, height)} />
}
