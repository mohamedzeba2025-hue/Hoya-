import assert from "node:assert/strict";
import { readStored, readStoredXP } from "../src/storage.js";

class MemoryStorage {
  constructor(entries = {}) { this.entries = new Map(Object.entries(entries)); }
  getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
}

const fallback = { safe: true };
assert.equal(readStored("missing", fallback, new MemoryStorage()), fallback);
assert.equal(readStored("hoya_user_name", "Apprenant", new MemoryStorage({ hoya_user_name: '"  Ada  "' })), "Ada");
assert.equal(readStored("hoya_user_name", "Apprenant", new MemoryStorage({ hoya_user_name: JSON.stringify("   ") })), "Apprenant");
assert.equal(readStored("hoya_user_name", "Apprenant", new MemoryStorage({ hoya_user_name: JSON.stringify("7".repeat(60)) })).length, 40);

const done = readStored("hoya_done", {}, new MemoryStorage({
  hoya_done: JSON.stringify({ "es-1": true, "fr-1": true, "en-2": false, "it-3": true, broken: true }),
}));
assert.deepEqual(done, { "es-1": true, "it-3": true });

const exercises = readStored("hoya_exercise_progress", {}, new MemoryStorage({
  hoya_exercise_progress: JSON.stringify({
    en: { questionIndex: 99, score: -2, answer: 8, validated: true, finished: true, ignored: "x" },
    es: { questionIndex: 3, score: 4, answer: 2, validated: true, finished: false },
    fr: { questionIndex: 1, score: 1, answer: 0, validated: true, finished: false },
  }),
}));
assert.deepEqual(exercises, {
  en: { questionIndex: 0, score: 0, answer: null, validated: false, finished: false },
  es: { questionIndex: 3, score: 4, answer: 2, validated: true, finished: false },
});

const awarded = readStored("hoya_exercise_xp_awarded", {}, new MemoryStorage({
  hoya_exercise_xp_awarded: JSON.stringify({ en: true, es: false, it: true, fr: true }),
}));
assert.deepEqual(awarded, { en: true, it: true });

const days = readStored("hoya_activity_days", [], new MemoryStorage({
  hoya_activity_days: JSON.stringify(["2026-11-24", "2026-02-30", "2026-11-24", "not-a-date", 42, "2026-11-25"]),
}));
assert.deepEqual(days, ["2026-11-24", "2026-11-25"]);

assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "42.9" })), 42);
assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "-5" })), 120);
assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "Infinity" })), 120);
assert.equal(readStoredXP(120, new MemoryStorage({ hoya_xp: "not-a-number" })), 120);
assert.equal(readStored("hoya_done", fallback, new MemoryStorage({ hoya_done: "{" })), fallback);
assert.equal(readStored("hoya_done", fallback, { getItem() { throw new Error("storage unavailable"); } }), fallback);

console.log("Storage tests passed: malformed JSON, bounded exercise state, owned course keys, activity dates and XP.");
