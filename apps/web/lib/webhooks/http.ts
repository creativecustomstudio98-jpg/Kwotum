import { AuthorizationError } from "@wyceno/database";

import { WebhookTargetError } from "./security";

export type WebhookApiErrorCode =
  "CONFLICT" | "INVALID_REQUEST" | "NOT_FOUND" | "UNAVAILABLE" | "UNSAFE_TARGET";

export function webhookRequestId(request: Request): string {
  const supplied = request.headers.get("x-request-id");
  return supplied && /^[a-zA-Z0-9_-]{8,80}$/.test(supplied) ? supplied : crypto.randomUUID();
}

export function webhookJson(body: unknown, status: number, requestId: string): Response {
  return Response.json(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Request-Id": requestId,
    },
    status,
  });
}

export function webhookError(
  code: WebhookApiErrorCode,
  message: string,
  status: number,
  requestId: string,
): Response {
  return webhookJson({ error: { code, message, request_id: requestId } }, status, requestId);
}

export async function readWebhookJson(request: Request): Promise<unknown> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") throw new Error("UNSUPPORTED_MEDIA_TYPE");

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > 4096) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let receivedBytes = 0;
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    receivedBytes += chunk.value.byteLength;
    if (receivedBytes > 4096) {
      await reader.cancel();
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  text += decoder.decode();
  return JSON.parse(text) as unknown;
}

export function mapWebhookError(error: unknown, requestId: string): Response {
  if (error instanceof WebhookTargetError) {
    return webhookError(
      "UNSAFE_TARGET",
      "Endpoint musi być publicznym adresem HTTPS na porcie 443.",
      422,
      requestId,
    );
  }
  if (error instanceof AuthorizationError) {
    return webhookError("NOT_FOUND", "Nie znaleziono zasobu.", 404, requestId);
  }
  return webhookError(
    "UNAVAILABLE",
    "Operacja webhooka jest chwilowo niedostępna.",
    503,
    requestId,
  );
}
