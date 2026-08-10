import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.MARKETING_AUDIT_BASE_URL ?? "http://127.0.0.1:3100";
const outputDirectory = join(
  process.cwd(),
  "artifacts",
  "visual-qa",
  "marketing-subpages-v1",
  "audit",
);

const routes = [
  ["/produkt", "produkt"],
  ["/jak-dziala", "jak-dziala"],
  ["/cennik", "cennik"],
  ["/dla-agencji", "dla-agencji"],
  ["/wordpress", "wordpress"],
  ["/branze", "branze"],
  ["/branze/meble-na-wymiar", "branze-meble-na-wymiar"],
  ["/branze/ogrodzenia", "branze-ogrodzenia"],
  ["/branze/strony-internetowe", "branze-strony-internetowe"],
  ["/branze/klimatyzacja", "branze-klimatyzacja"],
  ["/branze/remonty", "branze-remonty"],
  ["/funkcje", "funkcje"],
  ["/funkcje/kalkulator-wyceny", "funkcje-kalkulator-wyceny"],
  ["/funkcje/formularz-wieloetapowy", "funkcje-formularz-wieloetapowy"],
  ["/funkcje/kwalifikacja-leadow", "funkcje-kwalifikacja-leadow"],
  ["/funkcje/lead-scoring", "funkcje-lead-scoring"],
  ["/funkcje/widget-na-strone", "funkcje-widget-na-strone"],
  ["/polityka-prywatnosci", "polityka-prywatnosci"],
  ["/regulamin", "regulamin"],
];

const viewports = [
  { height: 1000, label: "desktop", width: 1440 },
  { height: 844, label: "mobile", width: 390 },
];

const results = [];

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const viewportDirectory = join(outputDirectory, viewport.label);
    await mkdir(viewportDirectory, { recursive: true });

    const context = await browser.newContext({
      colorScheme: "light",
      locale: "pl-PL",
      viewport,
    });

    for (const [path, slug] of routes) {
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

      const metrics = await page.evaluate(() => {
        const main = document.querySelector("main");
        const scope = main ?? document.body;
        const elements = [...scope.querySelectorAll("*")];
        const visibleLinks = [...scope.querySelectorAll("a")]
          .filter((link) => {
            const style = getComputedStyle(link);
            return style.display !== "none" && style.visibility !== "hidden";
          })
          .map((link) => ({
            className: typeof link.className === "string" ? link.className : "",
            href: link.getAttribute("href"),
            text: link.textContent?.trim().replace(/\s+/g, " ") ?? "",
          }))
          .filter((link) => link.text.length > 0);

        return {
          documentHeight: document.documentElement.scrollHeight,
          h1: [...scope.querySelectorAll("h1")].map((heading) => heading.textContent?.trim() ?? ""),
          h2: [...scope.querySelectorAll("h2")].map((heading) => heading.textContent?.trim() ?? ""),
          horizontalOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          mainClassName: main?.className ?? "",
          sectionClassNames: [...scope.querySelectorAll("section")].map((section) =>
            typeof section.className === "string" && section.className.length > 0
              ? section.className
              : "(none)",
          ),
          sectionCount: scope.querySelectorAll("section").length,
          smallTextCount: elements.filter((element) => {
            const size = Number.parseFloat(getComputedStyle(element).fontSize);
            return Number.isFinite(size) && size > 0 && size < 14;
          }).length,
          title: document.title,
          visibleLinks,
        };
      });

      const result = {
        errors,
        httpStatus: response?.status() ?? null,
        path,
        slug,
        viewport: viewport.label,
        viewportHeight: viewport.height,
        viewportWidth: viewport.width,
        ...metrics,
      };

      results.push(result);
      console.log(
        `${viewport.label} ${path}: ${String(result.httpStatus)}, sections=${result.sectionCount}, height=${result.documentHeight}, overflow=${result.horizontalOverflow}, errors=${errors.length}`,
      );

      await page.screenshot({
        animations: "disabled",
        fullPage: true,
        path: join(viewportDirectory, `${slug}.png`),
      });
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(join(outputDirectory, "metrics.json"), `${JSON.stringify(results, null, 2)}\n`);
