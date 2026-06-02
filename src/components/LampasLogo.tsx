interface LogoProps { height?: number }
interface MarkProps { size?: number }

const FLAME = '#c9921a'
const TEXT  = '#ede8df'

export function LampasLogo({ height = 40 }: LogoProps) {
  const sw       = Math.round(height * 0.45)
  const fontSize = Math.round(height * 0.65)
  const gap      = Math.round(height * 0.28)

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <svg width={sw} height={height} viewBox="0 0 24 48" fill="none">
        <path d="M12 2 C16 8 20 18 17 28 C15 34 12 37 12 37 C12 37 9 34 7 28 C4 18 8 8 12 2 Z" fill={FLAME}/>
        <path d="M12 10 C14 15 15 22 13 28 C12.5 31 12 32 12 32 C12 32 11.5 31 11 28 C9 22 10 15 12 10 Z" fill="#f2d06a" opacity="0.5"/>
        <rect x="10" y="37" width="4" height="5" rx="1.5" fill={FLAME}/>
        <rect x="8"  y="42" width="8" height="6"  rx="2"   fill={FLAME} opacity="0.8"/>
      </svg>
      <span style={{
        fontFamily: "'EB Garamond', Georgia, 'Times New Roman', serif",
        fontWeight: 500,
        fontSize,
        color: TEXT,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        Lamp<span style={{ color: FLAME }}>as</span>
      </span>
    </div>
  )
}

export function LampasMarkIcon({ size = 36 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#111620"/>
      <path d="M18 3 C21 7 24 13 22 20 C21 24 18 26 18 26 C18 26 15 24 14 20 C12 13 15 7 18 3 Z" fill={FLAME}/>
      <path d="M18 8 C20 11 21 16 20 20 C19.5 22 18 23 18 23 C18 23 16.5 22 16 20 C15 16 16 11 18 8 Z" fill="#f2d06a" opacity="0.5"/>
      <rect x="16.5" y="26" width="3" height="3.5" rx="1" fill={FLAME}/>
      <rect x="15"   y="29.5" width="6" height="4" rx="1.5" fill={FLAME} opacity="0.8"/>
    </svg>
  )
}
