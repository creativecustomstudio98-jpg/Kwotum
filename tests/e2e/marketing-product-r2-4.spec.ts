import { expect, test } from "@playwright/test";

const viewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product final step", () => {
  test("closes with only real routes", async ({ page }) => {
    await page.goto("/produkt");

    const section = page.locator("#product-final-cta");
    await expect(
      section.getByRole("heading", {
        level: 2,
        name: "Zobacz cały proces na konkretnym przykładzie.",
      }),
    ).toBeVisible();
    await expect(section.getByRole("link", { name: "Przejdź przez proces" })).toHaveAttribute(
      "href",
      "/jak-dziala",
    );
    await expect(section.getByRole("link", { name: "Zobacz zastosowania" })).toHaveAttribute(
      "href",
      "/branze",
    );
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  for (const viewport of viewports) {
    test(`keeps the final decision clear at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const section = page.locator("#product-final-cta");
      const actions = await section.locator("a").evaluateAll((links) =>
        links.map((link) => {
          const bounds = link.getBoundingClientRect();
          return { height: bounds.height, top: bounds.top, width: bounds.width };
        }),
      );

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      expect(actions).toHaveLength(2);
      expect(Math.abs((actions[0]?.height ?? 0) - (actions[1]?.height ?? 0))).toBeLessThanOrEqual(
        1,
      );

      if (viewport.width <= 760) {
        expect(Math.abs((actions[0]?.width ?? 0) - (actions[1]?.width ?? 0))).toBeLessThanOrEqual(
          1,
        );
        expect(actions[1]?.top ?? 0).toBeGreaterThan(actions[0]?.top ?? 0);
      }
    });
  }
});
