-- 012_lampas_books.sql
-- Biblioteca Lampas — repositório de fontes teológicas reformadas

-- ── 1. Tabela principal de obras ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_books (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  title           TEXT NOT NULL,
  author          TEXT NOT NULL DEFAULT '',   -- autor principal (display)
  authors         TEXT[] NOT NULL DEFAULT '{}', -- múltiplos autores
  category        TEXT NOT NULL DEFAULT 'obras_classicas'
                  CHECK (category IN (
                    'comentarios_biblicos',
                    'dicionarios_lexicos',
                    'teologia_biblica',
                    'teologia_sistematica',
                    'historia_igreja',
                    'confissoes_catecismos',
                    'hermeneutica',
                    'homiletica',
                    'teologia_pastoral',
                    'obras_classicas'
                  )),
  year            SMALLINT,
  publisher       TEXT,
  language        TEXT NOT NULL DEFAULT 'pt'
                  CHECK (language IN ('pt', 'en', 'de', 'la', 'he', 'el', 'es', 'fr')),

  -- Conteúdo descritivo
  description     TEXT,
  bible_references TEXT[] NOT NULL DEFAULT '{}',   -- livros/passagens cobertos
  theological_topics TEXT[] NOT NULL DEFAULT '{}', -- tópicos doutrinários
  tags            TEXT[] NOT NULL DEFAULT '{}',

  -- Qualidade
  trust_level     SMALLINT NOT NULL DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 5),
  is_indexed      BOOLEAN  NOT NULL DEFAULT false, -- texto processado e indexado

  -- Arquivo (para upload futuro)
  file_path       TEXT,
  file_type       TEXT CHECK (file_type IN ('pdf', 'epub', 'docx') OR file_type IS NULL),

  -- Métricas
  query_count    INT NOT NULL DEFAULT 0,
  citation_count INT NOT NULL DEFAULT 0,

  -- Autoria
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS lampas_books_category_idx  ON lampas_books (category);
CREATE INDEX IF NOT EXISTS lampas_books_author_idx    ON lampas_books (lower(author));
CREATE INDEX IF NOT EXISTS lampas_books_refs_idx      ON lampas_books USING gin(bible_references);
CREATE INDEX IF NOT EXISTS lampas_books_topics_idx    ON lampas_books USING gin(theological_topics);
CREATE INDEX IF NOT EXISTS lampas_books_tags_idx      ON lampas_books USING gin(tags);

