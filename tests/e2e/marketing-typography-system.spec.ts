import { expect, test } from "@playwright/test";

import { indexedRoutes } from "../../apps/web/lib/marketing/content";

const marketingRoutes = [...indexedRoutes, "/polityka-prywatnosci", "/regulamin"] as const;

const typographyViewports = [
  {
    expected: { h1: "60px", h2: "48px", h3: "20px", lead: "18px" },
    height: 1_000,
    name: "desktop",
    width: 1_440,
  },
  {
    expected: { h1: "48px", h2: "40px", h3: "20px", lead: "17px" },
    height: 1_000,
    name: "tablet",
    width: 1_024,
  },
  {
    expected: { h1: "42px", h2: "36px", h3: "18px", lead: "16px" },
    height: 844,
    name: "mobile",
    width: 390,
  },
] as const;

const embeddedProductUi = [
  ".product-workspace",
  ".marketing-demo",
  ".integrations-reference-card",
  ".integration-lead-card",
  '[data-home-proof="integration-system"]',
  '[data-home-proof="rendered-product-scene"]',
].join(",");

test.describe("shared marketing typography", () => {
  for (const viewport of typographyViewports) {
    test(`uses one responsive scale on every route at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const route of marketingRoutes) {
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);

        const measurements = await page.evaluate((productUiSelector) => {
          const sizes = (selector: string) =>
            [...document.querySelectorAll<HTMLElement>(selector)].map(
              (element) => getComputedStyle(element).fontSize,
            );

          const unclassifiedHeadings = [
            ...document.querySelectorAll<HTMLElement>("main h1,main h2,main h3"),
          ]
            .filter(
              (element) =>
                !element.matches(
                  ".wy-marketing-heading-1,.wy-marketing-heading-2,.wy-marketing-heading-3",
                ) && !element.closest(productUiSelector),
            )
            .map((element) => ({
              tag: element.tagName,
              text: element.textContent?.trim().slice(0, 80),
            }));

          return {
            h1: sizes(".wy-marketing-heading-1"),
            h2: sizes(".wy-marketing-heading-2"),
            h3: sizes(".wy-marketing-heading-3"),
            lead: sizes(".wy-marketing-lead"),
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            unclassifiedHeadings,
          };
        }, embeddedProductUi);

        expect(measurements.h1, `${route} should expose its page H1`).toHaveLength(1);
        expect(new Set(measurements.h1), `${route} H1`).toEqual(new Set([viewport.expected.h1]));
        expect(new Set(measurements.h2), `${route} H2`).toEqual(
          measurements.h2.length ? new Set([viewport.expected.h2]) : new Set(),
        );
        expect(new Set(measurements.h3), `${route} H3`).toEqual(
          measurements.h3.length ? new Set([viewport.expected.h3]) : new Set(),
        );
        expect(new Set(measurements.lead), `${route} lead copy`).toEqual(
          measurements.lead.length ? new Set([viewport.expected.lead]) : new Set(),
        );
        expect(measurements.unclassifiedHeadings, `${route} content headings`).toEqual([]);
        expect(measurements.overflow, `${route} horizontal overflow`).toBeLessThanOrEqual(1);
      }
    });
  }
});
