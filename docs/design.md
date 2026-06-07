# Design

## Directory Structure

```txt
matrix-rain-quiz/
  index.html
  styles.css
  README.md
  docs/
    requirements.md
    design.md
    task-log.md
    prompt.md
  src/
    main.js
    game-state.js
    quiz-generator.js
    scoring.js
    rain-engine.js
    renderer.js
    share.js
    storage.js
    utils.js
```

## File Responsibilities

- `main.js`: DOM wiring, event listeners, game start, answer handling, timer, render loop
- `game-state.js`: question index, answer, timer value, score, play state
- `quiz-generator.js`: katakana word selection by current answer length
- `scoring.js`: difficulty selection, multiplier, score calculation
- `rain-engine.js`: canvas state, columns, glyph updates, speed scaling
- `renderer.js`: screen switching, DOM updates, and result ranking rendering
- `share.js`: X share URL generation and `window.open`
- `storage.js`: localStorage save/load and top-5 ranking
- `utils.js`: random helpers, shuffle, clamp, answer normalization

## Game State Flow

1. Initial state renders the start screen.
2. Start shows a countdown.
3. After countdown, the game creates 10 questions and enables input.
4. A one-second interval decrements the active question timer.
5. The current difficulty is derived from remaining seconds.
6. Correct answers calculate score, increase the next answer length, update totals, and advance.
7. Incorrect answers show a message and keep the same question.
8. Timeout advances with no score.
9. After question 10, the result screen saves to localStorage, loads ranking, and shows share/retry/title actions.

## Timer

The timer is reset to 60 seconds for each question. Difficulty is not stored independently; it is derived from `remainingSeconds`, which keeps UI, scoring, and rain speed consistent.

## Canvas Rendering

The canvas fills the viewport and draws semi-transparent black frames to create trail persistence. Columns contain spaced katakana glyphs and fall at speeds scaled by the current difficulty. The current answer appears as falling katakana words mixed into the rain, without a fixed center display.

## Script Loading

The source is split by responsibility, but files are loaded as classic scripts instead of ES modules so the app can run from `file://` when `index.html` is opened directly.
