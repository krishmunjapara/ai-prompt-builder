export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-prompt-builder.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "AI Prompt Builder";

export const SITE_DESCRIPTION =
  "Build detailed AI image prompts for Midjourney, Stable Diffusion, Flux, DALL·E and more. Free, instant, no signup — the prompt updates as you type.";
