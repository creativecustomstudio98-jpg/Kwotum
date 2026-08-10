import { expect, test } from "@playwright/test";

import {
  expectPricingAccessibility,
  pricingViewports,
  readPricingGeometry,
} from "./marketing-pricing-recovery.shared";

test.describe("marketing pricing recovery — two plans", () => {
  test("shows exactly two honest cooperation cards", async ({ page }) => {
    await page.goto("/cennik");

    const plans = page.getByLabel("Dwa aktualne modele współpracy");
    const cards = plans.getByRole("article");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).getByRole("heading", { level: 2 })).toHaveText(
      "Wdrożenie z ustalonym zakresem",
    );
    await expect(cards.nth(1).getByRole("heading", { level: 2 })).toHaveText(
      "Model w trakcie walidacji",
    );
    await expect(cards.nth(0).getByRole("listitem")).toHaveCount(5);
    await expect(cards.nth(1).getByRole("listitem")).toHaveCount(4);
    await expect(cards.nth(0).getByRole("link")).toHaveAttribute("href", "/jak-dziala#proces");
    await expect(cards.nth(1).getByRole("link")).toHaveAttribute("href", "/produkt");
  });

  for (const viewport of pricingViewports) {
    test(`keeps plan geometry deliberate at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/cennik");

      const geometry = await readPricingGeometry(page);
      expect(geometry.cards).toHaveLength(2);
      expect(geometry.cardActions).toHaveLength(2);
      expect(
        Math.min(...geometry.cardActions.map((action) => action.height)),
      ).toBeGreaterThanOrEqual(52);
      expect(geometry.overflow).toBeLessThanOrEqual(1);

      if (viewport.width > 768) {
        expect(Math.abs(geometry.cards[0]!.top - geometry.cards[1]!.top)).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.cards[0]!.height - geometry.cards[1]!.height)).toBeLessThanOrEqual(
          1,
        );
      } else {
        expect(geometry.cards[1]!.top).toBeGreaterThan(geometry.cards[0]!.bottom);
      }
    });
  }

  test("keeps card links keyboard reachable and accessible", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/cennik");

    const first = page.getByRole("link", { name: "Zobacz przebieg pilotażu" });
    const second = page.getByRole("link", { name: "Poznaj obecny produkt" });
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    await expectPricingAccessibility(page);
  });
});
