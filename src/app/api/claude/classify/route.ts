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
  if (!user && process.env.NODE_ENV !== 'development') return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const usage = await checkAIUsage(user?.id ?? '')
  if (!usage.canUse) {
    return Response.json({ error: 'Limite de consultas de IA atingido.', upgrade: true }, { status: 429 })
  }
  if (user) incrementAIUsage(user.id).catch(() => {})

  const { term, type, startVerse, book, passageRef, kind } = await req.json() as {
    term: string; type: string; startVerse: number; book: string; passageRef: string
    kind: 'description' | 'analysis' | 'lexical' | 'theological_biblical' | 'narrative_function' | 'applications' | 'original_term'
  }

  const typeLabel = TYPE_LABELS[type] ?? type

  const PROMPTS: Record<string, string> = {
    description:
      `Passagem: ${book} ${passageRef}\nClassificação: ${typeLabel} — "${term}" (v.${startVerse})\n\nEscreva uma definição concisa (1-2 linhas) sobre "${term}" no contexto de ${book} ${passageRef}. Seja direto e preciso. Não use markdown. Não repita o termo no início.`,
    analysis:
      `Passagem: ${book} ${passageRef}\nClassificação: ${typeLabel} — "${term}" (v.${startVerse})\n\nEscreva uma análise narrativa/teológica breve (2-3 linhas) sobre o papel ou significado de "${term}" em ${book} ${passageRef}. Seja direto. Não use markdown.`,
    lexical:
      `Passagem: ${book} ${passageRef} — "${term}" (${typeLabel}, v.${startVerse})\n\nProduza um estudo lexical objetivo com:\n1. Termo original (hebraico/grego), transliteração e pronúncia\n2. Etimologia e campo semântico\n3. Principais ocorrências no AT/NT (cite 3-4 referências)\n4. Uso específico em ${book} e implicações exegéticas\n\nSeja conciso. Sem markdown decorativo.`,
    theological_biblical:
      `Passagem: ${book} ${passageRef} — "${term}" (${typeLabel}, v.${startVerse})\n\nExplique a teologia bíblica em 3-4 frases:\n1. Onde esse conceito surge na Escritura e como se desenvolve\n2. Como se conecta ao cumprimento em Cristo\n3. Progressão redentivo-histórica\n\nSeja direto. Sem cabeçalhos.`,
    narrative_function:
      `Passagem: ${book} ${passageRef} — "${term}" (${typeLabel}, v.${startVerse})\n\nExplique em 2-3 frases: qual é o papel narrativo/retórico desse elemento na estrutura da perícope? Como contribui para o desenvolvimento da tensão, clímax ou resolução? Seja específico e exegético.`,
    applications:
      `Passagem: ${book} ${passageRef} — "${term}" (${typeLabel}, v.${startVerse})\n\nListe 3 aplicações pastorais diretas do que esse elemento ensina. Formato: frases curtas e práticas, sem pontos decorativos. Uma por linha.`,
    original_term:
      `Para "${term}" (${typeLabel}) em ${book} ${passageRef}: responda em UMA LINHA com o formato exato:\n[TERMO ORIGINAL] | [TRANSLITERAÇÃO] | [SIGNIFICADO PRINCIPAL]\n\nExemplo: יוֹסֵף | Yoseph | Deus acrescentará\nResponda apenas a linha, sem explicação adicional.`,
  }

  const prompt = PROMPTS[kind] ?? PROMPTS.description
  const maxTokens = ['lexical', 'theological_biblical', 'applications'].includes(kind) ? 450 : 300

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: EXEGESE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })
    const result = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return Response.json({ result })
  } catch {
    return Response.json({ error: 'Erro ao chamar a IA' }, { status: 500 })
  }
}
