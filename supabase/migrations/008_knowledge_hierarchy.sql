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
