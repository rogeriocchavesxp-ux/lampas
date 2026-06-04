-- Adiciona flag is_demo à tabela projects
-- Identifica projetos guiados criados pelo onboarding

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
