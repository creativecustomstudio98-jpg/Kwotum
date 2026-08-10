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
  optionsResponse,
  requestId,
} from "../../../../../../../lib/public-api/http";
import { createPublicClient } from "../../../../../../../lib/supabase/public";

export function OPTIONS(): Response {
  return optionsResponse();
}

export async function GET(request: Request): Promise<Response> {
  const id = requestId(request);
  const token = widgetSessionTokenSchema.safeParse(request.headers.get("x-wyceno-session"));
  if (!token.success) {
    return errorResponse("SESSION_NOT_FOUND", "Nie znaleziono sesji.", 404, id);
  }

  const { data, error } = await createPublicClient().rpc("calculate_widget_result", {
    session_token: token.data,
  });
  if (error) return mapDatabaseError(error, "session", id);

  const calculated = widgetCalculatedResultDatabaseSchema.safeParse(data);
  if (!calculated.success) {
    return errorResponse("UNAVAILABLE", "Nie udało się obliczyć wyniku.", 503, id);
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
  return jsonResponse(response, { requestId: id });
}
