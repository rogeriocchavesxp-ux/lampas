/**
 * Baixa o texto da ACF (Almeida Corrigida Fiel — domínio público) do dataset
 * thiagobodruk/biblia e gera um arquivo SQL de seed para o Supabase.
 *
 * Uso:
 *   node scripts/seed-bible-acf.mjs
 *
 * Saída:
 *   supabase/seed/bible_acf.sql
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE_URL = 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json'

const AT_ABBREVS = new Set([
  'gn','ex','lv','nm','dt','js','jz','rt',
  '1sm','2sm','1rs','2rs','1cr','2cr','ed','ne','et',
  'jó','sl','pv','ec','ct','is','jr','lm','ez','dn',
  'os','jl','am','ob','jn','mq','na','hc','sf','ag','zc','ml',
])

function testament(abbrev) {
  return AT_ABBREVS.has(abbrev.toLowerCase()) ? 'AT' : 'NT'
}

function escape(str) {
  return str.replace(/'/g, "''")
}

console.log('Baixando ACF de', SOURCE_URL)

const response = await fetch(SOURCE_URL)
if (!response.ok) throw new Error(`HTTP ${response.status}`)

const books = await response.json()
console.log(`${books.length} livros recebidos`)

const rows = []
for (const book of books) {
  const abbrev = book.abbrev.toLowerCase()
  const test = testament(abbrev)
  for (let ci = 0; ci < book.chapters.length; ci++) {
    const chapter = ci + 1
    for (let vi = 0; vi < book.chapters[ci].length; vi++) {
      const verse = vi + 1
      const text = book.chapters[ci][vi]
      if (!text) continue
      rows.push(`('ACF','${abbrev}','${escape(book.name)}','${test}',${chapter},${verse},'${escape(text)}')`)
    }
  }
}

console.log(`${rows.length} versículos`)

// Gera em blocos de 1000 para evitar queries gigantes
const CHUNK = 1000
const chunks = []
for (let i = 0; i < rows.length; i += CHUNK) {
  chunks.push(rows.slice(i, i + CHUNK))
}

const header = `-- ACF (Almeida Corrigida Fiel) — domínio público
-- Gerado por scripts/seed-bible-acf.mjs em ${new Date().toISOString()}
-- ${rows.length} versículos, ${books.length} livros

`

const inserts = chunks.map(chunk =>
  `INSERT INTO public.bible_verses (version, abbrev, book_name, testament, chapter, verse, text) VALUES\n` +
  chunk.join(',\n') +
  `\nON CONFLICT (version, abbrev, chapter, verse) DO NOTHING;\n`
).join('\n')

const outDir = join(__dirname, '..', 'supabase', 'seed')
mkdirSync(outDir, { recursive: true })
const outFile = join(outDir, 'bible_acf.sql')
writeFileSync(outFile, header + inserts, 'utf8')

console.log(`Gravado em ${outFile}`)
