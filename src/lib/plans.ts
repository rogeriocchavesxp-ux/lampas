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
    limits: { aiPerMonth: 5, projects: 1 },
    features: [
      '1 projeto',
      '5 consultas de IA por mês',
      'Fase Preparar',
      'Devocional',
    ],
    stripePriceMonthly: '',
    stripePriceAnnual: '',
  },
  iniciante: {
    id: 'iniciante',
    name: 'Iniciante',
    priceMonthly: 1900,
    priceAnnual: 18200,
    limits: { aiPerMonth: 40, projects: 3 },
    features: [
      '3 projetos',
      '40 consultas de IA por mês',
      'Preparar + Investigar',
      'Devocional',
      'Colagens (20)',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_INICIANTE_MONTHLY ?? '',
    stripePriceAnnual:  process.env.STRIPE_PRICE_INICIANTE_ANNUAL  ?? '',
  },
  intermediario: {
    id: 'intermediario',
    name: 'Intermediário',
    priceMonthly: 4900,
    priceAnnual: 47000,
    badge: 'Popular',
    limits: { aiPerMonth: 120, projects: 10 },
    features: [
      '10 projetos',
      '120 consultas de IA por mês',
      'Todas as fases',
      'Estudo Bíblico + Devocional',
      'Ferramentas de pesquisa',
      'Colagens (100)',
    ],
    stripePriceMonthly: process.env.STRIPE_PRICE_INTERMEDIARIO_MONTHLY ?? '',
    stripePriceAnnual:  process.env.STRIPE_PRICE_INTERMEDIARIO_ANNUAL  ?? '',
  },
  avancado: {
    id: 'avancado',
    name: 'Avançado',
    priceMonthly: 8900,
    priceAnnual: 85400,
    limits: { aiPerMonth: 400, projects: -1 },
    features: [
      'Projetos ilimitados',
      '400 consultas de IA por mês',
      'Tudo incluído',
      'Sermão Builder + PDF',
      'Comentário expositivo',
      'Texto original (heb/grego)',
      'Ferramentas completas',
      'Colagens ilimitadas',
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
