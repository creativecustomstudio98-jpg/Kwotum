// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defineWycenoWidget, resolveBrandLogoUrl, resolveWidgetApiBase } from "./element.js";
import { type PersistedWidgetSession, widgetStorageKey } from "./storage.js";
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
    expect(shadow?.querySelector(".wyceno-brand-mark")?.getAttribute("aria-hidden")).toBe("true");
    expect(shadow?.textContent).toContain("<img src=x onerror=alert(1)>");
    expect(shadow?.querySelectorAll('input[type="radio"]')).toHaveLength(2);
    expect(shadow?.textContent).toContain("Krótki dobór · 3 pytań");

    const next = shadow?.querySelector<HTMLButtonElement>('.wyceno-actions button[type="submit"]');
    const firstChoice = shadow?.querySelector<HTMLInputElement>('input[type="radio"]');
    expect(next?.disabled).toBe(true);
    expect(shadow?.querySelector(".wyceno-step-guidance")?.textContent).toBe(
      "Wybierz lub wpisz odpowiedź, aby przejść dalej.",
    );
    firstChoice?.click();
    expect(next?.disabled).toBe(false);
    expect(shadow?.querySelector(".wyceno-step-guidance")?.textContent).toBe(
      "Gotowe — przejdź do następnego kroku.",
    );
    expect(next?.textContent).toBe("DalejNastępne pytanie");
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

  it("accepts only credential-free same-origin HTTP(S) brand logos", () => {
    const pageUrl = "https://fortez-przyczepy.pl/oferta";
    expect(resolveBrandLogoUrl("/img/logo-fortez.svg", pageUrl)).toBe(
      "https://fortez-przyczepy.pl/img/logo-fortez.svg",
    );
    expect(resolveBrandLogoUrl("https://fortez-przyczepy.pl/img/logo-fortez.svg", pageUrl)).toBe(
      "https://fortez-przyczepy.pl/img/logo-fortez.svg",
    );
    expect(resolveBrandLogoUrl("https://cdn.example.test/logo.svg", pageUrl)).toBeNull();
    expect(
      resolveBrandLogoUrl("https://user:secret@fortez-przyczepy.pl/logo.svg", pageUrl),
    ).toBeNull();
    expect(resolveBrandLogoUrl("javascript:alert(1)", pageUrl)).toBeNull();
    expect(resolveBrandLogoUrl("data:image/svg+xml,<svg/>", pageUrl)).toBeNull();
    expect(resolveBrandLogoUrl("http://[::1", pageUrl)).toBeNull();
  });

  it("renders safe tenant branding and keeps close inside the header without restarting", async () => {
    const element = document.createElement("wyceno-widget");
    element.setAttribute("brand-logo-url", "/img/logo-fortez.svg");
    element.setAttribute("brand-name", "Fortez <img src=x onerror=alert(1)>");
    element.setAttribute("brand-subtitle", "Autoryzowany dealer Neptun");
    element.setAttribute("mode", "popup");
    element.setAttribute("public-id", testPublicId);
    document.body.append(element);

    const launcher = element.shadowRoot?.querySelector<HTMLButtonElement>(".wyceno-launcher");
    launcher?.click();
    await new Promise((resolve) => setTimeout(resolve, 20));

    const shadow = element.shadowRoot;
    const logo = shadow?.querySelector<HTMLImageElement>(".wyceno-brand-logo img");
    expect(logo?.src).toBe(new URL("/img/logo-fortez.svg", window.location.href).href);
    expect(logo?.alt).toBe("");
    expect(logo?.crossOrigin).toBe("anonymous");
    expect(logo?.referrerPolicy).toBe("no-referrer");
    expect(shadow?.textContent).toContain("Fortez <img src=x onerror=alert(1)>");
    expect(shadow?.textContent).toContain("Autoryzowany dealer Neptun");
    expect(shadow?.querySelector(".wyceno-brand-copy img")).toBeNull();
    expect(shadow?.querySelector(".wyceno-brand")?.classList).toContain("wyceno-brand--with-logo");

    const close = shadow?.querySelector<HTMLButtonElement>(
      '.wyceno-close[aria-label="Zamknij formularz"]',
    );
    expect(close?.textContent).toBe("×");
    expect(close?.closest(".wyceno-header")).not.toBeNull();
    expect(shadow?.querySelector(".wyceno-dialog > .wyceno-close")).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);

    const pendingChoice = shadow?.querySelector<HTMLInputElement>('input[type="radio"]');
    pendingChoice?.click();
    pendingChoice?.focus();
    expect(pendingChoice?.checked).toBe(true);
    expect(shadow?.activeElement).toBe(pendingChoice);

    element.setAttribute("brand-name", "Nowa organizacja");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(shadow?.textContent).toContain("Nowa organizacja");
    expect(shadow?.querySelector('input[type="radio"]')).toBe(pendingChoice);
    expect(pendingChoice?.checked).toBe(true);
    expect(shadow?.activeElement).toBe(pendingChoice);

    const refreshedLogo = shadow?.querySelector<HTMLImageElement>(".wyceno-brand-logo img");
    refreshedLogo?.dispatchEvent(new Event("error"));
    expect(shadow?.querySelector(".wyceno-brand-logo")).toBeNull();
    expect(shadow?.querySelector(".wyceno-brand-mark")?.textContent).toBe("NO");
    expect(shadow?.querySelector(".wyceno-brand-mark")?.getAttribute("aria-hidden")).toBe("true");
    expect(shadow?.querySelector(".wyceno-brand")?.classList).not.toContain(
      "wyceno-brand--with-logo",
    );
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

  it("retries a failed resume once when repeated online events arrive", async () => {
    const stored: PersistedWidgetSession = {
      analyticsConsent: null,
      answers: { service: "standard" },
      currentStepKey: "location",
      expiresAt: "2099-01-01T00:00:00.000Z",
      history: ["service"],
      manifest: testManifest,
      pending: [],
      publicId: testPublicId,
      revision: 1,
      savedAt: "2026-08-11T18:00:00.000Z",
      token: "c".repeat(64),
      version: 1,
    };
    localStorage.setItem(widgetStorageKey(testPublicId), JSON.stringify(stored));
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("network unavailable"))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            answers: stored.answers,
            currentStepKey: stored.currentStepKey,
            expiresAt: stored.expiresAt,
            manifest: testManifest,
            revision: stored.revision,
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const element = document.createElement("wyceno-widget");
    element.setAttribute("public-id", testPublicId);
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(element.shadowRoot?.textContent).toContain("Brak połączenia");

    for (let index = 0; index < 5; index += 1) window.dispatchEvent(new Event("online"));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(element.shadowRoot?.textContent).toContain("Postęp zapisany");
    expect(element.shadowRoot?.textContent).toContain("Podaj lokalizację");
  });

  it("does not create a new session from an expired state on online", async () => {
    const stored: PersistedWidgetSession = {
      analyticsConsent: null,
      answers: { service: "standard" },
      currentStepKey: "location",
      expiresAt: "2099-01-01T00:00:00.000Z",
      history: ["service"],
      manifest: testManifest,
      pending: [],
      publicId: testPublicId,
      revision: 1,
      savedAt: "2026-08-11T18:00:00.000Z",
      token: "c".repeat(64),
      version: 1,
    };
    localStorage.setItem(widgetStorageKey(testPublicId), JSON.stringify(stored));
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "SESSION_EXPIRED", message: "raw" } }), {
        headers: { "Content-Type": "application/json" },
        status: 410,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const element = document.createElement("wyceno-widget");
    element.setAttribute("public-id", testPublicId);
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(element.shadowRoot?.textContent).toContain("Ta sesja wygasła");

    for (let index = 0; index < 5; index += 1) window.dispatchEvent(new Event("online"));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(element.shadowRoot?.textContent).toContain("Ta sesja wygasła");
  });

  it("keeps a local submit authoritative when a storage event arrives in flight", async () => {
    const stored: PersistedWidgetSession = {
      analyticsConsent: null,
      answers: { location: "Gdańsk", service: "standard" },
      currentStepKey: null,
      expiresAt: "2099-01-01T00:00:00.000Z",
      history: ["service", "location"],
      manifest: testManifest,
      pending: [],
      publicId: testPublicId,
      revision: 2,
      savedAt: "2026-08-11T18:00:00.000Z",
      token: "c".repeat(64),
      version: 1,
    };
    const key = widgetStorageKey(testPublicId);
    localStorage.setItem(key, JSON.stringify(stored));
    let resolveSubmit!: (response: Response) => void;
    const submitRequests: string[] = [];
    const resumeRequests: string[] = [];
    const fetchMock = vi.fn<typeof fetch>((input, init) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (url.pathname.endsWith("/sessions/current") && method === "GET") {
        resumeRequests.push(url.pathname);
        return Promise.resolve(
          new Response(
            JSON.stringify({
              answers: stored.answers,
              currentStepKey: stored.currentStepKey,
              expiresAt: stored.expiresAt,
              manifest: testManifest,
              revision: stored.revision,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          ),
        );
      }
      if (url.pathname.endsWith("/sessions/current/result") && method === "GET") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              disclaimer: "To nie jest oferta.",
              headline: "Dziękujemy",
              nextStepLabel: "Skontaktujemy się po przesłaniu danych.",
              pricing: null,
            }),
            { headers: { "Content-Type": "application/json" }, status: 200 },
          ),
        );
      }
      if (url.pathname.endsWith("/sessions/current/submit") && method === "POST") {
        submitRequests.push(url.pathname);
        return new Promise<Response>((resolve) => {
          resolveSubmit = resolve;
        });
      }
      return Promise.reject(new Error(`Unexpected test request: ${method} ${url.pathname}`));
    });
    vi.stubGlobal("fetch", fetchMock);

    const element = document.createElement("wyceno-widget");
    element.setAttribute("public-id", testPublicId);
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const contactForm = element.shadowRoot?.querySelector<HTMLFormElement>(".wyceno-contact-form");
    const email = contactForm?.querySelector<HTMLInputElement>("#wyceno-contact-email");
    const privacy = contactForm?.querySelector<HTMLInputElement>("#wyceno-privacy-notice");
    expect(contactForm).not.toBeNull();
    expect(email).not.toBeNull();
    expect(privacy).not.toBeNull();
    if (!contactForm || !email || !privacy) return;
    email.value = "klient@example.test";
    email.dispatchEvent(new Event("input", { bubbles: true }));
    privacy.checked = true;
    privacy.dispatchEvent(new Event("change", { bubbles: true }));
    contactForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    for (let index = 0; index < 20; index += 1) {
      const inFlightRaw = JSON.stringify({
        ...stored,
        savedAt: `2026-08-11T18:00:${String(index + 1).padStart(2, "0")}.000Z`,
      });
      localStorage.setItem(key, inFlightRaw);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: inFlightRaw }));
    }
    await Promise.resolve();
    expect(submitRequests).toHaveLength(1);
    expect(resumeRequests).toHaveLength(1);

    resolveSubmit(
      new Response(
        JSON.stringify({
          leadPublicId: "e0000000-0000-4000-8000-000000000001",
          submittedAt: "2026-08-11T18:00:02.000Z",
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 },
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: JSON.stringify({ ...stored, savedAt: "2026-08-11T18:00:03.000Z" }),
      }),
    );
    await Promise.resolve();

    expect(submitRequests).toHaveLength(1);
    expect(resumeRequests).toHaveLength(1);
    expect(element.shadowRoot?.textContent).toContain("Zapytanie zostało wysłane");
    expect(element.shadowRoot?.querySelector(".wyceno-contact-form")).toBeNull();
    expect(element.shadowRoot?.querySelector('input[type="file"]')).toBeNull();
  });

  it("clears contact PII, consents and files before restarting an expired session", async () => {
    const stored: PersistedWidgetSession = {
      analyticsConsent: null,
      answers: { location: "Gdańsk", service: "standard" },
      currentStepKey: null,
      expiresAt: "2099-01-01T00:00:00.000Z",
      history: ["service", "location"],
      manifest: testManifest,
      pending: [],
      publicId: testPublicId,
      revision: 2,
      savedAt: "2026-08-11T18:00:00.000Z",
      token: "c".repeat(64),
      version: 1,
    };
    localStorage.setItem(widgetStorageKey(testPublicId), JSON.stringify(stored));
    let revision = 2;
    let uploadRequests = 0;
    let submitRequests = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input));
      const method = init?.method ?? "GET";
      if (url.pathname.endsWith("/sessions/current") && method === "GET") {
        return new Response(
          JSON.stringify({
            answers: stored.answers,
            currentStepKey: null,
            expiresAt: stored.expiresAt,
            manifest: testManifest,
            revision,
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      }
      if (url.pathname.endsWith("/sessions/current/result") && method === "GET") {
        return new Response(
          JSON.stringify({
            disclaimer: "To nie jest oferta.",
            headline: "Dziękujemy",
            nextStepLabel: "Skontaktujemy się po przesłaniu danych.",
            pricing: null,
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 },
        );
      }
      if (url.pathname.endsWith("/sessions/current/files") && method === "POST") {
        uploadRequests += 1;
        return new Response(
          JSON.stringify({ error: { code: "SESSION_EXPIRED", message: "raw PII detail" } }),
          { headers: { "Content-Type": "application/json" }, status: 410 },
        );
      }
      if (url.pathname.endsWith("/sessions") && method === "POST") {
        revision = 0;
        return new Response(
          JSON.stringify({
            currentStepKey: testManifest.entryStepKey,
            expiresAt: stored.expiresAt,
            manifest: testManifest,
            revision,
            token: "d".repeat(64),
          }),
          { headers: { "Content-Type": "application/json" }, status: 201 },
        );
      }
      if (method === "PUT") {
        const body = JSON.parse(String(init?.body)) as {
          expectedRevision: number;
          nextStepKey: string | null;
        };
        revision = body.expectedRevision + 1;
        return new Response(JSON.stringify({ currentStepKey: body.nextStepKey, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
      if (url.pathname.endsWith("/sessions/current/submit") && method === "POST") {
        submitRequests += 1;
        return new Response(
          JSON.stringify({
            leadPublicId: "e0000000-0000-4000-8000-000000000001",
            submittedAt: "2026-08-11T18:00:02.000Z",
          }),
          { headers: { "Content-Type": "application/json" }, status: 201 },
        );
      }
      throw new Error(`Unexpected test request: ${method} ${url.pathname}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const element = document.createElement("wyceno-widget");
    element.setAttribute("public-id", testPublicId);
    document.body.append(element);
    await new Promise((resolve) => setTimeout(resolve, 20));

    const initialForm = element.shadowRoot?.querySelector<HTMLFormElement>(".wyceno-contact-form");
    const initialName = initialForm?.querySelector<HTMLInputElement>("#wyceno-contact-name");
    const initialEmail = initialForm?.querySelector<HTMLInputElement>("#wyceno-contact-email");
    const initialPhone = initialForm?.querySelector<HTMLInputElement>("#wyceno-contact-phone");
    const initialFiles = initialForm?.querySelector<HTMLInputElement>("#wyceno-contact-files");
    const initialPrivacy = initialForm?.querySelector<HTMLInputElement>("#wyceno-privacy-notice");
    const initialMarketing =
      initialForm?.querySelector<HTMLInputElement>("#wyceno-marketing-email");
    if (
      !initialForm ||
      !initialName ||
      !initialEmail ||
      !initialPhone ||
      !initialFiles ||
      !initialPrivacy ||
      !initialMarketing
    ) {
      throw new Error("Missing initial contact controls.");
    }
    for (const [input, value] of [
      [initialName, "Jan Kowalski"],
      [initialEmail, "jan@example.test"],
      [initialPhone, "+48 500 600 700"],
    ] as const) {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    Object.defineProperty(initialFiles, "files", {
      configurable: true,
      value: [new File(["%PDF-private"], "projekt.pdf", { type: "application/pdf" })],
    });
    initialFiles.dispatchEvent(new Event("change", { bubbles: true }));
    initialPrivacy.checked = true;
    initialPrivacy.dispatchEvent(new Event("change", { bubbles: true }));
    initialMarketing.checked = true;
    initialMarketing.dispatchEvent(new Event("change", { bubbles: true }));
    initialForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(uploadRequests).toBe(1);
    expect(element.shadowRoot?.textContent).toContain("Ta sesja wygasła");
    element.shadowRoot?.querySelector<HTMLButtonElement>(".wyceno-alert button")?.click();
    await new Promise((resolve) => setTimeout(resolve, 20));

    const serviceForm = element.shadowRoot?.querySelector<HTMLFormElement>(".wyceno-form");
    const service = serviceForm?.querySelector<HTMLInputElement>('input[value="standard"]');
    if (!serviceForm || !service) throw new Error("Missing restarted service step.");
    service.checked = true;
    serviceForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const locationForm = element.shadowRoot?.querySelector<HTMLFormElement>(".wyceno-form");
    const location = locationForm?.querySelector<HTMLInputElement>('input[type="text"]');
    if (!locationForm || !location) throw new Error("Missing restarted location step.");
    location.value = "Warszawa";
    locationForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    const restartedForm =
      element.shadowRoot?.querySelector<HTMLFormElement>(".wyceno-contact-form");
    const restartedName = restartedForm?.querySelector<HTMLInputElement>("#wyceno-contact-name");
    const restartedEmail = restartedForm?.querySelector<HTMLInputElement>("#wyceno-contact-email");
    const restartedPhone = restartedForm?.querySelector<HTMLInputElement>("#wyceno-contact-phone");
    const restartedFiles = restartedForm?.querySelector<HTMLInputElement>("#wyceno-contact-files");
    const restartedPrivacy =
      restartedForm?.querySelector<HTMLInputElement>("#wyceno-privacy-notice");
    const restartedMarketing =
      restartedForm?.querySelector<HTMLInputElement>("#wyceno-marketing-email");
    if (
      !restartedForm ||
      !restartedName ||
      !restartedEmail ||
      !restartedPhone ||
      !restartedFiles ||
      !restartedPrivacy ||
      !restartedMarketing
    ) {
      throw new Error("Missing restarted contact controls.");
    }
    expect(restartedName.value).toBe("");
    expect(restartedEmail.value).toBe("");
    expect(restartedPhone.value).toBe("");
    expect(restartedFiles.files).toHaveLength(0);
    expect(restartedPrivacy.checked).toBe(false);
    expect(restartedMarketing.checked).toBe(false);

    restartedEmail.value = "nowy@example.test";
    restartedEmail.dispatchEvent(new Event("input", { bubbles: true }));
    restartedPrivacy.checked = true;
    restartedPrivacy.dispatchEvent(new Event("change", { bubbles: true }));
    restartedForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(uploadRequests).toBe(1);
    expect(submitRequests).toBe(1);
    expect(element.shadowRoot?.textContent).toContain("Zapytanie zostało wysłane");
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
          key: widgetStorageKey(testPublicId),
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
