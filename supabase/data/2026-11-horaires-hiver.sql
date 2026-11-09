-- Horaires de l'hiver 2026-2027, relevés le 9 novembre 2026 sur les sites officiels et fiches touristiques.
-- Rien n'est marqué vérifié : Rémi confirme (bouton « Aujourd'hui » dans l'admin). Une seule grille par semaine :
-- celle de la saison en cours ; les fermetures d'hiver sont des périodes de fermeture.
begin;

-- Delicatessens — source : delicatessens.fr/contact (novembre à mai)
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Delicatessens' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Delicatessens' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Delicatessens' and archived_at is null), v.d, v.o::time, v.c::time from (values (2, '12:00', '13:30'), (3, '12:00', '13:30'), (4, '12:00', '13:30'), (5, '12:00', '13:30'), (5, '19:00', '20:45'), (6, '12:00', '13:30'), (6, '19:00', '20:45')) as v (d, o, c);

-- Hostellerie de la Bouriane — source : hotellabouriane.fr, horaires d'hiver (deux pages se contredisent de 15 min)
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Hostellerie de la Bouriane' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Hostellerie de la Bouriane' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Hostellerie de la Bouriane' and archived_at is null), v.d, v.o::time, v.c::time from (values (2, '19:30', '21:00'), (3, '19:30', '21:00'), (4, '19:30', '21:00'), (5, '19:30', '21:00'), (6, '19:30', '21:00'), (7, '12:15', '13:30')) as v (d, o, c);

-- Ferme de Turnac — source : fermedeturnac.com, octobre à mars
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Ferme de Turnac' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Ferme de Turnac' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Ferme de Turnac' and archived_at is null), v.d, v.o::time, v.c::time from (values (1, '09:30', '18:00'), (2, '09:30', '18:00'), (3, '09:30', '18:00'), (4, '09:30', '18:00'), (5, '09:30', '18:00'), (6, '09:30', '18:00')) as v (d, o, c);

-- Ferme des Roumevies — source : roumevies.com
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Ferme des Roumevies' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Ferme des Roumevies' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Ferme des Roumevies' and archived_at is null), v.d, v.o::time, v.c::time from (values (1, '09:00', '12:30'), (1, '14:00', '19:00'), (2, '09:00', '12:30'), (2, '14:00', '19:00'), (3, '09:00', '12:30'), (3, '14:00', '19:00'), (4, '09:00', '12:30'), (4, '14:00', '19:00'), (5, '09:00', '12:30'), (5, '14:00', '19:00'), (6, '09:00', '12:30'), (6, '14:00', '19:00'), (7, '09:00', '12:30')) as v (d, o, c);

-- Moulin du Trel — source : lemoulindutrel.com (site daté 2020)
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Moulin du Trel' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Moulin du Trel' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Moulin du Trel' and archived_at is null), v.d, v.o::time, v.c::time from (values (1, '10:00', '12:00'), (1, '13:00', '18:00'), (2, '10:00', '12:00'), (2, '13:00', '18:00'), (3, '10:00', '12:00'), (3, '13:00', '18:00'), (4, '10:00', '12:00'), (4, '13:00', '18:00'), (5, '10:00', '12:00'), (5, '13:00', '18:00'), (6, '10:00', '12:00'), (6, '13:00', '18:00')) as v (d, o, c);

-- Marché de Gourdon — source : tourisme-gourdon.com, fiche du marché
update public.places set opening_mode = 'schedule', phone = coalesce(phone, '05 65 27 01 10') where id = (select id from public.places where name = 'Marché de Gourdon' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Marché de Gourdon' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Marché de Gourdon' and archived_at is null), v.d, v.o::time, v.c::time from (values (6, '08:00', '12:00')) as v (d, o, c);

-- Marché de Sarlat — source : sarlat-tourisme.com, marché traditionnel
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Marché de Sarlat' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Marché de Sarlat' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Marché de Sarlat' and archived_at is null), v.d, v.o::time, v.c::time from (values (3, '08:00', '13:00'), (6, '08:00', '17:00')) as v (d, o, c);

