import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /health", () => {
  it("returns a non-cacheable health response", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    await expect(response.json()).resolves.toEqual({
      service: "web",
      status: "ok",
    });
  });
});
