import { chromium } from "@playwright/test";

const baseUrl = process.env.REDESIGN_BASE_URL ?? "http://127.0.0.1:3100";
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { height: 1000, width: 1440 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const transfer = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    return {
      imageBytes: resources
        .filter((entry) => /\.(?:avif|jpe?g|png|svg|webp)(?:\?|$)/i.test(entry.name))
        .reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      imageRequests: resources.filter((entry) =>
        /\.(?:avif|jpe?g|png|svg|webp)(?:\?|$)/i.test(entry.name),
      ).length,
      scriptBytes: resources
        .filter((entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js"))
        .reduce((sum, entry) => sum + entry.encodedBodySize, 0),
      scriptRequests: resources.filter(
        (entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js"),
      ).length,
    };
  });

  console.log(JSON.stringify(transfer));
} finally {
  await browser.close();
}
