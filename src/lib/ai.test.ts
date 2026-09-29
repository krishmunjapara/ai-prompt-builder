import { describe, expect, it } from "vitest";
import {
  AI_FIELDS,
  buildUserMessage,
  expandWithProviders,
  parseAiFields,
  sanitizeValue,
  type Provider,
} from "./ai";
import { emptyState } from "./prompt";

describe("sanitizeValue", () => {
  it("strips quality buzzwords that competitors spam", () => {
    expect(sanitizeValue("cinematic photograph, 8k, masterpiece, trending on ArtStation")).toBe(
      "cinematic photograph",
    );
    expect(sanitizeValue("soft window light, highly detailed, best quality")).toBe("soft window light");
  });

  it("removes quotes, trailing punctuation and collapses whitespace", () => {
    expect(sanitizeValue('  "golden   hour light."  ')).toBe("golden hour light");
  });

  it("caps very long values at a word boundary", () => {
    const long = "a ".repeat(80) + "end";
    const out = sanitizeValue(long);
    expect(out.length).toBeLessThanOrEqual(90);
    expect(out.endsWith(" ")).toBe(false);
  });
});

describe("parseAiFields", () => {
  it("parses a clean JSON object", () => {
    const f = parseAiFields(
      '{"subject":"a tabby cat reading","style":"cozy illustration","environment":"rainy cafe","lighting":"warm lamplight","camera":"eye level","lens":"50mm lens","composition":"medium shot","mood":"calm","color":"amber and teal","negative":"text, watermark"}',
    );
    expect(f.subject).toBe("a tabby cat reading");
    expect(f.negative).toBe("text, watermark");
  });

  it("extracts JSON wrapped in prose or code fences", () => {
    const f = parseAiFields('Sure!\n```json\n{"subject":"a fox","style":"watercolor painting"}\n```');
    expect(f).toMatchObject({ subject: "a fox", style: "watercolor painting" });
  });

  it("ignores unknown keys and non-string values", () => {
    const f = parseAiFields('{"subject":"a fox","foo":"bar","mood":42}');
    expect(f).toEqual({ subject: "a fox" });
  });

  it("throws when there is no subject", () => {
    expect(() => parseAiFields('{"style":"anime"}')).toThrow();
    expect(() => parseAiFields("not json")).toThrow();
  });

  it("adds an article so subject/environment read after 'of' / 'in'", () => {
    const f = parseAiFields('{"subject":"tabby cat watching a storm","environment":"stormy lighthouse balcony"}');
    expect(f.subject).toBe("a tabby cat watching a storm");
    expect(f.environment).toBe("a stormy lighthouse balcony");
    expect(parseAiFields('{"subject":"old fisherman"}').subject).toBe("an old fisherman");
  });

  it("leaves plurals, proper nouns and existing articles alone", () => {
    expect(parseAiFields('{"subject":"two cats"}').subject).toBe("two cats");
    expect(parseAiFields('{"subject":"koi fish in a pond"}').subject).toBe("a koi fish in a pond");
    expect(parseAiFields('{"subject":"Tokyo at night"}').subject).toBe("Tokyo at night");
    expect(parseAiFields('{"subject":"the last train"}').subject).toBe("the last train");
    expect(parseAiFields('{"subject":"dancers on a stage"}').subject).toBe("dancers on a stage");
  });

  it("drops a camera body in the angle field", () => {
    const f = parseAiFields('{"subject":"a cat","camera":"mirrorless 35mm camera"}');
    expect(f.camera).toBeUndefined();
    expect(parseAiFields('{"subject":"a cat","camera":"low angle"}').camera).toBe("low angle");
  });
});

describe("buildUserMessage", () => {
  it("passes the idea, target and locked user fields", () => {
    const s = { ...emptyState(), style: "anime", target: "flux" as const };
    const msg = buildUserMessage("a fox in snow", s);
    expect(msg).toContain("Idea: a fox in snow");
    expect(msg).toContain("Target model: Flux");
    expect(msg).toContain('"style":"anime"');
  });

  it("omits the locked block when nothing is set", () => {
    expect(buildUserMessage("a fox", emptyState())).not.toContain("Locked");
  });
});

describe("expandWithProviders", () => {
  const ok = (body: string): Provider => ({ name: "ok", call: async () => body });
  const fail = (name: string): Provider => ({
    name,
    call: async () => {
      throw new Error(`${name} down`);
    },
  });

  it("falls through failing providers to the first that works", async () => {
    const r = await expandWithProviders([fail("a"), fail("b"), ok('{"subject":"a fox"}')], "a fox", emptyState());
    expect(r.fields.subject).toBe("a fox");
    expect(r.provider).toBe("ok");
    expect(r.tried).toEqual(["a", "b", "ok"]);
  });

  it("treats unparseable output as a failure and moves on", async () => {
    const r = await expandWithProviders([ok("garbage"), ok('{"subject":"a fox"}')], "a fox", emptyState());
    expect(r.fields.subject).toBe("a fox");
  });

  it("throws when every provider fails", async () => {
    await expect(expandWithProviders([fail("a")], "x", emptyState())).rejects.toThrow(/All AI providers failed/);
  });

  it("never returns keys outside the known field list", async () => {
    const r = await expandWithProviders([ok('{"subject":"a","evil":"x"}')], "a", emptyState());
    expect(Object.keys(r.fields).every((k) => (AI_FIELDS as readonly string[]).includes(k))).toBe(true);
  });
});
