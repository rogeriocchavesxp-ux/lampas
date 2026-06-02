import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { EXEGESE_SYSTEM_PROMPT } from '@/lib/prompts/exegese-system'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface ProjectContext {
  id?: string
  book: string
  passage_ref: string
  testament: string
  original_language: string
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
  const content = data?.content as { versos?: { ref?: string; texto?: string }[]; passagem?: string } | null
  if (!content) return ''
  if (Array.isArray(content.versos) && content.versos.length > 0) {
    return content.versos
      .filter(v => v.texto?.trim())
      .map(v => `${v.ref ?? ''} ${v.texto}`.trim())
      .join('\n')
  }
  return content.passagem?.trim() ?? ''
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // auth desativado temporariamente

  const { action, project, term } = await req.json() as {
    action: 'identify' | 'analyze'
    project: ProjectContext
    term?: { word: string; transliteration: string; translation: string; wordClass: string }
  }

  const originalTextContext = await loadOriginalTextContext(supabase, project.id)
  const textBlock = originalTextContext
    ? `\nTexto original já carregado no workspace:\n${originalTextContext}\n`
    : ''

  if (action === 'identify') {
    const prompt = `Identifique os termos ${project.original_language === 'Hebraico' ? 'hebraicos' : 'gregos'} mais importantes para análise exegética de ${project.book} ${project.passage_ref}.
${textBlock}
Retorne APENAS JSON válido com a estrutura:
{
  "terms": [
    {
      "word": "forma original",
      "transliteration": "transliteração acadêmica",
      "translation": "tradução principal",
      "wordClass": "Substantivo | Verbo | Adjetivo | Nome próprio | Partícula | etc",
      "occurrences": "v.X, v.Y"
    }
  ]
}

Identifique entre 4 e 10 termos, ordenados por importância teológica. Inclua apenas termos que exigem análise lexical profunda — evite palavras comuns sem peso teológico.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: EXEGESE_SYSTEM_PROMPT + '\n\nIMPORTANTE: Retorne SOMENTE JSON válido, sem markdown, sem texto fora do JSON.',
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text : ''
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return Response.json(JSON.parse(cleaned))
    } catch (err) {
      console.error('generate-terms identify error:', err)
      return Response.json({ error: 'Erro ao identificar termos' }, { status: 500 })
    }
  }

  if (action === 'analyze') {
    if (!term) return Response.json({ error: 'Termo ausente' }, { status: 400 })

    const { word, transliteration, translation, wordClass } = term
    const prompt = `Analise o termo "${word}"${transliteration ? ` (${transliteration})` : ''}: "${translation || '?'}" (${wordClass || 'classe gramatical'}) em ${project.book} ${project.passage_ref}.
${textBlock}
Produza análise lexical completa em markdown estruturado. Use ## para cada seção, **negrito** para labels de campos importantes.

## Definição
Sentido básico e técnico. Cite explicitamente BDAG, HALOT, TWOT ou NIDOTTE com número de página ou entrada quando possível.

## Campo Semântico
Sinônimos, antônimos, palavras cognatas. Como se relaciona com outros termos no mesmo campo?

## Uso na Perícope
Função específica neste texto. Como o contexto imediato delimita o sentido? Papel sintático e semântico.

## Uso no Livro
Como este autor usa o mesmo termo em outras passagens? Qual é o padrão de uso no livro ou corpus?

## Uso Canônico
Como aparece no restante das Escrituras? Desenvolvimento AT → NT? Mudança de sentido no uso apostólico?

## Implicação Teológica
Contribuição decisiva para a mensagem teológica desta perícope. Como ilumina a intenção do autor?

## Referências
Liste as obras citadas nesta análise (dicionários, comentaristas reformados).`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: EXEGESE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      })
      const analysis = response.content[0].type === 'text' ? response.content[0].text : ''
      const knownDicts = ['BDAG', 'HALOT', 'TWOT', 'NIDOTTE', 'NIDNTTE', 'TDNT', 'BDB', 'TDOT', 'Louw-Nida', 'NDBT']
      const dictionaries = knownDicts.filter(d => analysis.includes(d))
      return Response.json({ analysis, dictionaries })
    } catch (err) {
      console.error('generate-terms analyze error:', err)
      return Response.json({ error: 'Erro ao analisar termo' }, { status: 500 })
    }
  }

  return Response.json({ error: 'Ação inválida' }, { status: 400 })
}
