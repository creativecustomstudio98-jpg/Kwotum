import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-pricing-r4-1.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R4_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r4-1",
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

    const response = await page.goto(`${baseUrl}/cennik?qa=r4-1-${phase}`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({
      content:
        ".marketing-header { position: static !important; } html body .skip-link { display: none !important; visibility: hidden !important; opacity: 0 !important; }",
    });
    await page.locator('a[href="#main-content"]').evaluateAll((links) => {
      for (const link of links) link.remove();
    });

    const hero = page.locator(".marketing-page-hero").first();
    const metrics = await hero.evaluate((region) => {
      const bounds = region.getBoundingClientRect();
      const copy = region.querySelector(".marketing-page-hero__copy")?.getBoundingClientRect();
      const proof = region
        .querySelector("[data-pricing-qualification-map], .marketing-page-hero__aside")
        ?.getBoundingClientRect();
      const actions = [...region.querySelectorAll("a")].map((action) => {
        const actionBounds = action.getBoundingClientRect();
        return { height: actionBounds.height, width: actionBounds.width };
      });
      const textSizes = [...region.querySelectorAll("*")]
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length > 0 &&
            !element.closest('[aria-hidden="true"]'),
        )
        .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

      return {
        actions,
        copy: copy
          ? { bottom: copy.bottom, left: copy.left, right: copy.right, top: copy.top }
          : null,
        height: bounds.height,
        left: bounds.left,
        proof: proof
          ? {
              bottom: proof.bottom,
              height: proof.height,
              left: proof.left,
              right: proof.right,
              top: proof.top,
              width: proof.width,
            }
          : null,
        right: bounds.right,
        smallestText: Math.min(...textSizes),
      };
    });

    results.push({
      documentHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      errors,
      hero: metrics,
      horizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      httpStatus: response?.status() ?? null,
      phase,
      viewport: viewport.label,
    });

    await hero.screenshot({
      animations: "disabled",
      path: join(outputDirectory, `cennik-hero-${viewport.label}.png`),
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
