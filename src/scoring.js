(() => {
function getDifficulty(remainingSeconds) {
  if (remainingSeconds >= 41) {
    return {
      key: "hard",
      label: "Hard",
      multiplier: 1.5,
      rainSpeed: 1.65,
    };
  }

  if (remainingSeconds >= 21) {
    return {
      key: "normal",
      label: "Normal",
      multiplier: 1,
      rainSpeed: 1.1,
    };
  }

  return {
      key: "easy",
      label: "Easy",
      multiplier: 0.8,
      rainSpeed: 0.7,
    };
}

function calculateScore(remainingSeconds, multiplier, characterCount) {
  return Math.floor(characterCount + Math.max(0, remainingSeconds) * multiplier);
}

Object.assign(window.MatrixRainQuiz, {
  getDifficulty,
  calculateScore,
});
})();
