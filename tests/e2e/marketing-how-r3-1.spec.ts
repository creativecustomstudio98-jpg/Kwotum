import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const heroViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works V7 hero", () => {
  test("opens with the real client-to-company flow", async ({ page }) => {
    await page.goto("/jak-dziala");

    const hero = page.locator("[data-how-hero]");
    const trustScene = hero.getByRole("figure", {
      name: "Droga od wyniku klienta do uporządkowanego leada w panelu firmy",
    });
    const journey = hero.getByRole("navigation", { name: "Sześć etapów procesu Kwotum" });

    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      "Klient przechodzi proces. Firma podejmuje decyzję",
    );
    await expect(trustScene).toBeVisible();
    await expect(trustScene.locator("img")).toHaveCount(4);
    await expect(journey.locator("li")).toHaveCount(6);
    await expect(journey.locator("li strong")).toHaveText([
      "Konfiguracja",
      "Publikacja",
      "Sesja klienta",
      "Wynik",
      "Gotowy lead",
      "Decyzja firmy",
    ]);
    await expect(hero.getByRole("link", { name: "Zobacz sześć etapów" })).toHaveAttribute(
      "href",
      "#proces",
    );
    await expect(hero.getByRole("link", { name: "Poznaj produkt" })).toHaveAttribute(
      "href",
      "/produkt",
    );
    await expect(hero).toContainText("Decyzja należy do firmy");
    await expect(hero).not.toContainText(/AI|automatyczna decyzja/i);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of heroViewports) {
    test(`keeps the opening composition intact at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const hero = page.locator("[data-how-hero]");
      const geometry = await hero.evaluate((region) => {
        const copy = region
          .querySelector<HTMLElement>("[data-how-hero-copy]")
          ?.getBoundingClientRect();
        const scene = region
          .querySelector<HTMLElement>("[data-trust-map]")
          ?.getBoundingClientRect();
        const actions = [...region.querySelectorAll<HTMLElement>("[data-how-actions] a")].map(
          (element) => element.getBoundingClientRect(),
        );

        return {
          actions: actions.map(({ bottom, left, right, top }) => ({ bottom, left, right, top })),
          copy: copy ? { bottom: copy.bottom, left: copy.left, right: copy.right } : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          scene: scene
            ? { bottom: scene.bottom, left: scene.left, right: scene.right, top: scene.top }
            : null,
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(hero).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.actions).toHaveLength(2);
      expect(geometry.copy?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 15 : 16);
      expect(geometry.scene?.right ?? 0).toBeLessThanOrEqual(geometry.viewport - 15);

      if (viewport.width > 1_024) {
        expect(geometry.scene?.left ?? 0).toBeGreaterThan(geometry.copy?.right ?? 0);
      } else {
        expect(geometry.scene?.top ?? 0).toBeGreaterThan(geometry.copy?.bottom ?? 0);
      }

      if (viewport.width <= 768) {
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.bottom ?? 0);
      }
    });
  }

  test("preserves hierarchy in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    const hero = page.locator("[data-how-hero]");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(hero.locator("[data-how-actions] a")).toHaveCount(2);
    await expect(hero.getByRole("navigation").locator("li")).toHaveCount(6);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
