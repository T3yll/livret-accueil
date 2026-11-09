-- Aquarium du Périgord Noir : grille officielle transmise par Rémi le 9 nov. 2026
-- (16 oct. → 21 nov. 10 h-18 h ; saison suivante à partir du 4 avril). Fermeture d'hiver entre les deux.
insert into public.place_closures (place_id, starts_on, ends_on, reason_fr, reason_en)
select p.id, '2026-11-22', '2027-04-03', 'Fermé pour l''hiver, réouverture le 4 avril', 'Closed for the winter, reopens on 4 April'
from public.places p
where p.name = 'Aquarium du Périgord Noir' and p.archived_at is null
  and not exists (select 1 from public.place_closures c where c.place_id = p.id and c.starts_on = '2026-11-22');
