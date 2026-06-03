-- ── Lampas — Mercado Pago Billing Definitivo ──────────────────────────────
-- Gateway oficial: Mercado Pago subscriptions/preapproval.
-- Liberação de plano somente por webhook ou sincronização server-side
-- validada no Mercado Pago.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider text DEFAULT 'mercado_pago',
  ADD COLUMN IF NOT EXISTS mercado_pago_preapproval_id text,
  ADD COLUMN IF NOT EXISTS mercado_pago_payer_id text,
  ADD COLUMN IF NOT EXISTS mercado_pago_init_point text,
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS billing_interval text DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_payment_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_payment_id text,
  ADD COLUMN IF NOT EXISTS last_transaction_id text,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS gateway_raw jsonb DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_mp_preapproval_idx
  ON public.subscriptions(mercado_pago_preapproval_id)
  WHERE mercado_pago_preapproval_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_provider_status_idx
  ON public.subscriptions(provider, status);

CREATE TABLE IF NOT EXISTS public.billing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mercado_pago',
  plan text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL,
  status_detail text,
  mercado_pago_payment_id text,
  mercado_pago_authorized_payment_id text,
  mercado_pago_preapproval_id text,
  transaction_id text,
  paid_at timestamptz,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_payments_mp_payment_idx
  ON public.billing_payments(mercado_pago_payment_id)
  WHERE mercado_pago_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS billing_payments_mp_authorized_idx
  ON public.billing_payments(mercado_pago_authorized_payment_id)
  WHERE mercado_pago_authorized_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS billing_payments_user_created_idx
  ON public.billing_payments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS billing_payments_subscription_idx
  ON public.billing_payments(subscription_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'mercado_pago',
  event_id text,
  event_type text NOT NULL,
  resource_id text,
  action text,
  processed boolean NOT NULL DEFAULT false,
  processing_error text,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_webhook_events_provider_event_idx
  ON public.billing_webhook_events(provider, event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS billing_webhook_events_resource_idx
  ON public.billing_webhook_events(provider, resource_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.billing_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mercado_pago',
  event text NOT NULL,
  plan_before text,
  plan_after text,
  status_before text,
  status_after text,
  amount_cents integer,
  transaction_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_audit_logs_user_created_idx
  ON public.billing_audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS billing_audit_logs_subscription_created_idx
  ON public.billing_audit_logs(subscription_id, created_at DESC);

ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "billing_payments_select_own" ON public.billing_payments;
DROP POLICY IF EXISTS "billing_payments_admin_select" ON public.billing_payments;
DROP POLICY IF EXISTS "billing_payments_service_role" ON public.billing_payments;
DROP POLICY IF EXISTS "billing_webhook_events_admin_select" ON public.billing_webhook_events;
DROP POLICY IF EXISTS "billing_webhook_events_service_role" ON public.billing_webhook_events;
DROP POLICY IF EXISTS "billing_audit_logs_admin_select" ON public.billing_audit_logs;
DROP POLICY IF EXISTS "billing_audit_logs_service_role" ON public.billing_audit_logs;

CREATE POLICY "billing_payments_select_own"
  ON public.billing_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "billing_payments_admin_select"
  ON public.billing_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "billing_payments_service_role"
  ON public.billing_payments
  USING (auth.role() = 'service_role');

CREATE POLICY "billing_webhook_events_admin_select"
  ON public.billing_webhook_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "billing_webhook_events_service_role"
  ON public.billing_webhook_events
  USING (auth.role() = 'service_role');

CREATE POLICY "billing_audit_logs_admin_select"
  ON public.billing_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "billing_audit_logs_service_role"
  ON public.billing_audit_logs
  USING (auth.role() = 'service_role');

CREATE OR REPLACE VIEW public.v_admin_billing_subscriptions AS
SELECT
  s.id,
  s.user_id,
  p.email,
  p.full_name,
  s.provider,
  s.plan,
  s.status,
  s.amount_cents,
  s.currency,
  s.billing_interval,
  s.started_at,
  s.current_period_end,
  s.next_payment_at,
  s.cancel_at_period_end,
  s.mercado_pago_preapproval_id,
  s.last_payment_id,
  s.last_transaction_id,
  s.failure_reason,
  s.created_at,
  s.updated_at
FROM public.subscriptions s
LEFT JOIN public.profiles p ON p.id = s.user_id;

ALTER VIEW public.v_admin_billing_subscriptions SET (security_invoker = true);

GRANT SELECT ON public.v_admin_billing_subscriptions TO authenticated;
