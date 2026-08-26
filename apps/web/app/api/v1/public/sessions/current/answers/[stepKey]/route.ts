import {
  saveWidgetAnswerRequestSchema,
  saveWidgetAnswerResponseSchema,
  widgetSessionTokenSchema,
  widgetStepKeySchema,
} from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  readSmallJson,
  requestId,
} from "../../../../../../../../lib/public-api/http";
import {
  guardPublicOptions,
  guardPublicRequest,
} from "../../../../../../../../lib/public-api/request-guard";
import { createServiceClient } from "../../../../../../../../lib/supabase/service";

type RouteContext = { params: Promise<{ stepKey: string }> };

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
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
  const stepKey = widgetStepKeySchema.safeParse((await context.params).stepKey);
  if (!token.success || !stepKey.success) {
    return errorResponse("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 400, id, corsOrigin);
  }

  let body: unknown;
  try {
    body = await readSmallJson(request);
  } catch {
    return errorResponse("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 400, id, corsOrigin);
  }
  const parsed = saveWidgetAnswerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Odpowiedź ma nieprawidłowy format.",
      400,
      id,
      corsOrigin,
    );
  }

  const { data, error } = await createServiceClient().rpc("save_widget_answer", {
    answer: parsed.data.answer,
    expected_revision: parsed.data.expectedRevision,
    mutation_id: parsed.data.mutationId,
    next_step_key: parsed.data.nextStepKey,
    session_token: token.data,
    target_step_key: stepKey.data,
  });
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);

  const saved = saveWidgetAnswerResponseSchema.safeParse(data);
  if (!saved.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się zapisać odpowiedzi.", 503, id, corsOrigin);
  }
  return jsonResponse(saved.data, { corsOrigin, requestId: id });
}
