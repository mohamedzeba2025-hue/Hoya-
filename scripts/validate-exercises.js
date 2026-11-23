import { exercises } from "../src/exercises.js";

const languages = ["en", "es", "it"];
const errors = [];
const normalize = value => value.normalize("NFC").trim().replace(/\\s+/g, " ").toLocaleLowerCase("fr");

for (const language of languages) {
  const questions = exercises[language];
  if (!Array.isArray(questions) || questions.length !== 5) {
    errors.push(`${language}: exactement 5 questions sont requises`);
    continue;
  }
  const seenQuestions = new Set();
  questions.forEach((item, index) => {
    const label = `${language} question ${index + 1}`;
    if (typeof item?.question !== "string" || !item.question.trim()) errors.push(`${label}: question manquante`);
    else if (seenQuestions.has(normalize(item.question))) errors.push(`${label}: question dupliquée`);
    else seenQuestions.add(normalize(item.question));
    if (!Array.isArray(item?.options) || item.options.length !== 4 || !item.options.every(option => typeof option === "string" && option.trim())) {
      errors.push(`${label}: exactement 4 choix non vides requis`);
    } else if (new Set(item.options.map(normalize)).size !== item.options.length) {
      errors.push(`${label}: choix de réponses dupliqués`);
    }
    if (!Number.isInteger(item?.correct) || item.correct < 0 || item.correct >= (item?.options?.length ?? 0)) {
      errors.push(`${label}: index de réponse correcte hors limites`);
    }
  });
  if (!errors.some(error => error.startsWith(`${language}:`))) {
    console.log(`[OK] ${language}: 5 questions, 4 choix, réponses indexées valides`);
  }
}
if (errors.length) {
  console.error(errors.map(error => `[ÉCHEC] ${error}`).join("\\n"));
  process.exitCode = 1;
} else {
  console.log("Validation structurelle des exercices réussie.");
}
