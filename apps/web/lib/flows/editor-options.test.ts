import { flowTemplates } from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import { reorderFlowOption } from "./editor-options";

function documentWithReferencedOptions() {
  const source = structuredClone(flowTemplates[0]!.snapshot);
  const step = source.steps[0]!;
  step.options[0] = {
    ...step.options[0]!,
    nextStepKey: source.steps[2]!.key,
  };
  return source;
}

describe("reorderFlowOption", () => {
  it("moves the complete option object within one question", () => {
    const source = documentWithReferencedOptions();
    const step = source.steps[0]!;
    const [first, second, third] = step.options;
    const result = reorderFlowOption(source, step.key, first!.key, second!.key, "after");

    expect(result.changed).toBe(true);
    expect(result.document.steps[0]!.options).toEqual([second, first, third]);
    expect(result.document.steps[0]!.options[1]).toBe(first);
    expect(result.optionLabel).toBe(first!.label);
    expect(result.position).toBe(2);
  });

  it("changes only the option order and preserves every graph reference", () => {
    const source = documentWithReferencedOptions();
    const step = source.steps[0]!;
    const beforeRules = structuredClone(source.rules);
    const beforeOtherSteps = structuredClone(source.steps.slice(1));
    const beforeDocument = {
      ...source,
      steps: undefined,
    };
    const result = reorderFlowOption(
      source,
      step.key,
      step.options[2]!.key,
      step.options[0]!.key,
      "before",
    );

    expect(result.document.rules).toEqual(beforeRules);
    expect(result.document.steps.slice(1)).toEqual(beforeOtherSteps);
    expect({ ...result.document, steps: undefined }).toEqual(beforeDocument);
    expect(result.document.steps[0]!.options.map((option) => option.key)).toEqual([
      step.options[2]!.key,
      step.options[0]!.key,
      step.options[1]!.key,
    ]);
    expect(result.document.steps[0]!.options[1]!.nextStepKey).toBe(source.steps[2]!.key);
  });

  it("returns the original document for invalid keys, self drops and no-op edges", () => {
    const source = documentWithReferencedOptions();
    const step = source.steps[0]!;
    const first = step.options[0]!;
    const second = step.options[1]!;

    for (const result of [
      reorderFlowOption(source, "brak", first.key, second.key, "after"),
      reorderFlowOption(source, step.key, "brak", second.key, "after"),
      reorderFlowOption(source, step.key, first.key, "brak", "after"),
      reorderFlowOption(source, step.key, first.key, first.key, "after"),
      reorderFlowOption(source, step.key, first.key, second.key, "before"),
    ]) {
      expect(result).toEqual({
        changed: false,
        document: source,
        optionLabel: null,
        position: null,
      });
      expect(result.document).toBe(source);
    }
  });

  it("preserves the supported two- and twenty-option boundaries", () => {
    const twoOptions = documentWithReferencedOptions();
    const twoOptionStep = twoOptions.steps[0]!;
    twoOptionStep.options = twoOptionStep.options.slice(0, 2);
    const twoResult = reorderFlowOption(
      twoOptions,
      twoOptionStep.key,
      twoOptionStep.options[1]!.key,
      twoOptionStep.options[0]!.key,
      "before",
    );

    expect(twoResult.document.steps[0]!.options).toHaveLength(2);
    expect(twoResult.document.steps[0]!.options[0]!.key).toBe(twoOptionStep.options[1]!.key);

    const twentyOptions = documentWithReferencedOptions();
    const twentyOptionStep = twentyOptions.steps[0]!;
    twentyOptionStep.options = Array.from({ length: 20 }, (_, index) => ({
      key: `opcja-${index + 1}`,
      label: `Opcja ${index + 1}`,
    }));
    const twentyResult = reorderFlowOption(
      twentyOptions,
      twentyOptionStep.key,
      "opcja-20",
      "opcja-1",
      "before",
    );

    expect(twentyResult.document.steps[0]!.options).toHaveLength(20);
    expect(twentyResult.document.steps[0]!.options[0]!.key).toBe("opcja-20");
  });

  it("does not add sorting state to a question without options", () => {
    const source = documentWithReferencedOptions();
    const questionWithoutOptions = source.steps.find((step) => step.options.length === 0)!;
    const result = reorderFlowOption(
      source,
      questionWithoutOptions.key,
      "brak-1",
      "brak-2",
      "after",
    );

    expect(result.changed).toBe(false);
    expect(result.document).toBe(source);
  });
});
