#!/usr/bin/env node
/**
 * reindex-refs.mjs — Re-detecta referências bíblicas nos JSONs já processados
 *                    e atualiza bible_book/chapter/verse/ref no banco.
 *
 * Uso:
 *   node scripts/library/reindex-refs.mjs             # re-indexa todos
 *   node scripts/library/reindex-refs.mjs --dry-run   # mostra stats sem gravar
 *   node scripts/library/reindex-refs.mjs --work jfb_commentary
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..', '..')
const PROCESSED = join(ROOT, 'biblioteca', '_processed')

function loadEnv() {
  const envPath = join(ROOT, '.env.local')
  if (existsSync(envPath)) {
    readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
      const [k, ...v] = line.trim().split('=')
      if (k && !k.startsWith('#')) process.env[k] = v.join('=').replace(/^["']|["']$/g, '')
    })
  }
}

loadEnv()
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const args   = process.argv.slice(2)
const DRY    = args.includes('--dry-run')
const WORK_ARG = args.find(a => a.startsWith('--work='))?.split('=')[1]
  || (args.indexOf('--work') !== -1 ? args[args.indexOf('--work') + 1] : null)

// ─── Mapeamento de referências bíblicas (mesmo do extrator) ───────────────────

const CANONICAL_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
  'Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes',
  'Song of Solomon','Isaiah','Jeremiah','Lamentations',
  'Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah',
  'Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts','Romans',
  '1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy',
  'Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation',
]

const BOOK_ALIASES = {
  'Psalm': 'Psalms', 'Song of Songs': 'Song of Solomon', 'Canticles': 'Song of Solomon',
  'Ge': 'Genesis',  'Gen': 'Genesis',
  'Ex': 'Exodus',   'Exo': 'Exodus',
  'Le': 'Leviticus','Lev': 'Leviticus',
  'Nu': 'Numbers',  'Num': 'Numbers',
  'De': 'Deuteronomy','Deu': 'Deuteronomy','Dt': 'Deuteronomy',
  'Jos': 'Joshua',  'Josh': 'Joshua',
  'Jud': 'Judges',  'Judg': 'Judges', 'Jdg': 'Judges',
  'Ru': 'Ruth',
  '1Sa': '1 Samuel','1Sam': '1 Samuel',
  '2Sa': '2 Samuel','2Sam': '2 Samuel',
  '1Ki': '1 Kings', '1Kin': '1 Kings', '1Kgs': '1 Kings',
  '2Ki': '2 Kings', '2Kin': '2 Kings', '2Kgs': '2 Kings',
  '1Ch': '1 Chronicles','1Chr': '1 Chronicles','1Chron': '1 Chronicles',
  '2Ch': '2 Chronicles','2Chr': '2 Chronicles','2Chron': '2 Chronicles',
  'Ezr': 'Ezra',
  'Ne': 'Nehemiah', 'Neh': 'Nehemiah',
  'Es': 'Esther',   'Est': 'Esther',
  'Ps': 'Psalms',   'Psa': 'Psalms',  'Psal': 'Psalms',
  'Pr': 'Proverbs', 'Pro': 'Proverbs','Prov': 'Proverbs',
  'Ec': 'Ecclesiastes','Ecc': 'Ecclesiastes','Eccl': 'Ecclesiastes',
  'So': 'Song of Solomon','Ca': 'Song of Solomon','Song': 'Song of Solomon',
  'Isa': 'Isaiah',
  'Jer': 'Jeremiah',
  'La': 'Lamentations','Lam': 'Lamentations',
  'Eze': 'Ezekiel', 'Ezek': 'Ezekiel',
  'Da': 'Daniel',   'Dan': 'Daniel',
  'Ho': 'Hosea',    'Hos': 'Hosea',
  'Joe': 'Joel',    'Jl': 'Joel',
  'Am': 'Amos',
  'Ob': 'Obadiah',  'Oba': 'Obadiah',
  'Jon': 'Jonah',
  'Mi': 'Micah',    'Mic': 'Micah',
  'Na': 'Nahum',    'Nah': 'Nahum',
  'Hab': 'Habakkuk',
  'Zep': 'Zephaniah','Zeph': 'Zephaniah',
  'Hag': 'Haggai',  'Hg': 'Haggai',
  'Zec': 'Zechariah','Zech': 'Zechariah',
  'Mal': 'Malachi',
  'Mt': 'Matthew',  'Matt': 'Matthew',
  'Mk': 'Mark',     'Mr': 'Mark',
  'Lk': 'Luke',
  'Joh': 'John',    'Jn': 'John',
  'Ac': 'Acts',     'Act': 'Acts',
  'Ro': 'Romans',   'Rom': 'Romans',
  '1Co': '1 Corinthians','1Cor': '1 Corinthians',
  '2Co': '2 Corinthians','2Cor': '2 Corinthians',
  'Ga': 'Galatians','Gal': 'Galatians',
  'Ep': 'Ephesians','Eph': 'Ephesians',
  'Ph': 'Philippians','Php': 'Philippians','Phil': 'Philippians',
  'Col': 'Colossians',
  '1Th': '1 Thessalonians','1Thess': '1 Thessalonians',
  '2Th': '2 Thessalonians','2Thess': '2 Thessalonians',
  '1Ti': '1 Timothy','1Tim': '1 Timothy',
  '2Ti': '2 Timothy','2Tim': '2 Timothy',
  'Tit': 'Titus',
  'Phm': 'Philemon','Phile': 'Philemon',
  'Heb': 'Hebrews',
  'Jas': 'James',
  '1Pe': '1 Peter', '1Pet': '1 Peter',
  '2Pe': '2 Peter', '2Pet': '2 Peter',
  '1Jo': '1 John',  '1Jn': '1 John',  '1John': '1 John',
  '2Jo': '2 John',  '2Jn': '2 John',  '2John': '2 John',
  '3Jo': '3 John',  '3Jn': '3 John',  '3John': '3 John',
  'Re': 'Revelation','Rev': 'Revelation',
}

function normalizeBook(raw) {
  return BOOK_ALIASES[raw] ?? (CANONICAL_BOOKS.includes(raw) ? raw : null)
}

const ALL_FORMS = [
  ...CANONICAL_BOOKS,
  'Psalm','Song of Songs','Canticles',
  ...Object.keys(BOOK_ALIASES),
].sort((a, b) => b.length - a.length)

const BOOKS_RE = new RegExp(
  `\\b(${ALL_FORMS.map(b => b.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\s+(\\d+)[:.](\\d+)(?:[–\\-](\\d+))?`,
  'gi'
)

function detectPrimaryRef(text) {
  const re = new RegExp(BOOKS_RE.source, BOOKS_RE.flags)
  const m  = re.exec(text)
  if (!m) return null
  const book = normalizeBook(m[1])
  if (!book) return null
  return {
    bible_book:        book,
    bible_chapter:     parseInt(m[2]),
    bible_verse_start: parseInt(m[3]),
    bible_verse_end:   m[4] ? parseInt(m[4]) : null,
    bible_ref:         `${book} ${m[2]}:${m[3]}${m[4] ? '-' + m[4] : ''}`,
  }
}

// ─── Carrega obra do banco pelo work_id ────────────────────────────────────────

async function getWorkVolumes(workDir) {
  // workDir é o nome da pasta = work_id do catalog
  const catalog = JSON.parse(readFileSync(join(__dirname, 'catalog.json'), 'utf-8'))
  const catWork = catalog.works.find(w => w.id === workDir)
  if (!catWork) throw new Error(`Work "${workDir}" não encontrado no catalog.json`)

  const { data: workDb } = await supabase
    .from('lib_works').select('id,title')
    .ilike('title', `%${catWork.title}%`).limit(1).single()
  if (!workDb) throw new Error(`Obra "${catWork.title}" não encontrada no banco`)

  const { data: volumes } = await supabase
    .from('lib_volumes').select('id,volume_number')
    .eq('work_id', workDb.id).order('volume_number')

  return { workDb, volumes }
}

// ─── Re-indexa um diretório de obra ───────────────────────────────────────────

async function reindexWork(workDir) {
  const dir = join(PROCESSED, workDir)
  if (!existsSync(dir)) { console.log(`  ⚠ ${workDir}: sem pasta processada`); return }

  const files = readdirSync(dir).filter(f => f.match(/^vol_\d+\.json$/)).sort()
  if (files.length === 0) { console.log(`  ⚠ ${workDir}: sem arquivos JSON`); return }

  let { workDb, volumes } = await getWorkVolumes(workDir)
  console.log(`\n▶ ${workDb.title}`)

  for (const file of files) {
    const volNum  = parseInt(file.match(/\d+/)[0])
    const volume  = volumes.find(v => v.volume_number === volNum)
    if (!volume) { console.log(`  ⚠ vol_${volNum}: sem volume no banco`); continue }

    const entries = JSON.parse(readFileSync(join(dir, file), 'utf-8'))

    // Busca entradas do banco para este volume (em batches de 1000)
    const { count } = await supabase
      .from('lib_entries').select('*', { count: 'exact', head: true })
      .eq('volume_id', volume.id)

    console.log(`  Vol ${volNum}: ${count} entradas no banco | ${entries.length} no JSON`)

    let updated = 0
    let skipped = 0
    let noRef   = 0

    // Busca entradas do banco em blocos de 500 ordenadas por sequence
    const PAGE = 500
    for (let page = 0; page * PAGE < count; page++) {
      const { data: dbRows } = await supabase
        .from('lib_entries')
        .select('id, heading, content, bible_book, sequence')
        .eq('volume_id', volume.id)
        .order('sequence')
        .range(page * PAGE, (page + 1) * PAGE - 1)

      if (!dbRows?.length) break

      const toUpdate = []
      for (const row of dbRows) {
        const search = (row.heading || '') + ' ' + (row.content || '').slice(0, 200)
        const ref = detectPrimaryRef(search)

        if (!ref) { noRef++; continue }

        // Só atualiza se mudou
        if (ref.bible_book === row.bible_book) { skipped++; continue }

        toUpdate.push({ id: row.id, ...ref })
      }

      if (toUpdate.length > 0 && !DRY) {
        // Atualiza em lote via upsert
        for (const row of toUpdate) {
          await supabase.from('lib_entries').update({
            bible_book:        row.bible_book,
            bible_chapter:     row.bible_chapter,
            bible_verse_start: row.bible_verse_start,
            bible_verse_end:   row.bible_verse_end,
            bible_ref:         row.bible_ref,
          }).eq('id', row.id)
        }
      }

      updated += toUpdate.length
      process.stdout.write(`\r    pág ${page + 1}: ${updated} atualizadas, ${skipped} sem mudança, ${noRef} sem ref...`)
    }

    console.log(`\n    ✓ ${updated} atualizadas, ${skipped} sem mudança, ${noRef} sem ref bíblica`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log(' Re-indexação de Referências Bíblicas — Lampas Library')
  if (DRY) console.log(' [DRY-RUN: sem gravação no banco]')
  console.log('═══════════════════════════════════════════════════════════')

  // Apenas comentários (dicionários não precisam — as refs já estão no content)
  const COMMENTARY_WORKS = [
    'matthew_henry_mhc',
    'jfb_commentary',
    'john_wesley_notes',
    'martin_luther_galatians',
    'albert_barnes_notes',
    'calvin_commentaries',
  ]

  const works = WORK_ARG ? [WORK_ARG] : COMMENTARY_WORKS

  for (const w of works) {
    try {
      await reindexWork(w)
    } catch (e) {
      console.error(`  ✗ ${w}: ${e.message}`)
    }
  }

  console.log('\n✓ Re-indexação concluída.')
}

main().catch(err => { console.error(err); process.exit(1) })
