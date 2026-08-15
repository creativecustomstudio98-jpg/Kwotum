import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const chapterViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works V7 preparation chapter", () => {
  test("explains configuration and immutable publication with a real product screen", async ({
    page,
  }) => {
    await page.goto("/jak-dziala");

    const chapter = page.locator("#proces");
    const stages = chapter.locator("ol > li");

    await expect(chapter.getByRole("heading", { level: 2 })).toHaveText(
      "Najpierw firma układa logikę. Serwer pilnuje publikacji",
    );
    await expect(stages).toHaveCount(2);
    await expect(stages.locator("h3")).toHaveText(["Konfiguracja", "Walidacja i publikacja"]);
    await expect(stages.locator("footer strong")).toHaveText([
      "Kompletny szkic procesu",
      "Niezmienna wersja procesu",
    ]);
    await expect(stages.locator("span").filter({ hasText: /^0[12]$/ })).toHaveText(["01", "02"]);
    await expect(chapter.locator("[data-how-screen] img")).toHaveCount(2);
    await expect(chapter.getByText("Dane demonstracyjne", { exact: true })).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of chapterViewports) {
    test(`keeps preparation readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const chapter = page.locator("#proces");
      const geometry = await chapter.evaluate((region) => {
        const list = region.querySelector<HTMLElement>("ol")?.getBoundingClientRect();
        const screen = region
          .querySelector<HTMLElement>("[data-how-screen]")
          ?.getBoundingClientRect();
        return {
          list: list
            ? { bottom: list.bottom, left: list.left, right: list.right, top: list.top }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          screen: screen
            ? { bottom: screen.bottom, left: screen.left, right: screen.right, top: screen.top }
            : null,
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(chapter).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.list?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 15 : 16);
      expect(geometry.screen?.right ?? 0).toBeLessThanOrEqual(geometry.viewport - 15);

      if (viewport.width > 1_024) {
        expect(geometry.screen?.left ?? 0).toBeGreaterThan(geometry.list?.right ?? 0);
      } else {
        expect(geometry.screen?.top ?? 0).toBeGreaterThan(geometry.list?.bottom ?? 0);
      }
    });
  }
});
