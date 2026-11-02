import { expect, test } from "@playwright/test";

const routes = ["/", "/dashboard", "/medicines", "/schedule", "/family", "/history", "/settings"];

test("mobile routes load without client exceptions", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("body")).not.toBeEmpty();
    if (route !== "/") {
      await expect(page.getByRole("navigation", { name: "Main mobile" })).toBeVisible();
    }
  }

  expect(errors).toEqual([]);
});
