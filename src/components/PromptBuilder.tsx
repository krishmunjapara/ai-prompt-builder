"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import {
  ApertureIcon,
  CameraIcon,
  CheckIcon,
  CopyIcon,
  EraserIcon,
  HistoryIcon,
  ImageIcon,
  LinkIcon,
  MapPinIcon,
  PaletteIcon,
  RatioIcon,
  ShieldCheckIcon,
  SmileIcon,
  SparklesIcon,
  SunIcon,
  Trash2Icon,
  WandSparklesIcon,
  BanIcon,
  FrameIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Chip, FieldRow } from "@/components/FieldRow";
import { PromptPreview } from "@/components/PromptPreview";
import { addToHistory, clearHistory, readHistory, type HistoryItem } from "@/lib/history";
import { FIELDS, NEGATIVE_PRESETS, RATIOS, TEMPLATES } from "@/lib/presets";
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
import { buildSegments } from "@/lib/segments";
import { cn } from "@/lib/utils";

const FIELD_ICON: Record<FieldKey, React.ReactNode> = {
  subject: <ImageIcon />,
  style: <WandSparklesIcon />,
  environment: <MapPinIcon />,
  lighting: <SunIcon />,
  camera: <CameraIcon />,
  lens: <ApertureIcon />,
  composition: <FrameIcon />,
  mood: <SmileIcon />,
  color: <PaletteIcon />,
};

const EMPTY_HINT = "Start with a subject — your prompt writes itself here as you type.";

