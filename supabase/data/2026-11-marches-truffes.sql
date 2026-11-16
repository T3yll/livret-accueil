-- Marchés aux truffes de la vallée de la Dordogne lotoise, saison 2026-2027, relevés le 16 nov. 2026 sur les fiches
-- officielles tourisme-occitanie.com (lien sur chaque adresse). Saint-Céré (7 févr.) écarté : plus d'une heure de Gourdon.
-- Ce sont des expériences datées. Pas d'horaires réguliers : une fermeture avant la première date et après la dernière,
-- pour que le filtre « ouvert pendant mon séjour » les masque hors des dates.
-- Souillac : la « salle Saint-Martin » n'est pas sur OpenStreetMap ; point placé place Saint-Martin, à confirmer.
begin;

insert into public.places (name, category, address, postal_code, city, lat, lng, opening_mode, website, phone, is_experience,
                           description_fr, description_en)
select v.name, 'market', v.address, v.cp, v.city, v.lat, v.lng, 'unknown', v.url, v.phone, true, v.fr, v.en
from (values
  ('Marché aux truffes de Martel', 'Palais de la Raymondie', '46600', 'Martel', 44.9367551, 1.6087116,
   'https://www.tourisme-occitanie.com/fr/fiche/fete-et-manifestation/marche-aux-truffes-de-martel-martel_TFOFMAMIP046V51O1ZD/', '06 09 57 45 49',
   'Trois samedis d''hiver, les trufficulteurs de la région de Martel vendent la truffe noire dans la cité aux sept tours.',
   'On three winter Saturdays, local growers sell black truffles in Martel, the town of seven towers.'),
  ('Marché aux truffes de Cuzance', 'Maison de la Truffe', '46600', 'Cuzance', 44.9577148, 1.5367072,
   'https://www.tourisme-occitanie.com/fr/fiche/fete-et-manifestation/marche-aux-truffes-de-cuzance-cuzance_TFOFMAMIP046V52II2H/', '06 70 38 27 39',
   'Une journée de fête autour de la truffe : marché, visite d''une truffière avec cavage, repas truffé (sur réservation), spectacle et balades en calèche.',
   'A day-long truffle festival: market, a visit to a truffle orchard with a truffle dog, a truffle lunch (booking needed), a show and carriage rides.'),
  ('Marché aux truffes de Souillac', 'Salle Saint-Martin', '46200', 'Souillac', 44.8940946, 1.4786203,
   'https://www.tourisme-occitanie.com/fr/fiche/fete-et-manifestation/marche-aux-truffes-de-souillac-souillac_TFOFMAMIP046V52CYM1/', '06 09 57 45 49',
   'Marché aux truffes en entrée libre, avec dégustations des restaurateurs de Souillac, démonstration de cavage et musique.',
   'A free-entry truffle market with tastings by Souillac restaurants, a truffle-dog demonstration and music.'),
  ('Marché aux truffes de Gramat', 'Place de la Halle', '46500', 'Gramat', 44.7786010, 1.7250325,
   'https://www.tourisme-occitanie.com/fr/fiche/fete-et-manifestation/marche-aux-truffes-de-gramat-gramat_TFOFMAMIP046V51Y1O6/', '06 09 57 45 49',
   'Le dernier marché aux truffes de l''année, sous la halle de Gramat, comme dans les foires d''autrefois.',
   'The last truffle market of the year, under the Gramat market hall, in the tradition of the old fairs.')
) as v (name, address, cp, city, lat, lng, url, phone, fr, en)
where not exists (select 1 from public.places p where p.name = v.name);

-- Dates (libellé seulement quand il apporte une précision : programme de Cuzance).
insert into public.place_events (place_id, starts_on, start_time, label_fr, label_en)
select pl.id, v.d, v.t::time, v.fr, v.en
from (values
  ('Marché aux truffes de Martel', '2026-12-19'::date, null, null, null),
  ('Marché aux truffes de Martel', '2027-01-16'::date, null, null, null),
  ('Marché aux truffes de Martel', '2027-02-13'::date, null, null, null),
  ('Marché aux truffes de Cuzance', '2026-12-12'::date, '10:00', 'Marché, cavage commenté à 11 h, repas truffé à 13 h', 'Market, truffle hunt at 11 am, truffle lunch at 1 pm'),
  ('Marché aux truffes de Souillac', '2027-01-30'::date, null, null, null),
  ('Marché aux truffes de Gramat', '2026-12-31'::date, null, 'Le dernier marché de l''année', 'The last market of the year')
) as v (name, d, t, fr, en)
join public.places pl on pl.name = v.name
where not exists (select 1 from public.place_events e where e.place_id = pl.id and e.starts_on = v.d);

-- Fermetures hors dates (avant la première, après la dernière).
insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
select pl.id, v.s, v.e, 'Pas de marché aux truffes à ces dates', 'No truffle market on these dates'
from (values
  ('Marché aux truffes de Martel', '2026-11-01'::date, '2026-12-18'::date),
  ('Marché aux truffes de Martel', '2027-02-14'::date, '2027-11-30'::date),
  ('Marché aux truffes de Cuzance', '2026-11-01'::date, '2026-12-11'::date),
  ('Marché aux truffes de Cuzance', '2026-12-13'::date, '2027-11-30'::date),
  ('Marché aux truffes de Souillac', '2026-11-01'::date, '2027-01-29'::date),
  ('Marché aux truffes de Souillac', '2027-01-31'::date, '2027-11-30'::date),
  ('Marché aux truffes de Gramat', '2026-11-01'::date, '2026-12-30'::date),
  ('Marché aux truffes de Gramat', '2027-01-01'::date, '2027-11-30'::date),
  ('Marché aux truffes de Lalbenque', '2026-11-01'::date, '2026-11-30'::date)
) as v (name, s, e)
join public.places pl on pl.name = v.name
where not exists (select 1 from public.place_closures c where c.place_id = pl.id and c.starts_on = v.s);

insert into public.property_places (property_id, place_id, position)
select pr.id, pl.id, 91
from public.properties pr cross join public.places pl
where pr.slug = 'demo4x7q-gite-de-demonstration'
  and pl.name in ('Marché aux truffes de Martel', 'Marché aux truffes de Cuzance', 'Marché aux truffes de Souillac', 'Marché aux truffes de Gramat')
  and not exists (select 1 from public.property_places pp where pp.property_id = pr.id and pp.place_id = pl.id);

commit;
