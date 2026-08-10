import { describe, expect, it, vi } from "vitest";

import { processRetentionBatch, type RetentionRepository } from "./retention";

function repository(overrides: Partial<RetentionRepository> = {}): RetentionRepository {
  return {
    findExpiredLeads: vi.fn().mockResolvedValue([]),
    findExpiredSessions: vi.fn().mockResolvedValue([]),
    purgeLeads: vi.fn().mockResolvedValue(0),
    purgeSessions: vi.fn().mockResolvedValue(0),
    removeObjects: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("retention worker", () => {
  it("deduplicates objects and removes them before database records", async () => {
    const order: string[] = [];
    const target = repository({
      findExpiredLeads: vi.fn().mockResolvedValue([
        {
          lead_id: "lead-1",
          object_paths: ["tenant/a.pdf", "tenant/shared.pdf"],
          organization_id: "org-1",
        },
      ]),
      findExpiredSessions: vi.fn().mockResolvedValue([
        {
          object_paths: ["tenant/shared.pdf", "tenant/draft.pdf"],
          session_id: "session-1",
        },
      ]),
      purgeLeads: vi.fn(async () => {
        order.push("leads");
        return 1;
      }),
      purgeSessions: vi.fn(async () => {
        order.push("sessions");
        return 1;
      }),
      removeObjects: vi.fn(async (paths) => {
        expect(paths).toEqual(["tenant/a.pdf", "tenant/shared.pdf", "tenant/draft.pdf"]);
        order.push("storage");
      }),
    });

    await expect(processRetentionBatch(target)).resolves.toEqual({
      filesRemoved: 3,
      leadCandidates: 1,
      leadsPurged: 1,
      sessionCandidates: 1,
      sessionsPurged: 1,
    });
    expect(order).toEqual(["storage", "leads", "sessions"]);
  });

  it("does not delete database records when storage deletion fails", async () => {
    const target = repository({
      findExpiredLeads: vi.fn().mockResolvedValue([
        {
          lead_id: "lead-1",
          object_paths: ["tenant/private.pdf"],
          organization_id: "org-1",
        },
      ]),
      removeObjects: vi.fn().mockRejectedValue(new Error("storage unavailable")),
    });

    await expect(processRetentionBatch(target)).rejects.toThrow("storage unavailable");
    expect(target.purgeLeads).not.toHaveBeenCalled();
    expect(target.purgeSessions).not.toHaveBeenCalled();
  });
});
