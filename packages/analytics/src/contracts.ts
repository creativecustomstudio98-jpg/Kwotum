import { z } from "zod";

export const analyticsConsentVersion = "analytics-v1" as const;
export const analyticsEventSchemaVersion = 1 as const;
export const analyticsMinimumSampleSize = 5 as const;

export const analyticsEventNameSchema = z.enum([
  "contact_started",
  "cta_clicked",
  "file_uploaded",
  "flow_abandoned",
  "flow_started",
  "lead_submitted",
  "result_viewed",
  "step_answered",
  "step_back",
  "step_viewed",
  "validation_error",
  "widget_loaded",
  "widget_opened",
]);

export const analyticsSourceSchema = z.enum([
  "direct",
  "email",
  "organic",
  "other",
  "paid",
  "referral",
  "social",
]);

export const analyticsDeviceSchema = z.enum(["desktop", "mobile", "other", "tablet"]);

export const analyticsConsentRequestSchema = z
  .object({
    consentVersion: z.literal(analyticsConsentVersion),
    granted: z.boolean(),
    mutationId: z.uuid(),
  })
  .strict();

const analyticsBreakdownSchema = z
  .object({
    count: z.number().int().nonnegative(),
    key: z.string(),
    shareBasisPoints: z.number().int().min(0).max(10_000),
  })
  .strict();

export const analyticsOverviewSchema = z
  .object({
    devices: z.array(analyticsBreakdownSchema),
    dropOff: z.array(
      z
        .object({
          answered: z.number().int().nonnegative(),
          dropRateBasisPoints: z.number().int().min(0).max(10_000),
          dropped: z.number().int().nonnegative(),
          stepKey: z.string(),
          title: z.string(),
          viewed: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    insufficientData: z.boolean(),
    minimumSampleSize: z.literal(analyticsMinimumSampleSize),
    period: z
      .object({
        from: z.iso.datetime({ offset: true }),
        to: z.iso.datetime({ offset: true }),
      })
      .strict(),
    scoreDistribution: z.array(
      z
        .object({
          count: z.number().int().nonnegative(),
          key: z.string(),
          label: z.string(),
        })
        .strict(),
    ),
    sources: z.array(analyticsBreakdownSchema),
    totals: z
      .object({
        completionRateBasisPoints: z.number().int().min(0).max(10_000).nullable(),
        leadRateBasisPoints: z.number().int().min(0).max(10_000).nullable(),
        leads: z.number().int().nonnegative(),
        medianCompletionSeconds: z.number().int().nonnegative().nullable(),
        results: z.number().int().nonnegative(),
        sessions: z.number().int().nonnegative(),
        startRateBasisPoints: z.number().int().min(0).max(10_000).nullable(),
        starts: z.number().int().nonnegative(),
      })
      .strict(),
    versions: z.array(
      z
        .object({
          completionRateBasisPoints: z.number().int().min(0).max(10_000),
          flowVersionId: z.uuid(),
          results: z.number().int().nonnegative(),
          sessions: z.number().int().nonnegative(),
          versionNumber: z.number().int().positive(),
        })
        .strict(),
    ),
  })
  .strict();

export const analyticsEventRequestSchema = z
  .object({
    device: analyticsDeviceSchema,
    eventId: z.uuid(),
    name: analyticsEventNameSchema,
    occurredAt: z.iso.datetime({ offset: true }),
    schemaVersion: z.literal(analyticsEventSchemaVersion),
    source: analyticsSourceSchema,
    stepKey: z
      .string()
      .regex(/^[a-z][a-z0-9_-]{0,63}$/)
      .nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    const stepEvent =
      value.name === "step_answered" ||
      value.name === "step_back" ||
      value.name === "step_viewed" ||
      value.name === "validation_error";
    if (stepEvent !== (value.stepKey !== null)) {
      context.addIssue({
        code: "custom",
        message: "stepKey must be present only for step-scoped events",
        path: ["stepKey"],
      });
    }
  });

export type AnalyticsDevice = z.infer<typeof analyticsDeviceSchema>;
export type AnalyticsEventName = z.infer<typeof analyticsEventNameSchema>;
export type AnalyticsEventRequest = z.infer<typeof analyticsEventRequestSchema>;
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;
export type AnalyticsSource = z.infer<typeof analyticsSourceSchema>;
