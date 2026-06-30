import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAIUsage, incrementAIUsage } from '@/lib/billing'
import { cacheKey, getAICache, setAICache } from '@/lib/ai-cache'
import { captureError } from '@/lib/monitoring'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const usage = await checkAIUsage(user.id)
  if (!usage.canUse) {
    return Response.json({
      error: 'Limite de consultas de IA atingido.',
      used: usage.used, limit: usage.limit, plan: usage.plan, upgrade: true,
    }, { status: 429 })
  }

  const { entry_id, heading, content } = await req.json() as {
    entry_id: string
    heading: string | null
    content: string
  }

  if (!content) return Response.json({ error: 'Conteúdo vazio' }, { status: 400 })

  const ck = cacheKey('lib:translate:pt', entry_id || content.slice(0, 80))
  const cached = await getAICache<{ heading: string | null; content: string }>(ck)
  if (cached) return Response.json(cached)

  incrementAIUsage(user.id).catch(() => {})

  const toTranslate = [
    heading ? `TÍTULO: ${heading}` : '',
    `TEXTO: ${content.slice(0, 3000)}`,
  ].filter(Boolean).join('\n\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: `Você é um tradutor teológico especializado. Traduza o texto abaixo do inglês para o português do Brasil.

Regras:
- Preserve termos técnicos teológicos com precisão (sanctification, justification, atonement, etc.)
- Mantenha nomes próprios (Calvin, Spurgeon, etc.) e nomes bíblicos na forma portuguesa
- Use linguagem formal e reverence ao tratar de temas sagrados
- Retorne APENAS JSON válido no formato: {"heading": "..." ou null, "content": "..."}
- Sem explicações, sem texto fora do JSON`,
      messages: [{
        role: 'user',
        content: `Traduza para português do Brasil:\n\n${toTranslate}`,
      }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed: { heading: string | null; content: string }
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return Response.json({ error: 'Resposta inválida', raw: cleaned }, { status: 500 })
    }

    setAICache(ck, parsed).catch(() => {})
    return Response.json(parsed)
  } catch (err) {
    captureError(err, { endpoint: 'library/translate', userId: user.id })
    return Response.json({ error: 'Erro ao traduzir' }, { status: 500 })
  }
}
