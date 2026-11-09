-- V2 : nouvelles catégories d'adresses et section « Préparer mon séjour ».
-- Fichier à part : Postgres n'autorise pas l'usage d'une nouvelle valeur d'enum dans la transaction qui la crée.
alter type public.place_category add value 'hiking';
alter type public.place_category add value 'horse_riding';
alter type public.place_category add value 'bike_rental';
alter type public.place_category add value 'kids_leisure';
alter type public.place_category add value 'groceries';
alter type public.place_category add value 'pharmacy';
alter type public.place_category add value 'transport';
alter type public.section_type add value 'prepare';
