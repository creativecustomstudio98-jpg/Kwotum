import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-how-r3-2.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R3_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r3-2",
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
    const section = page.locator("#proces");

    if (phase === "before") {
      await section.locator(".process-narrative li").evaluateAll((steps) => {
        for (const step of steps.slice(3)) {
          step.style.display = "none";
        }
      });
    }

    const metrics = await section.evaluate((region, currentPhase) => {
      const regionBounds = region.getBoundingClientRect();
      const stepSelector =
        currentPhase === "after" ? ".process-first-half__steps > li" : ".process-narrative li";
      const stepBounds = [...region.querySelectorAll(stepSelector)]
        .slice(0, 3)
        .map((step) => step.getBoundingClientRect());
      const headingBounds = region.querySelector("h2")?.getBoundingClientRect();

      return {
        cards: stepBounds.map((step) => ({
          height: step.height,
          left: step.left,
          right: step.right,
          top: step.top,
          width: step.width,
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
      section: {
        cards: metrics.cards,
        heading: metrics.heading,
        height: metrics.height,
      },
      viewport: viewport.label,
    });

    await section.screenshot({
      animations: "disabled",
      path: join(outputDirectory, `jak-dziala-steps-1-3-${viewport.label}.png`),
    });
    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
