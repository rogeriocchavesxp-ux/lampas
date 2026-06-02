import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { PlanId } from '@/lib/plans'

// Requests por minuto por plano — proteção contra burst, não substitui quota mensal
const LIMITS: Record<PlanId, number> = {
  free:          3,
  iniciante:     6,
  intermediario: 15,
  avancado:      30,
}

let ratelimit: Ratelimit | null = null

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  // Se não configurado, falha aberta (não bloqueia) — sem Upstash em dev
  if (!url || !token) return null

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(30, '1 m'), // default — sobrescrito por plano
    prefix: 'lampas:rl',
  })

  return ratelimit
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // timestamp ms
}

export async function checkRateLimit(userId: string, plan: PlanId): Promise<RateLimitResult> {
  const rl = getRatelimit()

  // Sem Redis configurado → permite tudo (ambiente de dev)
  if (!rl) return { allowed: true, limit: -1, remaining: -1, reset: 0 }

  const rpm = LIMITS[plan] ?? LIMITS.free

  // Instância por plano para ter janelas independentes
  const planRl = new Ratelimit({
    redis: (rl as unknown as { redis: Redis }).redis,
    limiter: Ratelimit.slidingWindow(rpm, '1 m'),
    prefix: `lampas:rl:${plan}`,
  })

  const { success, limit, remaining, reset } = await planRl.limit(userId)

  return { allowed: success, limit, remaining, reset }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit':     String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset':     String(result.reset),
  }
}
