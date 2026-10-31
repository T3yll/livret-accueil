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
    "place_closures", "property_places", "modules", "property_modules",
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
