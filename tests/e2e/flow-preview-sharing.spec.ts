import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  expectSegmentedControlVisualContract,
  readSegmentedControlGeometry,
} from "./panel-segmented.shared";

const organizationId = process.env.PANEL_E2E_ORGANIZATION_ID;
const panelEmail = process.env.PANEL_E2E_EMAIL;
const panelPassword = process.env.PANEL_E2E_PASSWORD;
const flowId = process.env.PANEL_E2E_FLOW_ID;
const artifactRoot = process.env.PANEL_E2E_ARTIFACT_ROOT
  ? path.resolve(process.env.PANEL_E2E_ARTIFACT_ROOT)
  : path.resolve("artifacts/visual-qa");
const artifactDirectory = path.join(
  artifactRoot,
  "panel-minimal-v1/m7-builder-installation/installation",
);
const responsiveViewports = [
  { height: 800, width: 320 },
  { height: 812, width: 375 },
  { height: 844, width: 390 },
  { height: 932, width: 430 },
  { height: 1_024, width: 768 },
  { height: 768, width: 1_024 },
  { height: 800, width: 1_280 },
  { height: 900, width: 1_440 },
  { height: 1_024, width: 1_536 },
] as const;

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

test("M7 installation is network-free, functional and uses restrained segmented controls", async ({
  page,
}) => {
  test.setTimeout(120_000);
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

  const installation = page.locator(".installation-workspace--m7");
  const modeTrack = page.getByRole("radiogroup", { name: "Sposób osadzenia" });
  const modeItems = modeTrack.getByRole("radio");
  const deviceTrack = page.getByRole("group", { name: "Urządzenie podglądu" });
  const deviceButtons = deviceTrack.getByRole("button");
  await expect(installation).toBeVisible();
  await expect(modeItems).toHaveCount(4);
  await expect(deviceButtons).toHaveCount(2);
  const initialModeState = await modeItems.evaluateAll((items) =>
    items.map((item) => ({
      checked: item.getAttribute("aria-checked") === "true",
      tabIndex: (item as HTMLButtonElement).tabIndex,
    })),
  );
  expect(initialModeState.filter((item) => item.checked)).toHaveLength(1);
  expect(initialModeState.filter((item) => item.tabIndex === 0)).toHaveLength(1);
  expect(initialModeState.find((item) => item.checked)?.tabIndex).toBe(0);

  const desktopModeGeometry = await readSegmentedControlGeometry(modeTrack);
  expectSegmentedControlVisualContract(desktopModeGeometry, { minimumTargetHeight: 44 });
  expect(desktopModeGeometry.itemsInsideTrack).toBe(true);
  expect(desktopModeGeometry.rowSpread).toBeLessThanOrEqual(1);
  expect(
    Math.max(...desktopModeGeometry.itemWidths) - Math.min(...desktopModeGeometry.itemWidths),
  ).toBeLessThanOrEqual(2);
  expect(Math.min(...desktopModeGeometry.horizontalGaps)).toBeGreaterThanOrEqual(2);
  expect(Math.max(...desktopModeGeometry.horizontalGaps)).toBeLessThanOrEqual(8);
  const desktopDeviceGeometry = await readSegmentedControlGeometry(deviceTrack);
  expectSegmentedControlVisualContract(desktopDeviceGeometry, { minimumTargetHeight: 40 });

  const desktopGeometry = await page.evaluate(() => {
    const bounds = (selector: string) => {
      const rectangle = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
      if (!rectangle) throw new Error(`Brak regionu ${selector}.`);
      return {
        bottom: rectangle.bottom,
        left: rectangle.left,
        right: rectangle.right,
        top: rectangle.top,
        width: rectangle.width,
      };
    };
    const flatSurfaces = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".installation-workspace--m7 .installation-main > .panel-card, .installation-workspace--m7 .installation-side > .panel-card, .installation-workspace--m7 .flow-live-preview",
      ),
    );
    const functionalTextSizes = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".installation-workspace--m7 button, .installation-workspace--m7 a, .installation-workspace--m7 input, .installation-workspace--m7 textarea, .installation-workspace--m7 label, .installation-workspace--m7 code, .installation-workspace--m7 small",
      ),
    )
      .filter(
        (element) =>
          element.getClientRects().length > 0 &&
          !element.closest('[aria-hidden="true"]') &&
          !element.classList.contains("wy-sr-only"),
      )
      .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

    return {
      flatSurfaceShadows: flatSurfaces.map((surface) => getComputedStyle(surface).boxShadow),
      installationMain: bounds(".installation-main"),
      installationSide: bounds(".installation-side"),
      minimumFunctionalText: Math.min(...functionalTextSizes),
      modeTrack: bounds(".installation-mode-grid"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      preview: bounds(".sharing-workspace > .flow-live-preview"),
      sharingPanel: bounds(".sharing-panel"),
    };
  });
  expect(desktopGeometry.preview.right).toBeLessThanOrEqual(desktopGeometry.sharingPanel.left);
  expect(desktopGeometry.preview.width).toBeGreaterThan(desktopGeometry.sharingPanel.width);
  expect(desktopGeometry.sharingPanel.width).toBeGreaterThanOrEqual(300);
  expect(desktopGeometry.sharingPanel.width).toBeLessThanOrEqual(340);
  expect(desktopGeometry.installationMain.right).toBeLessThanOrEqual(
    desktopGeometry.installationSide.left,
  );
  expect(desktopGeometry.installationMain.width).toBeGreaterThan(
    desktopGeometry.installationSide.width,
  );
  expect(desktopGeometry.modeTrack.width).toBeGreaterThanOrEqual(
    desktopGeometry.installationMain.width * 0.8,
  );
  expect(desktopGeometry.flatSurfaceShadows.every((shadow) => shadow === "none")).toBe(true);
  expect(desktopGeometry.minimumFunctionalText).toBeGreaterThanOrEqual(12);
  expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);

  const inline = modeTrack.getByRole("radio", { name: /Inline/ });
  const popup = modeTrack.getByRole("radio", { name: /Popup/ });
  const fullscreen = modeTrack.getByRole("radio", { name: /Fullscreen/ });
  const hosted = modeTrack.getByRole("radio", { name: /Hosted link/ });
  await inline.focus();
  await inline.press("End");
  await expect(hosted).toBeFocused();
  await expect(hosted).toHaveAttribute("aria-checked", "true");
  await hosted.press("Home");
  await expect(inline).toBeFocused();
  await expect(inline).toHaveAttribute("aria-checked", "true");
  await inline.press("ArrowRight");
  await expect(popup).toBeFocused();
  await expect(popup).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".installation-code code")).toContainText('mode="popup"');
  await fullscreen.click();
  await expect(page.locator(".installation-code code")).toContainText('mode="fullscreen"');
  await hosted.click();
  await expect(page.locator(".installation-code code")).toContainText(/\/f\//);
  await expect(page.locator(".installation-code code")).not.toContainText("token=");
  await expect(page.getByRole("link", { name: "Otwórz wersję klienta" })).toHaveAttribute(
    "href",
    /\/f\//,
  );
  await inline.click();
  await expect(page.locator(".installation-code code")).toContainText('mode="inline"');

  const desktopDevice = deviceTrack.getByRole("button", { name: "Desktop" });
  const mobileDevice = deviceTrack.getByRole("button", { name: "Telefon" });
  await desktopDevice.focus();
  await desktopDevice.press("End");
  await expect(mobileDevice).toBeFocused();
  await expect(mobileDevice).toHaveAttribute("aria-pressed", "true");
  await mobileDevice.press("Home");
  await expect(desktopDevice).toBeFocused();
  await expect(desktopDevice).toHaveAttribute("aria-pressed", "true");
  await desktopDevice.press("ArrowRight");
  await expect(mobileDevice).toBeFocused();
  await expect(mobileDevice).toHaveAttribute("aria-pressed", "true");
  await mobileDevice.click();
  await expect(page.locator(".flow-live-preview__stage")).toHaveClass(/is-mobile/);
  await desktopDevice.click();
  await expect(page.locator(".flow-live-preview__stage")).toHaveClass(/is-desktop/);
  await completePreview(page);
  expect(publicApiRequests).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const desktopAccessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(desktopAccessibility.violations).toEqual([]);
  await page.evaluate(() => {
    window.scrollTo({ left: 0, top: 0 });
    document
      .querySelectorAll<HTMLElement>(".panel-app-content, .panel-page")
      .forEach((container) => container.scrollTo({ left: 0, top: 0 }));
  });
  await expect(
    page.getByRole("heading", { level: 1, name: "Podgląd i udostępnianie" }),
  ).toBeInViewport();
  await page.screenshot({
    animations: "disabled",
    path: path.join(artifactDirectory, "after.png"),
  });

  await page.setViewportSize({ height: 844, width: 390 });
  await mobileDevice.click();
  await expect(page.locator(".flow-live-preview__stage")).toHaveClass(/is-mobile/);
  const mobileModeGeometry = await readSegmentedControlGeometry(modeTrack);
  expectSegmentedControlVisualContract(mobileModeGeometry, { minimumTargetHeight: 44 });
  expect(mobileModeGeometry.rowSpread).toBeLessThanOrEqual(1);
  expect(["auto", "scroll"]).toContain(mobileModeGeometry.trackOverflowX);
  expect(mobileModeGeometry.trackWidth).toBeLessThanOrEqual(362);
  const mobileDeviceGeometry = await readSegmentedControlGeometry(deviceTrack);
  expectSegmentedControlVisualContract(mobileDeviceGeometry, { minimumTargetHeight: 44 });
  await hosted.scrollIntoViewIfNeeded();
  await hosted.click();
  await expect(hosted).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".installation-code code")).not.toContainText("token=");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const mobileAccessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(mobileAccessibility.violations).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: path.join(artifactDirectory, "mobile-390x844.png"),
  });

  const responsiveMatrix: Array<{
    height: number;
    minimumModeTarget: number;
    overflow: number;
    reflowEquivalentTo200Percent: boolean;
    scrollableModeTrack: boolean;
    width: number;
  }> = [];
  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);
    await expect(installation).toBeVisible();
    const measurement = await modeTrack.evaluate((track) => {
      const buttons = Array.from(track.querySelectorAll<HTMLElement>(":scope > button"));
      return {
        minimumModeTarget: Math.min(
          ...buttons.map((button) => button.getBoundingClientRect().height),
        ),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        scrollableModeTrack: track.scrollWidth > track.clientWidth + 1,
      };
    });
    expect(
      measurement.overflow,
      `M7 instalacja: overflow przy ${viewport.width} px`,
    ).toBeLessThanOrEqual(1);
    expect(measurement.minimumModeTarget).toBeGreaterThanOrEqual(44);
    if (viewport.width <= 430) expect(measurement.scrollableModeTrack).toBe(true);
    responsiveMatrix.push({
      ...viewport,
      ...measurement,
      reflowEquivalentTo200Percent: viewport.width === 768,
    });
  }

  await page.setViewportSize({ height: 800, width: 320 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await hosted.scrollIntoViewIfNeeded();
  await hosted.focus();
  const forcedColorsFocusOutline = await hosted.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).outlineWidth),
  );
  expect(forcedColorsFocusOutline).toBeGreaterThanOrEqual(2);
  const forcedColorsAccessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(forcedColorsAccessibility.violations).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: path.join(artifactDirectory, "forced-colors-320x800.png"),
  });
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

  const reducedMotionDurations = await page
    .locator(".installation-workspace--m7 .panel-segmented-track > button")
    .evaluateAll((buttons) =>
      buttons.map((button) =>
        getComputedStyle(button)
          .transitionDuration.split(",")
          .map((duration) => Number.parseFloat(duration) || 0)
          .reduce((maximum, duration) => Math.max(maximum, duration), 0),
      ),
    );
  expect(reducedMotionDurations.every((duration) => duration <= 0.000_01)).toBe(true);
  await writeFile(
    path.join(artifactDirectory, "measurements.json"),
    `${JSON.stringify(
      {
        accessibilityViolations:
          desktopAccessibility.violations.length +
          mobileAccessibility.violations.length +
          forcedColorsAccessibility.violations.length,
        desktop: desktopGeometry,
        forcedColorsFocusOutline,
        responsiveMatrix,
        segmented: {
          desktopDevice: desktopDeviceGeometry,
          desktopMode: desktopModeGeometry,
          mobileDevice: mobileDeviceGeometry,
          mobileMode: mobileModeGeometry,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
});
