import { corsHeaders, error, HttpError, json, readJson } from "./http.js";
import {
  createSession,
  findSession,
  listScores,
  markSessionUsed,
  upsertDailyScore,
} from "./repository.js";
import {
  validateMode,
  validatePlayerId,
  validateScorePayload,
  validateSessionAge,
} from "./validation.js";

const MODE = "katakana";
const SESSION_TTL_SECONDS = 15 * 60;

export default {
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/sessions") {
        return handleCreateSession(request, env);
      }
      if (request.method === "GET" && url.pathname === "/scores") {
        return handleListScores(url, env);
      }
      if (request.method === "POST" && url.pathname === "/scores") {
        return handleSubmitScore(request, env);
      }

      return error(404, "not_found", "Not found.");
    } catch (err) {
      if (err instanceof HttpError) {
        return error(err.status, err.code, err.message);
      }
      console.error(err);
      return error(500, "internal_error", "Internal server error.");
    }
  },
};

async function handleCreateSession(request, env) {
  const body = await readJson(request);
  const playerId = validatePlayerId(body.playerId);
  validateMode(body.mode);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000);
  const session = {
    id: crypto.randomUUID(),
    playerId,
    mode: body.mode,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await createSession(env.DB, session);
  return json({
    sessionId: session.id,
    expiresAt: session.expiresAt,
  });
}

async function handleSubmitScore(request, env) {
  const body = await readJson(request);
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const session = await findSession(env.DB, sessionId);
  if (!session) {
    throw new HttpError(400, "invalid_session", "Session is invalid.");
  }

  const payload = validateScorePayload(body, env);
  if (session.player_id !== payload.playerId || session.mode !== payload.mode) {
    throw new HttpError(400, "invalid_session", "Session does not match score payload.");
  }

  const now = new Date();
  validateSessionAge(session, now);

  const timestamp = now.toISOString();
  const sessionMarked = await markSessionUsed(env.DB, session.id, timestamp);
  if (!sessionMarked) {
    throw new HttpError(409, "session_used", "Session was already used.");
  }
  await upsertDailyScore(env.DB, {
    id: crypto.randomUUID(),
    ...payload,
    playDate: jstDate(now),
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return json({ ok: true });
}

async function handleListScores(url, env) {
  const mode = url.searchParams.get("mode") || MODE;
  validateMode(mode);

  const period = url.searchParams.get("period") === "all" ? "all" : "daily";
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20)));
  const scores = await listScores(env.DB, {
    mode,
    period,
    playDate: jstDate(new Date()),
    limit,
  });

  return json({ mode, period, scores });
}

function jstDate(date) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}
