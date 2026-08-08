import { describe, expect, it, vi } from "vitest";

import { checkRuntimeReadiness } from "./readiness";

const config = {
  publishableKey: "public-test-key",
  url: "https://project.supabase.test",
} as const;

function asFetch(
  implementation: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) {
  const mock = vi.fn(implementation);
  return mock as typeof mock & typeof fetch;
}

describe("runtime readiness", () => {
  it("accepts only an exact successful boolean response", async () => {
    const fetchImpl = asFetch(async () => Response.json(true));

    await expect(checkRuntimeReadiness({ config, fetchImpl })).resolves.toBe(true);

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [endpoint, init] = fetchImpl.mock.calls[0] ?? [];
    expect(String(endpoint)).toBe(
      "https://project.supabase.test/rest/v1/rpc/runtime_readiness_probe",
    );
    expect(init).toMatchObject({ body: "{}", cache: "no-store", method: "POST" });
    expect(init?.headers).toMatchObject({
      apikey: "public-test-key",
      Authorization: "Bearer public-test-key",
    });
  });

  it.each([
    new Response("false", { status: 200 }),
    new Response('{"ready":true}', { status: 200 }),
    new Response("true", { status: 503 }),
  ])("rejects an unavailable or unexpected dependency response", async (response) => {
    const fetchImpl = asFetch(async () => response);

    await expect(checkRuntimeReadiness({ config, fetchImpl })).resolves.toBe(false);
  });

  it("fails closed when the dependency times out", async () => {
    const fetchImpl = asFetch(
      async (_input, init) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("timed out", "AbortError"));
          });
        }),
    );

    await expect(checkRuntimeReadiness({ config, fetchImpl, timeoutMs: 5 })).resolves.toBe(false);
  });

  it("fails closed without runtime Supabase configuration", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const previousAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      await expect(checkRuntimeReadiness()).resolves.toBe(false);
    } finally {
      if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      if (previousPublishableKey === undefined)
        delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousPublishableKey;
      if (previousAnonKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousAnonKey;
    }
  });
});
