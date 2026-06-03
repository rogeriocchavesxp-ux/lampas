/**
 * Gera workspace-sections-nav.ts com apenas os campos de navegação.
 * Esses campos são os únicos necessários no bundle do cliente para renderizar
 * a sidebar. Os dados completos (cards, aiTrigger, objective, etc.) ficam
 * server-only e são servidos sob demanda via /api/workspace/section/[slug].
 *
 * Uso:
 *   node scripts/gen-sections-nav.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Importa transpilando com esbuild em memória
const esbuild = await import('esbuild')

// Bundle workspace-sections para CJS temporário
const result = await esbuild.build({
  entryPoints: [join(ROOT, 'src/lib/workspace-sections.ts')],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  write: false,
  external: [],
  alias: {
    '@/lib/prepare-sections': join(ROOT, 'src/lib/prepare-sections.ts'),
    '@/lib/communication-sections': join(ROOT, 'src/lib/communication-sections.ts'),
  },
})

const code = result.outputFiles[0].text

// Executa o bundle em memória
const m = { exports: {} }
const fn = new Function('module', 'exports', 'require', code)
fn(m, m.exports, createRequire(import.meta.url))

const { WORKSPACE_SECTIONS } = m.exports

if (!WORKSPACE_SECTIONS?.length) {
  console.error('WORKSPACE_SECTIONS vazio ou não encontrado')
  process.exit(1)
}

const NAV_FIELDS = ['slug', 'title', 'shortTitle', 'phase', 'communicationMode', 'module', 'group', 'groupLabel', 'order']

const navSections = WORKSPACE_SECTIONS.map(s =>
  Object.fromEntries(NAV_FIELDS.filter(f => s[f] !== undefined).map(f => [f, s[f]]))
)

const lines = [
  '// AUTO-GERADO por scripts/gen-sections-nav.mjs — não editar manualmente',
  '// Contém apenas campos de navegação. Dados completos via /api/workspace/section/[slug]',
  '',
  'export interface SectionNav {',
  '  slug: string',
  "  title: string",
  "  shortTitle: string",
  "  phase?: 'preparar' | 'interpretar' | 'comunicar'",
  "  communicationMode?: 'sermao' | 'estudo_biblico' | 'devocional'",
  "  module: 'inventio' | 'dispositio' | 'elocutio' | 'memoria' | 'pronuntiatio'",
  '  group: string',
  '  groupLabel: string',
  '  order: number',
  '}',
  '',
  `export const WORKSPACE_SECTIONS_NAV: SectionNav[] = ${JSON.stringify(navSections, null, 2)}`,
  '',
  'export function getSectionNavBySlug(slug: string): SectionNav | undefined {',
  '  return WORKSPACE_SECTIONS_NAV.find(s => s.slug === slug)',
  '}',
  '',
  'export function getSectionsByGroupNav(group: string): SectionNav[] {',
  '  return WORKSPACE_SECTIONS_NAV.filter(s => s.group === group)',
  '}',
]

const outPath = join(ROOT, 'src/lib/workspace-sections-nav.ts')
writeFileSync(outPath, lines.join('\n') + '\n')
console.log(`Gravado: ${outPath} (${navSections.length} seções)`)
