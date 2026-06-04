-- Expande o constraint de study_mode para suportar os dois novos modos:
-- estudo_de_salmos_sabedoria e estudo_de_profecias.
-- estudo_biblico é mantido para compatibilidade com projetos existentes.

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_study_mode_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_study_mode_check
  CHECK (study_mode IS NULL OR study_mode IN (
    'exegese_biblica',
    'estudo_de_carta',
    'estudo_de_salmos_sabedoria',
    'estudo_de_profecias',
    'estudo_doutrinario',
    'estudo_tematico',
    'sermao',
    'estudo_biblico',
    'devocional',
    'comentario_exegetico'
  ));
