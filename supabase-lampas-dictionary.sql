-- ══════════════════════════════════════════════════════════════════════════
-- Dicionário Lampas — Base de Conhecimento Viva
-- Executar no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS lampas_dictionary (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identidade
  title           text        NOT NULL,
  category        text        NOT NULL DEFAULT 'termo_biblico',
  -- categorias: termo_biblico | personagem | lugar | doutrina | tema | conceito_historico | lingua_original

  trust_level     smallint    NOT NULL DEFAULT 1,
  -- 1 = gerado por IA  2 = revisado por IA  3 = revisado pelo admin  4 = oficial Lampas

  -- Conteúdo principal
  definition      text,
  etymology       text,

  -- Línguas originais
  lang_hebrew     text,
  lang_aramaic    text,
  lang_greek      text,
  transliteration text,
  pronunciation   text,

  -- Uso bíblico
  occurrences     text,
  main_texts      text,

  -- Teologia
  theological_biblical    text,
  theological_systematic  text,
  applications            text,

  -- Relacionamentos
  cross_references  text[]  DEFAULT '{}',
  bibliography      text,
  related_terms     text[]  DEFAULT '{}',
  tags              text[]  DEFAULT '{}',

  -- Metadados
  sources         text[]  NOT NULL DEFAULT ARRAY['IA'],
  query_count     int     NOT NULL DEFAULT 0,
  citation_count  int     NOT NULL DEFAULT 0,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS lampas_dictionary_user_idx  ON lampas_dictionary(user_id);
CREATE INDEX IF NOT EXISTS lampas_dictionary_title_idx ON lampas_dictionary USING gin(to_tsvector('portuguese', title));
CREATE INDEX IF NOT EXISTS lampas_dictionary_tags_idx  ON lampas_dictionary USING gin(tags);
CREATE INDEX IF NOT EXISTS lampas_dictionary_cat_idx   ON lampas_dictionary(category);

-- Full-text search index (title + definition)
CREATE INDEX IF NOT EXISTS lampas_dictionary_fts_idx ON lampas_dictionary
  USING gin(to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(definition,'')));

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_lampas_dictionary_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lampas_dictionary_updated_at ON lampas_dictionary;
CREATE TRIGGER lampas_dictionary_updated_at
  BEFORE UPDATE ON lampas_dictionary
  FOR EACH ROW EXECUTE FUNCTION update_lampas_dictionary_timestamp();

-- RLS
ALTER TABLE lampas_dictionary ENABLE ROW LEVEL SECURITY;

-- Usuário vê os próprios verbetes + verbetes globais (trust_level >= 4)
DROP POLICY IF EXISTS "dic_select" ON lampas_dictionary;
CREATE POLICY "dic_select" ON lampas_dictionary FOR SELECT
  USING (auth.uid() = user_id OR trust_level >= 4);

DROP POLICY IF EXISTS "dic_insert" ON lampas_dictionary;
CREATE POLICY "dic_insert" ON lampas_dictionary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dic_update" ON lampas_dictionary;
CREATE POLICY "dic_update" ON lampas_dictionary FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dic_delete" ON lampas_dictionary;
CREATE POLICY "dic_delete" ON lampas_dictionary FOR DELETE
  USING (auth.uid() = user_id);

-- Função de busca full-text
CREATE OR REPLACE FUNCTION search_lampas_dictionary(
  p_user_id uuid,
  p_query   text,
  p_limit   int DEFAULT 20
)
RETURNS SETOF lampas_dictionary
LANGUAGE sql STABLE AS $$
  SELECT * FROM lampas_dictionary
  WHERE (user_id = p_user_id OR trust_level >= 4)
    AND (
      p_query = '' OR
      to_tsvector('portuguese', coalesce(title,'') || ' ' || coalesce(definition,'') || ' ' || array_to_string(tags,' '))
      @@ plainto_tsquery('portuguese', p_query)
      OR title ILIKE '%' || p_query || '%'
    )
  ORDER BY
    CASE WHEN title ILIKE p_query THEN 0
         WHEN title ILIKE p_query || '%' THEN 1
         ELSE 2
    END,
    query_count DESC,
    updated_at DESC
  LIMIT p_limit;
$$;

-- Função incrementar query_count
CREATE OR REPLACE FUNCTION increment_dictionary_query_count(p_id uuid)
RETURNS void LANGUAGE sql AS $$
  UPDATE lampas_dictionary SET query_count = query_count + 1, updated_at = now() WHERE id = p_id;
$$;
