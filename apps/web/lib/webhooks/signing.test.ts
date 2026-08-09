import { describe, expect, it } from "vitest";

import { deriveWebhookEndpointSecret, signWebhookBody, verifyWebhookSignature } from "./signing";

describe("webhook signing", () => {
  const masterSecret = "master-signing-secret-with-at-least-32-characters";

  it("derives stable endpoint-scoped and versioned secrets without storing plaintext", () => {
    const first = deriveWebhookEndpointSecret({
      endpointId: "10000000-0000-4000-8000-000000000001",
      masterSecret,
      organizationId: "20000000-0000-4000-8000-000000000001",
      secretVersion: 1,
    });
    expect(first).toMatch(/^whsec_[A-Za-z0-9_-]{43}$/);
    expect(
      deriveWebhookEndpointSecret({
        endpointId: "10000000-0000-4000-8000-000000000001",
        masterSecret,
        organizationId: "20000000-0000-4000-8000-000000000001",
        secretVersion: 1,
      }),
    ).toBe(first);
    expect(
      deriveWebhookEndpointSecret({
        endpointId: "10000000-0000-4000-8000-000000000001",
        masterSecret,
        organizationId: "20000000-0000-4000-8000-000000000001",
        secretVersion: 2,
      }),
    ).not.toBe(first);
  });

  it("signs timestamp plus raw body and enforces the replay window", () => {
    const secret = deriveWebhookEndpointSecret({
      endpointId: "10000000-0000-4000-8000-000000000001",
      masterSecret,
      organizationId: "20000000-0000-4000-8000-000000000001",
      secretVersion: 1,
    });
    const rawBody = '{"version":"2026-08-09"}';
    const signature = signWebhookBody({ rawBody, secret, timestamp: 1_800_000_000 });
    expect(signature).toMatch(/^v1=[a-f0-9]{64}$/);
    expect(
      verifyWebhookSignature({
        now: 1_800_000_299,
        rawBody,
        secret,
        signature,
        timestamp: 1_800_000_000,
      }),
    ).toBe(true);
    expect(
      verifyWebhookSignature({
        now: 1_800_000_301,
        rawBody,
        secret,
        signature,
        timestamp: 1_800_000_000,
      }),
    ).toBe(false);
    expect(
      verifyWebhookSignature({
        now: 1_800_000_001,
        rawBody: `${rawBody} `,
        secret,
        signature,
        timestamp: 1_800_000_000,
      }),
    ).toBe(false);
  });

  it("rejects short master secrets and malformed versions", () => {
    expect(() =>
      deriveWebhookEndpointSecret({
        endpointId: "endpoint",
        masterSecret: "short",
        organizationId: "organization",
        secretVersion: 1,
      }),
    ).toThrow();
    expect(() =>
      deriveWebhookEndpointSecret({
        endpointId: "endpoint",
        masterSecret,
        organizationId: "organization",
        secretVersion: 0,
      }),
    ).toThrow();
  });
});
