(() => {
const { randomInt } = window.MatrixRainQuiz;

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

function createRainEngine(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    columns: [],
    fontSize: 20,
    density: 0.88,
    trail: 18,
    jitter: 0.12,
    glow: 10,
    speedScale: 1,
    width: 0,
    height: 0,
    target: "",
  };

  function randomChar() {
    return GLYPHS[randomInt(0, GLYPHS.length - 1)] || "ア";
  }

  function rgba(hex, alpha) {
    const value = hex.replace("#", "");
    const bigint = Number.parseInt(value, 16);
    const red = (bigint >> 16) & 255;
    const green = (bigint >> 8) & 255;
    const blue = bigint & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function resetColumns() {
    const count = Math.ceil(state.width / state.fontSize);
    state.columns = Array.from({ length: count }, (_, index) => ({
      x: index * state.fontSize,
      y: Math.random() * -state.height,
      speedOffset: 0.65 + Math.random() * 0.85,
      skip: Math.random() > state.density,
      answer: null,
      answerStart: 0,
    }));
    applyTarget(state.target);
    context.fillStyle = "#020403";
    context.fillRect(0, 0, state.width, state.height);
  }

  function applyTarget(target) {
    state.columns.forEach((column) => {
      column.answer = null;
      column.answerStart = 0;
    });

    if (!target || state.columns.length === 0) {
      return;
    }

    const copies = Math.min(3, state.columns.length);
    const used = new Set();
    for (let copy = 0; copy < copies; copy += 1) {
      let index = randomInt(0, state.columns.length - 1);
      let guard = 0;
      while (used.has(index) && guard < 20) {
        index = randomInt(0, state.columns.length - 1);
        guard += 1;
      }

      used.add(index);
      const column = state.columns[index];
      column.answer = target.split("");
      column.answerStart = randomInt(1, Math.max(1, state.trail - target.length - 1));
      column.skip = false;
      column.speedOffset = 0.75 + Math.random() * 0.65;
      column.y = Math.random() * -state.height * (0.35 + copy * 0.2);
    }
  }

  function resize() {
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * ratio);
    canvas.height = Math.floor(state.height * ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.fontSize = state.width < 480 ? 22 : 20;
    state.trail = state.width < 480 ? 15 : 18;
    resetColumns();
  }

  function setSpeedScale(value) {
    state.speedScale = value;
  }

  function charFor(column, trailIndex) {
    if (!column.answer) {
      return randomChar();
    }

    const answerIndex = trailIndex - column.answerStart;
    if (answerIndex >= 0 && answerIndex < column.answer.length) {
      return column.answer[answerIndex];
    }

    return randomChar();
  }

  function drawColumn(column) {
    if (column.skip) {
      if (Math.random() < 0.003) {
        column.skip = false;
      }
      return;
    }

    const rows = Math.ceil(state.trail);
    const xJitter = (Math.random() - 0.5) * state.fontSize * state.jitter;

    context.font = `${state.fontSize}px "SFMono-Regular", Consolas, "Yu Gothic", "Meiryo", monospace`;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.shadowColor = "#00ff66";
    context.shadowBlur = state.glow;

    for (let index = rows; index >= 0; index -= 1) {
      const y = column.y - index * state.fontSize;
      if (y < -state.fontSize || y > state.height + state.fontSize) {
        continue;
      }

      const isAnswer = Boolean(column.answer)
        && index >= column.answerStart
        && index < column.answerStart + column.answer.length;
      const opacity = index === 0 ? 1 : Math.max(0.08, 1 - index / rows);
      context.fillStyle = index === 0 || isAnswer ? "#ddffdd" : rgba("#00ff66", opacity);
      context.fillText(charFor(column, index), column.x + xJitter, y);
    }

    column.y += state.fontSize * column.speedOffset * state.speedScale;
    if (column.y > state.height + rows * state.fontSize) {
      const answer = column.answer;
      const answerStart = column.answerStart;
      column.y = Math.random() * -state.height * 0.45;
      column.speedOffset = 0.65 + Math.random() * 0.85;
      column.skip = Math.random() > state.density;
      column.answer = answer;
      column.answerStart = answerStart;
      if (answer) {
        column.skip = false;
      }
    }
  }

  function draw(target = "") {
    if (target !== state.target) {
      state.target = target;
      applyTarget(target);
    }

    context.fillStyle = rgba("#020403", 1 / state.trail);
    context.fillRect(0, 0, state.width, state.height);
    state.columns.forEach(drawColumn);
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
