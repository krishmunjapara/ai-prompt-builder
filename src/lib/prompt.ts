export const TARGETS = ["midjourney", "sdxl", "flux", "dalle", "generic"] as const;
export type Target = (typeof TARGETS)[number];

export const TARGET_LABELS: Record<Target, string> = {
  midjourney: "Midjourney",
  sdxl: "Stable Diffusion",
  flux: "Flux",
  dalle: "DALL·E / GPT",
  generic: "Any model",
};

export interface PromptState {
  subject: string;
  style: string;
  environment: string;
  lighting: string;
  camera: string;
  lens: string;
  composition: string;
  mood: string;
  color: string;
  ratio: string;
  negative: string;
  target: Target;
}

export const FIELD_KEYS = [
  "subject",
  "style",
  "environment",
  "lighting",
  "camera",
  "lens",
  "composition",
  "mood",
  "color",
] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];

export function emptyState(): PromptState {
  return {
    subject: "",
    style: "",
    environment: "",
    lighting: "",
    camera: "",
    lens: "",
    composition: "",
    mood: "",
    color: "",
    ratio: "",
    negative: "",
    target: "midjourney",
  };
}

/* ------------------------------------------------------------------ */
/* Segments — the single source of truth for the rendered prompt.      */
/* buildPrompt() is just segments joined, so what users see coloured   */
/* is exactly what they copy.                                          */
/* ------------------------------------------------------------------ */

export type SegmentKind = FieldKey | "plain" | "param" | "negative";
export interface Segment {
  kind: SegmentKind;
  text: string;
}

const clean = (v: string) => v.replace(/\s+/g, " ").trim();

/** SDXL-native buckets; also good ~1MP sizes for Flux. */
export const PIXEL_SIZES: Record<string, string> = {
  "1:1": "1024 × 1024",
  "16:9": "1344 × 768",
  "9:16": "768 × 1344",
  "4:5": "896 × 1152",
  "3:2": "1216 × 832",
  "2:3": "832 × 1216",
  "4:3": "1152 × 896",
  "3:4": "896 × 1152",
  "21:9": "1536 × 640",
};

function orientationWords(ratio: string): string {
  const [w, h] = ratio.split(":").map(Number);
  if (!w || !h) return `${ratio} aspect ratio`;
  if (w === h) return "Square format";
  return w > h ? "Wide landscape format" : "Tall portrait format";
}

export function buildSegments(state: PromptState): Segment[] {
  const out: Segment[] = [];
  const push = (kind: SegmentKind, text: string) => {
    if (text) out.push({ kind, text });
  };

  const subject = clean(state.subject);
  const style = clean(state.style);
  const environment = clean(state.environment);

  if (style) push("style", style);
  if (style && subject) push("plain", " of ");
  if (subject) push("subject", subject);
  if ((style || subject) && environment) push("plain", " in ");
  if (environment) push("environment", environment);

  const details: FieldKey[] = ["lighting", "camera", "lens", "composition", "mood", "color"];
  for (const key of details) {
    const v = clean(state[key]);
    if (!v) continue;
    if (out.length) push("plain", ", ");
    push(key, v);
  }

  if (out.length === 0) return [];

  // Capitalise the very first character.
  out[0] = { ...out[0], text: out[0].text[0].toUpperCase() + out[0].text.slice(1) };

  const ratio = clean(state.ratio);
  const negative = clean(state.negative);

  switch (state.target) {
    case "midjourney":
      if (ratio) {
        push("plain", " ");
        push("param", `--ar ${ratio}`);
      }
      if (negative) {
        push("plain", " ");
        push("param", "--no ");
        push("negative", negative);
      }
      break;
    case "sdxl":
      push("plain", ".");
      if (negative) {
        push("plain", "\nNegative prompt: ");
        push("negative", negative);
      }
      break;
    case "flux":
      push("plain", ".");
      break;
    case "dalle":
      push("plain", ".");
      if (ratio) {
        push("plain", " ");
        push("param", `${orientationWords(ratio)}.`);
      }
      if (negative) {
        push("plain", " Avoid ");
        push("negative", negative);
        push("plain", ".");
      }
      break;
    default:
      if (ratio) {
        push("plain", ", ");
        push("param", `${ratio} aspect ratio`);
      }
      push("plain", ".");
      if (negative) {
        push("plain", "\nNegative prompt: ");
        push("negative", negative);
      }
  }
  return out;
}

export function buildPrompt(state: PromptState): string {
  return buildSegments(state)
    .map((s) => s.text)
    .join("");
}

/** Honest, model-specific notes shown under the prompt. */
export function targetNotes(state: PromptState): string[] {
  const notes: string[] = [];
  const ratio = clean(state.ratio);
  const negative = clean(state.negative);
  if ((state.target === "sdxl" || state.target === "flux") && ratio) {
    const px = PIXEL_SIZES[ratio];
    notes.push(
      px
        ? `Set the image size to ${px} in your app for ${ratio}.`
        : `Set the image size to ${ratio} in your app.`,
    );
  }
  if (state.target === "flux" && negative) {
    notes.push("Flux doesn’t support negative prompts, so “avoid” was left out.");
  }
  return notes;
}

/* ------------------------------------------------------------------ */
/* Share-link encoding                                                 */
/* ------------------------------------------------------------------ */

const PARAM_MAP: Record<keyof PromptState, string> = {
  subject: "s",
  style: "st",
  environment: "e",
  lighting: "l",
  camera: "c",
  lens: "le",
  composition: "co",
  mood: "m",
  color: "cl",
  ratio: "r",
  negative: "n",
  target: "t",
};

const isTarget = (v: string): v is Target => (TARGETS as readonly string[]).includes(v);

export function encodeState(state: PromptState): string {
  const p = new URLSearchParams();
  (Object.keys(PARAM_MAP) as (keyof PromptState)[]).forEach((key) => {
    const value = state[key];
    if (key === "target") {
      if (value !== "midjourney") p.set(PARAM_MAP[key], value);
      return;
    }
    if (value) p.set(PARAM_MAP[key], value);
  });
  return p.toString();
}

export function decodeState(params: URLSearchParams): PromptState {
  const state = emptyState();
  (Object.keys(PARAM_MAP) as (keyof PromptState)[]).forEach((key) => {
    const raw = params.get(PARAM_MAP[key]);
    if (raw === null) return;
    if (key === "target") {
      if (isTarget(raw)) state.target = raw;
      return;
    }
    state[key] = raw.slice(0, 200);
  });
  return state;
}
