import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const processConfiguredFlowInvitationBatch = vi.hoisted(() => vi.fn());
const finishNotificationWorkerRun = vi.hoisted(() => vi.fn());
const startNotificationWorkerRun = vi.hoisted(() => vi.fn());
const processConfiguredNotificationBatch = vi.hoisted(() => vi.fn());

vi.mock("../../../../../../lib/invitations/worker", () => ({
  processConfiguredFlowInvitationBatch,
}));
vi.mock("../../../../../../lib/notifications/operations", () => ({
  finishNotificationWorkerRun,
  startNotificationWorkerRun,
}));
vi.mock("../../../../../../lib/notifications/worker", () => ({
  processConfiguredNotificationBatch,
}));

import { GET, POST } from "./route";

const originalCronSecret = process.env.CRON_SECRET;
const originalWorkerSecret = process.env.NOTIFICATION_WORKER_SECRET;

describe("notification worker route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-with-at-least-32-characters";
    process.env.NOTIFICATION_WORKER_SECRET = "worker-secret-with-at-least-32-characters";
    processConfiguredNotificationBatch.mockResolvedValue({
      claimed: 2,
      failed: 0,
      retrying: 1,
      sent: 1,
    });
    processConfiguredFlowInvitationBatch.mockResolvedValue({
      claimed: 1,
      failed: 0,
      retrying: 0,
      sent: 1,
    });
    startNotificationWorkerRun.mockResolvedValue(undefined);
    finishNotificationWorkerRun.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalCronSecret;
    if (originalWorkerSecret === undefined) delete process.env.NOTIFICATION_WORKER_SECRET;
    else process.env.NOTIFICATION_WORKER_SECRET = originalWorkerSecret;
  });

  it("rejects incorrect cron and worker secrets without queue details", async () => {
    for (const request of [
      new Request("https://app.kwotum.test/api/v1/internal/notifications/process", {
        headers: { authorization: `Bearer ${"x".repeat(32)}` },
      }),
      new Request("https://app.kwotum.test/api/v1/internal/notifications/process", {
        headers: { authorization: `Bearer ${"y".repeat(32)}` },
        method: "POST",
      }),
    ]) {
      const response = request.method === "POST" ? await POST(request) : await GET(request);
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(await response.json()).toEqual({
        error: { code: "UNAUTHORIZED", message: "Brak dostępu do workera." },
      });
    }
    expect(startNotificationWorkerRun).not.toHaveBeenCalled();
  });

  it("runs Vercel cron through GET with an isolated heartbeat source", async () => {
    const response = await GET(
      new Request("https://app.kwotum.test/api/v1/internal/notifications/process", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ claimed: 3, failed: 0, retrying: 1, sent: 2 });
    expect(startNotificationWorkerRun).toHaveBeenCalledWith(expect.any(String), "cron");
    expect(finishNotificationWorkerRun).toHaveBeenCalledWith(expect.any(String), "cron", {
      claimed: 3,
      failed: 0,
      retrying: 1,
      sent: 2,
    });
  });

  it("preserves manual POST with the existing worker secret", async () => {
    const response = await POST(
      new Request("https://app.kwotum.test/api/v1/internal/notifications/process", {
        headers: { authorization: `Bearer ${process.env.NOTIFICATION_WORKER_SECRET}` },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(startNotificationWorkerRun).toHaveBeenCalledWith(expect.any(String), "manual");
  });

  it("records a failed heartbeat and returns a generic 503", async () => {
    processConfiguredNotificationBatch.mockRejectedValue(new Error("private recipient detail"));

    const response = await GET(
      new Request("https://app.kwotum.test/api/v1/internal/notifications/process", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    );

    expect(response.status).toBe(503);
    expect(finishNotificationWorkerRun).toHaveBeenCalledWith(expect.any(String), "cron", null);
    expect(JSON.stringify(await response.json())).not.toContain("private recipient detail");
  });
});
