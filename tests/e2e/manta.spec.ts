import { test, expect } from "@playwright/test";

test("Manta lifts the edge, returns to ready and reacts to a focused market", async ({
  page,
}) => {
  await page.goto("/");
  const scene = page.locator(".home-hero");
  await expect(scene).toHaveAttribute("data-manta-reveal", "lift");
  await expect(page.locator(".hero-manta")).toHaveAttribute(
    "data-manta-pose",
    "0",
  );
  await expect(scene).toHaveAttribute("data-manta-reveal", "ready");
  await page.locator(".home-market-focus a").first().focus();
  await expect(page.locator(".hero-manta")).toHaveAttribute(
    "data-manta-state",
    "explore",
  );
  await expect(page.locator(".hero-manta")).toHaveAttribute(
    "data-manta-pose",
    "2",
  );
});

test("A real brief selection produces a gesture and a single visible companion", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Kenya +", exact: true }).click();
  await expect(page.locator(".brief-rail")).toContainText("1 market");
  await expect(page.locator(".brief-rail .manta")).toHaveAttribute(
    "data-manta-state",
    "brief_added",
  );
  await expect(page.locator(".brief-rail .manta")).toHaveAttribute(
    "data-manta-pose",
    "3",
  );
  await expect(page.locator(".brief-rail .manta")).toHaveAttribute(
    "data-manta-state",
    "ready",
  );
  await expect(page.locator(".brief-rail .manta")).toHaveAttribute(
    "data-manta-pose",
    "5",
  );
  const visible = await page.locator(".manta-v2").evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const bounds = element.getBoundingClientRect();
        return (
          bounds.width > 0 && bounds.top < innerHeight && bounds.bottom > 0
        );
      }).length,
  );
  expect(visible).toBe(1);
});

test("Reduced motion uses the supplied static fallback; hiding removes every instance", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-manta")).toHaveAttribute(
    "data-manta-state",
    "reduced_static",
  );
  await expect(page.locator(".hero-manta")).toHaveAttribute(
    "data-manta-source",
    "poster",
  );
  await page.getByRole("button", { name: "Hide Manta", exact: true }).click();
  await expect(page.locator(".manta-v2")).toHaveCount(0);
});

test("A failed optional atlas never removes the character or blocks navigation", async ({
  page,
}) => {
  await page.route("**/manta-poses-v2.webp", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".hero-manta .manta-static-poster")).toBeVisible();
  await page
    .getByRole("link", { name: "Explore markets", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Start with the local detail.",
  );
});
