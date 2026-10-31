-- Données de démonstration (appliquées par `supabase db reset` en local,
-- ou à coller dans l'éditeur SQL du projet cloud). Gîte fictif, aucune donnée réelle.

insert into public.hosts (id, name, contact_name, notes)
values ('00000000-0000-4000-8000-000000000001', 'Hébergeur de démonstration', 'Démo', 'Fiche fictive pour les rendez-vous');

insert into public.properties (host_id, name, slug, city, postal_code, lat, lng, welcome_fr, welcome_en)
values (
  '00000000-0000-4000-8000-000000000001',
  'Gîte de démonstration',
  'demo4x7q-gite-de-demonstration',
  'Gourdon', '46300',
  44.7372, 1.3833,
  'Bienvenue ! Nous sommes ravis de vous accueillir.',
  'Welcome! We are delighted to have you.'
);

insert into public.property_modules (property_id, module_key)
select id, 'places' from public.properties where slug = 'demo4x7q-gite-de-demonstration';
