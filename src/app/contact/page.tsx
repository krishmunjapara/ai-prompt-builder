import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the maintainer of AI Prompt Builder with feedback, bug reports or preset suggestions.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <article className="prose-custom max-w-3xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-4 text-muted">
        Found a bug, want a new template, or have a preset that everyone should have? Open an
        issue on GitHub — it is the fastest way to reach us.
      </p>
      <p className="mt-4">
        <a
          className="text-accent underline underline-offset-4"
          href="https://github.com/krishmunjapara/ai-prompt-builder/issues"
          rel="noopener"
        >
          github.com/krishmunjapara/ai-prompt-builder/issues
        </a>
      </p>
    </article>
  );
}
