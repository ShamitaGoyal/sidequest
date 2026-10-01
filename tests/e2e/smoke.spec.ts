import { expect, test } from "@playwright/test";

test("T-E2E-00 landing page loads with the wordmark", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("sidequest").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
