-- 018_knowledge_base.sql
-- Lampas — Base de Conhecimento ministerial e teológica
-- Segundo cérebro teológico: conteúdos especializados, entidades e relações.

CREATE TABLE IF NOT EXISTS public.knowledge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN (
    'book', 'article', 'podcast', 'lecture', 'course', 'site', 'video', 'personal_document'
  )),
  title text NOT NULL,
  subtitle text,
  summary text,
  status text NOT NULL DEFAULT 'captured' CHECK (status IN (
    'captured', 'processing', 'processed', 'reviewed', 'archived'
  )),
  category text,
  subcategory text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  source_url text,
  language text DEFAULT 'pt',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  bible_references text[] NOT NULL DEFAULT '{}',
  doctrines text[] NOT NULL DEFAULT '{}',
  themes text[] NOT NULL DEFAULT '{}',
  authors text[] NOT NULL DEFAULT '{}',
  people text[] NOT NULL DEFAULT '{}',
  institutions text[] NOT NULL DEFAULT '{}',
  books_mentioned text[] NOT NULL DEFAULT '{}',
  query_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_items_user_updated_idx ON public.knowledge_items(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_items_user_type_idx ON public.knowledge_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS knowledge_items_status_idx ON public.knowledge_items(user_id, status);
CREATE INDEX IF NOT EXISTS knowledge_items_refs_idx ON public.knowledge_items USING gin(bible_references);
CREATE INDEX IF NOT EXISTS knowledge_items_doctrines_idx ON public.knowledge_items USING gin(doctrines);
CREATE INDEX IF NOT EXISTS knowledge_items_themes_idx ON public.knowledge_items USING gin(themes);
CREATE INDEX IF NOT EXISTS knowledge_items_tags_idx ON public.knowledge_items USING gin(tags);
CREATE INDEX IF NOT EXISTS knowledge_items_metadata_idx ON public.knowledge_items USING gin(metadata);
CREATE INDEX IF NOT EXISTS knowledge_items_content_idx ON public.knowledge_items USING gin(content);

CREATE OR REPLACE FUNCTION public.knowledge_text_array_to_string(p_values text[])
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT array_to_string(coalesce(p_values, ARRAY[]::text[]), ' ');
$$;

CREATE INDEX IF NOT EXISTS knowledge_items_fts_idx ON public.knowledge_items USING gin(
  (
    setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', public.knowledge_text_array_to_string(tags)), 'C') ||
    setweight(to_tsvector('simple', public.knowledge_text_array_to_string(authors)), 'A')
  )
);

CREATE TABLE IF NOT EXISTS public.knowledge_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN (
    'author', 'book', 'doctrine', 'theme', 'person', 'event', 'institution',
    'bible_text', 'sermon', 'study'
  )),
  name text NOT NULL,
  normalized_name text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, normalized_name)
);

CREATE INDEX IF NOT EXISTS knowledge_entities_user_type_idx ON public.knowledge_entities(user_id, entity_type);
CREATE INDEX IF NOT EXISTS knowledge_entities_name_idx ON public.knowledge_entities(user_id, normalized_name);

CREATE TABLE IF NOT EXISTS public.knowledge_item_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
  relation_type text NOT NULL DEFAULT 'mentions' CHECK (relation_type IN (
    'author_of', 'mentions', 'supports', 'critiques', 'applies_to', 'cites', 'related_to'
  )),
  strength numeric(4,3) NOT NULL DEFAULT 0.500,
  evidence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(item_id, entity_id, relation_type)
);

CREATE INDEX IF NOT EXISTS knowledge_item_entities_item_idx ON public.knowledge_item_entities(item_id);
CREATE INDEX IF NOT EXISTS knowledge_item_entities_entity_idx ON public.knowledge_item_entities(entity_id);

CREATE TABLE IF NOT EXISTS public.knowledge_item_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_item_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  target_item_id uuid NOT NULL REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  relation_type text NOT NULL DEFAULT 'related_to' CHECK (relation_type IN (
    'related_to', 'expands', 'contrasts', 'summarizes', 'cites', 'applies'
  )),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (source_item_id <> target_item_id),
  UNIQUE(source_item_id, target_item_id, relation_type)
);

CREATE INDEX IF NOT EXISTS knowledge_item_links_source_idx ON public.knowledge_item_links(source_item_id);
CREATE INDEX IF NOT EXISTS knowledge_item_links_target_idx ON public.knowledge_item_links(target_item_id);

CREATE OR REPLACE FUNCTION public.fn_knowledge_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_knowledge_items_updated_at ON public.knowledge_items;
CREATE TRIGGER trg_knowledge_items_updated_at
  BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_knowledge_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_entities_updated_at ON public.knowledge_entities;
CREATE TRIGGER trg_knowledge_entities_updated_at
  BEFORE UPDATE ON public.knowledge_entities
  FOR EACH ROW EXECUTE FUNCTION public.fn_knowledge_updated_at();

