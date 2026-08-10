import type { FlowDocument, FlowSection, FlowStep } from "@wyceno/validation";

export type FlowSectionMutationResult = Readonly<{
  changed: boolean;
  document: FlowDocument;
  movedQuestionCount: number;
  position: number | null;
  sectionKey: string | null;
  sectionTitle: string | null;
}>;

export function addFlowSection(
  document: FlowDocument,
  section: FlowSection,
  firstStep: FlowStep,
  afterSectionKey: string,
): FlowSectionMutationResult {
  if (
    document.sections.length >= 20 ||
    document.steps.length >= 40 ||
    document.sections.some((item) => item.key === section.key) ||
    document.steps.some((step) => step.key === firstStep.key)
  ) {
    return unchanged(document);
  }

  const anchorSectionIndex = document.sections.findIndex((item) => item.key === afterSectionKey);
  if (anchorSectionIndex < 0) return unchanged(document);

  const sections = [...document.sections];
  sections.splice(anchorSectionIndex + 1, 0, section);

  const anchorStepIndex = findLastStepIndex(document, afterSectionKey);
  if (anchorStepIndex < 0) return unchanged(document);
  const anchorStep = document.steps[anchorStepIndex];
  if (!anchorStep) return unchanged(document);

  const step: FlowStep = {
    ...firstStep,
    nextStepKey: anchorStep.nextStepKey,
    sectionKey: section.key,
  };
  const steps = document.steps.map((item, index) =>
    index === anchorStepIndex ? { ...item, nextStepKey: step.key } : item,
  );
  steps.splice(anchorStepIndex + 1, 0, step);

  return {
    changed: true,
    document: { ...document, sections, steps },
    movedQuestionCount: 0,
    position: anchorSectionIndex + 2,
    sectionKey: section.key,
    sectionTitle: section.title,
  };
}

export function addFlowQuestionToSection(
  document: FlowDocument,
  sectionKey: string,
  question: FlowStep,
): FlowSectionMutationResult {
  const sectionIndex = document.sections.findIndex((section) => section.key === sectionKey);
  if (
    sectionIndex < 0 ||
    document.steps.length >= 40 ||
    document.steps.some((step) => step.key === question.key)
  ) {
    return unchanged(document);
  }

  const lastStepIndex = findLastStepIndex(document, sectionKey);
  if (lastStepIndex >= 0) {
    const anchorStep = document.steps[lastStepIndex];
    if (!anchorStep) return unchanged(document);
    const step: FlowStep = {
      ...question,
      nextStepKey: anchorStep.nextStepKey,
      sectionKey,
    };
    const steps = document.steps.map((item, index) =>
      index === lastStepIndex ? { ...item, nextStepKey: step.key } : item,
    );
    steps.splice(lastStepIndex + 1, 0, step);
    return {
      changed: true,
      document: { ...document, steps },
      movedQuestionCount: 0,
      position: steps.filter((item) => item.sectionKey === sectionKey).length,
      sectionKey,
      sectionTitle: document.sections[sectionIndex]?.title ?? null,
    };
  }

  const nextSectionKeys = new Set(
    document.sections.slice(sectionIndex + 1).map((section) => section.key),
  );
  const insertionIndex = document.steps.findIndex((step) => nextSectionKeys.has(step.sectionKey));
  const resolvedInsertionIndex = insertionIndex < 0 ? document.steps.length : insertionIndex;
  const previousStep = document.steps[resolvedInsertionIndex - 1];
  const step: FlowStep = {
    ...question,
    nextStepKey: previousStep?.nextStepKey ?? document.entryStepKey,
    sectionKey,
  };
  const steps = document.steps.map((item, index) =>
    previousStep && index === resolvedInsertionIndex - 1
      ? { ...item, nextStepKey: step.key }
      : item,
  );
  steps.splice(resolvedInsertionIndex, 0, step);

  return {
    changed: true,
    document: {
      ...document,
      entryStepKey: previousStep ? document.entryStepKey : step.key,
      steps,
    },
    movedQuestionCount: 0,
    position: 1,
    sectionKey,
    sectionTitle: document.sections[sectionIndex]?.title ?? null,
  };
}

export function renameFlowSection(
  document: FlowDocument,
  sectionKey: string,
  title: string,
): FlowSectionMutationResult {
  const trimmedTitle = title.trim();
  const section = document.sections.find((item) => item.key === sectionKey);
  if (!section || trimmedTitle.length === 0 || trimmedTitle.length > 120) {
    return unchanged(document);
  }
  if (section.title === trimmedTitle) return unchanged(document);

  return {
    changed: true,
    document: {
      ...document,
      sections: document.sections.map((item) =>
        item.key === sectionKey ? { ...item, title: trimmedTitle } : item,
      ),
    },
    movedQuestionCount: 0,
    position: document.sections.findIndex((item) => item.key === sectionKey) + 1,
    sectionKey,
    sectionTitle: trimmedTitle,
  };
}

export function reorderFlowSection(
  document: FlowDocument,
  sectionKey: string,
  delta: -1 | 1,
): FlowSectionMutationResult {
  const sourceIndex = document.sections.findIndex((section) => section.key === sectionKey);
  const destinationIndex = sourceIndex + delta;
  if (sourceIndex < 0 || destinationIndex < 0 || destinationIndex >= document.sections.length) {
    return unchanged(document);
  }

  const sections = [...document.sections];
  const [section] = sections.splice(sourceIndex, 1);
  if (!section) return unchanged(document);
  sections.splice(destinationIndex, 0, section);

  return {
    changed: true,
    document: {
      ...document,
      sections,
      steps: groupStepsBySection(document.steps, sections),
    },
    movedQuestionCount: document.steps.filter((step) => step.sectionKey === sectionKey).length,
    position: destinationIndex + 1,
    sectionKey,
    sectionTitle: section.title,
  };
}

export function removeFlowSection(
  document: FlowDocument,
  sectionKey: string,
  targetSectionKey: string,
): FlowSectionMutationResult {
  if (
    document.sections.length <= 1 ||
    sectionKey === targetSectionKey ||
    !document.sections.some((section) => section.key === sectionKey)
  ) {
    return unchanged(document);
  }
  const targetSection = document.sections.find((section) => section.key === targetSectionKey);
  if (!targetSection) return unchanged(document);

  const movedQuestionCount = document.steps.filter((step) => step.sectionKey === sectionKey).length;
  const sections = document.sections.filter((section) => section.key !== sectionKey);
  const reassignedSteps = document.steps.map((step) =>
    step.sectionKey === sectionKey ? { ...step, sectionKey: targetSectionKey } : step,
  );

  return {
    changed: true,
    document: {
      ...document,
      sections,
      steps: groupStepsBySection(reassignedSteps, sections),
    },
    movedQuestionCount,
    position: sections.findIndex((section) => section.key === targetSectionKey) + 1,
    sectionKey: targetSection.key,
    sectionTitle: targetSection.title,
  };
}

function findLastStepIndex(document: FlowDocument, sectionKey: string): number {
  return document.steps.reduce(
    (lastIndex, step, index) => (step.sectionKey === sectionKey ? index : lastIndex),
    -1,
  );
}

function groupStepsBySection(
  steps: readonly FlowStep[],
  sections: readonly FlowSection[],
): FlowStep[] {
  return sections.flatMap((section) => steps.filter((step) => step.sectionKey === section.key));
}

function unchanged(document: FlowDocument): FlowSectionMutationResult {
  return {
    changed: false,
    document,
    movedQuestionCount: 0,
    position: null,
    sectionKey: null,
    sectionTitle: null,
  };
}
