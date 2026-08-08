import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const disclosureSelector = [
  ".trust-map__details",
  ".process-stage-card__details",
  ".process-outcome-card__details",
  ".security-model__details",
  ".how-overview__details",
].join(",");

const routeViewports = [
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

test.describe("marketing how it works R3.C route compaction", () => {
  test("uses keyboard-accessible progressive disclosure on mobile", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/jak-dziala");

    const disclosures = page.locator(disclosureSelector);
    const firstStage = page.locator(".process-stage-card__details").first();
    const summary = firstStage.locator("summary");

    await expect(disclosures).toHaveCount(13);
    await expect(page.locator("main details[open]")).toHaveCount(0);
    await expect(firstStage).not.toHaveAttribute("open", "");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(firstStage).toHaveAttribute("open", "");
    await expect(firstStage.locator(".process-stage-card__artifact")).toBeVisible();
    await expect(summary).toContainText("Kompletny szkic procesu");

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  test("keeps the complete process available without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      locale: "pl-PL",
      viewport: { height: 844, width: 390 },
    });
    const page = await context.newPage();

    await page.goto("/jak-dziala");

    const disclosures = page.locator(disclosureSelector);
    await expect(disclosures).toHaveCount(13);
    await expect(page.locator("details[open]")).toHaveCount(13);
    await expect(page.getByText("Dane przykładowe", { exact: true })).toHaveCount(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);

    await context.close();
  });

  for (const viewport of routeViewports) {
    test(`keeps the complete route intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const geometry = await page.locator("main").evaluate((main) => {
        const sections = [
          ...main.querySelectorAll<HTMLElement>(
            "#how-it-works-hero, #proces, #proces-dalszy, #bezpieczenstwo, #how-final-cta",
          ),
        ].map((section) => {
          const bounds = section.getBoundingClientRect();
          return { bottom: bounds.bottom, top: bounds.top };
        });
        const textSizes = [...main.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          details: [...main.querySelectorAll<HTMLDetailsElement>("details")].map(
            (details) => details.open,
          ),
          documentHeight: document.documentElement.scrollHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          sections,
          smallestText: Math.min(...textSizes),
        };
      });

      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.sections).toHaveLength(5);
      for (let index = 1; index < geometry.sections.length; index += 1) {
        expect(geometry.sections[index]?.top ?? 0).toBeGreaterThanOrEqual(
          geometry.sections[index - 1]?.bottom ?? 0,
        );
      }

      if (viewport.width <= 768) {
        expect(geometry.details.every((open) => !open)).toBe(true);
        expect(geometry.documentHeight).toBeLessThanOrEqual(viewport.width === 320 ? 6_050 : 5_900);
      } else {
        expect(geometry.details.every(Boolean)).toBe(true);
      }
    });
  }
});
