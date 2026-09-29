"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import {
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  DicesIcon,
  HistoryIcon,
  LinkIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PromptSheet } from "@/components/PromptSheet";
import { RefineRow } from "@/components/RefineRow";
import type { AiFields } from "@/lib/ai";
import { expandIdea } from "@/lib/expand-client";
import { addToHistory, clearHistory, readHistory, type HistoryItem } from "@/lib/history";
import { EXAMPLES, IDEAS, NEGATIVE_PRESETS, RATIOS, REFINE_FIELDS } from "@/lib/presets";
import {
  buildPrompt,
  buildSegments,
  decodeState,
  emptyState,
  encodeState,
  targetNotes,
  TARGET_LABELS,
  TARGETS,
  type PromptState,
  type SegmentKind,
} from "@/lib/prompt";
import { cn } from "@/lib/utils";

type Phase = "idle" | "thinking" | "done";

const MIN_IDEA = 3;

export function Composer() {
  const [state, setState] = useState<PromptState>(emptyState);
  const [phase, setPhase] = useState<Phase>("idle");
  const [developKey, setDevelopKey] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState<"prompt" | "link" | null>(null);
  const [hovered, setHovered] = useState<SegmentKind | null>(null);
  const [lastFill, setLastFill] = useState<PromptState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const saveTimer = useRef<number | null>(null);
  const ideaRef = useRef<HTMLTextAreaElement>(null);

  /* ---------- hydrate from URL + local history ---------- */
  useEffect(() => {
    let live = true;
    queueMicrotask(() => {
      if (!live) return;
      const params = new URLSearchParams(window.location.search);
      if ([...params.keys()].length) setState(decodeState(params));
      setHistory(readHistory());
      setHydrated(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const segments = useMemo(() => buildSegments(state), [state]);
  const prompt = useMemo(() => buildPrompt(state), [state]);
  const notes = useMemo(() => targetNotes(state), [state]);
  const query = useMemo(() => encodeState(state), [state]);
  const words = prompt ? prompt.split(/\s+/).filter(Boolean).length : 0;
  const refined = REFINE_FIELDS.filter((f) => state[f.key].trim()).length;

  /* ---------- address bar = share link ---------- */
  useEffect(() => {
    if (!hydrated) return;
    window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [query, hydrated]);

  /* ---------- local history after a pause ---------- */
  useEffect(() => {
    if (!hydrated || !prompt) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setHistory(addToHistory(prompt, query)), 1500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [prompt, query, hydrated]);

  const set = useCallback(<K extends keyof PromptState>(k: K, v: PromptState[K]) => {
    setState((s) => ({ ...s, [k]: v }));
  }, []);

  /* ---------- AI: idea → structured fields ---------- */
  const develop = useCallback(async () => {
    const idea = state.subject.trim();
    if (idea.length < MIN_IDEA) {
      ideaRef.current?.focus();
      toast("Describe your idea first", { description: "A few words is enough — e.g. “a fox in the first snow”." });
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase("thinking");
    const before = state;
    try {
      const { fields: f } = await expandIdea(idea, state, ctrl.signal);
      setLastFill(before);
      setState((s) => {
        const next = { ...s };
        // Only fill fields the user left empty — never overwrite their choices.
        (Object.keys(f) as (keyof AiFields)[]).forEach((k) => {
          const v = f[k];
          if (!v) return;
          if (k === "subject") next.subject = v;
          else if (!s[k].trim()) next[k] = v;
        });
        return next;
      });
      setDevelopKey((k) => k + 1);
      setPhase("done");
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setPhase("idle");
      toast.error((e as Error).message || "Something went wrong.");
    }
  }, [state]);

  const undoFill = () => {
    if (!lastFill) return;
    setState(lastFill);
    setLastFill(null);
    setPhase("idle");
  };

  /* ---------- copy / share ---------- */
  const flash = (k: "prompt" | "link") => {
    setCopied(k);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(null), 1600);
  };

  const copyPrompt = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      flash("prompt");
      toast.success("Prompt copied", { description: `Paste it into ${TARGET_LABELS[state.target]}.` });
    } catch {
      toast.error("Clipboard blocked — select the text and copy it manually.");
    }
  }, [prompt, state.target]);

  const copyLink = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${query}`);
      flash("link");
      toast.success("Link copied", { description: "Opens with every field filled in." });
    } catch {
      toast.error("Clipboard blocked — copy the address bar instead.");
    }
  }, [prompt, query]);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "Enter" && document.activeElement === ideaRef.current) {
        e.preventDefault();
        void develop();
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        void copyPrompt();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [develop, copyPrompt]);

  const surprise = () => {
    const pool = IDEAS.filter((i) => i !== state.subject);
    set("subject", pool[Math.floor(Math.random() * pool.length)]);
    ideaRef.current?.focus();
  };

  const loadExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setLastFill(null);
    setState({ ...emptyState(), target: state.target, ...ex.values });
    setDevelopKey((k) => k + 1);
    setPhase("done");
  };

  const reset = () => {
    abortRef.current?.abort();
    setState((s) => ({ ...emptyState(), target: s.target }));
    setPhase("idle");
    setLastFill(null);
    ideaRef.current?.focus();
  };

  const thinking = phase === "thinking";

  return (
    <div id="composer" className="grid scroll-mt-6 gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      {/* =============================== LEFT =============================== */}
      <div className="min-w-0">
        {/* Idea box */}
        <div
          className={cn(
            "rounded-xl border bg-card transition-[border-color,box-shadow] duration-300 sheet-shadow",
            "focus-within:border-foreground/30",
            thinking && "border-primary/50",
          )}
        >
          <label htmlFor="idea" className="sr-only">
            Subject
          </label>
          <textarea
            id="idea"
            ref={ideaRef}
            value={state.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Describe your image in a few words…"
            rows={3}
            maxLength={300}
            autoFocus
            spellCheck
            className="block w-full resize-none bg-transparent px-5 pt-5 pb-2 font-serif text-[26px] leading-[1.25] tracking-[-0.01em] text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-[30px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-1 pb-3 sm:px-4">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={surprise}
                    className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-[13px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    <DicesIcon className="size-4" />
                    Surprise me
                  </button>
                </TooltipTrigger>
                <TooltipContent>Fill in a random idea</TooltipContent>
              </Tooltip>
              {(prompt || state.subject) && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-[13px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <RotateCcwIcon className="size-3.5" />
                  Start over
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-[12px] text-muted-foreground sm:inline">
                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>↵</Kbd>
                </KbdGroup>
              </span>
              <button
                type="button"
                onClick={thinking ? () => abortRef.current?.abort() : develop}
                aria-busy={thinking}
                className={cn(
                  "relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-lg px-4 text-[14px] font-medium transition",
                  "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]",
                  "disabled:opacity-50",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {thinking ? (
                    <m.span
                      key="t"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="inline-flex items-center gap-2"
                    >
                      <span className="size-2 rounded-full bg-primary animate-safelight" />
                      Developing…
                    </m.span>
                  ) : (
                    <m.span
                      key="i"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="inline-flex items-center gap-2"
                    >
                      Write my prompt
                      <ArrowUpIcon className="size-4 rotate-45" />
                    </m.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 pl-1">
          <span className="mr-2 text-[12.5px] text-muted-foreground">Or open an example:</span>
          <div className="contents">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => loadExample(ex.id)}
                className="rounded-sm px-1.5 py-1 text-[13px] text-foreground/80 underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-primary"
              >
                {ex.title}
              </button>
            ))}
          </div>
        </div>

        {/* Target model */}
        <section className="mt-12" aria-labelledby="target-h">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="target-h" className="text-[13px] font-medium text-foreground">
              Writing for
            </h2>
            <span className="text-[12px] text-muted-foreground">Syntax changes per model</span>
          </div>
          <div role="radiogroup" aria-labelledby="target-h" className="flex flex-wrap gap-1.5">
            {TARGETS.map((t) => {
              const on = state.target === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set("target", t)}
                  className={cn(
                    "relative h-9 rounded-md px-3.5 text-[13.5px] transition-colors",
                    on ? "text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {on && (
                    <m.span
                      layoutId="target-pill"
                      className="absolute inset-0 rounded-md bg-foreground"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{TARGET_LABELS[t]}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Refine */}
        <section className="mt-12" aria-labelledby="refine-h">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 id="refine-h" className="text-[13px] font-medium text-foreground">
              Refine the shot
            </h2>
            <span className="text-[12px] text-muted-foreground tabular">
              {refined} of {REFINE_FIELDS.length} set
            </span>
          </div>
          <p className="mb-2 text-[12.5px] text-muted-foreground">
            Anything you set here stays — the AI only fills the blanks.
          </p>
          <div className="border-t border-border/70" key={developKey}>
            {REFINE_FIELDS.map((f) => (
              <RefineRow
                key={f.key}
                def={f}
                value={state[f.key]}
                onChange={(v) => set(f.key, v)}
                developing={developKey > 0}
              />
            ))}

            {/* Ratio */}
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3 border-b border-border/70 py-2.5 sm:grid-cols-[112px_minmax(0,1fr)]">
              <span className="flex items-center gap-2 text-[13px] text-muted-foreground" id="ratio-l">
                <span aria-hidden className={cn("size-1.5 rounded-full", state.ratio ? "bg-primary" : "bg-border")} />
                Ratio
              </span>
              <div role="radiogroup" aria-labelledby="ratio-l" className="flex flex-wrap gap-1">
                {RATIOS.map((r) => {
                  const on = state.ratio === r.value;
                  return (
                    <Tooltip key={r.value}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`${r.value} ${r.label}`}
                          onClick={() => set("ratio", on ? "" : r.value)}
                          className={cn(
                            "inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-mono text-[12px] transition-colors",
                            on
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <RatioGlyph ratio={r.value} />
                          {r.value}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{r.label}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Negative */}
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3 border-b border-border/70 py-1.5 sm:grid-cols-[112px_minmax(0,1fr)]">
              <label htmlFor="neg" className="flex h-9 items-center gap-2 text-[13px] text-muted-foreground">
                <span aria-hidden className={cn("size-1.5 rounded-full", state.negative ? "bg-primary" : "bg-border")} />
                Avoid
              </label>
              <div className="min-w-0">
                <input
                  id="neg"
                  value={state.negative}
                  onChange={(e) => set("negative", e.target.value)}
                  placeholder="text, watermark, logo"
                  autoComplete="off"
                  className={cn(
                    "h-9 w-full rounded-md bg-transparent px-2 text-[15px] outline-none placeholder:text-muted-foreground/55 hover:bg-accent/60 focus:bg-accent/80",
                    developKey > 0 && state.negative && "animate-develop",
                  )}
                />
                <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 pb-1.5">
                  {NEGATIVE_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("negative", state.negative === n ? "" : n)}
                      className={cn(
                        "text-[12px] underline-offset-4 transition hover:underline",
                        state.negative === n ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      + {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =============================== RIGHT =============================== */}
      <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start" aria-label="Your prompt">
        <div className="overflow-hidden rounded-xl border bg-card sheet-shadow">
          {/* sheet head */}
          <div className="flex items-center justify-between border-b border-border/70 bg-card px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full transition-colors",
                  thinking ? "bg-primary animate-safelight" : prompt ? "bg-primary" : "bg-border",
                )}
              />
              <h2 className="text-[13px] font-medium">
                Prompt <span className="text-muted-foreground">· {TARGET_LABELS[state.target]}</span>
              </h2>
            </div>
            <span className="font-mono text-[11.5px] text-muted-foreground tabular" aria-live="polite">
              {words} {words === 1 ? "word" : "words"}
            </span>
          </div>

          {/* sheet body */}
          <div className="ruled min-h-[261px] px-5 pt-4 pb-6" data-testid="prompt-output">
            <AnimatePresence mode="wait" initial={false}>
              {thinking ? (
                <m.div key="think" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-[17px] pt-[9px]">
                  {[92, 78, 86, 60].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-full bg-mark animate-safelight"
                      style={{ width: `${w}%`, animationDelay: `${i * 140}ms` }}
                    />
                  ))}
                  <p className="pt-2 text-[12.5px] text-muted-foreground">Setting up the shot…</p>
                </m.div>
              ) : prompt ? (
                <m.div key={`p-${developKey}`} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                  <PromptSheet segments={segments} hovered={hovered} onHover={setHovered} />
                </m.div>
              ) : (
                <m.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="font-serif text-[22px] leading-[29px] text-foreground/80 italic">
                    Your prompt will be written here.
                  </p>
                  <ol className="mt-[29px] text-[13.5px] leading-[29px] text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-mono text-[11px] text-primary tabular">01</span>Describe the image in a few words.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-[11px] text-primary tabular">02</span>Press <em className="not-italic text-foreground">Write my prompt</em> — AI sets up light, lens and framing.
                    </li>
                    <li className="flex gap-3">
                      <span className="font-mono text-[11px] text-primary tabular">03</span>Tweak any line, then copy.
                    </li>
                  </ol>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* notes */}
          <AnimatePresence initial={false}>
            {notes.length > 0 && !thinking && (
              <m.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/70 bg-card px-5 text-[12.5px] text-muted-foreground"
              >
                {notes.map((n) => (
                  <li key={n} className="py-2.5">
                    {n}
                  </li>
                ))}
              </m.ul>
            )}
          </AnimatePresence>

          {/* actions */}
          <div className="flex items-center gap-2 border-t border-border/70 bg-card p-3">
            <button
              type="button"
              onClick={copyPrompt}
              disabled={!prompt || thinking}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-medium text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={copied === "prompt" ? "y" : "n"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.14 }}
                  className="inline-flex items-center gap-2"
                >
                  {copied === "prompt" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                  {copied === "prompt" ? "Copied" : "Copy prompt"}
                </m.span>
              </AnimatePresence>
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={copyLink}
                  disabled={!prompt || thinking}
                  aria-label="Copy share link"
                  className="inline-flex size-10 items-center justify-center rounded-lg border bg-background text-foreground transition hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                >
                  {copied === "link" ? <CheckIcon className="size-4 text-primary" /> : <LinkIcon className="size-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>Copy share link</TooltipContent>
            </Tooltip>
            <HistoryButton
              items={history}
              onPick={(h) => h.query && setState(decodeState(new URLSearchParams(h.query)))}
              onClear={() => {
                clearHistory();
                setHistory([]);
              }}
            />
          </div>
        </div>

        {/* post-AI affordance */}
        <div className="mt-3 flex min-h-8 items-center justify-between px-1 text-[12.5px] text-muted-foreground">
          <AnimatePresence>
            {lastFill && phase === "done" && (
              <m.button
                type="button"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={undoFill}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                <RotateCcwIcon className="size-3.5" /> Undo AI fill
              </m.button>
            )}
          </AnimatePresence>
          <span className="ml-auto hidden sm:inline">
            Copy <Kbd>Ctrl</Kbd> <Kbd>⇧</Kbd> <Kbd>↵</Kbd>
          </span>
        </div>
      </aside>

      {/* ============================ Mobile bar ============================ */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden">
        <div className="flex items-center gap-3">
          <p className={cn("line-clamp-2 min-w-0 flex-1 font-mono text-[11.5px] leading-snug", !prompt && "text-muted-foreground")}>
            {prompt ? prompt.split("\n")[0] : "Your prompt appears here"}
          </p>
          <button
            type="button"
            onClick={copyPrompt}
            disabled={!prompt || thinking}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-medium text-primary-foreground disabled:opacity-40"
          >
            {copied === "prompt" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
            {copied === "prompt" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryButton({
  items,
  onPick,
  onClear,
}: {
  items: HistoryItem[];
  onPick: (h: HistoryItem) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Recent prompts"
              className="relative inline-flex size-10 items-center justify-center rounded-lg border bg-background text-foreground transition hover:bg-accent"
            >
              <HistoryIcon className="size-4" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9.5px] text-background tabular">
                  {items.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Recent prompts</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-[min(380px,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-[12.5px] font-medium">Recent · on this device</p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              <Trash2Icon className="size-3" /> Clear
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">Prompts you write are kept here.</p>
        ) : (
          <ul className="max-h-80 overflow-auto p-1">
            {items.map((h) => (
              <li key={h.at}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(h);
                    setOpen(false);
                  }}
                  className="block w-full rounded-sm px-2.5 py-2 text-left font-mono text-[12px] leading-relaxed text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <span className="line-clamp-2">{h.prompt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function RatioGlyph({ ratio }: { ratio: string }) {
  const [w, h] = ratio.split(":").map(Number);
  const s = 11 / Math.max(w, h);
  return (
    <span
      aria-hidden
      className="inline-block rounded-[1.5px] border border-current"
      style={{ width: Math.max(4, Math.round(w * s)), height: Math.max(4, Math.round(h * s)) }}
    />
  );
}
