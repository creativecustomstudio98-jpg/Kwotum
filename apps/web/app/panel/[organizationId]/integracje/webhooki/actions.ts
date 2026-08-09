"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createWebhookEndpoint,
  disableWebhookEndpoint,
  enqueueWebhookTest,
  rotateWebhookEndpointSecret,
} from "../../../../../lib/webhooks/service";

export type WebhookCreateActionState = Readonly<{
  endpointUrl: string | null;
  error: string | null;
  requestId: string;
  secret: string | null;
}>;

export type WebhookRotateActionState = Readonly<{
  error: string | null;
  requestId: string;
  secret: string | null;
  secretVersion: number | null;
}>;

export type WebhookTestActionState = Readonly<{
  deliveryId: string | null;
  error: string | null;
  requestId: string;
}>;

const identifiersSchema = z.object({
  endpointId: z.uuid(),
  organizationId: z.uuid(),
  requestId: z.uuid(),
});

export async function createWebhookEndpointAction(
  previous: WebhookCreateActionState,
  formData: FormData,
): Promise<WebhookCreateActionState> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const requestId = z.uuid().safeParse(formData.get("requestId"));
  const url = z.string().trim().min(1).max(2048).safeParse(formData.get("url"));
  if (!organizationId.success || !requestId.success || !url.success) {
    return { ...previous, error: "Podaj prawidłowy publiczny URL HTTPS." };
  }
  try {
    const result = await createWebhookEndpoint(organizationId.data, url.data, requestId.data);
    revalidatePath(`/panel/${organizationId.data}/integracje/webhooki`);
    return {
      endpointUrl: result.endpoint.url,
      error: null,
      requestId: crypto.randomUUID(),
      secret: result.secret,
    };
  } catch {
    return {
      ...previous,
      error:
        "Nie udało się dodać endpointu. Użyj publicznej domeny HTTPS na porcie 443, bez query i redirectu.",
    };
  }
}

export async function rotateWebhookSecretAction(
  previous: WebhookRotateActionState,
  formData: FormData,
): Promise<WebhookRotateActionState> {
  const identifiers = identifiersSchema.safeParse({
    endpointId: formData.get("endpointId"),
    organizationId: formData.get("organizationId"),
    requestId: formData.get("requestId"),
  });
  if (!identifiers.success) return { ...previous, error: "Nieprawidłowy endpoint." };
  try {
    const result = await rotateWebhookEndpointSecret(
      identifiers.data.organizationId,
      identifiers.data.endpointId,
      identifiers.data.requestId,
    );
    revalidatePath(`/panel/${identifiers.data.organizationId}/integracje/webhooki`);
    return {
      error: null,
      requestId: crypto.randomUUID(),
      secret: result.secret,
      secretVersion: result.secretVersion,
    };
  } catch {
    return { ...previous, error: "Nie udało się obrócić sekretu." };
  }
}

export async function enqueueWebhookTestAction(
  previous: WebhookTestActionState,
  formData: FormData,
): Promise<WebhookTestActionState> {
  const identifiers = identifiersSchema.safeParse({
    endpointId: formData.get("endpointId"),
    organizationId: formData.get("organizationId"),
    requestId: formData.get("requestId"),
  });
  if (!identifiers.success) return { ...previous, error: "Nieprawidłowy endpoint." };
  try {
    const result = await enqueueWebhookTest(
      identifiers.data.organizationId,
      identifiers.data.endpointId,
      identifiers.data.requestId,
    );
    revalidatePath(`/panel/${identifiers.data.organizationId}/integracje/webhooki`);
    return {
      deliveryId: result.deliveryId,
      error: null,
      requestId: crypto.randomUUID(),
    };
  } catch {
    return {
      ...previous,
      error: "Test nie został zaplanowany. Sprawdź publiczny DNS endpointu.",
    };
  }
}

export async function disableWebhookEndpointAction(formData: FormData): Promise<void> {
  const organizationId = z.uuid().safeParse(formData.get("organizationId"));
  const endpointId = z.uuid().safeParse(formData.get("endpointId"));
  if (!organizationId.success || !endpointId.success) throw new Error("Nieprawidłowy endpoint.");
  await disableWebhookEndpoint(organizationId.data, endpointId.data);
  revalidatePath(`/panel/${organizationId.data}/integracje/webhooki`);
}
