import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-fg text-sm font-bold">
            P
          </span>
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <Link href="/#how-it-works" className="hidden hover:text-text sm:inline">
            How it works
          </Link>
          <Link href="/#faq" className="hidden hover:text-text sm:inline">
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
    <footer className="mt-16 border-t border-border py-8 text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Free, no signup, nothing leaves your browser.
        </p>
        <nav className="flex gap-4">
          <Link href="/about" className="hover:text-text">
            About
          </Link>
          <Link href="/privacy" className="hover:text-text">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-text">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
