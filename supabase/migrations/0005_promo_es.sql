-- Essential and Simple — migration 5 : texte promo espagnol.
-- À exécuter dans l'éditeur SQL Supabase après 0004.

alter table settings add column if not exists promo_es text not null default '';

update settings
set promo_es = 'Hasta −30 % en una selección de prendas'
where id = 1 and promo_es = '';
