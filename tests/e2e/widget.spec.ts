import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.beforeAll(async () => {
  await mkdir("artifacts/redesign/after", { recursive: true });
  await mkdir("artifacts/visual-qa/12s-remaining-screens/after", { recursive: true });
  await mkdir("artifacts/visual-qa/13b-ftz03b-turnstile", { recursive: true });
  await mkdir("artifacts/visual-qa/13f-widget-branding/after", { recursive: true });
  await mkdir("artifacts/visual-qa/13g-widget-inline-guidance/after", { recursive: true });
});

const publicId = "f0000000-0000-4000-8000-000000000001";
const token = "d".repeat(64);
const manifest = {
  challenge: {
    action: "kwotum_lead_submit",
    appearance: "interaction-only",
    provider: "turnstile",
    siteKey: "1x00000000000000000000AA",
  },
  entryStepKey: "service",
  intro: "Odpowiedz na dwa krótkie pytania.",
  leadCapture: {
    filesEnabled: true,
    leadCaptureSchemaVersion: 1,
    marketingEmailConsent: {
      label: "Chcę otrzymywać informacje marketingowe pocztą elektroniczną.",
      textHash: "c".repeat(64),
      version: "marketing-v1",
    },
    privacyNotice: {
      label: "Potwierdzam zapoznanie się z informacją o przetwarzaniu danych.",
      policyUrl: "https://example.test/polityka-prywatnosci",
      textHash: "b".repeat(64),
      version: "privacy-v1",
    },
  },
  manifestVersion: 1,
  publicId,
  publishedAt: "2026-07-24T08:00:00.000Z",
  result: {
    disclaimer: "Wynik jest orientacyjny i nie stanowi oferty.",
    headline: "Dziękujemy za odpowiedzi",
    mode: "consultation",
    nextStepLabel: "Dane kontaktowe zostaną zebrane w kolejnym etapie.",
  },
  rules: [],
  snapshotHash: "a".repeat(64),
  steps: [
    {
      allowUnknown: false,
      description: null,
      key: "service",
      nextStepKey: "location",
      options: [
        {
          key: "standard",
          label: "Wariant standardowy",
          nextStepKey: null,
          overridesNextStep: false,
        },
        {
          key: "premium",
          label: "Wariant premium",
          nextStepKey: null,
          overridesNextStep: false,
        },
      ],
      required: true,
      title: "Jakiej usługi potrzebujesz?",
      type: "single_choice",
    },
    {
      allowUnknown: false,
      description: "Wystarczy miejscowość.",
      key: "location",
      nextStepKey: null,
      options: [],
      required: true,
      title: "Gdzie ma być wykonana usługa?",
      type: "location",
    },
  ],
  title: "Testowy proces wyceny",
};

async function mockWidgetApi(
  page: Page,
  firstSaveOffline = false,
  failFirstChallenge = false,
): Promise<
  Readonly<{
    analyticsEvents: string[];
    resumeRequests: string[];
    sessionRequests: string[];
    submitTokens: string[];
  }>
