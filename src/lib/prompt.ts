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

const clean = (v: string) => v.replace(/\s+/g, " ").trim();
const capitalize = (v: string) => (v ? v[0].toUpperCase() + v.slice(1) : v);

/**
 * Turns the form state into one natural prompt sentence.
 * Order: [style of] subject [in environment], lighting, camera, lens,
 * composition, mood, color, then the aspect ratio in the target's syntax.
 */
export function buildPrompt(state: PromptState): string {
  const subject = clean(state.subject);
  const style = clean(state.style);
  const environment = clean(state.environment);

  let head = "";
  if (style && subject) head = `${style} of ${subject}`;
  else head = style || subject;
  if (head && environment) head = `${head} in ${environment}`;

  const details = [
    state.lighting,
    state.camera,
    state.lens,
    state.composition,
    state.mood,
    state.color,
  ]
    .map(clean)
    .filter(Boolean);

  const parts = [head, ...details].filter(Boolean);
  if (parts.length === 0) return "";

  let text = capitalize(parts.join(", "));

  const ratio = clean(state.ratio);
  if (ratio && state.target === "midjourney") {
    text = `${text} --ar ${ratio}`;
  } else if (ratio) {
    text = `${text}, ${ratio} aspect ratio.`;
  } else {
    text = `${text}.`;
  }

  const negative = clean(state.negative);
  if (negative) text = `${text}\n\nNegative prompt: ${negative}`;

  return text;
}

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

/** Serialises non-empty fields to a short query string (for share links). */
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
    state[key] = raw;
  });
  return state;
}
