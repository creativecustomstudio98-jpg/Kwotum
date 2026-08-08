import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.MARKETING_AGENCY_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r5-4",
  "after",
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

    const response = await page.goto(`${baseUrl}/dla-agencji?qa=r5-4`, {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({
      content:
        ".marketing-header { position: static !important; } html body .wy-skip-link, nextjs-portal { display: none !important; visibility: hidden !important; opacity: 0 !important; }",
    });

    const isolation = page.locator("[data-agency-isolation]");
    const metrics = await isolation.evaluate((section) => {
      const measure = (element) => {
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
      const textSizes = [...section.querySelectorAll("*")]
        .filter(
          (element) =>
            element.textContent?.trim() &&
            element.getClientRects().length > 0 &&
            !element.closest('[aria-hidden="true"]'),
        )
        .map((element) => Number.parseFloat(getComputedStyle(element).fontSize));

      return {
        comparison: measure(section.querySelector("figure > div")),
        contract: measure(section.querySelector("ol")),
        heading: measure(section.querySelector("header")),
        host: measure(section.querySelector('[aria-label="Style strony klienta"]')),
        proof: measure(section.querySelector("[data-agency-isolation-proof]")),
        section: measure(section),
        shadow: measure(
          section.querySelector('[aria-label="Widget odizolowany przez Shadow DOM"]'),
        ),
        smallestText: Math.min(...textSizes),
        widget: measure(
          section.querySelector(
            '[aria-label="Widget odizolowany przez Shadow DOM"] > div:last-child',
          ),
        ),
      };
    });

    results.push({
      documentHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      errors,
      horizontalOverflow: await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
      httpStatus: response?.status() ?? null,
      regions: metrics,
      viewport: viewport.label,
    });

    await isolation.screenshot({
      animations: "disabled",
      path: join(outputDirectory, `dla-agencji-isolation-${viewport.label}.png`),
    });

    if (viewport.label === "1440" || viewport.label === "390") {
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `dla-agencji-full-${viewport.label}.png`),
      });
    }

    await page.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
