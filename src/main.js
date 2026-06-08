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
  renderAnswerSlots,
  saveResult,
  setMessage,
  showScreen,
  startGame,
} = window.MatrixRainQuiz;

const elements = {
  canvas: document.querySelector("#rainCanvas"),
  titleScreen: document.querySelector("#titleScreen"),
  countdownScreen: document.querySelector("#countdownScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  resultScreen: document.querySelector("#resultScreen"),
  countdownNumber: document.querySelector("#countdownNumber"),
  questionCount: document.querySelector("#questionCount"),
  timeLeft: document.querySelector("#timeLeft"),
  difficultyLabel: document.querySelector("#difficultyLabel"),
  score: document.querySelector("#score"),
  answerForm: document.querySelector("#answerForm"),
  answerInput: document.querySelector("#answerInput"),
  answerSlots: document.querySelector("#answerSlots"),
  answerButton: document.querySelector("#answerButton"),
  message: document.querySelector("#message"),
  startButton: document.querySelector("#startButton"),
  retryButton: document.querySelector("#retryButton"),
  titleButton: document.querySelector("#titleButton"),
  shareButton: document.querySelector("#shareButton"),
  finalScore: document.querySelector("#finalScore"),
  finalCleared: document.querySelector("#finalCleared"),
  rankingList: document.querySelector("#rankingList"),
};

const state = createInitialState();
const rain = createRainEngine(elements.canvas);
let ranking = [];
let timerId = null;
let countdownId = null;
let lastFrame = 0;
let activeScreen = "title";
let countdownRainText = "";
let isComposingAnswer = false;

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function stopCountdown() {
  if (countdownId) {
    window.clearInterval(countdownId);
    countdownId = null;
  }
}

function switchScreen(name) {
  activeScreen = name;
  showScreen(elements, name);
}

function currentSignal() {
  if (activeScreen === "countdown") {
    return {
      difficultyKey: "countdown",
      text: countdownRainText,
    };
  }

  if (!state.isPlaying) {
    return {
      difficultyKey: "idle",
      text: "",
    };
  }

  const question = currentQuestion(state);
  if (!question) {
    return {
      difficultyKey: "idle",
      text: "",
    };
  }

  const difficulty = getDifficulty(state.remainingSeconds);
  return {
    difficultyKey: difficulty.key,
    text: question.answer,
  };
}

function finishGame() {
  stopTimer();
  state.isPlaying = false;
  state.isFinished = true;
  saveResult({
    score: state.totalScore,
    clearedQuestions: state.clearedQuestions,
    createdAt: new Date().toISOString(),
  });
  ranking = loadRanking();
  render(state, ranking, elements);
  switchScreen("result");
}

function nextQuestion(message, tone = "", lengthDelta = 0) {
  advanceQuestion(state, lengthDelta);
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
  nextQuestion("Time up. Length down.", "warn", -1);
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
  stopCountdown();
  startGame(state);
  ranking = [];
  switchScreen("game");
  setMessage(elements, "Decode the signal.");
  render(state, ranking, elements);
  elements.answerInput.value = "";
  elements.answerInput.focus();
  timerId = window.setInterval(tick, 1000);
}

function startCountdown() {
  stopTimer();
  stopCountdown();
  state.isPlaying = false;
  state.isFinished = false;
  switchScreen("countdown");

  let value = 3;
  elements.countdownNumber.textContent = String(value);
  countdownRainText = String(value);
  countdownId = window.setInterval(() => {
    value -= 1;
    if (value > 0) {
      elements.countdownNumber.textContent = String(value);
      countdownRainText = String(value);
      return;
    }

    if (value === 0) {
      elements.countdownNumber.textContent = "GO";
      countdownRainText = "0";
      return;
    }

    countdownRainText = "";
    beginGame();
  }, 850);
}

function goTitle() {
  stopTimer();
  stopCountdown();
  state.isPlaying = false;
  state.isFinished = false;
  state.remainingSeconds = 60;
  switchScreen("title");
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
    const gained = calculateScore(state.remainingSeconds, difficulty.multiplier, question.length);
    state.lastScore = gained;
    state.totalScore += gained;
    state.clearedQuestions += 1;
    nextQuestion(`Correct. +${gained} pts`, "", 1);
    return;
  }

  nextQuestion(`Incorrect. Answer: ${question.answer}`, "bad", -2);
}

function animate(time) {
  if (time - lastFrame > 32) {
    const difficulty = state.isPlaying ? getDifficulty(state.remainingSeconds) : null;
    const idleSpeed = activeScreen === "title" || activeScreen === "countdown" ? 0.82 : 0.95;
    rain.setSpeedScale(difficulty?.rainSpeed ?? idleSpeed);
    rain.draw(currentSignal());
    lastFrame = time;
  }
  window.requestAnimationFrame(animate);
}

elements.startButton.addEventListener("click", startCountdown);
elements.retryButton.addEventListener("click", startCountdown);
elements.titleButton.addEventListener("click", goTitle);
elements.answerForm.addEventListener("submit", submitAnswer);
function syncAnswerInput() {
  const question = currentQuestion(state);
  if (state.isPlaying && question && !isComposingAnswer) {
    const normalized = normalizeAnswer(elements.answerInput.value);
    const nextValue = Array.from(normalized).slice(0, question.length).join("");
    if (elements.answerInput.value !== nextValue) {
      elements.answerInput.value = nextValue;
    }
  }
  renderAnswerSlots(elements, state.isPlaying && question ? question.length : 0);
}

elements.answerInput.addEventListener("compositionstart", () => {
  isComposingAnswer = true;
});
elements.answerInput.addEventListener("compositionend", () => {
  isComposingAnswer = false;
  syncAnswerInput();
});
elements.answerInput.addEventListener("input", syncAnswerInput);
elements.answerSlots.addEventListener("click", () => elements.answerInput.focus());
elements.answerSlots.addEventListener("focus", () => elements.answerInput.focus());
elements.shareButton.addEventListener("click", () => openXShare(state.totalScore));

render(state, ranking, elements);
switchScreen("title");
window.requestAnimationFrame(animate);
})();
