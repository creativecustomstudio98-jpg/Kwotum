import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const industriesViewports = [
  { height: 1_000, width: 1_536 },
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_280 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

const industryRoutes = [
  "/branze/meble-na-wymiar",
  "/branze/ogrodzenia",
  "/branze/strony-internetowe",
  "/branze/klimatyzacja",
  "/branze/remonty",
] as const;

test.describe("marketing industries V7", () => {
  test("presents five real industry contexts without inventing a second product", async ({
    page,
  }) => {
    await page.goto("/branze");

    await expect(page.locator("[data-industries-hero]")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Meble to nie remont. Brief też nie powinien być ten sam.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("figure", {
        name: /Pięć branż usługowych: meble na wymiar, ogrodzenia/,
      }),
    ).toBeVisible();
    await expect(page.locator("[data-industries-hero] ol > li")).toHaveCount(3);

    const proof = page.locator("[data-industries-proof]");
    const tablist = proof.getByRole("tablist", { name: "Wybierz branżę do porównania" });
    await expect(tablist.getByRole("tab")).toHaveCount(5);
    await expect(tablist.getByRole("tab", { name: /Meble na wymiar/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(proof.getByRole("tabpanel")).toContainText("Rodzaj zabudowy i pomieszczenie");
    await expect(proof.getByRole("link", { name: /Zobacz pełny przykład/ })).toHaveAttribute(
      "href",
      industryRoutes[0],
    );

    await tablist.getByRole("tab", { name: /Ogrodzenia/ }).click();
    await expect(tablist.getByRole("tab", { name: /Ogrodzenia/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(proof.getByRole("tabpanel")).toContainText("Łączna długość i wysokość ogrodzenia");
    await expect(proof.getByRole("link", { name: /Zobacz pełny przykład/ })).toHaveAttribute(
      "href",
      industryRoutes[1],
    );
  });

  test("keeps the editorial index connected to all five existing detail routes", async ({
    page,
  }) => {
    await page.goto("/branze");

    const index = page.locator("[data-industries-index]");
    const entries = index.locator("ol > li");
    await expect(entries).toHaveCount(5);

    for (const [position, href] of industryRoutes.entries()) {
      await expect(entries.nth(position).getByRole("link")).toHaveAttribute("href", href);
    }

    await expect(entries.nth(0)).toContainText("Rodzaj zabudowy i pomieszczenie");
    await expect(entries.nth(1)).toContainText("Łączna długość i wysokość ogrodzenia");
    await expect(entries.nth(2)).toContainText("Cel biznesowy i typ strony");
    await expect(entries.nth(3)).toContainText("Liczba i powierzchnia pomieszczeń");
    await expect(entries.nth(4)).toContainText("Metraż i lista pomieszczeń");
  });

  test("ends with one factual process contract and working actions", async ({ page }) => {
    await page.goto("/branze");

    const overview = page.locator("[data-industries-overview]");
    await expect(overview).toContainText("Pytania");
    await expect(overview).toContainText("Mechanizm");
    await expect(overview).toContainText("Decyzja");
    await expect(page.getByRole("link", { name: "Zobacz, jak ułożyć proces" })).toHaveAttribute(
      "href",
      "/jak-dziala#proces",
    );
    await expect(page.getByRole("link", { name: "Przejdź do panelu" })).toHaveAttribute(
      "href",
      "/logowanie",
    );

    const sectionOrder = await page
      .locator("main section")
      .evaluateAll((sections) => sections.map((section) => section.id));
    expect(sectionOrder).toEqual([
      "industries-hero",
      "porownanie",
      "zastosowania",
      "industries-final-cta",
    ]);
  });

  for (const viewport of industriesViewports) {
    test(`keeps the page deliberate and readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/branze");

      const geometry = await page.locator("[data-industries-hero]").evaluate((hero) => {
        const copy = hero.querySelector<HTMLElement>("[data-industries-hero-copy]");
        const panorama = hero.querySelector<HTMLElement>("[data-industries-panorama]");
        const actions = hero.querySelector<HTMLElement>("[data-industries-actions]");
        const copyBounds = copy?.getBoundingClientRect();
        const panoramaBounds = panorama?.getBoundingClientRect();
        const actionBounds = [...(actions?.querySelectorAll<HTMLElement>("a") ?? [])].map(
          (link) => {
            const bounds = link.getBoundingClientRect();
            return {
              height: bounds.height,
              left: bounds.left,
              top: bounds.top,
              width: bounds.width,
            };
          },
        );
        const pageRoot = hero.parentElement;
        const textSizes = [...(pageRoot?.querySelectorAll<HTMLElement>("*") ?? [])]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]') &&
              !element.classList.contains("wy-sr-only"),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          actions: actionBounds,
          copy: copyBounds
            ? { bottom: copyBounds.bottom, left: copyBounds.left, right: copyBounds.right }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          panorama: panoramaBounds
            ? {
                left: panoramaBounds.left,
                right: panoramaBounds.right,
                top: panoramaBounds.top,
              }
            : null,
          smallestText: Math.min(...textSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      for (const action of geometry.actions) {
        expect(action.height).toBeGreaterThanOrEqual(44);
      }
      const minimumPageMargin = viewport.width === 320 ? 11 : viewport.width <= 768 ? 15 : 24;
      expect(geometry.panorama?.left ?? 0).toBeGreaterThanOrEqual(minimumPageMargin);
      expect(geometry.panorama?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - minimumPageMargin + 0.5,
      );

      if (viewport.width > 1_024) {
        expect(geometry.panorama?.left ?? 0).toBeGreaterThan(geometry.copy?.right ?? 0);
      } else {
        expect(geometry.panorama?.top ?? 0).toBeGreaterThan(geometry.copy?.bottom ?? 0);
      }

      if (viewport.width <= 768) {
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.top ?? 0);
        expect(geometry.actions[0]?.width ?? 0).toBe(geometry.actions[1]?.width ?? 0);
      }
    });
  }

  test("supports keyboard tab switching and WCAG AA in forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/branze");

    const tablist = page.getByRole("tablist", { name: "Wybierz branżę do porównania" });
    const furnitureTab = tablist.getByRole("tab", { name: /Meble na wymiar/ });
    const fenceTab = tablist.getByRole("tab", { name: /Ogrodzenia/ });
    await furnitureTab.focus();
    await furnitureTab.press("ArrowRight");
    await expect(fenceTab).toBeFocused();
    await expect(fenceTab).toHaveAttribute("aria-selected", "true");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  test("keeps all five industries discoverable without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/branze", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Meble to nie remont");
    const index = page.locator("[data-industries-index]");
    await expect(index.locator("ol > li")).toHaveCount(5);
    for (const href of industryRoutes) {
      await expect(index.locator(`a[href="${href}"]`)).toHaveCount(1);
    }

    await context.close();
  });
});
