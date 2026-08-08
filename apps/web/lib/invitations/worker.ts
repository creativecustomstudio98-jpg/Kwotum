import { parseServerEnv } from "@wyceno/config/env";
import type { Database, NotificationErrorCode } from "@wyceno/database";
import {
  renderFlowInvitationEmail,
  ResendEmailDeliveryAdapter,
  TestEmailDeliveryAdapter,
  type EmailDeliveryAdapter,
} from "@wyceno/email";

import { createServiceClient } from "../supabase/service";

type ClaimedInvitation =
  Database["public"]["Functions"]["claim_flow_invitation_batch"]["Returns"][number];

export interface FlowInvitationRepository {
  claim(
    input: Readonly<{ batchSize: number; provider: "resend" | "test"; workerId: string }>,
  ): Promise<ClaimedInvitation[]>;
  fail(
    claim: ClaimedInvitation,
    input: Readonly<{
      errorCode: NotificationErrorCode;
      provider: "resend" | "test";
      retryable: boolean;
    }>,
  ): Promise<void>;
  succeed(
    claim: ClaimedInvitation,
    input: Readonly<{ messageId: string; provider: "resend" | "test" }>,
  ): Promise<void>;
}

export type FlowInvitationBatchResult = Readonly<{
  claimed: number;
  failed: number;
  retrying: number;
  sent: number;
}>;

export async function processFlowInvitationBatch(
  input: Readonly<{
    adapter: EmailDeliveryAdapter;
    appUrl: string;
    batchSize: number;
    from: string;
    repository: FlowInvitationRepository;
    workerId: string;
  }>,
): Promise<FlowInvitationBatchResult> {
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
    if (claim.template_version !== "flow-invitation-v1") {
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
      message = renderFlowInvitationEmail({
        appUrl: input.appUrl,
        companyName: claim.company_name,
        flowTitle: claim.flow_title,
        personalMessage: claim.personal_message,
        publicId: claim.public_flow_id,
        recipientName: claim.recipient_name,
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
      idempotencyKey: `flow-invitation/${claim.invitation_id}`,
      message,
      notificationId: claim.invitation_id,
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

function databaseRepository(): FlowInvitationRepository {
  const client = createServiceClient();
  return {
    async claim(input) {
      const { data, error } = await client.rpc("claim_flow_invitation_batch", {
        batch_size: input.batchSize,
        delivery_provider: input.provider,
        worker_id: input.workerId,
      });
      if (error) throw new Error("Flow invitation claim failed.");
      return data;
    },
    async fail(claim, input) {
      const { error } = await client.rpc("fail_flow_invitation_delivery", {
        delivery_provider: input.provider,
        retryable: input.retryable,
        target_error_code: input.errorCode,
        target_invitation_id: claim.invitation_id,
        target_lock_token: claim.lock_token,
      });
      if (error) throw new Error("Flow invitation failure update failed.");
    },
    async succeed(claim, input) {
      const { error } = await client.rpc("complete_flow_invitation_delivery", {
        delivery_provider: input.provider,
        target_invitation_id: claim.invitation_id,
        target_lock_token: claim.lock_token,
        target_provider_message_id: input.messageId,
      });
      if (error) throw new Error("Flow invitation completion update failed.");
    },
  };
}

export async function processConfiguredFlowInvitationBatch(): Promise<FlowInvitationBatchResult> {
  const env = parseServerEnv({
    APP_URL: process.env.APP_URL,
    EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NOTIFICATION_WORKER_SECRET: process.env.NOTIFICATION_WORKER_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });
  if (!env.EMAIL_DELIVERY_MODE || !env.EMAIL_FROM) {
    throw new Error("Flow invitation delivery is not configured.");
  }
  let adapter: EmailDeliveryAdapter;
  if (env.EMAIL_DELIVERY_MODE === "resend") {
    if (!env.RESEND_API_KEY) throw new Error("Flow invitation provider is not configured.");
    adapter = new ResendEmailDeliveryAdapter({ apiKey: env.RESEND_API_KEY });
  } else {
    adapter = new TestEmailDeliveryAdapter();
  }
  return processFlowInvitationBatch({
    adapter,
    appUrl: env.APP_URL,
    batchSize: 25,
    from: env.EMAIL_FROM,
    repository: databaseRepository(),
    workerId: crypto.randomUUID(),
  });
}
