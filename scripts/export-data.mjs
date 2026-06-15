/**
 * Lampas — Export de dados do projeto antigo (Supabase)
 * Exporta todas as tabelas do schema public para arquivos JSON.
 *
 * Uso: node scripts/export-data.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Credenciais do projeto ANTIGO ──────────────────────────────────────────
const SUPABASE_URL = 'https://mioraguwwwtfvwcbyeaw.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pb3JhZ3V3d3d0ZnZ3Y2J5ZWF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY5MzE1OSwiZXhwIjoyMDk1MjY5MTU5fQ.8MXiFThCy88WoueG6ADtOIU6R2IJ9J6s0laKeseZj_M'

// ── Tabelas com dados de usuários — exportar ───────────────────────────────
// bible_verses é seed data (31k rows) — NÃO exportar, será rerodado via seed
const TABLES = [
  // Core
  'profiles',
  'projects',
  'sections',
  'ai_interactions',
  'bibliography',
  'exports',
  'footnotes',
  'structure_evaluations',
  // Billing
  'subscriptions',
  'ai_usage',
  'billing_payments',
  'billing_webhook_events',
  'billing_audit_logs',
  // Conteúdo interno
  'lampas_dictionary',
  'lampas_dictionary_versions',
  'lampas_query_aliases',
  'lampas_library',
  'lampas_books',
  'lampas_book_passages',
  'lampas_book_notes',
  // Knowledge
  'knowledge_items',
  'knowledge_entities',
  'knowledge_item_entities',
  'knowledge_item_links',
  // Boletim
  'boletim_entries',
  // Confessional
  'lampas_confessional_documents',
  'lampas_confessional_sections',
  'lampas_confessional_questions',
  'lampas_confessional_dictionary_links',
  'lampas_confessional_doctrine_links',
  // Editorial
  'editorial_channels',
  'editorial_publications',
  'editorial_series',
  'editorial_publication_series',
  // Agenda
  'agenda_events',
  'agenda_sermons',
  'agenda_pastoral_care',
  'agenda_google_tokens',
  'agenda_sync_log',
]

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const OUTPUT_DIR = join(__dirname, '../supabase/export')
mkdirSync(OUTPUT_DIR, { recursive: true })

async function exportTable(tableName) {
  const rows = []
  const PAGE_SIZE = 1000
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.warn(`  ⚠ ${tableName}: ${error.message}`)
      return null
    }

    rows.push(...data)
    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  return rows
}

async function main() {
  console.log('Conectando ao projeto antigo...\n')

  const tables = TABLES
  console.log(`Tabelas a exportar: ${tables.length}\n`)

  const manifest = { exportedAt: new Date().toISOString(), tables: [] }

  for (const table of tables) {
    process.stdout.write(`  Exportando ${table}... `)
    const rows = await exportTable(table)

    if (rows === null) {
      console.log('ERRO (ignorado)')
      continue
    }

    const filePath = join(OUTPUT_DIR, `${table}.json`)
    writeFileSync(filePath, JSON.stringify(rows, null, 2))
    console.log(`${rows.length} registros`)
    manifest.tables.push({ table, rows: rows.length, file: `${table}.json` })
  }

  writeFileSync(join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

  console.log(`\nExport concluído → supabase/export/`)
  console.log(`Manifesto salvo em supabase/export/manifest.json`)
}

main().catch(e => {
  console.error('Erro fatal:', e.message)
  process.exit(1)
})
