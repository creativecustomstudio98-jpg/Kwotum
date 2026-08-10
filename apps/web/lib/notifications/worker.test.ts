import type { Database } from "@wyceno/database";
import { TestEmailDeliveryAdapter } from "@wyceno/email";
import { afterEach, describe, expect, it, vi } from "vitest";

import { processNotificationBatch, type NotificationRepository } from "./worker";

type Claim = Database["public"]["Functions"]["claim_notification_batch"]["Returns"][number];

afterEach(() => vi.restoreAllMocks());

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    attempt_number: 1,
    company_name: "Studio Mebli",
    contact_email: "klient@example.test",
    contact_name: "Jan",
    flow_title: "Kuchnia",
    kind: "lead_customer_confirmation",
    lead_id: "e0000000-0000-4000-8000-000000000001",
    lock_token: "e0000000-0000-4000-8000-000000000002",
    notification_id: "e0000000-0000-4000-8000-000000000003",
    organization_id: "a0000000-0000-4000-8000-000000000001",
    price_currency: "PLN",
    price_max_minor: 15000,
    price_min_minor: 10000,
    price_presentation: "range",
    recipient_email: "klient@example.test",
    score: 80,
    submitted_at: "2026-07-25T12:00:00.000Z",
    template_version: "lead-customer-v1",
    ...overrides,
  };
}

function repository(claims: Claim[]): NotificationRepository {
  return {
    claim: vi.fn(async () => claims),
    fail: vi.fn(async () => undefined),
    succeed: vi.fn(async () => undefined),
  };
}

describe("notification worker", () => {
  it("processes the real renderer through test delivery without logging PII", async () => {
    const repo = repository([claim()]);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      processNotificationBatch({
        adapter: new TestEmailDeliveryAdapter(),
        appUrl: "https://app.wyceno.test",
        batchSize: 10,
        from: "powiadomienia@example.test",
        repository: repo,
        workerId: "e0000000-0000-4000-8000-000000000004",
      }),
    ).resolves.toEqual({ claimed: 1, failed: 0, retrying: 0, sent: 1 });
    expect(repo.succeed).toHaveBeenCalledOnce();
    expect(logSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("permanently fails an unsupported template version", async () => {
    const repo = repository([claim({ template_version: "unknown-v2" })]);

    await expect(
      processNotificationBatch({
        adapter: new TestEmailDeliveryAdapter(),
        appUrl: "https://app.wyceno.test",
        batchSize: 10,
        from: "powiadomienia@example.test",
        repository: repo,
        workerId: "e0000000-0000-4000-8000-000000000004",
      }),
    ).resolves.toEqual({ claimed: 1, failed: 1, retrying: 0, sent: 0 });
    expect(repo.fail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ errorCode: "configuration", retryable: false }),
    );
  });
});
