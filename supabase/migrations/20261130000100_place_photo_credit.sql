-- Crédit des photos d'adresses : obligatoire pour les photos sous licence libre (Wikimedia Commons),
-- par exemple « Photo : Jean Dupont, CC BY-SA 4.0, Wikimedia Commons ». Affiché sous la photo de la fiche.

alter table public.places add column photo_credit text;

-- get_guide renvoie le crédit avec la photo (fonction reprise à l'identique, un champ en plus).
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
        and (pl.category = 'health' or public.module_is_active(p.id, 'places'))
    ), '[]'::jsonb)
  )
  from public.properties p
  where p.slug = p_slug
    and (p.status = 'published' or public.is_admin());
$$;
