import { expect, test } from "@playwright/test";

test.describe("AI Prompt Builder", () => {
  test("prompt appears instantly while typing, with correct structure", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Write AI image prompts");

    const out = page.getByTestId("prompt-output");
    await expect(out).toContainText("Start with a subject");

    await page.getByRole("textbox", { name: "Subject", exact: true }).fill("a lone astronaut on a red dune");
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
    await page.getByRole("textbox", { name: "Subject", exact: true }).fill("a ceramic mug");
    await page.getByRole("button", { name: "Product shot", exact: true }).click();

    const out = page.getByTestId("prompt-output");
    await expect(out).toContainText("Product photo of a ceramic mug in a minimalist studio backdrop");

    await expect.poll(() => new URL(page.url()).search).toContain("s=a+ceramic+mug");
    const shareUrl = page.url();

    // Open the share link in a fresh page: form must be restored identically
    const fresh = await context.newPage();
    await fresh.goto(shareUrl);
    await expect(fresh.getByTestId("prompt-output")).toHaveText(await out.textContent() ?? "");
    await expect(fresh.getByRole("textbox", { name: "Subject", exact: true })).toHaveValue("a ceramic mug");
    await expect(fresh.getByRole("textbox", { name: "Style", exact: true })).toHaveValue("product photo");
  });

  test("copy button writes the prompt to the clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("textbox", { name: "Subject", exact: true }).fill("a red fox");
    await page.getByRole("button", { name: "Copy prompt" }).first().click();
    await expect(page.getByRole("button", { name: "Copied", exact: true }).first()).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe("A red fox.");
  });

  test("recent prompts are saved locally and can be restored", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Subject", exact: true }).fill("a lighthouse in a storm");
    await expect(page.getByRole("heading", { name: "Recent prompts" })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByTestId("prompt-output")).toContainText("Start with a subject");
    await page.getByRole("button", { name: /a lighthouse in a storm/i }).click();
    await expect(page.getByRole("textbox", { name: "Subject", exact: true })).toHaveValue("a lighthouse in a storm");
  });

  test("dark mode toggle persists across reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("keyboard shortcut ⌘/Ctrl+Enter copies the prompt", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByRole("textbox", { name: "Subject", exact: true }).fill("a mountain cabin");
    await page.keyboard.press("ControlOrMeta+Enter");
    await expect(page.getByText("Prompt copied")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("A mountain cabin.");
  });

  test("output is colour-coded per field and text equals the plain prompt", async ({ page }) => {
    await page.goto("/?s=a+cat&st=photo&l=soft+light&r=1%3A1");
    const out = page.getByTestId("prompt-output");
    await expect(out).toHaveText("Photo of a cat, soft light --ar 1:1");
    await expect(out.locator('[title="style"]')).toHaveText("Photo");
    await expect(out.locator('[title="subject"]')).toHaveText("a cat");
    await expect(out.locator('[title="lighting"]')).toHaveText("soft light");
    await expect(out.locator('[title="aspect ratio"]')).toHaveText("--ar 1:1");
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
