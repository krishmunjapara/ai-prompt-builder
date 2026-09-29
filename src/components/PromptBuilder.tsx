"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildPrompt,
  decodeState,
  emptyState,
  encodeState,
  TARGET_LABELS,
  TARGETS,
  type FieldKey,
  type PromptState,
  type Target,
} from "@/lib/prompt";
import { FIELDS, NEGATIVE_PRESETS, RATIOS, TEMPLATES } from "@/lib/presets";
import { addToHistory, clearHistory, readHistory, type HistoryItem } from "@/lib/history";

type Flash = "copied" | "linkCopied" | null;

export function PromptBuilder() {
  const [state, setState] = useState<PromptState>(emptyState);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [flash, setFlash] = useState<Flash>(null);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Restore from share link (?s=...) and load history once on the client.
  // Deferred to a microtask so it does not count as a synchronous setState in an effect.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const params = new URLSearchParams(window.location.search);
      if ([...params.keys()].length > 0) setState(decodeState(params));
      setHistory(readHistory());
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const prompt = useMemo(() => buildPrompt(state), [state]);
  const query = useMemo(() => encodeState(state), [state]);

  // Keep the URL in sync so the address bar is always a share link (no reload).
  useEffect(() => {
    if (!hydrated) return;
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, hydrated]);

  // Save to local history after the user pauses typing.
  useEffect(() => {
    if (!hydrated || !prompt) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setHistory(addToHistory(prompt, query));
    }, 1500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [prompt, query, hydrated]);

  const set = useCallback(
    <K extends keyof PromptState>(key: K, value: PromptState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  const showFlash = (kind: Flash) => {
    setFlash(kind);
    window.setTimeout(() => setFlash(null), 1600);
  };

  const copyText = async (text: string, kind: Flash) => {
    try {
      await navigator.clipboard.writeText(text);
      showFlash(kind);
    } catch {
      /* clipboard blocked — user can select the text manually */
    }
  };

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setState((s) => ({ ...s, ...t.values }));
  };

  const restore = (item: HistoryItem) => {
    if (!item.query) return;
    setState(decodeState(new URLSearchParams(item.query)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => setState(emptyState());

  const wordCount = prompt ? prompt.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="grid gap-8 pb-28 lg:grid-cols-[1fr_minmax(320px,420px)] lg:pb-0">
      {/* Mobile-only sticky preview so the prompt is visible while typing */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden"
        aria-hidden="true"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p
            className={`line-clamp-2 flex-1 font-mono text-xs leading-snug ${prompt ? "" : "text-muted"}`}
          >
            {prompt || "Your prompt appears here as you type."}
          </p>
          <button
            type="button"
            disabled={!prompt}
            onClick={() => copyText(prompt, "copied")}
            className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-fg disabled:opacity-40"
          >
            {flash === "copied" ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* ---------- LEFT: the form ---------- */}
      <section aria-label="Prompt fields" className="space-y-6">
        {/* Templates */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Start from a template
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id)}
                title={t.description}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Target model */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Target model
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Target model">
            {TARGETS.map((t: Target) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={state.target === t}
                onClick={() => set("target", t)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  state.target === t
                    ? "border-accent bg-accent-soft text-text"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
              >
                {TARGET_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        {FIELDS.map((f) => (
          <Field
            key={f.key}
            id={f.key}
            label={f.label}
            placeholder={f.placeholder}
            value={state[f.key]}
            options={f.options}
            onChange={(v) => set(f.key, v)}
            autoFocus={f.key === "subject"}
          />
        ))}

        {/* Ratio */}
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="ratio">
            Aspect ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => set("ratio", state.ratio === r.value ? "" : r.value)}
                title={r.label}
                aria-pressed={state.ratio === r.value}
                className={`rounded-lg border px-3 py-1.5 font-mono text-sm ${
                  state.ratio === r.value
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
              >
                {r.value}
              </button>
            ))}
            <input
              id="ratio"
              value={state.ratio}
              onChange={(e) => set("ratio", e.target.value)}
              placeholder="custom, e.g. 5:4"
              className="w-36 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-sm outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Negative */}
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="negative">
            Negative prompt <span className="font-normal text-muted">(what to avoid)</span>
          </label>
          <input
            id="negative"
            value={state.negative}
            onChange={(e) => set("negative", e.target.value)}
            placeholder="e.g. blurry, text, watermark"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {NEGATIVE_PRESETS.map((n) => (
              <Chip key={n} active={state.negative === n} onClick={() => set("negative", n)}>
                {n}
              </Chip>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="text-sm text-muted underline-offset-4 hover:text-text hover:underline"
        >
          Clear all
        </button>
      </section>

      {/* ---------- RIGHT: live output ---------- */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your prompt</h2>
            <span className="text-xs text-muted" aria-live="polite">
              {wordCount} words
            </span>
          </div>

          <output
            htmlFor="subject"
            aria-live="polite"
            className={`block min-h-[140px] whitespace-pre-wrap rounded-xl bg-surface-2 p-4 font-mono text-sm leading-relaxed ${
              prompt ? "" : "text-muted"
            }`}
            data-testid="prompt-output"
          >
            {prompt || "Start typing a subject — your prompt appears here instantly."}
          </output>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!prompt}
              onClick={() => copyText(prompt, "copied")}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-fg disabled:opacity-40"
            >
              {flash === "copied" ? "Copied ✓" : "Copy prompt"}
            </button>
            <button
              type="button"
              disabled={!prompt}
              onClick={() =>
                copyText(`${window.location.origin}${window.location.pathname}?${query}`, "linkCopied")
              }
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              {flash === "linkCopied" ? "Link copied ✓" : "Copy share link"}
            </button>
          </div>

          <p className="mt-3 text-xs text-muted">
            Everything runs in your browser. Nothing is uploaded or stored on a server.
          </p>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent prompts</h2>
              <button
                type="button"
                onClick={() => {
                  clearHistory();
                  setHistory([]);
                }}
                className="text-xs text-muted hover:text-text"
              >
                Clear
              </button>
            </div>
            <ul className="max-h-64 space-y-1 overflow-auto">
              {history.map((h) => (
                <li key={h.at}>
                  <button
                    type="button"
                    onClick={() => restore(h)}
                    className="w-full truncate rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-2"
                    title={h.prompt}
                  >
                    {h.prompt.split("\n")[0]}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted">Saved only on this device.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
  autoFocus,
}: {
  id: FieldKey;
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
      {options.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((o) => (
            <Chip key={o} active={value === o} onClick={() => onChange(value === o ? "" : o)}>
              {o}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs ${
        active
          ? "border-accent bg-accent-soft text-text"
          : "border-border bg-surface text-muted hover:border-accent hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
