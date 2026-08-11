import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.beforeAll(async () => {
  await mkdir("artifacts/redesign/after", { recursive: true });
  await mkdir("artifacts/visual-qa/12s-remaining-screens/after", { recursive: true });
  await mkdir("artifacts/visual-qa/13b-ftz03b-turnstile", { recursive: true });
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

test("popup is isolated from hostile host CSS and returns focus on close", async ({ page }) => {
  const { sessionRequests } = await mockWidgetApi(page);
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
      widget.setAttribute("mode", "popup");
      widget.setAttribute("public-id", id);
      widget.style.setProperty("--wyceno-launcher-background-color", "#b84000");
      widget.style.setProperty("--wyceno-launcher-border-color", "#873000");
      widget.style.setProperty("--wyceno-launcher-border-radius", "0px");
      widget.style.setProperty("--wyceno-launcher-ring-color", "#f3a36e");
      document.body.append(widget);
    },
    { id: publicId },
  );

  const widget = page.locator("wyceno-widget");
  const launcher = widget.getByRole("button", { name: "Rozpocznij wycenę" });
  await expect(launcher).toBeVisible();
  await expect(launcher).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(launcher).toHaveCSS("background-color", "rgb(184, 64, 0)");
  await expect(launcher).toHaveCSS("border-color", "rgb(135, 48, 0)");
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
  await expect.poll(() => sessionRequests).toHaveLength(1);
  expect(
    await page.evaluate(({ id }) => localStorage.getItem(`wyceno:widget:v1:${id}`), {
      id: publicId,
    }),
  ).not.toBeNull();
  await page.screenshot({
    animations: "disabled",
    fullPage: false,
    path: "artifacts/redesign/after/widget-popup-1440.png",
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
});
