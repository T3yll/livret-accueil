-- Schéma V1 du livret d'accueil. Voir docs/CAHIER_DES_CHARGES.md (Modèle de données).

-- ============ Types ============
create type public.property_status as enum ('draft', 'published');

create type public.section_type as enum (
  'arrival', 'wifi', 'house', 'equipment', 'departure', 'contacts', 'practical'
);

-- 'health' (hôpital, pharmacie, médecin) alimente la section Urgences, hors filtres des bonnes adresses
create type public.place_category as enum (
  'restaurant', 'producer', 'market', 'shop', 'activity', 'heritage', 'family', 'health'
);

create type public.opening_mode as enum (
  'schedule',     -- horaires hebdomadaires dans place_opening_hours
  'always',       -- accessible en permanence (point de vue, balade)
  'appointment',  -- sur rendez-vous
  'unknown'       -- inconnu → « horaires à vérifier », jamais une supposition
);

-- ============ Utilitaires ============
create function public.set_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============ Administrateurs ============
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ============ Hébergeurs ============
create table public.hosts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) > 0),
  contact_name text,
  phone        text,
  email        text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============ Logements ============
create table public.properties (
  id                 uuid primary key default gen_random_uuid(),
  host_id            uuid not null references public.hosts (id) on delete restrict,
  name               text not null check (length(trim(name)) > 0),
  slug               text not null unique check (slug ~ '^[a-z0-9]{8}(-[a-z0-9]+)*$'),
  address            text,
  postal_code        text,
  city               text,
  lat                double precision check (lat between -90 and 90),
  lng                double precision check (lng between -180 and 180),
  cover_photo_path   text,
  cover_photo_alt_fr text,
  cover_photo_alt_en text,
  welcome_fr         text,
  welcome_en         text,
  contact_phone      text,
  contact_email      text,
  status             public.property_status not null default 'draft',
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- garde-fou minimal ; la vérification complète (Wi-Fi, horaires d'arrivée…) se fait dans l'admin
  constraint published_requires_essentials check (
    status = 'draft' or (lat is not null and lng is not null and welcome_fr is not null)
  )
);
create index on public.properties (host_id);

-- ============ Sections du livret ============
create table public.guide_sections (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  type        public.section_type not null,
  title_fr    text,               -- null = titre par défaut (next-intl)
  title_en    text,
  body_fr     text,
  body_en     text,
  data        jsonb not null default '{}'::jsonb,  -- champs propres au type (ssid, mot de passe, code boîte à clés, heures…), validés par zod
  media       jsonb not null default '[]'::jsonb,  -- [{ path, kind, alt_fr, alt_en }]
  position    smallint not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (jsonb_typeof(data) = 'object'),
  check (jsonb_typeof(media) = 'array')
);
-- une seule section par type, sauf les équipements (une fiche par appareil)
create unique index guide_sections_one_per_type
  on public.guide_sections (property_id, type) where type <> 'equipment';
create index on public.guide_sections (property_id, position);

-- ============ Base d'adresses commune ============
create table public.places (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (length(trim(name)) > 0),
  category          public.place_category not null,
  description_fr    text,
  description_en    text,
  address           text,
  postal_code       text,
  city              text,
  lat               double precision not null check (lat between -90 and 90),
  lng               double precision not null check (lng between -180 and 180),
  phone             text,
  website           text,
  booking_url       text,
  photo_path        text,
  photo_alt_fr      text,
  photo_alt_en      text,
  opening_mode      public.opening_mode not null default 'unknown',
  hours_verified_at date,
  archived_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index on public.places (category) where archived_at is null;

create table public.place_opening_hours (
  id        uuid primary key default gen_random_uuid(),
  place_id  uuid not null references public.places (id) on delete cascade,
  weekday   smallint not null check (weekday between 1 and 7),  -- ISO : 1 = lundi … 7 = dimanche
  opens_at  time not null,
  closes_at time not null,                                       -- '24:00' accepté
  check (closes_at > opens_at)
);
create index on public.place_opening_hours (place_id, weekday);

create table public.place_closures (
  id        uuid primary key default gen_random_uuid(),
  place_id  uuid not null references public.places (id) on delete cascade,
  starts_on date not null,
  ends_on   date not null,
  reason_fr text,
  reason_en text,
  check (ends_on >= starts_on)
);
create index on public.place_closures (place_id, ends_on);

-- ============ Sélection par logement ============
create table public.property_places (
  property_id uuid not null references public.properties (id) on delete cascade,
  place_id    uuid not null references public.places (id) on delete restrict,  -- on archive un lieu, on ne le supprime pas
  is_favorite boolean not null default false,
  comment_fr  text,
  comment_en  text,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  primary key (property_id, place_id)
);
create index on public.property_places (place_id);

-- ============ Modules ============
create table public.modules (
  key         text primary key check (key ~ '^[a-z_]+$'),
  name        text not null,
  description text
);
insert into public.modules (key, name) values ('places', 'Bonnes adresses');

create table public.property_modules (
  property_id uuid not null references public.properties (id) on delete cascade,
  module_key  text not null references public.modules (key) on update cascade,
  is_active   boolean not null default true,
  starts_on   date,
  ends_on     date,
  primary key (property_id, module_key),
  check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

create function public.module_is_active(p_property_id uuid, p_key text) returns boolean
language sql stable set search_path = ''
as $$
  select exists (
    select 1 from public.property_modules m
    where m.property_id = p_property_id and m.module_key = p_key and m.is_active
      and (m.starts_on is null or m.starts_on <= current_date)
      and (m.ends_on   is null or m.ends_on   >= current_date)
  );
$$;

-- ============ Adresses à revérifier (> 3 mois) ============
create view public.places_needing_review with (security_invoker = true) as
select * from public.places
where archived_at is null
  and opening_mode in ('schedule', 'unknown')
  and (hours_verified_at is null or hours_verified_at < current_date - interval '3 months');

-- ============ updated_at ============
create trigger set_updated_at before update on public.hosts          for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.properties     for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.guide_sections for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.places         for each row execute function public.set_updated_at();
