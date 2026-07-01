#!/usr/bin/env node
/**
 * fix-refs.mjs — Corrige referências bíblicas nos comentários da biblioteca
 *
 * Estratégias:
 *  - JFB: section headers "Ge 1:1, 2. The Creation" → forward-fill nas entradas seguintes
 *  - Calvin/Barnes: chapter headings "CHAPTER 2." + volume book_start → forward-fill
 *  - Wesley: Roman numeral chapter headings + book-name tracking
 *  - Luther Galatians: todo o volume = Galatians, chapter from heading
 *  - Matthew Henry: re-fetch CCEL text e parsear por seções com verse tracking
 *
 * Uso:
 *   node scripts/library/fix-refs.mjs                    # todos
 *   node scripts/library/fix-refs.mjs --work jfb         # apenas JFB
 *   node scripts/library/fix-refs.mjs --dry-run          # sem gravação
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

function loadEnv() {
  const p = join(ROOT, '.env.local')
  if (existsSync(p)) {
    readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const [k, ...v] = line.trim().split('=')
      if (k && !k.startsWith('#')) process.env[k] = v.join('=').replace(/^["']|["']$/g, '')
    })
  }
}
loadEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const WORK = args.find(a => a.startsWith('--work='))?.split('=')[1]
  || (args.indexOf('--work') !== -1 ? args[args.indexOf('--work') + 1] : null)

// ── Mapeamento livros ─────────────────────────────────────────────────────────

const BOOK_ABBREV = {
  'Ge': 'Genesis', 'Ex': 'Exodus', 'Le': 'Leviticus', 'Nu': 'Numbers',
  'De': 'Deuteronomy', 'Jos': 'Joshua', 'Jud': 'Judges', 'Ru': 'Ruth',
  '1Sa': '1 Samuel', '2Sa': '2 Samuel', '1Ki': '1 Kings', '2Ki': '2 Kings',
  '1Ch': '1 Chronicles', '2Ch': '2 Chronicles', 'Ezr': 'Ezra', 'Ne': 'Nehemiah',
  'Es': 'Esther', 'Job': 'Job', 'Ps': 'Psalms', 'Pr': 'Proverbs',
  'Ec': 'Ecclesiastes', 'So': 'Song of Solomon', 'Isa': 'Isaiah',
  'Jer': 'Jeremiah', 'La': 'Lamentations', 'Eze': 'Ezekiel', 'Da': 'Daniel',
  'Ho': 'Hosea', 'Joe': 'Joel', 'Am': 'Amos', 'Ob': 'Obadiah', 'Jon': 'Jonah',
  'Mi': 'Micah', 'Na': 'Nahum', 'Hab': 'Habakkuk', 'Zep': 'Zephaniah',
  'Hag': 'Haggai', 'Zec': 'Zechariah', 'Mal': 'Malachi',
  'Mt': 'Matthew', 'Mr': 'Mark', 'Lu': 'Luke', 'Joh': 'John', 'Ac': 'Acts',
  'Ro': 'Romans', '1Co': '1 Corinthians', '2Co': '2 Corinthians',
  'Ga': 'Galatians', 'Eph': 'Ephesians', 'Ph': 'Philippians', 'Col': 'Colossians',
  '1Th': '1 Thessalonians', '2Th': '2 Thessalonians', '1Ti': '1 Timothy',
  '2Ti': '2 Timothy', 'Tit': 'Titus', 'Phm': 'Philemon', 'Heb': 'Hebrews',
  'Jas': 'James', '1Pe': '1 Peter', '2Pe': '2 Peter', '1Jo': '1 John',
  '2Jo': '2 John', '3Jo': '3 John', 'Jude': 'Jude', 'Re': 'Revelation',
}

const BOOK_NAMES_EN = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
  'Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes',
  'Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel',
  'Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk',
  'Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts','Romans',
  '1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians',
  'Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy',
  'Titus','Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation',
]

// Roman numeral converter
function romanToInt(s) {
  const val = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 }
  let n = 0; let i = s.toUpperCase().length - 1
  let prev = 0
  for (const c of s.toUpperCase().split('').reverse()) {
    const v = val[c] ?? 0
    if (v < prev) n -= v; else n += v
    prev = v
  }
  return n || null
}

// JFB section header regex: starts with book abbrev + ch:vs
const JFB_HEADER_RE = new RegExp(
  '^(' + Object.keys(BOOK_ABBREV).sort((a,b)=>b.length-a.length).join('|') + ')\\s+(\\d+)[:.](\\d+)'
)

function parseJFBHeader(heading) {
  const m = JFB_HEADER_RE.exec(heading || '')
  if (!m) return null
  const book = BOOK_ABBREV[m[1]]
  if (!book) return null
  const ch = parseInt(m[2])
  const vs = parseInt(m[3])
  return { bible_book: book, bible_chapter: ch, bible_verse_start: vs, bible_ref: `${book} ${ch}:${vs}` }
}

// ── Batch update DB ───────────────────────────────────────────────────────────

async function applyUpdates(updates) {
  if (DRY || !updates.length) return
  // Process in batches of 200
  for (let i = 0; i < updates.length; i += 200) {
    const batch = updates.slice(i, i + 200)
    await Promise.all(batch.map(u =>
      supabase.from('lib_entries').update({
        bible_book:        u.bible_book,
        bible_chapter:     u.bible_chapter,
        bible_verse_start: u.bible_verse_start ?? null,
        bible_verse_end:   u.bible_verse_end ?? null,
        bible_ref:         u.bible_ref,
      }).eq('id', u.id)
    ))
    process.stdout.write(`\r  ${Math.min(i + 200, updates.length)}/${updates.length}...`)
  }
  process.stdout.write('\n')
}

// ── Get entries for a volume (in sequence order, all pages) ──────────────────

async function getVolumeEntries(volumeId) {
  const all = []
  const PAGE = 500
  const { count } = await supabase.from('lib_entries')
    .select('*', { count: 'exact', head: true }).eq('volume_id', volumeId)
  for (let i = 0; i * PAGE < (count ?? 0); i++) {
    const { data } = await supabase.from('lib_entries')
      .select('id, heading, content, bible_book, bible_chapter, bible_verse_start, bible_ref, sequence')
      .eq('volume_id', volumeId)
      .order('sequence')
      .range(i * PAGE, (i + 1) * PAGE - 1)
    if (data) all.push(...data)
  }
  return all
}

// ── Fix JFB ───────────────────────────────────────────────────────────────────

async function fixJFB(workId) {
  console.log('\n▶ JFB — forward-fill from section headers')
  const { data: vols } = await supabase.from('lib_volumes')
    .select('id, volume_number, bible_book_start').eq('work_id', workId)

  for (const vol of (vols || [])) {
    const entries = await getVolumeEntries(vol.id)
    console.log(`  Vol ${vol.volume_number}: ${entries.length} entradas`)

    let currentRef = null
    const updates = []

    for (const entry of entries) {
      const h = entry.heading || ''
      const headerRef = parseJFBHeader(h)

      if (headerRef) {
        // This IS a section header — update current ref
        currentRef = headerRef
        // If the existing bible_ref doesn't match, update it
        if (entry.bible_ref !== headerRef.bible_ref) {
          updates.push({ id: entry.id, ...headerRef })
        }
      } else if (currentRef && !entry.bible_book) {
        // Continuation entry without ref — forward-fill
        updates.push({ id: entry.id, ...currentRef })
      } else if (currentRef && entry.bible_book && entry.bible_ref) {
        // Has a ref but might be a cross-ref (not a section header) — override with currentRef
        // Only if heading doesn't look like a section header at all
        if (!JFB_HEADER_RE.test(h)) {
          updates.push({ id: entry.id, ...currentRef })
        }
      } else if (currentRef && entry.bible_book && !entry.bible_ref) {
        updates.push({ id: entry.id, ...currentRef })
      }
    }

    console.log(`    ${updates.length} entradas a atualizar`)
    await applyUpdates(updates)
  }
}

// ── Fix Calvin (chapter headings + forward-fill per volume) ──────────────────

async function fixCalvin(workId) {
  console.log('\n▶ Calvin — chapter headings + forward-fill')
  const { data: vols } = await supabase.from('lib_volumes')
    .select('id, volume_number, bible_book_start, bible_book_end').eq('work_id', workId).order('volume_number')

  for (const vol of (vols || [])) {
    const book = vol.bible_book_start
    if (!book) continue
    const entries = await getVolumeEntries(vol.id)
    console.log(`  Vol ${vol.volume_number} [${book}]: ${entries.length} entradas`)

    let curChapter = 1
    let curVerse = 1
    let curRef = null
    const updates = []

    // Some Calvin volumes use "Exodus 1:1-7" as section headings instead of "CHAPTER N."
    // Pre-scan to detect which format this volume uses
    const hasChapterHeadings = entries.some(e =>
      /^(?:CHAP(?:TER)?\.?\s+)([IVXLCDM]+|\d+)\.?$/i.test(e.heading || '')
    )
    const useDirectRefHeadings = !hasChapterHeadings

    for (const entry of entries) {
      const h = (entry.heading || '').trim()

      // Direct verse reference heading: "Exodus 1:1-7", "Psalm 1:1-2", "Luke 1:1-4"
      // Only applied for volumes that DON'T use "CHAPTER N." style headings
      if (useDirectRefHeadings) {
        const drM = h.match(/^(.+?)\s+(\d+):(\d+)(?:[-–](\d+))?\s*$/)
        if (drM) {
          let bkName = BOOK_NAMES_EN.find(b => b.toLowerCase() === drM[1].toLowerCase())
          if (!bkName && drM[1].toLowerCase() === 'psalm') bkName = 'Psalms'
          if (bkName) {
            curChapter = parseInt(drM[2])
            curVerse = parseInt(drM[3])
            const vsEnd = drM[4] ? parseInt(drM[4]) : null
            curRef = {
              bible_book: bkName, bible_chapter: curChapter,
              bible_verse_start: curVerse, bible_verse_end: vsEnd,
              bible_ref: `${bkName} ${drM[2]}:${drM[3]}${drM[4] ? '-' + drM[4] : ''}`,
            }
            continue  // this entry is the section header — preserve its existing ref
          }
        }
      }

      // Chapter heading: "CHAPTER 2." "Chapter II." "CHAP. III."
      const chRoman = h.match(/^(?:CHAP(?:TER)?\.?\s+)([IVXLCDM]+)\.?$/i)
      const chArab  = h.match(/^(?:CHAP(?:TER)?\.?\s+)(\d+)\.?$/i)
      if (chRoman) {
        curChapter = romanToInt(chRoman[1]) ?? curChapter
        curVerse = 1
        curRef = { bible_book: book, bible_chapter: curChapter, bible_verse_start: 1, bible_ref: `${book} ${curChapter}:1` }
      } else if (chArab) {
        curChapter = parseInt(chArab[1])
        curVerse = 1
        curRef = { bible_book: book, bible_chapter: curChapter, bible_verse_start: 1, bible_ref: `${book} ${curChapter}:1` }
      } else {
        // Verse heading: "Verse 1." "Verses 1-3." "1-5." or "ver. 1, 2"
        const vsM = h.match(/^(?:vers(?:es?)?\.?\s+)?(\d+)[-–,]?\s*(\d*)\.?$/i)
        if (vsM) {
          const vs = parseInt(vsM[1])
          const vsEnd = vsM[2] ? parseInt(vsM[2]) : null
          curVerse = vs
          curRef = {
            bible_book: book, bible_chapter: curChapter,
            bible_verse_start: vs, bible_verse_end: vsEnd ?? null,
            bible_ref: `${book} ${curChapter}:${vs}${vsEnd ? '-' + vsEnd : ''}`,
          }
        }
      }

      if (curRef && !entry.bible_book) {
        updates.push({ id: entry.id, ...curRef })
      } else if (curRef && entry.bible_book && entry.bible_ref !== curRef.bible_ref) {
        // Override cross-refs
        updates.push({ id: entry.id, ...curRef })
      }
    }

    console.log(`    ${updates.length} entradas a atualizar`)
    await applyUpdates(updates)
  }
}

// ── Fix Barnes ────────────────────────────────────────────────────────────────

async function fixBarnes(workId) {
  console.log('\n▶ Barnes — chapter/verse headings + forward-fill')
  const { data: vols } = await supabase.from('lib_volumes')
    .select('id, volume_number, bible_book_start, bible_book_end').eq('work_id', workId).order('volume_number')

  for (const vol of (vols || [])) {
    const book = vol.bible_book_start
    if (!book) continue
    const entries = await getVolumeEntries(vol.id)
    console.log(`  Vol ${vol.volume_number} [${book}]: ${entries.length} entradas`)

    let curChapter = 1
    let curRef = null
    const updates = []

    for (const entry of entries) {
      const h = (entry.heading || '').trim()

      // Chapter heading
      const chArab  = h.match(/^(?:CHAPTER|Chapter|CHAP\.?)\s+(\d+)/i)
      const chRoman = h.match(/^(?:CHAPTER|Chapter|CHAP\.?)\s+([IVXLCDM]+)\.?$/i)
      if (chArab) {
        curChapter = parseInt(chArab[1])
        curRef = { bible_book: book, bible_chapter: curChapter, bible_verse_start: 1, bible_ref: `${book} ${curChapter}:1` }
      } else if (chRoman) {
        curChapter = romanToInt(chRoman[1]) ?? curChapter
        curRef = { bible_book: book, bible_chapter: curChapter, bible_verse_start: 1, bible_ref: `${book} ${curChapter}:1` }
      }

      // Verse heading: "Verse 1." "Verses 2-16." "Ver. 3." etc.
      const vsM = h.match(/^(?:Verse|Verses|Ver\.?)\s+(\d+)(?:[-–,]\s*(\d+))?\.?/i)
      if (vsM) {
        const vs = parseInt(vsM[1])
        const vsEnd = vsM[2] ? parseInt(vsM[2]) : null
        curRef = {
          bible_book: book, bible_chapter: curChapter,
          bible_verse_start: vs, bible_verse_end: vsEnd,
          bible_ref: `${book} ${curChapter}:${vs}${vsEnd ? '-' + vsEnd : ''}`,
        }
      }

      if (curRef && !entry.bible_book) {
        updates.push({ id: entry.id, ...curRef })
      } else if (curRef && entry.bible_book) {
        // Check if existing ref is in the right book — if not, override
        if (entry.bible_book !== book) {
          updates.push({ id: entry.id, ...curRef })
        }
      }
    }

    console.log(`    ${updates.length} entradas a atualizar`)
    await applyUpdates(updates)
  }
}

// ── Fix Wesley ────────────────────────────────────────────────────────────────

async function fixWesley(workId) {
  console.log('\n▶ Wesley — Roman numeral chapters + book tracking')
  const { data: vols } = await supabase.from('lib_volumes')
    .select('id, volume_number, bible_book_start').eq('work_id', workId).order('volume_number')

  const BOOK_HEADINGS = new Set([
    ...BOOK_NAMES_EN,
    'THE GOSPEL OF MATTHEW', 'THE GOSPEL OF MARK', 'THE GOSPEL OF LUKE',
    'THE GOSPEL OF JOHN', 'THE ACTS OF THE APOSTLES', 'THE REVELATION',
    'THE FIRST EPISTLE OF PAUL', 'THE SECOND EPISTLE',
  ])

  for (const vol of (vols || [])) {
    const entries = await getVolumeEntries(vol.id)
    console.log(`  Vol ${vol.volume_number}: ${entries.length} entradas`)

    let curBook = vol.bible_book_start || null
    let curChapter = 1
    let curRef = null
    const updates = []

    for (const entry of entries) {
      const h = (entry.heading || '').trim()
      const hU = h.toUpperCase()

      // Detect book change from heading (exact book name match)
      for (const b of BOOK_NAMES_EN) {
        if (hU === b.toUpperCase() || hU === 'THE GOSPEL OF ' + b.toUpperCase()
          || hU.startsWith(b.toUpperCase() + ' ')) {
          curBook = b; curChapter = 1
          curRef = { bible_book: b, bible_chapter: 1, bible_verse_start: 1, bible_ref: `${b} 1:1` }
          break
        }
      }

      // Roman numeral chapter heading: "XVIII", "I", "IV" etc. (heading is just the numeral)
      if (/^[IVXLCDM]+\.?$/.test(h)) {
        const ch = romanToInt(h.replace('.',''))
        if (ch && curBook) {
          curChapter = ch
          curRef = { bible_book: curBook, bible_chapter: ch, bible_verse_start: 1, bible_ref: `${curBook} ${ch}:1` }
        }
      }

      if (curRef && !entry.bible_book) {
        updates.push({ id: entry.id, ...curRef })
      }
    }

    console.log(`    ${updates.length} entradas a atualizar`)
    await applyUpdates(updates)
  }
}

// ── Fix Luther Galatians ──────────────────────────────────────────────────────

async function fixLuther(workId) {
  console.log('\n▶ Luther Galatians')
  const { data: vols } = await supabase.from('lib_volumes')
    .select('id, volume_number').eq('work_id', workId)

  for (const vol of (vols || [])) {
    const entries = await getVolumeEntries(vol.id)
    let curChapter = 1
    const updates = []

    for (const entry of entries) {
      const h = (entry.heading || '').trim()

      const chM = h.match(/^Chapter\s+([IVXLCDM]+|[0-9]+)\./i)
      if (chM) {
        const ch = /\d/.test(chM[1]) ? parseInt(chM[1]) : (romanToInt(chM[1]) ?? curChapter)
        curChapter = ch
      }
      const vsM = h.match(/Verse(?:s?)\s+(\d+)(?:[-–]\s*(\d+))?/i)
      const vs = vsM ? parseInt(vsM[1]) : 1
      const vsEnd = vsM?.[2] ? parseInt(vsM[2]) : null
      const ref = {
        bible_book: 'Galatians', bible_chapter: curChapter,
        bible_verse_start: vs, bible_verse_end: vsEnd,
        bible_ref: `Galatians ${curChapter}:${vs}${vsEnd ? '-' + vsEnd : ''}`,
      }
      if (!entry.bible_book) updates.push({ id: entry.id, ...ref })
    }
    console.log(`  Vol ${vol.volume_number}: ${updates.length} entradas a atualizar`)
    await applyUpdates(updates)
  }
}

// ── Fix Matthew Henry — re-parse CCEL text ───────────────────────────────────

async function fixMHC(workId) {
  console.log('\n▶ Matthew Henry — re-parse CCEL text')

  const CCEL_URLS = {
    1: 'https://ccel.org/ccel/henry/mhc1/cache/mhc1.txt',
    2: 'https://ccel.org/ccel/henry/mhc2/cache/mhc2.txt',
    3: 'https://ccel.org/ccel/henry/mhc3/cache/mhc3.txt',
    4: 'https://ccel.org/ccel/henry/mhc4/cache/mhc4.txt',
    5: 'https://ccel.org/ccel/henry/mhc5/cache/mhc5.txt',
    6: 'https://ccel.org/ccel/henry/mhc6/cache/mhc6.txt',
  }

  // BOOK HEADING RE — standalone book name line (OT volumes)
  const BOOK_HEADING_RE = new RegExp(
    '^(' + BOOK_NAMES_EN.map(b => b.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|') + ')$',
    'i'
  )

  // OT section heading: "The Creation. (b. c. 4004.)"
  const OT_SECTION_RE = /^[A-Z][A-Za-z ,;''.]+\. \(b\. c\. /

  // NT chapter marker: "  CHAP. I." (1-4 leading spaces)
  const CHAP_RE = /^\s{1,4}CHAP\.\s+([IVXLCDM]+)\./i

  // Quoted verse line: "   1 In the beginning..."
  const VERSE_LINE_RE = /^\s{3,}(\d+)\s+/

  // Detect letter-spaced book names: "M A T T H E W." or "F I R S T   C O R I N T H I A N S."
  // Every char is a single uppercase letter separated by spaces (multi-word groups separated by 2+ spaces)
  function isSpacedBook(line) {
    return /^[A-Z ,]+\.$/.test(line) && /[A-Z] [A-Z]/.test(line)
  }

  // Resolve letter-spaced text to a book name
  // "M A T T H E W" → "Matthew", "F I R S T   C O R I N T H I A N S" → "1 Corinthians"
  function resolveSpacedBook(spaced) {
    const ordinals = { FIRST: '1', SECOND: '2', THIRD: '3' }
    const groups = spaced.replace(/\.$/, '').split(/\s{2,}/)
      .map(g => g.trim().replace(/\s+/g, '')).filter(Boolean)
    const skip = new Set(['THE', 'OF', 'WITH'])
    const useful = groups.filter(g => !skip.has(g))
    if (!useful.length) return null
    const prefix = ordinals[useful[0]]
    const rest = prefix ? useful.slice(1) : useful
    const titleRest = rest.map(g => g.charAt(0) + g.slice(1).toLowerCase()).join(' ')
    const candidate = prefix ? `${prefix} ${titleRest}` : titleRest
    const found = BOOK_NAMES_EN.find(b => b.toLowerCase() === candidate.toLowerCase())
    if (found) return found
    // Fallback: try each word group individually
    for (const g of useful) {
      const t = g.charAt(0) + g.slice(1).toLowerCase()
      const m = BOOK_NAMES_EN.find(b => b.toLowerCase() === t.toLowerCase())
      if (m) return m
    }
    return null
  }

  // NT section heading: non-indented, starts uppercase, not letter-spaced, ends with period
  // "The Genealogy of Christ." or "A Conspiracy against Paul. (a. d. 58.)"
  function isNTSectionHeading(line) {
    if (/^\s/.test(line)) return false
    const t = line.trim()
    if (!t || !/^[A-Z]/.test(t)) return false
    if (isSpacedBook(t)) return false
    if (t.length < 5 || t.length > 150) return false
    return t.endsWith('.') || /\.\s*\([^)]+\)\s*$/.test(t)
  }

  const { data: vols } = await supabase.from('lib_volumes')
    .select('id, volume_number, bible_book_start').eq('work_id', workId).order('volume_number')

  for (const vol of (vols || [])) {
    const url = CCEL_URLS[vol.volume_number]
    if (!url) continue

    const isNT = vol.volume_number >= 5

    console.log(`  Vol ${vol.volume_number}: fetching ${url}`)
    let text
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
      text = await res.text()
    } catch (e) {
      console.log(`    ✗ Erro ao buscar: ${e.message}`)
      continue
    }

    const lines = text.split('\n')

    let curBook = vol.bible_book_start || null
    let curChapter = 0
    let lastVerse = 0
    const sections = []
    let inSection = false
    let sectionHeading = null

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li]
      const trimmed = line.trim()

      // NT: detect letter-spaced book name ("M A T T H E W.", "F I R S T   C O R I N T H I A N S.")
      if (isNT && isSpacedBook(trimmed)) {
        const bk = resolveSpacedBook(trimmed)
        if (bk) { curBook = bk; curChapter = 0; lastVerse = 0 }
        inSection = false; sectionHeading = null
        continue
      }

      // NT: chapter marker "  CHAP. IV."
      if (isNT) {
        const cm = CHAP_RE.exec(line)
        if (cm) {
          curChapter = romanToInt(cm[1]) || curChapter
          lastVerse = 0
          continue
        }
      }

      // OT: standalone book name line
      if (!isNT && BOOK_HEADING_RE.test(trimmed)) {
        const bk = BOOK_NAMES_EN.find(b => b.toLowerCase() === trimmed.toLowerCase())
        if (bk) { curBook = bk; curChapter = 0; lastVerse = 0; continue }
      }

      // Section heading detection
      const isSection = isNT ? isNTSectionHeading(line) : OT_SECTION_RE.test(trimmed)
      if (isSection) {
        sectionHeading = trimmed
        inSection = true
        continue
      }

      // Quoted verse line: indented, starts with verse number
      if (inSection && sectionHeading) {
        const vm = VERSE_LINE_RE.exec(line)
        if (vm) {
          const vn = parseInt(vm[1])
          if (!isNT) {
            // OT: infer chapter from verse number resets
            if (curChapter === 0) {
              curChapter = 1
            } else if (vn < lastVerse - 5 && lastVerse > 10) {
              curChapter++
            }
            lastVerse = Math.max(lastVerse, vn)
          }

          if (curBook && curChapter > 0) {
            sections.push({ headingText: sectionHeading, book: curBook, chapter: curChapter, verseStart: vn })
          }
          sectionHeading = null
          inSection = false
          continue
        }
        // Reset if another heading or book encountered before finding verse
        if (isNT ? isNTSectionHeading(line) || isSpacedBook(trimmed)
                 : OT_SECTION_RE.test(trimmed) || BOOK_HEADING_RE.test(trimmed)) {
          sectionHeading = null
          inSection = false
        }
      }
    }

    console.log(`    Seções detectadas: ${sections.length}`)
    if (!sections.length) {
      console.log('    Nenhuma seção — pulando')
      continue
    }

    // Get DB entries for this volume in sequence order
    const entries = await getVolumeEntries(vol.id)
    console.log(`    Entradas no banco: ${entries.length}`)

    // Each "section" in MHC corresponds to multiple consecutive entries in the DB.
    // The processed JSON split at blank lines, so a section heading becomes entry N
    // and continuation paragraphs become entries N+1, N+2...
    // We need to match section headings to DB entries by HEADING TEXT.

    // Build a heading → section ref map
    const headingToRef = new Map()
    for (const sec of sections) {
      // MHC heading in DB is the first ~70 chars of the section title line
      const headKey = sec.headingText.slice(0, 67)
      headingToRef.set(headKey, {
        bible_book: sec.book,
        bible_chapter: sec.chapter,
        bible_verse_start: sec.verseStart,
        bible_ref: `${sec.book} ${sec.chapter}:${sec.verseStart}`,
      })
    }

    // Forward-fill
    let curRef = { bible_book: vol.bible_book_start, bible_chapter: 1, bible_verse_start: 1,
      bible_ref: `${vol.bible_book_start} 1:1` }
    const updates = []

    for (const entry of entries) {
      const h = (entry.heading || '').trim()
      // Try to find a matching section
      const matchRef = headingToRef.get(h) || headingToRef.get(h.slice(0, 67))
      if (matchRef) curRef = matchRef
      if (curRef && !entry.bible_book) {
        updates.push({ id: entry.id, ...curRef })
      } else if (curRef && entry.bible_book !== curRef.bible_book) {
        updates.push({ id: entry.id, ...curRef })
      }
    }

    console.log(`    ${updates.length} entradas a atualizar`)
    await applyUpdates(updates)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function getWorkId(titlePattern) {
  // Get the one with most entries
  const { data: ws } = await supabase.from('lib_works').select('id, title')
    .ilike('title', `%${titlePattern}%`)
  if (!ws?.length) return null
  let best = null, bestCount = 0
  for (const w of ws) {
    const { data: vols } = await supabase.from('lib_volumes').select('id').eq('work_id', w.id)
    const vids = (vols || []).map(v => v.id)
    if (!vids.length) continue
    const { count } = await supabase.from('lib_entries').select('id', { count: 'exact', head: true }).in('volume_id', vids)
    if ((count ?? 0) > bestCount) { bestCount = count; best = w.id }
  }
  return best
}

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log(' Fix Referências Bíblicas — Lampas Library')
  if (DRY) console.log(' [DRY-RUN]')
  console.log('═══════════════════════════════════════════════════')

  const tasks = {
    jfb:    { title: 'Commentary Critical', fn: fixJFB },
    calvin: { title: 'Commentaries', fn: fixCalvin },
    barnes: { title: 'Notes on the Bible', fn: fixBarnes },
    wesley: { title: 'Explanatory Notes', fn: fixWesley },
    luther: { title: 'Epistle to the Galatians', fn: fixLuther },
    mhc:    { title: 'Commentary on the Whole Bible', fn: fixMHC },
  }

  const toRun = WORK ? [WORK] : Object.keys(tasks)

  for (const key of toRun) {
    const task = tasks[key]
    if (!task) { console.log(`\n✗ Work desconhecido: ${key}`); continue }
    const workId = await getWorkId(task.title)
    if (!workId) { console.log(`\n✗ Work não encontrado: ${task.title}`); continue }
    try {
      await task.fn(workId)
    } catch (e) {
      console.error(`\n✗ Erro em ${key}:`, e.message)
    }
  }

  console.log('\n✓ Concluído.')
}

main().catch(err => { console.error(err); process.exit(1) })
