import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const SESSION_MODE_COOKIE = "lorum-session-mode";

export function asSessionCookie(options: CookieOptions): CookieOptions {
  const sessionOptions = { ...options };
  delete sessionOptions.expires;
  delete sessionOptions.maxAge;
  return sessionOptions;
}

export async function setSessionPersistence(persistent: boolean): Promise<void> {
  const cookieStore = await cookies();
  if (persistent) {
    cookieStore.delete(SESSION_MODE_COOKIE);
    return;
  }

  cookieStore.set(SESSION_MODE_COOKIE, "session", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
