import type { Database } from "@wyceno/database";
import { TestEmailDeliveryAdapter } from "@wyceno/email";
import { describe, expect, it, vi } from "vitest";

import { processFlowInvitationBatch, type FlowInvitationRepository } from "./worker";

type Claim = Database["public"]["Functions"]["claim_flow_invitation_batch"]["Returns"][number];

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    attempt_number: 1,
    company_name: "Studio Mebli",
    flow_id: "f0000000-0000-4000-8000-000000000002",
    flow_title: "Kuchnia",
    invitation_id: "e0000000-0000-4000-8000-000000000003",
    lock_token: "e0000000-0000-4000-8000-000000000002",
    organization_id: "a0000000-0000-4000-8000-000000000001",
    personal_message: "Proszę uzupełnić zakres.",
    public_flow_id: "f0000000-0000-4000-8000-000000000001",
    recipient_email: "klient@example.test",
    recipient_name: "Jan",
    template_version: "flow-invitation-v1",
    ...overrides,
  };
}

function repository(claims: Claim[]): FlowInvitationRepository {
  return {
    claim: vi.fn(async () => claims),
    fail: vi.fn(async () => undefined),
    succeed: vi.fn(async () => undefined),
  };
}

describe("flow invitation worker", () => {
  it("delivers with the test adapter and does not log PII", async () => {
    const repo = repository([claim()]);
    const spies = ["log", "info", "warn", "error"].map((method) =>
      vi.spyOn(console, method as "log").mockImplementation(() => undefined),
    );

    await expect(
      processFlowInvitationBatch({
        adapter: new TestEmailDeliveryAdapter(),
        appUrl: "https://app.wyceno.test",
        batchSize: 10,
        from: "powiadomienia@example.test",
        repository: repo,
        workerId: crypto.randomUUID(),
      }),
    ).resolves.toEqual({ claimed: 1, failed: 0, retrying: 0, sent: 1 });
    expect(repo.succeed).toHaveBeenCalledOnce();
    for (const spy of spies) expect(spy).not.toHaveBeenCalled();
  });

  it("fails an unsupported template without delivery", async () => {
    const repo = repository([claim({ template_version: "unknown" })]);
    await expect(
      processFlowInvitationBatch({
        adapter: new TestEmailDeliveryAdapter(),
        appUrl: "https://app.wyceno.test",
        batchSize: 10,
        from: "powiadomienia@example.test",
        repository: repo,
        workerId: crypto.randomUUID(),
      }),
    ).resolves.toEqual({ claimed: 1, failed: 1, retrying: 0, sent: 0 });
    expect(repo.fail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ errorCode: "configuration", retryable: false }),
    );
  });
});
