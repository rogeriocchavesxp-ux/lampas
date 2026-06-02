import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { checkAIUsage, incrementAIUsage } from '@/lib/billing'
import { EXEGESE_SYSTEM_PROMPT } from '@/lib/prompts/exegese-system'
import { getSectionBySlug } from '@/lib/workspace-sections'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface ProjectContext {
  id?: string
  book: string
  passage_ref: string
  testament: string
  original_language: string
}

interface OriginalVerseContent {
  ref?: string
  texto?: string
  transliteracao?: string
  traducao_literal?: string
  traducao_ajustada?: string
  observacoes?: string
}

function shouldUseOriginalText(sectionSlug: string, sectionGroup: string): boolean {
  return sectionGroup === 'textual' || ['sintese', 'contexto_canonico'].includes(sectionSlug)
}

async function loadOriginalTextContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | undefined,
): Promise<string> {
  if (!projectId) return ''

  const { data } = await supabase
    .from('sections')
    .select('content')
    .eq('project_id', projectId)
    .eq('slug', 'texto_original')
    .maybeSingle()

  const content = data?.content as { versos?: OriginalVerseContent[]; passagem?: string } | null
  if (!content) return ''

  if (Array.isArray(content.versos) && content.versos.length > 0) {
    return content.versos
      .filter(verse => verse.texto?.trim())
      .map(verse => `${verse.ref ?? ''} ${verse.texto}`.trim())
      .join('\n')
  }

  return content.passagem?.trim() ?? ''
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const usage = await checkAIUsage(user.id)
  if (!usage.canUse) {
    return Response.json({
      error: 'Limite de consultas de IA atingido para este mês.',
      used: usage.used, limit: usage.limit, plan: usage.plan, upgrade: true,
    }, { status: 429 })
  }
  incrementAIUsage(user.id).catch(() => {})

  const { sectionSlug, cardId, cardIds, project } = await req.json() as {
    sectionSlug: string
    cardId?: string
    cardIds?: string[]
    project: ProjectContext
  }

  const sectionDef = getSectionBySlug(sectionSlug)
  if (!sectionDef) return Response.json({ error: 'Seção não encontrada' }, { status: 400 })

  const cardsToGenerate = cardId
    ? sectionDef.cards.filter(c => c.id === cardId)
    : cardIds
    ? sectionDef.cards.filter(c => cardIds.includes(c.id))
    : sectionDef.cards

  if (cardsToGenerate.length === 0) {
    return Response.json({ error: 'Nenhum campo para gerar' }, { status: 400 })
  }

  const originalTextContext = shouldUseOriginalText(sectionSlug, sectionDef.group)
    ? await loadOriginalTextContext(supabase, project.id)
    : ''

  const jsonKeys = cardsToGenerate.map(c => `  "${c.id}": "..."`).join(',\n')
  const fieldDescriptions = cardsToGenerate
    .map(c => `- "${c.id}" (${c.title}): ${c.aiTrigger}`)
    .join('\n')

  const modeInstruction = (() => {
    if (sectionDef.phase === 'preparar') {
      return 'Modo: Preparar. Gere conteúdo devocional, pastoral e metodológico, evitando tecnicismo pesado. Priorize oração, assimilação do texto, observações iniciais, leitura lenta e formação espiritual do intérprete.'
    }
    if (sectionDef.communicationMode === 'sermao') {
      return 'Modo ministerial: Sermão. Gere conteúdo homilético, argumentativo, persuasivo, cristocêntrico e adequado à proclamação pública.'
    }
    if (sectionDef.communicationMode === 'estudo_biblico') {
      return 'Modo ministerial: Estudo Bíblico. Gere conteúdo pedagógico, didático, explicativo, interativo e adequado à condução de um grupo.'
    }
    if (sectionDef.communicationMode === 'devocional') {
      return 'Modo ministerial: Devocional. Gere conteúdo pastoral, contemplativo, sensível, simples e espiritualmente formativo.'
    }
    return 'Modo: Interpretação exegética. Gere conteúdo acadêmico, textual, histórico, teológico e reformado.'
  })()

  const userPrompt = `Gere conteúdo para a seção "${sectionDef.title}".

Texto: ${project.book} ${project.passage_ref}
Idioma original: ${project.original_language}
Testamento: ${project.testament === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}
${modeInstruction}
Objetivo da seção: ${sectionDef.objective}
${originalTextContext ? `\nTexto original já carregado no workspace:\n${originalTextContext}\n` : ''}

Campos a gerar:
${fieldDescriptions}

INSTRUÇÕES CRÍTICAS:
- Retorne APENAS JSON válido, sem explicações, sem texto fora do JSON
- Cada valor deve ser texto em markdown bem estruturado, em português do Brasil
- Use ### para títulos de termos, **negrito** para labels de campos, tabelas para dados comparativos, - para listas
- Newlines dentro dos valores JSON devem ser escapados como \\n (JSON padrão)
- Use rigor exegético reformado
- Adapte tom, vocabulário e organização ao modo ministerial indicado
- Estrutura exata esperada:

{
${jsonKeys}
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: EXEGESE_SYSTEM_PROMPT + '\n\nIMPORTANTE: Quando solicitado a gerar JSON estruturado, retorne SOMENTE o JSON válido, sem blocos de código markdown envolvendo o JSON, sem texto fora do JSON. Os valores dentro do JSON podem e devem conter markdown (### títulos, **negrito**, tabelas, listas) para estruturar o conteúdo exegeticamente.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let parsed: Record<string, string>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return Response.json({ error: 'Resposta inválida da IA', raw: cleaned }, { status: 500 })
    }

    return Response.json(parsed)
  } catch (err) {
    console.error('Claude generate error:', err)
    return Response.json({ error: 'Erro ao chamar a IA' }, { status: 500 })
  }
}