> {
  let revision = 0;
  let failSave = firstSaveOffline;
  const analyticsEvents: string[] = [];
  const resumeRequests: string[] = [];
  const sessionRequests: string[] = [];
  const submitTokens: string[] = [];
  const answers: Record<string, unknown> = {};
  await page.route("**/turnstile/v0/api.js?render=explicit", async (route) => {
    await route.fulfill({
      body: `(() => {
        const widgets = new Map();
        let nextId = 0;
        let attempts = 0;
        window.turnstile = {
          render: (_container, options) => {
            const id = "e2e-turnstile-" + (++nextId);
            widgets.set(id, options);
            return id;
          },
          execute: (id) => {
            const options = widgets.get(id);
            attempts += 1;
            window.__kwotumTurnstileAttempts = attempts;
            queueMicrotask(() => {
              if (${String(failFirstChallenge)} && attempts === 1) options["expired-callback"]();
              else options.callback("e2e-single-use-token-" + attempts);
            });
          },
          remove: (id) => widgets.delete(id)
        };
      })();`,
      contentType: "application/javascript",
      status: 200,
    });
  });
  await page.route("**/api/v1/public/**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/manifest")) {
      await route.fulfill({ body: JSON.stringify(manifest), contentType: "application/json" });
      return;
    }
    if (url.pathname.endsWith("/sessions") && request.method() === "POST") {
      sessionRequests.push(url.pathname);
      await route.fulfill({
        body: JSON.stringify({
          currentStepKey: "service",
          expiresAt: "2099-01-01T00:00:00.000Z",
          manifest,
          revision,
          token,
        }),
        contentType: "application/json",
        status: 201,
      });
      return;
    }
    if (url.pathname.endsWith("/analytics-consent") && request.method() === "POST") {
      await route.fulfill({
        body: JSON.stringify({
          consentVersion: "analytics-v1",
          granted: request.postDataJSON().granted,
          recordedAt: "2026-07-25T12:00:00.000Z",
        }),
        contentType: "application/json",
      });
      return;
    }
    if (url.pathname.endsWith("/events") && request.method() === "POST") {
      const body = request.postDataJSON() as { name: string };
      analyticsEvents.push(body.name);
      await route.fulfill({
        body: JSON.stringify({ accepted: true }),
        contentType: "application/json",
        status: 202,
      });
      return;
    }
    if (url.pathname.endsWith("/sessions/current") && request.method() === "GET") {
      resumeRequests.push(url.pathname);
      await route.fulfill({
        body: JSON.stringify({
          answers,
          currentStepKey: revision === 0 ? "service" : "location",
          expiresAt: "2099-01-01T00:00:00.000Z",
          manifest,
          revision,
        }),
        contentType: "application/json",
      });
      return;
    }
    if (url.pathname.endsWith("/sessions/current/result") && request.method() === "GET") {
      await route.fulfill({
        body: JSON.stringify({
          disclaimer: "Wynik jest orientacyjny i nie stanowi oferty.",
          headline: "Dziękujemy za odpowiedzi",
          nextStepLabel: "Dane kontaktowe zostaną zebrane w kolejnym etapie.",
          pricing: {
            currency: "PLN",
            formattedMax: "15 000,00 zł",
            formattedMin: "10 000,00 zł",
            maxMinor: 1_500_000,
            minMinor: 1_000_000,
            presentation: "range",
          },
        }),
        contentType: "application/json",
      });
      return;
    }
    if (url.pathname.endsWith("/sessions/current/files") && request.method() === "POST") {
      await route.fulfill({
        body: JSON.stringify({
          fileId: "d0000000-0000-4000-8000-000000000001",
          mimeType: "application/pdf",
          name: "projekt.pdf",
          sizeBytes: 9,
        }),
        contentType: "application/json",
        status: 201,
      });
      return;
    }
    if (url.pathname.endsWith("/sessions/current/submit") && request.method() === "POST") {
      const body = request.postDataJSON() as { challengeToken?: unknown };
      if (typeof body.challengeToken !== "string") {
        await route.fulfill({ body: "{}", status: 422 });
        return;
      }
      submitTokens.push(body.challengeToken);
      await route.fulfill({
        body: JSON.stringify({
          leadPublicId: "e0000000-0000-4000-8000-000000000001",
          submittedAt: "2026-07-25T12:00:00.000Z",
        }),
        contentType: "application/json",
        status: 201,
      });
      return;
    }
    if (request.method() === "PUT") {
      if (failSave) {
        failSave = false;
        await route.abort("internetdisconnected");
        return;
      }
      const body = request.postDataJSON() as {
        answer: unknown;
        expectedRevision: number;
        nextStepKey: string | null;
      };
      const stepKey = url.pathname.split("/").at(-1);
      if (stepKey) answers[stepKey] = body.answer;
      revision = body.expectedRevision + 1;
      await route.fulfill({
        body: JSON.stringify({
          currentStepKey: body.nextStepKey,
          revision,
        }),
        contentType: "application/json",
      });
      return;
    }
    await route.fulfill({ body: "{}", status: 404 });
  });
  return { analyticsEvents, resumeRequests, sessionRequests, submitTokens };
}

