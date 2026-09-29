import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Simple terms for using the free AI Prompt Builder tool.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-4 text-muted-foreground">Last updated: September 2026</p>
      <p className="mt-4 text-muted-foreground">
        AI Prompt Builder is provided free of charge, as is, without warranty of any kind. You
        may use the prompts you create for any purpose, personal or commercial.
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>You are responsible for how you use the generated prompts and any images you make with them.</li>
        <li>Do not use the tool to create prompts intended to produce unlawful content.</li>
        <li>We may change or discontinue the tool at any time.</li>
        <li>The presets and templates on this site are our own work; you may reuse them freely.</li>
      </ul>
    </article>
  );
}
