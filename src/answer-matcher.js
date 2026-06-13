(() => {
const {
  KATAKANA_ANSWER_VARIANTS = {},
  KATAKANA_WORDS_BY_LENGTH = {},
  normalizeAnswer,
} = window.MatrixRainQuiz;

function characterKey(value) {
  return Array.from(value).sort().join("");
}

function createKnownAnswerSet() {
  const answers = new Set();
  Object.values(KATAKANA_WORDS_BY_LENGTH).forEach((list) => {
    list.forEach((word) => answers.add(normalizeAnswer(word)));
  });
  Object.entries(KATAKANA_ANSWER_VARIANTS).forEach(([answer, variants]) => {
    answers.add(normalizeAnswer(answer));
    variants.forEach((variant) => answers.add(normalizeAnswer(variant)));
  });
  return answers;
}

const knownAnswers = createKnownAnswerSet();

function acceptedAnswersFor(answer) {
  const normalizedAnswer = normalizeAnswer(answer);
  const variants = KATAKANA_ANSWER_VARIANTS[normalizedAnswer] ?? [];
  return new Set([
    normalizedAnswer,
    ...variants.map((variant) => normalizeAnswer(variant)),
  ]);
}

function isAcceptedAnswer(input, answer) {
  const normalizedInput = normalizeAnswer(input);
  const normalizedAnswer = normalizeAnswer(answer);
  if (!normalizedInput || Array.from(normalizedInput).length !== Array.from(normalizedAnswer).length) {
    return false;
  }

  if (acceptedAnswersFor(normalizedAnswer).has(normalizedInput)) {
    return true;
  }

  return knownAnswers.has(normalizedInput)
    && characterKey(normalizedInput) === characterKey(normalizedAnswer);
}

Object.assign(window.MatrixRainQuiz, {
  isAcceptedAnswer,
});
})();
