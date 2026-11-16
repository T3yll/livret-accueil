-- Expériences de l'hiver 2026-2027, relevées le 16 nov. 2026 sur les fiches officielles :
--   tourisme-occitanie.com (Lalbenque, Gourdon) et dordogne-perigord-tourisme.fr (Sarlat).
-- Seules les dates publiées pour la saison 2026-2027 sont saisies. À reconfirmer avant la démo
-- (programmes « à venir » ou « en cours d'élaboration » pour Lalbenque et Gourdon).
-- Les lieux nouveaux reçoivent une fermeture hors saison : le filtre « ouvert pendant mon séjour » les masque alors.
begin;

-- 1. Marché aux truffes de Lalbenque (nouveau lieu) : tous les mardis du 1er déc. 2026 au 2 mars 2027,
--    animations dès 13 h 30, démonstration de cavage à 15 h 30. Fête de la truffe : 29 et 30 janv. 2027
--    (la fiche annonce aussi le 31 dans son texte, mais pas dans ses dates d'ouverture : non saisi).
insert into public.places (name, category, address, postal_code, city, lat, lng, opening_mode, website, is_experience,
                           description_fr, description_en)
select 'Marché aux truffes de Lalbenque', 'market', 'Rue du marché aux truffes', '46230', 'Lalbenque', 44.3371919, 1.5470218,
       'unknown', 'https://www.tourisme-occitanie.com/fr/fiche/fete-et-manifestation/marche-aux-truffes-a-lalbenque-lalbenque_TFOFMAMIP046V5274WE/',
       true,
       'Le grand marché aux truffes noires du Quercy, chaque mardi après-midi de l''hiver : vente sous la halle et dans la rue, démonstration de cavage avec le chien truffier.',
       'The great black truffle market of the Quercy, every Tuesday afternoon in winter: sales in the market hall and the street, and a truffle-dog hunting demonstration.'
where not exists (select 1 from public.places where name = 'Marché aux truffes de Lalbenque');

insert into public.place_events (place_id, starts_on, start_time, label_fr, label_en)
select pl.id, d::date, '13:30', 'Marché aux truffes · cavage à 15 h 30', 'Truffle market · truffle hunt demo at 3:30 pm'
from public.places pl, generate_series('2026-12-01'::date, '2027-03-02'::date, interval '7 days') as d
where pl.name = 'Marché aux truffes de Lalbenque'
  and not exists (select 1 from public.place_events e where e.place_id = pl.id and e.starts_on = d::date);

insert into public.place_events (place_id, starts_on, label_fr, label_en, booking_url)
select pl.id, d, 'Fête de la truffe', 'Truffle festival', 'https://billetterie.festik.net/commune-de-lalbenque/'
from public.places pl, (values ('2027-01-29'::date), ('2027-01-30'::date)) as v (d)
where pl.name = 'Marché aux truffes de Lalbenque'
  and not exists (select 1 from public.place_events e where e.place_id = pl.id and e.starts_on = v.d);

insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
select pl.id, '2027-03-03', '2027-11-30', 'Marché d''hiver seulement (décembre à début mars)', 'Winter market only (December to early March)'
from public.places pl
where pl.name = 'Marché aux truffes de Lalbenque'
  and not exists (select 1 from public.place_closures c where c.place_id = pl.id and c.starts_on = '2027-03-03');

-- 2. Village de Noël de Gourdon (nouveau lieu) : du 17 au 31 déc. 2026, place du cinéma (programme en cours).
insert into public.places (name, category, address, postal_code, city, lat, lng, opening_mode, website, is_experience,
                           description_fr, description_en)
select 'Village de Noël de Gourdon', 'family', 'Place du cinéma', '46300', 'Gourdon', 44.7380659, 1.3846871,
       'unknown', 'https://www.tourisme-occitanie.com/fr/fiche/fete-et-manifestation/village-de-noel-a-gourdon-gourdon_TFOFMAMIP046V51YL2H/',
       true,
       'Chalets d''artisans, illuminations, promenades en calèche et musique pour les fêtes, au cœur de Gourdon.',
       'Craft chalets, festive lights, horse-drawn carriage rides and music for the holidays, in the heart of Gourdon.'
where not exists (select 1 from public.places where name = 'Village de Noël de Gourdon');

insert into public.place_events (place_id, starts_on, label_fr, label_en)
select pl.id, d::date, 'Village de Noël', 'Christmas village'
from public.places pl, generate_series('2026-12-17'::date, '2026-12-31'::date, interval '1 day') as d
where pl.name = 'Village de Noël de Gourdon'
  and not exists (select 1 from public.place_events e where e.place_id = pl.id and e.starts_on = d::date);

insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
select pl.id, '2027-01-01', '2027-12-15', 'Seulement pendant les fêtes de fin d''année', 'Only during the Christmas holidays'
from public.places pl
where pl.name = 'Village de Noël de Gourdon'
  and not exists (select 1 from public.place_closures c where c.place_id = pl.id and c.starts_on = '2027-01-01');

-- 3. Fête de la truffe de Sarlat, 16 et 17 janv. 2027, place de la Liberté (menu prestige le samedi soir, sur réservation).
update public.places set is_experience = true where name = 'Marché aux truffes de Sarlat' and archived_at is null;
insert into public.place_events (place_id, starts_on, label_fr, label_en)
select pl.id, v.d, 'Fête de la truffe, place de la Liberté', 'Truffle festival, place de la Liberté'
from public.places pl, (values ('2027-01-16'::date), ('2027-01-17'::date)) as v (d)
where pl.name = 'Marché aux truffes de Sarlat'
  and not exists (select 1 from public.place_events e where e.place_id = pl.id and e.starts_on = v.d);

-- 4. Fest'Oie de Sarlat, 6 et 7 mars 2027 (cours de cuisine, visites de fermes, repas de l'oie).
update public.places set is_experience = true where name = 'Marché de Sarlat' and archived_at is null;
insert into public.place_events (place_id, starts_on, label_fr, label_en)
select pl.id, v.d, 'Fest''Oie, la fête de l''oie', 'Fest''Oie, the goose festival'
from public.places pl, (values ('2027-03-06'::date), ('2027-03-07'::date)) as v (d)
where pl.name = 'Marché de Sarlat'
  and not exists (select 1 from public.place_events e where e.place_id = pl.id and e.starts_on = v.d);

-- Les deux nouveaux lieux dans le gîte de démo.
insert into public.property_places (property_id, place_id, position)
select pr.id, pl.id, 90
from public.properties pr cross join public.places pl
where pr.slug = 'demo4x7q-gite-de-demonstration'
  and pl.name in ('Marché aux truffes de Lalbenque', 'Village de Noël de Gourdon')
  and not exists (select 1 from public.property_places pp where pp.property_id = pr.id and pp.place_id = pl.id);

commit;
