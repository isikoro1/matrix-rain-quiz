(() => {
const GAME_URL = "https://isikoro1.github.io/matrix-rain-quiz/";

function openXShare(score) {
  const text = `MATRIX RAIN QUIZで ${score} 点を取りました。\n降ってくるカタカナを読み取るタイピングクイズです。\n#MatrixRainQuiz`;
  const params = new URLSearchParams({
    text,
    url: GAME_URL,
  });
  window.open(`https://twitter.com/intent/tweet?${params.toString()}`, "_blank", "noopener,noreferrer");
}

Object.assign(window.MatrixRainQuiz, {
  openXShare,
});
})();
