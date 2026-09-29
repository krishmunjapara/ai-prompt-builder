import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What AI Prompt Builder is, who it is for, and how it is built.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <article className="prose-custom max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <p className="mt-4 text-muted">
        AI Prompt Builder is a free tool for writing better text-to-image prompts. You fill in
        a few fields — subject, style, light, camera, mood — and a clean, detailed prompt is
        assembled instantly for Midjourney, Stable Diffusion, Flux, DALL·E or any other model.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Why it exists</h2>
      <p className="mt-2 text-muted">
        Good prompts follow a structure, but remembering that structure every time is tedious.
        This tool bakes the structure in, so you spend your attention on the idea instead of
        the syntax.
      </p>
      <h2 className="mt-8 text-xl font-semibold">How it is built</h2>
      <p className="mt-2 text-muted">
        It is a static site with no backend. Every keystroke is processed in your browser and
        nothing is sent to a server. Your recent prompts are kept only in your own browser
        storage.
      </p>
    </article>
  );
}
