import { createClient } from '@/lib/supabase/server'

export interface BibleVerse {
  v: number
  t: string
}

// Versões hospedadas estaticamente no Supabase (domínio público)
const STATIC_VERSIONS = new Set(['ACF', 'acf'])

// Mapeamento de nome do livro → abbrev usado no banco (dataset thiagobodruk/biblia)
const BOOK_ABBREV: Record<string, string> = {
  gênesis: 'gn', genesis: 'gn', gn: 'gn',
  êxodo: 'ex', exodo: 'ex', ex: 'ex',
  levítico: 'lv', levitico: 'lv', lv: 'lv',
  números: 'nm', numeros: 'nm', nm: 'nm',
  deuteronômio: 'dt', deuteronomio: 'dt', dt: 'dt',
  josué: 'js', josue: 'js', js: 'js',
  juízes: 'jz', juizes: 'jz', jz: 'jz',
  rute: 'rt', rt: 'rt',
  '1samuel': '1sm', '1 samuel': '1sm',
  '2samuel': '2sm', '2 samuel': '2sm',
  '1reis': '1rs', '1 reis': '1rs',
  '2reis': '2rs', '2 reis': '2rs',
  '1crônicas': '1cr', '1cronicas': '1cr', '1 crônicas': '1cr', '1 cronicas': '1cr',
  '2crônicas': '2cr', '2cronicas': '2cr', '2 crônicas': '2cr', '2 cronicas': '2cr',
  esdras: 'ed', ed: 'ed',
  neemias: 'ne', ne: 'ne',
  ester: 'et', et: 'et',
  jó: 'jó', jo: 'jó', jó2: 'jó',
  salmos: 'sl', salmo: 'sl', sl: 'sl',
  provérbios: 'pv', proverbios: 'pv', pv: 'pv',
  eclesiastes: 'ec', ec: 'ec',
  'cânticos': 'ct', cantares: 'ct', canticos: 'ct', ct: 'ct',
  isaías: 'is', isaias: 'is', is: 'is',
  jeremias: 'jr', jr: 'jr',
  lamentações: 'lm', lamentacoes: 'lm', lm: 'lm',
  ezequiel: 'ez', ez: 'ez',
  daniel: 'dn', dn: 'dn',
  oséias: 'os', oseias: 'os', os: 'os',
  joel: 'jl', jl: 'jl',
  amós: 'am', amos: 'am', am: 'am',
  obadias: 'ob', ob: 'ob',
  jonas: 'jn', jn: 'jn',
  miqueias: 'mq', mq: 'mq',
  naum: 'na', na: 'na',
  habacuque: 'hc', hc: 'hc',
  sofonias: 'sf', sf: 'sf',
  ageu: 'ag', ag: 'ag',
  zacarias: 'zc', zc: 'zc',
  malaquias: 'ml', ml: 'ml',
  mateus: 'mt', mt: 'mt',
  marcos: 'mc', mc: 'mc',
  lucas: 'lc', lc: 'lc',
  joão: 'jo', joao: 'jo',
  atos: 'at', at: 'at',
  romanos: 'rm', rm: 'rm',
  '1coríntios': '1co', '1corintios': '1co', '1 coríntios': '1co', '1 corintios': '1co',
  '2coríntios': '2co', '2corintios': '2co', '2 coríntios': '2co', '2 corintios': '2co',
  gálatas: 'gl', galatas: 'gl', gl: 'gl',
  efésios: 'ef', efesios: 'ef', ef: 'ef',
  filipenses: 'fp', fp: 'fp',
  colossenses: 'cl', cl: 'cl',
  '1tessalonicenses': '1ts', '1 tessalonicenses': '1ts',
  '2tessalonicenses': '2ts', '2 tessalonicenses': '2ts',
  '1timóteo': '1tm', '1timoteo': '1tm', '1 timóteo': '1tm', '1 timoteo': '1tm',
  '2timóteo': '2tm', '2timoteo': '2tm', '2 timóteo': '2tm', '2 timoteo': '2tm',
  tito: 'tt', tt: 'tt',
  filemom: 'fm', fm: 'fm',
  hebreus: 'hb', hb: 'hb',
  tiago: 'tg', tg: 'tg',
  '1pedro': '1pe', '1 pedro': '1pe',
  '2pedro': '2pe', '2 pedro': '2pe',
  '1joão': '1jo', '1joao': '1jo', '1 joão': '1jo', '1 joao': '1jo',
  '2joão': '2jo', '2joao': '2jo', '2 joão': '2jo', '2 joao': '2jo',
  '3joão': '3jo', '3joao': '3jo', '3 joão': '3jo', '3 joao': '3jo',
  judas: 'jd', jd: 'jd',
  apocalipse: 'ap', ap: 'ap',
}

