import { expect, test } from "@playwright/test";

for (const viewport of [{ name: "375", width: 375, height: 812 }, { name: "768", width: 768, height: 1024 }, { name: "1280", width: 1280, height: 900 }]) {
  test(`redesign home and detail at ${viewport.name}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "다시 가고 싶은 그 집을 찾아요." })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(150);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `.omo/evidence/redesign-home-${viewport.name}.png`, fullPage: true });
    await page.getByRole("button", { name: "채널 선택 열기" }).click();
    await expect(page.getByRole("dialog", { name: "채널 선택" })).toBeVisible();
    await page.screenshot({ path: `.omo/evidence/redesign-sheet-${viewport.name}.png`, fullPage: false });
    await page.getByRole("button", { name: "적용하기" }).click();
    await page.getByRole("link", { name: /대림국수/ }).click();
    await page.waitForURL(/\/restaurants\/golden-noodle-01$/);
    await expect(page.getByRole("heading", { name: "대림국수" })).toBeVisible();
    await expect(page.getByRole("link", { name: /또간집/ }).first()).toBeVisible();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `.omo/evidence/redesign-detail-${viewport.name}.png`, fullPage: true });
  });
}
