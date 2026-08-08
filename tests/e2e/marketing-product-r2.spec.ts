import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const productHeroViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing product R2.1 hero", () => {
  test("explains the product flow without changing later product sections", async ({ page }) => {
    await page.goto("/produkt");

    const hero = page.getByRole("region", {
      name: "Jeden proces od konfiguracji do gotowego leada.",
    });
    const proof = hero.getByRole("figure", {
      name: "Od wersji roboczej do gotowego leada",
    });

    await expect(hero).toBeVisible();
    await expect(proof).toBeVisible();
    await expect(proof.locator(":scope > ol > li")).toHaveCount(3);
    await expect(proof.locator(":scope > ol > li > strong")).toHaveText([
      "Konfiguracja",
      "Publikacja",
      "Gotowy lead",
    ]);
    await expect(proof.getByText("Dane demonstracyjne")).toBeVisible();
    await expect(
      proof.getByLabel("Podział odpowiedzialności w procesie").locator(":scope > span"),
    ).toHaveCount(3);

    await expect(hero.getByRole("link", { name: "Przejdź przez proces" })).toHaveAttribute(
      "href",
      "/jak-dziala",
    );
    await expect(hero.getByRole("link", { name: "Zobacz funkcje" })).toHaveAttribute(
      "href",
      "/funkcje",
    );
    await expect(hero.getByLabel("Zakres MVP")).toContainText("Bez płatności i pełnego CRM");

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Każdy moduł dokłada kontekst do jednego rekordu leada.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("figure", { name: "Od definicji procesu do decyzji firmy" }),
    ).toBeVisible();
  });

  for (const viewport of productHeroViewports) {
    test(`keeps the product hero intentional at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/produkt");

      const hero = page.locator(".product-page-hero");
      const proof = page.locator("[data-product-hero-proof]");
      const geometry = await hero.evaluate((section) => {
        const bounds = section.getBoundingClientRect();
        const h1Bounds = section.querySelector("h1")?.getBoundingClientRect();
        const copyBounds = section
          .querySelector(".marketing-page-hero__copy")
          ?.getBoundingClientRect();
        const proofBounds = section.querySelector("figure")?.getBoundingClientRect();
        const cards = [...section.querySelectorAll<HTMLElement>("figure > ol > li")].map((card) => {
          const cardBounds = card.getBoundingClientRect();
          return { height: cardBounds.height, width: cardBounds.width };
        });
        const actions = [...section.querySelectorAll<HTMLElement>(".marketing-actions a")].map(
          (action) => {
            const actionBounds = action.getBoundingClientRect();
            return { height: actionBounds.height, width: actionBounds.width };
          },
        );
        const proofTextSizes = [...section.querySelectorAll<HTMLElement>("figure *")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          actions,
          cards,
          copy: copyBounds
            ? { bottom: copyBounds.bottom, left: copyBounds.left, right: copyBounds.right }
            : null,
          h1: h1Bounds ? { left: h1Bounds.left, right: h1Bounds.right } : null,
          hero: { height: bounds.height, left: bounds.left, right: bounds.right },
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          proof: proofBounds
            ? {
                height: proofBounds.height,
                left: proofBounds.left,
                right: proofBounds.right,
                top: proofBounds.top,
              }
            : null,
          smallestProofText: Math.min(...proofTextSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(hero).toBeVisible();
      await expect(proof).toBeVisible();
      expect(geometry.hero.left).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.hero.right).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestProofText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      expect(Math.min(...geometry.actions.map((action) => action.height))).toBeGreaterThanOrEqual(
        52,
      );
      expect(
        Math.max(...geometry.cards.map((card) => card.width)) -
          Math.min(...geometry.cards.map((card) => card.width)),
      ).toBeLessThanOrEqual(1);

      if (viewport.width > 960) {
        expect(geometry.hero.height).toBeLessThanOrEqual(850);
        expect(geometry.proof?.height ?? 0).toBeLessThanOrEqual(620);
        expect(geometry.h1?.right ?? 0).toBeLessThanOrEqual((geometry.proof?.left ?? 0) + 1);
        expect(
          Math.max(...geometry.cards.map((card) => card.height)) -
            Math.min(...geometry.cards.map((card) => card.height)),
        ).toBeLessThanOrEqual(1);
      } else {
        expect(geometry.proof?.top ?? 0).toBeGreaterThan(geometry.copy?.bottom ?? 0);
      }

      if (viewport.width <= 430) {
        expect(geometry.hero.height).toBeLessThanOrEqual(1_900);
        expect(geometry.proof?.height ?? 0).toBeLessThanOrEqual(1_100);
        expect(Math.max(...geometry.cards.map((card) => card.height))).toBeLessThanOrEqual(280);
        expect(
          Math.abs((geometry.actions[0]?.width ?? 0) - (geometry.actions[1]?.width ?? 0)),
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test("remains accessible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/produkt");

    const hero = page.locator(".product-page-hero");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    await hero.getByRole("link", { name: "Przejdź przez proces" }).focus();
    await expect(hero.getByRole("link", { name: "Przejdź przez proces" })).toBeFocused();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
