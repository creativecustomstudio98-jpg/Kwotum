import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const finalViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works V7 final choice", () => {
  test("closes with a real transition to industries and the panel", async ({ page }) => {
    await page.goto("/jak-dziala");

    const section = page.locator("#how-final-cta");
    const overview = section.locator("[data-how-overview]");

    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "Wybierz branżę. Zobacz właściwy brief.",
    );
    await expect(overview.getByRole("heading", { level: 3 })).toHaveText(
      "Wspólny mechanizm. Branżowy kontekst.",
    );
    await expect(overview.locator("dl > div")).toHaveCount(3);
    await expect(overview.locator("dt")).toHaveText(["Proces", "Lead", "Decyzja"]);
    await expect(overview.locator("dd")).toHaveText([
      "Sześć kontrolowanych etapów",
      "Zakres i materiały właściwe dla usługi",
      "Zawsze pozostaje po stronie firmy",
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
        const panel = region.firstElementChild?.getBoundingClientRect();
        const heading = region.querySelector<HTMLElement>("h2")?.getBoundingClientRect();
        const overview = region
          .querySelector<HTMLElement>("[data-how-overview]")
          ?.getBoundingClientRect();
        const actions = [...region.querySelectorAll<HTMLElement>("a")].map((action) =>
          action.getBoundingClientRect(),
        );
        return {
          actions: actions.map(({ bottom, left, right, top }) => ({ bottom, left, right, top })),
          heading: heading ? { bottom: heading.bottom, right: heading.right } : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          overview: overview
            ? { left: overview.left, right: overview.right, top: overview.top }
            : null,
          panel: panel ? { left: panel.left, right: panel.right } : null,
          viewport: document.documentElement.clientWidth,
        };
      });

      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.actions).toHaveLength(2);
      expect(geometry.panel?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 15 : 16);
      expect(geometry.panel?.right ?? 0).toBeLessThanOrEqual(geometry.viewport - 15);

      if (viewport.width > 1_024) {
        expect(geometry.overview?.left ?? 0).toBeGreaterThan(geometry.heading?.right ?? 0);
      } else {
        expect(geometry.overview?.top ?? 0).toBeGreaterThan(geometry.heading?.bottom ?? 0);
      }

      if (viewport.width <= 768) {
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.bottom ?? 0);
      }
    });
  }
});
