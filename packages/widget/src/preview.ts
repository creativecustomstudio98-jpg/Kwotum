import type {
  CreatedWidgetSession,
  SaveAnswerInput,
  SavedWidgetAnswer,
  SubmitLeadInput,
  UploadedWidgetFile,
  WidgetAnswer,
  WidgetApi,
  WidgetCalculatedResult,
  WidgetManifest,
  WidgetSessionSnapshot,
  WidgetSubmission,
} from "./contracts.js";
import { WidgetApiError } from "./contracts.js";
import { isAnswerValid, resolveNextStep } from "./manifest.js";

type PreviewSession = {
  answers: Record<string, WidgetAnswer>;
  currentStepKey: string | null;
  expiresAt: string;
  revision: number;
};

function previewToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

/** Network-free adapter for the authenticated panel preview. */
export class PreviewWidgetApi implements WidgetApi {
  readonly #manifest: WidgetManifest;
  readonly #sessions = new Map<string, PreviewSession>();

  constructor(manifest: WidgetManifest) {
    this.#manifest = structuredClone(manifest);
  }

  async createSession(publicId: string): Promise<CreatedWidgetSession> {
    if (publicId !== this.#manifest.publicId) {
      throw new WidgetApiError("NOT_FOUND", "Proces podglądu nie istnieje.");
    }
    const token = previewToken();
    const session: PreviewSession = {
      answers: {},
      currentStepKey: this.#manifest.entryStepKey,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      revision: 0,
    };
    this.#sessions.set(token, session);
    return {
      currentStepKey: this.#manifest.entryStepKey,
      expiresAt: session.expiresAt,
      manifest: structuredClone(this.#manifest),
      revision: session.revision,
      token,
    };
  }

  async getManifest(publicId: string): Promise<WidgetManifest> {
    if (publicId !== this.#manifest.publicId) {
      throw new WidgetApiError("NOT_FOUND", "Proces podglądu nie istnieje.");
    }
    return structuredClone(this.#manifest);
  }

  async getResult(token: string): Promise<WidgetCalculatedResult> {
    const session = this.#session(token);
    if (session.currentStepKey !== null) {
      throw new WidgetApiError("INVALID", "Podgląd nie został ukończony.");
    }
    return {
      disclaimer: this.#manifest.result.disclaimer,
      headline: this.#manifest.result.headline,
      nextStepLabel: this.#manifest.result.nextStepLabel,
      pricing: null,
    };
  }

  async resumeSession(token: string): Promise<WidgetSessionSnapshot> {
    const session = this.#session(token);
    return {
      answers: structuredClone(session.answers),
      currentStepKey: session.currentStepKey,
      expiresAt: session.expiresAt,
      manifest: structuredClone(this.#manifest),
      revision: session.revision,
    };
  }

  async saveAnswer(input: SaveAnswerInput): Promise<SavedWidgetAnswer> {
    const session = this.#session(input.token);
    if (session.revision !== input.expectedRevision) {
      throw new WidgetApiError("CONFLICT", "Stan podglądu zmienił się w innej karcie.");
    }
    const step = this.#manifest.steps.find((candidate) => candidate.key === input.stepKey);
    if (!step || !isAnswerValid(step, input.answer)) {
      throw new WidgetApiError("INVALID", "Nieprawidłowa odpowiedź w podglądzie.");
    }
    if (input.answer === null) delete session.answers[input.stepKey];
    else session.answers[input.stepKey] = input.answer;
    const expectedNextStep = resolveNextStep(this.#manifest, input.stepKey, session.answers);
    if (expectedNextStep !== input.nextStepKey) {
      throw new WidgetApiError("INVALID", "Nieprawidłowe przejście w podglądzie.");
    }
    session.currentStepKey = expectedNextStep;
    session.revision += 1;
    return { currentStepKey: session.currentStepKey, revision: session.revision };
  }

  async setAnalyticsConsent(): Promise<void> {
    // Preview never sends analytics.
  }

  async submitLead(input: SubmitLeadInput): Promise<WidgetSubmission> {
    const session = this.#session(input.token);
    if (session.currentStepKey !== null) {
      throw new WidgetApiError("INVALID", "Najpierw ukończ podgląd formularza.");
    }
    return { leadPublicId: crypto.randomUUID(), submittedAt: new Date().toISOString() };
  }

  async trackAnalyticsEvent(): Promise<void> {
    // Intentional no-op.
  }

  async uploadFile(file: File, token: string): Promise<UploadedWidgetFile> {
    this.#session(token);
    return {
      fileId: crypto.randomUUID(),
      mimeType: file.type || "application/octet-stream",
      name: file.name,
      sizeBytes: file.size,
    };
  }

  #session(token: string): PreviewSession {
    const session = this.#sessions.get(token);
    if (!session) throw new WidgetApiError("NOT_FOUND", "Sesja podglądu nie istnieje.");
    if (Date.parse(session.expiresAt) <= Date.now()) {
      this.#sessions.delete(token);
      throw new WidgetApiError("EXPIRED", "Sesja podglądu wygasła.");
    }
    return session;
  }
}
