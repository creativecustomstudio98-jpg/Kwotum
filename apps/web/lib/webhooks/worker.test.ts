import { describe, expect, it, vi } from "vitest";

import type {
  ClaimedWebhookDelivery,
  WebhookAdapterResult,
  WebhookDeliveryAdapter,
  WebhookRepository,
} from "./worker";
import { buildWebhookEnvelope, processWebhookBatch } from "./worker";

function claim(overrides: Partial<ClaimedWebhookDelivery> = {}): ClaimedWebhookDelivery {
  return {
    attempt_number: 1,
    contact_email: "klient@example.pl",
    contact_name: "Klient Testowy",
    contact_phone: "+48 500 600 700",
    delivery_id: "10000000-0000-4000-8000-000000000001",
    endpoint_id: "20000000-0000-4000-8000-000000000001",
    endpoint_url: "https://hooks.partner.pl/kwotum",
    event_id: "30000000-0000-4000-8000-000000000001",
    event_type: "lead.created",
    flow_title: "Remont mieszkania",
    is_test: false,
    lead_public_id: "40000000-0000-4000-8000-000000000001",
    lock_token: "50000000-0000-4000-8000-000000000001",
    occurred_at: "2026-08-09T12:00:00.000Z",
    organization_id: "60000000-0000-4000-8000-000000000001",
    price_currency: "PLN",
    price_max_minor: 150_000,
    price_min_minor: 100_000,
    price_presentation: "range",
    secret_version: 1,
    submitted_at: "2026-08-09T12:00:00.000Z",
    ...overrides,
  };
}

function setup(result: WebhookAdapterResult, claims: ClaimedWebhookDelivery[] = [claim()]) {
  const deliver = vi.fn(async () => result);
  const fail = vi.fn(async () => undefined);
  const succeed = vi.fn(async () => undefined);
  const repository: WebhookRepository = {
    claim: vi.fn(async () => claims),
    fail,
    succeed,
  };
  const adapter: WebhookDeliveryAdapter = { deliver };
  return { adapter, deliver, fail, repository, succeed };
}

describe("webhook worker", () => {
  it("builds a minimal production projection without score, answers or files", () => {
    const envelope = buildWebhookEnvelope(claim());
    expect(envelope).toMatchObject({
      data: {
        lead: {
          contact: { email: "klient@example.pl" },
          estimate: { currency: "PLN", maximum_minor: 150_000, minimum_minor: 100_000 },
          id: "40000000-0000-4000-8000-000000000001",
        },
        test: false,
      },
      type: "lead.created",
      version: "2026-08-09",
    });
    expect(JSON.stringify(envelope)).not.toMatch(/score|answer|file|rule|category/i);
  });

  it("uses the same schema with reserved synthetic data for endpoint tests", () => {
    const envelope = buildWebhookEnvelope(
      claim({
        contact_email: null,
        contact_name: null,
        contact_phone: null,
        flow_title: null,
        is_test: true,
        lead_public_id: null,
        submitted_at: null,
      }),
    );
    expect(envelope.data.test).toBe(true);
    expect(envelope.data.lead.contact.email).toBe("webhook-test@example.invalid");
  });

  it("signs the exact body and marks a 2xx delivery successful", async () => {
    const setupResult = setup({ outcome: "delivered", responseStatus: 204 });
    const result = await processWebhookBatch({
      adapter: setupResult.adapter,
      batchSize: 25,
      masterSigningSecret: "master-signing-secret-with-at-least-32-characters",
      now: () => 1_800_000_000_000,
      repository: setupResult.repository,
      workerId: "70000000-0000-4000-8000-000000000001",
    });
    expect(result).toEqual({ claimed: 1, deadLettered: 0, delivered: 1, retrying: 0 });
    expect(setupResult.succeed).toHaveBeenCalledWith(expect.anything(), { responseStatus: 204 });
    expect(setupResult.deliver).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": "webhook/10000000-0000-4000-8000-000000000001",
          "X-Kwotum-Signature": expect.stringMatching(/^v1=[a-f0-9]{64}$/),
          "X-Kwotum-Timestamp": "1800000000",
        }),
      }),
    );
  });

  it("retries transient failures and dead-letters the fifth attempt", async () => {
    const transient = setup({
      errorCode: "http_5xx",
      outcome: "failed",
      responseStatus: 503,
      retryable: true,
    });
    expect(
      await processWebhookBatch({
        adapter: transient.adapter,
        batchSize: 25,
        masterSigningSecret: "master-signing-secret-with-at-least-32-characters",
        repository: transient.repository,
        workerId: "70000000-0000-4000-8000-000000000001",
      }),
    ).toMatchObject({ retrying: 1 });
    expect(transient.fail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ errorCode: "http_5xx", retryable: true }),
    );

    const exhausted = setup(
      { errorCode: "network", outcome: "failed", responseStatus: null, retryable: true },
      [claim({ attempt_number: 5 })],
    );
    expect(
      await processWebhookBatch({
        adapter: exhausted.adapter,
        batchSize: 25,
        masterSigningSecret: "master-signing-secret-with-at-least-32-characters",
        repository: exhausted.repository,
        workerId: "70000000-0000-4000-8000-000000000001",
      }),
    ).toMatchObject({ deadLettered: 1, retrying: 0 });
  });

  it("dead-letters an incomplete database projection without calling the network", async () => {
    const setupResult = setup({ outcome: "delivered", responseStatus: 200 }, [
      claim({ contact_email: null }),
    ]);
    const result = await processWebhookBatch({
      adapter: setupResult.adapter,
      batchSize: 25,
      masterSigningSecret: "master-signing-secret-with-at-least-32-characters",
      repository: setupResult.repository,
      workerId: "70000000-0000-4000-8000-000000000001",
    });
    expect(result.deadLettered).toBe(1);
    expect(setupResult.deliver).not.toHaveBeenCalled();
    expect(setupResult.fail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ errorCode: "configuration", retryable: false }),
    );
  });
});
