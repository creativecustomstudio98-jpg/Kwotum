import { describe, expect, it } from "vitest";

import { deriveLeadOperationProjection } from "./operations";

describe("lead operation projection", () => {
  it("selects the nearest open task and contact independently", () => {
    expect(
      deriveLeadOperationProjection({
        activityOccurredAts: ["2026-08-03T12:00:00.000Z"],
        noteCreatedAts: [],
        statusChangedAts: [],
        submittedAt: "2026-08-03T08:00:00.000Z",
        tasks: [
          {
            dueAt: "2026-08-04T08:00:00.000Z",
            id: "task-closed",
            kind: "contact",
            status: "completed",
          },
          {
            dueAt: "2026-08-05T08:00:00.000Z",
            id: "task-contact",
            kind: "contact",
            status: "open",
          },
          {
            dueAt: "2026-08-04T10:00:00.000Z",
            id: "task-next",
            kind: "task",
            status: "open",
          },
        ],
      }),
    ).toEqual({
      lastActivityAt: "2026-08-03T12:00:00.000Z",
      nextContactTaskId: "task-contact",
      nextTaskId: "task-next",
    });
  });

  it("uses submission as the safe fallback and excludes closed tasks", () => {
    expect(
      deriveLeadOperationProjection({
        activityOccurredAts: [],
        noteCreatedAts: [],
        statusChangedAts: [],
        submittedAt: "2026-08-03T08:00:00.000Z",
        tasks: [
          {
            dueAt: "2026-08-04T08:00:00.000Z",
            id: "cancelled",
            kind: "contact",
            status: "cancelled",
          },
        ],
      }),
    ).toEqual({
      lastActivityAt: "2026-08-03T08:00:00.000Z",
      nextContactTaskId: null,
      nextTaskId: null,
    });
  });
});