-- Full-text search
CREATE INDEX IF NOT EXISTS lampas_books_fts_idx ON lampas_books USING gin(
  (
    setweight(to_tsvector('portuguese', coalesce(title, '')),       'A') ||
    setweight(to_tsvector('simple',     coalesce(author, '')),      'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
  )
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION fn_books_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_books_updated_at ON lampas_books;
CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON lampas_books
  FOR EACH ROW EXECUTE FUNCTION fn_books_updated_at();

-- ── 2. Passagens de obras (trechos indexados) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_book_passages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id        UUID NOT NULL REFERENCES lampas_books(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  page_number    INT,
  chapter        TEXT,
  section        TEXT,
  bible_ref      TEXT,          -- ex: 'Gn 39:1-6', 'Rm 3:21-26'
  passage_index  INT NOT NULL DEFAULT 0,
  user_id        UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_passages_book_idx     ON lampas_book_passages (book_id, passage_index);
CREATE INDEX IF NOT EXISTS book_passages_ref_idx      ON lampas_book_passages (bible_ref);
CREATE INDEX IF NOT EXISTS book_passages_fts_idx ON lampas_book_passages USING gin(
  (
    setweight(to_tsvector('portuguese', coalesce(content, '')), 'A') ||
    setweight(to_tsvector('simple',     coalesce(bible_ref, '')), 'B')
  )
);

-- ── 3. Notas pessoais do usuário sobre obras ──────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_book_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id    UUID NOT NULL REFERENCES lampas_books(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text  TEXT NOT NULL,
  note_type  TEXT NOT NULL DEFAULT 'annotation'
             CHECK (note_type IN ('annotation', 'bookmark', 'citation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_notes_user_book_idx ON lampas_book_notes (user_id, book_id);

CREATE OR REPLACE FUNCTION fn_book_notes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_book_notes_updated_at ON lampas_book_notes;
CREATE TRIGGER trg_book_notes_updated_at
  BEFORE UPDATE ON lampas_book_notes
  FOR EACH ROW EXECUTE FUNCTION fn_book_notes_updated_at();

-- ── 4. RPCs ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_book_query_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE lampas_books SET query_count = query_count + 1 WHERE id = p_id;
END;
$$;

-- Busca unificada na biblioteca: por termo + filtro de categoria + referência bíblica
CREATE OR REPLACE FUNCTION search_library(
  p_query    TEXT    DEFAULT NULL,
  p_category TEXT    DEFAULT NULL,
  p_ref      TEXT    DEFAULT NULL,
  p_limit    INT     DEFAULT 30
)
RETURNS TABLE (
  id                UUID,
  title             TEXT,
  author            TEXT,
  category          TEXT,
  year              SMALLINT,
  language          TEXT,
  description       TEXT,
  bible_references  TEXT[],
  theological_topics TEXT[],
  trust_level       SMALLINT,
  query_count       INT,
  rank              FLOAT4
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tsq TSQUERY;
BEGIN
  IF p_query IS NOT NULL AND p_query <> '' THEN
    BEGIN
      v_tsq := websearch_to_tsquery('portuguese', p_query);
    EXCEPTION WHEN OTHERS THEN
      v_tsq := to_tsquery('simple', regexp_replace(trim(p_query), '\s+', ':* & ', 'g') || ':*');
    END;
  END IF;

  RETURN QUERY
  SELECT
    b.id, b.title, b.author, b.category, b.year, b.language,
    b.description, b.bible_references, b.theological_topics,
    b.trust_level, b.query_count,
    COALESCE(
      CASE WHEN v_tsq IS NOT NULL THEN
        ts_rank(
          setweight(to_tsvector('portuguese', coalesce(b.title, '')),       'A') ||
          setweight(to_tsvector('simple',     coalesce(b.author, '')),      'A') ||
          setweight(to_tsvector('portuguese', coalesce(b.description, '')), 'B'),
          v_tsq
        )
      ELSE 0 END
    , 0)::FLOAT4 AS rank
  FROM lampas_books b
  WHERE
    (p_category IS NULL OR b.category = p_category)
    AND (p_ref IS NULL OR p_ref = ANY(b.bible_references) OR b.bible_references @> ARRAY[p_ref])
    AND (
      v_tsq IS NULL
      OR (
        setweight(to_tsvector('portuguese', coalesce(b.title, '')),       'A') ||
        setweight(to_tsvector('simple',     coalesce(b.author, '')),      'A') ||
        setweight(to_tsvector('portuguese', coalesce(b.description, '')), 'B')
      ) @@ v_tsq
      OR b.title  ILIKE '%' || p_query || '%'
      OR b.author ILIKE '%' || p_query || '%'
      OR p_query = ANY(b.theological_topics)
      OR p_query = ANY(b.tags)
    )
  ORDER BY rank DESC, b.trust_level DESC, b.query_count DESC
  LIMIT p_limit;
END;
$$;

-- Busca de passagens por referência bíblica
CREATE OR REPLACE FUNCTION search_passages_by_ref(
  p_ref   TEXT,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  passage_id    UUID,
  book_id       UUID,
  book_title    TEXT,
  book_author   TEXT,
  book_category TEXT,
  content       TEXT,
  page_number   INT,
  chapter       TEXT,
  section       TEXT,
  bible_ref     TEXT
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.book_id, b.title, b.author, b.category,
    p.content, p.page_number, p.chapter, p.section, p.bible_ref
  FROM lampas_book_passages p
  JOIN lampas_books b ON b.id = p.book_id
  WHERE p.bible_ref ILIKE '%' || p_ref || '%'
  ORDER BY b.trust_level DESC, p.passage_index
  LIMIT p_limit;
END;
$$;

-- ── 5. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE lampas_books         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_book_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_book_notes    ENABLE ROW LEVEL SECURITY;

-- Livros: qualquer autenticado lê, dono gerencia
DROP POLICY IF EXISTS "books_select" ON lampas_books;
DROP POLICY IF EXISTS "books_insert" ON lampas_books;
DROP POLICY IF EXISTS "books_update" ON lampas_books;
DROP POLICY IF EXISTS "books_delete" ON lampas_books;

CREATE POLICY "books_select" ON lampas_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "books_insert" ON lampas_books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "books_update" ON lampas_books FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "books_delete" ON lampas_books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Passagens: qualquer autenticado lê, dono gerencia
DROP POLICY IF EXISTS "passages_select" ON lampas_book_passages;
DROP POLICY IF EXISTS "passages_insert" ON lampas_book_passages;
DROP POLICY IF EXISTS "passages_delete" ON lampas_book_passages;

CREATE POLICY "passages_select" ON lampas_book_passages FOR SELECT TO authenticated USING (true);
CREATE POLICY "passages_insert" ON lampas_book_passages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "passages_delete" ON lampas_book_passages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Notas: cada usuário vê e gerencia apenas as suas
DROP POLICY IF EXISTS "notes_select" ON lampas_book_notes;
DROP POLICY IF EXISTS "notes_insert" ON lampas_book_notes;
DROP POLICY IF EXISTS "notes_update" ON lampas_book_notes;
DROP POLICY IF EXISTS "notes_delete" ON lampas_book_notes;

CREATE POLICY "notes_select" ON lampas_book_notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notes_insert" ON lampas_book_notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes_update" ON lampas_book_notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notes_delete" ON lampas_book_notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── 6. Grants ─────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON lampas_books         TO authenticated;
GRANT SELECT, INSERT, DELETE          ON lampas_book_passages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON lampas_book_notes   TO authenticated;
GRANT EXECUTE ON FUNCTION increment_book_query_count  TO authenticated;
GRANT EXECUTE ON FUNCTION search_library              TO authenticated;
GRANT EXECUTE ON FUNCTION search_passages_by_ref      TO authenticated;
