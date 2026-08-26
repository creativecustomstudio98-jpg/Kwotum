import { expect, test } from "@playwright/test";

const viewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product V7 chapters", () => {
  test("uses one real application screen for every product chapter", async ({ page }) => {
    await page.goto("/produkt");

    const chapters = page.locator("[data-product-feature]");
    const screens = page.locator("[data-product-screen]");

    await expect(chapters).toHaveCount(3);
    await expect(screens).toHaveCount(3);
    await expect(
      chapters.nth(0).getByRole("heading", {
        level: 2,
        name: "Najpierw ustalasz, o co naprawdę trzeba zapytać",
      }),
    ).toBeVisible();
    await expect(
      chapters.nth(1).getByRole("heading", {
        level: 2,
        name: "Krótki proces dla klienta. Pełny kontekst dla firmy",
      }),
    ).toBeVisible();
    await expect(
      chapters.nth(2).getByRole("heading", {
        level: 2,
        name: "Wszystkie odpowiedzi w jednym, czytelnym rekordzie",
      }),
    ).toBeVisible();

    for (const screen of await screens.all()) {
      await expect(screen.locator("img")).toHaveCount(2);
      await expect(screen.getByText("Dane demonstracyjne", { exact: true })).toBeVisible();
      const alternativeTexts = await screen
        .locator("img")
        .evaluateAll((images) => images.map((image) => image.getAttribute("alt")));
      expect(alternativeTexts.every((text) => text && !/Wyceno|Lorum/i.test(text))).toBe(true);
    }
  });

  for (const viewport of viewports) {
    test(`keeps each product chapter readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const geometry = await page.locator("[data-product-feature]").evaluateAll((sections) =>
        sections.map((section) => {
          const copy = section.querySelector("h2")?.parentElement?.getBoundingClientRect();
          const screen = section.querySelector("[data-product-screen]")?.getBoundingClientRect();
          const visibleImages = [...section.querySelectorAll<HTMLImageElement>("img")].filter(
            (image) =>
              image.getClientRects().length > 0 && getComputedStyle(image).display !== "none",
          );

          return {
            copy: copy
              ? { bottom: copy.bottom, left: copy.left, right: copy.right, top: copy.top }
              : null,
            screen: screen
              ? { bottom: screen.bottom, left: screen.left, right: screen.right, top: screen.top }
              : null,
            visibleImages: visibleImages.length,
          };
        }),
      );

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);

      for (const chapter of geometry) {
        expect(chapter.visibleImages).toBe(1);
        expect(chapter.screen?.top ?? 0).toBeGreaterThan(chapter.copy?.bottom ?? 0);
        expect(chapter.screen?.left ?? 0).toBeGreaterThanOrEqual(0);
        expect(chapter.screen?.right ?? 0).toBeLessThanOrEqual(viewport.width + 1);
      }
    });
  }
});
