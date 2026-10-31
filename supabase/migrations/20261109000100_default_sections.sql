-- Chaque logement reçoit ses 6 sections uniques, vides, à sa création.
-- Une section vide n'est jamais affichée au voyageur : elles n'apparaissent qu'une fois remplies.
-- Les fiches équipement (plusieurs par logement) s'ajoutent à la main dans l'admin.

create function public.create_default_sections() returns trigger
language plpgsql set search_path = ''
as $$
begin
  insert into public.guide_sections (property_id, type, position)
  select new.id, t.type, t.position
  from (values
    ('arrival'::public.section_type, 0),
    ('wifi', 1),
    ('house', 2),
    ('departure', 3),
    ('contacts', 4),
    ('practical', 5)
  ) as t (type, position);
  return new;
end $$;

create trigger create_default_sections after insert on public.properties
  for each row execute function public.create_default_sections();

-- Logements déjà créés : on ajoute les sections manquantes, à la suite des existantes.
insert into public.guide_sections (property_id, type, position)
select p.id, t.type,
       coalesce((select max(s.position) + 1 from public.guide_sections s where s.property_id = p.id), 0) + t.position
from public.properties p
cross join (values
  ('arrival'::public.section_type, 0),
  ('wifi', 1),
  ('house', 2),
  ('departure', 3),
  ('contacts', 4),
  ('practical', 5)
) as t (type, position)
where not exists (
  select 1 from public.guide_sections s where s.property_id = p.id and s.type = t.type
);
