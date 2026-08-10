import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const agencyOwnershipViewports = [
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

test.describe("marketing agency R5.3 tenant ownership", () => {
  test("uses the real role matrix and states the tenant boundary", async ({ page }) => {
    await page.setViewportSize({ height: 1_000, width: 1_440 });
    await page.goto("/dla-agencji");

    const ownership = page.locator("[data-agency-ownership]");
    const proof = ownership.locator("[data-agency-access-proof]");
    const table = proof.getByRole("table", {
      name: "Uprawnienia aktywnych ról organizacji do operacji na leadach",
    });

    await expect(ownership).toBeVisible();
    await expect(ownership.getByRole("heading", { level: 2 })).toHaveText(
      "Lead należy do firmy. Dostęp wynika z roli, nie z wdrożenia.",
    );
    await expect(proof).toBeVisible();
    await expect(table).toBeVisible();
    await expect(table.getByRole("row")).toHaveCount(5);
    await expect(table.getByRole("columnheader")).toHaveText([
      "Operacja",
      "Owner",
      "Admin",
      "Sales",
    ]);
    await expect(table.locator('[data-permission="allowed"]')).toHaveCount(9);
    await expect(table.locator('[data-permission="denied"]')).toHaveCount(3);
    await expect(proof.getByText("Poza organizacją domyślnie", { exact: true })).toBeVisible();
    await expect(
      proof.getByText("Samo wdrożenie nie nadaje roli.", { exact: false }),
    ).toBeVisible();
    await expect(ownership.getByText("Organizacja klienta", { exact: true })).toBeVisible();
    await expect(ownership.getByText("Aktywne członkostwo", { exact: true })).toBeVisible();
    await expect(ownership.locator("button, input, select, textarea, a")).toHaveCount(0);
    await expect(
      page.getByText("Leady pozostają w organizacji firmy.", { exact: true }),
    ).toHaveCount(0);

    await expect(page.locator("[data-agency-hero]")).toBeVisible();
    await expect(page.locator("[data-agency-method]")).toBeVisible();
    await expect(page.locator("[data-agency-isolation]")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Motyw klienta zostaje na zewnątrz. Widget zachowuje własny interfejs.",
      }),
    ).toBeVisible();

    const text = await ownership.innerText();
    expect(text).not.toMatch(/white[- ]?label|automatyczna delegacja|wspólna baza leadów/i);
    expect(text).toContain("Role są sprawdzane po stronie serwera");
    expect(text).toContain("RLS odcina zasoby innej organizacji");
  });

  for (const viewport of agencyOwnershipViewports) {
    test(`keeps ownership and permissions legible at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dla-agencji");

      const ownership = page.locator("[data-agency-ownership]");
      const geometry = await ownership.evaluate((section) => {
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
        const proof = section.querySelector<HTMLElement>("[data-agency-access-proof]");
        const permissionRows = [...section.querySelectorAll<HTMLElement>("tbody tr")].map(measure);
        const textSizes = [...section.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          agencyBoundary: measure(section.querySelector<HTMLElement>("[data-agency-boundary]")),
          copy: measure(section.querySelector("h2")?.closest("div") ?? null),
          layers: measure(section.querySelector("ol")),
          mobileTableDisplay: getComputedStyle(section.querySelector<HTMLElement>("table")!)
            .display,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          permissionRows,
          proof: measure(proof),
          section: measure(section),
          smallestText: Math.min(...textSizes),
          table: measure(section.querySelector("table")),
        };
      });

      await expect(ownership).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.permissionRows).toHaveLength(4);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.proof?.width ?? 0).toBeGreaterThan(280);
      expect(geometry.table?.width ?? 0).toBeGreaterThan(250);
      expect(geometry.agencyBoundary?.height ?? 0).toBeGreaterThan(84);
      expect(geometry.layers?.height ?? 0).toBeGreaterThan(96);

      if (viewport.width > 1_152) {
        expect(geometry.section?.height ?? 0).toBeLessThanOrEqual(1_400);
        expect(geometry.proof?.width ?? 0).toBeGreaterThanOrEqual(650);
        expect(geometry.copy?.width ?? 0).toBeGreaterThan(340);
        expect(geometry.mobileTableDisplay).toBe("table");
      }

      if (viewport.width <= 1_152 && viewport.width > 544) {
        expect(geometry.section?.height ?? 0).toBeLessThanOrEqual(1_900);
        expect(geometry.proof?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 96);
      }

      if (viewport.width <= 544) {
        expect(geometry.section?.height ?? 0).toBeLessThanOrEqual(2_600);
        expect(geometry.proof?.width ?? 0).toBeLessThanOrEqual(viewport.width - 20);
        expect(geometry.proof?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 48);
        expect(geometry.mobileTableDisplay).toBe("block");
        for (const row of geometry.permissionRows) {
          expect(row?.height ?? 0).toBeGreaterThan(104);
          expect(row?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 88);
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
