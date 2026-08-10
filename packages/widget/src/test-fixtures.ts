import type { WidgetManifest } from "./contracts.js";

export const testPublicId = "f0000000-0000-4000-8000-000000000001";

export const testManifest: WidgetManifest = {
  entryStepKey: "service",
  intro: "Odpowiedz na kilka pytań.",
  leadCapture: {
    filesEnabled: true,
    leadCaptureSchemaVersion: 1,
    marketingEmailConsent: {
      label: "Chcę otrzymywać informacje marketingowe pocztą elektroniczną.",
      textHash: "c".repeat(64),
      version: "marketing-v1",
    },
    privacyNotice: {
      label: "Potwierdzam zapoznanie się z informacją o przetwarzaniu danych.",
      policyUrl: "https://example.test/polityka-prywatnosci",
      textHash: "b".repeat(64),
      version: "privacy-v1",
    },
  },
  manifestVersion: 1,
  publicId: testPublicId,
  publishedAt: "2026-07-24T08:00:00.000Z",
  result: {
    disclaimer: "To nie jest oferta.",
    headline: "Dziękujemy",
    mode: "consultation",
    nextStepLabel: "Skontaktujemy się po przesłaniu danych.",
  },
  rules: [
    {
      id: "premium_details",
      then: { action: "go_to", stepKey: "details" },
      when: { operator: "equals", stepKey: "service", value: "premium" },
    },
  ],
  snapshotHash: "a".repeat(64),
  steps: [
    {
      allowUnknown: false,
      description: null,
      key: "service",
      nextStepKey: "location",
      options: [
        {
          key: "standard",
          label: "Standard",
          nextStepKey: null,
          overridesNextStep: false,
        },
        {
          key: "premium",
          label: "Premium",
          nextStepKey: null,
          overridesNextStep: false,
        },
      ],
      required: true,
      title: "Jakiej usługi potrzebujesz?",
      type: "single_choice",
      validation: null,
    },
    {
      allowUnknown: true,
      description: "Bez danych kontaktowych.",
      key: "details",
      nextStepKey: "location",
      options: [],
      required: false,
      title: "Opisz wymagania",
      type: "long_text",
      validation: null,
    },
    {
      allowUnknown: false,
      description: null,
      key: "location",
      nextStepKey: null,
      options: [],
      required: true,
      title: "Podaj lokalizację",
      type: "location",
      validation: null,
    },
  ],
  title: "Testowy proces",
};
