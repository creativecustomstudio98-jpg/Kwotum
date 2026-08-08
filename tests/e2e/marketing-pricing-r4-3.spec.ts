import { expect, test } from "@playwright/test";

import {
  expectPricingAccessibility,
  pricingViewports,
  readPricingGeometry,
} from "./marketing-pricing-recovery.shared";

test.describe("marketing pricing recovery — truthful validation", () => {
  test("does not turn the unapproved self-service model into an offer", async ({ page }) => {
    await page.goto("/cennik");

    const validation = page.getByRole("article").filter({ hasText: "Self-service" });
    await expect(validation.getByText("Bez publicznej ceny", { exact: true })).toBeVisible();
    await expect(validation.getByText("W walidacji", { exact: true })).toBeVisible();
    await expect(
      validation.getByRole("list", { name: "Otwarte decyzje modelu self-service" }),
    ).toContainText("Płatności samoobsługowe są poza obecnym MVP");
    await expect(validation.getByText(/Brak planu dostępnego/)).toBeVisible();

    const mainText = await page.locator("main").innerText();
    expect(mainText).not.toMatch(/\d[\d\s]*[,.]?\d*\s*zł/i);
    expect(mainText).not.toContain("14 dni");
    expect(mainText).not.toContain("Najpopularniejszy");
    expect(mainText).not.toContain("Kup teraz");
  });

  for (const viewport of pricingViewports) {
    test(`keeps validation readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/cennik");

      const geometry = await readPricingGeometry(page);
      const validation = page.getByRole("article").filter({ hasText: "Self-service" });
      await expect(validation).toBeVisible();
      await expect(validation.getByRole("listitem")).toHaveCount(4);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
    });
  }

  test("survives longer validation facts in forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/cennik");
    await page
      .getByRole("list", { name: "Otwarte decyzje modelu self-service" })
      .getByRole("listitem")
      .nth(1)
      .evaluate((item) => {
        item.textContent =
          "Limity procesów, opublikowanych wersji i przekazywanych leadów pozostają otwarte do czasu zakończenia programu pilotażowego.";
      });

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await expectPricingAccessibility(page);
  });
});
