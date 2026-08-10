import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const agencyMethodViewports = [
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

test.describe("marketing agency R5.2 implementation method", () => {
  test("presents one honest four-stage handoff plan", async ({ page }) => {
    await page.setViewportSize({ height: 1_000, width: 1_440 });
    await page.goto("/dla-agencji");

    const method = page.locator("[data-agency-method]");
    const steps = method.locator("[data-agency-method-step]");

    await expect(method).toBeVisible();
    await expect(method.getByRole("heading", { level: 2 })).toHaveText(
      "Jedna metoda wdrożenia. Każdy proces dopasowany do klienta.",
    );
    await expect(method.locator("[data-agency-method-board]")).toBeVisible();
    await expect(steps).toHaveCount(4);
    await expect(steps.getByRole("heading", { level: 3 })).toHaveText([
      "Warsztat",
      "Konfiguracja",
      "Osadzenie",
      "Przekazanie",
    ]);
    await expect(method.getByText("Agencja + firma", { exact: true })).toBeVisible();
    await expect(method.getByText("Firma klienta", { exact: true })).toBeVisible();
    await expect(method.getByText("W organizacji klienta", { exact: true })).toBeVisible();
    await expect(method.getByText("Rezultat etapu", { exact: true })).toHaveCount(4);
    await expect(method.locator("button, input, select, textarea, a")).toHaveCount(0);
    await expect(page.locator(".agency-flow")).toHaveCount(0);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Wdrażacie proces. Klient zarządza leadami.",
    );
    await expect(page.locator("[data-agency-tenant-proof]")).toBeVisible();

    const text = await method.innerText();
    expect(text).not.toMatch(/white[- ]?label|automatyczna delegacja|wspólna baza leadów/i);
    expect(text).toContain("Powtarzamy kolejność pracy, nie zestaw pytań");
    expect(text).toContain("Leady w jej organizacji i rolach");
  });

  for (const viewport of agencyMethodViewports) {
    test(`keeps the four-stage plan legible at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dla-agencji");

      const method = page.locator("[data-agency-method]");
      const geometry = await method.evaluate((section) => {
        const measure = (element: Element | null) => {
          if (!(element instanceof HTMLElement)) return null;
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

        const board = section.querySelector<HTMLElement>("[data-agency-method-board]");
        const rows = [...section.querySelectorAll<HTMLElement>("[data-agency-method-step]")].map(
          measure,
        );
        const textSizes = [...section.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          board: measure(board),
          heading: measure(section.querySelector("header")),
          method: measure(section),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rows,
          rules: measure(section.querySelector("[data-agency-method-rules]")),
          smallestText: Math.min(...textSizes),
        };
      });

      await expect(method).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.rows).toHaveLength(4);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.board?.width ?? 0).toBeGreaterThan(280);
      expect(geometry.rules?.height ?? 0).toBeGreaterThan(64);

      for (let index = 1; index < geometry.rows.length; index += 1) {
        expect(
          (geometry.rows[index]?.top ?? 0) - (geometry.rows[index - 1]?.bottom ?? 0),
        ).toBeLessThanOrEqual(1);
      }

      if (viewport.width > 1_088) {
        expect(geometry.method?.height ?? 0).toBeLessThanOrEqual(1_250);
        expect(geometry.board?.width ?? 0).toBeGreaterThanOrEqual(1_000);
        for (const row of geometry.rows) {
          expect(row?.height ?? 0).toBeLessThanOrEqual(150);
        }
      }

      if (viewport.width <= 1_024 && viewport.width > 544) {
        expect(geometry.method?.height ?? 0).toBeLessThanOrEqual(1_750);
      }

      if (viewport.width <= 544) {
        expect(geometry.method?.height ?? 0).toBeLessThanOrEqual(2_300);
        expect(geometry.board?.width ?? 0).toBeLessThanOrEqual(viewport.width - 20);
        expect(geometry.board?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 48);
        for (const row of geometry.rows) {
          expect(row?.height ?? 0).toBeGreaterThan(220);
          expect(row?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 52);
        }
      }
    });
  }

  test("keeps keyboard entry and WCAG AA in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/dla-agencji");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Przejdź do treści" })).toBeFocused();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
