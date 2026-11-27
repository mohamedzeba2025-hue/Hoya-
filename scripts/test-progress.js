import assert from "node:assert/strict";
import { isValidDateKey } from "../src/date.js";
import { awardExerciseXP, awardLessonXP, recordActivityDay } from "../src/progress.js";
import { isValidLessonKey } from "../src/course-rules.js";

const firstLesson = awardLessonXP({
  completedLessons: {},
  xp: 120,
  lessonKey: "es-1",
});
assert.equal(firstLesson.awarded, true);
assert.equal(firstLesson.points, 20);
assert.equal(firstLesson.xp, 140);
assert.equal(firstLesson.completedLessons["es-1"], true);

const repeatedLesson = awardLessonXP({
  completedLessons: firstLesson.completedLessons,
  xp: firstLesson.xp,
  lessonKey: "es-1",
});
assert.equal(repeatedLesson.awarded, false);
assert.equal(repeatedLesson.points, 0);
assert.equal(repeatedLesson.xp, 140);

const nextLesson = awardLessonXP({
  completedLessons: repeatedLesson.completedLessons,
  xp: repeatedLesson.xp,
  lessonKey: "es-2",
});
assert.equal(nextLesson.awarded, true);
assert.equal(nextLesson.xp, 160);

assert.equal(isValidLessonKey("en-1"), true);
assert.equal(isValidLessonKey("en-90"), true);
assert.equal(isValidLessonKey("es-110"), true);
assert.equal(isValidLessonKey("it-90"), true);
for (const invalidKey of ["en-91", "es-111", "it-91", "fr-1", "es-0", "es-01", "en-999999999999999999999"]) {
  assert.equal(isValidLessonKey(invalidKey), false, invalidKey);
  const rejected = awardLessonXP({ completedLessons: {}, xp: 50, lessonKey: invalidKey });
  assert.equal(rejected.awarded, false, invalidKey);
  assert.equal(rejected.xp, 50, invalidKey);
}

const firstExercise = awardExerciseXP({
  awardedExercises: {},
  xp: 160,
  language: "en",
  score: 4,
});
assert.equal(firstExercise.awarded, true);
assert.equal(firstExercise.points, 40);
assert.equal(firstExercise.xp, 200);
assert.equal(firstExercise.awardedExercises.en, true);

const repeatedExercise = awardExerciseXP({
  awardedExercises: firstExercise.awardedExercises,
  xp: firstExercise.xp,
  language: "en",
  score: 5,
});
assert.equal(repeatedExercise.awarded, false);
assert.equal(repeatedExercise.xp, 200);

const cappedExercise = awardExerciseXP({
  awardedExercises: {},
  xp: 0,
  language: "it",
  score: 99,
});
assert.equal(cappedExercise.points, 50);
assert.equal(cappedExercise.xp, 50);

const negativeScore = awardExerciseXP({
  awardedExercises: {},
  xp: 10,
  language: "es",
  score: -3,
});
assert.equal(negativeScore.awarded, true);
assert.equal(negativeScore.points, 0);
assert.equal(negativeScore.xp, 10);

const invalidLanguage = awardExerciseXP({
  awardedExercises: {},
  xp: 10,
  language: "fr",
  score: 5,
});
assert.equal(invalidLanguage.awarded, false);
assert.equal(invalidLanguage.xp, 10);

const malformedState = awardLessonXP({
  completedLessons: [],
  xp: -4,
  lessonKey: "it-1",
});
assert.equal(malformedState.awarded, true);
assert.equal(malformedState.xp, 20);
assert.equal(Array.isArray(malformedState.completedLessons), false);

assert.equal(isValidDateKey("2024-02-29"), true);
assert.equal(isValidDateKey("2025-02-29"), false);
assert.equal(isValidDateKey("2026-02-30"), false);
assert.equal(isValidDateKey("2026-2-3"), false);

const firstActivity = recordActivityDay([], "2026-11-26");
assert.deepEqual(firstActivity, ["2026-11-26"]);
assert.deepEqual(recordActivityDay(firstActivity, "2026-11-26"), firstActivity);
assert.deepEqual(recordActivityDay(firstActivity, "invalid-date"), firstActivity);
assert.deepEqual(recordActivityDay(firstActivity, "2026-02-30"), firstActivity);
assert.deepEqual(
  recordActivityDay(["2026-02-30", "2026-11-25", "2026-11-25", "not-a-date"], "2026-11-26"),
  ["2026-11-25", "2026-11-26"]
);

const previous365Days = Array.from({ length: 365 }, (_, index) =>
  new Date(Date.UTC(2025, 0, 1 + index)).toISOString().slice(0, 10)
);
const nextActivity = recordActivityDay(previous365Days, "2026-11-26");
assert.equal(nextActivity.length, 365);
assert.equal(nextActivity.at(-1), "2026-11-26");
assert.equal(nextActivity.includes(previous365Days[0]), false);

console.log("Progress tests passed: XP idempotency, score bounds, strict calendar dates and 365-day activity history.");
