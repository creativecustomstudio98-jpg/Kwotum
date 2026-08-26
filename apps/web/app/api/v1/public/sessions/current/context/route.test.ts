import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../../../../lib/public-api/request-guard", () => ({
  guardPublicOptions: vi.fn(),
  guardPublicRequest: vi.fn().mockResolvedValue({
    allowed: true,
    context: { corsOrigin: "https://partner.test" },
  }),
}));

import { PUT } from "./route";

describe("widget context confirmation route", () => {
  it("rejects reserved business fields before calling the database", async () => {
    const response = await PUT(
      new Request("https://app.wyceno.test/api/v1/public/sessions/current/context", {
        body: JSON.stringify({
          mutationId: "a0000000-0000-4000-8000-000000000001",
          values: { price: "1" },
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Wyceno-Session": "d".repeat(64),
        },
        method: "PUT",
      }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_REQUEST" },
    });
  });
});
