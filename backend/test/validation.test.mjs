import assert from "node:assert/strict";
import { calculateTotalScore } from "../src/scoring.js";
import { HttpError } from "../src/http.js";
import { validateScorePayload } from "../src/validation.js";

const validRounds = [
  { length: 3, remainingSeconds: 50, correct: true },
  { length: 4, remainingSeconds: 42, correct: true },
  { length: 5, remainingSeconds: 31, correct: true },
  { length: 6, remainingSeconds: 0, correct: false },
  { length: 5, remainingSeconds: 18, correct: true },
  { length: 6, remainingSeconds: 10, correct: true },
  { length: 7, remainingSeconds: 20, correct: false },
  { length: 5, remainingSeconds: 44, correct: true },
  { length: 6, remainingSeconds: 3, correct: false },
  { length: 4, remainingSeconds: 1, correct: true },
];

const validPayload = {
  playerId: "player_123456",
  name: "",
  mode: "katakana",
  score: calculateTotalScore(validRounds),
  cleared: 7,
  questions: 10,
  rounds: validRounds,
};

const validated = validateScorePayload(validPayload, {});
assert.equal(validated.score, 289);
assert.equal(validated.name, "エージェント0513");

assert.throws(
  () => validateScorePayload({ ...validPayload, score: 9999 }, {}),
  (error) => error instanceof HttpError && error.code === "invalid_score"
);

assert.throws(
  () => validateScorePayload({ ...validPayload, cleared: 2 }, {}),
  (error) => error instanceof HttpError && error.code === "invalid_cleared"
);

assert.throws(
  () => validateScorePayload({ ...validPayload, mode: "english" }, {}),
  (error) => error instanceof HttpError && error.code === "invalid_mode"
);

console.log("validation tests passed");
