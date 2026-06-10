-- Seed: canal Primeira Escola
-- Idempotente.

INSERT INTO public.editorial_channels (slug, name, domain, description, accent_color, is_active)
VALUES (
  'primeira-escola',
  'Primeira Escola',
  'www.primeiraescola.com.br',
  'Portal de educação cristã e recursos para a família',
  '#2d6a4f',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  domain      = EXCLUDED.domain,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color;
