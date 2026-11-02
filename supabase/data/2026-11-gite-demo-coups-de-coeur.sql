-- Semaine 5 : message d'accueil et 6 coups de cœur du gîte de démonstration (validés par Rémi le 2 novembre 2026).
-- Déjà appliqué sur la base en ligne ; rejouable.

begin;

update public.properties
set welcome_fr = 'Bienvenue aux Noyers ! La maison est à vous : prenez le temps de vous installer. Dans ce livret, tout ce qu''il faut pour votre séjour, et nos adresses préférées entre Gourdon et Sarlat. Une question ? Appelez-nous, nous habitons à deux pas.',
    welcome_en = 'Welcome to Les Noyers! The house is yours: take your time to settle in. This guide has everything you need for your stay, plus our favourite places between Gourdon and Sarlat. Any question? Just call us, we live close by.'
where slug = 'demo4x7q-gite-de-demonstration';

update public.property_places pp
set is_favorite = true, comment_fr = v.comment_fr, comment_en = v.comment_en, position = v.position
from public.properties pr, public.places pl,
  (values
    (1, 'Marché aux truffes de Sarlat',
     'Allez-y tôt le samedi : l''odeur sous les arcades vaut le déplacement, même sans rien acheter.',
     'Go early on Saturday: the smell under the arcades is worth the trip, even if you don''t buy.'),
    (2, 'Ferme de Turnac',
     'La visite est simple et sincère, et la dégustation au retour fait toujours l''unanimité.',
     'A simple, honest farm tour, and the tasting afterwards always wins everyone over.'),
    (3, 'Bastide de Domme',
     'Montez à la Barre en fin de journée : c''est notre point de vue préféré sur la vallée.',
     'Walk up to the Barre at the end of the day: our favourite view over the valley.'),
    (4, 'Jardins de Marqueyssac',
     'Même en hiver, la balade jusqu''au belvédère est magnifique. Comptez deux heures.',
     'Even in winter, the walk to the viewpoint is beautiful. Allow two hours.'),
    (5, 'Le Pot Occitan',
     'Notre adresse du midi à Gourdon : simple, généreuse, et toujours un bon accueil.',
     'Our lunch spot in Gourdon: simple, generous and always a warm welcome.'),
    (6, 'Château de Castelnaud',
     'Parfait avec des enfants : les machines de guerre impressionnent toujours.',
     'Perfect with children: the siege engines never fail to impress.')
  ) as v (position, name, comment_fr, comment_en)
where pr.slug = 'demo4x7q-gite-de-demonstration'
  and pp.property_id = pr.id
  and pl.id = pp.place_id
  and pl.name = v.name;

commit;
