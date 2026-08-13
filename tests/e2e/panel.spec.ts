import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const organizationId = process.env.PANEL_E2E_ORGANIZATION_ID;
const panelEmail = process.env.PANEL_E2E_EMAIL;
const panelPassword = process.env.PANEL_E2E_PASSWORD;
const seededFlowId = process.env.PANEL_E2E_FLOW_ID;
const editorFlowId = process.env.PANEL_E2E_EDITOR_FLOW_ID;
const artifactRoot = process.env.PANEL_E2E_ARTIFACT_ROOT
  ? path.resolve(process.env.PANEL_E2E_ARTIFACT_ROOT)
  : path.resolve("artifacts/visual-qa");
const artifactDirectory = path.join(artifactRoot, "12a-panel-reconstruction/actual");
const organizationPickerArtifactDirectory = path.join(artifactRoot, "12zn-organization-picker");
const processArtifactDirectory = path.join(artifactRoot, "12n-process-list");
const leadDetailArtifactDirectory = path.join(artifactRoot, "12o-lead-detail-responsive");
const templateArtifactDirectory = path.join(artifactRoot, "12zc-template-library-override");
const templateSurfaceArtifactDirectory = path.join(artifactRoot, "12zo-template-surface-hotfix");
const analyticsArtifactDirectory = path.join(artifactRoot, "12r-analytics-dashboard-style");
const dashboardArtifactDirectory = path.join(artifactRoot, "12t-dashboard-reconstruction");
const mobileNavigationArtifactDirectory = path.join(artifactRoot, "12w-mobile-navigation");
const remainingScreenArtifactDirectory = path.join(artifactRoot, "12s-remaining-screens/after");
const contactDeliveryArtifactDirectory = path.join(artifactRoot, "12zk-contact-delivery-settings");
const builderStateArtifactDirectory = path.join(artifactRoot, "12v-builder-state/after");
const builderGeometryArtifactDirectory = path.join(artifactRoot, "12w-builder-geometry");
const builderPublicCopyArtifactDirectory = path.join(artifactRoot, "13c-fortez-public-form-copy");
const builderInteractionArtifactDirectory = path.join(artifactRoot, "12x-builder-interactions");
const builderToggleArtifactDirectory = path.join(artifactRoot, "12y-builder-toggle/after");
const builderSectionArtifactDirectory = path.join(artifactRoot, "12z-builder-sections/after");
const builderOptionArtifactDirectory = path.join(artifactRoot, "12za-builder-options/after");
const builderEstimationArtifactDirectory = path.join(artifactRoot, "12ze-self-service-estimation");
const builderContactArtifactDirectory = path.join(artifactRoot, "12zk-contact-builder");
const webhookArtifactDirectory = path.join(artifactRoot, "12zf-webhook-v1");
const helpCenterArtifactDirectory = path.join(artifactRoot, "12zr-help-center");
const sidebarP1ArtifactDirectory = path.join(artifactRoot, "sidebar-kwotum-p1");
const panelTypographyArtifactDirectory = path.join(artifactRoot, "12zp-panel-typography");

