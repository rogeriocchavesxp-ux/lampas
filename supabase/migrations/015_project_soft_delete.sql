-- Soft-delete para projetos
-- Permite excluir estudos da Biblioteca com possibilidade de restauração futura

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_deleted_at
  ON public.projects (deleted_at)
  WHERE deleted_at IS NULL;
