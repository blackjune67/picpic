import { expect, test } from "@playwright/test";

test("desktop split view selects a preview without leaving discovery", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const preview = page.getByRole("region", { name: "맛집 상세 미리보기" });
  await expect(preview).toBeVisible();
  await expect(preview.getByRole("heading", { name: "대림국수" })).toBeVisible();

  await page.getByRole("button", { name: /할매곱창 선택/ }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:3100\/$/);
  await expect(preview).toContainText("할매곱창");
  await page.screenshot({ path: ".omo/evidence/task-02-split/desktop-master-detail.png", fullPage: true });
});

test("mobile split view stacks preview without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const preview = page.getByRole("region", { name: "맛집 상세 미리보기" });
  await page.getByRole("button", { name: /할매곱창 선택/ }).click();
  await expect(preview).toContainText("할매곱창");
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 375);
  await page.screenshot({ path: ".omo/evidence/task-02-split/mobile-stacked.png", fullPage: true });
});

test("split view keeps a11y state and 320px stress width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/");
  const selected = page.getByRole("button", { name: /대림국수 선택/ });
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await selected.focus();
  await expect(selected).toBeFocused();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
  await page.screenshot({ path: ".omo/evidence/task-02-split/mobile-320-stress.png", fullPage: true });
  if (overflow !== 0) throw new Error(`horizontal overflow: ${overflow}`);
});
