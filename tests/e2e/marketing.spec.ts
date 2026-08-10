import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { indexedRoutes } from "../../apps/web/lib/marketing/content";

const homeSectionOrder = [
  "hero",
  "guided-flow",
  "client-demo",
  "decision-document",
  "industry-and-publishing",
  "pilot",
  "faq",
  "final-cta",
] as const;

const homeHeroViewports = [
  { height: 1_000, name: "1440x1000", width: 1_440 },
  { height: 900, name: "1024x900", width: 1_024 },
  { height: 1_000, name: "768x1000", width: 768 },
  { height: 844, name: "390x844", width: 390 },
  { height: 844, name: "320x844", width: 320 },
] as const;

const homeBoardTwoViewports = [
  { height: 1_000, name: "1440", width: 1_440 },
  { height: 900, name: "1024", width: 1_024 },
  { height: 1_000, name: "768", width: 768 },
  { height: 844, name: "390", width: 390 },
  { height: 844, name: "320", width: 320 },
] as const;

const mobileGuidedFlowViewports = [320, 375, 390, 430] as const;
const mobileKeyInformationViewports = [320, 375, 390, 430] as const;

const extractAttribute = (html: string, relation: string, attribute: string): string | null => {
  const tag = html.match(new RegExp(`<link[^>]+rel=["']${relation}["'][^>]*>`, "i"))?.[0];
  return tag?.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"))?.[1] ?? null;
};

const extractMeta = (html: string, name: string): string | null => {
  const tag = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))?.[0];
  return tag?.match(/content=["']([^"']+)["']/i)?.[1] ?? null;
};

