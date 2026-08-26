import { z } from "zod";

export const webhookEndpointMutationSchema = z
  .object({
    createdAt: z.iso.datetime({ offset: true }),
    eventType: z.literal("lead.created"),
    id: z.uuid(),
    secretVersion: z.number().int().min(1),
    status: z.enum(["enabled", "disabled"]),
    url: z.url(),
  })
  .strict();

export const webhookSecretRotationSchema = z
  .object({
    id: z.uuid(),
    rotatedAt: z.iso.datetime({ offset: true }),
    secretVersion: z.number().int().min(2),
  })
  .strict();

export const webhookTestDeliverySchema = z
  .object({
    createdAt: z.iso.datetime({ offset: true }),
    deliveryId: z.uuid(),
    eventId: z.uuid(),
    status: z.enum(["pending", "processing", "retry", "delivered", "dead_letter"]),
  })
  .strict();

export type WebhookEnvelopeV1 = Readonly<{
  data: Readonly<{
    lead: Readonly<{
      contact: Readonly<{
        email: string | null;
        name: string | null;
        phone: string | null;
        preferred_channel?: "email" | "phone" | null;
        preferred_window?: "morning" | "afternoon" | "evening" | null;
      }>;
      estimate: Readonly<{
        currency: string;
        maximum_minor: number;
        minimum_minor: number;
        presentation: string;
      }> | null;
      flow_title: string;
      id: string;
      submitted_at: string;
    }>;
    test: boolean;
  }>;
  delivery_id: string;
  event_id: string;
  occurred_at: string;
  organization_id: string;
  type: "lead.created";
  version: "2026-08-09" | "2026-08-25";
}>;
