import assert from "node:assert/strict";
import { awardExerciseXP, awardLessonXP } from "../src/progress.js";

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

console.log("Progress reward tests passed: lesson idempotency, exercise idempotency, score bounds and malformed state.");
