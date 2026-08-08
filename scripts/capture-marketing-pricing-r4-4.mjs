import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-pricing-r4-4.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R4_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r4-4",
  phase,
);
const viewports = [
  { height: 1_024, label: "1536", width: 1_536 },
  { height: 1_000, label: "1440", width: 1_440 },
  { height: 800, label: "1280", width: 1_280 },
  { height: 900, label: "1024", width: 1_024 },
  { height: 1_024, label: "768", width: 768 },
  { height: 932, label: "430", width: 430 },
  { height: 844, label: "390", width: 390 },
  { height: 812, label: "375", width: 375 },
  { height: 844, label: "320", width: 320 },
];

await mkdir(outputDirectory, { recursive: true });

const results = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ colorScheme: "light", locale: "pl-PL", viewport });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

    const response = await page.goto(`${baseUrl}/cennik?qa=r4-4-${phase}`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({
      content:
        ".marketing-header { position: static !important; } html body .skip-link { display: none !important; visibility: hidden !important; opacity: 0 !important; }",
    });
    await page.locator('a[href="#main-content"]').evaluateAll((links) => {
      for (const link of links) link.remove();
    });

    const scope = page.locator("[data-pricing-scope], #model-wspolpracy .pricing-sheet__footer");
    const finalCta = page.locator("[data-pricing-final-cta], .marketing-cta-band").last();
    const metrics = await page.evaluate(() => {
      const scopeRegion = document.querySelector(
        "[data-pricing-scope], #model-wspolpracy .pricing-sheet__footer",
      );
      const finalRegion =
        document.querySelector("[data-pricing-final-cta]") ??
        [...document.querySelectorAll(".marketing-cta-band")].at(-1);
      const measure = (element) => {
        if (!(element instanceof HTMLElement)) return null;
        const bounds = element.getBoundingClientRect();
        return {
          height: bounds.height,
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          width: bounds.width,
        };
      };
      const actions = [scopeRegion, finalRegion]
        .flatMap((region) => (region ? [...region.querySelectorAll("a")] : []))
        .map((action) => {
          const bounds = action.getBoundingClientRect();
          return { height: bounds.height, width: bounds.width };
        });
      const textSizes = [scopeRegion, finalRegion]
        .flatMap((region) => (region ? [...region.querySelectorAll("*")] : []))
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length > 0 &&
            !element.closest('[aria-hidden="true"]'),
        )
        .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

      return {
        actions,
        finalCta: measure(finalRegion),
        scope: measure(scopeRegion),
        smallestText: Math.min(...textSizes),
      };
    });

    results.push({
      documentHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      errors,
      horizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      httpStatus: response?.status() ?? null,
      phase,
      regions: metrics,
      viewport: viewport.label,
    });

    await scope.screenshot({
      animations: "disabled",
      path: join(outputDirectory, `cennik-scope-${viewport.label}.png`),
    });
    await finalCta.screenshot({
      animations: "disabled",
      path: join(outputDirectory, `cennik-final-cta-${viewport.label}.png`),
    });

    if (viewport.label === "1440" || viewport.label === "390") {
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `cennik-full-${viewport.label}.png`),
      });
    }

    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
