-- V2 « un livret vivant » : voir docs/BRIEF_V2.md.

-- Prénoms affichés au voyageur (« Pascal et Brigitte ») ; le reste de la fiche hébergeur reste privé.
alter table public.hosts add column display_names text;

-- Note vocale d'accueil (chemins dans le stockage) et sa transcription.
alter table public.properties
  add column welcome_audio_path_fr text,
  add column welcome_audio_path_en text,
  add column welcome_transcript_fr text,
  add column welcome_transcript_en text;

-- Infos pratiques des commerces, affichées en pictogrammes sur la fiche.
alter table public.places
  add column delivers boolean not null default false,
  add column has_drive boolean not null default false,
  add column booking_required boolean not null default false,
  add column practical_note_fr text,
  add column practical_note_en text;

-- Notes vocales autorisées dans le stockage (un mémo vocal d'iPhone est en M4A).
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4',
                               'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
where id = 'media';

-- Chaque logement reçoit aussi la section « Préparer mon séjour », vide donc invisible tant qu'elle n'est pas remplie.
create or replace function public.create_default_sections() returns trigger
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
    ('practical', 5),
    ('prepare', 6)
  ) as t (type, position);
  return new;
end $$;

insert into public.guide_sections (property_id, type, position)
select p.id, 'prepare', coalesce((select max(s.position) + 1 from public.guide_sections s where s.property_id = p.id), 0)
from public.properties p
where not exists (select 1 from public.guide_sections s where s.property_id = p.id and s.type = 'prepare');

-- get_guide : prénoms des hôtes (ce seul champ de hosts), accueil vocal, infos pratiques ; pharmacies visibles sans le module.
create or replace function public.get_guide(p_slug text) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'property', jsonb_build_object(
      'id', p.id, 'name', p.name, 'slug', p.slug,
      'address', p.address, 'postal_code', p.postal_code, 'city', p.city,
      'lat', p.lat, 'lng', p.lng,
      'cover_photo_path', p.cover_photo_path,
      'cover_photo_alt_fr', p.cover_photo_alt_fr, 'cover_photo_alt_en', p.cover_photo_alt_en,
      'welcome_fr', p.welcome_fr, 'welcome_en', p.welcome_en,
      'contact_phone', p.contact_phone, 'contact_email', p.contact_email,
      'host_display_names', h.display_names,
      'welcome_audio_path_fr', p.welcome_audio_path_fr, 'welcome_audio_path_en', p.welcome_audio_path_en,
      'welcome_transcript_fr', p.welcome_transcript_fr, 'welcome_transcript_en', p.welcome_transcript_en,
      'status', p.status, 'updated_at', p.updated_at
    ),
    'sections', coalesce((
      select jsonb_agg(to_jsonb(s) - 'property_id' - 'created_at' order by s.position)
      from public.guide_sections s
      where s.property_id = p.id and s.is_active
    ), '[]'::jsonb),
    'modules', coalesce((
      select jsonb_agg(m.key) from public.modules m
      where public.module_is_active(p.id, m.key)
    ), '[]'::jsonb),
    'places', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pl.id, 'name', pl.name, 'category', pl.category,
        'description_fr', pl.description_fr, 'description_en', pl.description_en,
        'address', pl.address, 'postal_code', pl.postal_code, 'city', pl.city,
        'lat', pl.lat, 'lng', pl.lng,
        'phone', pl.phone, 'website', pl.website, 'booking_url', pl.booking_url,
        'photo_path', pl.photo_path, 'photo_alt_fr', pl.photo_alt_fr, 'photo_alt_en', pl.photo_alt_en,
        'photo_credit', pl.photo_credit,
        'delivers', pl.delivers, 'has_drive', pl.has_drive, 'booking_required', pl.booking_required,
        'practical_note_fr', pl.practical_note_fr, 'practical_note_en', pl.practical_note_en,
        'opening_mode', pl.opening_mode, 'hours_verified_at', pl.hours_verified_at,
        'is_favorite', pp.is_favorite, 'comment_fr', pp.comment_fr, 'comment_en', pp.comment_en,
        'hours', coalesce((
          select jsonb_agg(jsonb_build_object('weekday', h.weekday, 'opens_at', h.opens_at, 'closes_at', h.closes_at)
                           order by h.weekday, h.opens_at)
          from public.place_opening_hours h where h.place_id = pl.id
        ), '[]'::jsonb),
        'closures', coalesce((
          select jsonb_agg(jsonb_build_object('starts_on', c.starts_on, 'ends_on', c.ends_on,
                                              'reason_fr', c.reason_fr, 'reason_en', c.reason_en)
                           order by c.starts_on)
          from public.place_closures c where c.place_id = pl.id and c.ends_on >= current_date - 1
        ), '[]'::jsonb)
      ) order by pp.is_favorite desc, pp.position)
      from public.property_places pp
      join public.places pl on pl.id = pp.place_id
      where pp.property_id = p.id
        and pl.archived_at is null
        -- les adresses santé (Urgences) font partie de la base ; le reste demande le module
        and (pl.category in ('health', 'pharmacy') or public.module_is_active(p.id, 'places'))
    ), '[]'::jsonb)
  )
  from public.properties p
  join public.hosts h on h.id = p.host_id
  where p.slug = p_slug
    and (p.status = 'published' or public.is_admin());
$$;
