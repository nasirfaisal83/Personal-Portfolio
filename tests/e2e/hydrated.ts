import { expect, type Page } from "@playwright/test";

/**
 * Until hydration each stage is in the markup twice (wide and narrow), so one
 * stage per screen means React has taken over and the buttons will respond.
 */
export async function hydrated(page: Page) {
  const screens = page.locator(".screen");
  await expect(screens.first()).toBeVisible();
  for (const screen of await screens.all()) {
    await expect(screen.locator("svg.screen__stage")).toHaveCount(1);
  }
}
