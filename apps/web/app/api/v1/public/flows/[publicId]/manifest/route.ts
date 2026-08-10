import { widgetManifestSchema, widgetPublicIdSchema } from "@wyceno/validation";

import {
  errorResponse,
  jsonResponse,
  mapDatabaseError,
  optionsResponse,
  requestId,
} from "../../../../../../../lib/public-api/http";
import { createPublicClient } from "../../../../../../../lib/supabase/public";

type RouteContext = { params: Promise<{ publicId: string }> };

export function OPTIONS(): Response {
  return optionsResponse();
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  const id = requestId(request);
  const parsedId = widgetPublicIdSchema.safeParse((await context.params).publicId);
  if (!parsedId.success) {
    return errorResponse("FLOW_NOT_FOUND", "Ten proces jest niedostępny.", 404, id);
  }

  const { data, error } = await createPublicClient().rpc("get_widget_manifest", {
    target_public_id: parsedId.data,
  });
  if (error) return mapDatabaseError(error, "flow", id);

  const manifest = widgetManifestSchema.safeParse(data);
  if (!manifest.success) {
    return errorResponse("UNAVAILABLE", "Manifest procesu jest nieprawidłowy.", 503, id);
  }
  return jsonResponse(manifest.data, {
    cacheControl: "public, max-age=60, stale-while-revalidate=300",
    requestId: id,
  });
}
