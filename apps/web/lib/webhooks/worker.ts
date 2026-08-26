import { parseServerEnv } from "@wyceno/config/env";
import type { Database, WebhookErrorCode } from "@wyceno/database";

import { createServiceClient } from "../supabase/service";
import type { WebhookEnvelopeV1 } from "./contracts";
import { resolveWebhookTarget, WebhookTargetError } from "./security";
import { deriveWebhookEndpointSecret, signWebhookBody } from "./signing";
import {
  classifyWebhookResponse,
  sendPinnedWebhookRequest,
  WebhookTransportError,
} from "./transport";

export type ClaimedWebhookDelivery =
  Database["public"]["Functions"]["claim_webhook_delivery_batch"]["Returns"][number] &
    Readonly<{
      preferred_contact_channel?: "email" | "phone" | null;
      preferred_contact_window?: "morning" | "afternoon" | "evening" | null;
    }>;

export type WebhookAdapterResult = Readonly<
  | { outcome: "delivered"; responseStatus: number }
  | {
      errorCode: WebhookErrorCode;
      outcome: "failed";
      responseStatus: number | null;
      retryable: boolean;
    }
>;

export interface WebhookDeliveryAdapter {
  deliver(
    input: Readonly<{
      body: string;
      headers: Readonly<Record<string, string>>;
      url: string;
    }>,
  ): Promise<WebhookAdapterResult>;
}

export interface WebhookRepository {
  claim(
    input: Readonly<{ batchSize: number; workerId: string }>,
  ): Promise<ClaimedWebhookDelivery[]>;
  fail(
    claim: ClaimedWebhookDelivery,
    input: Readonly<{
      errorCode: WebhookErrorCode;
      responseStatus: number | null;
      retryable: boolean;
    }>,
  ): Promise<void>;
  succeed(
    claim: ClaimedWebhookDelivery,
    input: Readonly<{ responseStatus: number }>,
  ): Promise<void>;
}

export type WebhookBatchResult = Readonly<{
  claimed: number;
  deadLettered: number;
  delivered: number;
  retrying: number;
}>;

type WebhookClaimOutcome = "dead_letter" | "delivered" | "retry";

const MAX_PARALLEL_DELIVERIES = 5;

export class SafeHttpsWebhookAdapter implements WebhookDeliveryAdapter {
  async deliver(
    input: Readonly<{
      body: string;
      headers: Readonly<Record<string, string>>;
      url: string;
    }>,
  ): Promise<WebhookAdapterResult> {
    try {
      const target = await resolveWebhookTarget(input.url);
      const response = await sendPinnedWebhookRequest({
        body: input.body,
        headers: input.headers,
        target,
      });
      return classifyWebhookResponse(response.responseStatus);
    } catch (error) {
      if (error instanceof WebhookTargetError) {
        return {
          errorCode: error.code,
          outcome: "failed",
          responseStatus: null,
          retryable: error.code === "dns_resolution",
        };
      }
      if (error instanceof WebhookTransportError) {
        return {
          errorCode: error.code,
          outcome: "failed",
          responseStatus: null,
          retryable: error.code !== "tls",
        };
      }
      return {
        errorCode: "network",
        outcome: "failed",
        responseStatus: null,
        retryable: true,
      };
    }
  }
}

function buildEstimate(
  claim: ClaimedWebhookDelivery,
): WebhookEnvelopeV1["data"]["lead"]["estimate"] {
  if (
    claim.price_currency === null ||
    claim.price_max_minor === null ||
    claim.price_min_minor === null ||
    claim.price_presentation === null
  ) {
    return null;
  }
  return {
    currency: claim.price_currency,
    maximum_minor: claim.price_max_minor,
    minimum_minor: claim.price_min_minor,
    presentation: claim.price_presentation,
  };
}

export function buildWebhookEnvelope(claim: ClaimedWebhookDelivery): WebhookEnvelopeV1 {
  if (claim.event_type !== "lead.created") throw new Error("Unsupported webhook event.");
  if (claim.is_test) {
    return {
      data: {
        lead: {
          contact: { email: "webhook-test@example.invalid", name: "Test Kwotum", phone: null },
          estimate: null,
          flow_title: "Syntetyczny test webhooka",
          id: claim.event_id,
          submitted_at: claim.occurred_at,
        },
        test: true,
      },
      delivery_id: claim.delivery_id,
      event_id: claim.event_id,
      occurred_at: claim.occurred_at,
      organization_id: claim.organization_id,
      type: "lead.created",
      version: "2026-08-09",
    };
  }
  if (
    (claim.contact_email === null && claim.contact_phone === null) ||
    claim.flow_title === null ||
    claim.lead_public_id === null ||
    claim.submitted_at === null
  ) {
    throw new Error("Webhook lead projection is incomplete.");
  }
  return {
    data: {
      lead: {
        contact: {
          email: claim.contact_email,
          name: claim.contact_name,
          phone: claim.contact_phone,
          preferred_channel: claim.preferred_contact_channel ?? null,
          preferred_window: claim.preferred_contact_window ?? null,
        },
        estimate: buildEstimate(claim),
        flow_title: claim.flow_title,
        id: claim.lead_public_id,
        submitted_at: claim.submitted_at,
      },
      test: false,
    },
    delivery_id: claim.delivery_id,
    event_id: claim.event_id,
    occurred_at: claim.occurred_at,
    organization_id: claim.organization_id,
    type: "lead.created",
    version: "2026-08-25",
  };
}

