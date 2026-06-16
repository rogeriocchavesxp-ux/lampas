import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // OAuth / PKCE code exchange (magic link clicado, OAuth providers)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      await supabase.rpc('log_activity', { p_event_type: 'login' }).then(() => {})
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // token_hash — formato usado em confirmações de email e recovery (Supabase v2)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) {
      await supabase.rpc('log_activity', { p_event_type: 'login', p_metadata: { otp_type: type } }).then(() => {})
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