test("successful reload resume stays synced and performs one resume request", async ({ page }) => {
  const { resumeRequests, sessionRequests } = await mockWidgetApi(page);
  await page.goto(`/f/${publicId}`);

  const widget = page.locator("wyceno-widget");
  await expect(widget.getByRole("heading", { name: "Testowy proces wyceny" })).toBeVisible();
  await expect(widget.getByText("Postęp zapisany.")).toBeVisible();
  expect(sessionRequests).toHaveLength(1);

  await page.reload();

  await expect(widget.getByRole("heading", { name: "Testowy proces wyceny" })).toBeVisible();
  await expect(widget.getByText("Postęp zapisany.")).toBeVisible();
  await page.waitForTimeout(1_000);
  expect(sessionRequests).toHaveLength(1);
  expect(resumeRequests).toHaveLength(1);
});

test("hosted flow works by keyboard, survives network loss and passes axe", async ({ page }) => {
  const { analyticsEvents } = await mockWidgetApi(page, true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`/f/${publicId}`);

  const widget = page.locator("wyceno-widget");
  await expect(widget.getByRole("heading", { name: "Testowy proces wyceny" })).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "artifacts/redesign/after/widget-inline-390.png",
  });
  await page.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-question-390x844.png",
  });
  await widget.getByRole("button", { exact: true, name: "Zgadzam się" }).click();
  await widget.getByLabel("Wariant standardowy").check();
  await widget.getByRole("button", { name: "Dalej" }).click();
  await expect(widget.getByText("Brak połączenia")).toBeVisible();
  await expect(widget.getByRole("group", { name: "Gdzie ma być wykonana usługa?" })).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  await expect(widget.getByText("Postęp zapisany.")).toBeVisible();
  await widget.getByRole("textbox").fill("Gdańsk");
  await widget.getByRole("button", { name: "Dalej" }).click();
  await expect(widget.getByRole("heading", { name: "Dziękujemy za odpowiedzi" })).toBeVisible();
  await expect(widget.getByText("10 000,00 zł–15 000,00 zł")).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-result-390x-full.png",
  });
  await widget.getByLabel("E-mail").fill("klient@example.test");
  await widget.getByLabel(/Załączniki/).setInputFiles({
    buffer: Buffer.from("%PDF-test"),
    mimeType: "application/pdf",
    name: "projekt.pdf",
  });
  await widget.getByLabel(/Potwierdzam zapoznanie/).check();
  await widget.getByRole("button", { name: "Wyślij zapytanie" }).click();
  await expect(widget.getByRole("heading", { name: "Zapytanie zostało wysłane" })).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "artifacts/redesign/after/widget-success-390.png",
  });
  await expect
    .poll(() => analyticsEvents)
    .toEqual(
      expect.arrayContaining([
        "widget_loaded",
        "flow_started",
        "step_viewed",
        "step_answered",
        "result_viewed",
        "contact_started",
        "file_uploaded",
        "lead_submitted",
      ]),
    );
  await expect
    .poll(() => ({
      leads: analyticsEvents.filter((name) => name === "lead_submitted").length,
      loaded: analyticsEvents.filter((name) => name === "widget_loaded").length,
      results: analyticsEvents.filter((name) => name === "result_viewed").length,
      starts: analyticsEvents.filter((name) => name === "flow_started").length,
    }))
    .toEqual({ leads: 1, loaded: 1, results: 1, starts: 1 });

  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  await page.setViewportSize({ height: 800, width: 320 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  const narrowOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(narrowOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-forced-colors-320x-full.png",
  });
});

test("expired Turnstile token is not submitted and retry obtains a fresh token", async ({
  page,
}) => {
  const { submitTokens } = await mockWidgetApi(page, false, true);
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto(`/f/${publicId}`);

  const widget = page.locator("wyceno-widget");
  await widget.getByRole("button", { exact: true, name: "Nie zgadzam się" }).click();
  await widget.getByLabel("Wariant standardowy").check();
  await widget.getByRole("button", { name: "Dalej" }).click();
  await widget.getByRole("textbox").fill("Gdańsk");
  await widget.getByRole("button", { name: "Dalej" }).click();
  await widget.getByLabel("E-mail").fill("klient@example.test");
  await widget.getByLabel(/Potwierdzam zapoznanie/).check();
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "artifacts/visual-qa/13b-ftz03b-turnstile/before-mobile-390x844.png",
  });
  await widget.getByRole("button", { name: "Wyślij zapytanie" }).click();

  await expect(widget.getByRole("alert")).toContainText("Potwierdzenie bezpieczeństwa wygasło");
  expect(submitTokens).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: "artifacts/visual-qa/13b-ftz03b-turnstile/retry-mobile-390x844.png",
  });

  await widget.getByRole("button", { name: "Wyślij zapytanie" }).click();
  await expect(widget.getByRole("heading", { name: "Zapytanie zostało wysłane" })).toBeVisible();
  expect(submitTokens).toEqual(["e2e-single-use-token-2"]);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __kwotumTurnstileAttempts?: number })
            .__kwotumTurnstileAttempts,
      ),
    )
    .toBe(2);
});

