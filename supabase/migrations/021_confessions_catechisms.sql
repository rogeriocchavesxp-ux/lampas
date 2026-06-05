-- Lampas — Confissões de Fé e Catecismos como camada estrutural
-- Não substitui Biblioteca/Dicionário: cria uma camada própria, consultável por
-- documento, capítulo/pergunta, doutrina e referência bíblica.

CREATE TABLE IF NOT EXISTS public.lampas_confessional_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  kind        text NOT NULL CHECK (kind IN ('confession', 'catechism', 'canons')),
  title       text NOT NULL,
  short_title text NOT NULL,
  tradition   text NOT NULL DEFAULT 'Reformada',
  language    text NOT NULL DEFAULT 'pt',
  sort_order  int  NOT NULL DEFAULT 0,
  is_shared   boolean NOT NULL DEFAULT true,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lampas_confessional_sections (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      uuid NOT NULL REFERENCES public.lampas_confessional_documents(id) ON DELETE CASCADE,
  number_label     text NOT NULL,
  title            text NOT NULL,
  content          text,
  summary          text,
  doctrine_tags    text[] NOT NULL DEFAULT '{}',
  bible_references text[] NOT NULL DEFAULT '{}',
  dictionary_terms text[] NOT NULL DEFAULT '{}',
  sort_order       int NOT NULL DEFAULT 0,
  metadata         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, number_label)
);

CREATE TABLE IF NOT EXISTS public.lampas_confessional_questions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id      uuid NOT NULL REFERENCES public.lampas_confessional_documents(id) ON DELETE CASCADE,
  number           int NOT NULL,
  number_label     text NOT NULL,
  question         text NOT NULL,
  answer           text,
  explanation      text,
  doctrine_tags    text[] NOT NULL DEFAULT '{}',
  bible_references text[] NOT NULL DEFAULT '{}',
  dictionary_terms text[] NOT NULL DEFAULT '{}',
  sort_order       int NOT NULL DEFAULT 0,
  metadata         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, number)
);

