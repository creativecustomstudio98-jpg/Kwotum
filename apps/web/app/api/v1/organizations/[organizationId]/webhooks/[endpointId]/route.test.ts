import { beforeEach, describe, expect, it, vi } from "vitest";

const { disableWebhookEndpoint, enqueueWebhookTest, rotateWebhookEndpointSecret } = vi.hoisted(
  () => ({
    disableWebhookEndpoint: vi.fn(),
    enqueueWebhookTest: vi.fn(),
    rotateWebhookEndpointSecret: vi.fn(),
  }),
);

vi.mock("../../../../../../../lib/webhooks/service", () => ({
  disableWebhookEndpoint,
  enqueueWebhookTest,
  rotateWebhookEndpointSecret,
}));

import { DELETE } from "./route";
import { POST as POST_ROTATE } from "./rotate/route";
import { POST as POST_TEST } from "./test/route";

const endpointId = "20000000-0000-4000-8000-000000000001";
const organizationId = "10000000-0000-4000-8000-000000000001";
const idempotencyKey = "30000000-0000-4000-8000-000000000001";
const params = Promise.resolve({ endpointId, organizationId });

describe("tenant webhook endpoint routes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns not found and performs no mutation for malformed resource ids", async () => {
    const response = await DELETE(
      new Request("https://app.kwotum.pl/webhook", { method: "DELETE" }),
      {
        params: Promise.resolve({ endpointId: "invalid", organizationId }),
      },
    );
    expect(response.status).toBe(404);
    expect(disableWebhookEndpoint).not.toHaveBeenCalled();
  });

  it("disables only the validated endpoint in the validated tenant", async () => {
    disableWebhookEndpoint.mockResolvedValue(undefined);
    const response = await DELETE(
      new Request("https://app.kwotum.pl/webhook", { method: "DELETE" }),
      {
        params,
      },
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(disableWebhookEndpoint).toHaveBeenCalledWith(organizationId, endpointId);
  });

  it("requires idempotency keys for rotation and synthetic delivery", async () => {
    for (const handler of [POST_ROTATE, POST_TEST]) {
      const response = await handler(
        new Request("https://app.kwotum.pl/webhook", { method: "POST" }),
        {
          params,
        },
      );
      expect(response.status).toBe(422);
    }
    expect(rotateWebhookEndpointSecret).not.toHaveBeenCalled();
    expect(enqueueWebhookTest).not.toHaveBeenCalled();
  });

  it("dispatches secret rotation and a synthetic test with tenant scope", async () => {
    rotateWebhookEndpointSecret.mockResolvedValue({
      rotatedAt: "2026-08-09T12:00:00+00:00",
      secret: "whsec_new",
      secretVersion: 2,
    });
    enqueueWebhookTest.mockResolvedValue({ deliveryId: endpointId, status: "pending" });
    const request = () =>
      new Request("https://app.kwotum.pl/webhook", {
        headers: { "idempotency-key": idempotencyKey },
        method: "POST",
      });

    const rotation = await POST_ROTATE(request(), { params });
    const test = await POST_TEST(request(), { params });

    expect(rotation.status).toBe(200);
    expect(test.status).toBe(202);
    expect(rotateWebhookEndpointSecret).toHaveBeenCalledWith(
      organizationId,
      endpointId,
      idempotencyKey,
    );
    expect(enqueueWebhookTest).toHaveBeenCalledWith(organizationId, endpointId, idempotencyKey);
  });
});
