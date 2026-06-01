-- ── Hokmá — Billing Infrastructure ────────────────────────────────────────

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id    text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan                  text NOT NULL DEFAULT 'free',
  status                text NOT NULL DEFAULT 'active',
  current_period_end    timestamptz,
  cancel_at_period_end  boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

-- AI usage counter (per user per month)
CREATE TABLE IF NOT EXISTS ai_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month      text NOT NULL, -- 'YYYY-MM'
  count      integer DEFAULT 0 CHECK (count >= 0),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage      ENABLE ROW LEVEL SECURITY;

-- Users read own subscription
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role full access (webhooks)
CREATE POLICY "subscriptions_service_role" ON subscriptions
  USING (auth.role() = 'service_role');

-- Users read own usage
CREATE POLICY "ai_usage_select_own" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "ai_usage_service_role" ON ai_usage
  USING (auth.role() = 'service_role');

-- ── Function: increment_ai_usage ─────────────────────────────────────────────
-- SECURITY DEFINER so authenticated users can increment their own count
-- without needing write RLS policy (prevents arbitrary manipulation).

CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ai_usage (user_id, month, count, updated_at)
  VALUES (p_user_id, to_char(now(), 'YYYY-MM'), 1, now())
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    count      = ai_usage.count + 1,
    updated_at = now();
END;
$$;

-- Only authenticated users can call this function
REVOKE ALL ON FUNCTION increment_ai_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_ai_usage TO authenticated;

-- ── Function: get_ai_usage ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_ai_usage(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT count FROM ai_usage
      WHERE user_id = p_user_id
        AND month = to_char(now(), 'YYYY-MM')),
    0
  );
$$;

REVOKE ALL ON FUNCTION get_ai_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_ai_usage TO authenticated;
