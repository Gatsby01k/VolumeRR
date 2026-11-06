import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Market search, comparison limit and context-preserving brief", async ({
  page,
}) => {
  await page.goto("/markets");
  await page
    .getByLabel("Search country or currency", { exact: true })
    .fill("Кения");
  await expect(page.locator(".country-row")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  for (const country of ["India", "Peru", "Ghana"])
    await page.getByLabel(`Compare ${country}`, { exact: true }).check();
  await page.getByLabel("Compare Kenya", { exact: true }).click();
  await expect(
    page.getByLabel("Compare Kenya", { exact: true }),
  ).not.toBeChecked();
  await expect(page.locator(".compare-toolbar")).toContainText(
    "up to three markets",
  );
  await page.getByRole("link", { name: "Compare setup", exact: true }).click();
  await page
    .getByRole("button", { name: "Add selection to your brief" })
    .click();
  await page
    .getByRole("main")
    .getByRole("link", { name: "Review brief", exact: true })
    .click();
  await expect(page.locator(".enquiry-sidebar")).toContainText(
    "India, Peru, Ghana",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox", { name: /^Payouts/ }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Company or project *", { exact: true })
    .fill("Test project");
  await page
    .getByLabel("Contact email *", { exact: true })
    .fill("test@example.com");
  await page.getByRole("button", { name: "Review brief", exact: true }).click();
  await expect(page.locator(".review-details")).toContainText(
    "test@example.com",
  );
  const storage = await page.evaluate(() =>
    JSON.stringify({ ...sessionStorage, ...localStorage }),
  );
  expect(storage).not.toContain("test@example.com");
  expect(storage).not.toContain("Test project");
  await page.getByRole("button", { name: "Edit company", exact: true }).click();
  await expect(
    page.getByLabel("Company or project *", { exact: true }),
  ).toHaveValue("Test project");
});

test("Product context reaches country and enquiry", async ({ page }) => {
  await page.goto("/payments/payouts");
  await page
    .getByRole("button", { name: "Add payouts to your brief", exact: true })
    .click();
  await page.getByRole("link", { name: "Kenya / KES", exact: true }).click();
  await page
    .getByRole("button", { name: "Add Kenya to your brief", exact: true })
    .click();
  await page
    .locator(".brief-rail")
    .getByRole("link", { name: "Review brief" })
    .click();
  await expect(page.locator(".enquiry-sidebar")).toContainText("Kenya");
  await expect(page.locator(".enquiry-sidebar")).toContainText("Payouts");
});

test("Mobile drawer is modal and returns keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("Unaccepted confirmation never reports success", async ({ page }) => {
  await page.goto("/contact/confirmation");
  await expect(
    page.getByRole("heading", { name: "No confirmed enquiry.", exact: true }),
  ).toBeVisible();
});

for (const path of [
  "/",
  "/markets",
  "/markets/kenya",
  "/developers",
  "/contact",
])
  test(`Accessible content and responsive layout: ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  });
