import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const finalViewports = [
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

test.describe("marketing how it works R3.5 final overview", () => {
  test("closes the process with a real transition to industries", async ({ page }) => {
    await page.goto("/jak-dziala");

    const section = page.getByRole("region", {
      name: "Wybierz branżę. Zobacz właściwy brief.",
    });
    const overview = section.getByRole("complementary", {
      name: "Stały rdzeń. Branżowy kontekst.",
    });
    const rows = overview.locator("ol > li");

    await expect(section).toBeVisible();
    await expect(rows).toHaveCount(3);
    await expect(rows.locator("div:first-of-type > strong")).toHaveText([
      "Sześć etapów procesu",
      "Uporządkowany lead",
      "Decyzja firmy",
    ]);
    await expect(rows.locator("div:last-of-type > strong")).toHaveText([
      "Pytania i warunki",
      "Zakres i materiały",
      "Właściwy następny krok",
    ]);
    await expect(section.getByLabel("Zasady przejścia do branż").locator("li")).toHaveText([
      "Ten sam bezpieczny mechanizm",
      "Pytania dopasowane do usługi",
      "Decyzja nadal po stronie firmy",
    ]);
    await expect(section.getByRole("link", { name: "Porównaj branże" })).toHaveAttribute(
      "href",
      "/branze",
    );
    await expect(section.getByRole("link", { name: "Przejdź do panelu" })).toHaveAttribute(
      "href",
      "/logowanie",
    );
    await expect(section.locator('a[href="/jak-dziala"]')).toHaveCount(0);
    await expect(overview.locator("footer > strong")).toHaveText(
      "Brief gotowy do pierwszej rozmowy",
    );
    await expect(section).not.toContainText(/AI|automatyczna decyzja|gwarancja|CRM/i);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of finalViewports) {
    test(`keeps the final decision intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const section = page.locator("#how-final-cta");
      const geometry = await section.evaluate((region) => {
        const sectionBounds = region.getBoundingClientRect();
        const panelBounds = region
          .querySelector<HTMLElement>(".how-final-cta__panel")
          ?.getBoundingClientRect();
        const headingBounds = region.querySelector<HTMLElement>("h2")?.getBoundingClientRect();
        const overviewBounds = region
          .querySelector<HTMLElement>("[data-how-overview]")
          ?.getBoundingClientRect();
        const actionBounds = [...region.querySelectorAll<HTMLElement>("a")].map((action) =>
          action.getBoundingClientRect(),
        );
        const textSizes = [...region.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          actions: actionBounds.map((action) => ({
            height: action.height,
            left: action.left,
            top: action.top,
            width: action.width,
          })),
          documentHeight: document.documentElement.scrollHeight,
          heading: headingBounds
            ? { bottom: headingBounds.bottom, left: headingBounds.left, right: headingBounds.right }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overview: overviewBounds
            ? {
                height: overviewBounds.height,
                left: overviewBounds.left,
                right: overviewBounds.right,
                top: overviewBounds.top,
              }
            : null,
          panel: panelBounds
            ? {
                height: panelBounds.height,
                left: panelBounds.left,
                right: panelBounds.right,
                top: panelBounds.top,
              }
            : null,
          sectionHeight: sectionBounds.height,
          smallestText: Math.min(...textSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(section).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      expect(geometry.panel?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.panel?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(
        Math.abs((geometry.actions[0]?.height ?? 0) - (geometry.actions[1]?.height ?? 0)),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs((geometry.actions[0]?.width ?? 0) - (geometry.actions[1]?.width ?? 0)),
      ).toBeLessThanOrEqual(1);

      if (viewport.width > 1_088) {
        expect(geometry.sectionHeight).toBeLessThanOrEqual(950);
        expect(geometry.overview?.left ?? 0).toBeGreaterThan(geometry.heading?.right ?? 0);
      } else {
        expect(geometry.overview?.top ?? 0).toBeGreaterThan(geometry.heading?.bottom ?? 0);
      }

      if (viewport.width <= 640) {
        expect(geometry.sectionHeight).toBeLessThanOrEqual(viewport.width === 320 ? 1_550 : 1_450);
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.top ?? 0);
      }
    });
  }

  test("keeps the final choice visible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    const section = page.locator("#how-final-cta");
    await expect(section.getByRole("link")).toHaveCount(2);
    await expect(section.locator("[data-how-overview] ol > li")).toHaveCount(3);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
