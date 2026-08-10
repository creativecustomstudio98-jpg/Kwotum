import { resumeWidgetSessionResponseSchema, widgetSessionTokenSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  optionsResponse,
  requestId,
} from "../../../../../../lib/public-api/http";
import { createPublicClient } from "../../../../../../lib/supabase/public";

export function OPTIONS(): Response {
  return optionsResponse();
}

export async function GET(request: Request): Promise<Response> {
  const id = requestId(request);
  const token = widgetSessionTokenSchema.safeParse(request.headers.get("x-wyceno-session"));
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id);
  }

  const { data, error } = await createPublicClient().rpc("resume_widget_session", {
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id);

  const resumed = resumeWidgetSessionResponseSchema.safeParse(data);
  if (!resumed.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się wznowić sesji.", 503, id);
  }
  return jsonResponse(resumed.data, { requestId: id });
}
