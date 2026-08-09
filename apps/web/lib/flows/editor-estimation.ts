import type { EstimationCondition, FlowDocument } from "@wyceno/validation";

export type EstimationReferenceKind =
  "pricing_condition" | "pricing_quantity" | "scoring_condition";

export type EstimationReference = Readonly<{
  kind: EstimationReferenceKind;
  ruleId: string;
  ruleLabel: string;
}>;

export type EstimationReferenceRemovalResult = Readonly<{
  changed: boolean;
  document: FlowDocument;
  removedReferences: readonly EstimationReference[];
}>;

export function listEstimationReferencesForStep(
  document: FlowDocument,
  stepKey: string,
): EstimationReference[] {
  const estimation = document.estimation;
  if (!estimation) return [];

  const references: EstimationReference[] = [];

  for (const rule of estimation.pricing.rules) {
    if (rule.when.stepKey === stepKey) {
      references.push(toReference("pricing_condition", rule));
    }
    if (rule.operation.type === "add_per_unit" && rule.operation.quantityStepKey === stepKey) {
      references.push(toReference("pricing_quantity", rule));
    }
  }

  for (const rule of estimation.scoring.rules) {
    if (rule.when.stepKey === stepKey) {
      references.push(toReference("scoring_condition", rule));
    }
  }

  return references;
}

export function listEstimationReferencesForOption(
  document: FlowDocument,
  stepKey: string,
  optionKey: string,
): EstimationReference[] {
  const estimation = document.estimation;
  if (!estimation) return [];

  const references: EstimationReference[] = [];

  for (const rule of estimation.pricing.rules) {
    if (conditionReferencesOption(rule.when, stepKey, optionKey)) {
      references.push(toReference("pricing_condition", rule));
    }
  }

  for (const rule of estimation.scoring.rules) {
    if (conditionReferencesOption(rule.when, stepKey, optionKey)) {
      references.push(toReference("scoring_condition", rule));
    }
  }

  return references;
}

export function removeEstimationReferencesForStep(
  document: FlowDocument,
  stepKey: string,
): EstimationReferenceRemovalResult {
  const removedReferences = listEstimationReferencesForStep(document, stepKey);
  const estimation = document.estimation;
  if (!estimation || removedReferences.length === 0) return unchanged(document);

  return {
    changed: true,
    document: {
      ...document,
      estimation: {
        ...estimation,
        pricing: {
          ...estimation.pricing,
          rules: estimation.pricing.rules.filter(
            (rule) =>
              rule.when.stepKey !== stepKey &&
              !(
                rule.operation.type === "add_per_unit" && rule.operation.quantityStepKey === stepKey
              ),
          ),
        },
        scoring: {
          ...estimation.scoring,
          rules: estimation.scoring.rules.filter((rule) => rule.when.stepKey !== stepKey),
        },
      },
    },
    removedReferences,
  };
}

export function removeEstimationReferencesForOption(
  document: FlowDocument,
  stepKey: string,
  optionKey: string,
): EstimationReferenceRemovalResult {
  const removedReferences = listEstimationReferencesForOption(document, stepKey, optionKey);
  const estimation = document.estimation;
  if (!estimation || removedReferences.length === 0) return unchanged(document);

  return {
    changed: true,
    document: {
      ...document,
      estimation: {
        ...estimation,
        pricing: {
          ...estimation.pricing,
          rules: estimation.pricing.rules.filter(
            (rule) => !conditionReferencesOption(rule.when, stepKey, optionKey),
          ),
        },
        scoring: {
          ...estimation.scoring,
          rules: estimation.scoring.rules.filter(
            (rule) => !conditionReferencesOption(rule.when, stepKey, optionKey),
          ),
        },
      },
    },
    removedReferences,
  };
}

function conditionReferencesOption(
  condition: EstimationCondition,
  stepKey: string,
  optionKey: string,
): boolean {
  return (
    condition.stepKey === stepKey &&
    condition.operator !== "answered" &&
    condition.value === optionKey
  );
}

function toReference(
  kind: EstimationReferenceKind,
  rule: Readonly<{ id: string; label: string }>,
): EstimationReference {
  return {
    kind,
    ruleId: rule.id,
    ruleLabel: rule.label,
  };
}

function unchanged(document: FlowDocument): EstimationReferenceRemovalResult {
  return {
    changed: false,
    document,
    removedReferences: [],
  };
}
