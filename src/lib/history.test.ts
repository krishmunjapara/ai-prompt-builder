import { beforeEach, describe, expect, it } from "vitest";
import { addToHistory, clearHistory, HISTORY_LIMIT, readHistory } from "./history";

describe("history", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty", () => {
    expect(readHistory()).toEqual([]);
  });

  it("adds newest first and dedupes identical prompts", () => {
    addToHistory("A cat.");
    addToHistory("A dog.");
    addToHistory("A cat.");
    expect(readHistory().map((h) => h.prompt)).toEqual(["A cat.", "A dog."]);
  });

  it("caps the list at HISTORY_LIMIT", () => {
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) addToHistory(`Prompt ${i}`);
    const list = readHistory();
    expect(list).toHaveLength(HISTORY_LIMIT);
    expect(list[0].prompt).toBe(`Prompt ${HISTORY_LIMIT + 4}`);
  });

  it("ignores empty prompts", () => {
    addToHistory("   ");
    expect(readHistory()).toEqual([]);
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("apb:history", "{not json");
    expect(readHistory()).toEqual([]);
  });

  it("clears", () => {
    addToHistory("x");
    clearHistory();
    expect(readHistory()).toEqual([]);
  });
});
