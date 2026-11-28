import assert from "node:assert/strict";
import { readStored, readStoredXP, readStoredCourseSelection, writeStored, removeStored } from "../src/storage.js";

class MemoryStorage {
  constructor(entries = {}) { this.entries = new Map(Object.entries(entries)); }
  getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
  setItem(key, value) { this.entries.set(key, String(value)); }
  removeItem(key) { this.entries.delete(key); }
}

const fallback = { safe: true };
assert.equal(readStored("hoya_selected_language", "es", new MemoryStorage({
  hoya_selected_language: JSON.stringify("it"),
})), "it");
assert.equal(readStored("hoya_selected_language", "es", new MemoryStorage({
  hoya_selected_language: JSON.stringify("fr"),
})), "es");
assert.equal(readStored("hoya_selected_day", 1, new MemoryStorage({
  hoya_selected_day: JSON.stringify(42),
})), 42);
assert.equal(readStored("hoya_selected_day", 1, new MemoryStorage({
  hoya_selected_day: JSON.stringify(0),
})), 1);
assert.equal(readStored("hoya_selected_day", 1, new MemoryStorage({
  hoya_selected_day: JSON.stringify(111),
})), 1);
assert.deepEqual(readStoredCourseSelection(new MemoryStorage({
  hoya_selected_language: JSON.stringify("en"),
  hoya_selected_day: JSON.stringify(105),
})), { language: "en", day: 90 });
assert.deepEqual(readStoredCourseSelection(new MemoryStorage({
  hoya_selected_language: JSON.stringify("es"),
  hoya_selected_day: JSON.stringify(105),
})), { language: "es", day: 105 });
assert.equal(readStored("missing", fallback, new MemoryStorage()), fallback);
assert.equal(readStored("hoya_user_name", "Apprenant", new MemoryStorage({ hoya_user_name: '"  Ada  "' })), "Ada");
assert.equal(readStored("hoya_user_name", "Apprenant", new MemoryStorage({ hoya_user_name: JSON.stringify("   ") })), "Apprenant");
assert.equal(readStored("hoya_user_name", "Apprenant", new MemoryStorage({ hoya_user_name: JSON.stringify("7".repeat(60)) })).length, 40);

const done = readStored("hoya_done", {}, new MemoryStorage({
  hoya_done: JSON.stringify({
    "es-1": true, "fr-1": true, "en-2": false, "it-3": true, broken: true,
    "en-90": true, "es-110": true, "it-90": true,
    "en-91": true, "es-111": true, "it-91": true, "es-0": true, "en-01": true,
  }),
}));
assert.deepEqual(done, {
  "es-1": true, "it-3": true,
  "en-90": true, "es-110": true, "it-90": true,
});

const exercises = readStored("hoya_exercise_progress", {}, new MemoryStorage({
  hoya_exercise_progress: JSON.stringify({
    en: { questionIndex: 99, score: -2, answer: 8, validated: true, finished: true, ignored: "x" },
    es: { questionIndex: 3, score: 4, answer: 2, validated: true, finished: false },
    fr: { questionIndex: 1, score: 1, answer: 0, validated: true, finished: false },
    it: { questionIndex: 2, score: 3, answer: 1, validated: false, finished: true },
  }),
}));
assert.deepEqual(exercises, {
  en: { questionIndex: 0, score: 0, answer: null, validated: false, finished: false },
  es: { questionIndex: 3, score: 4, answer: 2, validated: true, finished: false },
  it: { questionIndex: 2, score: 2, answer: null, validated: false, finished: false },
});

assert.deepEqual(readStored("hoya_exercise_progress", {}, new MemoryStorage({
  hoya_exercise_progress: JSON.stringify({
    it: { questionIndex: 4, score: 5, answer: 3, validated: true, finished: true },
  }),
})), {
  it: { questionIndex: 4, score: 5, answer: 3, validated: true, finished: true },
});

assert.deepEqual(readStored("hoya_exercise_progress", {}, new MemoryStorage({
  hoya_exercise_progress: JSON.stringify({
    en: { questionIndex: 1, score: 5, answer: 2, validated: false, finished: true },
  }),
})), {
  en: { questionIndex: 1, score: 1, answer: null, validated: false, finished: false },
});

const awarded = readStored("hoya_exercise_xp_awarded", {}, new MemoryStorage({
  hoya_exercise_xp_awarded: JSON.stringify({ en: true, es: false, it: true, fr: true }),
}));
assert.deepEqual(awarded, { en: true, it: true });

const days = readStored("hoya_activity_days", [], new MemoryStorage({
  hoya_activity_days: JSON.stringify([
    "2026-11-24", "2026-02-30", "2026-11-24", "not-a-date", 42,
    "2026-11-25", "2024-02-29", "2025-02-29"
  ]),
}));
assert.deepEqual(days, ["2024-02-29", "2026-11-24", "2026-11-25"]);

assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "42.9" })), 42);
assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "-5" })), 120);
assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "Infinity" })), 120);
assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "not-a-number" })), 120);
assert.equal(readStored("hoya_done", fallback, new MemoryStorage({ hoya_done: "{" })), fallback);
assert.equal(readStored("hoya_done", fallback, { getItem() { throw new Error("storage unavailable"); } }), fallback);

const writableStorage = new MemoryStorage();
assert.equal(writeStored("hoya_xp", 42, writableStorage), true);
assert.equal(readStoredXP(0, writableStorage), 42);
assert.equal(writeStored("hoya_done", { "en-1": true }, writableStorage), true);
assert.deepEqual(readStored("hoya_done", {}, writableStorage), { "en-1": true });
assert.equal(removeStored(["hoya_xp", "hoya_done"], writableStorage), true);
assert.equal(readStoredXP(120, writableStorage), 120);
assert.deepEqual(readStored("hoya_done", {}, writableStorage), {});

const blockedStorage = {
  setItem() { throw new Error("storage quota exceeded"); },
  removeItem() { throw new Error("storage unavailable"); },
};
assert.equal(writeStored("hoya_done", {}, blockedStorage), false);
assert.equal(removeStored(["hoya_done"], blockedStorage), false);
assert.equal(writeStored("hoya_done", {}, null), false);
assert.equal(removeStored(["hoya_done"], null), false);
assert.equal(removeStored([""], writableStorage), false);

console.log("Storage tests passed: malformed JSON, bounded exercise state, strict dates, XP and safe writes/removals.");
