import { z } from "zod";

import { flowStepValidationSchema } from "./flow";

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

const widgetOptionSchema = z
  .object({
    key: widgetStepKeySchema,
    label: z.string().min(1).max(160),
    nextStepKey: widgetStepKeySchema.nullable(),
    overridesNextStep: z.boolean(),
  })
  .strict();

const widgetStepSchema = z
  .object({
    allowUnknown: z.boolean(),
    description: z.string().max(500).nullable(),
    key: widgetStepKeySchema,
    nextStepKey: widgetStepKeySchema.nullable(),
    options: z.array(widgetOptionSchema).max(20),
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

export const widgetManifestSchema = z
  .object({
    entryStepKey: widgetStepKeySchema,
    intro: z.string().min(1).max(800),
    leadCapture: z
      .object({
        filesEnabled: z.boolean(),
        leadCaptureSchemaVersion: z.literal(1),
        marketingEmailConsent: widgetConsentContentSchema.nullable(),
        privacyNotice: widgetConsentContentSchema
          .extend({
            policyUrl: z.url().max(500).nullable(),
          })
          .strict(),
      })
      .strict()
      .nullable(),
    manifestVersion: z.union([z.literal(1), z.literal(2)]),
    publicId: publicIdSchema,
    publishedAt: z.iso.datetime({ offset: true }),
    result: z
      .object({
        disclaimer: z.string().min(1).max(800),
        headline: z.string().min(1).max(240),
        mode: z.enum(["consultation", "no_price"]),
        nextStepLabel: z.string().min(1).max(120),
      })
      .strict(),
    rules: z.array(widgetRuleSchema).max(50),
    snapshotHash: z.string().regex(/^[a-f0-9]{64}$/),
    steps: z.array(widgetStepSchema).min(1).max(40),
    title: z.string().min(2).max(160),
  })
  .strict();

export const widgetPublicIdSchema = publicIdSchema;
export const widgetSessionTokenSchema = tokenSchema;

export const createWidgetSessionResponseSchema = z
  .object({
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
    currentStepKey: widgetStepKeySchema.nullable(),
    expiresAt: z.iso.datetime({ offset: true }),
    manifest: widgetManifestSchema,
    revision: z.number().int().nonnegative(),
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
    disclaimer: z.string().min(1).max(800),
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
export type SaveWidgetAnswerRequest = z.infer<typeof saveWidgetAnswerRequestSchema>;
export type WidgetCalculatedResult = z.infer<typeof widgetCalculatedResultSchema>;
