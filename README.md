# MATRIX RAIN QUIZ

MATRIX RAIN QUIZ is a small browser game that combines a Matrix-style digital rain canvas with a timed word-decoding quiz. Each round asks the player to read a meaningful katakana word falling through the rain.

## How to Play

Open `index.html` in a browser, press Start, wait for the countdown, type the decoded answer, and submit with Enter or the Answer button. The game has 10 questions. Each question starts with 60 seconds.

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
- Title, countdown, game, and result screens
- Katakana-only word mode
- Word length starts at 3 characters and increases after correct answers
- Question characters are embedded into ordinary rain streams
- Score based on word length, remaining seconds, and difficulty multiplier
- X share intent after the game finishes
- Local top-5 ranking saved in localStorage

## Implementation Notes

- Canvas drawing and game state management are separated.
- Difficulty changes at 60-41, 40-21, and 20-0 seconds.
- Score uses `Math.floor(wordLength + remainingSeconds * difficultyMultiplier)`.
- Difficulty multipliers are Hard `1.5`, Normal `1`, and Easy `0.8`.
- Ranking data is stored locally only.
- The app is static and can run by opening `index.html`.

## Future Improvements

- Online ranking with Supabase or a similar backend
- English word mode
- Question genre selection
- Difficulty selection
- Mobile control improvements
- Sound effects
- Consecutive-correct bonus
- Typing speed evaluation

## Manual Verification

- Open `index.html`.
- Press Start and confirm the countdown appears before the 10-question quiz begins.
- Confirm each question has a 60-second timer.
- Confirm difficulty, multiplier, falling word display, and rain speed change every 20 seconds.
- Submit an answer with the input button and the Enter key.
- Confirm a correct answer adds score and advances to the next question.
- Confirm answer length increases after correct answers.
- Confirm incorrect answers keep the current question active.
- Confirm timeout advances to the next question with 0 points.
- Confirm the result screen appears after 10 questions.
- Confirm the X share button opens a share URL.
- Confirm the localStorage ranking shows the top 5 scores.
