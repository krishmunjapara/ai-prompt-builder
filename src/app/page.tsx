import type { Metadata } from "next";
import {
  CameraIcon,
  ImageIcon,
  LockIcon,
  MapPinIcon,
  RatioIcon,
  SunIcon,
  WandSparklesIcon,
  ZapIcon,
} from "lucide-react";
import { PromptBuilder } from "@/components/PromptBuilder";
import { Badge } from "@/components/ui/badge";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    q: "Is this AI prompt builder really free?",
    a: "Yes. There is no account, no paywall and no usage limit. The prompt is assembled in your browser, so there is nothing for us to meter.",
  },
  {
    q: "Which AI image generators does it work with?",
    a: "Any text-to-image model. Pick Midjourney to get the --ar aspect-ratio flag, or Stable Diffusion, Flux, DALL·E / GPT or “Any model” for a plain sentence prompt. The wording works for Leonardo, Ideogram, Adobe Firefly and Bing Image Creator too.",
  },
  {
    q: "Do I have to fill in every field?",
    a: "No. Only the subject is needed. Empty fields are skipped, so the prompt never contains gaps or double commas.",
  },
  {
    q: "What makes a good AI image prompt?",
    a: "A clear subject first, then the style, the setting, the light, the camera angle and lens, the framing, the mood and the colours. That is exactly the order this tool writes them in, because it is the order most models weight them.",
  },
  {
    q: "Is my prompt uploaded anywhere?",
    a: "No. The page has no backend. Your recent prompts are stored only in your browser’s local storage and you can clear them at any time.",
  },
  {
    q: "How do I share a prompt?",
    a: "Click “Share link”. The whole form is encoded in the URL, so whoever opens the link sees the same fields filled in.",
  },
];

const GUIDE = [
  {
    icon: <ImageIcon />,
    title: "Start with the subject",
    body: "Say what is in the picture in plain words: “a lone astronaut on a red dune”, “a ceramic coffee mug”. This is the one field every prompt needs.",
  },
  {
    icon: <WandSparklesIcon />,
    title: "Choose a style",
    body: "Photograph, illustration, 3D render, anime — the style word decides the overall look more than anything else you write.",
  },
  {
    icon: <MapPinIcon />,
    title: "Place it somewhere",
    body: "Environment gives the model context: a foggy forest, a neon street, a clean studio. Skip it for isolated product shots.",
  },
  {
    icon: <SunIcon />,
    title: "Describe the light",
    body: "Golden hour, soft diffused, dramatic rim light. Light sets the mood faster than a mood word does.",
  },
  {
    icon: <CameraIcon />,
    title: "Set the camera",
    body: "Angle, lens and framing tell the model how the shot is composed. A 35mm wide shot and an 85mm close-up look completely different.",
  },
  {
    icon: <RatioIcon />,
    title: "Pick the ratio",
    body: "9:16 for Reels and Shorts, 16:9 for YouTube, 1:1 for a square post, 4:5 for Instagram portrait.",
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
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="bg-dotgrid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-[-160px] h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/15"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-14">
          <div className="animate-fade-up flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-primary">
              <ZapIcon className="size-3" />
              Live as you type
            </Badge>
            <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1 text-muted-foreground">
              <LockIcon className="size-3" />
              100% in your browser
            </Badge>
          </div>
          <h1 className="animate-fade-up mt-5 max-w-3xl text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] [animation-delay:60ms] sm:text-6xl">
            <span className="text-gradient">Write AI image prompts</span>
            <br />
            <span className="text-muted-foreground">that actually work.</span>
          </h1>
          <p className="animate-fade-up mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground [animation-delay:120ms]">
            Fill in a few fields — subject, style, light, camera, mood — and a clean, detailed prompt
            writes itself in real time. Built for Midjourney, Stable Diffusion, Flux and DALL·E.
            Free, no signup, nothing leaves your device.
          </p>
        </div>
      </section>

      {/* ---------- Tool ---------- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Prompt builder">
        <PromptBuilder />
      </section>

      {/* ---------- Guide ---------- */}
      <section id="guide" className="mx-auto mt-28 max-w-6xl scroll-mt-20 px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Guide</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">How to write a prompt that works</h2>
          <p className="mt-3 text-muted-foreground">
            Six decisions, in the order most models weight them. The builder above follows the same order.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE.map((g, i) => (
            <li
              key={g.title}
              className="group relative rounded-2xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:size-4">
                  {g.icon}
                </span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold">{g.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Syntax table ---------- */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Reference</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Prompt syntax by model</h2>
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Aspect ratio</th>
                <th className="px-5 py-3 font-medium">Negative prompt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {[
                ["Midjourney", <code key="a">--ar 16:9</code>, <code key="b">--no text, watermark</code>],
                ["Stable Diffusion / SDXL", "Set width × height in the UI", "Separate negative-prompt box"],
                ["Flux", "Set width × height in the UI", "Describe what you want instead"],
                ["DALL·E / GPT", "Say “landscape”, “portrait” or “square”", "Describe what you want instead"],
              ].map(([m, r, n]) => (
                <tr key={m as string} className="[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]">
                  <td className="px-5 py-3.5 font-medium">{m}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto mt-24 max-w-6xl scroll-mt-20 px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Questions, answered</h2>
        </div>
        <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

    </>
  );
}
