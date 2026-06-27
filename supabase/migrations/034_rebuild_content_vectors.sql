-- Reconstrói content_vector para todas as entradas existentes
-- Necessário quando dados foram importados sem passar pelo trigger.

UPDATE lib_entries
SET content_vector = to_tsvector(
  'english',
  COALESCE(heading, '') || ' ' || COALESCE(content, '')
)
WHERE content_vector IS NULL
   OR content_vector = ''::tsvector;
