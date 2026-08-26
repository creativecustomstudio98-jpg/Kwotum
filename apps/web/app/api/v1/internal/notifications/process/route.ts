import { processConfiguredFlowInvitationBatch } from "../../../../../../lib/invitations/worker";
import {
  finishNotificationWorkerRun,
  startNotificationWorkerRun,
  type NotificationWorkerSource,
} from "../../../../../../lib/notifications/operations";
import { processConfiguredNotificationBatch } from "../../../../../../lib/notifications/worker";
import { matchesBearerSecret } from "../../../../../../lib/security/bearer-secret";

export const runtime = "nodejs";
export const maxDuration = 60;

const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

async function processQueues(
  request: Request,
  source: NotificationWorkerSource,
  secret: string | undefined,
): Promise<Response> {
  if (!matchesBearerSecret(request, secret)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Brak dostępu do workera." } },
      { headers: privateNoStoreHeaders, status: 401 },
    );
  }
  const runId = crypto.randomUUID();
  let heartbeatStarted = false;
  try {
    await startNotificationWorkerRun(runId, source);
    heartbeatStarted = true;
    const [notifications, invitations] = await Promise.all([
      processConfiguredNotificationBatch(),
      processConfiguredFlowInvitationBatch(),
    ]);
    const result = {
      claimed: notifications.claimed + invitations.claimed,
      failed: notifications.failed + invitations.failed,
      retrying: notifications.retrying + invitations.retrying,
      sent: notifications.sent + invitations.sent,
    };
    await finishNotificationWorkerRun(runId, source, result);
    return Response.json(result, { headers: privateNoStoreHeaders });
  } catch {
    if (heartbeatStarted) {
      await finishNotificationWorkerRun(runId, source, null).catch(() => undefined);
    }
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

export function GET(request: Request): Promise<Response> {
  return processQueues(request, "cron", process.env.CRON_SECRET);
}

export function POST(request: Request): Promise<Response> {
  return processQueues(request, "manual", process.env.NOTIFICATION_WORKER_SECRET);
}
