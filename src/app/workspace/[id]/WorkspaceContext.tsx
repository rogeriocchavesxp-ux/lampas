'use client'

import { createContext, useContext, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Project, Section } from '@/types/database'

export interface WorkspaceContextValue {
  user: User
  project: Project
  activeSection: Section | undefined
  activeSlug: string
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({
  user,
  project,
  activeSection,
  activeSlug,
  children,
}: WorkspaceContextValue & { children: React.ReactNode }) {
  const value = useMemo(
    () => ({ user, project, activeSection, activeSlug }),
    [user, project, activeSection, activeSlug],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceProvider')
  }
  return context
}
