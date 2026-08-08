import { describe, expect, it, vi } from "vitest";

import { ResendEmailDeliveryAdapter, TestEmailDeliveryAdapter } from "./delivery";
import { renderNotificationEmail } from "./templates";

const message = renderNotificationEmail({
  appUrl: "https://app.wyceno.test",
  companyName: "Studio Mebli",
  contactEmail: "klient@example.test",
  contactName: null,
  flowTitle: "Kuchnia",
  kind: "lead_customer_confirmation",
  leadId: "e0000000-0000-4000-8000-000000000001",
  organizationId: "a0000000-0000-4000-8000-000000000001",
  price: null,
  score: null,
});

const request = {
  from: "Kwotum <powiadomienia@example.test>",
  idempotencyKey: "notification/e0000000-0000-4000-8000-000000000001",
  message,
  notificationId: "e0000000-0000-4000-8000-000000000001",
  to: "klient@example.test",
};

describe("email delivery adapters", () => {
  it("delivers deterministically without network in test mode", async () => {
    await expect(new TestEmailDeliveryAdapter().deliver(request)).resolves.toEqual({
      messageId: `test_${request.notificationId}`,
      outcome: "sent",
    });
  });

  it("uses a stable provider idempotency key and accepts a valid response", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      expect(init?.headers).toEqual(
        expect.objectContaining({ "Idempotency-Key": request.idempotencyKey }),
      );
      return Response.json({ id: "provider-message-id" });
    });
    const adapter = new ResendEmailDeliveryAdapter({ apiKey: "secret", fetch: fetchMock });

    await expect(adapter.deliver(request)).resolves.toEqual({
      messageId: "provider-message-id",
      outcome: "sent",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    [429, "provider_429", true],
    [503, "provider_5xx", true],
    [422, "provider_4xx", false],
  ] as const)(
    "classifies HTTP %s without retaining provider content",
    async (status, code, retryable) => {
      const adapter = new ResendEmailDeliveryAdapter({
        apiKey: "secret",
        fetch: vi.fn(async () => new Response("contains-recipient@example.test", { status })),
      });

      await expect(adapter.deliver(request)).resolves.toEqual({
        errorCode: code,
        outcome: "failed",
        retryable,
      });
    },
  );
});
