import { fetchBibleText, VersionUnavailableError } from '@/lib/bible-text'

export async function POST(req: Request) {
  const body = await req.json() as { book?: string; passageRef?: string; version?: string }
  const { book, passageRef, version = 'ACF' } = body

  if (!book || !passageRef) {
    return Response.json({ error: 'Referência incompleta' }, { status: 400 })
  }

  try {
    const verses = await fetchBibleText(book, passageRef, version)

    if (!verses.length) {
      return Response.json(
        { error: `Nenhum versículo encontrado para ${book} ${passageRef} (${version})` },
        { status: 404 }
      )
    }

    return Response.json({ verses, version })
  } catch (e) {
    if (e instanceof VersionUnavailableError) {
      return Response.json({ error: e.message, type: 'unavailable' }, { status: 503 })
    }
    const msg = e instanceof Error ? e.message : 'Erro ao buscar texto bíblico'
    return Response.json({ error: msg }, { status: 500 })
  }
}
