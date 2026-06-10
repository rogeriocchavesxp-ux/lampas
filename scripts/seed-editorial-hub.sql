-- Seed: Hub Editorial Central
-- 1. Define rgocastro@icloud.com como hub editor
-- 2. Cria canal padrão "Lampas"
-- Idempotente — pode ser rodado múltiplas vezes.

UPDATE public.profiles
SET is_hub_editor = true
WHERE id = 'ce67d04b-3743-4393-b44e-1e468b6fb066';

INSERT INTO public.editorial_channels (slug, name, domain, description, accent_color, is_active)
VALUES (
  'lampas',
  'Lampas',
  'lampas.com.br',
  'Plataforma principal de estudo bíblico',
  '#c9921a',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  domain      = EXCLUDED.domain,
  description = EXCLUDED.description,
  accent_color = EXCLUDED.accent_color;
