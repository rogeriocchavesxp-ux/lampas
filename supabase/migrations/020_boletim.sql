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

CREATE POLICY "boletim_select_published" ON public.boletim_entries
  FOR SELECT USING (published = true);

CREATE POLICY "boletim_admin_all" ON public.boletim_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
