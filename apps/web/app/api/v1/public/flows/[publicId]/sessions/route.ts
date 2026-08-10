import { createWidgetSessionResponseSchema, widgetPublicIdSchema } from "@wyceno/validation";

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

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  const id = requestId(request);
  const parsedId = widgetPublicIdSchema.safeParse((await context.params).publicId);
  if (!parsedId.success) {
    return errorResponse("FLOW_NOT_FOUND", "Ten proces jest niedostępny.", 404, id);
  }

  const { data, error } = await createPublicClient().rpc("create_widget_session", {
    target_public_id: parsedId.data,
  });
  if (error) return mapDatabaseError(error, "flow", id);

  const created = createWidgetSessionResponseSchema.safeParse(data);
  if (!created.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się utworzyć sesji.", 503, id);
  }
  return jsonResponse(created.data, { requestId: id, status: 201 });
}
