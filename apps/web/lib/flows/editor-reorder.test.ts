import { flowTemplates } from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import { reorderFlowQuestion } from "./editor-reorder";

function documentWithTwoSections() {
  const source = structuredClone(flowTemplates[0]!.snapshot);
  source.sections = [
    { key: "pierwsza", title: "Pierwsza sekcja" },
    { key: "druga", title: "Druga sekcja" },
  ];
  source.steps = source.steps.slice(0, 4).map((step, index) => ({
    ...step,
    sectionKey: index < 2 ? "pierwsza" : "druga",
  }));
  source.entryStepKey = source.steps[0]!.key;
  source.rules = [];
  return source;
}

describe("reorderFlowQuestion", () => {
  it("moves a question after another question in the same section", () => {
    const source = documentWithTwoSections();
    const result = reorderFlowQuestion(source, source.steps[0]!.key, source.steps[1]!.key, "after");

    expect(result.changed).toBe(true);
    expect(result.document.steps.slice(0, 2).map((step) => step.key)).toEqual([
      source.steps[1]!.key,
      source.steps[0]!.key,
    ]);
    expect(result.position).toBe(2);
    expect(result.sectionTitle).toBe("Pierwsza sekcja");
  });

  it("moves a question across sections and adopts the target section", () => {
    const source = documentWithTwoSections();
    const movedKey = source.steps[0]!.key;
    const targetKey = source.steps[3]!.key;
    const result = reorderFlowQuestion(source, movedKey, targetKey, "before");

    expect(result.changed).toBe(true);
    expect(result.document.steps.find((step) => step.key === movedKey)?.sectionKey).toBe("druga");
    expect(result.document.steps.map((step) => step.key)).toEqual([
      source.steps[1]!.key,
      source.steps[2]!.key,
      movedKey,
      targetKey,
    ]);
    expect(result.position).toBe(2);
    expect(result.sectionTitle).toBe("Druga sekcja");
  });

  it("preserves a section made empty until the explicit section action removes it", () => {
    const source = documentWithTwoSections();
    source.steps = source.steps.filter((_, index) => index !== 1);
    const movedKey = source.steps[0]!.key;
    const result = reorderFlowQuestion(source, movedKey, source.steps[1]!.key, "before");

    expect(result.document.sections.map((section) => section.key)).toEqual(["pierwsza", "druga"]);
    expect(result.document.steps.some((step) => step.sectionKey === "pierwsza")).toBe(false);
    expect(result.document.steps[0]?.sectionKey).toBe("druga");
  });

  it("returns the original document for an invalid or no-op target", () => {
    const source = documentWithTwoSections();

    expect(
      reorderFlowQuestion(source, source.steps[0]!.key, source.steps[0]!.key, "before"),
    ).toEqual({
      changed: false,
      document: source,
      position: null,
      sectionTitle: null,
    });
    expect(reorderFlowQuestion(source, "brak", source.steps[0]!.key, "before").document).toBe(
      source,
    );
  });
});
