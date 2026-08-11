import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const readNotificationDeliveryHealth = vi.hoisted(() => vi.fn());

vi.mock("../../../../../../lib/notifications/operations", () => ({
  readNotificationDeliveryHealth,
}));

import { GET } from "./route";

const originalSecret = process.env.MONITORING_PROBE_SECRET;

describe("notification health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MONITORING_PROBE_SECRET = "monitor-secret-with-at-least-32-characters";
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.MONITORING_PROBE_SECRET;
    else process.env.MONITORING_PROBE_SECRET = originalSecret;
  });

  it("does not reveal queue state without the monitoring secret", async () => {
    const response = await GET(
      new Request("https://app.kwotum.test/api/v1/internal/notifications/health"),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { code: "UNAUTHORIZED", message: "Brak dostępu do monitoringu." },
    });
    expect(readNotificationDeliveryHealth).not.toHaveBeenCalled();
  });

  it("returns aggregate health without PII", async () => {
    readNotificationDeliveryHealth.mockResolvedValue({
      issues: [],
      observedAt: "2026-08-11T09:00:30.000Z",
      queues: {
        invitations: {
          failed: 0,
          oldestWaitingAgeSeconds: null,
          processing: 0,
          staleProcessing: 0,
          waiting: 0,
        },
        notifications: {
          failed: 0,
          oldestWaitingAgeSeconds: 20,
          processing: 0,
          staleProcessing: 0,
          waiting: 1,
        },
      },
      scheduler: {
        ageSeconds: 30,
        lastFailedAt: null,
        lastOutcome: "succeeded",
        lastStartedAt: "2026-08-11T09:00:00.000Z",
        lastSucceededAt: "2026-08-11T09:00:01.000Z",
      },
      status: "ok",
    });
    const response = await GET(
      new Request("https://app.kwotum.test/api/v1/internal/notifications/health", {
        headers: { authorization: `Bearer ${process.env.MONITORING_PROBE_SECRET}` },
      }),
    );
    expect(response.status).toBe(200);
    expect(JSON.stringify(await response.json())).not.toContain("@");
  });

  it("maps a detected queue incident and a probe failure to 503", async () => {
    readNotificationDeliveryHealth.mockResolvedValueOnce({
      issues: ["scheduler_stale"],
      status: "unavailable",
    });
    const request = () =>
      new Request("https://app.kwotum.test/api/v1/internal/notifications/health", {
        headers: { authorization: `Bearer ${process.env.MONITORING_PROBE_SECRET}` },
      });
    expect((await GET(request())).status).toBe(503);

    readNotificationDeliveryHealth.mockRejectedValueOnce(new Error("private database detail"));
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      service: "notification-delivery",
      status: "unavailable",
    });
  });
});
