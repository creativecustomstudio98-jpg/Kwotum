import { z } from "zod";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const consentProofSchema = z
  .object({
    accepted: z.literal(true),
    textHash: hashSchema,
    version: z.string().trim().min(1).max(80),
  })
  .strict();

export const leadContactSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    name: z.string().trim().min(2).max(120).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{7,30}$/)
      .optional(),
  })
  .strict();

export const submitWidgetLeadRequestSchema = z
  .object({
    contact: leadContactSchema,
    fileIds: z.array(z.uuid()).max(5),
    marketingEmailConsent: consentProofSchema.nullable(),
    mutationId: z.uuid(),
    privacyNotice: consentProofSchema,
  })
  .strict();

export const submitWidgetLeadResponseSchema = z
  .object({
    leadPublicId: z.uuid(),
    submittedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const widgetFileUploadResponseSchema = z
  .object({
    fileId: z.uuid(),
    mimeType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
    name: z.string().min(1).max(255),
    sizeBytes: z.number().int().positive().max(26_214_400),
  })
  .strict();

export type LeadContact = z.infer<typeof leadContactSchema>;
export type SubmitWidgetLeadRequest = z.infer<typeof submitWidgetLeadRequestSchema>;
export type SubmitWidgetLeadResponse = z.infer<typeof submitWidgetLeadResponseSchema>;
export type WidgetFileUploadResponse = z.infer<typeof widgetFileUploadResponseSchema>;
