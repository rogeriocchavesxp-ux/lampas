-- Introduções canônicas por livro bíblico — conteúdo editorial da plataforma Lampas.
-- Não é conteúdo do usuário: apenas SELECT para autenticados; INSERT/UPDATE via service role.

create table public.book_introductions (
  id                    uuid        primary key default gen_random_uuid(),
  book_key              text        not null unique,   -- corresponde a projects.book
  testament             text        not null check (testament in ('AT','NT')),
  book_name             text        not null,
  canonical_order       int         not null,
  literary_category     text,

  -- Autoria
  author                text,
  author_discussion     jsonb       not null default '{}'::jsonb,
  -- { traditional: "", critical: "", evangelical: "", pastoral: "" }

  -- Data
  date_estimate         text,
  date_discussion       jsonb       not null default '{}'::jsonb,
  -- { traditional: "", critical: "", evangelical: "", pastoral: "" }

  -- Contexto
  recipients            text,
  historical_context    text,
  cultural_context      text,

  -- Propósito e tema
  purpose               text,
  central_theme         text,

  -- Estrutura
  structure             text,
  main_divisions        jsonb       not null default '[]'::jsonb,
  -- [{ title: "", description: "" }, ...]

  -- Teologia
  theological_emphases  text,
  redemptive_history    text,
  christ_relation       text,

  -- Questões interpretativas
  interpretive_issues   jsonb       not null default '[]'::jsonb,
  -- [{ question: "", positions: { traditional: "", critical: "", evangelical: "", pastoral: "" } }]

  -- Posição conservadora / reformada
  conservative_position text,

  -- Referências e observações
  bibliography          jsonb       not null default '[]'::jsonb,
  -- [{ author: "", work: "", publisher: "", year: "" }]
  pastoral_observations text,
  summary               text,

  updated_at            timestamptz not null default now()
);

create index book_introductions_testament_idx on public.book_introductions(testament);
create index book_introductions_order_idx     on public.book_introductions(canonical_order);

alter table public.book_introductions enable row level security;

-- Qualquer usuário autenticado pode ler
create policy "book_introductions_select"
  on public.book_introductions for select
  to authenticated
  using (true);

-- Apenas service role pode inserir e atualizar (sem policy = bloqueado para authenticated)
