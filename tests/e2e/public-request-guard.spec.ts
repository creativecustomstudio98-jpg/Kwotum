import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const organizationId = process.env.PANEL_E2E_ORGANIZATION_ID;
const panelEmail = process.env.PANEL_E2E_EMAIL;
const panelPassword = process.env.PANEL_E2E_PASSWORD;
const flowId = process.env.PANEL_E2E_FLOW_ID;
const artifactRoot = process.env.PANEL_E2E_ARTIFACT_ROOT
  ? path.resolve(process.env.PANEL_E2E_ARTIFACT_ROOT)
  : path.resolve("artifacts/visual-qa");
const artifactDirectory = path.join(artifactRoot, "13b-ftz03a-public-guard");

async function signIn(page: Page) {
  if (!organizationId || !panelEmail || !panelPassword) {
    throw new Error("Brak danych lokalnego konta panel E2E.");
  }
  await page.goto(`/logowanie?next=/panel/${organizationId}`);
  await page.getByLabel("Adres e-mail").fill(panelEmail);
  await page.getByLabel("Hasło", { exact: true }).fill(panelPassword);
  await page.getByRole("button", { exact: true, name: "Zaloguj się" }).click();
  await page.waitForURL((url) => url.pathname.startsWith(`/panel/${organizationId}`));
  await expect(page.locator(".panel-app-shell")).toBeVisible();
}

test("origin configuration and public API guard are tenant-scoped", async ({ page, request }) => {
  test.skip(
    !organizationId || !panelEmail || !panelPassword || !flowId,
    "Lokalny test panelu wymaga PANEL_E2E_*.",
  );
  test.setTimeout(90_000);
  await mkdir(artifactDirectory, { recursive: true });
  await signIn(page);

  await page.setViewportSize({ height: 1_024, width: 1_536 });
  await page.goto(`/panel/${organizationId}/procesy/${flowId}/instalacja`);
  await expect(page.getByRole("heading", { name: "Dozwolone domeny" })).toBeVisible();
  const allowedOriginsForm = page.locator(".allowed-origins-form");
  await allowedOriginsForm.scrollIntoViewIfNeeded();
  const beforeStyle = await page.addStyleTag({
    content: ".allowed-origins-form { visibility: hidden; }",
  });
  const beforePath = path.join(artifactDirectory, "before.png");
  await page.screenshot({ animations: "disabled", path: beforePath });
  await copyFile(beforePath, path.join(artifactDirectory, "reference.png"));
  await beforeStyle.evaluate((style) => style.remove());
  const originInput = page.getByLabel("Originy witryn — po jednym w wierszu");
  await originInput.fill("https://example.test\nhttps://www.example.test");
  await page.getByRole("button", { name: "Zapisz domeny" }).click();
  await expect(page.locator(".allowed-origins-form .panel-form-success")).toContainText(
    "Dozwolone domeny zostały zapisane",
  );
  await page.reload();
  await expect(originInput).toHaveValue("https://example.test\nhttps://www.example.test");
  await allowedOriginsForm.scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    animations: "disabled",
    path: path.join(artifactDirectory, "after.png"),
  });

  const hostedLink = await page.locator(".sharing-panel__link code").textContent();
  const publicId = hostedLink?.split("/f/")[1];
  expect(publicId).toMatch(/^[a-f0-9-]{36}$/u);
  const manifestUrl = `http://127.0.0.1:3100/api/v1/public/flows/${publicId}/manifest`;
  const allowedHeaders = { Origin: "https://example.test", "X-Forwarded-For": "203.0.113.21" };
  const allowed = await request.get(manifestUrl, { headers: allowedHeaders });
  expect(allowed.status()).toBe(200);
  expect(allowed.headers()["access-control-allow-origin"]).toBe("https://example.test");
  expect(allowed.headers().vary).toContain("Origin");

  const blocked = await request.get(manifestUrl, {
    headers: { Origin: "https://blocked.example.test", "X-Forwarded-For": "203.0.113.22" },
  });
  expect(blocked.status()).toBe(403);
  expect(blocked.headers()["access-control-allow-origin"]).toBeUndefined();

  const preflight = await request.fetch(manifestUrl, {
    headers: allowedHeaders,
    method: "OPTIONS",
  });
  expect(preflight.status()).toBe(204);
  expect(preflight.headers()["access-control-allow-origin"]).toBe("https://example.test");

  const sessionUrl = `http://127.0.0.1:3100/api/v1/public/flows/${publicId}/sessions`;
  let limitedResponse = await request.post(sessionUrl, { headers: allowedHeaders });
  for (let attempt = 2; attempt <= 21; attempt += 1) {
    limitedResponse = await request.post(sessionUrl, { headers: allowedHeaders });
  }
  expect(limitedResponse.status()).toBe(429);
  expect(Number(limitedResponse.headers()["retry-after"])).toBeGreaterThan(0);

  await page.setViewportSize({ height: 844, width: 390 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Dozwolone domeny" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page.screenshot({
    animations: "disabled",
    fullPage: true,
    path: path.join(artifactDirectory, "mobile-390x-full.png"),
  });
});
