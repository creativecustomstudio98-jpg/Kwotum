import { flowTemplates } from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import {
  changeFlowEditorHistory,
  createFlowEditorHistory,
  EDITOR_HISTORY_LIMIT,
  flowEditorSnapshotSignature,
  redoFlowEditorHistory,
  undoFlowEditorHistory,
  type FlowEditorSnapshot,
} from "./editor-history";

function snapshot(name: string): FlowEditorSnapshot {
  return {
    document: {
      ...flowTemplates[0]!.snapshot,
      title: name,
    },
    name,
  };
}

describe("flow editor history", () => {
  it("undoes and redoes one semantic change", () => {
    const initial = snapshot("Proces A");
    const changed = snapshot("Proces B");
    const history = changeFlowEditorHistory(createFlowEditorHistory(initial), changed, {
      at: 100,
    });

    const undone = undoFlowEditorHistory(history);
    expect(undone.present).toEqual(initial);
    expect(undone.future).toEqual([changed]);

    const redone = redoFlowEditorHistory(undone);
    expect(redone.present).toEqual(changed);
    expect(redone.future).toEqual([]);
  });

  it("groups consecutive typing into one undo entry", () => {
    const initial = snapshot("P");
    const first = changeFlowEditorHistory(createFlowEditorHistory(initial), snapshot("Pr"), {
      at: 100,
      group: "flow-name",
    });
    const second = changeFlowEditorHistory(first, snapshot("Proces"), {
      at: 600,
      group: "flow-name",
    });

    expect(second.past).toHaveLength(1);
    expect(undoFlowEditorHistory(second).present).toEqual(initial);
  });

  it("starts a new entry after the typing window", () => {
    const initial = snapshot("P");
    const first = changeFlowEditorHistory(createFlowEditorHistory(initial), snapshot("Pr"), {
      at: 100,
      group: "flow-name",
    });
    const second = changeFlowEditorHistory(first, snapshot("Proces"), {
      at: 1_000,
      group: "flow-name",
    });

    expect(second.past).toHaveLength(2);
    expect(undoFlowEditorHistory(second).present.name).toBe("Pr");
  });

  it("clears redo after a divergent edit", () => {
    const changed = changeFlowEditorHistory(createFlowEditorHistory(snapshot("A")), snapshot("B"));
    const undone = undoFlowEditorHistory(changed);
    const divergent = changeFlowEditorHistory(undone, snapshot("C"));

    expect(divergent.future).toEqual([]);
    expect(redoFlowEditorHistory(divergent)).toBe(divergent);
  });

  it("ignores snapshots with identical persisted content", () => {
    const history = createFlowEditorHistory(snapshot("A"));
    expect(changeFlowEditorHistory(history, snapshot("A"))).toBe(history);
    expect(flowEditorSnapshotSignature(snapshot("A"))).toBe(
      flowEditorSnapshotSignature(snapshot("A")),
    );
  });

  it("keeps a bounded history", () => {
    let history = createFlowEditorHistory(snapshot("0"));
    for (let index = 1; index <= EDITOR_HISTORY_LIMIT + 10; index += 1) {
      history = changeFlowEditorHistory(history, snapshot(String(index)));
    }

    expect(history.past).toHaveLength(EDITOR_HISTORY_LIMIT);
    expect(history.past[0]?.name).toBe("10");
  });
});
