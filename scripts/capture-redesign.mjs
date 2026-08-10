import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const phase = process.argv[2];

if (phase !== "before" && phase !== "after") {
  throw new Error("Usage: node scripts/capture-redesign.mjs <before|after>");
}

const baseUrl = process.env.REDESIGN_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(process.cwd(), "artifacts", "redesign", phase);
const routes = [
  ["/", "landing"],
  ["/produkt", "produkt"],
  ["/jak-dziala", "jak-dziala"],
  ["/cennik", "cennik"],
  ["/dla-agencji", "dla-agencji"],
  ["/wordpress", "wordpress"],
  ["/funkcje", "funkcje"],
  ["/branze", "branze"],
  ["/logowanie", "logowanie"],
  ["/design-system", "design-system"],
  ["/nie-istnieje", "not-found"],
];
const viewports = [
  { height: 1000, label: "1440", width: 1440 },
  { height: 960, label: "1280", width: 1280 },
  { height: 900, label: "1024", width: 1024 },
  { height: 900, label: "768", width: 768 },
  { height: 844, label: "390", width: 390 },
  { height: 760, label: "320", width: 320 },
];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      colorScheme: "light",
      locale: "pl-PL",
      viewport,
    });

    for (const [path, name] of routes) {
      const page = await context.newPage();
      const errors = [];

      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(`console: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => {
        errors.push(`page: ${error.message}`);
      });

      const response = await page.goto(`${baseUrl}${path}`, {
        waitUntil: "networkidle",
      });
      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(outputDirectory, `${name}-${viewport.label}.png`),
      });

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      const status = response?.status() ?? "redirected";

      console.log(
        `${phase} ${viewport.label} ${path}: ${status}, overflow=${String(overflow)}, errors=${errors.length}`,
      );

      if (errors.length > 0) {
        console.log(errors.join("\n"));
      }

      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}
