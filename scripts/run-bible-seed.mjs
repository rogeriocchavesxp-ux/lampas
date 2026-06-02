/**
 * Importa a ACF para o Supabase em lotes de 500 versículos.
 * Lê .env.local automaticamente.
 *
 * Uso:
 *   node scripts/run-bible-seed.mjs
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Lê .env.local manualmente (sem dotenv)
const env = {}
try {
  readFileSync(join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .forEach(line => {
      const [k, ...v] = line.split('=')
      if (k && v.length) env[k.trim()] = v.join('=').trim()
    })
} catch { /* sem .env.local */ }

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY  || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const SOURCE_URL = 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json'

const AT_ABBREVS = new Set([
  'gn','ex','lv','nm','dt','js','jz','rt',
  '1sm','2sm','1rs','2rs','1cr','2cr','ed','ne','et',
  'jó','sl','pv','ec','ct','is','jr','lm','ez','dn',
  'os','jl','am','ob','jn','mq','na','hc','sf','ag','zc','ml',
])

console.log('Baixando ACF...')
const res = await fetch(SOURCE_URL)
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const books = await res.json()
console.log(`${books.length} livros`)

const rows = []
for (const book of books) {
  const abbrev = book.abbrev.toLowerCase()
  const testament = AT_ABBREVS.has(abbrev) ? 'AT' : 'NT'
  for (let ci = 0; ci < book.chapters.length; ci++) {
    for (let vi = 0; vi < book.chapters[ci].length; vi++) {
      const text = book.chapters[ci][vi]
      if (!text) continue
      rows.push({ version: 'ACF', abbrev, book_name: book.name, testament, chapter: ci + 1, verse: vi + 1, text })
    }
  }
}
console.log(`${rows.length} versículos`)

// Inserir em lotes de 500
const BATCH = 500
let inserted = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH)
  const { error } = await supabase
    .from('bible_verses')
    .upsert(chunk, { onConflict: 'version,abbrev,chapter,verse', ignoreDuplicates: true })
  if (error) {
    console.error(`Erro no lote ${i}–${i + BATCH}:`, error.message)
    process.exit(1)
  }
  inserted += chunk.length
  process.stdout.write(`\r${inserted}/${rows.length}`)
}

console.log('\nConcluído.')
