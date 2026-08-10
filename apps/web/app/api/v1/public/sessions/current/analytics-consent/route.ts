import { analyticsConsentRequestSchema } from "@wyceno/analytics";
import { widgetSessionTokenSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  optionsResponse,
  readSmallJson,
  requestId,
} from "../../../../../../../lib/public-api/http";
import { createPublicClient } from "../../../../../../../lib/supabase/public";

export function OPTIONS(): Response {
  return optionsResponse();
}

export async function POST(request: Request): Promise<Response> {
  const id = requestId(request);
  const token = widgetSessionTokenSchema.safeParse(request.headers.get("x-wyceno-session"));
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id);
  }
  let body: unknown;
  try {
    body = await readSmallJson(request);
  } catch {
    return errorResponse("INVALID_REQUEST", "Nieprawidłowa decyzja analityczna.", 422, id);
  }
  const parsed = analyticsConsentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "Nieprawidłowa decyzja analityczna.", 422, id);
  }
  const { data, error } = await createPublicClient().rpc("record_analytics_consent", {
    consent_version: parsed.data.consentVersion,
    granted: parsed.data.granted,
    mutation_id: parsed.data.mutationId,
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id);
  return jsonResponse(data, { requestId: id });
}
