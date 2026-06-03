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
      'Exegese Bíblica',
      'Estudo Bíblico',
      'Devocional',
      'Fluxo completo: Preparar · Investigar · Comunicar',
      'Dicionário Lampas (acesso básico)',
      'IA assistida — 10 consultas/mês',
      'Exportação do estudo',
    ],
    mercadoPagoReason: 'Lampas Gratuito',
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
      'Estudo de Carta',
      'Estudo Bíblico',
      'Sermão',
      'Devocional',
      'Fluxo completo em todos os modos',
      'Colagens (50)',
      'Dicionário Lampas',
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
    badge: 'Principal',
    limits: { aiPerMonth: 200, projects: -1 },
    features: [
      'Projetos ilimitados',
      'Todos os 8 modos de estudo',
      'Exegese · Sermão · EBD · Devocional',
      'Estudo Doutrinário · Temático · Comentário',
      'Dicionário Lampas completo',
      'Biblioteca de fontes reformadas',
      'Referências cruzadas e pesquisa integrada',
      'Colagens ilimitadas',
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
    limits: { aiPerMonth: -1, projects: -1 },
    features: [
      'Tudo do plano Intermediário',
      'Texto original — hebraico e grego',
      'Análise morfossintática',
      'Comentário expositivo versículo a versículo',
      'Pesquisa Teológica aprofundada',
      'Estudo de Carta completo',
      'Acesso a todos os recursos futuros',
      'IA sem limite de uso',
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