export function PromptBuilder() {
  const [state, setState] = useState<PromptState>(emptyState);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState<"prompt" | "link" | null>(null);
  const saveTimer = useRef<number | null>(null);
  const copiedTimer = useRef<number | null>(null);

  // Restore from a share link and load history once on the client.
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
  const segments = useMemo(() => buildSegments(state), [state]);
  const query = useMemo(() => encodeState(state), [state]);
  const filledCount = FIELDS.filter((f) => state[f.key].trim()).length + (state.ratio ? 1 : 0);
  const totalCount = FIELDS.length + 1;
  const wordCount = prompt ? prompt.split(/\s+/).filter(Boolean).length : 0;

  // Address bar is always a share link.
  useEffect(() => {
    if (!hydrated) return;
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, hydrated]);

  // Save to local history after the user pauses.
  useEffect(() => {
    if (!hydrated || !prompt) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setHistory(addToHistory(prompt, query)), 1500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [prompt, query, hydrated]);

  const set = useCallback(
    <K extends keyof PromptState>(key: K, value: PromptState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  const flashCopied = (kind: "prompt" | "link") => {
    setCopied(kind);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(null), 1800);
  };

  const copyPrompt = useCallback(async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      flashCopied("prompt");
      toast.success("Prompt copied", { description: `${wordCount} words · ready to paste` });
    } catch {
      toast.error("Clipboard blocked — select the text and copy manually.");
    }
  }, [prompt, wordCount]);

  const copyLink = useCallback(async () => {
    if (!prompt) return;
    try {
      const url = `${window.location.origin}${window.location.pathname}?${query}`;
      await navigator.clipboard.writeText(url);
      flashCopied("link");
      toast.success("Share link copied", { description: "Anyone who opens it sees this exact form." });
    } catch {
      toast.error("Clipboard blocked — copy the URL from the address bar.");
    }
  }, [prompt, query]);

  // ⌘/Ctrl+Enter → copy prompt, ⌘/Ctrl+Shift+K → copy link
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "Enter") {
        e.preventDefault();
        void copyPrompt();
      } else if (e.key.toLowerCase() === "k" && e.shiftKey) {
        e.preventDefault();
        void copyLink();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copyPrompt, copyLink]);

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setState((s) => ({ ...s, ...t.values }));
    toast(`${t.name} template applied`, { description: "Add a subject to finish the prompt." });
  };

  const restore = (item: HistoryItem) => {
    if (!item.query) return;
    setState(decodeState(new URLSearchParams(item.query)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setState(emptyState());
    toast("Cleared");
  };

  return (
    <div className="grid gap-10 pb-28 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 lg:pb-0 xl:grid-cols-[minmax(0,1fr)_440px]">
      {/* ================= LEFT — the form ================= */}
      <div className="space-y-9">
        {/* Templates */}
        <section aria-label="Templates">
          <SectionLabel icon={<SparklesIcon />} title="Start from a template" hint="optional" />
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(t.id)}
                    className="h-9 rounded-full bg-card px-3.5 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {t.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t.description}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </section>

        {/* Target */}
        <section aria-label="Target model">
          <SectionLabel icon={<WandSparklesIcon />} title="Target model" />
          <ToggleGroup
            type="single"
            value={state.target}
            onValueChange={(v) => v && set("target", v as Target)}
            variant="outline"
            spacing={2}
            className="flex flex-wrap gap-2"
            aria-label="Target model"
          >
            {TARGETS.map((t) => (
              <ToggleGroupItem
                key={t}
                value={t}
                className="h-9 rounded-full px-3.5 text-[13px] data-[state=on]:border-primary/40 data-[state=on]:bg-primary/10 data-[state=on]:text-foreground data-[state=on]:shadow-[inset_0_0_0_1px_var(--color-primary)]"
              >
                {TARGET_LABELS[t]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <Separator />

        {/* Fields */}
        {FIELDS.map((f, i) => (
          <FieldRow
            key={f.key}
            step={i + 1}
            label={f.label}
            hint={f.key === "subject" ? "required" : undefined}
            placeholder={f.placeholder}
            value={state[f.key]}
            options={f.options}
            onChange={(v) => set(f.key, v)}
            icon={FIELD_ICON[f.key]}
            autoFocus={f.key === "subject"}
          />
        ))}

        {/* Ratio */}
        <section aria-label="Aspect ratio">
          <SectionLabel icon={<RatioIcon />} title="Aspect ratio" step={FIELDS.length + 1} filled={!!state.ratio} />
          <div className="flex flex-wrap gap-2">
            {RATIOS.map((r) => (
              <Tooltip key={r.value}>
                <TooltipTrigger asChild>
                  <span>
                    <Chip
                      active={state.ratio === r.value}
                      onClick={() => set("ratio", state.ratio === r.value ? "" : r.value)}
                      className="font-mono"
                    >
                      <RatioBox ratio={r.value} />
                      {r.value}
                    </Chip>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{r.label}</TooltipContent>
              </Tooltip>
            ))}
            <Input
              value={RATIOS.some((r) => r.value === state.ratio) ? "" : state.ratio}
              onChange={(e) => set("ratio", e.target.value)}
              placeholder="custom · 5:4"
              aria-label="Custom aspect ratio"
              className="h-8 w-32 rounded-full bg-card px-3 font-mono text-[13px] shadow-none"
            />
          </div>
        </section>

        {/* Negative */}
        <section aria-label="Negative prompt">
          <SectionLabel icon={<BanIcon />} title="Negative prompt" hint="what to avoid" />
          <Input
            value={state.negative}
            onChange={(e) => set("negative", e.target.value)}
            placeholder="e.g. blurry, text, watermark"
            aria-label="Negative prompt"
            className="h-11 rounded-xl bg-card text-[15px] shadow-none focus-visible:shadow-[0_0_0_4px_var(--color-glow)]"
          />
          <div className="mt-2.5 flex flex-wrap gap-2">
            {NEGATIVE_PRESETS.map((n) => (
              <Chip key={n} active={state.negative === n} onClick={() => set("negative", state.negative === n ? "" : n)}>
                {n}
              </Chip>
            ))}
          </div>
        </section>

        <Button type="button" variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
          <EraserIcon data-icon="inline-start" />
          Clear all
        </Button>
      </div>

      {/* ================= RIGHT — live output ================= */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div
          className="glow-ring rounded-2xl border border-border/80 bg-card p-1 shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_20px_50px_-24px_var(--color-glow)]"
          data-active={prompt ? "true" : "false"}
        >
          <div className="rounded-[calc(var(--radius-2xl)-4px)] bg-card">
            {/* header */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full rounded-full bg-primary opacity-75",
                      prompt && "animate-ping",
                    )}
                  />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                <h2 className="text-sm font-semibold">Your prompt</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
                <span aria-live="polite">{wordCount} words</span>
                <Separator orientation="vertical" className="h-3.5" />
                <span>
                  {filledCount}/{totalCount} filled
                </span>
              </div>
            </div>

            {/* progress */}
            <div className="mx-4 h-1 overflow-hidden rounded-full bg-muted">
              <m.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${(filledCount / totalCount) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 28 }}
              />
            </div>

            {/* body */}
            <div className="px-4 pt-4 pb-3" data-testid="prompt-output">
              <div className="min-h-[148px]">
                <PromptPreview segments={segments} empty={EMPTY_HINT} />
              </div>
            </div>

            {/* actions */}
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    disabled={!prompt}
                    onClick={copyPrompt}
                    className="h-10 shadow-[0_8px_20px_-8px_var(--color-glow)]"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <m.span
                        key={copied === "prompt" ? "done" : "idle"}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="inline-flex items-center gap-2"
                      >
                        {copied === "prompt" ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                        {copied === "prompt" ? "Copied" : "Copy prompt"}
                      </m.span>
                    </AnimatePresence>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>↵</Kbd>
                  </KbdGroup>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" disabled={!prompt} onClick={copyLink} className="h-10 bg-card">
                    {copied === "link" ? <CheckIcon className="size-4" /> : <LinkIcon className="size-4" />}
                    {copied === "link" ? "Link copied" : "Share link"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>⇧</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-1.5 border-t border-border/70 px-4 py-2.5 text-[11.5px] text-muted-foreground">
              <ShieldCheckIcon className="size-3.5 text-emerald-500" />
              Runs entirely in your browser. Nothing is uploaded.
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 px-1 text-[11px] text-muted-foreground">
          <LegendDot className="bg-violet-500" label="style" />
          <LegendDot className="bg-emerald-500" label="environment" />
          <LegendDot className="bg-amber-500" label="lighting" />
          <LegendDot className="bg-sky-500" label="camera · lens" />
          <LegendDot className="bg-fuchsia-500" label="composition" />
          <LegendDot className="bg-rose-500" label="mood" />
          <LegendDot className="bg-orange-500" label="color" />
        </div>

        {/* History */}
        <AnimatePresence initial={false}>
          {history.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-4 rounded-2xl border border-border/80 bg-card"
            >
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <HistoryIcon className="size-4 text-muted-foreground" />
                  Recent prompts
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tabular-nums">
                    {history.length}
                  </Badge>
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                  className="text-muted-foreground"
                >
                  <Trash2Icon data-icon="inline-start" />
                  Clear
                </Button>
              </div>
              <ScrollArea className="max-h-64 px-2 pb-2">
                <ul className="space-y-0.5">
                  {history.map((h) => (
                    <li key={h.at}>
                      <button
                        type="button"
                        onClick={() => restore(h)}
                        title={h.prompt}
                        className="w-full truncate rounded-lg px-2.5 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {h.prompt.split("\n")[0]}
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <p className="border-t border-border/70 px-4 py-2 text-[11px] text-muted-foreground">
                Saved only on this device.
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </aside>

      {/* ================= Mobile sticky bar ================= */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 glass px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] lg:hidden"
        aria-hidden
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Your prompt · {wordCount} words
            </p>
            <p className={cn("line-clamp-1 font-mono text-xs", !prompt && "text-muted-foreground")}>
              {prompt ? prompt.split("\n")[0] : "Appears here as you type."}
            </p>
          </div>
          <Button type="button" size="sm" disabled={!prompt} onClick={copyPrompt} className="h-9 shrink-0 px-3.5">
            {copied === "prompt" ? <CheckIcon /> : <CopyIcon />}
            {copied === "prompt" ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  icon,
  title,
  hint,
  step,
  filled,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  step?: number;
  filled?: boolean;
}) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      {step !== undefined && (
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold tabular-nums transition-colors",
            filled ? "border-primary/40 bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
          )}
          aria-hidden
        >
          {filled ? <CheckIcon className="size-3.5" /> : step}
        </span>
      )}
      <span className="text-muted-foreground [&>svg]:size-4" aria-hidden>
        {icon}
      </span>
      <h3 className="text-sm font-medium">{title}</h3>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function RatioBox({ ratio }: { ratio: string }) {
  const [w, h] = ratio.split(":").map(Number);
  const scale = 12 / Math.max(w, h);
  return (
    <span
      aria-hidden
      className="inline-block rounded-[2px] border border-current opacity-70"
      style={{ width: Math.max(4, w * scale), height: Math.max(4, h * scale) }}
    />
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", className)} />
      {label}
    </span>
  );
}

