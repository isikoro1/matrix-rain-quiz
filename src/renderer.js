(() => {
const { currentQuestion, QUESTION_COUNT, getDifficulty } = window.MatrixRainQuiz;

function formatRankingItem(item) {
  const date = new Date(item.createdAt);
  return `<strong>${item.score}</strong> pts / ${item.clearedQuestions} cleared / ${date.toLocaleDateString()}`;
}

function render(state, ranking, elements) {
  const question = currentQuestion(state);
  const difficulty = state.isPlaying ? getDifficulty(state.remainingSeconds) : null;

  elements.questionCount.textContent = state.isPlaying || state.isFinished
    ? `${Math.min(state.currentQuestionIndex + 1, QUESTION_COUNT)} / ${QUESTION_COUNT}`
    : `0 / ${QUESTION_COUNT}`;
  elements.timeLeft.textContent = String(state.remainingSeconds);
  elements.difficultyLabel.textContent = difficulty?.label ?? (state.isFinished ? "Finished" : "Ready");
  elements.multiplier.textContent = difficulty ? `x${difficulty.multiplier}` : "x0";
  elements.score.textContent = String(state.totalScore);
  elements.hintText.textContent = question && difficulty ? question.hints[difficulty.key] : "Press Start";

  elements.answerInput.disabled = !state.isPlaying;
  elements.answerButton.disabled = !state.isPlaying;
  elements.startButton.disabled = state.isPlaying;
  elements.shareButton.disabled = !state.isFinished;

  elements.rankingList.innerHTML = "";
  if (ranking.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No results yet";
    elements.rankingList.append(item);
    return;
  }

  for (const entry of ranking) {
    const item = document.createElement("li");
    item.innerHTML = formatRankingItem(entry);
    elements.rankingList.append(item);
  }
}

function setMessage(elements, message, tone = "") {
  elements.message.textContent = message;
  elements.message.className = `message ${tone}`.trim();
}

Object.assign(window.MatrixRainQuiz, {
  render,
  setMessage,
});
})();
