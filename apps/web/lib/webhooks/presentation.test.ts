import { describe, expect, it } from "vitest";

import type { WebhookDeliverySummary } from "./service";
import { getRecentWebhookDeliveries } from "./presentation";

function delivery(createdAt: string): WebhookDeliverySummary {
  return {
    attemptCount: 1,
    createdAt,
    deliveredAt: createdAt,
    endpointId: "endpoint-1",
    errorCode: null,
    eventId: "event-1",
    id: createdAt,
    isTest: false,
    responseStatus: 200,
    status: "delivered",
  };
}

describe("getRecentWebhookDeliveries", () => {
  it("keeps deliveries from the rolling 24-hour window", () => {
    const referenceTime = Date.parse("2026-08-13T12:00:00.000Z");

    expect(
      getRecentWebhookDeliveries(
        [
          delivery("2026-08-13T11:00:00.000Z"),
          delivery("2026-08-12T12:00:00.000Z"),
          delivery("2026-08-12T11:59:59.999Z"),
        ],
        referenceTime,
      ).map((item) => item.createdAt),
    ).toEqual(["2026-08-13T11:00:00.000Z", "2026-08-12T12:00:00.000Z"]);
  });
});
