import type { Metadata } from "next";
import { Composer } from "@/components/Composer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. No account, no credits, no watermark on your prompt. The builder runs in your browser; only the “Write my prompt” button sends your short idea to an AI model to suggest the details.",
  },
  {
    q: "Which image generators does it work with?",
    a: "Midjourney, Stable Diffusion (SDXL / A1111 / ComfyUI), Flux, DALL·E / ChatGPT images, and anything that takes a text prompt — Leonardo, Ideogram, Firefly, Bing Image Creator. Pick the model and the syntax changes to match.",
  },
  {
    q: "What does the AI actually do?",
    a: "It reads your idea and proposes a style, setting, light, angle, lens, framing, mood, colour and things to avoid — each as a separate, editable line. It never overwrites a line you already set, and you can undo the whole fill in one click.",
  },
  {
    q: "Why doesn’t my prompt contain “8k, masterpiece, trending on ArtStation”?",
    a: "Because modern models ignore that filler and it crowds out words that matter. We strip it from AI suggestions on purpose. Specific light, lens and framing do far more.",
  },
  {
    q: "Is anything I type stored?",
    a: "Your recent prompts are saved only in this browser (local storage) so you can reopen them. We don’t keep your ideas on a server, and there are no tracking cookies.",
  },
  {
    q: "How do I share a prompt?",
    a: "Use the link button next to Copy. The link opens this page with every line filled in exactly as you left it.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "DesignApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

const ANATOMY = [
  ["Style", "35mm film photograph", "Decides the whole look. Name a medium, not an adjective — “gouache illustration” beats “artistic”."],
  ["Subject", "an elderly chef ladling broth", "Who or what, doing what. Specific nouns: age, material, clothing, breed."],
  ["Setting", "a rain-soaked Tokyo side street", "Gives the model context and colour to work with. Skip it for isolated product shots."],
  ["Light", "warm lantern light against cool neon", "Sets mood faster than any mood word. Name the source and its quality."],
  ["Angle · Lens", "eye level, 35mm lens", "How a photographer would stand. 24mm feels close and wide; 85mm flattens and isolates."],
  ["Framing", "medium shot, steam in the foreground", "How much of the scene is in frame and what leads the eye."],
] as const;

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* Title — one line, left-aligned, then straight into the tool */}
        <div className="flex flex-col gap-3 pt-10 pb-9 sm:pt-14 md:flex-row md:items-end md:justify-between">
          <h1 className="font-serif text-[40px] leading-[1.02] tracking-[-0.02em] sm:text-[56px]">
            AI image prompt <em className="text-primary">generator</em>
          </h1>
          <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted-foreground md:pb-2 md:text-right">
            Type an idea. Get a clean, specific prompt for Midjourney, Stable Diffusion, Flux or DALL·E — every
            part editable. Free, no signup.
          </p>
        </div>

        <Composer />
      </div>

      {/* ============================ Guide ============================ */}
      <section id="guide" className="mx-auto mt-32 max-w-[1240px] scroll-mt-10 px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:sticky lg:top-10 lg:self-start">
            <p className="font-mono text-[12px] tracking-wide text-primary uppercase">Guide</p>
            <h2 className="mt-3 font-serif text-[40px] leading-[1.05] tracking-[-0.015em]">
              Anatomy of a prompt that works
            </h2>
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-muted-foreground">
              Image models read a prompt roughly in order of importance. Put the look first, the subject second,
              then the details a photographer would decide. That’s the order this builder writes in.
            </p>
            <figure className="mt-8 rounded-xl border bg-card p-5 sheet-shadow">
              <figcaption className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                Example · Midjourney
              </figcaption>
              <p className="mt-3 font-mono text-[13.5px] leading-[1.9] text-ink-soft">
                <span className="text-foreground underline decoration-border underline-offset-4">35mm film photograph</span> of{" "}
                <span className="font-semibold text-foreground">an elderly chef ladling broth at a tiny ramen stall</span> in{" "}
                <span className="text-foreground underline decoration-border underline-offset-4">a rain-soaked Tokyo side street at night</span>,{" "}
                <span className="text-foreground underline decoration-border underline-offset-4">warm lantern light against cool neon</span>, eye level, 35mm lens,
                medium shot, quiet, Kodak Portra tones <span className="text-primary">--ar 3:2 --no text, watermark</span>
              </p>
            </figure>
          </div>

          <ol className="divide-y border-y">
            {ANATOMY.map(([label, example, body], i) => (
              <li key={label} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[56px_minmax(0,1fr)]">
                <span className="pt-1 font-mono text-[12px] text-muted-foreground tabular">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[17px] font-semibold tracking-tight">{label}</h3>
                    <code className="font-mono text-[12.5px] text-primary">{example}</code>
                  </div>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================ Model syntax ============================ */}
      <section id="models" className="mx-auto mt-32 max-w-[1240px] scroll-mt-10 px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[12px] tracking-wide text-primary uppercase">Reference</p>
            <h2 className="mt-3 font-serif text-[40px] leading-[1.05] tracking-[-0.015em]">Same idea, five syntaxes</h2>
          </div>
          <p className="max-w-sm text-[14.5px] text-muted-foreground">
            What changes when you switch the model above — so the prompt pastes in and just works.
          </p>
        </div>
        <div className="mt-10 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="border-b text-[12px] text-muted-foreground">
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Aspect ratio</th>
                <th className="px-5 py-3 font-medium">Things to avoid</th>
                <th className="px-5 py-3 font-medium">Style of prompt</th>
              </tr>
            </thead>
            <tbody className="divide-y [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-primary">
              <tr>
                <td className="px-5 py-4 font-medium">Midjourney</td>
                <td className="px-5 py-4"><code>--ar 16:9</code></td>
                <td className="px-5 py-4"><code>--no text, watermark</code></td>
                <td className="px-5 py-4 text-muted-foreground">Comma phrases, parameters at the end</td>
              </tr>
              <tr>
                <td className="px-5 py-4 font-medium">Stable Diffusion</td>
                <td className="px-5 py-4 text-muted-foreground">Set in the app, e.g. 1344 × 768</td>
                <td className="px-5 py-4"><code>Negative prompt:</code> line</td>
                <td className="px-5 py-4 text-muted-foreground">Comma phrases</td>
              </tr>
              <tr>
                <td className="px-5 py-4 font-medium">Flux</td>
                <td className="px-5 py-4 text-muted-foreground">Set in the app, e.g. 1344 × 768</td>
                <td className="px-5 py-4 text-muted-foreground">Not supported — describe what you want</td>
                <td className="px-5 py-4 text-muted-foreground">Natural sentence</td>
              </tr>
              <tr>
                <td className="px-5 py-4 font-medium">DALL·E / ChatGPT</td>
                <td className="px-5 py-4 text-muted-foreground">“Wide landscape format.”</td>
                <td className="px-5 py-4 text-muted-foreground">“Avoid text, watermark.”</td>
                <td className="px-5 py-4 text-muted-foreground">Plain-English sentences</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="mx-auto mt-32 max-w-[1240px] scroll-mt-10 px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="font-mono text-[12px] tracking-wide text-primary uppercase">FAQ</p>
            <h2 className="mt-3 font-serif text-[40px] leading-[1.05] tracking-[-0.015em]">Good questions</h2>
          </div>
          <Accordion type="single" collapsible className="border-t">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`} className="border-b">
                <AccordionTrigger className="py-5 text-left text-[16px] font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
