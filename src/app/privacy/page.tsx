import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Prompt Builder has no accounts and no tracking cookies. Here is exactly what is sent, what is stored, and where.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[12px] tracking-wide text-primary uppercase">Privacy</p>
      <h1 className="mt-3 font-serif text-[44px] leading-[1.05] tracking-[-0.015em]">What happens to what you type</h1>
      <div className="mt-10 space-y-8 text-[15.5px] leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:text-foreground">
        <section>
          <h2>Typing and editing</h2>
          <p>
            Building the prompt from your lines happens entirely in your browser. Nothing is sent while you type,
            pick suggestions, switch models or copy.
          </p>
        </section>
        <section>
          <h2>The “Write my prompt” button</h2>
          <p>
            Only when you press it, your idea (up to 300 characters) and any lines you already filled are sent to
            generate suggestions. The request goes to our server function, which forwards it to one AI provider —
            Groq or Google Gemini. If those are unavailable, your browser sends it directly to Pollinations.ai.
            We don’t store these requests. Each provider handles the text under its own privacy policy, so don’t
            put personal information in an idea.
          </p>
        </section>
        <section>
          <h2>Stored on your device</h2>
          <p>
            Your recent prompts and your light/dark preference are kept in your browser’s local storage. They never
            leave your device. Use “Clear” in Recent prompts, or clear site data, to remove them.
          </p>
        </section>
        <section>
          <h2>Cookies and analytics</h2>
          <p>
            No tracking cookies, no advertising, no analytics scripts. Our host (Vercel) keeps standard server
            logs such as IP address and request time for security.
          </p>
        </section>
        <section>
          <h2>Share links</h2>
          <p>
            A share link contains your prompt lines in the URL. Anyone you send it to can read them — that’s the point.
          </p>
        </section>
      </div>
    </article>
  );
}
