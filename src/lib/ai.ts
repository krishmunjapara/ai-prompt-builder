import { TARGET_LABELS, type FieldKey, type PromptState } from "./prompt";

/** Fields the AI is allowed to fill. Anything else it returns is dropped. */
export const AI_FIELDS = [
  "subject",
  "style",
  "environment",
  "lighting",
  "camera",
  "lens",
  "composition",
  "mood",
  "color",
  "negative",
] as const;
export type AiField = (typeof AI_FIELDS)[number];
export type AiFields = Partial<Record<AiField, string>>;

export const SYSTEM_PROMPT = `You are a senior art director who writes image-generation prompts.
Turn the user's idea into ONE coherent shot, split into fields.

Reply with ONLY a minified JSON object (no prose, no code fences) with these keys:
subject, style, environment, lighting, camera, lens, composition, mood, color, negative.

Field rules:
- subject: the idea as a clear noun phrase that starts with "a", "an" or "the". Keep every word the user wrote and their meaning; you may add 1-4 concrete details (age, material, breed, action). Must read naturally after "<style> of ".
- style: a medium, e.g. "35mm film photograph", "gouache illustration", "isometric 3D render", "cinematic film still".
- environment: where it happens, a noun phrase starting with "a", "an" or "the". Must read naturally after "in ".
- lighting: source and quality of light, e.g. "cold storm light with a warm lantern glow".
- camera: the camera ANGLE only, e.g. "low angle", "eye level", "high angle", "aerial view". Never a camera model.
- lens: a focal length, e.g. "35mm lens", "85mm portrait lens", "24mm wide lens".
- composition: framing, e.g. "medium shot", "wide shot, subject small in frame", "close-up, shallow depth of field".
- mood: 1-3 plain adjectives, e.g. "tense and lonely".
- color: a palette, e.g. "slate blue and amber".
- negative: 3-5 things to avoid for THIS image, comma separated.
All values are short (2-9 words) and lowercase unless a proper noun.
Never use filler: 8k, 4k, masterpiece, best quality, highly detailed, ultra realistic, trending on artstation, award winning, hyperrealistic, octane render, unreal engine.
If a "Locked" object is given, copy those values exactly and build the rest around them.

Example
Idea: a fox in snow
{"subject":"a red fox pausing mid-step, breath visible","style":"wildlife photograph","environment":"a birch forest in the first snow","lighting":"soft overcast daylight","camera":"eye level","lens":"200mm telephoto lens","composition":"rule of thirds, shallow depth of field","mood":"still and quiet","color":"muted whites with rust orange","negative":"text, watermark, blur, extra legs"}`;

const ARTICLE = /^(a|an|the|two|three|several|many|some|one|this|that|his|her|their|my|our)\b/i;

/** Make subject/environment read as noun phrases after "of" / "in". */
function ensureArticle(v: string): string {
  if (!v || ARTICLE.test(v)) return v;
  // Plurals and proper nouns read fine without an article.
  const first = v.split(/[\s,]/)[0];
  if (/^[A-Z]/.test(first) || (/s$/.test(first) && !/ss$/.test(first))) return v;
  return `${/^[aeiou]/i.test(v) ? "an" : "a"} ${v}`;
}

const CAMERA_BODY = /\b(canon|nikon|sony|fuji(film)?|leica|hasselblad|mirrorless|dslr|camera|iphone|gopro)\b/i;

const BUZZWORDS = [
  /\b(?:ultra[- ]?)?(?:4|8|16)k\b(?: resolution| uhd)?/gi,
  /\bmasterpiece\b/gi,
  /\bbest quality\b/gi,
  /\bhigh(?:ly)? detailed\b/gi,
  /\bultra[- ]?(?:realistic|detailed)\b/gi,
  /\bhyper[- ]?realistic\b/gi,
  /\btrending on artstation\b/gi,
  /\baward[- ]winning\b/gi,
  /\boctane render\b/gi,
  /\bunreal engine(?: \d)?\b/gi,
  /\bsharp focus\b/gi,
];

const MAX_LEN = 90;

export function sanitizeValue(raw: string): string {
  let v = raw.replace(/["“”`]/g, "");
  for (const re of BUZZWORDS) v = v.replace(re, "");
  v = v
    .split(",")
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(", ");
  v = v.replace(/[.;:!\s]+$/g, "").trim();
  if (v.length > MAX_LEN) {
    const cut = v.slice(0, MAX_LEN);
    v = cut.slice(0, cut.lastIndexOf(" ")).replace(/[,\s]+$/g, "");
  }
  return v;
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in AI response");
  return JSON.parse(text.slice(start, end + 1));
}

export function parseAiFields(text: string): AiFields {
  const raw = extractJson(text);
  if (!raw || typeof raw !== "object") throw new Error("AI response is not an object");
  const out: AiFields = {};
  for (const key of AI_FIELDS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v !== "string") continue;
    let clean = sanitizeValue(v);
    if (key === "subject" || key === "environment") clean = ensureArticle(clean);
    // "camera" is the angle; drop camera bodies ("mirrorless 35mm camera").
    if (key === "camera" && CAMERA_BODY.test(clean)) continue;
    if (clean) out[key] = clean;
  }
  if (!out.subject) throw new Error("AI response has no subject");
  return out;
}

export function buildUserMessage(idea: string, state: PromptState): string {
  const locked: Partial<Record<FieldKey | "negative", string>> = {};
  for (const key of AI_FIELDS) {
    if (key === "subject") continue;
    const v = state[key].trim();
    if (v) locked[key] = v;
  }
  const lines = [`Idea: ${idea.trim()}`, `Target model: ${TARGET_LABELS[state.target]}`];
  if (Object.keys(locked).length) lines.push(`Locked: ${JSON.stringify(locked)}`);
  return lines.join("\n");
}

export interface Provider {
  name: string;
  call: (system: string, user: string, signal?: AbortSignal) => Promise<string>;
}

export interface ExpandResult {
  fields: AiFields;
  provider: string;
  tried: string[];
}

/** Tries each provider in order; unparseable output counts as a failure. */
export async function expandWithProviders(
  providers: Provider[],
  idea: string,
  state: PromptState,
  signal?: AbortSignal,
): Promise<ExpandResult> {
  const user = buildUserMessage(idea, state);
  const tried: string[] = [];
  const errors: string[] = [];
  for (const p of providers) {
    tried.push(p.name);
    try {
      const text = await p.call(SYSTEM_PROMPT, user, signal);
      return { fields: parseAiFields(text), provider: p.name, tried };
    } catch (e) {
      if (signal?.aborted) throw e;
      errors.push(`${p.name}: ${(e as Error).message}`);
    }
  }
  throw new Error(`All AI providers failed — ${errors.join("; ")}`);
}
