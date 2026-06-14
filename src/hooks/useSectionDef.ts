'use client'

import { useState, useEffect } from 'react'
import type { SectionDef } from '@/lib/workspace-sections'

// Cache em memória — persiste enquanto o app estiver aberto
const cache = new Map<string, SectionDef>()

export function useSectionDef(slug: string | undefined): { def: SectionDef | null; loading: boolean } {
  const [def, setDef] = useState<SectionDef | null>(() =>
    slug ? (cache.get(slug) ?? null) : null
  )
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(slug && !cache.has(slug))
  )

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    if (cache.has(slug)) {
      setDef(cache.get(slug)!)
      setLoading(false)
      return
    }

    setLoading(true)
    let cancelled = false
    fetch(`/api/workspace/section/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: SectionDef | null) => {
        if (cancelled) return
        if (data) {
          cache.set(slug, data)
          setDef(data)
        }
        setLoading(false)
      })
      .catch(() => { setLoading(false) })

    return () => { cancelled = true }
  }, [slug])

  return { def, loading }
}
