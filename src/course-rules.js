export const COURSE_DAY_LIMITS = Object.freeze({ en: 90, es: 110, it: 90 });

export function isValidLessonKey(value) {
  if (typeof value !== "string") return false;
  const match = /^(en|es|it)-([1-9]\d*)$/.exec(value);
  if (!match) return false;
  const day = Number(match[2]);
  return Number.isSafeInteger(day) && day <= COURSE_DAY_LIMITS[match[1]];
}
