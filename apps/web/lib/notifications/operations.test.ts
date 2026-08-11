import { describe, expect, it } from "vitest";

import { evaluateNotificationDeliveryHealth, notificationDeliveryThresholds } from "./operations";

const healthyRow = {
  cron_age_seconds: 30,
  invitation_failed: 0,
  invitation_oldest_waiting_age_seconds: null,
  invitation_processing: 0,
  invitation_stale_processing: 0,
  invitation_waiting: 0,
  last_cron_failed_at: null,
  last_cron_outcome: "succeeded",
  last_cron_started_at: "2026-08-11T09:00:00.000Z",
  last_cron_succeeded_at: "2026-08-11T09:00:01.000Z",
  notification_failed: 0,
  notification_oldest_waiting_age_seconds: 20,
  notification_processing: 0,
  notification_stale_processing: 0,
  notification_waiting: 1,
  observed_at: "2026-08-11T09:00:30.000Z",
} as const;

describe("notification delivery health", () => {
  it("reports a recent scheduler heartbeat and young queue as healthy", () => {
    expect(evaluateNotificationDeliveryHealth(healthyRow)).toMatchObject({
      issues: [],
      queues: { notifications: { waiting: 1 } },
      scheduler: { ageSeconds: 30 },
      status: "ok",
    });
  });

  it("fails closed when no cron heartbeat exists", () => {
    expect(
      evaluateNotificationDeliveryHealth({
        ...healthyRow,
        cron_age_seconds: null,
        last_cron_started_at: null,
        last_cron_succeeded_at: null,
      }),
    ).toMatchObject({ issues: ["scheduler_missing"], status: "unavailable" });
  });

  it("reports stale scheduler, old queues, stuck locks and terminal failures", () => {
    const health = evaluateNotificationDeliveryHealth({
      ...healthyRow,
      cron_age_seconds: notificationDeliveryThresholds.maximumSchedulerAgeSeconds + 1,
      invitation_failed: 1,
      invitation_oldest_waiting_age_seconds:
        notificationDeliveryThresholds.maximumQueueAgeSeconds + 1,
      invitation_stale_processing: 1,
      notification_failed: 2,
      notification_oldest_waiting_age_seconds:
        notificationDeliveryThresholds.maximumQueueAgeSeconds + 1,
      notification_stale_processing: 1,
    });

    expect(health.status).toBe("unavailable");
    expect(health.issues).toEqual([
      "scheduler_stale",
      "notification_queue_old",
      "invitation_queue_old",
      "notification_stale_processing",
      "invitation_stale_processing",
      "notification_failed",
      "invitation_failed",
    ]);
  });

  it("distinguishes a failed run from a scheduler that stopped or remained running", () => {
    expect(
      evaluateNotificationDeliveryHealth({ ...healthyRow, last_cron_outcome: "failed" }).issues,
    ).toEqual(["scheduler_failed"]);
    expect(
      evaluateNotificationDeliveryHealth({
        ...healthyRow,
        cron_age_seconds: notificationDeliveryThresholds.maximumRunAgeSeconds + 1,
        last_cron_outcome: "running",
      }).issues,
    ).toEqual(["scheduler_stuck"]);
  });
});
