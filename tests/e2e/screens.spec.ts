import { expect, test, type Locator, type Page } from "@playwright/test";
import { onSite, visibleSlugs } from "./content";
import { hydrated } from "./hydrated";

/** Diagram text only: the narration list and live region repeat the same words. */
function stageText(scope: Locator, text: string) {
  return scope.locator("svg text").filter({ hasText: new RegExp(`^${text}$`) });
}

async function openScreen(page: Page, slug: string) {
  await page.goto("/");
  // Clicking before hydration does nothing, so wait until React has taken over.
  await hydrated(page);
  const heading = page.locator(`#project-${slug}`);
  await heading.scrollIntoViewIfNeeded();
  return page.locator(".project", { has: heading });
}

test.describe("project screens", () => {
  test("Order-Saga runs each scenario to its documented end state", async ({ page }) => {
    test.skip(!onSite("order-saga"), "order-saga is hidden");
    const section = await openScreen(page, "order-saga");
    const figure = section.locator("figure");

    await section.getByRole("button", { name: "Place order" }).click();
    await expect(stageText(figure, "COMPLETED")).toHaveCount(2, { timeout: 15_000 });

    await section.getByRole("button", { name: "Fail payment" }).click();
    await expect(figure.getByText("stock released")).toBeVisible({ timeout: 15_000 });

    await section.getByRole("button", { name: "Out of stock" }).click();
    await expect(stageText(figure, "FAILED")).toHaveCount(2, { timeout: 15_000 });
  });

  test("Salon lets the database refuse the second booking and never loses a slot", async ({
    page,
  }) => {
    test.skip(!onSite("salon"), "salon is hidden");
    const section = await openScreen(page, "salon");
    const figure = section.locator("figure");

    await section.getByRole("button", { name: "Two customers, one slot" }).click();
    await expect(stageText(figure, "409 SLOT_CONFLICT")).toHaveCount(1, { timeout: 15_000 });

    await section.getByRole("button", { name: "Reschedule" }).click();
    await expect(stageText(figure, "original CANCELLED")).toBeVisible({ timeout: 15_000 });
    await expect(stageText(figure, "replacement CONFIRMED")).toBeVisible();

    await section.getByRole("button", { name: "Nobody approves" }).click();
    await expect(stageText(figure, "deliberately silent")).toBeVisible({ timeout: 15_000 });
  });

  test("every screen exposes its narration as text", async ({ page }) => {
    await page.goto("/");
    for (const slug of visibleSlugs) {
      const section = await openScreen(page, slug);
      await section.getByRole("button", { name: "Show as text" }).click();
      await expect(section.locator("ol li").first()).toBeVisible();
      await section.getByRole("button", { name: "Hide text" }).click();
    }
  });

  test("the STOMP mode toggle reports its pressed state", async ({ page }) => {
    test.skip(!onSite("emergency-alert-system"), "emergency-alert-system is hidden");
    const section = await openScreen(page, "emergency-alert-system");
    const tpc = section.getByRole("button", { name: "tpc", exact: true });
    const reactor = section.getByRole("button", { name: "reactor", exact: true });
    await expect(tpc).toHaveAttribute("aria-pressed", "true");
    await reactor.click();
    await expect(reactor).toHaveAttribute("aria-pressed", "true");
    // The reactor internals are drawn over the server box, not under it.
    await expect(stageText(section, "selector")).toBeVisible();
  });

  test("con-Detection shows no numeric confidence", async ({ page }) => {
    test.skip(!onSite("con-detection"), "con-detection is hidden");
    const section = await openScreen(page, "con-detection");
    await expect(section.getByText("cone").first()).toBeVisible();
    const text = await section.innerText();
    expect(text).not.toMatch(/0\.\d\d/);
    await expect(
      section.getByText("Illustration of the detection loop; the notebook runs the real model."),
    ).toBeVisible();
  });

  test("every screen control is reachable by keyboard", async ({ page }) => {
    const section = await openScreen(page, onSite("order-saga") ? "order-saga" : visibleSlugs[0]);
    const buttons = section.getByRole("button");
    const count = await buttons.count();
    // At least one scenario or play button, plus "Show as text".
    expect(count).toBeGreaterThan(1);
    for (let i = 0; i < count; i += 1) {
      await buttons.nth(i).focus();
      await expect(buttons.nth(i)).toBeFocused();
    }
  });
});

test.describe("reduced motion", () => {
  // `test.use({ reducedMotion })` doesn't reach matchMedia in this setup; emulateMedia does.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("skips the hero sequence and steps scenarios through their states", async ({ page }) => {
    test.skip(!onSite("order-saga"), "order-saga is hidden");
    await page.goto("/");
    await expect(page.locator(".hero__ascii")).toHaveCount(0);

    const section = await openScreen(page, "order-saga");
    await expect(section.getByRole("button", { name: "Play with motion" })).toBeVisible();
    await section.getByRole("button", { name: "Place order" }).click();
    await expect(stageText(section.locator("figure"), "COMPLETED")).toHaveCount(2, {
      timeout: 15_000,
    });
    await expect(section.locator("figure circle[stroke='var(--screen)']")).toHaveCount(0);
  });
});
