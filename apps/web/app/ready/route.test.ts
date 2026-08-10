import { describe, expect, it, vi } from "vitest";

import { createReadinessResponse } from "./route";

describe("GET /ready", () => {
  it("returns a non-cacheable ready response without dependency details", async () => {
    const response = await createReadinessResponse(vi.fn(async () => true));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    await expect(response.json()).resolves.toEqual({
      service: "web",
      status: "ready",
    });
  });

  it("returns a generic 503 when the dependency is unavailable", async () => {
    const response = await createReadinessResponse(vi.fn(async () => false));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      service: "web",
      status: "unavailable",
    });
  });
});
