-- V2 : « Préparer mon séjour » du gîte de démonstration (fictif). Contenu d'exemple, à adapter.
update public.guide_sections s
set data = jsonb_build_object(
      'provided_sheets', 'yes', 'provided_towels', 'yes', 'provided_coffee', 'yes', 'provided_soap', 'yes',
      'provided_hairdryer', 'yes', 'provided_baby_cot', 'yes', 'provided_high_chair', 'no',
      'provided_dishcloths', 'yes', 'provided_firewood', 'yes',
      'coffee_maker_fr', 'Machine Nespresso', 'coffee_maker_en', 'Nespresso machine',
      'bring_fr', E'Un pull pour les soirées fraîches\nDes chaussures de marche\nUn anti-moustique en été',
      'bring_en', E'A jumper for cool evenings\nWalking shoes\nMosquito repellent in summer',
      'station', 'Gourdon', 'station_minutes', '10'
    )
from public.properties p
where p.id = s.property_id and p.slug = 'demo4x7q-gite-de-demonstration' and s.type = 'prepare';
