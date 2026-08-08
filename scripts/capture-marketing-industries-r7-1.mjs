import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.MARKETING_R7_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r7-1",
  "after",
);
const viewports = [
  { height: 1_000, label: "1536", width: 1_536 },
  { height: 1_000, label: "1440", width: 1_440 },
  { height: 900, label: "1280", width: 1_280 },
  { height: 900, label: "1024", width: 1_024 },
  { height: 1_000, label: "768", width: 768 },
  { height: 932, label: "430", width: 430 },
  { height: 844, label: "390", width: 390 },
  { height: 844, label: "375", width: 375 },
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

    const response = await page.goto(`${baseUrl}/branze?qa=r7-1`, { waitUntil: "networkidle" });
    const regions = await page.locator(".industries-page-hero").evaluate((hero) => {
      const bounds = hero.getBoundingClientRect();
      const measure = (selector) => {
        const elementBounds = hero.querySelector(selector)?.getBoundingClientRect();
        return elementBounds
          ? {
              bottom: elementBounds.bottom,
              height: elementBounds.height,
              left: elementBounds.left,
              right: elementBounds.right,
              top: elementBounds.top,
              width: elementBounds.width,
            }
          : null;
      };
      const proof = hero.querySelector("[data-industries-proof]");
      const proofTextSizes = [...(proof?.querySelectorAll("*") ?? [])]
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length > 0 &&
            !element.closest('[aria-hidden="true"]') &&
            !element.classList.contains("wy-sr-only"),
        )
        .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

      return {
        heading: measure(".industries-page-hero__heading"),
        hero: {
          bottom: bounds.bottom,
          height: bounds.height,
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          width: bounds.width,
        },
        proof: measure("[data-industries-proof]"),
        smallestProofText: Math.min(...proofTextSizes),
        tabs: [...(proof?.querySelectorAll('[role="tab"]') ?? [])].map((tab) => {
          const tabBounds = tab.getBoundingClientRect();
          return { height: tabBounds.height, width: tabBounds.width };
        }),
      };
    });

    results.push({
      documentHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      errors,
      horizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      httpStatus: response?.status() ?? null,
      regions,
      viewport: viewport.label,
    });

    await page.locator(".industries-page-hero").screenshot({
      animations: "disabled",
      path: join(outputDirectory, `branze-hero-${viewport.label}.png`),
    });

    if (viewport.label === "1440" || viewport.label === "390") {
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `branze-full-${viewport.label}.png`),
      });
    }

    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
