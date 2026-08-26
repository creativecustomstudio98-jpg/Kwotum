// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocalWidgetStorage, type PersistedWidgetSession, widgetStorageKey } from "./storage.js";
import { testManifest, testPublicId } from "./test-fixtures.js";

function persistedSession(savedAt = "2026-08-11T18:00:00.000Z"): PersistedWidgetSession {
  return {
    analyticsConsent: null,
    answers: {},
    currentStepKey: testManifest.entryStepKey,
    expiresAt: "2099-01-01T00:00:00.000Z",
    history: [],
    manifest: testManifest,
    pending: [],
    publicId: testPublicId,
    revision: 0,
    savedAt,
    token: "a".repeat(64),
    version: 1,
  };
}

describe("LocalWidgetStorage", () => {
  beforeEach(() => localStorage.clear());

  it("removes malformed or expired host-origin data instead of trusting it", () => {
    const storage = new LocalWidgetStorage();
    localStorage.setItem(
      widgetStorageKey(testPublicId),
      JSON.stringify({
        answers: {},
        currentStepKey: "service",
        expiresAt: "not-a-date",
        history: [],
        manifest: { manifestVersion: 1 },
        pending: [],
        publicId: testPublicId,
        revision: 0,
        savedAt: new Date().toISOString(),
        token: "a".repeat(64),
        version: 1,
      }),
    );

    expect(storage.load(testPublicId)).toBeNull();
    expect(localStorage.getItem(widgetStorageKey(testPublicId))).toBeNull();
  });

  it("keeps the current-tab session in memory when localStorage quota is exceeded", () => {
    const stale = persistedSession();
    const current = {
      ...stale,
      answers: { service: "standard" },
      revision: 1,
      savedAt: "2026-08-11T18:00:01.000Z",
    };
    const quotaStorage: Storage = {
      clear: vi.fn(),
      getItem: vi.fn(() => JSON.stringify(stale)),
      key: vi.fn(() => null),
      length: 0,
      removeItem: vi.fn(),
      setItem: vi.fn(() => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }),
    };
    const storage = new LocalWidgetStorage(quotaStorage);

    expect(() => storage.save(current)).not.toThrow();
    expect(storage.load(testPublicId)).toEqual(current);
  });

  it("does not emit another host storage write when only savedAt changed", () => {
    const write = vi.spyOn(Storage.prototype, "setItem");
    const storage = new LocalWidgetStorage();

    storage.save(persistedSession());
    storage.save(persistedSession("2026-08-11T18:00:01.000Z"));

    expect(write).toHaveBeenCalledOnce();
  });

  it("keeps a removal tombstone authoritative when host storage removal fails", () => {
    const stale = persistedSession();
    const brokenStorage: Storage = {
      clear: vi.fn(),
      getItem: vi.fn(() => JSON.stringify(stale)),
      key: vi.fn(() => null),
      length: 1,
      removeItem: vi.fn(() => {
        throw new DOMException("Host storage is unavailable", "SecurityError");
      }),
      setItem: vi.fn(),
    };
    const storage = new LocalWidgetStorage(brokenStorage);

    expect(() => storage.clear(testPublicId)).not.toThrow();
    expect(storage.load(testPublicId)).toBeNull();
    expect(brokenStorage.removeItem).toHaveBeenCalledWith(widgetStorageKey(testPublicId));
  });
});
