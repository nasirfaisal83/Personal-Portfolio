import { expect, type Page } from "@playwright/test";

/**
 * Waits until React has taken over, so buttons respond to clicks.
 *
 * RevealObserver in the root layout sets `data-hydrated` on <html> once it has
 * run. A screen is its own lazily loaded chunk and can hydrate a moment later:
 * until then its stage is in the markup twice (wide and narrow), so one stage
 * per screen means that screen has taken over too. The home page has no
 * screens; the case-study pages have one each.
 */
export async function hydrated(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  for (const screen of await page.locator("figure.screen").all()) {
    await expect(screen.locator("svg.screen__stage")).toHaveCount(1);
  }
}
