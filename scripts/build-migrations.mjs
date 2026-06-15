/**
 * Gera supabase/all-migrations.sql idempotente:
 * - CREATE TABLE IF NOT EXISTS em todos
 * - CREATE INDEX IF NOT EXISTS em todos
 * - DROP POLICY IF EXISTS antes de cada CREATE POLICY
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '../supabase/migrations')
const OUTPUT = join(__dirname, '../supabase/all-migrations.sql')

function processSQL(sql) {
  // 1. CREATE TABLE sem IF NOT EXISTS
  sql = sql.replace(/CREATE TABLE (?!IF NOT EXISTS)(\S)/gi, 'CREATE TABLE IF NOT EXISTS $1')

  // 2. CREATE INDEX sem IF NOT EXISTS
  sql = sql.replace(/CREATE INDEX (?!IF NOT EXISTS)(\S)/gi, 'CREATE INDEX IF NOT EXISTS $1')
  sql = sql.replace(/CREATE UNIQUE INDEX (?!IF NOT EXISTS)(\S)/gi, 'CREATE UNIQUE INDEX IF NOT EXISTS $1')

  // 3. DROP POLICY IF EXISTS antes de cada CREATE POLICY
  // Captura: CREATE POLICY "nome" ON schema.tabela  (ou só tabela)
  sql = sql.replace(
    /CREATE POLICY ("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s+ON\s+([\w."]+)/gi,
    (match, policyName, table) => {
      return `DROP POLICY IF EXISTS ${policyName} ON ${table};\n${match}`
    }
  )

  return sql
}

// 002 é seed de teste (1000 usuários falsos) — nunca rodar em produção
const EXCLUDE = new Set(['002_seed_1000_users.sql'])

const files = readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql') && !EXCLUDE.has(f))
  .sort()

let output = '-- LAMPAS — All Migrations (idempotent)\n'
output += `-- Gerado em: ${new Date().toISOString()}\n\n`

for (const file of files) {
  const raw = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8')
  const processed = processSQL(raw)
  output += `-- ================================================================\n`
  output += `-- Migration: ${file}\n`
  output += `-- ================================================================\n`
  output += processed
  output += '\n\n'
}

writeFileSync(OUTPUT, output)
console.log(`Gerado: supabase/all-migrations.sql (${output.split('\n').length} linhas)`)
