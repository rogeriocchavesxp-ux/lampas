// AUTO-GERADO por scripts/gen-sections-nav.mjs — não editar manualmente
// Contém apenas campos de navegação. Dados completos via /api/workspace/section/[slug]

import type { SectionNav } from './workspace-sections-nav-types'
import { NAV_BASE } from './workspace-sections-nav-base'
import { NAV_MODES } from './workspace-sections-nav-modes'
import { NAV_SPECIALIZED } from './workspace-sections-nav-specialized'

export type { CardNav, SectionNav } from './workspace-sections-nav-types'

export const WORKSPACE_SECTIONS_NAV: SectionNav[] = [
  ...NAV_BASE,
  ...NAV_MODES,
  ...NAV_SPECIALIZED,
]

export function getSectionNavBySlug(slug: string): SectionNav | undefined {
  return WORKSPACE_SECTIONS_NAV.find(s => s.slug === slug)
}

// Para grupos com variante por modo (studyModes), retorna a variante do modo se existir,
// senão a(s) seção(ões) genérica(s) do grupo (sem studyModes definido).
export function getSectionsByGroupNav(group: string, studyModeId?: string): SectionNav[] {
  const all = WORKSPACE_SECTIONS_NAV.filter(s => s.group === group)
  if (!studyModeId) return all
  const modeSpecific = all.filter(s => s.studyModes?.includes(studyModeId))
  if (modeSpecific.length > 0) return modeSpecific
  return all.filter(s => !s.studyModes)
}
