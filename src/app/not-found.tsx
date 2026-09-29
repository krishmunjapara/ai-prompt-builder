import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-28 sm:px-8">
      <h1 className="font-serif text-[44px] leading-[1.05] tracking-[-0.015em]">Page not found</h1>
      <p className="mt-2 text-muted-foreground">That link does not exist.</p>
      <Link href="/" className="mt-6 inline-block text-primary underline underline-offset-4">
        Back to the prompt builder
      </Link>
    </div>
  );
}
