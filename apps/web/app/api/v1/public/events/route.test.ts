import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("public analytics events route", () => {
  it("rejects arbitrary PII before accessing the database", async () => {
    const response = await POST(
      new Request("https://app.wyceno.test/api/v1/public/events", {
        body: JSON.stringify({
          device: "mobile",
          email: "person@example.test",
          eventId: "a0000000-0000-4000-8000-000000000001",
          name: "widget_loaded",
          occurredAt: "2026-07-25T12:00:00.000Z",
          schemaVersion: 1,
          source: "direct",
          stepKey: null,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Wyceno-Session": "d".repeat(64),
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_REQUEST" },
    });
  });
});
