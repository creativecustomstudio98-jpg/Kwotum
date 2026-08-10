import { describe, expect, it, vi } from "vitest";

import {
  WidgetApiError,
  type SaveAnswerInput,
  type WidgetApi,
  type WidgetSessionSnapshot,
} from "./contracts.js";
import { WidgetSessionController } from "./controller.js";
import { MemoryWidgetStorage } from "./storage.js";
import { testManifest, testPublicId } from "./test-fixtures.js";

function apiFixture(overrides: Partial<WidgetApi> = {}): WidgetApi {
  const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(async (input: SaveAnswerInput) => ({
    currentStepKey: input.nextStepKey,
    revision: input.expectedRevision + 1,
  }));
  return {
    createSession: vi.fn(async () => ({
      currentStepKey: testManifest.entryStepKey,
      expiresAt: "2099-01-01T00:00:00.000Z",
      manifest: testManifest,
      revision: 0,
      token: "b".repeat(64),
    })),
    getManifest: vi.fn(async () => testManifest),
    getResult: vi.fn(async () => ({
      disclaimer: "Wynik jest orientacyjny i nie stanowi oferty.",
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
  it("publishes analytics refusal before the API response without a delayed success render", async () => {
    let resolveConsent!: () => void;
    const consentRequest = new Promise<void>((resolve) => {
      resolveConsent = resolve;
    });
    const api = apiFixture({
      setAnalyticsConsent: vi.fn(() => consentRequest),
    });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);

    const states: Array<boolean | null> = [];
    controller.subscribe((state) => states.push(state.analyticsConsent));
    const pending = controller.setAnalyticsConsent(false);

    expect(controller.state.analyticsConsent).toBe(false);
    expect(states).toEqual([null, false]);

    resolveConsent();
    expect(await pending).toBe(true);
    expect(states).toEqual([null, false]);
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
