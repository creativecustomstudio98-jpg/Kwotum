import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const securityViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing how it works V7 security model", () => {
  test("shows three independent enforcement layers without unsupported guarantees", async ({
    page,
  }) => {
    await page.goto("/jak-dziala");

    const security = page.locator("#bezpieczenstwo");
    const board = security.locator("[data-security-board]");
    const layers = board.locator(":scope > ol > li");

    await expect(security.getByRole("heading", { level: 2 })).toHaveText(
      "Jedne dane. Trzy niezależne bariery dostępu",
    );
    await expect(layers).toHaveCount(3);
    await expect(layers.locator("h3")).toHaveText([
      "Dostęp sprawdza serwer",
      "Baza niezależnie wymusza RLS",
      "Storage pozostaje prywatny",
    ]);
    await expect(layers.locator("dt")).toHaveText([
      "Kontrola",
      "Efekt",
      "Kontrola",
      "Efekt",
      "Kontrola",
      "Efekt",
    ]);
    await expect(board).toContainText("Autoryzacja + tenant scope");
    await expect(board).toContainText("Wymuszone polityki RLS");
    await expect(board).toContainText("Allowlista + magic bytes");
    await expect(board).toContainText("Ukrycie kontrolki w przeglądarce nie jest autoryzacją.");
    await expect(board).toContainText(
      "Manifest widgetu nie zawiera pricingu, scoringu, identyfikatora tenanta ani danych innych sesji.",
    );
    await expect(security).not.toContainText(/certyfikat|gwarancja|100%|AI/i);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of securityViewports) {
    test(`keeps all protection layers legible at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/jak-dziala");

      const security = page.locator("#bezpieczenstwo");
      const geometry = await security.evaluate((region) => {
        const board = region
          .querySelector<HTMLElement>("[data-security-board]")
          ?.getBoundingClientRect();
        const layers = [
          ...region.querySelectorAll<HTMLElement>("[data-security-board] > ol > li"),
        ].map((layer) => layer.getBoundingClientRect());
        return {
          board: board ? { left: board.left, right: board.right } : null,
          layers: layers.map(({ bottom, left, right, top }) => ({ bottom, left, right, top })),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          viewport: document.documentElement.clientWidth,
        };
      });

      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.layers).toHaveLength(3);
      expect(geometry.board?.left ?? 0).toBeGreaterThanOrEqual(viewport.width === 320 ? 15 : 16);
      expect(geometry.board?.right ?? 0).toBeLessThanOrEqual(geometry.viewport - 15);

      if (viewport.width > 768) {
        expect(
          Math.abs((geometry.layers[1]?.top ?? 0) - (geometry.layers[0]?.top ?? 0)),
        ).toBeLessThan(1);
        expect(geometry.layers[1]?.left ?? 0).toBeGreaterThanOrEqual(
          geometry.layers[0]?.right ?? 0,
        );
      } else {
        expect(geometry.layers[1]?.top ?? 0).toBeGreaterThanOrEqual(
          geometry.layers[0]?.bottom ?? 0,
        );
        expect(geometry.layers[2]?.top ?? 0).toBeGreaterThanOrEqual(
          geometry.layers[1]?.bottom ?? 0,
        );
      }
    });
  }

  test("keeps security boundaries visible in forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/jak-dziala");

    await expect(page.locator("[data-security-board] > ol > li")).toHaveCount(3);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
