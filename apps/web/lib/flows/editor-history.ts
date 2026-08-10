import type { FlowDocument } from "@wyceno/validation";

export const EDITOR_HISTORY_LIMIT = 50;
export const EDITOR_HISTORY_GROUP_WINDOW_MS = 800;

export type FlowEditorSnapshot = Readonly<{
  document: FlowDocument;
  name: string;
}>;

export type FlowEditorHistory = Readonly<{
  future: readonly FlowEditorSnapshot[];
  lastChangedAt: number | null;
  lastGroup: string | null;
  past: readonly FlowEditorSnapshot[];
  present: FlowEditorSnapshot;
}>;

export function createFlowEditorHistory(present: FlowEditorSnapshot): FlowEditorHistory {
  return {
    future: [],
    lastChangedAt: null,
    lastGroup: null,
    past: [],
    present,
  };
}

export function flowEditorSnapshotSignature(snapshot: FlowEditorSnapshot): string {
  return `${snapshot.name}\u0000${JSON.stringify(snapshot.document)}`;
}

export function changeFlowEditorHistory(
  history: FlowEditorHistory,
  present: FlowEditorSnapshot,
  options: Readonly<{ at?: number; group?: string }> = {},
): FlowEditorHistory {
  if (flowEditorSnapshotSignature(history.present) === flowEditorSnapshotSignature(present)) {
    return history;
  }

  const at = options.at ?? Date.now();
  const group = options.group ?? null;
  const continuesGroup =
    group !== null &&
    history.lastGroup === group &&
    history.lastChangedAt !== null &&
    at - history.lastChangedAt <= EDITOR_HISTORY_GROUP_WINDOW_MS;
  const past = continuesGroup
    ? history.past
    : [...history.past, history.present].slice(-EDITOR_HISTORY_LIMIT);

  return {
    future: [],
    lastChangedAt: at,
    lastGroup: group,
    past,
    present,
  };
}

export function undoFlowEditorHistory(history: FlowEditorHistory): FlowEditorHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;

  return {
    future: [history.present, ...history.future],
    lastChangedAt: null,
    lastGroup: null,
    past: history.past.slice(0, -1),
    present: previous,
  };
}

export function redoFlowEditorHistory(history: FlowEditorHistory): FlowEditorHistory {
  const [next, ...future] = history.future;
  if (!next) return history;

  return {
    future,
    lastChangedAt: null,
    lastGroup: null,
    past: [...history.past, history.present].slice(-EDITOR_HISTORY_LIMIT),
    present: next,
  };
}
