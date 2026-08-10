import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const heroViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works R3.1 hero", () => {
  test("shows an honest trust map and working next steps", async ({ page }) => {
    await page.goto("/jak-dziala");

    const hero = page.getByRole("region", {
      name: "Klient przechodzi proces. Firma podejmuje decyzję.",
    });
    const trustMap = hero.getByRole("figure", { name: "Co dzieje się gdzie?" });

    await expect(hero).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(trustMap.locator("ol > li")).toHaveCount(3);
    await expect(trustMap.locator("ol > li > strong")).toHaveText([
      "Prowadzi klienta",
      "Potwierdza wynik",
      "Porządkuje kontekst",
    ]);
    await expect(trustMap.locator(".trust-map__limit")).toHaveText([
      "Nie zna prywatnych reguł",
      "Źródło wyniku i dostępu",
      "Decyzja należy do firmy",
    ]);
    await expect(hero.getByRole("link", { name: "Zobacz sześć etapów" })).toHaveAttribute(
      "href",
      "#proces",
    );
    await expect(hero.getByRole("link", { name: "Poznaj produkt" })).toHaveAttribute(
      "href",
      "/produkt",
    );

    const process = page.locator("#proces");
    await expect(process.locator(".process-first-half__steps > li")).toHaveCount(3);
    await expect(page.locator("#proces-dalszy .process-second-half__steps > li")).toHaveCount(3);
    await expect(process.getByRole("heading", { name: "Konfiguracja" })).toBeVisible();
    await expect(hero).not.toContainText("AI");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of heroViewports) {
    test(`keeps the trust boundary clear at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const hero = page.locator("#how-it-works-hero");
      const geometry = await hero.evaluate((region) => {
        const regionBounds = region.getBoundingClientRect();
        const copyBounds = region.querySelector("[data-how-hero-copy]")?.getBoundingClientRect();
        const mapBounds = region.querySelector("[data-trust-map]")?.getBoundingClientRect();
        const stepBounds = [...region.querySelectorAll<HTMLElement>(".trust-map ol > li")].map(
          (step) => step.getBoundingClientRect(),
        );
        const actionBounds = [...region.querySelectorAll<HTMLElement>("a.marketing-button")].map(
          (action) => action.getBoundingClientRect(),
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
            top: action.top,
            width: action.width,
          })),
          copy: copyBounds
            ? { bottom: copyBounds.bottom, left: copyBounds.left, right: copyBounds.right }
            : null,
          map: mapBounds
            ? {
                bottom: mapBounds.bottom,
                left: mapBounds.left,
                right: mapBounds.right,
                top: mapBounds.top,
              }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          sectionHeight: regionBounds.height,
          smallestText: Math.min(...textSizes),
          steps: stepBounds.map((step) => ({ left: step.left, top: step.top })),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(hero).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      expect(
        Math.abs((geometry.actions[0]?.height ?? 0) - (geometry.actions[1]?.height ?? 0)),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs((geometry.actions[0]?.width ?? 0) - (geometry.actions[1]?.width ?? 0)),
      ).toBeLessThanOrEqual(1);
      expect(geometry.copy?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.map?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );

      if (viewport.width > 992) {
        expect(geometry.sectionHeight).toBeLessThanOrEqual(980);
        expect(geometry.map?.left ?? 0).toBeGreaterThan(geometry.copy?.right ?? 0);
      } else {
        expect(geometry.map?.top ?? 0).toBeGreaterThan(geometry.copy?.bottom ?? 0);
      }

      if (viewport.width <= 768) {
        expect(geometry.sectionHeight).toBeLessThanOrEqual(1_750);
        if (viewport.width >= 368) {
          expect(
            Math.abs((geometry.steps[1]?.top ?? 0) - (geometry.steps[0]?.top ?? 0)),
          ).toBeLessThanOrEqual(1);
          expect(geometry.steps[2]?.top ?? 0).toBeGreaterThan(geometry.steps[1]?.top ?? 0);
        } else {
          expect(geometry.steps[1]?.top ?? 0).toBeGreaterThan(geometry.steps[0]?.top ?? 0);
          expect(geometry.steps[2]?.top ?? 0).toBeGreaterThan(geometry.steps[1]?.top ?? 0);
        }
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.top ?? 0);
      }
    });
  }

  test("remains accessible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    const hero = page.locator("#how-it-works-hero");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(hero.locator(".trust-map ol > li")).toHaveCount(3);
    await expect(hero.locator(".marketing-actions").getByRole("link")).toHaveCount(2);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
