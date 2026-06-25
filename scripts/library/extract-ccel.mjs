#!/usr/bin/env node
/**
 * extract-ccel.mjs — Baixa e parseia textos do CCEL, salva como JSON para import
 *
 * Uso:
 *   node scripts/library/extract-ccel.mjs --work easton_bible_dictionary
 *   node scripts/library/extract-ccel.mjs --all
 *   node scripts/library/extract-ccel.mjs --status
 */

import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..', '..')
const PROCESSED = join(ROOT, 'biblioteca', '_processed')

const args     = process.argv.slice(2)
const WORK_ARG = args.find(a => a.startsWith('--work='))?.split('=')[1]
  || (args.indexOf('--work') !== -1 ? args[args.indexOf('--work') + 1] : null)
const ALL      = args.includes('--all')
const STATUS   = args.includes('--status')

const DELAY = 1200
const UA    = 'Lampas-Library-Bot/1.0 (rogeriocchavesxp@gmail.com; theological research)'
const BASE  = 'https://ccel.org'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
  return res.text()
}

// ─── Catálogo de fontes CCEL (texto plano) ────────────────────────────────────
const SOURCES = {
  matthew_henry_mhc: [
    { vol: 1, url: '/ccel/h/henry/mhc1/cache/mhc1.txt', book_start: 'Genesis',   book_end: 'Deuteronomy' },
    { vol: 2, url: '/ccel/h/henry/mhc2/cache/mhc2.txt', book_start: 'Joshua',    book_end: 'Esther'      },
    { vol: 3, url: '/ccel/h/henry/mhc3/cache/mhc3.txt', book_start: 'Job',       book_end: 'Song of Solomon' },
    { vol: 4, url: '/ccel/h/henry/mhc4/cache/mhc4.txt', book_start: 'Isaiah',    book_end: 'Malachi'     },
    { vol: 5, url: '/ccel/h/henry/mhc5/cache/mhc5.txt', book_start: 'Matthew',   book_end: 'John'        },
    { vol: 6, url: '/ccel/h/henry/mhc6/cache/mhc6.txt', book_start: 'Acts',      book_end: 'Revelation'  },
  ],
  jfb_commentary: [
    { vol: 1, url: '/ccel/j/jamieson/jfb/cache/jfb.txt', book_start: 'Genesis', book_end: 'Revelation' },
  ],
  john_wesley_notes: [
    { vol: 3, url: '/ccel/w/wesley/notes/cache/notes.txt', book_start: 'Matthew', book_end: 'Revelation' },
  ],
  // treasury_of_david: CCEL marca como "Images Only" — sem texto disponível
  // Fonte alternativa: BlueLetter Bible / GraceGems (requer scraping futuro)
  martin_luther_galatians: [
    { vol: 1, url: '/ccel/l/luther/galatians/cache/galatians.txt', book_start: 'Galatians', book_end: 'Galatians' },
  ],
  easton_bible_dictionary: [
    { vol: 1, url: '/ccel/e/easton/ebd2/cache/ebd2.txt' },
  ],
  smith_bible_dictionary: [
    { vol: 1, url: '/ccel/s/smith_w/bibledict/cache/bibledict.txt' },
  ],
  albert_barnes_notes: [
    // ntnotes = bundle NT completo com texto real (Matthew-Revelation)
    { vol: 1, url: '/ccel/b/barnes/ntnotes/cache/ntnotes.txt', book_start: 'Matthew', book_end: 'Revelation' },
  ],
  calvin_commentaries: [
    { vol: 1,  url: '/ccel/c/calvin/calcom01/cache/calcom01.txt', book_start: 'Genesis',       book_end: 'Genesis'              },
    { vol: 2,  url: '/ccel/c/calvin/calcom03/cache/calcom03.txt', book_start: 'Exodus',        book_end: 'Numbers'              },
    { vol: 3,  url: '/ccel/c/calvin/calcom08/cache/calcom08.txt', book_start: 'Psalms',        book_end: 'Psalms'               },
    { vol: 4,  url: '/ccel/c/calvin/calcom13/cache/calcom13.txt', book_start: 'Isaiah',        book_end: 'Isaiah'               },
    { vol: 5,  url: '/ccel/c/calvin/calcom17/cache/calcom17.txt', book_start: 'Jeremiah',      book_end: 'Lamentations'         },
    { vol: 6,  url: '/ccel/c/calvin/calcom23/cache/calcom23.txt', book_start: 'Daniel',        book_end: 'Daniel'               },
    { vol: 7,  url: '/ccel/c/calvin/calcom26/cache/calcom26.txt', book_start: 'Hosea',         book_end: 'Malachi'              },
    { vol: 8,  url: '/ccel/c/calvin/calcom31/cache/calcom31.txt', book_start: 'Matthew',       book_end: 'Luke'                 },
    { vol: 9,  url: '/ccel/c/calvin/calcom34/cache/calcom34.txt', book_start: 'John',          book_end: 'John'                 },
    { vol: 10, url: '/ccel/c/calvin/calcom36/cache/calcom36.txt', book_start: 'Acts',          book_end: 'Acts'                 },
    { vol: 11, url: '/ccel/c/calvin/calcom38/cache/calcom38.txt', book_start: 'Romans',        book_end: 'Romans'               },
    { vol: 12, url: '/ccel/c/calvin/calcom39/cache/calcom39.txt', book_start: '1 Corinthians', book_end: '2 Corinthians'        },
    { vol: 13, url: '/ccel/c/calvin/calcom41/cache/calcom41.txt', book_start: 'Galatians',     book_end: 'Colossians'           },
    { vol: 14, url: '/ccel/c/calvin/calcom43/cache/calcom43.txt', book_start: '1 Thessalonians', book_end: 'Philemon'           },
    { vol: 15, url: '/ccel/c/calvin/calcom44/cache/calcom44.txt', book_start: 'Hebrews',       book_end: '1 John'               },
  ],
}

