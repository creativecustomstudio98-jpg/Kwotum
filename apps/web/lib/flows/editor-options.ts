import type { FlowDocument } from "@wyceno/validation";

export type FlowOptionDropEdge = "after" | "before";

export type FlowOptionReorderResult = Readonly<{
  changed: boolean;
  document: FlowDocument;
  optionLabel: string | null;
  position: number | null;
}>;

export function reorderFlowOption(
  document: FlowDocument,
  stepKey: string,
  sourceOptionKey: string,
  targetOptionKey: string,
  edge: FlowOptionDropEdge,
): FlowOptionReorderResult {
  const stepIndex = document.steps.findIndex((step) => step.key === stepKey);
  const step = document.steps[stepIndex];
  if (!step || sourceOptionKey === targetOptionKey) return unchanged(document);

  const sourceIndex = step.options.findIndex((option) => option.key === sourceOptionKey);
  const targetIndex = step.options.findIndex((option) => option.key === targetOptionKey);
  if (sourceIndex < 0 || targetIndex < 0) return unchanged(document);

  const options = [...step.options];
  const [sourceOption] = options.splice(sourceIndex, 1);
  if (!sourceOption) return unchanged(document);

  const targetIndexAfterRemoval = options.findIndex((option) => option.key === targetOptionKey);
  if (targetIndexAfterRemoval < 0) return unchanged(document);

  const insertionIndex = targetIndexAfterRemoval + (edge === "after" ? 1 : 0);
  options.splice(insertionIndex, 0, sourceOption);

  if (step.options.every((option, index) => option.key === options[index]?.key)) {
    return unchanged(document);
  }

  const steps = [...document.steps];
  steps[stepIndex] = { ...step, options };

  return {
    changed: true,
    document: { ...document, steps },
    optionLabel: sourceOption.label,
    position: options.findIndex((option) => option.key === sourceOptionKey) + 1,
  };
}

function unchanged(document: FlowDocument): FlowOptionReorderResult {
  return {
    changed: false,
    document,
    optionLabel: null,
    position: null,
  };
}
