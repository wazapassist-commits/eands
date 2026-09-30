-- Essential and Simple — schéma Supabase
-- À exécuter une fois dans l'éditeur SQL du projet (Database > SQL Editor).

-- ---------- Produits ----------
create table if not exists products (
  slug text primary key,
  price numeric not null default 29,
  sold_out boolean not null default false,
  limited boolean not null default false,
  colors text[] not null default '{noir,blanc}',
  images text[] not null default '{}',
  name_fr text not null default '',
  name_en text not null default '',
  tagline_fr text not null default '',
  tagline_en text not null default '',
  desc_fr text not null default '',
  desc_en text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Réglages (une seule ligne, id = 1) ----------
create table if not exists settings (
  id integer primary key,
  promo_fr text not null default '',
  promo_en text not null default '',
  whatsapp text not null default ''
);

insert into settings (id, promo_fr, promo_en, whatsapp)
values (
  1,
  'Jusqu’à −30 % sur une sélection de pièces',
  'Up to 30% off select styles',
  '14435716853'
)
on conflict (id) do nothing;

-- ---------- Abonnés newsletter ----------
create table if not exists subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- ---------- Commandes ----------
create table if not exists orders (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null default '',
  phone text not null default '',
  detail text not null default '',
  total numeric not null default 0,
  status text not null default 'new'
);

-- ---------- Sécurité (RLS) ----------
alter table products enable row level security;
alter table settings enable row level security;
alter table subscribers enable row level security;
alter table orders enable row level security;

-- Lecture publique : catalogue + réglages (la boutique en a besoin).
drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);

drop policy if exists "public read settings" on settings;
create policy "public read settings" on settings for select using (true);

-- Écriture catalogue/réglages : compte admin connecté uniquement.
drop policy if exists "admin write products" on products;
create policy "admin write products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write settings" on settings;
create policy "admin write settings" on settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Newsletter : inscription publique, gestion par l'admin.
drop policy if exists "public subscribe" on subscribers;
create policy "public subscribe" on subscribers for insert with check (true);

drop policy if exists "admin manage subscribers" on subscribers;
create policy "admin manage subscribers" on subscribers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Commandes : création publique (futur checkout), gestion par l'admin.
drop policy if exists "public create order" on orders;
create policy "public create order" on orders for insert with check (true);

drop policy if exists "admin manage orders" on orders;
create policy "admin manage orders" on orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
