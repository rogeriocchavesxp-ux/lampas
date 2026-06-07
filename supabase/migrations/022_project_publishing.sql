-- Lampas — Publicação interna de projetos
-- Nesta etapa, publicar significa exibir o projeto em "Meus Projetos".

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_projects_user_published
  ON public.projects (user_id, published, published_at DESC)
  WHERE deleted_at IS NULL;
