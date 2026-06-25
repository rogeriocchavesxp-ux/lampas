-- 033_theological_library.sql
-- Biblioteca Teológica de Domínio Público
-- Coleção de comentários, dicionários, enciclopédias, léxicos e concordâncias

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- AUTORES
-- ============================================================
CREATE TABLE IF NOT EXISTS lib_authors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  birth_year   INT,
  death_year   INT,
  tradition    TEXT,   -- Reformed, Lutheran, Puritan, Anglican, Patristic, etc.
  nationality  TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lib_authors_name_idx ON lib_authors USING GIN (name gin_trgm_ops);

-- ============================================================
-- COLEÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS lib_collections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  display_order INT NOT NULL DEFAULT 0
);

-- ============================================================
-- OBRAS
-- ============================================================
CREATE TABLE IF NOT EXISTS lib_works (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  TEXT NOT NULL,
  subtitle               TEXT,
  author_id              UUID REFERENCES lib_authors(id),
  year_published         INT,
  language               TEXT NOT NULL DEFAULT 'en',
  collection_id          UUID REFERENCES lib_collections(id),
  work_type              TEXT NOT NULL,  -- commentary | dictionary | encyclopedia | lexicon | concordance | theology | hermeneutics | preaching | biography
  testament              TEXT,           -- OT | NT | both
  tradition              TEXT,           -- Reformed | Puritan | Lutheran | Anglican | Patristic | etc.
  period                 TEXT,           -- Patristic | Medieval | Reformation | Post-Reformation | 19th Century | 20th Century
  keywords               TEXT[],
  public_domain          BOOLEAN NOT NULL DEFAULT true,
  public_domain_status   TEXT NOT NULL DEFAULT 'confirmed',  -- confirmed | uncertain | not_public_domain
  public_domain_source   TEXT,
  source_url             TEXT,           -- URL principal da obra (Internet Archive, CCEL etc.)
  license                TEXT DEFAULT 'Public Domain',
  notes                  TEXT,
  total_volumes          INT NOT NULL DEFAULT 1,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lib_works_type_idx     ON lib_works (work_type);
CREATE INDEX IF NOT EXISTS lib_works_author_idx   ON lib_works (author_id);
CREATE INDEX IF NOT EXISTS lib_works_coll_idx     ON lib_works (collection_id);
CREATE INDEX IF NOT EXISTS lib_works_title_idx    ON lib_works USING GIN (title gin_trgm_ops);

-- ============================================================
-- VOLUMES
-- ============================================================
CREATE TABLE IF NOT EXISTS lib_volumes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id          UUID NOT NULL REFERENCES lib_works(id) ON DELETE CASCADE,
  volume_number    INT NOT NULL DEFAULT 1,
  title            TEXT,
  bible_book_start TEXT,   -- e.g. 'Genesis'
  bible_book_end   TEXT,   -- e.g. 'Deuteronomy'
  chapter_start    INT,
  chapter_end      INT,
  total_pages      INT,
  source_url       TEXT,   -- URL específica deste volume
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (work_id, volume_number)
);

CREATE INDEX IF NOT EXISTS lib_volumes_work_idx ON lib_volumes (work_id);

