import type { WebhookDeliverySummary } from "./service";

const oneDayInMilliseconds = 24 * 60 * 60 * 1_000;

export function getRecentWebhookDeliveries(
  deliveries: readonly WebhookDeliverySummary[],
  referenceTime = Date.now(),
): WebhookDeliverySummary[] {
  const cutoff = referenceTime - oneDayInMilliseconds;
  return deliveries.filter((delivery) => new Date(delivery.createdAt).getTime() >= cutoff);
}
