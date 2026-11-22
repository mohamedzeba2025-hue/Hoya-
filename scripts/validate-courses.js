import { englishLessons } from "../src/english-course.js";
import { spanishLessons } from "../src/spanish-course.js";
import { italianLessons } from "../src/italian-course.js";

const courses = [
  ["Anglais", englishLessons],
  ["Espagnol", spanishLessons],
  ["Italien", italianLessons],
];

let errors = 0;
const fail = (course, day, message) => {
  console.error(`[ÉCHEC] ${course} — leçon ${day}: ${message}`);
  errors += 1;
};
const hasText = value => typeof value === "string" && value.trim().length > 0;

for (const [courseName, lessons] of courses) {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    fail(courseName, "—", "le cours doit contenir au moins une leçon");
    continue;
  }

  const seenDays = new Set();

  for (const lesson of lessons) {
    const day = lesson?.day ?? "?";

    if (!Number.isInteger(lesson?.day) || lesson.day < 1) {
      fail(courseName, day, "numéro de leçon invalide");
    } else if (seenDays.has(lesson.day)) {
      fail(courseName, day, "numéro de leçon dupliqué");
    } else {
      seenDays.add(lesson.day);
    }

    for (const field of ["title", "goal", "grammar"]) {
      if (!hasText(lesson?.[field])) fail(courseName, day, `champ « ${field} » manquant`);
    }

    if (!Array.isArray(lesson?.vocab) || lesson.vocab.length < 4) {
      fail(courseName, day, "au moins quatre entrées de vocabulaire sont requises");
    } else {
      lesson.vocab.forEach((entry, index) => {
        if (!Array.isArray(entry) || entry.length < 2 || !hasText(entry[0]) || !hasText(entry[1])) {
          fail(courseName, day, `entrée de vocabulaire ${index + 1} incomplète`);
        }
      });
    }

    if (!Array.isArray(lesson?.examples) || lesson.examples.length === 0 || !lesson.examples.every(hasText)) {
      fail(courseName, day, "au moins un exemple complet est requis");
    }

    if (!Array.isArray(lesson?.dialogue) || lesson.dialogue.length < 2 ||
        !lesson.dialogue.every(line => Array.isArray(line) && line.length >= 2 && hasText(line[0]) && hasText(line[1]))) {
      fail(courseName, day, "le dialogue doit contenir au moins deux répliques complètes");
    }

    const quiz = lesson?.quiz;
    if (!hasText(quiz?.q) || !hasText(quiz?.explanation) ||
        !Array.isArray(quiz?.options) || quiz.options.length < 2 ||
        !quiz.options.every(hasText) ||
        !Number.isInteger(quiz.correct) || quiz.correct < 0 || quiz.correct >= quiz.options.length) {
      fail(courseName, day, "question, choix, réponse correcte ou explication du quiz invalide");
    }

    if (Array.isArray(quiz?.options) && quiz.options.every(hasText)) {
      const normalizedOptions = quiz.options.map(option =>
        option.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("fr")
      );
      if (new Set(normalizedOptions).size !== normalizedOptions.length) {
        fail(courseName, day, "les choix du quiz doivent être uniques (doublons détectés)");
      }
    }
  }

  for (let expected = 1; expected <= lessons.length; expected += 1) {
    if (!seenDays.has(expected)) fail(courseName, expected, "jour manquant dans la séquence");
  }

  if (seenDays.size !== lessons.length) {
    fail(courseName, "—", "les numéros de leçons ne sont pas tous uniques");
  }

  console.log(`[OK] ${courseName}: ${lessons.length} leçons, jours 1 à ${lessons.length}`);
}

if (errors > 0) {
  console.error(`Validation des cours échouée: ${errors} problème(s).`);
  process.exitCode = 1;
} else {
  console.log("Validation structurelle des trois cours réussie.");
}
