import type { Database } from "@wyceno/database";
import { TestEmailDeliveryAdapter, type EmailDeliveryAdapter } from "@wyceno/email";
import { afterEach, describe, expect, it, vi } from "vitest";

import { processNotificationBatch, type NotificationRepository } from "./worker";

type Claim = Database["public"]["Functions"]["claim_notification_batch"]["Returns"][number];

afterEach(() => vi.restoreAllMocks());

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    answers: [
      { answer: "Laweta", question: "Rodzaj przyczepy" },
      { answer: 2700, question: "DMC" },
    ],
    attempt_number: 1,
    company_name: "Studio Mebli",
    contact_email: "klient@example.test",
    contact_name: "Jan",
    contact_phone: "+48 500 600 700",
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

  it("renders display labels from the claim instead of technical option keys", async () => {
    const repo = repository([
      claim({
        answers: [
          { answer: "Materiały i regularna praca", question: "Co chcesz przewozić?" },
          { answer: "Kilka razy w miesiącu", question: "Jak często przyczepa będzie używana?" },
          {
            answer: ["Łatwe zabezpieczenie ładunku", "Możliwość konsultacji"],
            question: "Które cechy są dla Ciebie ważne?",
          },
        ],
        kind: "lead_company_alert",
        template_version: "lead-company-v2",
      }),
    ]);
    const deliver = vi.fn<EmailDeliveryAdapter["deliver"]>(async () => ({
      messageId: "test_display_labels",
      outcome: "sent",
    }));

    await expect(
      processNotificationBatch({
        adapter: { deliver, name: "test" },
        appUrl: "https://app.wyceno.test",
        batchSize: 10,
        from: "powiadomienia@example.test",
        repository: repo,
        workerId: "e0000000-0000-4000-8000-000000000004",
      }),
    ).resolves.toEqual({ claimed: 1, failed: 0, retrying: 0, sent: 1 });

    const message = deliver.mock.calls[0]?.[0].message;
    expect(message?.text).toContain("Co chcesz przewozić?: Materiały i regularna praca");
    expect(message?.text).toContain(
      "Które cechy są dla Ciebie ważne?: Łatwe zabezpieczenie ładunku, Możliwość konsultacji",
    );
    expect(message?.html).toContain("Kilka razy w miesiącu");
    expect(message?.text).not.toMatch(/opcja(?:_|\b)/i);
    expect(message?.html).not.toMatch(/opcja(?:_|\b)/i);
    expect(message?.templateVersion).toBe("lead-company-v2");
  });

  it("keeps v1 retries on the locked renderer", async () => {
    const repo = repository([
      claim({
        contact_email: null,
        contact_name: null,
        kind: "lead_company_alert",
        price_currency: null,
        price_max_minor: null,
        price_min_minor: null,
        price_presentation: null,
        score: null,
        template_version: "lead-company-v1",
      }),
    ]);
    const deliver = vi.fn<EmailDeliveryAdapter["deliver"]>(async () => ({
      messageId: "test_v1_retry",
      outcome: "sent",
    }));

    await expect(
      processNotificationBatch({
        adapter: { deliver, name: "test" },
        appUrl: "https://app.wyceno.test",
        batchSize: 10,
        from: "powiadomienia@example.test",
        repository: repo,
        workerId: "e0000000-0000-4000-8000-000000000004",
      }),
    ).resolves.toEqual({ claimed: 1, failed: 0, retrying: 0, sent: 1 });

    const message = deliver.mock.calls[0]?.[0].message;
    expect(message?.templateVersion).toBe("lead-company-v1");
    expect(message?.html).toContain("kwotum-logo-v3.png");
    expect(message?.html).not.toContain("kwotum-logo-icon-v3.png");
    expect(message?.text).toContain("E-mail: Nie podano");
    expect(message?.text).toContain("Orientacyjny wynik: Nie obliczono");
  });

  it("permanently fails a template version that does not match the kind", async () => {
    const repo = repository([
      claim({
        kind: "lead_customer_confirmation",
        template_version: "lead-company-v2",
      }),
    ]);

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

  it("permanently fails an unsupported template version", async () => {
    const repo = repository([
      claim({ template_version: "unknown-v2" as Claim["template_version"] }),
    ]);

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
