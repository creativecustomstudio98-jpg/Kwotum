import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-how-r3-c.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R3_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r3-c",
  phase,
);
const viewports = [
  { height: 1_000, label: "1440", width: 1_440 },
  { height: 1_000, label: "768", width: 768 },
  { height: 932, label: "430", width: 430 },
  { height: 844, label: "390", width: 390 },
  { height: 844, label: "320", width: 320 },
];
const sectionSelectors = [
  "#how-it-works-hero",
  "#proces",
  "#proces-dalszy",
  "#bezpieczenstwo",
  "#how-final-cta",
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ colorScheme: "light", locale: "pl-PL", viewport });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

    const response = await page.goto(`${baseUrl}/jak-dziala?qa=r3-c-${phase}`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({
      content:
        ".marketing-header { position: static !important; } html body .skip-link { display: none !important; visibility: hidden !important; opacity: 0 !important; }",
    });
    await page.locator('a[href="#main-content"]').evaluateAll((links) => {
      for (const link of links) link.remove();
    });

    const metrics = await page.evaluate((selectors) => {
      const bounds = (element) => {
        const rectangle = element.getBoundingClientRect();
        return {
          bottom: rectangle.bottom,
          height: rectangle.height,
          left: rectangle.left,
          right: rectangle.right,
          top: rectangle.top,
          width: rectangle.width,
        };
      };

      return {
        cards: {
          first: [...document.querySelectorAll(".process-stage-card")].map(bounds),
          outcome: [...document.querySelectorAll(".process-outcome-card")].map(bounds),
          security: [...document.querySelectorAll(".security-model__layers > li")].map(bounds),
        },
        sections: Object.fromEntries(
          selectors.map((selector) => {
            const element = document.querySelector(selector);
            return [selector, element ? bounds(element) : null];
          }),
        ),
      };
    }, sectionSelectors);

    results.push({
      documentHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      errors,
      horizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      httpStatus: response?.status() ?? null,
      metrics,
      phase,
      viewport: viewport.label,
    });

    if (["1440", "390", "320"].includes(viewport.label)) {
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `jak-dziala-full-${viewport.label}.png`),
      });
    }

    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
