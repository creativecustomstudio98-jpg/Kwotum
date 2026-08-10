import {
  WidgetApiError,
  type CreatedWidgetSession,
  type SaveAnswerInput,
  type SavedWidgetAnswer,
  type SubmitLeadInput,
  type UploadedWidgetFile,
  type WidgetApi,
  type WidgetApiErrorCode,
  type WidgetAnalyticsEvent,
  type WidgetCalculatedResult,
  type WidgetSessionSnapshot,
  type WidgetSubmission,
} from "./contracts.js";
import { parseWidgetManifest } from "./manifest.js";

type ErrorEnvelope = { error?: { code?: unknown; message?: unknown } };

function apiErrorCode(status: number): WidgetApiErrorCode {
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 410) return "EXPIRED";
  if (status === 422) return "INVALID";
  if (status === 429) return "RATE_LIMITED";
  return "UNAVAILABLE";
}

async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new WidgetApiError("NETWORK", "Brak połączenia z usługą.");
  }
  const body = (await response.json().catch(() => ({}))) as ErrorEnvelope;
  if (!response.ok) {
    const message =
      typeof body.error?.message === "string" ? body.error.message : "Żądanie nie powiodło się.";
    throw new WidgetApiError(apiErrorCode(response.status), message);
  }
  return body;
}

