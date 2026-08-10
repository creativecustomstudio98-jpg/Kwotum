import { createClient } from "@supabase/supabase-js";
import type { Database } from "@wyceno/database";

import { getPublicSupabaseConfig } from "./env";

export function createPublicClient() {
  const { publishableKey, url } = getPublicSupabaseConfig();
  return createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
