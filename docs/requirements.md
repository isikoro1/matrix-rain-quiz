# Requirements

## App Summary

MATRIX RAIN QUIZ is a static browser quiz game. It uses Matrix-style digital rain as a canvas background and asks the player to read meaningful katakana words falling through the rain.

## Game Rules

- The game has 10 questions.
- Each question has a 60-second time limit.
- Answers are meaningful katakana words.
- The first answer is 3 characters.
- Answer length increases by 1 after each correct answer, up to 12 characters in the MVP.
- The player submits with Enter or the Answer button.
- Correct answers add score and advance to the next question.
- Incorrect answers advance to the next question and reduce the next answer length by 1.
- Timeout gives 0 points and advances to the next question.
- The total score is shown after all 10 questions.

## Difficulty

Difficulty becomes easier every 20 seconds within a question.

| Time left | Difficulty | Score multiplier | Rain speed |
| --- | --- | --- | --- |
| 60-41 | Hard | 1.5 | Fast |
| 40-21 | Normal | 1 | Normal |
| 20-0 | Easy | 0.8 | Slow |

Rain characters also change by difficulty:

- Hard: answer characters appear in random order, with symbol and number noise.
- Normal: answer characters appear in reverse order, with number noise.
- Easy: answer characters appear in correct order, with no non-answer noise.

## Scoring

```txt
score = Math.floor(wordLength + remainingSeconds * difficultyMultiplier)
```

Examples:

- 3-character word with 52 seconds left on hard: 3 + 52 * 1.5 = 81 points
- 4-character word with 33 seconds left on normal: 4 + 33 * 1 = 37 points
- 5-character word with 12 seconds left on easy: 5 + 12 * 0.8 = 14 points

## UI Flow

- Title screen: title, Start button, and canvas background.
- Countdown screen: short countdown before play begins.
- Game screen: prototype-style digital rain where ordinary falling columns contain the question characters, remaining time, current question count, score, difficulty, multiplier, per-character answer slots, answer button, and feedback messages.
- Result screen: final score, local ranking registration/loading, X share button, Title button, and Again button.

## Future Scope

- Online ranking
- English word mode
- Question genre selection
- Manual difficulty selection
- Mobile optimization
- Sound effects
- Consecutive-correct bonus
- Typing speed evaluation
