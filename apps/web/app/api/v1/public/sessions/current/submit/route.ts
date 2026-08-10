import {
  submitWidgetLeadRequestSchema,
  submitWidgetLeadResponseSchema,
  widgetSessionTokenSchema,
} from "@wyceno/validation";

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
    return errorResponse("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 400, id);
  }
  const parsed = submitWidgetLeadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "Dane kontaktowe lub zgody są nieprawidłowe.", 400, id);
  }

  const { data, error } = await createPublicClient().rpc("submit_widget_lead", {
    contact: parsed.data.contact,
    file_ids: parsed.data.fileIds,
    marketing_email_consent: parsed.data.marketingEmailConsent,
    mutation_id: parsed.data.mutationId,
    privacy_notice: parsed.data.privacyNotice,
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id);

  const submitted = submitWidgetLeadResponseSchema.safeParse(data);
  if (!submitted.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się zapisać zapytania.", 503, id);
  }
  return jsonResponse(submitted.data, { requestId: id, status: 201 });
}
