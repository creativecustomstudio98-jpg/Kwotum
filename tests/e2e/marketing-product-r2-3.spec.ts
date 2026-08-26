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

test.describe("marketing product responsibility", () => {
  test("keeps the system and company responsibilities explicit", async ({ page }) => {
    await page.goto("/produkt");

    const section = page.locator("#odpowiedzialnosc");
    const columns = section.locator("[data-product-responsibility]");

    await expect(
      section.getByRole("heading", {
        level: 2,
        name: "System porządkuje decyzję. Nie podejmuje jej za firmę",
      }),
    ).toBeVisible();
    await expect(columns).toHaveCount(2);
    await expect(columns.locator("h3")).toHaveText([
      "Porządkuje i wyjaśnia",
      "Weryfikuje i decyduje",
    ]);
    await expect(columns.first().getByRole("listitem")).toHaveCount(3);
    await expect(columns.nth(1).getByRole("listitem")).toHaveCount(3);
    await expect(section).toContainText(
      "Wynik prezentowany klientowi jest orientacyjny i nie stanowi wiążącej oferty.",
    );
  });

  for (const viewport of viewports) {
    test(`keeps the responsibility split readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const columns = await page.locator("[data-product-responsibility]").evaluateAll((items) =>
        items.map((item) => {
          const bounds = item.getBoundingClientRect();
          return { left: bounds.left, top: bounds.top };
        }),
      );

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);

      if (viewport.width > 768) {
        expect(Math.abs((columns[0]?.top ?? 0) - (columns[1]?.top ?? 0))).toBeLessThanOrEqual(1);
        expect(columns[1]?.left ?? 0).toBeGreaterThan(columns[0]?.left ?? 0);
      } else {
        expect(columns[1]?.top ?? 0).toBeGreaterThan(columns[0]?.top ?? 0);
      }
    });
  }

  test("keeps the full page accessible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/produkt");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
