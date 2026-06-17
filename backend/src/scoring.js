const MULTIPLIERS = {
  hard: 1.5,
  normal: 1,
  easy: 0.8,
};

function difficultyForRemainingSeconds(seconds) {
  if (seconds > 40) {
    return "hard";
  }
  if (seconds > 20) {
    return "normal";
  }
  return "easy";
}

export function calculateRoundScore(round) {
  if (!round.correct) {
    return 0;
  }

  const remaining = Number(round.remainingSeconds);
  const length = Number(round.length);
  const difficulty = difficultyForRemainingSeconds(remaining);
  return Math.floor(length + remaining * MULTIPLIERS[difficulty]);
}

export function calculateTotalScore(rounds) {
  return rounds.reduce((total, round) => total + calculateRoundScore(round), 0);
}
