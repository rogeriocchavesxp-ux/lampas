/**
 * Roda as migrations no novo projeto via Supabase Management API.
 * Não precisa de Docker nem SQL Editor.
 *
 * Uso: node scripts/run-migrations.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROJECT_REF     = process.env.SUPABASE_PROJECT_REF ?? 'pzfdbppxxrdfigqxykoz'
const ACCESS_TOKEN    = process.env.SUPABASE_ACCESS_TOKEN ?? ''
const MIGRATIONS_DIR  = join(__dirname, '../supabase/migrations')

// 002 é seed de teste — nunca rodar em produção
// 019 precisa rodar antes de 008_knowledge_hierarchy (dependência fora de ordem)
const CUSTOM_ORDER = [
  '001_initial_schema.sql',
  '003_billing.sql',
  '004_fix_plan_constraint.sql',
  '005_bible_verses.sql',
  '006_get_user_ai_status.sql',
  '007_admin_rpcs.sql',
  '019_knowledge_base.sql',       // precisa vir antes de 008_knowledge_hierarchy
  '008_knowledge_hierarchy.sql',
  '008_project_type.sql',
  '009_study_mode.sql',
  '010_lampas_dictionary.sql',
  '011_lampas_library.sql',
  '012_lampas_books.sql',
  '013_mercado_pago_billing.sql',
  '014_billing_status_guard.sql',
  '015_project_soft_delete.sql',
  '016_new_study_modes.sql',
  '017_narrativas_mode.sql',
  '018_demo_project.sql',
  '020_boletim.sql',
  '021_confessions_catechisms.sql',
  '022_editorial_hub.sql',
  '022_project_publishing.sql',
  '023_boletim_seo_fields.sql',
  '023_production_study_modes.sql',
  '024_estudo_termos_mode.sql',
  '025_agenda_ministerial.sql',
]

async function runSQL(sql, label = '') {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`${label}: HTTP ${res.status} — ${text}`)
  }
  return text
}

async function resetSchema() {
  process.stdout.write('Resetando schema public... ')
  await runSQL(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
    COMMENT ON SCHEMA public IS 'standard public schema';
  `, 'reset')
  console.log('ok\n')
}

async function runMigrations() {
  const files = CUSTOM_ORDER

  console.log(`Rodando ${files.length} migrations em ordem correta...\n`)

  for (const file of files) {
    process.stdout.write(`  ${file}... `)
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
    await runSQL(sql, file)
    console.log('ok')
  }

  console.log('\nMigrations concluídas.')
}

async function main() {
  try {
    await resetSchema()
    await runMigrations()
    console.log('\nBanco configurado no novo projeto.')
    console.log('Próximo passo: node scripts/import-data.mjs')
  } catch (e) {
    console.error('\nErro:', e.message)
    process.exit(1)
  }
}

main()
