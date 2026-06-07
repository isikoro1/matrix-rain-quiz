(() => {
const { randomInt } = window.MatrixRainQuiz;

const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";
const DECOY_WORDS = [
  "サクラ",
  "メロン",
  "テレビ",
  "カメラ",
  "パソコン",
  "リモコン",
  "カラオケ",
  "レストラン",
  "カレンダー",
  "オムライス",
  "コンサート",
  "サイクリング",
  "エスカレーター",
  "デジタルカメラ",
];

function createRainEngine(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    columns: [],
    wordDrops: [],
    fontSize: 20,
    columnWidth: 30,
    speedScale: 1,
    width: 0,
    height: 0,
    target: "",
  };

  function resetColumns() {
    const count = Math.ceil(state.width / state.columnWidth);
    state.columns = Array.from({ length: count }, (_, index) => ({
      x: index * state.columnWidth + randomInt(0, 6),
      y: randomInt(-state.height, state.height),
      speed: randomInt(5, 14),
      gap: randomInt(22, 30),
    }));
  }

  function wordWidth(word, fontSize) {
    return word.length * fontSize * 0.82;
  }

  function pickDecoy(target) {
    let word = DECOY_WORDS[randomInt(0, DECOY_WORDS.length - 1)];
    let attempts = 0;
    while (word === target && attempts < 8) {
      word = DECOY_WORDS[randomInt(0, DECOY_WORDS.length - 1)];
      attempts += 1;
    }
    return word;
  }

  function spawnWord(target, forceTarget = false) {
    if (!target) {
      return;
    }

    const isTarget = forceTarget || Math.random() > 0.58;
    const word = isTarget ? target : pickDecoy(target);
    const fontSize = isTarget ? 28 : 22;
    const width = wordWidth(word, fontSize);
    const maxX = Math.max(8, state.width - width - 8);

    state.wordDrops.push({
      word,
      isTarget,
      x: randomInt(8, maxX),
      y: randomInt(-state.height, -fontSize),
      speed: randomInt(18, 34),
      fontSize,
      alpha: isTarget ? 0.92 : 0.38,
    });
  }

  function resetWords(target) {
    state.wordDrops = [];
    state.target = target;
    if (target) {
      spawnWord(target, true);
      spawnWord(target, true);
      spawnWord(target, false);
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
    state.columnWidth = width < 480 ? 32 : 34;
    resetColumns();
    resetWords(state.target);
  }

  function setSpeedScale(value) {
    state.speedScale = value;
  }

  function drawGlyphRain() {
    context.font = `${state.fontSize}px "Yu Gothic", "Meiryo", sans-serif`;

    for (const column of state.columns) {
      const glyph = GLYPHS[randomInt(0, GLYPHS.length - 1)];
      context.fillStyle = Math.random() > 0.985 ? "#d8ffe1" : "#37ff70";
      context.fillText(glyph, column.x, column.y);

      column.y += column.speed * state.speedScale;
      if (column.y > state.height + state.fontSize) {
        column.y = randomInt(-240, -state.fontSize);
        column.speed = randomInt(5, 14);
        column.gap = randomInt(22, 30);
      }
    }
  }

  function drawWords(target) {
    if (target !== state.target) {
      resetWords(target);
    }

    if (!target) {
      return;
    }

    const targetCount = state.wordDrops.filter((drop) => drop.isTarget).length;
    if (targetCount < 2 || Math.random() > 0.965) {
      spawnWord(target, targetCount < 2);
    }

    context.save();
    context.textBaseline = "top";
    for (const drop of state.wordDrops) {
      context.globalAlpha = drop.alpha;
      context.fillStyle = drop.isTarget ? "#d8ffe1" : "#2ed965";
      context.font = `900 ${drop.fontSize}px "Yu Gothic", "Meiryo", sans-serif`;
      context.shadowColor = drop.isTarget ? "rgba(64, 255, 122, 0.88)" : "rgba(64, 255, 122, 0.32)";
      context.shadowBlur = drop.isTarget ? 16 : 6;
      context.fillText(drop.word, drop.x, drop.y);
      drop.y += drop.speed * state.speedScale;
    }
    context.restore();

    state.wordDrops = state.wordDrops.filter((drop) => drop.y < state.height + drop.fontSize);
  }

  function draw(target = "") {
    context.fillStyle = "rgba(1, 3, 2, 0.18)";
    context.fillRect(0, 0, state.width, state.height);
    drawGlyphRain();
    drawWords(target);
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
