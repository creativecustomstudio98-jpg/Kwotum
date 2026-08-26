import {
  confirmWidgetContextRequestSchema,
  confirmWidgetContextResponseSchema,
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

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function PUT(request: Request): Promise<Response> {
  const id = requestId(request);
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "answer",
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
      "Kontekst ma nieprawidłowy format.",
      422,
      id,
      corsOrigin,
    );
  }
  const parsed = confirmWidgetContextRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Kontekst ma nieprawidłowy format.",
      422,
      id,
      corsOrigin,
    );
  }
  const { data, error } = await createServiceClient().rpc("confirm_widget_context", {
    confirmed_values: parsed.data.values,
    mutation_id: parsed.data.mutationId,
    session_token: token.data,
  });
  if (error?.code === "23514") {
    return errorResponse(
      "INVALID_REQUEST",
      "Nie udało się potwierdzić kontekstu.",
      422,
      id,
      corsOrigin,
    );
  }
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);
  const confirmed = confirmWidgetContextResponseSchema.safeParse(data);
  if (!confirmed.success) {
    return errorResponse(
      "UNAVAILABLE",
      "Nie udało się potwierdzić kontekstu.",
      503,
      id,
      corsOrigin,
    );
  }
  return jsonResponse(confirmed.data, { corsOrigin, requestId: id });
}