-- ============================================================
-- ARQUIVOS
-- ============================================================
CREATE TABLE IF NOT EXISTS lib_files (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id        UUID NOT NULL REFERENCES lib_volumes(id) ON DELETE CASCADE,
  file_type        TEXT NOT NULL,  -- pdf_original | pdf_processed | text_extracted | html
  storage_path     TEXT,           -- caminho no Supabase Storage ou filesystem local
  original_url     TEXT,           -- URL de download original
  file_size_bytes  BIGINT,
  file_hash        TEXT,           -- SHA-256
  page_count       INT,
  ocr_done         BOOLEAN NOT NULL DEFAULT false,
  ocr_quality      REAL,           -- 0.0 a 1.0
  text_extracted   BOOLEAN NOT NULL DEFAULT false,
  import_status    TEXT NOT NULL DEFAULT 'pending',  -- pending | downloading | processing | done | error
  error_message    TEXT,
  imported_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lib_files_volume_idx ON lib_files (volume_id);
CREATE INDEX IF NOT EXISTS lib_files_status_idx ON lib_files (import_status);

-- ============================================================
-- ENTRADAS (conteúdo indexável)
-- ============================================================
-- Cada linha é um verbete de dicionário, parágrafo de comentário,
-- entrada de concordância ou seção de léxico.
CREATE TABLE IF NOT EXISTS lib_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_id         UUID NOT NULL REFERENCES lib_volumes(id) ON DELETE CASCADE,
  entry_type        TEXT NOT NULL,  -- commentary | definition | article | concordance_entry | lexicon_entry | note
  heading           TEXT,           -- título do verbete ou seção
  content           TEXT NOT NULL,  -- texto completo
  content_vector    TSVECTOR,       -- mantido por trigger
  page_start        INT,
  page_end          INT,
  sequence          INT,            -- ordem dentro do volume
  -- Referência bíblica (para comentários e concordâncias)
  bible_book        TEXT,           -- 'Genesis', 'Romans', etc.
  bible_chapter     INT,
  bible_verse_start INT,
  bible_verse_end   INT,
  bible_ref         TEXT,           -- legível: 'Romans 8:1-4'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lib_entries_vector_idx
  ON lib_entries USING GIN (content_vector);

CREATE INDEX IF NOT EXISTS lib_entries_bible_idx
  ON lib_entries (bible_book, bible_chapter, bible_verse_start, bible_verse_end);

CREATE INDEX IF NOT EXISTS lib_entries_volume_seq_idx
  ON lib_entries (volume_id, sequence);

CREATE INDEX IF NOT EXISTS lib_entries_heading_trgm_idx
  ON lib_entries USING GIN (heading gin_trgm_ops);

-- ============================================================
-- ÍNDICE DE REFERÊNCIAS BÍBLICAS
-- ============================================================
-- Referências a passagens dentro de uma entrada (para busca cruzada).
CREATE TABLE IF NOT EXISTS lib_bible_refs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id         UUID NOT NULL REFERENCES lib_entries(id) ON DELETE CASCADE,
  bible_book       TEXT NOT NULL,
  chapter          INT,
  verse            INT,
  context_excerpt  TEXT   -- trecho do texto onde a referência aparece
);

CREATE INDEX IF NOT EXISTS lib_bible_refs_lookup_idx
  ON lib_bible_refs (bible_book, chapter, verse);

CREATE INDEX IF NOT EXISTS lib_bible_refs_entry_idx
  ON lib_bible_refs (entry_id);

-- ============================================================
-- LOG DE IMPORTAÇÃO
-- ============================================================
CREATE TABLE IF NOT EXISTS lib_import_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id           UUID REFERENCES lib_works(id),
  volume_id         UUID REFERENCES lib_volumes(id),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'running',  -- running | done | error
  total_entries     INT,
  imported_entries  INT DEFAULT 0,
  error_count       INT DEFAULT 0,
  log               JSONB
);

