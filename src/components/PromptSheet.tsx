"use client";

import type { Segment, SegmentKind } from "@/lib/prompt";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<SegmentKind, string | undefined> = {
  plain: undefined,
  subject: "Subject",
  style: "Style",
  environment: "Setting",
  lighting: "Light",
  camera: "Angle",
  lens: "Lens",
  composition: "Framing",
  mood: "Mood",
  color: "Colour",
  param: "Parameter",
  negative: "Avoid",
};

/**
 * The prompt as a typeset sheet. Field values carry a hairline underline so
 * users can see where each part came from; hovering names the field.
 * Visible text === buildPrompt(state), verified in tests.
 */
export function PromptSheet({
  segments,
  hovered,
  onHover,
}: {
  segments: Segment[];
  hovered: SegmentKind | null;
  onHover: (k: SegmentKind | null) => void;
}) {
  return (
    <p className="font-mono text-[14.5px] leading-[29px] break-words whitespace-pre-wrap text-ink-soft" data-testid="prompt-text">
      {segments.map((s, i) => {
        const label = KIND_LABEL[s.kind];
        if (!label) return <span key={i}>{s.text}</span>;
        const isSubject = s.kind === "subject";
        const isParam = s.kind === "param";
        const isNeg = s.kind === "negative";
        return (
          <span
            key={i}
            title={label}
            data-kind={s.kind}
            onMouseEnter={() => onHover(s.kind)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              "rounded-[3px] decoration-1 underline-offset-[6px] transition-colors duration-150",
              isSubject && "font-semibold text-foreground",
              !isSubject && !isParam && !isNeg && "text-foreground underline decoration-dotted decoration-muted-foreground/40",
              isParam && "text-primary",
              isNeg && "text-muted-foreground italic",
              hovered === s.kind && "bg-mark underline decoration-primary",
            )}
          >
            {s.text}
          </span>
        );
      })}
    </p>
  );
}
