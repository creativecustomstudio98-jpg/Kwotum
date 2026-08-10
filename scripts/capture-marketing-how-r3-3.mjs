import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-how-r3-3.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R3_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r3-3",
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
    const page = await browser.newPage({ colorScheme: "light", locale: "pl-PL", viewport });
    const errors = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`console: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

    const response = await page.goto(`${baseUrl}/jak-dziala`, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content:
        ".marketing-header { position: static !important; } html body .skip-link { display: none !important; visibility: hidden !important; opacity: 0 !important; }",
    });
    await page.locator('a[href="#main-content"]').evaluateAll((links) => {
      for (const link of links) link.remove();
    });

    const section = page.locator("#proces-dalszy");
    const metrics = await section.evaluate((region, currentPhase) => {
      const regionBounds = region.getBoundingClientRect();
      const cardSelector =
        currentPhase === "after"
          ? ".process-second-half__steps > li"
          : ".process-narrative > ol > li";
      const cardBounds = [...region.querySelectorAll(cardSelector)].map((card) =>
        card.getBoundingClientRect(),
      );
      const headingBounds = region.querySelector("h2")?.getBoundingClientRect();

      return {
        cards: cardBounds.map((card) => ({
          height: card.height,
          left: card.left,
          right: card.right,
          top: card.top,
          width: card.width,
        })),
        heading: headingBounds
          ? {
              height: headingBounds.height,
              left: headingBounds.left,
              right: headingBounds.right,
              top: headingBounds.top,
              width: headingBounds.width,
            }
          : null,
        height: regionBounds.height,
      };
    }, phase);

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
      path: join(outputDirectory, `jak-dziala-steps-4-6-${viewport.label}.png`),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