// ─── Livros bíblicos ─────────────────────────────────────────────────────────
const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
  'Ezra','Nehemiah','Esther','Job','Psalms','Psalm','Proverbs','Ecclesiastes',
  'Song of Solomon','Song of Songs','Isaiah','Jeremiah','Lamentations',
  'Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah',
  'Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts','Romans',
  '1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy',
  'Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation',
]

// Sorted longest first to avoid partial matches
const BOOKS_RE = new RegExp(
  `\\b(${BIBLE_BOOKS.slice().sort((a,b) => b.length - a.length).map(b => b.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\s+(\\d+):(\\d+)(?:[–\\-](\\d+))?`,
  'gi'
)

function extractBibleRefs(text) {
  const refs = []
  const re = new RegExp(BOOKS_RE.source, BOOKS_RE.flags)
  let m
  while ((m = re.exec(text)) !== null) {
    refs.push({
      bible_book: m[1],
      chapter:    parseInt(m[2]),
      verse:      parseInt(m[3]),
      verse_end:  m[4] ? parseInt(m[4]) : null,
      context:    text.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g,' ').trim()
    })
  }
  return refs
}

function detectPrimaryRef(text) {
  const re = new RegExp(BOOKS_RE.source, BOOKS_RE.flags)
  const m  = re.exec(text)
  if (!m) return {}
  return {
    bible_book:        m[1],
    bible_chapter:     parseInt(m[2]),
    bible_verse_start: parseInt(m[3]),
    bible_verse_end:   m[4] ? parseInt(m[4]) : null,
    bible_ref:         `${m[1]} ${m[2]}:${m[3]}${m[4] ? '-' + m[4] : ''}`
  }
}

