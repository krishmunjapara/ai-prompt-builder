import { describe, expect, it } from "vitest";
import {
  buildPrompt,
  decodeState,
  emptyState,
  encodeState,
  type PromptState,
} from "./prompt";

describe("buildPrompt", () => {
  it("returns empty string when nothing is filled", () => {
    expect(buildPrompt(emptyState())).toBe("");
  });

  it("builds a natural sentence from subject only", () => {
    const s: PromptState = { ...emptyState(), subject: "a red fox" };
    expect(buildPrompt(s)).toBe("A red fox.");
  });

  it("orders style, subject, environment, then details, then ratio", () => {
    const s: PromptState = {
      ...emptyState(),
      subject: "luxury sports car",
      style: "cinematic photograph",
      environment: "Tokyo at night",
      lighting: "neon lighting",
      camera: "low angle",
      lens: "35mm lens",
      composition: "wide shot",
      mood: "dramatic mood",
      color: "blue and black palette",
      ratio: "16:9",
    };
    expect(buildPrompt(s)).toBe(
      "Cinematic photograph of luxury sports car in Tokyo at night, neon lighting, low angle, 35mm lens, wide shot, dramatic mood, blue and black palette --ar 16:9",
    );
  });

  it("skips empty fields without leaving double commas or spaces", () => {
    const s: PromptState = {
      ...emptyState(),
      subject: "portrait of an old fisherman",
      lighting: "golden hour",
      mood: "nostalgic",
    };
    expect(buildPrompt(s)).toBe(
      "Portrait of an old fisherman, golden hour, nostalgic.",
    );
  });

  it("appends negative prompt on its own line", () => {
    const s: PromptState = {
      ...emptyState(),
      subject: "a cat",
      negative: "blurry, text, watermark",
    };
    expect(buildPrompt(s)).toBe("A cat.\n\nNegative prompt: blurry, text, watermark");
  });

  it("trims and collapses whitespace in user input", () => {
    const s: PromptState = { ...emptyState(), subject: "  a   quiet   lake  " };
    expect(buildPrompt(s)).toBe("A quiet lake.");
  });

  it("uses --ar suffix only for midjourney target, sentence form otherwise", () => {
    const base: PromptState = { ...emptyState(), subject: "a castle", ratio: "9:16" };
    expect(buildPrompt({ ...base, target: "midjourney" })).toBe("A castle --ar 9:16");
    expect(buildPrompt({ ...base, target: "generic" })).toBe(
      "A castle, 9:16 aspect ratio.",
    );
  });
});

describe("encodeState / decodeState", () => {
  it("round-trips a full state through URL params", () => {
    const s: PromptState = {
      ...emptyState(),
      subject: "a red fox & friends",
      style: "watercolor",
      ratio: "1:1",
      target: "sdxl",
      negative: "text",
    };
    const q = encodeState(s);
    expect(decodeState(new URLSearchParams(q))).toEqual(s);
  });

  it("omits empty fields from the query string", () => {
    const q = encodeState({ ...emptyState(), subject: "x" });
    expect(q).toBe("s=x");
  });

  it("ignores unknown params and falls back to defaults", () => {
    const parsed = decodeState(new URLSearchParams("foo=bar&s=hello&t=nonsense"));
    expect(parsed.subject).toBe("hello");
    expect(parsed.target).toBe("midjourney");
  });
});
