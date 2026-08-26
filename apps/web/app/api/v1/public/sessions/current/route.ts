import { resumeWidgetSessionResponseSchema, widgetSessionTokenSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  requestId,
} from "../../../../../../lib/public-api/http";
import {
  guardPublicOptions,
  guardPublicRequest,
} from "../../../../../../lib/public-api/request-guard";
import { createServiceClient } from "../../../../../../lib/supabase/service";
import { manifestWithRuntimeChallenge } from "../../../../../../lib/public-api/turnstile";

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function GET(request: Request): Promise<Response> {
  const id = requestId(request);
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "session_read",
    { sessionToken: rawToken ?? undefined },
    id,
  );
  if (!guard.allowed) return guard.response;
  const { corsOrigin } = guard.context;
  const token = widgetSessionTokenSchema.safeParse(rawToken);
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id, corsOrigin);
  }

  const { data, error } = await createServiceClient().rpc("resume_widget_session", {
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);

  const resumed = resumeWidgetSessionResponseSchema.safeParse(data);
  if (!resumed.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się wznowić sesji.", 503, id, corsOrigin);
  }
  const runtime = manifestWithRuntimeChallenge(resumed.data.manifest);
  if (!runtime.ready) {
    return errorResponse(
      "CHALLENGE_UNAVAILABLE",
      "Formularz jest chwilowo niedostępny. Spróbuj ponownie.",
      503,
      id,
      corsOrigin,
    );
  }
  return jsonResponse(
    { ...resumed.data, manifest: runtime.manifest },
    { corsOrigin, requestId: id },
  );
}
