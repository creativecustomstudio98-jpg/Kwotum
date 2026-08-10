import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const boundaryViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product R2.3 responsibility contract", () => {
  test("separates product responsibility from the company's decision", async ({ page }) => {
    await page.goto("/produkt");

    const section = page.getByRole("region", {
      name: "Kwotum porządkuje proces. Decyzja nadal należy do firmy.",
    });
    const boundaries = section.getByRole("list", {
      name: "Granice odpowiedzialności produktu",
    });

    await expect(section).toBeVisible();
    await expect(boundaries.locator("[data-product-boundary]")).toHaveCount(3);
    await expect(boundaries.locator("[data-product-boundary] > header strong")).toHaveText([
      "Orientacyjny wynik",
      "Uporządkowany lead",
      "Jawne reguły",
    ]);

    for (const boundary of await boundaries.locator("[data-product-boundary]").all()) {
      await expect(boundary.locator("dl > div")).toHaveCount(2);
      await expect(boundary.locator("dt")).toHaveText(["Kwotum", "Firma"]);
    }

    await expect(section.getByLabel("Najważniejsza granica produktu")).toContainText(
      "Niewiążący wynik zawsze wymaga weryfikacji firmy.",
    );
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Zobacz cały proces na realnym zapytaniu.",
      }),
    ).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of boundaryViewports) {
    test(`keeps the responsibility contract readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const section = page.locator("#granice");
      const geometry = await section.evaluate((region) => {
        const bounds = region.getBoundingClientRect();
        const heading = region.querySelector("h2")?.getBoundingClientRect();
        const cardBounds = [...region.querySelectorAll<HTMLElement>("[data-product-boundary]")].map(
          (card) => card.getBoundingClientRect(),
        );
        const footer = region.querySelector("footer")?.getBoundingClientRect();
        const textSizes = [...region.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          cards: cardBounds.map((card) => ({
            height: card.height,
            left: card.left,
            right: card.right,
            top: card.top,
            width: card.width,
          })),
          footer: footer
            ? { bottom: footer.bottom, left: footer.left, right: footer.right, top: footer.top }
            : null,
          heading: heading
            ? { bottom: heading.bottom, left: heading.left, right: heading.right, top: heading.top }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          section: { height: bounds.height, left: bounds.left, right: bounds.right },
          smallestText: Math.min(...textSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(section).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.cards).toHaveLength(3);
      expect(geometry.heading?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.footer?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(geometry.footer?.top ?? 0).toBeGreaterThan(
        Math.max(...geometry.cards.map((card) => card.top)),
      );

      if (viewport.width > 960) {
        expect(geometry.section.height).toBeLessThanOrEqual(900);
        expect(Math.max(...geometry.cards.map((card) => card.top))).toBeCloseTo(
          Math.min(...geometry.cards.map((card) => card.top)),
          0,
        );
        expect(Math.max(...geometry.cards.map((card) => card.height))).toBeCloseTo(
          Math.min(...geometry.cards.map((card) => card.height)),
          0,
        );
      }

      if (viewport.width <= 640) {
        expect(geometry.section.height).toBeLessThanOrEqual(1_500);
        for (let index = 1; index < geometry.cards.length; index += 1) {
          expect(geometry.cards[index]?.top ?? 0).toBeGreaterThan(
            geometry.cards[index - 1]?.top ?? 0,
          );
        }
      }
    });
  }

  test("remains accessible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/produkt");

    const section = page.locator("#granice");
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(section.locator("[data-product-boundary]")).toHaveCount(3);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
