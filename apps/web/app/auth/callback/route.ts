import { type NextRequest, NextResponse } from "next/server";

import { ensureOrganizationFromUserMetadata } from "../../../lib/auth/organization-bootstrap";
import { getSafeLocalDestination } from "../../../lib/auth/safe-destination";
import { createClient } from "../../../lib/supabase/server";

function privateRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = getSafeLocalDestination(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const organization = await ensureOrganizationFromUserMetadata();
        if (destination === "/panel" && organization.status === "missing-profile-data") {
          return privateRedirect(new URL("/rejestracja?google=complete", request.url));
        }
        return privateRedirect(new URL(destination, request.url));
      } catch {
        return privateRedirect(new URL("/rejestracja?error=organization", request.url));
      }
    }
  }

  const loginUrl = new URL("/logowanie", request.url);
  loginUrl.searchParams.set("error", "callback");
  return privateRedirect(loginUrl);
}
