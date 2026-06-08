(() => {
const { randomInt } = window.MatrixRainQuiz;

const KATAKANA = "\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce\u30cf\u30d2\u30d5\u30d8\u30db\u30de\u30df\u30e0\u30e1\u30e2\u30e4\u30e6\u30e8\u30e9\u30ea\u30eb\u30ec\u30ed\u30ef\u30f3";
const DIGITS = "0123456789";
const SYMBOLS = "@#$%&*+-=<>[]{}?/\\|:;!";

function createRainEngine(canvas) {
  const context = canvas.getContext("2d");
  const state = {
    layers: [],
    width: 0,
    height: 0,
    dpr: 1,
    target: "",
    difficultyKey: "idle",
    noisePattern: KATAKANA,
    speedScale: 1,
    lastTime: 0,
  };

  const config = {
    fontSize: 18,
    depth: 5,
    depthStrength: 0.44,
    density: 0.82,
    displayLimit: 18,
    trail: 16,
    rowSpacing: 0.35,
    speedMin: 7,
    speedMax: 18,
    variance: 1.15,
    frequency: 0.92,
    textColor: "#00ff66",
    headColor: "#ddffdd",
    backgroundColor: "#000000",
  };

  function randomChar(pattern = KATAKANA) {
    const chars = Array.from(pattern || KATAKANA);
    return chars[randomInt(0, chars.length - 1)] || "\u30a2";
  }

  function characterAt(chars, index) {
    const glyphs = Array.from(chars || KATAKANA);
    return glyphs[((index % glyphs.length) + glyphs.length) % glyphs.length] || "\u30a2";
  }

  function nextCharacter(column) {
    if (column.randomOrder) {
      return randomChar(column.pattern);
    }
    if (column.answerMode) {
      column.charIndex += 1;
      return characterAt(column.pattern, column.charIndex);
    }
    column.charIndex = randomInt(0, Array.from(column.pattern).length - 1);
    return characterAt(column.pattern, column.charIndex);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function distributionSample() {
    const a = Math.random();
    const b = Math.random();
    return a < 0.82 ? Math.pow(b, 2) * 0.5 : 1 - Math.pow(b, 2) * 0.5;
  }

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    const numeric = Number.parseInt(value, 16);
    return [(numeric >> 16) & 255, (numeric >> 8) & 255, numeric & 255];
  }

  function mix(a, b, amount) {
    return a.map((value, index) => Math.round(value + (b[index] - value) * amount));
  }

  function colorToCss(rgb) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }

  function shuffleText(value) {
    const chars = Array.from(value);
    for (let index = chars.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(0, index);
      [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
    }
    return chars.join("");
  }

  function displayPatternFor(target, difficultyKey) {
    if (difficultyKey === "hard") {
      return shuffleText(target);
    }
    if (difficultyKey === "normal") {
      return Array.from(target).reverse().join("");
    }
    return target;
  }

  function noisePatternFor(target, difficultyKey) {
    if (!target) {
      return KATAKANA;
    }
    if (difficultyKey === "countdown") {
      return target;
    }
    if (difficultyKey === "hard") {
      return `${target}${DIGITS}${SYMBOLS}`;
    }
    if (difficultyKey === "normal") {
      return `${target}${DIGITS}`;
    }
    return target;
  }

  function flowExtent() {
    return state.height;
  }

  function laneExtent() {
    return state.width;
  }

  function flowPoint(lanePosition, flowPosition) {
    return {
      x: lanePosition,
      y: flowPosition,
    };
  }

  function settings() {
    const mobile = state.width < 480;
    const textRgb = hexToRgb(config.textColor);
    const headRgb = hexToRgb(config.headColor);
    const backgroundRgb = hexToRgb(config.backgroundColor);
    return {
      ...config,
      fontSize: mobile ? 20 : config.fontSize,
      trail: mobile ? 14 : config.trail,
      displayLimit: mobile ? 12 : config.displayLimit,
      textRgb,
      headRgb,
      backgroundRgb,
      characterPatterns: [state.noisePattern || KATAKANA],
    };
  }

  function activeColumnCount() {
    return state.layers.reduce(
      (total, layer) => total + layer.columns.filter((column) => !column.skip).length,
      0,
    );
  }

  function shouldSkipColumn(cps, s, layer, activeCount) {
    if (activeCount >= s.displayLimit) {
      return true;
    }
    const minCps = Math.max(1.2, s.speedMin * 0.35 * layer.speedScale);
    const maxCps = Math.max(minCps, s.speedMax * 2.2 * layer.speedScale * s.frequency);
    const speedRatio = Math.min(1, Math.max(0, (cps - minCps) / (maxCps - minCps || 1)));
    const densityChance = Math.min(0.72, s.density * 0.58);
    const slowGate = 0.04 + speedRatio * 0.96;
    return Math.random() > densityChance * slowGate;
  }

  function initialStartDelay(cps, index, totalColumns) {
    const laneRatio = totalColumns > 0 ? index / totalColumns : Math.random();
    const spreadRatio = (laneRatio + Math.random() * 0.72) % 1;
    const earlyStart = Math.random() < 0.18;
    const minSeconds = earlyStart ? 0 : 1.1;
    const maxSeconds = earlyStart ? 1.4 : 8.2;
    const seconds = minSeconds + Math.pow(spreadRatio, 0.82) * (maxSeconds - minSeconds);
    return Math.floor(seconds * cps);
  }

  function makeColumn(index, s, layer, spreadStart, activeCount, totalColumns) {
    const varianceMin = Math.max(0.02, 1 - s.variance * 0.95);
    const varianceMax = 1 + s.variance * 2.8;
    const baseCps = randomBetween(s.speedMin, s.speedMax);
    const varianceFactor = varianceMin + (varianceMax - varianceMin) * distributionSample();
    const minVisibleCps = Math.max(1.2, s.speedMin * 0.35 * layer.speedScale);
    const cps = Math.max(minVisibleCps, baseCps * varianceFactor * layer.speedScale * s.frequency);
    const pattern = s.characterPatterns[randomInt(0, s.characterPatterns.length - 1)] || KATAKANA;
    const charIndex = randomInt(0, Array.from(pattern).length - 1);

    return {
      x: index * layer.spacing + layer.spacing / 2,
      row: -1,
      pattern,
      charIndex,
      headChar: characterAt(pattern, charIndex),
      startDelay: spreadStart ? initialStartDelay(cps, index, totalColumns) : randomInt(0, 8),
      cps,
      timer: 0,
      skip: shouldSkipColumn(cps, s, layer, activeCount),
      residues: [],
      flashes: [],
      answerMode: false,
      randomOrder: false,
    };
  }

  function makeLayer(layerIndex, s) {
    const denominator = Math.max(1, s.depth - 1);
    const depthRatio = s.depth === 1 ? 1 : layerIndex / denominator;
    const frontRatio = s.depth === 1 ? 1 : 1 - depthRatio;
    const depthAmount = s.depthStrength * frontRatio;
    const scale = 1 - s.depthStrength * 0.22 + depthAmount * 0.32;
    const layer = {
      alpha: 0.28 + depthAmount * 0.72,
      depthRatio,
      frontRatio,
      fontSize: Math.max(8, Math.round(s.fontSize * scale)),
      speedScale: 0.72 + depthAmount * 0.42,
      columns: [],
    };
    layer.spacing = layer.fontSize * randomBetween(0.95, 1.08);
    layer.rowStep = layer.fontSize * (0.78 + s.rowSpacing * 1.38);

    const count = Math.ceil(laneExtent() / layer.spacing) + 2;
    for (let index = 0; index < count; index += 1) {
      const activeCount = activeColumnCount() + layer.columns.filter((column) => !column.skip).length;
      layer.columns.push(makeColumn(index, s, layer, true, activeCount, count));
    }
    return layer;
  }

  function applyTarget(target, difficultyKey = "idle") {
    state.target = target;
    state.difficultyKey = difficultyKey;
    state.noisePattern = noisePatternFor(target, difficultyKey);

    state.layers.forEach((layer) => {
      layer.columns.forEach((column) => {
        column.answerMode = false;
        column.randomOrder = false;
        column.pattern = state.noisePattern;
        column.residues = [];
        column.flashes = [];
      });
    });

    if (!target) {
      return;
    }

    const answerPattern = displayPatternFor(target, difficultyKey);
    const frontLayers = state.layers.slice(0, Math.min(2, state.layers.length));
    let assigned = 0;
    frontLayers.forEach((layer) => {
      const columns = [...layer.columns].sort(() => Math.random() - 0.5);
      for (const column of columns) {
        if (assigned >= 3) {
          return;
        }
        column.answerMode = true;
        column.randomOrder = difficultyKey === "hard";
        column.pattern = answerPattern;
        column.charIndex = -1;
        column.headChar = column.randomOrder ? randomChar(answerPattern) : characterAt(answerPattern, 0);
        column.startDelay = randomInt(0, 16);
        column.skip = false;
        column.residues = [];
        column.flashes = [];
        assigned += 1;
      }
    });
  }

  function paintBackground(s) {
    context.globalAlpha = 1;
    context.shadowBlur = 0;
    context.fillStyle = s.backgroundColor;
    context.fillRect(0, 0, state.width, state.height);
  }

  function prepareText(layer) {
    context.font = `700 ${layer.fontSize}px "Noto Sans Siddham", "Noto Sans Devanagari", "Yu Gothic", "Hiragino Kaku Gothic ProN", "Meiryo", monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
  }

  function drawGlowingGlyph(char, x, y, color, alpha, glow) {
    context.globalAlpha = alpha;
    context.shadowBlur = glow;
    context.shadowColor = color;
    context.fillStyle = color;
    context.fillText(char, x, y);
  }

  function drawHeadFlash(flash, s, layer) {
    const age = Math.max(0, flash.life / flash.maxLife);
    const size = layer.fontSize * (0.88 + age * 0.34);
    const flashColor = colorToCss(mix(s.headRgb, [255, 255, 255], 0.86));
    context.globalAlpha = Math.min(1, age ** 1.45 * layer.alpha * (0.36 + layer.frontRatio * 0.62));
    context.shadowBlur = 22 * (1.8 + layer.frontRatio * 2.2);
    context.shadowColor = flashColor;
    context.fillStyle = flashColor;
    context.fillRect(flash.x - size / 2, flash.y - size / 2, size, size);
  }

  function drawResidue(residue, s, layer) {
    const age = Math.max(0, residue.life / residue.maxLife);
    const alpha = Math.max(0.03, age ** 1.45) * layer.alpha;
    const color = colorToCss(mix(s.textRgb, s.backgroundRgb, layer.depthRatio * 0.38));
    drawGlowingGlyph(residue.char, residue.x, residue.y, color, alpha, 6 + layer.frontRatio * 8);
  }

  function drawHead(column, s, layer) {
    if (column.startDelay > 0) {
      return;
    }
    const headFlow = column.row * layer.rowStep + layer.rowStep / 2;
    if (headFlow < -layer.rowStep || headFlow > flowExtent() + layer.rowStep) {
      return;
    }
    const point = flowPoint(column.x, headFlow);
    const base = mix(s.textRgb, s.headRgb, 0.22 + layer.frontRatio * 0.3);
    const color = colorToCss(mix(base, [255, 255, 255], 0.2 + layer.frontRatio * 0.35));
    drawGlowingGlyph(column.headChar, point.x, point.y, color, layer.alpha, 12 + layer.frontRatio * 12);
  }

  function drawColumn(column, s, layer) {
    prepareText(layer);
    column.flashes.forEach((flash) => drawHeadFlash(flash, s, layer));
    column.residues.forEach((residue) => drawResidue(residue, s, layer));
    drawHead(column, s, layer);
    context.globalAlpha = 1;
  }

  function animateColumnEffects(column, elapsedSeconds) {
    column.flashes = column.flashes
      .map((flash) => ({ ...flash, life: flash.life - elapsedSeconds }))
      .filter((flash) => flash.life > 0);
    column.residues = column.residues
      .map((residue) => ({
        ...residue,
        char: Math.random() < elapsedSeconds * 0.9 ? randomChar(residue.pattern) : residue.char,
        life: residue.life - elapsedSeconds,
      }))
      .filter((residue) => residue.life > 0);
  }

  function replaceColumn(layer, index, s, residues = []) {
    const retiringWasActive = layer.columns[index] && !layer.columns[index].skip ? 1 : 0;
    const nextColumn = makeColumn(index, s, layer, false, Math.max(0, activeColumnCount() - retiringWasActive), layer.columns.length);
    nextColumn.residues = residues;
    layer.columns[index] = nextColumn;
  }

  function stepSkippedColumn(column, s, layer, index, elapsedSeconds) {
    column.startDelay -= elapsedSeconds * column.cps * state.speedScale;
    if (column.startDelay <= 0) {
      replaceColumn(layer, index, s, column.residues);
    }
  }

  function stepColumn(column, s, layer, index, elapsedSeconds) {
    if (column.startDelay > 0) {
      column.startDelay -= elapsedSeconds * column.cps * state.speedScale;
      return;
    }

    column.timer += elapsedSeconds * state.speedScale;
    const interval = 1 / column.cps;
    let typed = 0;

    while (column.timer >= interval && typed < 6) {
      const previousHeadFlow = column.row * layer.rowStep + layer.rowStep / 2;
      const maxLife = Math.max(0.1, s.trail / 10);
      const canCreateResidue = previousHeadFlow >= -layer.fontSize && previousHeadFlow <= flowExtent() + layer.fontSize;

      if (canCreateResidue) {
        const point = flowPoint(column.x, previousHeadFlow);
        column.residues.unshift({
          x: point.x,
          y: point.y,
          char: column.headChar,
          pattern: column.pattern,
          life: maxLife,
          maxLife,
        });
      }

      column.row += 1;
      column.headChar = nextCharacter(column);
      const currentHeadFlow = column.row * layer.rowStep + layer.rowStep / 2;
      const canCreateFlash = currentHeadFlow >= -layer.fontSize && currentHeadFlow <= flowExtent() + layer.fontSize;
      if (canCreateFlash) {
        const point = flowPoint(column.x, currentHeadFlow);
        column.flashes.unshift({
          x: point.x,
          y: point.y,
          life: 0.18,
          maxLife: 0.18,
        });
      }
      column.timer -= interval;
      typed += 1;

      if (column.row * layer.rowStep > flowExtent() + maxLife * column.cps * layer.rowStep) {
        const keepAnswer = column.answerMode;
        replaceColumn(layer, index, s, column.residues);
        if (keepAnswer && state.target) {
          const next = layer.columns[index];
          const answerPattern = displayPatternFor(state.target, state.difficultyKey);
          next.answerMode = true;
          next.randomOrder = state.difficultyKey === "hard";
          next.pattern = answerPattern;
          next.charIndex = -1;
          next.headChar = next.randomOrder ? randomChar(answerPattern) : characterAt(answerPattern, 0);
          next.skip = false;
        }
        return;
      }
    }
  }

  function tickRain(elapsedSeconds) {
    const s = settings();
    paintBackground(s);
    state.layers.forEach((layer) => {
      layer.columns.forEach((column, index) => {
        animateColumnEffects(column, elapsedSeconds);
        if (column.skip) {
          if (column.residues.length > 0 || column.flashes.length > 0) {
            drawColumn(column, s, layer);
          }
          stepSkippedColumn(column, s, layer, index, elapsedSeconds);
          return;
        }
        drawColumn(column, s, layer);
        stepColumn(column, s, layer, index, elapsedSeconds);
      });
    });
  }

  function resetRain() {
    const s = settings();
    state.layers = Array.from({ length: s.depth }, (_, index) => makeLayer(index, s));
    applyTarget(state.target, state.difficultyKey);
    paintBackground(s);
  }

  function resize() {
    state.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    resetRain();
  }

  function setSpeedScale(value) {
    state.speedScale = value;
  }

  function normalizeSignal(signal) {
    if (typeof signal === "string") {
      return {
        difficultyKey: signal ? "easy" : "idle",
        text: signal,
      };
    }
    return {
      difficultyKey: signal?.difficultyKey ?? "idle",
      text: signal?.text ?? "",
    };
  }

  function draw(signal = "") {
    const nextSignal = normalizeSignal(signal);
    if (nextSignal.text !== state.target || nextSignal.difficultyKey !== state.difficultyKey) {
      applyTarget(nextSignal.text, nextSignal.difficultyKey);
    }

    const now = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const elapsedSeconds = state.lastTime ? Math.min(0.08, (now - state.lastTime) / 1000) : 1 / 30;
    state.lastTime = now;
    tickRain(elapsedSeconds);
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
