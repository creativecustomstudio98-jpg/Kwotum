// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defineWycenoWidget, resolveWidgetApiBase } from "./element.js";
import { testManifest, testPublicId } from "./test-fixtures.js";

class ResizeObserverStub {
  disconnect(): void {}
  observe(): void {}
}

describe("wyceno-widget element", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value(this: HTMLDialogElement): void {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value(this: HTMLDialogElement): void {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      },
    });
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
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
    vi.restoreAllMocks();
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

  it("resolves the API from an explicit base or the renderer module origin", () => {
    expect(
      resolveWidgetApiBase(
        "https://api.example.test/path",
        "https://cdn.example.test/widget/v1/element.js",
        "https://host.example.test",
      ),
    ).toBe("https://api.example.test/path");
    expect(
      resolveWidgetApiBase(
        null,
        "https://app.kwotum.pl/widget/v1/element.js",
        "https://fortez-przyczepy.pl",
      ),
    ).toBe("https://app.kwotum.pl");
    expect(
      resolveWidgetApiBase(null, "file:///tmp/widget/element.js", "http://127.0.0.1:3100"),
    ).toBe("http://127.0.0.1:3100");
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

  it.each(["popup", "fullscreen"] as const)(
    "defers the %s session and local storage until the launcher is clicked",
    async (mode) => {
      const storageRead = vi.spyOn(Storage.prototype, "getItem");
      const storageWrite = vi.spyOn(Storage.prototype, "setItem");
      const ready = vi.fn();
      const element = document.createElement("wyceno-widget");
      element.setAttribute("mode", mode);
      element.setAttribute("public-id", testPublicId);
      element.addEventListener("wyceno:ready", ready);
      document.body.append(element);
      await new Promise((resolve) => setTimeout(resolve, 20));

      const launcher = element.shadowRoot?.querySelector<HTMLButtonElement>(".wyceno-launcher");
      expect(launcher).not.toBeNull();
      expect(element.shadowRoot?.querySelector("dialog")).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
      expect(storageRead).not.toHaveBeenCalled();
      expect(storageWrite).not.toHaveBeenCalled();
      expect(ready).not.toHaveBeenCalled();

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: `wyceno:widget:v1:${testPublicId}`,
          newValue: "{}",
        }),
      );
      expect(fetch).not.toHaveBeenCalled();
      expect(storageRead).not.toHaveBeenCalled();

      launcher?.click();
      expect(element.shadowRoot?.querySelector("dialog")?.open).toBe(true);
      expect(element.shadowRoot?.textContent).toContain("Uruchamiamy formularz…");
      expect(storageRead).toHaveBeenCalledOnce();
      expect(fetch).toHaveBeenCalledOnce();

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(storageWrite).toHaveBeenCalledOnce();
      expect(ready).toHaveBeenCalledOnce();
      expect(element.shadowRoot?.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    },
  );
});
