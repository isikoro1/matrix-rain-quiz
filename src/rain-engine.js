(() => {
const { randomInt } = window.MatrixRainQuiz;

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

function createRainEngine(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    streams: [],
    fontSize: 20,
    columnWidth: 46,
    rowGap: 44,
    trailLength: 18,
    speedScale: 1,
    width: 0,
    height: 0,
    target: "",
  };

  function randomGlyph() {
    return GLYPHS[randomInt(0, GLYPHS.length - 1)];
  }

  function createStream(index) {
    return {
      x: index * state.columnWidth + randomInt(3, 9),
      y: randomInt(-state.height, state.height),
      speed: randomInt(6, 14),
      promptChars: null,
      promptStart: 0,
    };
  }

  function resetStreams() {
    const count = Math.ceil(state.width / state.columnWidth);
    state.streams = Array.from({ length: count }, (_, index) => createStream(index));
    applyPromptToStreams(state.target);
  }

  function clearPrompt() {
    state.streams.forEach((stream) => {
      stream.promptChars = null;
      stream.promptStart = 0;
    });
  }

  function applyPromptToStreams(target) {
    clearPrompt();
    if (!target || state.streams.length === 0) {
      return;
    }

    const copies = Math.min(3, state.streams.length);
    const used = new Set();
    for (let copy = 0; copy < copies; copy += 1) {
      let index = randomInt(0, state.streams.length - 1);
      let attempts = 0;
      while (used.has(index) && attempts < 16) {
        index = randomInt(0, state.streams.length - 1);
        attempts += 1;
      }

      used.add(index);
      const stream = state.streams[index];
      stream.promptChars = target.split("");
      stream.promptStart = randomInt(2, Math.max(2, state.trailLength - target.length - 1));
      stream.y = randomInt(-state.height - copy * 260, -state.rowGap);
      stream.speed = randomInt(10, 18);
    }
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
    state.columnWidth = width < 480 ? 44 : 50;
    state.rowGap = width < 480 ? 42 : 46;
    state.trailLength = width < 480 ? 15 : 18;
    resetStreams();
  }

  function setSpeedScale(value) {
    state.speedScale = value;
  }

  function glyphFor(stream, trailIndex) {
    if (!stream.promptChars) {
      return randomGlyph();
    }

    const promptIndex = trailIndex - stream.promptStart;
    if (promptIndex >= 0 && promptIndex < stream.promptChars.length) {
      return stream.promptChars[promptIndex];
    }

    return randomGlyph();
  }

  function drawStream(stream) {
    for (let index = 0; index < state.trailLength; index += 1) {
      const y = stream.y - index * state.rowGap;
      if (y < -state.rowGap || y > state.height + state.rowGap) {
        continue;
      }

      const isPromptChar = stream.promptChars
        && index >= stream.promptStart
        && index < stream.promptStart + stream.promptChars.length;
      const alpha = isPromptChar ? 0.88 : Math.max(0.12, 0.78 - index * 0.045);
      context.globalAlpha = alpha;
      context.fillStyle = index === 0 || isPromptChar ? "#d8ffe1" : "#37ff70";
      context.fillText(glyphFor(stream, index), stream.x, y);
    }

    stream.y += stream.speed * state.speedScale;
    if (stream.y - state.trailLength * state.rowGap > state.height) {
      const hadPrompt = Boolean(stream.promptChars);
      const promptChars = stream.promptChars;
      const promptStart = stream.promptStart;
      stream.y = randomInt(-state.height, -state.rowGap);
      stream.speed = randomInt(6, hadPrompt ? 18 : 14);
      stream.promptChars = promptChars;
      stream.promptStart = promptStart;
    }
  }

  function draw(target = "") {
    if (target !== state.target) {
      state.target = target;
      applyPromptToStreams(target);
    }

    context.fillStyle = "rgba(1, 3, 2, 0.22)";
    context.fillRect(0, 0, state.width, state.height);
    context.font = `900 ${state.fontSize}px "Yu Gothic", "Meiryo", sans-serif`;
    context.shadowColor = "rgba(64, 255, 122, 0.45)";
    context.shadowBlur = 8;

    state.streams.forEach(drawStream);
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
