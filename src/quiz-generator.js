(() => {
const { randomInt, shuffle } = window.MatrixRainQuiz;

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SOURCE = `${LETTERS}${DIGITS}`;

function randomToken(length) {
  let token = "";
  for (let i = 0; i < length; i += 1) {
    token += SOURCE[randomInt(0, SOURCE.length - 1)];
  }
  return token;
}

function scramble(answer) {
  const chars = answer.split("");
  let result = shuffle(chars).join("");
  let attempts = 0;
  while (result === answer && attempts < 8) {
    result = shuffle(chars).join("");
    attempts += 1;
  }
  return result;
}

function noisyScrambles(answer) {
  return Array.from({ length: 3 }, () => scramble(answer)).join("\n");
}

function createQuestion() {
  const answer = randomToken(randomInt(5, 8));
  return {
    answer,
    signals: {
      hard: noisyScrambles(answer),
      medium: answer.split("").reverse().join(""),
      easy: answer,
    },
  };
}

function createQuestions(count = 10) {
  return Array.from({ length: count }, createQuestion);
}

Object.assign(window.MatrixRainQuiz, {
  createQuestion,
  createQuestions,
});
})();
