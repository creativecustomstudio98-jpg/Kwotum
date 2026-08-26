import { describe, expect, it } from "vitest";

import { isAnswerValid, parseWidgetManifest, resolveNextStep } from "./manifest.js";
import { quickTestManifest, testManifest } from "./test-fixtures.js";

describe("widget manifest", () => {
  it("parses the allowlisted contract and rejects a bad hash", () => {
    expect(parseWidgetManifest(testManifest)).toEqual(testManifest);
    expect(() => parseWidgetManifest({ ...testManifest, snapshotHash: "not-a-hash" })).toThrow(
      "Manifest ma nieprawidłową strukturę",
    );
  });

  it("accepts only the runtime Turnstile contract", () => {
    const configured = {
      ...testManifest,
      challenge: {
        action: "kwotum_lead_submit" as const,
        appearance: "interaction-only" as const,
        provider: "turnstile" as const,
        siteKey: "1x00000000000000000000AA",
      },
    };
    expect(parseWidgetManifest(configured).challenge).toEqual(configured.challenge);
    expect(() =>
      parseWidgetManifest({
        ...configured,
        challenge: { ...configured.challenge, action: "untrusted_action" },
      }),
    ).toThrow("Nieprawidłowa konfiguracja zabezpieczenia formularza");
  });

  it("accepts derived branding contrast and rejects CSS-like accent injection", () => {
    const branded = {
      ...testManifest,
      branding: {
        accentColor: "#F4D35E",
        accentTextColor: "#000000" as const,
        companyName: "Studio Forma",
        logoUrl: null,
      },
    };
    expect(parseWidgetManifest(branded).branding).toEqual(branded.branding);
    expect(() =>
      parseWidgetManifest({
        ...branded,
        branding: { ...branded.branding, accentColor: "url(x)" },
      }),
    ).toThrow("Nieprawidłowa konfiguracja brandingu");
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

  it("parses manifest v3 without changing answer behavior", () => {
    const manifestV3 = {
      ...testManifest,
      experienceMode: "visual_configurator" as const,
      manifestVersion: 3 as const,
      steps: testManifest.steps.map((step, stepIndex) => ({
        ...step,
        options: step.options.map((option, optionIndex) => ({
          ...option,
          presentation:
            stepIndex === 0
              ? {
                  description: "Wariant opisany bez dowolnego kodu.",
                  icon: optionIndex === 0 ? ("check" as const) : ("sparkles" as const),
                }
              : null,
        })),
        presentation: { variant: stepIndex === 0 ? ("icon_cards" as const) : ("default" as const) },
      })),
    };

    const parsed = parseWidgetManifest(manifestV3);
    expect(parsed).toEqual(manifestV3);
    expect(isAnswerValid(parsed.steps[0]!, "standard")).toBe(true);
  });

  it("rejects a branching or oversized quick-form manifest", () => {
    expect(parseWidgetManifest(quickTestManifest)).toEqual(quickTestManifest);
    const branching = {
      ...quickTestManifest,
      steps: quickTestManifest.steps.map((step, stepIndex) => ({
        ...step,
        options: step.options.map((option, optionIndex) => ({
          ...option,
          overridesNextStep: stepIndex === 0 && optionIndex === 0 ? true : option.overridesNextStep,
        })),
      })),
    };
    expect(() => parseWidgetManifest(branching)).toThrow("jednej liniowej trasie");

    const oversized = {
      ...quickTestManifest,
      entryStepKey: "field_0",
      steps: Array.from({ length: 9 }, (_, index) => ({
        ...quickTestManifest.steps[2]!,
        key: `field_${index}`,
        nextStepKey: index < 8 ? `field_${index + 1}` : null,
      })),
    };
    expect(() => parseWidgetManifest(oversized)).toThrow("maksymalnie 8 pytań");
  });

  it("rejects unallowlisted icons, asset URLs and presentation metadata", () => {
    const manifestV3 = {
      ...testManifest,
      experienceMode: "visual_configurator" as const,
      manifestVersion: 3 as const,
      steps: testManifest.steps.map((step) => ({
        ...step,
        options: step.options.map((option) => ({ ...option, presentation: null })),
        presentation: { variant: "default" as const },
      })),
    };
    const option = manifestV3.steps[0]!.options[0]!;

    expect(() =>
      parseWidgetManifest({
        ...manifestV3,
        steps: [
          {
            ...manifestV3.steps[0],
            options: [
              {
                ...option,
                presentation: {
                  asset: { alt: "Wariant", id: "https://example.test/image.jpg" },
                  html: "<img src=x onerror=alert(1)>",
                  icon: "uploaded_svg",
                  url: "data:image/svg+xml;base64,PHN2Zz4=",
                },
              },
              ...manifestV3.steps[0]!.options.slice(1),
            ],
          },
          ...manifestV3.steps.slice(1),
        ],
      }),
    ).toThrow();
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
