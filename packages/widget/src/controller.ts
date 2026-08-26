import {
  isWidgetApiError,
  type WidgetAnswer,
  type WidgetAnalyticsEvent,
  type WidgetAnalyticsEventName,
  type WidgetApi,
  type WidgetCalculatedResult,
  type WidgetContextInput,
  type WidgetContextValue,
  type WidgetManifest,
  type WidgetStep,
  type WidgetSubmission,
  type UploadedWidgetFile,
} from "./contracts.js";
import { isAnswerValid, resolveNextStep } from "./manifest.js";
import { type PendingAnswer, type PersistedWidgetSession, type WidgetStorage } from "./storage.js";

export type WidgetStatus =
  | "active"
  | "calculating_result"
  | "contact"
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
  context: WidgetContextValue[];
  contextConfirmed: boolean;
  contextError: string | null;
  currentStep: WidgetStep | null;
  errorMessage: string | null;
  history: string[];
  manifest: WidgetManifest | null;
  result: WidgetCalculatedResult | null;
  submission: WidgetSubmission | null;
  status: WidgetStatus;
  syncStatus: WidgetSyncStatus;
  uploadedFiles: UploadedWidgetFile[];
  validationStepKey: string | null;
}>;

export type QuickFormSubmissionResult =
  | Readonly<{ accepted: true; firstInvalidStepKey: null }>
  | Readonly<{ accepted: false; firstInvalidStepKey: string | null }>;

export type LeadSubmissionDraft = Readonly<{
  email: string;
  files: File[];
  marketingEmailAccepted: boolean;
  name?: string;
  phone?: string;
  preferredContactChannel?: "email" | "phone";
  preferredContactWindow?: "morning" | "afternoon" | "evening";
  privacyAccepted: boolean;
}>;

export type ChallengeTokenProvider = () => Promise<string>;

