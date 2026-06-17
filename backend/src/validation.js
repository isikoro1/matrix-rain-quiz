import { HttpError } from "./http.js";
import { calculateTotalScore } from "./scoring.js";

const MODE = "katakana";
const QUESTION_COUNT = 10;
const MIN_CLEARED_FOR_RANKING = 3;
const MAX_NAME_LENGTH = 12;
const SESSION_MIN_SECONDS = 10;
const SESSION_MAX_SECONDS = 15 * 60;

export function validateMode(mode) {
  if (mode !== MODE) {
    throw new HttpError(400, "invalid_mode", "Only katakana mode is supported.");
  }
}

export function validatePlayerId(playerId) {
  if (typeof playerId !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(playerId)) {
    throw new HttpError(400, "invalid_player_id", "playerId is invalid.");
  }
  return playerId;
}

export function sanitizeName(value, playerId, env) {
  const fallback = `エージェント${stableSuffix(playerId)}`;
  const name = typeof value === "string" ? value.trim().normalize("NFKC") : fallback;
  const finalName = name || fallback;

  if (Array.from(finalName).length > MAX_NAME_LENGTH) {
    throw new HttpError(400, "invalid_name", "Name is too long.");
  }
  if (/[\u0000-\u001f\u007f]/.test(finalName)) {
    throw new HttpError(400, "invalid_name", "Name contains control characters.");
  }
  if (/https?:\/\/|www\./i.test(finalName)) {
    throw new HttpError(400, "invalid_name", "Name cannot contain URLs.");
  }

  const banned = bannedNameParts(env);
  const normalized = finalName.toLowerCase();
  if (banned.some((part) => part && normalized.includes(part))) {
    throw new HttpError(400, "invalid_name", "Name cannot be used.");
  }

  return finalName;
}

export function validateSessionAge(session, now) {
  const startedAt = Date.parse(session.started_at);
  const expiresAt = Date.parse(session.expires_at);
  const elapsedSeconds = Math.floor((now.getTime() - startedAt) / 1000);

  if (session.used_at) {
    throw new HttpError(409, "session_used", "Session was already used.");
  }
  if (Number.isNaN(startedAt) || Number.isNaN(expiresAt) || now.getTime() > expiresAt) {
    throw new HttpError(400, "session_expired", "Session is expired.");
  }
  if (elapsedSeconds < SESSION_MIN_SECONDS) {
    throw new HttpError(400, "session_too_short", "Session is too short.");
  }
  if (elapsedSeconds > SESSION_MAX_SECONDS) {
    throw new HttpError(400, "session_too_long", "Session is too long.");
  }
}

export function validateScorePayload(payload, env) {
  const playerId = validatePlayerId(payload.playerId);
  validateMode(payload.mode);

  if (payload.questions !== QUESTION_COUNT) {
    throw new HttpError(400, "invalid_questions", "questions must be 10.");
  }

  const rounds = validateRounds(payload.rounds);
  const cleared = rounds.filter((round) => round.correct).length;
  if (payload.cleared !== cleared) {
    throw new HttpError(400, "invalid_cleared", "cleared does not match rounds.");
  }
  if (cleared < MIN_CLEARED_FOR_RANKING) {
    throw new HttpError(400, "not_rankable", "At least 3 correct answers are required.");
  }

  const score = calculateTotalScore(rounds);
  if (payload.score !== score) {
    throw new HttpError(400, "invalid_score", "score does not match the submitted rounds.");
  }

  return {
    playerId,
    name: sanitizeName(payload.name, playerId, env),
    mode: payload.mode,
    score,
    cleared,
    questions: QUESTION_COUNT,
  };
}

function validateRounds(rounds) {
  if (!Array.isArray(rounds) || rounds.length !== QUESTION_COUNT) {
    throw new HttpError(400, "invalid_rounds", "rounds must contain 10 entries.");
  }

  let expectedLength = 3;
  return rounds.map((round) => {
    const length = Number(round.length);
    const remainingSeconds = Number(round.remainingSeconds);
    const correct = Boolean(round.correct);

    if (length !== expectedLength) {
      throw new HttpError(400, "invalid_length", "round length transition is invalid.");
    }
    if (!Number.isInteger(remainingSeconds) || remainingSeconds < 0 || remainingSeconds > 60) {
      throw new HttpError(400, "invalid_remaining_seconds", "remainingSeconds is invalid.");
    }

    if (correct) {
      expectedLength = Math.min(10, expectedLength + 1);
    } else if (remainingSeconds === 0) {
      expectedLength = Math.max(3, expectedLength - 1);
    } else {
      expectedLength = Math.max(3, expectedLength - 2);
    }

    return { length, remainingSeconds, correct };
  });
}

function bannedNameParts(env) {
  return String(env.BANNED_NAME_PARTS || "")
    .split(",")
    .map((part) => part.trim().toLowerCase().normalize("NFKC"))
    .filter(Boolean);
}

function stableSuffix(playerId) {
  let hash = 0;
  for (const char of playerId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return String(hash % 10000).padStart(4, "0");
}
