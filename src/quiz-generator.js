(() => {
const { randomInt, KATAKANA_WORDS_BY_LENGTH } = window.MatrixRainQuiz;

function isKatakanaWord(word) {
  return Array.from(word).every((char) => {
    const code = char.codePointAt(0);
    return (code >= 0x30a1 && code <= 0x30ff) || code === 0x30fc;
  });
}

function randomWord(length) {
  const words = (KATAKANA_WORDS_BY_LENGTH[length] ?? KATAKANA_WORDS_BY_LENGTH[3])
    .filter((word) => Array.from(word).length === length && isKatakanaWord(word));
  return words[randomInt(0, words.length - 1)];
}

function createQuestion(index = 0) {
  const length = Math.min(10, Math.max(3, 3 + index));
  const answer = randomWord(length);
  return {
    answer,
    length,
  };
}

function createQuestions(count = 10) {
  return Array.from({ length: count }, (_, index) => createQuestion(index));
}

Object.assign(window.MatrixRainQuiz, {
  createQuestion,
  createQuestions,
});
})();
