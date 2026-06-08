export type PlanId = 'free' | 'iniciante' | 'intermediario' | 'avancado'

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number  // centavos BRL
  priceAnnual: number   // centavos BRL
  badge?: string
  limits: {
    aiPerMonth: number  // -1 = ilimitado
    projects: number    // -1 = ilimitado
  }
  features: string[]
  mercadoPagoReason: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    priceMonthly: 0,
    priceAnnual: 0,
    limits: { aiPerMonth: 10, projects: 1 },
    features: [
      '1 projeto ativo',
      'Fase Preparar completa',
      'Fase Interpretar — Estudo Contextual',
      'Devocional',
      'Dicionário Lampas (acesso básico)',
      'IA assistida — 10 consultas/mês',
    ],
    mercadoPagoReason: 'Lampas Gratuito',
  },
  iniciante: {
    id: 'iniciante',
    name: 'Iniciante',
    priceMonthly: 1900,
    priceAnnual: 18200,
    limits: { aiPerMonth: 60, projects: 3 },
    features: [
      '3 projetos ativos',
      'Fase Preparar completa',
      'Fase Interpretar completa',
      'Sermão · Estudo Bíblico · Devocional',
      'Dicionário Lampas',
      'Colagens (30)',
      'IA assistida — 60 consultas/mês',
      'Exportação dos estudos',
    ],
    mercadoPagoReason: 'Lampas Iniciante',
  },
  intermediario: {
    id: 'intermediario',
    name: 'Intermediário',
    priceMonthly: 4900,
    priceAnnual: 47000,
    badge: 'Mais popular',
    limits: { aiPerMonth: 200, projects: 10 },
    features: [
      '10 projetos ativos',
      'Todos os modos: Sermão · EBD · Devocional',
      'Estudo Doutrinário · Temático · Carta · Comentário',
      'Dicionário Lampas completo',
      'Ferramentas: Teologia Bíblica · Biblioteca',
      'Colagens (100)',
      'Síntese automática por seção',
      'IA avançada — 200 consultas/mês',
      'Exportação completa dos estudos',
    ],
    mercadoPagoReason: 'Lampas Intermediário',
  },
  avancado: {
    id: 'avancado',
    name: 'Premium',
    priceMonthly: 8900,
    priceAnnual: 85400,
    badge: 'Premium',
    limits: { aiPerMonth: -1, projects: -1 },
    features: [
      'IA sem limite — use o quanto precisar',
      'Projetos ilimitados',
      'Texto original em hebraico e grego',
      'Comentário expositivo versículo a versículo',
      'Sermão Builder com exportação em PDF',
      'Ferramentas completas: Sistemática · Refs Cruzadas',
      'Acesso antecipado a todos os recursos futuros',
      'Suporte prioritário',
    ],
    mercadoPagoReason: 'Lampas Premium',
  },
}

export function getPlan(planId: string): Plan {
  return PLANS[planId as PlanId] ?? PLANS.free
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Grátis'
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}
