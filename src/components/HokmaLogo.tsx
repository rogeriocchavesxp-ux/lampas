interface LogoProps {
  height?: number
}

interface MarkProps {
  size?: number
}

export function HokmaLogo({ height = 40 }: LogoProps) {
  const sw = Math.round(height * 0.55)
  const fontSize = Math.round(height * 0.68)
  const gap = Math.round(height * 0.28)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <svg width={sw} height={height} viewBox="0 0 24 40" fill="none">
        <line x1="2"  y1="38" x2="2"  y2="4" stroke="#b8922a" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="22" y1="38" x2="22" y2="4" stroke="#b8922a" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="2"  y1="4"  x2="11" y2="4" stroke="#b8922a" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="15" y1="4"  x2="22" y2="4" stroke="#b8922a" strokeWidth="2.8" strokeLinecap="round" opacity="0.5"/>
      </svg>
      <span style={{
        fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
        fontWeight: 500,
        fontSize,
        color: '#ede8df',
        letterSpacing: '-0.01em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        Hokm<span style={{ color: '#b8922a' }}>á</span>
      </span>
    </div>
  )
}

export function HokmaMarkIcon({ size = 36 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#111620"/>
      <line x1="7"  y1="28" x2="7"  y2="9"  stroke="#b8922a" strokeWidth="3"   strokeLinecap="round"/>
      <line x1="29" y1="28" x2="29" y2="9"  stroke="#b8922a" strokeWidth="3"   strokeLinecap="round"/>
      <line x1="7"  y1="9"  x2="17" y2="9"  stroke="#b8922a" strokeWidth="3"   strokeLinecap="round"/>
      <line x1="21" y1="9"  x2="29" y2="9"  stroke="#b8922a" strokeWidth="2.6" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}