CREATE OR REPLACE FUNCTION public.normalize_knowledge_name(p_name text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT lower(regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.increment_knowledge_item_query_count(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.knowledge_items
  SET query_count = query_count + 1
  WHERE id = p_id AND user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.search_knowledge_items(
  p_query text DEFAULT NULL,
  p_item_type text DEFAULT NULL,
  p_ref text DEFAULT NULL,
  p_limit integer DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  item_type text,
  title text,
  subtitle text,
  summary text,
  category text,
  status text,
  authors text[],
  bible_references text[],
  doctrines text[],
  themes text[],
  tags text[],
  updated_at timestamptz,
  rank float4
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tsq tsquery;
BEGIN
  IF p_query IS NOT NULL AND trim(p_query) <> '' THEN
    BEGIN
      v_tsq := websearch_to_tsquery('portuguese', p_query);
    EXCEPTION WHEN OTHERS THEN
      v_tsq := plainto_tsquery('simple', p_query);
    END;
  END IF;

  RETURN QUERY
  SELECT
    k.id, k.item_type, k.title, k.subtitle, k.summary, k.category, k.status,
    k.authors, k.bible_references, k.doctrines, k.themes, k.tags, k.updated_at,
    COALESCE(
      CASE WHEN v_tsq IS NOT NULL THEN ts_rank(
        setweight(to_tsvector('portuguese', coalesce(k.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(k.summary, '')), 'B') ||
        setweight(to_tsvector('simple', public.knowledge_text_array_to_string(k.tags)), 'C') ||
        setweight(to_tsvector('simple', public.knowledge_text_array_to_string(k.authors)), 'A'),
        v_tsq
      ) ELSE 0 END
    , 0)::float4 AS rank
  FROM public.knowledge_items k
  WHERE k.user_id = auth.uid()
    AND (p_item_type IS NULL OR k.item_type = p_item_type)
    AND (p_ref IS NULL OR p_ref = ANY(k.bible_references) OR k.bible_references @> ARRAY[p_ref])
    AND (
      v_tsq IS NULL
      OR (
        setweight(to_tsvector('portuguese', coalesce(k.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(k.summary, '')), 'B') ||
        setweight(to_tsvector('simple', public.knowledge_text_array_to_string(k.tags)), 'C') ||
        setweight(to_tsvector('simple', public.knowledge_text_array_to_string(k.authors)), 'A')
      ) @@ v_tsq
      OR k.title ILIKE '%' || p_query || '%'
      OR k.summary ILIKE '%' || p_query || '%'
      OR p_query = ANY(k.tags)
      OR p_query = ANY(k.authors)
      OR p_query = ANY(k.doctrines)
      OR p_query = ANY(k.themes)
    )
  ORDER BY rank DESC, k.updated_at DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE VIEW public.v_knowledge_dashboard AS
SELECT
  k.user_id,
  COUNT(*) AS total_items,
  COUNT(*) FILTER (WHERE k.item_type = 'book') AS books,
  COUNT(*) FILTER (WHERE k.item_type = 'article') AS articles,
  COUNT(*) FILTER (WHERE k.item_type = 'podcast') AS podcasts,
  COUNT(*) FILTER (WHERE k.item_type = 'lecture') AS lectures,
  COUNT(*) FILTER (WHERE k.item_type = 'course') AS courses,
  COUNT(*) FILTER (WHERE k.item_type = 'site') AS sites,
  COUNT(*) FILTER (WHERE k.item_type = 'video') AS videos,
  COUNT(*) FILTER (WHERE k.item_type = 'personal_document') AS personal_documents,
  (
    SELECT jsonb_agg(jsonb_build_object('name', name, 'count', cnt) ORDER BY cnt DESC)
    FROM (
      SELECT unnest(k2.authors) AS name, COUNT(*) AS cnt
      FROM public.knowledge_items k2
      WHERE k2.user_id = k.user_id
      GROUP BY 1
      LIMIT 10
    ) s
  ) AS top_authors,
  (
    SELECT jsonb_agg(jsonb_build_object('name', name, 'count', cnt) ORDER BY cnt DESC)
    FROM (
      SELECT unnest(k2.doctrines) AS name, COUNT(*) AS cnt
      FROM public.knowledge_items k2
      WHERE k2.user_id = k.user_id
      GROUP BY 1
      LIMIT 10
    ) s
  ) AS top_doctrines,
  (
    SELECT jsonb_agg(jsonb_build_object('name', name, 'count', cnt) ORDER BY cnt DESC)
    FROM (
      SELECT unnest(k2.themes) AS name, COUNT(*) AS cnt
      FROM public.knowledge_items k2
      WHERE k2.user_id = k.user_id
      GROUP BY 1
      LIMIT 10
    ) s
  ) AS top_themes
FROM public.knowledge_items k
GROUP BY k.user_id;

ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_item_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_item_links ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.v_knowledge_dashboard SET (security_invoker = true);

CREATE POLICY "knowledge_items_select_own" ON public.knowledge_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_items_insert_own" ON public.knowledge_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "knowledge_items_update_own" ON public.knowledge_items FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_items_delete_own" ON public.knowledge_items FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "knowledge_entities_select_own" ON public.knowledge_entities FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_entities_insert_own" ON public.knowledge_entities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "knowledge_entities_update_own" ON public.knowledge_entities FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_entities_delete_own" ON public.knowledge_entities FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "knowledge_item_entities_select_own" ON public.knowledge_item_entities FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_item_entities_insert_own" ON public.knowledge_item_entities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "knowledge_item_entities_update_own" ON public.knowledge_item_entities FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_item_entities_delete_own" ON public.knowledge_item_entities FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "knowledge_item_links_select_own" ON public.knowledge_item_links FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_item_links_insert_own" ON public.knowledge_item_links FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "knowledge_item_links_update_own" ON public.knowledge_item_links FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "knowledge_item_links_delete_own" ON public.knowledge_item_links FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_item_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_item_links TO authenticated;
GRANT SELECT ON public.v_knowledge_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_knowledge_item_query_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_knowledge_items TO authenticated;
