# Matrix Rain Quiz Backend

Experimental Cloudflare Workers + D1 backend for online ranking.

This lives on the `feature/online-ranking` branch and is not connected to the published GitHub Pages app yet.

## API

- `POST /sessions`
- `POST /scores`
- `GET /scores?mode=katakana&period=daily`
- `GET /scores?mode=katakana&period=all`

## Ranking Rules

- Only `mode = katakana` is accepted.
- Ranking requires at least 3 correct answers.
- One session can submit once.
- The server recalculates the score from submitted round records.
- Daily ranking stores one score per `playerId + mode + playDate`.
- A new daily score updates the stored entry only when it is higher.
- Player names are length-limited and checked against URL/control-character input.
- Additional banned name fragments can be configured with `BANNED_NAME_PARTS`.

## Setup

1. Create a Cloudflare D1 database named `matrix-rain-quiz`.
2. Replace `database_id` in `wrangler.toml`.
3. Apply the schema:

```sh
npm run db:apply
```

4. Run locally:

```sh
npm run dev
```

5. Deploy:

```sh
npm run deploy
```
