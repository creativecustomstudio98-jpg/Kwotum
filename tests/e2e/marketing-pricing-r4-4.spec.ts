import { expect, test } from "@playwright/test";

import {
  expectPricingAccessibility,
  pricingViewports,
  readPricingGeometry,
} from "./marketing-pricing-recovery.shared";

test.describe("marketing pricing recovery — assurances and next step", () => {
  test("ends with three assurances and two real paths", async ({ page }) => {
    await page.goto("/cennik");

    const assurances = page.getByRole("list", { name: "Zasady programu pilotażowego" });
    await expect(assurances.getByRole("listitem")).toHaveText([
      "Bez fikcyjnych cen",
      "Bez karty płatniczej",
      "Decyzja po pilotażu",
    ]);

    const finalCta = page.getByRole("region", {
      name: "Zobacz proces, zanim porozmawiamy o zakresie.",
    });
    await expect(finalCta.getByRole("link", { name: "Zobacz, jak działa" })).toHaveAttribute(
      "href",
      "/jak-dziala#proces",
    );
    await expect(finalCta.getByRole("link", { name: "Przejdź do logowania" })).toHaveAttribute(
      "href",
      "/logowanie",
    );
    await expect(finalCta.getByRole("link")).toHaveCount(2);
  });

  for (const viewport of pricingViewports) {
    test(`keeps final decisions intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/cennik");

      const geometry = await readPricingGeometry(page);
      expect(geometry.assurances).toHaveLength(3);
      expect(geometry.finalActions).toHaveLength(2);
      expect(
        Math.min(...geometry.finalActions.map((action) => action.height)),
      ).toBeGreaterThanOrEqual(52);
      expect(
        Math.abs(geometry.finalActions[0]!.height - geometry.finalActions[1]!.height),
      ).toBeLessThanOrEqual(1);
      expect(geometry.finalCta.left).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.finalCta.right).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(geometry.overflow).toBeLessThanOrEqual(1);
    });
  }

  test("keeps final actions in keyboard order and passes axe", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/cennik");

    const first = page.getByRole("link", { name: "Zobacz, jak działa" });
    const second = page.getByRole("link", { name: "Przejdź do logowania" });
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    await expectPricingAccessibility(page);
  });
});
