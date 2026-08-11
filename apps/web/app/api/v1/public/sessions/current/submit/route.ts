import {
  submitWidgetLeadRequestSchema,
  submitWidgetLeadResponseSchema,
  widgetSessionTokenSchema,
} from "@wyceno/validation";

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
import { verifyTurnstile } from "../../../../../../../lib/public-api/turnstile";

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function POST(request: Request): Promise<Response> {
  const id = requestId(request);
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "submit",
    { sessionToken: rawToken ?? undefined },
    id,
  );
  if (!guard.allowed) return guard.response;
  const { clientAddress, corsOrigin } = guard.context;
  const token = widgetSessionTokenSchema.safeParse(rawToken);
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id, corsOrigin);
  }

  let body: unknown;
  try {
    body = await readSmallJson(request);
  } catch {
    return errorResponse("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 400, id, corsOrigin);
  }
  const parsed = submitWidgetLeadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Dane kontaktowe lub zgody są nieprawidłowe.",
      400,
      id,
      corsOrigin,
    );
  }

  const challenge = await verifyTurnstile({
    clientAddress,
    corsOrigin,
    idempotencyKey: parsed.data.mutationId,
    token: parsed.data.challengeToken,
  });
  if (challenge.status === "unavailable") {
    return errorResponse(
      "CHALLENGE_UNAVAILABLE",
      "Nie udało się potwierdzić zabezpieczenia. Spróbuj ponownie za chwilę.",
      503,
      id,
      corsOrigin,
    );
  }
  if (challenge.status === "rejected") {
    return errorResponse(
      "CHALLENGE_FAILED",
      "Potwierdzenie bezpieczeństwa wygasło lub jest nieprawidłowe. Spróbuj ponownie.",
      422,
      id,
      corsOrigin,
    );
  }

  const { data, error } = await createServiceClient().rpc("submit_widget_lead", {
    contact: parsed.data.contact,
    file_ids: parsed.data.fileIds,
    marketing_email_consent: parsed.data.marketingEmailConsent,
    mutation_id: parsed.data.mutationId,
    privacy_notice: parsed.data.privacyNotice,
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);

  const submitted = submitWidgetLeadResponseSchema.safeParse(data);
  if (!submitted.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się zapisać zapytania.", 503, id, corsOrigin);
  }
  return jsonResponse(submitted.data, { corsOrigin, requestId: id, status: 201 });
}
