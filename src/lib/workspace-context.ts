import { createClient } from '@/lib/supabase/server'

interface OriginalVerseContent {
  ref?: string
  texto?: string
}

export async function loadOriginalTextContext(
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
