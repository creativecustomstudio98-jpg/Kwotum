import type { FlowDocument } from "@wyceno/validation";

export type FlowQuestionDropEdge = "after" | "before";

export type FlowQuestionReorderResult = Readonly<{
  changed: boolean;
  document: FlowDocument;
  position: number | null;
  sectionTitle: string | null;
}>;

export function reorderFlowQuestion(
  document: FlowDocument,
  sourceStepKey: string,
  targetStepKey: string,
  edge: FlowQuestionDropEdge,
): FlowQuestionReorderResult {
  const sourceIndex = document.steps.findIndex((step) => step.key === sourceStepKey);
  const targetIndex = document.steps.findIndex((step) => step.key === targetStepKey);
  if (sourceIndex < 0 || targetIndex < 0 || sourceStepKey === targetStepKey) {
    return unchanged(document);
  }

  const targetSectionKey = document.steps[targetIndex]?.sectionKey;
  const steps = [...document.steps];
  const [sourceStep] = steps.splice(sourceIndex, 1);
  if (!sourceStep || !targetSectionKey) return unchanged(document);

  const targetIndexAfterRemoval = steps.findIndex((step) => step.key === targetStepKey);
  if (targetIndexAfterRemoval < 0) return unchanged(document);

  const insertionIndex = targetIndexAfterRemoval + (edge === "after" ? 1 : 0);
  steps.splice(insertionIndex, 0, { ...sourceStep, sectionKey: targetSectionKey });

  if (
    document.steps.every(
      (step, index) =>
        step.key === steps[index]?.key && step.sectionKey === steps[index]?.sectionKey,
    )
  ) {
    return unchanged(document);
  }

  const sections = document.sections;
  const sectionTitle = sections.find((section) => section.key === targetSectionKey)?.title ?? null;
  const position =
    steps
      .filter((step) => step.sectionKey === targetSectionKey)
      .findIndex((step) => step.key === sourceStepKey) + 1;

  return {
    changed: true,
    document: { ...document, sections, steps },
    position: position > 0 ? position : null,
    sectionTitle,
  };
}

function unchanged(document: FlowDocument): FlowQuestionReorderResult {
  return {
    changed: false,
    document,
    position: null,
    sectionTitle: null,
  };
}
