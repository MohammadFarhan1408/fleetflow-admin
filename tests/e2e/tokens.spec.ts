import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const colorScheme of ["light", "dark"] as const) {
  test(`token showcase has no serious or critical axe violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/dev/tokens");
    await expect(page.getByRole("heading", { level: 1, name: "Design tokens" })).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");

    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test("theme toggle overrides the system theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/dev/tokens");
  const bodyBackground = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const lightBackground = await bodyBackground();

  await page.getByRole("button", { name: "dark" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await bodyBackground()).not.toBe(lightBackground);
});

test("confirm dialog closes on Escape and returns focus to its trigger", async ({ page }) => {
  await page.goto("/dev/tokens");
  const trigger = page.getByRole("button", { name: "Open confirm dialog" });

  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Cancel route R-0412?" })).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});
