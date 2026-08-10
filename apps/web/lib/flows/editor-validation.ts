import { flowDocumentSchema, validateFlowDocument, type FlowDocument } from "@wyceno/validation";

export type FlowEditorIssueField =
  "document" | "graph" | "name" | "option" | "title" | "validation";

export type FlowEditorIssue = Readonly<{
  field: FlowEditorIssueField;
  id: string;
  message: string;
  optionIndex: number | null;
  sectionKey: string | null;
  stepKey: string | null;
}>;

export type FlowEditorValidation = Readonly<{
  canPublish: boolean;
  canSave: boolean;
  graphValid: boolean;
  issues: readonly FlowEditorIssue[];
  schemaValid: boolean;
}>;

export function validateFlowEditor(document: FlowDocument, name: string): FlowEditorValidation {
  const issues: FlowEditorIssue[] = [];
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    issues.push({
      field: "name",
      id: "name-too-short",
      message: "Nazwa procesu musi mieć co najmniej 2 znaki.",
      optionIndex: null,
      sectionKey: null,
      stepKey: null,
    });
  }

  const parsed = flowDocumentSchema.safeParse(document);
  if (!parsed.success) {
    for (const [index, issue] of parsed.error.issues.entries()) {
      const path = issue.path.map(String);
      const stepIndex = path[0] === "steps" ? Number(path[1]) : Number.NaN;
      const step = Number.isInteger(stepIndex) ? document.steps[stepIndex] : undefined;
      const sectionIndex = path[0] === "sections" ? Number(path[1]) : Number.NaN;
      const section = Number.isInteger(sectionIndex) ? document.sections[sectionIndex] : undefined;
      const field = editorFieldFromPath(path);
      const optionsPathIndex = path.indexOf("options");
      const optionIndex =
        optionsPathIndex >= 0 && Number.isInteger(Number(path[optionsPathIndex + 1]))
          ? Number(path[optionsPathIndex + 1])
          : null;
      issues.push({
        field,
        id: `schema-${path.join("-") || "document"}-${index}`,
        message: schemaIssueMessage(field, path, issue.message),
        optionIndex,
        sectionKey: section?.key ?? step?.sectionKey ?? null,
        stepKey: step?.key ?? null,
      });
    }
  }

  const schemaValid = parsed.success;
  if (parsed.success) {
    for (const issue of validateFlowDocument(parsed.data).issues) {
      const stepIndexMatch = /^steps\.(\d+)/.exec(issue.path);
      const step = stepIndexMatch ? parsed.data.steps[Number(stepIndexMatch[1])] : undefined;
      const sectionIndexMatch = /^sections\.(\d+)/.exec(issue.path);
      const section = sectionIndexMatch
        ? parsed.data.sections[Number(sectionIndexMatch[1])]
        : undefined;
      issues.push({
        field: issue.code === "INVALID_STEP_VALIDATION" ? "validation" : "graph",
        id: `graph-${issue.code}-${issue.path}`,
        message: issue.message,
        optionIndex: null,
        sectionKey: section?.key ?? step?.sectionKey ?? null,
        stepKey: step?.key ?? null,
      });
    }
  }

  const canSave = trimmedName.length >= 2 && schemaValid;
  const graphValid = schemaValid && issues.every((issue) => issue.field !== "graph");
  return {
    canPublish: canSave && graphValid,
    canSave,
    graphValid,
    issues,
    schemaValid,
  };
}

function editorFieldFromPath(path: readonly string[]): FlowEditorIssueField {
  if (path.includes("title")) return "title";
  if (path.includes("options")) return "option";
  if (path.includes("validation")) return "validation";
  return "document";
}

function schemaIssueMessage(
  field: FlowEditorIssueField,
  path: readonly string[],
  originalMessage: string,
): string {
  if (field === "title") return "Treść pytania jest wymagana.";
  if (field === "option") {
    const optionIndex = path.indexOf("options");
    const position = Number(path[optionIndex + 1]) + 1;
    return Number.isFinite(position)
      ? `Uzupełnij treść opcji ${position}.`
      : "Uzupełnij treści opcji odpowiedzi.";
  }
  if (field === "validation") {
    if (
      originalMessage.includes("Minimalna") ||
      originalMessage.includes("Data") ||
      originalMessage.includes("Zakres")
    ) {
      return originalMessage;
    }
    return "Uzupełnij poprawne granice walidacji odpowiedzi.";
  }
  return "Uzupełnij poprawnie konfigurację procesu.";
}
