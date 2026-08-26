import {
  createWidgetSessionRequestSchema,
  createWidgetSessionResponseSchema,
  widgetPublicIdSchema,
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
import { manifestWithRuntimeChallenge } from "../../../../../../../lib/public-api/turnstile";

type RouteContext = { params: Promise<{ publicId: string }> };

export async function OPTIONS(request: Request, context: RouteContext): Promise<Response> {
  const parsedId = widgetPublicIdSchema.safeParse((await context.params).publicId);
  return guardPublicOptions(request, parsedId.success ? { publicId: parsedId.data } : {});
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const id = requestId(request);
  const parsedId = widgetPublicIdSchema.safeParse((await context.params).publicId);
  if (!parsedId.success) {
    return errorResponse("FLOW_NOT_FOUND", "Ten proces jest niedostępny.", 404, id);
  }
  const guard = await guardPublicRequest(
    request,
    "session_create",
    { publicId: parsedId.data },
    id,
  );
  if (!guard.allowed) return guard.response;
  const { corsOrigin } = guard.context;

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
  const parsedBody = createWidgetSessionRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return errorResponse(
      "INVALID_REQUEST",
      "Kontekst ma nieprawidłowy format.",
      422,
      id,
      corsOrigin,
    );
  }
  const appOrigin = new URL(process.env.APP_URL ?? "http://localhost:3000").origin;

  const { data, error } = await createServiceClient().rpc("create_widget_session", {
    source_kind: corsOrigin && corsOrigin !== appOrigin ? "embedded" : "hosted",
    source_origin: corsOrigin,
    supplied_context: parsedBody.data.context,
    target_public_id: parsedId.data,
  });
  if (error?.code === "23514") {
    return errorResponse(
      "INVALID_REQUEST",
      "Kontekst nie pasuje do tego procesu.",
      422,
      id,
      corsOrigin,
    );
  }
  if (error) return mapDatabaseError(error, "flow", id, corsOrigin);

  const created = createWidgetSessionResponseSchema.safeParse(data);
  if (!created.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się utworzyć sesji.", 503, id, corsOrigin);
  }
  const runtime = manifestWithRuntimeChallenge(created.data.manifest);
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
    { ...created.data, manifest: runtime.manifest },
    { corsOrigin, requestId: id, status: 201 },
  );
}
