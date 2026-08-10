// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { LocalWidgetStorage, widgetStorageKey } from "./storage.js";
import { testPublicId } from "./test-fixtures.js";

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
});
