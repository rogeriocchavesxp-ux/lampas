-- LAMPAS — All Migrations (idempotent)
-- Gerado em: 2026-06-10T17:51:16.146Z

-- ================================================================
-- Migration: 001_initial_schema.sql
-- ================================================================
-- =============================================
-- KERYX — Schema inicial
-- =============================================

-- Extensões
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  role         text default 'user' check (role in ('user', 'admin')),
  plan         text default 'free' check (plan in ('free', 'basic', 'pro', 'seminary')),
  stripe_customer_id   text,
  stripe_subscription_id text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- PROJECTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  book              text not null,
  passage_ref       text not null,
  testament         text not null check (testament in ('AT', 'NT')),
  original_language text not null check (original_language in ('hebraico', 'grego')),
  bible_version     text default 'NAA',
  status            text default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.projects enable row level security;

DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
create policy "Users can manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);

-- =============================================
-- SECTIONS
-- Cada section = uma etapa do workflow (1.1, 1.2, ..., §4, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS public.sections (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  slug       text not null,   -- e.g. "contexto_historico", "analise_morfossintatica"
  module     text not null check (module in ('inventio', 'dispositio', 'elocutio', 'memoria', 'pronuntiatio')),
  title      text not null,
  content    jsonb default '{}',   -- Tiptap JSON
  ai_output  text,                 -- last AI response
  status     text default 'empty' check (status in ('empty', 'draft', 'reviewed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (project_id, slug)
);

alter table public.sections enable row level security;

DROP POLICY IF EXISTS "Users can manage own sections" ON public.sections;
create policy "Users can manage own sections"
  on public.sections for all
  using (auth.uid() = user_id);

-- =============================================
-- FOOTNOTES
-- =============================================
CREATE TABLE IF NOT EXISTS public.footnotes (
  id         uuid primary key default uuid_generate_v4(),
  section_id uuid not null references public.sections(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  number     integer not null,
  content    text not null,
  created_at timestamptz default now()
);

alter table public.footnotes enable row level security;

DROP POLICY IF EXISTS "Users can manage own footnotes" ON public.footnotes;
create policy "Users can manage own footnotes"
  on public.footnotes for all
  using (auth.uid() = user_id);

-- =============================================
-- BIBLIOGRAPHY
-- =============================================
CREATE TABLE IF NOT EXISTS public.bibliography (
  id         uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  ref_type   text default 'book' check (ref_type in ('book', 'article', 'commentary', 'lexicon', 'dictionary', 'online')),
  citation   text not null,   -- formatted citation string
  meta       jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.bibliography enable row level security;

DROP POLICY IF EXISTS "Users can manage own bibliography" ON public.bibliography;
create policy "Users can manage own bibliography"
  on public.bibliography for all
  using (auth.uid() = user_id);

-- =============================================
-- STRUCTURE EVALUATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.structure_evaluations (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  input_text   text not null,
  ai_output    text not null,
  score        numeric(3,1),
  created_at   timestamptz default now()
);

alter table public.structure_evaluations enable row level security;

DROP POLICY IF EXISTS "Users can manage own evaluations" ON public.structure_evaluations;
create policy "Users can manage own evaluations"
  on public.structure_evaluations for all
  using (auth.uid() = user_id);

-- =============================================
-- AI INTERACTIONS (log for cost tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_interactions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  section_slug    text,
  mode            text,   -- e.g. "exegese", "corretor_estrutura", "homiletica"
  input_tokens    integer default 0,
  output_tokens   integer default 0,
  cached_tokens   integer default 0,
  model           text,
  created_at      timestamptz default now()
);

alter table public.ai_interactions enable row level security;

DROP POLICY IF EXISTS "Users can view own interactions" ON public.ai_interactions;
create policy "Users can view own interactions"
  on public.ai_interactions for select
  using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert interactions" ON public.ai_interactions;
create policy "Service can insert interactions"
  on public.ai_interactions for insert
  with check (auth.uid() = user_id);

-- =============================================
-- EXPORTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.exports (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  format       text not null check (format in ('pdf', 'docx', 'slides', 'outline')),
  storage_path text,
  created_at   timestamptz default now()
);

alter table public.exports enable row level security;

DROP POLICY IF EXISTS "Users can manage own exports" ON public.exports;
create policy "Users can manage own exports"
  on public.exports for all
  using (auth.uid() = user_id);

-- =============================================
-- updated_at trigger (shared)
-- =============================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_projects
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_sections
  before update on public.sections
  for each row execute procedure public.set_updated_at();

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id on public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_project_id on public.sections(project_id);
CREATE INDEX IF NOT EXISTS idx_sections_user_id on public.sections(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id on public.ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_project_id on public.ai_interactions(project_id);


-- ================================================================
-- Migration: 003_billing.sql
-- ================================================================
-- ── Hokmá — Billing Infrastructure ────────────────────────────────────────

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id    text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan                  text NOT NULL DEFAULT 'free',
  status                text NOT NULL DEFAULT 'active',
  current_period_end    timestamptz,
  cancel_at_period_end  boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

-- AI usage counter (per user per month)
CREATE TABLE IF NOT EXISTS ai_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month      text NOT NULL, -- 'YYYY-MM'
  count      integer DEFAULT 0 CHECK (count >= 0),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage      ENABLE ROW LEVEL SECURITY;

-- Users read own subscription
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role full access (webhooks)
DROP POLICY IF EXISTS "subscriptions_service_role" ON subscriptions;
CREATE POLICY "subscriptions_service_role" ON subscriptions
  USING (auth.role() = 'service_role');

-- Users read own usage
DROP POLICY IF EXISTS "ai_usage_select_own" ON ai_usage;
CREATE POLICY "ai_usage_select_own" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role full access
DROP POLICY IF EXISTS "ai_usage_service_role" ON ai_usage;
CREATE POLICY "ai_usage_service_role" ON ai_usage
  USING (auth.role() = 'service_role');

-- ── Function: increment_ai_usage ─────────────────────────────────────────────
-- SECURITY DEFINER so authenticated users can increment their own count
-- without needing write RLS policy (prevents arbitrary manipulation).

CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ai_usage (user_id, month, count, updated_at)
  VALUES (p_user_id, to_char(now(), 'YYYY-MM'), 1, now())
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    count      = ai_usage.count + 1,
    updated_at = now();
END;
$$;

-- Only authenticated users can call this function
REVOKE ALL ON FUNCTION increment_ai_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_ai_usage TO authenticated;

-- ── Function: get_ai_usage ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_ai_usage(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT count FROM ai_usage
      WHERE user_id = p_user_id
        AND month = to_char(now(), 'YYYY-MM')),
    0
  );
$$;

REVOKE ALL ON FUNCTION get_ai_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_ai_usage TO authenticated;


-- ================================================================
-- Migration: 004_fix_plan_constraint.sql
-- ================================================================
-- Corrige check constraint de profiles.plan para refletir os planos reais do produto
-- Os planos antigos ('basic', 'pro', 'seminary') foram renomeados para PT-BR

-- Migrar dados existentes para os novos nomes antes de alterar a constraint
UPDATE public.profiles SET plan = 'iniciante'    WHERE plan = 'basic';
UPDATE public.profiles SET plan = 'intermediario' WHERE plan = 'pro';
UPDATE public.profiles SET plan = 'avancado'     WHERE plan = 'seminary';

-- Também corrigir a tabela subscriptions se tiver os nomes antigos
UPDATE public.subscriptions SET plan = 'iniciante'    WHERE plan = 'basic';
UPDATE public.subscriptions SET plan = 'intermediario' WHERE plan = 'pro';
UPDATE public.subscriptions SET plan = 'avancado'     WHERE plan = 'seminary';

-- Recriar constraint com os valores corretos
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'iniciante', 'intermediario', 'avancado'));


-- ================================================================
-- Migration: 005_bible_verses.sql
-- ================================================================
-- Tabela de versículos bíblicos para versões de domínio público
-- ACF (Almeida Corrigida Fiel) é populada pelo script scripts/seed-bible-acf.mjs
-- Versões não-public-domain (ARA, NVI, etc.) são servidas via API.Bible

CREATE TABLE IF NOT EXISTS public.bible_verses (
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

CREATE INDEX IF NOT EXISTS idx_bible_verses_lookup ON public.bible_verses(version, abbrev, chapter);

ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bible_verses_public_read" ON public.bible_verses;
CREATE POLICY "bible_verses_public_read"
  ON public.bible_verses FOR SELECT
  TO anon, authenticated
  USING (true);


-- ================================================================
-- Migration: 006_get_user_ai_status.sql
-- ================================================================
-- RPC que retorna plano + uso de IA do mês em uma única query
-- Substitui: getUserPlan() + get_ai_usage() (2 round-trips) por 1 chamada

CREATE OR REPLACE FUNCTION public.get_user_ai_status(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_plan text := 'free';
  v_used int  := 0;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status NOT IN ('canceled', 'past_due')
  LIMIT 1;

  SELECT COALESCE(u.count, 0) INTO v_used
  FROM public.ai_usage u
  WHERE u.user_id = p_user_id
    AND u.month = to_char(now(), 'YYYY-MM');

  RETURN json_build_object('plan', COALESCE(v_plan, 'free'), 'used', v_used);
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_ai_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_ai_status TO authenticated;


-- ================================================================
-- Migration: 007_admin_rpcs.sql
-- ================================================================
-- RPC para o dashboard admin: uso diário de IA
CREATE OR REPLACE FUNCTION public.get_ai_usage_by_day(p_since timestamptz)
RETURNS TABLE(day date, calls bigint, input_tokens bigint, output_tokens bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    created_at::date                AS day,
    COUNT(*)                        AS calls,
    COALESCE(SUM(input_tokens), 0)  AS input_tokens,
    COALESCE(SUM(output_tokens), 0) AS output_tokens
  FROM public.ai_interactions
  WHERE created_at >= p_since
  GROUP BY created_at::date
  ORDER BY created_at::date DESC;
$$;

REVOKE ALL ON FUNCTION public.get_ai_usage_by_day FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ai_usage_by_day TO authenticated;


-- ================================================================
-- Migration: 008_knowledge_hierarchy.sql
-- ================================================================
-- Hierarquia na Base de Conhecimento
-- Permite que itens (Curso, Livro, Podcast, Conferência) contenham conteúdos internos
-- (Aulas, Capítulos, Episódios, Palestras) via auto-referência parent_id

ALTER TABLE public.knowledge_items
  ADD COLUMN IF NOT EXISTS parent_id    uuid REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS order_index  int  NOT NULL DEFAULT 0;

-- Índice para busca eficiente de filhos por pai
CREATE INDEX IF NOT EXISTS idx_knowledge_items_parent
  ON public.knowledge_items(parent_id)
  WHERE parent_id IS NOT NULL;

-- Índice para ordenação dos filhos
CREATE INDEX IF NOT EXISTS idx_knowledge_items_parent_order
  ON public.knowledge_items(parent_id, order_index)
  WHERE parent_id IS NOT NULL;


-- ================================================================
-- Migration: 008_project_type.sql
-- ================================================================
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


-- ================================================================
-- Migration: 009_study_mode.sql
-- ================================================================
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


-- ================================================================
-- Migration: 010_lampas_dictionary.sql
-- ================================================================
-- 010_lampas_dictionary.sql
-- Dicionário Lampas — base de conhecimento bíblica e teológica viva, cumulativa e compartilhada

-- ── Tabela principal ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_dictionary (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  title           TEXT NOT NULL,
  slug            TEXT,
  category        TEXT NOT NULL DEFAULT 'termo_biblico'
                  CHECK (category IN (
                    'personagem', 'lugar', 'termo_biblico', 'doutrina',
                    'instituicao', 'evento', 'livro_biblico'
                  )),
  trust_level     SMALLINT NOT NULL DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 4),
  is_shared       BOOLEAN NOT NULL DEFAULT true,

  -- Autoria
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conteúdo textual
  definition      TEXT,
  etymology       TEXT,
  notes           TEXT,

  -- Línguas originais
  lang_hebrew     TEXT,
  lang_aramaic    TEXT,
  lang_greek      TEXT,
  transliteration TEXT,
  pronunciation   TEXT,

  -- Uso bíblico
  occurrences     TEXT,
  main_texts      TEXT,

  -- Teologia e aplicação
  theological_biblical    TEXT,
  theological_systematic  TEXT,
  applications            TEXT,

  -- Arrays
  cross_references TEXT[] NOT NULL DEFAULT '{}',
  related_terms    TEXT[] NOT NULL DEFAULT '{}',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  sources          TEXT[] NOT NULL DEFAULT '{}',

  -- Métricas
  query_count    INT NOT NULL DEFAULT 0,
  citation_count INT NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Colunas adicionais (para tabelas existentes sem esses campos) ─────────────

ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS slug            TEXT;
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS is_shared       BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS notes           TEXT;
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS lang_aramaic    TEXT;
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS pronunciation   TEXT;
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS occurrences     TEXT;
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS related_terms   TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE lampas_dictionary ADD COLUMN IF NOT EXISTS citation_count  INT    NOT NULL DEFAULT 0;

-- Atualiza constraint de categoria se a tabela pré-existia com categorias antigas
DO $$
BEGIN
  -- Remove constraint antiga se existir (nome pode variar)
  ALTER TABLE lampas_dictionary DROP CONSTRAINT IF EXISTS lampas_dictionary_category_check;
  ALTER TABLE lampas_dictionary DROP CONSTRAINT IF EXISTS category_check;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE lampas_dictionary
  ADD CONSTRAINT lampas_dictionary_category_check
  CHECK (category IN (
    'personagem', 'lugar', 'termo_biblico', 'doutrina',
    'instituicao', 'evento', 'livro_biblico',
    -- categorias legadas aceitas para compatibilidade
    'tema', 'conceito_historico', 'lingua_original'
  ))
  NOT VALID; -- não valida linhas existentes

-- ── Índices ───────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS lampas_dictionary_slug_idx
  ON lampas_dictionary (slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS lampas_dictionary_title_idx
  ON lampas_dictionary (lower(title));

CREATE INDEX IF NOT EXISTS lampas_dictionary_category_idx
  ON lampas_dictionary (category);

CREATE INDEX IF NOT EXISTS lampas_dictionary_trust_idx
  ON lampas_dictionary (trust_level DESC);

CREATE INDEX IF NOT EXISTS lampas_dictionary_user_idx
  ON lampas_dictionary (user_id);

-- Full-text search (Portuguese + simple for proper nouns / Hebrew / Greek)
CREATE INDEX IF NOT EXISTS lampas_dictionary_fts_idx
  ON lampas_dictionary
  USING gin(
    (
      setweight(to_tsvector('portuguese', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('simple',     coalesce(title, '')), 'A') ||
      setweight(to_tsvector('simple',     coalesce(transliteration, '')), 'A') ||
      setweight(to_tsvector('portuguese', coalesce(definition, '')), 'B') ||
      setweight(to_tsvector('portuguese', coalesce(etymology, '')), 'C') ||
      setweight(to_tsvector('portuguese', coalesce(theological_biblical, '')), 'C') ||
      setweight(to_tsvector('portuguese', coalesce(theological_systematic, '')), 'C')
    )
  );

-- ── Histórico de versões ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_dictionary_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID NOT NULL REFERENCES lampas_dictionary(id) ON DELETE CASCADE,
  edited_by  UUID REFERENCES auth.users(id),
  snapshot   JSONB NOT NULL,
  edited_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dict_versions_entry_idx
  ON lampas_dictionary_versions (entry_id, edited_at DESC);

-- ── Trigger: updated_at + slug auto-gerado ───────────────────────────────────

CREATE OR REPLACE FUNCTION fn_dictionary_before_upsert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := regexp_replace(
      regexp_replace(lower(trim(NEW.title)), '[áàãâä]', 'a', 'g'),
      '[^a-z0-9]+', '-', 'g'
    );
    -- garante unicidade sufixando com parte do id
    IF EXISTS (
      SELECT 1 FROM lampas_dictionary
      WHERE slug = NEW.slug AND id IS DISTINCT FROM NEW.id
    ) THEN
      NEW.slug := NEW.slug || '-' || substr(NEW.id::text, 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dictionary_upsert ON lampas_dictionary;
CREATE TRIGGER trg_dictionary_upsert
  BEFORE INSERT OR UPDATE ON lampas_dictionary
  FOR EACH ROW EXECUTE FUNCTION fn_dictionary_before_upsert();

-- ── Trigger: salvar versão antes de UPDATE de conteúdo ───────────────────────

CREATE OR REPLACE FUNCTION fn_dictionary_save_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO lampas_dictionary_versions (entry_id, edited_by, snapshot)
  VALUES (OLD.id, auth.uid(), to_jsonb(OLD));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dictionary_version ON lampas_dictionary;
CREATE TRIGGER trg_dictionary_version
  BEFORE UPDATE ON lampas_dictionary
  FOR EACH ROW
  WHEN (
    OLD.definition         IS DISTINCT FROM NEW.definition         OR
    OLD.etymology          IS DISTINCT FROM NEW.etymology          OR
    OLD.theological_biblical   IS DISTINCT FROM NEW.theological_biblical   OR
    OLD.theological_systematic IS DISTINCT FROM NEW.theological_systematic OR
    OLD.applications       IS DISTINCT FROM NEW.applications       OR
    OLD.notes              IS DISTINCT FROM NEW.notes
  )
  EXECUTE FUNCTION fn_dictionary_save_version();

-- ── RPC: increment_dictionary_query_count ────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_dictionary_query_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE lampas_dictionary SET query_count = query_count + 1 WHERE id = p_id;
END;
$$;

-- ── RPC: search_dictionary ────────────────────────────────────────────────────
-- Busca inteligente: full-text + ILIKE em título/transliteração/tags/termos relacionados

CREATE OR REPLACE FUNCTION search_dictionary(
  p_query    TEXT,
  p_category TEXT DEFAULT NULL,
  p_limit    INT  DEFAULT 30
)
RETURNS TABLE (
  id              UUID,
  title           TEXT,
  slug            TEXT,
  category        TEXT,
  trust_level     SMALLINT,
  definition      TEXT,
  transliteration TEXT,
  tags            TEXT[],
  related_terms   TEXT[],
  query_count     INT,
  rank            FLOAT4
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tsq tsquery;
BEGIN
  -- Tenta converter para tsquery; se falhar, usa prefixo simples
  BEGIN
    v_tsq := websearch_to_tsquery('portuguese', p_query);
  EXCEPTION WHEN OTHERS THEN
    v_tsq := to_tsquery('simple', regexp_replace(trim(p_query), '\s+', ' & ', 'g') || ':*');
  END;

  RETURN QUERY
  SELECT
    d.id, d.title, d.slug, d.category, d.trust_level,
    d.definition, d.transliteration, d.tags, d.related_terms,
    d.query_count,
    (
      ts_rank(
        setweight(to_tsvector('portuguese', coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.transliteration, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(d.definition, '')), 'B'),
        v_tsq
      ) + CASE WHEN d.title ILIKE '%' || p_query || '%' THEN 0.5 ELSE 0 END
    )::FLOAT4 AS rank
  FROM lampas_dictionary d
  WHERE
    (p_category IS NULL OR d.category = p_category)
    AND (
      (
        setweight(to_tsvector('portuguese', coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.title, '')), 'A') ||
        setweight(to_tsvector('simple',     coalesce(d.transliteration, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(d.definition, '')), 'B') ||
        setweight(to_tsvector('portuguese', coalesce(d.etymology, '')), 'C')
      ) @@ v_tsq
      OR d.title           ILIKE '%' || p_query || '%'
      OR d.transliteration ILIKE '%' || p_query || '%'
      OR p_query            = ANY(d.tags)
      OR p_query            = ANY(d.related_terms)
    )
  ORDER BY rank DESC, d.query_count DESC, d.trust_level DESC
  LIMIT p_limit;
END;
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE lampas_dictionary          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_dictionary_versions ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado lê tudo (base de conhecimento compartilhada)
DROP POLICY IF EXISTS "dict_select"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_insert"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_update"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_delete"          ON lampas_dictionary;
DROP POLICY IF EXISTS "dict_versions_select" ON lampas_dictionary_versions;
DROP POLICY IF EXISTS "dict_versions_insert" ON lampas_dictionary_versions;

DROP POLICY IF EXISTS "dict_select" ON lampas_dictionary;
CREATE POLICY "dict_select" ON lampas_dictionary
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "dict_insert" ON lampas_dictionary;
CREATE POLICY "dict_insert" ON lampas_dictionary
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "dict_update" ON lampas_dictionary;
CREATE POLICY "dict_update" ON lampas_dictionary
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "dict_delete" ON lampas_dictionary;
CREATE POLICY "dict_delete" ON lampas_dictionary
  FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "dict_versions_select" ON lampas_dictionary_versions;
CREATE POLICY "dict_versions_select" ON lampas_dictionary_versions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "dict_versions_insert" ON lampas_dictionary_versions;
CREATE POLICY "dict_versions_insert" ON lampas_dictionary_versions
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── Grants ────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON lampas_dictionary          TO authenticated;
GRANT SELECT, INSERT                  ON lampas_dictionary_versions TO authenticated;
GRANT EXECUTE ON FUNCTION increment_dictionary_query_count TO authenticated;
GRANT EXECUTE ON FUNCTION search_dictionary                TO authenticated;


-- ================================================================
-- Migration: 011_lampas_library.sql
-- ================================================================
-- 011_lampas_library.sql
-- Sistema de Geração Inteligente — Biblioteca Lampas + Aliases + Extensões de rastreamento

-- ── 1. Atualizar trust_level do dicionário para 1–5 ───────────────────────────

ALTER TABLE lampas_dictionary DROP CONSTRAINT IF EXISTS lampas_dictionary_trust_level_check;
ALTER TABLE lampas_dictionary
  ADD CONSTRAINT lampas_dictionary_trust_level_check
  CHECK (trust_level BETWEEN 1 AND 5);

-- ── 2. Biblioteca Lampas — cache persistente de respostas Q&A ─────────────────
-- Diferente do dicionário (foco em termos estruturados), a biblioteca armazena
-- respostas completas a consultas livres. Complementa e reduz chamadas de IA.

CREATE TABLE IF NOT EXISTS lampas_library (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identificação da consulta
  query_hash   TEXT NOT NULL,          -- SHA-256 do termo normalizado (unique)
  query_text   TEXT NOT NULL,          -- texto original da consulta
  -- Resposta armazenada
  response     TEXT NOT NULL,
  -- Contexto de origem
  section_slug TEXT,
  passage_ref  TEXT,
  study_mode   TEXT,
  -- Metadados
  trust_level  SMALLINT NOT NULL DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 5),
  source       TEXT NOT NULL DEFAULT 'ai'
               CHECK (source IN ('ai', 'curated', 'imported')),
  tags         TEXT[] NOT NULL DEFAULT '{}',
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  -- Métricas
  query_count  INT NOT NULL DEFAULT 0,
  -- Autoria
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Timestamps
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lampas_library_hash_unique UNIQUE (query_hash)
);

CREATE INDEX IF NOT EXISTS lampas_library_query_text_idx
  ON lampas_library (lower(query_text));

CREATE INDEX IF NOT EXISTS lampas_library_tags_idx
  ON lampas_library USING gin(tags);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION fn_library_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_library_updated_at ON lampas_library;
CREATE TRIGGER trg_library_updated_at
  BEFORE UPDATE ON lampas_library
  FOR EACH ROW EXECUTE FUNCTION fn_library_updated_at();

-- ── 3. Aliases semânticos ─────────────────────────────────────────────────────
-- Mapeia formas equivalentes para a mesma entrada do dicionário ou biblioteca.
-- Exemplo: "José do Egito", "Patriarca José", "Filho de Jacó" → entrada "José"

CREATE TABLE IF NOT EXISTS lampas_query_aliases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias_text       TEXT NOT NULL,
  -- Aponta para dicionário OU biblioteca (pelo menos um obrigatório)
  dict_entry_id    UUID REFERENCES lampas_dictionary(id) ON DELETE CASCADE,
  library_entry_id UUID REFERENCES lampas_library(id)   ON DELETE CASCADE,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT alias_has_target CHECK (
    dict_entry_id IS NOT NULL OR library_entry_id IS NOT NULL
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS lampas_aliases_text_dict_idx
  ON lampas_query_aliases (lower(alias_text), dict_entry_id)
  WHERE dict_entry_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS lampas_aliases_text_lib_idx
  ON lampas_query_aliases (lower(alias_text), library_entry_id)
  WHERE library_entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS lampas_aliases_dict_idx    ON lampas_query_aliases (dict_entry_id);
CREATE INDEX IF NOT EXISTS lampas_aliases_library_idx ON lampas_query_aliases (library_entry_id);

-- ── 4. Estender ai_interactions com rastreamento de fonte e custo ─────────────

ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS source        TEXT DEFAULT 'ai';
ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS cost_usd      FLOAT4;
ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS response_ms   INT;

CREATE INDEX IF NOT EXISTS ai_interactions_source_idx
  ON ai_interactions (source, created_at DESC);

-- ── 5. RPCs ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_library_query_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE lampas_library SET query_count = query_count + 1 WHERE id = p_id;
END;
$$;

-- Estatísticas da base de conhecimento para o dashboard admin
CREATE OR REPLACE FUNCTION get_knowledge_base_stats(p_since TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    -- Contadores da base de conhecimento
    'dict_entries',    (SELECT COUNT(*) FROM lampas_dictionary),
    'library_entries', (SELECT COUNT(*) FROM lampas_library),
    'aliases',         (SELECT COUNT(*) FROM lampas_query_aliases),
    -- Uso por fonte no período
    'sources', (
      SELECT json_agg(row_to_json(s)) FROM (
        SELECT
          COALESCE(source, 'ai') AS source,
          COUNT(*) AS calls,
          COALESCE(SUM(input_tokens), 0)  AS input_tokens,
          COALESCE(SUM(output_tokens), 0) AS output_tokens,
          COALESCE(SUM(cost_usd), 0)      AS cost_usd
        FROM ai_interactions
        WHERE created_at >= p_since
        GROUP BY source
        ORDER BY calls DESC
      ) s
    ),
    -- Top termos consultados no dicionário
    'top_dict_terms', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT title, category, trust_level, query_count
        FROM lampas_dictionary
        WHERE query_count > 0
        ORDER BY query_count DESC
        LIMIT 20
      ) t
    ),
    -- Top termos na biblioteca
    'top_library_terms', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT query_text, trust_level, query_count, source
        FROM lampas_library
        WHERE query_count > 0
        ORDER BY query_count DESC
        LIMIT 20
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ── 6. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE lampas_library         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_query_aliases   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "library_select" ON lampas_library;
DROP POLICY IF EXISTS "library_insert" ON lampas_library;
DROP POLICY IF EXISTS "library_update" ON lampas_library;

DROP POLICY IF EXISTS "library_select" ON lampas_library;
CREATE POLICY "library_select" ON lampas_library FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "library_insert" ON lampas_library;
CREATE POLICY "library_insert" ON lampas_library FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "library_update" ON lampas_library;
CREATE POLICY "library_update" ON lampas_library FOR UPDATE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "aliases_select" ON lampas_query_aliases;
DROP POLICY IF EXISTS "aliases_insert" ON lampas_query_aliases;

DROP POLICY IF EXISTS "aliases_select" ON lampas_query_aliases;
CREATE POLICY "aliases_select" ON lampas_query_aliases FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "aliases_insert" ON lampas_query_aliases;
CREATE POLICY "aliases_insert" ON lampas_query_aliases FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- ── 7. Grants ─────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON lampas_library       TO authenticated;
GRANT SELECT, INSERT          ON lampas_query_aliases TO authenticated;
GRANT EXECUTE ON FUNCTION increment_library_query_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_knowledge_base_stats      TO authenticated;


-- ================================================================
-- Migration: 012_lampas_books.sql
-- ================================================================
-- 012_lampas_books.sql
-- Biblioteca Lampas — repositório de fontes teológicas reformadas

-- ── 1. Tabela principal de obras ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_books (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  title           TEXT NOT NULL,
  author          TEXT NOT NULL DEFAULT '',   -- autor principal (display)
  authors         TEXT[] NOT NULL DEFAULT '{}', -- múltiplos autores
  category        TEXT NOT NULL DEFAULT 'obras_classicas'
                  CHECK (category IN (
                    'comentarios_biblicos',
                    'dicionarios_lexicos',
                    'teologia_biblica',
                    'teologia_sistematica',
                    'historia_igreja',
                    'confissoes_catecismos',
                    'hermeneutica',
                    'homiletica',
                    'teologia_pastoral',
                    'obras_classicas'
                  )),
  year            SMALLINT,
  publisher       TEXT,
  language        TEXT NOT NULL DEFAULT 'pt'
                  CHECK (language IN ('pt', 'en', 'de', 'la', 'he', 'el', 'es', 'fr')),

  -- Conteúdo descritivo
  description     TEXT,
  bible_references TEXT[] NOT NULL DEFAULT '{}',   -- livros/passagens cobertos
  theological_topics TEXT[] NOT NULL DEFAULT '{}', -- tópicos doutrinários
  tags            TEXT[] NOT NULL DEFAULT '{}',

  -- Qualidade
  trust_level     SMALLINT NOT NULL DEFAULT 1 CHECK (trust_level BETWEEN 1 AND 5),
  is_indexed      BOOLEAN  NOT NULL DEFAULT false, -- texto processado e indexado

  -- Arquivo (para upload futuro)
  file_path       TEXT,
  file_type       TEXT CHECK (file_type IN ('pdf', 'epub', 'docx') OR file_type IS NULL),

  -- Métricas
  query_count    INT NOT NULL DEFAULT 0,
  citation_count INT NOT NULL DEFAULT 0,

  -- Autoria
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS lampas_books_category_idx  ON lampas_books (category);
CREATE INDEX IF NOT EXISTS lampas_books_author_idx    ON lampas_books (lower(author));
CREATE INDEX IF NOT EXISTS lampas_books_refs_idx      ON lampas_books USING gin(bible_references);
CREATE INDEX IF NOT EXISTS lampas_books_topics_idx    ON lampas_books USING gin(theological_topics);
CREATE INDEX IF NOT EXISTS lampas_books_tags_idx      ON lampas_books USING gin(tags);

-- Full-text search
CREATE INDEX IF NOT EXISTS lampas_books_fts_idx ON lampas_books USING gin(
  (
    setweight(to_tsvector('portuguese', coalesce(title, '')),       'A') ||
    setweight(to_tsvector('simple',     coalesce(author, '')),      'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B')
  )
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION fn_books_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_books_updated_at ON lampas_books;
CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON lampas_books
  FOR EACH ROW EXECUTE FUNCTION fn_books_updated_at();

-- ── 2. Passagens de obras (trechos indexados) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_book_passages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id        UUID NOT NULL REFERENCES lampas_books(id) ON DELETE CASCADE,
  content        TEXT NOT NULL,
  page_number    INT,
  chapter        TEXT,
  section        TEXT,
  bible_ref      TEXT,          -- ex: 'Gn 39:1-6', 'Rm 3:21-26'
  passage_index  INT NOT NULL DEFAULT 0,
  user_id        UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_passages_book_idx     ON lampas_book_passages (book_id, passage_index);
CREATE INDEX IF NOT EXISTS book_passages_ref_idx      ON lampas_book_passages (bible_ref);
CREATE INDEX IF NOT EXISTS book_passages_fts_idx ON lampas_book_passages USING gin(
  (
    setweight(to_tsvector('portuguese', coalesce(content, '')), 'A') ||
    setweight(to_tsvector('simple',     coalesce(bible_ref, '')), 'B')
  )
);

-- ── 3. Notas pessoais do usuário sobre obras ──────────────────────────────────

CREATE TABLE IF NOT EXISTS lampas_book_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id    UUID NOT NULL REFERENCES lampas_books(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text  TEXT NOT NULL,
  note_type  TEXT NOT NULL DEFAULT 'annotation'
             CHECK (note_type IN ('annotation', 'bookmark', 'citation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_notes_user_book_idx ON lampas_book_notes (user_id, book_id);

CREATE OR REPLACE FUNCTION fn_book_notes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_book_notes_updated_at ON lampas_book_notes;
CREATE TRIGGER trg_book_notes_updated_at
  BEFORE UPDATE ON lampas_book_notes
  FOR EACH ROW EXECUTE FUNCTION fn_book_notes_updated_at();

-- ── 4. RPCs ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_book_query_count(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE lampas_books SET query_count = query_count + 1 WHERE id = p_id;
END;
$$;

-- Busca unificada na biblioteca: por termo + filtro de categoria + referência bíblica
CREATE OR REPLACE FUNCTION search_library(
  p_query    TEXT    DEFAULT NULL,
  p_category TEXT    DEFAULT NULL,
  p_ref      TEXT    DEFAULT NULL,
  p_limit    INT     DEFAULT 30
)
RETURNS TABLE (
  id                UUID,
  title             TEXT,
  author            TEXT,
  category          TEXT,
  year              SMALLINT,
  language          TEXT,
  description       TEXT,
  bible_references  TEXT[],
  theological_topics TEXT[],
  trust_level       SMALLINT,
  query_count       INT,
  rank              FLOAT4
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tsq TSQUERY;
BEGIN
  IF p_query IS NOT NULL AND p_query <> '' THEN
    BEGIN
      v_tsq := websearch_to_tsquery('portuguese', p_query);
    EXCEPTION WHEN OTHERS THEN
      v_tsq := to_tsquery('simple', regexp_replace(trim(p_query), '\s+', ':* & ', 'g') || ':*');
    END;
  END IF;

  RETURN QUERY
  SELECT
    b.id, b.title, b.author, b.category, b.year, b.language,
    b.description, b.bible_references, b.theological_topics,
    b.trust_level, b.query_count,
    COALESCE(
      CASE WHEN v_tsq IS NOT NULL THEN
        ts_rank(
          setweight(to_tsvector('portuguese', coalesce(b.title, '')),       'A') ||
          setweight(to_tsvector('simple',     coalesce(b.author, '')),      'A') ||
          setweight(to_tsvector('portuguese', coalesce(b.description, '')), 'B'),
          v_tsq
        )
      ELSE 0 END
    , 0)::FLOAT4 AS rank
  FROM lampas_books b
  WHERE
    (p_category IS NULL OR b.category = p_category)
    AND (p_ref IS NULL OR p_ref = ANY(b.bible_references) OR b.bible_references @> ARRAY[p_ref])
    AND (
      v_tsq IS NULL
      OR (
        setweight(to_tsvector('portuguese', coalesce(b.title, '')),       'A') ||
        setweight(to_tsvector('simple',     coalesce(b.author, '')),      'A') ||
        setweight(to_tsvector('portuguese', coalesce(b.description, '')), 'B')
      ) @@ v_tsq
      OR b.title  ILIKE '%' || p_query || '%'
      OR b.author ILIKE '%' || p_query || '%'
      OR p_query = ANY(b.theological_topics)
      OR p_query = ANY(b.tags)
    )
  ORDER BY rank DESC, b.trust_level DESC, b.query_count DESC
  LIMIT p_limit;
END;
$$;

-- Busca de passagens por referência bíblica
CREATE OR REPLACE FUNCTION search_passages_by_ref(
  p_ref   TEXT,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  passage_id    UUID,
  book_id       UUID,
  book_title    TEXT,
  book_author   TEXT,
  book_category TEXT,
  content       TEXT,
  page_number   INT,
  chapter       TEXT,
  section       TEXT,
  bible_ref     TEXT
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.book_id, b.title, b.author, b.category,
    p.content, p.page_number, p.chapter, p.section, p.bible_ref
  FROM lampas_book_passages p
  JOIN lampas_books b ON b.id = p.book_id
  WHERE p.bible_ref ILIKE '%' || p_ref || '%'
  ORDER BY b.trust_level DESC, p.passage_index
  LIMIT p_limit;
END;
$$;

-- ── 5. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE lampas_books         ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_book_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lampas_book_notes    ENABLE ROW LEVEL SECURITY;

-- Livros: qualquer autenticado lê, dono gerencia
DROP POLICY IF EXISTS "books_select" ON lampas_books;
DROP POLICY IF EXISTS "books_insert" ON lampas_books;
DROP POLICY IF EXISTS "books_update" ON lampas_books;
DROP POLICY IF EXISTS "books_delete" ON lampas_books;

DROP POLICY IF EXISTS "books_select" ON lampas_books;
CREATE POLICY "books_select" ON lampas_books FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "books_insert" ON lampas_books;
CREATE POLICY "books_insert" ON lampas_books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "books_update" ON lampas_books;
CREATE POLICY "books_update" ON lampas_books FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "books_delete" ON lampas_books;
CREATE POLICY "books_delete" ON lampas_books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Passagens: qualquer autenticado lê, dono gerencia
DROP POLICY IF EXISTS "passages_select" ON lampas_book_passages;
DROP POLICY IF EXISTS "passages_insert" ON lampas_book_passages;
DROP POLICY IF EXISTS "passages_delete" ON lampas_book_passages;

DROP POLICY IF EXISTS "passages_select" ON lampas_book_passages;
CREATE POLICY "passages_select" ON lampas_book_passages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "passages_insert" ON lampas_book_passages;
CREATE POLICY "passages_insert" ON lampas_book_passages FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "passages_delete" ON lampas_book_passages;
CREATE POLICY "passages_delete" ON lampas_book_passages FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Notas: cada usuário vê e gerencia apenas as suas
DROP POLICY IF EXISTS "notes_select" ON lampas_book_notes;
DROP POLICY IF EXISTS "notes_insert" ON lampas_book_notes;
DROP POLICY IF EXISTS "notes_update" ON lampas_book_notes;
DROP POLICY IF EXISTS "notes_delete" ON lampas_book_notes;

DROP POLICY IF EXISTS "notes_select" ON lampas_book_notes;
CREATE POLICY "notes_select" ON lampas_book_notes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notes_insert" ON lampas_book_notes;
CREATE POLICY "notes_insert" ON lampas_book_notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notes_update" ON lampas_book_notes;
CREATE POLICY "notes_update" ON lampas_book_notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notes_delete" ON lampas_book_notes;
CREATE POLICY "notes_delete" ON lampas_book_notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── 6. Grants ─────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON lampas_books         TO authenticated;
GRANT SELECT, INSERT, DELETE          ON lampas_book_passages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON lampas_book_notes   TO authenticated;
GRANT EXECUTE ON FUNCTION increment_book_query_count  TO authenticated;
GRANT EXECUTE ON FUNCTION search_library              TO authenticated;
GRANT EXECUTE ON FUNCTION search_passages_by_ref      TO authenticated;


-- ================================================================
-- Migration: 013_mercado_pago_billing.sql
-- ================================================================
-- ── Lampas — Mercado Pago Billing Definitivo ──────────────────────────────
-- Gateway oficial: Mercado Pago subscriptions/preapproval.
-- Liberação de plano somente por webhook ou sincronização server-side
-- validada no Mercado Pago.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider text DEFAULT 'mercado_pago',
  ADD COLUMN IF NOT EXISTS mercado_pago_preapproval_id text,
  ADD COLUMN IF NOT EXISTS mercado_pago_payer_id text,
  ADD COLUMN IF NOT EXISTS mercado_pago_init_point text,
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL',
  ADD COLUMN IF NOT EXISTS billing_interval text DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_payment_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_payment_id text,
  ADD COLUMN IF NOT EXISTS last_transaction_id text,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS gateway_raw jsonb DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_mp_preapproval_idx
  ON public.subscriptions(mercado_pago_preapproval_id)
  WHERE mercado_pago_preapproval_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_provider_status_idx
  ON public.subscriptions(provider, status);

CREATE TABLE IF NOT EXISTS public.billing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mercado_pago',
  plan text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL,
  status_detail text,
  mercado_pago_payment_id text,
  mercado_pago_authorized_payment_id text,
  mercado_pago_preapproval_id text,
  transaction_id text,
  paid_at timestamptz,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_payments_mp_payment_idx
  ON public.billing_payments(mercado_pago_payment_id)
  WHERE mercado_pago_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS billing_payments_mp_authorized_idx
  ON public.billing_payments(mercado_pago_authorized_payment_id)
  WHERE mercado_pago_authorized_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS billing_payments_user_created_idx
  ON public.billing_payments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS billing_payments_subscription_idx
  ON public.billing_payments(subscription_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'mercado_pago',
  event_id text,
  event_type text NOT NULL,
  resource_id text,
  action text,
  processed boolean NOT NULL DEFAULT false,
  processing_error text,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS billing_webhook_events_provider_event_idx
  ON public.billing_webhook_events(provider, event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS billing_webhook_events_resource_idx
  ON public.billing_webhook_events(provider, resource_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.billing_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'mercado_pago',
  event text NOT NULL,
  plan_before text,
  plan_after text,
  status_before text,
  status_after text,
  amount_cents integer,
  transaction_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_audit_logs_user_created_idx
  ON public.billing_audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS billing_audit_logs_subscription_created_idx
  ON public.billing_audit_logs(subscription_id, created_at DESC);

ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "billing_payments_select_own" ON public.billing_payments;
DROP POLICY IF EXISTS "billing_payments_admin_select" ON public.billing_payments;
DROP POLICY IF EXISTS "billing_payments_service_role" ON public.billing_payments;
DROP POLICY IF EXISTS "billing_webhook_events_admin_select" ON public.billing_webhook_events;
DROP POLICY IF EXISTS "billing_webhook_events_service_role" ON public.billing_webhook_events;
DROP POLICY IF EXISTS "billing_audit_logs_admin_select" ON public.billing_audit_logs;
DROP POLICY IF EXISTS "billing_audit_logs_service_role" ON public.billing_audit_logs;

DROP POLICY IF EXISTS "billing_payments_select_own" ON public.billing_payments;
CREATE POLICY "billing_payments_select_own"
  ON public.billing_payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "billing_payments_admin_select" ON public.billing_payments;
CREATE POLICY "billing_payments_admin_select"
  ON public.billing_payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "billing_payments_service_role" ON public.billing_payments;
CREATE POLICY "billing_payments_service_role"
  ON public.billing_payments
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "billing_webhook_events_admin_select" ON public.billing_webhook_events;
CREATE POLICY "billing_webhook_events_admin_select"
  ON public.billing_webhook_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "billing_webhook_events_service_role" ON public.billing_webhook_events;
CREATE POLICY "billing_webhook_events_service_role"
  ON public.billing_webhook_events
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "billing_audit_logs_admin_select" ON public.billing_audit_logs;
CREATE POLICY "billing_audit_logs_admin_select"
  ON public.billing_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS "billing_audit_logs_service_role" ON public.billing_audit_logs;
CREATE POLICY "billing_audit_logs_service_role"
  ON public.billing_audit_logs
  USING (auth.role() = 'service_role');

CREATE OR REPLACE VIEW public.v_admin_billing_subscriptions AS
SELECT
  s.id,
  s.user_id,
  p.email,
  p.full_name,
  s.provider,
  s.plan,
  s.status,
  s.amount_cents,
  s.currency,
  s.billing_interval,
  s.started_at,
  s.current_period_end,
  s.next_payment_at,
  s.cancel_at_period_end,
  s.mercado_pago_preapproval_id,
  s.last_payment_id,
  s.last_transaction_id,
  s.failure_reason,
  s.created_at,
  s.updated_at
FROM public.subscriptions s
LEFT JOIN public.profiles p ON p.id = s.user_id;

ALTER VIEW public.v_admin_billing_subscriptions SET (security_invoker = true);

GRANT SELECT ON public.v_admin_billing_subscriptions TO authenticated;


-- ================================================================
-- Migration: 014_billing_status_guard.sql
-- ================================================================
-- ── Lampas — Proteção de status de assinatura ────────────────────────────
-- Garante que limites de recursos não considerem assinaturas pendentes,
-- pausadas, recusadas ou canceladas como planos ativos.

CREATE OR REPLACE FUNCTION public.get_user_ai_status(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_plan text := 'free';
  v_used int  := 0;
BEGIN
  SELECT COALESCE(s.plan, 'free') INTO v_plan
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'authorized')
  LIMIT 1;

  SELECT COALESCE(u.count, 0) INTO v_used
  FROM public.ai_usage u
  WHERE u.user_id = p_user_id
    AND u.month = to_char(now(), 'YYYY-MM');

  RETURN json_build_object('plan', COALESCE(v_plan, 'free'), 'used', v_used);
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_ai_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_ai_status TO authenticated;


-- ================================================================
-- Migration: 015_project_soft_delete.sql
-- ================================================================
-- Soft-delete para projetos
-- Permite excluir estudos da Biblioteca com possibilidade de restauração futura

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_deleted_at
  ON public.projects (deleted_at)
  WHERE deleted_at IS NULL;


-- ================================================================
-- Migration: 016_new_study_modes.sql
-- ================================================================
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


-- ================================================================
-- Migration: 017_narrativas_mode.sql
-- ================================================================
-- Adiciona estudo_narrativas ao constraint de study_mode

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_study_mode_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_study_mode_check
  CHECK (study_mode IS NULL OR study_mode IN (
    'exegese_biblica',
    'estudo_de_carta',
    'estudo_de_salmos_sabedoria',
    'estudo_de_profecias',
    'estudo_narrativas',
    'estudo_doutrinario',
    'estudo_tematico',
    'sermao',
    'estudo_biblico',
    'devocional',
    'comentario_exegetico'
  ));


-- ================================================================
-- Migration: 018_demo_project.sql
-- ================================================================
-- Adiciona flag is_demo à tabela projects
-- Identifica projetos guiados criados pelo onboarding

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;


-- ================================================================
-- Migration: 019_knowledge_base.sql
-- ================================================================
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

DROP POLICY IF EXISTS "knowledge_items_select_own" ON public.knowledge_items;
CREATE POLICY "knowledge_items_select_own" ON public.knowledge_items FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_items_insert_own" ON public.knowledge_items;
CREATE POLICY "knowledge_items_insert_own" ON public.knowledge_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_items_update_own" ON public.knowledge_items;
CREATE POLICY "knowledge_items_update_own" ON public.knowledge_items FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_items_delete_own" ON public.knowledge_items;
CREATE POLICY "knowledge_items_delete_own" ON public.knowledge_items FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "knowledge_entities_select_own" ON public.knowledge_entities;
CREATE POLICY "knowledge_entities_select_own" ON public.knowledge_entities FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_entities_insert_own" ON public.knowledge_entities;
CREATE POLICY "knowledge_entities_insert_own" ON public.knowledge_entities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_entities_update_own" ON public.knowledge_entities;
CREATE POLICY "knowledge_entities_update_own" ON public.knowledge_entities FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_entities_delete_own" ON public.knowledge_entities;
CREATE POLICY "knowledge_entities_delete_own" ON public.knowledge_entities FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "knowledge_item_entities_select_own" ON public.knowledge_item_entities;
CREATE POLICY "knowledge_item_entities_select_own" ON public.knowledge_item_entities FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_item_entities_insert_own" ON public.knowledge_item_entities;
CREATE POLICY "knowledge_item_entities_insert_own" ON public.knowledge_item_entities FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_item_entities_update_own" ON public.knowledge_item_entities;
CREATE POLICY "knowledge_item_entities_update_own" ON public.knowledge_item_entities FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_item_entities_delete_own" ON public.knowledge_item_entities;
CREATE POLICY "knowledge_item_entities_delete_own" ON public.knowledge_item_entities FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "knowledge_item_links_select_own" ON public.knowledge_item_links;
CREATE POLICY "knowledge_item_links_select_own" ON public.knowledge_item_links FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_item_links_insert_own" ON public.knowledge_item_links;
CREATE POLICY "knowledge_item_links_insert_own" ON public.knowledge_item_links FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_item_links_update_own" ON public.knowledge_item_links;
CREATE POLICY "knowledge_item_links_update_own" ON public.knowledge_item_links FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_item_links_delete_own" ON public.knowledge_item_links;
CREATE POLICY "knowledge_item_links_delete_own" ON public.knowledge_item_links FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_item_entities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_item_links TO authenticated;
GRANT SELECT ON public.v_knowledge_dashboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_knowledge_item_query_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_knowledge_items TO authenticated;


-- ================================================================
-- Migration: 020_boletim.sql
-- ================================================================
-- 020_boletim.sql
-- Lampas — Boletim de novidades e changelog público

CREATE TABLE IF NOT EXISTS public.boletim_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version      text NOT NULL,
  release_date date NOT NULL,
  title        text NOT NULL,
  content      text NOT NULL DEFAULT '',
  tags         text[] NOT NULL DEFAULT '{}',
  published    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boletim_date ON public.boletim_entries (release_date DESC);
CREATE INDEX IF NOT EXISTS idx_boletim_published ON public.boletim_entries (published, release_date DESC);

CREATE OR REPLACE FUNCTION public.fn_boletim_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_boletim_updated_at ON public.boletim_entries;
CREATE TRIGGER trg_boletim_updated_at
  BEFORE UPDATE ON public.boletim_entries
  FOR EACH ROW EXECUTE FUNCTION public.fn_boletim_updated_at();

ALTER TABLE public.boletim_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "boletim_select_published" ON public.boletim_entries;
CREATE POLICY "boletim_select_published" ON public.boletim_entries
  FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "boletim_admin_all" ON public.boletim_entries;
CREATE POLICY "boletim_admin_all" ON public.boletim_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ================================================================
-- Migration: 021_confessions_catechisms.sql
-- ================================================================
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

DROP POLICY IF EXISTS "confessional_documents_select" ON public.lampas_confessional_documents;
CREATE POLICY "confessional_documents_select" ON public.lampas_confessional_documents
  FOR SELECT TO authenticated USING (is_shared = true);

DROP POLICY IF EXISTS "confessional_sections_select" ON public.lampas_confessional_sections;
CREATE POLICY "confessional_sections_select" ON public.lampas_confessional_sections
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.lampas_confessional_documents d
      WHERE d.id = document_id AND d.is_shared = true
    )
  );

DROP POLICY IF EXISTS "confessional_questions_select" ON public.lampas_confessional_questions;
CREATE POLICY "confessional_questions_select" ON public.lampas_confessional_questions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.lampas_confessional_documents d
      WHERE d.id = document_id AND d.is_shared = true
    )
  );

DROP POLICY IF EXISTS "confessional_dictionary_links_select" ON public.lampas_confessional_dictionary_links;
CREATE POLICY "confessional_dictionary_links_select" ON public.lampas_confessional_dictionary_links
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "confessional_doctrine_links_select" ON public.lampas_confessional_doctrine_links;
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


-- ================================================================
-- Migration: 022_editorial_hub.sql
-- ================================================================
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
DROP POLICY IF EXISTS "hub_channels_select" ON public.editorial_channels;
CREATE POLICY "hub_channels_select" ON public.editorial_channels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

DROP POLICY IF EXISTS "hub_channels_insert" ON public.editorial_channels;
CREATE POLICY "hub_channels_insert" ON public.editorial_channels
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

DROP POLICY IF EXISTS "hub_channels_update" ON public.editorial_channels;
CREATE POLICY "hub_channels_update" ON public.editorial_channels
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

DROP POLICY IF EXISTS "hub_channels_delete" ON public.editorial_channels;
CREATE POLICY "hub_channels_delete" ON public.editorial_channels
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

-- editorial_publications: somente hub editors (leitura pública via service_role na API)
DROP POLICY IF EXISTS "hub_publications_hub_editor" ON public.editorial_publications;
CREATE POLICY "hub_publications_hub_editor" ON public.editorial_publications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

-- editorial_series: somente hub editors
DROP POLICY IF EXISTS "hub_series_hub_editor" ON public.editorial_series;
CREATE POLICY "hub_series_hub_editor" ON public.editorial_series
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );

DROP POLICY IF EXISTS "hub_pub_series_hub_editor" ON public.editorial_publication_series;
CREATE POLICY "hub_pub_series_hub_editor" ON public.editorial_publication_series
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_hub_editor = true)
  );


-- ================================================================
-- Migration: 022_project_publishing.sql
-- ================================================================
-- Lampas — Publicação interna de projetos
-- Nesta etapa, publicar significa exibir o projeto em "Meus Projetos".

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_projects_user_published
  ON public.projects (user_id, published, published_at DESC)
  WHERE deleted_at IS NULL;


-- ================================================================
-- Migration: 023_boletim_seo_fields.sql
-- ================================================================
-- 023_boletim_seo_fields.sql
-- Adiciona campos SEO e slug a boletim_entries
-- Todas as colunas são nullable — nenhuma entrada existente é afetada.

ALTER TABLE public.boletim_entries
  ADD COLUMN IF NOT EXISTS slug                 text,
  ADD COLUMN IF NOT EXISTS cover_image_url      text,
  ADD COLUMN IF NOT EXISTS seo_title            text,
  ADD COLUMN IF NOT EXISTS seo_description      text,
  ADD COLUMN IF NOT EXISTS og_image_url         text,
  ADD COLUMN IF NOT EXISTS reading_time_minutes integer;

-- Backfill de slugs para entradas existentes
-- Padrão: versão normalizada + sufixo do id quando há duplicatas
DO $$
DECLARE
  r RECORD;
  base_slug text;
  final_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, version FROM public.boletim_entries WHERE slug IS NULL ORDER BY created_at
  LOOP
    base_slug  := regexp_replace(lower(r.version), '[^a-z0-9]+', '-', 'g');
    final_slug := base_slug;
    counter    := 1;

    WHILE EXISTS (SELECT 1 FROM public.boletim_entries WHERE slug = final_slug) LOOP
      final_slug := base_slug || '-' || counter;
      counter    := counter + 1;
    END LOOP;

    UPDATE public.boletim_entries SET slug = final_slug WHERE id = r.id;
  END LOOP;
END;
$$;

-- Índice único parcial (não-nulos) — slug será exigido apenas em novas entradas via UI
CREATE UNIQUE INDEX IF NOT EXISTS idx_boletim_slug
  ON public.boletim_entries (slug)
  WHERE slug IS NOT NULL;


-- ================================================================
-- Migration: 023_production_study_modes.sql
-- ================================================================
-- Lampas — modos de produção como study_mode nativos
-- Permite que Aula, Artigo, E-book, Livro, Palestra, Curso e Série de
-- Mensagens tenham navegação interna própria, sem serem salvos como
-- Estudo Bíblico genérico.

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


-- ================================================================
-- Migration: 024_estudo_termos_mode.sql
-- ================================================================
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


-- ================================================================
-- Migration: 025_agenda_ministerial.sql
-- ================================================================
-- =============================================
-- AGENDA MINISTERIAL — Migration 025 (idempotente)
-- =============================================

-- =============================================
-- ENUM types (idempotentes via DO blocks)
-- =============================================
DO $$ BEGIN
  CREATE TYPE agenda_event_type AS ENUM (
    'pregacao','estudo_biblico','ebd','palestra','conferencia',
    'congresso','casamento','batismo','santa_ceia',
    'atendimento_pastoral','reuniao','curso','live','gravacao','outro'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE agenda_event_status AS ENUM ('confirmado','tentativo','cancelado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE agenda_sermon_status AS ENUM ('planejada','em_preparacao','pronta','pregada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE agenda_pastoral_category AS ENUM (
    'aconselhamento','casamento','discipulado','visita','hospital','outro'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================
-- AGENDA_EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.agenda_events (
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

DROP POLICY IF EXISTS "agenda_events: owner full access" ON public.agenda_events;
DROP POLICY IF EXISTS "agenda_events: owner full access" ON public.agenda_events;
CREATE POLICY "agenda_events: owner full access"
  ON public.agenda_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_agenda_events_user_id    ON public.agenda_events(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_starts_at  ON public.agenda_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_agenda_events_project_id ON public.agenda_events(project_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_user_date  ON public.agenda_events(user_id, starts_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_agenda_events ON public.agenda_events;
CREATE TRIGGER set_updated_at_agenda_events
  BEFORE UPDATE ON public.agenda_events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_SERMONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.agenda_sermons (
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

DROP POLICY IF EXISTS "agenda_sermons: owner full access" ON public.agenda_sermons;
DROP POLICY IF EXISTS "agenda_sermons: owner full access" ON public.agenda_sermons;
CREATE POLICY "agenda_sermons: owner full access"
  ON public.agenda_sermons FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_agenda_sermons_user_id    ON public.agenda_sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_sermons_event_id   ON public.agenda_sermons(event_id);
CREATE INDEX IF NOT EXISTS idx_agenda_sermons_project_id ON public.agenda_sermons(project_id);
CREATE INDEX IF NOT EXISTS idx_agenda_sermons_scheduled  ON public.agenda_sermons(scheduled_at DESC NULLS LAST);

DROP TRIGGER IF EXISTS set_updated_at_agenda_sermons ON public.agenda_sermons;
CREATE TRIGGER set_updated_at_agenda_sermons
  BEFORE UPDATE ON public.agenda_sermons
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_PASTORAL_CARE
-- =============================================
CREATE TABLE IF NOT EXISTS public.agenda_pastoral_care (
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

DROP POLICY IF EXISTS "agenda_pastoral_care: owner only" ON public.agenda_pastoral_care;
DROP POLICY IF EXISTS "agenda_pastoral_care: owner only" ON public.agenda_pastoral_care;
CREATE POLICY "agenda_pastoral_care: owner only"
  ON public.agenda_pastoral_care FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pastoral_care_user_id      ON public.agenda_pastoral_care(user_id);
CREATE INDEX IF NOT EXISTS idx_pastoral_care_scheduled_at ON public.agenda_pastoral_care(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_pastoral_care_category     ON public.agenda_pastoral_care(user_id, category);

DROP TRIGGER IF EXISTS set_updated_at_agenda_pastoral_care ON public.agenda_pastoral_care;
CREATE TRIGGER set_updated_at_agenda_pastoral_care
  BEFORE UPDATE ON public.agenda_pastoral_care
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_GOOGLE_TOKENS
-- =============================================
CREATE TABLE IF NOT EXISTS public.agenda_google_tokens (
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

DROP POLICY IF EXISTS "agenda_google_tokens: owner only" ON public.agenda_google_tokens;
DROP POLICY IF EXISTS "agenda_google_tokens: owner only" ON public.agenda_google_tokens;
CREATE POLICY "agenda_google_tokens: owner only"
  ON public.agenda_google_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at_agenda_google_tokens ON public.agenda_google_tokens;
CREATE TRIGGER set_updated_at_agenda_google_tokens
  BEFORE UPDATE ON public.agenda_google_tokens
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================
-- AGENDA_SYNC_LOG
-- =============================================
CREATE TABLE IF NOT EXISTS public.agenda_sync_log (
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

DROP POLICY IF EXISTS "agenda_sync_log: owner read" ON public.agenda_sync_log;
DROP POLICY IF EXISTS "agenda_sync_log: owner read" ON public.agenda_sync_log;
CREATE POLICY "agenda_sync_log: owner read"
  ON public.agenda_sync_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sync_log_user_id    ON public.agenda_sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_created_at ON public.agenda_sync_log(created_at DESC);

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


