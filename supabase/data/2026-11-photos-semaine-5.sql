-- Semaine 5 : photos libres (Wikimedia Commons) de 16 adresses, avec texte alternatif FR/EN et crédit.
-- Les fichiers ont été convertis en WebP 1600 px et envoyés dans le stockage (bucket media, places/<id>/).
-- Ce fichier garde la trace des choix ; il a déjà été appliqué sur la base en ligne.
-- Sources :
--   https://commons.wikimedia.org/wiki/File:View_of_Beynac_04.jpg
--   https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_Castelnaud_1.jpg
--   https://commons.wikimedia.org/wiki/File:Sarlat-la-Can%C3%A9da_-_Rue_F%C3%A9nelon_%26_place_de_la_Libert%C3%A9.jpg
--   https://commons.wikimedia.org/wiki/File:Padirac_-_Gouffre_-_07.jpg
--   https://commons.wikimedia.org/wiki/File:Castle_of_Marqueyssac_12.jpg
--   https://commons.wikimedia.org/wiki/File:La_Roque-Gageac_-_01.jpg
--   https://commons.wikimedia.org/wiki/File:Rocamadour,_Lot,_Midi-Pyr%C3%A9n%C3%A9es,_france.jpg
--   https://commons.wikimedia.org/wiki/File:Mus%C3%A9e_national_de_Pr%C3%A9histoire_(Les_Eyzies-de-Tayac-Sireuil).jpg
--   https://commons.wikimedia.org/wiki/File:Halle_Domme.jpg
--   https://commons.wikimedia.org/wiki/File:St_Pierre_de_Gourdon_(Lot)_Gourdon_vers_le_sud.jpg
--   https://commons.wikimedia.org/wiki/File:Souillac,_abbaye_Sainte-Marie_-_panoramio.jpg
--   https://commons.wikimedia.org/wiki/File:%C3%89glise_Saint-Cyprien_de_Saint-Cyprien_(Dordogne)_01.jpg
--   https://commons.wikimedia.org/wiki/File:Rocamadour_-_For%C3%AAt_des_singes_138.jpg
--   https://commons.wikimedia.org/wiki/File:Cougnac_cave_entrance.jpg
--   https://commons.wikimedia.org/wiki/File:Domme_-_View_from_Esplanade_de_la_Barre_-_02.jpg
--   https://commons.wikimedia.org/wiki/File:Truffe02.jpg

