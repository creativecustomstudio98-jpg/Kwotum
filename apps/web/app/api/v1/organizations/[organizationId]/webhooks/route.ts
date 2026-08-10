import { z } from "zod";

import {
  createWebhookEndpoint,
  getWebhookIntegration,
} from "../../../../../../lib/webhooks/service";
import {
  mapWebhookError,
  readWebhookJson,
  webhookError,
  webhookJson,
  webhookRequestId,
} from "../../../../../../lib/webhooks/http";

export const runtime = "nodejs";

const createSchema = z.object({ url: z.string().trim().min(1).max(2048) }).strict();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
): Promise<Response> {
  const requestId = webhookRequestId(request);
  const organizationId = z.uuid().safeParse((await params).organizationId);
  if (!organizationId.success) {
    return webhookError("NOT_FOUND", "Nie znaleziono zasobu.", 404, requestId);
  }
  try {
    return webhookJson(await getWebhookIntegration(organizationId.data), 200, requestId);
  } catch (error) {
    return mapWebhookError(error, requestId);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
): Promise<Response> {
  const requestId = webhookRequestId(request);
  const organizationId = z.uuid().safeParse((await params).organizationId);
  const idempotencyKey = z.uuid().safeParse(request.headers.get("idempotency-key"));
  let body: z.infer<typeof createSchema> | null = null;
  try {
    const parsed = createSchema.safeParse(await readWebhookJson(request));
    if (parsed.success) body = parsed.data;
  } catch {
    body = null;
  }
  if (!organizationId.success || !idempotencyKey.success || body === null) {
    return webhookError("INVALID_REQUEST", "Dane endpointu są nieprawidłowe.", 422, requestId);
  }
  try {
    return webhookJson(
      await createWebhookEndpoint(organizationId.data, body.url, idempotencyKey.data),
      201,
      requestId,
    );
  } catch (error) {
    return mapWebhookError(error, requestId);
  }
}
