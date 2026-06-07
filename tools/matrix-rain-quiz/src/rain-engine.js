(() => {
const { randomInt } = window.MatrixRainQuiz;

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function createRainEngine(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    columns: [],
    fontSize: 18,
    speedScale: 1,
    width: 0,
    height: 0,
  };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.width = width;
    state.height = height;

    const count = Math.ceil(width / state.fontSize);
    state.columns = Array.from({ length: count }, (_, index) => ({
      x: index * state.fontSize,
      y: randomInt(-height, height),
      speed: randomInt(5, 16),
    }));
  }

  function setSpeedScale(value) {
    state.speedScale = value;
  }

  function draw(highlight = "") {
    context.fillStyle = "rgba(1, 3, 2, 0.18)";
    context.fillRect(0, 0, state.width, state.height);
    context.font = `${state.fontSize}px Consolas, monospace`;

    for (const column of state.columns) {
      const glyph = GLYPHS[randomInt(0, GLYPHS.length - 1)];
      context.fillStyle = Math.random() > 0.985 ? "#d8ffe1" : "#37ff70";
      context.fillText(glyph, column.x, column.y);

      column.y += column.speed * state.speedScale;
      if (column.y > state.height + state.fontSize) {
        column.y = randomInt(-220, -state.fontSize);
        column.speed = randomInt(5, 16);
      }
    }

    if (highlight) {
      context.save();
      context.globalAlpha = 0.16;
      context.fillStyle = "#b8ffd0";
      context.font = "700 48px Consolas, monospace";
      context.textAlign = "center";
      context.fillText(highlight, state.width / 2, state.height * 0.52);
      context.restore();
    }
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    draw,
    resize,
    setSpeedScale,
  };
}

Object.assign(window.MatrixRainQuiz, {
  createRainEngine,
});
})();
