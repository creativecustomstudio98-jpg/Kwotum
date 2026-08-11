import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../supabase/service", () => ({
  createServiceClient: () => ({ rpc: mocks.rpc }),
}));

import { guardPublicOptions, guardPublicRequest, normalizePublicOrigin } from "./request-guard";

const originalEnvironment = {
  APP_URL: process.env.APP_URL,
  DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV,
  PUBLIC_RATE_LIMIT_SECRET: process.env.PUBLIC_RATE_LIMIT_SECRET,
};

beforeEach(() => {
  process.env.APP_URL = "http://localhost:3000";
  process.env.DEPLOYMENT_ENV = "local";
  process.env.PUBLIC_RATE_LIMIT_SECRET = "p".repeat(32);
  mocks.rpc.mockReset();
});

afterEach(() => {
  for (const [name, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("public request guard", () => {
  it("normalizes only exact HTTPS and loopback origins", () => {
    expect(normalizePublicOrigin("https://Firma.PL")).toBe("https://firma.pl");
    expect(normalizePublicOrigin("http://localhost:3100")).toBe("http://localhost:3100");
    expect(normalizePublicOrigin("http://firma.pl")).toBeNull();
    expect(normalizePublicOrigin("https://firma.pl/sciezka")).toBeNull();
    expect(normalizePublicOrigin("https://user:secret@firma.pl")).toBeNull();
  });

  it("passes only a HMAC fingerprint and echoes an allowed exact origin", async () => {
    mocks.rpc.mockResolvedValue({ data: { allowed: true }, error: null });
    const request = new Request("http://localhost:3000/api/v1/public/flows/id/manifest", {
      headers: { Origin: "https://firma.pl", "X-Forwarded-For": "203.0.113.9" },
    });

    const result = await guardPublicRequest(
      request,
      "manifest",
      { publicId: "11111111-1111-4111-8111-111111111111" },
      "request-1",
    );

    expect(result).toEqual({
      allowed: true,
      context: { clientAddress: "203.0.113.9", corsOrigin: "https://firma.pl" },
    });
    expect(mocks.rpc).toHaveBeenCalledWith(
      "enforce_public_request_guard",
      expect.objectContaining({
        application_origin: "http://localhost:3000",
        client_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/u),
        request_origin: "https://firma.pl",
      }),
    );
    expect(JSON.stringify(mocks.rpc.mock.calls)).not.toContain("203.0.113.9");
  });

  it("returns a credential-free 403 for an unconfigured origin", async () => {
    mocks.rpc.mockResolvedValue({ data: { allowed: false, reason: "origin" }, error: null });
    const result = await guardPublicRequest(
      new Request("http://localhost:3000/api", {
        headers: { Origin: "https://blocked.pl" },
      }),
      "manifest",
      { publicId: "11111111-1111-4111-8111-111111111111" },
      "request-2",
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(403);
    expect(result.response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("returns Retry-After and exact CORS on a distributed limit", async () => {
    mocks.rpc.mockResolvedValue({
      data: { allowed: false, reason: "rate", retryAfter: 37 },
      error: null,
    });
    const result = await guardPublicRequest(
      new Request("http://localhost:3000/api", { headers: { Origin: "https://firma.pl" } }),
      "session_create",
      { publicId: "11111111-1111-4111-8111-111111111111" },
      "request-3",
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(429);
    expect(result.response.headers.get("retry-after")).toBe("37");
    expect(result.response.headers.get("access-control-allow-origin")).toBe("https://firma.pl");
  });

  it("fails closed outside local development without Vercel client metadata", async () => {
    process.env.DEPLOYMENT_ENV = "production";
    const result = await guardPublicRequest(
      new Request("https://app.kwotum.pl/api"),
      "manifest",
      { publicId: "11111111-1111-4111-8111-111111111111" },
      "request-4",
    );
    expect(result.allowed).toBe(false);
    if (result.allowed) return;
    expect(result.response.status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns a scoped preflight instead of wildcard CORS", async () => {
    mocks.rpc.mockResolvedValue({ data: { allowed: true }, error: null });
    const response = await guardPublicOptions(
      new Request("http://localhost:3000/api", { headers: { Origin: "https://firma.pl" } }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://firma.pl");
    expect(response.headers.get("vary")).toBe("Origin");
  });
});