type ActiveSession = {
  analyticsConsent: boolean | null;
  answers: Record<string, WidgetAnswer>;
  context: WidgetContextValue[];
  contextConfirmed: boolean;
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

export class WidgetSessionController {
  readonly #api: WidgetApi;
  readonly #initialContext: WidgetContextInput;
  readonly #listeners = new Set<(state: WidgetState) => void>();
  readonly #storage: WidgetStorage;
  readonly #pendingAnalytics: WidgetAnalyticsEvent[] = [];
  #analyticsFlushPromise: Promise<void> | null = null;
  #flushPromise: Promise<void> | null = null;
  #session: ActiveSession | null = null;
  #state: WidgetState = {
    analyticsConsent: null,
    analyticsError: null,
    answers: {},
    context: [],
    contextConfirmed: true,
    contextError: null,
    currentStep: null,
    errorMessage: null,
    history: [],
    manifest: null,
    result: null,
    submission: null,
    status: "idle",
    syncStatus: "synced",
    uploadedFiles: [],
    validationStepKey: null,
  };

  constructor(api: WidgetApi, storage: WidgetStorage, initialContext: WidgetContextInput = {}) {
    this.#api = api;
    this.#initialContext = { ...initialContext };
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
    this.#setState({ status: "loading_manifest", errorMessage: null });
    const local = this.#storage.load(publicId);
    if (local) {
      this.#restoreLocal(local);
      try {
        const resumed = await this.#api.resumeSession(local.token);
        this.#session = {
          analyticsConsent: local.analyticsConsent ?? null,
          answers: { ...resumed.answers },
          context: [...resumed.context],
          contextConfirmed: resumed.contextConfirmed,
          currentStepKey: resumed.currentStepKey,
          expiresAt: resumed.expiresAt,
          history: local.history,
          manifest: resumed.manifest,
          pending: local.pending,
          publicId,
          revision: resumed.revision,
          token: local.token,
        };
        for (const pending of local.pending) {
          if (pending.answer === null) delete this.#session.answers[pending.stepKey];
          else this.#session.answers[pending.stepKey] = pending.answer;
          this.#session.currentStepKey = pending.nextStepKey;
        }
        this.#publishSession();
        await this.flush();
        this.trackAnalytics("widget_loaded");
        if (this.#session.contextConfirmed && this.#session.currentStepKey) {
          this.trackAnalytics("step_viewed", this.#session.currentStepKey);
        }
        return;
      } catch (error) {
        if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
          this.#storage.clear(publicId);
          this.#session = null;
          this.#setState({
            status: "expired",
            errorMessage: "Ta sesja wygasła. Rozpocznij proces ponownie.",
          });
          return;
        }
        this.#setState({ syncStatus: "offline" });
        return;
      }
    }

    try {
      const created = await this.#api.createSession(publicId, this.#initialContext);
      this.#session = {
        analyticsConsent: null,
        answers: {},
        context: [...created.context],
        contextConfirmed: created.contextConfirmed,
        currentStepKey: created.currentStepKey,
        expiresAt: created.expiresAt,
        history: [],
        manifest: created.manifest,
        pending: [],
        publicId,
        revision: created.revision,
        token: created.token,
      };
      this.#publishSession();
      this.trackAnalytics("widget_loaded");
      if (created.contextConfirmed) this.trackAnalytics("step_viewed", created.currentStepKey);
    } catch (error) {
      this.#setState({
        errorMessage: isWidgetApiError(error, "NOT_FOUND")
          ? "Ten proces jest niedostępny."
          : "Nie udało się uruchomić procesu. Sprawdź połączenie i spróbuj ponownie.",
        status: isWidgetApiError(error, "NOT_FOUND") ? "unavailable" : "recoverable_error",
      });
    }
  }

  async restart(): Promise<void> {
    const publicId = this.#session?.publicId ?? this.#state.manifest?.publicId;
    if (!publicId) return;
    this.#storage.clear(publicId);
    this.#session = null;
    this.#state = {
      ...this.#state,
      analyticsConsent: null,
      analyticsError: null,
      answers: {},
      context: [],
      contextConfirmed: true,
      contextError: null,
      currentStep: null,
      history: [],
      manifest: null,
      result: null,
      submission: null,
      uploadedFiles: [],
      validationStepKey: null,
    };
    await this.initialize(publicId);
  }

  async setAnalyticsConsent(granted: boolean): Promise<boolean> {
    const session = this.#session;
    if (!session) return false;
    try {
      await this.#api.setAnalyticsConsent({
        consentVersion: "analytics-v1",
        granted,
        mutationId: crypto.randomUUID(),
        token: session.token,
      });
      session.analyticsConsent = granted;
      if (!granted) this.#pendingAnalytics.splice(0);
      this.#setState({ analyticsConsent: granted, analyticsError: null });
      this.#persist();
      if (granted) void this.#flushAnalytics();
      return true;
    } catch {
      this.#setState({
        analyticsError: "Nie zapisaliśmy tej decyzji. Sprawdź połączenie i spróbuj ponownie.",
      });
      return false;
    }
  }

  async confirmContext(values: WidgetContextInput): Promise<boolean> {
    const session = this.#session;
    if (!session || session.contextConfirmed) return Boolean(session?.contextConfirmed);
    try {
      session.context = await this.#api.confirmContext({
        mutationId: crypto.randomUUID(),
        token: session.token,
        values,
      });
      session.contextConfirmed = true;
      this.#state = { ...this.#state, contextError: null };
      this.#publishSession();
      if (session.currentStepKey) this.trackAnalytics("step_viewed", session.currentStepKey);
      return true;
    } catch {
      this.#setState({ contextError: "Sprawdź wybrane dane i spróbuj ponownie." });
      return false;
    }
  }

  trackAnalytics(name: WidgetAnalyticsEventName, stepKey: string | null = null): void {
    const session = this.#session;
    if (!session || session.analyticsConsent === false) return;
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
    if (session.analyticsConsent) void this.#flushAnalytics();
  }

  async submitLead(
    draft: LeadSubmissionDraft,
    challengeTokenProvider: ChallengeTokenProvider,
  ): Promise<boolean> {
    const session = this.#session;
    const capture = session?.manifest.leadCapture;
    if (
      !session ||
      !capture ||
      session.currentStepKey !== null ||
      session.pending.length > 0 ||
      (this.#state.status !== "result" && this.#state.status !== "contact")
    )
      return false;
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
    if (capture.fields?.name === "required" && !draft.name?.trim()) {
      this.#setState({ errorMessage: "Podaj imię." });
      return false;
    }
    if (capture.fields?.preferredContactChannel === "required" && !draft.preferredContactChannel) {
      this.#setState({ errorMessage: "Wybierz preferowany kanał kontaktu." });
      return false;
    }
    if (capture.fields?.preferredContactWindow === "required" && !draft.preferredContactWindow) {
      this.#setState({ errorMessage: "Wybierz preferowaną porę kontaktu." });
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
    this.#setState({ errorMessage: null, status: "submitting" });
    try {
      const uploaded = [...this.#state.uploadedFiles];
      for (const file of filesToUpload) {
        uploaded.push(await this.#api.uploadFile(file, session.token));
        this.trackAnalytics("file_uploaded");
        this.#setState({ uploadedFiles: [...uploaded] });
      }
      const challengeToken = await challengeTokenProvider();
      const submission = await this.#api.submitLead({
        challengeToken,
        contact: {
          ...(draft.email.trim() ? { email: draft.email.trim() } : {}),
          ...(draft.name?.trim() ? { name: draft.name.trim() } : {}),
          ...(draft.phone?.trim() ? { phone: draft.phone.trim() } : {}),
          ...(draft.preferredContactChannel
            ? { preferredContactChannel: draft.preferredContactChannel }
            : {}),
          ...(draft.preferredContactWindow
            ? { preferredContactWindow: draft.preferredContactWindow }
            : {}),
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
      const result =
        capture.completionOrder === "contact_then_result"
          ? await this.#api.getResult(session.token)
          : this.#state.result;
      this.#setState({
        errorMessage: null,
        result,
        status: "submitted",
        submission,
        uploadedFiles: uploaded,
      });
      this.trackAnalytics("lead_submitted");
      return true;
    } catch (error) {
      if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
        this.#setState({
          errorMessage: "Ta sesja wygasła. Rozpocznij proces ponownie.",
          status: "expired",
        });
        return false;
      }
      this.#setState({
        errorMessage:
          error instanceof Error
            ? error.message
            : "Nie udało się wysłać zapytania. Spróbuj ponownie.",
        status: capture.completionOrder === "contact_then_result" ? "contact" : "result",
      });
      return false;
    }
  }

  answer(answer: WidgetAnswer | null): boolean {
    const session = this.#session;
    const currentStepKey = session?.currentStepKey;
    if (!session || !currentStepKey) return false;
    if (!session.contextConfirmed) {
      this.#setState({ contextError: "Najpierw potwierdź kontekst zapytania." });
      return false;
    }
    const step = session.manifest.steps.find((candidate) => candidate.key === currentStepKey);
    if (!step || !isAnswerValid(step, answer)) {
      this.#setState({ errorMessage: "Uzupełnij odpowiedź, aby przejść dalej." });
      this.trackAnalytics("validation_error", currentStepKey);
      return false;
    }

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
    this.#publishSession();
    void this.flush();
    return true;
  }

  submitQuickForm(
    submittedAnswers: Readonly<Record<string, WidgetAnswer | null>>,
  ): QuickFormSubmissionResult {
    const session = this.#session;
    if (
      !session ||
      !session.contextConfirmed ||
      session.manifest.experienceMode !== "quick_form" ||
      session.currentStepKey === null
    ) {
      return { accepted: false, firstInvalidStepKey: null };
    }

    const draftAnswers: Record<string, WidgetAnswer> = {};
    let firstInvalidStepKey: string | null = null;
    for (const step of session.manifest.steps) {
      const answer = submittedAnswers[step.key] ?? null;
      if (answer !== null) draftAnswers[step.key] = answer;
      if (firstInvalidStepKey === null && !isAnswerValid(step, answer)) {
        firstInvalidStepKey = step.key;
      }
    }
    if (firstInvalidStepKey !== null) {
      this.#setState({
        answers: draftAnswers,
        errorMessage: "Uzupełnij zaznaczone pole, aby wysłać formularz.",
        validationStepKey: firstInvalidStepKey,
      });
      this.trackAnalytics("validation_error", firstInvalidStepKey);
      return { accepted: false, firstInvalidStepKey };
    }

    session.answers = { ...draftAnswers };
    session.history = [];
    for (const step of session.manifest.steps) {
      const answer = submittedAnswers[step.key] ?? null;
      const nextStepKey = resolveNextStep(session.manifest, step.key, session.answers);
      session.pending.push({
        answer,
        mutationId: crypto.randomUUID(),
        nextStepKey,
        stepKey: step.key,
      });
      session.history.push(step.key);
      this.trackAnalytics("step_answered", step.key);
    }
    session.currentStepKey = null;
    this.trackAnalytics("flow_started");
    this.#publishSession();
    void this.flush();
    return { accepted: true, firstInvalidStepKey: null };
  }

  back(): void {
    const session = this.#session;
    const previous = session?.history.pop();
    if (!session || !previous) return;
    this.trackAnalytics("step_back", previous);
    this.trackAnalytics("step_viewed", previous);
    session.currentStepKey = previous;
    this.#setState({ result: null });
    this.#publishSession();
  }

  async flush(): Promise<void> {
    if (this.#flushPromise) return this.#flushPromise;
    this.#flushPromise = this.#flushPending()
      .then(() => this.#loadResult())
      .then(() => this.#flushAnalytics())
      .finally(() => {
        this.#flushPromise = null;
      });
    return this.#flushPromise;
  }

  #restoreLocal(local: PersistedWidgetSession): void {
    this.#session = {
      analyticsConsent: local.analyticsConsent ?? null,
      answers: { ...local.answers },
      context: [...(local.context ?? [])],
      contextConfirmed: local.contextConfirmed ?? true,
      currentStepKey: local.currentStepKey,
      expiresAt: local.expiresAt,
      history: [...local.history],
      manifest: local.manifest,
      pending: [...local.pending],
      publicId: local.publicId,
      revision: local.revision,
      token: local.token,
    };
    this.#publishSession("offline");
  }

  async #flushPending(): Promise<void> {
    const session = this.#session;
    if (!session || session.pending.length === 0) return;
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
        session.revision = saved.revision;
        session.pending.shift();
        this.#persist();
      } catch (error) {
        if (isWidgetApiError(error, "CONFLICT")) {
          try {
            const remote = await this.#api.resumeSession(session.token);
            session.revision = remote.revision;
            session.manifest = remote.manifest;
            session.answers = { ...remote.answers };
            for (const queued of session.pending) {
              if (queued.answer === null) delete session.answers[queued.stepKey];
              else session.answers[queued.stepKey] = queued.answer;
            }
            continue;
          } catch {
            this.#setState({ syncStatus: "offline" });
            return;
          }
        }
        if (isWidgetApiError(error, "EXPIRED")) {
          this.#setState({
            errorMessage: "Ta sesja wygasła. Rozpocznij proces ponownie.",
            status: "expired",
            syncStatus: "offline",
          });
          return;
        }
        this.#setState({ syncStatus: "offline" });
        this.#persist();
        return;
      }
    }
    this.#setState({ syncStatus: "synced" });
    this.#persist();
  }

  async #loadResult(): Promise<void> {
    const session = this.#session;
    if (
      !session ||
      session.currentStepKey !== null ||
      session.pending.length > 0 ||
      this.#state.result
    ) {
      return;
    }
    if (
      session.manifest.leadCapture?.completionOrder === "contact_then_result" &&
      !this.#state.submission
    ) {
      this.#setState({ status: "contact", syncStatus: "synced" });
      return;
    }
    this.#setState({ status: "calculating_result" });
    try {
      const result = await this.#api.getResult(session.token);
      this.#setState({
        errorMessage: null,
        result,
        status: this.#state.submission ? "submitted" : "result",
        syncStatus: "synced",
      });
      this.trackAnalytics("result_viewed");
    } catch (error) {
      if (isWidgetApiError(error, "EXPIRED") || isWidgetApiError(error, "NOT_FOUND")) {
        this.#setState({
          errorMessage: "Ta sesja wygasła. Rozpocznij proces ponownie.",
          status: "expired",
          syncStatus: "offline",
        });
        return;
      }
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
      context: [...session.context],
      contextConfirmed: session.contextConfirmed,
      contextError: this.#state.contextError,
      currentStep,
      errorMessage: null,
      history: [...session.history],
      manifest: session.manifest,
      result: currentStep ? null : this.#state.result,
      status: currentStep
        ? "active"
        : this.#state.submission
          ? "submitted"
          : session.manifest.leadCapture?.completionOrder === "contact_then_result"
            ? "contact"
            : this.#state.result
              ? "result"
              : "calculating_result",
      submission: this.#state.submission,
      syncStatus,
      uploadedFiles: [...this.#state.uploadedFiles],
      validationStepKey: null,
    };
    this.#persist();
    this.#emit();
  }

  #persist(): void {
    const session = this.#session;
    if (!session) return;
    this.#storage.save({
      analyticsConsent: session.analyticsConsent,
      answers: { ...session.answers },
      context: [...session.context],
      contextConfirmed: session.contextConfirmed,
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
          this.#pendingAnalytics.shift();
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
