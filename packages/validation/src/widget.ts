import { z } from "zod";

import {
  flowExperienceModeSchema,
  flowOptionPresentationSchema,
  flowStepPresentationSchema,
  flowStepValidationSchema,
} from "./flow";

const publicIdSchema = z.uuid();
const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const widgetStepKeySchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/);
const storedAnswerSchema = z.union([
  z.boolean(),
  z.number().finite(),
  z.string().max(2000),
  z.array(z.string().max(64)).min(1).max(20),
]);
const answerSchema = z.union([storedAnswerSchema, z.null()]);
const widgetContextValuesSchema = z
  .record(
    widgetStepKeySchema.refine(
      (key) => !/^(consent|organization|price|routing|score|tenant)(_|$)/.test(key),
      "Reserved context key.",
    ),
    z.string().trim().min(1).max(120),
  )
  .refine((values) => Object.keys(values).length <= 8, "Too many context values.");

export const widgetContextProjectionSchema = z
  .array(
    z
      .object({
        allowedValues: z.array(z.string().min(1).max(120)).max(30).nullable(),
        key: widgetStepKeySchema,
        label: z.string().min(1).max(80),
        mode: z.enum(["confirm", "informational"]),
        type: z.enum(["enum", "text"]),
        value: z.string().min(1).max(120),
      })
      .strict(),
  )
  .max(8);

export const createWidgetSessionRequestSchema = z
  .object({ context: widgetContextValuesSchema.default({}) })
  .strict();

export const confirmWidgetContextRequestSchema = z
  .object({ mutationId: z.uuid(), values: widgetContextValuesSchema })
  .strict();

const widgetChallengeSchema = z
  .object({
    action: z.literal("kwotum_lead_submit"),
    appearance: z.literal("interaction-only"),
    provider: z.literal("turnstile"),
    siteKey: z
      .string()
      .min(3)
      .max(32)
      .regex(/^[A-Za-z0-9_-]+$/),
  })
  .strict();

const widgetOptionSchema = z
  .object({
    key: widgetStepKeySchema,
    label: z.string().min(1).max(160),
    nextStepKey: widgetStepKeySchema.nullable(),
    overridesNextStep: z.boolean(),
    presentation: flowOptionPresentationSchema.nullable().optional(),
  })
  .strict();

const widgetStepSchema = z
  .object({
    allowUnknown: z.boolean(),
    description: z.string().max(500).nullable(),
    key: widgetStepKeySchema,
    nextStepKey: widgetStepKeySchema.nullable(),
    options: z.array(widgetOptionSchema).max(20),
    presentation: flowStepPresentationSchema.optional(),
    required: z.boolean(),
    title: z.string().min(1).max(240),
    type: z.enum([
      "budget",
      "date",
      "location",
      "long_text",
      "multiple_choice",
      "number",
      "short_text",
      "single_choice",
      "yes_no",
    ]),
    validation: flowStepValidationSchema.nullable().default(null),
  })
  .strict();

const widgetRuleSchema = z
  .object({
    id: widgetStepKeySchema,
    then: z
      .object({
        action: z.literal("go_to"),
        stepKey: widgetStepKeySchema.nullable(),
      })
      .strict(),
    when: z
      .object({
        operator: z.enum(["answered", "equals", "includes", "not_equals"]),
        stepKey: widgetStepKeySchema,
        value: z.union([z.boolean(), z.number(), z.string().max(500)]).optional(),
      })
      .strict(),
  })
  .strict();

const widgetConsentContentSchema = z
  .object({
    label: z.string().min(10).max(500),
    textHash: z.string().regex(/^[a-f0-9]{64}$/),
    version: z.string().min(1).max(80),
  })
  .strict();

const widgetLeadCaptureBaseSchema = z.object({
  filesEnabled: z.boolean(),
  marketingEmailConsent: widgetConsentContentSchema.nullable(),
  privacyNotice: widgetConsentContentSchema
    .extend({
      policyUrl: z.url().max(500).nullable(),
    })
    .strict(),
});

const widgetLeadCaptureFieldStateSchema = z.enum(["hidden", "optional", "required"]);
const widgetLeadCaptureFieldsSchema = z
  .object({
    email: widgetLeadCaptureFieldStateSchema,
    name: widgetLeadCaptureFieldStateSchema,
    phone: widgetLeadCaptureFieldStateSchema,
    preferredContactChannel: widgetLeadCaptureFieldStateSchema,
    preferredContactWindow: widgetLeadCaptureFieldStateSchema,
  })
  .strict()
  .refine((fields) => fields.email === "required", "Kontakt v3 wymaga adresu e-mail.");

