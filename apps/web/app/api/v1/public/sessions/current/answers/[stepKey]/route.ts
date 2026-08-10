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
  optionsResponse,
  readSmallJson,
  requestId,
} from "../../../../../../../../lib/public-api/http";
import { createPublicClient } from "../../../../../../../../lib/supabase/public";

type RouteContext = { params: Promise<{ stepKey: string }> };

export function OPTIONS(): Response {
  return optionsResponse();
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  const id = requestId(request);
  const token = widgetSessionTokenSchema.safeParse(request.headers.get("x-wyceno-session"));
  const stepKey = widgetStepKeySchema.safeParse((await context.params).stepKey);
  if (!token.success || !stepKey.success) {
    return errorResponse("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 400, id);
  }

  let body: unknown;
  try {
    body = await readSmallJson(request);
  } catch {
    return errorResponse("INVALID_REQUEST", "Żądanie jest nieprawidłowe.", 400, id);
  }
  const parsed = saveWidgetAnswerRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("INVALID_REQUEST", "Odpowiedź ma nieprawidłowy format.", 400, id);
  }

  const { data, error } = await createPublicClient().rpc("save_widget_answer", {
    answer: parsed.data.answer,
    expected_revision: parsed.data.expectedRevision,
    mutation_id: parsed.data.mutationId,
    next_step_key: parsed.data.nextStepKey,
    session_token: token.data,
    target_step_key: stepKey.data,
  });
  if (error) return mapDatabaseError(error, "session", id);

  const saved = saveWidgetAnswerResponseSchema.safeParse(data);
  if (!saved.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się zapisać odpowiedzi.", 503, id);
  }
  return jsonResponse(saved.data, { requestId: id });
}
