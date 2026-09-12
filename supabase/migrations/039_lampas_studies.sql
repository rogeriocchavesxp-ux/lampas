-- ══════════════════════════════════════════════════════════════════════════
-- 039 — lampas_studies: estudos por categoria (Teologia Bíblica, Sistemática,
--        Filosofia, História, Geografia) publicados por sessões de professores.
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS lampas_studies (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Classificação
  category     text        NOT NULL CHECK (category IN (
    'teologia-biblica',
    'teologia-sistematica',
    'filosofia',
    'historia',
    'geografia'
  )),
  title        text        NOT NULL,
  subtitle     text,

  -- Conteúdo
  content      text,                          -- Markdown
  professor    text,                          -- identificador da sessão/professor
  tags         text[]      DEFAULT '{}',
  reading_time int,                           -- minutos estimados

  -- Estado
  is_published boolean     NOT NULL DEFAULT false,

  -- Metadados
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS lampas_studies_user_idx     ON lampas_studies(user_id);
CREATE INDEX IF NOT EXISTS lampas_studies_category_idx ON lampas_studies(category);
CREATE INDEX IF NOT EXISTS lampas_studies_published_idx ON lampas_studies(is_published);
CREATE INDEX IF NOT EXISTS lampas_studies_fts_idx ON lampas_studies
  USING gin(to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(content,'')));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_lampas_studies_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lampas_studies_updated_at ON lampas_studies;
CREATE TRIGGER lampas_studies_updated_at
  BEFORE UPDATE ON lampas_studies
  FOR EACH ROW EXECUTE FUNCTION update_lampas_studies_timestamp();

-- RLS
ALTER TABLE lampas_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "studies_select" ON lampas_studies;
CREATE POLICY "studies_select" ON lampas_studies FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "studies_insert" ON lampas_studies;
CREATE POLICY "studies_insert" ON lampas_studies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "studies_update" ON lampas_studies;
CREATE POLICY "studies_update" ON lampas_studies FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "studies_delete" ON lampas_studies;
CREATE POLICY "studies_delete" ON lampas_studies FOR DELETE
  USING (auth.uid() = user_id);
