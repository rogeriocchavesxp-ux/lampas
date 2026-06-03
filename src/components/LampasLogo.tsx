// Logo Lampas — usa o PNG original com fundo transparente (lampas-symbol.png)
// Símbolo: três nós dourados conectados representando Revelação → Inspiração → Interpretação

interface LogoProps { height?: number }
interface MarkProps { size?: number }

const SYMBOL_SRC = '/lampas-symbol.png'

// ── LampasLogo — símbolo + wordmark ───────────────────────────────────────

export function LampasLogo({ height = 40 }: LogoProps) {
  const symSize = Math.round(height * 0.92)
  const gap     = Math.round(height * 0.18)
  const fs      = Math.round(height * 0.64)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SYMBOL_SRC}
        alt="Lampas"
        width={symSize}
        height={symSize}
        style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
      />
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

// ── LampasMarkIcon — ícone compacto para header de app ────────────────────

export function LampasMarkIcon({ size = 36 }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SYMBOL_SRC}
      alt="Lampas"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
    />
  )
}

// ── LampasSym — símbolo isolado ────────────────────────────────────────────

export function LampasSym({ width = 66, height = 72 }: { width?: number; height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SYMBOL_SRC}
      alt=""
      width={width}
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}
