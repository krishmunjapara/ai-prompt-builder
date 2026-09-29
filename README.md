# Prompt Builder — AI image prompt generator

Type an idea, get a clean, specific prompt for Midjourney, Stable Diffusion, Flux or DALL·E —
split into editable lines (style, setting, light, angle, lens, framing, mood, colour, avoid).

Live: https://ai-prompt-builder.vercel.app

## How it works

- **Idea → AI fill.** “Write my prompt” sends only the short idea (plus any lines you already set)
  to `/api/expand`. The AI returns structured fields; it only fills blank lines and can be undone.
- **Providers (all free tiers), fastest first:** Groq `gpt-oss-120b` → Groq `gpt-oss-20b` →
  Gemini Flash-Lite (server keys) → Pollinations (called from the visitor's browser, no key).
  With no keys configured the site still works via the browser fallback.
- **Clean output.** Filler like “8k, masterpiece, trending on ArtStation” is stripped; subject and
  setting are normalised to read naturally; per-model syntax (`--ar`/`--no`, `Negative prompt:`,
  DALL·E sentences, Flux pixel sizes).
- **Private.** No account, no tracking cookies. Recent prompts live in `localStorage` only. The
  form state is in the URL, so every prompt is a share link.

## Setup

```bash
pnpm install
cp .env.example .env.local   # optional: GROQ_API_KEY, GEMINI_API_KEY
pnpm dev                     # http://localhost:3000
```

## Checks

```bash
pnpm exec tsc --noEmit && pnpm exec eslint . && pnpm exec vitest run
pnpm build && pnpm exec next start -p 4321 &
pnpm exec playwright test    # e2e against the production build
```

## Structure

```
src/app/page.tsx              tool + guide + model syntax + FAQ
src/app/api/expand/route.ts   AI proxy (validation, same-origin, rate limit)
src/components/Composer.tsx   the tool
src/lib/prompt.ts             fields → segments → prompt, per-model syntax, share links  (tested)
src/lib/ai.ts                 system prompt, parsing, sanitising, provider fallback      (tested)
src/lib/providers.ts          Groq / Gemini / Pollinations clients
src/lib/expand-client.ts      server first, browser fallback
```
