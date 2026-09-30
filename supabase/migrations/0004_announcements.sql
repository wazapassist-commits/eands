-- Essential and Simple — migration 4 : annonces du site.
-- À exécuter dans l'éditeur SQL Supabase après 0003.

create table if not exists announcements (
  id text primary key,
  created_at timestamptz not null default now(),
  text_fr text not null default '',
  text_en text not null default '',
  text_es text not null default '',
  link text not null default '',
  active boolean not null default true,
  sort integer not null default 0
);

alter table announcements enable row level security;

-- Lecture publique (le site affiche les annonces actives).
drop policy if exists "public read announcements" on announcements;
create policy "public read announcements" on announcements for select using (true);

-- Gestion : compte admin connecté uniquement.
drop policy if exists "admin manage announcements" on announcements;
create policy "admin manage announcements" on announcements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
