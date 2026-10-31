import { brand } from "@/config/brand";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <p className="text-sm tracking-[0.2em] text-muted uppercase">{brand.name}</p>
        <h1 className="text-[28px]">Espace administrateur</h1>
      </div>
      {error === "not-admin" && (
        <p role="alert" className="rounded-xl bg-favorite-bg px-4 py-3 text-sm text-favorite">
          Ce compte n&apos;a pas accès à l&apos;administration.
        </p>
      )}
      <LoginForm />
    </main>
  );
}
