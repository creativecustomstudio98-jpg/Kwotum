import { parseServerEnv } from "@wyceno/config/env";
import type { Database, NotificationErrorCode, NotificationKind } from "@wyceno/database";
import {
  renderNotificationEmail,
  ResendEmailDeliveryAdapter,
  TestEmailDeliveryAdapter,
  type EmailDeliveryAdapter,
} from "@wyceno/email";
import { formatMinorAmount } from "@wyceno/validation";

import { createServiceClient } from "../supabase/service";

type ClaimedNotification =
  Database["public"]["Functions"]["claim_notification_batch"]["Returns"][number];

export interface NotificationRepository {
  claim(
    input: Readonly<{ batchSize: number; provider: "resend" | "test"; workerId: string }>,
  ): Promise<ClaimedNotification[]>;
  fail(
    claim: ClaimedNotification,
    input: Readonly<{
      errorCode: NotificationErrorCode;
      provider: "resend" | "test";
      retryable: boolean;
    }>,
  ): Promise<void>;
  succeed(
    claim: ClaimedNotification,
    input: Readonly<{ messageId: string; provider: "resend" | "test" }>,
  ): Promise<void>;
}

export type NotificationBatchResult = Readonly<{
  claimed: number;
  failed: number;
  retrying: number;
  sent: number;
}>;

function notificationPrice(claim: ClaimedNotification): string | null {
  if (!claim.price_currency || claim.price_min_minor === null) return null;
  const minimum = formatMinorAmount(claim.price_min_minor, claim.price_currency);
  if (
    claim.price_presentation === "exact" ||
    claim.price_max_minor === null ||
    claim.price_max_minor === claim.price_min_minor
  ) {
    return minimum;
  }
  if (claim.price_presentation === "from") return `od ${minimum}`;
  return `${minimum}–${formatMinorAmount(claim.price_max_minor, claim.price_currency)}`;
}

function expectedTemplate(kind: NotificationKind): string {
  return kind === "lead_company_alert" ? "lead-company-v1" : "lead-customer-v1";
}

export async function processNotificationBatch(
  input: Readonly<{
    adapter: EmailDeliveryAdapter;
    appUrl: string;
    batchSize: number;
    from: string;
    repository: NotificationRepository;
    workerId: string;
  }>,
): Promise<NotificationBatchResult> {
  const provider = input.adapter.name;
  const claims = await input.repository.claim({
    batchSize: input.batchSize,
    provider,
    workerId: input.workerId,
  });
  let failed = 0;
  let retrying = 0;
  let sent = 0;
  for (const claim of claims) {
    if (claim.template_version !== expectedTemplate(claim.kind)) {
      await input.repository.fail(claim, {
        errorCode: "configuration",
        provider,
        retryable: false,
      });
      failed += 1;
      continue;
    }
    let message;
    try {
      message = renderNotificationEmail({
        appUrl: input.appUrl,
        companyName: claim.company_name,
        contactEmail: claim.contact_email,
        contactName: claim.contact_name,
        flowTitle: claim.flow_title,
        kind: claim.kind,
        leadId: claim.lead_id,
        organizationId: claim.organization_id,
        price: notificationPrice(claim),
        score: claim.score,
      });
    } catch {
      await input.repository.fail(claim, {
        errorCode: "configuration",
        provider,
        retryable: false,
      });
      failed += 1;
      continue;
    }
    const result = await input.adapter.deliver({
      from: input.from,
      idempotencyKey: `notification/${claim.notification_id}`,
      message,
      notificationId: claim.notification_id,
      to: claim.recipient_email,
    });
    if (result.outcome === "sent") {
      await input.repository.succeed(claim, { messageId: result.messageId, provider });
      sent += 1;
      continue;
    }
    await input.repository.fail(claim, {
      errorCode: result.errorCode,
      provider,
      retryable: result.retryable,
    });
    if (result.retryable && claim.attempt_number < 5) retrying += 1;
    else failed += 1;
  }
  return { claimed: claims.length, failed, retrying, sent };
}

function databaseRepository(): NotificationRepository {
  const client = createServiceClient();
  return {
    async claim(input) {
      const { data, error } = await client.rpc("claim_notification_batch", {
        batch_size: input.batchSize,
        delivery_provider: input.provider,
        worker_id: input.workerId,
      });
      if (error) throw new Error("Notification claim failed.");
      return data;
    },
    async fail(claim, input) {
      const { error } = await client.rpc("fail_notification_delivery", {
        delivery_provider: input.provider,
        retryable: input.retryable,
        target_error_code: input.errorCode,
        target_lock_token: claim.lock_token,
        target_notification_id: claim.notification_id,
      });
      if (error) throw new Error("Notification failure update failed.");
    },
    async succeed(claim, input) {
      const { error } = await client.rpc("complete_notification_delivery", {
        delivery_provider: input.provider,
        target_lock_token: claim.lock_token,
        target_notification_id: claim.notification_id,
        target_provider_message_id: input.messageId,
      });
      if (error) throw new Error("Notification completion update failed.");
    },
  };
}

export async function processConfiguredNotificationBatch(): Promise<NotificationBatchResult> {
  const env = parseServerEnv({
    APP_URL: process.env.APP_URL,
    EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NOTIFICATION_WORKER_SECRET: process.env.NOTIFICATION_WORKER_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });
  if (!env.EMAIL_DELIVERY_MODE || !env.EMAIL_FROM) {
    throw new Error("Notification delivery is not configured.");
  }
  let adapter: EmailDeliveryAdapter;
  if (env.EMAIL_DELIVERY_MODE === "resend") {
    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Notification provider is not configured.");
    adapter = new ResendEmailDeliveryAdapter({ apiKey });
  } else {
    adapter = new TestEmailDeliveryAdapter();
  }
  return processNotificationBatch({
    adapter,
    appUrl: env.APP_URL,
    batchSize: 25,
    from: env.EMAIL_FROM,
    repository: databaseRepository(),
    workerId: crypto.randomUUID(),
  });
}
