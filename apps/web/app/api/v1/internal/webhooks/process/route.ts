import { createHash, timingSafeEqual } from "node:crypto";

import { processConfiguredWebhookBatch } from "../../../../../../lib/webhooks/worker";

export const runtime = "nodejs";
export const maxDuration = 60;

const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

function authorized(request: Request): boolean {
  const configured = process.env.WEBHOOK_WORKER_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || configured.length < 32 || !supplied) return false;
  return timingSafeEqual(
    createHash("sha256").update(configured).digest(),
    createHash("sha256").update(supplied).digest(),
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Brak dostępu do workera." } },
      { headers: privateNoStoreHeaders, status: 401 },
    );
  }
  try {
    const result = await processConfiguredWebhookBatch();
    return Response.json(result, { headers: privateNoStoreHeaders });
  } catch {
    return Response.json(
      {
        error: {
          code: "WEBHOOK_PROCESSING_FAILED",
          message: "Nie udało się przetworzyć kolejki webhooków.",
        },
      },
      { headers: privateNoStoreHeaders, status: 503 },
    );
  }
}
