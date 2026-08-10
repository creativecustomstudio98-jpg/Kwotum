import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const productMapViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product R2.2 dependency map", () => {
  test("connects the real product modules to one lead record", async ({ page }) => {
    await page.goto("/produkt");

    const section = page.getByRole("region", {
      name: "Każdy moduł dokłada kontekst do jednego rekordu leada.",
    });
    const proof = section.getByRole("figure", {
      name: "Od definicji procesu do decyzji firmy",
    });

    await expect(section).toBeVisible();
    await expect(proof.getByText("Dane demonstracyjne", { exact: true })).toBeVisible();
    await expect(proof.locator("[data-product-map-stage]")).toHaveCount(3);
    await expect(proof.locator("[data-product-map-stage] strong")).toHaveText([
      "Builder i wersje",
      "Widget i hosted link",
      "Pricing i scoring",
    ]);
    await expect(proof.getByLabel("Demonstracyjny rekord leada")).toContainText("Lead L-2026-0152");
    await expect(proof.getByLabel("Demonstracyjny rekord leada")).toContainText(
      "Gotowy do kontaktu",
    );
    await expect(proof.locator("[data-product-map-output]")).toHaveCount(2);
    await expect(proof.locator("[data-product-map-output] strong")).toHaveText([
      "Powiadomienia",
      "Analityka",
    ]);
    await expect(
      proof.getByLabel("Zasady integralności rekordu").locator(":scope > span"),
    ).toHaveCount(3);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Kwotum porządkuje proces. Decyzja nadal należy do firmy.",
      }),
    ).toBeVisible();
  });

  for (const viewport of productMapViewports) {
    test(`keeps the dependency map readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const section = page.locator("#mapa-produktu");
      const geometry = await section.evaluate((region) => {
        const bounds = region.getBoundingClientRect();
        const headingBounds = region.querySelector("h2")?.getBoundingClientRect();
        const proofBounds = region
          .querySelector("[data-product-map-proof]")
          ?.getBoundingClientRect();
        const recordBounds = region
          .querySelector("[data-product-lead-record]")
          ?.getBoundingClientRect();
        const stageBounds = [
          ...region.querySelectorAll<HTMLElement>("[data-product-map-stage]"),
        ].map((stage) => stage.getBoundingClientRect());
        const outputBounds = [
          ...region.querySelectorAll<HTMLElement>("[data-product-map-output]"),
        ].map((output) => output.getBoundingClientRect());
        const proofTextSizes = [...region.querySelectorAll<HTMLElement>("figure *")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          heading: headingBounds
            ? { bottom: headingBounds.bottom, left: headingBounds.left, right: headingBounds.right }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          outputs: outputBounds.map((output) => ({
            height: output.height,
            left: output.left,
            right: output.right,
            width: output.width,
          })),
          proof: proofBounds
            ? {
                height: proofBounds.height,
                left: proofBounds.left,
                right: proofBounds.right,
                top: proofBounds.top,
              }
            : null,
          record: recordBounds
            ? {
                height: recordBounds.height,
                left: recordBounds.left,
                right: recordBounds.right,
                top: recordBounds.top,
              }
            : null,
          section: { height: bounds.height, left: bounds.left, right: bounds.right },
          smallestProofText: Math.min(...proofTextSizes),
          stages: stageBounds.map((stage) => ({
            bottom: stage.bottom,
            height: stage.height,
            left: stage.left,
            right: stage.right,
            top: stage.top,
            width: stage.width,
          })),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(section).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestProofText).toBeGreaterThanOrEqual(12);
      expect(geometry.proof?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.proof?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(geometry.stages).toHaveLength(3);
      expect(geometry.outputs).toHaveLength(2);

      if (viewport.width > 960) {
        expect(geometry.section.height).toBeLessThanOrEqual(1_300);
        expect(geometry.proof?.height ?? 0).toBeLessThanOrEqual(900);
        expect(Math.max(...geometry.stages.map((stage) => stage.right))).toBeLessThanOrEqual(
          (geometry.record?.left ?? 0) + 1,
        );
        expect(geometry.record?.right ?? 0).toBeLessThanOrEqual(
          Math.min(...geometry.outputs.map((output) => output.left)) + 1,
        );
      }

      if (viewport.width <= 960) {
        expect(geometry.record?.top ?? 0).toBeGreaterThan(
          Math.max(...geometry.stages.map((stage) => stage.bottom)),
        );
      }

      if (viewport.width <= 430) {
        expect(geometry.section.height).toBeLessThanOrEqual(2_300);
        expect(geometry.proof?.height ?? 0).toBeLessThanOrEqual(1_700);
        expect(geometry.record?.height ?? 0).toBeLessThanOrEqual(580);
        expect(
          Math.abs((geometry.outputs[0]?.height ?? 0) - (geometry.outputs[1]?.height ?? 0)),
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test("remains accessible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/produkt");

    const section = page.locator("#mapa-produktu");
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(section.getByLabel("Demonstracyjny rekord leada")).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
