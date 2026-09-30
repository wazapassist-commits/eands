-- Essential and Simple — migration 6 : lien de paiement Stripe par produit.
-- À exécuter dans l'éditeur SQL Supabase après 0005.

alter table products add column if not exists link_stripe text not null default '';
