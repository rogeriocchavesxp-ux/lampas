/**
 * Lampas — Import de dados para o novo projeto Supabase
 * Lê os arquivos JSON exportados e insere no novo banco.
 *
 * Uso: node scripts/import-data.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Credenciais do projeto NOVO ─────────────────────────────────────────────
// Preencher antes de rodar
const NOVO_SUPABASE_URL = 'https://pzfdbppxxrdfigqxykoz.supabase.co'
const NOVO_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZmRicHB4eHJkZmlncXh5a296Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA5MTM5MiwiZXhwIjoyMDk2NjY3MzkyfQ._OVTj-xxTGToEurhGWzu-U2T8nN6Oco5eiFR1JxKfbA'

// ── Ordem de import (respeitar FK dependencies) ────────────────────────────
// Tabelas sem FK vêm primeiro; as com FK vêm depois
const IMPORT_ORDER = [
  // seed — deve vir antes de qualquer tabela que referencie bible_verses
  'bible_verses',
  'profiles',
  // billing/uso (FK → profiles)
  'subscriptions',
  'ai_usage',
  'billing_payments',
  'billing_webhook_events',
  'billing_audit_logs',
  // projetos (FK → profiles)
  'projects',
  // conteúdo dos projetos (FK → projects)
  'sections',
  'ai_interactions',
  'bibliography',
  'exports',
  'footnotes',
  'structure_evaluations',
  // conteúdo interno (sem FK de usuário)
  'lampas_dictionary',
  'lampas_dictionary_versions',
  'lampas_query_aliases',
  'lampas_library',
  'lampas_books',
  'lampas_book_passages',
  'lampas_book_notes',
  // knowledge
  'knowledge_items',
  'knowledge_entities',
  'knowledge_item_entities',
  'knowledge_item_links',
  // boletim
  'boletim_entries',
  // confessional
  'lampas_confessional_documents',
  'lampas_confessional_sections',
  'lampas_confessional_questions',
  'lampas_confessional_dictionary_links',
  'lampas_confessional_doctrine_links',
  // editorial
  'editorial_channels',
  'editorial_publications',
  'editorial_series',
  'editorial_publication_series',
  // agenda
  'agenda_events',
  'agenda_sermons',
  'agenda_pastoral_care',
  'agenda_google_tokens',
  'agenda_sync_log',
]

const EXPORT_DIR = join(__dirname, '../supabase/export')
const CHUNK_SIZE = 500

const supabase = createClient(NOVO_SUPABASE_URL, NOVO_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function loadExport(table) {
  const filePath = join(EXPORT_DIR, `${table}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

async function importTable(table, rows) {
  if (rows.length === 0) {
    console.log(`  ${table}: sem dados — ignorado`)
    return
  }

  let inserted = 0
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)
    const { error } = await supabase
      .from(table)
      .insert(chunk)

    if (error) {
      // Tenta upsert se insert falhar por conflito de id
      if (error.code === '23505') {
        const { error: upsertError } = await supabase
          .from(table)
          .upsert(chunk, { onConflict: 'id', ignoreDuplicates: true })
        if (upsertError) {
          console.error(`  ✗ ${table} (chunk ${i}): ${upsertError.message}`)
          return
        }
      } else {
        console.error(`  ✗ ${table} (chunk ${i}): ${error.message}`)
        return
      }
    }
    inserted += chunk.length
  }

  console.log(`  ✓ ${table}: ${inserted} registros importados`)
}

async function main() {
  console.log(`Destino: ${NOVO_SUPABASE_URL}\n`)
  console.log('Iniciando import para o novo projeto...\n')

  for (const table of IMPORT_ORDER) {
    const rows = loadExport(table)
    await importTable(table, rows)
  }

  console.log('\nImport concluído.')
  console.log('IMPORTANTE: rode o SQL abaixo no SQL Editor para resetar as sequences:')
  console.log(`
SELECT setval(pg_get_serial_sequence('"bible_verses"', 'id'), MAX(id)) FROM bible_verses;
SELECT setval(pg_get_serial_sequence('"projects"', 'id'), MAX(id)) FROM projects WHERE id IS NOT NULL;
  `)
  console.log('Próximo passo: atualizar .env.local com as chaves do novo projeto.')
}

main().catch(e => {
  console.error('Erro fatal:', e.message)
  process.exit(1)
})
