import type { LeadTaskKind, LeadTaskStatus } from "@wyceno/database";

export type LeadOperationProjectionTask = Readonly<{
  dueAt: string;
  id: string;
  kind: LeadTaskKind;
  status: LeadTaskStatus;
}>;

type LeadOperationProjectionInput = Readonly<{
  activityOccurredAts: ReadonlyArray<string>;
  noteCreatedAts: ReadonlyArray<string>;
  statusChangedAts: ReadonlyArray<string>;
  submittedAt: string;
  tasks: ReadonlyArray<LeadOperationProjectionTask>;
}>;

export type LeadOperationProjection = Readonly<{
  lastActivityAt: string;
  nextContactTaskId: string | null;
  nextTaskId: string | null;
}>;

export function deriveLeadOperationProjection(
  input: LeadOperationProjectionInput,
): LeadOperationProjection {
  const openTasks = input.tasks
    .filter((task) => task.status === "open")
    .toSorted((left, right) => {
      const dueDifference = Date.parse(left.dueAt) - Date.parse(right.dueAt);
      return dueDifference === 0 ? left.id.localeCompare(right.id) : dueDifference;
    });
  const lastActivityAt = [
    input.submittedAt,
    ...input.statusChangedAts,
    ...input.noteCreatedAts,
    ...input.activityOccurredAts,
  ].reduce((latest, candidate) =>
    Date.parse(candidate) > Date.parse(latest) ? candidate : latest,
  );

  return {
    lastActivityAt,
    nextContactTaskId: openTasks.find((task) => task.kind === "contact")?.id ?? null,
    nextTaskId: openTasks[0]?.id ?? null,
  };
}
