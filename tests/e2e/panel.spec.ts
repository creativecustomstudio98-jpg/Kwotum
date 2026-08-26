import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  expectSegmentedControlVisualContract,
  readSegmentedControlGeometry,
} from "./panel-segmented.shared";

const organizationId = process.env.PANEL_E2E_ORGANIZATION_ID;
const panelEmail = process.env.PANEL_E2E_EMAIL;
const panelPassword = process.env.PANEL_E2E_PASSWORD;
const seededFlowId = process.env.PANEL_E2E_FLOW_ID;
const editorFlowId = process.env.PANEL_E2E_EDITOR_FLOW_ID;
const seededProcessCount = Number(process.env.PANEL_E2E_PROCESS_COUNT ?? "0");
const salesEmail = process.env.PANEL_E2E_SALES_EMAIL;
const salesPassword = process.env.PANEL_E2E_SALES_PASSWORD;
const artifactRoot = process.env.PANEL_E2E_ARTIFACT_ROOT
  ? path.resolve(process.env.PANEL_E2E_ARTIFACT_ROOT)
  : path.resolve("artifacts/visual-qa");
const panelMinimalArtifactRoot = path.join(artifactRoot, "panel-minimal-v1/baseline");
const artifactDirectory = path.join(panelMinimalArtifactRoot, "routes");
const organizationPickerArtifactDirectory = path.join(
  panelMinimalArtifactRoot,
  "organization-picker",
);
const leadDetailArtifactDirectory = path.join(panelMinimalArtifactRoot, "lead-detail");
const analyticsArtifactDirectory = path.join(panelMinimalArtifactRoot, "analytics");
const dashboardArtifactDirectory = path.join(panelMinimalArtifactRoot, "dashboard");
const mobileNavigationArtifactDirectory = path.join(panelMinimalArtifactRoot, "mobile-navigation");
const remainingScreenArtifactDirectory = path.join(panelMinimalArtifactRoot, "remaining");
const contactDeliveryArtifactDirectory = path.join(panelMinimalArtifactRoot, "contact-delivery");
const builderStateArtifactDirectory = path.join(panelMinimalArtifactRoot, "builder-state");
const builderInteractionArtifactDirectory = path.join(
  panelMinimalArtifactRoot,
  "builder-interactions",
);
const builderToggleArtifactDirectory = path.join(panelMinimalArtifactRoot, "builder-toggle");
const builderSectionArtifactDirectory = path.join(panelMinimalArtifactRoot, "builder-sections");
const builderOptionArtifactDirectory = path.join(panelMinimalArtifactRoot, "builder-options");
const builderEstimationArtifactDirectory = path.join(
  panelMinimalArtifactRoot,
  "builder-estimation",
);
const webhookArtifactDirectory = path.join(panelMinimalArtifactRoot, "webhooks");
const m1ShellArtifactDirectory = path.join(panelMinimalArtifactRoot, "shell");
const m2ContextNavigationArtifactDirectory = path.join(
  artifactRoot,
  "panel-minimal-v1/m2-context-navigation",
);
const m4ControlArtifactDirectory = path.join(artifactRoot, "panel-minimal-v1/m4-controls");
const m5ListArtifactDirectory = path.join(artifactRoot, "panel-minimal-v1/m5-lists");
const m5LeadArtifactDirectory = path.join(m5ListArtifactDirectory, "leads");
const m5ProcessArtifactDirectory = path.join(m5ListArtifactDirectory, "processes");
const m5TemplateArtifactDirectory = path.join(m5ListArtifactDirectory, "templates");
const m6LeadArtifactDirectory = path.join(
  artifactRoot,
  "panel-minimal-v1/m6-lead-workspace/lead-detail",
);
const m7BuilderArtifactDirectory = path.join(
  artifactRoot,
  "panel-minimal-v1/m7-builder-installation/builder",
);
const m5ResponsiveViewports = [
  { height: 800, width: 320 },
  { height: 812, width: 375 },
  { height: 844, width: 390 },
  { height: 932, width: 430 },
  { height: 900, width: 720 },
  { height: 1_024, width: 768 },
  { height: 768, width: 1_024 },
  { height: 800, width: 1_280 },
  { height: 900, width: 1_440 },
  { height: 1_024, width: 1_536 },
] as const;
const m6ResponsiveViewports = m5ResponsiveViewports;
const processPageSize = 12;
const longUnbrokenProcessName = `Proces${"BezPrzerw".repeat(24)}`.slice(0, 160);

async function signIn(page: Page) {
  if (!organizationId || !panelEmail || !panelPassword) {
    throw new Error("Brak danych lokalnego konta panel E2E.");
  }
  await signInWithCredentials(page, panelEmail, panelPassword, organizationId);
}

async function signInWithCredentials(
  page: Page,
  email: string,
  password: string,
  targetOrganizationId: string,
) {
  await page.goto(`/logowanie?next=/panel/${targetOrganizationId}`);
  await page.getByLabel("Adres e-mail").fill(email);
  await page.getByLabel("Hasło", { exact: true }).fill(password);
  await page.getByRole("button", { exact: true, name: "Zaloguj się" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(`/panel/${targetOrganizationId}`));
  await expect(page.locator(".panel-app-shell")).toBeVisible();
}

async function openSeededLeadDetail(page: Page): Promise<string> {
  if (!organizationId) throw new Error("Brak organizacji dla testu szczegółu leada.");
  await page.goto(`/panel/${organizationId}/leady`);
  const leadLink = page.getByRole("link", { exact: true, name: "Anna Kowalska" });
  await expect(leadLink).toBeVisible();
  const leadHref = await leadLink.getAttribute("href");
  if (!leadHref) throw new Error("Brak linku do demonstracyjnego leada.");
  await page.goto(leadHref);
  await expect(page.getByRole("heading", { level: 1, name: "Anna Kowalska" })).toBeVisible();
  return leadHref;
}

async function capture(page: Page, name: string) {
  await page.screenshot({
    animations: "disabled",
    path: path.join(artifactDirectory, `${name}.png`),
  });
}

async function switchGeometry(input: Locator) {
  return input.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const knob = getComputedStyle(element, "::after");
    const transform =
      knob.transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(knob.transform);
    return {
      borderRadius: Number.parseFloat(style.borderRadius),
      height: bounds.height,
      knobHeight: Number.parseFloat(knob.height),
      knobLeft: Number.parseFloat(knob.left),
      knobTop: Number.parseFloat(knob.top),
      knobTranslateX: transform.m41,
      knobWidth: Number.parseFloat(knob.width),
      minHeight: Number.parseFloat(style.minHeight),
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      paddingBottom: Number.parseFloat(style.paddingBottom),
      paddingLeft: Number.parseFloat(style.paddingLeft),
      paddingRight: Number.parseFloat(style.paddingRight),
      paddingTop: Number.parseFloat(style.paddingTop),
      width: bounds.width,
    };
  });
}

