import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const industriesHeroViewports = [
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

test.describe("marketing industries R7.1 industry-specific proof", () => {
  test("compares changing industry inputs against one shared engine", async ({ page }) => {
    await page.goto("/branze");

    const hero = page.getByRole("region", {
      name: "Meble to nie remont. Brief też nie powinien być ten sam.",
    });
    const showcase = hero.getByRole("figure", {
      name: "Porównanie pytań branżowych, wspólnego mechanizmu Kwotum i gotowego briefu.",
    });
    const tablist = showcase.getByRole("tablist", { name: "Wybierz branżę" });

    await expect(hero).toBeVisible();
    await expect(showcase).toBeVisible();
    await expect(tablist.getByRole("tab")).toHaveCount(5);
    await expect(tablist.getByRole("tab", { name: /Meble na wymiar/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(showcase.getByRole("tabpanel")).toContainText("Kuchnia w układzie L");
    await expect(showcase.getByText("Wspólny silnik")).toBeVisible();
    await expect(showcase.getByRole("link", { name: /Zobacz pełny przykład/ })).toHaveAttribute(
      "href",
      "/branze/meble-na-wymiar",
    );

    await tablist.getByRole("tab", { name: /Ogrodzenia/ }).click();
    await expect(tablist.getByRole("tab", { name: /Ogrodzenia/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(showcase.getByRole("tabpanel")).toContainText("Ogrodzenie panelowe");
    await expect(showcase.getByRole("link", { name: /Zobacz pełny przykład/ })).toHaveAttribute(
      "href",
      "/branze/ogrodzenia",
    );

    await expect(page.locator("#zastosowania .editorial-index > a")).toHaveCount(5);
    await expect(
      page.getByRole("heading", {
        name: "Pięć dopracowanych zastosowań zamiast katalogu bez treści.",
      }),
    ).toBeVisible();
  });

  for (const viewport of industriesHeroViewports) {
    test(`keeps the industry showcase intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/branze");

      const hero = page.locator(".industries-page-hero");
      const geometry = await hero.evaluate((section) => {
        const bounds = section.getBoundingClientRect();
        const headingBounds = section
          .querySelector<HTMLElement>(".industries-page-hero__heading")
          ?.getBoundingClientRect();
        const proof = section.querySelector<HTMLElement>("[data-industries-proof]");
        const proofBounds = proof?.getBoundingClientRect();
        const selectedLinkBounds = proof
          ?.querySelector<HTMLElement>('a[href^="/branze/"]')
          ?.getBoundingClientRect();
        const proofTextSizes = [...(proof?.querySelectorAll<HTMLElement>("*") ?? [])]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]') &&
              !element.classList.contains("wy-sr-only"),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          heading: headingBounds
            ? { bottom: headingBounds.bottom, left: headingBounds.left, right: headingBounds.right }
            : null,
          hero: { height: bounds.height, left: bounds.left, right: bounds.right },
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          proof: proofBounds
            ? {
                bottom: proofBounds.bottom,
                height: proofBounds.height,
                left: proofBounds.left,
                right: proofBounds.right,
                top: proofBounds.top,
              }
            : null,
          selectedLink: selectedLinkBounds
            ? { height: selectedLinkBounds.height, width: selectedLinkBounds.width }
            : null,
          smallestProofText: Math.min(...proofTextSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(hero).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestProofText).toBeGreaterThanOrEqual(12);
      expect(geometry.proof?.top ?? 0).toBeGreaterThan(geometry.heading?.bottom ?? 0);
      expect(geometry.selectedLink?.height ?? 0).toBeGreaterThanOrEqual(44);

      if (viewport.width > 1_088) {
        expect(geometry.hero.height).toBeLessThanOrEqual(1_150);
        expect(geometry.proof?.height ?? 0).toBeLessThanOrEqual(680);
      }

      if (viewport.width <= 430) {
        expect(geometry.hero.height).toBeLessThanOrEqual(1_850);
        expect(geometry.proof?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
        expect(geometry.proof?.right ?? 0).toBeLessThanOrEqual(
          geometry.viewport - (viewport.width === 320 ? 11 : 15),
        );
      }
    });
  }

  test("supports keyboard tab switching and WCAG AA in forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/branze");

    const tablist = page.getByRole("tablist", { name: "Wybierz branżę" });
    const furnitureTab = tablist.getByRole("tab", { name: /Meble na wymiar/ });
    const fenceTab = tablist.getByRole("tab", { name: /Ogrodzenia/ });
    await furnitureTab.focus();
    await furnitureTab.press("ArrowRight");
    await expect(fenceTab).toBeFocused();
    await expect(fenceTab).toHaveAttribute("aria-selected", "true");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
