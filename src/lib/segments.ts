import type { PromptState } from "./prompt";

export type SegmentKind =
  | "style"
  | "subject"
  | "environment"
  | "lighting"
  | "camera"
  | "lens"
  | "composition"
  | "mood"
  | "color"
  | "ratio"
  | "negative"
  | "plain";

export interface Segment {
  kind: SegmentKind;
  text: string;
}

const clean = (v: string) => v.replace(/\s+/g, " ").trim();

/**
 * Same wording as buildPrompt(), but returns tagged segments so the UI can
 * colour each part. Joining segment texts reproduces buildPrompt() exactly —
 * this is asserted by a unit test.
 */
export function buildSegments(state: PromptState): Segment[] {
  const subject = clean(state.subject);
  const style = clean(state.style);
  const environment = clean(state.environment);

  const segs: Segment[] = [];
  const push = (kind: SegmentKind, text: string) => text && segs.push({ kind, text });

  // head: [style of] subject [in environment]
  if (style && subject) {
    push("style", style);
    push("plain", " of ");
    push("subject", subject);
  } else if (style) {
    push("style", style);
  } else if (subject) {
    push("subject", subject);
  }
  if (segs.length && environment) {
    push("plain", " in ");
    push("environment", environment);
  }

  const details: [SegmentKind, string][] = [
    ["lighting", clean(state.lighting)],
    ["camera", clean(state.camera)],
    ["lens", clean(state.lens)],
    ["composition", clean(state.composition)],
    ["mood", clean(state.mood)],
    ["color", clean(state.color)],
  ];
  for (const [kind, text] of details) {
    if (!text) continue;
    if (segs.length) push("plain", ", ");
    push(kind, text);
  }

  if (segs.length === 0) return [];

  // Capitalise the very first character, whatever segment it belongs to.
  segs[0] = { ...segs[0], text: segs[0].text[0].toUpperCase() + segs[0].text.slice(1) };

  const ratio = clean(state.ratio);
  if (ratio && state.target === "midjourney") {
    push("plain", " ");
    push("ratio", `--ar ${ratio}`);
  } else if (ratio) {
    push("plain", ", ");
    push("ratio", `${ratio} aspect ratio`);
    push("plain", ".");
  } else {
    push("plain", ".");
  }

  const negative = clean(state.negative);
  if (negative) {
    push("plain", "\n\nNegative prompt: ");
    push("negative", negative);
  }
  return segs;
}
