import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const pricingViewports = [
  { height: 1_024, width: 1_536 },
  { height: 1_000, width: 1_440 },
  { height: 800, width: 1_280 },
  { height: 900, width: 1_024 },
  { height: 1_024, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 812, width: 375 },
  { height: 844, width: 320 },
] as const;

export async function readPricingGeometry(page: Page) {
  return page.evaluate(() => {
    const pricing = document.querySelector<HTMLElement>("[data-pricing-simple]");
    const cards = [...document.querySelectorAll<HTMLElement>(".pricing-simple-card")];
    const finalCta = document.querySelector<HTMLElement>("[data-pricing-final-cta]");
    if (!pricing || !finalCta || cards.length !== 2) throw new Error("Missing pricing regions");

    const measure = (element: HTMLElement) => {
      const bounds = element.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        height: bounds.height,
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        width: bounds.width,
      };
    };
    const textSizes = [pricing, finalCta]
      .flatMap((region) => [...region.querySelectorAll<HTMLElement>("*")])
      .filter(
        (element) =>
          element.textContent?.trim() &&
          element.getClientRects().length > 0 &&
          !element.closest('[aria-hidden="true"]'),
      )
      .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

    return {
      assurances: [...pricing.querySelectorAll<HTMLElement>(".pricing-simple-assurances li")].map(
        measure,
      ),
      cardActions: cards.map((card) => measure(card.querySelector<HTMLElement>("a")!)),
      cards: cards.map(measure),
      finalActions: [...finalCta.querySelectorAll<HTMLElement>("a")].map(measure),
      finalCta: measure(finalCta),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pricing: measure(pricing),
      smallestText: Math.min(...textSizes),
      viewport: document.documentElement.clientWidth,
    };
  });
}

export async function expectPricingAccessibility(page: Page) {
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
}
