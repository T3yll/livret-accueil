import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Client Supabase pour les composants navigateur (ex. envoi de photos dans l'admin).
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

export function publicMediaUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
