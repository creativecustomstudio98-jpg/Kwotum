import { describe, expect, it } from "vitest";

import { isAnswerValid, parseWidgetManifest, resolveNextStep } from "./manifest.js";
import { testManifest } from "./test-fixtures.js";

describe("widget manifest", () => {
  it("parses the allowlisted contract and rejects a bad hash", () => {
    expect(parseWidgetManifest(testManifest)).toEqual(testManifest);
    expect(() => parseWidgetManifest({ ...testManifest, snapshotHash: "not-a-hash" })).toThrow(
      "Manifest ma nieprawidłową strukturę",
    );
  });

  it("uses rule order before option and step fallbacks", () => {
    expect(resolveNextStep(testManifest, "service", { service: "premium" })).toBe("details");
    expect(resolveNextStep(testManifest, "service", { service: "standard" })).toBe("location");

    const withOverride = structuredClone(testManifest);
    const firstStep = withOverride.steps[0];
    if (!firstStep) throw new Error("Missing fixture step.");
    firstStep.options[0] = {
      key: "standard",
      label: "Standard",
      nextStepKey: null,
      overridesNextStep: true,
    };
    expect(resolveNextStep(withOverride, "service", { service: "standard" })).toBeNull();
  });

  it("validates choices, dates, text limits and unknown answers", () => {
    const choice = testManifest.steps[0];
    const details = testManifest.steps[1];
    if (!choice || !details) throw new Error("Missing fixture steps.");
    expect(isAnswerValid(choice, "standard")).toBe(true);
    expect(isAnswerValid(choice, "other")).toBe(false);
    expect(isAnswerValid(details, "__unknown__")).toBe(true);
    expect(isAnswerValid(details, "")).toBe(false);
    expect(
      isAnswerValid(
        { ...details, type: "date", required: true, allowUnknown: false },
        "2026-02-31",
      ),
    ).toBe(false);
  });

  it("parses manifest v2 and enforces allowlisted step constraints", () => {
    const details = testManifest.steps[1];
    const location = testManifest.steps[2];
    if (!details || !location) throw new Error("Missing fixture steps.");

    const manifestV2 = {
      ...testManifest,
      manifestVersion: 2 as const,
      steps: testManifest.steps.map((step) => {
        if (step.key === details.key) {
          return {
            ...step,
            validation: { kind: "text_length" as const, maxLength: 40, minLength: 10 },
          };
        }
        if (step.key === location.key) {
          return {
            ...step,
            validation: { kind: "text_length" as const, maxLength: 80, minLength: 3 },
          };
        }
        return step;
      }),
    };

    const parsed = parseWidgetManifest(manifestV2);
    expect(parsed.manifestVersion).toBe(2);
    expect(isAnswerValid(parsed.steps[1]!, "Za krótko")).toBe(false);
    expect(isAnswerValid(parsed.steps[1]!, "Wystarczająco długi opis")).toBe(true);
    expect(isAnswerValid(parsed.steps[2]!, "  A  ")).toBe(false);
  });

  it("enforces numeric and date ranges", () => {
    const base = testManifest.steps[1];
    if (!base) throw new Error("Missing fixture step.");

    const numberStep = {
      ...base,
      allowUnknown: false,
      required: true,
      type: "number" as const,
      validation: { kind: "number_range" as const, max: 20, min: 10 },
    };
    expect(isAnswerValid(numberStep, 9)).toBe(false);
    expect(isAnswerValid(numberStep, 10)).toBe(true);
    expect(isAnswerValid(numberStep, 20)).toBe(true);
    expect(isAnswerValid(numberStep, 21)).toBe(false);

    const dateStep = {
      ...base,
      allowUnknown: false,
      required: true,
      type: "date" as const,
      validation: {
        kind: "date_range" as const,
        max: "2026-12-31",
        min: "2026-01-01",
      },
    };
    expect(isAnswerValid(dateStep, "2025-12-31")).toBe(false);
    expect(isAnswerValid(dateStep, "2026-07-29")).toBe(true);
    expect(isAnswerValid(dateStep, "2027-01-01")).toBe(false);
  });

  it("rejects constraints that do not match the step type", () => {
    const choice = testManifest.steps[0];
    if (!choice) throw new Error("Missing fixture step.");
    const invalid = {
      ...testManifest,
      manifestVersion: 2 as const,
      steps: [
        {
          ...choice,
          validation: { kind: "number_range" as const, max: 10, min: 1 },
        },
        ...testManifest.steps.slice(1),
      ],
    };

    expect(() => parseWidgetManifest(invalid)).toThrow(
      "Walidacja liczbowa nie pasuje do typu kroku",
    );
  });
});
