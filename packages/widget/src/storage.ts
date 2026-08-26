import type { WidgetAnswer, WidgetContextValue, WidgetManifest } from "./contracts.js";
import { parseWidgetManifest } from "./manifest.js";

export type PendingAnswer = Readonly<{
  answer: WidgetAnswer | null;
  mutationId: string;
  nextStepKey: string | null;
  stepKey: string;
}>;

export type PersistedWidgetSession = Readonly<{
  analyticsConsent?: boolean | null;
  answers: Record<string, WidgetAnswer>;
  context?: WidgetContextValue[];
  contextConfirmed?: boolean;
  currentStepKey: string | null;
  expiresAt: string;
  history: string[];
  manifest: WidgetManifest;
  pending: PendingAnswer[];
  publicId: string;
  revision: number;
  savedAt: string;
  token: string;
  version: 1;
}>;

export interface WidgetStorage {
  clear(publicId: string): void;
  load(publicId: string): PersistedWidgetSession | null;
  save(session: PersistedWidgetSession): void;
}

const storagePrefix = "wyceno:widget:v1:";

export function widgetStorageKey(publicId: string): string {
  return `${storagePrefix}${publicId}`;
}

function isPersistedSession(value: unknown, publicId: string): value is PersistedWidgetSession {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<PersistedWidgetSession>;
  return (
    candidate.version === 1 &&
    candidate.publicId === publicId &&
    typeof candidate.token === "string" &&
    /^[a-f0-9]{64}$/.test(candidate.token) &&
    typeof candidate.revision === "number" &&
    Number.isInteger(candidate.revision) &&
    candidate.revision >= 0 &&
    typeof candidate.expiresAt === "string" &&
    typeof candidate.savedAt === "string" &&
    (candidate.currentStepKey === null || typeof candidate.currentStepKey === "string") &&
    typeof candidate.manifest === "object" &&
    candidate.manifest !== null &&
    typeof candidate.answers === "object" &&
    candidate.answers !== null &&
    !Array.isArray(candidate.answers) &&
    (candidate.context === undefined ||
      (Array.isArray(candidate.context) && candidate.context.every(isContextValue))) &&
    (candidate.contextConfirmed === undefined || typeof candidate.contextConfirmed === "boolean") &&
    Array.isArray(candidate.history) &&
    candidate.history.every((stepKey) => typeof stepKey === "string") &&
    Array.isArray(candidate.pending) &&
    candidate.pending.every(isPendingAnswer) &&
    (candidate.analyticsConsent === undefined ||
      candidate.analyticsConsent === null ||
      typeof candidate.analyticsConsent === "boolean")
  );
}

function isContextValue(value: unknown): value is WidgetContextValue {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Partial<WidgetContextValue>;
  return (
    typeof entry.key === "string" &&
    typeof entry.label === "string" &&
    (entry.mode === "confirm" || entry.mode === "informational") &&
    (entry.type === "enum" || entry.type === "text") &&
    typeof entry.value === "string"
  );
}

function isAnswer(value: unknown): value is WidgetAnswer {
  return (
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.length <= 2000) ||
    (Array.isArray(value) &&
      value.length <= 20 &&
      value.every((item) => typeof item === "string" && item.length <= 64))
  );
}

function isPendingAnswer(value: unknown): value is PendingAnswer {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const pending = value as Partial<PendingAnswer>;
  return (
    (pending.answer === null || isAnswer(pending.answer)) &&
    typeof pending.mutationId === "string" &&
    /^[0-9a-f-]{36}$/i.test(pending.mutationId) &&
    typeof pending.stepKey === "string" &&
    (pending.nextStepKey === null || typeof pending.nextStepKey === "string")
  );
}

function isSameStoredSession(raw: string, session: PersistedWidgetSession): boolean {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedSession(parsed, session.publicId)) return false;
    return (
      JSON.stringify({ ...parsed, savedAt: "" }) === JSON.stringify({ ...session, savedAt: "" })
    );
  } catch {
    return false;
  }
}

export class LocalWidgetStorage implements WidgetStorage {
  readonly #fallback = new Map<string, PersistedWidgetSession>();
  readonly #fallbackAuthoritative = new Set<string>();
  readonly #storage: Storage | null;

  constructor(storage?: Storage) {
    if (storage) {
      this.#storage = storage;
      return;
    }
    try {
      this.#storage = typeof window === "undefined" ? null : window.localStorage;
    } catch {
      this.#storage = null;
    }
  }

  clear(publicId: string): void {
    this.#fallback.delete(publicId);
    if (!this.#storage) {
      this.#fallbackAuthoritative.add(publicId);
      return;
    }
    try {
      this.#storage.removeItem(widgetStorageKey(publicId));
      this.#fallbackAuthoritative.delete(publicId);
    } catch {
      this.#fallbackAuthoritative.add(publicId);
    }
  }

  #loadFallback(publicId: string): PersistedWidgetSession | null {
    const session = this.#fallback.get(publicId);
    return session ? structuredClone(session) : null;
  }

  load(publicId: string): PersistedWidgetSession | null {
    if (this.#fallbackAuthoritative.has(publicId)) return this.#loadFallback(publicId);
    let raw: string | null;
    try {
      raw = this.#storage?.getItem(widgetStorageKey(publicId)) ?? null;
    } catch {
      return this.#loadFallback(publicId);
    }
    if (!raw) return this.#loadFallback(publicId);
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isPersistedSession(parsed, publicId)) {
        this.clear(publicId);
        return null;
      }
      const manifest = parseWidgetManifest(parsed.manifest);
      if (!Object.values(parsed.answers).every(isAnswer)) {
        this.clear(publicId);
        return null;
      }
      const expiry = Date.parse(parsed.expiresAt);
      if (!Number.isFinite(expiry) || expiry <= Date.now()) {
        this.clear(publicId);
        return null;
      }
      const session = { ...parsed, manifest };
      this.#fallback.set(publicId, structuredClone(session));
      return session;
    } catch {
      this.clear(publicId);
      return null;
    }
  }

  save(session: PersistedWidgetSession): void {
    this.#fallback.set(session.publicId, structuredClone(session));
    if (!this.#storage) {
      this.#fallbackAuthoritative.add(session.publicId);
      return;
    }
    try {
      const key = widgetStorageKey(session.publicId);
      const serialized = JSON.stringify(session);
      const current = this.#storage.getItem(key);
      if (!current || !isSameStoredSession(current, session)) {
        this.#storage.setItem(key, serialized);
      }
      this.#fallbackAuthoritative.delete(session.publicId);
    } catch {
      this.#fallbackAuthoritative.add(session.publicId);
    }
  }
}

export class MemoryWidgetStorage implements WidgetStorage {
  readonly #sessions = new Map<string, PersistedWidgetSession>();

  clear(publicId: string): void {
    this.#sessions.delete(publicId);
  }

  load(publicId: string): PersistedWidgetSession | null {
    return this.#sessions.get(publicId) ?? null;
  }

  save(session: PersistedWidgetSession): void {
    this.#sessions.set(session.publicId, structuredClone(session));
  }
}
