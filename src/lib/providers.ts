import type { Provider } from "./ai";

async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  signal?: AbortSignal,
  timeoutMs = 12_000,
) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

type ChatCompletion = { choices?: { message?: { content?: string } }[] };

/** Groq — OpenAI-compatible. Free tier: 30 RPM / 1K RPD per model. */
export function groqProvider(apiKey: string, model: string): Provider {
  return {
    name: `groq:${model}`,
    async call(system, user, signal) {
      const data = (await postJson(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          temperature: 0.8,
          max_completion_tokens: 600,
          response_format: { type: "json_object" },
          ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        },
        { Authorization: `Bearer ${apiKey}` },
        signal,
      )) as ChatCompletion;
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("empty response");
      return text;
    },
  };
}

type GeminiResponse = { candidates?: { content?: { parts?: { text?: string }[] } }[] };

/** Google Gemini — free tier via AI Studio key. */
export function geminiProvider(apiKey: string, model: string): Provider {
  return {
    name: `gemini:${model}`,
    async call(system, user, signal) {
      const data = (await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 600,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingLevel: "minimal" },
          },
        },
        { "x-goog-api-key": apiKey },
        signal,
      )) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
      if (!text) throw new Error("empty response");
      return text;
    },
  };
}

/**
 * Pollinations — no key. Anonymous tier is ≈1 request / 15 s *per IP*, so this
 * is called from the visitor's browser (CORS *), giving each visitor their own
 * quota instead of sharing the server's.
 */
export function pollinationsProvider(referrer: string): Provider {
  return {
    name: "pollinations",
    async call(system, user, signal) {
      const data = (await postJson(
        `https://text.pollinations.ai/openai?referrer=${encodeURIComponent(referrer)}`,
        {
          model: "openai",
          seed: Math.floor(Math.random() * 1e6),
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        },
        {},
        signal,
        25_000,
      )) as ChatCompletion;
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("empty response");
      return text;
    },
  };
}

/** Server-side provider chain from env (keyed providers only). Fastest/highest-quota first. */
export function providersFromEnv(env: Record<string, string | undefined>): Provider[] {
  const list: Provider[] = [];
  if (env.GROQ_API_KEY) {
    list.push(groqProvider(env.GROQ_API_KEY, env.GROQ_MODEL || "openai/gpt-oss-120b"));
    list.push(groqProvider(env.GROQ_API_KEY, "openai/gpt-oss-20b"));
  }
  if (env.GEMINI_API_KEY) {
    list.push(geminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL || "gemini-3.5-flash-lite"));
  }
  return list;
}
