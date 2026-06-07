# MATRIX RAIN QUIZ

MATRIX RAIN QUIZ is a small browser game that combines a Matrix-style digital rain canvas with a timed word-decoding quiz. Each round asks the player to identify a random 5-8 character uppercase alphanumeric answer from a falling signal hint.

## How to Play

Open `index.html` in a browser, press Start, type the decoded answer, and submit with Enter or the Answer button. The game has 10 questions. Each question starts with 60 seconds.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Canvas API
- localStorage

No external library is required.

## Main Features

- 10-question timed quiz
- Difficulty changes every 20 seconds
- Matrix-style digital rain background
- Hint text shown in hard, medium, and easy forms
- Score based on remaining seconds and difficulty multiplier
- X share intent after the game finishes
- Local top-5 ranking saved in localStorage

## Implementation Notes

- Canvas drawing and game state management are separated.
- Difficulty changes at 60-41, 40-21, and 20-0 seconds.
- Score uses `Math.floor(remainingSeconds * difficultyMultiplier)`.
- Ranking data is stored locally only.
- The app is static and can run by opening `index.html`.

## Future Improvements

- Harder quizzes where the question text itself is hidden in the digital rain
- Online ranking with Supabase or a similar backend
- Question genre selection
- Difficulty selection
- Mobile control improvements
- Sound effects
- Consecutive-correct bonus
- Typing speed evaluation

## Manual Verification

- Open `index.html`.
- Press Start and confirm the 10-question quiz begins.
- Confirm each question has a 60-second timer.
- Confirm difficulty, multiplier, hint text, and rain speed change every 20 seconds.
- Submit an answer with the input button and the Enter key.
- Confirm a correct answer adds score and advances to the next question.
- Confirm incorrect answers keep the current question active.
- Confirm timeout advances to the next question with 0 points.
- Confirm the final score appears after 10 questions.
- Confirm the X share button opens a share URL.
- Confirm the localStorage ranking shows the top 5 scores.
