import { NextResponse } from "next/server";

export function wordpressRequestId(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && /^[a-zA-Z0-9_-]{8,80}$/.test(supplied) ? supplied : crypto.randomUUID();
}

export function wordpressJson(body: unknown, status: number, requestId: string): NextResponse {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
    },
    status,
  });
}

export function wordpressError(
  code: "INVALID_REQUEST" | "NOT_CONNECTED" | "UNAVAILABLE",
  message: string,
  status: number,
  requestId: string,
): NextResponse {
  return wordpressJson({ error: { code, message, requestId } }, status, requestId);
}

export function connectorCredential(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer ([a-f0-9]{64})$/);
  return match?.[1] ?? null;
}

export async function readWordpressJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength > 4096) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 4096) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
  return JSON.parse(text) as unknown;
}

export function mapWordpressDatabaseError(
  error: Readonly<{ code?: string }> | null,
  requestId: string,
): NextResponse {
  if (error?.code === "P0002") {
    return wordpressError("NOT_CONNECTED", "Połączenie jest nieważne.", 401, requestId);
  }
  if (error?.code === "22023") {
    return wordpressError("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 422, requestId);
  }
  if (error?.code === "54000") {
    return wordpressError("INVALID_REQUEST", "Za dużo prób. Spróbuj później.", 429, requestId);
  }
  return wordpressError("UNAVAILABLE", "Usługa jest chwilowo niedostępna.", 503, requestId);
}
