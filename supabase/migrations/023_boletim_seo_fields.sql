-- 023_boletim_seo_fields.sql
-- Adiciona campos SEO e slug a boletim_entries
-- Todas as colunas são nullable — nenhuma entrada existente é afetada.

ALTER TABLE public.boletim_entries
  ADD COLUMN IF NOT EXISTS slug                 text,
  ADD COLUMN IF NOT EXISTS cover_image_url      text,
  ADD COLUMN IF NOT EXISTS seo_title            text,
  ADD COLUMN IF NOT EXISTS seo_description      text,
  ADD COLUMN IF NOT EXISTS og_image_url         text,
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer;

-- Backfill de slugs para entradas existentes
-- Padrão: versão normalizada + sufixo do id quando há duplicatas
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, version FROM public.boletim_entries WHERE slug IS NULL ORDER BY created_at
  LOOP
    base_slug  := regexp_replace(lower(r.version), '[^a-z0-9]+', '-', 'g');
    final_slug := base_slug;
    counter    := 1;

    WHILE EXISTS (SELECT 1 FROM public.boletim_entries WHERE slug = final_slug) LOOP
      final_slug := base_slug || '-' || counter;
      counter    := counter + 1;
    END LOOP;

    UPDATE public.boletim_entries SET slug = final_slug WHERE id = r.id;
  END LOOP;
END;
$$;

-- Índice único parcial (não-nulos) — slug será exigido apenas em novas entradas via UI
CREATE UNIQUE INDEX IF NOT EXISTS idx_boletim_slug
  ON public.boletim_entries (slug)
  WHERE slug IS NOT NULL;