function normalizeKey(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
}

export function getBookAbbrev(book: string): string | null {
  const key = normalizeKey(book)
  const compact = key.replace(/\s+/g, '')
  return BOOK_ABBREV[key] ?? BOOK_ABBREV[compact] ?? null
}

interface ParsedRef {
  chapter: number
  verseStart: number
  verseEnd: number
}

export function parsePassageRef(passageRef: string): ParsedRef | null {
  const normalized = passageRef.trim().replace(/[–—]/g, '-').replace(/\s/g, '')

  // Formatos: "3:16", "3:16-17", "3:16-4:2", "3"
  const match = normalized.match(/^(\d+)(?:[:.:](\d+))?(?:-(?:(\d+)[:.:])?(\d+))?$/)
  if (!match) return null

  const chapter = parseInt(match[1])
  const verseStart = match[2] ? parseInt(match[2]) : 1
  const verseEnd = match[4] ? parseInt(match[4]) : (match[2] ? parseInt(match[2]) : 999)

  return { chapter, verseStart, verseEnd }
}

async function fetchFromSupabase(abbrev: string, chapter: number, verseStart: number, verseEnd: number, version: string): Promise<BibleVerse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bible_verses')
    .select('verse, text')
    .eq('version', version.toUpperCase())
    .eq('abbrev', abbrev)
    .eq('chapter', chapter)
    .gte('verse', verseStart)
    .lte('verse', verseEnd)
    .order('verse')

  if (error || !data?.length) return []
  return data.map(r => ({ v: r.verse as number, t: r.text as string }))
}

async function fetchFromApiBible(book: string, passageRef: string, version: string): Promise<BibleVerse[]> {
  const apiKey = process.env.BIBLE_API_KEY
  const bibleId = process.env[`BIBLE_ID_${version.toUpperCase()}`]

  if (!apiKey || !bibleId) return []

  const query = encodeURIComponent(`${book} ${passageRef}`)
  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${query}&limit=50`

  const res = await fetch(url, {
    headers: { 'api-key': apiKey },
    next: { revalidate: 86400 * 365 },
  })
  if (!res.ok) return []

  const data = await res.json() as { data?: { passages?: { content: string }[] } }
  const passages = data.data?.passages
  if (!passages?.length) return []

  // API.Bible retorna HTML/texto corrido — parse simples por número
  const content = passages[0].content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const lines = content.split(/\[(\d+)\]/).filter(Boolean)
  const verses: BibleVerse[] = []
  for (let i = 0; i < lines.length - 1; i += 2) {
    const num = parseInt(lines[i])
    const text = lines[i + 1]?.trim()
    if (num && text) verses.push({ v: num, t: text })
  }
  return verses
}

export async function fetchBibleText(book: string, passageRef: string, version = 'ACF'): Promise<BibleVerse[]> {
  const normalizedVersion = version.toUpperCase()

  if (STATIC_VERSIONS.has(normalizedVersion)) {
    const abbrev = getBookAbbrev(book)
    if (!abbrev) return []

    const parsed = parsePassageRef(passageRef)
    if (!parsed) return []

    return fetchFromSupabase(abbrev, parsed.chapter, parsed.verseStart, parsed.verseEnd, normalizedVersion)
  }

  return fetchFromApiBible(book, passageRef, normalizedVersion)
}
