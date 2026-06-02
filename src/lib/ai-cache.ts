import { createHash } from 'crypto'
import { getRedis } from '@/lib/redis'

const TTL = 60 * 60 * 24 * 30 // 30 dias

export function cacheKey(...parts: string[]): string {
  return createHash('sha256').update(parts.join('\x00')).digest('hex').slice(0, 40)
}

export async function getAICache<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null
  return redis.get<T>(`lampas:ai:${key}`)
}

export async function setAICache<T>(key: string, value: T): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.set(`lampas:ai:${key}`, value, { ex: TTL })
}
