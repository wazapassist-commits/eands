-- Essential and Simple — migration 2 : contenus du site + upload d'images
-- À exécuter dans l'éditeur SQL Supabase après 0001_init.sql.

-- ---------- Contenus (JSON : hero, catégories, mosaïques…) ----------
alter table settings add column if not exists content jsonb not null default '{}';

-- ---------- Bucket public pour les images uploadées ----------
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Lecture publique des images.
drop policy if exists "public read site-images" on storage.objects;
create policy "public read site-images" on storage.objects
  for select using (bucket_id = 'site-images');

-- Upload / suppression : compte admin connecté uniquement.
drop policy if exists "admin write site-images" on storage.objects;
create policy "admin write site-images" on storage.objects
  for all using (bucket_id = 'site-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'site-images' and auth.role() = 'authenticated');