const widgetLeadCaptureSchema = z.discriminatedUnion("leadCaptureSchemaVersion", [
  widgetLeadCaptureBaseSchema
    .extend({
      leadCaptureSchemaVersion: z.literal(1),
    })
    .strict()
    .transform((capture) => ({ ...capture, contactPolicy: "email_required" as const })),
  widgetLeadCaptureBaseSchema
    .extend({
      contactPolicy: z.enum(["email_required", "phone_required"]),
      leadCaptureSchemaVersion: z.literal(2),
    })
    .strict(),
  widgetLeadCaptureBaseSchema
    .extend({
      completionOrder: z.enum(["result_then_contact", "contact_then_result"]),
      fields: widgetLeadCaptureFieldsSchema,
      leadCaptureSchemaVersion: z.literal(3),
    })
    .strict()
    .transform((capture) => ({
      ...capture,
      contactPolicy:
        capture.fields.email === "required"
          ? ("email_required" as const)
          : ("phone_required" as const),
    })),
]);

const widgetBrandingSchema = z
  .object({
    accentColor: z.string().regex(/^#[0-9A-F]{6}$/),
    accentTextColor: z.enum(["#000000", "#FFFFFF"]),
    companyName: z.string().min(2).max(120),
    logoUrl: z.string().startsWith("/").max(240).nullable(),
  })
  .strict()
  .refine((branding) => {
    const red = Number.parseInt(branding.accentColor.slice(1, 3), 16);
    const green = Number.parseInt(branding.accentColor.slice(3, 5), 16);
    const blue = Number.parseInt(branding.accentColor.slice(5, 7), 16);
    const expected = red * 299 + green * 587 + blue * 114 >= 150_000 ? "#000000" : "#FFFFFF";
    return branding.accentTextColor === expected;
  }, "Kolor tekstu brandingu nie zapewnia wyliczonego kontrastu.");

export const widgetManifestSchema = z
  .object({
    branding: widgetBrandingSchema.optional(),
    challenge: widgetChallengeSchema.nullable().optional().default(null),
    entryStepKey: widgetStepKeySchema,
    intro: z.string().min(1).max(800),
    experienceMode: flowExperienceModeSchema.optional(),
    leadCapture: widgetLeadCaptureSchema.nullable(),
    manifestVersion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    publicId: publicIdSchema,
    publishedAt: z.iso.datetime({ offset: true }),
    result: z
      .object({
        action: z.enum(["capture_lead", "no_lead"]).optional(),
        disclaimer: z.string().min(1).max(800),
        fallbackContactLabel: z.string().min(1).max(120).optional(),
        fallbackContactUrl: z
          .url()
          .max(500)
          .refine((value) => new URL(value).protocol === "https:")
          .optional(),
        headline: z.string().min(1).max(240),
        mode: z.enum(["consultation", "no_price"]),
        nextStepLabel: z.string().min(1).max(120),
        resultSchemaVersion: z.literal(2).optional(),
      })
      .strict(),
    rules: z.array(widgetRuleSchema).max(50),
    snapshotHash: z.string().regex(/^[a-f0-9]{64}$/),
    steps: z.array(widgetStepSchema).min(1).max(40),
    title: z.string().min(2).max(160),
  })
  .strict()
  .superRefine((manifest, context) => {
    if ((manifest.result.resultSchemaVersion === 2) !== (manifest.result.action !== undefined)) {
      context.addIssue({
        code: "custom",
        message: "Outcome v2 wymaga jawnej akcji.",
        path: ["result"],
      });
    }
    if (
      manifest.leadCapture?.leadCaptureSchemaVersion === 3 &&
      manifest.leadCapture.fields.email !== "required"
    ) {
      context.addIssue({
        code: "custom",
        message: "Kontakt v3 wymaga adresu e-mail.",
        path: ["leadCapture", "fields", "email"],
      });
    }
    if (manifest.manifestVersion !== 3) {
      if (
        manifest.experienceMode !== undefined ||
        manifest.steps.some(
          (step) =>
            step.presentation !== undefined ||
            step.options.some((option) => option.presentation !== undefined),
        )
      ) {
        context.addIssue({
          code: "custom",
          message: "Pola prezentacji wymagają manifestu w wersji 3.",
        });
      }
      return;
    }

    if (
      manifest.experienceMode === undefined ||
      manifest.steps.some(
        (step) =>
          step.presentation === undefined ||
          step.options.some((option) => option.presentation === undefined),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Manifest v3 wymaga kompletnej projekcji prezentacji.",
      });
      return;
    }

    for (const [stepIndex, step] of manifest.steps.entries()) {
      const variant = step.presentation?.variant;
      const isChoice = step.type === "single_choice" || step.type === "multiple_choice";
      const compatible =
        variant !== undefined &&
        (manifest.experienceMode === "visual_configurator" || variant === "default") &&
        (isChoice || variant === "default") &&
        (variant !== "default" || step.options.every((option) => option.presentation === null)) &&
        (variant !== "text_cards" ||
          step.options.every((option) => option.presentation?.description !== undefined)) &&
        (variant !== "icon_cards" ||
          step.options.every((option) => option.presentation?.icon !== undefined)) &&
        (variant !== "image_cards" ||
          step.options.every((option) => option.presentation?.asset !== undefined));
      if (!compatible) {
        context.addIssue({
          code: "custom",
          message: "Prezentacja manifestu nie pasuje do trybu, kroku lub opcji.",
          path: ["steps", stepIndex, "presentation"],
        });
      }
    }

    if (
      manifest.experienceMode === "quick_form" &&
      (manifest.steps.length > 8 ||
        manifest.entryStepKey !== manifest.steps[0]?.key ||
        manifest.rules.length > 0 ||
        manifest.steps.some(
          (step, index) =>
            step.nextStepKey !== (manifest.steps[index + 1]?.key ?? null) ||
            step.options.some((option) => option.overridesNextStep),
        ))
    ) {
      context.addIssue({
        code: "custom",
        message: "Krótki formularz wymaga maksymalnie 8 pytań w jednej liniowej trasie.",
        path: ["experienceMode"],
      });
    }
  });

