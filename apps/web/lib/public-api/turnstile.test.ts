import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { manifestWithRuntimeChallenge, verifyTurnstile } from "./turnstile";

const originalEnvironment = {
  APP_URL: process.env.APP_URL,
  DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  VERCEL_ENV: process.env.VERCEL_ENV,
};

const manifest = {
  challenge: null,
  entryStepKey: "service",
  intro: "Odpowiedz na kilka pytań.",
  leadCapture: null,
  manifestVersion: 1 as const,
  publicId: "f0000000-0000-4000-8000-000000000001",
  publishedAt: "2026-08-10T10:00:00.000+00:00",
  result: {
    disclaimer: "To nie jest oferta.",
    headline: "Gotowe",
    mode: "consultation" as const,
    nextStepLabel: "Wyślij zapytanie",
  },
  rules: [],
  snapshotHash: "a".repeat(64),
  steps: [
    {
      allowUnknown: false,
      description: null,
      key: "service",
      nextStepKey: null,
      options: [],
      required: true,
      title: "Jakiej usługi potrzebujesz?",
      type: "short_text" as const,
      validation: null,
    },
  ],
  title: "Testowy proces",
};

function providerResponse(overrides: Record<string, unknown> = {}): Response {
  return Response.json({
    action: "kwotum_lead_submit",
    challenge_ts: new Date().toISOString(),
    hostname: "fortez-przyczepy.pl",
    success: true,
    ...overrides,
  });
}

beforeEach(() => {
  process.env.APP_URL = "https://app.kwotum.pl";
  process.env.DEPLOYMENT_ENV = "production";
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
  process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
});

afterEach(() => {
  vi.restoreAllMocks();
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("Turnstile runtime", () => {
  it("adds only the public challenge contract to a runtime manifest", () => {
    const runtime = manifestWithRuntimeChallenge(manifest);
    expect(runtime.ready).toBe(true);
    if (!runtime.ready) return;
    expect(runtime.manifest.challenge).toEqual({
      action: "kwotum_lead_submit",
      appearance: "interaction-only",
      provider: "turnstile",
      siteKey: "1x00000000000000000000AA",
    });
    expect(JSON.stringify(runtime.manifest)).not.toContain(process.env.TURNSTILE_SECRET_KEY);
  });

  it("allows an explicit local-only bypass but fails closed elsewhere", () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.DEPLOYMENT_ENV = "local";
    const local = manifestWithRuntimeChallenge(manifest);
    expect(local).toMatchObject({ ready: true, manifest: { challenge: null } });

    process.env.DEPLOYMENT_ENV = "preview";
    expect(manifestWithRuntimeChallenge(manifest)).toEqual({ ready: false });
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "1x00000000000000000000AA";
    expect(manifestWithRuntimeChallenge(manifest)).toEqual({ ready: false });
  });

  it("verifies the action, hostname, freshness and trusted client address", async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => providerResponse());
    await expect(
      verifyTurnstile(
        {
          clientAddress: "203.0.113.9",
          corsOrigin: "https://fortez-przyczepy.pl",
          idempotencyKey: "90000000-0000-4000-8000-000000000001",
          token: "single-use-token",
        },
        fetchImplementation,
      ),
    ).resolves.toEqual({ status: "verified" });
    const body = fetchImplementation.mock.calls[0]?.[1]?.body;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect(String(body)).toContain("remoteip=203.0.113.9");
    expect(String(body)).toContain("idempotency_key=90000000-0000-4000-8000-000000000001");
  });

  it.each([
    [{ action: "other_action" }, "action"],
    [{ hostname: "attacker.example" }, "hostname"],
    [{ challenge_ts: new Date(Date.now() - 301_000).toISOString() }, "expired"],
    [{ success: false, "error-codes": ["timeout-or-duplicate"] }, "token"],
  ] as const)("rejects invalid provider result %j", async (overrides, reason) => {
    await expect(
      verifyTurnstile(
        {
          clientAddress: "203.0.113.9",
          corsOrigin: "https://fortez-przyczepy.pl",
          idempotencyKey: "90000000-0000-4000-8000-000000000001",
          token: "single-use-token",
        },
        vi.fn(async () => providerResponse(overrides)),
      ),
    ).resolves.toEqual({ status: "rejected", reason });
  });

  it("retries one provider failure with the same idempotency key", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(providerResponse());
    await expect(
      verifyTurnstile(
        {
          clientAddress: "203.0.113.9",
          corsOrigin: "https://fortez-przyczepy.pl",
          idempotencyKey: "90000000-0000-4000-8000-000000000001",
          token: "single-use-token",
        },
        fetchImplementation,
      ),
    ).resolves.toEqual({ status: "verified" });
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
    expect(String(fetchImplementation.mock.calls[0]?.[1]?.body)).toBe(
      String(fetchImplementation.mock.calls[1]?.[1]?.body),
    );
  });

  it("fails closed after two provider failures", async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    await expect(
      verifyTurnstile(
        {
          clientAddress: "203.0.113.9",
          corsOrigin: "https://fortez-przyczepy.pl",
          idempotencyKey: "90000000-0000-4000-8000-000000000001",
          token: "single-use-token",
        },
        fetchImplementation,
      ),
    ).resolves.toEqual({ status: "unavailable" });
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });
});
