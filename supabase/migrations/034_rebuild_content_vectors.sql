-- Garante que a coluna content_vector existe (pode ter sido criada sem ela)
ALTER TABLE lib_entries
  ADD COLUMN IF NOT EXISTS content_vector TSVECTOR;

-- Recria o índice GIN se necessário
CREATE INDEX IF NOT EXISTS lib_entries_vector_idx
  ON lib_entries USING GIN (content_vector);

-- Recria o trigger de manutenção
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

DROP TRIGGER IF EXISTS lib_entries_vector_trigger ON lib_entries;
CREATE TRIGGER lib_entries_vector_trigger
BEFORE INSERT OR UPDATE OF content, heading ON lib_entries
FOR EACH ROW EXECUTE FUNCTION lib_entries_update_vector();

-- Popula para todas as entradas existentes
UPDATE lib_entries
SET content_vector = to_tsvector(
  'english',
  COALESCE(heading, '') || ' ' || COALESCE(content, '')
);
