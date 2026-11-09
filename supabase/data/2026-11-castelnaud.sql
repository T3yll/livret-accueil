-- Château de Castelnaud : grille officielle transmise par Rémi le 9 nov. 2026 (ouvert toute l'année, tous les jours).
-- Oct.–nov. 10 h-18 h, déc.–janv. 14 h-17 h (10 h-17 h pendant les vacances de Noël).
-- Une seule grille possible : 14 h-17 h, l'horaire de décembre, juste aussi en novembre.
begin;
delete from public.place_opening_hours
where place_id = (select id from public.places where name = 'Château de Castelnaud' and archived_at is null);
insert into public.place_opening_hours (place_id, weekday, opens_at, closes_at)
select p.id, d, '14:00', '17:00' from public.places p, generate_series(1, 7) as d
where p.name = 'Château de Castelnaud' and p.archived_at is null;
commit;
