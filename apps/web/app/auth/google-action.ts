"use server";

import { redirect } from "next/navigation";

import { getSafeLocalDestination } from "../../lib/auth/safe-destination";
import { setSessionPersistence } from "../../lib/auth/session-preference";
import { siteOrigin } from "../../lib/marketing/metadata";
import { createClient } from "../../lib/supabase/server";

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const source = readText(formData, "source") === "register" ? "register" : "login";
  const fallback = source === "register" ? "/rejestracja?google=complete" : "/panel";
  const destination = getSafeLocalDestination(readText(formData, "next"), fallback);
  const callbackUrl = new URL("/auth/callback", siteOrigin);
  callbackUrl.searchParams.set("next", destination);

  await setSessionPersistence(true);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: callbackUrl.toString(),
    },
    provider: "google",
  });

  if (error || !data.url) {
    redirect(source === "register" ? "/rejestracja?error=google" : "/logowanie?error=google");
  }

  redirect(data.url);
}
