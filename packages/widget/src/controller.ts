import {
  isWidgetChallengeError,
  isWidgetApiError,
  type WidgetAnswer,
  type WidgetAnalyticsEvent,
  type WidgetAnalyticsEventName,
  type WidgetApi,
  type WidgetCalculatedResult,
  type WidgetManifest,
  type WidgetSessionSnapshot,
  type WidgetStep,
  type WidgetSubmission,
  type UploadedWidgetFile,
} from "./contracts.js";
import { isAnswerValid, resolveNextStep } from "./manifest.js";
import { type PendingAnswer, type PersistedWidgetSession, type WidgetStorage } from "./storage.js";

export type WidgetStatus =
  | "active"
  | "calculating_result"
  | "expired"
  | "idle"
  | "loading_manifest"
  | "recoverable_error"
  | "result"
  | "submitted"
  | "submitting"
  | "unavailable";

export type WidgetSyncStatus = "offline" | "saving" | "synced";

export type WidgetState = Readonly<{
  analyticsConsent: boolean | null;
  analyticsError: string | null;
  answers: Record<string, WidgetAnswer>;
  currentStep: WidgetStep | null;
  errorMessage: string | null;
  history: string[];
  manifest: WidgetManifest | null;
  result: WidgetCalculatedResult | null;
  submission: WidgetSubmission | null;
  status: WidgetStatus;
  syncStatus: WidgetSyncStatus;
  uploadedFiles: UploadedWidgetFile[];
}>;

export type LeadSubmissionDraft = Readonly<{
  email: string;
  files: File[];
  marketingEmailAccepted: boolean;
  name?: string;
  phone?: string;
  privacyAccepted: boolean;
}>;

export type ChallengeTokenProvider = () => Promise<string>;

type ActiveSession = {
  analyticsConsent: boolean | null;
  answers: Record<string, WidgetAnswer>;
  currentStepKey: string | null;
  expiresAt: string;
  history: string[];
  manifest: WidgetManifest;
  pending: PendingAnswer[];
  publicId: string;
  revision: number;
  token: string;
};

function analyticsDevice(): WidgetAnalyticsEvent["device"] {
  if (typeof window === "undefined") return "other";
  const width = window.innerWidth;
  if (!Number.isFinite(width) || width <= 0) return "other";
  if (width <= 640) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function analyticsSource(): WidgetAnalyticsEvent["source"] {
  if (typeof window === "undefined" || typeof document === "undefined") return "direct";
  const medium = new URL(window.location.href).searchParams.get("utm_medium")?.toLowerCase();
  if (medium === "email") return "email";
  if (medium === "cpc" || medium === "paid" || medium === "ppc") return "paid";
  if (medium === "social") return "social";
  if (!document.referrer) return "direct";
  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    if (/google|bing|duckduckgo|yahoo/.test(hostname)) return "organic";
    if (/facebook|instagram|linkedin|tiktok|x\.com|twitter/.test(hostname)) return "social";
    return "referral";
  } catch {
    return "other";
  }
}

function challengeErrorMessage(error: unknown): string | null {
  if (isWidgetChallengeError(error, "EXPIRED")) {
    return "Potwierdzenie bezpieczeństwa wygasło. Spróbuj ponownie.";
  }
  if (isWidgetChallengeError(error, "TIMEOUT")) {
    return "Weryfikacja bezpieczeństwa przekroczyła limit czasu. Spróbuj ponownie.";
  }
  if (isWidgetChallengeError(error, "UNSUPPORTED")) {
    return "Ta przeglądarka nie obsługuje weryfikacji bezpieczeństwa.";
  }
  if (isWidgetChallengeError(error, "UNAVAILABLE")) {
    return "Nie udało się uruchomić weryfikacji bezpieczeństwa. Spróbuj ponownie.";
  }
  if (isWidgetChallengeError(error, "FAILED")) {
    return "Nie udało się potwierdzić bezpieczeństwa. Spróbuj ponownie.";
  }
  return null;
}

