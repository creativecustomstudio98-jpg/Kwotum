import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product V7 hero", () => {
  test("opens with the real product and only working next steps", async ({ page }) => {
    await page.goto("/produkt");

    const hero = page.locator("[data-product-hero]");
    const proof = hero.locator("[data-product-hero-proof]");

    await expect(
      hero.getByRole("heading", {
        level: 1,
        name: "Od pierwszego pytania do leada gotowego do rozmowy",
      }),
    ).toBeVisible();
    await expect(proof).toBeVisible();
    await expect(proof.getByText("Panel Kwotum", { exact: true })).toBeVisible();
    await expect(proof.getByText("Dane demonstracyjne", { exact: true })).toBeVisible();
    await expect(proof.locator("img")).toHaveCount(2);
    await expect(hero.getByRole("link", { name: "Zobacz, jak działa" })).toHaveAttribute(
      "href",
      "/jak-dziala",
    );
    await expect(hero.getByRole("link", { name: "Program pilotażowy" })).toHaveAttribute(
      "href",
      "/cennik",
    );

    const sectionNav = page.locator("[data-product-section-nav]");
    await expect(sectionNav.getByRole("link")).toHaveCount(4);
    await expect(sectionNav.getByRole("link", { name: /Budowa procesu/ })).toHaveAttribute(
      "href",
      "#proces",
    );
  });

  for (const viewport of viewports) {
    test(`keeps the editorial hero intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const hero = page.locator("[data-product-hero]");
      const proof = hero.locator("[data-product-hero-proof]");
      const geometry = await hero.evaluate((region) => {
        const bounds = region.getBoundingClientRect();
        const h1 = region.querySelector("h1")?.getBoundingClientRect();
        const actions = [...region.querySelectorAll<HTMLElement>("[data-product-actions] a")].map(
          (action) => action.getBoundingClientRect(),
        );
        const visibleImages = [...region.querySelectorAll<HTMLImageElement>("img")].filter(
          (image) =>
            image.getClientRects().length > 0 && getComputedStyle(image).display !== "none",
        );

        return {
          actions: actions.map((action) => ({ height: action.height, width: action.width })),
          h1: h1
            ? {
                fontSize: Number.parseFloat(getComputedStyle(region.querySelector("h1")!).fontSize),
              }
            : null,
          hero: { left: bounds.left, right: bounds.right },
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          viewport: document.documentElement.clientWidth,
          visibleImages: visibleImages.length,
        };
      });

      await expect(hero).toBeVisible();
      await expect(proof).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.hero.left).toBeGreaterThanOrEqual(0);
      expect(geometry.hero.right).toBeLessThanOrEqual(geometry.viewport + 1);
      expect(geometry.visibleImages).toBe(viewport.width <= 768 ? 1 : 2);
      expect(geometry.actions).toHaveLength(2);
      expect(Math.min(...geometry.actions.map((action) => action.height))).toBeGreaterThanOrEqual(
        44,
      );
      expect(geometry.h1?.fontSize ?? 0).toBeGreaterThanOrEqual(viewport.width <= 430 ? 40 : 48);

      if (viewport.width <= 430) {
        expect(
          Math.abs((geometry.actions[0]?.width ?? 0) - (geometry.actions[1]?.width ?? 0)),
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test("is keyboard accessible and clean in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/produkt");

    const action = page.getByRole("link", { name: "Zobacz, jak działa" }).first();
    await action.focus();
    await expect(action).toBeFocused();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
