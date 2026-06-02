import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAIUsage, incrementAIUsage } from '@/lib/billing'
import { EXEGESE_SYSTEM_PROMPT } from '@/lib/prompts/exegese-system'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const TYPE_LABELS: Record<string, string> = {
  personagem: 'Personagem', lugar: 'Lugar', termo_chave: 'Termo-Chave',
  tema: 'Tema', teologia: 'Elemento teológico', tempo: 'Referência temporal',
  instituicao: 'Instituição', cargo: 'Cargo', conflito: 'Conflito',
  repeticao: 'Repetição', objetivo: 'Objetivo', comentario: 'Comentário',
  insight: 'Insight', observacao: 'Observação',
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const usage = await checkAIUsage(user.id)
  if (!usage.canUse) {
    return Response.json({ error: 'Limite de consultas de IA atingido.', upgrade: true }, { status: 429 })
  }
  incrementAIUsage(user.id).catch(() => {})

  const { term, type, startVerse, book, passageRef, kind } = await req.json() as {
    term: string; type: string; startVerse: number; book: string; passageRef: string
    kind: 'description' | 'analysis'
  }

  const typeLabel = TYPE_LABELS[type] ?? type
  const prompt = kind === 'description'
    ? `Passagem: ${book} ${passageRef}\nClassificação: ${typeLabel} — "${term}" (v.${startVerse})\n\nEscreva uma definição concisa (1-2 linhas) sobre "${term}" no contexto de ${book} ${passageRef}. Seja direto e preciso. Não use markdown. Não repita o termo no início.`
    : `Passagem: ${book} ${passageRef}\nClassificação: ${typeLabel} — "${term}" (v.${startVerse})\n\nEscreva uma análise narrativa/teológica breve (2-3 linhas) sobre o papel ou significado de "${term}" em ${book} ${passageRef}. Seja direto. Não use markdown.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: EXEGESE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })
    const result = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return Response.json({ result })
  } catch {
    return Response.json({ error: 'Erro ao chamar a IA' }, { status: 500 })
  }
}