test.describe("marketing and SEO", () => {
  test("home is accessible by keyboard and exposes the product story", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Kwalifikuj zapytania/,
      }),
    ).toBeVisible();

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Przejdź do treści" });
    await expect(skipLink).toBeFocused();
    await skipLink.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    const homeSections = page.locator("[data-home-section]");
    await expect(homeSections).toHaveCount(homeSectionOrder.length);
    expect(
      await homeSections.evaluateAll((sections) =>
        sections.map((section) => section.getAttribute("data-home-section")),
      ),
    ).toEqual(homeSectionOrder);
    await expect(page.locator("[data-home-proof]")).toHaveCount(8);
    await expect(page.locator("[data-home-screen]")).toHaveCount(0);

    const productScene = page.locator('[data-home-proof="rendered-product-scene"]');
    await expect(productScene).toBeVisible();
    await expect(productScene.locator("img")).toHaveCount(0);

    const heroSignals = page.getByRole("list", {
      name: "Najczęstsze zastosowania i kanały Kwotum",
    });
    await expect(heroSignals).toBeVisible();
    await expect(heroSignals.getByRole("listitem")).toHaveCount(6);

    const guidedFlow = page.locator('[data-home-section="guided-flow"]');
    await expect(guidedFlow.getByRole("listitem")).toHaveCount(3);
    await expect(page.locator('[data-home-proof="decision-document"]')).toBeVisible();

    const composition = await page.evaluate(() => {
      const proofTextSizes = [...document.querySelectorAll<HTMLElement>("[data-home-proof] *")]
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length > 0 &&
            !element.classList.contains("wy-sr-only") &&
            !element.closest('[aria-hidden="true"]'),
        )
        .map((element) => ({
          element: element.className || element.tagName.toLowerCase(),
          size: Number.parseFloat(getComputedStyle(element).fontSize),
          text: element.textContent?.trim().slice(0, 40),
        }))
        .sort((left, right) => left.size - right.size);

      return { smallestProofText: proofTextSizes[0] };
    });
    if ((composition.smallestProofText?.size ?? 0) < 12) {
      throw new Error(
        `Product proof text below 12px: ${JSON.stringify(composition.smallestProofText)}`,
      );
    }

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
  });

  for (const viewport of homeHeroViewports) {
    test(`home header, rendered hero and guided flow match at ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const hero = page.locator('[data-home-section="hero"]');
      const productScene = page.locator('[data-home-proof="rendered-product-scene"]');
      const guidedFlow = page.locator('[data-home-section="guided-flow"]');
      await expect(hero).toBeVisible();
      await expect(productScene).toBeVisible();
      await expect(guidedFlow).toBeVisible();

      await expect(productScene.locator("img")).toHaveCount(0);

      if (viewport.width > 1_200) {
        const navigationCenterOffset = await page
          .locator(".marketing-header--home .marketing-nav")
          .evaluate((navigation) => {
            const bounds = navigation.getBoundingClientRect();
            return Math.abs(
              bounds.left + bounds.width / 2 - document.documentElement.clientWidth / 2,
            );
          });
        expect(navigationCenterOffset).toBeGreaterThanOrEqual(40);
        expect(navigationCenterOffset).toBeLessThanOrEqual(110);
      }

      await expect(hero).toHaveScreenshot(`marketing-home-hero-${viewport.name}.png`, {
        animations: "disabled",
      });

      await page.addStyleTag({
        content:
          ".marketing-header { position: static !important; } .wy-skip-link { visibility: hidden !important; }",
      });
      await expect(guidedFlow).toHaveScreenshot(`marketing-home-guided-flow-${viewport.name}.png`, {
        animations: "disabled",
      });

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
    });
  }

  for (const width of mobileGuidedFlowViewports) {
    test(`mobile guided flow stays a compact readable sequence at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ height: 932, width });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const guidedFlow = page.locator('[data-home-section="guided-flow"]');
      const cards = guidedFlow.getByRole("article");
      const connectors = guidedFlow.locator('ol > li > span[aria-hidden="true"]');
      await expect(guidedFlow).toBeVisible();
      await expect(cards).toHaveCount(3);
      await expect(connectors).toHaveCount(2);
      await expect(cards.getByRole("heading")).toHaveText([
        "Zbieramy komplet informacji",
        "Kwalifikujemy i porządkujemy",
        "Dostarczamy gotowy lead",
      ]);

      const geometry = await guidedFlow.evaluate((section) => {
        const sectionBounds = section.getBoundingClientRect();
        const cardElements = [...section.querySelectorAll<HTMLElement>("article")];
        const connectorElements = [
          ...section.querySelectorAll<HTMLElement>('ol > li > span[aria-hidden="true"]'),
        ];
        const cardBounds = cardElements.map((card) => card.getBoundingClientRect());
        const connectorBounds = connectorElements.map((connector) =>
          connector.getBoundingClientRect(),
        );

        return {
          bodyFontSizes: cardElements.map((card) =>
            Number.parseFloat(getComputedStyle(card.querySelector("p")!).fontSize),
          ),
          cardHeights: cardBounds.map((bounds) => bounds.height),
          cardWidths: cardBounds.map((bounds) => bounds.width),
          connectorCenters: connectorBounds.map((bounds) => bounds.x + bounds.width / 2),
          connectorSizes: connectorBounds.map((bounds) => ({
            height: bounds.height,
            width: bounds.width,
          })),
          leftEdge: Math.min(...cardBounds.map((bounds) => bounds.left)),
          rightEdge: Math.max(...cardBounds.map((bounds) => bounds.right)),
          sectionHeight: sectionBounds.height,
        };
      });

      expect(geometry.sectionHeight).toBeLessThanOrEqual(1_220);
      expect(geometry.leftEdge).toBeGreaterThanOrEqual(12);
      expect(geometry.rightEdge).toBeLessThanOrEqual(width - 12);
      expect(
        Math.max(...geometry.cardWidths) - Math.min(...geometry.cardWidths),
      ).toBeLessThanOrEqual(1);
      expect(Math.max(...geometry.cardHeights)).toBeLessThanOrEqual(285);
      expect(Math.min(...geometry.bodyFontSizes)).toBeGreaterThanOrEqual(16);
      for (const connector of geometry.connectorSizes) {
        expect(connector.width).toBeGreaterThanOrEqual(44);
        expect(connector.height).toBeGreaterThanOrEqual(44);
      }
      for (const center of geometry.connectorCenters) {
        expect(Math.abs(center - width / 2)).toBeLessThanOrEqual(1);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
    });
  }

  test("industry demo performs a real keyboard-accessible interaction", async ({ page }) => {
    await page.goto("/branze/meble-na-wymiar");

    const demo = page.locator(".marketing-demo");
    const firstOption = demo.getByRole("radio").first();
    await firstOption.check();
    await demo.getByRole("button", { name: "Zobacz przykładowy brief" }).click();
    await expect(demo.getByText("Gotowy do kontaktu")).toBeVisible();
    await demo.getByRole("button", { name: "Wypełnij demo ponownie" }).click();
    await expect(firstOption).not.toBeChecked();
  });

  test("home exposes key information, a complete lead and real integration channels", async ({
    page,
  }) => {
    await page.goto("/");

    const keyInformation = page.locator('[data-home-proof="key-information"]');
    await expect(keyInformation.getByRole("article")).toHaveCount(4);
    await expect(keyInformation.getByRole("heading", { name: "Budżet" })).toBeVisible();
    await expect(keyInformation.getByRole("heading", { name: "Termin realizacji" })).toBeVisible();
    await expect(keyInformation.getByRole("heading", { name: "Pliki i zdjęcia" })).toBeVisible();
    await expect(keyInformation.getByText("Wysoki potencjał")).toBeVisible();

    const completeLead = page.locator('[data-home-proof="decision-document"]');
    await expect(completeLead.getByText("20 000 – 40 000 zł")).toBeVisible();
    await expect(completeLead.getByText("Czerwiec 2024")).toBeVisible();
    await expect(completeLead.getByText("Umów konsultację projektową")).toBeVisible();
    await expect(completeLead.locator("img")).toHaveCount(3);
    await expect(completeLead.getByRole("link", { name: "Zobacz proces" })).toHaveAttribute(
      "href",
      "/jak-dziala",
    );
    const leadActionWidths = await completeLead
      .getByRole("link")
      .evaluateAll((links) => links.map((link) => link.getBoundingClientRect().width));
    expect(leadActionWidths).toHaveLength(2);
    expect(Math.abs((leadActionWidths[0] ?? 0) - (leadActionWidths[1] ?? 0))).toBeLessThanOrEqual(
      1,
    );

    const integrations = page.locator('[data-home-proof="integration-system"]');
    await expect(integrations.getByRole("article")).toHaveCount(5);
    await expect(integrations.getByRole("heading", { name: "E-mail" })).toBeVisible();
    await expect(integrations.getByRole("heading", { name: "Webhook" })).toBeVisible();
    await expect(integrations.getByRole("heading", { name: "WordPress" })).toBeVisible();
    await expect(integrations.getByRole("heading", { name: "Hosted link" })).toBeVisible();
    await expect(integrations.getByText("Lead zapisany i uporządkowany")).toBeVisible();
    await expect(integrations.getByText("CRM")).toHaveCount(0);
    await expect(integrations.getByText("Arkusze Google")).toHaveCount(0);
  });

  for (const viewport of homeBoardTwoViewports) {
    test(`home key information keeps the intended composition at ${viewport.name}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const cards = page.locator('[data-home-proof="key-information"] article');
      const boxes = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x, y: bounds.y };
        }),
      );

      if (boxes.length !== 4) {
        throw new Error(`Cannot measure key information at ${viewport.name}px`);
      }

      if (viewport.width > 1_024) {
        expect(new Set(boxes.map((box) => Math.round(box.y))).size).toBe(1);
        expect(boxes[0]?.x).toBeLessThan(boxes[1]?.x ?? 0);
        expect(boxes[2]?.x).toBeLessThan(boxes[3]?.x ?? 0);
      } else if (viewport.width > 640) {
        expect(Math.round(boxes[0]?.y ?? 0)).toBe(Math.round(boxes[1]?.y ?? 1));
        expect(boxes[2]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
      } else {
        expect(Math.round(boxes[0]?.y ?? 0)).toBe(Math.round(boxes[1]?.y ?? 1));
        expect(Math.round(boxes[2]?.y ?? 0)).toBe(Math.round(boxes[3]?.y ?? 1));
        expect(boxes[2]?.y).toBeGreaterThan(boxes[0]?.y ?? 0);
        expect(boxes[0]?.x).toBeLessThan(boxes[1]?.x ?? 0);
        expect(boxes[2]?.x).toBeLessThan(boxes[3]?.x ?? 0);
      }

      const integrations = page.locator('[data-home-proof="integration-system"]');
      const integrationCards = await integrations.getByRole("article").evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x, y: bounds.y };
        }),
      );
      expect(integrationCards).toHaveLength(5);
      if (viewport.width > 1_024) {
        expect(integrationCards[0]?.x).toBeLessThan(integrationCards[2]?.x ?? 0);
        expect(integrationCards[2]?.x).toBeLessThan(integrationCards[3]?.x ?? 0);
        expect(Math.round(integrationCards[0]?.x ?? 0)).toBe(
          Math.round(integrationCards[1]?.x ?? 1),
        );
      } else if (viewport.width <= 640) {
        const verticalOrder = integrationCards
          .map((card) => Math.round(card.y))
          .sort((left, right) => left - right);
        expect(new Set(verticalOrder).size).toBe(5);
      }

      const pricingCards = page.locator('[data-home-proof="pricing-system"] article');
      const pricingBoxes = await pricingCards.evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x, y: bounds.y };
        }),
      );
      expect(pricingBoxes).toHaveLength(2);
      if (viewport.width >= 1_024) {
        expect(Math.round(pricingBoxes[0]?.y ?? 0)).toBe(Math.round(pricingBoxes[1]?.y ?? 1));
        expect(pricingBoxes[0]?.x).toBeLessThan(pricingBoxes[1]?.x ?? 0);
      } else {
        expect(pricingBoxes[1]?.y).toBeGreaterThan(pricingBoxes[0]?.y ?? 0);
      }

      const faq = page.locator('[data-home-proof="faq-system"]');
      const faqColumns = await faq.locator(":scope > div, :scope > aside").evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x, y: bounds.y };
        }),
      );
      expect(faqColumns).toHaveLength(2);
      if (viewport.width > 1_024) {
        expect(faqColumns[0]?.x).toBeLessThan(faqColumns[1]?.x ?? 0);
        expect(Math.abs((faqColumns[1]?.y ?? 0) - (faqColumns[0]?.y ?? 0))).toBeLessThan(80);
      } else {
        expect(faqColumns[1]?.y).toBeGreaterThan(faqColumns[0]?.y ?? 0);
      }

      const finalProofCards = page.locator('[data-home-proof="final-cta-system"] article');
      const finalProofBoxes = await finalProofCards.evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { x: bounds.x, y: bounds.y };
        }),
      );
      expect(finalProofBoxes).toHaveLength(3);
      if (viewport.width >= 1_024) {
        expect(Math.round(finalProofBoxes[0]?.y ?? 0)).toBe(Math.round(finalProofBoxes[1]?.y ?? 1));
        expect(finalProofBoxes[0]?.x).toBeLessThan(finalProofBoxes[1]?.x ?? 0);
        expect(finalProofBoxes[2]?.y).toBeGreaterThan(finalProofBoxes[0]?.y ?? 0);
      } else {
        expect(finalProofBoxes[1]?.y).toBeGreaterThan(finalProofBoxes[0]?.y ?? 0);
        expect(finalProofBoxes[2]?.y).toBeGreaterThan(finalProofBoxes[1]?.y ?? 0);
      }

      const footerColumns = await page
        .locator(".marketing-footer__grid > *")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const bounds = element.getBoundingClientRect();
            return { x: bounds.x, y: bounds.y };
          }),
        );
      expect(footerColumns).toHaveLength(4);
      if (viewport.width > 1_024) {
        expect(new Set(footerColumns.map((column) => Math.round(column.y))).size).toBe(1);
      } else if (viewport.width > 640) {
        expect(footerColumns[1]?.y).toBeGreaterThan(footerColumns[0]?.y ?? 0);
        expect(Math.round(footerColumns[1]?.y ?? 0)).toBe(Math.round(footerColumns[2]?.y ?? 1));
        expect(footerColumns[3]?.y).toBeGreaterThan(footerColumns[1]?.y ?? 0);
      } else {
        expect(footerColumns[1]?.y).toBeGreaterThan(footerColumns[0]?.y ?? 0);
        expect(footerColumns[2]?.y).toBeGreaterThan(footerColumns[1]?.y ?? 0);
        expect(footerColumns[3]?.y).toBeGreaterThan(footerColumns[2]?.y ?? 0);
      }

      const completeLead = page.locator('[data-home-proof="decision-document"]');
      const leadColumns = await completeLead
        .locator(":scope > dl, :scope > div, :scope > aside")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const bounds = element.getBoundingClientRect();
            return { x: bounds.x, y: bounds.y };
          }),
        );
      expect(leadColumns).toHaveLength(3);
      if (viewport.width > 1_024) {
        expect(new Set(leadColumns.map((column) => Math.round(column.y))).size).toBe(1);
        expect(leadColumns[0]?.x).toBeLessThan(leadColumns[1]?.x ?? 0);
        expect(leadColumns[1]?.x).toBeLessThan(leadColumns[2]?.x ?? 0);
      } else if (viewport.width <= 640) {
        expect(leadColumns[1]?.y).toBeGreaterThan(leadColumns[0]?.y ?? 0);
        expect(leadColumns[2]?.y).toBeGreaterThan(leadColumns[1]?.y ?? 0);
      }

      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
    });
  }

  for (const width of mobileKeyInformationViewports) {
    test(`mobile key information stays a balanced 2 by 2 grid at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ height: 932, width });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      const section = page.locator('[data-home-section="client-demo"]');
      const cards = section.getByRole("article");
      await expect(section).toBeVisible();
      await expect(cards).toHaveCount(4);
      await expect(cards.getByRole("heading")).toHaveText([
        "Budżet",
        "Termin realizacji",
        "Pliki i zdjęcia",
        "Wynik kwalifikacji",
      ]);

      const geometry = await section.evaluate((root) => {
        const sectionBounds = root.getBoundingClientRect();
        const cardElements = [...root.querySelectorAll<HTMLElement>("article")];
        const cardBounds = cardElements.map((card) => card.getBoundingClientRect());

        return {
          cardHeights: cardBounds.map((bounds) => bounds.height),
          cardWidths: cardBounds.map((bounds) => bounds.width),
          leftEdge: Math.min(...cardBounds.map((bounds) => bounds.left)),
          rightEdge: Math.max(...cardBounds.map((bounds) => bounds.right)),
          sectionHeight: sectionBounds.height,
          titleFontSizes: cardElements.map((card) =>
            Number.parseFloat(getComputedStyle(card.querySelector("h3")!).fontSize),
          ),
          x: cardBounds.map((bounds) => bounds.x),
          y: cardBounds.map((bounds) => bounds.y),
        };
      });

      expect(geometry.sectionHeight).toBeLessThanOrEqual(1_050);
      expect(geometry.leftEdge).toBeGreaterThanOrEqual(12);
      expect(geometry.rightEdge).toBeLessThanOrEqual(width - 12);
      expect(
        Math.max(...geometry.cardWidths) - Math.min(...geometry.cardWidths),
      ).toBeLessThanOrEqual(1);
      expect(
        Math.max(...geometry.cardHeights) - Math.min(...geometry.cardHeights),
      ).toBeLessThanOrEqual(1);
      expect(Math.min(...geometry.titleFontSizes)).toBeGreaterThanOrEqual(16);
      expect(Math.abs((geometry.y[0] ?? 0) - (geometry.y[1] ?? 1))).toBeLessThanOrEqual(1);
      expect(Math.abs((geometry.y[2] ?? 0) - (geometry.y[3] ?? 1))).toBeLessThanOrEqual(1);
      expect(geometry.y[2]).toBeGreaterThan(geometry.y[0] ?? 0);
      expect(Math.abs((geometry.x[0] ?? 0) - (geometry.x[2] ?? 1))).toBeLessThanOrEqual(1);
      expect(Math.abs((geometry.x[1] ?? 0) - (geometry.x[3] ?? 1))).toBeLessThanOrEqual(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
    });
  }

  test("key information reflows without clipping at a 200 percent zoom equivalent", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 195 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const cards = page.locator('[data-home-proof="key-information"] article');
    await expect(cards).toHaveCount(4);
    const geometry = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          clientHeight: element.clientHeight,
          clientWidth: element.clientWidth,
          scrollHeight: element.scrollHeight,
          scrollWidth: element.scrollWidth,
          x: bounds.x,
          y: bounds.y,
        };
      }),
    );

    expect(new Set(geometry.map((card) => Math.round(card.x))).size).toBe(1);
    expect(geometry[1]?.y).toBeGreaterThan(geometry[0]?.y ?? 0);
    expect(geometry[2]?.y).toBeGreaterThan(geometry[1]?.y ?? 0);
    expect(geometry[3]?.y).toBeGreaterThan(geometry[2]?.y ?? 0);
    for (const card of geometry) {
      expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth + 1);
      expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight + 1);
    }
  });

  test("mobile menu manages focus, Escape and scroll locking", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Otwórz menu" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Zamknij menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const homeDialog = page.getByRole("dialog", { name: "Menu mobilne" });
    await expect(homeDialog).toBeVisible();
    await expect(homeDialog.getByRole("link", { name: "Produkt" })).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menu mobilne" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Otwórz menu" })).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");

    await page.goto("/produkt");
    await page.getByRole("button", { name: "Otwórz menu" }).click();
    const productDialog = page.getByRole("dialog", { name: "Menu mobilne" });
    await expect(productDialog.getByRole("link", { name: "Produkt" })).toBeFocused();
    await expect(productDialog.getByRole("link", { name: "Zaloguj się" })).toBeVisible();
  });

  test("every allowlisted page has unique metadata, canonical and working internal links", async ({
    request,
  }) => {
    const documents = await Promise.all(
      indexedRoutes.map(async (route) => {
        const response = await request.get(route);
        expect(response.status(), route).toBe(200);
        return { html: await response.text(), route };
      }),
    );

    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const internalPaths = new Set<string>();

    for (const { html, route } of documents) {
      const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "";
      const description = extractMeta(html, "description") ?? "";
      const canonical = extractAttribute(html, "canonical", "href");
      const robots = extractMeta(html, "robots") ?? "";

      expect(title.length, `${route} title`).toBeGreaterThanOrEqual(20);
      expect(description.length, `${route} description`).toBeGreaterThanOrEqual(80);
      expect(titles.has(title), `${route} duplicate title`).toBe(false);
      expect(descriptions.has(description), `${route} duplicate description`).toBe(false);
      expect(new URL(canonical ?? "http://invalid.test").pathname).toBe(route);
      expect(robots).toContain("index");
      expect(robots).toContain("follow");
      expect(robots).not.toContain("noindex");
      expect(html).toMatch(/<h1[\s>]/i);

      titles.add(title);
      descriptions.add(description);

      for (const match of html.matchAll(/href=["'](\/[^"'?#]*)(?:[?#][^"']*)?["']/g)) {
        const path = match[1];
        if (path) internalPaths.add(path);
      }
    }

    const responses = await Promise.all(
      [...internalPaths]
        .filter((path) => path !== "/logowanie")
        .map(async (path) => ({
          path,
          response: await request.get(path),
        })),
    );
    for (const { path, response } of responses) {
      expect(response.status(), `broken link ${path}`).toBeLessThan(400);
    }
  });

  test("robots, sitemap, private noindex and error pages agree", async ({ page, request }) => {
    const robots = await request.get("/robots.txt");
    const robotsBody = await robots.text();
    expect(robots.status()).toBe(200);
    for (const path of ["/api/", "/design-system", "/f/", "/logowanie", "/panel"]) {
      expect(robotsBody).toContain(`Disallow: ${path}`);
    }
    expect(robotsBody).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    const sitemapBody = await sitemap.text();
    expect(sitemap.status()).toBe(200);
    for (const route of indexedRoutes) {
      const path = route === "/" ? "" : route;
      expect(sitemapBody).toContain(`${path}</loc>`);
    }
    expect(sitemapBody).not.toContain("/panel");
    expect(sitemapBody).not.toContain("/logowanie");

    await page.goto("/design-system");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

    const hostedFlow = await request.get("/f/10000000-0000-4000-8000-000000000001");
    expect(hostedFlow.status()).toBe(200);
    expect(extractMeta(await hostedFlow.text(), "robots")).toContain("noindex");

    const notFound = await request.get("/strona-ktorej-nie-ma");
    expect(notFound.status()).toBe(404);
    expect(await notFound.text()).toContain("Nie znaleźliśmy tej strony");
  });

  test("pricing is honest and structured data contains no invented proof", async ({ page }) => {
    await page.goto("/cennik");
    const pricingModel = page.locator("[data-pricing-paths]");
    await expect(
      pricingModel.getByRole("article").nth(0).getByText("Wycena indywidualna", { exact: true }),
    ).toBeVisible();
    await expect(pricingModel.getByText("Bez publicznej ceny", { exact: true })).toBeVisible();
    await expect(
      pricingModel.getByText("Model w trakcie walidacji", { exact: true }),
    ).toBeVisible();
    expect(await page.locator("main").innerText()).not.toMatch(/\d[\d\s]*[,.]?\d*\s*zł/i);

    await page.goto("/");
    const homePricing = page.locator('[data-home-proof="pricing-system"]');
    await expect(homePricing.getByRole("article")).toHaveCount(2);
    await expect(homePricing.getByText("Wycena indywidualna")).toBeVisible();
    await expect(homePricing.getByText("Model self-service jeszcze nieustalony")).toBeVisible();
    await expect(
      homePricing.getByRole("link", { name: "Sprawdź zakres pilotażu" }),
    ).toHaveAttribute("href", "/cennik");
    await expect(
      homePricing.getByRole("link", { name: "Zobacz model współpracy" }),
    ).toHaveAttribute("href", "/cennik");
    const homePricingText = await homePricing.innerText();
    expect(homePricingText).not.toMatch(/\d[\d\s]*[,.]?\d*\s*zł/i);
    expect(homePricingText).not.toContain("14 dni");
    expect(homePricingText).not.toContain("karty płatniczej");

    const structuredData = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(structuredData).toHaveLength(2);
    const serialized = structuredData.join(" ");
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain('"review"');
    expect(serialized).not.toContain('"offers"');
  });

  test("FAQ works natively and exposes only existing help sources", async ({ page }) => {
    await page.goto("/");

    const faq = page.locator('[data-home-proof="faq-system"]');
    const questions = faq.locator("details");
    await expect(questions).toHaveCount(5);
    await expect(questions.first()).not.toHaveAttribute("open", "");
    await questions.first().locator("summary").click();
    await expect(questions.first()).toHaveAttribute("open", "");
    await expect(questions.first().getByText(/Pilotaż zaczyna się od warsztatu/)).toBeVisible();

    const help = faq.getByRole("navigation", { name: "Materiały pomocy Kwotum" });
    await expect(help.getByRole("link")).toHaveCount(3);
    await expect(help.getByRole("link", { name: /Jak działa Kwotum/ })).toHaveAttribute(
      "href",
      "/jak-dziala",
    );
    await expect(help.getByRole("link", { name: /Poznaj produkt/ })).toHaveAttribute(
      "href",
      "/produkt",
    );
    await expect(help.getByRole("link", { name: /WordPress i instalacja/ })).toHaveAttribute(
      "href",
      "/wordpress",
    );
    await expect(faq.getByRole("link", { name: "Zobacz zakres pilotażu" })).toHaveAttribute(
      "href",
      "/cennik",
    );

    expect(await faq.locator('a[href^="tel:"], a[href^="mailto:"]').count()).toBe(0);
    const faqText = await faq.innerText();
    expect(faqText).not.toContain("98%");
    expect(faqText).not.toContain("< 2h");
    expect(faqText).not.toContain("Porozmawiaj z nami");
  });

  test("final CTA uses real product proof and working actions", async ({ page }) => {
    await page.goto("/");

    const finalCta = page.locator('[data-home-proof="final-cta-system"]');
    await expect(finalCta.getByRole("article")).toHaveCount(3);
    await expect(finalCta.getByText("5", { exact: true })).toBeVisible();
    await expect(finalCta.getByText("4", { exact: true })).toBeVisible();
    await expect(finalCta.getByLabel("Przykładowy wynik: 87 na 100")).toBeVisible();
    await expect(finalCta.getByRole("link", { name: "Zobacz demo" })).toHaveAttribute(
      "href",
      "#przykladowy-lead",
    );
    await expect(finalCta.getByRole("link", { name: "Poznaj produkt" })).toHaveAttribute(
      "href",
      "/produkt",
    );
    await expect(
      finalCta.getByRole("list", { name: "Warunki programu pilotażowego" }).getByRole("listitem"),
    ).toHaveCount(3);

    const factPositions = await finalCta
      .getByRole("list", { name: "Warunki programu pilotażowego" })
      .getByRole("listitem")
      .evaluateAll((items) =>
        items.map((item) => {
          const bounds = item.getBoundingClientRect();
          return { right: bounds.right, x: bounds.x, y: bounds.y };
        }),
      );
    expect(new Set(factPositions.map((item) => Math.round(item.y))).size).toBe(1);
    for (let index = 1; index < factPositions.length; index += 1) {
      const previous = factPositions[index - 1];
      const current = factPositions[index];
      expect((current?.x ?? 0) - (previous?.right ?? 0)).toBeGreaterThanOrEqual(16);
      expect((current?.x ?? 0) - (previous?.right ?? 0)).toBeLessThanOrEqual(33);
    }

    const finalCtaText = await finalCta.innerText();
    expect(finalCtaText).not.toContain("128");
    expect(finalCtaText).not.toContain("+20%");
    expect(finalCtaText).not.toContain("+15%");
    expect(finalCtaText).not.toContain("85%");
    expect(finalCtaText).not.toContain("72%");
    expect(finalCtaText).not.toContain("68%");
    expect(finalCtaText).not.toContain("61%");
  });

  test("footer matches the landing system and exposes complete working navigation", async ({
    page,
  }) => {
    await page.goto("/");

    const footer = page.getByRole("contentinfo");
    await expect(footer.locator("[data-footer-layout]")).toBeVisible();
    await expect(footer.getByRole("link", { name: "Kwotum — strona główna" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(footer.getByText("Produkt w fazie walidacji", { exact: true })).toBeVisible();
    await expect(footer.getByRole("navigation")).toHaveCount(3);
    await expect(footer.getByRole("link")).toHaveCount(14);

    const information = footer.getByRole("navigation", { name: "Informacje" });
    await expect(information.getByRole("link", { name: "Polityka prywatności" })).toHaveAttribute(
      "href",
      "/polityka-prywatnosci",
    );
    await expect(information.getByRole("link", { name: "Regulamin" })).toHaveAttribute(
      "href",
      "/regulamin",
    );
    await expect(footer.getByRole("link", { name: "Wróć na górę ↑" })).toHaveAttribute(
      "href",
      "#main-content",
    );

    expect(await footer.locator('a[href=""], a:not([href])').count()).toBe(0);
  });

  test("mobile hero and final CTA use real viewport geometry", async ({ page }) => {
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ height: width === 430 ? 932 : 844, width });
      await page.goto("/");

      const geometry = await page.evaluate(() => {
        const selectors = [
          ".marketing-header--home .marketing-header__inner",
          '[data-home-section="hero"] h1',
          '[data-home-section="hero"] a',
          '[data-home-section="hero"] ul',
          '[data-home-proof="rendered-product-scene"]',
          '[data-home-proof="final-cta-system"]',
          '[data-home-proof="final-cta-system"] > [aria-label="Kwotum"]',
          '[data-home-proof="final-cta-system"] h2',
          '[data-home-proof="final-cta-system"] a',
          '[data-home-proof="final-cta-system"] > [aria-label^="Zweryfikowany"]',
          '[data-home-proof="final-cta-system"] > [aria-label="Warunki programu pilotażowego"]',
        ];
        const regions = selectors.flatMap((selector) =>
          [...document.querySelectorAll<HTMLElement>(selector)].map((element) => {
            const bounds = element.getBoundingClientRect();
            return {
              height: bounds.height,
              left: bounds.left,
              right: bounds.right,
              selector,
              text: element.textContent?.trim().slice(0, 36),
            };
          }),
        );
        const menu = document.querySelector<HTMLElement>(".marketing-menu-button");
        const menuBounds = menu?.getBoundingClientRect();
        const finalCta = document.querySelector<HTMLElement>(
          '[data-home-proof="final-cta-system"]',
        );
        const finalCtaBounds = finalCta?.getBoundingClientRect();
        const finalCtaStyle = finalCta ? getComputedStyle(finalCta) : null;
        const leadActions = [
          ...document.querySelectorAll<HTMLElement>('[data-home-proof="decision-document"] a'),
        ].map((action) => action.getBoundingClientRect().width);
        const finalFacts = [
          ...document.querySelectorAll<HTMLElement>(
            '[aria-label="Warunki programu pilotażowego"] > li',
          ),
        ].map((item) => {
          const bounds = item.getBoundingClientRect();
          return { width: bounds.width, x: bounds.x, y: bounds.y };
        });
        return {
          finalCta: finalCtaBounds
            ? {
                gap: Number.parseFloat(finalCtaStyle?.gap ?? "0"),
                left: finalCtaBounds.left,
                paddingLeft: Number.parseFloat(finalCtaStyle?.paddingLeft ?? "0"),
                right: finalCtaBounds.right,
              }
            : null,
          menu: menuBounds ? { height: menuBounds.height, width: menuBounds.width } : null,
          finalFacts,
          leadActions,
          regions,
          viewport: document.documentElement.clientWidth,
        };
      });

      for (const region of geometry.regions) {
        expect(
          region.left,
          `${width}px left: ${region.selector} ${region.text}`,
        ).toBeGreaterThanOrEqual(-1);
        expect(
          region.right,
          `${width}px right: ${region.selector} ${region.text}`,
        ).toBeLessThanOrEqual(geometry.viewport + 1);
      }

      expect(geometry.menu?.width).toBeGreaterThanOrEqual(44);
      expect(geometry.menu?.height).toBeGreaterThanOrEqual(44);
      expect(geometry.finalCta?.left).toBeCloseTo(12, 0);
      expect(geometry.finalCta?.right).toBeCloseTo(width - 12, 0);
      expect(geometry.finalCta?.paddingLeft).toBeCloseTo(20, 0);
      expect(geometry.finalCta?.gap).toBeCloseTo(32, 0);
      expect(geometry.leadActions).toHaveLength(2);
      expect(
        Math.abs((geometry.leadActions[0] ?? 0) - (geometry.leadActions[1] ?? 0)),
      ).toBeLessThanOrEqual(1);
      expect(geometry.finalFacts).toHaveLength(3);
      expect(new Set(geometry.finalFacts.map((item) => Math.round(item.x))).size).toBe(1);
      expect(new Set(geometry.finalFacts.map((item) => Math.round(item.width))).size).toBe(1);

      const actions = page.locator('[data-home-section="hero"] a');
      await expect(actions).toHaveCount(2);
      for (const action of await actions.all()) {
        expect((await action.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(52);
      }
    }
  });

  test("mobile has no horizontal overflow and marketing JavaScript stays within budget", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);
    const mobileComposition = await page.evaluate(() => ({
      smallestProofText: [...document.querySelectorAll<HTMLElement>("[data-home-proof] *")]
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length > 0 &&
            !element.classList.contains("wy-sr-only") &&
            !element.closest('[aria-hidden="true"]'),
        )
        .map((element) => ({
          element: element.className || element.tagName.toLowerCase(),
          size: Number.parseFloat(getComputedStyle(element).fontSize),
          text: element.textContent?.trim().slice(0, 40),
        }))
        .sort((left, right) => left.size - right.size)[0],
    }));
    if ((mobileComposition.smallestProofText?.size ?? 0) < 12) {
      throw new Error(
        `Mobile product proof text below 12px: ${JSON.stringify(
          mobileComposition.smallestProofText,
        )}`,
      );
    }

    const scriptBytes = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js"))
        .reduce((sum, entry) => sum + entry.encodedBodySize, 0),
    );
    expect(scriptBytes).toBeLessThanOrEqual(250_000);
  });

  test("reflow, reduced motion and forced colors preserve the primary path", async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 320 });
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Kwalifikuj zapytania/,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true);

    const primaryAction = page.getByRole("link", { name: "Zobacz demo", exact: true }).last();
    await primaryAction.focus();
    await expect(primaryAction).toBeFocused();
    await primaryAction.press("Enter");
    await expect(page.locator("#przykladowy-lead")).toBeVisible();
  });

  test("home content remains visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Kwalifikuj zapytania/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("article", {
        name: "Dane demonstracyjne: kompletny lead z wynikiem i następnym krokiem",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Od niepełnego zapytania do gotowego leada",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Wszystkie kluczowe informacje w jednym miejscu",
      }),
    ).toBeVisible();

    await context.close();
  });

  test("home reveal is progressive and reduced motion exposes every element", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#lorum-home")).toHaveAttribute("data-motion-ready", "true");
    const storyHeading = page.getByRole("heading", {
      name: "Od niepełnego zapytania do gotowego leada",
    });
    await storyHeading.scrollIntoViewIfNeeded();
    await expect(storyHeading).toHaveAttribute("data-revealed", "true");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const hiddenElements = await page
      .locator('[data-reveal]:not([data-revealed="true"])')
      .evaluateAll(
        (elements) =>
          elements.filter((element) => {
            const style = getComputedStyle(element);
            return style.opacity === "0" || style.visibility === "hidden";
          }).length,
      );
    expect(hiddenElements).toBe(0);
  });
});
