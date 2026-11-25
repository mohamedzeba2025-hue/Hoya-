const languages = new Set(["en", "es", "it"]);
const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);

function boundedInteger(value, minimum, maximum, fallback) {
  return Number.isInteger(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
}

function isDateKey(value) {
  if (typeof value !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function sanitizeStoredValue(key, value, fallback) {
  if (key === "hoya_user_name") {
    return typeof value === "string" ? value.trim().slice(0, 40) || fallback : fallback;
  }

  if (key === "hoya_done") {
    if (!isRecord(value)) return fallback;
    return Object.fromEntries(
      Object.entries(value).filter(([lessonKey, completed]) =>
        /^(en|es|it)-[1-9]\\d*$/.test(lessonKey) && completed === true
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
      const score = boundedInteger(progress.score, 0, 5, 0);
      const answer = boundedInteger(progress.answer, 0, 3, null);
      result[language] = {
        questionIndex,
        score,
        answer,
        validated: progress.validated === true && answer !== null,
        finished: progress.finished === true && questionIndex === 4,
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
    return [...new Set(value.filter(isDateKey))].slice(-365);
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
