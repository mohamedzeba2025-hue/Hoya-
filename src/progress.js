const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
const nonNegativeInteger = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : fallback;
};

export function awardLessonXP({ completedLessons, xp, lessonKey, points = 20 }) {
  const completed = isRecord(completedLessons) ? completedLessons : {};
  const currentXP = nonNegativeInteger(xp);
  if (typeof lessonKey !== "string" || !lessonKey.trim() || completed[lessonKey]) {
    return { completedLessons: completed, xp: currentXP, points: 0, awarded: false };
  }

  const reward = nonNegativeInteger(points, 20);
  return {
    completedLessons: { ...completed, [lessonKey]: true },
    xp: currentXP + reward,
    points: reward,
    awarded: true,
  };
}

export function awardExerciseXP({
  awardedExercises,
  xp,
  language,
  score,
  questionCount = 5,
  pointsPerCorrect = 10,
}) {
  const awarded = isRecord(awardedExercises) ? awardedExercises : {};
  const currentXP = nonNegativeInteger(xp);
  if (!["en", "es", "it"].includes(language) || awarded[language]) {
    return { awardedExercises: awarded, xp: currentXP, points: 0, awarded: false };
  }

  const total = nonNegativeInteger(questionCount, 5) || 5;
  const correct = Math.min(total, nonNegativeInteger(score));
  const rewardPerAnswer = nonNegativeInteger(pointsPerCorrect, 10);
  const points = correct * rewardPerAnswer;

  return {
    awardedExercises: { ...awarded, [language]: true },
    xp: currentXP + points,
    points,
    awarded: true,
  };
}


export function recordActivityDay(activityDays, dayKey) {
  const days = Array.isArray(activityDays) ? activityDays : [];
  if (typeof dayKey !== "string" || !/^\\d{4}-\\d{2}-\\d{2}$/.test(dayKey)) {
    return days.slice(-365);
  }
  if (days.includes(dayKey)) return days.slice(-365);
  return [...days, dayKey].slice(-365);
}