-- Marché de Souillac — source : vallee-dordogne.com, fiche du marché (2026-2027)
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Marché de Souillac' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Marché de Souillac' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Marché de Souillac' and archived_at is null), v.d, v.o::time, v.c::time from (values (5, '08:00', '12:00')) as v (d, o, c);

-- Jardins de Marqueyssac — source : marqueyssac.com, 12 nov. → fin janvier (11 h-17 h à Noël)
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Jardins de Marqueyssac' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Jardins de Marqueyssac' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Jardins de Marqueyssac' and archived_at is null), v.d, v.o::time, v.c::time from (values (1, '14:00', '17:00'), (2, '14:00', '17:00'), (3, '14:00', '17:00'), (4, '14:00', '17:00'), (5, '14:00', '17:00'), (6, '14:00', '17:00'), (7, '14:00', '17:00')) as v (d, o, c);

-- Château de Castelnaud — source : castelnaud.com (horaires de Noël ; horaires d'hiver en image illisible)
update public.places set opening_mode = 'schedule' where id = (select id from public.places where name = 'Château de Castelnaud' and archived_at is null);
delete from public.place_opening_hours where place_id = (select id from public.places where name = 'Château de Castelnaud' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at) select (select id from public.places where name = 'Château de Castelnaud' and archived_at is null), v.d, v.o::time, v.c::time from (values (1, '10:00', '17:00'), (2, '10:00', '17:00'), (3, '10:00', '17:00'), (4, '10:00', '17:00'), (5, '10:00', '17:00'), (6, '10:00', '17:00'), (7, '10:00', '17:00')) as v (d, o, c);

-- Gouffre de Padirac — source : gouffre-de-padirac.com : fermé l'hiver, réouverture au printemps sans date
update public.places set opening_mode = 'unknown', phone = coalesce(phone, '05 65 33 64 56') where id = (select id from public.places where name = 'Gouffre de Padirac' and archived_at is null);
insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en) select (select id from public.places where name = 'Gouffre de Padirac' and archived_at is null), '2026-11-02', '2027-03-31', 'Fermé pour l''hiver (date de réouverture à confirmer)', 'Closed for the winter (reopening date to be confirmed)' where not exists (select 1 from public.place_closures where place_id = (select id from public.places where name = 'Gouffre de Padirac' and archived_at is null) and starts_on = '2026-11-02');

-- Grottes préhistoriques de Cougnac — source : grottesdecougnac.com : fermé jusqu'au 4 avril 2027
update public.places set opening_mode = 'unknown' where id = (select id from public.places where name = 'Grottes préhistoriques de Cougnac' and archived_at is null);
insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en) select (select id from public.places where name = 'Grottes préhistoriques de Cougnac' and archived_at is null), '2026-11-02', '2027-04-03', 'Fermé au public jusqu''au 4 avril (groupes sur réservation)', 'Closed to the public until 4 April (groups by appointment)' where not exists (select 1 from public.place_closures where place_id = (select id from public.places where name = 'Grottes préhistoriques de Cougnac' and archived_at is null) and starts_on = '2026-11-02');

-- La Forêt des Singes — source : la-foret-des-singes.com : saison 2026 jusqu'au 11 nov., 2027 non publiée
update public.places set opening_mode = 'unknown', phone = coalesce(phone, '05 65 33 62 72') where id = (select id from public.places where name = 'La Forêt des Singes' and archived_at is null);
insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en) select (select id from public.places where name = 'La Forêt des Singes' and archived_at is null), '2026-11-12', '2027-03-31', 'Fermé pour l''hiver (date de réouverture à confirmer)', 'Closed for the winter (reopening date to be confirmed)' where not exists (select 1 from public.place_closures where place_id = (select id from public.places where name = 'La Forêt des Singes' and archived_at is null) and starts_on = '2026-11-12');

commit;