-- Semaine 5 : photos libres de Wikimedia Commons pour les adresses, avec crédit.
begin;
update public.places set photo_path = 'places/fc339eff-4bac-4f6c-9609-c2af7023a35e/photo-1793624537018.webp', photo_alt_fr = 'Le château de Beynac dominant la vallée de la Dordogne', photo_alt_en = 'Beynac castle overlooking the Dordogne valley', photo_credit = 'Photo : Krzysztof Golik, CC BY-SA 4.0, Wikimedia Commons' where id = 'fc339eff-4bac-4f6c-9609-c2af7023a35e';
update public.places set photo_path = 'places/867e580d-153a-4b73-9025-5b43d07d6e41/photo-1793624537018.webp', photo_alt_fr = 'Le château de Castelnaud vu depuis l''ouest', photo_alt_en = 'Castelnaud castle seen from the west', photo_credit = 'Photo : Jebulon, CC0, Wikimedia Commons' where id = '867e580d-153a-4b73-9025-5b43d07d6e41';
update public.places set photo_path = 'places/db74001f-f297-4917-8fe4-aa7b67bf1d87/photo-1793624537018.webp', photo_alt_fr = 'Hôtels particuliers en pierre blonde, rue Fénelon et place de la Liberté à Sarlat', photo_alt_en = 'Honey-coloured mansions on rue Fénelon and place de la Liberté in Sarlat', photo_credit = 'Photo : Benjamin Smith, CC BY-SA 4.0, Wikimedia Commons' where id = 'db74001f-f297-4917-8fe4-aa7b67bf1d87';
update public.places set photo_path = 'places/6debf05d-342d-459d-ba9b-5fdffe1a1fd1/photo-1793624537018.webp', photo_alt_fr = 'Barque sur la rivière souterraine du gouffre de Padirac', photo_alt_en = 'A boat on the underground river of the Padirac chasm', photo_credit = 'Photo : Benjamin Smith, CC BY-SA 4.0, Wikimedia Commons' where id = '6debf05d-342d-459d-ba9b-5fdffe1a1fd1';
update public.places set photo_path = 'places/cd1c7412-d2c2-4980-afc9-432c0f0769dd/photo-1793624537018.webp', photo_alt_fr = 'Buis taillés devant le château de Marqueyssac', photo_alt_en = 'Clipped box hedges in front of Marqueyssac manor', photo_credit = 'Photo : Krzysztof Golik, CC BY-SA 4.0, Wikimedia Commons' where id = 'cd1c7412-d2c2-4980-afc9-432c0f0769dd';
update public.places set photo_path = 'places/18c52b08-93a8-4147-80fe-89af304c99c7/photo-1793624537018.webp', photo_alt_fr = 'Les maisons de La Roque-Gageac entre la Dordogne et la falaise', photo_alt_en = 'La Roque-Gageac''s houses between the Dordogne and the cliff', photo_credit = 'Photo : Benjamin Smith, CC BY-SA 4.0, Wikimedia Commons' where id = '18c52b08-93a8-4147-80fe-89af304c99c7';
update public.places set photo_path = 'places/d628ba25-bc4a-4e76-9e75-cba062b43895/photo-1793624537018.webp', photo_alt_fr = 'La cité de Rocamadour accrochée à la falaise', photo_alt_en = 'Rocamadour clinging to the cliff face', photo_credit = 'Photo : Dynamosquito from France, CC BY-SA 2.0, Wikimedia Commons' where id = 'd628ba25-bc4a-4e76-9e75-cba062b43895';
update public.places set photo_path = 'places/d735282a-9dea-420c-a8c1-0ffd3a5b505e/photo-1793624537018.webp', photo_alt_fr = 'Le Musée national de Préhistoire adossé à la falaise des Eyzies', photo_alt_en = 'The National Museum of Prehistory set against the Les Eyzies cliff', photo_credit = 'Photo : Didier Descouens, CC BY-SA 3.0, Wikimedia Commons' where id = 'd735282a-9dea-420c-a8c1-0ffd3a5b505e';
update public.places set photo_path = 'places/7fc88483-272c-4560-b913-39048f87b312/photo-1793624537018.webp', photo_alt_fr = 'La halle de Domme fleurie, sur la place du marché', photo_alt_en = 'Domme''s flower-decked market hall on the market square', photo_credit = 'Photo : Jebulon, CC0, Wikimedia Commons' where id = '7fc88483-272c-4560-b913-39048f87b312';
update public.places set photo_path = 'places/a2e252a6-be90-4e14-824b-819294ed6591/photo-1793624537018.webp', photo_alt_fr = 'Gourdon et l''église Saint-Pierre vus depuis la butte', photo_alt_en = 'Gourdon and Saint-Pierre church seen from the hilltop', photo_credit = 'Photo : Didier Descouens, CC BY-SA 3.0, Wikimedia Commons' where id = 'a2e252a6-be90-4e14-824b-819294ed6591';
update public.places set photo_path = 'places/ffcd4c13-a90a-479b-a759-f072ae04390e/photo-1793624537018.webp', photo_alt_fr = 'L''abbatiale Sainte-Marie de Souillac', photo_alt_en = 'The Sainte-Marie abbey church in Souillac', photo_credit = 'Photo : Gilles Guillamot, CC BY-SA 3.0, Wikimedia Commons' where id = 'ffcd4c13-a90a-479b-a759-f072ae04390e';
update public.places set photo_path = 'places/723a012e-1905-4aed-8ccc-6e8c190d8719/photo-1793624537018.webp', photo_alt_fr = 'Le clocher de l''église de Saint-Cyprien', photo_alt_en = 'The bell tower of Saint-Cyprien church', photo_credit = 'Photo : John Samuel, CC BY-SA 4.0, Wikimedia Commons' where id = '723a012e-1905-4aed-8ccc-6e8c190d8719';
update public.places set photo_path = 'places/dd390ef4-37cc-4348-a4d7-7685e5bbed8f/photo-1793624537018.webp', photo_alt_fr = 'Un macaque de Barbarie assis dans la Forêt des Singes', photo_alt_en = 'A Barbary macaque sitting in the Monkey Forest', photo_credit = 'Photo : Tylwyth Eldar, CC BY-SA 4.0, Wikimedia Commons' where id = 'dd390ef4-37cc-4348-a4d7-7685e5bbed8f';
update public.places set photo_path = 'places/c4d35bce-78ad-4d32-94a1-e10d2bf38a4f/photo-1793624537018.webp', photo_alt_fr = 'L''entrée des grottes de Cougnac', photo_alt_en = 'The entrance to the Cougnac caves', photo_credit = 'Photo : Ethan Doyle White at English Wikipedia, CC BY-SA 3.0, Wikimedia Commons' where id = 'c4d35bce-78ad-4d32-94a1-e10d2bf38a4f';
update public.places set photo_path = 'places/112e87cb-62d7-4786-bf73-9bb9202e1afd/photo-1793624537018.webp', photo_alt_fr = 'La vallée de la Dordogne vue depuis la Barre de Domme', photo_alt_en = 'The Dordogne valley seen from the Barre viewpoint in Domme', photo_credit = 'Photo : Benjamin Smith, CC BY-SA 4.0, Wikimedia Commons' where id = '112e87cb-62d7-4786-bf73-9bb9202e1afd';
update public.places set photo_path = 'places/0bde38d4-64bc-4e8d-8e4a-6e8d322939c4/photo-1793624537018.webp', photo_alt_fr = 'Une truffe noire du Périgord', photo_alt_en = 'A black Périgord truffle', photo_credit = 'Photo : Wikimedia Commons, domaine public' where id = '0bde38d4-64bc-4e8d-8e4a-6e8d322939c4';
commit;
