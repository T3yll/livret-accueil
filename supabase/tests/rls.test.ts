// Vérifie les règles d'accès en appliquant les vraies migrations sur un Postgres
// embarqué (PGlite), sans Docker ni projet Supabase. Le schéma auth et le stockage
// de Supabase sont remplacés par des versions minimales.
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const ADMIN = "11111111-1111-4111-8111-111111111111";
const STRANGER = "22222222-2222-4222-8222-222222222222";
const DEMO_SLUG = "demo4x7q-gite-de-demonstration";

const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;

  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;

  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`;

let db: PGlite;

// Exécute une requête avec le rôle et l'utilisateur donnés, comme le ferait PostgREST.
async function as<T>(role: "anon" | "authenticated", userId: string | null, sql: string) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${userId ?? ""}', false);`);
  await db.exec(`set role ${role}`);
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec("reset role");
  }
}

const guideFor = async (role: "anon" | "authenticated", userId: string | null, slug = DEMO_SLUG) =>
  (await as<{ g: { property: { status: string } } | null }>(role, userId, `select public.get_guide('${slug}') as g`))[0]
    .g;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  const migrations = readdirSync(join(ROOT, "migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const file of migrations) await db.exec(readFileSync(join(ROOT, "migrations", file), "utf8"));
  await db.exec(readFileSync(join(ROOT, "seed.sql"), "utf8"));
  await db.exec(`
    insert into auth.users values ('${ADMIN}', 'admin@test.fr'), ('${STRANGER}', 'autre@test.fr');
    insert into public.admins values ('${ADMIN}');
  `);
});

describe("visiteur anonyme", () => {
  const tables = [
    "admins", "hosts", "properties", "guide_sections", "places", "place_opening_hours",
    "place_closures", "property_places", "modules", "property_modules", "place_events", "equipment_templates",
  ];

  it.each(tables)("ne peut pas lire la table %s", async (table) => {
    await expect(as("anon", null, `select * from public.${table}`)).rejects.toThrow(/permission denied/);
  });

  it("ne peut rien écrire", async () => {
    await expect(as("anon", null, `insert into public.hosts (name) values ('pirate')`)).rejects.toThrow(
      /permission denied/,
    );
  });

  it("ne voit pas un livret en brouillon", async () => {
    expect(await guideFor("anon", null)).toBeNull();
  });

  it("voit un livret publié avec le slug exact, et seulement avec lui", async () => {
    await db.exec(`update public.properties set status = 'published' where slug = '${DEMO_SLUG}'`);
    try {
      expect((await guideFor("anon", null))?.property.status).toBe("published");
      expect(await guideFor("anon", null, "demo4x7q")).toBeNull();
      expect(await guideFor("anon", null, "%")).toBeNull();
    } finally {
      await db.exec(`update public.properties set status = 'draft' where slug = '${DEMO_SLUG}'`);
    }
  });
});

describe("données de l'hébergeur dans le livret", () => {
  it("n'expose que les prénoms à afficher, jamais le reste de la fiche", async () => {
    await db.exec(`
      update public.hosts set display_names = 'Pascal et Brigitte', phone = '0600000000', email = 'prive@test.fr',
        notes = 'note privée', contact_name = 'Nom privé'
      where id = '00000000-0000-4000-8000-000000000001';
      update public.properties set status = 'published' where slug = '${DEMO_SLUG}';
    `);
    try {
      const guide = await guideFor("anon", null);
      const json = JSON.stringify(guide);
      expect(json).toContain("Pascal et Brigitte");
      for (const secret of ["0600000000", "prive@test.fr", "note privée", "Nom privé"]) expect(json).not.toContain(secret);
    } finally {
      await db.exec(`update public.properties set status = 'draft' where slug = '${DEMO_SLUG}'`);
    }
  });
});

