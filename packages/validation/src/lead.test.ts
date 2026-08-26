import { describe, expect, it } from "vitest";

import { leadContactSchema, submitWidgetLeadRequestSchema } from "./lead";

describe("lead contact", () => {
  it("accepts an e-mail or a phone and rejects a contact without either", () => {
    expect(leadContactSchema.safeParse({ email: "KLIENT@EXAMPLE.TEST" }).success).toBe(true);
    expect(leadContactSchema.safeParse({ phone: "+48 500 600 700" }).success).toBe(true);
    expect(leadContactSchema.safeParse({ name: "Jan Kowalski" }).success).toBe(false);
  });

  it("rejects e-mail marketing consent for a phone-only contact", () => {
    expect(
      submitWidgetLeadRequestSchema.safeParse({
        challengeToken: "test-challenge-token",
        contact: { phone: "+48 500 600 700" },
        fileIds: [],
        marketingEmailConsent: {
          accepted: true,
          textHash: "a".repeat(64),
          version: "marketing-v1",
        },
        mutationId: "90000000-0000-4000-8000-000000000001",
        privacyNotice: {
          accepted: true,
          textHash: "b".repeat(64),
          version: "privacy-v1",
        },
      }).success,
    ).toBe(false);
  });

  it("accepts only a preferred channel that was actually provided", () => {
    expect(
      leadContactSchema.safeParse({
        email: "klient@example.test",
        phone: "+48 500 600 700",
        preferredContactChannel: "phone",
        preferredContactWindow: "afternoon",
      }).success,
    ).toBe(true);
    expect(
      leadContactSchema.safeParse({
        email: "klient@example.test",
        preferredContactChannel: "phone",
      }).success,
    ).toBe(false);
  });

  it("requires a bounded challenge token for every submit", () => {
    const valid = {
      challengeToken: "test-challenge-token",
      contact: { email: "client@example.test" },
      fileIds: [],
      marketingEmailConsent: null,
      mutationId: "90000000-0000-4000-8000-000000000001",
      privacyNotice: {
        accepted: true as const,
        textHash: "b".repeat(64),
        version: "privacy-v1",
      },
    };
    expect(submitWidgetLeadRequestSchema.safeParse(valid).success).toBe(true);
    const withoutChallenge = {
      contact: valid.contact,
      fileIds: valid.fileIds,
      marketingEmailConsent: valid.marketingEmailConsent,
      mutationId: valid.mutationId,
      privacyNotice: valid.privacyNotice,
    };
    expect(submitWidgetLeadRequestSchema.safeParse(withoutChallenge).success).toBe(false);
    expect(
      submitWidgetLeadRequestSchema.safeParse({ ...valid, challengeToken: "x".repeat(2049) })
        .success,
    ).toBe(false);
  });
});
