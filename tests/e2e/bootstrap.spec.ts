import { expect, test } from "@playwright/test";

test("serves the bootstrap readiness page when the application starts", async ({ page }) => {
  // Given: the Next.js application is running
  // When: a visitor opens the root route
  await page.goto("/");

  // Then: the readiness heading is visible
  await expect(
    page.getByRole("heading", { name: "PicPic bootstrap is ready" }),
  ).toBeVisible();
});
