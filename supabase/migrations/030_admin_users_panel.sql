-- Lampas — Painel Administrativo de Usuários (V1).
-- Depende da migration 029 (user_activity_events, profiles.last_active_at,
-- v_admin_users_overview). Esta migration adiciona só o necessário para a
-- ação "Bloquear/Desbloquear usuário" da tela Admin > Usuários.

alter table public.profiles add column if not exists is_blocked boolean not null default false;

-- A view de overview já existe (migration 029) mas foi criada antes desta
-- coluna. CREATE OR REPLACE VIEW só permite ADICIONAR coluna no final da
-- lista (Postgres trata inserção no meio como rename de coluna existente,
-- erro 42P16) — por isso is_blocked vai depois de ai_cost_usd_30d, não
-- junto das outras colunas de profiles.
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
  (select coalesce(sum(ai.cost_usd), 0) from public.ai_interactions ai where ai.user_id = p.id and ai.created_at > now() - interval '30 days') as ai_cost_usd_30d,
  p.is_blocked
from public.profiles p
left join public.subscriptions s on s.user_id = p.id;

grant select on public.v_admin_users_overview to authenticated;
