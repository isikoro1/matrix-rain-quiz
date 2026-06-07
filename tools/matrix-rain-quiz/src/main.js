(() => {
const {
  advanceQuestion,
  calculateScore,
  createInitialState,
  createRainEngine,
  currentQuestion,
  getDifficulty,
  loadRanking,
  normalizeAnswer,
  openXShare,
  render,
  saveResult,
  setMessage,
  startGame,
} = window.MatrixRainQuiz;

const elements = {
  canvas: document.querySelector("#rainCanvas"),
  questionCount: document.querySelector("#questionCount"),
  timeLeft: document.querySelector("#timeLeft"),
  difficultyLabel: document.querySelector("#difficultyLabel"),
  multiplier: document.querySelector("#multiplier"),
  score: document.querySelector("#score"),
  hintText: document.querySelector("#hintText"),
  answerForm: document.querySelector("#answerForm"),
  answerInput: document.querySelector("#answerInput"),
  answerButton: document.querySelector("#answerButton"),
  message: document.querySelector("#message"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  shareButton: document.querySelector("#shareButton"),
  rankingList: document.querySelector("#rankingList"),
};

const state = createInitialState();
const rain = createRainEngine(elements.canvas);
let ranking = loadRanking();
let timerId = null;
let lastFrame = 0;

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function finishGame() {
  stopTimer();
  state.isPlaying = false;
  state.isFinished = true;
  ranking = saveResult({
    score: state.totalScore,
    clearedQuestions: state.clearedQuestions,
    createdAt: new Date().toISOString(),
  });
  setMessage(elements, `Finished. Total score: ${state.totalScore}`, "warn");
  render(state, ranking, elements);
}

function nextQuestion(message, tone = "") {
  advanceQuestion(state);
  if (state.isFinished) {
    finishGame();
    return;
  }
  elements.answerInput.value = "";
  elements.answerInput.focus();
  setMessage(elements, message, tone);
  render(state, ranking, elements);
}

function handleTimeout() {
  const answer = state.currentAnswer;
  nextQuestion(`Time up. Answer was ${answer}.`, "warn");
}

function tick() {
  if (!state.isPlaying) {
    return;
  }

  state.remainingSeconds -= 1;
  if (state.remainingSeconds <= 0) {
    state.remainingSeconds = 0;
    render(state, ranking, elements);
    handleTimeout();
    return;
  }

  render(state, ranking, elements);
}

function beginGame() {
  stopTimer();
  startGame(state);
  setMessage(elements, "Question generated. Decode the signal.");
  render(state, ranking, elements);
  elements.answerInput.value = "";
  elements.answerInput.focus();
  timerId = window.setInterval(tick, 1000);
}

function submitAnswer(event) {
  event.preventDefault();
  if (!state.isPlaying) {
    return;
  }

  const input = normalizeAnswer(elements.answerInput.value);
  const question = currentQuestion(state);
  if (!question) {
    return;
  }

  if (input === normalizeAnswer(question.answer)) {
    const difficulty = getDifficulty(state.remainingSeconds);
    const gained = calculateScore(state.remainingSeconds, difficulty.multiplier);
    state.lastScore = gained;
    state.totalScore += gained;
    state.clearedQuestions += 1;
    nextQuestion(`Correct. +${gained} pts`, "");
    return;
  }

  elements.answerInput.select();
  setMessage(elements, "Incorrect. Keep decoding.", "bad");
}

function animate(time) {
  if (time - lastFrame > 32) {
    const difficulty = state.isPlaying ? getDifficulty(state.remainingSeconds) : null;
    rain.setSpeedScale(difficulty?.rainSpeed ?? 0.9);
    rain.draw(state.isPlaying ? state.currentAnswer : "");
    lastFrame = time;
  }
  window.requestAnimationFrame(animate);
}

elements.startButton.addEventListener("click", beginGame);
elements.restartButton.addEventListener("click", beginGame);
elements.answerForm.addEventListener("submit", submitAnswer);
elements.shareButton.addEventListener("click", () => openXShare(state.totalScore));

render(state, ranking, elements);
window.requestAnimationFrame(animate);
})();
