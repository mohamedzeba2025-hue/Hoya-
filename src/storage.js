import { isValidDateKey } from "./date.js";
import { COURSE_DAY_LIMITS, isValidLessonKey } from "./course-rules.js";

const languages = new Set(["en", "es", "it"]);
const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);

function boundedInteger(value, minimum, maximum, fallback) {
  return Number.isInteger(value) && value >= minimum && value <= maximum ? value : fallback;
}

function sanitizeStoredValue(key, value, fallback) {
  if (key === "hoya_selected_language") {
    return languages.has(value) ? value : fallback;
  }

  if (key === "hoya_selected_day") {
    return boundedInteger(value, 1, 110, fallback);
  }

  if (key === "hoya_user_name") {
    return typeof value === "string" ? value.trim().slice(0, 40) || fallback : fallback;
  }

  if (key === "hoya_done") {
    if (!isRecord(value)) return fallback;
    return Object.fromEntries(
      Object.entries(value).filter(([lessonKey, completed]) =>
        isValidLessonKey(lessonKey) && completed === true
      )
    );
  }

  if (key === "hoya_exercise_progress") {
    if (!isRecord(value)) return fallback;
    const result = {};
    for (const language of languages) {
      const progress = value[language];
      if (!isRecord(progress)) continue;

      const questionIndex = boundedInteger(progress.questionIndex, 0, 4, 0);
      const storedAnswer = boundedInteger(progress.answer, 0, 3, null);
      const validated = progress.validated === true && storedAnswer !== null;
      const answer = validated ? storedAnswer : null;

      // Only questions before the current index (plus the current one when validated)
      // can contribute to the saved score.
      const answeredQuestions = Math.min(5, questionIndex + (validated ? 1 : 0));
      const score = Math.min(answeredQuestions, boundedInteger(progress.score, 0, 5, 0));

      result[language] = {
        questionIndex,
        score,
        answer,
        validated,
        finished: progress.finished === true && questionIndex === 4 && validated,
      };
    }
    return result;
  }

  if (key === "hoya_exercise_xp_awarded") {
    if (!isRecord(value)) return fallback;
    return Object.fromEntries(
      Object.entries(value).filter(([language, awarded]) => languages.has(language) && awarded === true)
    );
  }

  if (key === "hoya_activity_days") {
    if (!Array.isArray(value)) return fallback;
    return [...new Set(value.filter(day => isValidDateKey(day)))].sort().slice(-365);
  }

  return value;
}

export function readStored(key, fallback, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    const raw = target?.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return sanitizeStoredValue(key, JSON.parse(raw), fallback);
  } catch {
    return fallback;
  }
}

export function readStoredCourseSelection(storage) {
  const language = readStored("hoya_selected_language", "es", storage);
  const day = readStored("hoya_selected_day", 1, storage);
  return { language, day: Math.min(day, COURSE_DAY_LIMITS[language]) };
}

export function readStoredXP(fallback = 120, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    const raw = target?.getItem("hoya_xp");
    if (raw === null || raw === undefined || raw.trim() === "") return fallback;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return fallback;
    return Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(value));
  } catch {
    return fallback;
  }
}

export function writeStored(key, value, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target || typeof target.setItem !== "function") return false;
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return false;
    target.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function removeStored(keys, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    if (!target || typeof target.removeItem !== "function" || !Array.isArray(keys)) return false;
    if (!keys.every(key => typeof key === "string" && key.length > 0)) return false;
    for (const key of keys) target.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
