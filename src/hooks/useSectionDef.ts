'use client'

import { useState, useEffect } from 'react'
import type { SectionDef } from '@/lib/workspace-sections'

// Cache em memória — persiste enquanto o app estiver aberto
const cache = new Map<string, SectionDef>()

export function useSectionDef(slug: string | undefined): SectionDef | null {
  const [def, setDef] = useState<SectionDef | null>(() =>
    slug ? (cache.get(slug) ?? null) : null
  )

  useEffect(() => {
    if (!slug) return
    if (cache.has(slug)) {
      setDef(cache.get(slug)!)
      return
    }

    let cancelled = false
    fetch(`/api/workspace/section/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: SectionDef | null) => {
        if (cancelled || !data) return
        cache.set(slug, data)
        setDef(data)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [slug])

  return def
}
