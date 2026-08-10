import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const artifactDirectory = path.resolve("artifacts/visual-qa/12s-remaining-screens/after");

const authScreens = [
  { heading: "Logowanie do konta", name: "auth-login", path: "/logowanie" },
  { heading: "Utwórz nowe konto", name: "auth-register", path: "/rejestracja" },
  { heading: "Nie pamiętasz hasła?", name: "auth-recovery", path: "/nie-pamietasz-hasla" },
  { heading: "Link jest nieważny lub wygasł", name: "auth-reset-expired", path: "/reset-hasla" },
] as const;

test.beforeAll(async () => {
  await mkdir(artifactDirectory, { recursive: true });
});

test("auth screens keep the Kwotum hierarchy on desktop and mobile", async ({ page }) => {
  test.slow();

  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ height: 1_024, width: 1_536 });
  for (const screen of authScreens) {
    await page.goto(screen.path);
    await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
    await expect(page.locator(".auth-brand").first()).toContainText("Kwotum");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${screen.name} desktop overflow`).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      path: path.join(artifactDirectory, `${screen.name}-1536x1024.png`),
    });
  }

  await page.goto("/logowanie");
  const password = page.getByLabel("Hasło", { exact: true });
  await password.fill("Sekret123");
  await page.getByRole("button", { name: "Pokaż hasło" }).press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ukryj hasło" }).press("Enter");
  await expect(password).toHaveAttribute("type", "password");
  await expect(page.getByRole("link", { name: "Nie pamiętasz hasła?" })).toHaveAttribute(
    "href",
    "/nie-pamietasz-hasla",
  );

  await page.setViewportSize({ height: 844, width: 390 });
  for (const screen of authScreens) {
    await page.goto(screen.path);
    await expect(page.getByRole("heading", { level: 1, name: screen.heading })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `${screen.name} mobile overflow`).toBeLessThanOrEqual(1);
    await page.screenshot({
      animations: "disabled",
      fullPage: true,
      path: path.join(artifactDirectory, `${screen.name}-390x-full.png`),
    });

    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations, `${screen.name} accessibility`).toEqual([]);
  }

  expect(errors).toEqual([]);
});
