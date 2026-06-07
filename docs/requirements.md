# Requirements

## App Summary

MATRIX RAIN QUIZ is a static browser quiz game. It uses Matrix-style digital rain as a canvas background and asks the player to decode random uppercase alphanumeric strings.

## Game Rules

- The game has 10 questions.
- Each question has a 60-second time limit.
- Answers are random uppercase alphanumeric strings.
- Answer length is 5-8 characters.
- The player submits with Enter or the Answer button.
- Correct answers add score and advance to the next question.
- Incorrect answers keep the current question active.
- Timeout gives 0 points and advances to the next question.
- The total score is shown after all 10 questions.

## Difficulty

Difficulty becomes easier every 20 seconds within a question.

| Time left | Difficulty | Rain signal | Multiplier | Rain speed |
| --- | --- | --- | --- | --- |
| 60-41 | Hard | Multiple shuffled variants | 3 | Fast |
| 40-21 | Medium | Reversed answer | 2 | Normal |
| 20-0 | Easy | Correct answer | 1 | Slow |

## Scoring

```txt
score = Math.floor(remainingSeconds * difficultyMultiplier)
```

Examples:

- 52 seconds left on hard: 52 * 3 = 156 points
- 33 seconds left on medium: 33 * 2 = 66 points
- 12 seconds left on easy: 12 * 1 = 12 points

## UI Flow

- Title screen: title, Start button, and canvas background.
- Countdown screen: short countdown before play begins.
- Game screen: digital rain, remaining time, current question count, score, difficulty, multiplier, answer input, answer button, and feedback messages.
- Result screen: final score, local ranking registration/loading, X share button, Title button, and Again button.

## Future Scope

- Online ranking
- Question genre selection
- Manual difficulty selection
- Mobile optimization
- Sound effects
- Consecutive-correct bonus
- Typing speed evaluation
