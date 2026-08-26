import { describe, expect, it } from "vitest";

import { createWidgetSessionRequestSchema, widgetManifestSchema } from "./widget";

function manifestV3() {
  return {
    entryStepKey: "service",
    experienceMode: "visual_configurator",
    intro: "Odpowiedz na jedno pytanie.",
    leadCapture: null,
    manifestVersion: 3,
    publicId: "f0000000-0000-4000-8000-000000000001",
    publishedAt: "2026-08-25T12:00:00.000Z",
    result: {
      disclaimer: "To nie jest oferta.",
      headline: "Dziękujemy",
      mode: "consultation",
      nextStepLabel: "Przekaż dane do konsultacji",
    },
    rules: [],
    snapshotHash: "a".repeat(64),
    steps: [
      {
        allowUnknown: false,
        description: null,
        key: "service",
        nextStepKey: null,
        options: [
          {
            key: "standard",
            label: "Standard",
            nextStepKey: null,
            overridesNextStep: false,
            presentation: { description: "Wariant podstawowy.", icon: "check" },
          },
        ],
        presentation: { variant: "icon_cards" },
        required: true,
        title: "Jakiego wariantu potrzebujesz?",
        type: "single_choice",
        validation: null,
      },
    ],
    title: "Testowy proces",
  };
}

describe("widget manifest v3 schema", () => {
  it("accepts a complete allowlisted presentation", () => {
    expect(widgetManifestSchema.safeParse(manifestV3()).success).toBe(true);
  });

  it("rejects an incomplete visual variant and arbitrary metadata", () => {
    const manifest = manifestV3();
    const option = manifest.steps[0]!.options[0] as unknown as Record<string, unknown>;
    option.presentation = {
      description: "Wariant podstawowy.",
      icon: "uploaded_svg",
      url: "data:image/svg+xml;base64,PHN2Zz4=",
    };

    expect(widgetManifestSchema.safeParse(manifest).success).toBe(false);
  });
});

describe("widget context request schema", () => {
  it("accepts a small product context and rejects reserved or inflated input", () => {
    expect(
      createWidgetSessionRequestSchema.safeParse({ context: { model: "M2", product_id: "42" } })
        .success,
    ).toBe(true);
    expect(createWidgetSessionRequestSchema.safeParse({ context: { price: "1" } }).success).toBe(
      false,
    );
    expect(
      createWidgetSessionRequestSchema.safeParse({
        context: Object.fromEntries(
          Array.from({ length: 9 }, (_, index) => [`pole_${index}`, "x"]),
        ),
      }).success,
    ).toBe(false);
  });
});
