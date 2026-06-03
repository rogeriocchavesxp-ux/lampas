-- Add project_type to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_type TEXT NOT NULL DEFAULT 'exegese';

-- Optional: add a check constraint for valid types
ALTER TABLE projects
  ADD CONSTRAINT projects_project_type_check
  CHECK (project_type IN (
    'exegese',
    'sermao',
    'estudo_biblico',
    'estudo_doutrinario',
    'devocional',
    'pesquisa_teologica'
  ));
