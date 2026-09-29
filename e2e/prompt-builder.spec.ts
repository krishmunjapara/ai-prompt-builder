import { expect, test } from "@playwright/test";

test.describe("AI Prompt Builder", () => {
  test("prompt appears instantly while typing, with correct structure", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI Image Prompt Builder");

    const out = page.getByTestId("prompt-output");
    await expect(out).toContainText("Start typing a subject");

    await page.getByLabel("Subject").fill("a lone astronaut on a red dune");
    await expect(out).toHaveText("A lone astronaut on a red dune.");

    await page.getByRole("button", { name: "cinematic photograph", exact: true }).click();
    await page.getByRole("button", { name: "golden hour light", exact: true }).click();
    await page.getByRole("button", { name: "16:9", exact: true }).click();

    await expect(out).toHaveText(
      "Cinematic photograph of a lone astronaut on a red dune, golden hour light --ar 16:9",
    );

    // Switching target changes ratio syntax
    await page.getByRole("radio", { name: "Stable Diffusion" }).click();
    await expect(out).toHaveText(
      "Cinematic photograph of a lone astronaut on a red dune, golden hour light, 16:9 aspect ratio.",
    );
  });

  test("template fills fields and URL becomes a share link that restores state", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.getByLabel("Subject").fill("a ceramic mug");
    await page.getByRole("button", { name: "Product shot", exact: true }).click();

    const out = page.getByTestId("prompt-output");
    await expect(out).toContainText("Product photo of a ceramic mug in a minimalist studio backdrop");

    await expect.poll(() => new URL(page.url()).search).toContain("s=a+ceramic+mug");
    const shareUrl = page.url();

    // Open the share link in a fresh page: form must be restored identically
    const fresh = await context.newPage();
    await fresh.goto(shareUrl);
    await expect(fresh.getByTestId("prompt-output")).toHaveText(await out.textContent() ?? "");
    await expect(fresh.getByLabel("Subject")).toHaveValue("a ceramic mug");
    await expect(fresh.getByLabel("Style")).toHaveValue("product photo");
  });

  test("copy button writes the prompt to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByLabel("Subject").fill("a red fox");
    await page.getByRole("button", { name: "Copy prompt" }).click();
    await expect(page.getByRole("button", { name: "Copied ✓" })).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe("A red fox.");
  });

  test("recent prompts are saved locally and can be restored", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Subject").fill("a lighthouse in a storm");
    await expect(page.getByRole("heading", { name: "Recent prompts" })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByTestId("prompt-output")).toContainText("Start typing");
    await page.getByRole("button", { name: /a lighthouse in a storm/i }).click();
    await expect(page.getByLabel("Subject")).toHaveValue("a lighthouse in a storm");
  });

  test("dark mode toggle persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("support pages, sitemap and robots exist", async ({ page, request }) => {
    for (const path of ["/about", "/privacy", "/terms", "/contact"]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>");
    // Static hosts (Vercel) serve 404.html for unknown routes; the local python
    // server does not, so verify the page itself directly.
    await page.goto("/404.html");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});
