-- RPC para o dashboard admin: uso diário de IA
CREATE OR REPLACE FUNCTION public.get_ai_usage_by_day(p_since timestamptz)
RETURNS TABLE(day date, calls bigint, input_tokens bigint, output_tokens bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    created_at::date                AS day,
    COUNT(*)                        AS calls,
    COALESCE(SUM(input_tokens), 0)  AS input_tokens,
    COALESCE(SUM(output_tokens), 0) AS output_tokens
  FROM public.ai_interactions
  WHERE created_at >= p_since
  GROUP BY created_at::date
  ORDER BY day DESC;
$$;

REVOKE ALL ON FUNCTION public.get_ai_usage_by_day FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ai_usage_by_day TO authenticated;
