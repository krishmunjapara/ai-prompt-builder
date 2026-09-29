import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

function Mark() {
  // A viewfinder corner: the product in one glyph.
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 8V4.5A1.5 1.5 0 0 1 4.5 3H8M16 3h3.5A1.5 1.5 0 0 1 21 4.5V8M21 16v3.5a1.5 1.5 0 0 1-1.5 1.5H16M8 21H4.5A1.5 1.5 0 0 1 3 19.5V16" />
      <circle cx="12" cy="12" r="2.25" className="fill-primary stroke-none" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="border-b border-border/70">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <Mark />
          <span className="text-[15px] font-semibold tracking-tight">Prompt Builder</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/#guide" className="hidden rounded-md px-3 py-2 transition-colors hover:text-foreground sm:block">
            Guide
          </Link>
          <Link href="/#models" className="hidden rounded-md px-3 py-2 transition-colors hover:text-foreground sm:block">
            Model syntax
          </Link>
          <Link href="/#faq" className="hidden rounded-md px-3 py-2 transition-colors hover:text-foreground sm:block">
            FAQ
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/70">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-12 text-sm text-muted-foreground sm:grid-cols-[1fr_auto] sm:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 text-foreground">
            <Mark />
            <span className="font-semibold tracking-tight">Prompt Builder</span>
          </div>
          <p className="mt-3 leading-relaxed">
            A free tool for writing clear prompts for AI image generators. No account, no tracking cookies.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end" aria-label="Footer">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
