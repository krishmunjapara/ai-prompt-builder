import type { Metadata } from "next";
import { PromptBuilder } from "@/components/PromptBuilder";
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
    a: "Click “Copy share link”. The whole form is encoded in the URL, so whoever opens the link sees the same fields filled in.",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          AI Image Prompt Builder
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Describe your image field by field and watch a clean, detailed prompt appear as you
          type. Works for Midjourney, Stable Diffusion, Flux, DALL·E and any other
          text-to-image model. Free, no signup, nothing leaves your browser.
        </p>
      </section>

      <PromptBuilder />

      <section id="how-it-works" className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">How to write an AI image prompt</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted">
          <li>
            <strong className="text-text">Start with the subject.</strong> Say what is in the
            picture in plain words: “a lone astronaut on a red dune”, “a ceramic coffee mug”.
          </li>
          <li>
            <strong className="text-text">Choose a style.</strong> Photograph, illustration,
            3D render, anime — this decides the overall look more than any other word.
          </li>
          <li>
            <strong className="text-text">Add environment and light.</strong> Where is it, and
            what is the light doing? Golden hour, neon, soft studio light all change the mood.
          </li>
          <li>
            <strong className="text-text">Set the camera.</strong> Angle, lens and framing tell
            the model how the shot is composed. A 35mm wide shot and an 85mm close-up look
            completely different.
          </li>
          <li>
            <strong className="text-text">Finish with mood, colour and ratio.</strong> Pick the
            aspect ratio for where the image will be used — 9:16 for Reels and Shorts, 16:9 for
            YouTube, 1:1 for a square post.
          </li>
        </ol>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Prompt syntax by model</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Model</th>
                <th className="py-2 pr-4 font-medium">Aspect ratio</th>
                <th className="py-2 font-medium">Negative prompt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-4">Midjourney</td>
                <td className="py-2 pr-4 font-mono">--ar 16:9</td>
                <td className="py-2 font-mono">--no text, watermark</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Stable Diffusion / SDXL</td>
                <td className="py-2 pr-4">Set width × height in the UI</td>
                <td className="py-2">Separate negative-prompt box</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Flux</td>
                <td className="py-2 pr-4">Set width × height in the UI</td>
                <td className="py-2">Describe what you want instead</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">DALL·E / GPT</td>
                <td className="py-2 pr-4">Say “landscape”, “portrait” or “square”</td>
                <td className="py-2">Describe what you want instead</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="faq" className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
        <dl className="mt-4 divide-y divide-border">
          {FAQ.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
