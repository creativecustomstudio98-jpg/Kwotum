import { analyticsEventRequestSchema } from "@wyceno/analytics";
import { widgetSessionTokenSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  optionsResponse,
  readSmallJson,
  requestId,
} from "../../../../../lib/public-api/http";
import { createPublicClient } from "../../../../../lib/supabase/public";

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
    return errorResponse("INVALID_REQUEST", "Nieprawidłowy event analityczny.", 422, id);
  }
  const parsed = analyticsEventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "Nieprawidłowy event analityczny.", 422, id);
  }
  const { data, error } = await createPublicClient().rpc("record_widget_event", {
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
    return errorResponse("ANALYTICS_CONSENT_REQUIRED", "Analityka wymaga aktywnej zgody.", 403, id);
  }
  if (error?.code === "22023") {
    return errorResponse("INVALID_REQUEST", "Nieprawidłowy event analityczny.", 422, id);
  }
  if (error) return mapDatabaseError(error, "session", id);
  return jsonResponse(data, { requestId: id, status: 202 });
}
