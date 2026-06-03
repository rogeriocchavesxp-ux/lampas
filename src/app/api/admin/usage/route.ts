import { createClient } from '@/lib/supabase/server'

// Retorna métricas de uso de IA para o dashboard admin
// Acessível apenas para usuários com role = 'admin'
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Acesso restrito' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const [
    { data: bySection },
    { data: byDay },
    { data: topUsers },
    { data: monthlySummary },
    { data: kbStats },
    { data: bySource },
  ] = await Promise.all([
    // Uso por seção
    supabase
      .from('ai_interactions')
      .select('section_slug, input_tokens, output_tokens, source, cost_usd')
      .gte('created_at', since),

    // Uso por dia
    supabase
      .rpc('get_ai_usage_by_day', { p_since: since })
      .select('*'),

    // Top usuários por consumo
    supabase
      .from('ai_usage')
      .select('user_id, count, month')
      .eq('month', new Date().toISOString().slice(0, 7))
      .order('count', { ascending: false })
      .limit(20),

    // Resumo mensal
    supabase
      .from('ai_usage')
      .select('month, count')
      .order('month', { ascending: false })
      .limit(12),

    // Stats da base de conhecimento (dicionário + biblioteca + aliases)
    supabase.rpc('get_knowledge_base_stats', { p_since: since }),

    // Distribuição de chamadas por fonte no período
    supabase
      .from('ai_interactions')
      .select('source')
      .gte('created_at', since),
  ])

  // Agregar por seção
  const sectionMap: Record<string, { calls: number; inputTokens: number; outputTokens: number; costUsd: number }> = {}
  for (const row of bySection ?? []) {
    const slug = (row.section_slug as string) ?? 'unknown'
    if (!sectionMap[slug]) sectionMap[slug] = { calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 }
    sectionMap[slug].calls++
    sectionMap[slug].inputTokens  += (row.input_tokens  as number) ?? 0
    sectionMap[slug].outputTokens += (row.output_tokens as number) ?? 0
    sectionMap[slug].costUsd      += (row.cost_usd as number) ??
      (((row.input_tokens as number ?? 0) * 3 + (row.output_tokens as number ?? 0) * 15) / 1_000_000)
  }

  const totalCostUsd = Object.values(sectionMap).reduce((s, v) => s + v.costUsd, 0)
  const totalCalls   = Object.values(sectionMap).reduce((s, v) => s + v.calls,   0)

  // Distribuição por fonte (dicionário, biblioteca, IA)
  const sourceCount: Record<string, number> = {}
  for (const row of bySource ?? []) {
    const src = (row.source as string) ?? 'ai'
    sourceCount[src] = (sourceCount[src] ?? 0) + 1
  }
  const aiCalls   = sourceCount['ai']         ?? totalCalls
  const dictCalls = sourceCount['dictionary'] ?? 0
  const libCalls  = sourceCount['library']    ?? 0
  const savedCalls = dictCalls + libCalls

  // Economia estimada: cada chamada evitada ≈ média de custo de uma chamada IA
  const avgCostPerAiCall = aiCalls > 0 ? totalCostUsd / aiCalls : 0.005
  const estimatedSavingsUsd = savedCalls * avgCostPerAiCall

  return Response.json({
    period_days:    days,
    total_calls:    totalCalls,
    total_cost_usd: Number(totalCostUsd.toFixed(2)),
    // Dados da base de conhecimento
    knowledge_base: {
      ...(kbStats as object ?? {}),
      source_distribution: sourceCount,
      ai_calls:    aiCalls,
      dict_hits:   dictCalls,
      library_hits: libCalls,
      cache_hit_rate: totalCalls > 0
        ? Number(((savedCalls / totalCalls) * 100).toFixed(1))
        : 0,
      estimated_savings_usd: Number(estimatedSavingsUsd.toFixed(2)),
    },
    by_section: Object.entries(sectionMap)
      .sort((a, b) => b[1].costUsd - a[1].costUsd)
      .map(([slug, v]) => ({ slug, ...v, costUsd: Number(v.costUsd.toFixed(4)) })),
    by_day:               byDay     ?? [],
    top_users_this_month: topUsers  ?? [],
    monthly_summary:      monthlySummary ?? [],
  })
}
