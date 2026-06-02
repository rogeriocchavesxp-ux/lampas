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
