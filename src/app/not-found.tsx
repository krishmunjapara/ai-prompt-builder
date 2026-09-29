import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">That link does not exist.</p>
      <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-4">
        Back to the prompt builder
      </Link>
    </div>
  );
}
