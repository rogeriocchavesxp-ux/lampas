import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAIUsage, incrementAIUsage } from '@/lib/billing'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { getSystemPromptForMode } from '@/lib/prompts/mode-personas'
import { getSectionBySlug } from '@/lib/workspace-sections'
import { getToolAreaBySlug } from '@/lib/tools-content'
import { loadOriginalTextContext } from '@/lib/workspace-context'
import {
  queryKnowledgeBase,
  saveToLibrary,
  makeKnowledgeBaseStream,
  academicModeInstruction,
  extractDictionaryQuery,
  type GenerationMode,
} from '@/lib/generation-orchestrator'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  // ── Verificar limite de IA do plano ──
  const usage = await checkAIUsage(user.id)
  if (!usage.canUse) {
    return Response.json({
      error: 'Limite de consultas de IA atingido para este mês.',
      used: usage.used,
      limit: usage.limit,
      plan: usage.plan,
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

  const body = await req.json()
  const { messages, project, activeSlug, activeTitle, dictionaryQuery, generationMode } = body as {
    messages: ChatMessage[]
    project: { id?: string; book: string; passage_ref: string; testament: string; original_language: string; study_mode?: string }
    activeSlug: string
    activeTitle: string
    dictionaryQuery?: string   // termo explícito quando activeSlug = ferramentas_dicionario
    generationMode?: GenerationMode
  }

  // ── Orquestrador: consulta base de conhecimento antes da IA ──────────────────
  if (activeSlug === 'ferramentas_dicionario') {
    const term = dictionaryQuery
      ?? extractDictionaryQuery(messages[messages.length - 1]?.content ?? '')

    if (term) {
      const kbResult = await queryKnowledgeBase(term, supabase, generationMode ?? 'economic')
      if (kbResult) {
        // Registra hit sem custo de IA
        void supabase.from('ai_interactions').insert({
          user_id:       user.id,
          section_slug:  activeSlug,
          mode:          'exegese',
          input_tokens:  0,
          output_tokens: 0,
          cached_tokens: 0,
          model:         'lampas-kb',
          source:        kbResult.source,
          cost_usd:      0,
        }).then(() => {})

        return makeKnowledgeBaseStream(kbResult)
      }
    }
  }

  if (!messages?.length) {
    return Response.json({ error: 'Mensagens inválidas' }, { status: 400 })
  }

  const sectionDef = getSectionBySlug(activeSlug)
  const toolArea = getToolAreaBySlug(activeSlug)
  const modeInstruction = (() => {
    if (activeSlug === 'sermao_dispositio') {
      return 'Modo ativo: Referência Viva no Sermão · Dispositio. Responda como mentor homilético que constrói o sermão olhando continuamente para Preparar, síntese exegética, estrutura literária, teologia bíblica e colagens. Transforme observações em divisões, aplicações, introduções, transições, clímax e conclusão sem separar o sermão da exegese.'
    }
    if (sectionDef?.phase === 'preparar') {
      return 'Macroseção ativa: Preparar. Responda como mentor pastoral, guia devocional e orientador metodológico. Evite tecnicismo excessivo, gramática pesada e análise acadêmica imediata. Priorize assimilação, contemplação, observação, oração, leitura lenta e preparação pastoral.'
    }
    if (activeSlug === 'colagens') {
      return 'Macroseção ativa: Colagens. Responda como assistente de pesquisa e organização: resuma materiais, gere resenhas, sugira tags, relacione citações ao estudo atual, identifique conexões teológicas e ajude a montar uma rede viva de apoio exegético.'
    }
    if (toolArea) {
      return `Ferramenta ativa: ${toolArea.title}. Responda como ${toolArea.aiRole} Priorize ensino, organização, referências reformadas, conexões bíblicas e utilidade pastoral.`
    }
    if (sectionDef?.communicationMode === 'sermao') {
      return 'Modo ministerial ativo: Sermão. Responda como mentor homilético: argumentativo, persuasivo, cristocêntrico e voltado à proclamação pública.'
    }
    if (sectionDef?.communicationMode === 'estudo_biblico') {
      return 'Modo ministerial ativo: Estudo Bíblico. Responda como mentor didático: pedagógico, explicativo, interativo e voltado à condução de grupo.'
    }
    if (sectionDef?.communicationMode === 'devocional') {
      return 'Modo ministerial ativo: Devocional. Responda como mentor pastoral: contemplativo, sensível, simples e voltado à formação espiritual.'
    }
    return 'Modo ativo: Interpretação. Responda com rigor exegético, atenção ao texto bíblico e teologia reformada.'
  })()
  const originalTextContext = sectionDef?.group === 'textual' || ['texto_original', '_sintese_textual'].includes(activeSlug)
    ? await loadOriginalTextContext(supabase, project.id)
    : ''

  // Build context prefix for the current section
  const contextNote = `[Projeto atual: ${project.book} ${project.passage_ref} (${project.original_language}) | Seção ativa: ${activeTitle}]\n${modeInstruction}${originalTextContext ? `\n\nTexto original carregado no workspace:\n${originalTextContext}` : ''}`

  const academicSuffix = generationMode === 'academic' ? academicModeInstruction() : ''
  const systemWithContext = `${getSystemPromptForMode(project.study_mode)}\n\n---\n${contextNote}${academicSuffix}`

  // Convert messages to Anthropic format — inject context into first user message
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((m, i) => ({
    role: m.role,
    content: i === 0 ? `${m.content}` : m.content,
  }))

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: systemWithContext,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: anthropicMessages,
  })

  // Incrementar uso de IA (non-blocking)
  if (user) incrementAIUsage(user.id).catch(() => {})

  // Log token usage + auto-save na biblioteca para consultas do dicionário
  stream.finalMessage().then(async (msg) => {
    const usage = msg.usage as {
      input_tokens: number
      output_tokens: number
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }

    // Custo estimado: claude-sonnet-4-6 $3/MTok input, $15/MTok output
    const costUsd = (
      (usage.input_tokens * 3) + (usage.output_tokens * 15)
    ) / 1_000_000

    await supabase.from('ai_interactions').insert({
      user_id:      user.id,
      section_slug: activeSlug,
      mode:         'exegese',
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cached_tokens: usage.cache_read_input_tokens ?? 0,
      model:         'claude-sonnet-4-6',
      source:        'ai',
      cost_usd:      costUsd,
    }).then(() => {})

    // Auto-save na biblioteca quando é uma consulta ao dicionário
    if (activeSlug === 'ferramentas_dicionario') {
      const term = dictionaryQuery
        ?? extractDictionaryQuery(messages[messages.length - 1]?.content ?? '')

      const fullResponse = msg.content[0]?.type === 'text' ? msg.content[0].text : ''

      if (term && fullResponse) {
        void saveToLibrary(
          term,
          fullResponse,
          { userId: user.id, sectionSlug: activeSlug, passageRef: project.passage_ref, studyMode: project.study_mode },
          supabase,
        )
      }
    }
  }).catch(() => {})

  // Stream SSE back to client
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const data = JSON.stringify({ delta: { text: event.delta.text } })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
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
