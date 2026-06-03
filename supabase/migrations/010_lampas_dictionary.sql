-- 010_lampas_dictionary.sql
-- Dicionário Lampas — base de conhecimento bíblica e teológica viva, cumulativa e compartilhada

-- ── Tabela principal ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_dictionary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  title           TEXT NOT NULL,
  slug            TEXT,
  category        TEXT NOT NULL DEFAULT 'termo_biblico'
                  CHECK (category IN (
                    'personagem', 'lugar', 'termo_biblico', 'doutrina',
                    'instituicao', 'evento', 'livro_biblico'
                  )),
  trust_level     SMALLINT NOT NULL DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 4),
  is_shared       BOOLEAN NOT NULL DEFAULT true,

  -- Autoria
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conteúdo textual
  definition      TEXT,
  etymology       TEXT,
  notes           TEXT,

  -- Línguas originais
  lang_hebrew     TEXT,
  lang_aramaic    TEXT,
  lang_greek      TEXT,
  transliteration TEXT,
  pronunciation   TEXT,

  -- Uso bíblico
  occurrences     TEXT,
  main_texts      TEXT,

  -- Teologia e aplicação
  theological_biblical    TEXT,
  theological_systematic  TEXT,
  applications            TEXT,

  -- Arrays
  cross_references TEXT[] NOT NULL DEFAULT '{}',
  related_terms    TEXT[] NOT NULL DEFAULT '{}',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  sources          TEXT[] NOT NULL DEFAULT '{}',

  -- Métricas
  query_count    INT NOT NULL DEFAULT 0,
  citation_count INT NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Índices ───────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS lampas_dictionary_slug_idx
  ON lampas_dictionary (slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS lampas_dictionary_title_idx
  ON lampas_dictionary (lower(title));

CREATE INDEX IF NOT EXISTS lampas_dictionary_category_idx
  ON lampas_dictionary (category);

CREATE INDEX IF NOT EXISTS lampas_dictionary_trust_idx
  ON lampas_dictionary (trust_level DESC);

CREATE INDEX IF NOT EXISTS lampas_dictionary_user_idx
  ON lampas_dictionary (user_id);

-- Full-text search (Portuguese + simple for proper nouns / Hebrew / Greek)
CREATE INDEX IF NOT EXISTS lampas_dictionary_fts_idx
  ON lampas_dictionary
  USING gin(
    (
      setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('simple',     coalesce(title, '')), 'A') ||
      setweight(to_tsvector('simple',     coalesce(transliteration, '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce(definition, '')), 'B') ||
      setweight(to_tsvector('portuguese', coalesce(etymology, '')), 'C') ||
      setweight(to_tsvector('portuguese', coalesce(theological_biblical, '')), 'C') ||
      setweight(to_tsvector('portuguese', coalesce(theological_systematic, '')), 'C')
    )
  );

-- ── Histórico de versões ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_dictionary_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID NOT NULL REFERENCES lampas_dictionary(id) ON DELETE CASCADE,
  edited_by  UUID REFERENCES auth.users(id),
  snapshot   JSONB NOT NULL,
  edited_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dict_versions_entry_idx
  ON lampas_dictionary_versions (entry_id, edited_at DESC);

-- ── Trigger: updated_at + slug auto-gerado ───────────────────────────────────

CREATE OR REPLACE FUNCTION fn_dictionary_before_upsert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := regexp_replace(
      regexp_replace(lower(trim(NEW.title)), '[áàãâä]', 'a', 'g'),
      '[^a-z0-9]+', '-', 'g'
    );
    -- garante unicidade sufixando com parte do id
    IF EXISTS (
      SELECT 1 FROM lampas_dictionary
      WHERE slug = NEW.slug AND id IS DISTINCT FROM NEW.id
    ) THEN
      NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dictionary_upsert ON lampas_dictionary;
CREATE TRIGGER trg_dictionary_upsert
  BEFORE INSERT OR UPDATE ON lampas_dictionary
  FOR EACH ROW EXECUTE FUNCTION fn_dictionary_before_upsert();

-- ── Trigger: salvar versão antes de UPDATE de conteúdo ───────────────────────

CREATE OR REPLACE FUNCTION fn_dictionary_save_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO lampas_dictionary_versions (entry_id, edited_by, snapshot)
  VALUES (OLD.id, auth.uid(), to_jsonb(OLD));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dictionary_version ON lampas_dictionary;
CREATE TRIGGER trg_dictionary_version
  BEFORE UPDATE ON lampas_dictionary
  FOR EACH ROW
  WHEN (
    OLD.definition         IS DISTINCT FROM NEW.definition         OR
    OLD.etymology          IS DISTINCT FROM NEW.etymology          OR
    OLD.theological_biblical   IS DISTINCT FROM NEW.theological_biblical   OR
    OLD.theological_systematic IS DISTINCT FROM NEW.theological_systematic OR
    OLD.applications       IS DISTINCT FROM NEW.applications       OR
    OLD.notes              IS DISTINCT FROM NEW.notes
  )
  EXECUTE FUNCTION fn_dictionary_save_version();

-- ── RPC: increment_dictionary_query_count ────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_dictionary_query_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE lampas_dictionary SET query_count = query_count + 1 WHERE id = p_id;
END;
$$;

-- ── RPC: search_dictionary ────────────────────────────────────────────────────
-- Busca inteligente: full-text + ILIKE em título/transliteração/tags/termos relacionados

CREATE OR REPLACE FUNCTION search_dictionary(
  p_query    TEXT,
  p_category TEXT DEFAULT NULL,
  p_limit    INT  DEFAULT 30
)
RETURNS TABLE (
  id              UUID,
  title           TEXT,
  slug            TEXT,
  category        TEXT,
  trust_level     SMALLINT,
  definition      TEXT,
  transliteration TEXT,
  tags            TEXT[],
  related_terms   TEXT[],
  query_count     INT,
  rank            FLOAT4
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tsq tsquery;
BEGIN
  -- Tenta converter para tsquery; se falhar, usa prefixo simples
  BEGIN
    v_tsq := websearch_to_tsquery('portuguese', p_query);
  EXCEPTION WHEN OTHERS THEN
    v_tsq := to_tsquery('simple', regexp_replace(trim(p_query), '\s+', ' & ', 'g') || ':*');
  END;

  RETURN QUERY
  SELECT
    d.id, d.title, d.slug, d.category, d.trust_level,
    d.definition, d.transliteration, d.tags, d.related_terms,
    d.query_count,
    (
      ts_rank(
        setweight(to_tsvector('portuguese', coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.transliteration, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(d.definition, '')), 'B'),
        v_tsq
      ) + CASE WHEN d.title ILIKE '%' || p_query || '%' THEN 0.5 ELSE 0 END
    )::FLOAT4 AS rank
  FROM lampas_dictionary d
  WHERE
    (p_category IS NULL OR d.category = p_category)
    AND (
      (
        setweight(to_tsvector('portuguese', coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.transliteration, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(d.definition, '')), 'B') ||
        setweight(to_tsvector('portuguese', coalesce(d.etymology, '')), 'C')
      ) @@ v_tsq
      OR d.title           ILIKE '%' || p_query || '%'
      OR d.transliteration ILIKE '%' || p_query || '%'
      OR p_query            = ANY(d.tags)
      OR p_query            = ANY(d.related_terms)
    )
  ORDER BY rank DESC, d.query_count DESC, d.trust_level DESC
  LIMIT p_limit;
END;
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE lampas_dictionary          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_dictionary_versions ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado lê tudo (base de conhecimento compartilhada)
DROP POLICY IF EXISTS "dict_select"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_insert"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_update"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_delete"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_versions_select" ON lampas_dictionary_versions;
DROP POLICY IF EXISTS "dict_versions_insert" ON lampas_dictionary_versions;

CREATE POLICY "dict_select" ON lampas_dictionary
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "dict_insert" ON lampas_dictionary
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "dict_update" ON lampas_dictionary
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "dict_delete" ON lampas_dictionary
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "dict_versions_select" ON lampas_dictionary_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "dict_versions_insert" ON lampas_dictionary_versions
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── Grants ────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON lampas_dictionary          TO authenticated;
GRANT SELECT, INSERT                  ON lampas_dictionary_versions TO authenticated;
GRANT EXECUTE ON FUNCTION increment_dictionary_query_count TO authenticated;
GRANT EXECUTE ON FUNCTION search_dictionary                TO authenticated;
