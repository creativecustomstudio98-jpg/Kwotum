import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  guardPublicRequest: vi.fn(),
  rpc: vi.fn(),
  verifyTurnstile: vi.fn(),
}));

vi.mock("../../../../../../../lib/public-api/request-guard", () => ({
  guardPublicOptions: vi.fn(),
  guardPublicRequest: mocks.guardPublicRequest,
}));
vi.mock("../../../../../../../lib/public-api/turnstile", () => ({
  verifyTurnstile: mocks.verifyTurnstile,
}));
vi.mock("../../../../../../../lib/supabase/service", () => ({
  createServiceClient: () => ({ rpc: mocks.rpc }),
}));

import { POST } from "./route";

const requestBody = {
  challengeToken: "single-use-token",
  contact: { phone: "+48 500 600 700" },
  fileIds: [],
  marketingEmailConsent: null,
  mutationId: "90000000-0000-4000-8000-000000000001",
  privacyNotice: {
    accepted: true,
    textHash: "b".repeat(64),
    version: "privacy-v1",
  },
};

function request(body: unknown = requestBody): Request {
  return new Request("https://app.kwotum.pl/api/v1/public/sessions/current/submit", {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "X-Wyceno-Session": "d".repeat(64),
    },
    method: "POST",
  });
}

beforeEach(() => {
  mocks.guardPublicRequest.mockReset().mockResolvedValue({
    allowed: true,
    context: { clientAddress: "203.0.113.9", corsOrigin: "https://fortez-przyczepy.pl" },
  });
  mocks.verifyTurnstile.mockReset().mockResolvedValue({ status: "verified" });
  mocks.rpc.mockReset().mockResolvedValue({
    data: {
      leadPublicId: "e0000000-0000-4000-8000-000000000001",
      submittedAt: "2026-08-10T12:00:00.000+00:00",
    },
    error: null,
  });
});

describe("public lead submit Turnstile gate", () => {
  it("rejects a missing challenge token before verification and database write", async () => {
    const withoutChallenge = {
      contact: requestBody.contact,
      fileIds: requestBody.fileIds,
      marketingEmailConsent: requestBody.marketingEmailConsent,
      mutationId: requestBody.mutationId,
      privacyNotice: requestBody.privacyNotice,
    };
    const response = await POST(request(withoutChallenge));
    expect(response.status).toBe(400);
    expect(mocks.verifyTurnstile).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects replayed or invalid challenge before database write", async () => {
    mocks.verifyTurnstile.mockResolvedValue({ status: "rejected", reason: "token" });
    const response = await POST(request());
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "CHALLENGE_FAILED" } });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed when the provider is unavailable", async () => {
    mocks.verifyTurnstile.mockResolvedValue({ status: "unavailable" });
    const response = await POST(request());
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "CHALLENGE_UNAVAILABLE" },
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("creates a lead only after verified action, host and token", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(mocks.verifyTurnstile).toHaveBeenCalledWith({
      clientAddress: "203.0.113.9",
      corsOrigin: "https://fortez-przyczepy.pl",
      idempotencyKey: requestBody.mutationId,
      token: requestBody.challengeToken,
    });
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });
});
