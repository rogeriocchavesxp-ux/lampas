-- Sprint 1: Study Mode Adaptativo
-- Adiciona study_mode e meta aos projetos
-- study_mode substitui project_type como campo semântico principal
-- project_type mantido para compatibilidade com código existente

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS study_mode TEXT,
  ADD COLUMN IF NOT EXISTS meta       JSONB DEFAULT '{}';

-- Preenche study_mode a partir de project_type para projetos existentes
UPDATE projects SET study_mode = CASE project_type
  WHEN 'exegese'            THEN 'exegese_biblica'
  WHEN 'sermao'             THEN 'sermao'
  WHEN 'devocional'         THEN 'devocional'
  WHEN 'estudo_biblico'     THEN 'estudo_biblico'
  WHEN 'estudo_doutrinario' THEN 'estudo_doutrinario'
  WHEN 'pesquisa_teologica' THEN 'exegese_biblica'
  ELSE 'exegese_biblica'
END
WHERE study_mode IS NULL;

-- Check constraint para os 8 modos
ALTER TABLE projects
  ADD CONSTRAINT projects_study_mode_check
  CHECK (study_mode IS NULL OR study_mode IN (
    'exegese_biblica',
    'estudo_de_carta',
    'estudo_doutrinario',
    'estudo_tematico',
    'sermao',
    'estudo_biblico',
    'devocional',
    'comentario_exegetico'
  ));

-- Remove constraint de project_type (campo legado — study_mode é o canônico)
-- Permite qualquer valor em project_type sem violar o schema
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
