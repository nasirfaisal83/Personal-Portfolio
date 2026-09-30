import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { visibleTitles } from "./content";
import { hydrated } from "./hydrated";

/** Scrolls to the bottom a viewport at a time, so every scroll reveal gets its turn. */
async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
}

test.describe("home page", () => {
  test("shows who this is above the fold", async ({ page }) => {
    await page.goto("/");
    // R1.1 — name, role line and the primary action sit in the first viewport.
    const name = page.getByRole("heading", { level: 1, name: "Faisal Nasir" });
    await expect(name).toBeVisible();
    await expect(name).toBeInViewport();
    const role = page.getByText(
      "CS student at Ben-Gurion University of the Negev (expected graduation 2028)",
    );
    await expect(role).toBeVisible();
    await expect(role).toBeInViewport();
    const cta = page.getByRole("link", { name: "See the projects" });
    await expect(cta).toBeVisible();
    await expect(cta).toBeInViewport();
  });

  test("hero text is real, selectable DOM text", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    // One word per line, and a decorative full stop after the last one.
    const text = (await h1.innerText()).replace(/\s+/g, " ").trim().replace(/\.$/, "");
    expect(text).toBe("Faisal Nasir");
    // The full stop is hidden from assistive technology.
    await expect(h1).toHaveAccessibleName("Faisal Nasir");
    await expect(page.locator("h1 canvas, h1 img, h1 svg")).toHaveCount(0);
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

  test("the home page runs no diagrams; they live on the case studies", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    await expect(page.locator("figure.screen")).toHaveCount(0);
  });

  test("the nav underlines the section in view", async ({ page }) => {
    await page.goto("/");
    await page.locator("#skills").scrollIntoViewIfNeeded();
    await expect(page.locator('.nav__links a[aria-current="true"]')).toHaveText("Skills");
  });

  test("lists the projects on the site in the content file's order", async ({ page }) => {
    await page.goto("/");
    // The featured card first, then the grid, in page order.
    const titles = await page.locator(".projects .project__title").allInnerTexts();
    expect(titles).toEqual(visibleTitles);
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
    await hydrated(page);
    await page.getByRole("button", { name: "Copy email" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "nasirfaisal83@gmail.com",
    );
    await expect(page.getByRole("button", { name: "Copy email" })).toBeVisible({ timeout: 4000 });
  });

  for (const width of [390, 1440]) {
    test(`no horizontal overflow at ${width}px once scrolled to the bottom`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await hydrated(page);
      await scrollToBottom(page);
      // Let the last reveals finish moving.
      await page.waitForTimeout(1000);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.locator(".footer")).toBeInViewport();
    });
  }
});

test.describe("reduced motion", () => {
  // `test.use({ reducedMotion })` doesn't reach matchMedia in this setup; emulateMedia does.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("every scroll-reveal section is fully shown without scrolling", async ({ page }) => {
    await page.goto("/");
    await hydrated(page);
    // RevealObserver is on, so the hidden start state would apply if motion allowed it.
    await expect(page.locator("html")).toHaveAttribute("data-reveal", "on");
    const reveals = page.locator(".reveal");
    expect(await reveals.count()).toBeGreaterThan(0);
    const states = await reveals.evaluateAll((elements) =>
      elements.map((el) => {
        const style = getComputedStyle(el);
        return {
          name: `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`,
          opacity: style.opacity,
          moved:
            style.transform !== "none" || (style.translate !== "none" && style.translate !== ""),
        };
      }),
    );
    for (const state of states) {
      expect(state, state.name).toMatchObject({ opacity: "1", moved: false });
    }
  });
});
