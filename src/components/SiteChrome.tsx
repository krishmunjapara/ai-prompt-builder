import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 glass">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight"
          aria-label={`${SITE_NAME} home`}
        >
          <span className="relative inline-flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_0_1px_var(--color-primary),0_8px_20px_-6px_var(--color-glow)] transition-transform group-hover:scale-105">
            <SparklesIcon className="size-3.5" />
          </span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex">
            <Link href="/#guide">Guide</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex">
            <Link href="/#faq">FAQ</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <a
              href="https://github.com/krishmunjapara/ai-prompt-builder"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Source on GitHub"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            </a>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          {SITE_NAME} · Free, no signup, nothing leaves your browser.
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            ["/about", "About"],
            ["/privacy", "Privacy"],
            ["/terms", "Terms"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
