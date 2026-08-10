import {
  formatMinorAmount,
  widgetCalculatedResultDatabaseSchema,
  widgetCalculatedResultSchema,
  widgetSessionTokenSchema,
} from "@wyceno/validation";

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

export async function OPTIONS(request: Request): Promise<Response> {
  return guardPublicOptions(request);
}

export async function GET(request: Request): Promise<Response> {
  const id = requestId(request);
  const rawToken = request.headers.get("x-wyceno-session");
  const guard = await guardPublicRequest(
    request,
    "result",
    { sessionToken: rawToken ?? undefined },
    id,
  );
  if (!guard.allowed) return guard.response;
  const { corsOrigin } = guard.context;
  const token = widgetSessionTokenSchema.safeParse(rawToken);
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id, corsOrigin);
  }

  const { data, error } = await createServiceClient().rpc("calculate_widget_result", {
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id, corsOrigin);

  const calculated = widgetCalculatedResultDatabaseSchema.safeParse(data);
  if (!calculated.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się obliczyć wyniku.", 503, id, corsOrigin);
  }
  const pricing = calculated.data.pricing;
  const response = widgetCalculatedResultSchema.parse({
    ...calculated.data,
    pricing: pricing
      ? {
          ...pricing,
          formattedMax: formatMinorAmount(pricing.maxMinor, pricing.currency),
          formattedMin: formatMinorAmount(pricing.minMinor, pricing.currency),
        }
      : null,
  });
  return jsonResponse(response, { corsOrigin, requestId: id });
}
