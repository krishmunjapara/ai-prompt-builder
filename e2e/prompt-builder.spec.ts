import { expect, test } from "@playwright/test";

const IDEA = "#idea";
const out = (p: import("@playwright/test").Page) => p.getByTestId("prompt-output");

test.describe("Prompt Builder", () => {
  test("typing an idea writes the prompt live", async ({ page }) => {
    await page.goto("/");
    await expect(out(page)).toContainText("Your prompt will be written here");
    await page.locator(IDEA).fill("a red fox");
    await expect(page.getByTestId("prompt-text")).toHaveText("A red fox");
    await page.getByRole("textbox", { name: "Style" }).fill("watercolor illustration");
    await expect(page.getByTestId("prompt-text")).toHaveText("Watercolor illustration of a red fox");
  });

  test("model switch changes syntax (MJ params vs SD negative line vs DALL·E sentence)", async ({ page }) => {
    await page.goto("/?s=a+cat&r=16%3A9&n=text");
    await expect(page.getByTestId("prompt-text")).toHaveText("A cat --ar 16:9 --no text");
    await page.getByRole("radio", { name: "Stable Diffusion" }).click();
    await expect(page.getByTestId("prompt-text")).toHaveText("A cat.\nNegative prompt: text");
    await expect(page.getByText("Set the image size to 1344 × 768")).toBeVisible();
    await page.getByRole("radio", { name: "DALL·E / GPT" }).click();
    await expect(page.getByTestId("prompt-text")).toHaveText("A cat. Wide landscape format. Avoid text.");
  });

  test("example opens a complete shot and the URL becomes a share link", async ({ page, browser }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Fox in first snow" }).click();
    await expect(page.getByTestId("prompt-text")).toContainText("Wildlife photograph of a red fox");
    await expect(page).toHaveURL(/s=a\+red\+fox/);
    const fresh = await browser.newPage();
    await fresh.goto(page.url());
    await expect(fresh.getByTestId("prompt-text")).toContainText("Wildlife photograph of a red fox");
    await fresh.close();
  });

  test("suggestion popover fills a refine line", async ({ page }) => {
    await page.goto("/?s=a+cat");
    await page.getByRole("button", { name: "Light suggestions" }).click();
    await page.getByRole("option", { name: "golden hour light" }).click();
    await expect(page.getByRole("textbox", { name: "Light" })).toHaveValue("golden hour light");
    await expect(page.getByTestId("prompt-text")).toHaveText("A cat, golden hour light");
  });

  test("AI fill only fills blanks and can be undone", async ({ page }) => {
    await page.route("**/api/expand", (r) =>
      r.fulfill({
        json: {
          fields: {
            subject: "a tabby cat on a windowsill",
            style: "SHOULD NOT OVERWRITE",
            lighting: "soft window light",
            lens: "50mm lens",
          },
          provider: "groq",
        },
      }),
    );
    await page.goto("/?st=gouache+illustration");
    await page.locator(IDEA).fill("cat on a windowsill");
    await page.getByRole("button", { name: /Write my prompt/ }).click();
    await expect(page.getByTestId("prompt-text")).toHaveText(
      "Gouache illustration of a tabby cat on a windowsill, soft window light, 50mm lens",
    );
    await page.getByRole("button", { name: "Undo AI fill" }).click();
    await expect(page.getByTestId("prompt-text")).toHaveText("Gouache illustration of cat on a windowsill");
  });

  test("when the server has no AI key the browser fallback is used", async ({ page }) => {
    await page.route("**/api/expand", (r) => r.fulfill({ status: 503, json: { error: "no-server-ai" } }));
    await page.route("https://text.pollinations.ai/**", (r) =>
      r.fulfill({
        json: { choices: [{ message: { content: '{"subject":"fox in snow","style":"wildlife photograph"}' } }] },
        headers: { "access-control-allow-origin": "*" },
      }),
    );
    await page.goto("/");
    await page.locator(IDEA).fill("fox in snow");
    await page.getByRole("button", { name: /Write my prompt/ }).click();
    await expect(page.getByTestId("prompt-text")).toHaveText("Wildlife photograph of a fox in snow");
  });

  test("AI failure keeps fields and shows a clear message", async ({ page }) => {
    await page.route("**/api/expand", (r) => r.fulfill({ status: 503, json: { error: "no-server-ai" } }));
    await page.route("https://text.pollinations.ai/**", (r) => r.fulfill({ status: 402, body: "{}" }));
    await page.goto("/?le=85mm+portrait+lens");
    await page.locator(IDEA).fill("an old sailor");
    await page.getByRole("button", { name: /Write my prompt/ }).click();
    await expect(page.getByText(/free AI is busy/)).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Lens" })).toHaveValue("85mm portrait lens");
  });

  test("copy writes the exact prompt; keyboard shortcut works", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/?s=a+cat&r=1%3A1");
    await page.getByRole("button", { name: "Copy prompt" }).first().click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("A cat --ar 1:1");
    await page.evaluate(() => navigator.clipboard.writeText(""));
    await page.keyboard.press("ControlOrMeta+Shift+Enter");
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("A cat --ar 1:1");
  });

  test("recent prompts are kept on this device and reopen", async ({ page }) => {
    await page.goto("/");
    await page.locator(IDEA).fill("a lighthouse in a storm");
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.locator(IDEA)).toHaveValue("");
    await page.getByRole("button", { name: "Recent prompts" }).click();
    await page.getByRole("button", { name: /lighthouse in a storm/ }).click();
    await expect(page.locator(IDEA)).toHaveValue("a lighthouse in a storm");
  });

  test("theme toggle persists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("support pages, sitemap, robots, API validation", async ({ page, request }) => {
    for (const path of ["/about", "/privacy", "/terms", "/contact"]) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    }
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
    expect(await (await request.get("/sitemap.xml")).text()).toContain("<loc>");
    const bad = await request.post("/api/expand", { data: { idea: "" } });
    expect(bad.status()).toBe(400);
    const cross = await request.post("/api/expand", { data: { idea: "a cat" }, headers: { origin: "https://evil.example" } });
    expect(cross.status()).toBe(403);
  });
});
