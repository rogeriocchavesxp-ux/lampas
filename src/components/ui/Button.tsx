import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: React.ReactNode
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
  },
  secondary: {
    background: 'var(--surface-2)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    color: 'var(--accent)',
    border: 'none',
    fontWeight: 600,
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px' },
  md: { padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: '8px' },
  lg: { padding: '0.75rem 1.5rem', fontSize: '1rem', borderRadius: '10px' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  disabled,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const baseStyles: React.CSSProperties = {
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.12s ease-out',
    fontFamily: 'inherit',
    ...variantStyles[variant],
    ...sizeStyles[size],
  }

  return (
    <button
      className={className}
      style={{ ...baseStyles, ...style }}
      disabled={disabled}
      onMouseEnter={(e) => {
        setIsHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setIsHovered(false)
        onMouseLeave?.(e)
      }}
      {...props}
    />
  )
}
