import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const agencyViewports = [
  { height: 1_024, width: 1_536 },
  { height: 1_000, width: 1_440 },
  { height: 900, width: 1_280 },
  { height: 900, width: 1_024 },
  { height: 1_024, width: 768 },
  { height: 932, width: 430 },
  { height: 844, width: 390 },
  { height: 844, width: 320 },
] as const;

test.describe("marketing agency V7", () => {
  test("opens with the real handoff boundary and product screens", async ({ page }) => {
    await page.goto("/dla-agencji");

    const hero = page.locator("[data-agency-hero]");
    await expect(page).toHaveTitle("Formularze wyceny dla agencji WordPress i web · Kwotum");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/dla-agencji$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Wdrażacie proces\..*Klient zarządza leadami\./,
    );
    await expect(hero.locator("[data-agency-tenant-proof]")).toBeVisible();
    await expect(hero.locator("[data-agency-panel-preview] img")).toHaveAttribute(
      "alt",
      /Panel Kwotum z przeglądem leadów/,
    );
    await expect(hero.getByRole("link", { name: "Zobacz model wdrożenia" })).toHaveAttribute(
      "href",
      "#model-wdrozenia",
    );
    await expect(hero.getByRole("link", { name: "Porównaj branże" })).toHaveAttribute(
      "href",
      "/branze",
    );
    await expect(
      hero.getByRole("navigation", { name: "Rozdziały dla agencji" }).getByRole("link"),
    ).toHaveCount(4);

    const text = await hero.innerText();
    expect(text).toContain("bez automatycznego dostępu");
    expect(text).not.toMatch(/white[- ]?label|wspólna baza leadów|Anna Kowalska/i);
  });

  test("keeps one honest four-stage implementation method", async ({ page }) => {
    await page.goto("/dla-agencji");

    const method = page.locator("[data-agency-method]");
    const steps = method.locator("[data-agency-method-step]");
    await expect(method.getByRole("heading", { level: 2 })).toHaveText(
      /Jedna metoda wdrożenia\..*Każdy proces dopasowany do klienta\./,
    );
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
    await expect(method.locator("[data-agency-method-rules] > div")).toHaveCount(3);
    await expect(method.locator("button, input, select, textarea")).toHaveCount(0);
  });

  test("renders the real Owner Admin Sales matrix and tenant layers", async ({ page }) => {
    await page.goto("/dla-agencji");

    const ownership = page.locator("[data-agency-ownership]");
    const proof = ownership.locator("[data-agency-access-proof]");
    const table = proof.getByRole("table", {
      name: "Uprawnienia aktywnych ról organizacji do operacji na leadach",
    });

    await expect(ownership.getByRole("heading", { level: 2 })).toHaveText(
      /Lead należy do firmy\..*Dostęp wynika z roli, nie z wdrożenia\./,
    );
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
    await expect(proof.getByText("Samo wdrożenie nie nadaje roli", { exact: false })).toBeVisible();
    await expect(
      ownership.getByRole("list", { name: "Warstwy kontroli tenantowej" }).getByRole("listitem"),
    ).toHaveCount(3);
    await expect(ownership).toContainText("TenantContext");
    await expect(ownership).toContainText("RLS");
  });

  test("states the Shadow DOM contract without promising JavaScript isolation", async ({
    page,
  }) => {
    await page.goto("/dla-agencji");

    const isolation = page.locator("[data-agency-isolation]");
    const proof = isolation.locator("[data-agency-isolation-proof]");
    await expect(isolation.getByRole("heading", { level: 2 })).toHaveText(
      /Motyw klienta zostaje na zewnątrz\..*Widget zachowuje własny interfejs\./,
    );
    await expect(proof.getByText("Shadow root", { exact: true })).toBeVisible();
    await expect(proof.getByText("Style hosta zatrzymane", { exact: true })).toBeVisible();
    await expect(proof.getByText('<wyceno-widget mode="inline">', { exact: true })).toBeVisible();
    await expect(
      proof.getByRole("list", { name: "Kontrakt izolacji widgetu" }).getByRole("listitem"),
    ).toHaveCount(3);
    await expect(proof).toContainText("nie otrzymuje odpowiedzi ani tokenu sesji");
    await expect(proof).toContainText("nie jest granicą bezpieczeństwa");
    await expect(proof.locator("button, input, select, textarea, a")).toHaveCount(0);
  });

  test("ends with working actions and one intentional section order", async ({ page }) => {
    await page.goto("/dla-agencji");

    await expect(page.getByRole("link", { name: "Zobacz zastosowania" })).toHaveAttribute(
      "href",
      "/branze",
    );
    await expect(page.getByRole("link", { name: "Przejdź do panelu" })).toHaveAttribute(
      "href",
      "/logowanie",
    );
    const sectionOrder = await page
      .locator("main section")
      .evaluateAll((sections) => sections.map((section) => section.id));
    expect(sectionOrder).toEqual([
      "agency-hero",
      "model-wdrozenia",
      "granica-danych",
      "izolacja-widgetu",
      "agency-final-cta",
    ]);
  });

  for (const viewport of agencyViewports) {
    test(`keeps the complete agency story deliberate at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/dla-agencji");

      const geometry = await page.locator("[data-agency-hero]").evaluate((hero) => {
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
        const root = hero.parentElement;
        const actions = [...hero.querySelectorAll<HTMLElement>("[data-agency-actions] a")].map(
          measure,
        );
        const textSizes = [...(root?.querySelectorAll<HTMLElement>("*") ?? [])]
          .filter(
            (element) =>
              element.textContent?.trim() &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"]') &&
              !element.classList.contains("wy-sr-only"),
          )
          .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));
        const ownership = root?.querySelector<HTMLElement>("[data-agency-ownership]");
        const table = ownership?.querySelector<HTMLElement>("table");
        const desktopImage = root?.querySelector<HTMLElement>(
          "[data-agency-method] img:first-of-type",
        );
        const mobileImage = root?.querySelector<HTMLElement>(
          "[data-agency-method] img:last-of-type",
        );

        return {
          actions,
          copy: measure(hero.querySelector("[data-agency-hero-copy]")),
          desktopImageDisplay: desktopImage ? getComputedStyle(desktopImage).display : null,
          heroProof: measure(hero.querySelector("[data-agency-tenant-proof]")),
          mobileImageDisplay: mobileImage ? getComputedStyle(mobileImage).display : null,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          smallestText: Math.min(...textSizes),
          tableDisplay: table ? getComputedStyle(table).display : null,
        };
      });

      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.smallestText).toBeGreaterThanOrEqual(12);
      expect(geometry.actions).toHaveLength(2);
      for (const action of geometry.actions) {
        expect(action?.height ?? 0).toBeGreaterThanOrEqual(44);
      }

      if (viewport.width > 1_024) {
        expect(geometry.heroProof?.left ?? 0).toBeGreaterThan(geometry.copy?.right ?? 0);
        expect(geometry.tableDisplay).toBe("table");
        expect(geometry.desktopImageDisplay).toBe("block");
        expect(geometry.mobileImageDisplay).toBe("none");
      } else {
        expect(geometry.heroProof?.top ?? 0).toBeGreaterThan(geometry.copy?.bottom ?? 0);
      }

      if (viewport.width <= 768) {
        expect(geometry.actions[1]?.top ?? 0).toBeGreaterThan(geometry.actions[0]?.top ?? 0);
        expect(geometry.actions[0]?.width ?? 0).toBe(geometry.actions[1]?.width ?? 0);
        expect(geometry.tableDisplay).toBe("block");
        expect(geometry.desktopImageDisplay).toBe("none");
        expect(geometry.mobileImageDisplay).toBe("block");
      }
    });
  }

  test("supports keyboard entry and WCAG AA in mobile forced colors", async ({ page }) => {
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

  test("keeps the complete agency contract available without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/dla-agencji", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Wdrażacie proces");
    await expect(page.locator("[data-agency-method-step]")).toHaveCount(4);
    await expect(page.locator('[data-permission="allowed"]')).toHaveCount(9);
    await expect(page.getByText("Shadow root", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Zobacz zastosowania" })).toHaveAttribute(
      "href",
      "/branze",
    );

    await context.close();
  });
});
