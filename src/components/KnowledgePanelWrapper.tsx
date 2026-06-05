'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import KnowledgePanel from './KnowledgePanel'

export default function KnowledgePanelWrapper() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!userId) return null
  return <KnowledgePanel userId={userId} />
}
