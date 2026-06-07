(() => {
function openXShare(score) {
  const text = `MATRIX RAIN QUIZで ${score} 点を獲得しました。\n#MatrixRainQuiz`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

Object.assign(window.MatrixRainQuiz, {
  openXShare,
});
})();