CREATE TABLE IF NOT EXISTS public.lampas_confessional_dictionary_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.lampas_confessional_documents(id) ON DELETE CASCADE,
  section_id  uuid REFERENCES public.lampas_confessional_sections(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.lampas_confessional_questions(id) ON DELETE CASCADE,
  term        text NOT NULL,
  dictionary_entry_id uuid REFERENCES public.lampas_dictionary(id) ON DELETE SET NULL,
  relation_type text NOT NULL DEFAULT 'related_to',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (section_id IS NOT NULL OR question_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.lampas_confessional_doctrine_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.lampas_confessional_documents(id) ON DELETE CASCADE,
  section_id  uuid REFERENCES public.lampas_confessional_sections(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.lampas_confessional_questions(id) ON DELETE CASCADE,
  doctrine    text NOT NULL,
  study_mode  text NOT NULL DEFAULT 'estudo_doutrinario',
  relation_type text NOT NULL DEFAULT 'formulates',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (section_id IS NOT NULL OR question_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS confessional_documents_kind_idx
  ON public.lampas_confessional_documents(kind, sort_order);

CREATE INDEX IF NOT EXISTS confessional_sections_document_idx
  ON public.lampas_confessional_sections(document_id, sort_order);

CREATE INDEX IF NOT EXISTS confessional_questions_document_idx
  ON public.lampas_confessional_questions(document_id, sort_order);

CREATE INDEX IF NOT EXISTS confessional_sections_doctrine_idx
  ON public.lampas_confessional_sections USING gin(doctrine_tags);

CREATE INDEX IF NOT EXISTS confessional_questions_doctrine_idx
  ON public.lampas_confessional_questions USING gin(doctrine_tags);

CREATE INDEX IF NOT EXISTS confessional_sections_bible_idx
  ON public.lampas_confessional_sections USING gin(bible_references);

CREATE INDEX IF NOT EXISTS confessional_questions_bible_idx
  ON public.lampas_confessional_questions USING gin(bible_references);

CREATE INDEX IF NOT EXISTS confessional_dictionary_links_term_idx
  ON public.lampas_confessional_dictionary_links(lower(term));

CREATE INDEX IF NOT EXISTS confessional_doctrine_links_doctrine_idx
  ON public.lampas_confessional_doctrine_links(lower(doctrine));

CREATE UNIQUE INDEX IF NOT EXISTS confessional_doctrine_links_section_unique_idx
  ON public.lampas_confessional_doctrine_links(document_id, section_id, lower(doctrine))
  WHERE section_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS confessional_doctrine_links_question_unique_idx
  ON public.lampas_confessional_doctrine_links(document_id, question_id, lower(doctrine))
  WHERE question_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS confessional_dictionary_links_section_unique_idx
  ON public.lampas_confessional_dictionary_links(document_id, section_id, lower(term))
  WHERE section_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS confessional_dictionary_links_question_unique_idx
  ON public.lampas_confessional_dictionary_links(document_id, question_id, lower(term))
  WHERE question_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS confessional_sections_fts_idx
  ON public.lampas_confessional_sections USING gin(
    (
      setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
      setweight(to_tsvector('portuguese', coalesce(content, '')), 'C')
    )
  );

CREATE INDEX IF NOT EXISTS confessional_questions_fts_idx
  ON public.lampas_confessional_questions USING gin(
    (
      setweight(to_tsvector('portuguese', coalesce(question, '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce(answer, '')), 'B') ||
      setweight(to_tsvector('portuguese', coalesce(explanation, '')), 'C')
    )
  );

CREATE OR REPLACE FUNCTION public.fn_confessional_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_confessional_documents_updated_at ON public.lampas_confessional_documents;
CREATE TRIGGER trg_confessional_documents_updated_at
  BEFORE UPDATE ON public.lampas_confessional_documents
  FOR EACH ROW EXECUTE FUNCTION public.fn_confessional_updated_at();

DROP TRIGGER IF EXISTS trg_confessional_sections_updated_at ON public.lampas_confessional_sections;
CREATE TRIGGER trg_confessional_sections_updated_at
  BEFORE UPDATE ON public.lampas_confessional_sections
  FOR EACH ROW EXECUTE FUNCTION public.fn_confessional_updated_at();

DROP TRIGGER IF EXISTS trg_confessional_questions_updated_at ON public.lampas_confessional_questions;
CREATE TRIGGER trg_confessional_questions_updated_at
  BEFORE UPDATE ON public.lampas_confessional_questions
  FOR EACH ROW EXECUTE FUNCTION public.fn_confessional_updated_at();

CREATE OR REPLACE VIEW public.v_lampas_confessional_areas AS
SELECT
  CASE WHEN kind = 'catechism' THEN 'Catecismos' ELSE 'Confissões' END AS area,
  kind,
  id,
  slug,
  title,
  short_title,
  sort_order
FROM public.lampas_confessional_documents
ORDER BY CASE WHEN kind = 'catechism' THEN 2 ELSE 1 END, sort_order;

CREATE OR REPLACE FUNCTION public.search_confessional_items(
  p_query text DEFAULT NULL,
  p_doctrine text DEFAULT NULL,
  p_bible_ref text DEFAULT NULL,
  p_kind text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  document_title text,
  document_slug text,
  kind text,
  item_type text,
  number_label text,
  title text,
  content text,
  doctrine_tags text[],
  bible_references text[],
  dictionary_terms text[],
  rank float4
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_query text := nullif(trim(coalesce(p_query, '')), '');
  v_tsq tsquery;
BEGIN
  IF v_query IS NOT NULL THEN
    BEGIN
      v_tsq := websearch_to_tsquery('portuguese', v_query);
    EXCEPTION WHEN OTHERS THEN
      v_tsq := plainto_tsquery('portuguese', v_query);
    END;
  END IF;

  RETURN QUERY
  WITH section_hits AS (
    SELECT
      s.id,
      s.document_id,
      d.title AS document_title,
      d.slug AS document_slug,
      d.kind,
      'chapter'::text AS item_type,
      s.number_label,
      s.title,
      coalesce(s.content, s.summary, '') AS content,
      s.doctrine_tags,
      s.bible_references,
      s.dictionary_terms,
      (
        CASE WHEN v_query IS NULL THEN 0 ELSE
          ts_rank(
            setweight(to_tsvector('portuguese', coalesce(s.title, '')), 'A') ||
            setweight(to_tsvector('portuguese', coalesce(s.summary, '')), 'B') ||
            setweight(to_tsvector('portuguese', coalesce(s.content, '')), 'C'),
            v_tsq
          )
        END
        + CASE WHEN p_doctrine IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(s.doctrine_tags) tag WHERE lower(tag) ILIKE '%' || lower(p_doctrine) || '%'
          ) THEN 1.0 ELSE 0 END
        + CASE WHEN p_bible_ref IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(s.bible_references) ref WHERE lower(ref) ILIKE '%' || lower(p_bible_ref) || '%'
          ) THEN 0.8 ELSE 0 END
      )::float4 AS rank
    FROM public.lampas_confessional_sections s
    JOIN public.lampas_confessional_documents d ON d.id = s.document_id
    WHERE
      (p_kind IS NULL OR d.kind = p_kind)
      AND (
        v_query IS NULL OR
        (
          setweight(to_tsvector('portuguese', coalesce(s.title, '')), 'A') ||
          setweight(to_tsvector('portuguese', coalesce(s.summary, '')), 'B') ||
          setweight(to_tsvector('portuguese', coalesce(s.content, '')), 'C')
        ) @@ v_tsq OR s.title ILIKE '%' || v_query || '%'
      )
      AND (
        p_doctrine IS NULL OR EXISTS (
          SELECT 1 FROM unnest(s.doctrine_tags) tag WHERE lower(tag) ILIKE '%' || lower(p_doctrine) || '%'
        )
      )
      AND (
        p_bible_ref IS NULL OR EXISTS (
          SELECT 1 FROM unnest(s.bible_references) ref WHERE lower(ref) ILIKE '%' || lower(p_bible_ref) || '%'
        )
      )
  ),
  question_hits AS (
    SELECT
      q.id,
      q.document_id,
      d.title AS document_title,
      d.slug AS document_slug,
      d.kind,
      'question'::text AS item_type,
      q.number_label,
      q.question AS title,
      coalesce(q.answer, q.explanation, '') AS content,
      q.doctrine_tags,
      q.bible_references,
      q.dictionary_terms,
      (
        CASE WHEN v_query IS NULL THEN 0 ELSE
          ts_rank(
            setweight(to_tsvector('portuguese', coalesce(q.question, '')), 'A') ||
            setweight(to_tsvector('portuguese', coalesce(q.answer, '')), 'B') ||
            setweight(to_tsvector('portuguese', coalesce(q.explanation, '')), 'C'),
            v_tsq
          )
        END
        + CASE WHEN p_doctrine IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(q.doctrine_tags) tag WHERE lower(tag) ILIKE '%' || lower(p_doctrine) || '%'
          ) THEN 1.0 ELSE 0 END
        + CASE WHEN p_bible_ref IS NOT NULL AND EXISTS (
            SELECT 1 FROM unnest(q.bible_references) ref WHERE lower(ref) ILIKE '%' || lower(p_bible_ref) || '%'
          ) THEN 0.8 ELSE 0 END
      )::float4 AS rank
    FROM public.lampas_confessional_questions q
    JOIN public.lampas_confessional_documents d ON d.id = q.document_id
    WHERE
      (p_kind IS NULL OR d.kind = p_kind)
      AND (
        v_query IS NULL OR
        (
          setweight(to_tsvector('portuguese', coalesce(q.question, '')), 'A') ||
          setweight(to_tsvector('portuguese', coalesce(q.answer, '')), 'B') ||
          setweight(to_tsvector('portuguese', coalesce(q.explanation, '')), 'C')
        ) @@ v_tsq OR q.question ILIKE '%' || v_query || '%'
      )
      AND (
        p_doctrine IS NULL OR EXISTS (
          SELECT 1 FROM unnest(q.doctrine_tags) tag WHERE lower(tag) ILIKE '%' || lower(p_doctrine) || '%'
        )
      )
      AND (
        p_bible_ref IS NULL OR EXISTS (
          SELECT 1 FROM unnest(q.bible_references) ref WHERE lower(ref) ILIKE '%' || lower(p_bible_ref) || '%'
        )
      )
  )
  SELECT * FROM section_hits
  UNION ALL
  SELECT * FROM question_hits
  ORDER BY rank DESC, document_title ASC, number_label ASC
  LIMIT coalesce(p_limit, 20);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_confessional_suggestions(
  p_doctrine text,
  p_limit int DEFAULT 8
)
RETURNS TABLE (
  document_title text,
  document_slug text,
  kind text,
  item_type text,
  number_label text,
  title text,
  content text,
  doctrine_tags text[],
  bible_references text[],
  relevance int
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.document_title,
    r.document_slug,
    r.kind,
    r.item_type,
    r.number_label,
    r.title,
    r.content,
    r.doctrine_tags,
    r.bible_references,
    (r.rank * 100)::int AS relevance
  FROM public.search_confessional_items(NULL, p_doctrine, NULL, NULL, p_limit) r
  ORDER BY r.rank DESC, r.document_title, r.number_label
  LIMIT coalesce(p_limit, 8);
END;
$$;

ALTER TABLE public.lampas_confessional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampas_confessional_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampas_confessional_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampas_confessional_dictionary_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampas_confessional_doctrine_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "confessional_documents_select" ON public.lampas_confessional_documents;
DROP POLICY IF EXISTS "confessional_sections_select" ON public.lampas_confessional_sections;
DROP POLICY IF EXISTS "confessional_questions_select" ON public.lampas_confessional_questions;
DROP POLICY IF EXISTS "confessional_dictionary_links_select" ON public.lampas_confessional_dictionary_links;
DROP POLICY IF EXISTS "confessional_doctrine_links_select" ON public.lampas_confessional_doctrine_links;

CREATE POLICY "confessional_documents_select" ON public.lampas_confessional_documents
  FOR SELECT TO authenticated USING (is_shared = true);

CREATE POLICY "confessional_sections_select" ON public.lampas_confessional_sections
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.lampas_confessional_documents d
      WHERE d.id = document_id AND d.is_shared = true
    )
  );

CREATE POLICY "confessional_questions_select" ON public.lampas_confessional_questions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.lampas_confessional_documents d
      WHERE d.id = document_id AND d.is_shared = true
    )
  );

CREATE POLICY "confessional_dictionary_links_select" ON public.lampas_confessional_dictionary_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "confessional_doctrine_links_select" ON public.lampas_confessional_doctrine_links
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.lampas_confessional_documents TO authenticated;
GRANT SELECT ON public.lampas_confessional_sections TO authenticated;
GRANT SELECT ON public.lampas_confessional_questions TO authenticated;
GRANT SELECT ON public.lampas_confessional_dictionary_links TO authenticated;
GRANT SELECT ON public.lampas_confessional_doctrine_links TO authenticated;
GRANT SELECT ON public.v_lampas_confessional_areas TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_confessional_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_confessional_suggestions TO authenticated;

INSERT INTO public.lampas_confessional_documents (slug, kind, title, short_title, sort_order, metadata)
VALUES
  ('confissao-fe-westminster', 'confession', 'Confissão de Fé de Westminster', 'CFW', 10, '{"area":"Confissões"}'),
  ('confissao-belga', 'confession', 'Confissão Belga', 'Confissão Belga', 20, '{"area":"Confissões"}'),
  ('canones-de-dort', 'canons', 'Cânones de Dort', 'Dort', 30, '{"area":"Confissões"}'),
  ('catecismo-maior-westminster', 'catechism', 'Catecismo Maior de Westminster', 'CMW', 110, '{"area":"Catecismos"}'),
  ('catecismo-menor-westminster', 'catechism', 'Catecismo Menor de Westminster', 'CMW menor', 120, '{"area":"Catecismos"}'),
  ('catecismo-heidelberg', 'catechism', 'Catecismo de Heidelberg', 'Heidelberg', 130, '{"area":"Catecismos"}')
ON CONFLICT (slug) DO UPDATE SET
  kind = EXCLUDED.kind,
  title = EXCLUDED.title,
  short_title = EXCLUDED.short_title,
  sort_order = EXCLUDED.sort_order,
  metadata = public.lampas_confessional_documents.metadata || EXCLUDED.metadata;

WITH docs AS (
  SELECT id, slug FROM public.lampas_confessional_documents
)
INSERT INTO public.lampas_confessional_sections
  (document_id, number_label, title, summary, doctrine_tags, bible_references, dictionary_terms, sort_order, metadata)
SELECT docs.id, seed.number_label, seed.title, seed.summary, seed.doctrine_tags, seed.bible_references, seed.dictionary_terms, seed.sort_order, seed.metadata
FROM docs
JOIN (
  VALUES
    ('confissao-fe-westminster', 'XI', 'Da Justificação', 'Formula a justificação como ato da livre graça de Deus, recebido pela fé, com base na justiça de Cristo imputada.', ARRAY['justificação','fé','imputação','soteriologia'], ARRAY['Romanos 3.24','Romanos 4.5-8','2 Coríntios 5.21'], ARRAY['justificação','fé','graça'], 110, '{"structural_seed":true}'::jsonb),
    ('confissao-fe-westminster', 'XIII', 'Da Santificação', 'Ensina a santificação real e progressiva dos chamados eficazmente, pela Palavra e pelo Espírito, em união com Cristo.', ARRAY['santificação','vida cristã','união com Cristo'], ARRAY['1 Tessalonicenses 5.23','2 Coríntios 7.1','Romanos 6.6'], ARRAY['santificação','união com Cristo'], 130, '{"structural_seed":true}'::jsonb),
    ('confissao-belga', '22', 'Da Justificação pela fé em Jesus Cristo', 'Apresenta a fé em Cristo como meio pelo qual recebemos a verdadeira justiça, sem confiar em méritos próprios.', ARRAY['justificação','fé','Cristo'], ARRAY['Romanos 3.28','Gálatas 2.16'], ARRAY['justificação','fé'], 220, '{"structural_seed":true}'::jsonb),
    ('confissao-belga', '24', 'Da Santificação e das boas obras', 'Relaciona fé verdadeira, regeneração, boas obras e gratidão, rejeitando mérito humano.', ARRAY['santificação','boas obras','regeneração'], ARRAY['Efésios 2.10','Tiago 2.17'], ARRAY['santificação','boas obras'], 240, '{"structural_seed":true}'::jsonb),
    ('canones-de-dort', 'I', 'Da divina eleição e reprovação', 'Define a eleição graciosa de Deus e responde aos erros remonstrantes.', ARRAY['eleição','predestinação','graça'], ARRAY['Efésios 1.4-6','Romanos 9.11-16'], ARRAY['eleição','predestinação'], 310, '{"structural_seed":true}'::jsonb),
    ('canones-de-dort', 'V', 'Da perseverança dos santos', 'Ensina que Deus preserva os eleitos na fé, apesar de quedas reais, por sua graça eficaz.', ARRAY['perseverança','segurança','graça'], ARRAY['João 10.28','Filipenses 1.6'], ARRAY['perseverança','graça'], 350, '{"structural_seed":true}'::jsonb)
) AS seed(slug, number_label, title, summary, doctrine_tags, bible_references, dictionary_terms, sort_order, metadata)
  ON seed.slug = docs.slug
ON CONFLICT (document_id, number_label) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  doctrine_tags = EXCLUDED.doctrine_tags,
  bible_references = EXCLUDED.bible_references,
  dictionary_terms = EXCLUDED.dictionary_terms,
  sort_order = EXCLUDED.sort_order,
  metadata = public.lampas_confessional_sections.metadata || EXCLUDED.metadata;

WITH docs AS (
  SELECT id, slug FROM public.lampas_confessional_documents
)
INSERT INTO public.lampas_confessional_questions
  (document_id, number, number_label, question, answer, explanation, doctrine_tags, bible_references, dictionary_terms, sort_order, metadata)
SELECT docs.id, seed.number, seed.number_label, seed.question, seed.answer, seed.explanation, seed.doctrine_tags, seed.bible_references, seed.dictionary_terms, seed.sort_order, seed.metadata
FROM docs
JOIN (
  VALUES
    ('catecismo-menor-westminster', 33, '33', 'Que é justificação?', 'Justificação é um ato da livre graça de Deus, pelo qual ele perdoa todos os nossos pecados e nos aceita como justos diante dele, somente pela justiça de Cristo imputada a nós e recebida pela fé somente.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['justificação','fé','imputação','soteriologia'], ARRAY['Romanos 3.24','Romanos 4.6-8','2 Coríntios 5.21'], ARRAY['justificação','fé','graça'], 33, '{"structural_seed":true}'::jsonb),
    ('catecismo-menor-westminster', 35, '35', 'Que é santificação?', 'Santificação é a obra da livre graça de Deus, pela qual somos renovados em todo o nosso ser segundo a imagem de Deus e habilitados a morrer cada vez mais para o pecado e viver para a justiça.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['santificação','vida cristã','imagem de Deus'], ARRAY['2 Tessalonicenses 2.13','Efésios 4.23-24','Romanos 6.4'], ARRAY['santificação','vida cristã'], 35, '{"structural_seed":true}'::jsonb),
    ('catecismo-maior-westminster', 70, '70', 'Que é justificação?', 'A justificação é um ato da livre graça de Deus para com os pecadores, no qual ele perdoa todos os seus pecados, aceita-os e os considera justos aos seus olhos, não por algo neles, mas pela obediência e satisfação de Cristo imputadas e recebidas pela fé.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['justificação','fé','imputação'], ARRAY['Romanos 3.22-25','Romanos 4.5'], ARRAY['justificação','fé'], 70, '{"structural_seed":true}'::jsonb),
    ('catecismo-maior-westminster', 71, '71', 'Como a justificação é ato da livre graça de Deus?', 'A justificação é graciosa porque Deus livremente provê Cristo, aceita sua justiça e concede fé, sem mérito do pecador.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['justificação','graça','mérito'], ARRAY['Romanos 3.24','Efésios 2.8'], ARRAY['graça','mérito'], 71, '{"structural_seed":true}'::jsonb),
    ('catecismo-maior-westminster', 72, '72', 'Que é fé justificadora?', 'Fé justificadora é a graça salvadora pela qual o pecador recebe e descansa em Cristo e em sua justiça para perdão dos pecados e aceitação diante de Deus.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['justificação','fé','Cristo'], ARRAY['João 1.12','Filipenses 3.9'], ARRAY['fé','justificação'], 72, '{"structural_seed":true}'::jsonb),
    ('catecismo-maior-westminster', 73, '73', 'Como a fé justifica o pecador diante de Deus?', 'A fé justifica não por ser obra meritória, mas porque recebe Cristo e sua justiça, que são o fundamento da justificação.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['justificação','fé','imputação'], ARRAY['Gálatas 2.16','Romanos 4.16'], ARRAY['fé','imputação'], 73, '{"structural_seed":true}'::jsonb),
    ('catecismo-heidelberg', 60, '60', 'Como você é justo diante de Deus?', 'Somente pela verdadeira fé em Jesus Cristo: Deus concede e imputa a perfeita satisfação, justiça e santidade de Cristo ao crente.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['justificação','fé','Cristo'], ARRAY['Romanos 3.21-26','2 Coríntios 5.21'], ARRAY['justificação','fé'], 60, '{"structural_seed":true}'::jsonb),
    ('catecismo-heidelberg', 86, '86', 'Por que ainda devemos fazer boas obras?', 'Porque Cristo, tendo nos redimido, também nos renova pelo Espírito para gratidão, testemunho e confirmação da fé.', 'Síntese inicial em português para navegação e sugestão doutrinária.', ARRAY['santificação','boas obras','gratidão'], ARRAY['Efésios 2.10','Romanos 6.13'], ARRAY['santificação','boas obras'], 86, '{"structural_seed":true}'::jsonb)
) AS seed(slug, number, number_label, question, answer, explanation, doctrine_tags, bible_references, dictionary_terms, sort_order, metadata)
  ON seed.slug = docs.slug
ON CONFLICT (document_id, number) DO UPDATE SET
  number_label = EXCLUDED.number_label,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  explanation = EXCLUDED.explanation,
  doctrine_tags = EXCLUDED.doctrine_tags,
  bible_references = EXCLUDED.bible_references,
  dictionary_terms = EXCLUDED.dictionary_terms,
  sort_order = EXCLUDED.sort_order,
  metadata = public.lampas_confessional_questions.metadata || EXCLUDED.metadata;

INSERT INTO public.lampas_confessional_doctrine_links (document_id, section_id, doctrine)
SELECT s.document_id, s.id, tag
FROM public.lampas_confessional_sections s
CROSS JOIN LATERAL unnest(s.doctrine_tags) tag
ON CONFLICT DO NOTHING;

INSERT INTO public.lampas_confessional_doctrine_links (document_id, question_id, doctrine)
SELECT q.document_id, q.id, tag
FROM public.lampas_confessional_questions q
CROSS JOIN LATERAL unnest(q.doctrine_tags) tag
ON CONFLICT DO NOTHING;

INSERT INTO public.lampas_confessional_dictionary_links (document_id, section_id, term)
SELECT s.document_id, s.id, term
FROM public.lampas_confessional_sections s
CROSS JOIN LATERAL unnest(s.dictionary_terms) term
ON CONFLICT DO NOTHING;

INSERT INTO public.lampas_confessional_dictionary_links (document_id, question_id, term)
SELECT q.document_id, q.id, term
FROM public.lampas_confessional_questions q
CROSS JOIN LATERAL unnest(q.dictionary_terms) term
ON CONFLICT DO NOTHING;