export async function processWebhookBatch(
  input: Readonly<{
    adapter: WebhookDeliveryAdapter;
    batchSize: number;
    masterSigningSecret: string;
    now?: () => number;
    repository: WebhookRepository;
    workerId: string;
  }>,
): Promise<WebhookBatchResult> {
  const claims = await input.repository.claim({
    batchSize: input.batchSize,
    workerId: input.workerId,
  });
  const now = input.now ?? Date.now;
  let deadLettered = 0;
  let delivered = 0;
  let retrying = 0;

  const processClaim = async (claim: ClaimedWebhookDelivery): Promise<WebhookClaimOutcome> => {
    let body: string;
    let secret: string;
    try {
      body = JSON.stringify(buildWebhookEnvelope(claim));
      secret = deriveWebhookEndpointSecret({
        endpointId: claim.endpoint_id,
        masterSecret: input.masterSigningSecret,
        organizationId: claim.organization_id,
        secretVersion: claim.secret_version,
      });
    } catch {
      await input.repository.fail(claim, {
        errorCode: "configuration",
        responseStatus: null,
        retryable: false,
      });
      return "dead_letter";
    }

    const timestamp = Math.floor(now() / 1000);
    const result = await input.adapter.deliver({
      body,
      headers: {
        "Idempotency-Key": `webhook/${claim.delivery_id}`,
        "X-Kwotum-Delivery-Id": claim.delivery_id,
        "X-Kwotum-Event-Id": claim.event_id,
        "X-Kwotum-Signature": signWebhookBody({ rawBody: body, secret, timestamp }),
        "X-Kwotum-Timestamp": String(timestamp),
      },
      url: claim.endpoint_url,
    });

    if (result.outcome === "delivered") {
      await input.repository.succeed(claim, { responseStatus: result.responseStatus });
      return "delivered";
    }
    await input.repository.fail(claim, result);
    return result.retryable && claim.attempt_number < 5 ? "retry" : "dead_letter";
  };

  for (let index = 0; index < claims.length; index += MAX_PARALLEL_DELIVERIES) {
    const outcomes = await Promise.all(
      claims.slice(index, index + MAX_PARALLEL_DELIVERIES).map(processClaim),
    );
    delivered += outcomes.filter((outcome) => outcome === "delivered").length;
    retrying += outcomes.filter((outcome) => outcome === "retry").length;
    deadLettered += outcomes.filter((outcome) => outcome === "dead_letter").length;
  }

  return { claimed: claims.length, deadLettered, delivered, retrying };
}

function databaseRepository(): WebhookRepository {
  const client = createServiceClient();
  return {
    async claim(input) {
      const { data, error } = await client.rpc("claim_webhook_delivery_batch", {
        batch_size: input.batchSize,
        worker_id: input.workerId,
      });
      if (error) throw new Error("Webhook claim failed.");
      const publicIds = data.flatMap((claim) =>
        claim.lead_public_id ? [claim.lead_public_id] : [],
      );
      const preferences = publicIds.length
        ? await client
            .from("leads")
            .select("public_id, preferred_contact_channel, preferred_contact_window")
            .in("public_id", publicIds)
        : { data: [], error: null };
      if (preferences.error) throw new Error("Webhook contact projection failed.");
      const byLead = new Map(preferences.data.map((lead) => [lead.public_id, lead]));
      return data.map((claim) => ({
        ...claim,
        preferred_contact_channel: claim.lead_public_id
          ? (byLead.get(claim.lead_public_id)?.preferred_contact_channel ?? null)
          : null,
        preferred_contact_window: claim.lead_public_id
          ? (byLead.get(claim.lead_public_id)?.preferred_contact_window ?? null)
          : null,
      }));
    },
    async fail(claim, input) {
      const { error } = await client.rpc("fail_webhook_delivery", {
        retryable: input.retryable,
        target_delivery_id: claim.delivery_id,
        target_error_code: input.errorCode,
        target_lock_token: claim.lock_token,
        target_response_status: input.responseStatus,
      });
      if (error) throw new Error("Webhook failure update failed.");
    },
    async succeed(claim, input) {
      const { error } = await client.rpc("complete_webhook_delivery", {
        target_delivery_id: claim.delivery_id,
        target_lock_token: claim.lock_token,
        target_response_status: input.responseStatus,
      });
      if (error) throw new Error("Webhook completion update failed.");
    },
  };
}

export async function processConfiguredWebhookBatch(): Promise<WebhookBatchResult> {
  const env = parseServerEnv({
    APP_URL: process.env.APP_URL,
    WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET,
    WEBHOOK_WORKER_SECRET: process.env.WEBHOOK_WORKER_SECRET,
  });
  if (!env.WEBHOOK_SIGNING_SECRET) throw new Error("Webhook signing is not configured.");
  return processWebhookBatch({
    adapter: new SafeHttpsWebhookAdapter(),
    batchSize: 25,
    masterSigningSecret: env.WEBHOOK_SIGNING_SECRET,
    repository: databaseRepository(),
    workerId: crypto.randomUUID(),
  });
}
