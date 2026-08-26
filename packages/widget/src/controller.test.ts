import { describe, expect, it, vi } from "vitest";

import {
  WidgetApiError,
  type SaveAnswerInput,
  type WidgetApi,
  type WidgetSessionSnapshot,
  type WidgetSubmission,
} from "./contracts.js";
import { WidgetSessionController } from "./controller.js";
import { MemoryWidgetStorage } from "./storage.js";
import { quickTestManifest, testManifest, testPublicId } from "./test-fixtures.js";

function apiFixture(overrides: Partial<WidgetApi> = {}): WidgetApi {
  const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(async (input: SaveAnswerInput) => ({
    currentStepKey: input.nextStepKey,
    revision: input.expectedRevision + 1,
  }));
  return {
    createSession: vi.fn(async () => ({
      context: [],
      contextConfirmed: true,
      currentStepKey: testManifest.entryStepKey,
      expiresAt: "2099-01-01T00:00:00.000Z",
      manifest: testManifest,
      revision: 0,
      token: "b".repeat(64),
    })),
    getManifest: vi.fn(async () => testManifest),
    confirmContext: vi.fn(async () => []),
    getResult: vi.fn(async () => ({
      action: "capture_lead" as const,
      disclaimer: "Wynik jest orientacyjny i nie stanowi oferty.",
      fallbackContactLabel: null,
      fallbackContactUrl: null,
      headline: "Orientacyjny przedział",
      nextStepLabel: "Przekaż dane do konsultacji",
      pricing: {
        currency: "PLN",
        formattedMax: "15 000,00 zł",
        formattedMin: "10 000,00 zł",
        maxMinor: 1_500_000,
        minMinor: 1_000_000,
        presentation: "range" as const,
      },
    })),
    resumeSession: vi.fn(async (): Promise<WidgetSessionSnapshot> => ({
      answers: {},
      context: [],
      contextConfirmed: true,
      currentStepKey: testManifest.entryStepKey,
      expiresAt: "2099-01-01T00:00:00.000Z",
      manifest: testManifest,
      revision: 0,
    })),
    saveAnswer,
    setAnalyticsConsent: vi.fn(async () => undefined),
    submitLead: vi.fn(async () => ({
      leadPublicId: "e0000000-0000-4000-8000-000000000001",
      submittedAt: "2026-07-25T12:00:00.000Z",
    })),
    trackAnalyticsEvent: vi.fn(async () => undefined),
    uploadFile: vi.fn(async (file) => ({
      fileId: "d0000000-0000-4000-8000-000000000001",
      mimeType: file.type,
      name: file.name,
      sizeBytes: file.size,
    })),
    ...overrides,
  };
}

