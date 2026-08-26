import { analyticsConsentRequestSchema } from "@wyceno/analytics";
import { widgetSessionTokenSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  readSmallJson,
  requestId,
} from "../../../../../../../lib/public-api/http";
import {
  guardPublicOptions,
  guardPublicRequest,
} from "../../../../../../../lib/public-api/request-guard";
import { createServiceClient } from "../../../../../../../lib/supabase/service";

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function POST(request: Request): Promise<Response> {
  const id = requestId(request);
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "consent",
    { sessionToken: rawToken ?? undefined },
    id,
  );
  if (!guard.allowed) return guard.response;
  const { corsOrigin } = guard.context;
  const token = widgetSessionTokenSchema.safeParse(rawToken);
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id, corsOrigin);
  }
  let body: unknown;
  try {
    body = await readSmallJson(request);
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "Nieprawidłowa decyzja analityczna.",
      422,
      id,
      corsOrigin,
    );
  }
  const parsed = analyticsConsentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Nieprawidłowa decyzja analityczna.",
      422,
      id,
      corsOrigin,
    );
  }
  const { data, error } = await createServiceClient().rpc("record_analytics_consent", {
    consent_version: parsed.data.consentVersion,
    granted: parsed.data.granted,
    mutation_id: parsed.data.mutationId,
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);
  return jsonResponse(data, { corsOrigin, requestId: id });
}
