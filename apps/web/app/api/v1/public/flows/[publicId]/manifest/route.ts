import { widgetManifestSchema, widgetPublicIdSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
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

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const id = requestId(request);
  const parsedId = widgetPublicIdSchema.safeParse((await context.params).publicId);
  if (!parsedId.success) {
    return errorResponse("FLOW_NOT_FOUND", "Ten proces jest niedostępny.", 404, id);
  }
  const guard = await guardPublicRequest(request, "manifest", { publicId: parsedId.data }, id);
  if (!guard.allowed) return guard.response;
  const { corsOrigin } = guard.context;

  const { data, error } = await createServiceClient().rpc("get_widget_manifest", {
    target_public_id: parsedId.data,
  });
  if (error) return mapDatabaseError(error, "flow", id, corsOrigin);

  const manifest = widgetManifestSchema.safeParse(data);
  if (!manifest.success) {
    return errorResponse(
      "UNAVAILABLE",
      "Manifest procesu jest nieprawidłowy.",
      503,
      id,
      corsOrigin,
    );
  }
  const runtime = manifestWithRuntimeChallenge(manifest.data);
  if (!runtime.ready) {
    return errorResponse(
      "CHALLENGE_UNAVAILABLE",
      "Formularz jest chwilowo niedostępny. Spróbuj ponownie.",
      503,
      id,
      corsOrigin,
    );
  }
  return jsonResponse(runtime.manifest, {
    cacheControl: "public, max-age=60, stale-while-revalidate=300",
    corsOrigin,
    requestId: id,
  });
}