describe("WidgetSessionController", () => {
  it("passes host context, blocks answers and continues only after explicit confirmation", async () => {
    const context = [
      {
        allowedValues: ["M2", "M3"],
        key: "model",
        label: "Wybrany model",
        mode: "confirm" as const,
        type: "text" as const,
        value: "M2",
      },
    ];
    const api = apiFixture({
      confirmContext: vi.fn(async () => [{ ...context[0]!, value: "M3" }]),
      createSession: vi.fn(async () => ({
        context,
        contextConfirmed: false,
        currentStepKey: testManifest.entryStepKey,
        expiresAt: "2099-01-01T00:00:00.000Z",
        manifest: testManifest,
        revision: 0,
        token: "b".repeat(64),
      })),
    });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage(), {
      model: "M2",
    });
    await controller.initialize(testPublicId);

    expect(api.createSession).toHaveBeenCalledWith(testPublicId, { model: "M2" });
    await controller.setAnalyticsConsent(true);
    await controller.flush();
    expect(api.trackAnalyticsEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "step_viewed" }),
    );
    expect(controller.answer("standard")).toBe(false);
    expect(controller.state.contextError).toContain("potwierdź kontekst");
    expect(await controller.confirmContext({ model: "M3" })).toBe(true);
    expect(controller.state.contextConfirmed).toBe(true);
    expect(controller.state.context[0]?.value).toBe("M3");
    await controller.flush();
    expect(api.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: "step_viewed", stepKey: "service" }),
    );
    expect(controller.answer("standard")).toBe(true);
  });

  it("queues PII-free events until consent and deletes the queue after refusal", async () => {
    const api = apiFixture();
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);

    expect(api.trackAnalyticsEvent).not.toHaveBeenCalled();
    expect(await controller.setAnalyticsConsent(true)).toBe(true);
    await controller.flush();
    expect(api.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "widget_loaded",
        stepKey: null,
      }),
    );
    expect(await controller.setAnalyticsConsent(false)).toBe(true);
    controller.trackAnalytics("cta_clicked");
    await controller.flush();
    expect(controller.state.analyticsConsent).toBe(false);
  });

  it("runs a conditional flow and autosaves each answer", async () => {
    const api = apiFixture();
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);

    expect(controller.state.status).toBe("active");
    expect(controller.answer("premium")).toBe(true);
    await controller.flush();
    expect(controller.state.currentStep?.key).toBe("details");

    expect(controller.answer("__unknown__")).toBe(true);
    await controller.flush();
    expect(controller.state.currentStep?.key).toBe("location");

    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    expect(controller.state.status).toBe("result");
    expect(controller.state.result?.pricing?.minMinor).toBe(1_000_000);
    expect(api.saveAnswer).toHaveBeenCalledTimes(3);
    expect(api.getResult).toHaveBeenCalledOnce();
  });

  it("keeps the full result behind contact for a versioned contact-first snapshot", async () => {
    const manifest = {
      ...structuredClone(testManifest),
      leadCapture: {
        completionOrder: "contact_then_result",
        contactPolicy: "email_required",
        fields: {
          email: "required",
          name: "optional",
          phone: "optional",
          preferredContactChannel: "hidden",
          preferredContactWindow: "optional",
        },
        filesEnabled: false,
        leadCaptureSchemaVersion: 3,
        marketingEmailConsent: null,
        privacyNotice: testManifest.leadCapture!.privacyNotice,
      } as const,
    };
    const api = apiFixture({
      createSession: vi.fn(async () => ({
        context: [],
        contextConfirmed: true,
        currentStepKey: manifest.entryStepKey,
        expiresAt: "2099-01-01T00:00:00.000Z",
        manifest,
        revision: 0,
        token: "b".repeat(64),
      })),
    });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Warszawa");
    await controller.flush();
    expect(controller.state.status).toBe("contact");
    expect(controller.state.result).toBeNull();
    expect(api.getResult).not.toHaveBeenCalled();

    expect(
      await controller.submitLead(
        {
          email: "klient@example.test",
          files: [],
          marketingEmailAccepted: false,
          preferredContactWindow: "afternoon",
          privacyAccepted: true,
        },
        async () => "challenge",
      ),
    ).toBe(true);
    expect(api.submitLead).toHaveBeenCalledOnce();
    expect(api.getResult).toHaveBeenCalledOnce();
    expect(controller.state.status).toBe("submitted");
    expect(controller.state.result?.headline).toBe("Orientacyjny przedział");
  });

  it("validates and queues a quick form as one ordered server-backed submission", async () => {
    const api = apiFixture({
      createSession: vi.fn(async () => ({
        context: [],
        contextConfirmed: true,
        currentStepKey: quickTestManifest.entryStepKey,
        expiresAt: "2099-01-01T00:00:00.000Z",
        manifest: quickTestManifest,
        revision: 0,
        token: "b".repeat(64),
      })),
    });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);

    expect(
      controller.submitQuickForm({ details: null, location: null, service: "standard" }),
    ).toEqual({ accepted: false, firstInvalidStepKey: "location" });
    expect(controller.state.answers.service).toBe("standard");
    expect(controller.state.validationStepKey).toBe("location");
    expect(api.saveAnswer).not.toHaveBeenCalled();

    expect(
      controller.submitQuickForm({ details: null, location: "Gdańsk", service: "standard" }),
    ).toEqual({ accepted: true, firstInvalidStepKey: null });
    await controller.flush();
    expect(api.saveAnswer).toHaveBeenCalledTimes(3);
    expect(api.saveAnswer).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ nextStepKey: "details", stepKey: "service" }),
    );
    expect(api.saveAnswer).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ nextStepKey: null, stepKey: "location" }),
    );
    expect(controller.state.status).toBe("result");
  });

  it("keeps progress locally after network loss and flushes it later", async () => {
    let offline = true;
    const api = apiFixture({
      saveAnswer: vi.fn(async (input: SaveAnswerInput) => {
        if (offline) throw new WidgetApiError("NETWORK", "offline");
        return { currentStepKey: input.nextStepKey, revision: input.expectedRevision + 1 };
      }),
    });
    const storage = new MemoryWidgetStorage();
    const controller = new WidgetSessionController(api, storage);
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();

    expect(controller.state.currentStep?.key).toBe("location");
    expect(controller.state.syncStatus).toBe("offline");
    expect(storage.load(testPublicId)?.pending).toHaveLength(1);

    offline = false;
    await controller.flush();
    expect(controller.state.syncStatus).toBe("synced");
    expect(storage.load(testPublicId)?.pending).toHaveLength(0);
  });

  it("resumes a stored session and preserves queued offline answers", async () => {
    const storage = new MemoryWidgetStorage();
    const offlineApi = apiFixture({
      saveAnswer: vi.fn(async () => {
        throw new WidgetApiError("NETWORK", "offline");
      }),
    });
    const first = new WidgetSessionController(offlineApi, storage);
    await first.initialize(testPublicId);
    first.answer("premium");
    await first.flush();

    const onlineApi = apiFixture();
    const resumed = new WidgetSessionController(onlineApi, storage);
    await resumed.initialize(testPublicId);

    expect(resumed.state.currentStep?.key).toBe("details");
    expect(resumed.state.answers.service).toBe("premium");
    expect(onlineApi.saveAnswer).toHaveBeenCalledOnce();
  });

  it("uploads files and submits contact with versioned consent proofs", async () => {
    const api = apiFixture();
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Gdańsk");
    await controller.flush();

    const challenge = vi.fn(async () => "fresh-challenge-token");
    const submitted = await controller.submitLead(
      {
        email: "klient@example.test",
        files: [new File(["%PDF-test"], "projekt.pdf", { type: "application/pdf" })],
        marketingEmailAccepted: true,
        name: "Jan Kowalski",
        privacyAccepted: true,
      },
      challenge,
    );

    expect(submitted).toBe(true);
    expect(controller.state.status).toBe("submitted");
    expect(controller.state.uploadedFiles).toHaveLength(1);
    expect(api.submitLead).toHaveBeenCalledWith(
      expect.objectContaining({
        challengeToken: "fresh-challenge-token",
        marketingEmailConsent: expect.objectContaining({
          textHash: "c".repeat(64),
          version: "marketing-v1",
        }),
        privacyNotice: expect.objectContaining({
          textHash: "b".repeat(64),
          version: "privacy-v1",
        }),
      }),
    );
    expect(challenge).toHaveBeenCalledOnce();
  });

  it("ignores a duplicate lead submit while the first request is in flight", async () => {
    let finishSubmit: (() => void) | undefined;
    const api = apiFixture({
      submitLead: vi.fn<WidgetApi["submitLead"]>(
        () =>
          new Promise<WidgetSubmission>((resolve) => {
            finishSubmit = () =>
              resolve({
                leadPublicId: "e0000000-0000-4000-8000-000000000001",
                submittedAt: "2026-08-25T12:00:00.000Z",
              });
          }),
      ),
    });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Gdańsk");
    await controller.flush();
    const draft = {
      email: "klient@example.test",
      files: [],
      marketingEmailAccepted: false,
      privacyAccepted: true,
    };
    const first = controller.submitLead(draft, async () => "single-use-token");
    expect(await controller.submitLead(draft, async () => "duplicate-token")).toBe(false);
    expect(api.submitLead).toHaveBeenCalledOnce();
    finishSubmit?.();
    expect(await first).toBe(true);
  });

  it("submits a phone-first lead without inventing an e-mail address", async () => {
    if (!testManifest.leadCapture) throw new Error("Missing lead capture fixture.");
    const phoneManifest = {
      ...testManifest,
      leadCapture: {
        ...testManifest.leadCapture,
        contactPolicy: "phone_required" as const,
        marketingEmailConsent: null,
      },
    };
    const api = apiFixture({
      createSession: vi.fn(async () => ({
        context: [],
        contextConfirmed: true,
        currentStepKey: phoneManifest.entryStepKey,
        expiresAt: "2099-01-01T00:00:00.000Z",
        manifest: phoneManifest,
        revision: 0,
        token: "b".repeat(64),
      })),
    });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Gdańsk");
    await controller.flush();

    expect(
      await controller.submitLead(
        {
          email: "",
          files: [],
          marketingEmailAccepted: false,
          phone: "+48 500 600 700",
          privacyAccepted: true,
        },
        async () => "fresh-phone-challenge",
      ),
    ).toBe(true);
    expect(api.submitLead).toHaveBeenCalledWith(
      expect.objectContaining({ contact: { phone: "+48 500 600 700" } }),
    );
  });

  it("retries only the files that were not uploaded before a network failure", async () => {
    let failedOnce = false;
    let nextFileId = 1;
    const uploadFile = vi.fn<WidgetApi["uploadFile"]>(async (file) => {
      if (file.name === "drugi.pdf" && !failedOnce) {
        failedOnce = true;
        throw new WidgetApiError("NETWORK", "offline");
      }
      return {
        fileId: `d0000000-0000-4000-8000-${String(nextFileId++).padStart(12, "0")}`,
        mimeType: file.type,
        name: file.name,
        sizeBytes: file.size,
      };
    });
    const api = apiFixture({ uploadFile });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Gdańsk");
    await controller.flush();
    const files = [
      new File(["%PDF-one"], "pierwszy.pdf", { type: "application/pdf" }),
      new File(["%PDF-two"], "drugi.pdf", { type: "application/pdf" }),
    ];
    const draft = {
      email: "klient@example.test",
      files,
      marketingEmailAccepted: false,
      privacyAccepted: true,
    };

    const challenge = vi.fn(async () => "fresh-challenge-token");
    expect(await controller.submitLead(draft, challenge)).toBe(false);
    expect(challenge).not.toHaveBeenCalled();
    expect(controller.state.uploadedFiles).toHaveLength(1);
    expect(await controller.submitLead(draft, challenge)).toBe(true);
    expect(challenge).toHaveBeenCalledOnce();
    expect(uploadFile).toHaveBeenCalledTimes(3);
    expect(api.submitLead).toHaveBeenCalledWith(
      expect.objectContaining({ fileIds: expect.arrayContaining([expect.any(String)]) }),
    );
    expect(controller.state.uploadedFiles).toHaveLength(2);
  });

  it("requests a fresh challenge after a rejected submit", async () => {
    const submitLead = vi
      .fn<WidgetApi["submitLead"]>()
      .mockRejectedValueOnce(new WidgetApiError("CHALLENGE", "Potwierdzenie wygasło."))
      .mockResolvedValueOnce({
        leadPublicId: "e0000000-0000-4000-8000-000000000001",
        submittedAt: "2026-08-10T12:00:00.000Z",
      });
    const api = apiFixture({ submitLead });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Gdańsk");
    await controller.flush();
    const challenge = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("first-single-use-token")
      .mockResolvedValueOnce("second-single-use-token");
    const draft = {
      email: "klient@example.test",
      files: [],
      marketingEmailAccepted: false,
      privacyAccepted: true,
    };

    expect(await controller.submitLead(draft, challenge)).toBe(false);
    expect(await controller.submitLead(draft, challenge)).toBe(true);
    expect(challenge).toHaveBeenCalledTimes(2);
    expect(submitLead.mock.calls[0]?.[0].challengeToken).toBe("first-single-use-token");
    expect(submitLead.mock.calls[1]?.[0].challengeToken).toBe("second-single-use-token");
  });
});
