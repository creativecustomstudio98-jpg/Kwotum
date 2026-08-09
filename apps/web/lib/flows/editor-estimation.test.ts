import {
  flowDocumentSchema,
  flowTemplates,
  validateFlowDocument,
  type FlowDocument,
} from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import {
  listEstimationReferencesForOption,
  listEstimationReferencesForStep,
  removeEstimationReferencesForOption,
  removeEstimationReferencesForStep,
} from "./editor-estimation";

function documentWithEstimation(): FlowDocument {
  const source = structuredClone(flowTemplates[0]!.snapshot);
  const choiceStep = source.steps[0]!;
  const quantityStep = source.steps.find((step) => step.type === "number")!;
  const unrelatedStep = source.steps[1]!;

  return flowDocumentSchema.parse({
    ...source,
    estimation: {
      estimationSchemaVersion: 1,
      pricing: {
        baseMaxMinor: 1_500_000,
        baseMinMinor: 1_000_000,
        currency: "PLN",
        presentation: "range",
        roundingIncrementMinor: 10_000,
        rules: [
          {
            id: "cena_rodzaj",
            label: "Dopłata za kuchnię",
            operation: { maxMinor: 200_000, minMinor: 100_000, type: "add" },
            when: {
              operator: "equals",
              stepKey: choiceStep.key,
              value: choiceStep.options[0]!.key,
            },
          },
          {
            id: "cena_za_wymiar",
            label: "Stawka za wymiar",
            operation: {
              maxPerUnitMinor: 2_000,
              minPerUnitMinor: 1_000,
              quantityStepKey: quantityStep.key,
              type: "add_per_unit",
            },
            when: { operator: "answered", stepKey: choiceStep.key },
          },
          {
            id: "cena_niezalezna",
            label: "Niezależna dopłata",
            operation: { basisPoints: 11_000, type: "multiply" },
            when: { operator: "answered", stepKey: unrelatedStep.key },
          },
        ],
      },
      scoring: {
        categories: [
          { key: "standard", label: "Standard", minPoints: 0 },
          { key: "priorytet", label: "Priorytet", minPoints: 50 },
        ],
        initialPoints: 10,
        rules: [
          {
            id: "punkty_rodzaj",
            label: "Punkty za kuchnię",
            points: 20,
            when: {
              operator: "equals",
              stepKey: choiceStep.key,
              value: choiceStep.options[0]!.key,
            },
          },
          {
            id: "punkty_niezalezne",
            label: "Niezależne punkty",
            points: 5,
            when: { operator: "answered", stepKey: unrelatedStep.key },
          },
        ],
      },
    },
  });
}

describe("estimation references in the flow editor", () => {
  it("lists condition, quantity and scoring references for a question", () => {
    const source = documentWithEstimation();
    const choiceStep = source.steps[0]!;
    const quantityStep = source.steps.find((step) => step.type === "number")!;

    expect(listEstimationReferencesForStep(source, choiceStep.key)).toEqual([
      { kind: "pricing_condition", ruleId: "cena_rodzaj", ruleLabel: "Dopłata za kuchnię" },
      { kind: "pricing_condition", ruleId: "cena_za_wymiar", ruleLabel: "Stawka za wymiar" },
      { kind: "scoring_condition", ruleId: "punkty_rodzaj", ruleLabel: "Punkty za kuchnię" },
    ]);
    expect(listEstimationReferencesForStep(source, quantityStep.key)).toEqual([
      { kind: "pricing_quantity", ruleId: "cena_za_wymiar", ruleLabel: "Stawka za wymiar" },
    ]);
  });

  it("removes every price and score dependency for a deleted question atomically", () => {
    const source = documentWithEstimation();
    const before = structuredClone(source);
    const choiceStep = source.steps[0]!;
    const result = removeEstimationReferencesForStep(source, choiceStep.key);

    expect(result.changed).toBe(true);
    expect(result.removedReferences).toHaveLength(3);
    expect(result.document.estimation!.pricing.rules.map((rule) => rule.id)).toEqual([
      "cena_niezalezna",
    ]);
    expect(result.document.estimation!.scoring.rules.map((rule) => rule.id)).toEqual([
      "punkty_niezalezne",
    ]);
    expect(source).toEqual(before);
  });

  it("removes a quantity rule when its numeric source question is deleted", () => {
    const source = documentWithEstimation();
    const quantityStep = source.steps.find((step) => step.type === "number")!;
    const result = removeEstimationReferencesForStep(source, quantityStep.key);

    expect(result.document.estimation!.pricing.rules.map((rule) => rule.id)).toEqual([
      "cena_rodzaj",
      "cena_niezalezna",
    ]);
    expect(result.document.estimation!.scoring.rules).toEqual(source.estimation!.scoring.rules);
  });

  it("lists and removes only rules that reference the selected option", () => {
    const source = documentWithEstimation();
    const choiceStep = source.steps[0]!;
    const optionKey = choiceStep.options[0]!.key;

    expect(listEstimationReferencesForOption(source, choiceStep.key, optionKey)).toEqual([
      { kind: "pricing_condition", ruleId: "cena_rodzaj", ruleLabel: "Dopłata za kuchnię" },
      { kind: "scoring_condition", ruleId: "punkty_rodzaj", ruleLabel: "Punkty za kuchnię" },
    ]);

    const result = removeEstimationReferencesForOption(source, choiceStep.key, optionKey);
    expect(result.document.estimation!.pricing.rules.map((rule) => rule.id)).toEqual([
      "cena_za_wymiar",
      "cena_niezalezna",
    ]);
    expect(result.document.estimation!.scoring.rules.map((rule) => rule.id)).toEqual([
      "punkty_niezalezne",
    ]);
  });

  it("returns the original document when there is no estimation or matching reference", () => {
    const source = structuredClone(flowTemplates[0]!.snapshot);
    const withEstimation = documentWithEstimation();
    const choiceStep = withEstimation.steps[0]!;

    for (const result of [
      removeEstimationReferencesForStep(source, source.steps[0]!.key),
      removeEstimationReferencesForStep(withEstimation, "brak_pytania"),
      removeEstimationReferencesForOption(withEstimation, choiceStep.key, "brak_opcji"),
    ]) {
      expect(result.changed).toBe(false);
      expect(result.removedReferences).toEqual([]);
    }

    expect(removeEstimationReferencesForStep(source, source.steps[0]!.key).document).toBe(source);
    expect(removeEstimationReferencesForStep(withEstimation, "brak_pytania").document).toBe(
      withEstimation,
    );
  });

  it("keeps the cleaned estimation contract schema-valid", () => {
    const source = documentWithEstimation();
    const choiceStep = source.steps[0]!;
    const optionKey = choiceStep.options[0]!.key;
    const cleaned = removeEstimationReferencesForOption(source, choiceStep.key, optionKey).document;

    expect(flowDocumentSchema.safeParse(cleaned).success).toBe(true);
    expect(validateFlowDocument(cleaned).issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "CONDITION_OPTION_NOT_FOUND" }),
        expect.objectContaining({ code: "INVALID_QUANTITY_STEP" }),
      ]),
    );
  });
});
