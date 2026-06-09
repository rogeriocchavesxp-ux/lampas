import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAIUsage, incrementAIUsage } from '@/lib/billing'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const usage = await checkAIUsage(user.id)
  if (!usage.canUse) {
    return Response.json({
      error: 'Limite de consultas de IA atingido para este mês.',
      upgrade: true,
    }, { status: 429 })
  }

  const rl = await checkRateLimit(user.id, usage.plan)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Muitas requisições. Aguarde um momento.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const { prompt } = await req.json() as { prompt: string }
  if (!prompt?.trim()) return Response.json({ error: 'Prompt inválido' }, { status: 400 })

  incrementAIUsage(user.id).catch(() => {})

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: 'Você é um assistente especializado em teologia reformada e educação ministerial. Responda em português do Brasil com clareza, profundidade e organização. Use markdown para estruturar a resposta.',
    messages: [{ role: 'user', content: prompt }],
  })

  stream.finalMessage().then(async (msg) => {
    const u = msg.usage as { input_tokens: number; output_tokens: number }
    const costUsd = ((u.input_tokens * 3) + (u.output_tokens * 15)) / 1_000_000
    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      section_slug: 'knowledge_base',
      mode: 'exegese',
      input_tokens: u.input_tokens,
      output_tokens: u.output_tokens,
      cached_tokens: 0,
      model: 'claude-sonnet-4-6',
      source: 'ai',
      cost_usd: costUsd,
    }).then(() => {})
  }).catch(() => {})

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: { text: event.delta.text } })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
