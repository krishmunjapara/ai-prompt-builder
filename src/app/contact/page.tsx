import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the maintainer of Prompt Builder with feedback, bug reports or preset suggestions.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 text-[15.5px] leading-relaxed sm:px-8">
      <h1 className="font-serif text-[44px] leading-[1.05] tracking-[-0.015em]">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        Found a bug, want a new template, or have a preset that everyone should have? Open an
        issue on GitHub — it is the fastest way to reach us.
      </p>
      <p className="mt-4">
        <a
          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
          href="https://github.com/krishmunjapara/ai-prompt-builder/issues"
          rel="noopener"
        >
          github.com/krishmunjapara/ai-prompt-builder/issues
        </a>
      </p>
    </article>
  );
}
