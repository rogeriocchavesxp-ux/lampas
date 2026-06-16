-- Lampas — Fundação de dados para o futuro Painel Administrativo de Usuários.
-- Origem: auditoria de banco de dados de 2026-06-16 (ver vault Claude/Lampas — Auditoria Banco de Dados (Painel Admin).md).
-- Esta migration é só estrutura: nenhuma tela ou componente é criado aqui.

-- ── 1. Log genérico de atividade do usuário ──────────────────────────────────
-- Hoje só billing tem auditoria completa (billing_audit_logs). CRUD de projects,
-- productions e knowledge_items só deixa created_at/updated_at — sem histórico
-- de ações e sem sinal de "usuário ativo vs. abandonou".

create table public.user_activity_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_type  text not null, -- ex: login, project_created, project_deleted, production_created, knowledge_item_created, content_published, ai_query
  entity_type text,
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index user_activity_events_user_created_idx on public.user_activity_events(user_id, created_at desc);
create index user_activity_events_type_created_idx on public.user_activity_events(event_type, created_at desc);

alter table public.user_activity_events enable row level security;

create policy "user_activity_events_own_select"
  on public.user_activity_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_activity_events_admin_select"
  on public.user_activity_events for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Sem policy de INSERT: toda escrita passa pela RPC SECURITY DEFINER abaixo
-- (mesmo padrão de increment_ai_usage / increment_dictionary_query_count já usado no projeto).

-- ── 2. Sinal de última atividade em profiles ─────────────────────────────────

alter table public.profiles add column if not exists last_active_at timestamptz;

-- ── 3. RPC de registro de atividade ───────────────────────────────────────────
-- p_user_id só é usado quando chamado via service_role (auth.uid() é null nesse
-- contexto, ex: Server Actions administrativas). Para o role "authenticated",
-- auth.uid() nunca é null, então p_user_id é ignorado — não há risco de um
-- usuário forjar evento em nome de outro.

create or replace function public.log_activity(
  p_event_type  text,
  p_entity_type text default null,
  p_entity_id   uuid default null,
  p_metadata    jsonb default '{}'::jsonb,
  p_user_id     uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := coalesce(auth.uid(), p_user_id);
begin
  if v_user_id is null then
    return;
  end if;

  insert into public.user_activity_events (user_id, event_type, entity_type, entity_id, metadata)
  values (v_user_id, p_event_type, p_entity_type, p_entity_id, p_metadata);

  update public.profiles
     set last_active_at = now()
   where id = v_user_id;
end;
$$;

revoke all on function public.log_activity from public;
grant execute on function public.log_activity to authenticated, service_role;

-- ── 4. Corrige productions.user_id sem FK ────────────────────────────────────
-- Única tabela do schema cujo user_id não referenciava auth.users — só era
-- protegida por RLS, não pelo banco. Antes de aplicar em produção, validar órfãos:
--   select id, user_id from public.productions p
--   where not exists (select 1 from auth.users u where u.id = p.user_id);
-- Se houver órfãos, decidir caso a caso (corrigir user_id ou remover a linha)
-- antes de rodar o ALTER abaixo.

alter table public.productions
  add constraint productions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- ── 5. Views administrativas (somente leitura, prontas para o futuro painel) ─
-- ⚠️ Estas views NÃO aplicam RLS própria (mesmo padrão de v_admin_billing_subscriptions
-- já existente no projeto) — devem ser consultadas apenas a partir de rotas
-- server-side que já validam profiles.role = 'admin' antes da query (ver
-- src/app/api/admin/usage/route.ts), nunca diretamente do client.

create or replace view public.v_admin_users_overview as
select
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_hub_editor,
  coalesce(s.plan, p.plan, 'free') as plan,
  s.status as subscription_status,
  p.created_at,
  p.last_active_at,
  (select count(*) from public.projects pr where pr.user_id = p.id and pr.deleted_at is null) as project_count,
  (select count(*) from public.productions pd where pd.user_id = p.id) as production_count,
  (select count(*) from public.ai_interactions ai where ai.user_id = p.id and ai.created_at > now() - interval '30 days') as ai_calls_30d,
  (select coalesce(sum(ai.cost_usd), 0) from public.ai_interactions ai where ai.user_id = p.id and ai.created_at > now() - interval '30 days') as ai_cost_usd_30d
from public.profiles p
left join public.subscriptions s on s.user_id = p.id;

grant select on public.v_admin_users_overview to authenticated;

create or replace view public.v_admin_engagement_by_feature as
select
  'estudo'::text as feature_kind,
  coalesce(study_mode, 'sem_modo') as feature_key,
  count(*) as total,
  count(*) filter (where deleted_at is null) as total_active,
  max(updated_at) as last_activity_at
from public.projects
group by study_mode
union all
select
  'producao'::text as feature_kind,
  type as feature_key,
  count(*) as total,
  count(*) as total_active,
  max(updated_at) as last_activity_at
from public.productions
group by type;

grant select on public.v_admin_engagement_by_feature to authenticated;

-- ── 6. Limpeza opcional — NÃO executar automaticamente ───────────────────────
-- profiles.stripe_customer_id / stripe_subscription_id são legado do Stripe
-- (removido em favor do Mercado Pago). Avaliar antes de descomentar e rodar:
--   grep -rn "stripe_customer_id\|stripe_subscription_id" src/
-- alter table public.profiles drop column if exists stripe_customer_id;
-- alter table public.profiles drop column if exists stripe_subscription_id;
