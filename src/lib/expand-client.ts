"use client";

import { expandWithProviders, parseAiFields, type AiFields } from "./ai";
import type { PromptState } from "./prompt";
import { pollinationsProvider } from "./providers";

export interface ExpandOutcome {
  fields: AiFields;
  via: "server" | "browser";
}

const FRIENDLY_BUSY = "The free AI is busy. Wait ~15 seconds and try again — your fields are untouched.";

/**
 * 1) Our /api/expand (Groq → Gemini with server keys: fast, high quota).
 * 2) If the server has no key or all keyed providers fail, call Pollinations
 *    straight from the browser so each visitor uses their own free quota.
 */
export async function expandIdea(idea: string, state: PromptState, signal: AbortSignal): Promise<ExpandOutcome> {
  try {
    const res = await fetch("/api/expand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, state }),
      signal,
    });
    const data = (await res.json().catch(() => ({}))) as { fields?: AiFields; error?: string };
    if (res.ok && data.fields) return { fields: parseAiFields(JSON.stringify(data.fields)), via: "server" };
    if (res.status === 400 || res.status === 429) throw new Error(data.error || "Request rejected.");
  } catch (e) {
    if (signal.aborted) throw e;
    if ((e as Error).message && !/fetch|network|JSON/i.test((e as Error).message)) throw e;
  }

  try {
    const r = await expandWithProviders([pollinationsProvider(window.location.host)], idea, state, signal);
    return { fields: r.fields, via: "browser" };
  } catch (e) {
    if (signal.aborted) throw e;
    throw new Error(FRIENDLY_BUSY);
  }
}
