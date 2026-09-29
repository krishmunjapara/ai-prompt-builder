import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AI Prompt Builder has no backend, no accounts and no tracking cookies. Here is exactly what is and is not stored.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">Last updated: September 2026</p>
      <h2 className="mt-8 text-xl font-semibold">What we do not collect</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>We have no user accounts and no sign-up.</li>
        <li>Your prompts are never sent to our servers — there is no server-side processing.</li>
        <li>We set no advertising or analytics cookies.</li>
      </ul>
      <h2 className="mt-8 text-xl font-semibold">What stays on your device</h2>
      <p className="mt-2 text-muted-foreground">
        The “Recent prompts” list and your light/dark preference are stored in your browser’s
        local storage. They never leave your device and you can delete them with the “Clear”
        button or by clearing site data in your browser.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Hosting</h2>
      <p className="mt-2 text-muted-foreground">
        The site is served as static files by our hosting provider, which may keep standard
        server logs (IP address, user agent, time of request) for security and operational
        purposes, as any web host does.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Share links</h2>
      <p className="mt-2 text-muted-foreground">
        When you copy a share link, the contents of the form are encoded in the URL itself.
        Anyone you send the link to can see those fields. Do not put private information in a
        prompt you intend to share.
      </p>
    </article>
  );
}