export class WidgetSessionController {
  readonly #api: WidgetApi;
  readonly #listeners = new Set<(state: WidgetState) => void>();
  readonly #storage: WidgetStorage;
  readonly #pendingAnalytics: WidgetAnalyticsEvent[] = [];
  #analyticsConsentEpoch = 0;
  #analyticsConsentRequestPromise: Promise<void> | null = null;
  #analyticsFlushPromise: Promise<void> | null = null;
  readonly #flushPromises = new WeakMap<ActiveSession, Promise<void>>();
  #initializePromise: Promise<void> | null = null;
  #mutationEpoch = 0;
  #publicId: string | null = null;
  #reconnectPromise: Promise<void> | null = null;
  #session: ActiveSession | null = null;
  #state: WidgetState = {
    analyticsConsent: null,
    analyticsError: null,
    answers: {},
    currentStep: null,
    errorMessage: null,
    history: [],
    manifest: null,
    result: null,
    submission: null,
    status: "idle",
    syncStatus: "synced",
    uploadedFiles: [],
  };

  constructor(api: WidgetApi, storage: WidgetStorage) {
    this.#api = api;
    this.#storage = storage;
  }

  get state(): WidgetState {
    return this.#state;
  }

  subscribe(listener: (state: WidgetState) => void): () => void {
    this.#listeners.add(listener);
    listener(this.#state);
    return () => this.#listeners.delete(listener);
  }

  async initialize(publicId: string): Promise<void> {
    if (this.#initializePromise) return this.#initializePromise;
    const initialization = this.#initializeOnce(publicId).finally(() => {
      if (this.#initializePromise === initialization) this.#initializePromise = null;
    });
    this.#initializePromise = initialization;
    return initialization;
  }

  async #initializeOnce(publicId: string): Promise<void> {
    this.#publicId = publicId;
    this.#setState({ status: "loading_manifest", errorMessage: null });
    const local = this.#loadStored(publicId);
    if (local) {
      this.#restoreLocal(local);
      const session = this.#session;
      if (!session) return;
      const mutationEpoch = this.#mutationEpoch;
      const revision = session.revision;
      let resumed;
      try {
        resumed = await this.#api.resumeSession(local.token);
      } catch (error) {
        if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
          if (this.#canExpireFromResume(session)) this.#expireSession(session);
          return;
        }
        if (!this.#canApplyResumedSnapshot(session, mutationEpoch, revision)) return;
        this.#setState({ syncStatus: "offline" });
        return;
      }

      if (!this.#applyResumedSnapshot(session, resumed, mutationEpoch, revision)) return;
      await this.flush();
      if (this.#session !== session) return;
      this.trackAnalytics("widget_loaded");
      if (session.currentStepKey) {
        this.trackAnalytics("step_viewed", session.currentStepKey);
      }
      return;
    }

    const mutationEpoch = this.#mutationEpoch;
    let created;
    try {
      created = await this.#api.createSession(publicId);
    } catch (error) {
      if (
        this.#session ||
        this.#publicId !== publicId ||
        this.#mutationEpoch !== mutationEpoch ||
        this.#state.status !== "loading_manifest"
      ) {
        return;
      }
      this.#setState({
        errorMessage: isWidgetApiError(error, "NOT_FOUND")
          ? "Ten proces jest niedostępny."
          : "Nie udało się uruchomić procesu. Sprawdź połączenie i spróbuj ponownie.",
        status: isWidgetApiError(error, "NOT_FOUND") ? "unavailable" : "recoverable_error",
      });
      return;
    }

    if (
      this.#session ||
      this.#publicId !== publicId ||
      this.#mutationEpoch !== mutationEpoch ||
      this.#state.status !== "loading_manifest"
    ) {
      return;
    }

    this.#session = {
      analyticsConsent: null,
      answers: {},
      currentStepKey: created.currentStepKey,
      expiresAt: created.expiresAt,
      history: [],
      manifest: created.manifest,
      pending: [],
      publicId,
      revision: created.revision,
      token: created.token,
    };
    this.#mutationEpoch += 1;
    this.#publishSession("synced");
    this.trackAnalytics("widget_loaded");
    this.trackAnalytics("step_viewed", created.currentStepKey);
  }

  async restart(): Promise<void> {
    const reconnect = this.#reconnectPromise;
    if (reconnect) {
      await reconnect;
      if (this.#state.status !== "recoverable_error" && this.#state.status !== "expired") {
        return;
      }
    }
    const initialization = this.#initializePromise;
    if (initialization) {
      await initialization;
      if (this.#state.status !== "recoverable_error" && this.#state.status !== "expired") {
        return;
      }
    }
    const publicId = this.#session?.publicId ?? this.#state.manifest?.publicId ?? this.#publicId;
    if (!publicId) return;
    this.#mutationEpoch += 1;
    this.#analyticsConsentEpoch += 1;
    this.#clearStored(publicId);
    this.#pendingAnalytics.splice(0);
    this.#session = null;
    this.#state = {
      ...this.#state,
      analyticsConsent: null,
      analyticsError: null,
      answers: {},
      currentStep: null,
      history: [],
      manifest: null,
      result: null,
      submission: null,
      uploadedFiles: [],
    };
    await this.initialize(publicId);
  }

  async reconnect(): Promise<void> {
    if (this.#reconnectPromise) return this.#reconnectPromise;
    const reconnect = (async () => {
      const initialization = this.#initializePromise;
      if (initialization) await initialization;
      await this.#retryConnection();
    })().finally(() => {
      if (this.#reconnectPromise === reconnect) this.#reconnectPromise = null;
    });
    this.#reconnectPromise = reconnect;
    return reconnect;
  }

  async setAnalyticsConsent(granted: boolean): Promise<boolean> {
    const session = this.#session;
    if (!session) return false;
    const consentEpoch = ++this.#analyticsConsentEpoch;
    const previousConsent = session.analyticsConsent;
    if (!granted) {
      session.analyticsConsent = false;
      this.#pendingAnalytics.splice(0);
    }
    this.#setState({ analyticsConsent: granted, analyticsError: null });
    if (!granted) this.#persist();
    const previousRequest = this.#analyticsConsentRequestPromise;
    const request = (previousRequest ? previousRequest.catch(() => undefined) : Promise.resolve())
      .then(() =>
        this.#api.setAnalyticsConsent({
          consentVersion: "analytics-v1",
          granted,
          mutationId: crypto.randomUUID(),
          token: session.token,
        }),
      )
      .finally(() => {
        if (this.#analyticsConsentRequestPromise === request) {
          this.#analyticsConsentRequestPromise = null;
        }
      });
    this.#analyticsConsentRequestPromise = request;
    try {
      await request;
      if (this.#session !== session || this.#analyticsConsentEpoch !== consentEpoch) return false;
      session.analyticsConsent = granted;
      this.#persist();
      if (granted) void this.#flushAnalytics();
      return true;
    } catch {
      if (this.#session !== session || this.#analyticsConsentEpoch !== consentEpoch) return false;
      if (granted) session.analyticsConsent = previousConsent;
      this.#setState({
        analyticsConsent: granted ? previousConsent : false,
        analyticsError: "Nie zapisaliśmy tej decyzji. Sprawdź połączenie i spróbuj ponownie.",
      });
      this.#persist();
      return false;
    }
  }

  trackAnalytics(name: WidgetAnalyticsEventName, stepKey: string | null = null): void {
    const session = this.#session;
    if (!session || session.analyticsConsent === false) return;
    try {
      this.#pendingAnalytics.push({
        device: analyticsDevice(),
        eventId: crypto.randomUUID(),
        name,
        occurredAt: new Date().toISOString(),
        schemaVersion: 1,
        source: analyticsSource(),
        stepKey,
        token: session.token,
      });
    } catch {
      return;
    }
    if (session.analyticsConsent) void this.#flushAnalytics();
  }

  async submitLead(
    draft: LeadSubmissionDraft,
    challengeTokenProvider: ChallengeTokenProvider,
  ): Promise<boolean> {
    const session = this.#session;
    const capture = session?.manifest.leadCapture;
    if (!session || !capture || session.currentStepKey !== null || !this.#state.result)
      return false;
    if (this.#state.status === "submitting" || this.#state.status === "submitted") return false;
    if (!draft.privacyAccepted) {
      this.#setState({ errorMessage: "Potwierdź zapoznanie się z informacją o prywatności." });
      return false;
    }
    if (capture.contactPolicy === "email_required" && !draft.email.trim()) {
      this.#setState({ errorMessage: "Podaj adres e-mail." });
      return false;
    }
    if (capture.contactPolicy === "phone_required" && !draft.phone?.trim()) {
      this.#setState({ errorMessage: "Podaj numer telefonu." });
      return false;
    }
    if (draft.marketingEmailAccepted && !draft.email.trim()) {
      this.#setState({
        errorMessage: "Podaj adres e-mail albo wyłącz zgodę na wiadomości marketingowe.",
      });
      return false;
    }
    const unmatchedUploaded = [...this.#state.uploadedFiles];
    const filesToUpload = draft.files.filter((file) => {
      const matchingIndex = unmatchedUploaded.findIndex(
        (uploaded) =>
          uploaded.name === file.name &&
          uploaded.mimeType === file.type &&
          uploaded.sizeBytes === file.size,
      );
      if (matchingIndex < 0) return true;
      unmatchedUploaded.splice(matchingIndex, 1);
      return false;
    });
    if (this.#state.uploadedFiles.length + filesToUpload.length > 5) {
      this.#setState({ errorMessage: "Możesz dodać maksymalnie 5 plików." });
      return false;
    }
    this.#mutationEpoch += 1;
    const submissionEpoch = this.#mutationEpoch;
    this.#setState({ errorMessage: null, status: "submitting" });
    try {
      const uploaded = [...this.#state.uploadedFiles];
      for (const file of filesToUpload) {
        const uploadedFile = await this.#api.uploadFile(file, session.token);
        if (!this.#isCurrentSubmission(session, submissionEpoch)) return false;
        uploaded.push(uploadedFile);
        this.trackAnalytics("file_uploaded");
        this.#setState({ uploadedFiles: [...uploaded] });
      }
      const challengeToken = await challengeTokenProvider();
      if (!this.#isCurrentSubmission(session, submissionEpoch)) return false;
      const submission = await this.#api.submitLead({
        challengeToken,
        contact: {
          ...(draft.email.trim() ? { email: draft.email.trim() } : {}),
          ...(draft.name?.trim() ? { name: draft.name.trim() } : {}),
          ...(draft.phone?.trim() ? { phone: draft.phone.trim() } : {}),
        },
        fileIds: uploaded.map((file) => file.fileId),
        marketingEmailConsent:
          draft.marketingEmailAccepted && capture.marketingEmailConsent
            ? {
                accepted: true,
                textHash: capture.marketingEmailConsent.textHash,
                version: capture.marketingEmailConsent.version,
              }
            : null,
        mutationId: crypto.randomUUID(),
        privacyNotice: {
          accepted: true,
          textHash: capture.privacyNotice.textHash,
          version: capture.privacyNotice.version,
        },
        token: session.token,
      });
      if (!this.#isCurrentSubmission(session, submissionEpoch)) return false;
      this.#setState({
        errorMessage: null,
        status: "submitted",
        submission,
        uploadedFiles: uploaded,
      });
      this.trackAnalytics("lead_submitted");
      return true;
    } catch (error) {
      if (!this.#isCurrentSubmission(session, submissionEpoch)) return false;
      if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
        this.#expireSession(session);
        return false;
      }
      const safeChallengeMessage = challengeErrorMessage(error);
      this.#setState({
        errorMessage:
          safeChallengeMessage ??
          (isWidgetApiError(error, "CHALLENGE")
            ? "Nie udało się potwierdzić wysłania. Spróbuj ponownie."
            : isWidgetApiError(error, "RATE_LIMITED")
              ? "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie."
              : "Nie udało się wysłać zapytania. Spróbuj ponownie."),
        status: "result",
      });
      return false;
    }
  }

  answer(answer: WidgetAnswer | null): boolean {
    const session = this.#session;
    const currentStepKey = session?.currentStepKey;
    if (!session || !currentStepKey) return false;
    const step = session.manifest.steps.find((candidate) => candidate.key === currentStepKey);
    if (!step || !isAnswerValid(step, answer)) {
      this.#setState({ errorMessage: "Uzupełnij odpowiedź, aby przejść dalej." });
      this.trackAnalytics("validation_error", currentStepKey);
      return false;
    }

    this.#mutationEpoch += 1;
    if (answer === null) delete session.answers[currentStepKey];
    else session.answers[currentStepKey] = answer;
    const nextStepKey = resolveNextStep(session.manifest, currentStepKey, session.answers);
    session.pending.push({
      answer,
      mutationId: crypto.randomUUID(),
      nextStepKey,
      stepKey: currentStepKey,
    });
    session.history.push(currentStepKey);
    session.currentStepKey = nextStepKey;
    if (session.history.length === 1) this.trackAnalytics("flow_started");
    this.trackAnalytics("step_answered", currentStepKey);
    if (nextStepKey) this.trackAnalytics("step_viewed", nextStepKey);
    this.#publishSession("saving");
    void this.flush();
    return true;
  }

  back(): void {
    const session = this.#session;
    const previous = session?.history.pop();
    if (!session || !previous) return;
    this.#mutationEpoch += 1;
    this.trackAnalytics("step_back", previous);
    this.trackAnalytics("step_viewed", previous);
    session.currentStepKey = previous;
    this.#setState({ result: null });
    this.#publishSession();
  }

  async flush(): Promise<void> {
    const owner = this.#session;
    if (!owner) return;
    const existing = this.#flushPromises.get(owner);
    if (existing) return existing;
    const flush = (async () => {
      await this.#flushPending(owner);
      if (this.#session !== owner) return;
      await this.#loadResult(owner);
      if (this.#session !== owner) return;
      void this.#flushAnalytics();
    })().finally(() => {
      if (this.#flushPromises.get(owner) === flush) this.#flushPromises.delete(owner);
    });
    this.#flushPromises.set(owner, flush);
    return flush;
  }

  #restoreLocal(local: PersistedWidgetSession): void {
    this.#session = {
      analyticsConsent: local.analyticsConsent ?? null,
      answers: { ...local.answers },
      currentStepKey: local.currentStepKey,
      expiresAt: local.expiresAt,
      history: [...local.history],
      manifest: local.manifest,
      pending: [...local.pending],
      publicId: local.publicId,
      revision: local.revision,
      token: local.token,
    };
    this.#mutationEpoch += 1;
    this.#publishSession("offline");
  }

  #clearStored(publicId: string): void {
    try {
      this.#storage.clear(publicId);
    } catch {
      // Storage is a recoverability aid, never the source of API availability.
    }
  }

  #loadStored(publicId: string): PersistedWidgetSession | null {
    try {
      return this.#storage.load(publicId);
    } catch {
      return null;
    }
  }

  #canApplyResumedSnapshot(
    session: ActiveSession,
    mutationEpoch: number,
    revision: number,
  ): boolean {
    return (
      this.#session === session &&
      this.#mutationEpoch === mutationEpoch &&
      session.revision === revision &&
      !this.#isResumeCommitBlocked()
    );
  }

  #canCommitCreatedSession(publicId: string, mutationEpoch: number): boolean {
    return (
      !this.#session &&
      this.#publicId === publicId &&
      this.#mutationEpoch === mutationEpoch &&
      this.#state.status === "loading_manifest"
    );
  }

  #canExpireFromResume(session: ActiveSession): boolean {
    return this.#session === session && !this.#isSubmissionInFlightOrComplete();
  }

  #isSubmissionInFlightOrComplete(): boolean {
    return this.#state.status === "submitted" || this.#state.status === "submitting";
  }

  #isCurrentSubmission(session: ActiveSession, mutationEpoch: number): boolean {
    return (
      this.#session === session &&
      this.#mutationEpoch === mutationEpoch &&
      this.#state.status === "submitting"
    );
  }

  #isResumeCommitBlocked(): boolean {
    return (
      this.#state.status === "expired" ||
      this.#state.status === "submitted" ||
      this.#state.status === "submitting" ||
      this.#state.status === "unavailable"
    );
  }

  #applyResumedSnapshot(
    session: ActiveSession,
    resumed: WidgetSessionSnapshot,
    mutationEpoch: number,
    revision: number,
  ): boolean {
    if (!this.#canApplyResumedSnapshot(session, mutationEpoch, revision)) {
      if (
        this.#session === session &&
        !this.#isResumeCommitBlocked() &&
        this.#state.status === "active" &&
        session.pending.length === 0 &&
        session.revision === revision &&
        resumed.revision === revision
      ) {
        this.#publishSession("synced");
      }
      return false;
    }
    if (resumed.revision < session.revision) {
      return false;
    }
    session.answers = { ...resumed.answers };
    session.currentStepKey = resumed.currentStepKey;
    session.expiresAt = resumed.expiresAt;
    session.manifest = resumed.manifest;
    session.revision = resumed.revision;
    for (const pending of session.pending) {
      if (pending.answer === null) delete session.answers[pending.stepKey];
      else session.answers[pending.stepKey] = pending.answer;
      session.currentStepKey = pending.nextStepKey;
    }
    this.#publishSession("synced");
    return true;
  }

  async #retryConnection(): Promise<void> {
    const session = this.#session;
    if (session) {
      if (this.#isSubmissionInFlightOrComplete()) {
        void this.#flushAnalytics();
        return;
      }
      if (this.#state.status === "expired" || this.#state.status === "unavailable") {
        return;
      }
      await this.flush();
      if (this.#state.syncStatus !== "offline" || this.#session !== session) return;
      if (this.#isSubmissionInFlightOrComplete()) {
        void this.#flushAnalytics();
        return;
      }
      const mutationEpoch = this.#mutationEpoch;
      const revision = session.revision;
      let resumed;
      try {
        resumed = await this.#api.resumeSession(session.token);
      } catch (error) {
        if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
          if (this.#canExpireFromResume(session)) this.#expireSession(session);
        } else {
          if (!this.#canApplyResumedSnapshot(session, mutationEpoch, revision)) return;
          this.#setState({ syncStatus: "offline" });
        }
        return;
      }
      if (!this.#applyResumedSnapshot(session, resumed, mutationEpoch, revision)) return;
      await this.flush();
      return;
    }

    const publicId = this.#publicId;
    if (!publicId || this.#state.status !== "recoverable_error") return;
    const mutationEpoch = this.#mutationEpoch;
    this.#setState({ errorMessage: null, status: "loading_manifest" });
    let created;
    try {
      created = await this.#api.createSession(publicId);
    } catch (error) {
      if (!this.#canCommitCreatedSession(publicId, mutationEpoch)) return;
      this.#setState({
        errorMessage: isWidgetApiError(error, "NOT_FOUND")
          ? "Ten proces jest niedostępny."
          : "Nie udało się uruchomić procesu. Sprawdź połączenie i spróbuj ponownie.",
        status: isWidgetApiError(error, "NOT_FOUND") ? "unavailable" : "recoverable_error",
      });
      return;
    }
    if (!this.#canCommitCreatedSession(publicId, mutationEpoch)) return;
    this.#session = {
      analyticsConsent: null,
      answers: {},
      currentStepKey: created.currentStepKey,
      expiresAt: created.expiresAt,
      history: [],
      manifest: created.manifest,
      pending: [],
      publicId,
      revision: created.revision,
      token: created.token,
    };
    this.#mutationEpoch += 1;
    this.#publishSession("synced");
    this.trackAnalytics("widget_loaded");
    this.trackAnalytics("step_viewed", created.currentStepKey);
  }

  async #flushPending(session: ActiveSession): Promise<void> {
    if (this.#session !== session || session.pending.length === 0) return;
    this.#setState({ syncStatus: "saving" });
    while (session.pending.length > 0) {
      const pending = session.pending[0];
      if (!pending) break;
      try {
        const saved = await this.#api.saveAnswer({
          ...pending,
          expectedRevision: session.revision,
          token: session.token,
        });
        if (this.#session !== session) return;
        session.revision = saved.revision;
        session.pending.shift();
        this.#persist();
      } catch (error) {
        if (this.#session !== session) return;
        if (isWidgetApiError(error, "CONFLICT")) {
          try {
            const remote = await this.#api.resumeSession(session.token);
            if (this.#session !== session) return;
            session.revision = remote.revision;
            session.manifest = remote.manifest;
            session.answers = { ...remote.answers };
            for (const queued of session.pending) {
              if (queued.answer === null) delete session.answers[queued.stepKey];
              else session.answers[queued.stepKey] = queued.answer;
            }
            continue;
          } catch (resumeError) {
            if (this.#session !== session) return;
            if (
              isWidgetApiError(resumeError, "EXPIRED") ||
              isWidgetApiError(resumeError, "NOT_FOUND")
            ) {
              this.#expireSession(session);
            } else {
              this.#setState({ syncStatus: "offline" });
            }
            return;
          }
        }
        if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
          this.#expireSession(session);
          return;
        }
        this.#setState({ syncStatus: "offline" });
        this.#persist();
        return;
      }
    }
    if (this.#session !== session) return;
    this.#setState({ syncStatus: "synced" });
    this.#persist();
  }

  async #loadResult(session: ActiveSession): Promise<void> {
    if (
      this.#session !== session ||
      session.currentStepKey !== null ||
      session.pending.length > 0 ||
      this.#state.result
    ) {
      return;
    }
    const mutationEpoch = this.#mutationEpoch;
    this.#setState({ status: "calculating_result" });
    try {
      const result = await this.#api.getResult(session.token);
      if (
        this.#session !== session ||
        this.#mutationEpoch !== mutationEpoch ||
        session.currentStepKey !== null
      ) {
        return;
      }
      this.#setState({
        errorMessage: null,
        result,
        status: this.#state.submission ? "submitted" : "result",
        syncStatus: "synced",
      });
      this.trackAnalytics("result_viewed");
    } catch (error) {
      if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
        this.#expireSession(session);
        return;
      }
      if (this.#session !== session || this.#mutationEpoch !== mutationEpoch) return;
      this.#setState({
        errorMessage: "Wynik zostanie obliczony po odzyskaniu połączenia.",
        status: "calculating_result",
        syncStatus: "offline",
      });
    }
  }

  #publishSession(syncStatus: WidgetSyncStatus = this.#state.syncStatus): void {
    const session = this.#session;
    if (!session) return;
    const currentStep =
      session.manifest.steps.find((step) => step.key === session.currentStepKey) ?? null;
    this.#state = {
      analyticsConsent: session.analyticsConsent,
      analyticsError: this.#state.analyticsError,
      answers: { ...session.answers },
      currentStep,
      errorMessage: null,
      history: [...session.history],
      manifest: session.manifest,
      result: currentStep ? null : this.#state.result,
      status: currentStep
        ? "active"
        : this.#state.submission
          ? "submitted"
          : this.#state.result
            ? "result"
            : "calculating_result",
      submission: this.#state.submission,
      syncStatus,
      uploadedFiles: [...this.#state.uploadedFiles],
    };
    this.#persist();
    this.#emit();
  }

  #expireSession(session: ActiveSession): void {
    if (this.#session !== session) return;
    this.#mutationEpoch += 1;
    this.#analyticsConsentEpoch += 1;
    this.#clearStored(session.publicId);
    this.#pendingAnalytics.splice(0);
    this.#session = null;
    this.#setState({
      analyticsConsent: null,
      analyticsError: null,
      answers: {},
      currentStep: null,
      errorMessage: "Ta sesja wygasła. Rozpocznij proces ponownie.",
      history: [],
      manifest: null,
      result: null,
      status: "expired",
      submission: null,
      syncStatus: "offline",
      uploadedFiles: [],
    });
  }

  #persist(): void {
    const session = this.#session;
    if (!session) return;
    try {
      this.#storage.save({
        analyticsConsent: session.analyticsConsent,
        answers: { ...session.answers },
        currentStepKey: session.currentStepKey,
        expiresAt: session.expiresAt,
        history: [...session.history],
        manifest: session.manifest,
        pending: [...session.pending],
        publicId: session.publicId,
        revision: session.revision,
        savedAt: new Date().toISOString(),
        token: session.token,
        version: 1,
      });
    } catch {
      // A host storage failure cannot downgrade a successful API session to offline.
    }
  }

  #setState(update: Partial<WidgetState>): void {
    this.#state = { ...this.#state, ...update };
    this.#emit();
  }

  async #flushAnalytics(): Promise<void> {
    const session = this.#session;
    if (!session?.analyticsConsent || this.#pendingAnalytics.length === 0) return;
    if (this.#analyticsFlushPromise) return this.#analyticsFlushPromise;
    this.#analyticsFlushPromise = (async () => {
      while (this.#pendingAnalytics.length > 0 && this.#session?.analyticsConsent) {
        const event = this.#pendingAnalytics[0];
        if (!event) break;
        try {
          await this.#api.trackAnalyticsEvent(event);
          if (this.#pendingAnalytics[0] === event) this.#pendingAnalytics.shift();
        } catch {
          return;
        }
      }
    })().finally(() => {
      this.#analyticsFlushPromise = null;
    });
    return this.#analyticsFlushPromise;
  }

  #emit(): void {
    for (const listener of this.#listeners) listener(this.#state);
  }
}
