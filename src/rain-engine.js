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

  function drawSignal(signal) {
    if (!signal) {
      return;
    }

    const lines = String(signal).split("\n");
    const fontSize = Math.max(36, Math.min(72, state.width / 7.5));
    const top = state.height * 0.36 - ((lines.length - 1) * fontSize * 0.42);

    context.save();
    context.textAlign = "center";
    context.font = `900 ${fontSize}px Consolas, monospace`;
    context.shadowColor = "rgba(64, 255, 122, 0.9)";
    context.shadowBlur = 24;

    lines.forEach((line, index) => {
      const y = top + index * fontSize * 0.78;
      context.globalAlpha = index === 0 ? 0.92 : 0.62;
      context.fillStyle = "#a9ffc1";
      context.fillText(line, state.width / 2, y);
    });

    context.restore();
  }

  function draw(signal = "") {
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

    drawSignal(signal);
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
