import type { NextRequest } from "next/server";

import { refreshSession } from "./lib/supabase/proxy";

export function proxy(request: NextRequest) {
  return refreshSession(request);
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/logowanie",
    "/rejestracja",
    "/nie-pamietasz-hasla",
    "/reset-hasla",
    "/auth/:path*",
  ],
};
