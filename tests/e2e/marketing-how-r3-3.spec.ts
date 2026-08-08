import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const outcomeViewports = [
  { height: 1_000, width: 1_536 },
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_280 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 375 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works R3.3 outcome sequence", () => {
  test("keeps server output, lead submission and the company decision separate", async ({
    page,
  }) => {
    await page.goto("/jak-dziala");

    const process = page.getByRole("region", {
      name: "Odpowiedzi prowadzą do decyzji firmy. Nie zastępują jej.",
    });
    const stages = process.locator(".process-second-half__steps > li");

    await expect(process).toBeVisible();
    await expect(stages).toHaveCount(3);
    await expect(stages.locator("h3")).toHaveText([
      "Bezpieczny wynik dla klienta",
      "Kontakt staje się leadem",
      "Firma wybiera następny krok",
    ]);
    await expect(stages.locator(".process-outcome-card__header strong")).toHaveText([
      "Potwierdzenie wyniku",
      "Świadome przekazanie",
      "Obsługa i pomiar",
    ]);
    await expect(stages.locator("footer > strong")).toHaveText([
      "Klient widzi bezpieczny zakres",
      "Lead z pełnym kontekstem",
      "Decyzja pozostaje po stronie firmy",
    ]);
    await expect(stages.getByText("Dane przykładowe", { exact: true })).toHaveCount(3);
    await expect(process).toContainText("Wynik jest orientacyjny");
    await expect(process).toContainText("prywatny score pozostaje w panelu");
    await expect(process).not.toContainText("AI");
    await expect(page.locator("#bezpieczenstwo")).toBeVisible();
    await expect(page.locator("#bezpieczenstwo dt")).toHaveCount(3);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of outcomeViewports) {
    test(`keeps the outcome sequence intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const process = page.locator("#proces-dalszy");
      const geometry = await process.evaluate((region) => {
        const regionBounds = region.getBoundingClientRect();
        const introBounds = region
          .querySelector<HTMLElement>(".process-second-half__intro")
          ?.getBoundingClientRect();
        const cards = [
          ...region.querySelectorAll<HTMLElement>(".process-second-half__steps > li"),
        ].map((card) => {
          const cardBounds = card.getBoundingClientRect();
          return {
            bottom: cardBounds.bottom,
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
          height: regionBounds.height,
          intro: introBounds
            ? {
                bottom: introBounds.bottom,
                left: introBounds.left,
                right: introBounds.right,
                top: introBounds.top,
              }
            : null,
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
      expect(geometry.cards[1]?.top ?? 0).toBeGreaterThan(geometry.cards[0]?.top ?? 0);
      expect(geometry.cards[2]?.top ?? 0).toBeGreaterThan(geometry.cards[1]?.top ?? 0);

      if (viewport.width > 1_152) {
        expect(geometry.height).toBeLessThanOrEqual(1_000);
        expect(geometry.cards[0]?.left ?? 0).toBeGreaterThan(geometry.intro?.right ?? 0);
        expect(
          Math.max(...geometry.cards.map((card) => card.height)) -
            Math.min(...geometry.cards.map((card) => card.height)),
        ).toBeLessThanOrEqual(1);
      } else {
        expect(geometry.cards[0]?.top ?? 0).toBeGreaterThan(geometry.intro?.bottom ?? 0);
        expect(geometry.height).toBeLessThanOrEqual(viewport.width === 320 ? 2_100 : 1_850);
      }
    });
  }

  test("keeps result boundaries visible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    const process = page.locator("#proces-dalszy");
    await expect(process.locator(".process-second-half__steps > li")).toHaveCount(3);
    await expect(process.locator(".process-outcome-card__demo")).toHaveCount(3);
    await expect(process.locator("footer > strong")).toHaveCount(3);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
