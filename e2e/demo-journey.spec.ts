import { expect, test } from "@playwright/test";

test("user can open demo mode and add a medicine", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /care that connects\. support that empowers/i })).toBeVisible();

  const demoLink = page.getByRole("link", { name: /explore demo mode/i });
  await expect(demoLink).toHaveAttribute("href", "/dashboard");
  await demoLink.click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /today's medicine/i })).toBeVisible();

  await page.getByRole("link", { name: /medicines/i }).first().click();
  await expect(page).toHaveURL(/\/medicines$/);

  await page.getByPlaceholder("e.g. Vitamin D").fill("Vitamin D");
  await page.getByPlaceholder("e.g. 1 tablet").fill("1 tablet");
  await page.getByRole("button", { name: /save medicine and schedule/i }).click();

  await expect(page.getByText(/Vitamin D/)).toBeVisible();
});

test("shows independent reminder controls", async ({ page }) => {
  const browserErrors: Error[] = [];
  page.on("pageerror", (error) => browserErrors.push(error));
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Reminder settings" })).toBeVisible();
  await expect(page.getByText(/Notification permission:/i)).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Browser notifications/i })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Sound \/ ringing/i })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Vibration/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Test notification/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Test sound/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Test vibration/i })).toBeVisible();
  const enableButton = page.getByRole("button", { name: /Enable notifications/i });
  if (await enableButton.isVisible()) await enableButton.click();
  expect(browserErrors).toEqual([]);
});
