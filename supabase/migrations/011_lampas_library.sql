-- 011_lampas_library.sql
-- Sistema de Geração Inteligente — Biblioteca Lampas + Aliases + Extensões de rastreamento

-- ── 1. Atualizar trust_level do dicionário para 1–5 ───────────────────────────

ALTER TABLE lampas_dictionary DROP CONSTRAINT IF EXISTS lampas_dictionary_trust_level_check;
ALTER TABLE lampas_dictionary
  ADD CONSTRAINT lampas_dictionary_trust_level_check
  CHECK (trust_level BETWEEN 1 AND 5);

-- ── 2. Biblioteca Lampas — cache persistente de respostas Q&A ─────────────────
-- Diferente do dicionário (foco em termos estruturados), a biblioteca armazena
-- respostas completas a consultas livres. Complementa e reduz chamadas de IA.

CREATE TABLE IF NOT EXISTS lampas_library (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificação da consulta
  query_hash   TEXT NOT NULL,          -- SHA-256 do termo normalizado (unique)
  query_text   TEXT NOT NULL,          -- texto original da consulta
  -- Resposta armazenada
  response     TEXT NOT NULL,
  -- Contexto de origem
  section_slug TEXT,
  passage_ref  TEXT,
  study_mode   TEXT,
  -- Metadados
  trust_level  SMALLINT NOT NULL DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 5),
  source       TEXT NOT NULL DEFAULT 'ai'
               CHECK (source IN ('ai', 'curated', 'imported')),
  tags         TEXT[] NOT NULL DEFAULT '{}',
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  -- Métricas
  query_count  INT NOT NULL DEFAULT 0,
  -- Autoria
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Timestamps
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lampas_library_hash_unique UNIQUE (query_hash)
);

CREATE INDEX IF NOT EXISTS lampas_library_query_text_idx
  ON lampas_library (lower(query_text));

CREATE INDEX IF NOT EXISTS lampas_library_tags_idx
  ON lampas_library USING gin(tags);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION fn_library_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_library_updated_at ON lampas_library;
CREATE TRIGGER trg_library_updated_at
  BEFORE UPDATE ON lampas_library
  FOR EACH ROW EXECUTE FUNCTION fn_library_updated_at();

-- ── 3. Aliases semânticos ─────────────────────────────────────────────────────
-- Mapeia formas equivalentes para a mesma entrada do dicionário ou biblioteca.
-- Exemplo: "José do Egito", "Patriarca José", "Filho de Jacó" → entrada "José"

CREATE TABLE IF NOT EXISTS lampas_query_aliases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_text       TEXT NOT NULL,
  -- Aponta para dicionário OU biblioteca (pelo menos um obrigatório)
  dict_entry_id    UUID REFERENCES lampas_dictionary(id) ON DELETE CASCADE,
  library_entry_id UUID REFERENCES lampas_library(id)   ON DELETE CASCADE,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alias_has_target CHECK (
    dict_entry_id IS NOT NULL OR library_entry_id IS NOT NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS lampas_aliases_text_dict_idx
  ON lampas_query_aliases (lower(alias_text), dict_entry_id)
  WHERE dict_entry_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS lampas_aliases_text_lib_idx
  ON lampas_query_aliases (lower(alias_text), library_entry_id)
  WHERE library_entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS lampas_aliases_dict_idx    ON lampas_query_aliases (dict_entry_id);
CREATE INDEX IF NOT EXISTS lampas_aliases_library_idx ON lampas_query_aliases (library_entry_id);

-- ── 4. Estender ai_interactions com rastreamento de fonte e custo ─────────────

ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS source        TEXT DEFAULT 'ai';
ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS cost_usd      FLOAT4;
ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS response_ms   INT;

CREATE INDEX IF NOT EXISTS ai_interactions_source_idx
  ON ai_interactions (source, created_at DESC);

-- ── 5. RPCs ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_library_query_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE lampas_library SET query_count = query_count + 1 WHERE id = p_id;
END;
$$;

-- Estatísticas da base de conhecimento para o dashboard admin
CREATE OR REPLACE FUNCTION get_knowledge_base_stats(p_since TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Contadores da base de conhecimento
    'dict_entries',    (SELECT COUNT(*) FROM lampas_dictionary),
    'library_entries', (SELECT COUNT(*) FROM lampas_library),
    'aliases',         (SELECT COUNT(*) FROM lampas_query_aliases),
    -- Uso por fonte no período
    'sources', (
      SELECT json_agg(row_to_json(s)) FROM (
        SELECT
          COALESCE(source, 'ai') AS source,
          COUNT(*) AS calls,
          COALESCE(SUM(input_tokens), 0)  AS input_tokens,
          COALESCE(SUM(output_tokens), 0) AS output_tokens,
          COALESCE(SUM(cost_usd), 0)      AS cost_usd
        FROM ai_interactions
        WHERE created_at >= p_since
        GROUP BY source
        ORDER BY calls DESC
      ) s
    ),
    -- Top termos consultados no dicionário
    'top_dict_terms', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT title, category, trust_level, query_count
        FROM lampas_dictionary
        WHERE query_count > 0
        ORDER BY query_count DESC
        LIMIT 20
      ) t
    ),
    -- Top termos na biblioteca
    'top_library_terms', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT query_text, trust_level, query_count, source
        FROM lampas_library
        WHERE query_count > 0
        ORDER BY query_count DESC
        LIMIT 20
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ── 6. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE lampas_library         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_query_aliases   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_select" ON lampas_library;
DROP POLICY IF EXISTS "library_insert" ON lampas_library;
DROP POLICY IF EXISTS "library_update" ON lampas_library;

CREATE POLICY "library_select" ON lampas_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "library_insert" ON lampas_library FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "library_update" ON lampas_library FOR UPDATE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "aliases_select" ON lampas_query_aliases;
DROP POLICY IF EXISTS "aliases_insert" ON lampas_query_aliases;

CREATE POLICY "aliases_select" ON lampas_query_aliases FOR SELECT TO authenticated USING (true);
CREATE POLICY "aliases_insert" ON lampas_query_aliases FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- ── 7. Grants ─────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON lampas_library       TO authenticated;
GRANT SELECT, INSERT          ON lampas_query_aliases TO authenticated;
GRANT EXECUTE ON FUNCTION increment_library_query_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_knowledge_base_stats      TO authenticated;
