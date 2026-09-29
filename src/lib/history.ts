export const HISTORY_LIMIT = 20;
const KEY = "apb:history";

export interface HistoryItem {
  prompt: string;
  /** Query string that restores the form (see encodeState). */
  query: string;
  at: number;
}

const canStore = () => typeof window !== "undefined" && "localStorage" in window;

export function readHistory(): HistoryItem[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is HistoryItem =>
        typeof x === "object" && x !== null && typeof (x as HistoryItem).prompt === "string",
    );
  } catch {
    return [];
  }
}

export function addToHistory(prompt: string, query = ""): HistoryItem[] {
  const text = prompt.trim();
  if (!text || !canStore()) return readHistory();
  const next = [
    { prompt: text, query, at: Date.now() },
    ...readHistory().filter((h) => h.prompt !== text),
  ].slice(0, HISTORY_LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota exceeded or private mode — history is best-effort */
  }
  return next;
}

export function clearHistory(): void {
  if (canStore()) localStorage.removeItem(KEY);
}
