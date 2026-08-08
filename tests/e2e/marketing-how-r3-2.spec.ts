import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const processViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works R3.2 first process sequence", () => {
  test("explains configuration, publication and the client session as one honest sequence", async ({
    page,
  }) => {
    await page.goto("/jak-dziala");

    const process = page.getByRole("region", {
      name: "Proces zaczyna się, zanim klient zobaczy pierwsze pytanie.",
    });
    const stages = process.locator(".process-first-half__steps > li");

    await expect(process).toBeVisible();
    await expect(stages).toHaveCount(3);
    await expect(stages.locator("h3")).toHaveText([
      "Konfiguracja",
      "Walidacja i publikacja",
      "Sesja klienta",
    ]);
    await expect(stages.locator(".process-stage-card__header strong")).toHaveText([
      "Owner lub Admin",
      "Walidacja systemowa",
      "Widget + serwer",
    ]);
    await expect(stages.locator("footer > strong")).toHaveText([
      "Kompletny szkic procesu",
      "Niezmienna wersja procesu",
      "Potwierdzony kolejny krok",
    ]);
    await expect(stages.getByText("Dane przykładowe", { exact: true })).toHaveCount(3);
    await expect(process).toContainText("przeglądarka prowadzi sesję");
    await expect(process).toContainText("nie otrzymuje prywatnych reguł pricingu ani scoringu");
    await expect(process).not.toContainText("AI");

    const nextStages = page.locator("#proces-dalszy .process-second-half__steps > li");
    await expect(nextStages).toHaveCount(3);
    await expect(nextStages.locator("h3")).toHaveText([
      "Bezpieczny wynik dla klienta",
      "Kontakt staje się leadem",
      "Firma wybiera następny krok",
    ]);
    await expect(page.locator("#bezpieczenstwo")).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of processViewports) {
    test(`keeps the three-step contract legible at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const process = page.locator("#proces");
      const geometry = await process.evaluate((region) => {
        const bounds = region.getBoundingClientRect();
        const cards = [
          ...region.querySelectorAll<HTMLElement>(".process-first-half__steps > li"),
        ].map((card) => {
          const cardBounds = card.getBoundingClientRect();
          return {
            height: cardBounds.height,
            left: cardBounds.left,
            right: cardBounds.right,
            top: cardBounds.top,
          };
        });
        const textSizes = [...region.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          cards,
          height: bounds.height,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          smallestText: Math.min(...textSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(process).toBeVisible();
      expect(geometry.cards).toHaveLength(3);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.cards[0]?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.cards[2]?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );

      if (viewport.width > 928) {
        expect(geometry.height).toBeLessThanOrEqual(1_100);
        expect(
          Math.abs((geometry.cards[0]?.top ?? 0) - (geometry.cards[2]?.top ?? 0)),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.max(...geometry.cards.map((card) => card.height)) -
            Math.min(...geometry.cards.map((card) => card.height)),
        ).toBeLessThanOrEqual(1);
      } else {
        expect(geometry.height).toBeLessThanOrEqual(1_900);
        expect(geometry.cards[1]?.top ?? 0).toBeGreaterThan(geometry.cards[0]?.top ?? 0);
        expect(geometry.cards[2]?.top ?? 0).toBeGreaterThan(geometry.cards[1]?.top ?? 0);
      }
    });
  }

  test("retains its hierarchy and labels in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    const process = page.locator("#proces");
    await expect(process.locator(".process-first-half__steps > li")).toHaveCount(3);
    await expect(process.locator(".process-stage-card__demo")).toHaveCount(3);
    await expect(process.locator("footer > strong")).toHaveCount(3);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
