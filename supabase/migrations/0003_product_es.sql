-- Essential and Simple — migration 3 : textes espagnols des produits.
-- À exécuter dans l'éditeur SQL Supabase après 0002.

alter table products add column if not exists name_es text not null default '';
alter table products add column if not exists tagline_es text not null default '';
alter table products add column if not exists desc_es text not null default '';
