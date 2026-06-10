-- 022_editorial_hub.sql
-- Hub Editorial Central — canais, publicações, séries
-- Não altera nenhuma tabela ou política existente.

-- ─────────────────────────────────────────────
-- 1. is_hub_editor em profiles
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_hub_editor boolean NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────
-- 2. editorial_channels — um registro por portal
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.editorial_channels (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        NOT NULL UNIQUE,
  name         text        NOT NULL,
  domain       text        UNIQUE,
  description  text,
  logo_url     text,
  accent_color text,
  api_key_hash text,
  is_active    boolean     NOT NULL DEFAULT true,
  metadata     jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 3. editorial_publications — N:N polimórfico
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.editorial_publications (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id       uuid        NOT NULL REFERENCES public.editorial_channels(id) ON DELETE CASCADE,
  content_type     text        NOT NULL CHECK (content_type IN (
                                 'boletim', 'confessional_document',
                                 'knowledge_item', 'dictionary_entry'
                               )),
  content_id       uuid        NOT NULL,
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft','scheduled','published','unpublished')),
  published_at     timestamptz,
  scheduled_for    timestamptz,
  unpublished_at   timestamptz,
  slug_override    text,
  title_override   text,
  summary_override text,
  seo_title        text,
  seo_description  text,
  og_image_url     text,
  canonical_url    text,
  featured         boolean     NOT NULL DEFAULT false,
  sort_weight      integer     NOT NULL DEFAULT 0,
  created_by       uuid        NOT NULL REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel_id, content_type, content_id)
);

-- ─────────────────────────────────────────────
-- 4. editorial_series — séries por canal
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.editorial_series (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id      uuid        NOT NULL REFERENCES public.editorial_channels(id) ON DELETE CASCADE,
  title           text        NOT NULL,
  slug            text        NOT NULL,
  description     text,
  cover_image_url text,
  is_active       boolean     NOT NULL DEFAULT true,
  sort_order      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (channel_id, slug)
);

-- ─────────────────────────────────────────────
-- 5. editorial_publication_series — N:N
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.editorial_publication_series (
  publication_id  uuid NOT NULL REFERENCES public.editorial_publications(id) ON DELETE CASCADE,
  series_id       uuid NOT NULL REFERENCES public.editorial_series(id) ON DELETE CASCADE,
  order_in_series integer NOT NULL DEFAULT 0,
  PRIMARY KEY (publication_id, series_id)
);

-- ─────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ep_channel_status_date
  ON public.editorial_publications (channel_id, status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_ep_content
  ON public.editorial_publications (content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_ep_featured
  ON public.editorial_publications (channel_id, featured, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_ep_scheduled
  ON public.editorial_publications (status, scheduled_for)
  WHERE status = 'scheduled';

-- ─────────────────────────────────────────────
-- Triggers updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_editorial_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_editorial_channels_updated_at ON public.editorial_channels;
CREATE TRIGGER trg_editorial_channels_updated_at
  BEFORE UPDATE ON public.editorial_channels
  FOR EACH ROW EXECUTE FUNCTION public.fn_editorial_updated_at();

DROP TRIGGER IF EXISTS trg_editorial_publications_updated_at ON public.editorial_publications;
CREATE TRIGGER trg_editorial_publications_updated_at
  BEFORE UPDATE ON public.editorial_publications
  FOR EACH ROW EXECUTE FUNCTION public.fn_editorial_updated_at();

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
ALTER TABLE public.editorial_channels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_publications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_series            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_publication_series ENABLE ROW LEVEL SECURITY;

-- editorial_channels: somente hub editors
CREATE POLICY "hub_channels_select" ON public.editorial_channels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

CREATE POLICY "hub_channels_insert" ON public.editorial_channels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

CREATE POLICY "hub_channels_update" ON public.editorial_channels
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

CREATE POLICY "hub_channels_delete" ON public.editorial_channels
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

-- editorial_publications: somente hub editors (leitura pública via service_role na API)
CREATE POLICY "hub_publications_hub_editor" ON public.editorial_publications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

-- editorial_series: somente hub editors
CREATE POLICY "hub_series_hub_editor" ON public.editorial_series
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

CREATE POLICY "hub_pub_series_hub_editor" ON public.editorial_publication_series
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );
