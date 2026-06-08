(() => {
const { randomInt } = window.MatrixRainQuiz;

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

function createRainEngine(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    columns: [],
    promptColumns: [],
    fontSize: 20,
    columnWidth: 34,
    rowGap: 30,
    speedScale: 1,
    width: 0,
    height: 0,
    target: "",
  };

  function createColumn(index) {
    return {
      x: index * state.columnWidth + randomInt(1, 7),
      y: randomInt(-state.height, state.height),
      speed: randomInt(5, 13),
    };
  }

  function resetColumns() {
    const count = Math.ceil(state.width / state.columnWidth);
    state.columns = Array.from({ length: count }, (_, index) => createColumn(index));
  }

  function createPromptColumn(target, index) {
    const laneCount = Math.max(1, Math.floor(state.width / state.columnWidth));
    const lane = randomInt(0, laneCount - 1);
    return {
      chars: target.split(""),
      x: lane * state.columnWidth + randomInt(1, 7),
      y: randomInt(-state.height - index * 180, -state.rowGap),
      speed: randomInt(13, 22),
      drift: randomInt(-1, 1),
    };
  }

  function resetPromptColumns(target) {
    state.target = target;
    state.promptColumns = target
      ? Array.from({ length: 3 }, (_, index) => createPromptColumn(target, index))
      : [];
  }

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
    state.fontSize = width < 480 ? 18 : 20;
    state.columnWidth = width < 480 ? 34 : 38;
    state.rowGap = width < 480 ? 32 : 34;
    resetColumns();
    resetPromptColumns(state.target);
  }

  function setSpeedScale(value) {
    state.speedScale = value;
  }

  function drawGlyphRain() {
    context.font = `${state.fontSize}px "Yu Gothic", "Meiryo", sans-serif`;

    for (const column of state.columns) {
      const glyph = GLYPHS[randomInt(0, GLYPHS.length - 1)];
      context.globalAlpha = Math.random() > 0.985 ? 0.92 : 0.46;
      context.fillStyle = Math.random() > 0.985 ? "#d8ffe1" : "#37ff70";
      context.fillText(glyph, column.x, column.y);

      column.y += column.speed * state.speedScale;
      if (column.y > state.height + state.fontSize) {
        column.y = randomInt(-260, -state.fontSize);
        column.speed = randomInt(5, 13);
      }
    }
  }

  function drawPromptRain(target) {
    if (target !== state.target) {
      resetPromptColumns(target);
    }

    if (!target) {
      return;
    }

    context.save();
    context.font = `900 ${state.fontSize + 4}px "Yu Gothic", "Meiryo", sans-serif`;
    context.shadowColor = "rgba(64, 255, 122, 0.72)";
    context.shadowBlur = 14;

    for (const column of state.promptColumns) {
      column.chars.forEach((char, index) => {
        context.globalAlpha = 0.96;
        context.fillStyle = "#d8ffe1";
        context.fillText(char, column.x + column.drift * index, column.y + index * state.rowGap);
      });

      column.y += column.speed * state.speedScale;
      if (column.y > state.height + column.chars.length * state.rowGap) {
        Object.assign(column, createPromptColumn(target, 0));
      }
    }

    context.restore();
  }

  function draw(target = "") {
    context.fillStyle = "rgba(1, 3, 2, 0.18)";
    context.fillRect(0, 0, state.width, state.height);
    drawGlyphRain();
    drawPromptRain(target);
    context.globalAlpha = 1;
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
