-- Tabela de produções independentes por projeto bíblico.
-- Cada project pode ter N produções (sermão, devocional, artigo, etc.)
-- compartilhando a mesma base exegética (Preparar + Investigar).

create table public.productions (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null,
  type       text not null default 'livre',
  title      text not null default 'Nova Produção',
  content    jsonb not null default '{}'::jsonb,
  status     text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index productions_project_id_idx on public.productions(project_id);
create index productions_user_id_idx    on public.productions(user_id);

alter table public.productions enable row level security;

create policy "productions_own"
  on public.productions for all
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
