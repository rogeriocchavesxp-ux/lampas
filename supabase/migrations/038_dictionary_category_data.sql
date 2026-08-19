-- ══════════════════════════════════════════════════════════════════════════
-- 038 — Dicionário: campo category_data para dados específicos por categoria
--
-- Contexto: verbetes de personagens seguem estrutura narrativa de Chisholm
-- (Alter, Berlin, Bar-Efrat) com campos próprios. Usar JSONB em vez de
-- misturar semântica nos campos genéricos (definition, etymology etc.).
-- ══════════════════════════════════════════════════════════════════════════

ALTER TABLE lampas_dictionary
  ADD COLUMN IF NOT EXISTS category_data jsonb;

-- Índice GIN para buscas dentro do JSONB
CREATE INDEX IF NOT EXISTS lampas_dictionary_cat_data_idx
  ON lampas_dictionary USING gin(category_data);

-- Atualizar full-text search para incluir campos de personagens
DROP INDEX IF EXISTS lampas_dictionary_fts_idx;
CREATE INDEX lampas_dictionary_fts_idx ON lampas_dictionary
  USING gin(
    to_tsvector('portuguese',
      coalesce(title, '') || ' ' ||
      coalesce(definition, '') || ' ' ||
      array_to_string(tags, ' ') || ' ' ||
      coalesce(category_data->>'identification', '') || ' ' ||
      coalesce(category_data->>'direct_characterization', '') || ' ' ||
      coalesce(category_data->>'indirect_characterization', '')
    )
  );
