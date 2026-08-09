import { beforeEach, describe, expect, it, vi } from "vitest";

const { createWebhookEndpoint, getWebhookIntegration } = vi.hoisted(() => ({
  createWebhookEndpoint: vi.fn(),
  getWebhookIntegration: vi.fn(),
}));

vi.mock("../../../../../../lib/webhooks/service", () => ({
  createWebhookEndpoint,
  getWebhookIntegration,
}));

import { GET, POST } from "./route";

const organizationId = "10000000-0000-4000-8000-000000000001";
const requestId = "request_12345678";

describe("tenant webhook collection route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects malformed tenant ids, bodies and missing idempotency keys before the service", async () => {
    const invalidGet = await GET(new Request("https://app.kwotum.pl/webhooks"), {
      params: Promise.resolve({ organizationId: "invalid" }),
    });
    expect(invalidGet.status).toBe(404);

    const invalidPost = await POST(
      new Request("https://app.kwotum.pl/webhooks", {
        body: JSON.stringify({ url: "https://hooks.partner.pl/kwotum", extra: true }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ organizationId }) },
    );
    expect(invalidPost.status).toBe(422);
    expect(createWebhookEndpoint).not.toHaveBeenCalled();
    expect(getWebhookIntegration).not.toHaveBeenCalled();
  });

  it("returns a no-store tenant projection without changing the service result", async () => {
    const projection = {
      deliveries: [],
      endpoints: [],
      organizationName: "Firma Testowa",
    };
    getWebhookIntegration.mockResolvedValue(projection);
    const response = await GET(
      new Request("https://app.kwotum.pl/webhooks", {
        headers: { "x-request-id": requestId },
      }),
      { params: Promise.resolve({ organizationId }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("x-request-id")).toBe(requestId);
    expect(await response.json()).toEqual(projection);
    expect(getWebhookIntegration).toHaveBeenCalledWith(organizationId);
  });

  it("passes a validated URL and idempotency key to endpoint creation", async () => {
    const idempotencyKey = "20000000-0000-4000-8000-000000000001";
    createWebhookEndpoint.mockResolvedValue({ endpoint: { id: idempotencyKey }, secret: "whsec" });
    const response = await POST(
      new Request("https://app.kwotum.pl/webhooks", {
        body: JSON.stringify({ url: "https://hooks.partner.pl/kwotum" }),
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        method: "POST",
      }),
      { params: Promise.resolve({ organizationId }) },
    );
    expect(response.status).toBe(201);
    expect(createWebhookEndpoint).toHaveBeenCalledWith(
      organizationId,
      "https://hooks.partner.pl/kwotum",
      idempotencyKey,
    );
  });

  it("rejects oversized JSON without exposing parser details", async () => {
    const response = await POST(
      new Request("https://app.kwotum.pl/webhooks", {
        body: JSON.stringify({ url: `https://hooks.partner.pl/${"a".repeat(5_000)}` }),
        headers: {
          "content-type": "application/json",
          "idempotency-key": "20000000-0000-4000-8000-000000000001",
        },
        method: "POST",
      }),
      { params: Promise.resolve({ organizationId }) },
    );
    expect(response.status).toBe(422);
    expect(JSON.stringify(await response.json())).not.toContain("PAYLOAD_TOO_LARGE");
  });

  it("requires JSON media type before reading a creation body", async () => {
    const response = await POST(
      new Request("https://app.kwotum.pl/webhooks", {
        body: JSON.stringify({ url: "https://hooks.partner.pl/kwotum" }),
        headers: { "idempotency-key": "20000000-0000-4000-8000-000000000001" },
        method: "POST",
      }),
      { params: Promise.resolve({ organizationId }) },
    );
    expect(response.status).toBe(422);
    expect(createWebhookEndpoint).not.toHaveBeenCalled();
  });
});
