import { describe, expect, it } from "vitest";
import {
  buildPrompt,
  buildSegments,
  decodeState,
  emptyState,
  encodeState,
  targetNotes,
  type PromptState,
  type Target,
} from "./prompt";

const full = (target: Target): PromptState => ({
  ...emptyState(),
  subject: "a lone astronaut",
  style: "cinematic photograph",
  environment: "a red desert",
  lighting: "golden hour light",
  camera: "low angle",
  ratio: "16:9",
  negative: "text, watermark",
  target,
});

describe("buildPrompt — shared rules", () => {
  it("returns empty string when nothing is filled", () => {
    expect(buildPrompt(emptyState())).toBe("");
  });

  it("returns empty when only ratio/negative are set", () => {
    expect(buildPrompt({ ...emptyState(), ratio: "1:1", negative: "text" })).toBe("");
  });

  it("orders style of subject in environment, then details", () => {
    expect(buildPrompt({ ...full("flux") })).toBe(
      "Cinematic photograph of a lone astronaut in a red desert, golden hour light, low angle.",
    );
  });

  it("skips empty fields without double commas or spaces", () => {
    const p = buildPrompt({ ...emptyState(), subject: "a cat", mood: "calm", target: "generic" });
    expect(p).toBe("A cat, calm.");
  });

  it("trims and collapses whitespace in user input", () => {
    const p = buildPrompt({ ...emptyState(), subject: "  a   red   fox  ", target: "generic" });
    expect(p).toBe("A red fox.");
  });
});

describe("buildPrompt — per-model syntax", () => {
  it("Midjourney: --ar and --no parameters, no trailing period", () => {
    expect(buildPrompt(full("midjourney"))).toBe(
      "Cinematic photograph of a lone astronaut in a red desert, golden hour light, low angle --ar 16:9 --no text, watermark",
    );
  });

  it("Stable Diffusion: A1111 'Negative prompt:' line, ratio left to the UI", () => {
    expect(buildPrompt(full("sdxl"))).toBe(
      "Cinematic photograph of a lone astronaut in a red desert, golden hour light, low angle.\nNegative prompt: text, watermark",
    );
  });

  it("Flux: natural sentence, drops negative and ratio", () => {
    expect(buildPrompt(full("flux"))).not.toMatch(/watermark|16:9/);
  });

  it("DALL·E: orientation words and an Avoid sentence", () => {
    expect(buildPrompt(full("dalle"))).toBe(
      "Cinematic photograph of a lone astronaut in a red desert, golden hour light, low angle. Wide landscape format. Avoid text, watermark.",
    );
    expect(buildPrompt({ ...full("dalle"), ratio: "9:16", negative: "" })).toMatch(/Tall portrait format\.$/);
    expect(buildPrompt({ ...full("dalle"), ratio: "1:1", negative: "" })).toMatch(/Square format\.$/);
  });

  it("Any model: ratio phrase plus Negative prompt line", () => {
    expect(buildPrompt(full("generic"))).toBe(
      "Cinematic photograph of a lone astronaut in a red desert, golden hour light, low angle, 16:9 aspect ratio.\nNegative prompt: text, watermark",
    );
  });
});

describe("buildSegments", () => {
  it("joined segments equal buildPrompt for every target", () => {
    for (const t of ["midjourney", "sdxl", "flux", "dalle", "generic"] as Target[]) {
      const s = full(t);
      expect(buildSegments(s).map((x) => x.text).join("")).toBe(buildPrompt(s));
    }
  });

  it("tags each field with its own kind", () => {
    const kinds = buildSegments(full("midjourney")).map((s) => s.kind);
    expect(kinds).toEqual(
      expect.arrayContaining(["style", "subject", "environment", "lighting", "camera", "param", "negative"]),
    );
  });
});

describe("targetNotes", () => {
  it("gives native pixel sizes for SD and Flux", () => {
    expect(targetNotes(full("sdxl"))[0]).toContain("1344 × 768");
    expect(targetNotes(full("flux"))[0]).toContain("1344 × 768");
  });
  it("warns that Flux ignores negatives", () => {
    expect(targetNotes(full("flux")).join(" ")).toMatch(/negative/);
  });
  it("is empty for Midjourney", () => {
    expect(targetNotes(full("midjourney"))).toEqual([]);
  });
});

describe("share links", () => {
  it("round-trips a full state through URL params", () => {
    const s = full("dalle");
    expect(decodeState(new URLSearchParams(encodeState(s)))).toEqual(s);
  });

  it("omits empty fields and the default target", () => {
    expect(encodeState({ ...emptyState(), subject: "a fox" })).toBe("s=a+fox");
  });

  it("ignores unknown params, bad targets and caps long values", () => {
    const s = decodeState(new URLSearchParams(`zz=1&t=nope&s=${"a".repeat(500)}`));
    expect(s.target).toBe("midjourney");
    expect(s.subject.length).toBe(200);
  });
});