describe("expériences dans le livret", () => {
  it("n'expose que les dates à venir d'une adresse du livret", async () => {
    await db.exec(`
      insert into public.places (id, name, category, lat, lng, is_experience)
      values ('33333333-3333-4333-8333-333333333333', 'Soirée test', 'activity', 44.7, 1.4, true);
      insert into public.property_places (property_id, place_id)
      select id, '33333333-3333-4333-8333-333333333333' from public.properties where slug = '${DEMO_SLUG}';
      insert into public.place_events (place_id, starts_on, label_fr) values
        ('33333333-3333-4333-8333-333333333333', current_date - 10, 'Passée'),
        ('33333333-3333-4333-8333-333333333333', current_date + 3, 'À venir');
      update public.properties set status = 'published' where slug = '${DEMO_SLUG}';
    `);
    try {
      const guide = (await guideFor("anon", null)) as unknown as {
        places: { name: string; is_experience: boolean; events: { label_fr: string }[] }[];
      };
      const place = guide.places.find((p) => p.name === "Soirée test");
      expect(place?.is_experience).toBe(true);
      expect(place?.events.map((e) => e.label_fr)).toEqual(["À venir"]);
    } finally {
      await db.exec(`
        update public.properties set status = 'draft' where slug = '${DEMO_SLUG}';
        delete from public.property_places where place_id = '33333333-3333-4333-8333-333333333333';
        delete from public.places where id = '33333333-3333-4333-8333-333333333333';
      `);
    }
  });

  it("refuse les tables d'expériences et de modèles à un connecté non admin", async () => {
    expect(await as("authenticated", STRANGER, "select id from public.place_events")).toHaveLength(0);
    await expect(
      as("authenticated", STRANGER, `insert into public.equipment_templates (title_fr) values ('pirate')`),
    ).rejects.toThrow(/row-level security/);
  });
});

describe("utilisateur connecté non admin", () => {
  it("ne voit aucune ligne", async () => {
    expect(await as("authenticated", STRANGER, "select id from public.properties")).toHaveLength(0);
    expect(await as("authenticated", STRANGER, "select id from public.hosts")).toHaveLength(0);
  });

  it("ne peut pas créer d'hébergeur", async () => {
    await expect(
      as("authenticated", STRANGER, `insert into public.hosts (name) values ('pirate')`),
    ).rejects.toThrow(/row-level security/);
  });

  it("ne peut pas s'ajouter aux admins", async () => {
    await expect(
      as("authenticated", STRANGER, `insert into public.admins values ('${STRANGER}')`),
    ).rejects.toThrow(/row-level security|permission denied/);
  });

  it("ne voit pas les brouillons", async () => {
    expect(await guideFor("authenticated", STRANGER)).toBeNull();
  });
});

describe("admin", () => {
  it("lit et écrit les tables", async () => {
    expect(await as("authenticated", ADMIN, "select id from public.properties")).toHaveLength(1);
    const rows = await as<{ id: string }>(
      "authenticated",
      ADMIN,
      `insert into public.hosts (name) values ('Nouvel hôte') returning id`,
    );
    expect(rows).toHaveLength(1);
  });

  it("prévisualise un brouillon", async () => {
    expect((await guideFor("authenticated", ADMIN))?.property.status).toBe("draft");
  });
});

describe("sections par défaut", () => {
  const sectionTypes = async (propertyFilter: string) =>
    (
      await db.query<{ type: string }>(
        `select s.type from public.guide_sections s join public.properties p on p.id = s.property_id
         where ${propertyFilter} order by s.position`,
      )
    ).rows.map((r) => r.type);

  const expected = ["arrival", "wifi", "house", "departure", "contacts", "practical", "prepare"];

  it("sont créées pour un nouveau logement", async () => {
    await db.exec(`insert into public.properties (host_id, name, slug)
                   values ('00000000-0000-4000-8000-000000000001', 'Nouveau', 'zzzzzzzz-nouveau')`);
    expect(await sectionTypes("p.slug = 'zzzzzzzz-nouveau'")).toEqual(expected);
  });

  it("ne s'affichent pas au voyageur tant qu'elles sont vides : get_guide les renvoie, l'app les filtre", async () => {
    expect(await sectionTypes(`p.slug = '${DEMO_SLUG}'`)).toEqual(expected);
  });

  it("une seule section par type, sauf les équipements", async () => {
    const insert = (type: string) =>
      db.exec(`insert into public.guide_sections (property_id, type)
               select id, '${type}' from public.properties where slug = 'zzzzzzzz-nouveau'`);
    await expect(insert("wifi")).rejects.toThrow(/guide_sections_one_per_type/);
    await insert("equipment");
    await insert("equipment");
  });
});

describe("contraintes", () => {
  it("refuse un slug devinable", async () => {
    await expect(
      db.exec(`insert into public.properties (host_id, name, slug)
               values ('00000000-0000-4000-8000-000000000001', 'x', 'abcd-gite')`),
    ).rejects.toThrow(/properties_slug_check/);
  });

  it("refuse de publier sans coordonnées ni message d'accueil", async () => {
    await expect(
      db.exec(`insert into public.properties (host_id, name, slug, status)
               values ('00000000-0000-4000-8000-000000000001', 'x', 'abcdefgh-x', 'published')`),
    ).rejects.toThrow(/published_requires_essentials/);
  });
});
