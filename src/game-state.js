(() => {
const { createQuestion, createQuestions } = window.MatrixRainQuiz;

const QUESTION_COUNT = 10;
const QUESTION_SECONDS = 60;

function createInitialState() {
  return {
    questions: [],
    currentQuestionIndex: 0,
    currentAnswer: "",
    remainingSeconds: QUESTION_SECONDS,
    totalScore: 0,
    clearedQuestions: 0,
    isPlaying: false,
    isFinished: false,
    lastScore: 0,
  };
}

function startGame(state) {
  state.questions = createQuestions(QUESTION_COUNT);
  state.currentQuestionIndex = 0;
  state.currentAnswer = state.questions[0].answer;
  state.remainingSeconds = QUESTION_SECONDS;
  state.totalScore = 0;
  state.clearedQuestions = 0;
  state.isPlaying = true;
  state.isFinished = false;
  state.lastScore = 0;
}

function currentQuestion(state) {
  return state.questions[state.currentQuestionIndex] ?? null;
}

function advanceQuestion(state) {
  state.currentQuestionIndex += 1;
  if (state.currentQuestionIndex >= QUESTION_COUNT) {
    state.isPlaying = false;
    state.isFinished = true;
    state.currentAnswer = "";
    return;
  }

  state.questions[state.currentQuestionIndex] = createQuestion(state.clearedQuestions);
  state.currentAnswer = state.questions[state.currentQuestionIndex].answer;
  state.remainingSeconds = QUESTION_SECONDS;
}

Object.assign(window.MatrixRainQuiz, {
  QUESTION_COUNT,
  QUESTION_SECONDS,
  createInitialState,
  startGame,
  currentQuestion,
  advanceQuestion,
});
})();
