'use client'

import React, { useMemo } from 'react'

interface Props {
  content: string
  moduleColor?: string
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let last = 0
  let m: RegExpExecArray | null
  let idx = 0

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      parts.push(
        <strong key={idx++} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {m[1]}
        </strong>
      )
    } else if (m[2] !== undefined) {
      parts.push(
        <em key={idx++} style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          {m[2]}
        </em>
      )
    } else if (m[3] !== undefined) {
      parts.push(
        <code
          key={idx++}
          style={{
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.07)',
            padding: '0.1em 0.35em',
            borderRadius: '3px',
            fontSize: '0.88em',
            color: 'var(--text-primary)',
          }}
        >
          {m[3]}
        </code>
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function MarkdownRenderer({ content, moduleColor = 'var(--accent)' }: Props) {
  const elements = useMemo(() => {
    const lines = content.split('\n')
    const result: React.ReactNode[] = []
    let i = 0
    let k = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (!trimmed) { i++; continue }

      // H2 — section label
      if (trimmed.startsWith('## ')) {
        result.push(
          <div
            key={k++}
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: moduleColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: result.length === 0 ? 0 : '1.75rem',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-sans)',
              opacity: 0.85,
            }}
          >
            {trimmed.slice(3)}
          </div>
        )
        i++; continue
      }

      // H3 — term card header (Hebrew/Greek word or section heading)
      if (trimmed.startsWith('### ')) {
        const term = trimmed.slice(4)
        result.push(
          <div
            key={k++}
            style={{
              marginTop: result.length === 0 ? 0 : '1.85rem',
              paddingBottom: '0.55rem',
              borderBottom: `1.5px solid ${moduleColor}38`,
              marginBottom: '0.8rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: moduleColor,
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {term}
            </span>
          </div>
        )
        i++; continue
      }

      // HR
      if (trimmed === '---' || trimmed === '***') {
        result.push(
          <hr
            key={k++}
            style={{
              border: 'none',
              borderTop: '1px solid var(--border-subtle)',
              margin: '1.5rem 0',
            }}
          />
        )
        i++; continue
      }

      // Table
      if (trimmed.startsWith('|')) {
        const tableKey = k++
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i])
          i++
        }
        const dataRows = tableLines.filter(l => !/^\|[\s\-|:]+\|$/.test(l.trim()))
        result.push(
          <div
            key={tableKey}
            style={{
              overflowX: 'auto',
              margin: '0.75rem 0 1.25rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.87rem',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <tbody>
                {dataRows.map((row, ri) => {
                  const rawCells = row.split('|')
                  const cells = rawCells
                    .slice(1, rawCells.length - 1)
                    .map(c => c.trim())
                  const isHead = ri === 0
                  return (
                    <tr
                      key={ri}
                      style={{
                        borderBottom:
                          ri < dataRows.length - 1
                            ? '1px solid var(--border-subtle)'
                            : 'none',
                      }}
                    >
                      {cells.map((cell, ci) => {
                        const Tag = isHead ? 'th' : 'td'
                        return (
                          <Tag
                            key={ci}
                            style={{
                              padding: '0.5rem 0.9rem',
                              textAlign: 'left',
                              color: isHead
                                ? 'var(--text-muted)'
                                : 'var(--text-primary)',
                              fontWeight: isHead ? 600 : 400,
                              fontSize: isHead ? '0.72rem' : '0.87rem',
                              letterSpacing: isHead ? '0.05em' : 0,
                              textTransform: isHead
                                ? ('uppercase' as const)
                                : ('none' as const),
                              background: isHead
                                ? `${moduleColor}0a`
                                : 'transparent',
                              verticalAlign: 'top',
                              whiteSpace: isHead ? 'nowrap' : 'normal',
                            }}
                          >
                            {parseInline(cell)}
                          </Tag>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
        continue
      }

      // Bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listKey = k++
        const items: string[] = []
        while (
          i < lines.length &&
          (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
        ) {
          const t = lines[i].trim()
          items.push(t.startsWith('- ') ? t.slice(2) : t.slice(2))
          i++
        }
        result.push(
          <ul
            key={listKey}
            style={{ margin: '0.4rem 0 0.85rem', paddingLeft: 0, listStyle: 'none' }}
          >
            {items.map((item, ii) => (
              <li
                key={ii}
                style={{
                  display: 'flex',
                  gap: '0.55rem',
                  alignItems: 'flex-start',
                  fontSize: '0.9rem',
                  lineHeight: '1.72',
                  color: 'var(--text-primary)',
                  marginBottom: '0.2rem',
                }}
              >
                <span
                  style={{
                    color: moduleColor,
                    flexShrink: 0,
                    marginTop: '0.18em',
                    fontSize: '0.75em',
                    opacity: 0.8,
                  }}
                >
                  ·
                </span>
                <span>{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        )
        continue
      }

      // Regular paragraph
      result.push(
        <p
          key={k++}
          style={{
            fontSize: '0.9rem',
            lineHeight: '1.78',
            color: 'var(--text-primary)',
            marginBottom: '0.55rem',
            fontFamily: 'var(--font-serif)',
          }}
        >
          {parseInline(trimmed)}
        </p>
      )
      i++
    }

    return result
  }, [content, moduleColor])

  if (!content.trim()) return null
  return <div>{elements}</div>
}
