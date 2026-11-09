-- Le Pot Occitan : horaires transmis par Rémi le 9 nov. 2026 (amplitude d'ouverture de la brasserie,
-- vraisemblablement Google Maps ; les heures de service du repas ne sont pas précisées).
begin;
update public.places set opening_mode = 'schedule' where name = 'Le Pot Occitan' and archived_at is null;
delete from public.place_opening_hours
where place_id = (select id from public.places where name = 'Le Pot Occitan' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
select p.id, v.d, v.o::time, v.c::time
from public.places p,
  (values (1, '07:30', '19:30'), (2, '07:30', '19:30'), (3, '07:30', '24:00'), (4, '07:30', '24:00'),
          (5, '07:30', '24:00'), (6, '07:30', '24:00'), (7, '09:00', '15:00')) as v (d, o, c)
where p.name = 'Le Pot Occitan' and p.archived_at is null;
commit;
