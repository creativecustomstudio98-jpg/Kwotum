// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defineWycenoWidget } from "./element.js";
import { testManifest, testPublicId } from "./test-fixtures.js";

class ResizeObserverStub {
  disconnect(): void {}
  observe(): void {}
}

describe("wyceno-widget element", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            currentStepKey: "service",
            expiresAt: "2099-01-01T00:00:00.000Z",
            manifest: {
              ...testManifest,
              title: "<img src=x onerror=alert(1)>",
            },
            revision: 0,
            token: "c".repeat(64),
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        ),
      ),
    );
    localStorage.clear();
    defineWycenoWidget();
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  it("renders in Shadow DOM, treats configured content as text and emits ready", async () => {
    const ready = vi.fn();
    const element = document.createElement("wyceno-widget");
    element.setAttribute("public-id", testPublicId);
    element.addEventListener("wyceno:ready", ready);
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const shadow = element.shadowRoot;
    expect(shadow).not.toBeNull();
    expect(shadow?.querySelector('link[rel="stylesheet"]')).not.toBeNull();
    expect(shadow?.querySelector("img")).toBeNull();
    expect(shadow?.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(shadow?.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    expect(ready).toHaveBeenCalledOnce();
  });

  it("uses the memory-only adapter in preview mode without fetch or localStorage", async () => {
    const element = document.createElement("wyceno-widget") as HTMLElement & {
      previewManifest: typeof testManifest;
    };
    element.setAttribute("public-id", testPublicId);
    element.setAttribute("preview", "");
    element.previewManifest = testManifest;
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage).toHaveLength(0);
    expect(element.shadowRoot?.textContent).toContain("Tryb podglądu");
    expect(element.shadowRoot?.textContent).toContain("nic nie zapisujemy");
    expect(element.shadowRoot?.querySelector(".wyceno-analytics")).toBeNull();
  });
});
