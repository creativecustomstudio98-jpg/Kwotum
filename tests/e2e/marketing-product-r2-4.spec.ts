import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const finalCtaViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product R2.4 final overview", () => {
  test("summarizes the product and offers only working next steps", async ({ page }) => {
    await page.goto("/produkt");

    const section = page.getByRole("region", {
      name: "Zobacz cały proces na realnym zapytaniu.",
    });
    const overview = section.getByRole("complementary", {
      name: "Kwotum w jednym widoku",
    });

    await expect(section).toBeVisible();
    await expect(overview.locator("ol > li")).toHaveCount(3);
    await expect(overview.locator("ol > li strong")).toHaveText([
      "Jedna wersja procesu",
      "Jeden pełny rekord",
      "Jasna odpowiedzialność",
    ]);
    await expect(section.getByLabel("Zasady procesu").locator("li")).toHaveText([
      "Jawne reguły",
      "Wynik orientacyjny",
      "Decyzja firmy",
    ]);
    await expect(section.getByRole("link", { name: "Zobacz cały proces" })).toHaveAttribute(
      "href",
      "/jak-dziala",
    );
    await expect(section.getByRole("link", { name: "Przejdź do panelu" })).toHaveAttribute(
      "href",
      "/logowanie",
    );
    await expect(page.getByRole("contentinfo")).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of finalCtaViewports) {
    test(`keeps the product overview intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const section = page.locator("#product-final-cta");
      const geometry = await section.evaluate((region) => {
        const sectionBounds = region.getBoundingClientRect();
        const panelBounds = region
          .querySelector(".product-final-cta__panel")
          ?.getBoundingClientRect();
        const headingBounds = region.querySelector("h2")?.getBoundingClientRect();
        const overviewBounds = region
          .querySelector("[data-product-overview]")
          ?.getBoundingClientRect();
        const actionBounds = [...region.querySelectorAll<HTMLElement>("a")].map((action) =>
          action.getBoundingClientRect(),
        );
        const textSizes = [...region.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          actions: actionBounds.map((action) => ({
            height: action.height,
            left: action.left,
            top: action.top,
            width: action.width,
          })),
          heading: headingBounds
            ? { bottom: headingBounds.bottom, left: headingBounds.left, right: headingBounds.right }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overview: overviewBounds
            ? {
                bottom: overviewBounds.bottom,
                height: overviewBounds.height,
                left: overviewBounds.left,
                right: overviewBounds.right,
                top: overviewBounds.top,
                width: overviewBounds.width,
              }
            : null,
          panel: panelBounds
            ? {
                height: panelBounds.height,
                left: panelBounds.left,
                right: panelBounds.right,
                top: panelBounds.top,
              }
            : null,
          section: { height: sectionBounds.height },
          smallestText: Math.min(...textSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(section).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      expect(geometry.panel?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.panel?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(
        Math.abs((geometry.actions[0]?.height ?? 0) - (geometry.actions[1]?.height ?? 0)),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs((geometry.actions[0]?.width ?? 0) - (geometry.actions[1]?.width ?? 0)),
      ).toBeLessThanOrEqual(1);

      if (viewport.width > 1_088) {
        expect(geometry.section.height).toBeLessThanOrEqual(900);
        expect(geometry.overview?.left ?? 0).toBeGreaterThan(geometry.heading?.right ?? 0);
      }

      if (viewport.width <= 1_088) {
        expect(geometry.overview?.top ?? 0).toBeGreaterThan(geometry.heading?.bottom ?? 0);
      }

      if (viewport.width <= 640) {
        expect(geometry.section.height).toBeLessThanOrEqual(1_500);
        expect(geometry.panel?.height ?? 0).toBeLessThanOrEqual(1_300);
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.top ?? 0);
      }
    });
  }

  test("remains accessible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/produkt");

    const section = page.locator("#product-final-cta");
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(section.getByRole("link")).toHaveCount(2);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
