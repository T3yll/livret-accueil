import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
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
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
