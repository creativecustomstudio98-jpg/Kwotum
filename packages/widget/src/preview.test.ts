import { describe, expect, it } from "vitest";

import { PreviewWidgetApi } from "./preview.js";
import { testManifest } from "./test-fixtures.js";

describe("PreviewWidgetApi", () => {
  it("przechodzi proces bez sieci i zwraca syntetyczne potwierdzenie", async () => {
    const api = new PreviewWidgetApi(testManifest);
    const created = await api.createSession(testManifest.publicId, {});
    const first = await api.saveAnswer({
      answer: "standard",
      expectedRevision: 0,
      mutationId: crypto.randomUUID(),
      nextStepKey: "location",
      stepKey: "service",
      token: created.token,
    });
    expect(first.revision).toBe(1);
    const second = await api.saveAnswer({
      answer: "Warszawa",
      expectedRevision: 1,
      mutationId: crypto.randomUUID(),
      nextStepKey: null,
      stepKey: "location",
      token: created.token,
    });
    expect(second.currentStepKey).toBeNull();
    await expect(api.getResult(created.token)).resolves.toMatchObject({ pricing: null });
    await expect(
      api.submitLead({
        challengeToken: "preview-local",
        contact: { email: "preview@example.test" },
        fileIds: [],
        marketingEmailConsent: null,
        mutationId: crypto.randomUUID(),
        privacyNotice: { accepted: true, textHash: "a".repeat(64), version: "v1" },
        token: created.token,
      }),
    ).resolves.toMatchObject({ leadPublicId: expect.any(String) });
  });

  it("odrzuca zmianę z nieaktualną rewizją", async () => {
    const api = new PreviewWidgetApi(testManifest);
    const created = await api.createSession(testManifest.publicId, {});
    await expect(
      api.saveAnswer({
        answer: "standard",
        expectedRevision: 4,
        mutationId: crypto.randomUUID(),
        nextStepKey: "location",
        stepKey: "service",
        token: created.token,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
