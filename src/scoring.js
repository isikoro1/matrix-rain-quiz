(() => {
function getDifficulty(remainingSeconds) {
  if (remainingSeconds >= 41) {
    return {
      key: "hard",
      label: "Hard",
      multiplier: 3,
      rainSpeed: 1.65,
    };
  }

  if (remainingSeconds >= 21) {
    return {
      key: "medium",
      label: "Medium",
      multiplier: 2,
      rainSpeed: 1.1,
    };
  }

  return {
    key: "easy",
    label: "Easy",
    multiplier: 1,
    rainSpeed: 0.7,
  };
}

function calculateScore(remainingSeconds, multiplier) {
  return Math.floor(Math.max(0, remainingSeconds) * multiplier);
}

Object.assign(window.MatrixRainQuiz, {
  getDifficulty,
  calculateScore,
});
})();
