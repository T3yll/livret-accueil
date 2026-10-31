# Livret d'accueil numérique

Contexte et règles : voir `CLAUDE.md` et `docs/`.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir les clés Supabase
npm run dev
```

## Base de données (Supabase)

Les migrations sont dans `supabase/migrations/`.

```bash
npx supabase login
npx supabase link --project-ref <ref-du-projet>
npx supabase db push                 # applique les migrations au projet cloud
npm run db:types                     # régénère src/types/database.ts
```

Créer le compte admin : Supabase → Authentication → Users → « Add user », puis dans l'éditeur SQL :

```sql
insert into public.admins (user_id) select id from auth.users where email = 'votre@email.fr';
```

## Tests

```bash
npm test
```
