import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const VALID_TYPES = [
  'pregacao','estudo_biblico','ebd','palestra','conferencia','congresso',
  'casamento','batismo','santa_ceia','atendimento_pastoral','reuniao',
  'curso','live','gravacao','outro',
] as const

function guessType(title: string): typeof VALID_TYPES[number] {
  const t = title.toLowerCase()
  if (t.includes('prega') || t.includes('culto')) return 'pregacao'
  if (t.includes('casamento')) return 'casamento'
  if (t.includes('batismo')) return 'batismo'
  if (t.includes('ceia')) return 'santa_ceia'
  if (t.includes('pastoral') || t.includes('aconselhamento')) return 'atendimento_pastoral'
  if (t.includes('reuni') || t.includes('session')) return 'reuniao'
  if (t.includes('ebd') || t.includes('escola')) return 'ebd'
  if (t.includes('estudo')) return 'estudo_biblico'
  if (t.includes('palestra')) return 'palestra'
  if (t.includes('confer')) return 'conferencia'
  return 'outro'
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  let body: { image: string; mediaType: string; referenceDate?: string }
  try { body = await req.json() } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { image, mediaType, referenceDate } = body
  if (!image || !mediaType) {
    return Response.json({ error: 'image e mediaType são obrigatórios' }, { status: 400 })
  }

  const today = referenceDate ?? new Date().toISOString().slice(0, 10)

  const prompt = `Você é um assistente que extrai compromissos de imagens de agenda de papel.

Analise esta imagem de uma agenda ou caderno de compromissos e extraia TODOS os eventos, compromissos e tarefas visíveis.

Data de referência para interpretação: ${today}

Para cada item encontrado, retorne um JSON com este formato exato:
{
  "events": [
    {
      "title": "título do evento",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM ou null",
      "end_time": "HH:MM ou null",
      "location": "local ou null",
      "description": "notas adicionais ou null",
      "all_day": false
    }
  ]
}

Regras:
- Se só há horário de início, estime 1h de duração para end_time
- Se não há horário, use all_day: true
- Para datas relativas (seg, ter, quinta), use a semana da data de referência
- Se a data não é clara, use ${today}
- Retorne APENAS o JSON, sem texto antes ou depois
- Se não encontrar nenhum evento, retorne {"events": []}`

  const response = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: image,
          },
        },
        { type: 'text', text: prompt },
      ],
    }],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''

  let parsed: { events: Array<{
    title: string
    date: string
    start_time: string | null
    end_time: string | null
    location: string | null
    description: string | null
    all_day: boolean
  }> }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? '{"events":[]}')
  } catch {
    return Response.json({ error: 'Claude não conseguiu extrair eventos da imagem', raw: text }, { status: 422 })
  }

  // Map to AgendaEvent-compatible draft objects
  const drafts = parsed.events.map(e => {
    const startIso = e.all_day
      ? `${e.date}T00:00:00.000Z`
      : `${e.date}T${e.start_time ?? '09:00'}:00.000Z`
    const endIso = e.all_day
      ? `${e.date}T23:59:59.000Z`
      : `${e.date}T${e.end_time ?? addHour(e.start_time ?? '09:00')}:00.000Z`

    return {
      title:        e.title,
      event_type:   guessType(e.title),
      description:  e.description,
      starts_at:    startIso,
      ends_at:      endIso,
      all_day:      e.all_day,
      location:     e.location,
      organization: null,
      status:       'confirmado' as const,
      project_id:   null,
      color:        null,
      meta:         {},
    }
  })

  return Response.json({ events: drafts })
}

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
