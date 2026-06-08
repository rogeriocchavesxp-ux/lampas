-- =============================================
-- AGENDA MINISTERIAL — Migration 025
-- =============================================

-- =============================================
-- ENUM types
-- =============================================
CREATE TYPE agenda_event_type AS ENUM (
  'pregacao',
  'estudo_biblico',
  'ebd',
  'palestra',
  'conferencia',
  'congresso',
  'casamento',
  'batismo',
  'santa_ceia',
  'atendimento_pastoral',
  'reuniao',
  'curso',
  'live',
  'gravacao',
  'outro'
);

CREATE TYPE agenda_event_status AS ENUM (
  'confirmado',
  'tentativo',
  'cancelado'
);

CREATE TYPE agenda_sermon_status AS ENUM (
  'planejada',
  'em_preparacao',
  'pronta',
  'pregada'
);

CREATE TYPE agenda_pastoral_category AS ENUM (
  'aconselhamento',
  'casamento',
  'discipulado',
  'visita',
  'hospital',
  'outro'
);

-- =============================================
-- AGENDA_EVENTS — tabela central
-- =============================================
CREATE TABLE public.agenda_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES public.projects(id) ON DELETE SET NULL,

  title           text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  event_type      agenda_event_type NOT NULL DEFAULT 'outro',
  description     text,

  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  all_day         boolean NOT NULL DEFAULT false,

  location        text,
  organization    text,
  status          agenda_event_status NOT NULL DEFAULT 'confirmado',

  google_event_id    text,
  google_calendar_id text,
  synced_at          timestamptz,

  color           text,
  meta            jsonb DEFAULT '{}'::jsonb,

  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT ends_after_starts CHECK (ends_at >= starts_at)
);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_events: owner full access"
  ON public.agenda_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_agenda_events_user_id    ON public.agenda_events(user_id);
CREATE INDEX idx_agenda_events_starts_at  ON public.agenda_events(starts_at);
CREATE INDEX idx_agenda_events_project_id ON public.agenda_events(project_id);
CREATE INDEX idx_agenda_events_user_date  ON public.agenda_events(user_id, starts_at DESC);

CREATE TRIGGER set_updated_at_agenda_events
  BEFORE UPDATE ON public.agenda_events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_SERMONS — submódulo Pregações
-- =============================================
CREATE TABLE public.agenda_sermons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id        uuid REFERENCES public.agenda_events(id) ON DELETE SET NULL,
  project_id      uuid REFERENCES public.projects(id) ON DELETE SET NULL,

  title           text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 255),
  passage_ref     text,
  theme           text,
  series_name     text,
  series_order    integer,

  church          text,
  preacher        text,

  scheduled_at    timestamptz,
  status          agenda_sermon_status NOT NULL DEFAULT 'planejada',

  notes           text,
  recording_url   text,

  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.agenda_sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_sermons: owner full access"
  ON public.agenda_sermons FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_agenda_sermons_user_id    ON public.agenda_sermons(user_id);
CREATE INDEX idx_agenda_sermons_event_id   ON public.agenda_sermons(event_id);
CREATE INDEX idx_agenda_sermons_project_id ON public.agenda_sermons(project_id);
CREATE INDEX idx_agenda_sermons_scheduled  ON public.agenda_sermons(scheduled_at DESC NULLS LAST);

