-- Fix lib_get_commentaries: SECURITY INVOKER + RLS bloqueava usuários autenticados
-- Mudar para SECURITY DEFINER permite que a função rode com permissões do owner

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
SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION lib_get_commentaries TO authenticated;
