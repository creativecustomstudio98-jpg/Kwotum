import { expect, test } from "@playwright/test";

test.describe("security headers and browser attack surface", () => {
  test("documents and APIs return hardened headers", async ({ request }) => {
    for (const path of ["/", "/api/v1/public/flows/not-a-uuid/manifest"]) {
      const response = await request.get(path);
      expect(response.headers()["content-security-policy"]).toContain("object-src 'none'");
      expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(response.headers()["permissions-policy"]).toContain("camera=()");
      expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(response.headers()["x-content-type-options"]).toBe("nosniff");
      expect(response.headers()["x-frame-options"]).toBe("DENY");
    }
  });

  test("reflected script payload is not rendered as executable markup", async ({ page }) => {
    const payload = "<script>window.__wycenoXss=true</script>";
    await page.goto(`/branze?query=${encodeURIComponent(payload)}`);
    await expect(page.locator("body")).toBeVisible();
    expect(await page.evaluate(() => Reflect.get(window, "__wycenoXss"))).toBeUndefined();
    expect(await page.locator("script").allTextContents()).not.toContain(payload);
  });

  test("public CORS preflight exposes only the documented stateless methods", async ({
    request,
  }) => {
    const response = await request.fetch(
      "/api/v1/public/flows/10000000-0000-4000-8000-000000000001/manifest",
      { method: "OPTIONS" },
    );
    expect(response.status()).toBe(204);
    expect(response.headers()["access-control-allow-origin"]).toBe("*");
    expect(response.headers()["access-control-allow-methods"]).toBe("GET, POST, PUT, OPTIONS");
    expect(response.headers()["access-control-allow-credentials"]).toBeUndefined();
  });
});
