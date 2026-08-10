import { createServerClient } from "@supabase/ssr";
import type { Database } from "@wyceno/database";
import { type NextRequest, NextResponse } from "next/server";

import { asSessionCookie, SESSION_MODE_COOKIE } from "../auth/session-preference";
import { getPublicSupabaseConfig } from "./env";

export async function refreshSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { publishableKey, url } = getPublicSupabaseConfig();
  const persistentSession = request.cookies.get(SESSION_MODE_COOKIE)?.value !== "session";
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, options: cookieOptions, value } of cookiesToSet) {
          const options = persistentSession ? cookieOptions : asSessionCookie(cookieOptions);
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/panel")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/logowanie";
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}
