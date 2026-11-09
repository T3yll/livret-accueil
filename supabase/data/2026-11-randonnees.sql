-- Sélection de 8 randonnées en Bouriane, relevée le 9 nov. 2026 sur les fiches officielles de Lot Tourisme
-- (liste « Randonnée pédestre autour de Gourdon », circuits labellisés Qualirando, topoguide Pays Bourian 2023).
-- Distance, durée et difficulté : telles qu'écrites sur chaque fiche. Difficulté ramenée à trois niveaux :
-- « très facile » et « facile » → easy, « moyen » → medium, « difficile » → hard.
-- Point de départ : coordonnées des liens « Ouvrir l'itinéraire » de la fiche (le départ précis n'y est pas décrit,
-- sauf Notre-Dame des Neiges et Dégagnac) : à confirmer sur place.
-- Lien : la fiche officielle (trace GPX et fiche PDF y sont téléchargeables). Descriptions rédigées par nous.
begin;

insert into public.places (name, category, city, postal_code, lat, lng, opening_mode,
                           hike_duration_min, hike_distance_km, hike_difficulty, trail_url,
                           description_fr, description_en)
select v.name, 'hiking', v.city, v.postal_code, v.lat, v.lng, 'always',
       v.duration, v.km, v.difficulty::public.hike_difficulty, v.url, v.fr, v.en
from (values
  ('Chemin de Notre-Dame des Neiges', 'Gourdon', '46300', 44.7327942, 1.39202182, 120, 6.5, 'easy',
   'https://www.tourisme-lot.com/offres/chemin-de-notre-dame-des-neiges-gourdon-fr-4150055/',
   'Courte boucle au départ de la chapelle Notre-Dame des Neiges, par les sentiers du bois de Saint-Romain, avec une vue sur l''église de Saint-Romain.',
   'A short loop from the Notre-Dame des Neiges chapel along the woodland paths of Saint-Romain, with a view of Saint-Romain church.'),
  ('Circuit de Pochy', 'Le Vigan', '46300', 44.7411771, 1.43906858, 150, 8.7, 'medium',
   'https://www.tourisme-lot.com/offres/circuit-de-pochy-le-vigan-fr-659645/',
   'Boucle de campagne depuis Le Vigan : sources, lavoirs et deux moulins, un bout de GR 64 jusqu''au lac, retour par l''abbatiale.',
   'A countryside loop from Le Vigan: springs, wash houses and two mills, a stretch of the GR 64 to the lake, and back past the abbey church.'),
  ('Circuit des Hameaux du Souillaguet', 'Saint-Cirq-Souillaguet', '46300', 44.7031058, 1.42956158, 150, 7.1, 'easy',
   'https://www.tourisme-lot.com/offres/circuit-des-hameaux-du-souillaguet-saint-cirq-souillaguet-fr-659121/',
   'Promenade de hameau en hameau, presque entièrement à l''ombre : agréable même aux beaux jours.',
   'A walk from hamlet to hamlet, almost entirely in the shade: pleasant even on hot days.'),
  ('Circuit de l''Abbaye-Nouvelle', 'Léobard', '46300', 44.7216696, 1.30923985, 150, 8.8, 'medium',
   'https://www.tourisme-lot.com/offres/circuit-de-labbaye-nouvelle-leobard-fr-659277/',
   'Entre forêt et coteaux depuis Léobard : les bords du Céou, une montée vers Mazou pour la vue, puis la voie verte jusqu''aux ruines de l''abbaye.',
   'Forest and hillsides from Léobard: the banks of the Céou, a climb to Mazou for the view, then the greenway to the abbey ruins.'),
  ('Circuit des Hauts de Lantis', 'Dégagnac', '46340', 44.6676904, 1.30966976, 150, 9.2, 'medium',
   'https://www.tourisme-lot.com/offres/circuit-des-hauts-de-lantis-degagnac-fr-659660/',
   'Boucle sur les coteaux calcaires au départ du lac de Dégagnac, avec une vue jusqu''à la vallée de la Dordogne.',
   'A loop over the limestone hills from Dégagnac lake, with views stretching to the Dordogne valley.'),
  ('Circuit du marais des Arques', 'Les Arques', '46250', 44.6016823, 1.25070333, 120, 4.1, 'easy',
   'https://www.tourisme-lot.com/offres/circuit-du-marais-des-arques-les-arques-fr-659328/',
   'Sentier d''interprétation facile : le musée Zadkine, l''église et le marais des Arques, une zone humide pleine de libellules.',
   'An easy nature trail: the Zadkine museum, the church and the Les Arques marsh, a wetland full of dragonflies.'),
  ('Circuit des landes du Frau', 'Lavercantière', '46340', 44.6313445, 1.34896874, 60, 2.6, 'easy',
   'https://www.tourisme-lot.com/offres/circuit-des-landes-du-frau-lavercantiere-fr-659657/',
   'Petite boucle dans la lande de bruyères et d''ajoncs, avec 9 bornes d''explication et un jeu de questions pour les enfants.',
   'A short loop through heather and gorse moorland, with 9 information posts and a quiz for children.'),
  ('Causse Toujours', 'Salviac', '46340', 44.6837655, 1.27004008, 240, 13.6, 'hard',
   'https://www.tourisme-lot.com/offres/causse-toujours-salviac-fr-659652/',
   'Circuit sportif sur le causse depuis Salviac : truffières, hameau d''Aurimont et vue sur le Céou, cabanes en pierre sèche, dolmen et grottes.',
   'A demanding causse circuit from Salviac: truffle oaks, the hamlet of Aurimont overlooking the Céou, dry-stone huts, a dolmen and caves.')
) as v (name, city, postal_code, lat, lng, duration, km, difficulty, url, fr, en)
where not exists (select 1 from public.places p where p.name = v.name and p.category = 'hiking');

-- Dans le gîte de démo, après les adresses existantes (aucune en coup de cœur : c'est à Rémi de choisir).
insert into public.property_places (property_id, place_id, position)
select pr.id, pl.id, 100 + row_number() over (order by pl.hike_duration_min, pl.name)
from public.properties pr
cross join public.places pl
where pr.slug = 'demo4x7q-gite-de-demonstration'
  and pl.category = 'hiking' and pl.archived_at is null
  and not exists (select 1 from public.property_places pp where pp.property_id = pr.id and pp.place_id = pl.id);

commit;
