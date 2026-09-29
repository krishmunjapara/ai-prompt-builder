import { expandWithProviders } from "@/lib/ai";
import { emptyState, TARGETS, type PromptState, type Target } from "@/lib/prompt";
import { providersFromEnv } from "@/lib/providers";
import { SITE_URL } from "@/lib/site";

export const maxDuration = 30;

/* ---- tiny per-instance rate limit (best effort; stateless on Vercel) ---- */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

const LOCKABLE: (keyof PromptState)[] = [
  "style",
  "environment",
  "lighting",
  "camera",
  "lens",
  "composition",
  "mood",
  "color",
  "negative",
];

export async function POST(req: Request) {
  // Same-origin only (plus our production host and Vercel previews).
  const origin = req.headers.get("origin");
  if (origin) {
    let ok = false;
    try {
      const o = new URL(origin);
      const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      ok = o.host === host || origin === SITE_URL || o.hostname.endsWith(".vercel.app");
    } catch {
      ok = false;
    }
    if (!ok) return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (limited(ip)) {
    return Response.json({ error: "Too many requests — try again in a minute." }, { status: 429 });
  }

  let body: { idea?: unknown; state?: Partial<Record<keyof PromptState, unknown>> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const idea = typeof body.idea === "string" ? body.idea.trim().slice(0, 300) : "";
  if (idea.length < 2) return Response.json({ error: "Describe your idea first." }, { status: 400 });

  const state = emptyState();
  const t = body.state?.target;
  if (typeof t === "string" && (TARGETS as readonly string[]).includes(t)) state.target = t as Target;
  for (const k of LOCKABLE) {
    const v = body.state?.[k];
    if (typeof v === "string") (state as unknown as Record<string, string>)[k] = v.slice(0, 120);
  }

  const providers = providersFromEnv(process.env);
  if (providers.length === 0) {
    // No server key configured: tell the browser to use its own fallback.
    return Response.json({ error: "no-server-ai" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const started = Date.now();
  try {
    const result = await expandWithProviders(providers, idea, state, req.signal);
    return Response.json(
      { fields: result.fields, provider: result.provider.split(":")[0], ms: Date.now() - started },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[expand]", (e as Error).message);
    return Response.json(
      { error: "The AI is busy right now. Your fields are untouched — try again in a few seconds." },
      { status: 503 },
    );
  }
}