test("hosted widget fills the desktop surface and preserves the result hierarchy", async ({
  page,
}) => {
  await mockWidgetApi(page);
  await page.setViewportSize({ height: 960, width: 1_536 });
  await page.goto(`/f/${publicId}`);

  const widget = page.locator("wyceno-widget");
  await expect(widget.getByRole("heading", { name: "Testowy proces wyceny" })).toBeVisible();
  const initialGeometry = await widget.locator(".wyceno-shell").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      height: rect.height,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      width: rect.width,
    };
  });
  expect(initialGeometry.width).toBeGreaterThanOrEqual(1_060);
  expect(initialGeometry.height).toBeGreaterThanOrEqual(700);
  expect(initialGeometry.overflow).toBeLessThanOrEqual(1);
  await page.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-question-1536x960.png",
  });
  await page.setViewportSize({ height: 900, width: 1_440 });
  await page.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-question-1440x900.png",
  });

  await widget.getByRole("button", { exact: true, name: "Zgadzam się" }).click();
  await widget.getByLabel("Wariant standardowy").check();
  await widget.getByRole("button", { name: "Dalej" }).click();
  await expect(widget.getByRole("group", { name: "Gdzie ma być wykonana usługa?" })).toBeVisible();
  await expect(widget.getByText("Postęp zapisany.")).toBeVisible();
  const locationInput = widget.getByRole("textbox");
  await locationInput.fill("Gdańsk");
  await expect(locationInput).toHaveValue("Gdańsk");
  await widget.getByRole("button", { name: "Dalej" }).click();
  await expect(widget.getByRole("heading", { name: "Dziękujemy za odpowiedzi" })).toBeVisible();
  await expect(widget.getByText("10 000,00 zł–15 000,00 zł")).toBeVisible();
  await expect(widget.locator(".wyceno-answer-summary dt")).toHaveCount(2);
  await expect(widget.locator(".wyceno-answer-summary dd")).toContainText([
    "Wariant standardowy",
    "Gdańsk",
  ]);
  await page.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-result-1440x900.png",
  });
  await page.setViewportSize({ height: 960, width: 1_536 });
  await page.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/12s-remaining-screens/after/widget-result-1536x960.png",
  });
});

test("popup without embed branding preserves the default Kwotum fallback", async ({ page }) => {
  const { sessionRequests } = await mockWidgetApi(page);
  await page.goto("/design-system");
  await page.evaluate(
    ({ id }) => {
      localStorage.clear();
      const script = document.createElement("script");
      script.type = "module";
      script.src = "/widget/v1/loader.js";
      document.head.append(script);
      const widget = document.createElement("wyceno-widget");
      widget.setAttribute("mode", "popup");
      widget.setAttribute("public-id", id);
      document.body.append(widget);
    },
    { id: publicId },
  );

  const widget = page.locator("wyceno-widget");
  const launcher = widget.getByRole("button", { name: "Rozpocznij wycenę" });
  await launcher.click();
  await expect(widget.getByRole("dialog")).toBeVisible();
  await expect(widget.getByRole("heading", { name: "Testowy proces wyceny" })).toBeVisible();
  await expect(widget.locator(".wyceno-brand-mark")).toHaveText("TP");
  await expect(widget.locator(".wyceno-brand-logo")).toHaveCount(0);
  await expect(widget.getByRole("button", { name: "Dalej" })).toHaveCSS(
    "background-color",
    "rgb(11, 96, 72)",
  );
  await expect(widget.getByRole("button", { name: "Zamknij formularz" })).toHaveCount(1);
  await expect.poll(() => sessionRequests).toHaveLength(1);
});

