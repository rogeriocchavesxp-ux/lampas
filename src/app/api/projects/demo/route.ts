import { createClient } from '@/lib/supabase/server'

const DEMO_PROJECT = {
  title:             'Estudo Guiado — João 3.16',
  book:              'João',
  passage_ref:       '3.16',
  testament:         'NT' as const,
  original_language: 'grego',
  bible_version:     'ACF',
  status:            'draft' as const,
  study_mode:        'devocional',
  project_type:      'devocional' as const,
  is_demo:           true,
  meta:              {},
}

const DEMO_SECTIONS = [
  {
    slug:    'preparar_espiritual',
    module:  'inventio' as const,
    title:   'Preparação Espiritual',
    status:  'draft' as const,
    content: {
      cards: {
        preparar_oracao: 'Senhor, aproxima-me deste versículo como se fosse a primeira vez. Afasta de mim a familiaridade que adormece. Que eu ouça o que tens a dizer ao meu coração hoje.',
        preparar_pedidos: 'Iluminação para enxergar além do que já sei. Humildade para deixar o texto me corrigir. Amor pelo próprio texto, não apenas pela mensagem que quero pregar.',
      },
    },
  },
  {
    slug:    'preparar_assimilacao',
    module:  'inventio' as const,
    title:   'Leia Devagar',
    status:  'draft' as const,
    content: {
      cards: {
        preparar_leitura_lenta: '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."\n\n— João 3.16 (ACF)\n\nLeia três vezes, em voz alta. Na última leitura, pause em cada vírgula e deixe cada palavra pousar.',
        preparar_tensoes_repeticoes: '"Filho unigênito" aparece em João 1.14 e 1.18 — é um título carregado de significado no evangelho de João.',
      },
    },
  },
  {
    slug:    'preparar_visao_geral',
    module:  'inventio' as const,
    title:   'Visão Geral',
    status:  'draft' as const,
    content: {
      cards: {
        preparar_grande_ideia_inicial: 'O amor de Deus ao mundo não é sentimento — é ação soberana. Ele amou, então deu. João 3.16 é um convite à fé, não apenas uma declaração teológica.',
        preparar_tema_provavel: 'O evangelho em miniatura: Deus age por amor, o mundo pode receber por fé.',
      },
    },
  },
]

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ ...DEMO_PROJECT, user_id: user.id })
    .select()
    .single()

  if (pErr || !project) {
    return Response.json({ error: pErr?.message ?? 'Erro ao criar projeto' }, { status: 500 })
  }

  const sections = DEMO_SECTIONS.map(s => ({
    ...s,
    project_id: project.id,
    user_id:    user.id,
  }))

  const { error: sErr } = await supabase.from('sections').insert(sections)
  if (sErr) {
    await supabase.from('projects').delete().eq('id', project.id)
    return Response.json({ error: sErr.message }, { status: 500 })
  }

  return Response.json({ id: project.id })
}
