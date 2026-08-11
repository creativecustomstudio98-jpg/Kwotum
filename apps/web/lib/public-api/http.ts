import { NextResponse } from "next/server";

const publicCorsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type, X-Wyceno-Session",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Max-Age": "86400",
} as const;

type PublicErrorCode =
  | "ANALYTICS_CONSENT_REQUIRED"
  | "CHALLENGE_FAILED"
  | "CHALLENGE_UNAVAILABLE"
  | "FLOW_NOT_FOUND"
  | "INVALID_ANSWER"
  | "INVALID_FILE"
  | "INVALID_REQUEST"
  | "ORIGIN_NOT_ALLOWED"
  | "RATE_LIMITED"
  | "RESULT_NOT_READY"
  | "SESSION_CONFLICT"
  | "SESSION_EXPIRED"
  | "SESSION_NOT_FOUND"
  | "UNAVAILABLE";

export function requestId(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && /^[a-zA-Z0-9_-]{8,80}$/.test(supplied) ? supplied : crypto.randomUUID();
}

export function jsonResponse(
  body: unknown,
  init: {
    cacheControl?: string;
    corsOrigin?: string | null | undefined;
    requestId: string;
    retryAfter?: number | undefined;
    status?: number;
  },
): NextResponse {
  const corsHeaders = init.corsOrigin
    ? { "Access-Control-Allow-Origin": init.corsOrigin, Vary: "Origin" }
    : { Vary: "Origin" };
  return NextResponse.json(body, {
    headers: {
      ...publicCorsHeaders,
      ...corsHeaders,
      "Cache-Control": init.cacheControl ?? "private, no-store",
      ...(init.retryAfter ? { "Retry-After": String(init.retryAfter) } : {}),
      "X-Request-Id": init.requestId,
      "X-Content-Type-Options": "nosniff",
    },
    status: init.status ?? 200,
  });
}

export function errorResponse(
  code: PublicErrorCode,
  message: string,
  status: number,
  id: string,
  corsOrigin?: string | null,
  retryAfter?: number,
): NextResponse {
  return jsonResponse(
    { error: { code, message, request_id: id } },
    { corsOrigin, requestId: id, retryAfter, status },
  );
}

export function optionsResponse(corsOrigin: string | null): Response {
  return new Response(null, {
    headers: {
      ...publicCorsHeaders,
      ...(corsOrigin ? { "Access-Control-Allow-Origin": corsOrigin } : {}),
      Vary: "Origin",
    },
    status: 204,
  });
}

export function mapDatabaseError(
  error: Readonly<{ code?: string; message?: string }> | null,
  resource: "flow" | "session",
  id: string,
  corsOrigin?: string | null,
): NextResponse {
  const message = error?.message ?? "";
  if (error?.code === "P0002") {
    return errorResponse(
      resource === "flow" ? "FLOW_NOT_FOUND" : "SESSION_NOT_FOUND",
      resource === "flow" ? "Ten proces jest niedostępny." : "Nie znaleziono sesji.",
      404,
      id,
      corsOrigin,
    );
  }
  if (error?.code === "40001") {
    return errorResponse(
      "SESSION_CONFLICT",
      "Sesja została zmieniona w innym miejscu. Odświeżamy odpowiedzi.",
      409,
      id,
      corsOrigin,
    );
  }
  if (error?.code === "23505" && message === "session already submitted") {
    return errorResponse("SESSION_CONFLICT", "Ta sesja została już wysłana.", 409, id, corsOrigin);
  }
  if (error?.code === "22023" && message === "session expired") {
    return errorResponse("SESSION_EXPIRED", "Ta sesja wygasła.", 410, id, corsOrigin);
  }
  if (error?.code === "23514" || message === "invalid answer") {
    if (message === "session is incomplete") {
      return errorResponse(
        "RESULT_NOT_READY",
        "Wynik nie jest jeszcze gotowy.",
        409,
        id,
        corsOrigin,
      );
    }
    return errorResponse("INVALID_ANSWER", "Odpowiedź jest nieprawidłowa.", 422, id, corsOrigin);
  }
  if (error?.code === "54000") {
    return errorResponse(
      "RATE_LIMITED",
      "Za dużo żądań. Spróbuj ponownie za chwilę.",
      429,
      id,
      corsOrigin,
      60,
    );
  }
  return errorResponse(
    "UNAVAILABLE",
    "Usługa jest chwilowo niedostępna. Spróbuj ponownie.",
    503,
    id,
    corsOrigin,
  );
}

export async function readSmallJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 8192) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  return JSON.parse(text) as unknown;
}
