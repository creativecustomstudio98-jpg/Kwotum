import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const decisionViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works V7 client and decision chapters", () => {
  test("connects the client result with the company's lead decision", async ({ page }) => {
    await page.goto("/jak-dziala");

    const clientChapter = page.locator("#proces-dalszy");
    const companyChapter = page.locator("#decyzja");
    const clientStages = clientChapter.locator("ol > li");
    const companyStages = companyChapter.locator("ol > li");

    await expect(clientChapter.getByRole("heading", { level: 2 })).toHaveText(
      "Potem klient odpowiada. Kwotum potwierdza wynik",
    );
    await expect(clientStages.locator("h3")).toHaveText(["Sesja klienta", "Potwierdzenie wyniku"]);
    await expect(clientStages.locator("span").filter({ hasText: /^0[34]$/ })).toHaveText([
      "03",
      "04",
    ]);
    await expect(clientStages.locator("footer strong")).toHaveText([
      "Potwierdzony kolejny krok",
      "Bezpieczny wynik orientacyjny",
    ]);

    await expect(companyChapter.getByRole("heading", { level: 2 })).toHaveText(
      "Na końcu powstaje brief. Decyzję podejmuje firma",
    );
    await expect(companyStages.locator("h3")).toHaveText(["Przekazanie kontaktu", "Obsługa leada"]);
    await expect(companyStages.locator("span").filter({ hasText: /^0[56]$/ })).toHaveText([
      "05",
      "06",
    ]);
    await expect(companyStages.locator("footer strong")).toHaveText([
      "Lead z pełnym kontekstem",
      "Decyzja pozostaje po stronie firmy",
    ]);
    await expect(clientChapter.locator("[data-how-screen] img")).toHaveCount(2);
    await expect(companyChapter.locator("[data-how-screen] img")).toHaveCount(2);
    await expect(companyChapter).not.toContainText(/automatyczna decyzja|AI/i);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of decisionViewports) {
    test(`keeps both downstream chapters intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      for (const selector of ["#proces-dalszy", "#decyzja"] as const) {
        const chapter = page.locator(selector);
        const geometry = await chapter.evaluate((region) => {
          const screen = region
            .querySelector<HTMLElement>("[data-how-screen]")
            ?.getBoundingClientRect();
          const visibleImages = [...region.querySelectorAll<HTMLElement>("[data-how-screen] img")]
            .filter((image) => getComputedStyle(image).display !== "none")
            .map((image) => image.getBoundingClientRect());
          return {
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            screen: screen ? { left: screen.left, right: screen.right } : null,
            viewport: document.documentElement.clientWidth,
            visibleImages: visibleImages.map(({ height, width }) => ({ height, width })),
          };
        });

        expect(geometry.overflow).toBeLessThanOrEqual(1);
        expect(geometry.screen?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 15 : 16);
        expect(geometry.screen?.right ?? 0).toBeLessThanOrEqual(geometry.viewport - 15);
        expect(geometry.visibleImages).toHaveLength(1);
        expect(geometry.visibleImages[0]?.width ?? 0).toBeGreaterThan(250);
        expect(geometry.visibleImages[0]?.height ?? 0).toBeGreaterThan(150);
      }
    });
  }
});
