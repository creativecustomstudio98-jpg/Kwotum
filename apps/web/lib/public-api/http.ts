import { NextResponse } from "next/server";

export const publicCorsHeaders = {
  "Access-Control-Allow-Headers": "Content-Type, X-Wyceno-Session",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Max-Age": "86400",
} as const;

type PublicErrorCode =
  | "ANALYTICS_CONSENT_REQUIRED"
  | "FLOW_NOT_FOUND"
  | "INVALID_ANSWER"
  | "INVALID_FILE"
  | "INVALID_REQUEST"
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
  init: { cacheControl?: string; requestId: string; status?: number },
): NextResponse {
  return NextResponse.json(body, {
    headers: {
      ...publicCorsHeaders,
      "Cache-Control": init.cacheControl ?? "private, no-store",
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
): NextResponse {
  return jsonResponse({ error: { code, message, request_id: id } }, { requestId: id, status });
}

export function optionsResponse(): Response {
  return new Response(null, { headers: publicCorsHeaders, status: 204 });
}

export function mapDatabaseError(
  error: Readonly<{ code?: string; message?: string }> | null,
  resource: "flow" | "session",
  id: string,
): NextResponse {
  const message = error?.message ?? "";
  if (error?.code === "P0002") {
    return errorResponse(
      resource === "flow" ? "FLOW_NOT_FOUND" : "SESSION_NOT_FOUND",
      resource === "flow" ? "Ten proces jest niedostępny." : "Nie znaleziono sesji.",
      404,
      id,
    );
  }
  if (error?.code === "40001") {
    return errorResponse(
      "SESSION_CONFLICT",
      "Sesja została zmieniona w innym miejscu. Odświeżamy odpowiedzi.",
      409,
      id,
    );
  }
  if (error?.code === "23505" && message === "session already submitted") {
    return errorResponse("SESSION_CONFLICT", "Ta sesja została już wysłana.", 409, id);
  }
  if (error?.code === "22023" && message === "session expired") {
    return errorResponse("SESSION_EXPIRED", "Ta sesja wygasła.", 410, id);
  }
  if (error?.code === "23514" || message === "invalid answer") {
    if (message === "session is incomplete") {
      return errorResponse("RESULT_NOT_READY", "Wynik nie jest jeszcze gotowy.", 409, id);
    }
    return errorResponse("INVALID_ANSWER", "Odpowiedź jest nieprawidłowa.", 422, id);
  }
  if (error?.code === "54000") {
    return errorResponse("RATE_LIMITED", "Za dużo żądań. Spróbuj ponownie za chwilę.", 429, id);
  }
  return errorResponse(
    "UNAVAILABLE",
    "Usługa jest chwilowo niedostępna. Spróbuj ponownie.",
    503,
    id,
  );
}

export async function readSmallJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 8192) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  return JSON.parse(text) as unknown;
}
