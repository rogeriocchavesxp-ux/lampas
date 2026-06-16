export interface CardNav { id: string; title: string }

export interface SectionNav {
  slug: string
  title: string
  shortTitle: string
  phase?: 'preparar' | 'interpretar' | 'comunicar' | 'ferramentas'
  communicationMode?: 'sermao' | 'estudo_biblico' | 'devocional'
  module: 'inventio' | 'dispositio' | 'elocutio' | 'memoria' | 'pronuntiatio'
  group: string
  groupLabel: string
  order: number
  cards?: CardNav[]
  studyModes?: string[]
}
