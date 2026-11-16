-- Vidéo d'accueil à la place de la note vocale (décision de Rémi, 16 nov. 2026).
-- Les fichiers audio déjà envoyés restent dans le stockage ; seuls les chemins disparaissent.
-- La transcription est gardée : c'est le texte de la vidéo, pour qui ne peut pas mettre le son.
alter table public.properties
  add column welcome_video_path_fr text,
  add column welcome_video_path_en text,
  drop column welcome_audio_path_fr,
  drop column welcome_audio_path_en;

-- Vidéo d'iPhone (.mov) acceptée ; 50 Mo par fichier (limite du plan gratuit de Supabase).
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array(select distinct unnest(allowed_mime_types || array['video/mp4', 'video/quicktime']))
where id = 'media';

-- get_guide : vidéo d'accueil au lieu de la note vocale.
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
      'welcome_video_path_fr', p.welcome_video_path_fr, 'welcome_video_path_en', p.welcome_video_path_en,
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
        'is_experience', pl.is_experience,
        'hike_duration_min', pl.hike_duration_min, 'hike_distance_km', pl.hike_distance_km,
        'hike_difficulty', pl.hike_difficulty, 'trail_url', pl.trail_url,
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
        ), '[]'::jsonb),
        -- dates à venir seulement (la veille comprise : le serveur est en UTC, le voyageur à Paris)
        'events', coalesce((
          select jsonb_agg(jsonb_build_object('id', e.id, 'starts_on', e.starts_on,
                                              'start_time', e.start_time, 'end_time', e.end_time,
                                              'label_fr', e.label_fr, 'label_en', e.label_en,
                                              'booking_url', e.booking_url)
                           order by e.starts_on, e.start_time)
          from public.place_events e where e.place_id = pl.id and e.starts_on >= current_date - 1
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
