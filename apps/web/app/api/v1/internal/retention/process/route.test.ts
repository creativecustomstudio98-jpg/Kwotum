import { beforeEach, describe, expect, it, vi } from "vitest";

const processConfiguredRetentionBatch = vi.fn();

vi.mock("../../../../../../lib/privacy/retention", () => ({
  processConfiguredRetentionBatch,
}));

describe("retention worker route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RETENTION_WORKER_SECRET = "r".repeat(32);
  });

  it("rejects a missing or incorrect bearer secret", async () => {
    const { POST } = await import("./route");
    for (const authorization of [undefined, "Bearer incorrect"]) {
      const request = authorization
        ? new Request("http://localhost", { headers: { authorization } })
        : new Request("http://localhost");
      const response = await POST(request);
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
    expect(processConfiguredRetentionBatch).not.toHaveBeenCalled();
  });

  it("processes an authorized batch without returning private data", async () => {
    processConfiguredRetentionBatch.mockResolvedValue({
      filesRemoved: 2,
      leadCandidates: 1,
      leadsPurged: 1,
      sessionCandidates: 0,
      sessionsPurged: 0,
    });
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        headers: { authorization: `Bearer ${"r".repeat(32)}` },
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      filesRemoved: 2,
      leadCandidates: 1,
      leadsPurged: 1,
      sessionCandidates: 0,
      sessionsPurged: 0,
    });
  });
});
