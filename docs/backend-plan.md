# Backend Plan

The current game is static and runs on GitHub Pages. Online ranking and feedback collection need a small backend because the browser cannot safely write shared public data by itself.

## Recommended Free Setup

- Frontend: GitHub Pages
- API: Cloudflare Workers or Firebase
- Database: Cloudflare D1 or Firestore
- Abuse control: server-side validation, rate limits, and optional bot protection

For a first version, Firebase Spark is the simplest no-payment-method option. If score abuse becomes a concern, Cloudflare Workers plus D1 gives more control over validation and rate limiting.

## Tables

### scores

Stores online ranking entries.

- `id`: generated id
- `name`: player display name
- `score`: final score
- `difficulty`: `easy`, `normal`, or `hard`
- `cleared`: cleared question count
- `questions`: total question count
- `duration_seconds`: game duration or remaining time summary
- `created_at`: server timestamp
- `client_version`: frontend asset version

Validation:

- Reject empty names and names over 12 characters.
- Reject scores below 0.
- Reject scores above the maximum possible score for the submitted difficulty and question count.
- Reject unknown difficulty values.
- Rate-limit repeated submissions from the same source.

### feedback

Stores bug reports and opinions from an in-game form.

- `id`: generated id
- `type`: `bug`, `idea`, or `other`
- `message`: user-submitted text
- `contact`: optional contact text
- `user_agent`: browser user agent
- `client_version`: frontend asset version
- `created_at`: server timestamp

Validation:

- Reject empty messages.
- Limit message length, for example 1000 characters.
- Sanitize output when displaying feedback in any admin page.
- Rate-limit repeated submissions.

## API

- `GET /scores?difficulty=hard`
- `POST /scores`
- `POST /feedback`

The game should keep local ranking as a fallback when the online API is unavailable.
