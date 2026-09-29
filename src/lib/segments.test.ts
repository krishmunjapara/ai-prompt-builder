import { describe, expect, it } from "vitest";
import { buildPrompt, emptyState, type PromptState } from "./prompt";
import { buildSegments } from "./segments";

const join = (s: PromptState) => buildSegments(s).map((x) => x.text).join("");

describe("buildSegments", () => {
  const cases: [string, PromptState][] = [
    ["empty", emptyState()],
    ["subject only", { ...emptyState(), subject: "a red fox" }],
    ["style only", { ...emptyState(), style: "watercolor" }],
    ["environment without head is dropped", { ...emptyState(), environment: "a forest" }],
    [
      "full midjourney",
      {
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
        negative: "blurry",
      },
    ],
    [
      "generic target ratio sentence",
      { ...emptyState(), subject: "a castle", ratio: "9:16", target: "generic" },
    ],
    ["whitespace", { ...emptyState(), subject: "  a   quiet   lake  ", mood: " calm " }],
  ];

  it.each(cases)("joined segments equal buildPrompt — %s", (_name, state) => {
    expect(join(state)).toBe(buildPrompt(state));
  });

  it("tags each field with its kind", () => {
    const segs = buildSegments({
      ...emptyState(),
      subject: "a cat",
      style: "photo",
      lighting: "soft light",
      ratio: "1:1",
    });
    expect(segs.map((s) => s.kind)).toEqual([
      "style",
      "plain",
      "subject",
      "plain",
      "lighting",
      "plain",
      "ratio",
    ]);
  });
});