-- ============================================================
-- TRIGGER: manter content_vector
-- ============================================================
CREATE OR REPLACE FUNCTION lib_entries_update_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.content_vector := to_tsvector(
    'english',
    COALESCE(NEW.heading, '') || ' ' || COALESCE(NEW.content, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER lib_entries_vector_trigger
BEFORE INSERT OR UPDATE OF content, heading ON lib_entries
FOR EACH ROW EXECUTE FUNCTION lib_entries_update_vector();

-- ============================================================
-- RPCs
-- ============================================================

-- Busca full-text em toda a biblioteca
CREATE OR REPLACE FUNCTION lib_search(
  p_query        TEXT,
  p_work_type    TEXT DEFAULT NULL,
  p_tradition    TEXT DEFAULT NULL,
  p_bible_book   TEXT DEFAULT NULL,
  p_bible_chapter INT DEFAULT NULL,
  p_limit        INT DEFAULT 20
)
RETURNS TABLE (
  entry_id       UUID,
  work_id        UUID,
  work_title     TEXT,
  author_name    TEXT,
  volume_number  INT,
  heading        TEXT,
  content_excerpt TEXT,
  bible_ref      TEXT,
  work_type      TEXT,
  tradition      TEXT,
  year_published INT,
  rank           REAL
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id          AS entry_id,
    w.id          AS work_id,
    w.title       AS work_title,
    a.name        AS author_name,
    v.volume_number,
    e.heading,
    LEFT(e.content, 500) AS content_excerpt,
    e.bible_ref,
    w.work_type,
    w.tradition,
    w.year_published,
    ts_rank(e.content_vector, plainto_tsquery('english', p_query)) AS rank
  FROM lib_entries e
  JOIN lib_volumes v ON v.id = e.volume_id
  JOIN lib_works  w ON w.id = v.work_id
  LEFT JOIN lib_authors a ON a.id = w.author_id
  WHERE
    e.content_vector @@ plainto_tsquery('english', p_query)
    AND (p_work_type    IS NULL OR w.work_type  = p_work_type)
    AND (p_tradition    IS NULL OR w.tradition  = p_tradition)
    AND (p_bible_book   IS NULL OR e.bible_book = p_bible_book)
    AND (p_bible_chapter IS NULL OR e.bible_chapter = p_bible_chapter)
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$;

-- Busca comentários por passagem bíblica
CREATE OR REPLACE FUNCTION lib_get_commentaries(
  p_bible_book  TEXT,
  p_chapter     INT,
  p_verse       INT DEFAULT NULL
)
RETURNS TABLE (
  entry_id       UUID,
  work_id        UUID,
  work_title     TEXT,
  author_name    TEXT,
  tradition      TEXT,
  year_published INT,
  heading        TEXT,
  content        TEXT,
  bible_ref      TEXT,
  page_start     INT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id          AS entry_id,
    w.id          AS work_id,
    w.title       AS work_title,
    a.name        AS author_name,
    w.tradition,
    w.year_published,
    e.heading,
    e.content,
    e.bible_ref,
    e.page_start
  FROM lib_entries e
  JOIN lib_volumes v ON v.id = e.volume_id
  JOIN lib_works  w ON w.id = v.work_id
  LEFT JOIN lib_authors a ON a.id = w.author_id
  WHERE
    e.bible_book    = p_bible_book
    AND e.bible_chapter = p_chapter
    AND (
      p_verse IS NULL
      OR (
        e.bible_verse_start <= p_verse
        AND (e.bible_verse_end IS NULL OR e.bible_verse_end >= p_verse)
      )
    )
    AND w.work_type = 'commentary'
  ORDER BY w.year_published ASC, a.name ASC;
END;
$$;

-- Busca verbetes em dicionários e enciclopédias
CREATE OR REPLACE FUNCTION lib_search_refs(
  p_term       TEXT,
  p_work_types TEXT[] DEFAULT ARRAY['dictionary', 'encyclopedia', 'lexicon', 'concordance']
)
RETURNS TABLE (
  entry_id        UUID,
  work_id         UUID,
  work_title      TEXT,
  author_name     TEXT,
  heading         TEXT,
  content_excerpt TEXT,
  work_type       TEXT,
  year_published  INT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id          AS entry_id,
    w.id          AS work_id,
    w.title       AS work_title,
    a.name        AS author_name,
    e.heading,
    LEFT(e.content, 600) AS content_excerpt,
    w.work_type,
    w.year_published
  FROM lib_entries e
  JOIN lib_volumes v ON v.id = e.volume_id
  JOIN lib_works  w ON w.id = v.work_id
  LEFT JOIN lib_authors a ON a.id = w.author_id
  WHERE
    w.work_type = ANY(p_work_types)
    AND (
      e.heading ILIKE '%' || p_term || '%'
      OR e.content_vector @@ plainto_tsquery('english', p_term)
    )
  ORDER BY
    CASE
      WHEN lower(e.heading) = lower(p_term)      THEN 0
      WHEN e.heading ILIKE p_term || '%'          THEN 1
      WHEN e.heading ILIKE '%' || p_term || '%'   THEN 2
      ELSE 3
    END,
    w.year_published ASC
  LIMIT 30;
END;
$$;

-- Comparação de autores sobre uma passagem
CREATE OR REPLACE FUNCTION lib_compare_authors(
  p_bible_book TEXT,
  p_chapter    INT,
  p_verse      INT DEFAULT NULL
)
RETURNS TABLE (
  author_name    TEXT,
  work_title     TEXT,
  tradition      TEXT,
  year_published INT,
  content        TEXT,
  bible_ref      TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(a.name, 'Anônimo') AS author_name,
    w.title       AS work_title,
    w.tradition,
    w.year_published,
    e.content,
    e.bible_ref
  FROM lib_entries e
  JOIN lib_volumes v ON v.id = e.volume_id
  JOIN lib_works  w ON w.id = v.work_id
  LEFT JOIN lib_authors a ON a.id = w.author_id
  WHERE
    e.bible_book    = p_bible_book
    AND e.bible_chapter = p_chapter
    AND (
      p_verse IS NULL
      OR (
        e.bible_verse_start <= p_verse
        AND (e.bible_verse_end IS NULL OR e.bible_verse_end >= p_verse)
      )
    )
    AND w.work_type = 'commentary'
  ORDER BY w.year_published ASC;
END;
$$;

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE lib_authors      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_collections  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_works        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_volumes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_files        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_bible_refs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lib_import_log   ENABLE ROW LEVEL SECURITY;

-- Leitura pública para usuários autenticados
CREATE POLICY "lib_authors_read"     ON lib_authors     FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_collections_read" ON lib_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_works_read"       ON lib_works       FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_volumes_read"     ON lib_volumes     FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_entries_read"     ON lib_entries     FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_bible_refs_read"  ON lib_bible_refs  FOR SELECT TO authenticated USING (true);
CREATE POLICY "lib_files_read"       ON lib_files       FOR SELECT TO authenticated USING (true);

-- Import log: somente admin
CREATE POLICY "lib_import_log_admin" ON lib_import_log FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- GRANT para service_role (scripts de importação)
GRANT ALL ON lib_authors     TO service_role;
GRANT ALL ON lib_collections TO service_role;
GRANT ALL ON lib_works       TO service_role;
GRANT ALL ON lib_volumes     TO service_role;
GRANT ALL ON lib_files       TO service_role;
GRANT ALL ON lib_entries     TO service_role;
GRANT ALL ON lib_bible_refs  TO service_role;
GRANT ALL ON lib_import_log  TO service_role;

-- GRANT SELECT para authenticated (via RLS)
GRANT SELECT ON lib_authors     TO authenticated;
GRANT SELECT ON lib_collections TO authenticated;
GRANT SELECT ON lib_works       TO authenticated;
GRANT SELECT ON lib_volumes     TO authenticated;
GRANT SELECT ON lib_files       TO authenticated;
GRANT SELECT ON lib_entries     TO authenticated;
GRANT SELECT ON lib_bible_refs  TO authenticated;

-- GRANT EXECUTE nas RPCs
GRANT EXECUTE ON FUNCTION lib_search              TO authenticated;
GRANT EXECUTE ON FUNCTION lib_get_commentaries   TO authenticated;
GRANT EXECUTE ON FUNCTION lib_search_refs        TO authenticated;
GRANT EXECUTE ON FUNCTION lib_compare_authors    TO authenticated;

-- ============================================================
-- SEED: COLEÇÕES
-- ============================================================
INSERT INTO lib_collections (slug, name, description, display_order) VALUES
  ('comentarios',       'Comentários Bíblicos',    'Comentários exegéticos e devocionais',                    1),
  ('dicionarios',       'Dicionários Bíblicos',    'Dicionários de termos, nomes e lugares bíblicos',         2),
  ('enciclopedias',     'Enciclopédias Bíblicas',  'Enciclopédias de teologia, história e arqueologia',       3),
  ('lexicos',           'Léxicos',                 'Léxicos de hebraico e grego bíblico',                     4),
  ('concordancias',     'Concordâncias',           'Concordâncias e índices bíblicos',                        5),
  ('teologia',          'Teologia Sistemática',    'Obras de teologia sistemática e dogmática',               6),
  ('hermeneutica',      'Hermenêutica',            'Obras sobre interpretação bíblica',                       7),
  ('pregacao',          'Pregação',                'Obras sobre homilética e pregação',                       8),
  ('puritanos',         'Puritanos',               'Obras dos teólogos puritanos',                            9),
  ('reforma',           'Reforma Protestante',     'Obras dos reformadores protestantes',                    10),
  ('patristica',        'Patrística',              'Obras dos pais da igreja primitiva',                     11),
  ('historia',          'História da Igreja',      'História eclesiástica e denominacional',                 12),
  ('vida-crista',       'Vida Cristã',             'Obras de espiritualidade e piedade reformada',           13)
ON CONFLICT (slug) DO NOTHING;
