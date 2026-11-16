import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { withEnglishFallback } from "@/i18n/accept-language";
import { routing } from "@/i18n/routing";
import { redirectKeepingCookies, updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) {
    const response = NextResponse.next({ request });
    const claims = await updateSession(request, response);
    const isLoginPage = pathname === "/admin/login";

    // Premier filtre seulement : la vraie protection, ce sont les règles RLS
    // et la vérification is_admin() dans le layout de l'admin.
    if (!claims && pathname.startsWith("/admin") && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return redirectKeepingCookies(url, response);
    }
    return response;
  }

  // Côté voyageur : langue détectée, puis /g/… → /fr/g/… ou /en/g/…
  // (un choix fait avec le bouton FR/EN, gardé dans un cookie, passe avant l'en-tête).
  const accept = request.headers.get("accept-language");
  const preferred = withEnglishFallback(accept);
  if (preferred === accept) return intlMiddleware(request);
  const headers = new Headers(request.headers);
  headers.set("accept-language", preferred ?? "");
  return intlMiddleware(new NextRequest(request, { headers }));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
