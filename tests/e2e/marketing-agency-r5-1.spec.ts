import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const agencyHeroViewports = [
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

test.describe("marketing agency R5.1 real panel hero", () => {
  test("states the real agency boundary without extending MVP", async ({ page }) => {
    await page.setViewportSize({ height: 1_000, width: 1_440 });
    await page.goto("/dla-agencji");

    const hero = page.locator("[data-agency-hero]");
    const proof = page.locator("[data-agency-tenant-proof]");

    await expect(page).toHaveTitle("Formularze wyceny dla agencji WordPress i web · Kwotum");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/dla-agencji$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Wdrażacie proces. Klient zarządza leadami.",
    );
    await expect(hero).toBeVisible();
    await expect(proof).toBeVisible();
    await expect(proof.locator("[data-agency-panel-preview]")).toBeVisible();
    await expect(proof.locator("[data-agency-lead-table]")).toBeVisible();
    await expect(proof.locator("[data-agency-widget-preview]")).toHaveCount(0);
    await expect(proof.getByText("Organizacja klienta", { exact: true })).toBeVisible();
    await expect(proof.getByText("Oddzielna organizacja klienta", { exact: true })).toBeVisible();
    await expect(proof.getByText("Kuchnie Nowa Forma", { exact: true })).toBeVisible();
    await expect(
      proof.locator("[data-agency-lead-table]").getByText("Anna Kowalska", { exact: true }),
    ).toBeVisible();
    await expect(proof.getByText("Wszystkie", { exact: false })).toBeVisible();
    await expect(proof.locator("button, input, select, textarea")).toHaveCount(0);
    await expect(proof.locator("a")).toHaveCount(0);

    await expect(hero.getByRole("link", { name: "Zobacz model wdrożenia" })).toHaveAttribute(
      "href",
      "#model-wdrozenia",
    );
    await expect(hero.getByRole("link", { name: "Porównaj branże" })).toHaveAttribute(
      "href",
      "/branze",
    );

    const text = await hero.innerText();
    expect(text).not.toMatch(/white[- ]?label|automatyczna delegacja|wspólna baza leadów/i);
    expect(text).toContain("automatycznego dostępu do leadów");
    expect(text).not.toContain("Widget lub hosted link");
  });

  for (const viewport of agencyHeroViewports) {
    test(`keeps the tenant map legible at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dla-agencji");

      const hero = page.locator("[data-agency-hero]");
      const geometry = await hero.evaluate((section) => {
        const measure = (element: Element | null) => {
          if (!(element instanceof HTMLElement)) return null;
          const bounds = element.getBoundingClientRect();
          return {
            height: bounds.height,
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
          };
        };
        const proof = section.querySelector<HTMLElement>("[data-agency-tenant-proof]");
        const panel = section.querySelector<HTMLElement>("[data-agency-panel-preview]");
        const table = section.querySelector<HTMLElement>("[data-agency-lead-table]");
        const mobileNavigation = section.querySelector<HTMLElement>(
          "[data-agency-mobile-navigation]",
        );
        const actions = [
          ...section.querySelectorAll<HTMLElement>('a[href="#model-wdrozenia"], a[href="/branze"]'),
        ].map(measure);
        const proofTextSizes = [...(proof?.querySelectorAll<HTMLElement>("*") ?? [])]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          actions,
          copy: measure(section.querySelector("h1")?.closest("header") ?? null),
          hero: measure(section),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          panel: measure(panel),
          proof: measure(proof),
          smallestProofText: Math.min(...proofTextSizes),
          table: measure(table),
          mobileNavigation: measure(mobileNavigation),
        };
      });

      await expect(hero).toBeVisible();
      await expect(page.locator("[data-agency-tenant-proof]")).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestProofText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      for (const action of geometry.actions) {
        expect(action?.height ?? 0).toBeGreaterThanOrEqual(44);
      }

      if (viewport.width > 1_088) {
        expect(geometry.hero?.height ?? 0).toBeLessThanOrEqual(1_500);
        expect(geometry.proof?.width ?? 0).toBeGreaterThanOrEqual(1_000);
        expect(geometry.panel?.width ?? 0).toBeGreaterThanOrEqual(1_000);
        expect(geometry.table?.width ?? 0).toBeGreaterThanOrEqual(760);
        expect(geometry.mobileNavigation?.height ?? 0).toBe(0);
      }

      if (viewport.width <= 544) {
        expect(geometry.hero?.height ?? 0).toBeLessThanOrEqual(1_850);
        expect(geometry.panel?.height ?? 0).toBeGreaterThan(600);
        expect(geometry.table?.height ?? 0).toBeGreaterThan(420);
        expect(geometry.mobileNavigation?.height ?? 0).toBeGreaterThanOrEqual(60);
        expect(
          Math.abs((geometry.actions[0]?.width ?? 0) - (geometry.actions[1]?.width ?? 0)),
        ).toBeLessThanOrEqual(1);
        expect(geometry.proof?.width ?? 0).toBeLessThanOrEqual(viewport.width - 24);
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
