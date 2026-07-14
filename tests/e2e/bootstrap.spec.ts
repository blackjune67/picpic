import { expect, test } from "@playwright/test";

test("serves the mobile discovery page when the application starts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "전체", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "대림국수" })).toBeVisible();
});
