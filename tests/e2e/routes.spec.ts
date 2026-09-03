import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SLUGS = [
  "order-saga",
  "rag-document-qa",
  "tech-news-agent",
  "emergency-alert-system",
  "con-detection",
];

test.describe("case-study routes", () => {
  for (const slug of SLUGS) {
    test(`/projects/${slug} renders as a deep link`, async ({ page }) => {
      await page.goto(`/projects/${slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Design decisions" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Stack" })).toBeVisible();
      // R2.2 — the hero sequence belongs to the home route only.
      await expect(page.locator(".hero__ascii")).toHaveCount(0);
    });
  }

  test("back and forward navigation works", async ({ page }) => {
    await page.goto("/");
    await page.locator("#project-order-saga").scrollIntoViewIfNeeded();
    await page.getByRole("link", { name: "Read the case study" }).first().click();
    await expect(page).toHaveURL(/\/projects\/order-saga\/?$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/projects\/order-saga\/?$/);
  });

  test("a case study passes an axe scan", async ({ page }) => {
    await page.goto("/projects/rag-document-qa/");
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});

test.describe("responsive", () => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("interactive targets are at least 44px tall", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/");
    const boxes = await page.locator(".btn, .screen-btn, .nav__toggle").all();
    for (const box of boxes) {
      const size = await box.boundingBox();
      if (size) expect(size.height).toBeGreaterThanOrEqual(43);
    }
  });
});
