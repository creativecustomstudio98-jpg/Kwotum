import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-marketing-subpages-r1.mjs <before|after>");
}

const baseUrl = process.env.MARKETING_R1_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "r1",
  phase,
);

const routes = [
  ["/produkt", "produkt"],
  ["/cennik", "cennik"],
  ["/branze/meble-na-wymiar", "branze-meble-na-wymiar"],
  ["/polityka-prywatnosci", "polityka-prywatnosci"],
];
const viewports = [
  { height: 1_000, label: "1440", width: 1_440 },
  { height: 844, label: "390", width: 390 },
];

await mkdir(outputDirectory, { recursive: true });

const results = [];
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      colorScheme: "light",
      locale: "pl-PL",
      viewport,
    });

    for (const [path, slug] of routes) {
      const page = await context.newPage();
      const errors = [];

      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", (error) => errors.push(`page: ${error.message}`));

      const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const measure = (selector) => {
          const bounds = document.querySelector(selector)?.getBoundingClientRect();
          return bounds
            ? {
                height: bounds.height,
                left: bounds.left,
                right: bounds.right,
                top: bounds.top,
                width: bounds.width,
              }
            : null;
        };

        return {
          activeNavigation: document.querySelector('.marketing-nav a[aria-current="page"]')
            ?.textContent,
          breadcrumbs: measure(".marketing-breadcrumbs"),
          documentHeight: document.documentElement.scrollHeight,
          footer: measure(".marketing-footer__shell"),
          header: measure(".marketing-header__inner"),
          horizontalOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      results.push({
        errors,
        httpStatus: response?.status() ?? null,
        path,
        phase,
        viewport: viewport.label,
        ...metrics,
      });

      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `${slug}-${viewport.label}.png`),
      });
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
