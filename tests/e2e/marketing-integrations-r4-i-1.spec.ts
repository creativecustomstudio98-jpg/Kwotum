import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const integrationsHeroViewports = [
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

test.describe("marketing integrations R4.I.1 reference-led hero", () => {
  test("creates the canonical route from real publishing channels", async ({ page }) => {
    await page.setViewportSize({ height: 1_000, width: 1_440 });
    await page.goto("/integracje");

    const hero = page.getByRole("region", {
      name: "Kwotum działa z Twoim obecnym procesem",
    });
    const lead = hero.getByRole("figure", { name: "Kuchnia na wymiar — Nowak" });

    await expect(page).toHaveTitle("Integracje Kwotum — jeden proces w wielu kanałach · Kwotum");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/integracje$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Publikuj ten sam proces Kwotum/,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(hero).toBeVisible();
    await expect(lead).toBeVisible();
    await expect(lead.getByText("Dane demonstracyjne")).toBeVisible();
    await expect(hero.getByRole("article")).toHaveCount(4);
    await expect(hero.getByRole("article").getByRole("heading")).toHaveText([
      "Widget na stronie",
      "Hosted link",
      "WordPress",
      "Powiadomienia e-mail",
    ]);
    await expect(hero.getByRole("list", { name: "Zasady integracji Kwotum" })).toContainText(
      "Bez drugiej bazy leadów",
    );
    expect(await hero.innerText()).not.toMatch(/CRM|Slack|Webhook|Arkusz|Zapier/i);

    const integrationsNavigationLink = page
      .getByRole("navigation", { name: "Główna nawigacja" })
      .getByRole("link", { name: "Integracje" });
    await expect(integrationsNavigationLink).toHaveAttribute("href", "/integracje");
    await expect(integrationsNavigationLink).toHaveAttribute("aria-current", "page");

    await page.goto("/wordpress");
    await expect(
      page
        .getByRole("navigation", { name: "Główna nawigacja" })
        .getByRole("link", { name: "Integracje" }),
    ).toHaveAttribute("href", "/integracje");
  });

  for (const viewport of integrationsHeroViewports) {
    test(`matches the integration reference at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/integracje");

      const hero = page.locator("[data-integrations-hero]");
      const scene = page.locator("[data-integrations-hero-proof]");
      const geometry = await hero.evaluate((section) => {
        const bounds = section.getBoundingClientRect();
        const sceneBounds = section
          .querySelector<HTMLElement>("[data-integrations-hero-proof]")
          ?.getBoundingClientRect();
        const leadBounds = section
          .querySelector<HTMLElement>(".integration-lead-card")
          ?.getBoundingClientRect();
        const cards = [
          ...section.querySelectorAll<HTMLElement>(".integrations-reference-card"),
        ].map((card) => {
          const cardBounds = card.getBoundingClientRect();
          return {
            height: cardBounds.height,
            left: cardBounds.left,
            top: cardBounds.top,
            width: cardBounds.width,
          };
        });
        const proofTextSizes = [
          ...section.querySelectorAll<HTMLElement>("[data-integrations-hero-proof] *"),
        ]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]'),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

        return {
          cards,
          hero: { height: bounds.height },
          lead: leadBounds
            ? {
                height: leadBounds.height,
                left: leadBounds.left,
                top: leadBounds.top,
                width: leadBounds.width,
              }
            : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          scene: sceneBounds ? { height: sceneBounds.height, width: sceneBounds.width } : null,
          smallestProofText: Math.min(...proofTextSizes),
        };
      });

      await expect(hero).toBeVisible();
      await expect(scene).toBeVisible();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestProofText).toBeGreaterThanOrEqual(12);
      expect(geometry.cards).toHaveLength(4);

      if (viewport.width > 896) {
        expect(geometry.hero.height).toBeLessThanOrEqual(1_050);
        expect(geometry.scene?.height ?? 0).toBeLessThanOrEqual(560);
        expect(geometry.lead?.left ?? 0).toBeGreaterThan(geometry.cards[0]?.left ?? 0);
        expect(geometry.lead?.left ?? 0).toBeLessThan(geometry.cards[2]?.left ?? 0);
        expect(
          Math.max(...geometry.cards.map((card) => card.width)) -
            Math.min(...geometry.cards.map((card) => card.width)),
        ).toBeLessThanOrEqual(1);
      } else {
        expect(geometry.lead?.top ?? Number.MAX_SAFE_INTEGER).toBeLessThan(
          Math.min(...geometry.cards.map((card) => card.top)),
        );
      }

      if (viewport.width <= 430) {
        expect(geometry.hero.height).toBeLessThanOrEqual(2_700);
        expect(geometry.lead?.width ?? 0).toBeLessThanOrEqual(viewport.width - 24);
        expect(Math.max(...geometry.cards.map((card) => card.width))).toBeLessThanOrEqual(
          viewport.width - 24,
        );
      }
    });
  }

  test("keeps keyboard focus and WCAG AA in mobile forced colors", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/integracje");

    const skipLink = page.getByRole("link", { name: "Przejdź do treści" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });
});
