import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const agencyIsolationViewports = [
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

test.describe("marketing agency R5.4 widget isolation", () => {
  test("shows the real Shadow DOM boundary without pretending to be interactive", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 1_000, width: 1_440 });
    await page.goto("/dla-agencji");

    const isolation = page.locator("[data-agency-isolation]");
    const proof = isolation.locator("[data-agency-isolation-proof]");

    await expect(isolation).toBeVisible();
    await expect(isolation.getByRole("heading", { level: 2 })).toHaveText(
      "Motyw klienta zostaje na zewnątrz. Widget zachowuje własny interfejs.",
    );
    await expect(proof).toBeVisible();
    await expect(proof.getByText("Shadow root", { exact: true })).toBeVisible();
    await expect(proof.getByText("Style hosta zatrzymane", { exact: true })).toBeVisible();
    await expect(proof.getByText("<wyceno-widget>", { exact: true })).toBeVisible();
    await expect(proof.getByText("Testowane automatycznie", { exact: true })).toBeVisible();
    await expect(proof.getByText("background: hotpink", { exact: true })).toBeVisible();
    await expect(proof.getByText("Jaki układ kuchni planujesz?", { exact: true })).toBeVisible();
    await expect(proof.getByText("W kształcie L", { exact: true })).toBeVisible();
    await expect(proof.locator("ol > li")).toHaveCount(3);
    await expect(proof.locator("button, input, select, textarea, a")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 2, name: "Widget nie dziedziczy stylów motywu." }),
    ).toHaveCount(0);

    await expect(page.locator("[data-agency-hero]")).toBeVisible();
    await expect(page.locator("[data-agency-method]")).toBeVisible();
    await expect(page.locator("[data-agency-ownership]")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Zbuduj usługę wdrożeniową wokół jakości briefu.",
      }),
    ).toBeVisible();

    const text = await isolation.innerText();
    expect(text).toContain("natywny element");
    expect(text).toContain("nie odpowiedzi ani token sesji");
    expect(text).not.toMatch(/pełna ochrona javascript|całkowita izolacja bezpieczeństwa/i);
  });

  for (const viewport of agencyIsolationViewports) {
    test(`keeps the host and Shadow DOM comparison legible at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dla-agencji");

      const isolation = page.locator("[data-agency-isolation]");
      const geometry = await isolation.evaluate((section) => {
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
        const textSizes = [...section.querySelectorAll<HTMLElement>("*")]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          comparison: measure(section.querySelector("figure > div")),
          contract: measure(section.querySelector("ol")),
          host: measure(section.querySelector('[aria-label="Style strony klienta"]')),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          proof: measure(section.querySelector("[data-agency-isolation-proof]")),
          section: measure(section),
          shadow: measure(
            section.querySelector('[aria-label="Widget odizolowany przez Shadow DOM"]'),
          ),
          smallestText: Math.min(...textSizes),
          widget: measure(
            section.querySelector(
              '[aria-label="Widget odizolowany przez Shadow DOM"] > div:last-child',
            ),
          ),
        };
      });

      await expect(isolation).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.proof?.width ?? 0).toBeGreaterThan(280);
      expect(geometry.host?.width ?? 0).toBeGreaterThan(260);
      expect(geometry.shadow?.width ?? 0).toBeGreaterThan(260);
      expect(geometry.widget?.height ?? 0).toBeGreaterThan(390);
      expect(geometry.contract?.height ?? 0).toBeGreaterThan(96);

      if (viewport.width > 1_088) {
        expect(geometry.section?.height ?? 0).toBeLessThanOrEqual(1_650);
        expect(geometry.comparison?.height ?? 0).toBeLessThanOrEqual(760);
        expect(geometry.host?.height ?? 0).toBe(geometry.shadow?.height ?? 0);
      }

      if (viewport.width <= 1_088 && viewport.width > 640) {
        expect(geometry.section?.height ?? 0).toBeLessThanOrEqual(2_350);
        expect(geometry.proof?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 96);
      }

      if (viewport.width <= 640) {
        expect(geometry.section?.height ?? 0).toBeLessThanOrEqual(3_200);
        expect(geometry.proof?.width ?? 0).toBeLessThanOrEqual(viewport.width - 20);
        expect(geometry.proof?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 48);
        expect(geometry.host?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 88);
        expect(geometry.shadow?.width ?? 0).toBeGreaterThanOrEqual(viewport.width - 88);
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
