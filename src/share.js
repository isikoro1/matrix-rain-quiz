(() => {
const GAME_URL = "https://isikoro1.github.io/matrix-rain-quiz/";

function openXShare(score) {
  const text = `マトリックスの緑の画面でクイズで ${score} 点を取りました。\nDigital Rain Quiz\n#MatrixRainQuiz`;
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
