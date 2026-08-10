import { createHash, timingSafeEqual } from "node:crypto";

import { processConfiguredRetentionBatch } from "../../../../../../lib/privacy/retention";

export const runtime = "nodejs";

const privateNoStoreHeaders = { "Cache-Control": "private, no-store" };

function authorized(request: Request): boolean {
  const configured = process.env.RETENTION_WORKER_SECRET;
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
    return Response.json(await processConfiguredRetentionBatch(), {
      headers: privateNoStoreHeaders,
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "RETENTION_PROCESSING_FAILED",
          message: "Nie udało się przetworzyć retencji.",
        },
      },
      { headers: privateNoStoreHeaders, status: 503 },
    );
  }
}
