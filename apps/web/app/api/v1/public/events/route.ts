import { analyticsEventRequestSchema } from "@wyceno/analytics";
import { widgetSessionTokenSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  readSmallJson,
  requestId,
} from "../../../../../lib/public-api/http";
import {
  guardPublicOptions,
  guardPublicRequest,
} from "../../../../../lib/public-api/request-guard";
import { createServiceClient } from "../../../../../lib/supabase/service";

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function POST(request: Request): Promise<Response> {
  const id = requestId(request);
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "event",
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
      "Nieprawidłowy event analityczny.",
      422,
      id,
      corsOrigin,
    );
  }
  const parsed = analyticsEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Nieprawidłowy event analityczny.",
      422,
      id,
      corsOrigin,
    );
  }
  const { data, error } = await createServiceClient().rpc("record_widget_event", {
    event_device: parsed.data.device,
    event_id: parsed.data.eventId,
    event_name: parsed.data.name,
    event_occurred_at: parsed.data.occurredAt,
    event_schema_version: parsed.data.schemaVersion,
    event_source: parsed.data.source,
    event_step_key: parsed.data.stepKey,
    session_token: token.data,
  });
  if (error?.code === "42501") {
    return errorResponse(
      "ANALYTICS_CONSENT_REQUIRED",
      "Analityka wymaga aktywnej zgody.",
      403,
      id,
      corsOrigin,
    );
  }
  if (error?.code === "22023") {
    return errorResponse(
      "INVALID_REQUEST",
      "Nieprawidłowy event analityczny.",
      422,
      id,
      corsOrigin,
    );
  }
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);
  return jsonResponse(data, { corsOrigin, requestId: id, status: 202 });
}
