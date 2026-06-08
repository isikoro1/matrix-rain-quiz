# Prompt

The original request asked for a new static frontend app named `MATRIX RAIN QUIZ`.

## Requested MVP

- Use HTML, CSS, Vanilla JavaScript, Canvas API, and localStorage.
- Do not use external libraries.
- Build a Matrix-style digital rain quiz game.
- Generate 10 questions.
- Give each question 60 seconds.
- Generate meaningful katakana answers.
- Let the player answer with Enter or an Answer button.
- Correct answers add score and advance.
- Incorrect answers advance and reduce the next answer length by 1.
- Timeout advances with 0 points.
- Show final score after 10 questions.
- Include X sharing and local top-5 ranking.
- Add `README.md` and docs for requirements, design, task log, and prompt.

## Difficulty

- 60-41 seconds: hard, fast rain, score multiplier 1.5.
- 40-21 seconds: normal, normal rain, score multiplier 1.
- 20-0 seconds: easy, slow rain, score multiplier 0.8.

## Acceptance

- Opening `index.html` starts the app.
- Start button begins the 10-question quiz.
- Timer, difficulty, multiplier, signal display, and rain speed change over time.
- Input and Enter submission work.
- Correct, incorrect, timeout, and final result flows work.
- X share button works after finishing.
- localStorage ranking shows top 5 results.
- Existing `matrix-rain-simulator` is not changed.
