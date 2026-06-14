-- 020_improvement_items.sql
-- Checklist de Melhorias gerado pelas avaliações da IA

CREATE TABLE IF NOT EXISTS improvement_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Contexto da avaliação
  section_slug   TEXT,
  section_label  TEXT,
  field_label    TEXT,
  -- Conteúdo do item
  title          TEXT NOT NULL,
  problem        TEXT,
  justification  TEXT,
  suggestion     TEXT,
  -- Estado
  done           BOOLEAN NOT NULL DEFAULT false,
  -- Timestamps
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE improvement_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "improvement_items_select" ON improvement_items FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "improvement_items_insert" ON improvement_items FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "improvement_items_update" ON improvement_items FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "improvement_items_delete" ON improvement_items FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX improvement_items_project_idx ON improvement_items (project_id, created_at DESC);
CREATE INDEX improvement_items_user_idx    ON improvement_items (user_id);

CREATE OR REPLACE FUNCTION fn_improvement_items_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_improvement_items_updated_at
  BEFORE UPDATE ON improvement_items
  FOR EACH ROW EXECUTE FUNCTION fn_improvement_items_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON improvement_items TO authenticated;
