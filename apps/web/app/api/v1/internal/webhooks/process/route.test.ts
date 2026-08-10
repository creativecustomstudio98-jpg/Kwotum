import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const processConfiguredWebhookBatch = vi.hoisted(() => vi.fn());

vi.mock("../../../../../../lib/webhooks/worker", () => ({
  processConfiguredWebhookBatch,
}));

import { POST } from "./route";

const originalSecret = process.env.WEBHOOK_WORKER_SECRET;

describe("webhook worker route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_WORKER_SECRET = "worker-secret-with-at-least-32-characters";
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.WEBHOOK_WORKER_SECRET;
    else process.env.WEBHOOK_WORKER_SECRET = originalSecret;
  });

  it("rejects missing and incorrect bearer secrets without queue details", async () => {
    for (const authorization of [undefined, "Bearer incorrect"]) {
      const url = "https://app.kwotum.test/api/v1/internal/webhooks/process";
      const request = authorization
        ? new Request(url, { headers: { authorization }, method: "POST" })
        : new Request(url, { method: "POST" });
      const response = await POST(request);
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(await response.json()).toEqual({
        error: { code: "UNAUTHORIZED", message: "Brak dostępu do workera." },
      });
    }
    expect(processConfiguredWebhookBatch).not.toHaveBeenCalled();
  });

  it("returns only aggregate counters for an authorized batch", async () => {
    processConfiguredWebhookBatch.mockResolvedValue({
      claimed: 3,
      deadLettered: 1,
      delivered: 1,
      retrying: 1,
    });
    const response = await POST(
      new Request("https://app.kwotum.test/api/v1/internal/webhooks/process", {
        headers: { authorization: `Bearer ${process.env.WEBHOOK_WORKER_SECRET}` },
        method: "POST",
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      claimed: 3,
      deadLettered: 1,
      delivered: 1,
      retrying: 1,
    });
  });

  it("maps worker failure to a generic 503 without endpoint or payload data", async () => {
    processConfiguredWebhookBatch.mockRejectedValue(new Error("private endpoint detail"));
    const response = await POST(
      new Request("https://app.kwotum.test/api/v1/internal/webhooks/process", {
        headers: { authorization: `Bearer ${process.env.WEBHOOK_WORKER_SECRET}` },
        method: "POST",
      }),
    );
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("private endpoint detail");
  });
});
