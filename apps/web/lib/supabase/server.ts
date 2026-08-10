import { createServerClient } from "@supabase/ssr";
import type { Database } from "@wyceno/database";
import { cookies } from "next/headers";

import { asSessionCookie } from "../auth/session-preference";
import { getPublicSupabaseConfig } from "./env";

export async function createClient(options: Readonly<{ persistentSession?: boolean }> = {}) {
  const cookieStore = await cookies();
  const { publishableKey, url } = getPublicSupabaseConfig();
  const persistentSession = options.persistentSession ?? true;

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, options: cookieOptions, value } of cookiesToSet) {
            cookieStore.set(
              name,
              value,
              persistentSession ? cookieOptions : asSessionCookie(cookieOptions),
            );
          }
        } catch {
          // A Server Component cannot write cookies. The proxy refreshes sessions.
        }
      },
    },
  });
}
