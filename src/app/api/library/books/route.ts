import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

const BIBLE_ORDER = [
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

export async function GET(req: NextRequest) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const work_id = req.nextUrl.searchParams.get('work_id')
  if (!work_id) return Response.json({ books: [] })

  const supabase = createServiceClient()

  const { data: volumes } = await supabase
    .from('lib_volumes')
    .select('id')
    .eq('work_id', work_id)

  const volumeIds = (volumes ?? []).map((v: { id: string }) => v.id)
  if (volumeIds.length === 0) return Response.json({ books: [] })

  const { data } = await supabase
    .from('lib_entries')
    .select('bible_book')
    .in('volume_id', volumeIds)
    .not('bible_book', 'is', null)

  const unique = [...new Set((data ?? []).map((r: { bible_book: string }) => r.bible_book))]
  const sorted = unique.sort((a, b) => {
    const ia = BIBLE_ORDER.indexOf(a)
    const ib = BIBLE_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return Response.json({ books: sorted })
}
