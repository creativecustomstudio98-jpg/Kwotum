import { createHash, timingSafeEqual } from "node:crypto";

import { processConfiguredFlowInvitationBatch } from "../../../../../../lib/invitations/worker";
import { processConfiguredNotificationBatch } from "../../../../../../lib/notifications/worker";

export const runtime = "nodejs";

const privateNoStoreHeaders = { "Cache-Control": "private, no-store" };

function authorized(request: Request): boolean {
  const configured = process.env.NOTIFICATION_WORKER_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || configured.length < 32 || !supplied) return false;
  const expectedHash = createHash("sha256").update(configured).digest();
  const suppliedHash = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(expectedHash, suppliedHash);
}

export async function POST(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Brak dostępu do workera." } },
      { headers: privateNoStoreHeaders, status: 401 },
    );
  }
  try {
    const [notifications, invitations] = await Promise.all([
      processConfiguredNotificationBatch(),
      processConfiguredFlowInvitationBatch(),
    ]);
    return Response.json(
      {
        claimed: notifications.claimed + invitations.claimed,
        failed: notifications.failed + invitations.failed,
        retrying: notifications.retrying + invitations.retrying,
        sent: notifications.sent + invitations.sent,
      },
      {
        headers: privateNoStoreHeaders,
      },
    );
  } catch {
    return Response.json(
      {
        error: {
          code: "NOTIFICATION_PROCESSING_FAILED",
          message: "Nie udało się przetworzyć kolejki.",
        },
      },
      { headers: privateNoStoreHeaders, status: 503 },
    );
  }
}
