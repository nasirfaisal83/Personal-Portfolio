import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { hydrated } from "./hydrated";

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

  for (const slug of SLUGS) {
    test(`/projects/${slug} has no horizontal overflow at 360px`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(`/projects/${slug}/`);
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
    await hydrated(page);
    const boxes = await page
      .locator(".btn, .screen-btn, .nav__toggle, .hero__map [role='button']")
      .all();
    for (const box of boxes) {
      const size = await box.boundingBox();
      if (size) expect(size.height).toBeGreaterThanOrEqual(43);
    }
  });

  test("screen buttons wrap onto rows instead of scrolling at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await hydrated(page);
    const hidden = await page
      .locator(".screen__controls")
      .evaluateAll((rows) => rows.map((row) => row.scrollWidth - row.clientWidth));
    expect(hidden).toHaveLength(5);
    for (const extra of hidden) expect(extra).toBeLessThanOrEqual(1);
  });

  test("a case study doesn't shift as it hydrates at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/projects/order-saga/");
    await hydrated(page);
    await page.waitForTimeout(500);
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & {
              value: number;
              hadRecentInput: boolean;
            })[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 100);
        }),
    );
    expect(shift).toBeLessThan(0.1);
  });

  test("the phone menu closes on Escape and on a tap outside", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await hydrated(page);

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("link", { name: "Skills" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("link", { name: "Skills" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("link", { name: "Skills" })).toBeVisible();
    // The left gutter, below the open menu: nothing there but the page.
    await page.mouse.click(4, 700);
    await expect(page.getByRole("link", { name: "Skills" })).toBeHidden();
  });

  // Each scenario ends with its widest artwork on screen: the cards, the answer
  // terminal, the stock label. None of its text may run past the stage.
  const endings = [
    { slug: "order-saga", button: "Fail payment", text: "stock released" },
    { slug: "rag-document-qa", button: "Ask a question", text: "Chunk 7, page 2" },
    { slug: "tech-news-agent", button: "Run pipeline", text: "[UNVERIFIED]" },
    { slug: "emergency-alert-system", button: "Broadcast an alert", text: "Fire in Berlin" },
  ];
  for (const width of [390, 1440]) {
    for (const ending of endings) {
      test(`${ending.slug} keeps its text inside the stage at ${width}px`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/");
        await hydrated(page);
        const figure = page
          .locator(".project", { has: page.locator(`#project-${ending.slug}`) })
          .locator("figure");
        await figure.scrollIntoViewIfNeeded();
        await figure.getByRole("button", { name: ending.button, exact: true }).click();
        await expect(figure.locator("svg text").filter({ hasText: ending.text })).toBeVisible({
          timeout: 20_000,
        });
        const escaped = await figure.locator("svg.screen__stage").evaluate((svg) => {
          const stage = svg.getBoundingClientRect();
          return [...svg.querySelectorAll("text")]
            .filter((text) => {
              const box = text.getBoundingClientRect();
              return (
                box.left < stage.left - 1 ||
                box.right > stage.right + 1 ||
                box.top < stage.top - 1 ||
                box.bottom > stage.bottom + 1
              );
            })
            .map((text) => text.textContent);
        });
        expect(escaped).toEqual([]);
      });
    }
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a phone gets the narrow diagrams and the section links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const shown = await page
      .locator("svg.screen__stage")
      .evaluateAll((stages) =>
        stages
          .filter((stage) => getComputedStyle(stage).display !== "none")
          .map((stage) => Number(stage.getAttribute("viewBox")?.split(" ")[2])),
      );
    // The hero map and the five screens, each in its 360-wide layout.
    expect(shown).toEqual([360, 360, 360, 360, 360, 360]);
    await expect(
      page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Skills" }),
    ).toBeVisible();
  });
});
