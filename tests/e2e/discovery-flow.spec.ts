import { expect, test } from "@playwright/test";

test("search, channel sheet, and restaurant detail remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("textbox", { name: "식당이나 동네 검색" }).fill("대림");
  await expect(page.getByRole("region", { name: "맛집 목록" }).getByRole("heading", { name: "대림국수" })).toBeVisible();
  await expect(page.getByRole("region", { name: "맛집 목록" }).getByRole("heading", { name: "할매곱창" })).not.toBeVisible();
  await page.getByRole("button", { name: "채널 선택 열기" }).click();
  await expect(page.getByRole("dialog", { name: "채널 선택" })).toBeVisible();
  await page.getByRole("button", { name: "적용하기" }).click();
  await page.getByRole("link", { name: /대림국수/ }).click();
  await expect(page).toHaveURL(/\/restaurants\/golden-noodle-01$/);
  await expect(page.getByRole("heading", { name: "대림국수" })).toBeVisible();
  await expect(page.getByRole("button", { name: "네이버지도에서 보기" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "영상에서 이렇게 소개됐어요" })).toBeVisible();
});
