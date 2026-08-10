import { expect, test, type Page } from "@playwright/test";

/**
 * Dostosuj trasy do realnego repozytorium. Test nie może korzystać z danych
 * produkcyjnych. Użyj bezpiecznego seed/demo tenant.
 */
const routes = ["/", "/app", "/app/leads", "/app/processes", "/app/analytics"];

const viewports = [
  { name: "mobile-320", width: 320, height: 800 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1536", width: 1536, height: 1024 },
] as const;

async function waitForStableLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForLoadState("networkidle");
}

test.describe("Lorum layout integrity", () => {
  for (const viewport of viewports) {
    for (const route of routes) {
      test(`${route} — ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);
        await waitForStableLayout(page);

        const overflow = await page.evaluate(() => ({
          rootScrollWidth: document.documentElement.scrollWidth,
          rootClientWidth: document.documentElement.clientWidth,
          bodyScrollWidth: document.body.scrollWidth,
          bodyClientWidth: document.body.clientWidth,
        }));

        expect(
          overflow.rootScrollWidth,
          `Global horizontal overflow on ${route} at ${viewport.name}`,
        ).toBeLessThanOrEqual(overflow.rootClientWidth + 1);
        expect(overflow.bodyScrollWidth).toBeLessThanOrEqual(overflow.bodyClientWidth + 1);

        const outOfViewport = await page.locator("[data-within-viewport]").evaluateAll((nodes) =>
          nodes
            .filter((node) => {
              const rect = node.getBoundingClientRect();
              const style = getComputedStyle(node);
              if (style.display === "none" || style.visibility === "hidden") return false;
              return rect.left < -1 || rect.right > window.innerWidth + 1;
            })
            .map((node) => ({
              tag: node.tagName,
              text: node.textContent?.trim().slice(0, 120),
              rect: node.getBoundingClientRect().toJSON(),
            })),
        );
        expect(outOfViewport, JSON.stringify(outOfViewport, null, 2)).toEqual([]);

        const overlaps = await page.locator("[data-no-overlap]").evaluateAll((nodes) => {
          const visible = nodes.filter((node) => {
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden"
            );
          });

          const collisions: Array<Record<string, unknown>> = [];
          for (let i = 0; i < visible.length; i += 1) {
            for (let j = i + 1; j < visible.length; j += 1) {
              const a = visible[i];
              const b = visible[j];
              if (a.contains(b) || b.contains(a)) continue;

              const ar = a.getBoundingClientRect();
              const br = b.getBoundingClientRect();
              const width = Math.min(ar.right, br.right) - Math.max(ar.left, br.left);
              const height = Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top);

              if (width > 2 && height > 2) {
                collisions.push({
                  a: a.getAttribute("data-no-overlap") || a.tagName,
                  b: b.getAttribute("data-no-overlap") || b.tagName,
                  intersection: { width, height },
                });
              }
            }
          }
          return collisions;
        });
        expect(overlaps, JSON.stringify(overlaps, null, 2)).toEqual([]);

        await expect(page).toHaveScreenshot(
          `${route.replaceAll("/", "_") || "_home"}-${viewport.name}.png`,
          {
            fullPage: true,
            animations: "disabled",
          },
        );
      });
    }
  }
});