// ─── Parser: DICIONÁRIO ───────────────────────────────────────────────────────
// Formato Easton's/Smith's:
//    EntryName
//           Content text...
//           More content...
//
//    NextEntry
//           ...
function parseDictionary(text) {
  const lines   = text.split('\n')
  const entries = []
  let heading   = null
  let content   = []
  let seq       = 0

  // Pula o bloco de metadados CCEL (antes da última linha separadora _____ no header)
  let contentStart = 0
  let lastSep = 0
  for (let i = 0; i < Math.min(80, lines.length); i++) {
    if (lines[i].match(/_{10,}/)) lastSep = i
  }
  if (lastSep > 0) contentStart = lastSep + 1

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i]
    // Linha de entrada: 2-5 espaços, começa com maiúscula, curta (nome do verbete)
    if (/^ {2,5}[A-Z][a-zA-Z0-9\s,''`\-]{0,60}$/.test(line) && line.trim().length > 1) {
      if (heading && content.join(' ').trim().length > 30) {
        const text = content.join(' ').replace(/\s+/g, ' ').trim()
        entries.push({
          heading:    heading.trim(),
          content:    text,
          sequence:   seq++,
          bible_refs: extractBibleRefs(text),
          ...detectPrimaryRef(text)
        })
      }
      heading = line.trim()
      content = []
    } else if (heading) {
      content.push(line.trim())
    }
  }
  // Última entrada
  if (heading && content.join(' ').trim().length > 30) {
    const text = content.join(' ').replace(/\s+/g, ' ').trim()
    entries.push({ heading: heading.trim(), content: text, sequence: seq, bible_refs: extractBibleRefs(text), ...detectPrimaryRef(text) })
  }

  return entries
}

// ─── Parser: COMENTÁRIO ───────────────────────────────────────────────────────
// Formato Matthew Henry, JFB, Wesley, Calvin, Luther, Barnes, Spurgeon:
// Seções separadas por linhas-título (sem indentação, começa com maiúscula, curta)
// seguidas de parágrafos de commentary
function parseCommentary(text) {
  const lines   = text.split('\n')
  const entries = []
  let heading   = null
  let content   = []
  let seq       = 0

  // Skip CCEL header block (primeiros ~30 linhas de metadados)
  let start = 0
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    if (lines[i].match(/_{10,}/) && i > 10) { start = i + 1; break }
  }

  const isHeading = (line) => {
    const t      = line.trim()
    const indent = line.length - line.trimStart().length
    return (
      t.length > 4 &&
      t.length < 120 &&
      /^[A-Z]/.test(t) &&        // começa com maiúscula
      indent <= 5 &&              // max 5 espaços de indentação (JFB usa 3)
      !/^\d+\s/.test(t) &&       // não começa com número de verso
      !t.startsWith('___')
    )
  }

  const flush = () => {
    if (!heading && content.length === 0) return
    const h   = heading || ''
    const txt = content.join(' ').replace(/\s+/g, ' ').trim()
    if (txt.length < 50) return
    const primary = detectPrimaryRef(h + ' ' + txt.slice(0, 200))
    entries.push({
      heading:           h || null,
      content:           txt,
      sequence:          seq++,
      bible_refs:        extractBibleRefs(txt),
      ...primary
    })
  }

  for (let i = start; i < lines.length; i++) {
    const line = lines[i]
    if (isHeading(line)) {
      flush()
      heading = line.trim()
      content = []
    } else {
      const t = line.trim()
      if (t) content.push(t)
    }
  }
  flush()

  return entries
}

// ─── Processa um volume ───────────────────────────────────────────────────────
async function processVolume(workId, vol) {
  const outDir  = join(PROCESSED, workId)
  const outFile = join(outDir, `vol_${String(vol.vol).padStart(2,'0')}.json`)
  mkdirSync(outDir, { recursive: true })

  if (existsSync(outFile)) {
    const existing = JSON.parse(readFileSync(outFile, 'utf-8'))
    if (existing.length > 0) {
      console.log(`    ✓ Vol ${vol.vol} já processado (${existing.length} entradas)`)
      return existing.length
    }
  }

  const url = BASE + vol.url
  console.log(`    ↓ Vol ${vol.vol}: ${url}`)

  let text
  try {
    text = await fetchText(url)
  } catch (e) {
    console.error(`    ✗ ${e.message}`)
    return 0
  }

  // Decide parser pelo tipo de obra
  const dictWorks = ['easton_bible_dictionary','smith_bible_dictionary','fausset_bible_dictionary','hitchcock_bible_names','nave_topical_bible']
  const entries = dictWorks.includes(workId) ? parseDictionary(text) : parseCommentary(text)

  writeFileSync(outFile, JSON.stringify(entries, null, 2))
  console.log(`    💾 ${entries.length} entradas → ${outFile.replace(ROOT, '.')}`)
  return entries.length
}

// ─── Status ───────────────────────────────────────────────────────────────────
function showStatus() {
  console.log('\n════ Status dos arquivos processados ════')
  let total = 0
  for (const [workId, vols] of Object.entries(SOURCES)) {
    const counts = vols.map(v => {
      const f = join(PROCESSED, workId, `vol_${String(v.vol).padStart(2,'0')}.json`)
      if (!existsSync(f)) return '—'
      const n = JSON.parse(readFileSync(f, 'utf-8')).length
      total += n
      return n
    })
    const done = counts.filter(c => c !== '—').length
    console.log(`  ${workId}: ${done}/${vols.length} vol | entradas: ${counts.filter(c=>c!=='—').reduce((a,b)=>a+(b||0),0)}`)
  }
  console.log(`\n  Total: ${total} entradas processadas`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const PRIORITY = [
  'easton_bible_dictionary',
  'smith_bible_dictionary',
  'john_wesley_notes',
  'martin_luther_galatians',
  'treasury_of_david',
  'jfb_commentary',
  'albert_barnes_notes',
  'matthew_henry_mhc',
  'calvin_commentaries',
]

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' Biblioteca Teológica Lampas — Extração CCEL (texto plano)')
  console.log('═══════════════════════════════════════════════════════════')

  if (STATUS) { showStatus(); return }

  let works = []
  if (WORK_ARG) {
    if (!SOURCES[WORK_ARG]) {
      console.error(`Obra não disponível: ${WORK_ARG}`)
      console.error('Disponíveis: ' + Object.keys(SOURCES).join(', '))
      process.exit(1)
    }
    works = [WORK_ARG]
  } else if (ALL) {
    works = PRIORITY
  } else {
    console.log(`
Uso:
  node scripts/library/extract-ccel.mjs --work <id>   # processa uma obra
  node scripts/library/extract-ccel.mjs --all          # processa tudo em ordem de prioridade
  node scripts/library/extract-ccel.mjs --status       # mostra o que já foi processado

Obras disponíveis:
${Object.keys(SOURCES).map(id => '  ' + id).join('\n')}
    `)
    return
  }

  let totalEntries = 0
  for (const workId of works) {
    console.log(`\n▶ ${workId}`)
    const vols = SOURCES[workId]
    for (const vol of vols) {
      const n = await processVolume(workId, vol)
      totalEntries += n
      await sleep(DELAY)
    }
  }

  console.log(`\n✓ Total: ${totalEntries} entradas extraídas.`)
}

main().catch(err => { console.error(err); process.exit(1) })
