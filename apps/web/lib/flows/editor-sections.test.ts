import { flowTemplates, validateFlowDocument } from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import {
  addFlowQuestionToSection,
  addFlowSection,
  removeFlowSection,
  renameFlowSection,
  reorderFlowSection,
} from "./editor-sections";

function documentWithTwoSections() {
  const source = structuredClone(flowTemplates[0]!.snapshot);
  source.sections = [
    { key: "pierwsza", title: "Pierwsza sekcja" },
    { key: "druga", title: "Druga sekcja" },
  ];
  source.steps = source.steps.slice(0, 4).map((step, index, steps) => ({
    ...step,
    nextStepKey: steps[index + 1]?.key ?? null,
    sectionKey: index < 2 ? "pierwsza" : "druga",
  }));
  source.entryStepKey = source.steps[0]!.key;
  source.rules = [];
  return source;
}

function newQuestion(key: string, sectionKey: string) {
  return {
    allowUnknown: false,
    key,
    nextStepKey: null,
    options: [
      { key: "opcja_1", label: "Opcja 1" },
      { key: "opcja_2", label: "Opcja 2" },
    ],
    required: true,
    sectionKey,
    title: "Nowe pytanie",
    type: "single_choice" as const,
  };
}

describe("flow editor section operations", () => {
  it("adds a section after the active group with a reachable first question", () => {
    const source = documentWithTwoSections();
    const previousNext = source.steps[1]!.nextStepKey;
    const result = addFlowSection(
      source,
      { key: "nowa", title: "Nowa sekcja" },
      newQuestion("nowe_pytanie", "nowa"),
      "pierwsza",
    );

    expect(result.changed).toBe(true);
    expect(result.document.sections.map((section) => section.key)).toEqual([
      "pierwsza",
      "nowa",
      "druga",
    ]);
    expect(result.document.steps.map((step) => step.sectionKey)).toEqual([
      "pierwsza",
      "pierwsza",
      "nowa",
      "druga",
      "druga",
    ]);
    expect(result.document.steps[1]?.nextStepKey).toBe("nowe_pytanie");
    expect(result.document.steps[2]?.nextStepKey).toBe(previousNext);
    expect(validateFlowDocument(result.document).issues).toEqual([]);
  });

  it("renames a section without changing keys, steps or graph", () => {
    const source = documentWithTwoSections();
    const result = renameFlowSection(source, "pierwsza", "  Informacje o firmie  ");

    expect(result.document.sections[0]).toEqual({
      key: "pierwsza",
      title: "Informacje o firmie",
    });
    expect(result.document.steps).toEqual(source.steps);
    expect(result.document.rules).toEqual(source.rules);
    expect(renameFlowSection(source, "pierwsza", "   ").changed).toBe(false);
  });

  it("reorders whole section groups while preserving graph references", () => {
    const source = documentWithTwoSections();
    const originalTransitions = source.steps.map((step) => [step.key, step.nextStepKey]);
    const result = reorderFlowSection(source, "druga", -1);

    expect(result.document.sections.map((section) => section.key)).toEqual(["druga", "pierwsza"]);
    expect(result.document.steps.map((step) => step.sectionKey)).toEqual([
      "druga",
      "druga",
      "pierwsza",
      "pierwsza",
    ]);
    expect(
      result.document.steps
        .map((step) => [step.key, step.nextStepKey])
        .sort(([left], [right]) => String(left).localeCompare(String(right))),
    ).toEqual(
      originalTransitions.sort(([left], [right]) => String(left).localeCompare(String(right))),
    );
    expect(
      validateFlowDocument(result.document).issues.some(
        (issue) => issue.code === "SECTION_ORDER_INVALID",
      ),
    ).toBe(false);
  });

  it("removes a section only after reassigning its questions to a valid target", () => {
    const source = documentWithTwoSections();
    const removedQuestionKeys = source.steps
      .filter((step) => step.sectionKey === "druga")
      .map((step) => step.key);
    const result = removeFlowSection(source, "druga", "pierwsza");

    expect(result.changed).toBe(true);
    expect(result.movedQuestionCount).toBe(2);
    expect(result.document.sections.map((section) => section.key)).toEqual(["pierwsza"]);
    expect(result.document.steps.map((step) => step.key)).toEqual(
      source.steps.map((step) => step.key),
    );
    expect(
      result.document.steps
        .filter((step) => removedQuestionKeys.includes(step.key))
        .every((step) => step.sectionKey === "pierwsza"),
    ).toBe(true);
    expect(result.document.entryStepKey).toBe(source.entryStepKey);
    expect(validateFlowDocument(result.document).issues).toEqual([]);
  });

  it("prepends questions when the first section is moved into the following section", () => {
    const source = documentWithTwoSections();
    const result = removeFlowSection(source, "pierwsza", "druga");

    expect(result.document.sections.map((section) => section.key)).toEqual(["druga"]);
    expect(result.document.steps.map((step) => step.key)).toEqual(
      source.steps.map((step) => step.key),
    );
    expect(result.document.steps.every((step) => step.sectionKey === "druga")).toBe(true);
  });

  it("adds a question to an empty section and reconnects the default path", () => {
    const source = documentWithTwoSections();
    source.sections.splice(1, 0, { key: "pusta", title: "Pusta sekcja" });
    const result = addFlowQuestionToSection(source, "pusta", newQuestion("pierwsze", "pusta"));

    expect(result.changed).toBe(true);
    expect(result.document.steps[2]?.key).toBe("pierwsze");
    expect(result.document.steps[2]?.sectionKey).toBe("pusta");
    expect(result.document.steps[1]?.nextStepKey).toBe("pierwsze");
    expect(validateFlowDocument(result.document).issues).toEqual([]);
  });

  it("rejects invalid targets, the only section and document limits", () => {
    const source = documentWithTwoSections();
    const oneSection = removeFlowSection(source, "druga", "pierwsza").document;
    expect(removeFlowSection(oneSection, "pierwsza", "brak").changed).toBe(false);
    expect(removeFlowSection(source, "pierwsza", "brak").changed).toBe(false);
    expect(reorderFlowSection(source, "pierwsza", -1).changed).toBe(false);

    const sectionLimit = structuredClone(source);
    sectionLimit.sections = Array.from({ length: 20 }, (_, index) => ({
      key: `sekcja_${index}`,
      title: `Sekcja ${index}`,
    }));
    expect(
      addFlowSection(
        sectionLimit,
        { key: "kolejna", title: "Kolejna" },
        newQuestion("kolejne_pytanie", "kolejna"),
        sectionLimit.sections[0]!.key,
      ).changed,
    ).toBe(false);

    const stepLimit = structuredClone(source);
    stepLimit.steps = Array.from({ length: 40 }, (_, index) => ({
      ...source.steps[index % source.steps.length]!,
      key: `pytanie_${index}`,
      nextStepKey: null,
    }));
    expect(
      addFlowQuestionToSection(stepLimit, "pierwsza", newQuestion("kolejne", "pierwsza")).changed,
    ).toBe(false);
  });
});
