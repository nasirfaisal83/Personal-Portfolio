import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("home page", () => {
  test("shows who this is above the fold", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Faisal Nasir" })).toBeVisible();
    await expect(
      page.getByText("CS student at Ben-Gurion University of the Negev (expected graduation 2028)"),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "See the projects" })).toBeVisible();
  });

  test("hero text is real, selectable DOM text", async ({ page }) => {
    await page.goto("/");
    const text = await page.locator("h1").innerText();
    expect(text).toBe("Faisal Nasir");
    await expect(page.locator("h1 canvas, h1 img")).toHaveCount(0);
  });

  test("never renders a placeholder token", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).not.toContainText("TODO_");
  });

  test("passes an axe scan with no serious or critical violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test("the skip link is the first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to projects");
  });

  test("the hero sequence resolves within 1.6 s and does not replay", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    // R2.1 — the README state is shown, then it resolves into the vector map.
    await expect(page.locator(".hero__ascii")).toBeVisible({ timeout: 900 });
    await expect(page.locator(".hero__ascii")).toHaveCount(0, { timeout: 1600 });
    expect(Date.now() - start).toBeLessThan(2600);

    // R2.2 — a reload inside the same session goes straight to the running state.
    await page.reload();
    await expect(page.locator(".hero__map")).toBeVisible();
    await expect(page.locator(".hero__ascii")).toHaveCount(0);
  });

  test("a hero node moves focus to that project's heading", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Go to order-saga" }).click();
    await expect(page.locator("#project-order-saga")).toBeFocused();
  });

  test("the nav underlines the section in view", async ({ page }) => {
    await page.goto("/");
    await page.locator("#skills").scrollIntoViewIfNeeded();
    await expect(page.locator('.nav__links a[aria-current="true"]')).toHaveText("Skills");
  });

  test("lists the five projects in the designed order", async ({ page }) => {
    await page.goto("/");
    const titles = await page.locator(".project h3").allInnerTexts();
    expect(titles).toEqual([
      "Order-Saga",
      "rag-document-qa",
      "tech-news-agent",
      "Emergency-Alert-System",
      "con-Detection",
    ]);
  });

  test("shows no proficiency bars or percentages in the skills list", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#skills")).toBeVisible();
    const section = page.locator("section:has(#skills)");
    await expect(section.locator("progress, meter")).toHaveCount(0);
    await expect(section).not.toContainText("%");
  });

  test("copying the email confirms and reverts", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are chromium-only here");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy email" })).toBeVisible({ timeout: 4000 });
  });
});
