import type { Database } from "@wyceno/database";

import { createServiceClient } from "../supabase/service";

export type NotificationWorkerSource = "cron" | "manual";

export type NotificationDeliveryIssue =
  | "invitation_failed"
  | "invitation_queue_old"
  | "invitation_stale_processing"
  | "notification_failed"
  | "notification_queue_old"
  | "notification_stale_processing"
  | "scheduler_failed"
  | "scheduler_missing"
  | "scheduler_stale"
  | "scheduler_stuck";

export type NotificationQueueHealth = Readonly<{
  failed: number;
  oldestWaitingAgeSeconds: number | null;
  processing: number;
  staleProcessing: number;
  waiting: number;
}>;

export type NotificationDeliveryHealth = Readonly<{
  issues: readonly NotificationDeliveryIssue[];
  observedAt: string;
  queues: Readonly<{
    invitations: NotificationQueueHealth;
    notifications: NotificationQueueHealth;
  }>;
  scheduler: Readonly<{
    ageSeconds: number | null;
    lastFailedAt: string | null;
    lastOutcome: "failed" | "running" | "succeeded" | null;
    lastStartedAt: string | null;
    lastSucceededAt: string | null;
  }>;
  status: "ok" | "unavailable";
}>;

type HealthRow =
  Database["public"]["Functions"]["get_notification_delivery_health"]["Returns"][number];

export const notificationDeliveryThresholds = Object.freeze({
  maximumQueueAgeSeconds: 10 * 60,
  maximumRunAgeSeconds: 90,
  maximumSchedulerAgeSeconds: 12 * 60,
});

function queueHealth(
  row: HealthRow,
  prefix: "invitation" | "notification",
): NotificationQueueHealth {
  return {
    failed: row[`${prefix}_failed`],
    oldestWaitingAgeSeconds: row[`${prefix}_oldest_waiting_age_seconds`],
    processing: row[`${prefix}_processing`],
    staleProcessing: row[`${prefix}_stale_processing`],
    waiting: row[`${prefix}_waiting`],
  };
}

export function evaluateNotificationDeliveryHealth(row: HealthRow): NotificationDeliveryHealth {
  const invitations = queueHealth(row, "invitation");
  const notifications = queueHealth(row, "notification");
  const issues: NotificationDeliveryIssue[] = [];

  if (row.last_cron_started_at === null || row.cron_age_seconds === null) {
    issues.push("scheduler_missing");
  } else if (row.cron_age_seconds > notificationDeliveryThresholds.maximumSchedulerAgeSeconds) {
    issues.push("scheduler_stale");
  }
  if (row.last_cron_outcome === "failed") issues.push("scheduler_failed");
  if (
    row.last_cron_outcome === "running" &&
    row.cron_age_seconds !== null &&
    row.cron_age_seconds > notificationDeliveryThresholds.maximumRunAgeSeconds
  ) {
    issues.push("scheduler_stuck");
  }
  if (
    notifications.oldestWaitingAgeSeconds !== null &&
    notifications.oldestWaitingAgeSeconds > notificationDeliveryThresholds.maximumQueueAgeSeconds
  ) {
    issues.push("notification_queue_old");
  }
  if (
    invitations.oldestWaitingAgeSeconds !== null &&
    invitations.oldestWaitingAgeSeconds > notificationDeliveryThresholds.maximumQueueAgeSeconds
  ) {
    issues.push("invitation_queue_old");
  }
  if (notifications.staleProcessing > 0) issues.push("notification_stale_processing");
  if (invitations.staleProcessing > 0) issues.push("invitation_stale_processing");
  if (notifications.failed > 0) issues.push("notification_failed");
  if (invitations.failed > 0) issues.push("invitation_failed");

  return {
    issues,
    observedAt: row.observed_at,
    queues: { invitations, notifications },
    scheduler: {
      ageSeconds: row.cron_age_seconds,
      lastFailedAt: row.last_cron_failed_at,
      lastOutcome: row.last_cron_outcome,
      lastStartedAt: row.last_cron_started_at,
      lastSucceededAt: row.last_cron_succeeded_at,
    },
    status: issues.length === 0 ? "ok" : "unavailable",
  };
}

export async function startNotificationWorkerRun(
  runId: string,
  source: NotificationWorkerSource,
): Promise<void> {
  const { error } = await createServiceClient().rpc("start_notification_worker_run", {
    target_run_id: runId,
    target_source: source,
  });
  if (error) throw new Error("Notification heartbeat start failed.");
}

export async function finishNotificationWorkerRun(
  runId: string,
  source: NotificationWorkerSource,
  result: Readonly<{ claimed: number; failed: number; retrying: number; sent: number }> | null,
): Promise<void> {
  const { error } = await createServiceClient().rpc("finish_notification_worker_run", {
    target_claimed: result?.claimed ?? null,
    target_failed: result?.failed ?? null,
    target_retrying: result?.retrying ?? null,
    target_run_id: runId,
    target_sent: result?.sent ?? null,
    target_source: source,
    target_succeeded: result !== null,
  });
  if (error) throw new Error("Notification heartbeat finish failed.");
}

export async function readNotificationDeliveryHealth(): Promise<NotificationDeliveryHealth> {
  const { data, error } = await createServiceClient().rpc("get_notification_delivery_health");
  const row = data?.[0];
  if (error || !row) throw new Error("Notification health probe failed.");
  return evaluateNotificationDeliveryHealth(row);
}
