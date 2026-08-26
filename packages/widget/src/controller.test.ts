import { describe, expect, it, vi } from "vitest";

import {
  WidgetApiError,
  type SaveAnswerInput,
  type WidgetApi,
  type WidgetSessionSnapshot,
  type WidgetSubmission,
} from "./contracts.js";
import { WidgetSessionController } from "./controller.js";
import { MemoryWidgetStorage, type PersistedWidgetSession, type WidgetStorage } from "./storage.js";
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

function persistedSession(overrides: Partial<PersistedWidgetSession> = {}): PersistedWidgetSession {
  return {
    analyticsConsent: null,
    answers: { service: "standard" },
    currentStepKey: "location",
    expiresAt: "2099-01-01T00:00:00.000Z",
    history: ["service"],
    manifest: testManifest,
    pending: [],
    publicId: testPublicId,
    revision: 1,
    savedAt: "2026-08-11T18:00:00.000Z",
    token: "b".repeat(64),
    version: 1,
    ...overrides,
  };
}

function deferred<T>(): {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T | PromiseLike<T>) => void;
} {
  let reject!: (reason?: unknown) => void;
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    reject = promiseReject;
    resolve = promiseResolve;
  });
  return { promise, reject, resolve };
}

function resumedSnapshot(
  stored: PersistedWidgetSession,
  overrides: Partial<WidgetSessionSnapshot> = {},
): WidgetSessionSnapshot {
  return {
    answers: stored.answers,
    context: stored.context ?? [],
    contextConfirmed: stored.contextConfirmed ?? true,
    currentStepKey: stored.currentStepKey,
    expiresAt: stored.expiresAt,
    manifest: stored.manifest,
    revision: stored.revision,
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

  it.each(["success", "failure"] as const)(
    "keeps a newer analytics refusal authoritative after a stale opt-in %s",
    async (outcome) => {
      const firstRequest = deferred<void>();
      const setAnalyticsConsent = vi
        .fn<WidgetApi["setAnalyticsConsent"]>()
        .mockImplementationOnce(() => firstRequest.promise)
        .mockResolvedValueOnce(undefined);
      const trackAnalyticsEvent = vi.fn<WidgetApi["trackAnalyticsEvent"]>(async () => undefined);
      const controller = new WidgetSessionController(
        apiFixture({ setAnalyticsConsent, trackAnalyticsEvent }),
        new MemoryWidgetStorage(),
      );
      await controller.initialize(testPublicId);

      const staleOptIn = controller.setAnalyticsConsent(true);
      await vi.waitFor(() => expect(setAnalyticsConsent).toHaveBeenCalledOnce());
      const refusal = controller.setAnalyticsConsent(false);
      expect(controller.state.analyticsConsent).toBe(false);
      expect(setAnalyticsConsent).toHaveBeenCalledOnce();

      if (outcome === "success") firstRequest.resolve(undefined);
      else firstRequest.reject(new WidgetApiError("NETWORK", "stale analytics failure"));
      expect(await staleOptIn).toBe(false);
      await vi.waitFor(() => expect(setAnalyticsConsent).toHaveBeenCalledTimes(2));
      expect(await refusal).toBe(true);

      expect(controller.state.analyticsConsent).toBe(false);
      expect(controller.state.analyticsError).toBeNull();
      expect(trackAnalyticsEvent).not.toHaveBeenCalled();
      expect(setAnalyticsConsent.mock.calls[1]?.[0].granted).toBe(false);
    },
  );

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

  it("retries only queued analytics after a submitted form reconnects", async () => {
    let analyticsOnline = true;
    let waitForRetry = false;
    const analyticsRetry = deferred<void>();
    const trackAnalyticsEvent = vi.fn<WidgetApi["trackAnalyticsEvent"]>(async () => {
      if (!analyticsOnline) throw new WidgetApiError("NETWORK", "analytics transport failure");
      if (waitForRetry) await analyticsRetry.promise;
    });
    const api = apiFixture({ trackAnalyticsEvent });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    expect(await controller.setAnalyticsConsent(true)).toBe(true);
    await controller.flush();
    controller.answer("standard");
    await controller.flush();
    controller.answer("Warszawa");
    await controller.flush();

    analyticsOnline = false;
    expect(
      await controller.submitLead(
        {
          email: "klient@example.test",
          files: [],
          marketingEmailAccepted: false,
          privacyAccepted: true,
        },
        async () => "fresh-challenge-token",
      ),
    ).toBe(true);
    await controller.flush();
    const analyticsCallsAfterFailure = trackAnalyticsEvent.mock.calls.length;
    const coreCalls = {
      create: vi.mocked(api.createSession).mock.calls.length,
      result: vi.mocked(api.getResult).mock.calls.length,
      resume: vi.mocked(api.resumeSession).mock.calls.length,
      save: vi.mocked(api.saveAnswer).mock.calls.length,
      submit: vi.mocked(api.submitLead).mock.calls.length,
    };

    analyticsOnline = true;
    waitForRetry = true;
    await controller.reconnect();

    expect(controller.state.status).toBe("submitted");
    expect(trackAnalyticsEvent).toHaveBeenCalledTimes(analyticsCallsAfterFailure + 1);
    expect(trackAnalyticsEvent.mock.calls.at(-1)?.[0].name).toBe("lead_submitted");
    expect(vi.mocked(api.createSession)).toHaveBeenCalledTimes(coreCalls.create);
    expect(vi.mocked(api.getResult)).toHaveBeenCalledTimes(coreCalls.result);
    expect(vi.mocked(api.resumeSession)).toHaveBeenCalledTimes(coreCalls.resume);
    expect(vi.mocked(api.saveAnswer)).toHaveBeenCalledTimes(coreCalls.save);
    expect(vi.mocked(api.submitLead)).toHaveBeenCalledTimes(coreCalls.submit);
    analyticsRetry.resolve(undefined);
  });

  it("does not let an old analytics completion remove the first event of a restarted session", async () => {
    const firstAnalytics = deferred<void>();
    const trackAnalyticsEvent = vi
      .fn<WidgetApi["trackAnalyticsEvent"]>()
      .mockImplementationOnce(() => firstAnalytics.promise)
      .mockResolvedValue(undefined);
    let createAttempt = 0;
    const createSession = vi.fn<WidgetApi["createSession"]>(async () => {
      createAttempt += 1;
      return {
        context: [],
        contextConfirmed: true,
        currentStepKey: testManifest.entryStepKey,
        expiresAt: "2099-01-01T00:00:00.000Z",
        manifest: testManifest,
        revision: 0,
        token: (createAttempt === 1 ? "b" : "c").repeat(64),
      };
    });
    const controller = new WidgetSessionController(
      apiFixture({ createSession, trackAnalyticsEvent }),
      new MemoryWidgetStorage(),
    );
    await controller.initialize(testPublicId);
    expect(await controller.setAnalyticsConsent(true)).toBe(true);
    await vi.waitFor(() => expect(trackAnalyticsEvent).toHaveBeenCalledOnce());

    await controller.restart();
    expect(await controller.setAnalyticsConsent(true)).toBe(true);
    firstAnalytics.resolve(undefined);
    await controller.flush();

    expect(trackAnalyticsEvent).toHaveBeenCalledTimes(3);
    expect(trackAnalyticsEvent.mock.calls[0]?.[0].token).toBe("b".repeat(64));
    expect(trackAnalyticsEvent.mock.calls[1]?.[0]).toEqual(
      expect.objectContaining({ name: "widget_loaded", token: "c".repeat(64) }),
    );
    expect(trackAnalyticsEvent.mock.calls[2]?.[0]).toEqual(
      expect.objectContaining({ name: "step_viewed", token: "c".repeat(64) }),
    );
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

  it("keeps a successful resume active when storage and analytics side effects fail", async () => {
    const stored = persistedSession({ analyticsConsent: true });
    const storage: WidgetStorage = {
      clear: vi.fn(),
      load: vi.fn(() => stored),
      save: vi.fn(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }),
    };
    const trackAnalyticsEvent = vi.fn<WidgetApi["trackAnalyticsEvent"]>(async () => {
      throw new Error("provider failure with untrusted details");
    });
    const api = apiFixture({
      resumeSession: vi.fn(async () => ({
        answers: { service: "standard" },
        context: [],
        contextConfirmed: true,
        currentStepKey: "location",
        expiresAt: stored.expiresAt,
        manifest: testManifest,
        revision: 1,
      })),
      trackAnalyticsEvent,
    });
    const controller = new WidgetSessionController(api, storage);

    await controller.initialize(testPublicId);
    await controller.flush();

    expect(controller.state.status).toBe("active");
    expect(controller.state.syncStatus).toBe("synced");
    expect(controller.state.errorMessage).toBeNull();
    expect(controller.state.answers).toEqual({ service: "standard" });
    expect(trackAnalyticsEvent).toHaveBeenCalled();
  });

  it("preserves the local session as recoverable offline state on a real resume failure", async () => {
    const storage = new MemoryWidgetStorage();
    storage.save(persistedSession());
    const resumeSession = vi
      .fn<WidgetApi["resumeSession"]>()
      .mockRejectedValueOnce(new WidgetApiError("NETWORK", "raw transport detail"))
      .mockResolvedValueOnce({
        answers: { service: "standard" },
        context: [],
        contextConfirmed: true,
        currentStepKey: "location",
        expiresAt: "2099-01-01T00:00:00.000Z",
        manifest: testManifest,
        revision: 1,
      });
    const api = apiFixture({
      resumeSession,
    });
    const controller = new WidgetSessionController(api, storage);

    await controller.initialize(testPublicId);

    expect(controller.state.status).toBe("active");
    expect(controller.state.syncStatus).toBe("offline");
    expect(controller.state.errorMessage).toBeNull();
    expect(controller.state.answers).toEqual({ service: "standard" });
    expect(api.createSession).not.toHaveBeenCalled();

    await Promise.all(Array.from({ length: 5 }, () => controller.reconnect()));

    expect(controller.state.status).toBe("active");
    expect(controller.state.syncStatus).toBe("synced");
    expect(resumeSession).toHaveBeenCalledTimes(2);
  });

  it("serializes online recovery behind an in-flight initial resume failure", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    let rejectInitialResume!: (reason: unknown) => void;
    let activeRequests = 0;
    let maxActiveRequests = 0;
    let attempt = 0;
    const resumeSession = vi.fn<WidgetApi["resumeSession"]>(async () => {
      attempt += 1;
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      try {
        if (attempt === 1) {
          await new Promise<never>((_resolve, reject) => {
            rejectInitialResume = reject;
          });
        }
        return {
          answers: stored.answers,
          context: [],
          contextConfirmed: true,
          currentStepKey: stored.currentStepKey,
          expiresAt: stored.expiresAt,
          manifest: testManifest,
          revision: stored.revision,
        };
      } finally {
        activeRequests -= 1;
      }
    });
    const controller = new WidgetSessionController(apiFixture({ resumeSession }), storage);

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledOnce());
    const recoveries = Array.from({ length: 5 }, () => controller.reconnect());

    expect(resumeSession).toHaveBeenCalledOnce();
    expect(maxActiveRequests).toBe(1);
    rejectInitialResume(new WidgetApiError("NETWORK", "initial transport failure"));
    await Promise.all([initialization, ...recoveries]);

    expect(resumeSession).toHaveBeenCalledTimes(2);
    expect(maxActiveRequests).toBe(1);
    expect(controller.state.status).toBe("active");
    expect(controller.state.syncStatus).toBe("synced");
  });

  it("does not overwrite an answer saved while the initial resume is in flight", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const resume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi.fn<WidgetApi["resumeSession"]>(() => resume.promise);
    const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(async (input) => ({
      currentStepKey: input.nextStepKey,
      revision: input.expectedRevision + 1,
    }));
    const controller = new WidgetSessionController(
      apiFixture({ resumeSession, saveAnswer }),
      storage,
    );

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledOnce());
    expect(controller.state.syncStatus).toBe("offline");

    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    resume.resolve(resumedSnapshot(stored));
    await initialization;

    expect(saveAnswer).toHaveBeenCalledOnce();
    expect(controller.state.answers).toEqual({ service: "standard", location: "Warszawa" });
    expect(controller.state.currentStep).toBeNull();
    expect(controller.state.status).toBe("result");
    expect(controller.state.syncStatus).toBe("synced");
    expect(storage.load(testPublicId)).toEqual(
      expect.objectContaining({
        answers: { service: "standard", location: "Warszawa" },
        currentStepKey: null,
        pending: [],
        revision: 2,
      }),
    );
  });

  it("does not report offline when a stale initial resume fails after a newer save", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const resume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi.fn<WidgetApi["resumeSession"]>(() => resume.promise);
    const controller = new WidgetSessionController(apiFixture({ resumeSession }), storage);

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledOnce());
    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    resume.reject(new WidgetApiError("NETWORK", "stale initial transport failure"));
    await initialization;

    expect(controller.state.answers).toEqual({ service: "standard", location: "Warszawa" });
    expect(controller.state.status).toBe("result");
    expect(controller.state.syncStatus).toBe("synced");
    expect(storage.load(testPublicId)?.revision).toBe(2);
  });

  it("clears a definitively expired resume after a concurrent answer fails to save", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const resume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi.fn<WidgetApi["resumeSession"]>(() => resume.promise);
    const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(async () => {
      throw new WidgetApiError("NETWORK", "answer transport failure");
    });
    const controller = new WidgetSessionController(
      apiFixture({ resumeSession, saveAnswer }),
      storage,
    );

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledOnce());
    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    expect(storage.load(testPublicId)?.pending).toHaveLength(1);

    resume.reject(new WidgetApiError("NOT_FOUND", "definitive session expiry"));
    await initialization;

    expect(controller.state.status).toBe("expired");
    expect(controller.state.answers).toEqual({});
    expect(storage.load(testPublicId)).toBeNull();
  });

  it("flushes a restarted session without waiting for the expired session's save", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const resume = deferred<WidgetSessionSnapshot>();
    const staleSave = deferred<Awaited<ReturnType<WidgetApi["saveAnswer"]>>>();
    const resumeSession = vi.fn<WidgetApi["resumeSession"]>(() => resume.promise);
    const saveAnswer = vi
      .fn<WidgetApi["saveAnswer"]>()
      .mockImplementationOnce(() => staleSave.promise)
      .mockImplementationOnce(async (input) => ({
        currentStepKey: input.nextStepKey,
        revision: input.expectedRevision + 1,
      }));
    const api = apiFixture({ resumeSession, saveAnswer });
    const controller = new WidgetSessionController(api, storage);

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledOnce());
    expect(controller.answer("Warszawa")).toBe(true);
    const expiredFlush = controller.flush();
    await vi.waitFor(() => expect(saveAnswer).toHaveBeenCalledOnce());
    resume.reject(new WidgetApiError("NOT_FOUND", "session expired during save"));
    await initialization;
    expect(controller.state.status).toBe("expired");

    await controller.restart();
    expect(controller.answer("standard")).toBe(true);
    const restartedFlush = controller.flush();
    expect(saveAnswer).toHaveBeenCalledTimes(2);
    expect(controller.state.syncStatus).toBe("saving");
    await restartedFlush;

    expect(saveAnswer).toHaveBeenCalledTimes(2);
    expect(saveAnswer.mock.calls[0]?.[0].stepKey).toBe("location");
    expect(saveAnswer.mock.calls[1]?.[0].stepKey).toBe("service");
    expect(controller.state.status).toBe("active");
    expect(controller.state.currentStep?.key).toBe("location");
    expect(controller.state.syncStatus).toBe("synced");
    expect(storage.load(testPublicId)).toEqual(
      expect.objectContaining({ pending: [], revision: 1 }),
    );

    staleSave.resolve({ currentStepKey: null, revision: 2 });
    await expiredFlush;
    expect(controller.state.status).toBe("active");
    expect(controller.state.currentStep?.key).toBe("location");
    expect(controller.state.syncStatus).toBe("synced");
  });

  it("does not undo back navigation performed during the initial resume", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const resume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi.fn<WidgetApi["resumeSession"]>(() => resume.promise);
    const controller = new WidgetSessionController(apiFixture({ resumeSession }), storage);

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledOnce());
    controller.back();
    resume.resolve(resumedSnapshot(stored));
    await initialization;

    expect(controller.state.currentStep?.key).toBe("service");
    expect(controller.state.history).toEqual([]);
    expect(controller.state.syncStatus).toBe("synced");
    expect(storage.load(testPublicId)).toEqual(
      expect.objectContaining({ currentStepKey: "service", history: [] }),
    );
  });

  it("does not apply a stale reconnect snapshot after a newer answer was saved", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const reconnectResume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi
      .fn<WidgetApi["resumeSession"]>()
      .mockRejectedValueOnce(new WidgetApiError("NETWORK", "initial transport failure"))
      .mockImplementationOnce(() => reconnectResume.promise);
    const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(async (input) => ({
      currentStepKey: input.nextStepKey,
      revision: input.expectedRevision + 1,
    }));
    const controller = new WidgetSessionController(
      apiFixture({ resumeSession, saveAnswer }),
      storage,
    );
    await controller.initialize(testPublicId);

    const reconnect = controller.reconnect();
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledTimes(2));
    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    reconnectResume.resolve(resumedSnapshot(stored));
    await reconnect;

    expect(saveAnswer).toHaveBeenCalledOnce();
    expect(controller.state.answers).toEqual({ service: "standard", location: "Warszawa" });
    expect(controller.state.currentStep).toBeNull();
    expect(controller.state.status).toBe("result");
    expect(controller.state.syncStatus).toBe("synced");
    expect(storage.load(testPublicId)?.revision).toBe(2);
  });

  it("does not undo back navigation performed during a reconnect resume", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const reconnectResume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi
      .fn<WidgetApi["resumeSession"]>()
      .mockRejectedValueOnce(new WidgetApiError("NETWORK", "initial transport failure"))
      .mockImplementationOnce(() => reconnectResume.promise);
    const controller = new WidgetSessionController(apiFixture({ resumeSession }), storage);
    await controller.initialize(testPublicId);

    const reconnect = controller.reconnect();
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledTimes(2));
    controller.back();
    reconnectResume.resolve(resumedSnapshot(stored));
    await reconnect;

    expect(controller.state.currentStep?.key).toBe("service");
    expect(controller.state.history).toEqual([]);
    expect(controller.state.syncStatus).toBe("synced");
  });

  it("does not let a reconnect resume roll back an in-flight lead submission", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const reconnectResume = deferred<WidgetSessionSnapshot>();
    const submit = deferred<Awaited<ReturnType<WidgetApi["submitLead"]>>>();
    const resumeSession = vi
      .fn<WidgetApi["resumeSession"]>()
      .mockRejectedValueOnce(new WidgetApiError("NETWORK", "initial transport failure"))
      .mockImplementationOnce(() => reconnectResume.promise);
    const submitLead = vi.fn<WidgetApi["submitLead"]>(() => submit.promise);
    const controller = new WidgetSessionController(
      apiFixture({ resumeSession, submitLead }),
      storage,
    );
    await controller.initialize(testPublicId);

    const reconnect = controller.reconnect();
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledTimes(2));
    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    const submission = controller.submitLead(
      {
        email: "klient@example.test",
        files: [],
        marketingEmailAccepted: false,
        privacyAccepted: true,
      },
      async () => "fresh-challenge-token",
    );
    await vi.waitFor(() => expect(submitLead).toHaveBeenCalledOnce());
    expect(controller.state.status).toBe("submitting");

    reconnectResume.resolve(resumedSnapshot(stored));
    await reconnect;
    expect(controller.state.status).toBe("submitting");
    expect(submitLead).toHaveBeenCalledOnce();

    submit.resolve({
      leadPublicId: "e0000000-0000-4000-8000-000000000001",
      submittedAt: "2026-08-11T20:00:00.000Z",
    });
    expect(await submission).toBe(true);
    expect(controller.state.status).toBe("submitted");
    expect(submitLead).toHaveBeenCalledOnce();
  });

  it("does not clear a submit error when a stale resume confirms the old revision", async () => {
    const storage = new MemoryWidgetStorage();
    const stored = persistedSession();
    storage.save(stored);
    const reconnectResume = deferred<WidgetSessionSnapshot>();
    const resumeSession = vi
      .fn<WidgetApi["resumeSession"]>()
      .mockRejectedValueOnce(new WidgetApiError("NETWORK", "initial transport failure"))
      .mockImplementationOnce(() => reconnectResume.promise);
    const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(async (input) => ({
      currentStepKey: input.nextStepKey,
      revision: input.expectedRevision,
    }));
    const submitLead = vi.fn<WidgetApi["submitLead"]>(async () => {
      throw new WidgetApiError("CHALLENGE", "provider rejected the challenge");
    });
    const controller = new WidgetSessionController(
      apiFixture({ resumeSession, saveAnswer, submitLead }),
      storage,
    );
    await controller.initialize(testPublicId);

    const reconnect = controller.reconnect();
    await vi.waitFor(() => expect(resumeSession).toHaveBeenCalledTimes(2));
    expect(controller.answer("Warszawa")).toBe(true);
    await controller.flush();
    expect(
      await controller.submitLead(
        {
          email: "klient@example.test",
          files: [],
          marketingEmailAccepted: false,
          privacyAccepted: true,
        },
        async () => "rejected-challenge-token",
      ),
    ).toBe(false);
    const submitError = controller.state.errorMessage;

    reconnectResume.resolve(resumedSnapshot(stored));
    await reconnect;

    expect(controller.state.status).toBe("result");
    expect(controller.state.errorMessage).toBe(submitError);
    expect(controller.state.errorMessage).toBe(
      "Nie udało się potwierdzić wysłania. Spróbuj ponownie.",
    );
  });

  it.each(["EXPIRED", "NOT_FOUND"] as const)(
    "clears a rejected %s reconnect and does not retry it again",
    async (code) => {
      const storage = new MemoryWidgetStorage();
      storage.save(persistedSession());
      const resumeSession = vi
        .fn<WidgetApi["resumeSession"]>()
        .mockRejectedValueOnce(new WidgetApiError("NETWORK", "initial transport failure"))
        .mockRejectedValueOnce(new WidgetApiError(code, "untrusted API detail"));
      const controller = new WidgetSessionController(apiFixture({ resumeSession }), storage);

      await controller.initialize(testPublicId);
      expect(controller.state.syncStatus).toBe("offline");

      await controller.reconnect();
      expect(controller.state.status).toBe("expired");
      expect(controller.state.errorMessage).toBe("Ta sesja wygasła. Rozpocznij proces ponownie.");
      expect(storage.load(testPublicId)).toBeNull();

      await controller.reconnect();
      expect(resumeSession).toHaveBeenCalledTimes(2);
    },
  );

  it.each([
    { code: "EXPIRED", path: "save" },
    { code: "NOT_FOUND", path: "conflict_resume" },
    { code: "NOT_FOUND", path: "result" },
    { code: "EXPIRED", path: "upload" },
    { code: "NOT_FOUND", path: "submit" },
  ] as const)("clears session data after $path returns $code", async ({ code, path }) => {
    const expiry = new WidgetApiError(code, "untrusted expired-session detail");
    const overrides: Partial<WidgetApi> = {};
    if (path === "save") {
      overrides.saveAnswer = vi.fn(async () => {
        throw expiry;
      });
    }
    if (path === "conflict_resume") {
      overrides.saveAnswer = vi.fn(async () => {
        throw new WidgetApiError("CONFLICT", "stale revision");
      });
      overrides.resumeSession = vi.fn(async () => {
        throw expiry;
      });
    }
    if (path === "result") {
      overrides.getResult = vi.fn(async () => {
        throw expiry;
      });
    }
    if (path === "upload") {
      overrides.uploadFile = vi.fn(async () => {
        throw expiry;
      });
    }
    if (path === "submit") {
      overrides.submitLead = vi.fn(async () => {
        throw expiry;
      });
    }
    const api = apiFixture(overrides);
    const storage = new MemoryWidgetStorage();
    const controller = new WidgetSessionController(api, storage);
    await controller.initialize(testPublicId);

    controller.answer("standard");
    await controller.flush();
    if (path === "result" || path === "upload" || path === "submit") {
      controller.answer("Gdańsk");
      await controller.flush();
    }
    if (path === "upload" || path === "submit") {
      await controller.submitLead(
        {
          email: "klient@example.test",
          files:
            path === "upload"
              ? [new File(["%PDF-expired"], "projekt.pdf", { type: "application/pdf" })]
              : [],
          marketingEmailAccepted: false,
          privacyAccepted: true,
        },
        async () => "fresh-challenge-token",
      );
    }

    expect(controller.state.status).toBe("expired");
    expect(controller.state.syncStatus).toBe("offline");
    expect(controller.state.answers).toEqual({});
    expect(controller.state.manifest).toBeNull();
    expect(controller.state.uploadedFiles).toEqual([]);
    expect(storage.load(testPublicId)).toBeNull();
    const createRequests = vi.mocked(api.createSession).mock.calls.length;
    const resumeRequests = vi.mocked(api.resumeSession).mock.calls.length;

    await controller.reconnect();
    expect(vi.mocked(api.createSession)).toHaveBeenCalledTimes(createRequests);
    expect(vi.mocked(api.resumeSession)).toHaveBeenCalledTimes(resumeRequests);
  });

  it("does not let a stale expired save clear a restarted session", async () => {
    let rejectStaleSave!: (reason: unknown) => void;
    const saveAnswer = vi.fn<WidgetApi["saveAnswer"]>(
      () =>
        new Promise((resolve, reject) => {
          void resolve;
          rejectStaleSave = reject;
        }),
    );
    const api = apiFixture({ saveAnswer });
    const storage = new MemoryWidgetStorage();
    const controller = new WidgetSessionController(api, storage);
    await controller.initialize(testPublicId);

    controller.answer("standard");
    const staleFlush = controller.flush();
    await vi.waitFor(() => expect(saveAnswer).toHaveBeenCalledOnce());
    await controller.restart();
    rejectStaleSave(new WidgetApiError("EXPIRED", "stale request expired"));
    await staleFlush;

    expect(controller.state.status).toBe("active");
    expect(controller.state.currentStep?.key).toBe(testManifest.entryStepKey);
    expect(storage.load(testPublicId)).not.toBeNull();
    expect(api.createSession).toHaveBeenCalledTimes(2);
  });

  it("does not let a stale submission completion mutate a restarted session", async () => {
    const deferredSubmit = deferred<Awaited<ReturnType<WidgetApi["submitLead"]>>>();
    const submitLead = vi.fn<WidgetApi["submitLead"]>(() => deferredSubmit.promise);
    const api = apiFixture({ submitLead });
    const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
    await controller.initialize(testPublicId);
    controller.answer("standard");
    await controller.flush();
    controller.answer("Warszawa");
    await controller.flush();

    const staleSubmission = controller.submitLead(
      {
        email: "stary-klient@example.test",
        files: [],
        marketingEmailAccepted: false,
        privacyAccepted: true,
      },
      async () => "stale-challenge-token",
    );
    await vi.waitFor(() => expect(submitLead).toHaveBeenCalledOnce());
    expect(controller.state.status).toBe("submitting");
    expect(
      await controller.submitLead(
        {
          email: "duplikat@example.test",
          files: [],
          marketingEmailAccepted: false,
          privacyAccepted: true,
        },
        async () => "duplicate-challenge-token",
      ),
    ).toBe(false);
    expect(submitLead).toHaveBeenCalledOnce();

    await controller.restart();
    expect(controller.state.status).toBe("active");
    deferredSubmit.resolve({
      leadPublicId: "e0000000-0000-4000-8000-000000000099",
      submittedAt: "2026-08-11T20:30:00.000Z",
    });

    expect(await staleSubmission).toBe(false);
    expect(controller.state.status).toBe("active");
    expect(controller.state.answers).toEqual({});
    expect(controller.state.submission).toBeNull();
    expect(controller.state.uploadedFiles).toEqual([]);
    expect(api.createSession).toHaveBeenCalledTimes(2);
  });

  it.each(["success", "network failure"] as const)(
    "does not let a stale result %s mutate a restarted session",
    async (outcome) => {
      const staleResult = deferred<Awaited<ReturnType<WidgetApi["getResult"]>>>();
      const getResult = vi.fn<WidgetApi["getResult"]>(() => staleResult.promise);
      const api = apiFixture({ getResult });
      const controller = new WidgetSessionController(api, new MemoryWidgetStorage());
      await controller.initialize(testPublicId);
      controller.answer("standard");
      await controller.flush();
      controller.answer("Warszawa");
      const oldFlush = controller.flush();
      await vi.waitFor(() => expect(getResult).toHaveBeenCalledOnce());

      await controller.restart();
      expect(controller.state.status).toBe("active");
      if (outcome === "success") {
        staleResult.resolve({
          action: "capture_lead",
          disclaimer: "Stary wynik nie może wejść do nowej sesji.",
          fallbackContactLabel: null,
          fallbackContactUrl: null,
          headline: "Stary wynik",
          nextStepLabel: "Stary CTA",
          pricing: null,
        });
      } else {
        staleResult.reject(new WidgetApiError("NETWORK", "stale result transport failure"));
      }
      await oldFlush;

      expect(controller.state.status).toBe("active");
      expect(controller.state.currentStep?.key).toBe(testManifest.entryStepKey);
      expect(controller.state.result).toBeNull();
      expect(controller.state.errorMessage).toBeNull();
      expect(controller.state.syncStatus).toBe("synced");
      expect(api.createSession).toHaveBeenCalledTimes(2);
    },
  );

  it("serializes online recovery behind an in-flight create failure", async () => {
    let rejectInitialCreate!: (reason: unknown) => void;
    let activeRequests = 0;
    let maxActiveRequests = 0;
    let attempt = 0;
    const createSession = vi.fn<WidgetApi["createSession"]>(async () => {
      attempt += 1;
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      try {
        if (attempt === 1) {
          await new Promise<never>((_resolve, reject) => {
            rejectInitialCreate = reject;
          });
        }
        return {
          context: [],
          contextConfirmed: true,
          currentStepKey: testManifest.entryStepKey,
          expiresAt: "2099-01-01T00:00:00.000Z",
          manifest: testManifest,
          revision: 0,
          token: "b".repeat(64),
        };
      } finally {
        activeRequests -= 1;
      }
    });
    const storage: WidgetStorage = {
      clear: vi.fn(),
      load: vi.fn(() => null),
      save: vi.fn(),
    };
    const controller = new WidgetSessionController(apiFixture({ createSession }), storage);

    const initialization = controller.initialize(testPublicId);
    await vi.waitFor(() => expect(createSession).toHaveBeenCalledOnce());
    const recoveries = Array.from({ length: 5 }, () => controller.reconnect());

    expect(createSession).toHaveBeenCalledOnce();
    expect(maxActiveRequests).toBe(1);
    rejectInitialCreate(new WidgetApiError("NETWORK", "initial transport failure"));
    await Promise.all([initialization, ...recoveries]);

    expect(controller.state.status).toBe("active");
    expect(controller.state.syncStatus).toBe("synced");
    expect(createSession).toHaveBeenCalledTimes(2);
    expect(maxActiveRequests).toBe(1);
    expect(storage.clear).not.toHaveBeenCalled();
  });

  it("coalesces restart behind a deferred online create retry", async () => {
    const retryCreate = deferred<Awaited<ReturnType<WidgetApi["createSession"]>>>();
    let activeRequests = 0;
    let maxActiveRequests = 0;
    let attempt = 0;
    const createSession = vi.fn<WidgetApi["createSession"]>(async () => {
      attempt += 1;
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      try {
        if (attempt === 1) {
          throw new WidgetApiError("NETWORK", "initial transport failure");
        }
        return await retryCreate.promise;
      } finally {
        activeRequests -= 1;
      }
    });
    const controller = new WidgetSessionController(
      apiFixture({ createSession }),
      new MemoryWidgetStorage(),
    );
    await controller.initialize(testPublicId);
    expect(controller.state.status).toBe("recoverable_error");

    const reconnect = controller.reconnect();
    await vi.waitFor(() => expect(createSession).toHaveBeenCalledTimes(2));
    expect(controller.state.status).toBe("loading_manifest");
    const restarts = [controller.restart(), controller.restart()];
    expect(createSession).toHaveBeenCalledTimes(2);
    expect(maxActiveRequests).toBe(1);

    retryCreate.resolve({
      context: [],
      contextConfirmed: true,
      currentStepKey: testManifest.entryStepKey,
      expiresAt: "2099-01-01T00:00:00.000Z",
      manifest: testManifest,
      revision: 0,
      token: "c".repeat(64),
    });
    await Promise.all([reconnect, ...restarts]);

    expect(createSession).toHaveBeenCalledTimes(2);
    expect(maxActiveRequests).toBe(1);
    expect(controller.state.status).toBe("active");
    expect(controller.state.currentStep?.key).toBe(testManifest.entryStepKey);
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
      .mockRejectedValueOnce(
        new WidgetApiError("CHALLENGE", "internal provider detail for klient@example.test"),
      )
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
    expect(controller.state.errorMessage).toBe(
      "Nie udało się potwierdzić wysłania. Spróbuj ponownie.",
    );
    expect(controller.state.errorMessage).not.toContain("klient@example.test");
    expect(await controller.submitLead(draft, challenge)).toBe(true);
    expect(challenge).toHaveBeenCalledTimes(2);
    expect(submitLead.mock.calls[0]?.[0].challengeToken).toBe("first-single-use-token");
    expect(submitLead.mock.calls[1]?.[0].challengeToken).toBe("second-single-use-token");
  });
});
