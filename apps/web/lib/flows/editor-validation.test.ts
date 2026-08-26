import { flowTemplates, type FlowDocument } from "@wyceno/validation";
import { describe, expect, it } from "vitest";

import { validateFlowEditor } from "./editor-validation";

function document(): FlowDocument {
  return structuredClone(flowTemplates[0]!.snapshot);
}

describe("validateFlowEditor", () => {
  it("allows saving and publishing a valid process", () => {
    const result = validateFlowEditor(document(), "Proces kwalifikacji");

    expect(result).toMatchObject({
      canPublish: true,
      canSave: true,
      graphValid: true,
      issues: [],
      schemaValid: true,
    });
  });

  it("blocks saving a structurally invalid question and maps the issue to its field", () => {
    const source = document();
    source.steps[0]!.title = "";
    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.canSave).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        field: "title",
        message: "Treść pytania jest wymagana.",
        stepKey: source.steps[0]!.key,
      }),
    );
  });

  it("maps invalid public form copy independently from a question title", () => {
    const source = document();
    source.title = " ";
    source.intro = " ";
    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.canSave).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "publicTitle",
          message: "Tytuł formularza musi mieć od 2 do 160 znaków.",
          stepKey: null,
        }),
        expect.objectContaining({
          field: "intro",
          message: "Wprowadzenie do formularza jest wymagane.",
          stepKey: null,
        }),
      ]),
    );
  });

  it("reports inverted numeric boundaries in Polish", () => {
    const source = document();
    const numericStep = source.steps.find((step) => step.type === "number")!;
    numericStep.validation = { kind: "number_range", max: 10, min: 20 };
    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.canSave).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        field: "validation",
        message: "Minimalna wartość nie może przekraczać maksymalnej.",
        stepKey: numericStep.key,
      }),
    );
  });

  it("maps an invalid answer to the exact option index", () => {
    const source = document();
    source.steps[0]!.options[1]!.label = "";
    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        field: "option",
        message: "Uzupełnij treść opcji 2.",
        optionIndex: 1,
        stepKey: source.steps[0]!.key,
      }),
    );
  });

  it("blocks an incomplete text-card presentation and points to its description", () => {
    const source = document();
    const choiceStep = source.steps.find((step) => step.type === "single_choice")!;
    choiceStep.presentation = { variant: "text_cards" };
    choiceStep.options = choiceStep.options.map((option) => ({
      ...option,
      presentation: { description: "" },
    }));

    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.canSave).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        field: "presentation",
        message: "Uzupełnij opis karty (od 1 do 180 znaków).",
        optionIndex: 0,
        stepKey: choiceStep.key,
      }),
    );
  });

  it("allows saving but blocks publishing a schema-valid cyclic graph", () => {
    const source = document();
    source.steps[0]!.nextStepKey = source.steps[0]!.key;
    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.schemaValid).toBe(true);
    expect(result.canSave).toBe(true);
    expect(result.canPublish).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "graph",
          message: expect.stringContaining("pętlę"),
        }),
      ]),
    );
  });

  it("blocks saving when quick form would silently flatten a branching process", () => {
    const source = document();
    source.experienceMode = "quick_form";
    const result = validateFlowEditor(source, "Krótki formularz");

    expect(result.schemaValid).toBe(true);
    expect(result.canSave).toBe(false);
    expect(result.canPublish).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "experience",
          message: expect.stringContaining("Krótki formularz"),
        }),
      ]),
    );
  });

  it("maps an empty-section graph issue to the exact section", () => {
    const source = document();
    source.sections.push({ key: "pusta_sekcja", title: "Pusta sekcja" });
    const result = validateFlowEditor(source, "Proces kwalifikacji");

    expect(result.canSave).toBe(true);
    expect(result.canPublish).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        field: "graph",
        sectionKey: "pusta_sekcja",
        stepKey: null,
      }),
    );
  });

  it("validates the process name independently from the document", () => {
    const result = validateFlowEditor(document(), " ");

    expect(result.canSave).toBe(false);
    expect(result.issues[0]).toMatchObject({
      field: "name",
      message: "Nazwa procesu musi mieć co najmniej 2 znaki.",
    });
  });
});
