(() => {
function openXShare(score) {
  const text = `MATRIX RAIN QUIZ score: ${score} pts\n#MatrixRainQuiz`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

Object.assign(window.MatrixRainQuiz, {
  openXShare,
});
})();
