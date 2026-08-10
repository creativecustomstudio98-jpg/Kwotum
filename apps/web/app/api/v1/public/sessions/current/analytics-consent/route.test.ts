import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("analytics consent route", () => {
  it("rejects an unknown consent version", async () => {
    const response = await POST(
      new Request("https://app.wyceno.test/api/v1/public/sessions/current/analytics-consent", {
        body: JSON.stringify({
          consentVersion: "analytics-v0",
          granted: true,
          mutationId: "a0000000-0000-4000-8000-000000000001",
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Wyceno-Session": "d".repeat(64),
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(422);
  });
});
