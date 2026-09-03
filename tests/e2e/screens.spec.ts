import { expect, test, type Page } from "@playwright/test";

async function openScreen(page: Page, slug: string) {
  await page.goto("/");
  const heading = page.locator(`#project-${slug}`);
  await heading.scrollIntoViewIfNeeded();
  return page.locator(".project", { has: heading });
}

test.describe("project screens", () => {
  test("Order-Saga runs each scenario to its documented end state", async ({ page }) => {
    const section = await openScreen(page, "order-saga");
    const figure = section.locator("figure");

    await section.getByRole("button", { name: "Place order" }).click();
    await expect(figure.locator("text=COMPLETED")).toHaveCount(2, { timeout: 15_000 });

    await section.getByRole("button", { name: "Fail payment" }).click();
    await expect(figure.getByText("stock released")).toBeVisible({ timeout: 15_000 });

    await section.getByRole("button", { name: "Out of stock" }).click();
    await expect(figure.locator("text=FAILED")).toHaveCount(2, { timeout: 15_000 });
  });

  test("every screen exposes its narration as text", async ({ page }) => {
    await page.goto("/");
    for (const slug of [
      "order-saga",
      "rag-document-qa",
      "tech-news-agent",
      "emergency-alert-system",
      "con-detection",
    ]) {
      const section = await openScreen(page, slug);
      await section.getByRole("button", { name: "Show as text" }).click();
      await expect(section.locator("ol li").first()).toBeVisible();
      await section.getByRole("button", { name: "Hide text" }).click();
    }
  });

  test("the STOMP mode toggle reports its pressed state", async ({ page }) => {
    const section = await openScreen(page, "emergency-alert-system");
    const tpc = section.getByRole("button", { name: "tpc", exact: true });
    const reactor = section.getByRole("button", { name: "reactor", exact: true });
    await expect(tpc).toHaveAttribute("aria-pressed", "true");
    await reactor.click();
    await expect(reactor).toHaveAttribute("aria-pressed", "true");
    await expect(section.getByText("selector")).toBeVisible();
  });

  test("con-Detection shows no numeric confidence", async ({ page }) => {
    const section = await openScreen(page, "con-detection");
    await expect(section.getByText("cone").first()).toBeVisible();
    const text = await section.innerText();
    expect(text).not.toMatch(/0\.\d\d/);
    await expect(
      section.getByText("Illustration of the detection loop; the notebook runs the real model."),
    ).toBeVisible();
  });

  test("every screen control is reachable by keyboard", async ({ page }) => {
    const section = await openScreen(page, "order-saga");
    const buttons = section.getByRole("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(3);
    for (let i = 0; i < count; i += 1) {
      await buttons.nth(i).focus();
      await expect(buttons.nth(i)).toBeFocused();
    }
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("skips the hero sequence and steps scenarios through their states", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero__ascii")).toHaveCount(0);

    const section = await openScreen(page, "order-saga");
    await expect(section.getByRole("button", { name: "Play with motion" })).toBeVisible();
    await section.getByRole("button", { name: "Place order" }).click();
    await expect(section.locator("figure").locator("text=COMPLETED")).toHaveCount(2, {
      timeout: 15_000,
    });
    await expect(section.locator("figure circle[stroke='var(--screen)']")).toHaveCount(0);
  });
});
