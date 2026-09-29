# AI Prompt Builder

Free, instant AI image prompt generator. Fill in subject, style, light, camera, mood and
aspect ratio — a clean prompt is assembled as you type, for Midjourney, Stable Diffusion,
Flux, DALL·E or any text-to-image model.

Live: https://ai-prompt-builder.vercel.app

## Principles

- 100 % client-side: no backend, no database, no API keys, nothing is uploaded
- No signup, no ads, no tracking cookies
- The form state lives in the URL → every prompt is a share link
- Recent prompts are kept in `localStorage` only

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind v4 · Vitest · Playwright

## Develop

```bash
pnpm install
pnpm dev                  # http://localhost:3000
pnpm exec vitest run      # unit tests (prompt engine, history)
pnpm build                # static export → ./out
python3 -m http.server 4321 --directory out &
pnpm exec playwright test # e2e against the export
```

## Structure

```
src/app/            routes, metadata, sitemap.ts, robots.ts
src/components/     PromptBuilder (tool), SiteChrome, ThemeToggle
src/lib/prompt.ts   fields → prompt text, URL encode/decode  (tested)
src/lib/history.ts  local history                             (tested)
src/lib/presets.ts  field options, ratios, templates
```
