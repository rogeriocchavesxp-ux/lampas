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
  stripePriceMonthly: string
  stripePriceAnnual: string
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
      'Exegese Bíblica',
      'Estudo Bíblico',
      'Devocional',
      'IA assistida (limitada)',
      'Dicionário Lampas (parcial)',
    ],
    stripePriceMonthly: '',
    stripePriceAnnual: '',
  },
  iniciante: {
    id: 'iniciante',
    name: 'Iniciante',
    priceMonthly: 1900,
    priceAnnual: 18200,
    limits: { aiPerMonth: 60, projects: 5 },
    features: [
      '5 projetos ativos',
      'Exegese Bíblica',
      'Estudo Bíblico',
      'Sermão',
      'Devocional',
      'Colagens',
      'IA assistida',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_INICIANTE_MONTHLY ?? '',
    stripePriceAnnual:  process.env.STRIPE_PRICE_INICIANTE_ANNUAL  ?? '',
  },
  intermediario: {
    id: 'intermediario',
    name: 'Intermediário',
    priceMonthly: 4900,
    priceAnnual: 47000,
    badge: 'Principal',
    limits: { aiPerMonth: 200, projects: -1 },
    features: [
      'Projetos ilimitados',
      'Todos os modos de estudo',
      'Dicionário Lampas completo',
      'Biblioteca integrada',
      'Ferramentas de pesquisa',
      'IA avançada',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_INTERMEDIARIO_MONTHLY ?? '',
    stripePriceAnnual:  process.env.STRIPE_PRICE_INTERMEDIARIO_ANNUAL  ?? '',
  },
  avancado: {
    id: 'avancado',
    name: 'Premium',
    priceMonthly: 8900,
    priceAnnual: 85400,
    limits: { aiPerMonth: -1, projects: -1 },
    features: [
      'Projetos ilimitados',
      'Tudo do plano Pastor',
      'Texto original (hebraico/grego)',
      'Comentário expositivo',
      'IA sem limite de uso',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_AVANCADO_MONTHLY ?? '',
    stripePriceAnnual:  process.env.STRIPE_PRICE_AVANCADO_ANNUAL  ?? '',
  },
}

export function getPlan(planId: string): Plan {
  return PLANS[planId as PlanId] ?? PLANS.free
}

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Grátis'
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}
