import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { indexedRoutes } from "../../apps/web/lib/marketing/content";

const representativeRoutes = [
  { active: "Produkt", path: "/produkt" },
  { active: "Cennik", path: "/cennik" },
  { active: "Branże", path: "/branze/meble-na-wymiar" },
  { active: null, path: "/polityka-prywatnosci" },
] as const;

const shellViewports = [
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_024 },
  { height: 1_000, width: 768 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

const allSubpageRoutes = [
  ...indexedRoutes.filter((route) => route !== "/"),
  "/polityka-prywatnosci",
  "/regulamin",
] as const;

test.describe("marketing subpages R1 shell", () => {
  for (const viewport of shellViewports) {
    test(`keeps shared axes and navigation at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });

      for (const route of representativeRoutes) {
        await page.goto(route.path);

        const header = page.locator(".marketing-header--subpage");
        const headerInner = header.locator(".marketing-header__inner");
        const breadcrumbs = page.getByRole("navigation", { name: "Okruszki" });
        const footer = page.getByRole("contentinfo");

        await expect(header).toBeVisible();
        await expect(header.getByRole("link", { name: "Kwotum — strona główna" })).toBeVisible();
        await expect(header.locator(".marketing-brand__mark svg")).toHaveCount(1);
        await expect(breadcrumbs).toBeVisible();
        await expect(footer).toBeVisible();

        const geometry = await page.evaluate(() => {
          const bounds = (selector: string) => {
            const rect = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
            return rect
              ? { height: rect.height, left: rect.left, right: rect.right, width: rect.width }
              : null;
          };

          return {
            breadcrumbs: bounds(".marketing-breadcrumbs"),
            footer: bounds(".marketing-footer__shell"),
            header: bounds(".marketing-header__inner"),
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            viewport: document.documentElement.clientWidth,
          };
        });

        for (const region of [geometry.header, geometry.breadcrumbs, geometry.footer]) {
          expect(region).not.toBeNull();
          expect(region?.left ?? 0).toBeGreaterThanOrEqual(11);
          expect(region?.right ?? geometry.viewport).toBeLessThanOrEqual(geometry.viewport - 11);
        }
        expect(geometry.overflow).toBeLessThanOrEqual(1);
        expect(geometry.header?.height).toBeGreaterThanOrEqual(viewport.width > 960 ? 95 : 71);

        const activeDesktopLink = header.locator('.marketing-nav a[aria-current="page"]');
        if (route.active) {
          await expect(activeDesktopLink).toHaveText(route.active);
        } else {
          await expect(activeDesktopLink).toHaveCount(0);
        }

        if (viewport.width > 960) {
          await expect(header.getByRole("navigation", { name: "Główna nawigacja" })).toBeVisible();
          await expect(header.locator(".marketing-nav a")).toHaveCount(6);
          await expect(header.getByRole("link", { name: "Zaloguj się" })).toBeVisible();
          await expect(header.getByRole("link", { name: "Zobacz proces" })).toBeVisible();
        } else {
          const toggle = header.getByRole("button", { name: "Otwórz menu" });
          const toggleBounds = await toggle.boundingBox();
          expect(toggleBounds?.width ?? 0).toBeGreaterThanOrEqual(44);
          expect(toggleBounds?.height ?? 0).toBeGreaterThanOrEqual(44);

          await toggle.click();
          const dialog = page.getByRole("dialog", { name: "Menu mobilne" });
          await expect(dialog).toBeVisible();
          await expect(dialog.getByRole("navigation").getByRole("link")).toHaveCount(6);
          if (route.active) {
            await expect(dialog.locator('a[aria-current="page"]')).toContainText(route.active);
          }
          await page.keyboard.press("Escape");
          await expect(dialog).toHaveCount(0);
        }
      }
    });
  }

  test("product shell keeps accessible navigation, focus and equal CTA geometry", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/produkt");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Przejdź do treści" });
    await expect(skipLink).toBeFocused();
    await skipLink.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    const ctaActions = page.locator(
      ".marketing-cta-band .marketing-actions a, #product-final-cta .marketing-actions a",
    );
    await expect(ctaActions).toHaveCount(2);
    const actionWidths = await ctaActions.evaluateAll((actions) =>
      actions.map((action) => action.getBoundingClientRect().width),
    );
    expect(Math.abs((actionWidths[0] ?? 0) - (actionWidths[1] ?? 0))).toBeLessThanOrEqual(1);

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of [
    { height: 1_000, width: 1_536 },
    { height: 844, width: 390 },
  ] as const) {
    test(`all public subpages inherit the shell at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const route of allSubpageRoutes) {
        await page.goto(route);
        await expect(page.locator(".marketing-header--subpage")).toBeVisible();
        await expect(page.locator(".marketing-brand__mark svg").first()).toBeVisible();
        await expect(page.getByRole("navigation", { name: "Okruszki" })).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
          route,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});
