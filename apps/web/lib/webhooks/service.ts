import { parseServerEnv } from "@wyceno/config/env";
import { assertCapability } from "@wyceno/database";
import { z } from "zod";

import { requireTenantContext } from "../auth/tenant-context";
import { createClient } from "../supabase/server";
import {
  webhookEndpointMutationSchema,
  webhookSecretRotationSchema,
  webhookTestDeliverySchema,
} from "./contracts";
import { normalizeWebhookUrl, resolveWebhookTarget } from "./security";
import { deriveWebhookEndpointSecret } from "./signing";

export type WebhookEndpointSummary = Readonly<{
  createdAt: string;
  disabledAt: string | null;
  eventType: "lead.created";
  id: string;
  lastDeliveredAt: string | null;
  lastTestedAt: string | null;
  rotatedAt: string | null;
  secretVersion: number;
  status: "disabled" | "enabled";
  url: string;
}>;

export type WebhookDeliverySummary = Readonly<{
  attemptCount: number;
  createdAt: string;
  deliveredAt: string | null;
  endpointId: string;
  errorCode: string | null;
  eventId: string;
  id: string;
  isTest: boolean;
  responseStatus: number | null;
  status: "dead_letter" | "delivered" | "pending" | "processing" | "retry";
}>;

function signingMasterSecret(): string {
  const env = parseServerEnv({
    APP_URL: process.env.APP_URL,
    WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET,
  });
  if (!env.WEBHOOK_SIGNING_SECRET) throw new Error("Webhook signing is not configured.");
  return env.WEBHOOK_SIGNING_SECRET;
}

export async function getWebhookIntegration(organizationId: string): Promise<
  Readonly<{
    deliveries: WebhookDeliverySummary[];
    endpoints: WebhookEndpointSummary[];
    organizationName: string;
  }>
> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "webhook:manage");
  const client = await createClient();
  const [organizationResult, endpointsResult, deliveriesResult] = await Promise.all([
    client.from("organizations").select("name").eq("id", context.organizationId).maybeSingle(),
    client
      .from("webhook_endpoints")
      .select(
        "id, url, event_type, status, secret_version, rotated_at, disabled_at, last_tested_at, last_delivered_at, created_at",
      )
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(20),
    client
      .from("webhook_deliveries")
      .select(
        "id, endpoint_id, event_id, is_test, status, attempt_count, response_status, last_error_code, delivered_at, created_at",
      )
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  if (
    organizationResult.error ||
    !organizationResult.data ||
    endpointsResult.error ||
    deliveriesResult.error
  ) {
    throw new Error("Nie udało się pobrać konfiguracji webhooków.");
  }
  return {
    deliveries: deliveriesResult.data.map((delivery) => ({
      attemptCount: delivery.attempt_count,
      createdAt: delivery.created_at,
      deliveredAt: delivery.delivered_at,
      endpointId: delivery.endpoint_id,
      errorCode: delivery.last_error_code,
      eventId: delivery.event_id,
      id: delivery.id,
      isTest: delivery.is_test,
      responseStatus: delivery.response_status,
      status: delivery.status,
    })),
    endpoints: endpointsResult.data.map((endpoint) => ({
      createdAt: endpoint.created_at,
      disabledAt: endpoint.disabled_at,
      eventType: z.literal("lead.created").parse(endpoint.event_type),
      id: endpoint.id,
      lastDeliveredAt: endpoint.last_delivered_at,
      lastTestedAt: endpoint.last_tested_at,
      rotatedAt: endpoint.rotated_at,
      secretVersion: endpoint.secret_version,
      status: endpoint.status,
      url: endpoint.url,
    })),
    organizationName: organizationResult.data.name,
  };
}

export async function createWebhookEndpoint(
  organizationId: string,
  rawUrl: string,
  requestId: string,
): Promise<Readonly<{ endpoint: WebhookEndpointSummary; secret: string }>> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "webhook:manage");
  const url = normalizeWebhookUrl(rawUrl);
  await resolveWebhookTarget(url);
  const masterSecret = signingMasterSecret();
  const client = await createClient();
  const { data, error } = await client.rpc("create_webhook_endpoint", {
    idempotency_key: requestId,
    target_organization_id: context.organizationId,
    target_url: url,
  });
  if (error) throw new Error("Nie udało się utworzyć endpointu webhooka.");
  const endpoint = webhookEndpointMutationSchema.parse(data);
  const secret = deriveWebhookEndpointSecret({
    endpointId: endpoint.id,
    masterSecret,
    organizationId: context.organizationId,
    secretVersion: endpoint.secretVersion,
  });
  return {
    endpoint: {
      createdAt: endpoint.createdAt,
      disabledAt: null,
      eventType: endpoint.eventType,
      id: endpoint.id,
      lastDeliveredAt: null,
      lastTestedAt: null,
      rotatedAt: null,
      secretVersion: endpoint.secretVersion,
      status: endpoint.status,
      url: endpoint.url,
    },
    secret,
  };
}

export async function rotateWebhookEndpointSecret(
  organizationId: string,
  endpointId: string,
  requestId: string,
): Promise<Readonly<{ rotatedAt: string; secret: string; secretVersion: number }>> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "webhook:manage");
  const masterSecret = signingMasterSecret();
  const client = await createClient();
  const { data, error } = await client.rpc("rotate_webhook_endpoint_secret", {
    idempotency_key: requestId,
    target_endpoint_id: endpointId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się obrócić sekretu webhooka.");
  const rotation = webhookSecretRotationSchema.parse(data);
  return {
    rotatedAt: rotation.rotatedAt,
    secret: deriveWebhookEndpointSecret({
      endpointId: rotation.id,
      masterSecret,
      organizationId: context.organizationId,
      secretVersion: rotation.secretVersion,
    }),
    secretVersion: rotation.secretVersion,
  };
}

export async function disableWebhookEndpoint(
  organizationId: string,
  endpointId: string,
): Promise<void> {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "webhook:manage");
  const client = await createClient();
  const { data, error } = await client.rpc("disable_webhook_endpoint", {
    target_endpoint_id: endpointId,
    target_organization_id: context.organizationId,
  });
  if (error || !data) throw new Error("Nie udało się wyłączyć webhooka.");
}

export async function enqueueWebhookTest(
  organizationId: string,
  endpointId: string,
  requestId: string,
) {
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "webhook:manage");
  const client = await createClient();
  const { data: endpoint, error: endpointError } = await client
    .from("webhook_endpoints")
    .select("url")
    .eq("organization_id", context.organizationId)
    .eq("id", endpointId)
    .eq("status", "enabled")
    .maybeSingle();
  if (endpointError || !endpoint) throw new Error("Nie znaleziono aktywnego webhooka.");
  await resolveWebhookTarget(endpoint.url);
  const { data, error } = await client.rpc("enqueue_webhook_test", {
    request_id: requestId,
    target_endpoint_id: endpointId,
    target_organization_id: context.organizationId,
  });
  if (error) throw new Error("Nie udało się zaplanować testu webhooka.");
  return webhookTestDeliverySchema.parse(data);
}
