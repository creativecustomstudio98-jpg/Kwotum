import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-product-r2-2.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R2_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r2-2",
  phase,
);
const viewports = [
  { height: 1_000, label: "1440", width: 1_440 },
  { height: 932, label: "430", width: 430 },
  { height: 844, label: "390", width: 390 },
  { height: 844, label: "320", width: 320 },
];

await mkdir(outputDirectory, { recursive: true });

const results = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      colorScheme: "light",
      locale: "pl-PL",
      viewport,
    });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

    const response = await page.goto(`${baseUrl}/produkt`, { waitUntil: "networkidle" });
    const section = page.locator("section:has(.product-map)");
    const metrics = await section.evaluate((region) => {
      const bounds = region.getBoundingClientRect();
      const measure = (selector) => {
        const elementBounds = region.querySelector(selector)?.getBoundingClientRect();
        return elementBounds
          ? {
              height: elementBounds.height,
              left: elementBounds.left,
              right: elementBounds.right,
              top: elementBounds.top,
              width: elementBounds.width,
            }
          : null;
      };

      return {
        heading: measure("h2"),
        height: bounds.height,
        left: bounds.left,
        moduleCards: [...region.querySelectorAll(".product-module-index > li")].map((card) => {
          const cardBounds = card.getBoundingClientRect();
          return { height: cardBounds.height, width: cardBounds.width };
        }),
        proof: measure("figure"),
        right: bounds.right,
        top: bounds.top,
      };
    });

    results.push({
      errors,
      horizontalOverflow:
        (await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )) ?? 0,
      httpStatus: response?.status() ?? null,
      phase,
      section: metrics,
      viewport: viewport.label,
    });

    await section.screenshot({
      animations: "disabled",
      path: join(outputDirectory, `produkt-map-${viewport.label}.png`),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