test("popup is isolated from hostile host CSS and returns focus on close", async ({ page }) => {
  const { sessionRequests } = await mockWidgetApi(page);
  let unexpectedThemeRequests = 0;
  await page.route("https://tracker.example.test/**", async (route) => {
    unexpectedThemeRequests += 1;
    await route.abort("blockedbyclient");
  });
  await page.route("**/test-assets/fortez-logo.svg", async (route) => {
    await route.fulfill({
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 88"><rect width="14" height="88" fill="#ff6a13"/><text x="30" y="61" fill="#171a1b" font-family="Arial,sans-serif" font-size="52" font-weight="900">FORTEZ</text></svg>',
      contentType: "image/svg+xml",
      status: 200,
    });
  });
  await page.goto("/design-system");
  await page.addStyleTag({
    content:
      "body button { background: hotpink !important; color: transparent !important; font-size: 1px !important }",
  });
  await page.evaluate(
    ({ id }) => {
      localStorage.clear();
      const script = document.createElement("script");
      script.type = "module";
      script.src = "/widget/v1/loader.js";
      document.head.append(script);
      const widget = document.createElement("wyceno-widget");
      widget.setAttribute("brand-logo-url", "/test-assets/fortez-logo.svg");
      widget.setAttribute("brand-name", "Fortez");
      widget.setAttribute("brand-subtitle", "Autoryzowany dealer Neptun");
      widget.setAttribute("mode", "popup");
      widget.setAttribute("public-id", id);
      widget.style.setProperty("--wyceno-widget-font-family", "Arial, Helvetica, sans-serif");
      widget.style.setProperty(
        "--wyceno-widget-heading-font-family",
        "Arial, Helvetica, sans-serif",
      );
      widget.style.setProperty("--wyceno-widget-heading-font-weight", "500");
      widget.style.setProperty("--wyceno-widget-heading-letter-spacing", "-0.02em");
      widget.style.setProperty("--wyceno-widget-primary", "#ff6a13");
      widget.style.setProperty("--wyceno-widget-primary-hover", "#ff7a2d");
      widget.style.setProperty("--wyceno-widget-primary-text", "#111111");
      widget.style.setProperty("--wyceno-widget-accent-text", "#bd4308");
      widget.style.setProperty("--wyceno-widget-primary-soft", "#fff4e9");
      widget.style.setProperty("--wyceno-widget-text", "#171a1b");
      widget.style.setProperty("--wyceno-widget-muted", "#69706e");
      widget.style.setProperty("--wyceno-widget-soft", "#f1f3f2");
      widget.style.setProperty("--wyceno-widget-border", "#d5d9d7");
      widget.style.setProperty("--wyceno-widget-border-strong", "#b9bfbc");
      widget.style.setProperty("--wyceno-widget-secondary-border", "#171a1b");
      widget.style.setProperty("--wyceno-widget-control-radius", "0px");
      widget.style.setProperty("--wyceno-widget-panel-radius", "0px");
      widget.style.setProperty("--wyceno-widget-symbol-radius", "0px");
      widget.style.setProperty("--wyceno-widget-panel-shadow", "none");
      widget.style.setProperty("--wyceno-widget-backdrop", "rgb(23 26 27 / 72%)");
      widget.style.setProperty("--wyceno-launcher-background-color", "#ff6a13");
      widget.style.setProperty("--wyceno-launcher-border-color", "#ff6a13");
      widget.style.setProperty("--wyceno-launcher-hover-background-color", "#ff7a2d");
      widget.style.setProperty("--wyceno-launcher-hover-border-color", "#ff7a2d");
      widget.style.setProperty("--wyceno-launcher-text-color", "#111111");
      widget.style.setProperty("--wyceno-launcher-border-radius", "0px");
      widget.style.setProperty("--wyceno-launcher-ring-color", "rgb(255 106 19 / 32%)");
      document.body.append(widget);
    },
    { id: publicId },
  );

  const widget = page.locator("wyceno-widget");
  const launcher = widget.getByRole("button", { name: "Rozpocznij wycenę" });
  await expect(launcher).toBeVisible();
  await expect(launcher).toHaveCSS("color", "rgb(17, 17, 17)");
  await expect(launcher).toHaveCSS("background-color", "rgb(255, 106, 19)");
  await expect(launcher).toHaveCSS("border-color", "rgb(255, 106, 19)");
  await expect(launcher).toHaveCSS("border-radius", "0px");
  await page.waitForTimeout(100);
  expect(sessionRequests).toEqual([]);
  expect(
    await page.evaluate(({ id }) => localStorage.getItem(`wyceno:widget:v1:${id}`), {
      id: publicId,
    }),
  ).toBeNull();
  await launcher.click();
  await expect(widget.getByRole("dialog")).toBeVisible();
  await expect(widget.getByRole("heading", { name: "Testowy proces wyceny" })).toBeVisible();
  await expect(
    widget.locator('.wyceno-brand-logo img[src$="/test-assets/fortez-logo.svg"]'),
  ).toBeVisible();
  await expect(widget.locator(".wyceno-brand-mark")).toHaveCount(0);
  await expect(widget.locator(".wyceno-brand-copy strong")).toHaveText("Fortez");
  await expect(widget.locator(".wyceno-brand-copy small")).toHaveText("Autoryzowany dealer Neptun");
  const primary = widget.getByRole("button", { name: "Dalej" });
  await expect(primary).toHaveCSS("background-color", "rgb(255, 106, 19)");
  await expect(primary).toHaveCSS("color", "rgb(17, 17, 17)");
  await expect(primary).toHaveCSS("border-radius", "0px");
  const headingFamily = await widget
    .locator("legend")
    .evaluate((element) => getComputedStyle(element).fontFamily.replaceAll('"', ""));
  expect(headingFamily).toBe("Arial, Helvetica, sans-serif");
  await expect(widget.locator("legend")).toHaveCSS("font-weight", "500");
  await expect.poll(() => sessionRequests).toHaveLength(1);
  expect(
    await page.evaluate(({ id }) => localStorage.getItem(`wyceno:widget:v1:${id}`), {
      id: publicId,
    }),
  ).not.toBeNull();
  await page.screenshot({
    animations: "disabled",
    fullPage: false,
    path: "artifacts/visual-qa/13f-widget-branding/after/widget-fortez-popup-1440.png",
  });
  const chrome = await widget.locator(".wyceno-header").evaluate((header) => {
    const close = header.querySelector<HTMLElement>(".wyceno-close");
    const sync = header.querySelector<HTMLElement>(".wyceno-sync");
    if (!close || !sync) throw new Error("Missing branded dialog controls");
    const closeRect = close.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const syncRect = sync.getBoundingClientRect();
    return {
      closeHeight: closeRect.height,
      closeInsideHeader: closeRect.top >= headerRect.top && closeRect.bottom <= headerRect.bottom,
      closeWidth: closeRect.width,
      overlapsSync:
        closeRect.left < syncRect.right &&
        closeRect.right > syncRect.left &&
        closeRect.top < syncRect.bottom &&
        closeRect.bottom > syncRect.top,
    };
  });
  expect(chrome).toEqual({
    closeHeight: 42,
    closeInsideHeader: true,
    closeWidth: 42,
    overlapsSync: false,
  });
  await page.keyboard.press("Escape");
  await expect(widget.getByRole("dialog")).not.toBeVisible();
  await expect(launcher).toBeFocused();

  await launcher.click();
  await expect(widget.getByRole("dialog")).toBeVisible();
  expect(sessionRequests).toHaveLength(1);
  const close = widget.getByRole("button", { name: "Zamknij formularz" });
  await close.click();
  await expect(widget.getByRole("dialog")).not.toBeVisible();
  await expect(launcher).toBeFocused();

  await page.setViewportSize({ height: 844, width: 390 });
  await launcher.click();
  await expect(widget.getByRole("dialog")).toBeVisible();
  expect(sessionRequests).toHaveLength(1);
  const mobileGeometry = await widget.getByRole("dialog").evaluate((dialog) => {
    const choices = Array.from(dialog.querySelectorAll<HTMLElement>(".wyceno-choice"));
    const close = dialog.querySelector<HTMLElement>(".wyceno-close");
    const logo = dialog.querySelector<HTMLElement>(".wyceno-brand-logo");
    const sync = dialog.querySelector<HTMLElement>(".wyceno-sync");
    if (choices.length < 2 || !close || !logo || !sync) {
      throw new Error("Missing mobile branded controls");
    }
    const first = choices[0].getBoundingClientRect();
    const second = choices[1].getBoundingClientRect();
    const closeRect = close.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const syncRect = sync.getBoundingClientRect();
    return {
      choicesAreSingleColumn: Math.abs(first.left - second.left) < 1 && second.top >= first.bottom,
      closeHeight: closeRect.height,
      closeWidth: closeRect.width,
      hasHorizontalOverflow: dialog.scrollWidth > dialog.clientWidth,
      logoWidth: logoRect.width,
      overlapsSync:
        closeRect.left < syncRect.right &&
        closeRect.right > syncRect.left &&
        closeRect.top < syncRect.bottom &&
        closeRect.bottom > syncRect.top,
    };
  });
  expect(mobileGeometry).toEqual({
    choicesAreSingleColumn: true,
    closeHeight: 42,
    closeWidth: 42,
    hasHorizontalOverflow: false,
    logoWidth: 122,
    overlapsSync: false,
  });
  const accessibility = await new AxeBuilder({ page }).include("wyceno-widget").analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    fullPage: false,
    path: "artifacts/visual-qa/13f-widget-branding/after/widget-fortez-popup-390x844.png",
  });

  await page.setViewportSize({ height: 800, width: 320 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await widget.evaluate((element) => {
    element.setAttribute("brand-name", "F".repeat(120));
    element.setAttribute("brand-subtitle", "S".repeat(160));
    document.documentElement.style.fontSize = "32px";
  });
  const narrowGeometry = await widget.getByRole("dialog").evaluate((dialog) => {
    const close = dialog.querySelector<HTMLElement>(".wyceno-close");
    const copy = dialog.querySelector<HTMLElement>(".wyceno-brand-copy");
    const heading = dialog.querySelector<HTMLElement>("h1");
    if (!close || !copy || !heading) throw new Error("Missing narrow branded controls");
    const closeRect = close.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    return {
      brandOverlapsClose:
        copyRect.left < closeRect.right &&
        copyRect.right > closeRect.left &&
        copyRect.top < closeRect.bottom &&
        copyRect.bottom > closeRect.top,
      dialogOverflow: dialog.scrollWidth - dialog.clientWidth,
      headingOverflow: heading.scrollWidth - heading.clientWidth,
    };
  });
  expect(narrowGeometry).toEqual({
    brandOverlapsClose: false,
    dialogOverflow: 0,
    headingOverflow: 0,
  });
  await page.screenshot({
    animations: "disabled",
    fullPage: false,
    path: "artifacts/visual-qa/13f-widget-branding/after/widget-fortez-popup-320x800-forced-colors.png",
  });

  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await widget.evaluate((element) => {
    document.documentElement.style.fontSize = "";
    element.style.setProperty(
      "--wyceno-widget-primary",
      "url(https://tracker.example.test/primary.png)",
    );
    element.style.setProperty(
      "--wyceno-widget-backdrop",
      "url(https://tracker.example.test/backdrop.png)",
    );
  });
  const constrainedColors = await widget.getByRole("dialog").evaluate((dialog) => ({
    backdropImage: getComputedStyle(dialog, "::backdrop").backgroundImage,
    primaryImage: getComputedStyle(
      dialog.querySelector<HTMLElement>(".wyceno-primary") as HTMLElement,
    ).backgroundImage,
  }));
  expect(constrainedColors).toEqual({ backdropImage: "none", primaryImage: "none" });
  await page.waitForTimeout(100);
  expect(unexpectedThemeRequests).toBe(0);

  await widget.getByRole("button", { name: "Zamknij formularz" }).click();
  await expect(launcher).toBeFocused();

  await page.setViewportSize({ height: 1000, width: 1440 });
  await widget.evaluate((element) => {
    element.style.setProperty("--wyceno-widget-primary", "#ff6a13");
    element.style.setProperty("--wyceno-widget-primary-hover", "#ff7a2d");
    element.style.setProperty("--wyceno-widget-backdrop", "rgb(23 26 27 / 72%)");
    element.setAttribute("brand-name", "Fortez");
    element.setAttribute("brand-subtitle", "6 pytań · około 2 min");
    element.setAttribute("inline-layout", "integrated");
    element.style.setProperty("--wyceno-widget-color-scheme", "dark");
    element.style.setProperty("--wyceno-widget-surface", "#171a1b");
    element.style.setProperty("--wyceno-widget-soft", "#222728");
    element.style.setProperty("--wyceno-widget-text", "#f4f5f4");
    element.style.setProperty("--wyceno-widget-muted", "#a9afad");
    element.style.setProperty("--wyceno-widget-border", "#394041");
    element.style.setProperty("--wyceno-widget-border-strong", "#727a77");
    element.style.setProperty("--wyceno-widget-secondary-border", "#727a77");
    element.style.setProperty("--wyceno-widget-primary-soft", "#382317");
    element.style.setProperty("--wyceno-widget-accent-text", "#ff8a4a");
    element.style.setProperty("--wyceno-widget-error", "#ff9b9e");
    element.setAttribute("mode", "inline");
    document.body.style.background = "#171a1b";
  });
  const inlineCard = widget.locator(".wyceno-card");
  const inlinePrimary = widget.getByRole("button", { name: "Dalej" });
  await expect(inlineCard).toBeVisible();
  await expect(inlineCard).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(widget.locator(".wyceno-brand")).toHaveCSS("display", "none");
  await expect(widget.locator(".wyceno-introduction")).toHaveCount(0);
  await expect(inlinePrimary).toBeDisabled();
  await expect(widget.getByText("Wybierz lub wpisz odpowiedź, aby przejść dalej.")).toBeVisible();
  await widget.getByRole("radio").first().check();
  await expect(inlinePrimary).toBeEnabled();
  await expect(widget.getByText("Gotowe — przejdź do następnego kroku.")).toBeVisible();
  await widget.evaluate((element) => element.scrollIntoView({ block: "start" }));
  const inlineGeometry = await inlineCard.evaluate((card) => {
    const actions = card.querySelector<HTMLElement>(".wyceno-actions");
    const analytics = card.querySelector<HTMLElement>(".wyceno-analytics");
    const choices = card.querySelector<HTMLElement>(".wyceno-choices");
    if (!actions || !analytics || !choices) throw new Error("Missing inline guidance controls");
    const actionsRect = actions.getBoundingClientRect();
    const analyticsRect = analytics.getBoundingClientRect();
    const choicesRect = choices.getBoundingClientRect();
    return {
      actionGap: Math.round(actionsRect.top - choicesRect.bottom),
      analyticsAfterAction: analyticsRect.top >= actionsRect.bottom,
      cardHeight: Math.round(card.getBoundingClientRect().height),
      horizontalOverflow: card.scrollWidth - card.clientWidth,
    };
  });
  expect(inlineGeometry.actionGap).toBeLessThanOrEqual(64);
  expect(inlineGeometry.analyticsAfterAction).toBe(true);
  expect(inlineGeometry.cardHeight).toBeLessThan(720);
  expect(inlineGeometry.horizontalOverflow).toBe(0);
  await inlineCard.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/13h-widget-inline-integrated/after/widget-inline-integrated-1440.png",
  });

  await page.setViewportSize({ height: 844, width: 390 });
  await widget.evaluate((element) => element.scrollIntoView({ block: "start" }));
  const inlineMobileGeometry = await inlineCard.evaluate((card) => {
    const actions = card.querySelector<HTMLElement>(".wyceno-actions");
    const guidance = card.querySelector<HTMLElement>(".wyceno-step-guidance");
    if (!actions || !guidance) throw new Error("Missing mobile inline guidance controls");
    const actionsRect = actions.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    return {
      actionsInsideCard: actionsRect.left >= cardRect.left && actionsRect.right <= cardRect.right,
      cardOverflow: card.scrollWidth - card.clientWidth,
      guidanceOverflow: guidance.scrollWidth - guidance.clientWidth,
    };
  });
  expect(inlineMobileGeometry).toEqual({
    actionsInsideCard: true,
    cardOverflow: 0,
    guidanceOverflow: 0,
  });
  const inlineAccessibility = await new AxeBuilder({ page }).include("wyceno-widget").analyze();
  expect(inlineAccessibility.violations).toEqual([]);
  await inlineCard.screenshot({
    animations: "disabled",
    path: "artifacts/visual-qa/13h-widget-inline-integrated/after/widget-inline-integrated-390x844.png",
  });
});
