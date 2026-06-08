(() => {
const { currentQuestion, QUESTION_COUNT, getDifficulty, normalizeAnswer } = window.MatrixRainQuiz;

function formatRankingItem(item) {
  const date = new Date(item.createdAt);
  return `<strong>${item.score}</strong> pts / ${item.clearedQuestions} cleared / ${date.toLocaleDateString()}`;
}

function renderAnswerSlots(elements, length = 0) {
  const chars = Array.from(normalizeAnswer(elements.answerInput.value));
  elements.answerSlots.innerHTML = "";
  for (let index = 0; index < length; index += 1) {
    const slot = document.createElement("span");
    slot.className = "answer-slot";
    slot.textContent = chars[index] ?? "";
    elements.answerSlots.append(slot);
  }
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
  elements.signalMode.textContent = question && difficulty ? `Katakana / ${difficulty.label}` : "Falling katakana words";

  elements.answerInput.disabled = !state.isPlaying;
  elements.answerInput.maxLength = question?.length ?? 0;
  elements.answerButton.disabled = !state.isPlaying;
  renderAnswerSlots(elements, state.isPlaying && question ? question.length : 0);

  elements.finalScore.textContent = String(state.totalScore);
  elements.finalCleared.textContent = `${state.clearedQuestions} / ${QUESTION_COUNT} cleared`;
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

function showScreen(elements, name) {
  const screenMap = {
    title: elements.titleScreen,
    countdown: elements.countdownScreen,
    game: elements.gameScreen,
    result: elements.resultScreen,
  };

  Object.values(screenMap).forEach((screen) => {
    screen.classList.remove("is-active");
  });
  screenMap[name].classList.add("is-active");
}

Object.assign(window.MatrixRainQuiz, {
  render,
  renderAnswerSlots,
  setMessage,
  showScreen,
});
})();
