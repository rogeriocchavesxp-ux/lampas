-- Tabela de versículos bíblicos para versões de domínio público
-- ACF (Almeida Corrigida Fiel) é populada pelo script scripts/seed-bible-acf.mjs
-- Versões não-public-domain (ARA, NVI, etc.) são servidas via API.Bible

CREATE TABLE public.bible_verses (
  id        bigserial PRIMARY KEY,
  version   text NOT NULL,
  abbrev    text NOT NULL,
  book_name text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('AT', 'NT')),
  chapter   int NOT NULL,
  verse     int NOT NULL,
  text      text NOT NULL,
  UNIQUE(version, abbrev, chapter, verse)
);

CREATE INDEX idx_bible_verses_lookup ON public.bible_verses(version, abbrev, chapter);

ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bible_verses_public_read"
  ON public.bible_verses FOR SELECT
  TO anon, authenticated
  USING (true);
