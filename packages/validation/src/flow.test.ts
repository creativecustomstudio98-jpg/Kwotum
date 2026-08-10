import { describe, expect, it } from "vitest";

import {
  flowDocumentSchema,
  flowDocumentV1Schema,
  upgradeFlowDocument,
  validateFlowDocument,
  type FlowDocument,
  type FlowDocumentV1,
} from "./flow";
import { flowTemplates } from "./templates";

describe("flow graph validation", () => {
  const baseDocument = structuredClone(flowTemplates[0]?.snapshot) as FlowDocument;

  function legacyDocument(): FlowDocumentV1 {
    const document = structuredClone(baseDocument);
    return flowDocumentV1Schema.parse({
      entryStepKey: document.entryStepKey,
      ...(document.estimation ? { estimation: document.estimation } : {}),
      intro: document.intro,
      ...(document.leadCapture ? { leadCapture: document.leadCapture } : {}),
      result: document.result,
      rules: document.rules,
      schemaVersion: 1,
      steps: document.steps.map((step) => ({
        allowUnknown: step.allowUnknown,
        ...(step.description ? { description: step.description } : {}),
        key: step.key,
        nextStepKey: step.nextStepKey,
        options: step.options,
        required: step.required,
        title: step.title,
        type: step.type,
      })),
      title: document.title,
    });
  }

  it("accepts every maintained industry template", () => {
    expect(flowTemplates).toHaveLength(5);
    expect(flowTemplates.filter((template) => template.priority)).toHaveLength(3);
    for (const template of flowTemplates) {
      expect(validateFlowDocument(template.snapshot)).toEqual({
        issues: [],
        valid: true,
      });
    }
  });

  it("requires the three priority templates to contain a full interview", () => {
    for (const template of flowTemplates.filter((item) => item.priority)) {
      expect(template.snapshot.schemaVersion).toBe(2);
      expect(template.snapshot.sections.length).toBeGreaterThan(0);
      expect(template.snapshot.steps.length).toBeGreaterThanOrEqual(7);
    }
  });

  it("upgrades v1 deterministically without mutating the legacy document", () => {
    const legacy = legacyDocument();
    const before = structuredClone(legacy);
    const first = upgradeFlowDocument(legacy);
    const second = upgradeFlowDocument(legacy);

    expect(first).toEqual(second);
    expect(legacy).toEqual(before);
    expect(first.schemaVersion).toBe(2);
    expect(first.sections.map((section) => section.title)).toEqual([
      "Informacje podstawowe",
      "Potrzeby i cele",
      "Budżet i realizacja",
      "Dodatkowe informacje",
    ]);
    expect(
      first.steps.every((step) => first.sections.some(({ key }) => key === step.sectionKey)),
    ).toBe(true);
    expect(validateFlowDocument(first)).toEqual({ issues: [], valid: true });
  });

  it("detects missing, empty and out-of-order sections", () => {
    const document = structuredClone(baseDocument);
    const firstStep = document.steps[0];
    const lastStep = document.steps.at(-1);
    if (!firstStep || !lastStep) throw new Error("Fixture requires steps.");
    document.sections.push({ key: "pusta_sekcja", title: "Pusta sekcja" });
    firstStep.sectionKey = "brakujaca_sekcja";
    lastStep.sectionKey = document.sections[0]!.key;

    expect(validateFlowDocument(document).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "SECTION_NOT_FOUND" }),
        expect.objectContaining({ code: "EMPTY_SECTION" }),
        expect.objectContaining({ code: "SECTION_ORDER_INVALID" }),
      ]),
    );
  });

  it("requires validation constraints to match the step type", () => {
    const document = structuredClone(baseDocument);
    const choiceStep = document.steps[0];
    if (!choiceStep) throw new Error("Fixture requires a choice step.");
    choiceStep.validation = {
      kind: "text_length",
      maxLength: 120,
      minLength: 2,
    };

    expect(validateFlowDocument(document).issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "INVALID_STEP_VALIDATION" })]),
    );
  });

  it("rejects inverted numeric and date validation ranges at the schema boundary", () => {
    const numeric = structuredClone(baseDocument);
    const numericStep = numeric.steps.find((step) => step.type === "number");
    if (!numericStep) throw new Error("Fixture requires a number step.");
    numericStep.validation = { kind: "number_range", max: 10, min: 20 };

    const dated = structuredClone(baseDocument);
    const dateStep = dated.steps.find((step) => step.type === "date");
    if (!dateStep) throw new Error("Fixture requires a date step.");
    dateStep.validation = {
      kind: "date_range",
      max: "2026-01-01",
      min: "2026-02-01",
    };

    expect(flowDocumentSchema.safeParse(numeric).success).toBe(false);
    expect(flowDocumentSchema.safeParse(dated).success).toBe(false);
  });

  it("detects a cycle", () => {
    const document = structuredClone(baseDocument);
    const finalStep = document.steps.at(-1);
    if (!finalStep) throw new Error("Fixture requires a final step.");
    finalStep.nextStepKey = document.entryStepKey;

    expect(validateFlowDocument(document).issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "FLOW_CYCLE" })]),
    );
  });

  it("detects unreachable and missing target steps", () => {
    const document = structuredClone(baseDocument);
    const firstStep = document.steps[0];
    if (!firstStep) throw new Error("Fixture requires a first step.");
    firstStep.nextStepKey = "missing_step";

    const issues = validateFlowDocument(document).issues;
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TARGET_STEP_NOT_FOUND" }),
        expect.objectContaining({ code: "UNREACHABLE_STEP" }),
      ]),
    );
  });

  it("detects duplicate options and a condition referencing a missing option", () => {
    const document = structuredClone(baseDocument);
    const firstStep = document.steps[0];
    const firstRule = document.rules[0];
    if (!firstStep || !firstRule || firstStep.options.length < 2) {
      throw new Error("Fixture requires options and a rule.");
    }
    const firstOption = firstStep.options[0];
    const secondOption = firstStep.options[1];
    if (!firstOption || !secondOption) {
      throw new Error("Fixture requires two options.");
    }
    secondOption.key = firstOption.key;
    firstRule.when.value = "missing_option";

    expect(validateFlowDocument(document).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "DUPLICATE_OPTION_KEY" }),
        expect.objectContaining({ code: "CONDITION_OPTION_NOT_FOUND" }),
      ]),
    );
  });

  it("validates estimation references and quantity fields", () => {
    const document = structuredClone(baseDocument);
    document.estimation = {
      estimationSchemaVersion: 1,
      pricing: {
        baseMaxMinor: 20_000,
        baseMinMinor: 10_000,
        currency: "PLN",
        presentation: "range",
        roundingIncrementMinor: 100,
        rules: [
          {
            id: "unknown_reference",
            label: "Niepoprawna reguła",
            operation: {
              maxPerUnitMinor: 200,
              minPerUnitMinor: 100,
              quantityStepKey: "missing_quantity",
              type: "add_per_unit",
            },
            when: { operator: "answered", stepKey: "missing_condition" },
          },
        ],
      },
      scoring: {
        categories: [{ key: "base", label: "Bazowy", minPoints: 0 }],
        initialPoints: 0,
        rules: [],
      },
    };

    expect(validateFlowDocument(document).issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "CONDITION_STEP_NOT_FOUND" }),
        expect.objectContaining({ code: "INVALID_QUANTITY_STEP" }),
      ]),
    );
  });
});