function apiRoot(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/v1/public`;
}

export class HttpWidgetApi implements WidgetApi {
  readonly #baseUrl: string;

  constructor(baseUrl: string) {
    this.#baseUrl = apiRoot(baseUrl);
  }

  async getManifest(publicId: string) {
    return parseWidgetManifest(
      await requestJson(`${this.#baseUrl}/flows/${encodeURIComponent(publicId)}/manifest`),
    );
  }

  async createSession(publicId: string): Promise<CreatedWidgetSession> {
    const value = await requestJson(
      `${this.#baseUrl}/flows/${encodeURIComponent(publicId)}/sessions`,
      { method: "POST", body: "{}" },
    );
    if (!isRecord(value)) throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    return {
      currentStepKey: requiredString(value, "currentStepKey"),
      expiresAt: requiredString(value, "expiresAt"),
      manifest: parseWidgetManifest(value.manifest),
      revision: requiredInteger(value, "revision"),
      token: requiredString(value, "token"),
    };
  }

  async getResult(token: string): Promise<WidgetCalculatedResult> {
    const value = await requestJson(`${this.#baseUrl}/sessions/current/result`, {
      headers: { "X-Wyceno-Session": token },
    });
    if (!isRecord(value)) throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    const pricing = value.pricing;
    if (pricing !== null && !isRecord(pricing)) {
      throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    }
    return {
      disclaimer: requiredString(value, "disclaimer"),
      headline: requiredString(value, "headline"),
      nextStepLabel: requiredString(value, "nextStepLabel"),
      pricing:
        pricing === null
          ? null
          : {
              currency: requiredString(pricing, "currency"),
              formattedMax: requiredString(pricing, "formattedMax"),
              formattedMin: requiredString(pricing, "formattedMin"),
              maxMinor: requiredInteger(pricing, "maxMinor"),
              minMinor: requiredInteger(pricing, "minMinor"),
              presentation: requiredPresentation(pricing),
            },
    };
  }

  async resumeSession(token: string): Promise<WidgetSessionSnapshot> {
    const value = await requestJson(`${this.#baseUrl}/sessions/current`, {
      headers: { "X-Wyceno-Session": token },
    });
    if (!isRecord(value) || !isRecord(value.answers)) {
      throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    }
    return {
      answers: value.answers as WidgetSessionSnapshot["answers"],
      currentStepKey:
        value.currentStepKey === null ? null : requiredString(value, "currentStepKey"),
      expiresAt: requiredString(value, "expiresAt"),
      manifest: parseWidgetManifest(value.manifest),
      revision: requiredInteger(value, "revision"),
    };
  }

  async saveAnswer(input: SaveAnswerInput): Promise<SavedWidgetAnswer> {
    const value = await requestJson(
      `${this.#baseUrl}/sessions/current/answers/${encodeURIComponent(input.stepKey)}`,
      {
        body: JSON.stringify({
          answer: input.answer,
          expectedRevision: input.expectedRevision,
          mutationId: input.mutationId,
          nextStepKey: input.nextStepKey,
        }),
        headers: { "X-Wyceno-Session": input.token },
        method: "PUT",
      },
    );
    if (!isRecord(value)) throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    return {
      currentStepKey:
        value.currentStepKey === null ? null : requiredString(value, "currentStepKey"),
      revision: requiredInteger(value, "revision"),
    };
  }

  async setAnalyticsConsent(input: {
    consentVersion: "analytics-v1";
    granted: boolean;
    mutationId: string;
    token: string;
  }): Promise<void> {
    await requestJson(`${this.#baseUrl}/sessions/current/analytics-consent`, {
      body: JSON.stringify({
        consentVersion: input.consentVersion,
        granted: input.granted,
        mutationId: input.mutationId,
      }),
      headers: { "X-Wyceno-Session": input.token },
      method: "POST",
    });
  }

  async submitLead(input: SubmitLeadInput): Promise<WidgetSubmission> {
    const value = await requestJson(`${this.#baseUrl}/sessions/current/submit`, {
      body: JSON.stringify({
        contact: input.contact,
        fileIds: input.fileIds,
        marketingEmailConsent: input.marketingEmailConsent,
        mutationId: input.mutationId,
        privacyNotice: input.privacyNotice,
      }),
      headers: { "X-Wyceno-Session": input.token },
      method: "POST",
    });
    if (!isRecord(value)) throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    return {
      leadPublicId: requiredString(value, "leadPublicId"),
      submittedAt: requiredString(value, "submittedAt"),
    };
  }

  async trackAnalyticsEvent(input: WidgetAnalyticsEvent): Promise<void> {
    await requestJson(`${this.#baseUrl}/events`, {
      body: JSON.stringify({
        device: input.device,
        eventId: input.eventId,
        name: input.name,
        occurredAt: input.occurredAt,
        schemaVersion: input.schemaVersion,
        source: input.source,
        stepKey: input.stepKey,
      }),
      headers: { "X-Wyceno-Session": input.token },
      method: "POST",
    });
  }

  async uploadFile(file: File, token: string): Promise<UploadedWidgetFile> {
    const form = new FormData();
    form.set("file", file);
    let response: Response;
    try {
      response = await fetch(`${this.#baseUrl}/sessions/current/files`, {
        body: form,
        headers: { "X-Wyceno-Session": token },
        method: "POST",
      });
    } catch {
      throw new WidgetApiError("NETWORK", "Brak połączenia z usługą.");
    }
    const value = (await response.json().catch(() => ({}))) as ErrorEnvelope;
    if (!response.ok) {
      const message =
        typeof value.error?.message === "string"
          ? value.error.message
          : "Nie udało się przesłać pliku.";
      throw new WidgetApiError(apiErrorCode(response.status), message);
    }
    if (!isRecord(value)) throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
    return {
      fileId: requiredString(value, "fileId"),
      mimeType: requiredString(value, "mimeType"),
      name: requiredString(value, "name"),
      sizeBytes: requiredInteger(value, "sizeBytes"),
    };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: Record<string, unknown>, key: string): string {
  const field = value[key];
  if (typeof field !== "string") {
    throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
  }
  return field;
}

function requiredInteger(value: Record<string, unknown>, key: string): number {
  const field = value[key];
  if (!Number.isInteger(field) || typeof field !== "number" || field < 0) {
    throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
  }
  return field;
}

function requiredPresentation(value: Record<string, unknown>): "exact" | "from" | "range" {
  const presentation = value.presentation;
  if (presentation !== "exact" && presentation !== "from" && presentation !== "range") {
    throw new WidgetApiError("UNAVAILABLE", "Nieprawidłowa odpowiedź API.");
  }
  return presentation;
}
