import { expect, test } from "@playwright/test";

test("neutral multi-channel design showcase fits a mobile shell", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/design");
  await expect(page.getByRole("heading", { name: "채널이 늘어나도 같은 화면" })).toBeVisible();
  await expect(page.getByRole("button", { name: "전체", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  await page.screenshot({ path: ".omo/evidence/task-2-design.png", fullPage: true });
});
