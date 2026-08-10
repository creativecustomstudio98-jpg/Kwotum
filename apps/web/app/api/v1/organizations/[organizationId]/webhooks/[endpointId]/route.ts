import { z } from "zod";

import { disableWebhookEndpoint } from "../../../../../../../lib/webhooks/service";
import {
  mapWebhookError,
  webhookError,
  webhookRequestId,
} from "../../../../../../../lib/webhooks/http";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ endpointId: string; organizationId: string }> },
): Promise<Response> {
  const requestId = webhookRequestId(request);
  const resolved = await params;
  const organizationId = z.uuid().safeParse(resolved.organizationId);
  const endpointId = z.uuid().safeParse(resolved.endpointId);
  if (!organizationId.success || !endpointId.success) {
    return webhookError("NOT_FOUND", "Nie znaleziono zasobu.", 404, requestId);
  }
  try {
    await disableWebhookEndpoint(organizationId.data, endpointId.data);
    return new Response(null, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
      },
      status: 204,
    });
  } catch (error) {
    return mapWebhookError(error, requestId);
  }
}
