import { expect, test } from "@playwright/test";

import {
  expectPricingAccessibility,
  pricingViewports,
  readPricingGeometry,
} from "./marketing-pricing-recovery.shared";

test.describe("marketing pricing recovery — hero", () => {
  test("opens with one clear pilot-first decision", async ({ page }) => {
    await page.goto("/cennik");

    const hero = page.getByRole("region", {
      name: "Najpierw pilotaż. Potem świadoma decyzja.",
    });
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      "Najpierw pilotaż. Potem świadoma decyzja.",
    );
    await expect(hero.getByText("Przejrzysty model współpracy")).toBeVisible();
    await expect(hero.getByText(/Nie publikujemy sztucznych pakietów/)).toBeVisible();
  });

  for (const viewport of pricingViewports) {
    test(`keeps the simplified hero intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/cennik");

      const geometry = await readPricingGeometry(page);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.pricing.left).toBeGreaterThanOrEqual(0);
      expect(geometry.pricing.right).toBeLessThanOrEqual(geometry.viewport);
      expect(geometry.cards).toHaveLength(2);
      expect(geometry.pricing.height).toBeLessThanOrEqual(viewport.width <= 430 ? 3_200 : 2_200);
    });
  }

  test("keeps the heading readable with long copy and forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/cennik");
    await page.locator(".pricing-simple-hero__heading > p:last-child").evaluate((copy) => {
      copy.textContent =
        "Nie publikujemy sztucznych pakietów ani obietnic. Najpierw wspólnie ustalamy rzeczywisty proces, sposób publikacji oraz kryteria jakości przekazywanego briefu.";
    });

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await expectPricingAccessibility(page);
  });
});
