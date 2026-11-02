-- Semaine 5 : 20 adresses réelles du secteur Gourdon–Sarlat–Souillac, ajoutées au gîte de démonstration.
-- Sources : fiches des offices de tourisme (Dordogne-Périgord, Sarlat, Occitanie, Vallée de la Dordogne), novembre 2026.
-- Horaires NON vérifiés (hours_verified_at vide) : le livret affiche « Horaires à vérifier » jusqu'à l'appel de Rémi.
-- Rejouable : une adresse déjà présente (même nom) est ignorée.

begin;

-- Le Grand Bleu (Sarlat-la-Canéda)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Le Grand Bleu', 'restaurant', 'Restaurant gastronomique ouvert à l''année : cuisine de saison, en grande partie avec des produits de producteurs du Périgord, et belle carte des vins. Petite salle d''une trentaine de couverts : réservation conseillée.', 'Fine-dining restaurant open all year: seasonal cooking, largely with produce from Périgord farmers, and a broad wine list. A small dining room of about thirty covers, so booking is advised.', '43 avenue de la Gare', '24200', 'Sarlat-la-Canéda', 44.8777619, 1.21943605, '05 53 31 08 48', 'https://www.legrandbleu.eu', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Le Grand Bleu')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- La Chèvre et le Chou (Sarlat-la-Canéda)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'La Chèvre et le Chou', 'restaurant', 'Cuisine végétale créative (végétarienne et vegan) à partir de produits bio, locaux et de saison, dans une cour Renaissance du centre de Sarlat. Ouvert à l''année, jardin et terrasse.', 'Creative plant-based cooking (vegetarian and vegan) made with organic, local and seasonal produce, in a Renaissance courtyard in the centre of Sarlat. Open all year, with a garden and terrace.', '3 rue Montaigne, Cour Renaissance', '24200', 'Sarlat-la-Canéda', 44.889151, 1.2172298, '05 53 31 22 35', null, null, 'unknown'
  where not exists (select 1 from public.places where name = 'La Chèvre et le Chou')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Le Bacchus (Sarlat-la-Canéda)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Le Bacchus', 'restaurant', 'Cuisine du Périgord sur la place de la mairie, connue pour sa pierrade, avec jardin privé et terrasse. Ouvert à l''année ; l''équipe parle anglais.', 'Périgord cooking on the town-hall square, known for its pierrade (hot-stone grill), with a private garden and terrace. Open all year; the staff speak English.', '8 place de la Liberté', '24200', 'Sarlat-la-Canéda', 44.889556, 1.216787, '05 53 59 02 75', 'https://www.facebook.com/lebacchussarlat', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Le Bacchus')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Hostellerie de la Bouriane (Gourdon)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Hostellerie de la Bouriane', 'restaurant', 'Restaurant gastronomique de Gourdon, tenu par la même famille depuis 1898, labellisé Maître Restaurateur. Cuisine raffinée aux saveurs du terroir, servie près d''une cheminée du XVIIe siècle.', 'Gourdon''s fine-dining restaurant, run by the same family since 1898 and holding the Maître Restaurateur label. Refined cooking with local flavours, served beside a 17th-century fireplace.', 'Place du Foirail', '46300', 'Gourdon', 44.73534, 1.386391, '05 65 41 16 37', 'https://www.hotellabouriane.fr', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Hostellerie de la Bouriane')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Le Pot Occitan (Gourdon)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Le Pot Occitan', 'restaurant', 'Brasserie de style bistrot sur les boulevards de Gourdon : cuisine du terroir, desserts maison, équipe familiale. Menus à partir de 16,50 €.', 'Bistro-style brasserie on Gourdon''s boulevards: local cooking, homemade desserts and a family team. Set menus from €16.50.', '39 boulevard Mainiol', '46300', 'Gourdon', 44.736828, 1.384143, '05 65 41 11 81', null, null, 'unknown'
  where not exists (select 1 from public.places where name = 'Le Pot Occitan')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Delicatessens (Gourdon)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Delicatessens', 'restaurant', 'Restaurant gastronomique tenu par un couple du Lot : cuisine inventive et élégante. Menus à partir de 28 €.', 'Fine-dining restaurant run by a couple from the Lot: inventive, elegant cooking. Set menus from €28.', 'Domaine du Berthiol', '46300', 'Gourdon', 44.738201, 1.402064, '05 65 32 70 56', 'https://www.delicatessens.fr', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Delicatessens')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Ferme de Turnac (Domme)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Ferme de Turnac', 'producer', 'Éleveurs d''oies et de canards : visite guidée de l''élevage et dégustation gratuite de foie gras. Vente à la ferme de foie gras, d''huile de noix et de cerneaux. Ouvert toute l''année.', 'Goose and duck farm: guided tour of the farm and a free foie gras tasting. Farm shop selling foie gras, walnut oil and walnut kernels. Open all year.', 'Turnac', '24250', 'Domme', 44.8378956, 1.25775559, '05 53 28 10 84', 'https://www.fermedeturnac.com', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Ferme de Turnac')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Ferme des Roumevies (Saint-Crépin-et-Carlucet)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Ferme des Roumevies', 'producer', 'Élevage de canards : visite guidée tous les jours à 18 h (gavage, laboratoire, découpe) suivie d''une dégustation de foie gras. La ferme produit aussi des noix et de l''huile de noix.', 'Duck farm: guided tour every day at 6 pm (force-feeding, workshop, carving) followed by a foie gras tasting. The farm also grows walnuts and makes walnut oil.', 'Les Roumevies', '24590', 'Saint-Crépin-et-Carlucet', 44.958932, 1.2764279, '05 53 28 85 78', 'http://www.roumevies.com', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Ferme des Roumevies')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Moulin du Trel (Vézac)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Moulin du Trel', 'producer', 'Moulin à huile de noix entre Sarlat et Beynac : visite du moulin et vente d''huile. Ouvert du lundi au samedi (tous les jours en juillet et août).', 'Walnut-oil mill between Sarlat and Beynac: tour of the mill and oil for sale. Open Monday to Saturday (every day in July and August).', null, '24220', 'Vézac', 44.8392559, 1.15894397, '05 53 31 21 52', 'https://lemoulindutrel.com', null, 'unknown'
  where not exists (select 1 from public.places where name = 'Moulin du Trel')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Marché aux truffes de Sarlat (Sarlat-la-Canéda)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Marché aux truffes de Sarlat', 'market', 'Marché aux truffes ouvert à tous, le samedi matin, de décembre à mi-mars. En janvier, Sarlat accueille aussi la Fête de la Truffe.', 'Truffle market open to everyone on Saturday mornings, from December to mid-March. Sarlat also holds its Truffle Festival in January.', 'Rue Fénelon, face à la mairie', '24200', 'Sarlat-la-Canéda', 44.8900377, 1.21671438, null, null, null, 'schedule'
  where not exists (select 1 from public.places where name = 'Marché aux truffes de Sarlat')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (6, '09:00', '12:00')) as v (weekday, opens_at, closes_at)
), c as (
  insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
  select p.id, v.starts_on::date, v.ends_on::date, v.reason_fr, v.reason_en from p, (values ('2026-11-02', '2026-11-30', 'Hors saison des truffes', 'Truffle season not started'), ('2027-03-16', '2027-11-30', 'Hors saison des truffes', 'Outside truffle season')) as v (starts_on, ends_on, reason_fr, reason_en)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Marché de Souillac (Souillac)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Marché de Souillac', 'market', 'Le grand marché de Souillac, tous les vendredis matin toute l''année, au pied de la tour Saint-Martin : producteurs, fruits et légumes, produits du terroir.', 'Souillac''s main market, every Friday morning all year round, below the Saint-Martin tower: local farmers, fruit and vegetables, regional produce.', 'Place Saint-Martin', '46200', 'Souillac', 44.894326, 1.478351, null, null, null, 'schedule'
  where not exists (select 1 from public.places where name = 'Marché de Souillac')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (5, '07:00', '13:00')) as v (weekday, opens_at, closes_at)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Marché de Saint-Cyprien (Saint-Cyprien)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Marché de Saint-Cyprien', 'market', 'Marché de producteurs du dimanche matin, toute l''année : produits frais, locaux et de saison.', 'Sunday-morning farmers'' market, all year round: fresh, local and seasonal produce.', 'Rue Gambetta', '24220', 'Saint-Cyprien', 44.8692033, 1.0427626, '05 53 29 28 22', null, null, 'schedule'
  where not exists (select 1 from public.places where name = 'Marché de Saint-Cyprien')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (7, '08:30', '12:30')) as v (weekday, opens_at, closes_at)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Marché de Domme (Domme)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Marché de Domme', 'market', 'Marché traditionnel du jeudi matin sous la halle du XVIIe siècle de la bastide : produits frais du Périgord, quelques artisans.', 'Traditional Thursday-morning market under the bastide''s 17th-century market hall: fresh Périgord produce and a few craft stalls.', 'Place de la Halle', '24250', 'Domme', 44.8029899, 1.21427479, '05 53 28 61 00', null, null, 'schedule'
  where not exists (select 1 from public.places where name = 'Marché de Domme')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (4, '08:00', '13:00')) as v (weekday, opens_at, closes_at)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Marché couvert de Sarlat (Sarlat-la-Canéda)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Marché couvert de Sarlat', 'market', 'Marché de producteurs installé dans l''ancienne église Sainte-Marie, réaménagée par Jean Nouvel. Un ascenseur panoramique (payant) offre une vue sur les toits de Sarlat. En hiver : mardi, mercredi, vendredi et samedi matin.', 'Farmers'' market inside the former Sainte-Marie church, redesigned by Jean Nouvel. A panoramic lift (paid) gives a view over Sarlat''s rooftops. In winter: Tuesday, Wednesday, Friday and Saturday mornings.', 'Église Sainte-Marie, place de la Liberté', '24200', 'Sarlat-la-Canéda', 44.8897, 1.2164, null, null, null, 'schedule'
  where not exists (select 1 from public.places where name = 'Marché couvert de Sarlat')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (2, '08:30', '13:00'), (3, '08:30', '13:00'), (5, '08:30', '13:00'), (6, '08:30', '13:00')) as v (weekday, opens_at, closes_at)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Lascaux IV (Montignac-Lascaux)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Lascaux IV', 'activity', 'Centre international de l''art pariétal : réplique intégrale de la grotte de Lascaux et espaces d''exposition sur 8 000 m². Réservation en ligne conseillée.', 'International Centre for Cave Art: a full replica of the Lascaux cave and exhibition spaces over 8,000 m². Booking online is advised.', 'Avenue de Lascaux', '24290', 'Montignac-Lascaux', 45.0617669, 1.1685189, '05 53 50 99 10', 'https://lascaux.fr', 'https://lascaux.fr', 'schedule'
  where not exists (select 1 from public.places where name = 'Lascaux IV')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (1, '10:00', '18:00'), (2, '10:00', '18:00'), (3, '10:00', '18:00'), (4, '10:00', '18:00'), (5, '10:00', '18:00'), (6, '10:00', '18:00'), (7, '10:00', '18:00')) as v (weekday, opens_at, closes_at)
), c as (
  insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
  select p.id, v.starts_on::date, v.ends_on::date, v.reason_fr, v.reason_en from p, (values ('2026-12-25', '2026-12-25', 'Fermé le jour de Noël', 'Closed on Christmas Day')) as v (starts_on, ends_on, reason_fr, reason_en)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Musée national de Préhistoire (Les Eyzies)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Musée national de Préhistoire', 'activity', 'La grande collection de préhistoire de la vallée de la Vézère, dans un bâtiment adossé à la falaise. Fermé le mardi hors saison.', 'The major prehistory collection of the Vézère valley, in a building set against the cliff. Closed on Tuesdays outside the summer season.', '1 rue du Musée', '24620', 'Les Eyzies', 44.9362247, 1.01355615, '05 53 06 45 45', 'https://www.musee-prehistoire-eyzies.fr', null, 'schedule'
  where not exists (select 1 from public.places where name = 'Musée national de Préhistoire')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (1, '09:30', '12:30'), (1, '14:00', '17:30'), (3, '09:30', '12:30'), (3, '14:00', '17:30'), (4, '09:30', '12:30'), (4, '14:00', '17:30'), (5, '09:30', '12:30'), (5, '14:00', '17:30'), (6, '09:30', '12:30'), (6, '14:00', '17:30'), (7, '09:30', '12:30'), (7, '14:00', '17:30')) as v (weekday, opens_at, closes_at)
), c as (
  insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
  select p.id, v.starts_on::date, v.ends_on::date, v.reason_fr, v.reason_en from p, (values ('2026-12-25', '2026-12-25', 'Fermé le jour de Noël', 'Closed on Christmas Day'), ('2027-01-01', '2027-01-01', 'Fermé le 1er janvier', 'Closed on New Year''s Day')) as v (starts_on, ends_on, reason_fr, reason_en)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Aquarium du Périgord Noir (Le Bugue)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Aquarium du Périgord Noir', 'family', 'Grand aquarium d''eau douce : environ 70 bassins, plus de 6 000 animaux et un parc aux alligators. Animations toutes les 30 minutes.', 'Large freshwater aquarium: about 70 tanks, over 6,000 animals and an alligator park. Activities every 30 minutes.', '99 allée Paul-Jean Souriau', '24260', 'Le Bugue', 44.9144351, 0.93160661, '05 53 07 10 74', 'http://www.aquariumperigordnoir.com', null, 'schedule'
  where not exists (select 1 from public.places where name = 'Aquarium du Périgord Noir')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (1, '10:00', '18:00'), (2, '10:00', '18:00'), (3, '10:00', '18:00'), (4, '10:00', '18:00'), (5, '10:00', '18:00'), (6, '10:00', '18:00'), (7, '10:00', '18:00')) as v (weekday, opens_at, closes_at)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Cité médiévale de Sarlat (Sarlat-la-Canéda)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Cité médiévale de Sarlat', 'heritage', 'L''un des centres anciens les mieux préservés de France : ruelles médiévales et Renaissance, hôtels particuliers, cathédrale Saint-Sacerdos et lanterne des morts. À parcourir à pied, de préférence tôt le matin.', 'One of the best-preserved old towns in France: medieval and Renaissance lanes, mansions, Saint-Sacerdos cathedral and the ''lantern of the dead''. Best explored on foot, ideally early in the morning.', 'Place de la Liberté', '24200', 'Sarlat-la-Canéda', 44.8883, 1.2169, null, null, null, 'always'
  where not exists (select 1 from public.places where name = 'Cité médiévale de Sarlat')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Bastide de Domme (Domme)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Bastide de Domme', 'heritage', 'Bastide perchée au-dessus de la Dordogne, classée parmi les Plus Beaux Villages de France. Porte des Tours, halle du XVIIe siècle et, depuis la Barre, l''un des plus beaux panoramas sur la vallée.', 'A hilltop bastide town above the Dordogne, listed among the Most Beautiful Villages of France. The Porte des Tours, a 17th-century market hall and, from the Barre, one of the finest views over the valley.', 'Esplanade de la Barre', '24250', 'Domme', 44.803542, 1.214467, null, null, null, 'always'
  where not exists (select 1 from public.places where name = 'Bastide de Domme')
  returning id
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

