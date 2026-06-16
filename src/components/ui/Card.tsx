import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function Card({ children, className, style }: CardProps) {
  const baseStyles: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.05)',
  }

  return (
    <div className={className} style={{ ...baseStyles, ...style }}>
      {children}
    </div>
  )
}