CREATE TRIGGER set_updated_at_agenda_sermons
  BEFORE UPDATE ON public.agenda_sermons
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_PASTORAL_CARE — Atendimentos Pastorais
-- =============================================
CREATE TABLE public.agenda_pastoral_care (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id        uuid REFERENCES public.agenda_events(id) ON DELETE SET NULL,

  person_name     text NOT NULL CHECK (char_length(person_name) BETWEEN 1 AND 200),
  person_contact  text,
  category        agenda_pastoral_category NOT NULL DEFAULT 'aconselhamento',

  scheduled_at    timestamptz NOT NULL,
  duration_min    integer DEFAULT 60 CHECK (duration_min > 0),

  private_notes   text,
  follow_up_at    timestamptz,
  follow_up_notes text,

  is_confidential boolean NOT NULL DEFAULT true,

  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.agenda_pastoral_care ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_pastoral_care: owner only"
  ON public.agenda_pastoral_care FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pastoral_care_user_id      ON public.agenda_pastoral_care(user_id);
CREATE INDEX idx_pastoral_care_scheduled_at ON public.agenda_pastoral_care(scheduled_at DESC);
CREATE INDEX idx_pastoral_care_category     ON public.agenda_pastoral_care(user_id, category);

CREATE TRIGGER set_updated_at_agenda_pastoral_care
  BEFORE UPDATE ON public.agenda_pastoral_care
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_GOOGLE_TOKENS — OAuth tokens por usuário
-- =============================================
CREATE TABLE public.agenda_google_tokens (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  access_token        text NOT NULL,
  refresh_token_enc   text NOT NULL,
  token_iv            text NOT NULL,
  token_expiry        timestamptz NOT NULL,

  google_email        text,
  primary_calendar_id text DEFAULT 'primary',

  sync_token          text,
  last_synced_at      timestamptz,
  sync_enabled        boolean NOT NULL DEFAULT true,
  sync_direction      text NOT NULL DEFAULT 'bidirectional'
    CHECK (sync_direction IN ('import_only', 'export_only', 'bidirectional')),

  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.agenda_google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_google_tokens: owner only"
  ON public.agenda_google_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_agenda_google_tokens
  BEFORE UPDATE ON public.agenda_google_tokens
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_SYNC_LOG — auditoria de sincronizações
-- =============================================
CREATE TABLE public.agenda_sync_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction       text NOT NULL CHECK (direction IN ('import', 'export')),
  status          text NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  events_imported integer DEFAULT 0,
  events_exported integer DEFAULT 0,
  events_failed   integer DEFAULT 0,
  error_message   text,
  duration_ms     integer,
  triggered_by    text DEFAULT 'cron' CHECK (triggered_by IN ('cron', 'manual', 'webhook')),
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.agenda_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agenda_sync_log: owner read"
  ON public.agenda_sync_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_sync_log_user_id    ON public.agenda_sync_log(user_id);
CREATE INDEX idx_sync_log_created_at ON public.agenda_sync_log(created_at DESC);

-- =============================================
-- RPCs
-- =============================================
CREATE OR REPLACE FUNCTION public.get_upcoming_events(
  p_user_id uuid,
  p_limit   integer DEFAULT 5
)
RETURNS TABLE (
  id          uuid,
  title       text,
  event_type  agenda_event_type,
  starts_at   timestamptz,
  ends_at     timestamptz,
  location    text,
  project_id  uuid,
  color       text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id, e.title, e.event_type, e.starts_at, e.ends_at,
    e.location, e.project_id, e.color
  FROM public.agenda_events e
  WHERE e.user_id = p_user_id
    AND e.starts_at >= now()
    AND e.status != 'cancelado'
  ORDER BY e.starts_at ASC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_ministry_stats(
  p_user_id  uuid,
  p_year     integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_year integer := COALESCE(p_year, EXTRACT(YEAR FROM now())::integer);
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'sermons_preached',
      (SELECT COUNT(*) FROM public.agenda_sermons
       WHERE user_id = p_user_id AND status = 'pregada'
         AND EXTRACT(YEAR FROM scheduled_at) = v_year),
    'events_total',
      (SELECT COUNT(*) FROM public.agenda_events
       WHERE user_id = p_user_id
         AND EXTRACT(YEAR FROM starts_at) = v_year),
    'pastoral_care_total',
      (SELECT COUNT(*) FROM public.agenda_pastoral_care
       WHERE user_id = p_user_id
         AND EXTRACT(YEAR FROM scheduled_at) = v_year),
    'lectures_total',
      (SELECT COUNT(*) FROM public.agenda_events
       WHERE user_id = p_user_id
         AND event_type IN ('palestra', 'conferencia', 'congresso')
         AND EXTRACT(YEAR FROM starts_at) = v_year),
    'year', v_year
  ) INTO v_result;

  RETURN v_result;
END;
$$;
