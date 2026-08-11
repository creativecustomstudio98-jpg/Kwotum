import { readNotificationDeliveryHealth } from "../../../../../../lib/notifications/operations";
import { matchesBearerSecret } from "../../../../../../lib/security/bearer-secret";

export const runtime = "nodejs";
export const maxDuration = 15;

const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request): Promise<Response> {
  if (!matchesBearerSecret(request, process.env.MONITORING_PROBE_SECRET)) {
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Brak dostępu do monitoringu." } },
      { headers: privateNoStoreHeaders, status: 401 },
    );
  }

  try {
    const health = await readNotificationDeliveryHealth();
    return Response.json(health, {
      headers: privateNoStoreHeaders,
      status: health.status === "ok" ? 200 : 503,
    });
  } catch {
    return Response.json(
      { service: "notification-delivery", status: "unavailable" },
      { headers: privateNoStoreHeaders, status: 503 },
    );
  }
}
