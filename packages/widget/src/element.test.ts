// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defineWycenoWidget } from "./element.js";
import { quickTestManifest, testManifest, testPublicId } from "./test-fixtures.js";

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
            context: [],
            contextConfirmed: true,
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

  it("renders every quick-form field and focuses the first invalid answer", async () => {
    const element = document.createElement("wyceno-widget") as HTMLElement & {
      previewManifest: typeof quickTestManifest;
    };
    element.setAttribute("public-id", testPublicId);
    element.setAttribute("preview", "");
    element.previewManifest = quickTestManifest;
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const shadow = element.shadowRoot!;
    expect(shadow.querySelectorAll(".wyceno-quick-field")).toHaveLength(3);
    expect(shadow.querySelector(".wyceno-progress-region")).toBeNull();
    shadow.querySelector<HTMLFormElement>(".wyceno-form--quick")!.requestSubmit();
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(shadow.activeElement?.id).toBe("wyceno-field-service");
    expect(shadow.querySelector('[role="alert"]')?.textContent).toContain("Uzupełnij");
    expect(shadow.querySelectorAll(".wyceno-quick-field")).toHaveLength(3);
  });

  it("renders text cards from the versioned presentation contract", async () => {
    const element = document.createElement("wyceno-widget") as HTMLElement & {
      previewManifest: typeof quickTestManifest;
    };
    element.setAttribute("public-id", testPublicId);
    element.setAttribute("preview", "");
    element.previewManifest = {
      ...quickTestManifest,
      steps: quickTestManifest.steps.map((step, stepIndex) =>
        stepIndex === 0
          ? {
              ...step,
              options: step.options.map((option) => ({
                ...option,
                presentation: { description: `Zakres opcji ${option.label}.` },
              })),
              presentation: { variant: "text_cards" },
            }
          : step,
      ),
    };
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const shadow = element.shadowRoot!;
    expect(shadow.querySelectorAll(".wyceno-choices--text-cards .wyceno-choice-copy")).toHaveLength(
      2,
    );
    expect(shadow.textContent).toContain("Zakres opcji Standard.");
    expect(shadow.querySelector("img, svg")).toBeNull();
  });

  it("renders only source-controlled icons for icon cards", async () => {
    const element = document.createElement("wyceno-widget") as HTMLElement & {
      previewManifest: typeof quickTestManifest;
    };
    element.setAttribute("public-id", testPublicId);
    element.setAttribute("preview", "");
    element.previewManifest = {
      ...quickTestManifest,
      steps: quickTestManifest.steps.map((step, stepIndex) =>
        stepIndex === 0
          ? {
              ...step,
              options: step.options.map((option, optionIndex) => ({
                ...option,
                presentation: { icon: optionIndex === 0 ? "home" : "store" },
              })),
              presentation: { variant: "icon_cards" },
            }
          : step,
      ),
    };
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const shadow = element.shadowRoot!;
    expect(shadow.querySelectorAll(".wyceno-choices--icon-cards svg")).toHaveLength(2);
    expect(shadow.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
    expect(shadow.querySelector("img")).toBeNull();
  });

  it("renders lazy image cards from the preview asset map with a stable fallback", async () => {
    const assetIds = [
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002",
    ] as const;
    const element = document.createElement("wyceno-widget") as HTMLElement & {
      previewAssetUrls: Readonly<Record<string, string>>;
      previewManifest: typeof quickTestManifest;
    };
    element.setAttribute("public-id", testPublicId);
    element.setAttribute("preview", "");
    element.previewAssetUrls = {
      [assetIds[0]]: "https://assets.example.test/material-a.webp",
      [assetIds[1]]: "https://assets.example.test/material-b.webp",
    };
    element.previewManifest = {
      ...quickTestManifest,
      experienceMode: "visual_configurator",
      steps: quickTestManifest.steps.map((step, stepIndex) =>
        stepIndex === 0
          ? {
              ...step,
              options: step.options.map((option, optionIndex) => ({
                ...option,
                presentation: {
                  asset: { alt: `Próbka ${option.label}`, id: assetIds[optionIndex]! },
                },
              })),
              presentation: { variant: "image_cards" },
            }
          : step,
      ),
    };
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const images = element.shadowRoot!.querySelectorAll<HTMLImageElement>(
      ".wyceno-choices--image-cards img",
    );
    expect(images).toHaveLength(2);
    expect(images[0]?.loading).toBe("lazy");
    expect(images[0]?.alt).toBe("Próbka Standard");
    expect(images[0]?.src).toBe("https://assets.example.test/material-a.webp");
    expect(images[0]?.width).toBe(800);
    expect(element.shadowRoot?.querySelectorAll(".wyceno-choice-media-fallback")).toHaveLength(2);
  });
});
