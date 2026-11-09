-- Ferme de Turnac : planning des visites transmis par Rémi le 9 nov. 2026.
-- Horaires de la fiche = boutique (oct.–mars, lun.–sam. 9 h 30-18 h) ; les visites vont dans la précision.
update public.places
set booking_required = true,
    practical_note_fr = 'Visite libre et gratuite du lundi au samedi, 9 h 30-17 h 30. Visite guidée (1 h 30) de septembre à juin : lundi, mercredi et samedi à 16 h, vendredi à 10 h 30. Toujours sur réservation.',
    practical_note_en = 'Free self-guided visit Monday to Saturday, 9:30am-5:30pm. Guided tour (1h30) from September to June: Monday, Wednesday and Saturday at 4pm, Friday at 10:30am. Always by reservation.'
where name = 'Ferme de Turnac' and archived_at is null;
