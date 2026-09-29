"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import type { Segment, SegmentKind } from "@/lib/segments";

const KIND_CLASS: Record<SegmentKind, string> = {
  plain: "text-muted-foreground",
  subject: "text-foreground font-semibold",
  style: "text-violet-600 dark:text-violet-300",
  environment: "text-emerald-600 dark:text-emerald-300",
  lighting: "text-amber-600 dark:text-amber-300",
  camera: "text-sky-600 dark:text-sky-300",
  lens: "text-sky-600 dark:text-sky-300",
  composition: "text-fuchsia-600 dark:text-fuchsia-300",
  mood: "text-rose-600 dark:text-rose-300",
  color: "text-orange-600 dark:text-orange-300",
  ratio: "rounded-md bg-primary/12 px-1.5 py-0.5 font-medium text-primary",
  negative: "text-red-600/90 line-through decoration-red-500/40 dark:text-red-300/90",
};

const KIND_LABEL: Partial<Record<SegmentKind, string>> = {
  subject: "subject",
  style: "style",
  environment: "environment",
  lighting: "lighting",
  camera: "camera",
  lens: "lens",
  composition: "composition",
  mood: "mood",
  color: "color",
  ratio: "aspect ratio",
  negative: "negative",
};

/**
 * Renders the prompt with each part colour-coded. The visible text equals the
 * plain prompt string (verified in segments.test.ts), so screen readers and
 * copy/paste get exactly what the user expects.
 */
export function PromptPreview({ segments, empty }: { segments: Segment[]; empty: string }) {
  // Caret blinks for ~3s after every change: a CSS animation re-triggered by
  // keying the element on the prompt text. Pure — no state, no effect.
  const text = segments.map((s) => s.text).join("");

  if (segments.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-muted-foreground/80">
        {empty}
        <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-blink bg-primary/70 align-baseline" />
      </p>
    );
  }

  return (
    <p className="whitespace-pre-wrap font-mono text-[15px] leading-[1.75]">
      <AnimatePresence initial={false}>
        {segments.map((seg, i) => (
          <m.span
            key={`${i}-${seg.kind}`}
            layout="position"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={KIND_CLASS[seg.kind]}
            title={KIND_LABEL[seg.kind]}
          >
            {seg.text}
          </m.span>
        ))}
      </AnimatePresence>
      <span
        key={text}
        aria-hidden
        className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-primary align-baseline [animation:blink_1s_steps(2,start)_3,fade-out_0s_linear_3s_forwards]"
      />
    </p>
  );
}