-- Château de Beynac (Beynac-et-Cazenac)
with p as (
  insert into public.places (name, category, description_fr, description_en, address, postal_code, city, lat, lng, phone, website, booking_url, opening_mode)
  select 'Château de Beynac', 'heritage', 'Forteresse médiévale dressée sur une falaise au-dessus de la Dordogne : salles meublées, donjon panoramique et chambre associée à Richard Cœur de Lion. Ouvert toute l''année.', 'A medieval fortress on a cliff above the Dordogne: furnished rooms, a panoramic keep and the chamber linked to Richard the Lionheart. Open all year.', '1 place du Château', '24220', 'Beynac-et-Cazenac', 44.8402861, 1.14527013, '05 53 29 50 40', 'https://chateau-beynac.com', null, 'schedule'
  where not exists (select 1 from public.places where name = 'Château de Beynac')
  returning id
), h as (
  insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
  select p.id, v.weekday, v.opens_at::time, v.closes_at::time from p, (values (1, '10:00', '17:00'), (2, '10:00', '17:00'), (3, '10:00', '17:00'), (4, '10:00', '17:00'), (5, '10:00', '17:00'), (6, '10:00', '17:00'), (7, '10:00', '17:00')) as v (weekday, opens_at, closes_at)
)
insert into public.property_places (property_id, place_id)
select pr.id, p.id from p, public.properties pr where pr.slug = 'demo4x7q-gite-de-demonstration';

commit;
