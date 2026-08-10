import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const securityViewports = [
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

test.describe("marketing how it works R3.4 security model", () => {
  test("shows three real security layers without adding unsupported guarantees", async ({
    page,
  }) => {
    await page.goto("/jak-dziala");

    const security = page.getByRole("region", {
      name: "Jedne dane. Trzy niezależne bariery dostępu.",
    });
    const layers = security.locator(".security-model__layers > li");

    await expect(security).toBeVisible();
    await expect(layers).toHaveCount(3);
    await expect(layers.locator("h3")).toHaveText([
      "Dostęp sprawdza serwer",
      "Baza niezależnie wymusza RLS",
      "Storage pozostaje prywatny",
    ]);
    await expect(layers.locator("dt")).toHaveText(["Kontrola", "Kontrola", "Kontrola"]);
    await expect(layers.locator("dd")).toHaveText([
      "Autoryzacja + tenant scope",
      "Wymuszone polityki RLS",
      "Allowlista + magic bytes",
    ]);
    await expect(layers.locator("footer > strong")).toHaveText([
      "Żądanie przypięte do organizacji",
      "Izolacja danych organizacji",
      "Kontrolowany prywatny obiekt",
    ]);
    await expect(security).toContainText("Ukrycie kontrolki w przeglądarce nie jest autoryzacją.");
    await expect(security).toContainText(
      "Manifest widgetu nie zawiera pricingu, scoringu, identyfikatora tenanta ani danych innych sesji.",
    );
    await expect(security).not.toContainText(/certyfikat|gwarancja|100%|AI/i);

    const cta = page.locator("#how-final-cta");
    await expect(cta.getByRole("heading", { level: 2 })).toHaveText(
      "Wybierz branżę. Zobacz właściwy brief.",
    );
    await expect(cta.getByRole("link", { name: "Porównaj branże" })).toHaveAttribute(
      "href",
      "/branze",
    );
    await expect(cta.getByRole("link", { name: "Przejdź do panelu" })).toHaveAttribute(
      "href",
      "/logowanie",
    );

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of securityViewports) {
    test(`keeps every protection layer legible at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const security = page.locator("#bezpieczenstwo");
      const geometry = await security.evaluate((region) => {
        const regionBounds = region.getBoundingClientRect();
        const introBounds = region
          .querySelector<HTMLElement>(".security-model__intro")
          ?.getBoundingClientRect();
        const boardBounds = region
          .querySelector<HTMLElement>(".security-model__board")
          ?.getBoundingClientRect();
        const layers = [
          ...region.querySelectorAll<HTMLElement>(".security-model__layers > li"),
        ].map((layer) => {
          const bounds = layer.getBoundingClientRect();
          return {
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
          };
        });
        const textSizes = [...region.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          board: boardBounds
            ? {
                bottom: boardBounds.bottom,
                left: boardBounds.left,
                right: boardBounds.right,
                top: boardBounds.top,
              }
            : null,
          height: regionBounds.height,
          intro: introBounds
            ? {
                bottom: introBounds.bottom,
                left: introBounds.left,
                right: introBounds.right,
                top: introBounds.top,
              }
            : null,
          layers,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          smallestText: Math.min(...textSizes),
          viewport: document.documentElement.clientWidth,
        };
      });

      await expect(security).toBeVisible();
      expect(geometry.layers).toHaveLength(3);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.board?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 11 : 15);
      expect(geometry.board?.right ?? 0).toBeLessThanOrEqual(
        geometry.viewport - (viewport.width === 320 ? 11 : 15),
      );
      expect(geometry.layers[1]?.top ?? 0).toBeGreaterThan(geometry.layers[0]?.top ?? 0);
      expect(geometry.layers[2]?.top ?? 0).toBeGreaterThan(geometry.layers[1]?.top ?? 0);

      if (viewport.width > 1_152) {
        expect(geometry.height).toBeLessThanOrEqual(1_000);
        expect(geometry.board?.left ?? 0).toBeGreaterThan(geometry.intro?.right ?? 0);
      } else {
        expect(geometry.board?.top ?? 0).toBeGreaterThan(geometry.intro?.bottom ?? 0);
        expect(geometry.height).toBeLessThanOrEqual(viewport.width === 320 ? 1_850 : 1_650);
      }
    });
  }

  test("keeps the security boundaries visible in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    const security = page.locator("#bezpieczenstwo");
    await expect(security.locator(".security-model__layers > li")).toHaveCount(3);
    await expect(security.locator(".security-model__principle")).toBeVisible();
    await expect(security.locator(".security-model__public-boundary")).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