export const widgetPublicIdSchema = publicIdSchema;
export const widgetSessionTokenSchema = tokenSchema;

export const createWidgetSessionResponseSchema = z
  .object({
    context: widgetContextProjectionSchema,
    contextConfirmed: z.boolean(),
    currentStepKey: widgetStepKeySchema,
    expiresAt: z.iso.datetime({ offset: true }),
    manifest: widgetManifestSchema,
    revision: z.number().int().nonnegative(),
    token: tokenSchema,
  })
  .strict();

export const resumeWidgetSessionResponseSchema = z
  .object({
    answers: z.record(widgetStepKeySchema, storedAnswerSchema),
    context: widgetContextProjectionSchema,
    contextConfirmed: z.boolean(),
    currentStepKey: widgetStepKeySchema.nullable(),
    expiresAt: z.iso.datetime({ offset: true }),
    manifest: widgetManifestSchema,
    revision: z.number().int().nonnegative(),
  })
  .strict();

export const confirmWidgetContextResponseSchema = z
  .object({
    confirmedAt: z.iso.datetime({ offset: true }),
    context: widgetContextProjectionSchema,
  })
  .strict();

export const saveWidgetAnswerRequestSchema = z
  .object({
    answer: answerSchema,
    expectedRevision: z.number().int().nonnegative(),
    mutationId: z.uuid(),
    nextStepKey: widgetStepKeySchema.nullable(),
  })
  .strict();

export const saveWidgetAnswerResponseSchema = z
  .object({
    currentStepKey: widgetStepKeySchema.nullable(),
    revision: z.number().int().positive(),
  })
  .strict();

export const widgetCalculatedResultDatabaseSchema = z
  .object({
    action: z.enum(["capture_lead", "no_lead"]).default("capture_lead"),
    disclaimer: z.string().min(1).max(800),
    fallbackContactLabel: z.string().min(1).max(120).nullable().default(null),
    fallbackContactUrl: z
      .url()
      .max(500)
      .refine((value) => new URL(value).protocol === "https:")
      .nullable()
      .default(null),
    headline: z.string().min(1).max(240),
    nextStepLabel: z.string().min(1).max(120),
    pricing: z
      .object({
        currency: z.string().regex(/^[A-Z]{3}$/),
        maxMinor: z.number().int().nonnegative().safe(),
        minMinor: z.number().int().nonnegative().safe(),
        presentation: z.enum(["exact", "from", "range"]),
      })
      .strict()
      .nullable(),
  })
  .strict();

export const widgetCalculatedResultSchema = widgetCalculatedResultDatabaseSchema
  .extend({
    pricing: widgetCalculatedResultDatabaseSchema.shape.pricing
      .unwrap()
      .extend({
        formattedMax: z.string().min(1).max(80),
        formattedMin: z.string().min(1).max(80),
      })
      .strict()
      .nullable(),
  })
  .strict();

export type WidgetManifestContract = z.infer<typeof widgetManifestSchema>;
export type ConfirmWidgetContextRequest = z.infer<typeof confirmWidgetContextRequestSchema>;
export type SaveWidgetAnswerRequest = z.infer<typeof saveWidgetAnswerRequestSchema>;
export type WidgetCalculatedResult = z.infer<typeof widgetCalculatedResultSchema>;
export type WidgetContextProjection = z.infer<typeof widgetContextProjectionSchema>;
