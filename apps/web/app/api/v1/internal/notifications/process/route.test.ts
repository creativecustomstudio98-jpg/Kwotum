import { afterEach, describe, expect, it } from "vitest";

import { POST } from "./route";

const originalSecret = process.env.NOTIFICATION_WORKER_SECRET;

afterEach(() => {
  if (originalSecret === undefined) delete process.env.NOTIFICATION_WORKER_SECRET;
  else process.env.NOTIFICATION_WORKER_SECRET = originalSecret;
});

describe("notification worker route", () => {
  it("rejects missing and incorrect bearer secrets without queue details", async () => {
    process.env.NOTIFICATION_WORKER_SECRET = "a".repeat(32);

    const response = await POST(
      new Request("https://app.wyceno.test/api/v1/internal/notifications/process", {
        headers: { Authorization: `Bearer ${"b".repeat(32)}` },
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toEqual({
      error: { code: "UNAUTHORIZED", message: "Brak dostępu do workera." },
    });
  });
});
