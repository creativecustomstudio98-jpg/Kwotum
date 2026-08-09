// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { registerWycenoWidget } from "./loader.js";
import { testManifest, testPublicId } from "./test-fixtures.js";

class ResizeObserverStub {
  disconnect(): void {}
  observe(): void {}
}

describe("widget loader", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("upgrades a preview element without starting a network session", async () => {
    const element = document.createElement("wyceno-widget") as HTMLElement & {
      previewManifest: typeof testManifest;
    };
    element.setAttribute("public-id", testPublicId);
    element.setAttribute("preview", "");
    element.previewManifest = testManifest;
    document.body.append(element);

    await registerWycenoWidget();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(customElements.get("wyceno-widget")).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage).toHaveLength(0);
    expect(element.shadowRoot?.textContent).toContain("Tryb podglądu");
  });
});
