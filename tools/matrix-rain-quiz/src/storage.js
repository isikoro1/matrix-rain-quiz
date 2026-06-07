(() => {
const KEY = "matrix-rain-quiz-ranking";

function loadRanking() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveResult(result) {
  const ranking = loadRanking();
  ranking.push(result);
  ranking.sort((a, b) => b.score - a.score);
  const topRanking = ranking.slice(0, 5);
  localStorage.setItem(KEY, JSON.stringify(topRanking));
  return topRanking;
}

Object.assign(window.MatrixRainQuiz, {
  loadRanking,
  saveResult,
});
})();
