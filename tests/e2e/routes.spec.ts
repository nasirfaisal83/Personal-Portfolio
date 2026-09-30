import { expect, test, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { onSite, visibleSlugs as SLUGS } from "./content";
import { hydrated } from "./hydrated";

/** The project a single-page test uses: its usual one if that is on the site. */
const preferred = (slug: string) => (onSite(slug) ? slug : SLUGS[0]);

/** Each element's opacity as painted: its own times every ancestor's. */
function paintedOpacity(elements: Locator) {
  return elements.evaluateAll((list) =>
    list.map((el) => {
      let opacity = 1;
      for (let node: Element | null = el; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
      }
      return { text: el.textContent?.trim().slice(0, 40), opacity };
    }),
  );
}

test.describe("case-study routes", () => {
  for (const slug of SLUGS) {
    test(`/projects/${slug} renders as a deep link`, async ({ page }) => {
      await page.goto(`/projects/${slug}/`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Design decisions" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Stack" })).toBeVisible();
      // The project's diagram runs here, and only here.
      await expect(page.locator("figure.screen")).toHaveCount(1);
    });
  }

  test("back and forward navigation works", async ({ page }) => {
    const first = new RegExp(`/projects/${SLUGS[0]}/?$`);
    await page.goto("/");
    await hydrated(page);
    // The featured card says "Read the case study", a grid card "Case study".
    const card = page.locator(".project", { has: page.locator(`#project-${SLUGS[0]}`) });
    await card.scrollIntoViewIfNeeded();
    await card.getByRole("link", { name: /case study/i }).click();
    await expect(page).toHaveURL(first);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(first);
  });

  test("a case study passes an axe scan", async ({ page }) => {
    await page.goto(`/projects/${preferred("rag-document-qa")}/`);
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

  // Pills (hero, nav, contact, its copy and icon buttons), the nav toggle, the
  // project cards' links and the screen buttons of a case study.
  const TARGETS = ".pill, .nav__toggle, .project__cta a, .project__footer a, .screen-btn";
  for (const path of ["/", `/projects/${preferred("order-saga")}/`]) {
    test(`interactive targets on ${path} are at least 44px tall at 390px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(path);
      await hydrated(page);
      const boxes = await page.locator(TARGETS).evaluateAll((elements) =>
        elements
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => {
            const box = el.getBoundingClientRect();
            return {
              name: el.getAttribute("aria-label") ?? el.textContent?.trim().slice(0, 30),
              height: box.height,
              // An icon-only control must be a square target, not a sliver.
              width: el.textContent?.trim() ? 44 : box.width,
            };
          }),
      );
      expect(boxes.length).toBeGreaterThan(0);
      for (const box of boxes) {
        expect(box.height, `${box.name} height`).toBeGreaterThanOrEqual(43);
        expect(box.width, `${box.name} width`).toBeGreaterThanOrEqual(43);
      }
    });
  }

  test("screen buttons wrap onto rows instead of scrolling at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const slug of SLUGS) {
      await page.goto(`/projects/${slug}/`);
      await hydrated(page);
      const hidden = await page
        .locator(".screen__controls")
        .evaluateAll((rows) => rows.map((row) => row.scrollWidth - row.clientWidth));
      expect(hidden, slug).toHaveLength(1);
      for (const extra of hidden) expect(extra, slug).toBeLessThanOrEqual(1);
    }
  });

  test("a case study doesn't shift as it hydrates at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/projects/${preferred("order-saga")}/`);
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
    { slug: "salon", button: "Two customers, one slot", text: "409 SLOT_CONFLICT" },
    { slug: "salon", button: "Reschedule", text: "replacement CONFIRMED" },
    { slug: "order-saga", button: "Fail payment", text: "stock released" },
    { slug: "rag-document-qa", button: "Ask a question", text: "Chunk 7, page 2" },
    { slug: "tech-news-agent", button: "Run pipeline", text: "[UNVERIFIED]" },
    { slug: "emergency-alert-system", button: "Broadcast an alert", text: "Fire in Berlin" },
  ].filter((ending) => onSite(ending.slug));
  for (const width of [390, 1440]) {
    for (const ending of endings) {
      test(`${ending.slug} "${ending.button}" keeps its text inside the stage at ${width}px`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/projects/${ending.slug}/`);
        await hydrated(page);
        const figure = page.locator("figure.screen");
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

  test("the home page shows every section and, on a phone, the section links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    // The scroll reveal must not hide anything when it can never run.
    const headings = page.locator("main h2");
    expect(await headings.count()).toBeGreaterThanOrEqual(4);
    for (const heading of await headings.all()) await expect(heading).toBeVisible();
    for (const shown of await paintedOpacity(page.locator("main h2, main .reveal"))) {
      expect(shown.opacity, shown.text).toBe(1);
    }
    await expect(
      page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Skills" }),
    ).toBeVisible();
  });

  test("a case study on a phone gets the narrow diagram", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/projects/${preferred("order-saga")}/`);
    const shown = await page
      .locator("svg.screen__stage")
      .evaluateAll((stages) =>
        stages
          .filter((stage) => getComputedStyle(stage).display !== "none")
          .map((stage) => Number(stage.getAttribute("viewBox")?.split(" ")[2])),
      );
    // Both layouts are in the markup; CSS shows the 360-wide one.
    expect(shown).toEqual([360]);
    await expect(page.locator("figure.screen .js-off-note")).toBeVisible();
  });
});
