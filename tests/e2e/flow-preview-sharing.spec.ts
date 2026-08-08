import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const organizationId = process.env.PANEL_E2E_ORGANIZATION_ID;
const panelEmail = process.env.PANEL_E2E_EMAIL;
const panelPassword = process.env.PANEL_E2E_PASSWORD;
const flowId = process.env.PANEL_E2E_FLOW_ID;
const artifactDirectory = path.resolve("artifacts/visual-qa/12zh-flow-preview-sharing");

async function signIn(page: Page) {
  if (!organizationId || !panelEmail || !panelPassword) {
    throw new Error("Brak danych lokalnego konta panel E2E.");
  }
  await page.goto(`/logowanie?next=/panel/${organizationId}`);
  await page.getByLabel("Adres e-mail").fill(panelEmail);
  await page.getByLabel("Hasło", { exact: true }).fill(panelPassword);
  await page.getByRole("button", { exact: true, name: "Zaloguj się" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(`/panel/${organizationId}`));
}

async function completePreview(page: Page) {
  const widget = page.locator("wyceno-widget");
  await expect(widget).toContainText("Tryb podglądu");

  for (let index = 0; index < 24; index += 1) {
    const completed = widget.getByRole("heading", { name: "Podgląd formularza zakończony" });
    if (await completed.isVisible()) return;

    const finish = widget.getByRole("button", { exact: true, name: "Zakończ podgląd" });
    if (await finish.isVisible()) {
      await widget.getByLabel("E-mail", { exact: true }).fill("preview@example.test");
      await widget.locator('.wyceno-contact input[type="checkbox"][required]').check();
      await finish.click();
      continue;
    }

    const next = widget.getByRole("button", { exact: true, name: "Dalej" });
    if (!(await next.isVisible())) {
      await page.waitForTimeout(50);
      continue;
    }
    const form = widget.locator(".wyceno-form");
    const radios = form.locator('input[type="radio"]');
    const checkboxes = form.locator('input[type="checkbox"]');
    const textarea = form.locator("textarea");
    const field = form.locator('input[name="answer"]:not([type="radio"]):not([type="checkbox"])');
    if ((await radios.count()) > 0) await radios.first().check();
    else if ((await checkboxes.count()) > 0) await checkboxes.first().check();
    else if ((await textarea.count()) > 0) await textarea.fill("Zakres testowy procesu");
    else if ((await field.count()) > 0) {
      const type = await field.first().getAttribute("type");
      await field
        .first()
        .fill(type === "date" ? "2026-09-01" : type === "number" ? "1000" : "Warszawa");
    }
    await next.click();
  }

  throw new Error("Podgląd nie zakończył procesu w limicie 24 kroków.");
}

test("published flow preview is network-free and responsive", async ({ page }) => {
  test.skip(
    !organizationId || !panelEmail || !panelPassword || !flowId,
    "Lokalny test panelu wymaga PANEL_E2E_*.",
  );
  await mkdir(artifactDirectory, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page);

  const publicApiRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/public/")) publicApiRequests.push(request.url());
  });

  await page.setViewportSize({ height: 1_000, width: 1_440 });
  await page.goto(`/panel/${organizationId}/procesy/${flowId}/instalacja`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Podgląd i udostępnianie" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pełny podgląd klienta" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wyślij klientowi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Historia wysyłki" })).toBeVisible();
  await completePreview(page);
  expect(publicApiRequests).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: path.join(artifactDirectory, "desktop-1440x1000.png"),
  });

  await page.setViewportSize({ height: 844, width: 390 });
  await page.getByRole("button", { exact: true, name: "Telefon" }).click();
  await expect(page.locator(".flow-live-preview__stage")).toHaveClass(/is-mobile/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: path.join(artifactDirectory, "mobile-390x844.png"),
  });
});
