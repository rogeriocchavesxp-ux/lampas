-- Lampas — Estudo de Termos como modo próprio
-- Adiciona study_mode nativo para estudos lexicais e teológicos de termos.

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_study_mode_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_study_mode_check
  CHECK (
    study_mode IS NULL OR study_mode IN (
      'exegese_biblica',
      'estudo_de_carta',
      'estudo_de_salmos_sabedoria',
      'estudo_de_profecias',
      'estudo_narrativas',
      'estudo_doutrinario',
      'estudo_tematico',
      'estudo_termos',
      'sermao',
      'estudo_biblico',
      'devocional',
      'comentario_exegetico',
      'aula',
      'artigo',
      'ebook',
      'livro',
      'palestra',
      'curso',
      'serie_mensagens'
    )
  );
