import { describe, expect, it } from "vitest";

import {
  analyticsConsentRequestSchema,
  analyticsEventRequestSchema,
  analyticsEventSchemaVersion,
} from "./contracts";

const event = {
  device: "mobile",
  eventId: "a0000000-0000-4000-8000-000000000001",
  name: "step_viewed",
  occurredAt: "2026-07-25T12:00:00.000Z",
  schemaVersion: analyticsEventSchemaVersion,
  source: "direct",
  stepKey: "service",
};

describe("analytics contracts", () => {
  it("accepts the closed PII-free v1 event", () => {
    expect(analyticsEventRequestSchema.parse(event)).toEqual(event);
  });

  it("rejects arbitrary metadata, invalid step scope and old consent", () => {
    expect(
      analyticsEventRequestSchema.safeParse({ ...event, email: "person@example.test" }).success,
    ).toBe(false);
    expect(analyticsEventRequestSchema.safeParse({ ...event, stepKey: null }).success).toBe(false);
    expect(
      analyticsConsentRequestSchema.safeParse({
        consentVersion: "analytics-v0",
        granted: true,
        mutationId: event.eventId,
      }).success,
    ).toBe(false);
  });
});
