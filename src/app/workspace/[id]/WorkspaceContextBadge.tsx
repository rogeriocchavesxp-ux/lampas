'use client'

import React from 'react'
import { useWorkspaceContext } from './WorkspaceContext'

export default function WorkspaceContextBadge() {
  const { project, activeSlug } = useWorkspaceContext()

  return (
    <span style={{
      marginLeft: '0.65rem',
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '6px',
      padding: '0.06rem 0.38rem',
      whiteSpace: 'nowrap',
    }}>
      {project.id.slice(0,8)} · {activeSlug}
    </span>
  )
}
