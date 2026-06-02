-- RPC que retorna plano + uso de IA do mês em uma única query
-- Substitui: getUserPlan() + get_ai_usage() (2 round-trips) por 1 chamada

CREATE OR REPLACE FUNCTION public.get_user_ai_status(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_plan text := 'free';
  v_used int  := 0;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status NOT IN ('canceled', 'past_due')
  LIMIT 1;

  SELECT COALESCE(u.count, 0) INTO v_used
  FROM public.ai_usage u
  WHERE u.user_id = p_user_id
    AND u.month = to_char(now(), 'YYYY-MM');

  RETURN json_build_object('plan', COALESCE(v_plan, 'free'), 'used', v_used);
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_ai_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_ai_status TO authenticated;
