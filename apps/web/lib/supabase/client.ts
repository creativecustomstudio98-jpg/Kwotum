"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@wyceno/database";

import { getPublicSupabaseConfig } from "./env";

export function createClient() {
  const { publishableKey, url } = getPublicSupabaseConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
