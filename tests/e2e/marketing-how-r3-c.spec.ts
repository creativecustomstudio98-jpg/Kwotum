import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routeViewports = [
  { height: 1_000, width: 1_536 },
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_280 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

const routeSections =
  "#how-it-works-hero, #proces, #proces-dalszy, #decyzja, #bezpieczenstwo, #how-final-cta";

test.describe("marketing how it works V7 full route", () => {
  test("keeps the complete explanation available without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      locale: "pl-PL",
      viewport: { height: 844, width: 390 },
    });
    const page = await context.newPage();

    await page.goto("/jak-dziala");

    await expect(page.locator(routeSections)).toHaveCount(6);
    await expect(page.locator("[data-how-chapter]")).toHaveCount(3);
    await expect(page.locator("[data-how-chapter] ol > li")).toHaveCount(6);
    await expect(page.locator("main details")).toHaveCount(0);
    await expect(page.getByText("Dane demonstracyjne", { exact: true })).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);

    await context.close();
  });

  for (const viewport of routeViewports) {
    test(`keeps the route rhythm deliberate at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const geometry = await page.locator("main").evaluate((main, selectors) => {
        const sections = [...main.querySelectorAll<HTMLElement>(selectors)].map((section) => {
          const bounds = section.getBoundingClientRect();
          return { bottom: bounds.bottom, top: bounds.top };
        });
        const textSizes = [...main.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          documentHeight: document.documentElement.scrollHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          sections,
          smallestText: Math.min(...textSizes),
        };
      }, routeSections);

      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.sections).toHaveLength(6);
      for (let index = 1; index < geometry.sections.length; index += 1) {
        expect(geometry.sections[index]?.top ?? 0).toBeGreaterThanOrEqual(
          geometry.sections[index - 1]?.bottom ?? 0,
        );
      }
      expect(geometry.documentHeight).toBeLessThanOrEqual(viewport.width <= 1_024 ? 12_000 : 8_500);
    });
  }

  test("has no serious accessibility violations after the full redesign", async ({ page }) => {
    await page.goto("/jak-dziala");
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
