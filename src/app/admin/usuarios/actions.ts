'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin/usuarios')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/dashboard')
  return supabase
}

export async function setUserBlocked(userId: string, blocked: boolean) {
  const supabase = await assertAdmin()
  const { error } = await supabase
    .from('profiles')
    .update({ is_blocked: blocked })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function setUserPlan(userId: string, plan: string) {
  const supabase = await assertAdmin()
  const { error } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function setUserFullName(userId: string, fullName: string) {
  const supabase = await assertAdmin()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function resetAiUsage(userId: string) {
  const supabase = await assertAdmin()
  const month = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  const { error } = await supabase
    .from('ai_usage')
    .upsert({ user_id: userId, month, count: 0 }, { onConflict: 'user_id,month' })

  if (error) return { error: error.message }
  revalidatePath('/admin/usuarios')
  return { success: true }
}
