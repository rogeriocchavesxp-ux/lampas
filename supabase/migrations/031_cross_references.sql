-- Tabela de referências cruzadas bíblicas
-- Projetada para receber importação futura de TSK, Thompson Chain, etc.

create table if not exists public.cross_references (
  id                   uuid primary key default gen_random_uuid(),
  source_book          text not null,
  source_chapter       int  not null,
  source_verse_start   int  not null,
  source_verse_end     int  not null,
  concept              text not null,
  ref_type             text not null check (ref_type in (
                         'paralelo', 'citacao', 'alusao', 'tema',
                         'tipologia', 'cristologica', 'redencao', 'alianca'
                       )),
  target_refs          text[] not null default '{}',
  source_base          text not null default 'lampas',
  created_at           timestamptz not null default now()
);

create index if not exists cross_references_passage_idx
  on public.cross_references (source_book, source_chapter, source_verse_start, source_verse_end);

create index if not exists cross_references_type_idx
  on public.cross_references (ref_type);

-- RLS: leitura pública, escrita autenticada
alter table public.cross_references enable row level security;

create policy "cross_references_read_all"
  on public.cross_references for select using (true);

create policy "cross_references_write_authenticated"
  on public.cross_references for all using (auth.role() = 'authenticated');
