-- Adiciona suporte a itens de template na base de conhecimento.
-- Templates são visíveis para todos os usuários autenticados (somente leitura).

ALTER TABLE public.knowledge_items
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false;

-- Substitui a política de SELECT para incluir templates públicos
DROP POLICY IF EXISTS "knowledge_items_select_own" ON public.knowledge_items;

CREATE POLICY "knowledge_items_select_own_or_template"
  ON public.knowledge_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_template = true);
