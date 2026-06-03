import { getSectionBySlug } from '@/lib/workspace-sections'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const section = getSectionBySlug(slug)

  if (!section) {
    return Response.json({ error: 'Seção não encontrada' }, { status: 404 })
  }

  return Response.json(section, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
