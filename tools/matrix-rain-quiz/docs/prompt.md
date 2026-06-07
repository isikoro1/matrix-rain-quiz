# Prompt

The original request asked for a new static frontend app named `MATRIX RAIN QUIZ` under `tools/matrix-rain-quiz`, while keeping any existing `tools/matrix-rain-simulator` app untouched.

## Requested MVP

- Use HTML, CSS, Vanilla JavaScript, Canvas API, and localStorage.
- Do not use external libraries.
- Build a Matrix-style digital rain quiz game.
- Generate 10 questions.
- Give each question 60 seconds.
- Generate random uppercase alphanumeric answers of length 5-8.
- Let the player answer with Enter or an Answer button.
- Correct answers add score and advance.
- Incorrect answers continue the current question.
- Timeout advances with 0 points.
- Show final score after 10 questions.
- Include X sharing and local top-5 ranking.
- Add `README.md` and docs for requirements, design, task log, and prompt.

## Difficulty

- 60-41 seconds: hard, shuffled variants, fast rain, multiplier 3.
- 40-21 seconds: medium, reversed answer, normal rain, multiplier 2.
- 20-0 seconds: easy, correct answer, slow rain, multiplier 1.

## Acceptance

- Opening `matrix-rain-quiz/index.html` starts the app.
- Start button begins the 10-question quiz.
- Timer, difficulty, multiplier, hint, and rain speed change over time.
- Input and Enter submission work.
- Correct, incorrect, timeout, and final result flows work.
- X share button works after finishing.
- localStorage ranking shows top 5 results.
- Existing `matrix-rain-simulator` is not changed.

