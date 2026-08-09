import { z } from "zod";

import { rotateWebhookEndpointSecret } from "../../../../../../../../lib/webhooks/service";
import {
  mapWebhookError,
  webhookError,
  webhookJson,
  webhookRequestId,
} from "../../../../../../../../lib/webhooks/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ endpointId: string; organizationId: string }> },
): Promise<Response> {
  const requestId = webhookRequestId(request);
  const resolved = await params;
  const organizationId = z.uuid().safeParse(resolved.organizationId);
  const endpointId = z.uuid().safeParse(resolved.endpointId);
  const idempotencyKey = z.uuid().safeParse(request.headers.get("idempotency-key"));
  if (!organizationId.success || !endpointId.success || !idempotencyKey.success) {
    return webhookError("INVALID_REQUEST", "Dane rotacji są nieprawidłowe.", 422, requestId);
  }
  try {
    return webhookJson(
      await rotateWebhookEndpointSecret(organizationId.data, endpointId.data, idempotencyKey.data),
      200,
      requestId,
    );
  } catch (error) {
    return mapWebhookError(error, requestId);
  }
}
