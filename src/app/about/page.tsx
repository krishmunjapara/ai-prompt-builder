import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why Prompt Builder exists and how it writes clean, specific prompts for AI image generators.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[12px] tracking-wide text-primary uppercase">About</p>
      <h1 className="mt-3 font-serif text-[44px] leading-[1.05] tracking-[-0.015em]">Fewer buzzwords, better pictures</h1>
      <div className="mt-10 space-y-5 text-[15.5px] leading-relaxed text-muted-foreground">
        <p>
          Most prompt generators return a paragraph stuffed with “8k, masterpiece, trending on ArtStation”. Modern
          image models ignore that, and you can’t easily change one part without rewriting the lot.
        </p>
        <p>
          Prompt Builder writes the prompt the way a photographer plans a shot: a style, a subject, a setting, the
          light, the angle and lens, the framing, the mood and the colours — each on its own line you can edit.
          The AI fills only what you left blank, and the result is formatted for the model you pick.
        </p>
        <p>
          It’s free, needs no account and has no ads. Read the{" "}
          <Link href="/privacy" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
            privacy page
          </Link>{" "}
          for exactly what is sent and stored.
        </p>
      </div>
    </article>
  );
}