async function signIn(page: Page) {
  if (!organizationId || !panelEmail || !panelPassword) {
    throw new Error("Brak danych lokalnego konta panel E2E.");
  }
  await page.goto(`/logowanie?next=/panel/${organizationId}`);
  await page.getByLabel("Adres e-mail").fill(panelEmail);
  await page.getByLabel("Hasło", { exact: true }).fill(panelPassword);
  await page.getByRole("button", { exact: true, name: "Zaloguj się" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(`/panel/${organizationId}`));
  await expect(page.locator(".panel-app-shell")).toBeVisible();
}

async function capture(page: Page, name: string) {
  await page.screenshot({
    animations: "disabled",
    path: path.join(artifactDirectory, `${name}.png`),
  });
}

async function mountAnalyticsPrivacyStateProbe(page: Page) {
  await page.evaluate(() => {
    document.querySelector('[data-testid="analytics-privacy-state-probe"]')?.remove();
    const section = document.createElement("section");
    const content = document.createElement("div");
    const mark = document.createElement("strong");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    section.className = "panel-card analytics-privacy-state";
    section.dataset.testid = "analytics-privacy-state-probe";
    content.className = "wy-state";
    mark.className = "wy-state__mark";
    mark.textContent = "Brak danych";
    title.textContent = "Za mało danych dla wykresów";
    description.textContent =
      "Zebrano 3 z 5 wymaganych sesji ze zgodą. Wróć po zebraniu większej próby albo wybierz dłuższy okres.";
    content.append(mark, title, description);
    section.append(content);
    document.querySelector(".analytics-panel .panel-page")?.append(section);
  });
  return page.getByTestId("analytics-privacy-state-probe");
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
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto("/panel");

    await expect(
      page.getByRole("heading", { level: 1, name: "Wybierz organizację" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Twoje organizacje" })).toBeVisible();
    const organizationLink = page
      .getByRole("list", { name: "Dostępne organizacje" })
      .getByRole("link")
      .first();
    await expect(organizationLink).toContainText("Właściciel");
    await expect(organizationLink).toContainText("Aktywna");
    await expect(organizationLink).toHaveAttribute("href", `/panel/${organizationId}`);
    const desktop = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const rect = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!rect) throw new Error(`Brak elementu ${selector}.`);
        return { height: rect.height, left: rect.left, top: rect.top, width: rect.width };
      };
      return {
        header: bounds(".organization-picker__header"),
        intro: bounds(".organization-picker__intro"),
        list: bounds(".organization-list"),
        listHeader: bounds(".organization-list__header"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        row: bounds(".organization-list__row"),
        search: bounds(".organization-picker__search"),
        workspace: bounds(".organization-picker__workspace"),
      };
    });

    expect(desktop.header.height).toBeGreaterThanOrEqual(79);
    expect(desktop.header.height).toBeLessThanOrEqual(81);
    expect(desktop.intro.width).toBeGreaterThanOrEqual(483);
    expect(desktop.intro.width).toBeLessThanOrEqual(485);
    expect(desktop.workspace.left).toBeGreaterThanOrEqual(483);
    expect(desktop.workspace.left).toBeLessThanOrEqual(485);
    expect(desktop.search.width).toBeGreaterThanOrEqual(375);
    expect(desktop.search.width).toBeLessThanOrEqual(377);
    expect(desktop.search.height).toBeGreaterThanOrEqual(49);
    expect(desktop.search.height).toBeLessThanOrEqual(51);
    expect(desktop.list.width).toBeGreaterThanOrEqual(932);
    expect(desktop.list.width).toBeLessThanOrEqual(935);
    expect(desktop.listHeader.height).toBeGreaterThanOrEqual(61);
    expect(desktop.listHeader.height).toBeLessThanOrEqual(63);
    expect(desktop.row.height).toBeGreaterThanOrEqual(110);
    expect(desktop.row.height).toBeLessThanOrEqual(112);
    expect(desktop.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(organizationPickerArtifactDirectory, "after-desktop-1536x1024.png"),
    });

    await organizationLink.focus();
    await expect(organizationLink).toBeFocused();

    const search = page.getByRole("searchbox", { name: "Szukaj organizacji" });
    await search.fill("organizacja-ktorej-nie-ma");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/panel\?q=organizacja-ktorej-nie-ma$/);
    await expect(page.getByText("Brak wyników", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Wyczyść wyszukiwanie" })).toHaveAttribute(
      "href",
      "/panel",
    );

    for (const viewport of [
      { height: 800, width: 320 },
      { height: 812, width: 375 },
      { height: 932, width: 430 },
      { height: 1_024, width: 768 },
      { height: 768, width: 1_024 },
      { height: 800, width: 1_280 },
      { height: 900, width: 1_440 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/panel");
      await expect(
        page.getByRole("heading", { level: 1, name: "Wybierz organizację" }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/panel");
    await expect(organizationLink).toBeVisible();
    await expect(organizationLink).toContainText("Ostatnia aktywność");
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
    await mkdir(sidebarP1ArtifactDirectory, { recursive: true });
    await mkdir(panelTypographyArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_440 });
    await page.goto(`/panel/${organizationId}`);

    const sidebar = page.locator("#panel-sidebar");
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await expect(sidebar.getByText("Kwotum", { exact: true })).toBeVisible();
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

    const sidebarSurface = await sidebar.evaluate((element) => {
      const styles = getComputedStyle(element);
      const active = element.querySelector<HTMLElement>('a[aria-current="page"]');
      const activeDecoration = active ? getComputedStyle(active, "::before") : null;
      const regular = element.querySelector<HTMLElement>(
        ".panel-rail__section-items > a:not(.is-active)",
      );
      const utility = element.querySelector<HTMLElement>(".panel-rail__utilities > a");
      const sectionLabel = element.querySelector<HTMLElement>(".panel-rail__section-label");
      const organization = element.querySelector<HTMLElement>(
        ".panel-rail__organization-row strong",
      );
      const account = element.querySelector<HTMLElement>(".panel-rail__account-copy strong");
      const brand = element.querySelector<HTMLElement>(".panel-rail__brand-name");
      return {
        accountFontWeight: account ? getComputedStyle(account).fontWeight : "missing",
        activeFontWeight: active ? getComputedStyle(active).fontWeight : "missing",
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
        brandFontWeight: brand ? getComputedStyle(brand).fontWeight : "missing",
        boxShadow: styles.boxShadow,
        activeClipPath: activeDecoration?.clipPath ?? "none",
        organizationFontWeight: organization
          ? getComputedStyle(organization).fontWeight
          : "missing",
        regularFontWeight: regular ? getComputedStyle(regular).fontWeight : "missing",
        sectionLabelFontWeight: sectionLabel
          ? getComputedStyle(sectionLabel).fontWeight
          : "missing",
        utilityFontWeight: utility ? getComputedStyle(utility).fontWeight : "missing",
      };
    });
    expect(sidebarSurface).toMatchObject({
      accountFontWeight: "500",
      activeFontWeight: "500",
      backgroundColor: "rgb(13, 43, 36)",
      backgroundImage: "none",
      brandFontWeight: "600",
      boxShadow: "none",
      organizationFontWeight: "400",
      regularFontWeight: "400",
      sectionLabelFontWeight: "500",
      utilityFontWeight: "400",
    });
    expect(sidebarSurface.activeClipPath).not.toBe("none");
    const activeTabGeometry = await sidebar
      .getByRole("link", { name: "Przegląd", exact: true })
      .evaluate((element) => {
        const linkBounds = element.getBoundingClientRect();
        const railBounds = document
          .querySelector<HTMLElement>("#panel-sidebar")
          ?.getBoundingClientRect();
        const decoration = getComputedStyle(element, "::before");
        return {
          decorationRight: Number.parseFloat(decoration.right),
          linkRight: linkBounds.right,
          railRight: railBounds?.right ?? 0,
        };
      });
    expect(activeTabGeometry.decorationRight).toBe(0);
    expect(
      Math.abs(activeTabGeometry.railRight - activeTabGeometry.linkRight - 16),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(sidebarP1ArtifactDirectory, "expanded-1440x1024.png"),
    });
    await sidebar.screenshot({
      animations: "disabled",
      path: path.join(sidebarP1ArtifactDirectory, "expanded-sidebar-256x1024.png"),
    });
    await sidebar.screenshot({
      animations: "disabled",
      path: path.join(panelTypographyArtifactDirectory, "after-sidebar-256x1024.png"),
    });

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
        const decoration = getComputedStyle(element, "::before");
        return {
          decorationLeft: Number.parseFloat(decoration.left),
          decorationRight: Number.parseFloat(decoration.right),
          decorationRadius: decoration.borderRadius,
          linkLeft: linkBounds.left,
          linkRight: linkBounds.right,
          railLeft: railBounds?.left ?? 0,
          railRight: railBounds?.right ?? 0,
        };
      });
    expect(collapsedActiveGeometry.decorationLeft).toBe(-10);
    expect(collapsedActiveGeometry.decorationRight).toBe(0);
    expect(collapsedActiveGeometry.decorationRadius).toBe("0px");
    expect(
      Math.abs(
        collapsedActiveGeometry.linkLeft +
          collapsedActiveGeometry.decorationLeft -
          collapsedActiveGeometry.railLeft,
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(collapsedActiveGeometry.linkRight + 10 - collapsedActiveGeometry.railRight),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(sidebarP1ArtifactDirectory, "collapsed-1440x1024.png"),
    });
    await sidebar.screenshot({
      animations: "disabled",
      path: path.join(sidebarP1ArtifactDirectory, "collapsed-sidebar-72x1024.png"),
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
      { height: 800, label: "1280x800", width: 1_280 },
      { height: 768, label: "1024x768", width: 1_024 },
    ]) {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.goto(`/panel/${organizationId}`);
      await expect(sidebar).toHaveAttribute("data-collapsed", "false");
      responsiveMeasurements.push(
        await page.evaluate((label) => {
          const rail = document.querySelector<HTMLElement>("#panel-sidebar");
          return {
            documentOverflow:
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
            label,
            railHeight: rail?.getBoundingClientRect().height ?? 0,
            railWidth: rail?.getBoundingClientRect().width ?? 0,
          };
        }, viewport.label),
      );
      await page.screenshot({
        animations: "disabled",
        path: path.join(sidebarP1ArtifactDirectory, `expanded-${viewport.label}.png`),
      });
      await page.getByRole("button", { name: "Zwiń menu boczne" }).click();
      await expect(sidebar).toHaveAttribute("data-collapsed", "true");
      await page.screenshot({
        animations: "disabled",
        path: path.join(sidebarP1ArtifactDirectory, `collapsed-${viewport.label}.png`),
      });
      await page.getByRole("button", { name: "Rozwiń menu boczne" }).click();
    }

    await writeFile(
      path.join(sidebarP1ArtifactDirectory, "measurements.json"),
      `${JSON.stringify(responsiveMeasurements, null, 2)}\n`,
      "utf8",
    );

    await page.goto(`/panel/${organizationId}/leady`);
    await expect(page.getByRole("heading", { level: 1, name: "Leady" })).toBeVisible();
    await expect(sidebar).toHaveAttribute("data-collapsed", "false");
    await expect(sidebar.getByRole("link", { name: "Leady", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.setViewportSize({ height: 844, width: 390 });
    await expect(page.getByRole("button", { name: /menu boczne/ })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Główna nawigacja panelu" })).toBeVisible();
    await expect(page.getByRole("link", { exact: true, name: "Leady" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await page.screenshot({
      animations: "disabled",
      path: path.join(sidebarP1ArtifactDirectory, "mobile-390x844.png"),
    });
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      )
      .toBeLessThanOrEqual(1);
  });

  test("dashboard reproduces the complete operational reference with real data", async ({
    page,
  }) => {
    await mkdir(dashboardArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}`);

    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Szukaj leadów" })).toBeVisible();
    await expect(page.locator(".dashboard-metric-card")).toHaveCount(6);
    await expect(page.locator(".dashboard-table tbody tr")).toHaveCount(5);
    await expect(page.getByRole("navigation", { name: "Szybkie akcje dashboardu" })).toBeVisible();

    for (const section of [
      "Leady w czasie",
      "Leady według statusu",
      "Wartość wycen od",
      "Najnowsze leady",
      "Najaktywniejsze procesy",
      "Leady według źródła",
      "Wartość wycen według przedziału",
      "Leady wymagające reakcji",
      "Ostatnie powiadomienia",
      "Szybkie akcje",
      "Procesy i dostawy",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }

    const desktopGeometry = await page.evaluate(() => {
      const metrics = Array.from(
        document.querySelectorAll<HTMLElement>(".dashboard-metric-card"),
      ).map((card) => card.getBoundingClientRect());
      const primaryCards = Array.from(
        document.querySelectorAll<HTMLElement>(".dashboard-primary-grid > .dashboard-card"),
      ).map((card) => card.getBoundingClientRect());
      const workspace = document
        .querySelector<HTMLElement>(".dashboard-panel")
        ?.getBoundingClientRect();
      const page = document.querySelector<HTMLElement>(".dashboard-page")?.getBoundingClientRect();
      return {
        metricWidths: metrics.map((metric) => metric.width),
        metricY: metrics.map((metric) => metric.y),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pageWidth: page?.width ?? 0,
        primaryWidths: primaryCards.map((card) => card.width),
        topbarHeight:
          document
            .querySelector<HTMLElement>(".dashboard-panel .panel-topbar")
            ?.getBoundingClientRect().height ?? 0,
        workspaceWidth: workspace?.width ?? 0,
      };
    });
    expect(desktopGeometry.metricWidths).toHaveLength(6);
    expect(
      Math.max(...desktopGeometry.metricY) - Math.min(...desktopGeometry.metricY),
    ).toBeLessThanOrEqual(1);
    expect(Math.min(...desktopGeometry.metricWidths)).toBeGreaterThanOrEqual(195);
    expect(desktopGeometry.primaryWidths).toHaveLength(3);
    expect(desktopGeometry.pageWidth).toBeGreaterThanOrEqual(desktopGeometry.workspaceWidth - 1);
    expect(desktopGeometry.topbarHeight).toBeGreaterThanOrEqual(86);
    expect(desktopGeometry.topbarHeight).toBeLessThanOrEqual(90);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(dashboardArtifactDirectory, "after-production-1536x1024.png"),
    });

    const desktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(desktopAccessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}`);
    await expect(page.locator("main[aria-busy='true']")).toHaveCount(0);
    await expect(page.locator(".dashboard-metric-card")).toHaveCount(6);
    await expect(page.locator(".dashboard-card--attention")).toBeVisible();
    const mobileGeometry = await page.evaluate(() => {
      const attention = document
        .querySelector<HTMLElement>(".dashboard-card--attention")
        ?.getBoundingClientRect();
      const latest = document
        .querySelector<HTMLElement>(".dashboard-card--latest")
        ?.getBoundingClientRect();
      const metrics = document
        .querySelector<HTMLElement>(".dashboard-metric-grid")
        ?.getBoundingClientRect();
      return {
        attentionTop: attention?.top ?? Number.POSITIVE_INFINITY,
        latestTop: latest?.top ?? Number.POSITIVE_INFINITY,
        metricColumns: document.querySelectorAll(".dashboard-metric-card").length,
        metricsTop: metrics?.top ?? Number.POSITIVE_INFINITY,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(mobileGeometry.metricColumns).toBe(6);
    expect(mobileGeometry.attentionTop).toBeLessThan(mobileGeometry.metricsTop);
    expect(mobileGeometry.metricsTop).toBeLessThan(mobileGeometry.latestTop);
    expect(mobileGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(dashboardArtifactDirectory, "after-production-390x844.png"),
    });

    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);
  });

  test("process list follows the compact reference anatomy", async ({ page }) => {
    await mkdir(processArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/procesy`);

    await expect(
      page.getByRole("heading", { level: 1, name: "Procesy / Formularze" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Wszystkie" })).toBeVisible();
    await expect(page.locator(".processes-panel > .panel-topbar")).toHaveCount(0);
    await expect(page.getByText("Konfiguracja", { exact: true })).toHaveCount(0);
    await expect(page.getByText("5 procesów w organizacji", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Nowy proces" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}/szablony`,
    );
    await expect(page.locator(".process-list-row")).toHaveCount(5);
    await expect(page.locator(".process-table")).toHaveCount(0);

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
      const title = document.querySelector<HTMLElement>(".process-list-heading h1");
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
    expect(desktopGeometry.gap).toBeGreaterThanOrEqual(7);
    expect(desktopGeometry.gap).toBeLessThanOrEqual(9);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    expect(desktopGeometry.titleFontSize).toBeLessThanOrEqual(13);
    await page.screenshot({
      animations: "disabled",
      path: path.join(processArtifactDirectory, "after-v2-production-1536x1024.png"),
    });

    const firstProcess = page.getByRole("link", {
      name: "Edytuj proces Kwalifikacja leadów — meble na wymiar",
    });
    await expect(firstProcess).toHaveAttribute("href", /\/procesy\/[0-9a-f-]+$/);
    await firstProcess.press("Enter");
    await expect(page.getByRole("heading", { level: 2, name: "Podgląd formularza" })).toBeVisible();

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/procesy`);
    await expect(page.locator(".process-list-row")).toHaveCount(5);
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(mobileOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(processArtifactDirectory, "after-v2-production-390x844.png"),
    });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
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

    const firstTitle = page.locator(".flow-builder__preview").getByLabel("Treść pytania");
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
        .locator(".flow-builder__preview")
        .getByLabel("Treść pytania");
      await staleTitleInput.fill(staleTitle);
      await expect(stalePage.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
      await expect(
        stalePage.getByText(/Konflikt wersji — lokalne zmiany nie zostały nadpisane/),
      ).toBeVisible({ timeout: 15_000 });
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

  test("builder edits, validates and persists the public form title and introduction", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    test.skip(!editorFlowId, "Test treści publicznej wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await mkdir(path.join(builderPublicCopyArtifactDirectory, "desktop"), { recursive: true });
    await mkdir(path.join(builderPublicCopyArtifactDirectory, "mobile"), { recursive: true });
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(`/panel/${organizationId}/procesy/${editorFlowId}`);

    const inspector = page.getByRole("complementary", {
      name: "Ustawienia formularza i pytania",
    });
    const publicTitle = inspector.getByLabel("Tytuł formularza");
    const publicIntro = inspector.getByLabel("Wprowadzenie");
    const originalTitle = await publicTitle.inputValue();
    const originalIntro = await publicIntro.inputValue();
    const changedTitle = "Dobór przyczepy — test treści publicznej";
    const changedIntro =
      "Odpowiedz na kilka pytań. Ostateczny dobór, cena i dostępność wymagają potwierdzenia przez firmę.";

    try {
      await publicTitle.fill(changedTitle);
      await publicIntro.fill(changedIntro);
      await expect(page.getByText("Niezapisane zmiany", { exact: true })).toBeVisible();
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      await page.reload();
      await expect(publicTitle).toHaveValue(changedTitle);
      await expect(publicIntro).toHaveValue(changedIntro);

      await page.screenshot({
        animations: "disabled",
        path: path.join(builderPublicCopyArtifactDirectory, "desktop", "after-1448x1086.png"),
      });

      await publicTitle.fill("X");
      await expect(
        inspector.getByText("Tytuł formularza musi mieć od 2 do 160 znaków."),
      ).toBeVisible();
      await page.locator(".builder-validation-overview").click();
      await expect(publicTitle).toBeFocused();
      await publicTitle.fill(changedTitle);
      await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
        timeout: 15_000,
      });

      await page.setViewportSize({ height: 844, width: 390 });
      await page.goto(`/panel/${organizationId}/procesy/${editorFlowId}`);
      await page.getByRole("tab", { name: "Ustawienia" }).press("Enter");
      await expect(publicTitle).toBeVisible();
      await page.screenshot({
        animations: "disabled",
        path: path.join(builderPublicCopyArtifactDirectory, "mobile", "after-390x844.png"),
      });

      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    } finally {
      await page.setViewportSize({ height: 1_086, width: 1_448 });
      await page.goto(`/panel/${organizationId}/procesy/${editorFlowId}`);
      if (
        (await publicTitle.inputValue()) !== originalTitle ||
        (await publicIntro.inputValue()) !== originalIntro
      ) {
        await publicTitle.fill(originalTitle);
        await publicIntro.fill(originalIntro);
        await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
          timeout: 15_000,
        });
      }
    }
  });

  test("builder preserves reference geometry across sidebar and responsive modes", async ({
    page,
  }) => {
    test.skip(!editorFlowId, "Test geometrii buildera wymaga PANEL_E2E_EDITOR_FLOW_ID.");
    await Promise.all([
      mkdir(path.join(builderGeometryArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderGeometryArtifactDirectory, "tablet"), { recursive: true }),
      mkdir(path.join(builderGeometryArtifactDirectory, "mobile"), { recursive: true }),
    ]);

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.reload();
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();
    await expect(page.locator("#panel-sidebar")).toHaveAttribute("data-collapsed", "true");
    await expect
      .poll(() =>
        page
          .locator(".flow-builder__questions")
          .evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBeGreaterThanOrEqual(359);

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
      return {
        actions: rect(".flow-builder__actions"),
        card: rect(".form-preview__card"),
        identity: rect(".flow-builder__identity"),
        inspector: rect(".flow-builder__inspector"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        preview: rect(".flow-builder__preview"),
        questions: rect(".flow-builder__questions"),
        rail: rect("#panel-sidebar"),
        saveState: rect(".flow-builder__save-state"),
        toolbar: rect(".flow-builder__toolbar"),
      };
    });

    expect(desktop.rail.width).toBeGreaterThanOrEqual(71);
    expect(desktop.rail.width).toBeLessThanOrEqual(73);
    expect(desktop.toolbar.height).toBeGreaterThanOrEqual(84);
    expect(desktop.toolbar.height).toBeLessThanOrEqual(86);
    expect(desktop.questions.width).toBeGreaterThanOrEqual(359);
    expect(desktop.questions.width).toBeLessThanOrEqual(361);
    expect(desktop.preview.width).toBeGreaterThanOrEqual(586);
    expect(desktop.preview.width).toBeLessThanOrEqual(590);
    expect(desktop.inspector.width).toBeGreaterThanOrEqual(427);
    expect(desktop.inspector.width).toBeLessThanOrEqual(429);
    expect(desktop.card.width).toBeGreaterThanOrEqual(463);
    expect(desktop.card.width).toBeLessThanOrEqual(465);
    expect(desktop.card.top).toBeGreaterThanOrEqual(251);
    expect(desktop.card.top).toBeLessThanOrEqual(259);
    expect(desktop.identity.right).toBeLessThanOrEqual(desktop.saveState.left);
    expect(desktop.saveState.right).toBeLessThanOrEqual(desktop.actions.left);
    expect(desktop.inspector.right).toBeLessThanOrEqual(1_449);
    expect(desktop.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderGeometryArtifactDirectory,
        "desktop",
        "after-production-collapsed-1448x1086.png",
      ),
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
      .toBeGreaterThanOrEqual(510);

    const expanded = await page.evaluate(() => {
      const rect = (selector: string) => {
        const bounds = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
        if (!bounds) throw new Error(`Brak regionu ${selector}.`);
        return { left: bounds.left, right: bounds.right, width: bounds.width };
      };
      return {
        actions: rect(".flow-builder__actions"),
        identity: rect(".flow-builder__identity"),
        inspector: rect(".flow-builder__inspector"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        preview: rect(".flow-builder__preview"),
        questions: rect(".flow-builder__questions"),
        saveState: rect(".flow-builder__save-state"),
      };
    });

    expect(expanded.questions.width).toBeGreaterThanOrEqual(319);
    expect(expanded.preview.width).toBeGreaterThanOrEqual(510);
    expect(expanded.preview.width).toBeLessThanOrEqual(514);
    expect(expanded.inspector.width).toBeGreaterThanOrEqual(359);
    expect(expanded.inspector.right).toBeLessThanOrEqual(1_449);
    expect(expanded.identity.right).toBeLessThanOrEqual(expanded.saveState.left);
    expect(expanded.saveState.right).toBeLessThanOrEqual(expanded.actions.left);
    expect(expanded.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderGeometryArtifactDirectory,
        "desktop",
        "after-production-expanded-1448x1086.png",
      ),
    });

    await page.setViewportSize({ height: 1_024, width: 768 });
    await page.goto(builderUrl);
    await page.getByRole("tab", { name: "Ustawienia" }).press("Enter");
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
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        rows,
      };
    });

    for (const row of tablet.rows) {
      expect(row.height).toBeLessThanOrEqual(44);
      expect(Math.abs(row.inputTop - row.removeTop)).toBeLessThanOrEqual(3);
      expect(row.inputRight).toBeLessThanOrEqual(768);
      expect(row.removeRight).toBeLessThanOrEqual(768);
    }
    expect(tablet.overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderGeometryArtifactDirectory,
        "tablet",
        "after-production-inspector-768x1024.png",
      ),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(builderUrl);
    await page.getByRole("tab", { name: "Podgląd" }).press("Enter");
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
        card: rect(".form-preview__card"),
        identity: rect(".flow-builder__identity"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        tabHeights,
        toolbar: rect(".flow-builder__toolbar"),
      };
    });

    expect(mobile.toolbar.height).toBeLessThanOrEqual(62);
    expect(mobile.identity.right).toBeLessThanOrEqual(mobile.actions.left);
    expect(mobile.card.left).toBeGreaterThanOrEqual(19);
    expect(mobile.card.right).toBeLessThanOrEqual(371);
    expect(mobile.tabHeights.every((height) => height >= 44)).toBe(true);
    expect(mobile.overflow).toBeLessThanOrEqual(1);

    await page.getByLabel("Więcej opcji publikacji").press("Enter");
    await expect(page.getByRole("button", { name: "Cofnij zmianę" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ponów zmianę" })).toBeVisible();
    await page.getByLabel("Więcej opcji publikacji").press("Enter");

    await page.screenshot({
      animations: "disabled",
      path: path.join(
        builderGeometryArtifactDirectory,
        "mobile",
        "after-production-preview-390x844.png",
      ),
    });

    const mobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(mobileAccessibility.violations).toEqual([]);

    for (const viewport of [
      { height: 844, width: 320 },
      { height: 844, width: 375 },
      { height: 844, width: 430 },
      { height: 844, width: 724 },
      { height: 900, width: 1_024 },
      { height: 900, width: 1_280 },
      { height: 1_024, width: 1_536 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(builderUrl);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    }
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
    await expect(page.getByRole("status")).toContainText("Przeniesiono pytanie");
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
      await expect(page.getByRole("status")).toContainText("Przeniesiono sekcję");
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
      await expect(page.getByRole("status")).toContainText("Przeniesiono opcję");
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
      mkdir(path.join(builderContactArtifactDirectory, "desktop"), { recursive: true }),
      mkdir(path.join(builderContactArtifactDirectory, "mobile"), { recursive: true }),
    ]);

    const builderUrl = `/panel/${organizationId}/procesy/${editorFlowId}`;
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(builderUrl);
    await expect(page.locator(".flow-builder__grid")).toBeVisible();

    const areaTabs = page.locator(".flow-builder__questions .flow-builder__area-tabs");
    const undo = page.getByRole("button", { exact: true, name: "Cofnij" });

    await areaTabs.getByRole("tab", { exact: true, name: "Kontakt" }).click();
    const contactInspector = page.getByRole("complementary", { name: "Ustawienia: Kontakt" });
    await expect(contactInspector.getByText("Konfiguracja nieaktywna", { exact: true })).toHaveText(
      "Konfiguracja nieaktywna",
    );
    await page.getByRole("button", { name: "Włącz zbieranie kontaktu" }).click();
    await page.getByLabel("Wymagany kanał kontaktu").selectOption("phone_required");
    await page
      .getByLabel("Treść informacji prywatności")
      .fill("Potwierdzam zapoznanie się z informacją prywatności testowej organizacji.");
    await page.getByLabel("Wersja informacji").fill("panel-e2e-v1");
    await page
      .getByLabel("Adres polityki prywatności")
      .fill("https://example.test/polityka-prywatnosci");
    await page.getByRole("button", { name: "Zapisz treść informacji" }).click();
    await expect(page.locator(".contact-result-preview")).toContainText("Telefon jest wymagany");
    await expect(contactInspector.getByText("Konfiguracja aktywna", { exact: true })).toHaveText(
      "Konfiguracja aktywna",
    );
    await expect(page.getByText("Zapisano zmiany.", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderContactArtifactDirectory, "desktop", "contact-1448x1086.png"),
    });
    const contactDesktopAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(contactDesktopAccessibility.violations).toEqual([]);

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

    const formAreaTabs = page.locator(".flow-builder__questions .flow-builder__area-tabs");
    await formAreaTabs.getByRole("tab", { exact: true, name: "Scoring" }).click();
    await page.getByRole("button", { name: "Dodaj kategorię" }).click();
    await page.getByLabel("Nazwa kategorii 2").fill("Priorytet");
    expect(runtimeErrors).toEqual([]);
    await page.getByRole("button", { name: "Dodaj regułę scoringu" }).click();
    await page.getByLabel("Nazwa wewnętrzna").fill("Punkty za kompletną odpowiedź");
    await page.getByLabel("Punkty").fill("25");

    const scoringAreaTabs = page.locator(".flow-builder__questions .flow-builder__area-tabs");
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
    const mobileAreaTabs = page.locator(".flow-builder__area-tabs--mobile");
    await expect(mobileAreaTabs).toBeVisible();
    await mobileAreaTabs.getByRole("tab", { exact: true, name: "Kontakt" }).click();
    await page.getByRole("tab", { exact: true, name: "Ustawienia" }).click();
    await expect(page.getByRole("heading", { name: "Ustawienia · Kontakt" })).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: path.join(builderContactArtifactDirectory, "mobile", "contact-390x844.png"),
    });
    const contactMobileAccessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(contactMobileAccessibility.violations).toEqual([]);
    await mobileAreaTabs.getByRole("tab", { exact: true, name: "Scoring" }).click();
    await page.getByRole("tab", { exact: true, name: "Ustawienia" }).click();
    await expect(page.locator(".estimation-builder__inspector")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    const mobileTabHeights = await page
      .locator(".flow-builder__area-tabs--mobile button, .flow-builder__mobile-tabs button")
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
      .locator(".flow-builder__questions .flow-builder__area-tabs")
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
    const privacySwitch = page.locator('.settings-switch > input[type="checkbox"]');
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

    for (const label of ["Zaplanuj kontakt", "Utwórz zadanie"]) {
      const alignment = await operations.getByRole("button", { name: label }).evaluate((button) => {
        const content = button.querySelector<HTMLElement>(":scope > span");
        const icon = content?.querySelector("svg");
        const textNode = Array.from(content?.childNodes ?? []).find(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        if (!content || !icon || !textNode) throw new Error("Brak treści przycisku akcji.");
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const iconBounds = icon.getBoundingClientRect();
        const textBounds = range.getBoundingClientRect();
        return {
          alignItems: getComputedStyle(content).alignItems,
          centerDelta: Math.abs(
            iconBounds.top + iconBounds.height / 2 - (textBounds.top + textBounds.height / 2),
          ),
          display: getComputedStyle(content).display,
        };
      });
      expect(alignment.display).toBe("flex");
      expect(alignment.alignItems).toBe("center");
      expect(alignment.centerDelta).toBeLessThanOrEqual(1);
    }

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
    await expect(createdTask).toBeHidden();

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
    expect(desktopGeometry.sideWidth).toBeGreaterThanOrEqual(400);
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
    expect(mobileGeometry.scoreWidth).toBeGreaterThanOrEqual(mobileGeometry.articleWidth - 30);
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

  test("help center explains only real, role-available panel features", async ({ page }) => {
    await mkdir(helpCenterArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_024, width: 1_536 });
    await page.goto(`/panel/${organizationId}/pomoc`);

    await expect(page.getByRole("heading", { level: 1, name: "Pomoc" })).toBeVisible();
    await expect(page.getByText("Zakres poradnika: Właściciel")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Spis treści poradnika" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Leady i obsługa" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Procesy i formularze" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Integracje" })).toBeVisible();
    const helpSurfaceAppearance = await page.locator(".help-center").evaluate((surface) => {
      const styles = getComputedStyle(surface);
      return {
        backgroundColor: styles.backgroundColor,
        borderBottomWidth: styles.borderBottomWidth,
        borderLeftWidth: styles.borderLeftWidth,
        borderRightWidth: styles.borderRightWidth,
        borderTopWidth: styles.borderTopWidth,
        boxShadow: styles.boxShadow,
      };
    });
    expect(helpSurfaceAppearance).toEqual({
      backgroundColor: "rgba(0, 0, 0, 0)",
      borderBottomWidth: "0px",
      borderLeftWidth: "0px",
      borderRightWidth: "0px",
      borderTopWidth: "0px",
      boxShadow: "none",
    });
    await expect(page.locator(".help-center-panel")).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
    await page.locator("#guide-webhooks summary").click();
    await expect(page.getByRole("link", { name: "Otwórz webhooki" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}/integracje/webhooki`,
    );
    await expect(page.getByRole("link", { name: "Pomoc" })).toHaveAttribute("aria-current", "page");

    const search = page.getByRole("searchbox", { name: "Szukaj w poradniku" });
    await search.fill("webhook");
    await expect(page.getByText("1 wynik dla „webhook”")).toBeVisible();
    await expect(page.locator(".help-category__guides details")).toHaveCount(1);
    await expect(page.getByText("Endpoint, podpis HMAC, test połączenia")).toBeVisible();
    await page.getByRole("button", { name: "Wyczyść wyszukiwanie" }).click();
    await expect(page.getByText(/instrukcji dostępnych dla Twojej roli/)).toBeVisible();

    const firstGuide = page.locator("#guide-first-launch");
    await expect(firstGuide).toHaveAttribute("open", "");
    await firstGuide.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(firstGuide).not.toHaveAttribute("open", "");

    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(desktopOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(helpCenterArtifactDirectory, "after-desktop-1536x1024.png"),
    });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/pomoc`);
    await expect(page.getByRole("heading", { level: 1, name: "Pomoc" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Szukaj w poradniku" })).toBeVisible();
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(mobileOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(helpCenterArtifactDirectory, "after-mobile-390x844.png"),
    });
  });

  test("template library reproduces the rich reference with real filters and detail", async ({
    page,
  }) => {
    await mkdir(templateArtifactDirectory, { recursive: true });
    await mkdir(templateSurfaceArtifactDirectory, { recursive: true });
    await page.setViewportSize({ height: 1_086, width: 1_448 });
    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "true"));
    await page.goto(`/panel/${organizationId}/szablony`);

    await expect(page.getByRole("heading", { level: 1, name: "Szablony branżowe" })).toBeVisible();
    await expect(page.locator(".template-card")).toHaveCount(5);
    await expect(page.getByRole("button", { name: "Użyj szablonu" })).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Moje procesy" })).toHaveAttribute(
      "href",
      `/panel/${organizationId}/procesy`,
    );
    await expect(page.getByRole("link", { name: "Nowy proces" })).toHaveAttribute(
      "href",
      "#template-library-grid",
    );
    await expect(page.getByLabel("Szukaj szablonu")).toBeVisible();
    await expect(page.getByLabel("Kategoria")).toBeVisible();
    await expect(page.getByLabel("Złożoność")).toBeVisible();
    await expect(page.getByLabel("Sortowanie")).toBeVisible();
    await expect(page.locator(".template-summary-card")).toHaveCount(3);
    await expect(page.getByText("6,8", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "O szablonie: Meble na wymiar" })).toBeVisible();

    const desktopGeometry = await page.evaluate(() => {
      const workspace = document
        .querySelector<HTMLElement>(".templates-panel")
        ?.getBoundingClientRect();
      const surfaceElement = document.querySelector<HTMLElement>(".template-library-surface");
      const surface = surfaceElement?.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".template-card")).map(
        (card) => {
          const media = card.querySelector<HTMLElement>(".template-card__media");
          const cardRect = card.getBoundingClientRect();
          return {
            mediaHeight: media?.getBoundingClientRect().height ?? 0,
            width: cardRect.width,
            y: cardRect.y,
          };
        },
      );
      return {
        surfaceAppearance: surfaceElement
          ? {
              backgroundColor: getComputedStyle(surfaceElement).backgroundColor,
              borderBottomWidth: getComputedStyle(surfaceElement).borderBottomWidth,
              borderLeftWidth: getComputedStyle(surfaceElement).borderLeftWidth,
              borderRightWidth: getComputedStyle(surfaceElement).borderRightWidth,
              borderTopWidth: getComputedStyle(surfaceElement).borderTopWidth,
              boxShadow: getComputedStyle(surfaceElement).boxShadow,
            }
          : null,
        detail: document.querySelector<HTMLElement>(".template-detail")?.getBoundingClientRect(),
        cardWidths: cards.map((card) => card.width),
        cardYPositions: cards.map((card) => card.y),
        mediaHeights: cards.map((card) => card.mediaHeight),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        surfaceWidth: surface?.width ?? 0,
        toolbarHeight:
          document.querySelector<HTMLElement>(".template-toolbar")?.getBoundingClientRect()
            .height ?? 0,
        workspaceWidth: workspace?.width ?? 0,
      };
    });
    expect(desktopGeometry.surfaceWidth).toBeGreaterThanOrEqual(
      desktopGeometry.workspaceWidth - 95,
    );
    expect(desktopGeometry.surfaceAppearance).toEqual({
      backgroundColor: "rgba(0, 0, 0, 0)",
      borderBottomWidth: "0px",
      borderLeftWidth: "0px",
      borderRightWidth: "0px",
      borderTopWidth: "0px",
      boxShadow: "none",
    });
    expect(
      Math.max(...desktopGeometry.cardYPositions) - Math.min(...desktopGeometry.cardYPositions),
    ).toBeLessThanOrEqual(1);
    expect(Math.min(...desktopGeometry.cardWidths)).toBeGreaterThanOrEqual(232);
    expect(Math.max(...desktopGeometry.cardWidths)).toBeLessThanOrEqual(242);
    expect(Math.min(...desktopGeometry.mediaHeights)).toBeGreaterThanOrEqual(136);
    expect(Math.max(...desktopGeometry.mediaHeights)).toBeLessThanOrEqual(140);
    expect(desktopGeometry.toolbarHeight).toBeGreaterThanOrEqual(79);
    expect(desktopGeometry.toolbarHeight).toBeLessThanOrEqual(82);
    expect(desktopGeometry.detail?.width ?? 0).toBeGreaterThanOrEqual(1_230);
    expect(desktopGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(templateArtifactDirectory, "after-v2-1448x1086.png"),
    });

    await page.evaluate(() => localStorage.setItem("lorum:panel-sidebar-collapsed", "false"));
    await page.setViewportSize({ height: 1_220, width: 2_048 });
    await page.goto(`/panel/${organizationId}/szablony`);
    await expect(page.locator(".template-card").first()).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: path.join(templateSurfaceArtifactDirectory, "after-desktop-2048x1220.png"),
    });

    await page.getByLabel("Szukaj szablonu").fill("klimatyzacja");
    await expect(page.locator(".template-card")).toHaveCount(1);
    await expect(page.locator(".template-toolbar__result")).toContainText("1");
    await page.getByLabel("Szukaj szablonu").fill("");
    await page.getByLabel("Kategoria").selectOption({ label: "Ogrodzenia" });
    await expect(page.locator(".template-card")).toHaveCount(1);
    await page.getByLabel("Kategoria").selectOption("all");
    const renovationCard = page.locator('[data-template-slug="remonty"]');
    await renovationCard.getByRole("button", { name: "Podgląd" }).press("Enter");
    await expect(page.getByRole("heading", { name: "O szablonie: Remonty" })).toBeVisible();
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
    await expect(page.locator(".template-card").first()).toBeVisible();
    await expect(page.locator(".template-summary-card")).toHaveCount(3);
    const mobileGeometry = await page.evaluate(() => {
      const surface = document
        .querySelector<HTMLElement>(".template-library-surface")
        ?.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".template-card")).map(
        (card) => card.getBoundingClientRect(),
      );
      const media = document
        .querySelector<HTMLElement>(".template-card__media")
        ?.getBoundingClientRect();
      return {
        cardBounds: cards.map(({ left, right, width }) => ({ left, right, width })),
        cardsInsideSurface: cards.every(
          (card) =>
            surface !== undefined &&
            card.left >= surface.left - 1 &&
            card.right <= surface.right + 1 &&
            card.width > 0,
        ),
        mediaRatio: media === undefined ? 0 : media.width / media.height,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        surfaceBounds:
          surface === undefined
            ? null
            : { left: surface.left, right: surface.right, width: surface.width },
      };
    });
    expect(mobileGeometry.cardsInsideSurface, JSON.stringify(mobileGeometry)).toBe(true);
    expect(mobileGeometry.mediaRatio).toBeGreaterThanOrEqual(1.65);
    expect(mobileGeometry.mediaRatio).toBeLessThanOrEqual(1.75);
    expect(mobileGeometry.overflow).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(templateArtifactDirectory, "after-v2-390x844.png"),
    });
    await page.screenshot({
      animations: "disabled",
      path: path.join(templateSurfaceArtifactDirectory, "after-mobile-390x844.png"),
    });

    await page.setViewportSize({ height: 800, width: 320 });
    await page.goto(`/panel/${organizationId}/szablony`);
    await expect(page.locator(".template-card")).toHaveCount(5);
    const narrowMobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(narrowMobileOverflow).toBeLessThanOrEqual(1);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  test("analytics expands the dashboard style with period-scoped detail", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await mkdir(analyticsArtifactDirectory, { recursive: true });
    await mkdir(panelTypographyArtifactDirectory, { recursive: true });
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
    expect(desktopGeometry.topbarHeight).toBeGreaterThanOrEqual(76);
    expect(desktopGeometry.topbarHeight).toBeLessThanOrEqual(80);
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

    const desktopPrivacyState = await mountAnalyticsPrivacyStateProbe(page);
    await expect(desktopPrivacyState).toBeVisible();
    const desktopPrivacyStyle = await desktopPrivacyState.evaluate((section) => {
      const cardBounds = section.getBoundingClientRect();
      const state = section.querySelector<HTMLElement>(".wy-state")!;
      const mark = section.querySelector<HTMLElement>(".wy-state__mark")!;
      const title = section.querySelector<HTMLElement>("h3")!;
      const description = section.querySelector<HTMLElement>("p")!;
      const stateStyle = getComputedStyle(state);
      const titleStyle = getComputedStyle(title);
      const descriptionStyle = getComputedStyle(description);
      return {
        descriptionFontSize: descriptionStyle.fontSize,
        descriptionMarginBottom: descriptionStyle.marginBottom,
        descriptionMaxWidth: descriptionStyle.maxWidth,
        insetLeft: title.getBoundingClientRect().left - cardBounds.left,
        markLineWidth: getComputedStyle(mark, "::before").width,
        markWeight: getComputedStyle(mark).fontWeight,
        stateBorderBottomWidth: stateStyle.borderBottomWidth,
        stateBorderTopWidth: stateStyle.borderTopWidth,
        stateMinHeight: stateStyle.minHeight,
        statePaddingLeft: stateStyle.paddingLeft,
        statePaddingRight: stateStyle.paddingRight,
        titleFontSize: titleStyle.fontSize,
        titleWeight: titleStyle.fontWeight,
      };
    });
    expect(desktopPrivacyStyle).toMatchObject({
      descriptionFontSize: "14px",
      descriptionMarginBottom: "0px",
      descriptionMaxWidth: "736px",
      markLineWidth: "28px",
      markWeight: "500",
      stateBorderBottomWidth: "0px",
      stateBorderTopWidth: "0px",
      stateMinHeight: "176px",
      statePaddingLeft: "32px",
      statePaddingRight: "32px",
      titleFontSize: "16px",
      titleWeight: "600",
    });
    expect(desktopPrivacyStyle.insetLeft).toBeGreaterThanOrEqual(31);
    expect(desktopPrivacyStyle.insetLeft).toBeLessThanOrEqual(33);
    await desktopPrivacyState.screenshot({
      animations: "disabled",
      path: path.join(panelTypographyArtifactDirectory, "after-empty-state-1536.png"),
    });
    await desktopPrivacyState.evaluate((section) => section.remove());

    await page.getByRole("link", { name: "7 dni" }).press("Enter");
    await expect(page).toHaveURL(/analityka\?days=7$/);
    await expect(page.getByRole("link", { name: "7 dni" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".lead-volume-chart li")).toHaveCount(7);

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto(`/panel/${organizationId}/analityka?days=30`);
    await expect(page.locator(".metric-grid .metric-card")).toHaveCount(4);
    const mobilePrivacyState = await mountAnalyticsPrivacyStateProbe(page);
    await expect(mobilePrivacyState).toBeVisible();
    const mobilePrivacyStyle = await mobilePrivacyState.evaluate((section) => {
      const state = section.querySelector<HTMLElement>(".wy-state")!;
      const stateStyle = getComputedStyle(state);
      return {
        minHeight: stateStyle.minHeight,
        paddingLeft: stateStyle.paddingLeft,
        paddingRight: stateStyle.paddingRight,
      };
    });
    expect(mobilePrivacyStyle).toEqual({
      minHeight: "0px",
      paddingLeft: "24px",
      paddingRight: "24px",
    });
    await mobilePrivacyState.screenshot({
      animations: "disabled",
      path: path.join(panelTypographyArtifactDirectory, "after-empty-state-390.png"),
    });
    await mobilePrivacyState.evaluate((section) => section.remove());
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

    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
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
    expect(shellGeometry.topbarHeight).toBeGreaterThanOrEqual(86);
    expect(shellGeometry.topbarHeight).toBeLessThanOrEqual(90);

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
    await expect(
      page.getByRole("heading", { level: 1, name: "Procesy / Formularze" }),
    ).toBeVisible();
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
    await expect(page.getByRole("heading", { level: 1, name: "Dane i prywatność" })).toBeVisible();
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
    await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
    await expect(page.locator(".dashboard-metric-card")).toHaveCount(6);
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
    await expect(helpLink).toHaveAttribute("href", `/panel/${organizationId}/pomoc`);
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
    await expect(
      page.getByRole("heading", { level: 1, name: "Procesy / Formularze" }),
    ).toBeVisible();
    await expect(page.locator(".process-list-row")).toHaveCount(5);
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
        heading: "Ustawienia organizacji",
        name: "organization-settings",
        path: `/panel/${organizationId}/ustawienia`,
      },
      {
        heading: "Dane i prywatność",
        name: "privacy",
        path: `/panel/${organizationId}/prywatnosc`,
      },
      {
        heading: "Powiadomienia",
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
    await expect(page.getByRole("heading", { level: 1, name: "Webhooki" })).toBeVisible();
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
    await expect(page.getByText("Nowy sekret v2 — skopiuj teraz")).toBeVisible({ timeout: 15_000 });
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
