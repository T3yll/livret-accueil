-- V2 : Lascaux IV et le Musée de Préhistoire se visitent : ils affichaient l'icône d'activité (empreintes de pas).
update public.places set category = 'heritage'
where category = 'activity' and name in ('Lascaux IV', 'Musée national de Préhistoire');
