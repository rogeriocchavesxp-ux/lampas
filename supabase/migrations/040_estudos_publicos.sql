-- 040_estudos_publicos.sql
-- Estende lampas_studies para a rota pública /estudos
-- Adiciona: slug (URL), subcategory (agrupamento sidebar), ordem, referencia
-- Expande a category CHECK para incluir 'panorama-biblico'
-- Abre leitura pública para estudos publicados (anon)

-- ── 1. Novos campos ───────────────────────────────────────────────────────────
ALTER TABLE lampas_studies
  ADD COLUMN IF NOT EXISTS slug        text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS ordem       int  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referencia  text;

-- Slug único (somente onde preenchido)
CREATE UNIQUE INDEX IF NOT EXISTS lampas_studies_slug_uidx
  ON lampas_studies(slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS lampas_studies_subcat_idx ON lampas_studies(subcategory);
CREATE INDEX IF NOT EXISTS lampas_studies_ordem_idx  ON lampas_studies(ordem);

-- ── 2. Expandir CHECK de category ─────────────────────────────────────────────
ALTER TABLE lampas_studies
  DROP CONSTRAINT IF EXISTS lampas_studies_category_check;

ALTER TABLE lampas_studies
  ADD CONSTRAINT lampas_studies_category_check CHECK (category IN (
    'teologia-biblica',
    'teologia-sistematica',
    'filosofia',
    'historia',
    'geografia',
    'panorama-biblico'
  ));

-- ── 3. RLS: leitura pública de estudos publicados ─────────────────────────────
-- Substitui a policy anterior (só próprio usuário) por uma que também
-- permite acesso público (anon) a registros com is_published = true
DROP POLICY IF EXISTS "studies_select" ON lampas_studies;

CREATE POLICY "studies_select" ON lampas_studies FOR SELECT
  USING (
    is_published = true
    OR auth.uid() = user_id
  );

-- ── 4. Grant para anon ────────────────────────────────────────────────────────
GRANT SELECT ON lampas_studies TO anon;