test.describe("panel reference reconstruction", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !organizationId || !panelEmail || !panelPassword || !seededFlowId,
      "Lokalny test panelu wymaga PANEL_E2E_*.",
    );
    await mkdir(artifactDirectory, { recursive: true });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await signIn(page);
  });

  test("organization picker follows the accepted Kwotum composition", async ({ page }) => {
    await mkdir(organizationPickerArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_152, width: 2_048 });
    await page.goto("/panel");

    await expect(
      page.getByRole("heading", { level: 1, name: "Wybierz organizację" }),
    ).toBeVisible();
    const card = page.locator(".organization-list > li").first();
    const summary = card.getByRole("list", { name: /Podsumowanie organizacji/ });
    await expect(summary.getByRole("listitem")).toHaveCount(3);
    await expect(card.getByRole("link", { name: "Wybierz" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}`,
    );

    const desktop = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const rect = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!rect) throw new Error(`Brak elementu ${selector}.`);
        return { height: rect.height, width: rect.width };
      };
      return {
        avatar: bounds(".organization-list__identity > span"),
        card: bounds(".organization-list > li"),
        content: bounds(".organization-picker__content"),
        header: bounds(".organization-picker__header"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        primaryAction: bounds(".organization-actions__primary"),
      };
    });

    expect(desktop.header.height).toBeGreaterThanOrEqual(79);
    expect(desktop.header.height).toBeLessThanOrEqual(81);
    expect(desktop.content.width).toBeGreaterThanOrEqual(1_118);
    expect(desktop.content.width).toBeLessThanOrEqual(1_122);
    expect(desktop.card.height).toBeGreaterThanOrEqual(430);
    expect(desktop.card.height).toBeLessThanOrEqual(434);
    expect(desktop.avatar.width).toBeGreaterThanOrEqual(82);
    expect(desktop.avatar.width).toBeLessThanOrEqual(86);
    expect(desktop.primaryAction.height).toBeGreaterThanOrEqual(52);
    expect(desktop.primaryAction.width).toBeGreaterThanOrEqual(390);
    expect(desktop.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(organizationPickerArtifactDirectory, "after-desktop-2048x1152.png"),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await expect(card).toBeVisible();
    await expect(card.getByRole("link", { name: "Wybierz" })).toBeVisible();
    await expect(card.getByRole("link")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(organizationPickerArtifactDirectory, "after-mobile-390x844.png"),
    });
  });

  test("shared Kwotum sidebar expands, collapses and persists across routes", async ({ page }) => {
    test.setTimeout(90_000);
    await mkdir(m1ShellArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 900, width: 1_440 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.getByText("Nowe leady", { exact: true })).toBeVisible();

    const sidebar = page.locator("#panel-sidebar");
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await expect(page.getByText("Kwotum", { exact: true })).toBeVisible();
    await expect(sidebar.getByRole("heading", { name: "Praca" })).toBeVisible();
    await expect(sidebar.getByRole("heading", { name: "Narzędzia" })).toBeVisible();
    await expect(sidebar.getByRole("heading", { name: "System" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Przegląd", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(255);
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeLessThanOrEqual(257);

    const shellContract = await page.locator(".panel-app-shell").evaluate((element) => {
      const styles = getComputedStyle(element);
      const bodyStyles = getComputedStyle(document.body);
      const instrumentSansVariable = bodyStyles
        .getPropertyValue("--wy-font-instrument-sans")
        .trim()
        .split(",")[0]
        ?.replaceAll('"', "")
        .trim();
      const primaryFamily = styles.fontFamily.split(",")[0]?.replaceAll('"', "").trim();
      const visibleWeights = [
        ...new Set(
          Array.from(element.querySelectorAll<HTMLElement>("*")).flatMap((node) => {
            const visible = node.getClientRects().length > 0 && node.textContent?.trim();
            if (!visible) return [];
            return [Number.parseInt(getComputedStyle(node).fontWeight, 10)];
          }),
        ),
      ].filter(Number.isFinite);

      return {
        backgroundColor: styles.backgroundColor,
        fontFamily: styles.fontFamily,
        usesInstrumentSans:
          Boolean(instrumentSansVariable) && primaryFamily === instrumentSansVariable,
        visibleWeights,
      };
    });
    expect(shellContract).toMatchObject({
      backgroundColor: "rgb(255, 255, 255)",
      usesInstrumentSans: true,
    });
    expect(
      shellContract.visibleWeights.every((weight) => [400, 500, 600, 700].includes(weight)),
    ).toBe(true);

    const sidebarSurface = await sidebar.evaluate((element) => {
      const styles = getComputedStyle(element);
      const active = element.querySelector<HTMLElement>('a[aria-current="page"]');
      const activeStyles = active ? getComputedStyle(active) : null;
      const activeDecoration = active ? getComputedStyle(active, "::before") : null;
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        borderRightColor: styles.borderRightColor,
        borderRightWidth: styles.borderRightWidth,
        boxShadow: styles.boxShadow,
        activeBackgroundColor: activeStyles?.backgroundColor ?? "transparent",
        activeBorderColor: activeStyles?.borderColor ?? "transparent",
        activeClipPath: activeDecoration?.clipPath ?? "none",
        activeMarkerBackgroundColor: activeDecoration?.backgroundColor ?? "transparent",
      };
    });
    expect(sidebarSurface).toMatchObject({
      activeBackgroundColor: "rgb(255, 255, 255)",
      activeBorderColor: "rgb(221, 226, 222)",
      activeClipPath: "none",
      activeMarkerBackgroundColor: "rgb(8, 112, 71)",
      backgroundColor: "rgb(250, 250, 249)",
      backgroundImage: "none",
      borderRightColor: "rgb(228, 231, 229)",
      borderRightWidth: "1px",
      boxShadow: "none",
    });
    const activeTabGeometry = await sidebar
      .getByRole("link", { name: "Przegląd", exact: true })
      .evaluate((element) => {
        const linkBounds = element.getBoundingClientRect();
        const railBounds = document
          .querySelector<HTMLElement>("#panel-sidebar")
          ?.getBoundingClientRect();
        const decoration = getComputedStyle(element, "::before");
        return {
          decorationLeft: Number.parseFloat(decoration.left),
          decorationWidth: Number.parseFloat(decoration.width),
          linkRight: linkBounds.right,
          railRight: railBounds?.right ?? 0,
        };
      });
    expect(activeTabGeometry.decorationLeft).toBe(-1);
    expect(activeTabGeometry.decorationWidth).toBe(2);
    expect(
      Math.abs(activeTabGeometry.linkRight + 12 - activeTabGeometry.railRight),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "expanded-1440x900.png"),
    });
    await sidebar.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "expanded-sidebar-256x900.png"),
    });

    const activeNavigationLink = sidebar.getByRole("link", { name: "Przegląd", exact: true });
    await activeNavigationLink.focus();
    await expect(activeNavigationLink).toBeFocused();
    expect(
      await activeNavigationLink.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).outlineWidth),
      ),
    ).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "focus-1440x900.png"),
    });

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    expect(
      await activeNavigationLink.evaluate((element) => getComputedStyle(element).outlineStyle),
    ).not.toBe("none");
    await page.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "forced-colors-1440x900.png"),
    });
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    await page.getByRole("button", { name: "Zwiń menu boczne" }).click();
    await expect(sidebar).toHaveAttribute("data-collapsed", "true");
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeLessThanOrEqual(73);
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(71);
    const collapsedActiveGeometry = await sidebar
      .getByRole("link", { name: "Przegląd", exact: true })
      .evaluate((element) => {
        const linkBounds = element.getBoundingClientRect();
        const railBounds = document
          .querySelector<HTMLElement>("#panel-sidebar")
          ?.getBoundingClientRect();
        return { linkRight: linkBounds.right, railRight: railBounds?.right ?? 0 };
      });
    expect(
      Math.abs(collapsedActiveGeometry.linkRight + 10 - collapsedActiveGeometry.railRight),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "collapsed-1440x900.png"),
    });
    await sidebar.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "collapsed-sidebar-72x900.png"),
    });
    await sidebar.getByRole("link", { name: "Leady", exact: true }).focus();
    await expect(page.getByRole("tooltip", { name: "Leady" })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("lorum:panel-sidebar-collapsed")))
      .toBe("true");

    await page.reload();
    await expect(sidebar).toHaveAttribute("data-collapsed", "true");
    await page.getByRole("button", { name: "Rozwiń menu boczne" }).press("Enter");
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");

    const accountMenuButton = sidebar.getByRole("button", { name: "Otwórz menu konta" });
    await accountMenuButton.focus();
    await accountMenuButton.press("Enter");
    await expect(page.getByRole("region", { name: "Menu konta" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("region", { name: "Menu konta" })).toBeHidden();
    await expect(accountMenuButton).toBeFocused();

    const reducedMotion = await page.evaluate(() => ({
      rail: Number.parseFloat(
        getComputedStyle(document.querySelector<HTMLElement>("#panel-sidebar")!).transitionDuration,
      ),
      shell: Number.parseFloat(
        getComputedStyle(document.querySelector<HTMLElement>(".panel-app-shell")!)
          .transitionDuration,
      ),
    }));
    expect(reducedMotion.rail).toBeLessThanOrEqual(0.000_01);
    expect(reducedMotion.shell).toBeLessThanOrEqual(0.000_01);
    const sidebarAccessibility = await new AxeBuilder({ page })
      .include("#panel-sidebar")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(sidebarAccessibility.violations).toEqual([]);

    const responsiveMeasurements: Array<Record<string, number | string>> = [];
    for (const viewport of [
      { height: 1_024, label: "1536x1024", width: 1_536 },
      { height: 900, label: "1440x900", width: 1_440 },
      { height: 800, label: "1280x800", width: 1_280 },
      { height: 768, label: "1024x768", width: 1_024 },
    ]) {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.goto(`/panel/${organizationId}`);
      await expect(page.getByText("Nowe leady", { exact: true })).toBeVisible();
      await expect(sidebar).toHaveAttribute("data-collapsed", "false");
      const desktopMeasurement = await page.evaluate((label) => {
        const rail = document.querySelector<HTMLElement>("#panel-sidebar");
        return {
          documentOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          label,
          mode: "desktop",
          railHeight: rail?.getBoundingClientRect().height ?? 0,
          railWidth: rail?.getBoundingClientRect().width ?? 0,
        };
      }, viewport.label);
      responsiveMeasurements.push(desktopMeasurement);
      expect(desktopMeasurement.documentOverflow).toBeLessThanOrEqual(1);
      expect(desktopMeasurement.railWidth).toBeGreaterThanOrEqual(255);
      expect(desktopMeasurement.railWidth).toBeLessThanOrEqual(257);
      expect(desktopMeasurement.railHeight).toBe(viewport.height);
      await page.screenshot({
        animations: "disabled",
        path: path.join(m1ShellArtifactDirectory, `expanded-${viewport.label}.png`),
      });
      await page.getByRole("button", { name: "Zwiń menu boczne" }).click();
      await expect(sidebar).toHaveAttribute("data-collapsed", "true");
      await page.screenshot({
        animations: "disabled",
        path: path.join(m1ShellArtifactDirectory, `collapsed-${viewport.label}.png`),
      });
      await page.getByRole("button", { name: "Rozwiń menu boczne" }).click();
    }

    await page.goto(`/panel/${organizationId}/leady`);
    await expect(page.getByRole("heading", { level: 1, name: "Leady" })).toBeVisible();
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await expect(sidebar.getByRole("link", { name: "Leady", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );

    for (const viewport of [
      { height: 800, label: "320x800", width: 320 },
      { height: 812, label: "375x812", width: 375 },
      { height: 844, label: "390x844", width: 390 },
      { height: 932, label: "430x932", width: 430 },
      { height: 1_024, label: "768x1024", width: 768 },
    ]) {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);
      await expect(page.getByRole("searchbox", { name: "Szukaj leadów" })).toBeVisible();
      await expect(page.getByRole("button", { name: /menu boczne/ })).toBeHidden();
      const mobileNavigation = page.getByRole("navigation", {
        name: "Główna nawigacja panelu",
      });
      await expect(mobileNavigation).toBeVisible();
      await expect(page.getByRole("link", { exact: true, name: "Leady" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      const mobileMeasurement = await page.evaluate((label) => {
        const navigation = document.querySelector<HTMLElement>(".panel-mobile-navigation");
        return {
          documentOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          label,
          mobileNavigationHeight: navigation?.getBoundingClientRect().height ?? 0,
          mode: "mobile",
          railWidth:
            document.querySelector<HTMLElement>("#panel-sidebar")?.getBoundingClientRect().width ??
            0,
        };
      }, viewport.label);
      responsiveMeasurements.push(mobileMeasurement);
      expect(mobileMeasurement.documentOverflow).toBeLessThanOrEqual(1);
      expect(mobileMeasurement.railWidth).toBe(0);
      expect(mobileMeasurement.mobileNavigationHeight).toBeGreaterThanOrEqual(44);
      await page.screenshot({
        animations: "disabled",
        path: path.join(m1ShellArtifactDirectory, `mobile-${viewport.label}.png`),
      });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
    }

    await page.setViewportSize({ height: 844, width: 390 });
    await page.getByRole("button", { name: "Więcej opcji panelu" }).click();
    await expect(page.getByRole("dialog", { name: "Więcej" })).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "mobile-more-390x844.png"),
    });
    await page.getByRole("button", { name: "Zamknij menu Więcej" }).click();

    const mobileNavigationAccessibility = await new AxeBuilder({ page })
      .include(".panel-mobile-navigation")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileNavigationAccessibility.violations).toEqual([]);

    const mobileLeadLink = page.getByRole("link", { exact: true, name: "Leady" });
    await mobileLeadLink.focus();
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    expect(
      await mobileLeadLink.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).borderTopWidth),
      ),
    ).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m1ShellArtifactDirectory, "forced-colors-mobile-390x844.png"),
    });
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    await writeFile(
      path.join(m1ShellArtifactDirectory, "measurements.json"),
      `${JSON.stringify(responsiveMeasurements, null, 2)}\n`,
      "utf8",
    );
  });

  test("dashboard reproduces the complete operational reference with real data", async ({
    page,
  }) => {
    await mkdir(dashboardArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}`);

    await expect(page.getByRole("heading", { level: 1, name: "Przegląd" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Szukaj leadów" })).toBeVisible();
    await expect(page.locator(".dashboard-metric-card")).toHaveCount(4);
    await expect(page.locator(".dashboard-focus-grid")).toHaveCount(1);
    await expect(page.locator(".dashboard-focus-grid > .dashboard-card")).toHaveCount(2);
    await expect(page.locator(".dashboard-card--trend")).toHaveCount(1);
    await expect(page.locator(".dashboard-card--activity")).toHaveCount(1);
    await expect(page.locator(".dashboard-table tbody tr")).toHaveCount(5);
    await expect(page.locator(".dashboard-card--insights")).toHaveCount(1);
    await expect(page.locator(".dashboard-card--insights .dashboard-insight")).toHaveCount(4);
    await expect(page.locator(".dashboard-primary-grid")).toHaveCount(0);
    await expect(page.locator(".dashboard-donut, .dashboard-donut-chart")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Szybkie akcje dashboardu" })).toHaveCount(0);

    for (const section of [
      "Leady w czasie",
      "Wymagają uwagi",
      "Najnowsze leady",
      "Przekroje z 30 dni",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }
    for (const insight of [
      "Statusy",
      "Źródła sesji ze zgodą",
      "Najaktywniejsze procesy",
      "Przedziały wycen",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name: insight })).toBeVisible();
    }

    const desktopGeometry = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const rectangle = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        return {
          bottom: rectangle?.bottom ?? 0,
          left: rectangle?.left ?? 0,
          right: rectangle?.right ?? 0,
          top: rectangle?.top ?? 0,
          width: rectangle?.width ?? 0,
        };
      };
      const metrics = Array.from(
        document.querySelectorAll<HTMLElement>(".dashboard-metric-card"),
      ).map((card) => card.getBoundingClientRect());
      const focusGrid = document.querySelector<HTMLElement>(".dashboard-focus-grid");
      const workspace = document
        .querySelector<HTMLElement>(".dashboard-panel")
        ?.getBoundingClientRect();
      const dashboardPage = document
        .querySelector<HTMLElement>(".dashboard-page")
        ?.getBoundingClientRect();
      const visibleAxisLabels = Array.from(
        document.querySelectorAll<SVGTextElement>(".dashboard-chart__axis"),
      ).filter((label) => {
        const styles = getComputedStyle(label);
        const rectangle = label.getBoundingClientRect();
        return (
          styles.display !== "none" &&
          styles.visibility !== "hidden" &&
          rectangle.width > 0 &&
          rectangle.height > 0
        );
      });
      return {
        activity: bounds(".dashboard-card--activity"),
        axisFontSizes: visibleAxisLabels.map((label) =>
          Number.parseFloat(getComputedStyle(label).fontSize),
        ),
        dateLabelCount: visibleAxisLabels.filter((label) =>
          label.classList.contains("dashboard-chart__axis--date"),
        ).length,
        focusColumnCount: getComputedStyle(focusGrid!)
          .gridTemplateColumns.split(/\s+/)
          .filter(Boolean).length,
        latest: bounds(".dashboard-card--latest"),
        metricWidths: metrics.map((metric) => metric.width),
        metricY: metrics.map((metric) => metric.y),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pageWidth: dashboardPage?.width ?? 0,
        summary: bounds(".dashboard-summary"),
        topbarHeight:
          document
            .querySelector<HTMLElement>(".dashboard-panel .panel-topbar")
            ?.getBoundingClientRect().height ?? 0,
        trend: bounds(".dashboard-card--trend"),
        workspaceWidth: workspace?.width ?? 0,
      };
    });
    expect(desktopGeometry.metricWidths).toHaveLength(4);
    expect(
      Math.max(...desktopGeometry.metricY) - Math.min(...desktopGeometry.metricY),
    ).toBeLessThanOrEqual(1);
    expect(Math.min(...desktopGeometry.metricWidths)).toBeGreaterThanOrEqual(195);
    expect(desktopGeometry.focusColumnCount).toBe(2);
    expect(desktopGeometry.activity.width).toBeGreaterThanOrEqual(303);
    expect(desktopGeometry.activity.width).toBeLessThanOrEqual(305);
    expect(Math.abs(desktopGeometry.trend.top - desktopGeometry.activity.top)).toBeLessThanOrEqual(
      1,
    );
    expect(
      Math.abs(desktopGeometry.trend.bottom - desktopGeometry.activity.bottom),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(desktopGeometry.summary.left - desktopGeometry.latest.left),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(desktopGeometry.summary.right - desktopGeometry.latest.right),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(desktopGeometry.summary.width - desktopGeometry.latest.width),
    ).toBeLessThanOrEqual(1);
    expect(desktopGeometry.axisFontSizes.length).toBeGreaterThan(0);
    expect(Math.min(...desktopGeometry.axisFontSizes)).toBeGreaterThanOrEqual(11);
    expect(desktopGeometry.dateLabelCount).toBeGreaterThan(0);
    expect(desktopGeometry.dateLabelCount).toBeLessThanOrEqual(7);
    expect(desktopGeometry.pageWidth).toBeGreaterThanOrEqual(desktopGeometry.workspaceWidth - 1);
    expect(desktopGeometry.topbarHeight).toBeGreaterThanOrEqual(53);
    expect(desktopGeometry.topbarHeight).toBeLessThanOrEqual(55);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(dashboardArtifactDirectory, "after-viewport-1536x1024.png"),
    });
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(dashboardArtifactDirectory, "after-full-page-1536w.png"),
    });

    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);
    await expect(page.locator(".dashboard-metric-card")).toHaveCount(4);
    await expect(page.locator(".dashboard-card--activity")).toBeVisible();
    await expect(page.locator(".dashboard-card--trend")).toBeVisible();
    await expect(page.locator(".dashboard-table tbody tr")).toHaveCount(5);
    await expect(page.locator(".dashboard-card--insights .dashboard-insight")).toHaveCount(4);
    const mobileGeometry = await page.evaluate(() => {
      const activity = document
        .querySelector<HTMLElement>(".dashboard-card--activity")
        ?.getBoundingClientRect();
      const focus = document
        .querySelector<HTMLElement>(".dashboard-focus-grid")
        ?.getBoundingClientRect();
      const latest = document
        .querySelector<HTMLElement>(".dashboard-card--latest")
        ?.getBoundingClientRect();
      const metricGrid = document.querySelector<HTMLElement>(".dashboard-metric-grid");
      const metrics = metricGrid?.getBoundingClientRect();
      const summary = document
        .querySelector<HTMLElement>(".dashboard-summary")
        ?.getBoundingClientRect();
      const tableRow = document
        .querySelector<HTMLElement>(".dashboard-table tbody tr")
        ?.getBoundingClientRect();
      const trend = document
        .querySelector<HTMLElement>(".dashboard-card--trend")
        ?.getBoundingClientRect();
      return {
        activityTop: activity?.top ?? Number.POSITIVE_INFINITY,
        focusTop: focus?.top ?? Number.POSITIVE_INFINITY,
        latestTop: latest?.top ?? Number.POSITIVE_INFINITY,
        metricColumnCount: metricGrid
          ? getComputedStyle(metricGrid).gridTemplateColumns.split(/\s+/).filter(Boolean).length
          : 0,
        metricCount: document.querySelectorAll(".dashboard-metric-card").length,
        metricsTop: metrics?.top ?? Number.POSITIVE_INFINITY,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        summaryBottom: summary?.bottom ?? Number.POSITIVE_INFINITY,
        summaryTop: summary?.top ?? Number.POSITIVE_INFINITY,
        tableRowDisplay: tableRow
          ? getComputedStyle(document.querySelector<HTMLElement>(".dashboard-table tbody tr")!)
              .display
          : "",
        tableRowLeft: tableRow?.left ?? Number.NEGATIVE_INFINITY,
        tableRowRight: tableRow?.right ?? Number.POSITIVE_INFINITY,
        tableSurfaceLeft: latest?.left ?? Number.NEGATIVE_INFINITY,
        tableSurfaceRight: latest?.right ?? Number.POSITIVE_INFINITY,
        trendTop: trend?.top ?? Number.POSITIVE_INFINITY,
      };
    });
    expect(mobileGeometry.metricCount).toBe(4);
    expect(mobileGeometry.metricColumnCount).toBe(2);
    expect(mobileGeometry.summaryTop).toBeLessThan(mobileGeometry.focusTop);
    expect(mobileGeometry.summaryBottom).toBeLessThanOrEqual(mobileGeometry.focusTop);
    expect(mobileGeometry.activityTop).toBeLessThan(mobileGeometry.trendTop);
    expect(mobileGeometry.metricsTop).toBeLessThan(mobileGeometry.activityTop);
    expect(mobileGeometry.trendTop).toBeLessThan(mobileGeometry.latestTop);
    expect(mobileGeometry.tableRowDisplay).toBe("grid");
    expect(mobileGeometry.tableRowLeft).toBeGreaterThanOrEqual(mobileGeometry.tableSurfaceLeft - 1);
    expect(mobileGeometry.tableRowRight).toBeLessThanOrEqual(mobileGeometry.tableSurfaceRight + 1);
    expect(mobileGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(dashboardArtifactDirectory, "after-viewport-390x844.png"),
    });
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(dashboardArtifactDirectory, "after-full-page-390w.png"),
    });

    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);
  });

  test("M2 context header and route menus stay precise across desktop and mobile", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const settingsArtifacts = path.join(m2ContextNavigationArtifactDirectory, "settings");
    const integrationsArtifacts = path.join(m2ContextNavigationArtifactDirectory, "integrations");
    await Promise.all([
      mkdir(settingsArtifacts, { recursive: true }),
      mkdir(integrationsArtifacts, { recursive: true }),
    ]);

    await page.setViewportSize({ height: 900, width: 1_440 });
    await page.goto(`/panel/${organizationId}/ustawienia`);

    const settingsHeader = page.locator(".settings-panel > .panel-page-header");
    await expect(settingsHeader).toHaveCount(1);
    await expect(settingsHeader.locator(".panel-topbar")).toHaveCount(1);
    await expect(settingsHeader.locator(".panel-page-intro")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Ustawienia" })).toBeVisible();

    const settingsBreadcrumbs = page.getByRole("navigation", { name: "Okruszki" });
    await expect(settingsBreadcrumbs.getByRole("link", { name: "Przegląd" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}`,
    );
    await expect(settingsBreadcrumbs.locator('[aria-current="page"]')).toHaveText("Ustawienia");

    const settingsNavigation = page.getByRole("navigation", { name: "Sekcje ustawień" });
    await expect(settingsNavigation.getByRole("link")).toHaveCount(3);
    await expect(settingsNavigation.locator('a[aria-current="page"]')).toHaveText("Organizacja");
    await expect(
      page.locator("#panel-sidebar a.is-active", { hasText: "Ustawienia" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Dane organizacji" })).toBeVisible();
    await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
    const settingsTopbarHeight = await settingsHeader
      .locator(".panel-topbar")
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(settingsTopbarHeight).toBeGreaterThanOrEqual(53);
    expect(settingsTopbarHeight).toBeLessThanOrEqual(55);
    await page.screenshot({
      animations: "disabled",
      path: path.join(settingsArtifacts, "after-1440x900.png"),
    });

    await settingsNavigation.getByRole("link", { name: "Powiadomienia" }).press("Enter");
    await expect(page).toHaveURL(`/panel/${organizationId}/powiadomienia`);
    await expect(page.getByRole("heading", { level: 2, name: "Reguły dostawy" })).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Sekcje ustawień" })
        .getByRole("link", { name: "Powiadomienia" }),
    ).toHaveAttribute("aria-current", "page");
    await page.screenshot({
      animations: "disabled",
      path: path.join(settingsArtifacts, "notifications-1440x900.png"),
    });

    await page.goto(`/panel/${organizationId}/integracje/wordpress`);
    const integrationsNavigation = page.getByRole("navigation", {
      name: "Rodzaje integracji",
    });
    await expect(page.getByRole("heading", { level: 1, name: "Integracje" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(integrationsNavigation.getByRole("link")).toHaveCount(2);
    await expect(integrationsNavigation.locator('a[aria-current="page"]')).toHaveText("WordPress");
    await expect(page.locator("#wordpress-configuration")).toBeVisible();
    await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
    const sidebarIntegration = page.locator("#panel-sidebar a.is-active", {
      hasText: "Integracje",
    });
    await expect(sidebarIntegration).toBeVisible();
    await expect(sidebarIntegration).not.toHaveAttribute("aria-current", "page");
    await page.screenshot({
      animations: "disabled",
      path: path.join(integrationsArtifacts, "after-1440x900.png"),
    });

    await integrationsNavigation.getByRole("link", { name: "Webhooki" }).press("Enter");
    await expect(page).toHaveURL(`/panel/${organizationId}/integracje/webhooki`);
    await expect(
      page
        .getByRole("navigation", { name: "Rodzaje integracji" })
        .getByRole("link", { name: "Webhooki" }),
    ).toHaveAttribute("aria-current", "page");

    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}/ustawienia`);
    await expect(page.getByRole("heading", { level: 2, name: "Dane organizacji" })).toBeVisible();
    await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
    const mobileSettingsNavigation = page.getByRole("navigation", {
      name: "Sekcje ustawień",
    });
    const mobileNavigationGeometry = await mobileSettingsNavigation.evaluate((navigation) => {
      const track = navigation.firstElementChild;
      const links = Array.from(navigation.querySelectorAll("a"));
      return {
        documentOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        flexWrap: track ? getComputedStyle(track).flexWrap : "",
        linkHeights: links.map((link) => link.getBoundingClientRect().height),
        overflowX: getComputedStyle(navigation).overflowX,
        scrollable: navigation.scrollWidth > navigation.clientWidth,
      };
    });
    expect(mobileNavigationGeometry.documentOverflow).toBeLessThanOrEqual(1);
    expect(mobileNavigationGeometry.flexWrap).toBe("nowrap");
    expect(mobileNavigationGeometry.linkHeights.every((height) => height >= 44)).toBe(true);
    expect(["auto", "scroll"]).toContain(mobileNavigationGeometry.overflowX);
    expect(mobileNavigationGeometry.scrollable).toBe(true);
    await page.screenshot({
      animations: "disabled",
      path: path.join(settingsArtifacts, "mobile-320x800.png"),
    });

    const organizationTab = mobileSettingsNavigation.getByRole("link", {
      name: "Organizacja",
    });
    const notificationTab = mobileSettingsNavigation.getByRole("link", {
      name: "Powiadomienia",
    });
    const privacyTab = mobileSettingsNavigation.getByRole("link", {
      name: "Dane i prywatność",
    });
    await organizationTab.focus();
    await page.keyboard.press("Tab");
    await expect(notificationTab).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(privacyTab).toBeFocused();
    const focusedTabVisibility = await mobileSettingsNavigation.evaluate((navigation) => {
      const focused = navigation.querySelector<HTMLElement>(":focus");
      const navigationBounds = navigation.getBoundingClientRect();
      const focusedBounds = focused?.getBoundingClientRect();
      return {
        left: focusedBounds?.left ?? Number.NEGATIVE_INFINITY,
        navigationLeft: navigationBounds.left,
        navigationRight: navigationBounds.right,
        right: focusedBounds?.right ?? Number.POSITIVE_INFINITY,
      };
    });
    expect(focusedTabVisibility.left).toBeGreaterThanOrEqual(
      focusedTabVisibility.navigationLeft - 1,
    );
    expect(focusedTabVisibility.right).toBeLessThanOrEqual(
      focusedTabVisibility.navigationRight + 1,
    );
    await page.screenshot({
      animations: "disabled",
      path: path.join(settingsArtifacts, "mobile-keyboard-focus-320x800.png"),
    });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await expect(
      mobileSettingsNavigation.getByRole("link", { name: "Organizacja" }),
    ).toHaveAttribute("aria-current", "page");
    const forcedColorsAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(forcedColorsAccessibility.violations).toEqual([]);
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    await page.goto(`/panel/${organizationId}/prywatnosc`);
    await expect(page.getByRole("heading", { level: 2, name: "Retencja leadów" })).toBeVisible();
    await page.getByRole("button", { name: "Więcej opcji panelu" }).click();
    const moreToolsNavigation = page.getByRole("navigation", {
      name: "Pozostałe narzędzia panelu",
    });
    await expect(moreToolsNavigation.locator("a.is-active")).toHaveCount(1);
    await expect(moreToolsNavigation.locator('a[aria-current="page"]')).toHaveCount(1);
    await expect(
      moreToolsNavigation.getByRole("link", { name: "Dane i prywatność" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(moreToolsNavigation.getByRole("link", { name: "Ustawienia" })).not.toHaveClass(
      /is-active/,
    );

    await writeFile(
      path.join(m2ContextNavigationArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations: accessibility.violations.length,
          forcedColorsAccessibilityViolations: forcedColorsAccessibility.violations.length,
          desktop: {
            headingLevelOneCount: 1,
            integrationsNavigationItems: 2,
            settingsNavigationItems: 3,
            topbarHeight: settingsTopbarHeight,
          },
          mobile: mobileNavigationGeometry,
        },
        null,
        2,
      )}\n`,
    );
    await page.goto(`/panel/${organizationId}/procesy/${seededFlowId}`);
    await expect(page.locator(".panel-module-navigation")).toHaveCount(0);
    await expect(page.locator(".panel-page-header")).toHaveCount(0);
  });

  test("M4 shared controls stay consistent, accessible and responsive", async ({ page }) => {
    test.setTimeout(60_000);
    const settingsArtifacts = path.join(m4ControlArtifactDirectory, "settings");
    const privacyArtifacts = path.join(m4ControlArtifactDirectory, "privacy");
    const integrationsArtifacts = path.join(m4ControlArtifactDirectory, "integrations");
    await Promise.all([
      mkdir(settingsArtifacts, { recursive: true }),
      mkdir(privacyArtifacts, { recursive: true }),
      mkdir(integrationsArtifacts, { recursive: true }),
    ]);

    await page.setViewportSize({ height: 900, width: 1_440 });
    await page.goto(`/panel/${organizationId}/ustawienia`);
    const nameInput = page.getByRole("textbox", { name: "Nazwa organizacji" });
    const slugInput = page.getByRole("textbox", { name: "Identyfikator obszaru" });
    const saveButton = page.getByRole("button", { name: "Zapisz zmiany" });
    await expect(nameInput).toHaveClass(/wy-input/);
    await expect(slugInput).toBeDisabled();
    await expect(saveButton).toHaveClass(/wy-button--primary/);
    const desktopGeometry = await nameInput.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        borderRadius: Number.parseFloat(style.borderRadius),
        borderWidth: Number.parseFloat(style.borderTopWidth),
        height: bounds.height,
      };
    });
    expect(desktopGeometry.height).toBeGreaterThanOrEqual(44);
    expect(desktopGeometry.borderRadius).toBeCloseTo(8, 1);
    expect(desktopGeometry.borderWidth).toBeCloseTo(1, 1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(settingsArtifacts, "after-1440x900.png"),
    });
    await nameInput.focus();
    await expect(nameInput).toBeFocused();
    const focusOutline = await nameInput.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.outlineColor,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(focusOutline.width).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      animations: "disabled",
      path: path.join(settingsArtifacts, "focus-1440x900.png"),
    });
    const settingsAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(settingsAccessibility.violations).toEqual([]);

    await page.goto(`/panel/${organizationId}/prywatnosc`);
    const privacySwitch = page.getByRole("switch", { name: "Automatyczne usuwanie" });
    await expect(privacySwitch).toBeVisible();
    const initiallyChecked = await privacySwitch.isChecked();
    const switchBefore = await switchGeometry(privacySwitch);
    expect(switchBefore.width).toBeCloseTo(42, 1);
    expect(switchBefore.height).toBeCloseTo(24, 1);
    await privacySwitch.focus();
    await privacySwitch.press("Space");
    await expect(privacySwitch).toBeChecked({ checked: !initiallyChecked });
    await privacySwitch.press("Space");
    await expect(privacySwitch).toBeChecked({ checked: initiallyChecked });
    await privacySwitch.blur();
    await page.screenshot({
      animations: "disabled",
      path: path.join(privacyArtifacts, "after-1440x900.png"),
    });
    const privacyAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(privacyAccessibility.violations).toEqual([]);

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await privacySwitch.focus();
    await privacySwitch.screenshot({
      animations: "disabled",
      path: path.join(privacyArtifacts, "switch-forced-colors.png"),
    });
    const forcedColorsAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(forcedColorsAccessibility.violations).toEqual([]);
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    await page.goto(`/panel/${organizationId}/integracje/wordpress`);
    const originInput = page.getByRole("textbox", { name: "Origin strony WordPress" });
    await expect(originInput).toHaveClass(/wy-input/);
    await expect(page.getByRole("button", { name: "Wygeneruj token instalacyjny" })).toHaveClass(
      /wy-button--primary/,
    );
    await page.screenshot({
      animations: "disabled",
      path: path.join(integrationsArtifacts, "after-1440x900.png"),
    });

    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}/prywatnosc`);
    const mobileSwitch = page.getByRole("switch", { name: "Automatyczne usuwanie" });
    await expect(mobileSwitch).toBeVisible();
    const mobileGeometry = await page.evaluate(() => {
      const label = document.querySelector<HTMLElement>(".wy-switch");
      return {
        documentOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        switchTargetHeight: label?.getBoundingClientRect().height ?? 0,
      };
    });
    expect(mobileGeometry.documentOverflow).toBeLessThanOrEqual(1);
    expect(mobileGeometry.switchTargetHeight).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      animations: "disabled",
      path: path.join(privacyArtifacts, "mobile-320x800.png"),
    });
    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    const responsiveMatrix = [];
    for (const viewport of [
      { height: 812, width: 375 },
      { height: 844, width: 390 },
      { height: 932, width: 430 },
      { height: 900, width: 720 },
      { height: 1_024, width: 768 },
      { height: 768, width: 1_024 },
      { height: 800, width: 1_280 },
      { height: 1_024, width: 1_536 },
    ] as const) {
      await page.setViewportSize(viewport);
      await page.goto(`/panel/${organizationId}/ustawienia`);
      await expect(page.getByRole("textbox", { name: "Nazwa organizacji" })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `M4 overflow przy ${viewport.width} px`).toBeLessThanOrEqual(1);
      responsiveMatrix.push({ ...viewport, overflow });
    }

    await writeFile(
      path.join(m4ControlArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations:
            settingsAccessibility.violations.length +
            privacyAccessibility.violations.length +
            forcedColorsAccessibility.violations.length +
            mobileAccessibility.violations.length,
          desktop: desktopGeometry,
          focus: focusOutline,
          mobile: mobileGeometry,
          responsiveMatrix,
          switch: switchBefore,
        },
        null,
        2,
      )}\n`,
    );
  });

  test("M5 lead list scales past 100 records and becomes a real mobile task list", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await mkdir(m5LeadArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/leady`);

    await expect(page.getByRole("heading", { level: 1, name: "Leady" })).toBeVisible();
    await expect(page.locator(".record-table")).toBeVisible();
    await expect(page.locator(".lead-mobile-list")).toBeHidden();
    const total = Number(
      await page.locator(".record-list-meta p").first().locator("strong").textContent(),
    );
    expect(total).toBeGreaterThanOrEqual(101);
    await expect(page.locator(".lead-table tbody tr")).toHaveCount(8);
    expect(
      await page
        .locator(".lead-table tbody td")
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(13);

    const pagination = page.getByRole("navigation", { name: "Paginacja leadów" });
    await expect(pagination.getByLabel("Poprzednia strona")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(pagination.getByRole("link", { name: "Poprzednia strona" })).toHaveCount(0);
    const lastPageLink = pagination.locator("a").filter({ hasText: /^\d+$/ }).last();
    await lastPageLink.click();
    await expect(page).toHaveURL(/page=\d+/);
    await expect(page.locator(".lead-table tbody tr")).not.toHaveCount(0);
    await expect(
      page.getByRole("navigation", { name: "Paginacja leadów" }).getByLabel("Następna strona"),
    ).toHaveAttribute("aria-disabled", "true");

    await page.goto(`/panel/${organizationId}/leady`);
    const firstLeadLink = page.getByRole("link", { name: "Anna Kowalska", exact: true });
    await firstLeadLink.focus();
    await expect(firstLeadLink).toBeFocused();
    expect(
      await firstLeadLink.locator("xpath=ancestor::tr").evaluate((row) => {
        const style = getComputedStyle(row);
        return style.boxShadow !== "none" || style.backgroundColor !== "rgba(0, 0, 0, 0)";
      }),
    ).toBe(true);

    const search = page.getByRole("searchbox", { name: "Szukaj leadów" });
    await search.fill("Anna Kowalska");
    await search.press("Enter");
    await expect(page).toHaveURL(/q=Anna\+Kowalska/);
    await expect(page.locator(".lead-table tbody tr")).toHaveCount(1);
    await page
      .getByRole("navigation", { name: "Filtr statusu" })
      .getByRole("link", { name: /^Nowe\b/u })
      .click();
    await expect(page).toHaveURL(/status=new/);
    await expect(page).toHaveURL(/q=Anna\+Kowalska/);
    await search.fill("rekord który nie istnieje");
    await search.press("Enter");
    await expect(page.getByRole("heading", { name: "Brak pasujących leadów" })).toBeVisible();
    await expect(page.locator(".lead-table")).toHaveCount(0);
    await expect(page.locator(".record-list-meta p").first()).toContainText("0 wyników");

    await page.goto(`/panel/${organizationId}/leady`);
    await expect(page.locator(".lead-table tbody tr")).toHaveCount(8);
    await expect(page.locator(".lead-table tbody tr").first()).toBeVisible();
    await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m5LeadArtifactDirectory, "after.png"),
    });

    const responsiveMatrix: Array<{ height: number; overflow: number; width: number }> = [];
    for (const viewport of m5ResponsiveViewports) {
      await page.setViewportSize(viewport);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `M5 leady: overflow przy ${viewport.width} px`).toBeLessThanOrEqual(1);
      responsiveMatrix.push({ ...viewport, overflow });
    }

    await page.setViewportSize({ height: 844, width: 390 });
    await expect(page.locator(".record-table-wrap")).toBeHidden();
    await expect(page.locator(".lead-mobile-list")).toBeVisible();
    await expect(page.locator(".lead-mobile-list > li")).toHaveCount(8);
    const mobileOpenTarget = page
      .locator(".lead-mobile-list")
      .getByRole("link", { name: /Otwórz lead:/ })
      .first();
    expect(
      await mobileOpenTarget.evaluate((element) => element.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    expect(
      await page
        .getByRole("navigation", { name: "Paginacja leadów" })
        .getByLabel("Następna strona")
        .evaluate((element) => element.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m5LeadArtifactDirectory, "mobile-390x844.png"),
    });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await mobileOpenTarget.focus();
    const forcedColorsFocusOutline = await mobileOpenTarget.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).outlineWidth),
    );
    expect(forcedColorsFocusOutline).toBeGreaterThanOrEqual(2);
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
    await writeFile(
      path.join(m5LeadArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations: accessibility.violations.length,
          desktopPageSize: 8,
          forcedColorsFocusOutline,
          responsiveMatrix,
          total,
        },
        null,
        2,
      )}\n`,
    );
  });

  test("process list follows the flat M5 task-list anatomy", async ({ page }) => {
    await mkdir(m5ProcessArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/procesy`);

    await expect(page.getByRole("heading", { level: 1, name: "Procesy" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Wszystkie procesy" })).toBeVisible();
    await expect(page.locator(".processes-panel > .panel-page-header .panel-topbar")).toHaveCount(
      1,
    );
    await expect(page.getByText("Konfiguracja", { exact: true })).toHaveCount(0);
    expect(seededProcessCount).toBeGreaterThanOrEqual(101);
    await expect(page.getByText(`${seededProcessCount} procesów`, { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nowy proces" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}/szablony`,
    );
    await expect(page.locator(".process-list-row")).toHaveCount(processPageSize);
    await expect(page.locator(".process-table")).toHaveCount(0);

    const pagination = page.getByRole("navigation", { name: "Paginacja procesów" });
    await expect(pagination.getByLabel("Poprzednia strona")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    const processPageCount = Math.ceil(seededProcessCount / processPageSize);
    await pagination.getByRole("link", { name: String(processPageCount), exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`page=${processPageCount}`));
    await expect(page.locator(".process-list-row")).toHaveCount(
      seededProcessCount - (processPageCount - 1) * processPageSize,
    );
    await expect(
      page.getByRole("navigation", { name: "Paginacja procesów" }).getByLabel("Następna strona"),
    ).toHaveAttribute("aria-disabled", "true");

    await page.goto(`/panel/${organizationId}/procesy`);
    await expect(page.locator(".process-list-row")).toHaveCount(processPageSize);
    const unbrokenTitle = page.getByText(longUnbrokenProcessName, { exact: true });
    await expect(unbrokenTitle).toBeVisible();
    expect(
      await unbrokenTitle.evaluate((element) => element.scrollWidth - element.clientWidth),
    ).toBeLessThanOrEqual(1);

    const desktopGeometry = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll<HTMLElement>(".process-list-row"));
      const first = rows.at(0)?.getBoundingClientRect();
      const second = rows.at(1)?.getBoundingClientRect();
      const workspace = document
        .querySelector<HTMLElement>(".processes-panel")
        ?.getBoundingClientRect();
      const card = document
        .querySelector<HTMLElement>(".process-list-surface")
        ?.getBoundingClientRect();
      const title = document.querySelector<HTMLElement>(".panel-page-intro h1");
      return {
        cardWidth: card?.width ?? 0,
        firstHeight: first?.height ?? 0,
        gap: first && second ? second.top - first.bottom : 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        titleFontSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 0,
        workspaceWidth: workspace?.width ?? 0,
      };
    });
    expect(desktopGeometry.cardWidth).toBeGreaterThanOrEqual(desktopGeometry.workspaceWidth - 50);
    expect(desktopGeometry.firstHeight).toBeGreaterThanOrEqual(64);
    expect(desktopGeometry.firstHeight).toBeLessThanOrEqual(68);
    expect(desktopGeometry.gap).toBeGreaterThanOrEqual(-1);
    expect(desktopGeometry.gap).toBeLessThanOrEqual(1);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    expect(desktopGeometry.titleFontSize).toBeGreaterThanOrEqual(23);
    expect(desktopGeometry.titleFontSize).toBeLessThanOrEqual(25);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m5ProcessArtifactDirectory, "after.png"),
    });

    const firstProcess = page.getByRole("link", {
      name: /Kwalifikacja leadów — meble na wymiar/,
    });
    await expect(firstProcess).toHaveAttribute("href", /\/procesy\/[0-9a-f-]+$/);
    await expect(firstProcess).toHaveAccessibleName(
      /Status (?:Aktywny|Nieaktywny) Ostatnia zmiana/,
    );
    await firstProcess.focus();
    await expect(firstProcess).toBeFocused();
    await firstProcess.press("Enter");
    await expect(page.getByRole("heading", { level: 2, name: "Podgląd formularza" })).toBeVisible();

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/procesy`);
    await expect(page.locator(".process-list-row")).toHaveCount(processPageSize);
    await expect(
      page.getByText("Kwalifikacja leadów — meble na wymiar", { exact: true }),
    ).toBeVisible();
    await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(mobileOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m5ProcessArtifactDirectory, "mobile-390x844.png"),
    });

    const responsiveMatrix: Array<{ height: number; overflow: number; width: number }> = [];
    for (const viewport of m5ResponsiveViewports) {
      await page.setViewportSize(viewport);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `M5 procesy: overflow przy ${viewport.width} px`).toBeLessThanOrEqual(1);
      responsiveMatrix.push({ ...viewport, overflow });
    }
    await page.setViewportSize({ height: 800, width: 320 });
    expect(
      await page
        .getByText(longUnbrokenProcessName, { exact: true })
        .evaluate((element) => element.scrollWidth - element.clientWidth),
    ).toBeLessThanOrEqual(1);
    await page.setViewportSize({ height: 844, width: 390 });
    await expect(page.locator(".process-list-row").first()).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    const mobileFirstProcess = page.locator(".process-list-row").first();
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await mobileFirstProcess.focus();
    const forcedColorsFocusOutline = await mobileFirstProcess.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).outlineWidth),
    );
    expect(forcedColorsFocusOutline).toBeGreaterThanOrEqual(2);
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
    await writeFile(
      path.join(m5ProcessArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations: accessibility.violations.length,
          desktop: desktopGeometry,
          forcedColorsFocusOutline,
          responsiveMatrix,
          total: seededProcessCount,
        },
        null,
        2,
      )}\n`,
    );
  });

  test("builder autosaves, supports undo/redo and rejects a stale tab", async ({
    context,
    page,
  }) => {
    test.setTimeout(90_000);
    test.skip(!editorFlowId, "Test stanu buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await mkdir(builderStateArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(`/panel/${organizationId}/procesy/${editorFlowId}`);
    await expect(page.locator("#panel-sidebar")).toHaveAttribute("data-collapsed", "true");

    const firstTitle = page.locator(".flow-builder__inspector").getByLabel("Treść pytania");
    const originalTitle = await firstTitle.inputValue();
    const changedTitle =
      "Jaka jest przybliżona długość zabudowy oraz szerokość całego pomieszczenia w centymetrach? — autosave";
    const staleTitle = `${originalTitle} — druga karta`;
    const stalePage = await context.newPage();
    await stalePage.setViewportSize({ height: 1_086, width: 1_448 });
    await stalePage.goto(`/panel/${organizationId}/procesy/${editorFlowId}`);

    try {
      await firstTitle.fill(changedTitle);
      await expect(page.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });
      await expect
        .poll(async () =>
          firstTitle.evaluate(
            (element) => element.scrollHeight - (element as HTMLTextAreaElement).clientHeight,
          ),
        )
        .toBeLessThanOrEqual(1);
      const titleGeometry = await firstTitle.evaluate((element) => {
        const textarea = element as HTMLTextAreaElement;
        const style = getComputedStyle(textarea);
        return {
          clientHeight: textarea.clientHeight,
          clientWidth: textarea.clientWidth,
          lineHeight: Number.parseFloat(style.lineHeight),
          scrollHeight: textarea.scrollHeight,
          scrollWidth: textarea.scrollWidth,
          tagName: textarea.tagName,
          whiteSpace: style.whiteSpace,
        };
      });
      expect(titleGeometry.tagName).toBe("TEXTAREA");
      expect(titleGeometry.whiteSpace).not.toBe("nowrap");
      expect(titleGeometry.scrollHeight).toBeLessThanOrEqual(titleGeometry.clientHeight + 1);
      expect(titleGeometry.scrollWidth).toBeLessThanOrEqual(titleGeometry.clientWidth + 1);
      expect(titleGeometry.clientHeight).toBeGreaterThan(titleGeometry.lineHeight * 2);

      await page.getByRole("button", { exact: true, name: "Cofnij" }).click();
      await expect(firstTitle).toHaveValue(originalTitle);
      await expect(page.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });
      await page.getByRole("button", { name: "Ponów zmianę" }).click();
      await expect(firstTitle).toHaveValue(changedTitle);
      await expect(page.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      const staleTitleInput = stalePage
        .locator(".flow-builder__inspector")
        .getByLabel("Treść pytania");
      await staleTitleInput.fill(staleTitle);
      await expect(stalePage.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
      await expect(
        stalePage.getByText(/Konflikt wersji — lokalne zmiany nie zostały nadpisane/),
      ).toBeVisible({ timeout: 15_000 });
      const conflictToolbar = await stalePage.evaluate(() => {
        const bounds = (selector: string) => {
          const rectangle = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
          if (!rectangle) throw new Error(`Brak regionu ${selector}.`);
          return { left: rectangle.left, right: rectangle.right };
        };
        return {
          actions: bounds(".flow-builder__actions"),
          recovery: bounds(".flow-builder__save-state > button"),
          saveState: bounds(".flow-builder__save-state"),
        };
      });
      expect(conflictToolbar.saveState.right).toBeLessThanOrEqual(conflictToolbar.actions.left);
      expect(conflictToolbar.recovery.left).toBeGreaterThanOrEqual(conflictToolbar.saveState.left);
      expect(conflictToolbar.recovery.right).toBeLessThanOrEqual(conflictToolbar.saveState.right);
      await stalePage.getByRole("button", { name: "Wczytaj aktualną wersję" }).click();
      await stalePage.getByRole("button", { name: "Potwierdź" }).click();
      await expect(staleTitleInput).toHaveValue(changedTitle, {
        timeout: 15_000,
      });

      await page.getByRole("button", { name: "Zamknij ustawienia pytania" }).click();
      await expect(page.locator(".flow-builder__inspector")).toHaveCount(0);
      await expect(page.locator(".flow-builder__grid")).toHaveClass(/is-inspector-closed/);
      await page.getByRole("button", { name: "Ustawienia pytania" }).click();
      await expect(page.locator(".flow-builder__inspector")).toBeVisible();

      await page.screenshot({
        animations: "disabled",
        path: path.join(builderStateArtifactDirectory, "autosave-1448x1086.png"),
      });
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
    } finally {
      await stalePage.close();
      await page.bringToFront();
      await page.reload();
      if ((await firstTitle.inputValue()) !== originalTitle) {
        await firstTitle.fill(originalTitle);
        await expect(page.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
        await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
          timeout: 15_000,
        });
      }
    }
  });

  test("M7 builder uses relational workspace geometry and accessible segmented navigation", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    test.skip(!editorFlowId, "Test geometrii buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await mkdir(m7BuilderArtifactDirectory, { recursive: true });

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.reload();
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();
    await expect(page.locator("#panel-sidebar")).toHaveAttribute("data-collapsed", "true");

    const areaTabs = page.getByRole("tablist", { name: "Obszar konfiguracji procesu" });
    const areaTabItems = areaTabs.getByRole("tab");
    await expect(areaTabItems).toHaveCount(4);
    const initiallySelectedArea = areaTabs.locator('[role="tab"][aria-selected="true"]');
    await expect(initiallySelectedArea).toHaveCount(1);
    const initialArea = await initiallySelectedArea.getAttribute("id");
    const initialAreaState = await areaTabItems.evaluateAll((tabs) =>
      tabs.map((tab) => ({
        id: tab.id,
        selected: tab.getAttribute("aria-selected") === "true",
        tabIndex: (tab as HTMLButtonElement).tabIndex,
      })),
    );
    expect(initialAreaState.filter((tab) => tab.selected)).toHaveLength(1);
    expect(initialAreaState.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
    expect(initialAreaState.find((tab) => tab.selected)?.tabIndex).toBe(0);

    await initiallySelectedArea.focus();
    await initiallySelectedArea.press("End");
    const resultAreaTab = areaTabs.getByRole("tab", { exact: true, name: "Wynik" });
    await expect(resultAreaTab).toBeFocused();
    await expect(resultAreaTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#builder-workspace-panel")).toHaveAttribute(
      "aria-labelledby",
      "builder-area-tab-result",
    );
    await resultAreaTab.press("Home");
    const formAreaTab = areaTabs.getByRole("tab", { exact: true, name: "Formularz" });
    await expect(formAreaTab).toBeFocused();
    await expect(formAreaTab).toHaveAttribute("aria-selected", "true");
    if (initialArea && initialArea !== "builder-area-tab-form") {
      await areaTabs.locator(`#${initialArea}`).click();
    }

    const areaSegmentedGeometry = await readSegmentedControlGeometry(areaTabs);
    expectSegmentedControlVisualContract(areaSegmentedGeometry, { minimumTargetHeight: 44 });
    expect(areaSegmentedGeometry.itemsInsideTrack).toBe(true);
    expect(areaSegmentedGeometry.rowSpread).toBeLessThanOrEqual(1);
    expect(
      Math.max(...areaSegmentedGeometry.itemWidths) - Math.min(...areaSegmentedGeometry.itemWidths),
    ).toBeLessThanOrEqual(2);
    expect(Math.min(...areaSegmentedGeometry.horizontalGaps)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...areaSegmentedGeometry.horizontalGaps)).toBeLessThanOrEqual(8);

    await formAreaTab.click();
    const experienceModes = page.getByRole("radiogroup", { name: "Sposób wypełniania" });
    const experienceItems = experienceModes.getByRole("radio");
    await expect(experienceItems).toHaveCount(2);
    const initialExperience = experienceModes.locator('[role="radio"][aria-checked="true"]');
    await expect(initialExperience).toHaveCount(1);
    const initialExperienceMode = await initialExperience.getAttribute("data-experience-mode");
    await initialExperience.focus();
    await initialExperience.press("End");
    await expect(experienceItems.last()).toBeFocused();
    await expect(experienceItems.last()).toHaveAttribute("aria-checked", "true");
    await experienceItems.last().press("Home");
    await expect(experienceItems.first()).toBeFocused();
    await expect(experienceItems.first()).toHaveAttribute("aria-checked", "true");
    if (initialExperienceMode === "quick_form") {
      await experienceItems.last().click();
    }
    await expect(page.locator(".flow-builder__save-state")).toHaveAttribute("data-state", "saved", {
      timeout: 15_000,
    });
    const experienceSegmentedGeometry = await readSegmentedControlGeometry(experienceModes);
    expectSegmentedControlVisualContract(experienceSegmentedGeometry, {
      minimumTargetHeight: 44,
    });
    expect(experienceSegmentedGeometry.itemsInsideTrack).toBe(true);
    expect(experienceSegmentedGeometry.rowSpread).toBeLessThanOrEqual(1);

    const desktop = await page.evaluate(() => {
      const rect = (selector: string) => {
        const bounds = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!bounds) throw new Error(`Brak regionu ${selector}.`);
        return {
          bottom: bounds.bottom,
          height: bounds.height,
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          width: bounds.width,
        };
      };
      const functionalTextSamples = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".flow-builder--m7 button, .flow-builder--m7 a, .flow-builder--m7 input, .flow-builder--m7 select, .flow-builder--m7 textarea, .flow-builder--m7 label, .flow-builder--m7 small",
        ),
      )
        .filter(
          (element) =>
            element.getClientRects().length > 0 &&
            !element.closest('[aria-hidden="true"]') &&
            !element.classList.contains("wy-sr-only"),
        )
        .map((element) => ({
          className: element.className,
          fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
          tagName: element.tagName,
          text: element.textContent?.trim().slice(0, 80) ?? "",
        }));

      return {
        actions: rect(".flow-builder__actions"),
        areaTabs: rect(".flow-builder__area-tabs--primary"),
        builder: rect(".flow-builder--m7"),
        grid: rect(".flow-builder__grid"),
        identity: rect(".flow-builder__identity"),
        inspector: rect(".flow-builder__inspector"),
        functionalTextBelowMinimum: functionalTextSamples
          .filter((sample) => sample.fontSize < 12)
          .sort((left, right) => left.fontSize - right.fontSize),
        minimumFunctionalText: Math.min(...functionalTextSamples.map(({ fontSize }) => fontSize)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        preview: rect(".flow-builder__preview"),
        questions: rect(".flow-builder__questions"),
        rail: rect("#panel-sidebar"),
        saveState: rect(".flow-builder__save-state"),
        toolbar: rect(".flow-builder__toolbar"),
      };
    });
    const desktopCard = await page
      .locator(".flow-live-preview__viewport wyceno-widget")
      .locator(".wyceno-card")
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, top: bounds.top, width: bounds.width };
      });

    expect(desktop.rail.width).toBeGreaterThanOrEqual(71);
    expect(desktop.rail.width).toBeLessThanOrEqual(73);
    expect(desktop.toolbar.height).toBeGreaterThanOrEqual(63);
    expect(desktop.toolbar.height).toBeLessThanOrEqual(65);
    expect(desktop.areaTabs.width).toBeGreaterThanOrEqual(desktop.builder.width - 34);
    expect(desktop.areaTabs.width).toBeLessThanOrEqual(desktop.builder.width - 30);
    expect(desktop.areaTabs.top).toBeGreaterThanOrEqual(desktop.toolbar.bottom - 1);
    expect(desktop.grid.top).toBeGreaterThanOrEqual(desktop.areaTabs.bottom - 1);
    expect(desktop.questions.width).toBeGreaterThanOrEqual(288);
    expect(desktop.questions.width).toBeLessThanOrEqual(321);
    expect(desktop.preview.width).toBeGreaterThan(desktop.questions.width);
    expect(desktop.preview.width).toBeGreaterThan(desktop.inspector.width);
    expect(desktop.inspector.width).toBeGreaterThanOrEqual(300);
    expect(desktop.inspector.width).toBeLessThanOrEqual(341);
    expect(Math.abs(desktop.questions.left - desktop.grid.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(desktop.questions.right - desktop.preview.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(desktop.preview.right - desktop.inspector.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(desktop.inspector.right - desktop.grid.right)).toBeLessThanOrEqual(1);
    expect(desktopCard.width).toBeGreaterThan(400);
    expect(desktopCard.width).toBeLessThanOrEqual(desktop.preview.width);
    expect(desktopCard.left).toBeGreaterThanOrEqual(desktop.preview.left);
    expect(desktopCard.right).toBeLessThanOrEqual(desktop.preview.right);
    expect(desktop.identity.right).toBeLessThanOrEqual(desktop.saveState.left);
    expect(desktop.saveState.right).toBeLessThanOrEqual(desktop.actions.left);
    expect(desktop.inspector.right).toBeLessThanOrEqual(1_449);
    expect(
      desktop.minimumFunctionalText,
      JSON.stringify(desktop.functionalTextBelowMinimum, null, 2),
    ).toBeGreaterThanOrEqual(12);
    expect(desktop.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(m7BuilderArtifactDirectory, "after.png"),
    });

    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.getByRole("button", { name: "Rozwiń menu boczne" }).click();
    await expect(page.locator("#panel-sidebar")).toHaveAttribute("data-collapsed", "false");
    await expect
      .poll(() =>
        page.locator("#panel-sidebar").evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeGreaterThanOrEqual(255);
    await expect
      .poll(() =>
        page
          .locator(".flow-builder__preview")
          .evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeGreaterThanOrEqual(420);

    const expanded = await page.evaluate(() => {
      const rect = (selector: string) => {
        const bounds = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!bounds) throw new Error(`Brak regionu ${selector}.`);
        return { left: bounds.left, right: bounds.right, width: bounds.width };
      };
      return {
        actions: rect(".flow-builder__actions"),
        grid: rect(".flow-builder__grid"),
        identity: rect(".flow-builder__identity"),
        inspector: rect(".flow-builder__inspector"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        preview: rect(".flow-builder__preview"),
        questions: rect(".flow-builder__questions"),
        saveState: rect(".flow-builder__save-state"),
      };
    });

    expect(expanded.questions.width).toBeGreaterThanOrEqual(288);
    expect(expanded.questions.width).toBeLessThanOrEqual(321);
    expect(expanded.preview.width).toBeGreaterThanOrEqual(420);
    expect(expanded.inspector.width).toBeGreaterThanOrEqual(300);
    expect(expanded.inspector.width).toBeLessThanOrEqual(341);
    expect(Math.abs(expanded.questions.left - expanded.grid.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(expanded.questions.right - expanded.preview.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(expanded.preview.right - expanded.inspector.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(expanded.inspector.right - expanded.grid.right)).toBeLessThanOrEqual(1);
    expect(expanded.inspector.right).toBeLessThanOrEqual(1_449);
    expect(expanded.identity.right).toBeLessThanOrEqual(expanded.saveState.left);
    expect(expanded.saveState.right).toBeLessThanOrEqual(expanded.actions.left);
    expect(expanded.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(m7BuilderArtifactDirectory, "expanded-sidebar-1448x1086.png"),
    });

    await page.setViewportSize({ height: 1_024, width: 768 });
    await page.goto(builderUrl);
    const tabletPaneTabs = page.getByRole("tablist", { name: "Widok edytora" });
    await tabletPaneTabs.getByRole("tab", { name: "Ustawienia" }).press("Enter");
    await expect(page.locator(".flow-builder__inspector")).toBeVisible();
    await expect(page.locator(".flow-builder__preview")).toBeHidden();
    await page.getByLabel("Opcja 1").evaluate((element) => {
      (element as HTMLInputElement).value =
        "Bardzo długa polska odpowiedź sprawdzająca zawijanie i brak wypychania przycisku usuwania";
    });

    const tablet = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>(".question-options > div"),
      ).map((row) => {
        const input = row.querySelector<HTMLInputElement>("input")?.getBoundingClientRect();
        const remove = row.querySelector<HTMLButtonElement>("button")?.getBoundingClientRect();
        if (!input || !remove) throw new Error("Niepełny wiersz opcji odpowiedzi.");
        return {
          height: row.getBoundingClientRect().height,
          inputRight: input.right,
          inputTop: input.top,
          removeRight: remove.right,
          removeTop: remove.top,
        };
      });
      return {
        actions: document
          .querySelector<HTMLElement>(".flow-builder__actions")
          ?.getBoundingClientRect(),
        identity: document
          .querySelector<HTMLElement>(".flow-builder__identity")
          ?.getBoundingClientRect(),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rows,
      };
    });

    expect(tablet.identity, "Brak tożsamości procesu w toolbarze tabletu.").toBeTruthy();
    expect(tablet.actions, "Brak akcji w toolbarze tabletu.").toBeTruthy();
    expect(tablet.identity!.right).toBeLessThanOrEqual(tablet.actions!.left);
    for (const row of tablet.rows) {
      expect(row.height).toBeLessThanOrEqual(44);
      expect(Math.abs(row.inputTop - row.removeTop)).toBeLessThanOrEqual(3);
      expect(row.inputRight).toBeLessThanOrEqual(768);
      expect(row.removeRight).toBeLessThanOrEqual(768);
    }
    expect(tablet.overflow).toBeLessThanOrEqual(1);
    const tabletAreaGeometry = await readSegmentedControlGeometry(
      page.getByRole("tablist", { name: "Obszar konfiguracji procesu" }),
    );
    expectSegmentedControlVisualContract(tabletAreaGeometry, { minimumTargetHeight: 44 });

    await page.screenshot({
      animations: "disabled",
      path: path.join(m7BuilderArtifactDirectory, "tablet-768x1024.png"),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(builderUrl);
    const mobilePaneTabs = page.getByRole("tablist", { name: "Widok edytora" });
    const mobilePaneItems = mobilePaneTabs.getByRole("tab");
    await expect(mobilePaneItems).toHaveCount(3);
    const selectedMobilePane = mobilePaneTabs.locator('[role="tab"][aria-selected="true"]');
    await expect(selectedMobilePane).toHaveCount(1);
    await selectedMobilePane.focus();
    await selectedMobilePane.press("End");
    await expect(mobilePaneItems.last()).toBeFocused();
    await expect(mobilePaneItems.last()).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".flow-builder__inspector")).toHaveClass(/is-mobile-active/);
    await mobilePaneItems.last().press("Home");
    await expect(mobilePaneItems.first()).toBeFocused();
    await expect(mobilePaneItems.first()).toHaveAttribute("aria-selected", "true");
    await mobilePaneItems.first().press("ArrowRight");
    await expect(mobilePaneItems.nth(1)).toBeFocused();
    await expect(mobilePaneItems.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".flow-builder__preview")).toHaveClass(/is-mobile-active/);
    await page.getByLabel("Nazwa procesu").evaluate((element) => {
      (element as HTMLInputElement).value =
        "Bardzo długa nazwa procesu kwalifikacji klientów dla wieloetapowych realizacji usługowych";
    });

    const mobile = await page.evaluate(() => {
      const rect = (selector: string) => {
        const bounds = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!bounds) throw new Error(`Brak regionu ${selector}.`);
        return {
          height: bounds.height,
          left: bounds.left,
          right: bounds.right,
          width: bounds.width,
        };
      };
      const tabHeights = Array.from(
        document.querySelectorAll<HTMLElement>(".flow-builder__mobile-tabs button"),
      ).map((tab) => tab.getBoundingClientRect().height);
      return {
        actions: rect(".flow-builder__actions"),
        identity: rect(".flow-builder__identity"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tabHeights,
        toolbar: rect(".flow-builder__toolbar"),
      };
    });
    const mobileCard = await page
      .locator(".flow-live-preview__viewport wyceno-widget")
      .locator(".wyceno-card")
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right };
      });

    expect(mobile.toolbar.height).toBeLessThanOrEqual(62);
    expect(mobile.identity.right).toBeLessThanOrEqual(mobile.actions.left);
    expect(mobileCard.left).toBeGreaterThanOrEqual(0);
    expect(mobileCard.right).toBeLessThanOrEqual(390);
    expect(mobile.tabHeights.every((height) => height >= 44)).toBe(true);
    expect(mobile.overflow).toBeLessThanOrEqual(1);

    const mobilePaneGeometry = await readSegmentedControlGeometry(mobilePaneTabs);
    expectSegmentedControlVisualContract(mobilePaneGeometry, { minimumTargetHeight: 44 });
    expect(mobilePaneGeometry.itemsInsideTrack).toBe(true);
    expect(mobilePaneGeometry.rowSpread).toBeLessThanOrEqual(1);
    const mobileAreaGeometry = await readSegmentedControlGeometry(
      page.getByRole("tablist", { name: "Obszar konfiguracji procesu" }),
    );
    expectSegmentedControlVisualContract(mobileAreaGeometry, { minimumTargetHeight: 44 });
    const reducedMotionDurations = await page
      .locator(".panel-segmented-track > button")
      .evaluateAll((buttons) =>
        buttons.map((button) =>
          getComputedStyle(button)
            .transitionDuration.split(",")
            .map((duration) => Number.parseFloat(duration) || 0)
            .reduce((maximum, duration) => Math.max(maximum, duration), 0),
        ),
      );
    expect(reducedMotionDurations.every((duration) => duration <= 0.000_01)).toBe(true);

    await page.getByLabel("Więcej opcji publikacji").press("Enter");
    await expect(page.getByRole("button", { name: "Cofnij zmianę" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ponów zmianę" })).toBeVisible();
    await page.getByLabel("Więcej opcji publikacji").press("Enter");

    await page.screenshot({
      animations: "disabled",
      path: path.join(m7BuilderArtifactDirectory, "mobile-390x844.png"),
    });

    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await mobilePaneItems.nth(1).focus();
    const forcedColorsFocusOutline = await mobilePaneItems
      .nth(1)
      .evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth));
    expect(forcedColorsFocusOutline).toBeGreaterThanOrEqual(2);
    const forcedColorsAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(forcedColorsAccessibility.violations).toEqual([]);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m7BuilderArtifactDirectory, "forced-colors-390x844.png"),
    });
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    const responsiveMatrix: Array<{
      height: number;
      minimumSegmentTarget: number;
      overflow: number;
      reflowEquivalentTo200Percent: boolean;
      width: number;
    }> = [];
    for (const viewport of [
      { height: 844, width: 320 },
      { height: 844, width: 375 },
      { height: 844, width: 390 },
      { height: 844, width: 430 },
      { height: 1_024, width: 768 },
      { height: 768, width: 1_024 },
      { height: 800, width: 1_280 },
      { height: 900, width: 1_440 },
      { height: 1_024, width: 1_536 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(builderUrl);
      await expect(
        page.getByRole("tablist", { name: "Obszar konfiguracji procesu" }),
      ).toBeVisible();
      const measurement = await page.evaluate(() => {
        const segmentButtons = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".flow-builder--m7 .flow-builder__area-tabs--primary > button, .flow-builder--m7 .flow-builder__mobile-tabs > button",
          ),
        ).filter((button) => button.getClientRects().length > 0);
        return {
          segmentCount: segmentButtons.length,
          minimumSegmentTarget: Math.min(
            ...segmentButtons.map((button) => button.getBoundingClientRect().height),
          ),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      const overflow = measurement.overflow;
      expect(measurement.segmentCount).toBeGreaterThan(0);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(measurement.minimumSegmentTarget).toBeGreaterThanOrEqual(44);
      responsiveMatrix.push({
        ...viewport,
        ...measurement,
        reflowEquivalentTo200Percent: viewport.width === 768,
      });
    }

    await writeFile(
      path.join(m7BuilderArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations:
            desktopAccessibility.violations.length +
            mobileAccessibility.violations.length +
            forcedColorsAccessibility.violations.length,
          desktop,
          expanded,
          forcedColorsFocusOutline,
          responsiveMatrix,
          segmented: {
            area: areaSegmentedGeometry,
            experience: experienceSegmentedGeometry,
            mobileArea: mobileAreaGeometry,
            mobilePane: mobilePaneGeometry,
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  });

  test("builder reorders questions accessibly and validates typed boundaries", async ({ page }) => {
    test.skip(!editorFlowId, "Test interakcji buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await Promise.all([
      mkdir(path.join(builderInteractionArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderInteractionArtifactDirectory, "tablet"), { recursive: true }),
      mkdir(path.join(builderInteractionArtifactDirectory, "mobile"), { recursive: true }),
    ]);

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();

    const reorderHandles = page.locator("[data-reorder-step]");
    const initialOrder = await reorderHandles.evaluateAll((handles) =>
      handles.map((handle) => handle.getAttribute("data-reorder-step")),
    );
    expect(initialOrder.length).toBeGreaterThanOrEqual(2);
    const sourceKey = initialOrder[0]!;
    const targetKey = initialOrder[1]!;
    const sourceHandle = page.locator(`[data-reorder-step="${sourceKey}"]`);
    const targetRow = page.locator(`[data-reorder-step="${targetKey}"]`).locator("..");

    await sourceHandle.dragTo(targetRow, {
      targetPosition: {
        x: 160,
        y: Math.max(1, (await targetRow.boundingBox())!.height - 2),
      },
    });
    await expect(page.locator("[data-reorder-step]").nth(1)).toHaveAttribute(
      "data-reorder-step",
      sourceKey,
    );
    await expect(
      page.getByRole("status").filter({ hasText: "Przeniesiono pytanie" }),
    ).toBeVisible();
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await page.locator(`[data-reorder-step="${sourceKey}"]`).press("Alt+ArrowUp");
    await expect(page.locator("[data-reorder-step]").first()).toHaveAttribute(
      "data-reorder-step",
      sourceKey,
    );
    await expect(page.locator(`[data-reorder-step="${sourceKey}"]`)).toBeFocused();
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await page
      .locator(".question-list__select")
      .filter({ hasText: "Jaki jest przybliżony metraż?" })
      .click();
    const minimum = page.getByLabel("Minimum", { exact: true });
    const maximum = page.getByLabel("Maksimum", { exact: true });
    await expect(minimum).toBeVisible();
    await minimum.fill("20");
    await maximum.fill("10");
    await expect(
      page
        .getByText("Minimalna wartość nie może przekraczać maksymalnej.", { exact: true })
        .first(),
    ).toBeVisible();
    await expect(minimum).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("button", { name: "Opublikuj proces" })).toBeDisabled();
    await page.waitForTimeout(1_100);
    await expect(
      page.getByText("Minimalna wartość nie może przekraczać maksymalnej.").first(),
    ).toBeVisible();

    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderInteractionArtifactDirectory,
        "desktop",
        "validation-error-1448x1086.png",
      ),
    });

    await maximum.fill("30");
    await expect(page.getByText("Minimalna wartość nie może przekraczać maksymalnej.")).toHaveCount(
      0,
    );
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "Opublikuj proces" })).toBeEnabled();

    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 1_024, width: 768 });
    await page.getByRole("tab", { name: "Ustawienia" }).click();
    await expect(page.locator(".flow-builder__inspector")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderInteractionArtifactDirectory, "tablet", "validation-768x1024.png"),
    });

    await page.getByRole("button", { name: "Wyczyść" }).click();
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await page.reload();
    await expect(page.locator(".flow-builder__grid")).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderInteractionArtifactDirectory,
        "desktop",
        "after-production-1448x1086.png",
      ),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await page.getByRole("tab", { name: "Pytania" }).click();
    await expect(page.locator(".flow-builder__questions")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderInteractionArtifactDirectory,
        "mobile",
        "question-reorder-390x844.png",
      ),
    });

    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);
  });

  test("builder manages sections safely across desktop, tablet and mobile", async ({ page }) => {
    test.setTimeout(90_000);
    test.skip(!editorFlowId, "Test sekcji buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await Promise.all([
      mkdir(path.join(builderSectionArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderSectionArtifactDirectory, "tablet"), { recursive: true }),
      mkdir(path.join(builderSectionArtifactDirectory, "mobile"), { recursive: true }),
    ]);

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();

    const sectionGroups = page.locator("[data-section-key]");
    const questionHandles = page.locator("[data-reorder-step]");
    const initialSectionKeys = await sectionGroups.evaluateAll((sections) =>
      sections.map((section) => section.getAttribute("data-section-key")),
    );
    const initialQuestionKeys = await questionHandles.evaluateAll((questions) =>
      questions.map((question) => question.getAttribute("data-reorder-step")),
    );
    const undo = page.getByRole("button", { exact: true, name: "Cofnij" });

    try {
      await page.getByRole("button", { name: /Sekcja$/ }).click();
      const sectionTitle = page.getByLabel("Nazwa sekcji");
      await expect(sectionTitle).toBeFocused();
      await sectionTitle.fill("Zakres dodatkowy");
      await page.screenshot({
        animations: "disabled",
        path: path.join(builderSectionArtifactDirectory, "desktop", "section-rename-1448x1086.png"),
      });
      await sectionTitle.press("Enter");
      await expect(page.getByText("Zakres dodatkowy", { exact: true })).toBeVisible();
      await expect(sectionGroups).toHaveCount(initialSectionKeys.length + 1);
      await expect(questionHandles).toHaveCount(initialQuestionKeys.length + 1);
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      let addedSection = sectionGroups.filter({ hasText: "Zakres dodatkowy" });
      const sectionKey = await addedSection.getAttribute("data-section-key");
      expect(sectionKey).toBeTruthy();
      const sectionToggle = addedSection.locator("[data-section-toggle]");
      const sectionQuestionList = addedSection.locator(".question-list");

      await sectionToggle.click();
      await expect(sectionToggle).toHaveAttribute("aria-expanded", "false");
      await expect(sectionQuestionList).toBeHidden();
      await sectionToggle.click();
      await expect(sectionQuestionList).toBeVisible();
      await sectionToggle.press("Alt+ArrowDown");
      await expect(sectionToggle).toBeFocused();
      await expect(
        page.getByRole("status").filter({ hasText: "Przeniesiono sekcję" }),
      ).toBeVisible();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      const desktopOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(desktopOverflow).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(
          builderSectionArtifactDirectory,
          "desktop",
          "section-management-1448x1086.png",
        ),
      });
      const desktopAccessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(desktopAccessibility.violations).toEqual([]);

      await page.setViewportSize({ height: 1_024, width: 768 });
      await page.getByRole("tab", { name: "Pytania" }).click();
      await expect(page.locator(".flow-builder__questions")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(
          builderSectionArtifactDirectory,
          "tablet",
          "section-management-768x1024.png",
        ),
      });

      await page.setViewportSize({ height: 844, width: 390 });
      await page.getByRole("tab", { name: "Pytania" }).click();
      await expect(page.locator(".flow-builder__questions")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(
          builderSectionArtifactDirectory,
          "mobile",
          "section-management-390x844.png",
        ),
      });
      const mobileAccessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(mobileAccessibility.violations).toEqual([]);

      await page.setViewportSize({ height: 1_086, width: 1_448 });
      addedSection = sectionGroups.filter({ hasText: "Zakres dodatkowy" });
      const sectionActions = addedSection.getByLabel("Akcje sekcji „Zakres dodatkowy”");
      await sectionActions.click();
      await addedSection.getByRole("button", { name: "Usuń sekcję" }).click();
      const deleteDialog = page.getByRole("dialog", {
        name: "Usuń sekcję „Zakres dodatkowy”?",
      });
      await expect(deleteDialog).toBeVisible();
      await expect(deleteDialog).toContainText("1 pytanie");
      const targetSection = deleteDialog.getByLabel("Przenieś pytania do");
      const targetSectionKey = await targetSection.inputValue();
      await page.screenshot({
        animations: "disabled",
        path: path.join(
          builderSectionArtifactDirectory,
          "desktop",
          "section-delete-dialog-1448x1086.png",
        ),
      });
      await deleteDialog.getByRole("button", { name: "Anuluj" }).click();
      await expect(sectionActions).toBeFocused();

      await sectionActions.click();
      await addedSection.getByRole("button", { name: "Usuń sekcję" }).click();
      await deleteDialog.getByRole("button", { name: "Usuń i przenieś" }).click();
      await expect(page.getByText("Zakres dodatkowy", { exact: true })).toHaveCount(0);
      await expect(sectionGroups).toHaveCount(initialSectionKeys.length);
      await expect(questionHandles).toHaveCount(initialQuestionKeys.length + 1);
      await expect(page.locator(`[data-section-toggle="${targetSectionKey}"]`)).toBeFocused();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await page.setViewportSize({ height: 1_086, width: 1_448 });
      if (
        await page
          .getByRole("dialog")
          .isVisible()
          .catch(() => false)
      ) {
        await page.keyboard.press("Escape");
      }
      for (let index = 0; index < 8 && (await undo.isEnabled()); index += 1) {
        await undo.click();
      }
      await expect(sectionGroups).toHaveCount(initialSectionKeys.length);
      await expect(questionHandles).toHaveCount(initialQuestionKeys.length);
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("builder reorders answer options without changing their identity", async ({ page }) => {
    test.skip(!editorFlowId, "Test sortowania opcji wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await Promise.all([
      mkdir(path.join(builderOptionArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderOptionArtifactDirectory, "tablet"), { recursive: true }),
      mkdir(path.join(builderOptionArtifactDirectory, "mobile"), { recursive: true }),
    ]);

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();

    const optionHandles = page.locator("[data-reorder-option]");
    const optionOrder = () =>
      optionHandles.evaluateAll((handles) =>
        handles.map((handle) => handle.getAttribute("data-reorder-option")),
      );
    const initialOrder = await optionOrder();
    expect(initialOrder.length).toBeGreaterThanOrEqual(3);
    const sourceKey = initialOrder[0]!;
    const targetKey = initialOrder[1]!;
    const sourceHandle = page.locator(`[data-reorder-option="${sourceKey}"]`);
    const targetRow = page.locator(`[data-option-row="${targetKey}"]`);
    const undo = page.getByRole("button", { exact: true, name: "Cofnij" });
    const redo = page.getByRole("button", { exact: true, name: "Ponów zmianę" });

    try {
      await sourceHandle.dragTo(targetRow, {
        targetPosition: {
          x: 160,
          y: Math.max(1, (await targetRow.boundingBox())!.height - 2),
        },
      });
      await expect(optionHandles.nth(1)).toHaveAttribute("data-reorder-option", sourceKey);
      await expect(
        page.getByRole("status").filter({ hasText: "Przeniesiono opcję" }),
      ).toBeVisible();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      await undo.click();
      await expect(optionHandles.first()).toHaveAttribute("data-reorder-option", sourceKey);
      await redo.click();
      await expect(optionHandles.nth(1)).toHaveAttribute("data-reorder-option", sourceKey);
      await page.locator(`[data-reorder-option="${sourceKey}"]`).press("Alt+ArrowUp");
      await expect(optionHandles.first()).toHaveAttribute("data-reorder-option", sourceKey);
      await expect(page.locator(`[data-reorder-option="${sourceKey}"]`)).toBeFocused();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(builderOptionArtifactDirectory, "desktop", "option-reorder-1448x1086.png"),
      });
      const desktopAccessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(desktopAccessibility.violations).toEqual([]);

      await page.setViewportSize({ height: 1_024, width: 768 });
      await page.getByRole("tab", { name: "Ustawienia" }).click();
      await expect(page.locator(".flow-builder__inspector")).toBeVisible();
      await expect(page.getByLabel(/^Akcje opcji/).first()).toBeVisible();
      await page.screenshot({
        animations: "disabled",
        path: path.join(builderOptionArtifactDirectory, "tablet", "option-reorder-768x1024.png"),
      });

      await page.setViewportSize({ height: 844, width: 390 });
      await expect(page.locator(".flow-builder__inspector")).toBeVisible();
      const sourceRow = page.locator(`[data-option-row="${sourceKey}"]`);
      await sourceRow.getByLabel(/^Akcje opcji/).click();
      await sourceRow.getByRole("button", { name: "Przenieś niżej" }).click();
      await expect(optionHandles.nth(1)).toHaveAttribute("data-reorder-option", sourceKey);
      await sourceRow.getByLabel(/^Akcje opcji/).click();
      await sourceRow.getByRole("button", { name: "Przenieś wyżej" }).click();
      await expect(optionHandles.first()).toHaveAttribute("data-reorder-option", sourceKey);
      await expect(page.locator(`[data-reorder-option="${sourceKey}"]`)).toBeFocused();
      await expect(page.locator(".flow-builder__save-state")).toHaveAttribute(
        "data-state",
        "saved",
        { timeout: 15_000 },
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(builderOptionArtifactDirectory, "mobile", "option-reorder-390x844.png"),
      });
      await sourceRow.getByLabel(/^Akcje opcji/).click();
      await expect(sourceRow.getByRole("button", { name: "Przenieś niżej" })).toBeVisible();
      await page.screenshot({
        animations: "disabled",
        path: path.join(builderOptionArtifactDirectory, "mobile", "option-actions-390x844.png"),
      });
      const mobileAccessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(mobileAccessibility.violations).toEqual([]);
      await sourceRow.getByLabel(/^Akcje opcji/).click();
    } finally {
      await page.setViewportSize({ height: 1_086, width: 1_448 });
      for (let index = 0; index < 8; index += 1) {
        if (JSON.stringify(await optionOrder()) === JSON.stringify(initialOrder)) break;
        if (!(await undo.isEnabled())) break;
        await undo.click();
      }
      expect(await optionOrder()).toEqual(initialOrder);
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("owner configures, previews and publishes pricing, scoring and result safely", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    test.skip(!editorFlowId, "Test estymacji buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await Promise.all([
      mkdir(path.join(builderEstimationArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderEstimationArtifactDirectory, "mobile"), { recursive: true }),
    ]);

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();

    const areaTabs = page.getByRole("tablist", { name: "Obszar konfiguracji procesu" });
    const undo = page.getByRole("button", { exact: true, name: "Cofnij" });
    await areaTabs.getByRole("tab", { exact: true, name: "Wycena" }).click();
    const setup = page.locator(".estimation-setup");
    await expect(setup).toBeVisible();
    await setup.locator("label").filter({ hasText: "Minimum" }).locator("input").fill("10000");
    await setup.locator("label").filter({ hasText: "Maksimum" }).locator("input").fill("15000");
    await setup.getByRole("button", { name: "Włącz wycenę i scoring" }).click();

    await expect(page.locator(".estimation-result-preview__price")).toContainText(
      /10.?000.*15.?000/,
    );
    await page.getByRole("button", { name: "Dodaj regułę ceny" }).click();
    await page.getByLabel("Nazwa wewnętrzna").fill("Dopłata za pierwszy wybór");
    await page.locator(".estimation-condition").getByLabel("Warunek").selectOption("equals");
    await page.getByLabel("Operacja").selectOption("multiply");
    await page.getByLabel("Mnożnik w procentach").fill("120");
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await areaTabs.getByRole("tab", { exact: true, name: "Formularz" }).click();
    await page.locator(".question-options__remove").first().click();
    const impactDialog = page.getByRole("dialog", { name: /Zmień/ });
    await expect(impactDialog).toContainText("Dopłata za pierwszy wybór");
    await expect(impactDialog).toContainText("warunek ceny");
    await impactDialog.getByRole("button", { name: "Anuluj" }).click();
    await expect(impactDialog).toBeHidden();

    const formAreaTabs = page.getByRole("tablist", { name: "Obszar konfiguracji procesu" });
    await formAreaTabs.getByRole("tab", { exact: true, name: "Scoring" }).click();
    await page.getByRole("button", { name: "Dodaj kategorię" }).click();
    await page.getByLabel("Nazwa kategorii 2").fill("Priorytet");
    expect(runtimeErrors).toEqual([]);
    await page.getByRole("button", { name: "Dodaj regułę scoringu" }).click();
    await page.getByLabel("Nazwa wewnętrzna").fill("Punkty za kompletną odpowiedź");
    await page.getByLabel("Punkty").fill("25");

    const scoringAreaTabs = page.getByRole("tablist", {
      name: "Obszar konfiguracji procesu",
    });
    await scoringAreaTabs.getByRole("tab", { exact: true, name: "Wynik" }).click();
    await page.getByLabel("Nagłówek wyniku").fill("Orientacyjna wycena jest gotowa");
    await page.getByLabel("Następny krok").fill("Przekaż dane do bezpłatnej konsultacji");
    await expect(page.locator(".estimation-result-preview")).toContainText(
      "Orientacyjna wycena jest gotowa",
    );
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: "Opublikuj proces" }).click();
    await expect(
      page.getByText("Zapisano i opublikowano nową wersję.", { exact: true }),
    ).toBeVisible({
      timeout: 20_000,
    });
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderEstimationArtifactDirectory, "desktop", "result-1448x1086.png"),
    });
    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 844, width: 390 });
    const mobileAreaTabs = page.getByRole("tablist", {
      name: "Obszar konfiguracji procesu",
    });
    await expect(mobileAreaTabs).toBeVisible();
    await mobileAreaTabs.getByRole("tab", { exact: true, name: "Scoring" }).click();
    await page.getByRole("tab", { exact: true, name: "Ustawienia" }).click();
    await expect(page.locator(".estimation-builder__inspector")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const mobileTabHeights = await page
      .locator(".flow-builder__area-tabs--primary button, .flow-builder__mobile-tabs button")
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
    expect(mobileTabHeights.every((height) => height >= 44)).toBe(true);
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderEstimationArtifactDirectory, "mobile", "scoring-390x844.png"),
    });
    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    const resultAreaTab = mobileAreaTabs.getByRole("tab", { exact: true, name: "Wynik" });
    await resultAreaTab.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Ustawienia · Wynik" })).toBeVisible();
    const scoringAreaTab = mobileAreaTabs.getByRole("tab", { exact: true, name: "Scoring" });
    await scoringAreaTab.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Ustawienia · Scoring" })).toBeVisible();

    await page.setViewportSize({ height: 800, width: 320 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await expect(page.locator(".estimation-builder__inspector")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const forcedColorsAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(forcedColorsAccessibility.violations).toEqual([]);
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderEstimationArtifactDirectory, "mobile", "forced-colors-320x800.png"),
    });
    expect(runtimeErrors).toEqual([]);

    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page
      .getByRole("tablist", { name: "Obszar konfiguracji procesu" })
      .getByRole("tab", { name: "Wycena" })
      .click();
    for (let index = 0; index < 30 && (await setup.count()) === 0; index += 1) {
      if (!(await undo.isEnabled())) break;
      await undo.click();
    }
    await expect(setup).toBeVisible();
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("builder and privacy switches keep pill geometry and native keyboard behavior", async ({
    page,
  }) => {
    test.skip(!editorFlowId, "Test przełącznika buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await Promise.all([
      mkdir(path.join(builderToggleArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderToggleArtifactDirectory, "tablet"), { recursive: true }),
      mkdir(path.join(builderToggleArtifactDirectory, "mobile"), { recursive: true }),
      mkdir(path.join(builderToggleArtifactDirectory, "settings"), { recursive: true }),
    ]);

    const assertPillGeometry = async (input: Locator, translateX: number) => {
      await expect
        .poll(async () => (await switchGeometry(input)).knobTranslateX)
        .toBeCloseTo(translateX, 1);
      const geometry = await switchGeometry(input);
      expect(geometry.width).toBeCloseTo(42, 1);
      expect(geometry.height).toBeCloseTo(24, 1);
      expect(geometry.minHeight).toBeCloseTo(24, 1);
      expect(geometry.borderRadius).toBeGreaterThanOrEqual(12);
      expect(geometry.knobWidth).toBeCloseTo(18, 1);
      expect(geometry.knobHeight).toBeCloseTo(18, 1);
      expect(geometry.knobTop).toBeCloseTo(2, 1);
      expect(geometry.knobLeft).toBeCloseTo(2, 1);
      expect([
        geometry.paddingBottom,
        geometry.paddingLeft,
        geometry.paddingRight,
        geometry.paddingTop,
      ]).toEqual([0, 0, 0, 0]);
    };

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(builderUrl);
    const builderSwitch = page.locator('.question-inspector__switch > input[type="checkbox"]');
    await expect(builderSwitch).toBeVisible();

    const initiallyChecked = await builderSwitch.isChecked();
    await builderSwitch.focus();
    const focusedGeometry = await switchGeometry(builderSwitch);
    expect(focusedGeometry.outlineStyle).toBe("solid");
    expect(focusedGeometry.outlineWidth).toBeGreaterThanOrEqual(3);
    await assertPillGeometry(builderSwitch, initiallyChecked ? 18 : 0);
    await expect(page.locator(".question-inspector select").first()).toHaveCSS(
      "min-height",
      "42px",
    );
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "desktop", "builder-1448x1086.png"),
    });
    await builderSwitch.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "desktop", "switch-checked-42x24.png"),
    });

    await builderSwitch.press("Space");
    await expect(builderSwitch).toBeChecked({ checked: !initiallyChecked });
    await assertPillGeometry(builderSwitch, initiallyChecked ? 0 : 18);
    await builderSwitch.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "desktop", "switch-unchecked-42x24.png"),
    });
    await builderSwitch.press("Space");
    await expect(builderSwitch).toBeChecked({ checked: initiallyChecked });
    await builderSwitch.evaluate((element) => {
      element.disabled = true;
    });
    await expect(builderSwitch).toBeDisabled();
    await expect(builderSwitch).toHaveCSS("cursor", "not-allowed");
    await expect(builderSwitch).toHaveCSS("opacity", "0.55");
    await builderSwitch.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "desktop", "switch-disabled-42x24.png"),
    });
    await builderSwitch.evaluate((element) => {
      element.disabled = false;
    });

    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 1_024, width: 768 });
    await page.goto(builderUrl);
    await page.getByRole("tab", { name: "Ustawienia" }).click();
    await expect(builderSwitch).toBeVisible();
    await assertPillGeometry(builderSwitch, (await builderSwitch.isChecked()) ? 18 : 0);
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "tablet", "builder-768x1024.png"),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(builderUrl);
    await page.getByRole("tab", { name: "Ustawienia" }).click();
    await expect(builderSwitch).toBeVisible();
    await assertPillGeometry(builderSwitch, (await builderSwitch.isChecked()) ? 18 : 0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "mobile", "builder-390x844.png"),
    });
    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/prywatnosc`);
    const privacySwitch = page.locator('.wy-switch__control[type="checkbox"]');
    await expect(privacySwitch).toBeVisible();
    const privacyInitiallyChecked = await privacySwitch.isChecked();
    await assertPillGeometry(privacySwitch, privacyInitiallyChecked ? 18 : 0);
    await privacySwitch.press("Space");
    await expect(privacySwitch).toBeChecked({ checked: !privacyInitiallyChecked });
    await privacySwitch.press("Space");
    await expect(privacySwitch).toBeChecked({ checked: privacyInitiallyChecked });
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "settings", "privacy-1536x1024.png"),
    });
    const privacyAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(privacyAccessibility.violations).toEqual([]);

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await privacySwitch.focus();
    await assertPillGeometry(privacySwitch, privacyInitiallyChecked ? 18 : 0);
    await privacySwitch.screenshot({
      animations: "disabled",
      path: path.join(builderToggleArtifactDirectory, "settings", "switch-forced-colors.png"),
    });
  });

  test("lead detail fills the workspace and scales its right column", async ({ page }) => {
    await mkdir(leadDetailArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/leady`);

    const leadLink = page.getByRole("link", { exact: true, name: "Anna Kowalska" });
    await expect(leadLink).toBeVisible();
    const leadHref = await leadLink.getAttribute("href");
    if (!leadHref) throw new Error("Brak linku do demonstracyjnego leada.");
    await page.goto(leadHref);
    await expect(page.getByRole("heading", { level: 1, name: "Anna Kowalska" })).toBeVisible();
    const operations = page.getByRole("complementary", { name: "Obsługa leada" });
    await expect(operations.getByRole("heading", { name: "Obsługa leada" })).toBeVisible();
    await expect(operations.getByLabel("Status leada")).toBeVisible();
    await expect(operations.getByLabel("Priorytet leada")).toBeVisible();
    await expect(operations.getByRole("button", { name: "Zaplanuj kontakt" })).toBeVisible();
    await expect(operations.getByRole("button", { name: "Utwórz zadanie" })).toBeVisible();

    await operations.getByRole("button", { name: "Zaplanuj kontakt" }).click();
    const taskDialog = page.getByRole("dialog");
    await expect(taskDialog.getByRole("heading", { name: "Zaplanuj kontakt" })).toBeVisible();
    const taskTitle = `Kontakt testowy E2E ${Date.now()}`;
    await taskDialog.getByLabel("Nazwa").fill(taskTitle);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const localDateTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
    await taskDialog.getByLabel("Termin").fill(localDateTime);
    await taskDialog.getByRole("button", { name: "Zaplanuj kontakt" }).click();
    await expect(taskDialog).toBeHidden();
    const createdTask = operations.getByRole("listitem").filter({
      hasText: taskTitle,
    });
    await expect(createdTask).toBeVisible();
    await createdTask.getByRole("button", { name: "Oznacz działanie jako wykonane" }).click();
    await expect(createdTask).toBeHidden({ timeout: 15_000 });

    const desktopGeometry = await page.evaluate(() => {
      const workspace = document
        .querySelector<HTMLElement>(".lead-reference-page")
        ?.getBoundingClientRect();
      const article = document
        .querySelector<HTMLElement>(".lead-reference")
        ?.getBoundingClientRect();
      const score = document
        .querySelector<HTMLElement>(".lead-reference-score")
        ?.getBoundingClientRect();
      const side = document
        .querySelector<HTMLElement>(".lead-reference-summary__side")
        ?.getBoundingClientRect();
      return {
        articleWidth: article?.width ?? 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        scoreWidth: score?.width ?? 0,
        sideWidth: side?.width ?? 0,
        workspaceWidth: workspace?.width ?? 0,
      };
    });
    expect(desktopGeometry.articleWidth).toBeGreaterThanOrEqual(
      desktopGeometry.workspaceWidth - 50,
    );
    expect(desktopGeometry.scoreWidth).toBeGreaterThanOrEqual(desktopGeometry.articleWidth * 0.7);
    expect(desktopGeometry.sideWidth).toBeGreaterThanOrEqual(288);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await page.screenshot({
      animations: "disabled",
      path: path.join(leadDetailArtifactDirectory, "after-production-1536x1024.png"),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(leadHref);
    await expect(page.getByRole("heading", { level: 1, name: "Anna Kowalska" })).toBeVisible();
    const mobileGeometry = await page.evaluate(() => {
      const article = document
        .querySelector<HTMLElement>(".lead-reference")
        ?.getBoundingClientRect();
      const materials = document
        .querySelector<HTMLElement>(".lead-reference-materials")
        ?.getBoundingClientRect();
      const score = document
        .querySelector<HTMLElement>(".lead-reference-score")
        ?.getBoundingClientRect();
      return {
        articleWidth: article?.width ?? 0,
        materialsRight: materials?.right ?? 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        scoreWidth: score?.width ?? 0,
        viewportWidth: document.documentElement.clientWidth,
      };
    });
    expect(mobileGeometry.articleWidth).toBeGreaterThanOrEqual(350);
    expect(mobileGeometry.scoreWidth).toBeGreaterThanOrEqual(mobileGeometry.articleWidth - 32);
    expect(mobileGeometry.materialsRight).toBeLessThanOrEqual(mobileGeometry.viewportWidth);
    expect(mobileGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(leadDetailArtifactDirectory, "after-production-390x844.png"),
    });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  test("M6 lead workspace keeps every section and real operation durable", async ({ page }) => {
    test.setTimeout(120_000);
    await mkdir(m6LeadArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    const leadHref = await openSeededLeadDetail(page);
    const article = page.locator(".lead-reference--m6");
    const operations = page.getByRole("complementary", { name: "Obsługa leada" });
    const tabs = page.getByRole("navigation", { name: "Sekcje szczegółów leada" });

    await expect(article).toBeVisible();
    await expect(article.locator(".lead-reference__identity img")).toHaveCount(0);
    await expect(article.locator(".lead-reference__avatar")).toHaveText("AK");
    await expect(
      article.getByRole("link", { exact: true, name: "visualqa+anna@example.invalid" }),
    ).toHaveAttribute("href", "mailto:visualqa+anna@example.invalid");
    await expect(
      article.getByRole("link", { exact: true, name: "+48 600 123 456" }),
    ).toHaveAttribute("href", "tel:+48 600 123 456");
    await expect(article.locator(".lead-reference-score__value > span")).toHaveText(
      "Wysokie dopasowanie",
    );
    await expect(article.locator(".lead-reference-score__reasons li")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "Preferencje kontaktu" })).toBeVisible();
    await expect(page.getByText("Po południu (12:00–17:00)", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kontekst wejścia" })).toBeVisible();
    await expect(page.locator(".lead-reference-context dd").last()).toContainText(
      "PROJEKT-BEZPIECZNY-DLUGI-IDENTYFIKATOR",
    );

    const sections = [
      { hash: "#summary-panel", id: "summary-panel", label: "Podsumowanie" },
      { hash: "#answers-panel", id: "answers-panel", label: "Odpowiedzi" },
      { hash: "#files-panel", id: "files-panel", label: "Pliki" },
      { hash: "#history-panel", id: "history-panel", label: "Historia" },
    ] as const;

    for (const section of sections) {
      const tab = tabs.getByRole("link", { exact: true, name: section.label });
      await tab.click();
      await expect.poll(() => new URL(page.url()).hash).toBe(section.hash);
      await expect(tab).toHaveAttribute("aria-current", "location");
      const panel = page.locator(`#${section.id}`);
      await expect(panel).toBeVisible();
      await expect(panel).toBeFocused();
      await expect(operations).toBeVisible();

      if (section.id === "answers-panel") {
        expect(await panel.locator("dl > div").count()).toBeGreaterThanOrEqual(9);
        await expect(panel).toContainText("spokojnej, ergonomicznej przestrzeni");
      }
      if (section.id === "files-panel") {
        const fileLinks = panel.getByRole("link", { name: /^Otwórz plik / });
        await expect(fileLinks).toHaveCount(3);
        for (const fileLink of await fileLinks.all()) {
          await expect(fileLink).toHaveAttribute(
            "href",
            /\/storage\/v1\/object\/sign\/tenant-private\//,
          );
        }
      }
    }

    const timelineValues = await page
      .locator("#history-panel li[data-occurred-at]")
      .evaluateAll((items) => items.map((item) => item.getAttribute("data-occurred-at") ?? ""));
    expect(timelineValues.length).toBeGreaterThanOrEqual(5);
    const timelineDates = timelineValues.map((value) => Date.parse(value));
    expect(timelineDates.every(Number.isFinite)).toBe(true);
    for (let index = 1; index < timelineDates.length; index += 1) {
      expect(timelineDates[index - 1]).toBeGreaterThanOrEqual(timelineDates[index]);
    }
    await page.getByText("Prywatność i zgody", { exact: true }).click();
    await expect(page.getByRole("link", { name: "Eksportuj dane JSON" })).toBeVisible();
    await expect(page.getByLabel("Powód blokady prawnej")).toBeVisible();
    await expect(page.getByLabel(/Trwale usuń dane i pliki/)).toBeVisible();

    await tabs.getByRole("link", { exact: true, name: "Podsumowanie" }).click();
    const priority = operations.getByLabel("Priorytet leada");
    const originalPriority = await priority.inputValue();
    const changedPriority = originalPriority === "high" ? "low" : "high";
    const waitForServerAction = () =>
      page.waitForResponse(
        (response) => response.request().method() === "POST" && response.url().includes("/leady/"),
      );

    await Promise.all([waitForServerAction(), priority.selectOption(changedPriority)]);
    await page.reload();
    await expect(operations.getByLabel("Priorytet leada")).toHaveValue(changedPriority);

    const noteBody = "Klient potwierdził, że preferuje kontakt e-mail po południu.";
    await operations.getByLabel("Nowa notatka").fill(noteBody);
    await Promise.all([
      waitForServerAction(),
      operations.getByRole("button", { name: "Zapisz notatkę" }).click(),
    ]);
    await expect(operations.getByText(noteBody, { exact: true }).first()).toBeVisible();
    await page.reload();
    await expect(operations.getByText(noteBody, { exact: true }).first()).toBeVisible();

    const createTaskButton = operations.getByRole("button", { name: "Utwórz zadanie" });
    await createTaskButton.click();
    let taskDialog = page.getByRole("dialog");
    await expect(taskDialog).toBeVisible();
    await taskDialog.getByRole("button", { name: "Zamknij okno" }).click();
    await expect(taskDialog).toBeHidden();
    await expect(createTaskButton).toBeFocused();

    const taskTitle = `Kontrola trwałości M6 ${Date.now()}`;
    const taskDescription = "Zadanie tworzone i zamykane przez prawdziwe akcje serwerowe E2E.";
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1_000);
    const localDateTime = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16);
    await createTaskButton.click();
    taskDialog = page.getByRole("dialog");
    await taskDialog.getByLabel("Nazwa").fill(taskTitle);
    await taskDialog.getByLabel("Termin").fill(localDateTime);
    await taskDialog.getByLabel("Szczegóły").fill(taskDescription);
    await Promise.all([
      waitForServerAction(),
      taskDialog.getByRole("button", { exact: true, name: "Utwórz zadanie" }).click(),
    ]);
    await expect(taskDialog).toBeHidden();
    let createdTask = operations.getByRole("listitem").filter({ hasText: taskTitle });
    await expect(createdTask).toContainText(taskDescription);
    await page.reload();
    createdTask = operations.getByRole("listitem").filter({ hasText: taskTitle });
    await expect(createdTask).toContainText(taskDescription);
    await Promise.all([
      waitForServerAction(),
      createdTask.getByRole("button", { name: "Oznacz działanie jako wykonane" }).click(),
    ]);
    await expect(createdTask).toBeHidden();
    await page.reload();
    await expect(operations.getByRole("listitem").filter({ hasText: taskTitle })).toHaveCount(0);

    await tabs.getByRole("link", { exact: true, name: "Historia" }).click();
    await expect(
      page.locator("#history-panel").getByText(noteBody, { exact: true }).first(),
    ).toBeVisible();
    await tabs.getByRole("link", { exact: true, name: "Podsumowanie" }).click();
    await Promise.all([
      waitForServerAction(),
      operations.getByLabel("Priorytet leada").selectOption(originalPriority),
    ]);
    await page.reload();
    await expect(operations.getByLabel("Priorytet leada")).toHaveValue(originalPriority);
    expect(new URL(page.url()).pathname).toBe(new URL(leadHref, page.url()).pathname);
  });

  test("M6 Sales can work on a lead without assignment and owner privacy controls", async ({
    browser,
    page,
  }) => {
    test.setTimeout(90_000);
    test.skip(!salesEmail || !salesPassword, "Test M6 roli Sales wymaga PANEL_E2E_SALES_*.");
    if (!organizationId || !salesEmail || !salesPassword) {
      throw new Error("Brak danych konta Sales dla testu M6.");
    }
    const leadHref = await openSeededLeadDetail(page);
    const salesContext = await browser.newContext({ viewport: { height: 900, width: 1_440 } });
    try {
      const salesPage = await salesContext.newPage();
      await signInWithCredentials(salesPage, salesEmail, salesPassword, organizationId);
      await salesPage.goto(leadHref);
      await expect(
        salesPage.getByRole("heading", { level: 1, name: "Anna Kowalska" }),
      ).toBeVisible();
      const operations = salesPage.getByRole("complementary", { name: "Obsługa leada" });
      await expect(operations.getByLabel("Status leada")).toBeVisible();
      await expect(operations.getByLabel("Priorytet leada")).toBeVisible();
      await expect(operations.getByLabel("Właściciel leada")).toHaveCount(0);
      await expect(
        operations.locator(".lead-operations__field").filter({ hasText: "Właściciel" }),
      ).toContainText(/Anna Kowalska|Nieprzypisany/);
      await expect(
        operations
          .getByRole("listitem")
          .filter({ hasText: "Kontakt w sprawie terminu realizacji" })
          .getByRole("button", { name: "Oznacz działanie jako wykonane" }),
      ).toHaveCount(0);

      await salesPage
        .getByRole("navigation", { name: "Sekcje szczegółów leada" })
        .getByRole("link", { name: "Historia" })
        .click();
      await salesPage.getByText("Prywatność i zgody", { exact: true }).click();
      await expect(salesPage.getByRole("link", { name: "Eksportuj dane JSON" })).toHaveCount(0);
      await expect(salesPage.getByLabel("Powód blokady prawnej")).toHaveCount(0);
      await expect(salesPage.getByLabel(/Trwale usuń dane i pliki/)).toHaveCount(0);
      await expect(salesPage.getByRole("button", { name: "Usuń dane leada" })).toHaveCount(0);
    } finally {
      await salesContext.close();
    }
  });

  test("M6 lead workspace reflows from 320 to 1536 with an accessible sticky action", async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await mkdir(m6LeadArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    const leadHref = await openSeededLeadDetail(page);
    await expect(page.locator(".lead-reference-materials img").first()).toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: 0 }));

    const desktopGeometry = await page.evaluate(() => {
      const article = document.querySelector<HTMLElement>(".lead-reference--m6");
      const workspace = document.querySelector<HTMLElement>(".lead-reference-workspace");
      const workspaceDocument = document.querySelector<HTMLElement>(
        ".lead-reference-workspace__document",
      );
      const rail = document.querySelector<HTMLElement>(".lead-reference-summary__side");
      const articleBounds = article?.getBoundingClientRect();
      const documentBounds = workspaceDocument?.getBoundingClientRect();
      const railBounds = rail?.getBoundingClientRect();
      return {
        articleWidth: articleBounds?.width ?? 0,
        documentBeforeRail: Boolean(
          workspaceDocument &&
          rail &&
          workspaceDocument.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        documentWidth: documentBounds?.width ?? 0,
        gridTemplateColumns: workspace ? getComputedStyle(workspace).gridTemplateColumns : "",
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        railLeft: railBounds?.left ?? 0,
        railWidth: railBounds?.width ?? 0,
      };
    });
    expect(desktopGeometry.articleWidth).toBeGreaterThan(900);
    expect(desktopGeometry.documentBeforeRail).toBe(true);
    expect(desktopGeometry.documentWidth).toBeGreaterThan(desktopGeometry.railWidth);
    expect(desktopGeometry.railLeft).toBeGreaterThan(desktopGeometry.documentWidth);
    expect(desktopGeometry.railWidth).toBeGreaterThanOrEqual(288);
    expect(desktopGeometry.railWidth).toBeLessThanOrEqual(321);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m6LeadArtifactDirectory, "after.png"),
    });
    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    const sections = [
      { id: "summary-panel", label: "Podsumowanie" },
      { id: "answers-panel", label: "Odpowiedzi" },
      { id: "files-panel", label: "Pliki" },
      { id: "history-panel", label: "Historia" },
    ] as const;
    const responsiveMatrix: Array<{
      height: number;
      minimumPrimaryTarget: number | null;
      sections: Array<{ id: string; overflow: number }>;
      stacked: boolean;
      width: number;
    }> = [];

    for (const viewport of m6ResponsiveViewports) {
      await page.setViewportSize(viewport);
      await page.goto(leadHref);
      await expect(page.getByRole("heading", { level: 1, name: "Anna Kowalska" })).toBeVisible();
      const sectionMeasurements: Array<{ id: string; overflow: number }> = [];
      for (const section of sections) {
        await page
          .getByRole("navigation", { name: "Sekcje szczegółów leada" })
          .getByRole("link", { exact: true, name: section.label })
          .click();
        await expect(page.locator(`#${section.id}`)).toBeVisible();
        await expect(page.getByRole("complementary", { name: "Obsługa leada" })).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(
          overflow,
          `M6 szczegół leada: ${section.id}, overflow przy ${viewport.width} px`,
        ).toBeLessThanOrEqual(1);
        sectionMeasurements.push({ id: section.id, overflow });
      }

      await page
        .getByRole("navigation", { name: "Sekcje szczegółów leada" })
        .getByRole("link", { exact: true, name: "Podsumowanie" })
        .click();
      const layout = await page.evaluate(() => {
        const workspaceDocument = document.querySelector<HTMLElement>(
          ".lead-reference-workspace__document",
        );
        const rail = document.querySelector<HTMLElement>(".lead-reference-summary__side");
        const documentBounds = workspaceDocument?.getBoundingClientRect();
        const railBounds = rail?.getBoundingClientRect();
        return {
          documentBeforeRail: Boolean(
            workspaceDocument &&
            rail &&
            workspaceDocument.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING,
          ),
          stacked: Boolean(
            documentBounds && railBounds && railBounds.top >= documentBounds.bottom - 1,
          ),
        };
      });
      expect(layout.documentBeforeRail).toBe(true);
      if (viewport.width <= 1_024) expect(layout.stacked).toBe(true);
      if (viewport.width >= 1_280) expect(layout.stacked).toBe(false);

      let minimumPrimaryTarget: number | null = null;
      if (viewport.width <= 430) {
        const primaryTargets = await page.locator(".lead-reference--m6").evaluate((root) => {
          const selector = [
            ".lead-reference__back",
            ".lead-reference__contact a",
            ".lead-reference-tabs a",
            ".lead-operations select",
            ".lead-operations button",
            ".lead-reference-primary-action",
            ".lead-reference-file-open",
            ".lead-reference-history summary",
          ].join(",");
          return [...root.querySelectorAll<HTMLElement>(selector)]
            .map((element) => element.getBoundingClientRect())
            .filter((bounds) => bounds.width > 2 && bounds.height > 2)
            .map((bounds) => bounds.height);
        });
        expect(primaryTargets.length).toBeGreaterThan(8);
        minimumPrimaryTarget = Math.min(...primaryTargets);
        expect(
          minimumPrimaryTarget,
          `M6 szczegół leada: minimalny cel dotykowy przy ${viewport.width} px`,
        ).toBeGreaterThanOrEqual(44);
      }
      responsiveMatrix.push({
        ...viewport,
        minimumPrimaryTarget,
        sections: sectionMeasurements,
        stacked: layout.stacked,
      });
    }

    await page.setViewportSize({ height: 1_024, width: 768 });
    await page.goto(`${leadHref}#summary-panel`);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await page.screenshot({
      animations: "disabled",
      path: path.join(m6LeadArtifactDirectory, "tablet-768x1024.png"),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`${leadHref}#summary-panel`);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await page.screenshot({
      animations: "disabled",
      path: path.join(m6LeadArtifactDirectory, "mobile-390x844.png"),
    });
    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    const stickyAction = page.locator('[data-sticky-action="true"]');
    const railRange = await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>(".lead-reference-summary__side");
      const bounds = rail?.getBoundingClientRect();
      return {
        height: bounds?.height ?? 0,
        top: (bounds?.top ?? 0) + window.scrollY,
      };
    });
    const stickyCheckpoint = railRange.top + Math.max(0, (railRange.height - 844) * 0.55);
    await page.evaluate((top) => window.scrollTo({ top }), stickyCheckpoint);
    await expect(stickyAction).toBeInViewport();
    const stickyGeometry = await stickyAction.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        height: bounds.height,
        position: getComputedStyle(element).position,
        top: bounds.top,
        viewportHeight: window.innerHeight,
      };
    });
    expect(stickyGeometry.position).toBe("sticky");
    expect(stickyGeometry.top).toBeGreaterThanOrEqual(0);
    expect(stickyGeometry.bottom).toBeLessThanOrEqual(stickyGeometry.viewportHeight + 1);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight }));
    const finalContentGeometry = await page.evaluate(() => {
      const action = document.querySelector<HTMLElement>('[data-sticky-action="true"]');
      const tasks = document.querySelector<HTMLElement>(".lead-operations__tasks");
      const actionBounds = action?.getBoundingClientRect();
      const tasksBounds = tasks?.getBoundingClientRect();
      return {
        actionTop: actionBounds?.top ?? 0,
        tasksBottom: tasksBounds?.bottom ?? 0,
      };
    });
    expect(finalContentGeometry.tasksBottom).toBeLessThanOrEqual(
      finalContentGeometry.actionTop + 1,
    );
    await page.screenshot({
      animations: "disabled",
      path: path.join(m6LeadArtifactDirectory, "sticky-action-390x844.png"),
    });

    await page.goto(`${leadHref}#summary-panel`);
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    const activeTab = page
      .getByRole("navigation", { name: "Sekcje szczegółów leada" })
      .getByRole("link", { exact: true, name: "Podsumowanie" });
    await activeTab.focus();
    const forcedColorsFocusOutline = await activeTab.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).outlineWidth),
    );
    expect(forcedColorsFocusOutline).toBeGreaterThanOrEqual(2);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m6LeadArtifactDirectory, "forced-colors-390x844.png"),
    });
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    await writeFile(
      path.join(m6LeadArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations:
            desktopAccessibility.violations.length + mobileAccessibility.violations.length,
          desktop: desktopGeometry,
          forcedColorsFocusOutline,
          responsiveMatrix,
          sticky: stickyGeometry,
        },
        null,
        2,
      )}\n`,
    );
  });

  test("template library is a flat M5 task list with durable filters and real actions", async ({
    browser,
    page,
  }) => {
    await mkdir(m5TemplateArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/szablony`);

    await expect(page.getByRole("heading", { level: 1, name: "Szablony branżowe" })).toBeVisible();
    await expect(page.locator(".template-card")).toHaveCount(5);
    await expect(page.getByRole("button", { name: "Użyj szablonu" })).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Moje procesy" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}/procesy`,
    );
    await expect(page.getByRole("link", { name: "Nowy proces" })).toHaveCount(0);
    await expect(page.getByLabel("Szukaj szablonu")).toBeVisible();
    await expect(page.getByLabel("Kategoria")).toBeVisible();
    await expect(page.getByLabel("Złożoność")).toBeVisible();
    await expect(page.getByLabel("Sortowanie")).toBeVisible();
    await expect(page.locator(".template-summary-card")).toHaveCount(0);
    await expect(page.locator(".template-card__media")).toHaveCount(0);
    await expect(page.locator('input[name="templateName"]')).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "O szablonie: Meble na wymiar" })).toBeVisible();

    const desktopGeometry = await page.evaluate(() => {
      const workspace = document
        .querySelector<HTMLElement>(".templates-panel")
        ?.getBoundingClientRect();
      const surface = document
        .querySelector<HTMLElement>(".template-library-surface")
        ?.getBoundingClientRect();
      const rows = Array.from(document.querySelectorAll<HTMLElement>(".template-task-row")).map(
        (row) => row.getBoundingClientRect(),
      );
      const firstTitle = document.querySelector<HTMLElement>(".template-task-row h2");
      return {
        detail: document.querySelector<HTMLElement>(".template-detail")?.getBoundingClientRect(),
        firstTitleFontSize: firstTitle
          ? Number.parseFloat(getComputedStyle(firstTitle).fontSize)
          : 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rowGaps: rows.slice(1).map((row, index) => row.top - (rows[index]?.bottom ?? row.top)),
        rowHeights: rows.map((row) => row.height),
        rowWidths: rows.map((row) => row.width),
        surfaceWidth: surface?.width ?? 0,
        toolbarHeight:
          document.querySelector<HTMLElement>(".template-toolbar")?.getBoundingClientRect()
            .height ?? 0,
        workspaceWidth: workspace?.width ?? 0,
      };
    });
    expect(desktopGeometry.surfaceWidth).toBeGreaterThanOrEqual(
      desktopGeometry.workspaceWidth - 50,
    );
    expect(Math.min(...desktopGeometry.rowWidths)).toBeGreaterThanOrEqual(
      desktopGeometry.surfaceWidth - 50,
    );
    expect(Math.min(...desktopGeometry.rowHeights)).toBeGreaterThanOrEqual(108);
    expect(Math.max(...desktopGeometry.rowHeights)).toBeLessThanOrEqual(132);
    expect(Math.max(...desktopGeometry.rowGaps)).toBeLessThanOrEqual(1);
    expect(desktopGeometry.firstTitleFontSize).toBeGreaterThanOrEqual(13);
    expect(desktopGeometry.toolbarHeight).toBeGreaterThanOrEqual(92);
    expect(desktopGeometry.toolbarHeight).toBeLessThanOrEqual(100);
    expect(desktopGeometry.detail?.width ?? 0).toBeGreaterThanOrEqual(
      desktopGeometry.surfaceWidth - 50,
    );
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m5TemplateArtifactDirectory, "after.png"),
    });

    const templateSearch = page.getByLabel("Szukaj szablonu");
    await templateSearch.fill("szablon który nie istnieje");
    await expect(page.getByRole("heading", { name: "Nie znaleziono szablonów" })).toBeVisible();
    await expect(page.locator(".template-card")).toHaveCount(0);
    await page.getByRole("button", { name: "Wyczyść filtry" }).click();
    await expect(page.locator(".template-card")).toHaveCount(5);
    await templateSearch.fill("klimatyzacja");
    await expect(page.locator(".template-card")).toHaveCount(1);
    await expect(page.locator(".template-toolbar__result")).toContainText("1");
    await expect(page).toHaveURL(/q=klimatyzacja/);
    await page.getByLabel("Szukaj szablonu").fill("");
    await page.getByLabel("Złożoność").selectOption("advanced");
    await expect(page.locator(".template-card")).toHaveCount(2);
    await expect(page).toHaveURL(/complexity=advanced/);
    await page.getByLabel("Złożoność").selectOption("all");
    await page.getByLabel("Sortowanie").selectOption("questions");
    await expect(page).toHaveURL(/sort=questions/);
    await page.getByLabel("Sortowanie").selectOption("default");
    await page.getByLabel("Kategoria").selectOption({ label: "Ogrodzenia" });
    await expect(page.locator(".template-card")).toHaveCount(1);
    await expect(page).toHaveURL(/category=Ogrodzenia/);
    await page.getByLabel("Kategoria").selectOption("all");
    await page.goBack();
    await expect(page.getByLabel("Kategoria")).toHaveValue("Ogrodzenia");
    await expect(page.locator(".template-card")).toHaveCount(1);
    await page.reload();
    await expect(page).toHaveURL(/category=Ogrodzenia/);
    await expect(page.getByLabel("Kategoria")).toHaveValue("Ogrodzenia");
    await expect(page.locator(".template-card")).toHaveCount(1);
    await page.goForward();
    await expect(page.getByLabel("Kategoria")).toHaveValue("all");
    await expect(page.locator(".template-card")).toHaveCount(5);
    const renovationCard = page.locator('[data-template-slug="remonty"]');
    await renovationCard.getByRole("button", { name: "Podgląd" }).press("Enter");
    await expect(page.getByRole("heading", { name: "O szablonie: Remonty" })).toBeVisible();
    await expect(page.locator(".template-detail")).toBeFocused();
    await expect(renovationCard.getByRole("button", { name: "Podgląd" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "Pełny podgląd szablonu" }).click();
    await expect(page.getByRole("heading", { name: "Pytania w szablonie" })).toBeVisible();
    await expect(page.locator(".template-detail__questions li")).toHaveCount(5);

    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/szablony`);
    await expect(page.locator(".template-card")).toHaveCount(5);
    await expect(page.locator(".template-summary-card")).toHaveCount(0);
    const mobileGeometry = await page.evaluate(() => {
      const surface = document
        .querySelector<HTMLElement>(".template-library-surface")
        ?.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".template-card")).map(
        (card) => card.getBoundingClientRect(),
      );
      const firstAction = document
        .querySelector<HTMLElement>(".template-task-row__actions")
        ?.getBoundingClientRect();
      return {
        cardsInsideSurface: cards.every(
          (card) =>
            surface !== undefined &&
            card.left >= surface.left &&
            card.right <= surface.right &&
            card.width > 0,
        ),
        firstActionBottom: firstAction?.bottom ?? Number.POSITIVE_INFINITY,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(mobileGeometry.cardsInsideSurface).toBe(true);
    expect(mobileGeometry.firstActionBottom).toBeLessThanOrEqual(844);
    expect(mobileGeometry.overflow).toBeLessThanOrEqual(1);
    expect(
      await page
        .locator(".template-task-row__actions .wy-button")
        .first()
        .evaluate((element) => element.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      animations: "disabled",
      path: path.join(m5TemplateArtifactDirectory, "mobile-390x844.png"),
    });
    await page.locator(".template-card").nth(1).getByRole("button", { name: "Podgląd" }).click();
    const focusedMobileDetail = page.locator(".template-detail");
    await expect(focusedMobileDetail).toBeFocused();
    const focusedDetailTop = await focusedMobileDetail.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    expect(focusedDetailTop).toBeGreaterThanOrEqual(0);
    expect(focusedDetailTop).toBeLessThan(844);

    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}/szablony`);
    await expect(page.locator(".template-card")).toHaveCount(5);
    const responsiveMatrix: Array<{ height: number; overflow: number; width: number }> = [];
    for (const viewport of m5ResponsiveViewports) {
      await page.setViewportSize(viewport);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `M5 szablony: overflow przy ${viewport.width} px`).toBeLessThanOrEqual(1);
      responsiveMatrix.push({ ...viewport, overflow });
    }
    await page.setViewportSize({ height: 800, width: 320 });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    const firstTemplateAction = page
      .locator(".template-task-row__actions")
      .getByRole("button")
      .first();
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await firstTemplateAction.focus();
    const forcedColorsFocusOutline = await firstTemplateAction.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).outlineWidth),
    );
    expect(forcedColorsFocusOutline).toBeGreaterThanOrEqual(2);
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
    await writeFile(
      path.join(m5TemplateArtifactDirectory, "measurements.json"),
      `${JSON.stringify(
        {
          accessibilityViolations:
            desktopAccessibility.violations.length + accessibility.violations.length,
          desktop: desktopGeometry,
          forcedColorsFocusOutline,
          mobile: mobileGeometry,
          responsiveMatrix,
        },
        null,
        2,
      )}\n`,
    );

    if (!organizationId || !salesEmail || !salesPassword) {
      throw new Error("Brak danych konta Sales dla negatywnego testu Szablonów.");
    }
    const salesContext = await browser.newContext({ viewport: { height: 844, width: 390 } });
    try {
      const salesPage = await salesContext.newPage();
      await signInWithCredentials(salesPage, salesEmail, salesPassword, organizationId);
      await salesPage.goto(`/panel/${organizationId}/szablony`);
      await expect(
        salesPage.getByRole("heading", { name: "Szablony są chwilowo niedostępne" }),
      ).toBeVisible();
      await expect(salesPage.locator(".template-card")).toHaveCount(0);
      await expect(salesPage.getByRole("button", { name: "Użyj szablonu" })).toHaveCount(0);
    } finally {
      await salesContext.close();
    }

    await page.getByRole("button", { name: "Użyj szablonu" }).first().click();
    await expect(page).toHaveURL(new RegExp(`/panel/${organizationId}/procesy/[0-9a-f-]+$`));
    await expect(page.getByLabel("Nazwa procesu")).toHaveValue(
      "Meble na wymiar — brief inwestycji",
    );
  });

  test("analytics expands the dashboard style with period-scoped detail", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await mkdir(analyticsArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/analityka?days=30`);

    await expect(page.getByRole("heading", { level: 1, name: "Analityka" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Zakres analityki" }).getByRole("link"),
    ).toHaveCount(3);
    await expect(page.getByRole("link", { name: "30 dni" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.locator(".metric-grid .metric-card")).toHaveCount(4);
    await expect(page.locator(".metric-card__footer strong")).toHaveCount(4);
    await expect(page.getByText("49 leadów z wyceną w PLN", { exact: true })).toBeVisible();
    await expect(page.locator(".lead-volume-chart li")).toHaveCount(30);

    for (const section of [
      "Liczba leadów",
      "Jakość leadów",
      "Lejek procesu",
      "Rozkład score",
      "Źródła ruchu",
      "Urządzenia",
      "Drop-off kroków",
      "Wersje procesu",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }
    await expect(page.locator(".analytics-funnel-flow > li")).toHaveCount(4);
    await expect(page.locator(".analytics-score-bubbles > li")).toHaveCount(2);
    await expect(page.locator(".analytics-waffle")).toHaveCount(2);
    await expect(page.locator(".analytics-dropoff-grid")).toBeVisible();
    await expect(page.locator(".analytics-version-grid")).toBeVisible();
    await expect(
      page.locator(
        ".analytics-details-grid progress, .analytics-grid progress, .analytics-bottom-grid progress",
      ),
    ).toHaveCount(0);

    const desktopGeometry = await page.evaluate(() => {
      const topbar = document.querySelector<HTMLElement>(".analytics-panel .panel-topbar");
      const metrics = Array.from(
        document.querySelectorAll<HTMLElement>(".analytics-panel .metric-card"),
      ).map((card) => card.getBoundingClientRect());
      const bottomCards = Array.from(
        document.querySelectorAll<HTMLElement>(".analytics-bottom-grid > .panel-card"),
      ).map((card) => card.getBoundingClientRect());
      return {
        bottomWidths: bottomCards.map((card) => card.width),
        metricHeights: metrics.map((card) => card.height),
        metricYPositions: metrics.map((card) => card.y),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        topbarHeight: topbar?.getBoundingClientRect().height ?? 0,
      };
    });
    expect(desktopGeometry.topbarHeight).toBeGreaterThanOrEqual(53);
    expect(desktopGeometry.topbarHeight).toBeLessThanOrEqual(55);
    expect(
      Math.max(...desktopGeometry.metricYPositions) - Math.min(...desktopGeometry.metricYPositions),
    ).toBeLessThanOrEqual(1);
    expect(Math.min(...desktopGeometry.metricHeights)).toBeGreaterThanOrEqual(116);
    expect(Math.max(...desktopGeometry.metricHeights)).toBeLessThanOrEqual(120);
    expect(desktopGeometry.bottomWidths[0]).toBeGreaterThan(desktopGeometry.bottomWidths[1] ?? 0);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(analyticsArtifactDirectory, "after-production-1536x1024.png"),
    });
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(analyticsArtifactDirectory, "after-production-1536x-full.png"),
    });

    await page.getByRole("link", { name: "7 dni" }).press("Enter");
    await expect(page).toHaveURL(/analityka\?days=7$/);
    await expect(page.getByRole("link", { name: "7 dni" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".lead-volume-chart li")).toHaveCount(7);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/analityka?days=30`);
    await expect(page.locator(".metric-grid .metric-card")).toHaveCount(4);
    const mobileGeometry = await page.evaluate(() => {
      const metrics = Array.from(
        document.querySelectorAll<HTMLElement>(".analytics-panel .metric-card"),
      ).map((card) => card.getBoundingClientRect());
      const bottomCards = Array.from(
        document.querySelectorAll<HTMLElement>(".analytics-bottom-grid > .panel-card"),
      ).map((card) => card.getBoundingClientRect());
      return {
        bottomXPositions: bottomCards.map((card) => card.x),
        metricWidths: metrics.map((card) => card.width),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(Math.min(...mobileGeometry.metricWidths)).toBeGreaterThanOrEqual(350);
    expect(
      Math.max(...mobileGeometry.bottomXPositions) - Math.min(...mobileGeometry.bottomXPositions),
    ).toBeLessThanOrEqual(1);
    expect(mobileGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(analyticsArtifactDirectory, "after-production-390x844.png"),
    });
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(analyticsArtifactDirectory, "after-production-390x-full.png"),
    });

    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}/analityka?days=30`);
    const narrowMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(narrowMobileOverflow).toBeLessThanOrEqual(1);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("desktop routes use the reference shell and real tenant data", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}`);
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        const { url } = message.location();
        errors.push(`${message.text()}${url ? ` · ${url}` : ""}`);
      }
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });

    await expect(page.getByRole("heading", { level: 1, name: "Przegląd" })).toBeVisible();
    await expect(page.getByText("49", { exact: true }).first()).toBeVisible();
    const shellGeometry = await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>(".panel-rail");
      const topbar = document.querySelector<HTMLElement>(".panel-topbar");
      return {
        documentOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        railWidth: rail?.getBoundingClientRect().width ?? 0,
        topbarHeight: topbar?.getBoundingClientRect().height ?? 0,
      };
    });
    expect(shellGeometry.documentOverflow).toBeLessThanOrEqual(1);
    expect(shellGeometry.railWidth).toBeGreaterThanOrEqual(255);
    expect(shellGeometry.railWidth).toBeLessThanOrEqual(257);
    expect(shellGeometry.topbarHeight).toBeGreaterThanOrEqual(53);
    expect(shellGeometry.topbarHeight).toBeLessThanOrEqual(55);

    const sidebar = page.locator("#panel-sidebar");
    const sidebarToggle = page.getByRole("button", { name: "Zwiń menu boczne" });
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await expect(page.getByText("Kwotum", { exact: true })).toBeVisible();
    await sidebarToggle.click();
    await expect(sidebar).toHaveAttribute("data-collapsed", "true");
    await expect(page.getByRole("button", { name: "Rozwiń menu boczne" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeLessThanOrEqual(73);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("lorum:panel-sidebar-collapsed")))
      .toBe("true");
    await page.reload();
    await expect(sidebar).toHaveAttribute("data-collapsed", "true");
    await page.getByRole("button", { name: "Rozwiń menu boczne" }).click();
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await capture(page, "dashboard-1536x1024");

    await page.goto(`/panel/${organizationId}/leady`);
    await expect(page.getByRole("heading", { level: 1, name: "Leady" })).toBeVisible();
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await expect
      .poll(() => sidebar.evaluate((element) => element.getBoundingClientRect().width))
      .toBeGreaterThanOrEqual(255);
    await expect(page.getByRole("row")).toHaveCount(9);
    await expect(page.getByRole("link", { exact: true, name: "Nowy lead" })).toHaveAttribute(
      "href",
      /^\/f\//,
    );
    await capture(page, "leads-1536x1024");

    const firstLeadHref = await page
      .getByRole("link", { exact: true, name: "Anna Kowalska" })
      .getAttribute("href");
    if (!firstLeadHref) throw new Error("Brak linku do demonstracyjnego leada.");
    await page.goto(firstLeadHref);
    await expect(page.getByRole("heading", { level: 1, name: "Anna Kowalska" })).toBeVisible();
    await expect(page.getByText(/^85\/100$/)).toBeVisible();
    await capture(page, "lead-detail-1536x1024");
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await capture(page, "lead-detail-1448x1086");
    await page.setViewportSize({ height: 1_024, width: 1_536 });

    await page.goto(`/panel/${organizationId}/analityka`);
    await expect(page.getByRole("heading", { level: 1, name: "Analityka" })).toBeVisible();
    await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);
    await expect(page.locator(".metric-grid .metric-card")).toHaveCount(4);
    await capture(page, "analytics-1536x1024");

    await page.goto(`/panel/${organizationId}/procesy`);
    await expect(page.getByRole("heading", { level: 1, name: "Procesy" })).toBeVisible();
    await expect(
      page.getByText("Kwalifikacja leadów — meble na wymiar", { exact: true }),
    ).toBeVisible();
    await capture(page, "processes-1536x1024");

    await page.goto(`/panel/${organizationId}/szablony`);
    await expect(page.getByRole("heading", { level: 1, name: "Szablony branżowe" })).toBeVisible();
    await expect(page.locator(".template-card")).toHaveCount(5);
    await capture(page, "templates-1536x1024");

    await page.goto(`/panel/${organizationId}/procesy/${seededFlowId}`);
    await expect(page.getByRole("heading", { level: 2, name: "Podgląd formularza" })).toBeVisible();
    await expect(page.locator(".question-list > li")).toHaveCount(8);
    await capture(page, "builder-1536x1024");
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await capture(page, "builder-1448x1086");
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.getByRole("button", { exact: true, name: "Opublikuj proces" }).click();
    await expect(page.getByText("Zapisano i opublikowano nową wersję.")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(`/panel/${organizationId}/integracje/wordpress`);
    await expect(page.getByRole("heading", { level: 1, name: "Integracje" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "WordPress" })).toBeVisible();
    await capture(page, "wordpress-1536x1024");

    await page.goto(`/panel/${organizationId}/prywatnosc`);
    await expect(page.getByRole("heading", { level: 1, name: "Ustawienia" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Retencja leadów" })).toBeVisible();
    await capture(page, "privacy-1536x1024");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("mobile routes switch to task-focused drill-down without overflow", async ({ page }) => {
    await mkdir(mobileNavigationArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.getByRole("heading", { level: 1, name: "Przegląd" })).toBeVisible();
    await expect(page.locator(".dashboard-metric-card")).toHaveCount(4);
    await expect(
      page
        .getByRole("region", { name: "Najważniejsze wskaźniki" })
        .getByText("49", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /menu boczne/ })).toBeHidden();
    const mobileNavigation = page.getByRole("navigation", {
      name: "Główna nawigacja panelu",
    });
    await expect(mobileNavigation).toBeVisible();
    await expect(
      mobileNavigation.getByRole("link", { exact: true, name: "Start" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(mobileNavigation.getByRole("link", { exact: true, name: "Leady" })).toBeVisible();
    await expect(
      mobileNavigation.getByRole("link", { exact: true, name: "Procesy" }),
    ).toBeVisible();
    await expect(
      mobileNavigation.getByRole("link", { exact: true, name: "Analityka" }),
    ).toBeVisible();
    const moreButton = mobileNavigation.getByRole("button", {
      name: "Więcej opcji panelu",
    });
    await expect(moreButton).toBeVisible();

    const mobileNavigationGeometry = await mobileNavigation.evaluate((navigation) => {
      const bounds = navigation.getBoundingClientRect();
      const items = Array.from(navigation.children).map((item) => item.getBoundingClientRect());
      return {
        background: getComputedStyle(navigation).backgroundColor,
        clientWidth: navigation.clientWidth,
        height: bounds.height,
        itemsInside: items.every(
          (item) => item.left >= bounds.left - 1 && item.right <= bounds.right + 1,
        ),
        scrollWidth: navigation.scrollWidth,
      };
    });
    expect(mobileNavigationGeometry.background).toContain("255");
    expect(mobileNavigationGeometry.height).toBeGreaterThanOrEqual(63);
    expect(mobileNavigationGeometry.height).toBeLessThanOrEqual(66);
    expect(mobileNavigationGeometry.itemsInside).toBe(true);
    expect(
      mobileNavigationGeometry.scrollWidth - mobileNavigationGeometry.clientWidth,
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(mobileNavigationArtifactDirectory, "after-v2-dashboard-390x844.png"),
    });

    await moreButton.click();
    const moreDialog = page.getByRole("dialog", { name: "Więcej" });
    await expect(moreDialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Zamknij menu Więcej" })).toBeFocused();
    await expect(moreDialog.getByRole("link", { exact: true, name: "Szablony" })).toBeVisible();
    await expect(moreDialog.getByRole("link", { exact: true, name: "Integracje" })).toBeVisible();
    await expect(moreDialog.getByRole("link", { exact: true, name: "Ustawienia" })).toBeVisible();
    await expect(
      moreDialog.getByRole("link", { exact: true, name: "Dane i prywatność" }),
    ).toBeVisible();
    await expect(
      moreDialog.getByRole("link", { exact: true, name: "Powiadomienia" }),
    ).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    const helpLink = moreDialog.getByRole("link", {
      exact: true,
      name: "Pomoc i instrukcje",
    });
    await page.keyboard.press("Shift+Tab");
    await expect(helpLink).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Zamknij menu Więcej" })).toBeFocused();
    await page.screenshot({
      animations: "disabled",
      path: path.join(mobileNavigationArtifactDirectory, "after-v2-more-390x844.png"),
    });
    const moreAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(moreAccessibility.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(moreDialog).toBeHidden();
    await expect(moreButton).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await capture(page, "dashboard-390x844");

    await page.goto(`/panel/${organizationId}/leady`);
    await expect(page.getByRole("heading", { level: 1, name: "Leady" })).toBeVisible();
    await expect(page.getByRole("link", { exact: true, name: "Anna Kowalska" })).toBeVisible();
    await capture(page, "leads-390x844");

    const firstLeadHref = await page
      .getByRole("link", { exact: true, name: "Anna Kowalska" })
      .getAttribute("href");
    if (!firstLeadHref) throw new Error("Brak linku do demonstracyjnego leada.");
    await page.goto(firstLeadHref);
    await expect(page.getByRole("heading", { level: 1, name: "Anna Kowalska" })).toBeVisible();
    await expect(mobileNavigation).toBeHidden();
    await capture(page, "lead-detail-390x844");

    await page.goto(`/panel/${organizationId}/procesy`);
    await expect(page.getByRole("heading", { level: 1, name: "Procesy" })).toBeVisible();
    await expect(page.locator(".process-list-row")).toHaveCount(processPageSize);
    await capture(page, "processes-390x844");

    await page.goto(`/panel/${organizationId}/procesy/${seededFlowId}`);
    await expect(mobileNavigation).toBeHidden();
    await page.getByRole("tab", { name: "Podgląd" }).click();
    await expect(page.locator(".flow-builder__preview")).toHaveClass(/is-mobile-active/);
    await capture(page, "builder-preview-390x844");
    await page.getByRole("tab", { name: "Ustawienia" }).click();
    await expect(page.locator(".flow-builder__inspector")).toHaveClass(/is-mobile-active/);
    await capture(page, "builder-inspector-390x844");

    const horizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(horizontalOverflow).toBeLessThanOrEqual(1);

    await page.setViewportSize({ height: 932, width: 430 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.getByText("49", { exact: true }).first()).toBeVisible();
    await expect(mobileNavigation).toBeVisible();
    await capture(page, "dashboard-430x932");
    await page.goto(`/panel/${organizationId}/procesy/${seededFlowId}`);
    await page.getByRole("tab", { name: "Podgląd" }).click();
    await expect(page.locator(".flow-builder__preview")).toHaveClass(/is-mobile-active/);
    await capture(page, "builder-preview-430x932");

    await page.setViewportSize({ height: 1_000, width: 768 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.getByText("49", { exact: true }).first()).toBeVisible();
    await expect(mobileNavigation).toBeVisible();
    const tabletNavigationSpan = await mobileNavigation.evaluate((navigation) => {
      const first = navigation.firstElementChild?.getBoundingClientRect();
      const last = navigation.lastElementChild?.getBoundingClientRect();
      return first && last ? last.right - first.left : 0;
    });
    expect(tabletNavigationSpan).toBeGreaterThanOrEqual(560);
    expect(tabletNavigationSpan).toBeLessThanOrEqual(577);
    await capture(page, "dashboard-768x1000");
    await page.goto(`/panel/${organizationId}/procesy/${seededFlowId}`);
    await page.getByRole("tab", { name: "Ustawienia" }).click();
    await expect(page.locator(".flow-builder__inspector")).toHaveClass(/is-mobile-active/);
    await capture(page, "builder-inspector-768x1000");
    const tabletOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(tabletOverflow).toBeLessThanOrEqual(1);

    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.getByText("49", { exact: true }).first()).toBeVisible();
    await expect(mobileNavigation).toBeVisible();
    const narrowOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(narrowOverflow).toBeLessThanOrEqual(1);
    await capture(page, "dashboard-320x800");
  });

  test("remaining operational screens are complete, responsive and use real actions", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await mkdir(remainingScreenArtifactDirectory, { recursive: true });
    await mkdir(contactDeliveryArtifactDirectory, { recursive: true });
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });

    const screens = [
      {
        heading: "Ustawienia",
        name: "organization-settings",
        path: `/panel/${organizationId}/ustawienia`,
      },
      {
        heading: "Ustawienia",
        name: "privacy",
        path: `/panel/${organizationId}/prywatnosc`,
      },
      {
        heading: "Ustawienia",
        name: "notifications",
        path: `/panel/${organizationId}/powiadomienia`,
      },
      {
        heading: "Integracje",
        name: "integrations",
        path: `/panel/${organizationId}/integracje/wordpress`,
      },
      {
        heading: "Dokończ uruchomienie",
        name: "onboarding",
        path: `/panel/${organizationId}/start`,
      },
      {
        heading: "Podgląd i udostępnianie",
        name: "installation",
        path: `/panel/${organizationId}/procesy/${seededFlowId}/instalacja`,
      },
    ] as const;

    await page.setViewportSize({ height: 1_024, width: 1_536 });
    for (const screen of screens) {
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${screen.name} desktop overflow`).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(remainingScreenArtifactDirectory, `${screen.name}-1536x1024.png`),
      });
      if (screen.name === "organization-settings") {
        await expect(page.getByRole("heading", { name: "Dostawa nowych leadów" })).toBeVisible();
        await page.screenshot({
          animations: "disabled",
          path: path.join(contactDeliveryArtifactDirectory, "after-1536x1024.png"),
        });
      }
    }

    const installationLayout = page.locator(".installation-layout").last();
    await expect(installationLayout).toBeVisible();
    const installationWidth = await installationLayout.evaluate(
      (element) => element.getBoundingClientRect().width,
    );
    const panelContentWidth = await page
      .locator(".panel-app-content")
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(installationWidth).toBeGreaterThanOrEqual(panelContentWidth - 49);
    expect(installationWidth).toBeLessThanOrEqual(panelContentWidth);

    await page.getByRole("button", { name: /Popup/ }).press("Enter");
    await expect(page.locator(".installation-code code")).toContainText('mode="popup"');
    await page.getByRole("button", { name: /Hosted link/ }).click();
    await expect(page.locator(".installation-code code")).toContainText(`/f/`);
    await expect(page.locator(".installation-code code")).not.toContainText("token=");

    await page.goto(`/panel/${organizationId}/integracje/wordpress`);
    const integrationsGrid = page.locator(".integrations-primary-grid").last();
    await expect(integrationsGrid).toBeVisible();
    const integrationGeometry = await integrationsGrid.evaluate((grid) => {
      const cards = Array.from(grid.querySelectorAll<HTMLElement>(":scope > .panel-card")).map(
        (card) => card.getBoundingClientRect(),
      );
      return {
        cardHeights: cards.map((card) => card.height),
        workspaceWidth: grid.parentElement?.getBoundingClientRect().width ?? 0,
      };
    });
    expect(integrationGeometry.workspaceWidth).toBeGreaterThanOrEqual(panelContentWidth - 49);
    expect(integrationGeometry.workspaceWidth).toBeLessThanOrEqual(panelContentWidth);
    expect(Math.max(...integrationGeometry.cardHeights)).toBeLessThanOrEqual(310);

    await page.setViewportSize({ height: 900, width: 1_440 });
    for (const screen of screens) {
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
      await page.screenshot({
        animations: "disabled",
        path: path.join(remainingScreenArtifactDirectory, `${screen.name}-1440x900.png`),
      });
    }

    for (const viewport of [
      { height: 768, name: "1024x768", width: 1_024 },
      { height: 1_024, name: "768x1024", width: 768 },
      { height: 800, name: "320x800", width: 320 },
    ] as const) {
      await page.setViewportSize(viewport);
      for (const screen of screens) {
        await page.goto(screen.path);
        await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
        await expect(page.locator("main .panel-card").last()).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `${screen.name} ${viewport.name} overflow`).toBeLessThanOrEqual(1);
        await page.screenshot({
          animations: "disabled",
          path: path.join(remainingScreenArtifactDirectory, `${screen.name}-${viewport.name}.png`),
        });
      }
    }

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/ustawienia`);
    const contactDeliveryCard = page
      .locator(".panel-card")
      .filter({ has: page.getByRole("heading", { name: "Dostawa nowych leadów" }) });
    await expect(contactDeliveryCard).toBeVisible();
    const contactDeliveryOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(contactDeliveryOverflow, "contact delivery mobile overflow").toBeLessThanOrEqual(1);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.screenshot({
      animations: "disabled",
      path: path.join(contactDeliveryArtifactDirectory, "after-390x844.png"),
    });

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}/procesy/${seededFlowId}/instalacja`);
    await expect(page.locator(".installation-layout").last()).toBeVisible();
    const forcedColorsOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(forcedColorsOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(remainingScreenArtifactDirectory, "installation-forced-colors-320x-full.png"),
    });
    await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });

    await page.setViewportSize({ height: 844, width: 390 });
    for (const screen of screens) {
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
      await expect(page.getByRole("button", { name: /menu boczne/ })).toBeHidden();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${screen.name} mobile overflow`).toBeLessThanOrEqual(1);
      await page.screenshot({
        animations: "disabled",
        path: path.join(remainingScreenArtifactDirectory, `${screen.name}-390x844.png`),
      });
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: path.join(remainingScreenArtifactDirectory, `${screen.name}-390x-full.png`),
      });

      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations, `${screen.name} accessibility`).toEqual([]);
    }

    expect(errors).toEqual([]);
  });

  test("owner manages the webhook and reviews PII-free delivery states", async ({ page }) => {
    await Promise.all([
      mkdir(path.join(webhookArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(webhookArtifactDirectory, "mobile"), { recursive: true }),
    ]);
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });

    const webhookUrl = `/panel/${organizationId}/integracje/webhooki`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.goto(webhookUrl);
    await expect(page.getByRole("heading", { level: 1, name: "Integracje" })).toBeVisible();
    await expect(page.getByText("https://hooks.partner.pl/kwotum/leads")).toBeVisible();
    await expect(page.getByText("Dostarczono", { exact: true })).toBeVisible();
    await expect(page.getByText("Ponowienie", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Historia dostaw" }).getByText("Wymaga uwagi", {
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(webhookArtifactDirectory, "desktop", "webhook-1448x-full.png"),
    });

    const rotate = page.getByRole("button", { exact: true, name: "Obróć sekret" });
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Odbiorca musi zacząć używać nowego sekretu");
      void dialog.accept();
    });
    await rotate.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Nowy sekret v2 — skopiuj teraz")).toBeVisible();
    await expect(page.locator(".webhook-secret-result code")).toContainText(/^whsec_/);
    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 844, width: 390 });
    await expect(page.getByRole("button", { name: /menu boczne/ })).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const mobileControls = await page
      .locator(".webhook-endpoint-controls .wy-button")
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
    expect(mobileControls.every((height) => height >= 44)).toBe(true);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(webhookArtifactDirectory, "mobile", "webhook-390x-full.png"),
    });
    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.setViewportSize({ height: 800, width: 320 });
    await expect(page.locator(".webhook-endpoint-list")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const forcedColorsAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(forcedColorsAccessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
});
