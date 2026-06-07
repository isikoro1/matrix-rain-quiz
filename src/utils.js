(() => {
window.MatrixRainQuiz = window.MatrixRainQuiz || {};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAnswer(value) {
  return value.trim().toUpperCase().normalize("NFKC");
}

Object.assign(window.MatrixRainQuiz, {
  randomInt,
  shuffle,
  clamp,
  normalizeAnswer,
});
})();
